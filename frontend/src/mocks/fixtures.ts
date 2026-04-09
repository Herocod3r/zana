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
    scrollback: [
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
    scrollback: [
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
    scrollback: ['$ claude', 'Waiting for input', '$ _'],
    lastOutputAt: ago(120),
  },
  {
    id: 't-kyoto-claude',
    tabId: 'tab-kyoto-default',
    cwd: '/Users/dev/.worktrees/kyoto',
    command: 'claude',
    scrollback: ['$ claude', '› Investigating race', '$ _'],
    lastOutputAt: ago(30),
  },
  {
    id: 't-kyoto-logs',
    tabId: 'tab-kyoto-logs',
    cwd: '/Users/dev/.worktrees/kyoto',
    command: 'tail -f logs/app.log',
    scrollback: ['$ tail -f logs/app.log', '[info] startup complete', '[warn] slow query 1200ms'],
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
