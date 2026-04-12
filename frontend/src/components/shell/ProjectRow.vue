<script setup lang="ts">
import type { Project } from '@/types/models'
interface Props {
  project: Project
  expanded: boolean
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'toggle'): void; (e: 'contextmenu', ev: MouseEvent): void }>()
</script>

<template>
  <div class="row" @click="emit('toggle')" @contextmenu.prevent="emit('contextmenu', $event)">
    <span class="twisty">{{ expanded ? '▾' : '▸' }}</span>
    <span class="name">{{ project.name }}</span>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  height: 26px;
  color: var(--text-2);
  font-family: var(--mono);
  font-size: var(--font-size-ui);
  font-weight: 500;
  cursor: default;
  transition: background-color var(--dur-fast) var(--ease-out);
}
.row:hover { background: var(--surface-elev); }
.twisty { color: var(--text-muted); font-size: 10px; width: 10px; text-align: center; }
.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
