# Zana Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Zana repository with a buildable Wails v2 + Go + Vue 3 + TypeScript project skeleton and a Makefile whose targets form a real dependency graph (file-based sentinels, not phony chains), so any contributor can clone → `make deps` → `make build` and get a working binary.

**Architecture:** Go module at `github.com/herocod3r/zana` with the `internal/` package layout locked in `docs/architecture.md` (api, preflight, project, workspace, terminal, session, schema, testutil). Frontend is Vue 3 + Pinia + TypeScript (strict) built with Vite, tested with Vitest, linted with ESLint. Wails v2 embeds `frontend/dist/` into the Go binary at build time. The Makefile uses file sentinels (`.make/go-deps.stamp`, `frontend/node_modules/.sentinel`, `frontend/dist/index.html`, `build/bin/zana`) so `make` only re-runs work that's actually out of date.

**Tech Stack:** Go 1.22+, Wails v2 (`github.com/wailsapp/wails/v2`), Vue 3, Pinia, TypeScript (strict), Vite, Vitest, ESLint, golangci-lint, GitHub Actions.

**Out of scope for this plan:** Any real business logic (project service, workspace service, PTY manager, SQLite schema, UI components beyond `App.vue`). Those live in later plans. This plan only delivers a compiling, testing, linting skeleton.

**Starting state (verified 2026-04-08):** Worktree contains `docs/`, `CLAUDE.md`, `README.md`, `TODOS.md`, `.gitignore`. No Go module, no frontend, no Makefile. `.gitignore` already contains Wails/Go/Node entries.

---

## File Structure

After this plan runs, the worktree will contain:

```
.
├── .github/workflows/build.yml    # CI: lint + test + build on push/PR
├── .gitignore                     # modified (negate frontend/dist/.gitkeep)
├── .golangci.yml                  # golangci-lint config
├── CLAUDE.md                      # unchanged
├── Makefile                       # dependency-graph build system
├── README.md                      # modified (dev quickstart)
├── TODOS.md                       # unchanged
├── build/
│   └── appicon.png                # 256x256 placeholder icon (Wails requires)
├── cmd/zana/main.go               # Wails app entry (~40 lines)
├── docs/                          # unchanged (this plan lives here)
├── frontend/
│   ├── .eslintrc.cjs
│   ├── dist/.gitkeep              # sentinel so //go:embed compiles pre-build
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json          # committed for reproducible builds
│   ├── src/
│   │   ├── App.vue
│   │   ├── App.test.ts
│   │   ├── main.ts
│   │   └── vite-env.d.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── go.mod
├── go.sum
├── internal/
│   ├── api/doc.go
│   ├── preflight/doc.go
│   ├── project/doc.go
│   ├── schema/doc.go
│   ├── session/doc.go
│   ├── terminal/doc.go
│   ├── testutil/doc.go
│   └── workspace/doc.go
└── wails.json                     # Wails build config
```

**File responsibilities:**

- **Makefile** — single source of truth for build/test/lint/dev/clean/ci, file-based dependency tracking via sentinel files so `make build` after `make build` is a no-op.
- **cmd/zana/main.go** — boots Wails, embeds `frontend/dist`, binds an empty `api.API` struct. No business logic — just proves Wails compiles and the embed resolves.
- **internal/<pkg>/doc.go** — empty package-doc files so `go build ./...` and `go test ./...` succeed on an otherwise empty tree. Each file is one line: `// Package <name> <one-line purpose from architecture.md>.`
- **frontend/src/App.vue + main.ts** — mounts a minimal Vue app that renders the word "Zana". Smoke test target; no real UI yet.
- **frontend/src/App.test.ts** — Vitest smoke test that mounts App and asserts the text renders.
- **wails.json** — declares frontend install/build commands so `wails build` works; Wails CLI reads this.
- **build/appicon.png** — 256x256 transparent PNG placeholder. Wails CLI refuses to build without it. Real icon is deferred to a later plan.
- **.golangci.yml** — minimal config: enable `errcheck`, `govet`, `staticcheck`, `ineffassign`, `unused`, `gofmt`, `goimports`. No custom rules yet.
- **.eslintrc.cjs** — extends `@vue/eslint-config-typescript` recommended, no custom rules yet.
- **.github/workflows/build.yml** — runs `make ci` on ubuntu-latest on push and PR.

---

## Task Sequence Rationale

Ordering is load-bearing — each task leaves the repo in a state where all earlier targets still pass:

1. **Makefile bones + help** — skeleton Makefile with `help` target. Commits something runnable immediately.
2. **Go module + cmd stub + internal doc.go files** — `go build ./...` and `go test ./...` green. No Wails yet, so no embed, so no frontend dependency.
3. **Frontend Vite+Vue+TS scaffold** — `npm run build` produces real `frontend/dist/`. No Wails yet.
4. **Frontend testing (Vitest)** — smoke test passes.
5. **Wails integration** — add Wails dep, replace `main.go` with Wails boot + embed. Now `go build ./cmd/zana` requires `frontend/dist/.gitkeep` to exist (which was committed in Task 3).
6. **Lint (golangci-lint + ESLint)** — both linters pass on the skeleton.
7. **Full Makefile dependency graph** — wire `deps`, `build`, `test`, `lint`, `ci`, `dev`, `clean` with file-based sentinels, verify no-op re-runs.
8. **GitHub Actions CI** — workflow runs `make ci`.
9. **README dev quickstart** — document the three commands a contributor actually needs.

---

## Task 1: Makefile skeleton with help target

**Files:**
- Create: `Makefile`

- [ ] **Step 1: Write the Makefile skeleton**

Create `Makefile` with the following exact contents (tabs, not spaces, in recipe lines):

```makefile
# Zana build system.
# All real targets use file-based dependencies so re-runs are no-ops.
# Phony targets are thin wrappers that depend on file targets.

SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
```

- [ ] **Step 2: Run `make help` and verify output**

Run: `make help`

Expected output (exact):
```
  help                 Show this help
```

If `make` is not installed, install via Homebrew: `brew install make`. (macOS ships with GNU make 3.81 at `/usr/bin/make`; that's fine for this plan.)

- [ ] **Step 3: Commit**

```bash
git add Makefile
git commit -m "build: add Makefile skeleton with help target"
```

---

## Task 2: Go module, cmd/zana stub, internal package skeletons

**Files:**
- Create: `go.mod` (via `go mod init`)
- Create: `cmd/zana/main.go`
- Create: `internal/api/doc.go`
- Create: `internal/preflight/doc.go`
- Create: `internal/project/doc.go`
- Create: `internal/workspace/doc.go`
- Create: `internal/terminal/doc.go`
- Create: `internal/session/doc.go`
- Create: `internal/schema/doc.go`
- Create: `internal/testutil/doc.go`

- [ ] **Step 1: Initialize the Go module**

Run from the repo root:
```bash
go mod init github.com/herocod3r/zana
```

Expected output:
```
go: creating new go.mod: module github.com/herocod3r/zana
```

- [ ] **Step 2: Create the cmd/zana stub**

Create `cmd/zana/main.go` with:

```go
// Command zana is the Zana desktop app entry point.
//
// This file is a placeholder stub. The real Wails boot is wired in a later
// task once the frontend scaffold exists and //go:embed has something to
// embed.
package main

import "fmt"

func main() {
	fmt.Println("zana: scaffold stub, not runnable yet")
}
```

- [ ] **Step 3: Create internal package doc files**

Create each of the following files. Each contains exactly one package-doc line.

`internal/api/doc.go`:
```go
// Package api exposes the single Wails-bound struct that fronts all
// backend services (projects, workspaces, terminals, sessions).
package api
```

`internal/preflight/doc.go`:
```go
// Package preflight runs startup checks: git binary presence and
// macOS Finder login-shell PATH import.
package preflight
```

`internal/project/doc.go`:
```go
// Package project owns project domain types, path validation, and
// the SQLite-backed project store.
package project
```

`internal/workspace/doc.go`:
```go
// Package workspace owns workspace domain types, the git worktree
// service (create new branch / checkout existing), and the display
// name generator.
package workspace
```

`internal/terminal/doc.go`:
```go
// Package terminal owns the PTY wrapper, the terminal manager,
// the 256 KB ring buffer with sequence numbers, and the
// activity tracker.
package terminal
```

`internal/session/doc.go`:
```go
// Package session orchestrates save/restore of the open project,
// active workspaces, terminal layout, and serialized pane snapshots.
package session
```

`internal/schema/doc.go`:
```go
// Package schema holds the embedded SQL migration scripts for the
// SQLite store at ~/.zana/zana.db.
package schema
```

`internal/testutil/doc.go`:
```go
// Package testutil provides test helpers: temp git repo builders,
// a fake clock for the activity tracker, and multi-shell spawn
// helpers for bash/zsh/sh coverage.
package testutil
```

- [ ] **Step 4: Verify the module builds and tests**

Run:
```bash
go build ./...
go test ./...
```

Expected `go build` output: (empty — success).

Expected `go test` output:
```
?   	github.com/herocod3r/zana/cmd/zana	[no test files]
?   	github.com/herocod3r/zana/internal/api	[no test files]
?   	github.com/herocod3r/zana/internal/preflight	[no test files]
?   	github.com/herocod3r/zana/internal/project	[no test files]
?   	github.com/herocod3r/zana/internal/schema	[no test files]
?   	github.com/herocod3r/zana/internal/session	[no test files]
?   	github.com/herocod3r/zana/internal/terminal	[no test files]
?   	github.com/herocod3r/zana/internal/testutil	[no test files]
?   	github.com/herocod3r/zana/internal/workspace	[no test files]
```

- [ ] **Step 5: Run the stub binary to confirm main works**

Run:
```bash
go run ./cmd/zana
```

Expected output:
```
zana: scaffold stub, not runnable yet
```

- [ ] **Step 6: Commit**

```bash
git add go.mod cmd/zana/main.go internal/
git commit -m "chore: initialize go module and internal package skeletons"
```

Note: `go.sum` does not exist yet because no dependencies have been added. It will appear in Task 5.

---

## Task 3: Frontend Vite + Vue 3 + TypeScript scaffold

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/package-lock.json` (generated by `npm install`)
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.ts`
- Create: `frontend/src/App.vue`
- Create: `frontend/src/vite-env.d.ts`
- Create: `frontend/dist/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1: Create frontend/package.json**

```json
{
  "name": "zana-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "pinia": "^2.1.7",
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "typescript": "~5.4.5",
    "vite": "^5.2.8",
    "vue-tsc": "^2.0.11"
  }
}
```

- [ ] **Step 2: Create frontend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create frontend/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Create frontend/vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Wails serves the built assets from frontend/dist at runtime (embedded in
// the Go binary) and from Vite's dev server during `wails dev`.
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
```

- [ ] **Step 5: Create frontend/index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zana</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create frontend/src/main.ts**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
```

- [ ] **Step 7: Create frontend/src/App.vue**

```vue
<script setup lang="ts">
// Scaffold smoke component. Real UI arrives in a later plan.
const name = 'Zana'
</script>

<template>
  <main>
    <h1 data-testid="app-title">{{ name }}</h1>
  </main>
</template>
```

- [ ] **Step 8: Create frontend/src/vite-env.d.ts**

```ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}
```

- [ ] **Step 9: Create frontend/dist/.gitkeep**

Create an empty file at `frontend/dist/.gitkeep`. This is load-bearing: in Task 5 the Go binary adds `//go:embed all:frontend/dist` and that directive fails at compile time if the directory does not exist. Committing `.gitkeep` guarantees the embed resolves even on a fresh clone before `make frontend-build` has run.

```bash
mkdir -p frontend/dist
touch frontend/dist/.gitkeep
```

- [ ] **Step 10: Update .gitignore to exclude built assets but keep the sentinel**

The existing `.gitignore` has `frontend/dist/` which would also ignore `.gitkeep`. Change that line.

Edit `.gitignore`. Replace the line:
```
frontend/dist/
```
with:
```
frontend/dist/*
!frontend/dist/.gitkeep
```

- [ ] **Step 11: Install dependencies**

Run:
```bash
cd frontend && npm install
```

Expected: `package-lock.json` is created, `node_modules/` is populated, no errors. Return to repo root: `cd ..`.

- [ ] **Step 12: Build the frontend and verify dist output**

Run:
```bash
cd frontend && npm run build && cd ..
touch frontend/dist/.gitkeep
```

The `touch` is load-bearing: Vite's `emptyOutDir: true` wipes `frontend/dist/` before writing new artifacts, which deletes the `.gitkeep` committed in Step 9. We recreate it so the sentinel survives the build. The Makefile recipe in Task 7 does the same `@touch` automatically after every `vite build`.

Expected: `frontend/dist/index.html` and `frontend/dist/assets/*.js` are produced. No TypeScript errors.

Verify with:
```bash
ls -A frontend/dist/
```
Expected to include: `.gitkeep  assets  index.html`.

- [ ] **Step 13: Commit**

```bash
git add .gitignore frontend/package.json frontend/package-lock.json \
        frontend/tsconfig.json frontend/tsconfig.node.json \
        frontend/vite.config.ts frontend/index.html \
        frontend/src/main.ts frontend/src/App.vue frontend/src/vite-env.d.ts \
        frontend/dist/.gitkeep
git commit -m "feat(frontend): scaffold Vue 3 + Vite + TypeScript"
```

Do NOT commit `frontend/dist/assets/` or `frontend/dist/index.html` — the updated `.gitignore` already excludes them. Only `.gitkeep` should appear in the commit under `frontend/dist/`.

---

## Task 4: Frontend testing with Vitest

**Files:**
- Modify: `frontend/package.json` (add vitest deps and scripts)
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/App.test.ts`

- [ ] **Step 1: Add Vitest dependencies and scripts to package.json**

Edit `frontend/package.json`. Replace the `scripts` object with:

```json
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

And add to `devDependencies`:
```json
    "@vitest/coverage-v8": "^1.5.0",
    "@vue/test-utils": "^2.4.5",
    "happy-dom": "^14.7.1",
    "vitest": "^1.5.0"
```

The full `devDependencies` block becomes:
```json
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "@vitest/coverage-v8": "^1.5.0",
    "@vue/test-utils": "^2.4.5",
    "happy-dom": "^14.7.1",
    "typescript": "~5.4.5",
    "vite": "^5.2.8",
    "vitest": "^1.5.0",
    "vue-tsc": "^2.0.11"
  }
```

- [ ] **Step 2: Create frontend/vitest.config.ts**

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['src/**/*.test.ts'],
    },
  }),
)
```

Note: the import path includes the `.ts` extension explicitly. `frontend/package.json` has `"type": "module"`, which under Node's ESM resolver requires explicit file extensions. Vitest 1.5+ supports TypeScript extension imports natively because it transforms via Vite.

- [ ] **Step 3: Write the failing smoke test first**

Create `frontend/src/App.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App', () => {
  it('renders the Zana title', () => {
    const wrapper = mount(App)
    expect(wrapper.get('[data-testid="app-title"]').text()).toBe('Zana')
  })
})
```

- [ ] **Step 4: Install new dev dependencies**

Run:
```bash
cd frontend && npm install && cd ..
```

Expected: `package-lock.json` is updated to include vitest, happy-dom, @vue/test-utils. No errors.

- [ ] **Step 5: Run the test and verify it passes**

Run:
```bash
cd frontend && npm test && cd ..
```

Expected output (abbreviated):
```
 ✓ src/App.test.ts (1)
   ✓ App > renders the Zana title

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json \
        frontend/vitest.config.ts frontend/src/App.test.ts
git commit -m "test(frontend): add Vitest with App smoke test"
```

---

## Task 5: Wails v2 integration

**Files:**
- Modify: `cmd/zana/main.go` (replace stub with real Wails boot)
- Create: `wails.json`
- Create: `build/appicon.png`
- Modify: `go.mod` / `go.sum` (via `go get`)

- [ ] **Step 1: Add Wails v2 as a Go dependency**

Run:
```bash
go get github.com/wailsapp/wails/v2@v2.9.2
```

Expected: `go.mod` gains `require github.com/wailsapp/wails/v2 v2.9.2` and `go.sum` is populated. If v2.9.2 is not the latest stable at execution time, use `@latest` and record the resolved version in the commit message.

- [ ] **Step 2: Install the Wails CLI**

Run:
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@v2.9.2
```

Verify:
```bash
export PATH="$(go env GOPATH)/bin:$PATH"
wails version
```
Expected: `v2.9.2` (or whichever version was installed). The `export PATH` line is required on fresh macOS installs (the official Go .pkg does not add `$(go env GOPATH)/bin` to PATH). Task 7's Makefile sets the same PATH export via `export PATH :=`.

- [ ] **Step 3: Create a placeholder app icon**

Wails CLI refuses to build without `build/appicon.png`. Create a 256x256 transparent PNG:

```bash
mkdir -p build
# macOS has `sips` built in; use it to generate a blank PNG.
# Alternatively, download any 256x256 PNG and place it here.
python3 -c "
import struct, zlib
def png_256():
    sig = b'\x89PNG\r\n\x1a\n'
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t+d) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', 256, 256, 8, 6, 0, 0, 0)
    raw = b''.join(b'\x00' + b'\x00\x00\x00\x00'*256 for _ in range(256))
    idat = zlib.compress(raw)
    return sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')
open('build/appicon.png','wb').write(png_256())
"
```

Verify:
```bash
file build/appicon.png
```
Expected: `build/appicon.png: PNG image data, 256 x 256, 8-bit/color RGBA, non-interlaced`.

Real icon design is deferred to a later plan; this is a scaffold placeholder.

- [ ] **Step 4: Create wails.json**

```json
{
  "$schema": "https://wails.io/schemas/config.v2.json",
  "name": "zana",
  "outputfilename": "zana",
  "frontend:install": "npm install",
  "frontend:build": "npm run build",
  "frontend:dev:watcher": "npm run dev",
  "frontend:dev:serverUrl": "auto",
  "author": {
    "name": "herocod3r"
  },
  "info": {
    "productName": "Zana",
    "productVersion": "0.0.0",
    "copyright": "© 2026 herocod3r",
    "comments": "Minimal agent orchestrator"
  }
}
```

- [ ] **Step 5: Replace cmd/zana/main.go with the Wails boot**

```go
// Command zana is the Zana desktop app entry point.
package main

import (
	"context"
	"embed"
	"log/slog"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

	err := wails.Run(&options.App{
		Title:     "Zana",
		Width:     1280,
		Height:    800,
		MinWidth:  800,
		MinHeight: 500,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 11, G: 11, B: 14, A: 1},
		OnStartup: func(ctx context.Context) {
			_ = ctx // wired to real handlers in a later plan
			logger.Info("zana starting")
		},
		Bind: []interface{}{},
	})
	if err != nil {
		logger.Error("wails run failed", "err", err)
		os.Exit(1)
	}
}
```

Note: `OnStartup` MUST be `func(ctx context.Context)` — Wails v2's `options.App.OnStartup` field is concretely typed and Go does not structurally convert function-typed fields. `Bind` is declared as `[]interface{}` (matching the Wails option type explicitly) rather than `[]any{}`.

- [ ] **Step 6: Verify the embed resolves and the binary compiles**

Run:
```bash
go build -o build/bin/zana ./cmd/zana
```

Expected: binary at `build/bin/zana`, no errors. The `//go:embed all:frontend/dist` directive resolves because `frontend/dist/` exists and contains at least `.gitkeep` plus the real build output from Task 3.

Verify the binary size (sanity check that assets are embedded — should be larger than a pure stub):
```bash
ls -lh build/bin/zana
```
Expected: a file in the 15-30 MB range.

- [ ] **Step 7: Verify go test ./... still passes**

Run:
```bash
go test ./...
```

Expected: all internal packages report `[no test files]`, `cmd/zana` reports `[no test files]`. No failures.

- [ ] **Step 8: Commit**

```bash
git add go.mod go.sum wails.json build/appicon.png cmd/zana/main.go
git commit -m "feat: integrate Wails v2 with embedded frontend assets"
```

---

## Task 6: Linting (golangci-lint + ESLint)

**Files:**
- Create: `.golangci.yml`
- Create: `frontend/.eslintrc.cjs`
- Modify: `frontend/package.json` (add eslint deps and `lint` script)

- [ ] **Step 1: Create .golangci.yml**

```yaml
run:
  timeout: 5m
  tests: true

linters:
  disable-all: true
  enable:
    - errcheck
    - govet
    - staticcheck
    - ineffassign
    - unused
    - gofmt
    - goimports

linters-settings:
  goimports:
    local-prefixes: github.com/herocod3r/zana

issues:
  exclude-use-default: false
```

- [ ] **Step 2: Install golangci-lint locally and verify**

Run:
```bash
go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.57.2
export PATH="$(go env GOPATH)/bin:$PATH"
golangci-lint version
```
Expected: prints a v1.57.x version line. The `export PATH` line is required on fresh macOS installs (the official Go .pkg does not add `$(go env GOPATH)/bin` to PATH). The Makefile in Task 7 sets the same PATH export permanently via `export PATH :=`, so later `make lint` invocations don't need this manual export.

- [ ] **Step 3: Run golangci-lint on the current tree**

Run:
```bash
golangci-lint run ./...
```

Expected: no issues reported (exit code 0). If `cmd/zana/main.go` trips `errcheck` or similar, fix the specific issue (not the config). For example, if `slog.New(...)` returns an unused result somewhere, address it.

- [ ] **Step 4: Add ESLint dependencies to frontend/package.json**

Add to `devDependencies`:
```json
    "@vue/eslint-config-typescript": "^13.0.0",
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.25.0"
```

Add to `scripts`:
```json
    "lint": "eslint --max-warnings=0 \"src/**/*.{ts,vue}\""
```

The full `scripts` block becomes:
```json
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint --max-warnings=0 \"src/**/*.{ts,vue}\""
  },
```

- [ ] **Step 5: Create frontend/.eslintrc.cjs**

```js
/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {},
}
```

- [ ] **Step 6: Install and run the frontend linter**

Run:
```bash
cd frontend && npm install && npm run lint && cd ..
```

Expected: zero lint warnings or errors. If `App.vue`'s template trips `vue/multi-word-component-names` (it will — `App` is a single word), add to the `rules` block in `.eslintrc.cjs`:
```js
    'vue/multi-word-component-names': 'off',
```
Then re-run `npm run lint` until it exits 0.

- [ ] **Step 7: Commit**

```bash
git add .golangci.yml frontend/.eslintrc.cjs frontend/package.json frontend/package-lock.json
git commit -m "chore: add golangci-lint and ESLint configs"
```

---

## Task 7: Full Makefile dependency graph

**Files:**
- Modify: `Makefile` (add all real targets)

- [ ] **Step 1: Replace the Makefile with the full version**

Overwrite `Makefile` with the following. Recipe indentation MUST be tabs.

```makefile
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

# Make sure `go install`-ed binaries (wails, golangci-lint) resolve even
# when the user's shell PATH doesn't include GOPATH/bin (fresh macOS
# installs from the official .pkg don't add it by default).
export PATH := $(shell go env GOPATH)/bin:$(PATH)

# --- Inputs ------------------------------------------------------------------

GO_SOURCES := $(shell find cmd internal -type f -name '*.go' 2>/dev/null)
FRONTEND_SOURCES := $(shell find frontend/src frontend/index.html frontend/vite.config.ts \
                            -type f 2>/dev/null)

# --- Help --------------------------------------------------------------------

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# --- Tools -------------------------------------------------------------------

.PHONY: tools
tools: ## Install Go dev tools (wails CLI, golangci-lint)
	go install github.com/wailsapp/wails/v2/cmd/wails@v2.9.2
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.57.2

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
	wails dev

# --- Test --------------------------------------------------------------------

.PHONY: go-test
go-test: go-deps
	go test ./...

.PHONY: frontend-test
frontend-test: frontend-deps
	cd frontend && npm test

.PHONY: test
test: go-test frontend-test ## Run all tests (go + frontend)

# --- Lint --------------------------------------------------------------------

.PHONY: go-lint
go-lint: go-deps
	golangci-lint run ./...

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
```

- [ ] **Step 2: Verify `make help` shows every documented target**

Run: `make help`

Expected output (order-agnostic, each line should appear):
```
  help                 Show this help
  tools                Install Go dev tools (wails CLI, golangci-lint)
  go-deps              Download Go modules
  frontend-deps        Install frontend dependencies
  frontend-build       Build the frontend bundle
  go-build             Build the Go binary (requires frontend-build)
  deps                 Install all dependencies
  build                Build the application binary
  dev                  Run Wails dev (hot reload)
  test                 Run all tests (go + frontend)
  lint                 Run all linters (golangci-lint + eslint)
  ci                   Full CI pipeline: lint + test + build
  clean                Remove build artifacts and dependencies
```

- [ ] **Step 3: Clean and do a full build from scratch**

Run:
```bash
make clean
make build
```

Expected: `make clean` removes `build/bin`, `frontend/dist/assets`, `frontend/dist/index.html`, `frontend/node_modules`, and `.make/`, and recreates `frontend/dist/.gitkeep`. Then `make build` runs in order:
1. `go mod download` (populates go.sum if needed) and stamps `.make/go-deps.stamp`
2. `cd frontend && npm ci` (reinstalls node_modules, stamps the sentinel)
3. `cd frontend && npm run build` (produces frontend/dist/index.html) and `touch frontend/dist/.gitkeep`
4. `go build -o build/bin/zana ./cmd/zana`

Final artifact: `build/bin/zana` exists.

- [ ] **Step 4: Verify idempotency — running `make build` twice is a no-op**

Run:
```bash
make build
```

Expected output: `make: Nothing to be done for 'build'.` or no target recipes execute (check with `make -d build | tail` if unsure). The sentinel files are all newer than their sources, so make skips every recipe.

- [ ] **Step 5: Verify selective rebuild — touching a Go file rebuilds only the binary**

Run:
```bash
touch cmd/zana/main.go
make build
```

Expected: Only `go build -o build/bin/zana ./cmd/zana` runs. No frontend install, no frontend build, no `go mod download`.

- [ ] **Step 6: Verify selective rebuild — touching a Vue file rebuilds frontend + binary**

Run:
```bash
touch frontend/src/App.vue
make build
```

Expected: `cd frontend && npm run build` runs, then `go build` runs. No `npm ci`, no `go mod download`.

- [ ] **Step 7: Run the full CI pipeline locally**

Run:
```bash
make ci
```

Expected: lint passes, test passes, build succeeds. If any step fails, fix the underlying issue (not the Makefile — the Makefile is declarative; problems are in the source).

- [ ] **Step 8: Commit**

```bash
git add Makefile
git commit -m "build: wire Makefile dependency graph with file sentinels"
```

---

## Task 8: GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/build.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache: true

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Linux webkit deps (for Wails)
        run: |
          sudo apt-get update
          sudo apt-get install -y build-essential pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev

      - name: Install dev tools
        run: make tools

      - name: Run CI pipeline
        run: make ci
```

- [ ] **Step 2: Validate the YAML locally**

Run:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/build.yml'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/build.yml
git commit -m "ci: add GitHub Actions workflow running make ci"
```

Note: the workflow is not executed by this plan — it runs when the branch is pushed. Verifying it actually passes on GitHub is part of the later PR/land workflow, not this scaffolding plan.

---

## Task 9: README dev quickstart

**Files:**
- Modify: `README.md` (replace the "Build (when scaffolded)" section)

- [ ] **Step 1: Replace the build section in README.md**

In `README.md`, find the section:

```markdown
## Build (when scaffolded)

```bash
# Prerequisites: Go 1.22+, Node 20+, Wails CLI
wails dev    # development with hot reload
wails build  # production binary
```
```

Replace it with:

```markdown
## Build

**Prerequisites:** Go 1.22+, Node 20+, GNU Make, and (for `make dev`) the Wails v2 CLI. `make tools` installs the Wails CLI and `golangci-lint` into `$(go env GOPATH)/bin`.

```bash
make tools   # one-time: install wails CLI + golangci-lint
make deps    # install go modules + npm deps
make dev     # development with hot reload (Wails + Vite)
make build   # production binary at build/bin/zana
make test    # go test ./... + vitest run
make lint    # golangci-lint + eslint
make ci      # full pipeline: lint + test + build
make clean   # remove build artifacts and node_modules
```

`make` targets use file-based dependency tracking, so re-running `make build` after a successful build is a no-op.
```

- [ ] **Step 2: Verify the final tree is clean and all targets still pass**

Run:
```bash
git status
make ci
```

Expected: `git status` shows only the modified `README.md`. `make ci` succeeds.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Makefile-based dev quickstart to README"
```

---

## Final verification checklist

Run these commands from the repo root and confirm each one succeeds. This is the definition of "scaffolding done":

- [ ] `make clean && make build` — full rebuild succeeds from a clean state.
- [ ] `make build` — second run is a no-op (no recipes execute).
- [ ] `make test` — all tests pass (Go: `[no test files]` everywhere; Vitest: 1 passed).
- [ ] `make lint` — golangci-lint and ESLint both exit 0.
- [ ] `make ci` — the full pipeline from a clean state succeeds.
- [ ] `ls build/bin/zana` — the binary exists and is 15-30 MB.
- [ ] `git log --oneline` shows 9 commits from this plan (one per task).
- [ ] `git status` is clean.

If any step fails, fix the underlying cause before declaring the plan complete. Do not rubber-stamp a red build.

---

## Deferred to later plans

Explicitly NOT in this scaffolding plan — do not attempt any of these here:

- Real implementations of `internal/api`, `internal/preflight`, `internal/project`, `internal/workspace`, `internal/terminal`, `internal/session`, `internal/schema`, `internal/testutil`. All eight packages ship as `doc.go` only.
- SQLite schema, `modernc.org/sqlite` dependency.
- `creack/pty` dependency, PTY spawning, ring buffer, sequence numbers.
- `oklog/ulid/v2` dependency.
- The real `api.API` Wails-bound struct and all `Bind:` wiring.
- Session save/restore, serializable state types.
- The design system from `docs/DESIGN.md` (colors, Geist fonts, Industrial Minimalism aesthetic).
- xterm.js, ghostty-web, the `TerminalAdapter` interface.
- Pinia stores beyond the empty `createPinia()` install.
- macOS code signing, notarization, Homebrew tap, release automation.
- Playwright E2E tests.
- The throughput spike from `docs/architecture.md` Next Step 2.

Each of these items becomes its own plan once scaffolding is merged.
