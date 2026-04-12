import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SettingsModal from './SettingsModal.vue'
import { useThemeStore } from '@/stores/theme'

function ensurePortal() {
  if (!document.getElementById('modal-portal')) {
    const el = document.createElement('div')
    el.id = 'modal-portal'
    document.body.appendChild(el)
  }
}

describe('SettingsModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useThemeStore().preference = 'system'
  })

  it('shows theme options', () => {
    ensurePortal()
    const w = mount(SettingsModal, {
      props: { open: true },
      attachTo: document.body,
    })
    expect(document.body.textContent).toContain('Appearance')
    expect(document.body.textContent).toContain('System')
    w.unmount()
  })
})
