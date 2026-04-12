<script setup lang="ts">
import { computed } from 'vue'
import * as Phosphor from '@phosphor-icons/vue'

interface Props {
  name: string
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold'
}
const props = withDefaults(defineProps<Props>(), { size: 16, weight: 'regular' })

const component = computed(() => {
  // Phosphor exports like PhPlus, PhGearSix, etc.
  const pascal = props.name
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('')
  const key = `Ph${pascal}` as keyof typeof Phosphor
  const found = Phosphor[key]
  if (!found) {
    console.warn(`[Icon] unknown phosphor name: ${props.name}`)
    return Phosphor.PhCircle
  }
  return found
})
</script>

<template>
  <component :is="component" :size="size" :weight="weight" />
</template>
