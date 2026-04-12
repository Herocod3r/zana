<script setup lang="ts">
import type { ActivityState } from '@/types/models'
interface Props {
  state: ActivityState
  size?: number
}
withDefaults(defineProps<Props>(), { size: 5 })
</script>

<template>
  <span :class="['dot', `dot--${state}`]" :style="{ width: `${size}px`, height: `${size}px` }" />
</template>

<style scoped>
.dot {
  display: inline-block;
  border-radius: var(--r-full);
  flex-shrink: 0;
  transition: background-color var(--dur-slow) var(--ease-out),
    box-shadow var(--dur-slow) var(--ease-out);
}
.dot--active {
  background: var(--accent);
  box-shadow: 0 0 4px var(--accent);
}
.dot--recent {
  background: var(--warning);
}
.dot--idle {
  background: var(--text-muted);
}
</style>
