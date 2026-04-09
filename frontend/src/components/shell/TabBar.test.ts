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
})
