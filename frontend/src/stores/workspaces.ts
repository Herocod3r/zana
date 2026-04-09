// frontend/src/stores/workspaces.ts
import { defineStore } from 'pinia'
import type { Workspace } from '@/types/models'
import { workspaces as fixtureWorkspaces, initialActiveWorkspaceId } from '@/mocks/fixtures'

interface State {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
}

export const useWorkspaceStore = defineStore('workspaces', {
  state: (): State => ({ workspaces: [], activeWorkspaceId: null }),
  getters: {
    active(state): Workspace | null {
      return state.workspaces.find((w) => w.id === state.activeWorkspaceId) ?? null
    },
  },
  actions: {
    load() {
      this.workspaces = [...fixtureWorkspaces]
      this.activeWorkspaceId = initialActiveWorkspaceId
    },
    byProject(projectId: string): Workspace[] {
      return this.workspaces.filter((w) => w.projectId === projectId)
    },
    select(id: string) {
      this.activeWorkspaceId = id
    },
    createWorkspace(projectId: string, name: string, branch: string): Workspace {
      const ws: Workspace = {
        id: `ws-${Math.random().toString(36).slice(2, 8)}`,
        projectId,
        name,
        branch,
        worktreePath: `/Users/dev/.worktrees/${name}`,
      }
      this.workspaces.push(ws)
      return ws
    },
    deleteWorkspace(id: string) {
      this.workspaces = this.workspaces.filter((w) => w.id !== id)
      if (this.activeWorkspaceId === id) this.activeWorkspaceId = null
    },
  },
})
