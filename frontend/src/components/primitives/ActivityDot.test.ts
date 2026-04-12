import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ActivityDot from './ActivityDot.vue'

describe('ActivityDot', () => {
  it.each(['active', 'recent', 'idle'] as const)('renders state %s', (state) => {
    const w = mount(ActivityDot, { props: { state } })
    expect(w.classes()).toContain(`dot--${state}`)
  })
})
