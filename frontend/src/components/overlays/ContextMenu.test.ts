import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ContextMenu from './ContextMenu.vue'

function ensurePortal() {
  if (!document.getElementById('modal-portal')) {
    const el = document.createElement('div')
    el.id = 'modal-portal'
    document.body.appendChild(el)
  }
}

const items = [
  { id: 'a', label: 'Alpha', shortcut: '⌘A' },
  { id: 'b', label: 'Beta' },
]

describe('ContextMenu', () => {
  it('emits select when an item is clicked', async () => {
    ensurePortal()
    const w = mount(ContextMenu, {
      props: { open: true, x: 20, y: 20, items },
      attachTo: document.body,
    })
    const buttons = document.querySelectorAll('.ctx .item')
    ;(buttons[0] as HTMLElement).click()
    expect(w.emitted('select')?.[0]).toEqual(['a'])
    w.unmount()
  })
})
