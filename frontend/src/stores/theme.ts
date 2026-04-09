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
