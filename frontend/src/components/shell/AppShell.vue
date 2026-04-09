<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import RightRegion from './RightRegion.vue'
import StatusBar from './StatusBar.vue'
import ProjectTree from './ProjectTree.vue'
import SidebarFooter from './SidebarFooter.vue'

function onAddProject() {
  /* Phase 9 wires the dialog */
}
function onOpenSettings() {
  /* Phase 9 wires the modal */
}
</script>

<template>
  <div class="app">
    <div class="main">
      <Sidebar>
        <template #tree>
          <ProjectTree />
        </template>
        <template #footer>
          <SidebarFooter @add-project="onAddProject" @open-settings="onOpenSettings" />
        </template>
      </Sidebar>
      <RightRegion>
        <template #tabbar />
        <template #area>
          <div class="area-placeholder">Right region</div>
        </template>
      </RightRegion>
    </div>
    <StatusBar />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.main {
  flex: 1;
  display: flex;
  min-height: 0;
}
.area-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 12px;
}
</style>
