import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Toggle from './Toggle.vue'

describe('Toggle', () => {
  it('emits update on click', async () => {
    const w = mount(Toggle, { props: { modelValue: false } })
    await w.find('button').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([[true]])
  })
})
