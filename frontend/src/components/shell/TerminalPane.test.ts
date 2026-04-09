import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TerminalPane from './TerminalPane.vue'

const term = {
  id: 't-1',
  tabId: 'tab-1',
  cwd: '/x',
  command: 'claude',
  scrollback: ['$ claude', '› working'],
  lastOutputAt: Date.now(),
}

describe('TerminalPane', () => {
  it('renders mock output lines', () => {
    const w = mount(TerminalPane, { props: { terminal: term, focused: false, tabId: 'tab-1', leafId: 'lf-1' } })
    expect(w.text()).toContain('working')
  })
  it('applies focus class', () => {
    const w = mount(TerminalPane, { props: { terminal: term, focused: true, tabId: 'tab-1', leafId: 'lf-1' } })
    expect(w.classes()).toContain('pane--focused')
  })
  it('emits split-right on right button click', async () => {
    const w = mount(TerminalPane, { props: { terminal: term, focused: true, tabId: 'tab-1', leafId: 'lf-1' } })
    await w.find('.split-right').trigger('click')
    expect(w.emitted('split-right')).toHaveLength(1)
  })
})
