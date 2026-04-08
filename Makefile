# Zana build system.
#
# Targets form a real dependency graph via file sentinels:
#   .make/go-deps.stamp             ← go.mod                 (go mod download)
#   frontend/node_modules/.sentinel ← frontend/package-lock.json
#   frontend/dist/index.html        ← frontend sources + node_modules sentinel
#   build/bin/zana                  ← go sources + frontend dist + go-deps stamp
#
# Phony targets (help, deps, build, test, lint, dev, clean, ci) are thin
# wrappers that depend on the sentinel files. Running `make build` twice
# in a row does nothing on the second run.
#
# Note: `go mod tidy` is deliberately NOT in the build graph — tidy can
# rewrite go.mod (e.g., indirect lines, toolchain directive), which would
# cause the go-deps recipe to refire on every invocation and break the
# no-op-rerun property. Developers run `make tidy` manually when adding
# dependencies.

SHELL := /bin/bash
.DEFAULT_GOAL := help

# Resolve `go install`-ed binaries (wails, golangci-lint) via $(GOBIN)
# so we don't depend on the user's shell PATH including $GOPATH/bin
# (fresh macOS installs from the official Go .pkg don't add it).
GOBIN := $(shell go env GOPATH)/bin

# --- Inputs ------------------------------------------------------------------

GO_SOURCES := $(shell find cmd internal -type f -name '*.go' 2>/dev/null) assets.go
FRONTEND_SOURCES := $(shell find frontend/src frontend/index.html frontend/vite.config.ts \
                            -type f 2>/dev/null)

# --- Help --------------------------------------------------------------------

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# --- Tools -------------------------------------------------------------------

.PHONY: tools
tools: ## Install Go dev tools (wails CLI, golangci-lint)
	go install github.com/wailsapp/wails/v2/cmd/wails@v2.11.0
	go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest

# --- Stamp directory ---------------------------------------------------------

.make:
	@mkdir -p .make

# --- Go dependencies ---------------------------------------------------------
#
# The stamp file is the sentinel, NOT go.sum. go.sum is a side effect of
# `go mod download`; touching it directly would break idempotency on
# modules that don't need any sum updates. The stamp file is ours to own.

.make/go-deps.stamp: go.mod | .make
	go mod download
	@touch $@

.PHONY: go-deps
go-deps: .make/go-deps.stamp ## Download Go modules

.PHONY: tidy
tidy: ## Run `go mod tidy` (not part of the build graph)
	go mod tidy

# --- Frontend dependencies ---------------------------------------------------

frontend/node_modules/.sentinel: frontend/package.json frontend/package-lock.json
	cd frontend && npm ci
	@mkdir -p frontend/node_modules
	@touch frontend/node_modules/.sentinel

.PHONY: frontend-deps
frontend-deps: frontend/node_modules/.sentinel ## Install frontend dependencies

# --- Frontend build ----------------------------------------------------------
#
# The @touch frontend/dist/.gitkeep after vite build restores the embed
# sentinel that vite's emptyOutDir: true wipes. Without this, a fresh
# clone followed by `make build` leaves no .gitkeep in dist, which is
# invisible until the next commit.

frontend/dist/index.html: frontend/node_modules/.sentinel $(FRONTEND_SOURCES)
	cd frontend && npm run build
	@touch frontend/dist/.gitkeep

.PHONY: frontend-build
frontend-build: frontend/dist/index.html ## Build the frontend bundle

# --- Go build ----------------------------------------------------------------

build/bin/zana: .make/go-deps.stamp frontend/dist/index.html $(GO_SOURCES) go.mod wails.json build/appicon.png
	@mkdir -p build/bin
	go build -o build/bin/zana ./cmd/zana

.PHONY: go-build
go-build: build/bin/zana ## Build the Go binary (requires frontend-build)

# --- Top-level wrappers ------------------------------------------------------

.PHONY: deps
deps: go-deps frontend-deps ## Install all dependencies

.PHONY: build
build: go-build ## Build the application binary

.PHONY: dev
dev: deps ## Run Wails dev (hot reload)
	$(GOBIN)/wails dev

# --- Test --------------------------------------------------------------------

# Explicit package list — `./...` walks into frontend/node_modules where
# some npm packages (flatted) ship Go files that aren't part of this module.
GO_PACKAGES := . ./cmd/... ./internal/...

.PHONY: go-test
go-test: go-deps
	go test $(GO_PACKAGES)

.PHONY: frontend-test
frontend-test: frontend-deps
	cd frontend && npm test

.PHONY: test
test: go-test frontend-test ## Run all tests (go + frontend)

# --- Lint --------------------------------------------------------------------

.PHONY: go-lint
go-lint: go-deps
	$(GOBIN)/golangci-lint run $(GO_PACKAGES)

.PHONY: frontend-lint
frontend-lint: frontend-deps
	cd frontend && npm run lint

.PHONY: lint
lint: go-lint frontend-lint ## Run all linters (golangci-lint + eslint)

# --- CI ----------------------------------------------------------------------

.PHONY: ci
ci: lint test build ## Full CI pipeline: lint + test + build

# --- Clean -------------------------------------------------------------------

.PHONY: clean
clean: ## Remove build artifacts and dependencies
	rm -rf build/bin
	rm -rf frontend/dist/assets frontend/dist/index.html
	rm -rf frontend/node_modules
	rm -rf .make
	@mkdir -p frontend/dist && touch frontend/dist/.gitkeep
