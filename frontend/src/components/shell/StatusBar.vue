<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'
import ActivityDot from '@/components/primitives/ActivityDot.vue'
import type { ActivityState } from '@/types/models'

const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const terminals = useTerminalStore()

const active = computed(() => workspaces.active)
const tabCount = computed(() => (active.value ? tabs.tabsFor(active.value.id).length : 0))
const terminalCount = computed(() => {
  if (!active.value) return 0
  let count = 0
  for (const t of tabs.tabsFor(active.value.id)) {
    const tree = terminals.treeFor(t.id)
    if (!tree) continue
    const stack = [tree]
    while (stack.length) {
      const node = stack.pop()!
      if (node.kind === 'leaf') count++
      else {
        stack.push(node.a, node.b)
      }
    }
  }
  return count
})
const rolledUp = computed<ActivityState>(() => {
  if (!active.value) return 'idle'
  let state: ActivityState = 'idle'
  const order: Record<ActivityState, number> = { idle: 0, recent: 1, active: 2 }
  for (const t of tabs.tabsFor(active.value.id)) {
    const s = terminals.rolledUpState(t.id)
    if (order[s] > order[state]) state = s
  }
  return state
})
</script>

<template>
  <div class="statusbar">
    <template v-if="active">
      <span class="name">{{ active.name }}</span>
      <span class="sep">·</span>
      <span class="branch">{{ active.branch }}</span>
      <span class="sep">·</span>
      <span class="count">{{ tabCount }} tabs · {{ terminalCount }} terminals</span>
    </template>
    <template v-else>
      <span class="ready">Ready</span>
    </template>
    <span class="spacer" />
    <ActivityDot v-if="active" :state="rolledUp" />
  </div>
</template>

<style scoped>
.statusbar {
  display: flex;
  align-items: center;
  gap: var(--s-md);
  height: var(--statusbar-h);
  padding: 0 var(--s-md);
  border-top: 1px solid var(--border);
  background: var(--surface);
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.name, .branch, .count, .ready { white-space: nowrap; }
.name, .branch { color: var(--text-2); }
.sep { color: var(--border-strong); }
.spacer { flex: 1; }
</style>
