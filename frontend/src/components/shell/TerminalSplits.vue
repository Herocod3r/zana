<script setup lang="ts">
import { computed } from 'vue'
import TerminalPane from './TerminalPane.vue'
import { useTerminalStore } from '@/stores/terminals'
import type { SplitNode } from '@/types/models'

interface Props {
  node: SplitNode
  tabId: string
}
const props = defineProps<Props>()
const terminals = useTerminalStore()

const isLeaf = computed(() => props.node.kind === 'leaf')
const style = computed(() => {
  if (props.node.kind !== 'branch') return {}
  const pct = `${(props.node.ratio * 100).toFixed(2)}%`
  const remain = `${((1 - props.node.ratio) * 100).toFixed(2)}%`
  return props.node.direction === 'row'
    ? { gridTemplateColumns: `${pct} 1px ${remain}` }
    : { gridTemplateRows: `${pct} 1px ${remain}` }
})

function onFocus(leafId: string) {
  terminals.setFocus(props.tabId, leafId)
}
function splitRight(leafId: string) {
  terminals.splitPane(props.tabId, leafId, 'row')
}
function splitDown(leafId: string) {
  terminals.splitPane(props.tabId, leafId, 'column')
}
function onDragStart(ev: MouseEvent) {
  if (props.node.kind !== 'branch') return
  const branch = props.node
  const direction = branch.direction
  const startPos = direction === 'row' ? ev.clientX : ev.clientY
  const container = (ev.currentTarget as HTMLElement).parentElement
  if (!container) return
  const size = direction === 'row' ? container.clientWidth : container.clientHeight
  const startRatio = branch.ratio
  function onMove(e: MouseEvent) {
    const delta = (direction === 'row' ? e.clientX : e.clientY) - startPos
    terminals.resizeSplit(props.tabId, branch.id, startRatio + delta / size)
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}
</script>

<template>
  <template v-if="isLeaf">
    <TerminalPane
      :terminal="terminals.terminal((node as any).terminalId)!"
      :focused="terminals.focusedLeaf(tabId) === (node as any).id"
      :tab-id="tabId"
      :leaf-id="(node as any).id"
      @focus="onFocus((node as any).id)"
      @split-right="splitRight((node as any).id)"
      @split-down="splitDown((node as any).id)"
    />
  </template>
  <template v-else>
    <div :class="['branch', `branch--${(node as any).direction}`]" :style="style">
      <TerminalSplits :node="(node as any).a" :tab-id="tabId" />
      <div :class="['divider', `divider--${(node as any).direction}`]" @mousedown="onDragStart" />
      <TerminalSplits :node="(node as any).b" :tab-id="tabId" />
    </div>
  </template>
</template>

<style scoped>
.branch { display: grid; width: 100%; height: 100%; }
.branch--row { grid-auto-flow: column; }
.branch--column { grid-auto-flow: row; }
.divider { background: var(--border); }
.divider--row { cursor: col-resize; width: 1px; }
.divider--column { cursor: row-resize; height: 1px; }
</style>
