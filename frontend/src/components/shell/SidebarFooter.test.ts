import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SidebarFooter from './SidebarFooter.vue'
import { useThemeStore } from '@/stores/theme'

describe('SidebarFooter', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('emits intents and cycles theme', async () => {
    const theme = useThemeStore()
    theme.preference = 'system'
    const w = mount(SidebarFooter)
    const buttons = w.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
    await buttons[2].trigger('click')
    expect(theme.preference).toBe('light')
  })
})
