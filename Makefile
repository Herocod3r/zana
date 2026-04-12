.PHONY: help dev debug run build build-debug clean install test lint typecheck wails-check

# Wails CLI resolution:
#   1. Prefer a `wails` binary on PATH.
#   2. Else use $(go env GOPATH)/bin/wails (auto-installed on first run).
# We cannot `go run` the CLI from this module — its transitive deps are
# not in our go.sum, so it must live in its own GOBIN install.
WAILS_VERSION := v2.12.0
GOBIN := $(shell go env GOBIN)
ifeq ($(GOBIN),)
GOBIN := $(shell go env GOPATH)/bin
endif
WAILS := $(shell command -v wails 2>/dev/null)
ifeq ($(WAILS),)
WAILS := $(GOBIN)/wails
endif

# Install the Wails CLI into GOBIN if it is not yet present.
$(GOBIN)/wails:
	@echo "Installing wails CLI $(WAILS_VERSION) into $(GOBIN)..."
	GOBIN=$(GOBIN) go install github.com/wailsapp/wails/v2/cmd/wails@$(WAILS_VERSION)

wails-check: $(GOBIN)/wails
	@echo "wails: $(WAILS)"

# Default target
help:
	@echo "Zana — desktop app tasks"
	@echo ""
	@echo "  make dev          Run in debug mode with hot reload (wails dev)"
	@echo "  make debug        Alias for 'make dev'"
	@echo "  make run          Build and run the packaged app (full mode)"
	@echo "  make build        Production build (wails build)"
	@echo "  make build-debug  Debug build with devtools (wails build -debug)"
	@echo "  make install      Install frontend dependencies"
	@echo "  make test         Run frontend tests"
	@echo "  make lint         Lint frontend"
	@echo "  make typecheck    Typecheck frontend"
	@echo "  make clean        Remove build artifacts"

# --- Run modes -----------------------------------------------------------

# Debug / dev mode: hot reload, devtools, Vite dev server.
dev: $(GOBIN)/wails
	$(WAILS) dev

debug: dev

# Full mode: production build + launch the packaged .app bundle.
run: build
	@echo "Launching Zana.app..."
	@open build/bin/Zana.app

# --- Builds --------------------------------------------------------------

build: $(GOBIN)/wails
	$(WAILS) build

build-debug: $(GOBIN)/wails
	$(WAILS) build -debug -devtools

# --- Frontend ------------------------------------------------------------

install:
	cd frontend && pnpm install

test:
	cd frontend && pnpm run test

lint:
	cd frontend && pnpm run lint

typecheck:
	cd frontend && pnpm run typecheck

# --- Housekeeping --------------------------------------------------------

clean:
	rm -rf build/bin frontend/dist frontend/wailsjs zana
