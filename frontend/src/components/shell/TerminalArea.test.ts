import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TerminalArea from './TerminalArea.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'

function boot() {
  setActivePinia(createPinia())
  useWorkspaceStore().load()
  useTabStore().load()
  useTerminalStore().load()
}

describe('TerminalArea', () => {
  beforeEach(() => {
    boot()
  })

  it('shows State A when nothing selected', () => {
    useWorkspaceStore().activeWorkspaceId = null
    const w = mount(TerminalArea)
    expect(w.text()).toContain('Select a workspace')
  })
  it('shows State B when split tree is empty for the tab', () => {
    useWorkspaceStore().select('ws-madrid')
    const w = mount(TerminalArea)
    expect(w.text()).toContain('New terminal')
  })
  it('shows State C when split tree has a real leaf', () => {
    useWorkspaceStore().select('ws-osaka')
    const w = mount(TerminalArea, {
      slots: { splits: '<div class="mock-splits">$ hello</div>' },
    })
    expect(w.text()).toContain('$')
  })
})
