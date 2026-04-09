// frontend/src/services/api.ts
//
// Thin mock wrapper. In a later phase this will be replaced by real Wails
// bindings. Every method here must match the signatures in
// docs/architecture.md §"Wails API surface" so the flip is a single-file
// change.

import { useProjectStore } from '@/stores/projects'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'
import type { Project, Workspace, Tab, Terminal, SplitDirection } from '@/types/models'

export const api = {
  // Projects
  listProjects(): Project[] {
    return useProjectStore().projects
  },
  addProject(path: string): Project {
    const name = path.split('/').filter(Boolean).pop() ?? 'project'
    const p: Project = { id: `proj-${Math.random().toString(36).slice(2, 8)}`, name, path }
    useProjectStore().projects.push(p)
    return p
  },
  removeProject(id: string) {
    useProjectStore().removeProject(id)
  },

  // Workspaces
  listWorkspaces(projectId: string): Workspace[] {
    return useWorkspaceStore().byProject(projectId)
  },
  createWorkspace(projectId: string, name: string, branch: string): Workspace {
    const ws = useWorkspaceStore().createWorkspace(projectId, name, branch)
    // Auto-create default tab
    useTabStore().newTab(ws.id)
    return ws
  },
  deleteWorkspace(id: string) {
    useWorkspaceStore().deleteWorkspace(id)
  },

  // Tabs
  listTabs(workspaceId: string): Tab[] {
    return useTabStore().tabsFor(workspaceId)
  },
  newTab(workspaceId: string): Tab {
    return useTabStore().newTab(workspaceId)
  },
  closeTab(workspaceId: string, tabId: string) {
    useTabStore().closeTab(workspaceId, tabId)
  },
  renameTab(tabId: string, name: string) {
    useTabStore().renameTab(tabId, name)
  },

  // Terminals / splits
  splitPane(tabId: string, leafId: string, direction: SplitDirection) {
    useTerminalStore().splitPane(tabId, leafId, direction)
  },
  closePane(tabId: string, leafId: string) {
    useTerminalStore().closeLeaf(tabId, leafId)
  },
  getTerminal(id: string): Terminal | undefined {
    return useTerminalStore().terminal(id)
  },
}
