<script setup lang="ts">
// Shell only; conditional logic lives inside the tabbar slot caller.
</script>

<template>
  <section class="right">
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
}
.tabbar-slot { flex-shrink: 0; }
.area-slot { flex: 1; min-height: 0; position: relative; }
</style>
