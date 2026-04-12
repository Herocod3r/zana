<script setup lang="ts">
interface Option {
  value: string
  label: string
}
interface Props {
  modelValue: string
  options: Option[]
  label?: string
  disabled?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <label class="field">
    <span v-if="label" class="label">{{ label }}</span>
    <select class="select" :value="modelValue" :disabled="disabled" @change="onChange">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--mono);
}
.label {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.select {
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border-strong);
  padding: 6px 2px;
  appearance: none;
  background: transparent;
  cursor: pointer;
}
.select:focus {
  border-bottom-color: var(--accent);
}
</style>
