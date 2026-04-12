<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'zana.sidebar.width'
const MIN = 180
const MAX = 400
const DEFAULT = 240

const width = ref(DEFAULT)
const dragging = ref(false)
const startX = ref(0)
const startWidth = ref(0)

onMounted(() => {
  const raw = localStorage.getItem(STORAGE_KEY)
  const n = raw ? parseInt(raw, 10) : NaN
  if (Number.isFinite(n) && n >= MIN && n <= MAX) width.value = n
})

function startDrag(e: MouseEvent) {
  dragging.value = true
  startX.value = e.clientX
  startWidth.value = width.value
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopDrag)
}
function onMove(e: MouseEvent) {
  if (!dragging.value) return
  const next = startWidth.value + (e.clientX - startX.value)
  width.value = Math.max(MIN, Math.min(MAX, next))
}
function stopDrag() {
  dragging.value = false
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', stopDrag)
  localStorage.setItem(STORAGE_KEY, String(width.value))
}
function resetWidth() {
  width.value = DEFAULT
  localStorage.setItem(STORAGE_KEY, String(DEFAULT))
}
</script>

<template>
  <aside class="sidebar" :style="{ width: `${width}px` }">
    <div class="drag-region" />
    <div class="projects-area">
      <slot name="tree" />
    </div>
    <div class="footer-area">
      <slot name="footer" />
    </div>
    <div class="resize-handle" @mousedown="startDrag" @dblclick="resetWidth" />
  </aside>
</template>

<style scoped>
.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  height: 100%;
}
.drag-region {
  height: var(--drag-region-h);
  -webkit-app-region: drag;
  flex-shrink: 0;
  /* -webkit-app-region: drag creates a compositing layer whose default
     paint is transparent — without an explicit background it visibly
     banded against --surface in dark mode. Paint it to match. */
  background: var(--surface);
}
.projects-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.footer-area {
  flex-shrink: 0;
  height: var(--footer-h);
  border-top: 1px solid var(--border);
}
.resize-handle {
  position: absolute;
  top: 0;
  right: -2px;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  z-index: 5;
}
</style>
