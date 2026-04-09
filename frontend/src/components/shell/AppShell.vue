<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import RightRegion from './RightRegion.vue'
import StatusBar from './StatusBar.vue'
</script>

<template>
  <div class="app">
    <div class="main">
      <Sidebar>
        <template #tree>
          <div class="placeholder-pad">Projects go here</div>
        </template>
        <template #footer>
          <div class="placeholder-pad">Footer</div>
        </template>
      </Sidebar>
      <RightRegion>
        <template #tabbar>
          <!-- empty until Phase 7 -->
        </template>
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
.placeholder-pad {
  padding: var(--s-md);
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 11px;
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
