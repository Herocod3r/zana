import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Checkbox from './Checkbox.vue'

describe('Checkbox', () => {
  it('toggles on click', async () => {
    const w = mount(Checkbox, { props: { modelValue: false, label: 'Opt' } })
    await w.find('button').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([[true]])
  })

  it('does not emit when disabled', async () => {
    const w = mount(Checkbox, { props: { modelValue: false, label: 'Opt', disabled: true } })
    await w.find('button').trigger('click')
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })
})
