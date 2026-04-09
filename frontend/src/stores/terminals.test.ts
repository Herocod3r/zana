import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTerminalStore } from './terminals'

describe('terminalStore', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('loads fixture split trees keyed by tab', () => {
    const s = useTerminalStore()
    s.load()
    const tree = s.treeFor('tab-osaka-default')
    expect(tree).toBeDefined()
    expect(tree!.kind).toBe('branch')
  })
  it('terminals are indexable by id', () => {
    const s = useTerminalStore()
    s.load()
    expect(s.terminal('t-osaka-claude')).toBeDefined()
  })
  it('splitPane returns a new tree with a branch in place of leaf', () => {
    const s = useTerminalStore()
    s.load()
    s.splitPane('tab-tokyo-default', 'lf-tokyo-1', 'row')
    const tree = s.treeFor('tab-tokyo-default')
    expect(tree!.kind).toBe('branch')
  })
  it('activity state rollup for a tab returns max', () => {
    const s = useTerminalStore()
    s.load()
    const state = s.rolledUpState('tab-osaka-default')
    expect(['active', 'recent', 'idle']).toContain(state)
  })
})
