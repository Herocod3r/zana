<script setup lang="ts">
import { inject } from 'vue'
import ActivityDot from '@/components/primitives/ActivityDot.vue'
import type { ActivityState, Workspace } from '@/types/models'

interface Props {
  workspace: Workspace
  active: boolean
  state: ActivityState
}
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'select'): void }>()

const showMenu = inject<(ev: MouseEvent, workspaceId: string) => void>('showWorkspaceMenu')

function onContext(ev: MouseEvent) {
  ev.preventDefault()
  showMenu?.(ev, props.workspace.id)
}
</script>

<template>
  <div
    :class="['row', { 'row--active': active }]"
    @click="emit('select')"
    @contextmenu="onContext"
  >
    <ActivityDot :state="state" />
    <span class="name">{{ workspace.name }}</span>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 28px;
  height: 24px;
  color: var(--text-2);
  font-family: var(--mono);
  font-size: var(--font-size-ui);
  font-weight: 500;
  cursor: default;
  transition: background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
  border-left: 2px solid transparent;
  margin-left: -2px;
}
.row:hover {
  background: var(--surface-elev);
  color: var(--text);
}
.row--active {
  background: rgba(163, 230, 53, 0.06);
  color: var(--text);
  border-left-color: var(--accent);
}
[data-theme='light'] .row--active {
  background: rgba(101, 163, 13, 0.08);
}
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
