# Phase 4 — Fixtures & Stores

**Goal:** Mock fixture data and all Pinia stores (`projects`, `workspaces`, `tabs`, `terminals`, `toasts`) with shapes matching the future Wails surface. A mock `services/api.ts` wrapper that stores call into.

**Prerequisites:** Phase 1 types + theme store.

---

### Task 4.1: Fixtures

**Files:**
- Create: `frontend/src/mocks/fixtures.ts`

- [ ] **Step 1: Create fixtures**

```ts
// frontend/src/mocks/fixtures.ts
import type { Project, Workspace, Tab, Terminal, SplitNode } from '@/types/models'

const now = Date.now()
const ago = (sec: number) => now - sec * 1000

export const projects: Project[] = [
  { id: 'proj-zana', name: 'zana', path: '/Users/dev/src/zana' },
  { id: 'proj-finplat', name: 'finplat', path: '/Users/dev/src/finplat' },
  { id: 'proj-gstack', name: 'gstack', path: '/Users/dev/src/gstack' },
]

export const workspaces: Workspace[] = [
  { id: 'ws-tokyo', projectId: 'proj-zana', name: 'tokyo', branch: 'feature/sidebar', worktreePath: '/Users/dev/.worktrees/tokyo' },
  { id: 'ws-osaka', projectId: 'proj-zana', name: 'osaka', branch: 'feature/auth-rewrite', worktreePath: '/Users/dev/.worktrees/osaka' },
  { id: 'ws-kyoto', projectId: 'proj-zana', name: 'kyoto', branch: 'fix/race-condition', worktreePath: '/Users/dev/.worktrees/kyoto' },
  { id: 'ws-madrid', projectId: 'proj-finplat', name: 'madrid', branch: 'feature/invoices', worktreePath: '/Users/dev/.worktrees/madrid' },
  { id: 'ws-lisbon', projectId: 'proj-finplat', name: 'lisbon', branch: 'main', worktreePath: '/Users/dev/.worktrees/lisbon' },
  { id: 'ws-berlin', projectId: 'proj-gstack', name: 'berlin', branch: 'feature/browse', worktreePath: '/Users/dev/.worktrees/berlin' },
]

export const terminals: Terminal[] = [
  {
    id: 't-osaka-claude',
    tabId: 'tab-osaka-default',
    cwd: '/Users/dev/.worktrees/osaka',
    command: 'claude',
    mockOutput: [
      '$ claude',
      'Welcome to Claude Code',
      '› Analyzing internal/api/api.go',
      '› Refactoring auth middleware',
      '$ _',
    ],
    lastOutputAt: ago(2),
  },
  {
    id: 't-osaka-codex',
    tabId: 'tab-osaka-default',
    cwd: '/Users/dev/.worktrees/osaka',
    command: 'codex --continue',
    mockOutput: [
      '$ codex --continue',
      '› Reading project context',
      '› Writing tests for middleware',
      '$ _',
    ],
    lastOutputAt: ago(10),
  },
  {
    id: 't-tokyo-claude',
    tabId: 'tab-tokyo-default',
    cwd: '/Users/dev/.worktrees/tokyo',
    command: 'claude',
    mockOutput: ['$ claude', 'Waiting for input', '$ _'],
    lastOutputAt: ago(120),
  },
  {
    id: 't-kyoto-claude',
    tabId: 'tab-kyoto-default',
    cwd: '/Users/dev/.worktrees/kyoto',
    command: 'claude',
    mockOutput: ['$ claude', '› Investigating race', '$ _'],
    lastOutputAt: ago(30),
  },
  {
    id: 't-kyoto-logs',
    tabId: 'tab-kyoto-logs',
    cwd: '/Users/dev/.worktrees/kyoto',
    command: 'tail -f logs/app.log',
    mockOutput: ['$ tail -f logs/app.log', '[info] startup complete', '[warn] slow query 1200ms'],
    lastOutputAt: ago(5),
  },
]

const leaf = (id: string, terminalId: string): SplitNode => ({ kind: 'leaf', id, terminalId })
const branch = (id: string, direction: 'row' | 'column', a: SplitNode, b: SplitNode): SplitNode => ({
  kind: 'branch',
  id,
  direction,
  ratio: 0.5,
  a,
  b,
})

export const splitTreesByTab: Record<string, SplitNode> = {
  'tab-osaka-default': branch('sp-osaka-root', 'row', leaf('lf-osaka-1', 't-osaka-claude'), leaf('lf-osaka-2', 't-osaka-codex')),
  'tab-tokyo-default': leaf('lf-tokyo-1', 't-tokyo-claude'),
  'tab-kyoto-default': leaf('lf-kyoto-1', 't-kyoto-claude'),
  'tab-kyoto-logs': leaf('lf-kyoto-2', 't-kyoto-logs'),
  'tab-madrid-default': leaf('lf-madrid-empty', 'missing'), // empty state demo
  'tab-lisbon-default': leaf('lf-lisbon-empty', 'missing'),
  'tab-berlin-default': leaf('lf-berlin-empty', 'missing'),
}

export const tabs: Tab[] = [
  { id: 'tab-osaka-default', workspaceId: 'ws-osaka', name: 'main', rootSplitId: 'sp-osaka-root' },
  { id: 'tab-tokyo-default', workspaceId: 'ws-tokyo', name: 'main', rootSplitId: 'lf-tokyo-1' },
  { id: 'tab-kyoto-default', workspaceId: 'ws-kyoto', name: 'investigation', rootSplitId: 'lf-kyoto-1' },
  { id: 'tab-kyoto-logs', workspaceId: 'ws-kyoto', name: 'logs', rootSplitId: 'lf-kyoto-2' },
  { id: 'tab-madrid-default', workspaceId: 'ws-madrid', name: 'main', rootSplitId: 'lf-madrid-empty' },
  { id: 'tab-lisbon-default', workspaceId: 'ws-lisbon', name: 'main', rootSplitId: 'lf-lisbon-empty' },
  { id: 'tab-berlin-default', workspaceId: 'ws-berlin', name: 'main', rootSplitId: 'lf-berlin-empty' },
]

export const initialActiveWorkspaceId = 'ws-osaka'
export const initialActiveTabByWorkspace: Record<string, string> = {
  'ws-tokyo': 'tab-tokyo-default',
  'ws-osaka': 'tab-osaka-default',
  'ws-kyoto': 'tab-kyoto-default',
  'ws-madrid': 'tab-madrid-default',
  'ws-lisbon': 'tab-lisbon-default',
  'ws-berlin': 'tab-berlin-default',
}
```

- [ ] **Step 2: Typecheck**

`pnpm run typecheck` — expect clean.

- [ ] **Step 3: Commit** — `git commit -m "feat(mocks): fixture data for projects, workspaces, tabs, terminals, splits"`

---

### Task 4.2: `projectStore`

**Files:**
- Create: `frontend/src/stores/projects.ts`
- Create: `frontend/src/stores/projects.test.ts`

- [ ] **Step 1: Test**

```ts
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
```

- [ ] **Step 2: Implement**

```ts
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
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(stores): projectStore with collapse state"`

---

### Task 4.3: `workspaceStore`

**Files:**
- Create: `frontend/src/stores/workspaces.ts`
- Create: `frontend/src/stores/workspaces.test.ts`

- [ ] **Step 1: Test**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWorkspaceStore } from './workspaces'

describe('workspaceStore', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('loads fixture workspaces and a default active one', () => {
    const s = useWorkspaceStore()
    s.load()
    expect(s.workspaces.length).toBeGreaterThan(0)
    expect(s.activeWorkspaceId).not.toBeNull()
  })
  it('groups by project', () => {
    const s = useWorkspaceStore()
    s.load()
    const group = s.byProject('proj-zana')
    expect(group.length).toBeGreaterThanOrEqual(1)
  })
  it('select updates active', () => {
    const s = useWorkspaceStore()
    s.load()
    s.select('ws-tokyo')
    expect(s.activeWorkspaceId).toBe('ws-tokyo')
  })
})
```

- [ ] **Step 2: Implement**

```ts
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
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(stores): workspaceStore with active workspace"`

---

### Task 4.4: `tabStore`

**Files:**
- Create: `frontend/src/stores/tabs.ts`
- Create: `frontend/src/stores/tabs.test.ts`

- [ ] **Step 1: Test**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTabStore } from './tabs'

describe('tabStore', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('loads fixture tabs and exposes active per workspace', () => {
    const s = useTabStore()
    s.load()
    expect(s.tabsFor('ws-osaka').length).toBe(1)
    expect(s.activeTabId('ws-osaka')).toBe('tab-osaka-default')
  })
  it('newTab adds and activates', () => {
    const s = useTabStore()
    s.load()
    const t = s.newTab('ws-osaka')
    expect(s.tabsFor('ws-osaka').find((x) => x.id === t.id)).toBeTruthy()
    expect(s.activeTabId('ws-osaka')).toBe(t.id)
  })
  it('closeTab replaces last tab with a fresh empty one', () => {
    const s = useTabStore()
    s.load()
    const current = s.activeTabId('ws-tokyo')!
    s.closeTab('ws-tokyo', current)
    const tabs = s.tabsFor('ws-tokyo')
    expect(tabs.length).toBe(1)
    expect(tabs[0].id).not.toBe(current)
  })
  it('renameTab updates name', () => {
    const s = useTabStore()
    s.load()
    s.renameTab('tab-osaka-default', 'renamed')
    const tabs = s.tabsFor('ws-osaka')
    expect(tabs[0].name).toBe('renamed')
  })
})
```

- [ ] **Step 2: Implement**

```ts
// frontend/src/stores/tabs.ts
import { defineStore } from 'pinia'
import type { Tab } from '@/types/models'
import { tabs as fixtureTabs, initialActiveTabByWorkspace } from '@/mocks/fixtures'

interface State {
  tabs: Tab[]
  activeByWorkspace: Record<string, string>
}

let counter = 100
const newId = () => `tab-new-${++counter}`
const newSplitId = () => `lf-new-${counter}`

export const useTabStore = defineStore('tabs', {
  state: (): State => ({ tabs: [], activeByWorkspace: {} }),
  actions: {
    load() {
      this.tabs = [...fixtureTabs]
      this.activeByWorkspace = { ...initialActiveTabByWorkspace }
    },
    tabsFor(workspaceId: string): Tab[] {
      return this.tabs.filter((t) => t.workspaceId === workspaceId)
    },
    activeTabId(workspaceId: string): string | null {
      return this.activeByWorkspace[workspaceId] ?? null
    },
    activeTab(workspaceId: string): Tab | null {
      const id = this.activeTabId(workspaceId)
      if (!id) return null
      return this.tabs.find((t) => t.id === id) ?? null
    },
    setActive(workspaceId: string, tabId: string) {
      this.activeByWorkspace[workspaceId] = tabId
    },
    newTab(workspaceId: string): Tab {
      const t: Tab = {
        id: newId(),
        workspaceId,
        name: `term-${this.tabsFor(workspaceId).length + 1}`,
        rootSplitId: newSplitId(),
      }
      this.tabs.push(t)
      this.activeByWorkspace[workspaceId] = t.id
      return t
    },
    closeTab(workspaceId: string, tabId: string) {
      const remaining = this.tabs.filter((t) => !(t.workspaceId === workspaceId && t.id === tabId))
      this.tabs = remaining
      if (this.tabsFor(workspaceId).length === 0) {
        // Invariant: every workspace always has at least one tab.
        this.newTab(workspaceId)
      } else if (this.activeByWorkspace[workspaceId] === tabId) {
        this.activeByWorkspace[workspaceId] = this.tabsFor(workspaceId)[0].id
      }
    },
    renameTab(tabId: string, name: string) {
      const t = this.tabs.find((x) => x.id === tabId)
      if (t) t.name = name
    },
    reorderTabs(workspaceId: string, orderedIds: string[]) {
      const inSet = new Set(orderedIds)
      const others = this.tabs.filter((t) => t.workspaceId !== workspaceId || !inSet.has(t.id))
      const reordered = orderedIds
        .map((id) => this.tabs.find((t) => t.id === id))
        .filter((t): t is Tab => !!t)
      this.tabs = [...others, ...reordered]
    },
  },
})
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(stores): tabStore with per-workspace active tab and invariant"`

---

### Task 4.5: `terminalStore`

**Files:**
- Create: `frontend/src/stores/terminals.ts`
- Create: `frontend/src/stores/terminals.test.ts`

- [ ] **Step 1: Test**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTerminalStore } from './terminals'

describe('terminalStore', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('loads fixture split trees keyed by tab', () => {
    const s = useTerminalStore()
    s.load()
    const tree = s.treeFor('tab-osaka-default')
    expect(tree).toBeDefined()
    expect(tree!.kind).toBe('branch')
  })
  it('terminals are indexable by id', () => {
    const s = useTerminalStore()
    s.load()
    expect(s.terminal('t-osaka-claude')).toBeDefined()
  })
  it('splitPane returns a new tree with a branch in place of leaf', () => {
    const s = useTerminalStore()
    s.load()
    s.splitPane('tab-tokyo-default', 'lf-tokyo-1', 'row')
    const tree = s.treeFor('tab-tokyo-default')
    expect(tree!.kind).toBe('branch')
  })
  it('activity state rollup for a tab returns max', () => {
    const s = useTerminalStore()
    s.load()
    const state = s.rolledUpState('tab-osaka-default')
    expect(['active', 'recent', 'idle']).toContain(state)
  })
})
```

- [ ] **Step 2: Implement**

```ts
// frontend/src/stores/terminals.ts
import { defineStore } from 'pinia'
import type { Terminal, SplitNode, SplitDirection, ActivityState } from '@/types/models'
import { terminals as fixtureTerminals, splitTreesByTab } from '@/mocks/fixtures'

interface State {
  terminalsById: Record<string, Terminal>
  treesByTab: Record<string, SplitNode>
  focusedLeafByTab: Record<string, string>
}

let idSeq = 1000
const newLeafId = () => `lf-${++idSeq}`
const newBranchId = () => `sp-${idSeq}`
const newTerminalId = () => `t-${idSeq}`

function walk(node: SplitNode, fn: (leaf: SplitNode & { kind: 'leaf' }) => void) {
  if (node.kind === 'leaf') fn(node)
  else {
    walk(node.a, fn)
    walk(node.b, fn)
  }
}

function replaceLeaf(node: SplitNode, targetId: string, replacement: SplitNode): SplitNode {
  if (node.kind === 'leaf') return node.id === targetId ? replacement : node
  return { ...node, a: replaceLeaf(node.a, targetId, replacement), b: replaceLeaf(node.b, targetId, replacement) }
}

function removeLeaf(node: SplitNode, targetId: string): SplitNode | null {
  if (node.kind === 'leaf') return node.id === targetId ? null : node
  const a = removeLeaf(node.a, targetId)
  const b = removeLeaf(node.b, targetId)
  if (!a && !b) return null
  if (!a) return b!
  if (!b) return a!
  return { ...node, a, b }
}

function classify(lastMs: number): ActivityState {
  const delta = Date.now() - lastMs
  if (delta < 5000) return 'active'
  if (delta < 60000) return 'recent'
  return 'idle'
}

function maxState(a: ActivityState, b: ActivityState): ActivityState {
  const order: Record<ActivityState, number> = { idle: 0, recent: 1, active: 2 }
  return order[a] >= order[b] ? a : b
}

export const useTerminalStore = defineStore('terminals', {
  state: (): State => ({
    terminalsById: {},
    treesByTab: {},
    focusedLeafByTab: {},
  }),
  actions: {
    load() {
      this.terminalsById = Object.fromEntries(fixtureTerminals.map((t) => [t.id, t]))
      this.treesByTab = { ...splitTreesByTab }
      // Default focus = first leaf of each tree.
      for (const [tabId, tree] of Object.entries(this.treesByTab)) {
        let first: string | null = null
        walk(tree, (leaf) => {
          if (!first) first = leaf.id
        })
        if (first) this.focusedLeafByTab[tabId] = first
      }
    },
    treeFor(tabId: string): SplitNode | undefined {
      return this.treesByTab[tabId]
    },
    terminal(id: string): Terminal | undefined {
      return this.terminalsById[id]
    },
    setTreeFor(tabId: string, tree: SplitNode) {
      this.treesByTab[tabId] = tree
    },
    setFocus(tabId: string, leafId: string) {
      this.focusedLeafByTab[tabId] = leafId
    },
    focusedLeaf(tabId: string): string | null {
      return this.focusedLeafByTab[tabId] ?? null
    },
    splitPane(tabId: string, leafId: string, direction: SplitDirection) {
      const tree = this.treesByTab[tabId]
      if (!tree) return
      const newTermId = newTerminalId()
      this.terminalsById[newTermId] = {
        id: newTermId,
        tabId,
        cwd: '/Users/dev/.worktrees/new',
        command: 'zsh',
        mockOutput: ['$ _'],
        lastOutputAt: Date.now(),
      }
      const originalLeaf: SplitNode = { kind: 'leaf', id: leafId, terminalId: tree.kind === 'leaf' ? tree.terminalId : '' }
      // Fetch the real terminalId from the existing leaf
      let existingTerminalId = ''
      walk(tree, (leaf) => {
        if (leaf.id === leafId) existingTerminalId = leaf.terminalId
      })
      originalLeaf.terminalId = existingTerminalId
      const newLeaf: SplitNode = { kind: 'leaf', id: newLeafId(), terminalId: newTermId }
      const replacement: SplitNode = {
        kind: 'branch',
        id: newBranchId(),
        direction,
        ratio: 0.5,
        a: originalLeaf,
        b: newLeaf,
      }
      this.treesByTab[tabId] = replaceLeaf(tree, leafId, replacement)
      this.focusedLeafByTab[tabId] = newLeaf.id
    },
    closeLeaf(tabId: string, leafId: string) {
      const tree = this.treesByTab[tabId]
      if (!tree) return
      const next = removeLeaf(tree, leafId)
      if (!next) {
        delete this.treesByTab[tabId]
        delete this.focusedLeafByTab[tabId]
      } else {
        this.treesByTab[tabId] = next
        // Refocus: pick first leaf
        let first: string | null = null
        walk(next, (leaf) => {
          if (!first) first = leaf.id
        })
        if (first) this.focusedLeafByTab[tabId] = first
      }
    },
    resizeSplit(tabId: string, branchId: string, ratio: number) {
      const tree = this.treesByTab[tabId]
      if (!tree) return
      const clamped = Math.max(0.1, Math.min(0.9, ratio))
      const update = (n: SplitNode): SplitNode => {
        if (n.kind === 'leaf') return n
        if (n.id === branchId) return { ...n, ratio: clamped }
        return { ...n, a: update(n.a), b: update(n.b) }
      }
      this.treesByTab[tabId] = update(tree)
    },
    rolledUpState(tabId: string): ActivityState {
      const tree = this.treesByTab[tabId]
      if (!tree) return 'idle'
      let state: ActivityState = 'idle'
      walk(tree, (leaf) => {
        const term = this.terminalsById[leaf.terminalId]
        if (term) state = maxState(state, classify(term.lastOutputAt))
      })
      return state
    },
  },
})
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(stores): terminalStore with recursive split tree helpers"`

---

### Task 4.6: `toastStore`

**Files:**
- Create: `frontend/src/stores/toasts.ts`
- Create: `frontend/src/stores/toasts.test.ts`

- [ ] **Step 1: Test**

```ts
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
  it('caps stack at 3', () => {
    const s = useToastStore()
    s.show({ message: 'a', variant: 'info' })
    s.show({ message: 'b', variant: 'info' })
    s.show({ message: 'c', variant: 'info' })
    s.show({ message: 'd', variant: 'info' })
    expect(s.toasts.length).toBe(3)
  })
})
```

- [ ] **Step 2: Implement**

```ts
// frontend/src/stores/toasts.ts
import { defineStore } from 'pinia'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'
export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface State {
  toasts: Toast[]
}

let seq = 0
const newId = () => `toast-${++seq}`

export const useToastStore = defineStore('toasts', {
  state: (): State => ({ toasts: [] }),
  actions: {
    show(t: Omit<Toast, 'id'>): string {
      const id = newId()
      this.toasts.push({ ...t, id })
      if (this.toasts.length > 3) this.toasts.shift()
      return id
    },
    dismiss(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
    clear() {
      this.toasts = []
    },
  },
})
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(stores): toastStore with stack cap"`

---

### Task 4.7: Mock `services/api.ts`

**Files:**
- Create: `frontend/src/services/api.ts`

- [ ] **Step 1: Implement**

```ts
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
```

- [ ] **Step 2: Typecheck + commit** — `git commit -m "feat(services): mock api wrapper matching future Wails surface"`

---

### Task 4.8: Boot stores in `main.ts`

**Files:** `frontend/src/main.ts`

- [ ] **Step 1: Update**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useThemeStore } from './stores/theme'
import { useProjectStore } from './stores/projects'
import { useWorkspaceStore } from './stores/workspaces'
import { useTabStore } from './stores/tabs'
import { useTerminalStore } from './stores/terminals'

import './styles/tokens.css'
import './styles/fonts.css'
import './styles/reset.css'
import './styles/globals.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

useThemeStore(pinia).init()
useProjectStore(pinia).load()
useWorkspaceStore(pinia).load()
useTabStore(pinia).load()
useTerminalStore(pinia).load()

app.mount('#app')
```

- [ ] **Step 2: Run tests + commit** — `git commit -m "feat(frontend): boot all mock stores"`

---

### Phase 4 done when

- Every store test passes.
- Boot does not throw console errors.
- `api.ts` compiles and its signatures line up with the future Wails surface.
