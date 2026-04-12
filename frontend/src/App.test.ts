import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import App from './App.vue'

describe('App', () => {
  it('renders the app shell', () => {
    const wrapper = mount(App, {
      global: { plugins: [createTestingPinia()] },
    })
    expect(wrapper.find('.app').exists()).toBe(true)
  })
})
