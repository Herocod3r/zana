import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App', () => {
  it('renders the Zana title', () => {
    const wrapper = mount(App)
    expect(wrapper.get('[data-testid="app-title"]').text()).toBe('Zana')
  })
})
