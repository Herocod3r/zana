# Phase 1 — Scaffold & Tokens

**Goal:** A Wails v2 project with Vue 3 + TS strict + Pinia + Vitest, Phosphor icons, Geist fonts, the CSS token file, globals, and an inline theme-flash-prevention script. Ends with a booted app that shows a blank themed background in dark or light depending on the OS.

**Prerequisites:** Wails CLI v2 installed (`wails version` returns a v2.x release), Go 1.21+, Node 20+, pnpm 9+.

---

### Task 1.1: Scaffold Wails project

**Files:** creates the entire project tree rooted at the worktree.

- [ ] **Step 1: Confirm the worktree is empty of source**

Run: `ls -A /Users/jethro/Documents/Projects/Zana/.claude/worktrees/app-layout | grep -vE '^(\.git|\.gitignore|\.claude|\.superpowers|docs|TODOS.md|README.md|CLAUDE.md)$'`
Expected: no output.

- [ ] **Step 2: Scaffold Wails Vue+TS template into a temp dir, then move frontend in**

Wails insists on scaffolding into an empty directory, so we scaffold to `/tmp/zana-scaffold` and copy the pieces we need.

Run:
```bash
rm -rf /tmp/zana-scaffold
wails init -n zana -t vue-ts -d /tmp/zana-scaffold
ls /tmp/zana-scaffold
```
Expected: directory listing includes `app.go`, `main.go`, `wails.json`, `frontend/`, `go.mod`, `build/`.

- [ ] **Step 3: Copy the scaffold into the worktree**

Run:
```bash
cd /Users/jethro/Documents/Projects/Zana/.claude/worktrees/app-layout
cp /tmp/zana-scaffold/app.go ./app.go
cp /tmp/zana-scaffold/main.go ./main.go
cp /tmp/zana-scaffold/wails.json ./wails.json
cp /tmp/zana-scaffold/go.mod ./go.mod
cp /tmp/zana-scaffold/go.sum ./go.sum
cp -r /tmp/zana-scaffold/frontend ./frontend
cp -r /tmp/zana-scaffold/build ./build
git status --short
```
Expected: many new files under `frontend/`, `build/`, plus top-level Go files.

- [ ] **Step 4: Fix the Go module path**

Edit `go.mod` so the module line reads `module github.com/herocod3r/zana` (matches `docs/architecture.md`).

- [ ] **Step 5: Set Wails app name**

Edit `wails.json`, set `"name": "Zana"` and `"outputfilename": "Zana"`.

- [ ] **Step 6: Verify scaffolded frontend boots**

Run:
```bash
cd frontend && pnpm install && pnpm run dev -- --host 127.0.0.1 --port 34100 &
sleep 3 && curl -sf http://127.0.0.1:34100/ | head -5
kill %1 2>/dev/null || true
```
Expected: HTML output with `<div id="app">`.

- [ ] **Step 7: Commit scaffold**

```bash
cd /Users/jethro/Documents/Projects/Zana/.claude/worktrees/app-layout
git add .
git commit -m "chore: scaffold Wails v2 + Vue 3 + TS template"
```

---

### Task 1.2: Swap to pnpm workspace-friendly layout and upgrade deps

**Files:** `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`

- [ ] **Step 1: Rewrite `frontend/package.json`**

Replace `frontend/package.json` with:

```json
{
  "name": "zana-frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint 'src/**/*.{ts,vue}'",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@phosphor-icons/vue": "^2.2.1",
    "pinia": "^2.2.6",
    "vue": "^3.5.12"
  },
  "devDependencies": {
    "@types/node": "^22.9.0",
    "@vitejs/plugin-vue": "^5.2.1",
    "@vue/test-utils": "^2.4.6",
    "@vue/tsconfig": "^0.7.0",
    "eslint": "^9.14.0",
    "eslint-plugin-vue": "^9.31.0",
    "happy-dom": "^15.11.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.11",
    "vitest": "^2.1.5",
    "vue-tsc": "^2.1.10"
  }
}
```

- [ ] **Step 2: Rewrite `frontend/tsconfig.json`**

Replace with:

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `frontend/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Rewrite `frontend/vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 34100,
    strictPort: true,
  },
})
```

- [ ] **Step 5: Create `frontend/vitest.config.ts`**

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['src/**/*.test.ts'],
      setupFiles: ['./src/tests/setup.ts'],
    },
  }),
)
```

- [ ] **Step 6: Install deps**

```bash
cd frontend && rm -rf node_modules pnpm-lock.yaml && pnpm install
```
Expected: install completes without peer-dependency errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/pnpm-lock.yaml frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/vitest.config.ts
git commit -m "chore(frontend): pin deps, add pinia, vitest, phosphor, path alias"
```

---

### Task 1.3: Add self-hosted Geist fonts

**Files:** `frontend/public/fonts/*.woff2`, `frontend/src/styles/fonts.css`

- [ ] **Step 1: Download Geist Sans and Geist Mono woff2**

Run:
```bash
cd /Users/jethro/Documents/Projects/Zana/.claude/worktrees/app-layout/frontend
mkdir -p public/fonts
curl -sSL -o public/fonts/GeistSans-Regular.woff2 https://github.com/vercel/geist-font/raw/main/packages/geist-sans/dist/fonts/geist-sans/Geist-Regular.woff2
curl -sSL -o public/fonts/GeistSans-Medium.woff2 https://github.com/vercel/geist-font/raw/main/packages/geist-sans/dist/fonts/geist-sans/Geist-Medium.woff2
curl -sSL -o public/fonts/GeistSans-SemiBold.woff2 https://github.com/vercel/geist-font/raw/main/packages/geist-sans/dist/fonts/geist-sans/Geist-SemiBold.woff2
curl -sSL -o public/fonts/GeistMono-Regular.woff2 https://github.com/vercel/geist-font/raw/main/packages/geist-mono/dist/fonts/geist-mono/GeistMono-Regular.woff2
curl -sSL -o public/fonts/GeistMono-Medium.woff2 https://github.com/vercel/geist-font/raw/main/packages/geist-mono/dist/fonts/geist-mono/GeistMono-Medium.woff2
curl -sSL -o public/fonts/GeistMono-SemiBold.woff2 https://github.com/vercel/geist-font/raw/main/packages/geist-mono/dist/fonts/geist-mono/GeistMono-SemiBold.woff2
ls -la public/fonts
```
Expected: six `.woff2` files, each non-zero.

**If any of these URLs 404:** fallback is the npm `geist` package. Run `pnpm add geist`, then copy from `node_modules/geist/dist/fonts/` into `public/fonts/`.

- [ ] **Step 2: Create `frontend/src/styles/fonts.css`**

```css
@font-face {
  font-family: 'Geist Sans';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url('/fonts/GeistSans-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Geist Sans';
  font-style: normal;
  font-weight: 500;
  font-display: block;
  src: url('/fonts/GeistSans-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Geist Sans';
  font-style: normal;
  font-weight: 600;
  font-display: block;
  src: url('/fonts/GeistSans-SemiBold.woff2') format('woff2');
}
@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url('/fonts/GeistMono-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 500;
  font-display: block;
  src: url('/fonts/GeistMono-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 600;
  font-display: block;
  src: url('/fonts/GeistMono-SemiBold.woff2') format('woff2');
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/public/fonts frontend/src/styles/fonts.css
git commit -m "feat(frontend): self-host Geist Sans and Geist Mono fonts"
```

---

### Task 1.4: CSS tokens

**Files:** `frontend/src/styles/tokens.css`

- [ ] **Step 1: Create `frontend/src/styles/tokens.css`**

```css
:root {
  /* Dark theme (default for dark systems) */
  --bg: #0B0B0E;
  --surface: #141418;
  --surface-elev: #1C1C22;
  --border: #26262E;
  --border-strong: #34343E;
  --accent: #A3E635;
  --accent-fg: #0a0a0a;
  --text: #E8E8EA;
  --text-2: #9090A0;
  --text-muted: #5C5C68;
  --warning: #FBBF24;
  --error: #F87171;

  /* Type */
  --mono: 'Geist Mono', ui-monospace, Menlo, monospace;
  --sans: 'Geist Sans', -apple-system, system-ui, sans-serif;

  /* Spacing (4px base) */
  --s-2xs: 2px;
  --s-xs: 4px;
  --s-sm: 8px;
  --s-md: 12px;
  --s-lg: 16px;
  --s-xl: 24px;
  --s-2xl: 32px;

  /* Radii */
  --r-sm: 4px;
  --r-md: 6px;
  --r-lg: 10px;
  --r-full: 50%;

  /* Layout */
  --sidebar-width: 240px;
  --tabbar-h: 32px;
  --statusbar-h: 22px;
  --footer-h: 40px;
  --drag-region-h: 44px;

  /* Motion */
  --dur-fast: 80ms;
  --dur-med: 120ms;
  --dur-slow: 200ms;
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
}

[data-theme="light"] {
  --bg: #F8F8FA;
  --surface: #FFFFFF;
  --surface-elev: #FFFFFF;
  --border: #E4E4EA;
  --border-strong: #D0D0D8;
  --accent: #65A30D;
  --accent-fg: #FFFFFF;
  --text: #0B0B0E;
  --text-2: #5C5C68;
  --text-muted: #9090A0;
  --warning: #D97706;
  --error: #DC2626;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/styles/tokens.css
git commit -m "feat(frontend): add CSS variable tokens for themes and layout"
```

---

### Task 1.5: Globals + reset

**Files:** `frontend/src/styles/reset.css`, `frontend/src/styles/globals.css`

- [ ] **Step 1: Create `frontend/src/styles/reset.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; padding: 0; }
body {
  font-family: var(--sans);
  font-size: 14px;
  line-height: 1.4;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; padding: 0; }
input, select, textarea { font: inherit; color: inherit; background: none; border: none; outline: none; }
a { color: inherit; text-decoration: none; }
ul, ol { margin: 0; padding: 0; list-style: none; }
```

- [ ] **Step 2: Create `frontend/src/styles/globals.css`**

```css
html { background: var(--bg); }

/* Custom scrollbar */
*::-webkit-scrollbar { width: 6px; height: 6px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: transparent; border-radius: 3px; }
*:hover::-webkit-scrollbar-thumb { background: var(--border-strong); }
* { scrollbar-width: thin; scrollbar-color: var(--border-strong) transparent; }

/* Focus outlines (kept subtle) */
:focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: 1px;
}

/* Selection */
::selection { background: var(--accent); color: var(--accent-fg); }
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/styles/reset.css frontend/src/styles/globals.css
git commit -m "feat(frontend): add reset and globals"
```

---

### Task 1.6: Theme flash prevention script in `index.html`

**Files:** `frontend/index.html`

- [ ] **Step 1: Rewrite `frontend/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zana</title>
    <script>
      // Flash prevention: set data-theme before Vue mounts.
      (function () {
        try {
          var pref = localStorage.getItem('zana.theme.preference') || 'system'
          var resolved
          if (pref === 'system') {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          } else {
            resolved = pref
          }
          document.documentElement.setAttribute('data-theme', resolved)
        } catch (e) {
          document.documentElement.setAttribute('data-theme', 'dark')
        }
      })()
    </script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/index.html
git commit -m "feat(frontend): inline theme flash prevention script"
```

---

### Task 1.7: Wire styles into `main.ts` + placeholder `App.vue`

**Files:** `frontend/src/main.ts`, `frontend/src/App.vue`

- [ ] **Step 1: Rewrite `frontend/src/main.ts`**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './styles/tokens.css'
import './styles/fonts.css'
import './styles/reset.css'
import './styles/globals.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

- [ ] **Step 2: Rewrite `frontend/src/App.vue`**

```vue
<script setup lang="ts">
// Placeholder shell — replaced in Phase 5.
</script>

<template>
  <div class="placeholder">
    <p>Zana — booting</p>
  </div>
</template>

<style scoped>
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 12px;
}
</style>
```

- [ ] **Step 3: Boot-check**

```bash
cd frontend && pnpm run dev -- --host 127.0.0.1 &
sleep 3 && curl -sf http://127.0.0.1:34100/ | grep -q 'id="app"' && echo OK
kill %1 2>/dev/null || true
```
Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/main.ts frontend/src/App.vue
git commit -m "feat(frontend): wire styles and placeholder App"
```

---

### Task 1.8: Vitest setup + smoke test

**Files:** `frontend/src/tests/setup.ts`, `frontend/src/tests/smoke.test.ts`

- [ ] **Step 1: Create `frontend/src/tests/setup.ts`**

```ts
import { config } from '@vue/test-utils'

// No global stubs yet; reserved for future setup.
void config
```

- [ ] **Step 2: Create `frontend/src/tests/smoke.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App smoke', () => {
  it('mounts the placeholder shell', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Zana')
  })
})
```

- [ ] **Step 3: Run tests**

```bash
cd frontend && pnpm run test
```
Expected: `1 passed`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/tests/setup.ts frontend/src/tests/smoke.test.ts
git commit -m "test(frontend): vitest setup and App smoke test"
```

---

### Task 1.9: Hex lint rule

**Files:** `frontend/eslint.config.js`

- [ ] **Step 1: Create `frontend/eslint.config.js`**

```js
import vuePlugin from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['src/**/*.{ts,vue}'],
    ignores: ['src/styles/**', 'src/mocks/**', 'src/tests/**'],
    languageOptions: { parser: tsParser, ecmaVersion: 2022, sourceType: 'module' },
    plugins: { vue: vuePlugin },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message: 'Hex literals are forbidden outside styles/tokens.css and mocks/fixtures.ts. Use CSS variables.',
        },
      ],
    },
  },
]
```

- [ ] **Step 2: Install missing dep**

```bash
cd frontend && pnpm add -D @typescript-eslint/parser
```

- [ ] **Step 3: Run lint**

```bash
cd frontend && pnpm run lint
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/eslint.config.js frontend/package.json frontend/pnpm-lock.yaml
git commit -m "chore(frontend): eslint hex literal rule"
```

---

### Task 1.10: Types module (Project, Workspace, Tab, Terminal, SplitNode)

**Files:** `frontend/src/types/models.ts`

- [ ] **Step 1: Create `frontend/src/types/models.ts`**

```ts
export type ID = string

export type ActivityState = 'active' | 'recent' | 'idle'

export interface Project {
  id: ID
  name: string
  path: string
}

export interface Workspace {
  id: ID
  projectId: ID
  name: string
  branch: string
  worktreePath: string
}

export interface Tab {
  id: ID
  workspaceId: ID
  name: string
  rootSplitId: ID
}

export interface Terminal {
  id: ID
  tabId: ID
  cwd: string
  command: string
  scrollback: string[]
  lastOutputAt: number // epoch ms
}

export type SplitDirection = 'row' | 'column'

export type SplitNode = SplitLeaf | SplitBranch

export interface SplitLeaf {
  kind: 'leaf'
  id: ID
  terminalId: ID
}

export interface SplitBranch {
  kind: 'branch'
  id: ID
  direction: SplitDirection
  /** Fraction of total size consumed by `a`, in [0.1, 0.9]. */
  ratio: number
  a: SplitNode
  b: SplitNode
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend && pnpm run typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/models.ts
git commit -m "feat(frontend): core domain types"
```

---

### Phase 1 done when

- `pnpm run dev` serves an HTML page with the Zana placeholder in dark mode on a dark-mode OS.
- `pnpm run test` passes the smoke test.
- `pnpm run lint` has no errors.
- `pnpm run typecheck` has no errors.
- Traffic lights / window chrome not yet configured (Phase 5).
