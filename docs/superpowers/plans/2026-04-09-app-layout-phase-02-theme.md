# Phase 2 — Theme System

**Goal:** `themeStore` that reads/writes `localStorage`, syncs to the OS when preference is `system`, keeps `data-theme` on `<html>` in sync with `resolved`, and exposes a cycle action. Single composable for the `SidebarFooter` theme button to consume in Phase 6.

**Prerequisites:** Phase 1 complete. `pinia` installed. `tokens.css` loaded.

---

### Task 2.1: Theme store

**Files:**
- Create: `frontend/src/stores/theme.ts`
- Test: `frontend/src/stores/theme.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// frontend/src/stores/theme.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from './theme'

function mockMatchMedia(dark: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  const mql = {
    matches: dark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList
  window.matchMedia = vi.fn().mockReturnValue(mql)
  return {
    mql,
    flip: (toDark: boolean) => {
      ;(mql as unknown as { matches: boolean }).matches = toDark
      listeners.forEach((cb) => cb({ matches: toDark } as MediaQueryListEvent))
    },
  }
}

describe('themeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults preference to system and resolves from OS', () => {
    mockMatchMedia(true)
    const t = useThemeStore()
    t.init()
    expect(t.preference).toBe('system')
    expect(t.resolved).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('honors stored preference over OS', () => {
    mockMatchMedia(true)
    localStorage.setItem('zana.theme.preference', 'light')
    const t = useThemeStore()
    t.init()
    expect(t.preference).toBe('light')
    expect(t.resolved).toBe('light')
  })

  it('cycles system -> light -> dark -> system', () => {
    mockMatchMedia(false)
    const t = useThemeStore()
    t.init()
    t.cycle()
    expect(t.preference).toBe('light')
    t.cycle()
    expect(t.preference).toBe('dark')
    t.cycle()
    expect(t.preference).toBe('system')
  })

  it('reacts to OS change when preference is system', () => {
    const media = mockMatchMedia(false)
    const t = useThemeStore()
    t.init()
    expect(t.resolved).toBe('light')
    media.flip(true)
    expect(t.resolved).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('persists preference to localStorage', () => {
    mockMatchMedia(false)
    const t = useThemeStore()
    t.init()
    t.setPreference('dark')
    expect(localStorage.getItem('zana.theme.preference')).toBe('dark')
  })
})
```

- [ ] **Step 2: Run and verify it fails**

```bash
cd frontend && pnpm run test -- theme
```
Expected: fails because `./theme` does not exist.

- [ ] **Step 3: Create `frontend/src/stores/theme.ts`**

```ts
import { defineStore } from 'pinia'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ThemeResolved = 'light' | 'dark'

const STORAGE_KEY = 'zana.theme.preference'

interface State {
  preference: ThemePreference
  resolved: ThemeResolved
  _mql: MediaQueryList | null
  _listener: ((e: MediaQueryListEvent) => void) | null
}

function readStoredPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* noop */
  }
  return 'system'
}

function computeResolved(pref: ThemePreference, mql: MediaQueryList | null): ThemeResolved {
  if (pref === 'system') return mql && mql.matches ? 'dark' : 'light'
  return pref
}

function applyToDocument(resolved: ThemeResolved) {
  document.documentElement.setAttribute('data-theme', resolved)
}

export const useThemeStore = defineStore('theme', {
  state: (): State => ({
    preference: 'system',
    resolved: 'dark',
    _mql: null,
    _listener: null,
  }),
  actions: {
    init() {
      this.preference = readStoredPreference()
      this._mql = window.matchMedia('(prefers-color-scheme: dark)')
      this.resolved = computeResolved(this.preference, this._mql)
      applyToDocument(this.resolved)
      this._listener = () => {
        if (this.preference === 'system') {
          this.resolved = computeResolved('system', this._mql)
          applyToDocument(this.resolved)
        }
      }
      this._mql.addEventListener('change', this._listener)
    },
    setPreference(pref: ThemePreference) {
      this.preference = pref
      try {
        localStorage.setItem(STORAGE_KEY, pref)
      } catch {
        /* noop */
      }
      this.resolved = computeResolved(this.preference, this._mql)
      applyToDocument(this.resolved)
    },
    cycle() {
      const next: ThemePreference =
        this.preference === 'system' ? 'light' : this.preference === 'light' ? 'dark' : 'system'
      this.setPreference(next)
    },
    dispose() {
      if (this._mql && this._listener) {
        this._mql.removeEventListener('change', this._listener)
      }
      this._mql = null
      this._listener = null
    },
  },
})
```

- [ ] **Step 4: Run and verify it passes**

```bash
cd frontend && pnpm run test -- theme
```
Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/stores/theme.ts frontend/src/stores/theme.test.ts
git commit -m "feat(stores): themeStore with cycle, persistence, OS sync"
```

---

### Task 2.2: Initialize theme store in `main.ts`

**Files:** `frontend/src/main.ts`

- [ ] **Step 1: Update `frontend/src/main.ts`**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useThemeStore } from './stores/theme'

import './styles/tokens.css'
import './styles/fonts.css'
import './styles/reset.css'
import './styles/globals.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

useThemeStore(pinia).init()

app.mount('#app')
```

- [ ] **Step 2: Run typecheck + tests**

```bash
cd frontend && pnpm run typecheck && pnpm run test
```
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/main.ts
git commit -m "feat(frontend): init themeStore on boot"
```

---

### Phase 2 done when

- Theme store tests all pass.
- Booting the dev server under a dark OS renders the placeholder on the dark token values.
- `localStorage.zana.theme.preference` round-trips preference changes.
