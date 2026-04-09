export type ID = string

export type ActivityState = 'active' | 'recent' | 'idle'

export interface Project {
  id: ID
  name: string
  path: string
}

export interface Workspace {
  id: ID
  projectId: ID
  name: string
  branch: string
  worktreePath: string
}

export interface Tab {
  id: ID
  workspaceId: ID
  name: string
  rootSplitId: ID
}

export interface Terminal {
  id: ID
  tabId: ID
  cwd: string
  command: string
  mockOutput: string[]
  lastOutputAt: number // epoch ms
}

export type SplitDirection = 'row' | 'column'

export type SplitNode = SplitLeaf | SplitBranch

export interface SplitLeaf {
  kind: 'leaf'
  id: ID
  terminalId: ID
}

export interface SplitBranch {
  kind: 'branch'
  id: ID
  direction: SplitDirection
  /** Fraction of total size consumed by `a`, in [0.1, 0.9]. */
  ratio: number
  a: SplitNode
  b: SplitNode
}
