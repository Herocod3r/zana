import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RightRegion from './RightRegion.vue'

describe('RightRegion', () => {
  it('renders a slot container', () => {
    const w = mount(RightRegion, { slots: { tabbar: '<div class="tb-slot" />', area: '<div class="area-slot" />' } })
    expect(w.find('.tb-slot').exists()).toBe(true)
    expect(w.find('.area-slot').exists()).toBe(true)
  })
})
