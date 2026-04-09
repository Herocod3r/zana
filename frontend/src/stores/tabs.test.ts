import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTabStore } from './tabs'

describe('tabStore', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('loads fixture tabs and exposes active per workspace', () => {
    const s = useTabStore()
    s.load()
    expect(s.tabsFor('ws-osaka').length).toBe(1)
    expect(s.activeTabId('ws-osaka')).toBe('tab-osaka-default')
  })
  it('newTab adds and activates', () => {
    const s = useTabStore()
    s.load()
    const t = s.newTab('ws-osaka')
    expect(s.tabsFor('ws-osaka').find((x) => x.id === t.id)).toBeTruthy()
    expect(s.activeTabId('ws-osaka')).toBe(t.id)
  })
  it('closeTab replaces last tab with a fresh empty one', () => {
    const s = useTabStore()
    s.load()
    const current = s.activeTabId('ws-tokyo')!
    s.closeTab('ws-tokyo', current)
    const tabs = s.tabsFor('ws-tokyo')
    expect(tabs.length).toBe(1)
    expect(tabs[0].id).not.toBe(current)
  })
  it('renameTab updates name', () => {
    const s = useTabStore()
    s.load()
    s.renameTab('tab-osaka-default', 'renamed')
    const tabs = s.tabsFor('ws-osaka')
    expect(tabs[0].name).toBe('renamed')
  })
})
