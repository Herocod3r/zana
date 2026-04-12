// frontend/src/stores/projects.ts
import { defineStore } from 'pinia'
import type { Project } from '@/types/models'
import { projects as fixtureProjects } from '@/mocks/fixtures'

interface State {
  projects: Project[]
  collapsed: Set<string>
}

export const useProjectStore = defineStore('projects', {
  state: (): State => ({
    projects: [],
    collapsed: new Set(),
  }),
  actions: {
    load() {
      this.projects = [...fixtureProjects]
    },
    toggleExpand(id: string) {
      if (this.collapsed.has(id)) this.collapsed.delete(id)
      else this.collapsed.add(id)
    },
    isExpanded(id: string): boolean {
      return !this.collapsed.has(id)
    },
    addProject(_path: string) {
      // Mock no-op; backend will replace.
    },
    removeProject(id: string) {
      this.projects = this.projects.filter((p) => p.id !== id)
    },
  },
})
