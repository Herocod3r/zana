# Phase 7 — Right Region Internals

**Goal:** `TabBar` (conditional), `TabItem`, and `TerminalArea` with all empty states. After this phase, the right region shows a workspace's tabs (if >1) and its active tab's split tree (stubbed `TerminalPane` from Phase 8 still pending — for now `TerminalArea` shows the mock terminal content inline).

**Prerequisites:** Phases 1–6 complete.

---

### Task 7.1: `TabItem.vue`

**Files:**
- Create: `frontend/src/components/shell/TabItem.vue`
- Create: `frontend/src/components/shell/TabItem.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TabItem from './TabItem.vue'

const t = { id: 't-1', workspaceId: 'w', name: 'main', rootSplitId: 'lf' }

describe('TabItem', () => {
  it('renders name and emits select', async () => {
    const w = mount(TabItem, { props: { tab: t, active: false, state: 'idle' } })
    expect(w.text()).toContain('main')
    await w.find('.tab').trigger('click')
    expect(w.emitted('select')).toHaveLength(1)
  })
  it('enters rename mode on double click', async () => {
    const w = mount(TabItem, { props: { tab: t, active: true, state: 'idle' } })
    await w.find('.label').trigger('dblclick')
    expect(w.find('input').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { nextTick, ref } from 'vue'
import ActivityDot from '@/components/primitives/ActivityDot.vue'
import Icon from '@/components/primitives/Icon.vue'
import type { ActivityState, Tab } from '@/types/models'

interface Props {
  tab: Tab
  active: boolean
  state: ActivityState
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select'): void
  (e: 'close'): void
  (e: 'rename', name: string): void
  (e: 'contextmenu', ev: MouseEvent): void
}>()

const editing = ref(false)
const draft = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

async function startRename() {
  editing.value = true
  draft.value = props.tab.name
  await nextTick()
  inputRef.value?.select()
}
function commit() {
  if (editing.value) {
    const name = draft.value.trim()
    if (name.length > 0) emit('rename', name)
    editing.value = false
  }
}
function cancel() { editing.value = false }
</script>

<template>
  <div
    :class="['tab', { 'tab--active': active }]"
    @click="emit('select')"
    @contextmenu.prevent="emit('contextmenu', $event)"
  >
    <ActivityDot :state="state" />
    <span v-if="!editing" class="label" @dblclick.stop="startRename">{{ tab.name }}</span>
    <input
      v-else
      ref="inputRef"
      v-model="draft"
      class="rename"
      @keydown.enter.prevent="commit"
      @keydown.esc.prevent="cancel"
      @blur="commit"
      @click.stop
    />
    <button class="close" @click.stop="emit('close')"><Icon name="x" :size="10" /></button>
  </div>
</template>

<style scoped>
.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: var(--tabbar-h);
  min-width: 120px;
  max-width: 200px;
  color: var(--text-2);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  border-right: 1px solid rgba(38, 38, 46, 0.6);
  border-bottom: 2px solid transparent;
  cursor: default;
  transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
[data-theme='light'] .tab { border-right-color: rgba(228, 228, 234, 0.8); }
.tab:hover { color: var(--text); }
.tab--active {
  color: var(--text);
  border-bottom-color: var(--accent);
}
.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.rename {
  font: inherit;
  color: var(--text);
  background: transparent;
  border: 0;
  outline: 0;
  border-bottom: 1px solid var(--accent);
  padding: 0;
  flex: 1;
  min-width: 40px;
}
.close {
  color: var(--text-muted);
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.tab:hover .close, .tab--active .close { opacity: 1; }
.close:hover { color: var(--text); }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): TabItem with inline rename and close"`

---

### Task 7.2: `TabBar.vue`

**Files:**
- Create: `frontend/src/components/shell/TabBar.vue`
- Create: `frontend/src/components/shell/TabBar.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TabBar from './TabBar.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'

describe('TabBar', () => {
  it('renders tabs for the active workspace', () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: () => () => {} })
    useWorkspaceStore(pinia).load()
    useTabStore(pinia).load()
    useTerminalStore(pinia).load()
    useWorkspaceStore(pinia).select('ws-kyoto')
    const w = mount(TabBar, { global: { plugins: [pinia] } })
    expect(w.text()).toContain('investigation')
    expect(w.text()).toContain('logs')
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import TabItem from './TabItem.vue'
import Button from '@/components/primitives/Button.vue'
import Icon from '@/components/primitives/Icon.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'

const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const terminals = useTerminalStore()

const list = computed(() => (workspaces.activeWorkspaceId ? tabs.tabsFor(workspaces.activeWorkspaceId) : []))
const activeId = computed(() => (workspaces.activeWorkspaceId ? tabs.activeTabId(workspaces.activeWorkspaceId) : null))

function onSelect(id: string) {
  if (workspaces.activeWorkspaceId) tabs.setActive(workspaces.activeWorkspaceId, id)
}
function onClose(id: string) {
  if (workspaces.activeWorkspaceId) tabs.closeTab(workspaces.activeWorkspaceId, id)
}
function onRename(id: string, name: string) {
  tabs.renameTab(id, name)
}
function onNew() {
  if (workspaces.activeWorkspaceId) tabs.newTab(workspaces.activeWorkspaceId)
}
</script>

<template>
  <div class="tabbar" role="tablist">
    <TabItem
      v-for="t in list"
      :key="t.id"
      :tab="t"
      :active="t.id === activeId"
      :state="terminals.rolledUpState(t.id)"
      @select="onSelect(t.id)"
      @close="onClose(t.id)"
      @rename="(name) => onRename(t.id, name)"
    />
    <Button variant="icon" class="plus" @click="onNew"><Icon name="plus" /></Button>
  </div>
</template>

<style scoped>
.tabbar {
  display: flex;
  align-items: stretch;
  height: var(--tabbar-h);
  border-bottom: 1px solid var(--border);
  padding-left: 4px;
}
.plus { align-self: center; margin-left: 4px; }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): TabBar binds to stores"`

---

### Task 7.3: `TerminalArea.vue` with empty states

**Files:**
- Create: `frontend/src/components/shell/TerminalArea.vue`
- Create: `frontend/src/components/shell/TerminalArea.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TerminalArea from './TerminalArea.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'

function bootPinia() {
  const p = createTestingPinia({ stubActions: false, createSpy: () => () => {} })
  useWorkspaceStore(p).load()
  useTabStore(p).load()
  useTerminalStore(p).load()
  return p
}

describe('TerminalArea', () => {
  it('shows State A when nothing selected', () => {
    const p = bootPinia()
    useWorkspaceStore(p).activeWorkspaceId = null
    const w = mount(TerminalArea, { global: { plugins: [p] } })
    expect(w.text()).toContain('Select a workspace')
  })
  it('shows State B when split tree is empty for the tab', () => {
    const p = bootPinia()
    useWorkspaceStore(p).select('ws-madrid')
    const w = mount(TerminalArea, { global: { plugins: [p] } })
    expect(w.text()).toContain('New terminal')
  })
  it('shows State C when split tree has a real leaf', () => {
    const p = bootPinia()
    useWorkspaceStore(p).select('ws-osaka')
    const w = mount(TerminalArea, { global: { plugins: [p] } })
    expect(w.text()).toContain('$')
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/primitives/Button.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'

const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const terminals = useTerminalStore()

const active = computed(() => workspaces.active)
const activeTabId = computed(() => (active.value ? tabs.activeTabId(active.value.id) : null))
const tree = computed(() => (activeTabId.value ? terminals.treeFor(activeTabId.value) : undefined))

// "Empty" if the tree is a single leaf whose terminalId is 'missing' (fixture signal).
const isEmpty = computed(() => {
  const t = tree.value
  if (!t) return true
  if (t.kind !== 'leaf') return false
  const term = terminals.terminal(t.terminalId)
  return !term
})

function spawnInEmpty() {
  if (!activeTabId.value) return
  // Replace the placeholder leaf with a new terminal via the store.
  // Split with direction 'row' then close the placeholder; or simpler:
  // we treat the placeholder as a leaf and replace its terminalId.
  const node = tree.value
  if (!node || node.kind !== 'leaf') return
  const id = `t-spawn-${Date.now()}`
  terminals.terminalsById[id] = {
    id,
    tabId: activeTabId.value,
    cwd: active.value?.worktreePath ?? '/',
    command: 'zsh',
    mockOutput: ['$ _'],
    lastOutputAt: Date.now(),
  }
  terminals.setTreeFor(activeTabId.value, { kind: 'leaf', id: node.id, terminalId: id })
}
</script>

<template>
  <div class="area">
    <!-- State A: no workspace selected -->
    <div v-if="!active" class="center-stack">
      <p class="text-a">Select a workspace</p>
      <p class="hint">Or create one with ⌘N</p>
    </div>

    <!-- State B: workspace selected, split tree has no real terminals -->
    <div v-else-if="isEmpty" class="center-stack">
      <Button variant="ghost" class="new-term" @click="spawnInEmpty">New terminal</Button>
      <p class="hint">⌘⇧T</p>
    </div>

    <!-- State C: split tree has terminals (real rendering comes in Phase 8) -->
    <div v-else class="splits-placeholder">
      <slot name="splits" />
    </div>
  </div>
</template>

<style scoped>
.area { position: absolute; inset: 0; display: flex; }
.center-stack {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.text-a {
  font-family: var(--sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}
.hint {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
}
.new-term {
  width: 140px;
  height: 56px;
  font-size: 12px;
}
.splits-placeholder { flex: 1; display: flex; }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): TerminalArea with three states"`

---

### Task 7.4: Wire the conditional tab bar into `AppShell`

**Files:** `frontend/src/components/shell/AppShell.vue`

- [ ] **Step 1: Update `AppShell.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import Sidebar from './Sidebar.vue'
import RightRegion from './RightRegion.vue'
import StatusBar from './StatusBar.vue'
import ProjectTree from './ProjectTree.vue'
import SidebarFooter from './SidebarFooter.vue'
import TabBar from './TabBar.vue'
import TerminalArea from './TerminalArea.vue'
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
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.main { flex: 1; display: flex; min-height: 0; }
</style>
```

- [ ] **Step 2: Boot-check + commit** — `git commit -m "feat(shell): conditional tab bar wired into AppShell"`

---

### Phase 7 done when

- Selecting a workspace in the sidebar updates the right region.
- Selecting `ws-kyoto` (which has 2 tabs in the fixtures) reveals the tab bar with "investigation" and "logs."
- Selecting `ws-osaka` (1 tab with 2 terminals) hides the tab bar and shows the terminal area (still placeholder until Phase 8).
- Selecting `ws-madrid` (empty placeholder) shows State B with the "New terminal" button. Clicking it replaces the placeholder with a real mock terminal.
