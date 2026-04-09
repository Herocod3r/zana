import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TerminalSplits from './TerminalSplits.vue'
import { useTerminalStore } from '@/stores/terminals'

describe('TerminalSplits', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useTerminalStore().load()
  })

  it('renders leaves and branches', () => {
    const terms = useTerminalStore()
    const w = mount(TerminalSplits, {
      props: { node: terms.treeFor('tab-osaka-default')!, tabId: 'tab-osaka-default' },
    })
    expect(w.text()).toContain('claude')
    expect(w.text()).toContain('codex')
  })
})
