<script setup lang="ts">
interface Props {
  modelValue: boolean
  disabled?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
</script>

<template>
  <button
    type="button"
    :class="['toggle', { 'toggle--on': modelValue }]"
    :disabled="disabled"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="knob" />
  </button>
</template>

<style scoped>
.toggle {
  position: relative;
  width: 28px;
  height: 16px;
  background: var(--border-strong);
  border-radius: 8px;
  padding: 0;
  transition: background-color var(--dur-med) var(--ease-out);
}
.toggle--on {
  background: var(--accent);
}
.knob {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 14px;
  height: 14px;
  background: var(--bg);
  border-radius: var(--r-full);
  transition: transform var(--dur-med) var(--ease-out);
}
.toggle--on .knob {
  transform: translateX(12px);
}
</style>
