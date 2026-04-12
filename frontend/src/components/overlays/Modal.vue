<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'

interface Props {
  open: boolean
  width?: number
}
const props = withDefaults(defineProps<Props>(), { width: 480 })
const emit = defineEmits<{ (e: 'close'): void }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function onBackdrop(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('backdrop')) emit('close')
}
watch(
  () => props.open,
  (v) => {
    document.documentElement.style.overflow = v ? 'hidden' : ''
  },
)
</script>

<template>
  <Teleport v-if="open" to="#modal-portal">
    <div class="backdrop" @mousedown="onBackdrop">
      <div class="modal" :style="{ width: `${width}px` }" @mousedown.stop>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade var(--dur-med) var(--ease-out);
}
[data-theme='light'] .backdrop { background: rgba(0, 0, 0, 0.4); }
.modal {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  padding: var(--s-xl);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  max-height: 80vh;
  overflow-y: auto;
}
[data-theme='light'] .modal { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }
</style>
