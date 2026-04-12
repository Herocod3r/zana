<script setup lang="ts">
import { inject } from 'vue'
import Icon from '@/components/primitives/Icon.vue'
import type { Terminal } from '@/types/models'

interface Props {
  terminal: Terminal
  focused: boolean
  tabId: string
  leafId: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'focus'): void
  (e: 'split-right'): void
  (e: 'split-down'): void
}>()

const showPaneMenu = inject<(ev: MouseEvent, tabId: string, leafId: string) => void>('showPaneMenu')

function onContext(ev: MouseEvent) {
  ev.preventDefault()
  showPaneMenu?.(ev, props.tabId, props.leafId)
}
</script>

<template>
  <div
    :class="['pane', { 'pane--focused': focused, 'pane--dimmed': !focused }]"
    @click="emit('focus')"
    @contextmenu="onContext"
  >
    <div class="header">{{ terminal.command }} &nbsp; <span class="cwd">{{ terminal.cwd }}</span></div>
    <pre class="body">{{ terminal.scrollback.join('\n') }}</pre>
    <div class="split-controls" @click.stop>
      <button class="sc split-right" @click="emit('split-right')" title="Split right">
        <Icon name="columns" :size="12" />
      </button>
      <button class="sc split-down" @click="emit('split-down')" title="Split down">
        <Icon name="rows" :size="12" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.pane {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid transparent;
  font-family: var(--mono);
  font-size: var(--font-size-terminal);
  color: var(--text);
  overflow: hidden;
  transition: filter var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
.pane--focused { border-color: var(--accent); }
.pane--dimmed { filter: opacity(0.7); }
.header {
  color: var(--text-muted);
  font-size: 10px;
  margin-bottom: 6px;
}
.cwd { color: var(--text-muted); }
.body {
  margin: 0;
  white-space: pre-wrap;
  color: var(--text-2);
}
.split-controls {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-out);
}
.pane:hover .split-controls { opacity: 1; }
.sc {
  width: 20px;
  height: 20px;
  background: var(--surface-elev);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
.sc:hover { color: var(--text); border-color: var(--text-muted); }
</style>
