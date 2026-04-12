import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Tooltip from './Tooltip.vue'

describe('Tooltip', () => {
  it('reveals tooltip after hover delay', async () => {
    vi.useFakeTimers()
    const w = mount(Tooltip, {
      props: { text: 'Help' },
      slots: { default: '<button>hover me</button>' },
    })
    await w.find('.tip-trigger').trigger('mouseenter')
    vi.advanceTimersByTime(250)
    await w.vm.$nextTick()
    expect(w.text()).toContain('Help')
    vi.useRealTimers()
  })
})
