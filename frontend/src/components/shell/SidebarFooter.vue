<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/primitives/Button.vue'
import Icon from '@/components/primitives/Icon.vue'
import Tooltip from '@/components/primitives/Tooltip.vue'
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()
const emit = defineEmits<{ (e: 'add-project'): void; (e: 'open-settings'): void }>()

const themeIcon = computed(() => {
  if (theme.preference === 'system') return 'circle-half'
  if (theme.preference === 'light') return 'sun'
  return 'moon-stars'
})
const themeTooltip = computed(() => `Theme: ${theme.preference}`)
</script>

<template>
  <div class="footer">
    <Tooltip text="Add project" placement="top">
      <Button variant="icon" @click="emit('add-project')"><Icon name="plus" /></Button>
    </Tooltip>
    <Tooltip text="Settings" placement="top">
      <Button variant="icon" @click="emit('open-settings')"><Icon name="gear-six" /></Button>
    </Tooltip>
    <Tooltip :text="themeTooltip" placement="top">
      <Button variant="icon" @click="theme.cycle()"><Icon :name="themeIcon" /></Button>
    </Tooltip>
  </div>
</template>

<style scoped>
.footer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  height: 100%;
}
</style>
