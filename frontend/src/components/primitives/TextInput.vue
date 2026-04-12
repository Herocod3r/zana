<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  type?: 'text' | 'password'
}
withDefaults(defineProps<Props>(), { type: 'text' })
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <label class="field">
    <span v-if="label" class="label">{{ label }}</span>
    <input
      class="input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    />
    <span v-if="error" class="error">{{ error }}</span>
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
.input {
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border-strong);
  padding: 6px 2px;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.input:focus {
  border-bottom-color: var(--accent);
}
.input:disabled {
  opacity: 0.5;
}
.error {
  color: var(--accent);
  font-size: 11px;
  margin-top: 2px;
}
</style>
