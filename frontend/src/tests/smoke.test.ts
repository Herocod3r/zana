import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App smoke', () => {
  it('mounts the placeholder shell', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Zana')
  })
})
