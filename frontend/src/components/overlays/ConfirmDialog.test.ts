import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './ConfirmDialog.vue'

function ensurePortal() {
  if (!document.getElementById('modal-portal')) {
    const el = document.createElement('div')
    el.id = 'modal-portal'
    document.body.appendChild(el)
  }
}

describe('ConfirmDialog', () => {
  it('emits confirm on primary click', async () => {
    ensurePortal()
    const w = mount(ConfirmDialog, {
      props: { open: true, title: 'T', body: 'B', confirmLabel: 'Yes' },
      attachTo: document.body,
    })
    const yes = document.querySelector('button.btn--primary') as HTMLButtonElement
    yes?.click()
    expect(w.emitted('confirm')).toHaveLength(1)
    w.unmount()
  })
})
