<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import TabItem from './TabItem.vue'
import Button from '@/components/primitives/Button.vue'
import Icon from '@/components/primitives/Icon.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'
import { useSettingsStore } from '@/stores/settings'

const workspaces = useWorkspaceStore()
const settings = useSettingsStore()
const tabs = useTabStore()
const terminals = useTerminalStore()

const list = computed(() => (workspaces.activeWorkspaceId ? tabs.tabsFor(workspaces.activeWorkspaceId) : []))
const activeId = computed(() => (workspaces.activeWorkspaceId ? tabs.activeTabId(workspaces.activeWorkspaceId) : null))

function onSelect(id: string) {
  if (workspaces.activeWorkspaceId) tabs.setActive(workspaces.activeWorkspaceId, id)
}
function onClose(id: string) {
  if (workspaces.activeWorkspaceId) tabs.closeTab(workspaces.activeWorkspaceId, id)
}
function onRename(id: string, name: string) {
  tabs.renameTab(id, name)
}
function onNew() {
  if (workspaces.activeWorkspaceId) tabs.newTab(workspaces.activeWorkspaceId)
}

// --- Drag reorder ---
const dragIndex = ref<number | null>(null)

function onDragStart(index: number, ev: DragEvent) {
  dragIndex.value = index
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = 'move'
    // Some browsers require setData for dragstart to fire properly.
    ev.dataTransfer.setData('text/plain', String(index))
  }
}
function onDragOver(ev: DragEvent) {
  if (dragIndex.value === null) return
  ev.preventDefault()
  if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move'
}
function onDrop(targetIndex: number, ev: DragEvent) {
  ev.preventDefault()
  const from = dragIndex.value
  dragIndex.value = null
  if (from === null || from === targetIndex) return
  const wsId = workspaces.activeWorkspaceId
  if (!wsId) return
  const ordered = list.value.map((t) => t.id)
  const [moved] = ordered.splice(from, 1)
  ordered.splice(targetIndex, 0, moved)
  tabs.reorderTabs(wsId, ordered)
}
function onDragEnd() {
  dragIndex.value = null
}

// --- Overflow chevron ---
const scrollerRef = ref<HTMLElement | null>(null)
const overflowing = ref(false)
const overflowOpen = ref(false)
let ro: ResizeObserver | null = null

function measure() {
  const el = scrollerRef.value
  if (!el) return
  overflowing.value = el.scrollWidth > el.clientWidth + 1
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && scrollerRef.value) {
    ro = new ResizeObserver(() => measure())
    ro.observe(scrollerRef.value)
  }
})
onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
})
watch(list, async () => {
  await nextTick()
  measure()
})
watch(() => settings.uiFontSize, async () => {
  await nextTick()
  measure()
})

function toggleOverflow() {
  overflowOpen.value = !overflowOpen.value
}
function pickFromOverflow(id: string) {
  overflowOpen.value = false
  onSelect(id)
}
</script>

<template>
  <div class="tabbar" role="tablist">
    <div ref="scrollerRef" class="scroller">
      <TabItem
        v-for="(t, i) in list"
        :key="t.id"
        :tab="t"
        :active="t.id === activeId"
        :state="terminals.rolledUpState(t.id)"
        @select="onSelect(t.id)"
        @close="onClose(t.id)"
        @rename="(name) => onRename(t.id, name)"
        @dragstart="onDragStart(i, $event)"
        @dragover="onDragOver($event)"
        @drop="onDrop(i, $event)"
        @dragend="onDragEnd()"
      />
    </div>
    <div v-if="overflowing" class="overflow">
      <Button variant="icon" class="chevron" @click="toggleOverflow">
        <Icon name="caret-right" />
      </Button>
      <div v-if="overflowOpen" class="popover" role="menu">
        <button
          v-for="t in list"
          :key="t.id"
          :class="['popover-item', { 'popover-item--active': t.id === activeId }]"
          @click="pickFromOverflow(t.id)"
        >
          {{ t.name }}
        </button>
      </div>
    </div>
    <Button variant="icon" class="plus" @click="onNew"><Icon name="plus" /></Button>
  </div>
</template>

<style scoped>
.tabbar {
  display: flex;
  align-items: stretch;
  height: var(--tabbar-h);
  border-bottom: 1px solid var(--border);
  padding-left: 4px;
  position: relative;
  min-width: 0;
}
.scroller {
  display: flex;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.overflow { position: relative; align-self: center; }
.chevron { align-self: center; }
.popover {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 160px;
  background: var(--surface-elev);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: 4px 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.popover-item {
  font-family: var(--mono);
  font-size: var(--font-size-ui);
  color: var(--text-2);
  background: transparent;
  border: 0;
  padding: 6px 12px;
  text-align: left;
  cursor: default;
}
.popover-item:hover { color: var(--text); background: var(--bg); }
.popover-item--active { color: var(--text); }
.plus { align-self: center; margin-left: 4px; }
</style>
