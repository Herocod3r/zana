<script setup lang="ts">
import Modal from './Modal.vue'
import Button from '@/components/primitives/Button.vue'
import { useThemeStore, type ThemePreference } from '@/stores/theme'

interface Props { open: boolean }
defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void }>()
const theme = useThemeStore()

const prefs: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]
</script>

<template>
  <Modal :open="open" :width="560" @close="emit('close')">
    <h3 class="title">Settings</h3>

    <section class="section">
      <h4 class="section-title">Appearance</h4>
      <div class="radio-row">
        <label v-for="p in prefs" :key="p.value" class="radio">
          <input
            type="radio"
            name="theme-pref"
            :value="p.value"
            :checked="theme.preference === p.value"
            @change="theme.setPreference(p.value)"
          />
          <span>{{ p.label }}</span>
        </label>
      </div>
    </section>

    <section class="section">
      <h4 class="section-title">Terminal</h4>
      <p class="stub">Font size and family — coming soon.</p>
    </section>

    <div class="actions">
      <Button variant="ghost" @click="emit('close')">Close</Button>
    </div>
  </Modal>
</template>

<style scoped>
.title { font-family: var(--sans); font-size: 18px; font-weight: 500; margin: 0 0 16px; color: var(--text); }
.section { margin-bottom: 24px; }
.section-title {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0 0 12px;
}
.radio-row { display: flex; gap: 16px; }
.radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-2);
}
.stub { font-family: var(--mono); font-size: 12px; color: var(--text-muted); margin: 0; }
.actions { display: flex; justify-content: flex-end; margin-top: 24px; }
</style>
