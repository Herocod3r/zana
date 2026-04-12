<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'ghost' | 'icon'
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
}
withDefaults(defineProps<Props>(), { variant: 'ghost', size: 'md', disabled: false, type: 'button' })
const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

function onClick(ev: MouseEvent) {
  if ((ev.currentTarget as HTMLButtonElement).disabled) return
  emit('click', ev)
}
</script>

<template>
  <button
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--disabled': disabled }]"
    :disabled="disabled"
    :type="type"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-xs);
  font-family: var(--mono);
  font-weight: 500;
  letter-spacing: 0.01em;
  border-radius: var(--r-sm);
  transition: background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.btn--sm {
  font-size: 11px;
  padding: 4px 10px;
  height: 22px;
}
.btn--md {
  font-size: 12px;
  padding: 6px 14px;
  height: 28px;
}
.btn--primary {
  background: var(--accent);
  color: var(--accent-fg);
}
.btn--primary:hover:not(.btn--disabled) {
  filter: brightness(1.08);
}
.btn--ghost {
  background: transparent;
  color: var(--text-2);
  border: 1px solid var(--border-strong);
}
.btn--ghost:hover:not(.btn--disabled) {
  color: var(--text);
  border-color: var(--text-muted);
}
.btn--icon {
  background: transparent;
  color: var(--text-muted);
  width: 28px;
  height: 28px;
  padding: 0;
}
.btn--icon:hover:not(.btn--disabled) {
  color: var(--text);
  background: var(--surface-elev);
}
.btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
