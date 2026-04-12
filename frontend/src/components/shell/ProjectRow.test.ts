import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectRow from './ProjectRow.vue'

const p = { id: 'p-1', name: 'zana', path: '/x' }

describe('ProjectRow', () => {
  it('emits toggle on click', async () => {
    const w = mount(ProjectRow, { props: { project: p, expanded: true } })
    await w.trigger('click')
    expect(w.emitted('toggle')).toHaveLength(1)
  })
  it('renders the expand twisty', () => {
    const w = mount(ProjectRow, { props: { project: p, expanded: false } })
    expect(w.text()).toContain('▸')
  })
})
