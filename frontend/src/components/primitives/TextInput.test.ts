import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInput from './TextInput.vue'

describe('TextInput', () => {
  it('v-models on input events', async () => {
    const w = mount(TextInput, { props: { modelValue: '', label: 'Name' } })
    await w.find('input').setValue('hello')
    expect(w.emitted('update:modelValue')).toEqual([['hello']])
  })
  it('shows inline error', () => {
    const w = mount(TextInput, { props: { modelValue: '', label: 'Name', error: 'bad' } })
    expect(w.text()).toContain('bad')
  })
})
