import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import App from '@/App.vue'

describe('App smoke', () => {
  it('mounts the app shell', () => {
    const wrapper = mount(App, {
      global: { plugins: [createTestingPinia({ createSpy: () => () => {} })] },
    })
    expect(wrapper.text()).toContain('Ready')
  })
})
