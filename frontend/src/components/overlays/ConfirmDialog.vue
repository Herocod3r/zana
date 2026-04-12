<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import Modal from './Modal.vue'
import Button from '@/components/primitives/Button.vue'

interface Props {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  destructive: false,
})
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()

function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Enter') emit('confirm')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Modal :open="open" :width="420" @close="emit('cancel')">
    <h3 class="title">{{ title }}</h3>
    <p class="body">{{ body }}</p>
    <div class="actions">
      <Button variant="ghost" @click="emit('cancel')">{{ cancelLabel }}</Button>
      <Button
        :class="destructive ? 'destructive' : ''"
        variant="primary"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </Button>
    </div>
  </Modal>
</template>

<style scoped>
.title { font-family: var(--sans); font-size: 18px; font-weight: 500; margin: 0 0 8px; color: var(--text); letter-spacing: -0.01em; }
.body { font-family: var(--sans); font-size: 14px; color: var(--text-2); margin: 0 0 24px; line-height: 1.5; }
.actions { display: flex; gap: 8px; justify-content: flex-end; }
.destructive { background: var(--error); color: var(--bg); }
</style>
