import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TabBar from './TabBar.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'

describe('TabBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders tabs for the active workspace', () => {
    useWorkspaceStore().load()
    useTabStore().load()
    useTerminalStore().load()
    useWorkspaceStore().select('ws-kyoto')
    const w = mount(TabBar)
    expect(w.text()).toContain('investigation')
    expect(w.text()).toContain('logs')
  })

  it('shows overflow chevron and popover when scroller overflows', async () => {
    useWorkspaceStore().load()
    useTabStore().load()
    useTerminalStore().load()
    useWorkspaceStore().select('ws-kyoto')
    // Force overflow by stubbing scrollWidth > clientWidth on the scroller el.
    const origScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollWidth')
    const origClient = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get: () => 1000 })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 200 })
    try {
      const w = mount(TabBar)
      await new Promise((r) => setTimeout(r, 0))
      expect(w.find('.chevron').exists()).toBe(true)
      await w.find('.chevron').trigger('click')
      expect(w.find('.popover').exists()).toBe(true)
      expect(w.findAll('.popover-item').length).toBe(2)
    } finally {
      if (origScroll) Object.defineProperty(HTMLElement.prototype, 'scrollWidth', origScroll)
      if (origClient) Object.defineProperty(HTMLElement.prototype, 'clientWidth', origClient)
    }
  })

  it('reorders tabs on drag + drop', async () => {
    useWorkspaceStore().load()
    useTabStore().load()
    useTerminalStore().load()
    const wsStore = useWorkspaceStore()
    const tabStore = useTabStore()
    wsStore.select('ws-kyoto')
    const w = mount(TabBar)
    const items = w.findAll('.tab')
    expect(items.length).toBe(2)
    // Start drag from index 0, drop on index 1.
    const dt = { effectAllowed: '', dropEffect: '', setData: () => {}, getData: () => '' }
    await items[0].trigger('dragstart', { dataTransfer: dt })
    await items[1].trigger('dragover', { dataTransfer: dt })
    await items[1].trigger('drop', { dataTransfer: dt })
    const order = tabStore.tabsFor('ws-kyoto').map((t) => t.name)
    expect(order).toEqual(['logs', 'investigation'])
  })
})
