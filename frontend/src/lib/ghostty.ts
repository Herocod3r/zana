// Stub terminal renderer adapter. Real implementation ships in a later phase
// (xterm.js first, then ghostty-web). TerminalPane renders mock content
// directly in scope B; this stub exists so the import path stabilizes.

export interface TerminalAdapter {
  init(container: HTMLElement): void
  write(data: string): void
  onInput(handler: (data: string) => void): () => void
  resize(cols: number, rows: number): void
  fit(): { cols: number; rows: number }
  focus(): void
  blur(): void
  clear(): void
  reset(): void
  serialize(): string
  restore(snapshot: string): void
  dispose(): void
}

export function createNoopAdapter(): TerminalAdapter {
  return {
    init() {},
    write() {},
    onInput() { return () => {} },
    resize() {},
    fit() { return { cols: 80, rows: 24 } },
    focus() {},
    blur() {},
    clear() {},
    reset() {},
    serialize() { return '' },
    restore() {},
    dispose() {},
  }
}
