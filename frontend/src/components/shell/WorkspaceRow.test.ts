import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceRow from './WorkspaceRow.vue'

const w = { id: 'ws-1', projectId: 'p-1', name: 'tokyo', branch: 'main', worktreePath: '/tmp' }

describe('WorkspaceRow', () => {
  it('shows name', () => {
    const comp = mount(WorkspaceRow, { props: { workspace: w, active: false, state: 'idle' } })
    expect(comp.text()).toContain('tokyo')
  })
  it('applies active modifier', () => {
    const comp = mount(WorkspaceRow, { props: { workspace: w, active: true, state: 'active' } })
    expect(comp.classes()).toContain('row--active')
  })
  it('emits select on click', async () => {
    const comp = mount(WorkspaceRow, { props: { workspace: w, active: false, state: 'idle' } })
    await comp.trigger('click')
    expect(comp.emitted('select')).toHaveLength(1)
  })
})
