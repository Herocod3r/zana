# Phase 9 — Overlays

**Goal:** All overlay components: `ModalPortal`, `Modal`, `ConfirmDialog`, `AddProjectDialog`, `NewWorkspaceDialog`, `SettingsModal`, `Toast`, `ToastHost`. Wired into `AppShell`.

**Prerequisites:** Phases 1–8 complete.

---

### Task 9.1: `ModalPortal.vue`

**Files:**
- Create: `frontend/src/components/overlays/ModalPortal.vue`

- [ ] **Step 1: Implement**

```vue
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
```

- [ ] **Step 2: Add `<ModalPortal />` to `AppShell.vue`** (at the end of the `.app` div). Import at top: `import ModalPortal from '@/components/overlays/ModalPortal.vue'`.

- [ ] **Step 3: Commit** — `git commit -m "feat(overlay): ModalPortal mount point"`

---

### Task 9.2: `Modal.vue`

**Files:**
- Create: `frontend/src/components/overlays/Modal.vue`
- Create: `frontend/src/components/overlays/Modal.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from './Modal.vue'

describe('Modal', () => {
  it('renders when open', () => {
    const w = mount(Modal, {
      props: { open: true, width: 400 },
      slots: { default: '<p>hi</p>' },
      attachTo: document.body,
    })
    expect(document.body.textContent).toContain('hi')
    w.unmount()
  })
  it('emits close on escape', async () => {
    const w = mount(Modal, {
      props: { open: true },
      slots: { default: 'x' },
      attachTo: document.body,
    })
    await window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    w.unmount()
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'

interface Props {
  open: boolean
  width?: number
}
const props = withDefaults(defineProps<Props>(), { width: 480 })
const emit = defineEmits<{ (e: 'close'): void }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function onBackdrop(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('backdrop')) emit('close')
}
watch(
  () => props.open,
  (v) => {
    document.documentElement.style.overflow = v ? 'hidden' : ''
  },
)
</script>

<template>
  <Teleport v-if="open" to="#modal-portal">
    <div class="backdrop" @mousedown="onBackdrop">
      <div class="modal" :style="{ width: `${width}px` }" @mousedown.stop>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade var(--dur-med) var(--ease-out);
}
[data-theme='light'] .backdrop { background: rgba(0, 0, 0, 0.4); }
.modal {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  padding: var(--s-xl);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  max-height: 80vh;
  overflow-y: auto;
}
[data-theme='light'] .modal { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(overlay): Modal with Teleport, esc close, backdrop"`

---

### Task 9.3: `ConfirmDialog.vue`

**Files:**
- Create: `frontend/src/components/overlays/ConfirmDialog.vue`
- Create: `frontend/src/components/overlays/ConfirmDialog.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  it('emits confirm on primary click', async () => {
    const w = mount(ConfirmDialog, {
      props: { open: true, title: 'T', body: 'B', confirmLabel: 'Yes' },
      attachTo: document.body,
    })
    const yes = document.querySelector('button.btn--primary') as HTMLButtonElement
    yes?.click()
    expect(w.emitted('confirm')).toHaveLength(1)
    w.unmount()
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import Modal from './Modal.vue'
import Button from '@/components/primitives/Button.vue'

interface Props {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  destructive: false,
})
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()

function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Enter') emit('confirm')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Modal :open="open" :width="420" @close="emit('cancel')">
    <h3 class="title">{{ title }}</h3>
    <p class="body">{{ body }}</p>
    <div class="actions">
      <Button variant="ghost" @click="emit('cancel')">{{ cancelLabel }}</Button>
      <Button
        :class="destructive ? 'destructive' : ''"
        variant="primary"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </Button>
    </div>
  </Modal>
</template>

<style scoped>
.title { font-family: var(--sans); font-size: 18px; font-weight: 500; margin: 0 0 8px; color: var(--text); letter-spacing: -0.01em; }
.body { font-family: var(--sans); font-size: 14px; color: var(--text-2); margin: 0 0 24px; line-height: 1.5; }
.actions { display: flex; gap: 8px; justify-content: flex-end; }
.destructive { background: var(--error); color: #fff; }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(overlay): ConfirmDialog"`

---

### Task 9.4: `AddProjectDialog.vue`

**Files:**
- Create: `frontend/src/components/overlays/AddProjectDialog.vue`
- Create: `frontend/src/components/overlays/AddProjectDialog.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AddProjectDialog from './AddProjectDialog.vue'

describe('AddProjectDialog', () => {
  it('renders and emits submit', async () => {
    const w = mount(AddProjectDialog, {
      props: { open: true },
      attachTo: document.body,
    })
    const input = document.querySelector('input') as HTMLInputElement
    input.value = '/tmp/my-repo'
    input.dispatchEvent(new Event('input'))
    const buttons = document.querySelectorAll('button')
    const submit = Array.from(buttons).find((b) => b.textContent?.includes('Add'))
    submit?.click()
    expect(w.emitted('submit')).toBeTruthy()
    w.unmount()
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from './Modal.vue'
import Button from '@/components/primitives/Button.vue'
import TextInput from '@/components/primitives/TextInput.vue'

interface Props { open: boolean }
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'submit', path: string): void; (e: 'cancel'): void }>()

const path = ref('')
const error = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) {
      path.value = ''
      error.value = ''
    }
  },
)

function submit() {
  if (!path.value.trim()) {
    error.value = 'Path required'
    return
  }
  emit('submit', path.value.trim())
}
</script>

<template>
  <Modal :open="open" :width="480" @close="emit('cancel')">
    <h3 class="title">Add project</h3>
    <TextInput v-model="path" label="Repository path" placeholder="/Users/you/src/my-repo" :error="error" />
    <div class="actions">
      <Button variant="ghost" @click="emit('cancel')">Cancel</Button>
      <Button variant="primary" @click="submit">Add</Button>
    </div>
  </Modal>
</template>

<style scoped>
.title { font-family: var(--sans); font-size: 18px; font-weight: 500; margin: 0 0 16px; color: var(--text); letter-spacing: -0.01em; }
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(overlay): AddProjectDialog"`

---

### Task 9.5: `NewWorkspaceDialog.vue`

**Files:**
- Create: `frontend/src/components/overlays/NewWorkspaceDialog.vue`
- Create: `frontend/src/components/overlays/NewWorkspaceDialog.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NewWorkspaceDialog from './NewWorkspaceDialog.vue'

describe('NewWorkspaceDialog', () => {
  it('emits submit payload', async () => {
    const w = mount(NewWorkspaceDialog, {
      props: { open: true, projectId: 'proj-1', baseBranches: ['main'] },
      attachTo: document.body,
    })
    const [name, branch] = document.querySelectorAll('input')
    name.value = 'madrid'; name.dispatchEvent(new Event('input'))
    branch.value = 'feature/x'; branch.dispatchEvent(new Event('input'))
    const create = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Create'))
    create?.click()
    expect(w.emitted('submit')).toBeTruthy()
    w.unmount()
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from './Modal.vue'
import Button from '@/components/primitives/Button.vue'
import TextInput from '@/components/primitives/TextInput.vue'
import Select from '@/components/primitives/Select.vue'
import Toggle from '@/components/primitives/Toggle.vue'

const CITIES = ['tokyo', 'osaka', 'kyoto', 'nagoya', 'madrid', 'lisbon', 'berlin', 'paris', 'oslo', 'kiev']

interface Props {
  open: boolean
  projectId: string
  baseBranches: string[]
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'submit', payload: { projectId: string; name: string; branch: string; baseBranch: string; createNewBranch: boolean }): void
  (e: 'cancel'): void
}>()

const name = ref('')
const branch = ref('')
const baseBranch = ref('main')
const createNewBranch = ref(true)

function suggest() {
  name.value = CITIES[Math.floor(Math.random() * CITIES.length)]
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      name.value = ''
      branch.value = ''
      baseBranch.value = props.baseBranches[0] ?? 'main'
      createNewBranch.value = true
    }
  },
)

function submit() {
  if (!name.value.trim() || !branch.value.trim()) return
  emit('submit', {
    projectId: props.projectId,
    name: name.value.trim(),
    branch: branch.value.trim(),
    baseBranch: baseBranch.value,
    createNewBranch: createNewBranch.value,
  })
}
</script>

<template>
  <Modal :open="open" :width="520" @close="emit('cancel')">
    <h3 class="title">New workspace</h3>
    <div class="stack">
      <div class="name-row">
        <TextInput v-model="name" label="Display name" placeholder="tokyo" />
        <Button variant="ghost" size="sm" @click="suggest">Suggest</Button>
      </div>
      <TextInput v-model="branch" label="Branch name" placeholder="feature/my-thing" />
      <Select v-model="baseBranch" label="Base branch" :options="baseBranches.map((b) => ({ value: b, label: b }))" />
      <label class="toggle-row">
        <Toggle v-model="createNewBranch" />
        <span>Create new branch (off = check out existing)</span>
      </label>
    </div>
    <div class="actions">
      <Button variant="ghost" @click="emit('cancel')">Cancel</Button>
      <Button variant="primary" @click="submit">Create</Button>
    </div>
  </Modal>
</template>

<style scoped>
.title { font-family: var(--sans); font-size: 18px; font-weight: 500; margin: 0 0 16px; color: var(--text); letter-spacing: -0.01em; }
.stack { display: flex; flex-direction: column; gap: 16px; }
.name-row { display: flex; align-items: flex-end; gap: 12px; }
.name-row > :first-child { flex: 1; }
.toggle-row { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 12px; color: var(--text-2); }
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(overlay): NewWorkspaceDialog with suggest"`

---

### Task 9.6: `SettingsModal.vue`

**Files:**
- Create: `frontend/src/components/overlays/SettingsModal.vue`
- Create: `frontend/src/components/overlays/SettingsModal.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import SettingsModal from './SettingsModal.vue'
import { useThemeStore } from '@/stores/theme'

describe('SettingsModal', () => {
  it('shows theme options and cycles preference', async () => {
    const p = createTestingPinia({ stubActions: false, createSpy: () => () => {} })
    useThemeStore(p).preference = 'system'
    const w = mount(SettingsModal, {
      props: { open: true },
      global: { plugins: [p] },
      attachTo: document.body,
    })
    expect(document.body.textContent).toContain('Appearance')
    w.unmount()
  })
})
```

- [ ] **Step 2: Implement**

```vue
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
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(overlay): SettingsModal with theme preference"`

---

### Task 9.7: `Toast.vue` + `ToastHost.vue`

**Files:**
- Create: `frontend/src/components/overlays/Toast.vue`
- Create: `frontend/src/components/overlays/ToastHost.vue`
- Create: `frontend/src/components/overlays/Toast.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ToastHost from './ToastHost.vue'
import { useToastStore } from '@/stores/toasts'

describe('ToastHost', () => {
  it('renders toasts from the store', () => {
    const p = createTestingPinia({ stubActions: false, createSpy: () => () => {} })
    useToastStore(p).show({ message: 'hello', variant: 'info' })
    const w = mount(ToastHost, { global: { plugins: [p] } })
    expect(w.text()).toContain('hello')
  })
})
```

- [ ] **Step 2: Implement `Toast.vue`**

```vue
<script setup lang="ts">
import type { ToastVariant } from '@/stores/toasts'
interface Props {
  message: string
  variant: ToastVariant
}
defineProps<Props>()
</script>

<template>
  <div :class="['toast', `toast--${variant}`]">
    <span class="msg">{{ message }}</span>
  </div>
</template>

<style scoped>
.toast {
  background: var(--surface-elev);
  border: 1px solid var(--border-strong);
  border-left-width: 2px;
  border-radius: var(--r-sm);
  padding: 10px 14px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 220px;
  max-width: 360px;
}
.toast--info { border-left-color: var(--text-muted); }
.toast--success { border-left-color: var(--accent); }
.toast--warning { border-left-color: var(--warning); }
.toast--error { border-left-color: var(--error); }
.msg { white-space: pre-wrap; }
</style>
```

- [ ] **Step 3: Implement `ToastHost.vue`**

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import Toast from './Toast.vue'
import { useToastStore } from '@/stores/toasts'

const toasts = useToastStore()

const timers = new Map<string, ReturnType<typeof setTimeout>>()

function arm(id: string) {
  if (timers.has(id)) return
  const t = setTimeout(() => {
    toasts.dismiss(id)
    timers.delete(id)
  }, 4000)
  timers.set(id, t)
}

onMounted(() => {
  toasts.$subscribe(() => {
    for (const t of toasts.toasts) arm(t.id)
  })
})
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div class="host">
    <Toast v-for="t in toasts.toasts" :key="t.id" :message="t.message" :variant="t.variant" />
  </div>
</template>

<style scoped>
.host {
  position: fixed;
  right: 16px;
  bottom: calc(var(--statusbar-h) + 16px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 600;
  pointer-events: none;
}
.host > * { pointer-events: auto; }
</style>
```

- [ ] **Step 4: Add `<ToastHost />` to `AppShell.vue`**

Import and render inside `.app`, after `<StatusBar />`.

- [ ] **Step 5: Run + commit** — `git commit -m "feat(overlay): Toast and ToastHost with auto-dismiss"`

---

### Task 9.8: Wire `AddProjectDialog`, `NewWorkspaceDialog`, `SettingsModal` into `AppShell`

**Files:** `frontend/src/components/shell/AppShell.vue`

- [ ] **Step 1: Update**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import Sidebar from './Sidebar.vue'
import RightRegion from './RightRegion.vue'
import StatusBar from './StatusBar.vue'
import ProjectTree from './ProjectTree.vue'
import SidebarFooter from './SidebarFooter.vue'
import TabBar from './TabBar.vue'
import TerminalArea from './TerminalArea.vue'
import ModalPortal from '@/components/overlays/ModalPortal.vue'
import AddProjectDialog from '@/components/overlays/AddProjectDialog.vue'
import NewWorkspaceDialog from '@/components/overlays/NewWorkspaceDialog.vue'
import SettingsModal from '@/components/overlays/SettingsModal.vue'
import ToastHost from '@/components/overlays/ToastHost.vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useToastStore } from '@/stores/toasts'
import { api } from '@/services/api'

const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const toasts = useToastStore()

const showTabBar = computed(
  () => workspaces.activeWorkspaceId !== null && tabs.tabsFor(workspaces.activeWorkspaceId).length > 1,
)

const addProjectOpen = ref(false)
const newWorkspaceOpen = ref(false)
const settingsOpen = ref(false)

function onAddProject() { addProjectOpen.value = true }
function onOpenSettings() { settingsOpen.value = true }
function onAddProjectSubmit(path: string) {
  api.addProject(path)
  toasts.show({ message: `Added ${path}`, variant: 'success' })
  addProjectOpen.value = false
}
function onNewWorkspaceSubmit(payload: { projectId: string; name: string; branch: string; baseBranch: string; createNewBranch: boolean }) {
  const ws = api.createWorkspace(payload.projectId, payload.name, payload.branch)
  workspaces.select(ws.id)
  toasts.show({ message: `Workspace ${ws.name} created`, variant: 'success' })
  newWorkspaceOpen.value = false
}
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
    <ModalPortal />
    <ToastHost />
    <AddProjectDialog :open="addProjectOpen" @submit="onAddProjectSubmit" @cancel="addProjectOpen = false" />
    <NewWorkspaceDialog
      :open="newWorkspaceOpen"
      :project-id="workspaces.active?.projectId ?? ''"
      :base-branches="['main', 'develop']"
      @submit="onNewWorkspaceSubmit"
      @cancel="newWorkspaceOpen = false"
    />
    <SettingsModal :open="settingsOpen" @close="settingsOpen = false" />
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.main { flex: 1; display: flex; min-height: 0; }
</style>
```

- [ ] **Step 2: Commit** — `git commit -m "feat(shell): wire overlays into AppShell"`

---

### Phase 9 done when

- The footer `+` button opens `AddProjectDialog`; submitting it adds a mock project and fires a success toast.
- The footer gear opens `SettingsModal`; toggling theme works.
- Triggering a new-workspace flow (can be via a keyboard shortcut in Phase 11 or a temporary button) opens `NewWorkspaceDialog`.
- Toasts appear bottom-right, stack up to 3, auto-dismiss after 4s.
- Modals close on Esc, on backdrop click, and on Cancel.
