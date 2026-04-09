<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import Toast from './Toast.vue'
import { useToastStore } from '@/stores/toasts'

const toasts = useToastStore()

const timers = new Map<string, ReturnType<typeof setTimeout>>()

function arm(id: string) {
  if (timers.has(id)) return
  const t = setTimeout(() => {
    toasts.dismiss(id)
    timers.delete(id)
  }, 4000)
  timers.set(id, t)
}

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = toasts.$subscribe(() => {
    for (const t of toasts.toasts) arm(t.id)
  })
  // Arm any toasts already present on mount
  for (const t of toasts.toasts) arm(t.id)
})
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  timers.clear()
  unsubscribe?.()
})
</script>

<template>
  <div class="host">
    <Toast v-for="t in toasts.toasts" :key="t.id" :message="t.message" :variant="t.variant" />
  </div>
</template>

<style scoped>
.host {
  position: fixed;
  right: 16px;
  bottom: calc(var(--statusbar-h) + 16px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 600;
  pointer-events: none;
}
.host > * { pointer-events: auto; }
</style>
