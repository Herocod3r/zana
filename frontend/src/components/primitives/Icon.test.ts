import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from './Icon.vue'

describe('Icon', () => {
  it('renders the given phosphor icon', () => {
    const w = mount(Icon, { props: { name: 'plus', size: 16 } })
    const svg = w.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('width')).toBe('16')
  })
})
