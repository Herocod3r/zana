<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
interface Props {
  text: string
  delay?: number
  placement?: 'top' | 'bottom' | 'left' | 'right'
}
const props = withDefaults(defineProps<Props>(), { delay: 200, placement: 'bottom' })
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null
function enter() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (visible.value = true), props.delay)
}
function leave() {
  if (timer) clearTimeout(timer)
  timer = null
  visible.value = false
}
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <span class="tip-trigger" @mouseenter="enter" @mouseleave="leave">
    <slot />
    <span v-if="visible" :class="['tip', `tip--${placement}`]">{{ text }}</span>
  </span>
</template>

<style scoped>
.tip-trigger {
  position: relative;
  display: inline-flex;
}
.tip {
  position: absolute;
  background: var(--surface-elev);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  padding: 4px 8px;
  font-family: var(--mono);
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
}
.tip--bottom {
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
}
.tip--top {
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
}
.tip--left {
  right: calc(100% + 4px);
  top: 50%;
  transform: translateY(-50%);
}
.tip--right {
  left: calc(100% + 4px);
  top: 50%;
  transform: translateY(-50%);
}
</style>
