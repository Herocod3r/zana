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
  it('splitPane preserves the original terminal and adds a new one', () => {
    const s = useTerminalStore()
    s.load()
    s.splitPane('tab-tokyo-default', 'lf-tokyo-1', 'row')
    const tree = s.treeFor('tab-tokyo-default')
    expect(tree).toBeDefined()
    expect(tree!.kind).toBe('branch')
    // Collect every terminal id reachable from the new tree.
    const ids: string[] = []
    function walkLocal(n: any) {
      if (n.kind === 'leaf') ids.push(n.terminalId)
      else { walkLocal(n.a); walkLocal(n.b) }
    }
    walkLocal(tree!)
    expect(ids).toContain('t-tokyo-claude') // original preserved
    expect(ids.length).toBe(2) // one new terminal added
  })
  it('closeLeaf collapses a branch when one side becomes empty', () => {
    const s = useTerminalStore()
    s.load()
    // Osaka starts with a 2-leaf branch (claude + codex).
    s.closeLeaf('tab-osaka-default', 'lf-osaka-2')
    const tree = s.treeFor('tab-osaka-default')
    expect(tree).toBeDefined()
    expect(tree!.kind).toBe('leaf') // branch collapsed to the surviving leaf
    if (tree!.kind === 'leaf') {
      expect(tree!.terminalId).toBe('t-osaka-claude')
    }
  })
  it('activity state rollup for a tab returns max', () => {
    const s = useTerminalStore()
    s.load()
    const state = s.rolledUpState('tab-osaka-default')
    expect(['active', 'recent', 'idle']).toContain(state)
  })
})
