import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProjectTree from './ProjectTree.vue'
import { useProjectStore } from '@/stores/projects'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'

describe('ProjectTree', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders projects and workspaces', () => {
    useProjectStore().load()
    useWorkspaceStore().load()
    useTabStore().load()
    useTerminalStore().load()
    const w = mount(ProjectTree)
    expect(w.text()).toContain('zana')
    expect(w.text()).toContain('osaka')
  })

  it('shows empty state when no projects', () => {
    const ps = useProjectStore()
    ps.projects = []
    const w = mount(ProjectTree)
    expect(w.text()).toContain('No projects yet')
  })
})
