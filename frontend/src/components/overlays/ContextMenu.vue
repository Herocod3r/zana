<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

export interface MenuItem {
  id: string
  label: string
  shortcut?: string
  destructive?: boolean
  separatorAfter?: boolean
  disabled?: boolean
}

interface Props {
  open: boolean
  x: number
  y: number
  items: MenuItem[]
}
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'select', id: string): void; (e: 'close'): void }>()

function onGlobalClick(e: MouseEvent) {
  if (!props.open) return
  const target = e.target as HTMLElement
  if (!target.closest('.ctx')) emit('close')
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => {
  window.addEventListener('mousedown', onGlobalClick)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousedown', onGlobalClick)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport v-if="open" to="#modal-portal">
    <div class="ctx" :style="{ left: `${x}px`, top: `${y}px` }">
      <template v-for="it in items" :key="it.id">
        <button
          class="item"
          :class="{ 'item--destructive': it.destructive, 'item--disabled': it.disabled }"
          :disabled="it.disabled"
          @click="!it.disabled && emit('select', it.id)"
        >
          <span class="label">{{ it.label }}</span>
          <span v-if="it.shortcut" class="shortcut">{{ it.shortcut }}</span>
        </button>
        <div v-if="it.separatorAfter" class="sep" />
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.ctx {
  position: fixed;
  background: var(--surface-elev);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: 4px 0;
  min-width: 180px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  z-index: 700;
}
[data-theme='light'] .ctx { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14); }
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  padding: 6px 12px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 12px;
  transition: background-color var(--dur-fast) var(--ease-out);
}
.item:hover:not(.item--disabled) { background: var(--border); }
.item--destructive { color: var(--error); }
.item--disabled { opacity: 0.5; cursor: not-allowed; }
.shortcut { color: var(--text-muted); font-size: 10px; }
.sep { height: 1px; background: var(--border); margin: 4px 0; }
</style>
