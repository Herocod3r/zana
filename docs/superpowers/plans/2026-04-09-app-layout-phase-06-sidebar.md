# Phase 6 — Sidebar Internals

**Goal:** Populate the sidebar with real components: `ProjectTree`, `ProjectRow`, `WorkspaceRow`, `SidebarFooter`. Bind to `projectStore`, `workspaceStore`, `tabStore`, `terminalStore`, `themeStore`.

**Prerequisites:** Phases 1–5 complete.

---

### Task 6.1: `WorkspaceRow.vue`

**Files:**
- Create: `frontend/src/components/shell/WorkspaceRow.vue`
- Create: `frontend/src/components/shell/WorkspaceRow.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceRow from './WorkspaceRow.vue'

const w = { id: 'ws-1', projectId: 'p-1', name: 'tokyo', branch: 'main', worktreePath: '/tmp' }

describe('WorkspaceRow', () => {
  it('shows name', () => {
    const comp = mount(WorkspaceRow, { props: { workspace: w, active: false, state: 'idle' } })
    expect(comp.text()).toContain('tokyo')
  })
  it('applies active modifier', () => {
    const comp = mount(WorkspaceRow, { props: { workspace: w, active: true, state: 'active' } })
    expect(comp.classes()).toContain('row--active')
  })
  it('emits select on click', async () => {
    const comp = mount(WorkspaceRow, { props: { workspace: w, active: false, state: 'idle' } })
    await comp.trigger('click')
    expect(comp.emitted('select')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import ActivityDot from '@/components/primitives/ActivityDot.vue'
import type { ActivityState, Workspace } from '@/types/models'
interface Props {
  workspace: Workspace
  active: boolean
  state: ActivityState
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'select'): void; (e: 'contextmenu', ev: MouseEvent): void }>()
</script>

<template>
  <div
    :class="['row', { 'row--active': active }]"
    @click="emit('select')"
    @contextmenu.prevent="emit('contextmenu', $event)"
  >
    <ActivityDot :state="state" />
    <span class="name">{{ workspace.name }}</span>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 28px;
  height: 24px;
  color: var(--text-2);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  cursor: default;
  transition: background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
  border-left: 2px solid transparent;
  margin-left: -2px;
}
.row:hover {
  background: var(--surface-elev);
  color: var(--text);
}
.row--active {
  background: rgba(163, 230, 53, 0.06);
  color: var(--text);
  border-left-color: var(--accent);
}
[data-theme='light'] .row--active {
  background: rgba(101, 163, 13, 0.08);
}
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): WorkspaceRow with activity and active state"`

---

### Task 6.2: `ProjectRow.vue`

**Files:**
- Create: `frontend/src/components/shell/ProjectRow.vue`
- Create: `frontend/src/components/shell/ProjectRow.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectRow from './ProjectRow.vue'

const p = { id: 'p-1', name: 'zana', path: '/x' }

describe('ProjectRow', () => {
  it('emits toggle on click', async () => {
    const w = mount(ProjectRow, { props: { project: p, expanded: true } })
    await w.trigger('click')
    expect(w.emitted('toggle')).toHaveLength(1)
  })
  it('renders the expand twisty', () => {
    const w = mount(ProjectRow, { props: { project: p, expanded: false } })
    expect(w.text()).toContain('▸')
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import type { Project } from '@/types/models'
interface Props {
  project: Project
  expanded: boolean
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'toggle'): void; (e: 'contextmenu', ev: MouseEvent): void }>()
</script>

<template>
  <div class="row" @click="emit('toggle')" @contextmenu.prevent="emit('contextmenu', $event)">
    <span class="twisty">{{ expanded ? '▾' : '▸' }}</span>
    <span class="name">{{ project.name }}</span>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  height: 26px;
  color: var(--text-2);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  cursor: default;
  transition: background-color var(--dur-fast) var(--ease-out);
}
.row:hover { background: var(--surface-elev); }
.twisty { color: var(--text-muted); font-size: 10px; width: 10px; text-align: center; }
.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): ProjectRow with twisty and contextmenu"`

---

### Task 6.3: `ProjectTree.vue`

**Files:**
- Create: `frontend/src/components/shell/ProjectTree.vue`
- Create: `frontend/src/components/shell/ProjectTree.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ProjectTree from './ProjectTree.vue'
import { useProjectStore } from '@/stores/projects'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'

describe('ProjectTree', () => {
  it('renders projects and workspaces', () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: () => () => {} })
    useProjectStore(pinia).load()
    useWorkspaceStore(pinia).load()
    useTabStore(pinia).load()
    useTerminalStore(pinia).load()
    const w = mount(ProjectTree, { global: { plugins: [pinia] } })
    expect(w.text()).toContain('zana')
    expect(w.text()).toContain('osaka')
  })

  it('shows empty state when no projects', () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: () => () => {} })
    const ps = useProjectStore(pinia)
    ps.projects = []
    const w = mount(ProjectTree, { global: { plugins: [pinia] } })
    expect(w.text()).toContain('No projects yet')
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import ProjectRow from './ProjectRow.vue'
import WorkspaceRow from './WorkspaceRow.vue'
import Button from '@/components/primitives/Button.vue'
import { useProjectStore } from '@/stores/projects'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'
import type { ActivityState } from '@/types/models'

const projects = useProjectStore()
const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const terminals = useTerminalStore()

function rolledUp(workspaceId: string): ActivityState {
  let state: ActivityState = 'idle'
  const order: Record<ActivityState, number> = { idle: 0, recent: 1, active: 2 }
  for (const t of tabs.tabsFor(workspaceId)) {
    const s = terminals.rolledUpState(t.id)
    if (order[s] > order[state]) state = s
  }
  return state
}
</script>

<template>
  <div class="tree">
    <header class="section-head">PROJECTS</header>

    <template v-if="projects.projects.length > 0">
      <div v-for="p in projects.projects" :key="p.id" class="group">
        <ProjectRow :project="p" :expanded="projects.isExpanded(p.id)" @toggle="projects.toggleExpand(p.id)" />
        <template v-if="projects.isExpanded(p.id)">
          <WorkspaceRow
            v-for="w in workspaces.byProject(p.id)"
            :key="w.id"
            :workspace="w"
            :active="workspaces.activeWorkspaceId === w.id"
            :state="rolledUp(w.id)"
            @select="workspaces.select(w.id)"
          />
        </template>
      </div>
    </template>

    <div v-else class="empty">
      <p class="empty-text">No projects yet</p>
      <Button variant="ghost" size="sm">Add project</Button>
    </div>
  </div>
</template>

<style scoped>
.tree { padding: 8px 0 12px; }
.section-head {
  padding: 8px 12px;
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.group { margin-bottom: 4px; }
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 12px;
}
.empty-text { color: var(--text-muted); font-family: var(--mono); font-size: 12px; margin: 0; }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): ProjectTree renders tree and empty state"`

---

### Task 6.4: `SidebarFooter.vue`

**Files:**
- Create: `frontend/src/components/shell/SidebarFooter.vue`
- Create: `frontend/src/components/shell/SidebarFooter.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import SidebarFooter from './SidebarFooter.vue'
import { useThemeStore } from '@/stores/theme'

describe('SidebarFooter', () => {
  it('emits intents and cycles theme', async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: () => () => {} })
    useThemeStore(pinia).preference = 'system'
    const w = mount(SidebarFooter, { global: { plugins: [pinia] } })
    const buttons = w.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
    await buttons[2].trigger('click')
    expect(useThemeStore(pinia).preference).toBe('light')
  })
})
```

- [ ] **Step 2: Implement**

```vue
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
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): SidebarFooter with theme cycle and intents"`

---

### Task 6.5: Wire `ProjectTree` and `SidebarFooter` into `AppShell`

**Files:** `frontend/src/components/shell/AppShell.vue`

- [ ] **Step 1: Update `AppShell.vue`**

```vue
<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import RightRegion from './RightRegion.vue'
import StatusBar from './StatusBar.vue'
import ProjectTree from './ProjectTree.vue'
import SidebarFooter from './SidebarFooter.vue'

function onAddProject() { /* Phase 9 wires the dialog */ }
function onOpenSettings() { /* Phase 9 wires the modal */ }
</script>

<template>
  <div class="app">
    <div class="main">
      <Sidebar>
        <template #tree>
          <ProjectTree />
        </template>
        <template #footer>
          <SidebarFooter @add-project="onAddProject" @open-settings="onOpenSettings" />
        </template>
      </Sidebar>
      <RightRegion>
        <template #tabbar />
        <template #area>
          <div class="area-placeholder">Right region</div>
        </template>
      </RightRegion>
    </div>
    <StatusBar />
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.main { flex: 1; display: flex; min-height: 0; }
.area-placeholder {
  display: flex; align-items: center; justify-content: center; height: 100%;
  color: var(--text-muted); font-family: var(--mono); font-size: 12px;
}
</style>
```

- [ ] **Step 2: Boot-check + commit** — `git commit -m "feat(shell): wire ProjectTree and SidebarFooter into AppShell"`

---

### Phase 6 done when

- Sidebar shows projects, their expand/collapse state, workspaces under each, active workspace highlighted with the lime bar.
- Footer buttons are present; theme button cycles the preference and the UI swaps instantly.
- Right region still placeholder.
