import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from './Select.vue'

describe('Select', () => {
  it('emits update on change', async () => {
    const w = mount(Select, {
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
      },
    })
    await w.find('select').setValue('b')
    expect(w.emitted('update:modelValue')).toEqual([['b']])
  })
})
