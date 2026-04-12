<script setup lang="ts">
import { inject, nextTick, ref } from 'vue'
import ActivityDot from '@/components/primitives/ActivityDot.vue'
import Icon from '@/components/primitives/Icon.vue'
import type { ActivityState, Tab } from '@/types/models'

interface Props {
  tab: Tab
  active: boolean
  state: ActivityState
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select'): void
  (e: 'close'): void
  (e: 'rename', name: string): void
}>()

const showTabMenu = inject<(ev: MouseEvent, tabId: string, workspaceId: string) => void>('showTabMenu')

function onContext(ev: MouseEvent) {
  ev.preventDefault()
  showTabMenu?.(ev, props.tab.id, props.tab.workspaceId)
}

const editing = ref(false)
const draft = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

async function startRename() {
  editing.value = true
  draft.value = props.tab.name
  await nextTick()
  inputRef.value?.select()
}
function commit() {
  if (editing.value) {
    const name = draft.value.trim()
    if (name.length > 0) emit('rename', name)
    editing.value = false
  }
}
function cancel() { editing.value = false }
</script>

<template>
  <div
    :class="['tab', { 'tab--active': active }]"
    draggable="true"
    @click="emit('select')"
    @contextmenu="onContext"
  >
    <ActivityDot :state="state" />
    <span v-if="!editing" class="label" @dblclick.stop="startRename">{{ tab.name }}</span>
    <input
      v-else
      ref="inputRef"
      v-model="draft"
      class="rename"
      @keydown.enter.prevent="commit"
      @keydown.esc.prevent="cancel"
      @blur="commit"
      @click.stop
    />
    <button class="close" @click.stop="emit('close')"><Icon name="x" :size="10" /></button>
  </div>
</template>

<style scoped>
.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: var(--tabbar-h);
  min-width: 120px;
  max-width: 200px;
  color: var(--text-2);
  font-family: var(--mono);
  font-size: var(--font-size-ui);
  font-weight: 500;
  border-right: 1px solid rgba(38, 38, 46, 0.6);
  border-bottom: 2px solid transparent;
  cursor: default;
  transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
[data-theme='light'] .tab { border-right-color: rgba(228, 228, 234, 0.8); }
.tab:hover { color: var(--text); }
.tab--active {
  color: var(--text);
  border-bottom-color: var(--accent);
}
.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.rename {
  font: inherit;
  color: var(--text);
  background: transparent;
  border: 0;
  outline: 0;
  border-bottom: 1px solid var(--accent);
  padding: 0;
  flex: 1;
  min-width: 40px;
}
.close {
  color: var(--text-muted);
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.tab:hover .close, .tab--active .close { opacity: 1; }
.close:hover { color: var(--text); }
</style>
