import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import StatusBar from './StatusBar.vue'

describe('StatusBar', () => {
  it('renders Ready when no workspace', () => {
    const w = mount(StatusBar, { global: { plugins: [createTestingPinia({ createSpy: () => () => {} })] } })
    expect(w.text()).toContain('Ready')
  })
})
