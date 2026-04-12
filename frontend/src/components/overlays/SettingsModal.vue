<script setup lang="ts">
import { ref } from 'vue'
import Modal from './Modal.vue'
import Button from '@/components/primitives/Button.vue'
import { useThemeStore, type ThemePreference } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'

interface Props { open: boolean }
defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void }>()
const theme = useThemeStore()
const settings = useSettingsStore()

const tabs = ['Appearance', 'Terminal'] as const
type Tab = (typeof tabs)[number]
const activeTab = ref<Tab>('Appearance')

const prefs: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]
</script>

<template>
  <Modal :open="open" :width="560" @close="emit('close')">
    <h3 class="title">Settings</h3>

    <nav class="tab-nav" role="tablist">
      <button
        v-for="t in tabs"
        :key="t"
        role="tab"
        :class="['tab-btn', { 'tab-btn--active': activeTab === t }]"
        :aria-selected="activeTab === t"
        @click="activeTab = t"
      >
        {{ t }}
      </button>
    </nav>

    <div class="tab-content">
      <!-- Appearance -->
      <div v-if="activeTab === 'Appearance'">
        <section class="section">
          <h4 class="section-title">Theme</h4>
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
          <h4 class="section-title">UI font size</h4>
          <div class="font-size-row">
            <Button variant="ghost" size="sm" @click="settings.setUiFontSize(settings.uiFontSize - 1)">−</Button>
            <span class="font-size-val">{{ settings.uiFontSize }}px</span>
            <Button variant="ghost" size="sm" @click="settings.setUiFontSize(settings.uiFontSize + 1)">+</Button>
          </div>
          <p class="hint">Sidebar, tabs, status bar (9–18px)</p>
        </section>

        <section class="section">
          <h4 class="section-title">Terminal font size</h4>
          <div class="font-size-row">
            <Button variant="ghost" size="sm" @click="settings.setTerminalFontSize(settings.terminalFontSize - 1)">−</Button>
            <span class="font-size-val">{{ settings.terminalFontSize }}px</span>
            <Button variant="ghost" size="sm" @click="settings.setTerminalFontSize(settings.terminalFontSize + 1)">+</Button>
          </div>
          <p class="hint">Terminal panes (9–24px)</p>
        </section>
      </div>

      <!-- Terminal -->
      <div v-if="activeTab === 'Terminal'">
        <section class="section">
          <p class="stub">Shell, scrollback, and cursor settings — coming soon.</p>
        </section>
      </div>
    </div>

    <div class="actions">
      <Button variant="ghost" @click="emit('close')">Close</Button>
    </div>
  </Modal>
</template>

<style scoped>
.title { font-family: var(--sans); font-size: 18px; font-weight: 500; margin: 0 0 16px; color: var(--text); }

.tab-nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}
.tab-btn {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 8px 16px;
  cursor: default;
  transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
.tab-btn:hover { color: var(--text-2); }
.tab-btn--active {
  color: var(--text);
  border-bottom-color: var(--accent);
}

.tab-content { min-height: 160px; }

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
.font-size-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.font-size-val {
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  min-width: 42px;
  text-align: center;
}
.hint {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-muted);
  margin: 8px 0 0;
}
.stub { font-family: var(--mono); font-size: 12px; color: var(--text-muted); margin: 0; }
.actions { display: flex; justify-content: flex-end; margin-top: 24px; }
</style>
