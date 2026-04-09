import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from './Modal.vue'

function ensurePortal() {
  if (!document.getElementById('modal-portal')) {
    const el = document.createElement('div')
    el.id = 'modal-portal'
    document.body.appendChild(el)
  }
}

describe('Modal', () => {
  it('renders when open', () => {
    ensurePortal()
    const w = mount(Modal, {
      props: { open: true, width: 400 },
      slots: { default: '<p>hi</p>' },
      attachTo: document.body,
    })
    expect(document.body.textContent).toContain('hi')
    w.unmount()
  })

  it('emits close on escape', async () => {
    ensurePortal()
    const w = mount(Modal, {
      props: { open: true },
      slots: { default: 'x' },
      attachTo: document.body,
    })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(w.emitted('close')).toBeTruthy()
    w.unmount()
  })
})
