<script setup lang="ts">
import { computed } from 'vue'
import Sidebar from './Sidebar.vue'
import RightRegion from './RightRegion.vue'
import StatusBar from './StatusBar.vue'
import ProjectTree from './ProjectTree.vue'
import SidebarFooter from './SidebarFooter.vue'
import TabBar from './TabBar.vue'
import TerminalArea from './TerminalArea.vue'
import ModalPortal from '@/components/overlays/ModalPortal.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'

const workspaces = useWorkspaceStore()
const tabs = useTabStore()

const showTabBar = computed(
  () => workspaces.activeWorkspaceId !== null && tabs.tabsFor(workspaces.activeWorkspaceId).length > 1,
)

function onAddProject() { /* Phase 9 */ }
function onOpenSettings() { /* Phase 9 */ }
</script>

<template>
  <div class="app">
    <div class="main">
      <Sidebar>
        <template #tree><ProjectTree /></template>
        <template #footer>
          <SidebarFooter @add-project="onAddProject" @open-settings="onOpenSettings" />
        </template>
      </Sidebar>
      <RightRegion>
        <template #tabbar>
          <TabBar v-if="showTabBar" />
        </template>
        <template #area><TerminalArea /></template>
      </RightRegion>
    </div>
    <StatusBar />
    <ModalPortal />
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.main { flex: 1; display: flex; min-height: 0; }
</style>
