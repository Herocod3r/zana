import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWorkspaceStore } from './workspaces'

describe('workspaceStore', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('loads fixture workspaces and a default active one', () => {
    const s = useWorkspaceStore()
    s.load()
    expect(s.workspaces.length).toBeGreaterThan(0)
    expect(s.activeWorkspaceId).not.toBeNull()
  })
  it('groups by project', () => {
    const s = useWorkspaceStore()
    s.load()
    const group = s.byProject('proj-zana')
    expect(group.length).toBeGreaterThanOrEqual(1)
  })
  it('select updates active', () => {
    const s = useWorkspaceStore()
    s.load()
    s.select('ws-tokyo')
    expect(s.activeWorkspaceId).toBe('ws-tokyo')
  })
})
