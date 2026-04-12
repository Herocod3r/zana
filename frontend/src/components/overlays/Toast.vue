<script setup lang="ts">
import type { ToastVariant } from '@/stores/toasts'
interface Props {
  message: string
  variant: ToastVariant
}
defineProps<Props>()
</script>

<template>
  <div :class="['toast', `toast--${variant}`]">
    <span class="msg">{{ message }}</span>
  </div>
</template>

<style scoped>
.toast {
  background: var(--surface-elev);
  border: 1px solid var(--border-strong);
  border-left-width: 2px;
  border-radius: var(--r-sm);
  padding: 10px 14px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 220px;
  max-width: 360px;
}
.toast--info { border-left-color: var(--text-muted); }
.toast--success { border-left-color: var(--accent); }
.toast--warning { border-left-color: var(--warning); }
.toast--error { border-left-color: var(--error); }
.msg { white-space: pre-wrap; }
</style>
