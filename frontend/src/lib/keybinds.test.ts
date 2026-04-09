import { describe, expect, it, vi } from 'vitest'
import { registerKeybinds } from './keybinds'

// Force macOS detection so tests are deterministic across CI platforms.
Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true })

function makeKey(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
}

describe('keybinds', () => {
  it('invokes mapped handler on matching event (mac mod=meta)', () => {
    const fn = vi.fn()
    const off = registerKeybinds({ 'mod+n': fn })
    document.body.dispatchEvent(makeKey({ key: 'n', metaKey: true }))
    expect(fn).toHaveBeenCalled()
    off()
  })
  it('does NOT match ctrl+n on macOS (ctrl should pass through to terminal)', () => {
    const fn = vi.fn()
    const off = registerKeybinds({ 'mod+n': fn })
    document.body.dispatchEvent(makeKey({ key: 'n', ctrlKey: true }))
    expect(fn).not.toHaveBeenCalled()
    off()
  })
  it('ignores events when an input is focused', () => {
    const fn = vi.fn()
    const off = registerKeybinds({ 'mod+n': fn })
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    input.dispatchEvent(makeKey({ key: 'n', metaKey: true }))
    expect(fn).not.toHaveBeenCalled()
    off()
    document.body.removeChild(input)
  })
})
