import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ToastHost from './ToastHost.vue'
import { useToastStore } from '@/stores/toasts'

describe('ToastHost', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders toasts from the store', () => {
    useToastStore().show({ message: 'hello', variant: 'info' })
    const w = mount(ToastHost)
    expect(w.text()).toContain('hello')
  })
})
