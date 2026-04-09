import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectStore } from './projects'

describe('projectStore', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('loads fixture projects', () => {
    const s = useProjectStore()
    s.load()
    expect(s.projects.length).toBeGreaterThanOrEqual(3)
  })
  it('toggles expand', () => {
    const s = useProjectStore()
    s.load()
    const id = s.projects[0].id
    expect(s.isExpanded(id)).toBe(true) // default expanded
    s.toggleExpand(id)
    expect(s.isExpanded(id)).toBe(false)
  })
})
