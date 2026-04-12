import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NewWorkspaceDialog from './NewWorkspaceDialog.vue'

function ensurePortal() {
  if (!document.getElementById('modal-portal')) {
    const el = document.createElement('div')
    el.id = 'modal-portal'
    document.body.appendChild(el)
  }
}

describe('NewWorkspaceDialog', () => {
  it('emits submit payload', async () => {
    ensurePortal()
    const w = mount(NewWorkspaceDialog, {
      props: { open: true, projectId: 'proj-1', baseBranches: ['main'] },
      attachTo: document.body,
    })
    const [name, branch] = Array.from(document.querySelectorAll('input'))
    ;(name as HTMLInputElement).value = 'madrid'
    name.dispatchEvent(new Event('input'))
    ;(branch as HTMLInputElement).value = 'feature/x'
    branch.dispatchEvent(new Event('input'))
    const create = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Create'))
    create?.click()
    expect(w.emitted('submit')).toBeTruthy()
    w.unmount()
  })
})
