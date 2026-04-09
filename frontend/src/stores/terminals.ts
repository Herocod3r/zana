// frontend/src/stores/terminals.ts
import { defineStore } from 'pinia'
import type { Terminal, SplitNode, SplitDirection, ActivityState } from '@/types/models'
import { terminals as fixtureTerminals, splitTreesByTab } from '@/mocks/fixtures'

interface State {
  terminalsById: Record<string, Terminal>
  treesByTab: Record<string, SplitNode>
  focusedLeafByTab: Record<string, string>
}

// Per-namespace counters. Keeping them independent avoids cross-prefix
// coupling where one call site's ++ affects another's read.
let leafSeq = 0
let branchSeq = 0
let termSeq = 0
const newLeafId = () => `lf-${++leafSeq + 1000}`
const newBranchId = () => `sp-${++branchSeq + 1000}`
const newTerminalId = () => `t-${++termSeq + 1000}`

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
      // Find the existing leaf's terminalId. If it doesn't exist in this
      // tree, bail — the caller passed a stale reference.
      let existingTerminalId: string | null = null
      walk(tree, (leaf) => {
        if (leaf.id === leafId) existingTerminalId = leaf.terminalId
      })
      if (existingTerminalId === null) return
      // Inherit cwd from the source pane's terminal so the split opens in
      // the same directory the user was in. Falls back to root if the
      // source terminal is missing (should not happen in practice).
      const sourceTerm = this.terminalsById[existingTerminalId]
      const newTermId = newTerminalId()
      this.terminalsById[newTermId] = {
        id: newTermId,
        tabId,
        cwd: sourceTerm?.cwd ?? '/',
        command: 'zsh',
        scrollback: ['$ _'],
        lastOutputAt: Date.now(),
      }
      const originalLeaf: SplitNode = { kind: 'leaf', id: leafId, terminalId: existingTerminalId }
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
