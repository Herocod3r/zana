<script setup lang="ts">
// Shell only; conditional logic lives inside the tabbar slot caller.
</script>

<template>
  <section class="right">
    <div class="drag-region" />
    <div class="tabbar-slot">
      <slot name="tabbar" />
    </div>
    <div class="area-slot">
      <slot name="area" />
    </div>
  </section>
</template>

<style scoped>
.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
  position: relative;
}
.drag-region {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--drag-region-h);
  -webkit-app-region: drag;
  z-index: 1;
}
.tabbar-slot { flex-shrink: 0; }
.area-slot { flex: 1; min-height: 0; position: relative; }
</style>
