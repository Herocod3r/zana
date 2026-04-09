import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TabItem from './TabItem.vue'

const t = { id: 't-1', workspaceId: 'w', name: 'main', rootSplitId: 'lf' }

describe('TabItem', () => {
  it('renders name and emits select', async () => {
    const w = mount(TabItem, { props: { tab: t, active: false, state: 'idle' } })
    expect(w.text()).toContain('main')
    await w.find('.tab').trigger('click')
    expect(w.emitted('select')).toHaveLength(1)
  })
  it('enters rename mode on double click', async () => {
    const w = mount(TabItem, { props: { tab: t, active: true, state: 'idle' } })
    await w.find('.label').trigger('dblclick')
    expect(w.find('input').exists()).toBe(true)
  })
})
