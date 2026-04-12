import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from './toasts'

describe('toastStore', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('shows and dismisses toasts', () => {
    const s = useToastStore()
    const id = s.show({ message: 'Hi', variant: 'info' })
    expect(s.toasts.length).toBe(1)
    s.dismiss(id)
    expect(s.toasts.length).toBe(0)
  })
  it('caps stack at 3 and evicts the oldest', () => {
    const s = useToastStore()
    s.show({ message: 'a', variant: 'info' })
    s.show({ message: 'b', variant: 'info' })
    s.show({ message: 'c', variant: 'info' })
    s.show({ message: 'd', variant: 'info' })
    expect(s.toasts.length).toBe(3)
    expect(s.toasts.map((t) => t.message)).toEqual(['b', 'c', 'd'])
  })
})
