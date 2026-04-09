<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

function onClick() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <label class="row">
    <button
      type="button"
      :class="['box', { 'box--on': modelValue }]"
      :disabled="disabled"
      @click="onClick"
    >
      <svg v-if="modelValue" width="10" height="10" viewBox="0 0 10 10">
        <path d="M1 5 L4 8 L9 2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
      </svg>
    </button>
    <span v-if="label" class="label">{{ label }}</span>
  </label>
</template>

<style scoped>
.row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-2);
}
.box {
  width: 14px;
  height: 14px;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-fg);
  transition: background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}
.box--on {
  background: var(--accent);
  border-color: var(--accent);
}
</style>
