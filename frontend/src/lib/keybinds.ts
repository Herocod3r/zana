// frontend/src/lib/keybinds.ts
//
// `mod` is platform-specific: Cmd on macOS, Ctrl on Linux/Windows. We never
// alias both together — on macOS Ctrl combos (e.g. Ctrl+C, Ctrl+D) must pass
// through to the terminal, not be intercepted as app shortcuts.

export type Handler = (e: KeyboardEvent) => void

function isMac(): boolean {
  return /Mac|iPhone|iPad/.test(navigator.platform)
}

function normalize(e: KeyboardEvent): string {
  const parts: string[] = []
  const mod = isMac() ? e.metaKey : e.ctrlKey
  if (mod) parts.push('mod')
  if (e.altKey) parts.push('alt')
  if (e.shiftKey) parts.push('shift')
  // Map named keys to canonical lowercase tokens.
  const map: Record<string, string> = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Enter: 'enter',
    Escape: 'escape',
    Backspace: 'backspace',
    Tab: 'tab',
    ' ': 'space',
  }
  const key = map[e.key] ?? (e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase())
  parts.push(key)
  return parts.join('+')
}

function isEditable(target: EventTarget | null): boolean {
  if (!target) return false
  const el = target as HTMLElement
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return true
  if (el.isContentEditable) return true
  return false
}

export function registerKeybinds(map: Record<string, Handler>): () => void {
  function onKey(e: KeyboardEvent) {
    if (isEditable(e.target)) return
    const key = normalize(e)
    const fn = map[key]
    if (fn) {
      e.preventDefault()
      fn(e)
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}
