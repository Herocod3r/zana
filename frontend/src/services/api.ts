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
  createWorkspace(
    projectId: string,
    name: string,
    branch: string,
    _opts?: { baseBranch?: string; createNewBranch?: boolean },
  ): Workspace {
    // `_opts` is captured so the mock surface matches the real Wails API
    // (baseBranch + createNewBranch → git worktree add options). In mock
    // mode we don't actually run git, so the options are recorded for
    // future backend wiring and otherwise ignored.
    const ws = useWorkspaceStore().createWorkspace(projectId, name, branch)
    // Auto-create default tab
    const tab = useTabStore().newTab(ws.id)
    // Seed the tab's split tree with an initial terminal so the user
    // lands directly in a shell instead of the empty-state button.
    const terminals = useTerminalStore()
    const termId = `t-new-${Math.random().toString(36).slice(2, 8)}`
    terminals.terminalsById[termId] = {
      id: termId,
      tabId: tab.id,
      cwd: ws.worktreePath,
      command: 'zsh',
      scrollback: ['$ _'],
      lastOutputAt: Date.now(),
    }
    terminals.setTreeFor(tab.id, {
      kind: 'leaf',
      id: `lf-new-${Math.random().toString(36).slice(2, 8)}`,
      terminalId: termId,
    })
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
