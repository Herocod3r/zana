<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import Button from '@/components/primitives/Button.vue'
import TerminalSplits from './TerminalSplits.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'
import type { SplitNode } from '@/types/models'

const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const terminals = useTerminalStore()

const active = computed(() => workspaces.active)
const activeTabId = computed(() => (active.value ? tabs.activeTabId(active.value.id) : null))
const tree = computed(() => (activeTabId.value ? terminals.treeFor(activeTabId.value) : undefined))

// "Empty" if the tree is undefined, or a single leaf whose terminalId is
// 'missing' (fixture signal — terminal not in the store).
const isEmpty = computed(() => {
  const t = tree.value
  if (!t) return true
  if (t.kind !== 'leaf') return false
  const term = terminals.terminal(t.terminalId)
  return !term
})

function spawnInEmpty() {
  if (!activeTabId.value) return
  const node = tree.value
  const id = `t-spawn-${Date.now()}`
  const leafId = `lf-spawn-${Date.now()}`
  terminals.terminalsById[id] = {
    id,
    tabId: activeTabId.value,
    cwd: active.value?.worktreePath ?? '/',
    command: 'zsh',
    scrollback: ['$ _'],
    lastOutputAt: Date.now(),
  }
  // If tree is undefined (fresh empty tab), install a brand-new leaf.
  if (!node) {
    const replacement: SplitNode = { kind: 'leaf', id: leafId, terminalId: id }
    terminals.setTreeFor(activeTabId.value, replacement)
    return
  }
  // Otherwise expect a placeholder leaf and replace its terminalId.
  if (node.kind !== 'leaf') return
  terminals.setTreeFor(activeTabId.value, { kind: 'leaf', id: node.id, terminalId: id })
}

function onKeydown(e: KeyboardEvent) {
  if (!active.value || !activeTabId.value) return
  const focused = terminals.focusedLeaf(activeTabId.value)
  if (!focused) return
  const mod = e.metaKey || e.ctrlKey
  if (!mod) return
  if (e.key === 'd' && !e.shiftKey) {
    e.preventDefault()
    terminals.splitPane(activeTabId.value, focused, 'row')
  } else if (e.key === 'D' && e.shiftKey) {
    e.preventDefault()
    terminals.splitPane(activeTabId.value, focused, 'column')
  } else if (e.key === 'w' && e.shiftKey) {
    e.preventDefault()
    terminals.closeLeaf(activeTabId.value, focused)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="area">
    <!-- State A: no workspace selected -->
    <div v-if="!active" class="center-stack">
      <p class="text-a">Select a workspace</p>
      <p class="hint">Or create one with ⌘N</p>
    </div>

    <!-- State B: workspace selected, split tree has no real terminals -->
    <div v-else-if="isEmpty" class="center-stack">
      <Button variant="ghost" class="new-term" @click="spawnInEmpty">New terminal</Button>
      <p class="hint">⌘⇧T</p>
    </div>

    <!-- State C: split tree has terminals -->
    <div v-else class="splits-container">
      <TerminalSplits v-if="activeTabId && tree" :node="tree" :tab-id="activeTabId" />
    </div>
  </div>
</template>

<style scoped>
.area { position: absolute; inset: 0; display: flex; }
.center-stack {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.text-a {
  font-family: var(--sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}
.hint {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
}
.new-term {
  width: 140px;
  height: 56px;
  font-size: 12px;
}
.splits-container { flex: 1; display: flex; min-width: 0; min-height: 0; }
</style>
