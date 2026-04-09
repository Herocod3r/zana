import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AddProjectDialog from './AddProjectDialog.vue'

function ensurePortal() {
  if (!document.getElementById('modal-portal')) {
    const el = document.createElement('div')
    el.id = 'modal-portal'
    document.body.appendChild(el)
  }
}

describe('AddProjectDialog', () => {
  it('renders and emits submit', async () => {
    ensurePortal()
    const w = mount(AddProjectDialog, {
      props: { open: true },
      attachTo: document.body,
    })
    const input = document.querySelector('input') as HTMLInputElement
    input.value = '/tmp/my-repo'
    input.dispatchEvent(new Event('input'))
    const buttons = document.querySelectorAll('button')
    const submit = Array.from(buttons).find((b) => b.textContent?.includes('Add'))
    submit?.click()
    expect(w.emitted('submit')).toBeTruthy()
    w.unmount()
  })
})
