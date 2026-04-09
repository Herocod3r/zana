<script setup lang="ts">
import { computed } from 'vue'
import TabItem from './TabItem.vue'
import Button from '@/components/primitives/Button.vue'
import Icon from '@/components/primitives/Icon.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'

const workspaces = useWorkspaceStore()
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
</script>

<template>
  <div class="tabbar" role="tablist">
    <TabItem
      v-for="t in list"
      :key="t.id"
      :tab="t"
      :active="t.id === activeId"
      :state="terminals.rolledUpState(t.id)"
      @select="onSelect(t.id)"
      @close="onClose(t.id)"
      @rename="(name) => onRename(t.id, name)"
    />
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
}
.plus { align-self: center; margin-left: 4px; }
</style>
