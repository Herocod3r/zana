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
    // Dispose any listener leaked from a prior test before resetting pinia.
    try { useThemeStore().dispose() } catch { /* no store yet on first run */ }
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

  it('setPreference(system) after light re-resolves from OS', () => {
    mockMatchMedia(true)
    const t = useThemeStore()
    t.init()
    t.setPreference('light')
    expect(t.resolved).toBe('light')
    t.setPreference('system')
    expect(t.resolved).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
