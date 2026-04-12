import { defineStore } from 'pinia'

const STORAGE_PREFIX = 'zana.settings.'

function stored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    /* noop */
  }
}

interface State {
  uiFontSize: number
  terminalFontSize: number
}

export const useSettingsStore = defineStore('settings', {
  state: (): State => ({
    uiFontSize: stored('uiFontSize', 12),
    terminalFontSize: stored('terminalFontSize', 13),
  }),
  actions: {
    setUiFontSize(size: number) {
      const clamped = Math.max(9, Math.min(18, Math.round(size)))
      this.uiFontSize = clamped
      persist('uiFontSize', clamped)
      document.documentElement.style.setProperty('--font-size-ui', `${clamped}px`)
    },
    setTerminalFontSize(size: number) {
      const clamped = Math.max(9, Math.min(24, Math.round(size)))
      this.terminalFontSize = clamped
      persist('terminalFontSize', clamped)
      document.documentElement.style.setProperty('--font-size-terminal', `${clamped}px`)
    },
    init() {
      document.documentElement.style.setProperty('--font-size-ui', `${this.uiFontSize}px`)
      document.documentElement.style.setProperty('--font-size-terminal', `${this.terminalFontSize}px`)
    },
  },
})
