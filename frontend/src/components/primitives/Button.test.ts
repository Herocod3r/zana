import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  it('renders its default slot and emits click', async () => {
    const w = mount(Button, { slots: { default: 'Go' } })
    expect(w.text()).toBe('Go')
    await w.trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const w = mount(Button, { props: { disabled: true }, slots: { default: 'x' } })
    await w.trigger('click')
    expect(w.emitted('click')).toBeUndefined()
  })
})
