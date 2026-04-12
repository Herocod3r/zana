<script setup lang="ts">
// Single mount point. Modals teleport here.
</script>

<template>
  <div id="modal-portal" class="portal" />
</template>

<style>
.portal {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 500;
}
.portal > * {
  pointer-events: auto;
}
</style>
