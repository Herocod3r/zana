import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidebar from './Sidebar.vue'

describe('Sidebar', () => {
  it('exposes a drag region and a projects container', () => {
    const w = mount(Sidebar)
    expect(w.find('.drag-region').exists()).toBe(true)
    expect(w.find('.projects-area').exists()).toBe(true)
  })
})
