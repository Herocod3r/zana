import { defineStore } from 'pinia'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ThemeResolved = 'light' | 'dark'

const STORAGE_KEY = 'zana.theme.preference'

// Module-level runtime handles. Not Pinia state because they are not
// reactive data — they are the subscription mechanics behind the store.
let mql: MediaQueryList | null = null
let listener: ((e: MediaQueryListEvent) => void) | null = null

interface State {
  preference: ThemePreference
  resolved: ThemeResolved
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

function computeResolved(pref: ThemePreference): ThemeResolved {
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
  }),
  actions: {
    init() {
      // Idempotent: if already initialized, do nothing. This prevents HMR
      // reloads and double-init calls from leaking listeners.
      if (mql) return
      this.preference = readStoredPreference()
      mql = window.matchMedia('(prefers-color-scheme: dark)')
      this.resolved = computeResolved(this.preference)
      applyToDocument(this.resolved)
      listener = () => {
        if (this.preference === 'system') {
          this.resolved = computeResolved('system')
          applyToDocument(this.resolved)
        }
      }
      mql.addEventListener('change', listener)
    },
    setPreference(pref: ThemePreference) {
      this.preference = pref
      try {
        localStorage.setItem(STORAGE_KEY, pref)
      } catch {
        /* noop */
      }
      this.resolved = computeResolved(this.preference)
      applyToDocument(this.resolved)
    },
    cycle() {
      const next: ThemePreference =
        this.preference === 'system' ? 'light' : this.preference === 'light' ? 'dark' : 'system'
      this.setPreference(next)
    },
    dispose() {
      if (mql && listener) {
        mql.removeEventListener('change', listener)
      }
      mql = null
      listener = null
    },
  },
})
