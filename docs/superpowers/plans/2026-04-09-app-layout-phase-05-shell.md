# Phase 5 — Shell Skeleton

**Goal:** `AppShell` replaces the placeholder `App.vue`. Renders a three-region grid (sidebar, right region) plus `StatusBar`. Sidebar and right region are empty shells — they are fleshed out in phases 6–8. Window chrome is hidden-titlebar on macOS with traffic lights floating over the sidebar drag region.

**Prerequisites:** Phases 1–4 complete.

---

### Task 5.1: Configure Wails hidden titlebar

**Files:** `main.go`

- [ ] **Step 1: Update `main.go`**

Replace the `options.App` block with hidden titlebar settings:

```go
package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()
	err := wails.Run(&options.App{
		Title:  "Zana",
		Width:  1200,
		Height: 780,
		MinWidth:  800,
		MinHeight: 500,
		AssetServer: &assetserver.Options{Assets: assets},
		BackgroundColour: &options.RGBA{R: 11, G: 11, B: 14, A: 255},
		OnStartup:        app.startup,
		Frameless:        false,
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  true,
				HideTitleBar:               false,
				FullSizeContent:            true,
				UseToolbar:                 false,
				HideToolbarSeparator:       true,
			},
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
		},
	})
	if err != nil {
		println("error:", err.Error())
	}
}
```

- [ ] **Step 2: Commit** — `git commit -m "feat(wails): hidden titlebar with full-size content on macOS"`

---

### Task 5.2: `StatusBar.vue`

**Files:**
- Create: `frontend/src/components/shell/StatusBar.vue`
- Create: `frontend/src/components/shell/StatusBar.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import StatusBar from './StatusBar.vue'

describe('StatusBar', () => {
  it('renders Ready when no workspace', () => {
    const w = mount(StatusBar, { global: { plugins: [createTestingPinia({ createSpy: () => () => {} })] } })
    expect(w.text()).toContain('Ready')
  })
})
```

- [ ] **Step 2: Install testing pinia**

`cd frontend && pnpm add -D @pinia/testing`

- [ ] **Step 3: Implement `StatusBar.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'
import ActivityDot from '@/components/primitives/ActivityDot.vue'
import type { ActivityState } from '@/types/models'

const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const terminals = useTerminalStore()

const active = computed(() => workspaces.active)
const tabCount = computed(() => (active.value ? tabs.tabsFor(active.value.id).length : 0))
const terminalCount = computed(() => {
  if (!active.value) return 0
  let count = 0
  for (const t of tabs.tabsFor(active.value.id)) {
    const tree = terminals.treeFor(t.id)
    if (!tree) continue
    const stack = [tree]
    while (stack.length) {
      const node = stack.pop()!
      if (node.kind === 'leaf') count++
      else {
        stack.push(node.a, node.b)
      }
    }
  }
  return count
})
const rolledUp = computed<ActivityState>(() => {
  if (!active.value) return 'idle'
  let state: ActivityState = 'idle'
  const order: Record<ActivityState, number> = { idle: 0, recent: 1, active: 2 }
  for (const t of tabs.tabsFor(active.value.id)) {
    const s = terminals.rolledUpState(t.id)
    if (order[s] > order[state]) state = s
  }
  return state
})
</script>

<template>
  <div class="statusbar">
    <template v-if="active">
      <span class="name">{{ active.name }}</span>
      <span class="sep">·</span>
      <span class="branch">{{ active.branch }}</span>
      <span class="sep">·</span>
      <span class="count">{{ tabCount }} tabs · {{ terminalCount }} terminals</span>
    </template>
    <template v-else>
      <span class="ready">Ready</span>
    </template>
    <span class="spacer" />
    <ActivityDot v-if="active" :state="rolledUp" />
  </div>
</template>

<style scoped>
.statusbar {
  display: flex;
  align-items: center;
  gap: var(--s-md);
  height: var(--statusbar-h);
  padding: 0 var(--s-md);
  border-top: 1px solid var(--border);
  background: var(--surface);
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.name, .branch, .count, .ready { white-space: nowrap; }
.name, .branch { color: var(--text-2); }
.sep { color: var(--border-strong); }
.spacer { flex: 1; }
</style>
```

- [ ] **Step 4: Run + commit** — `git commit -m "feat(shell): StatusBar with workspace context"`

---

### Task 5.3: `Sidebar.vue` shell

**Files:**
- Create: `frontend/src/components/shell/Sidebar.vue`
- Create: `frontend/src/components/shell/Sidebar.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidebar from './Sidebar.vue'

describe('Sidebar', () => {
  it('exposes a drag region and a projects container', () => {
    const w = mount(Sidebar)
    expect(w.find('.drag-region').exists()).toBe(true)
    expect(w.find('.projects-area').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'zana.sidebar.width'
const MIN = 180
const MAX = 400
const DEFAULT = 240

const width = ref(DEFAULT)
const dragging = ref(false)
const startX = ref(0)
const startWidth = ref(0)

onMounted(() => {
  const raw = localStorage.getItem(STORAGE_KEY)
  const n = raw ? parseInt(raw, 10) : NaN
  if (Number.isFinite(n) && n >= MIN && n <= MAX) width.value = n
})

function startDrag(e: MouseEvent) {
  dragging.value = true
  startX.value = e.clientX
  startWidth.value = width.value
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopDrag)
}
function onMove(e: MouseEvent) {
  if (!dragging.value) return
  const next = startWidth.value + (e.clientX - startX.value)
  width.value = Math.max(MIN, Math.min(MAX, next))
}
function stopDrag() {
  dragging.value = false
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', stopDrag)
  localStorage.setItem(STORAGE_KEY, String(width.value))
}
function resetWidth() {
  width.value = DEFAULT
  localStorage.setItem(STORAGE_KEY, String(DEFAULT))
}
</script>

<template>
  <aside class="sidebar" :style="{ width: `${width}px` }">
    <div class="drag-region" />
    <div class="projects-area">
      <slot name="tree" />
    </div>
    <div class="footer-area">
      <slot name="footer" />
    </div>
    <div class="resize-handle" @mousedown="startDrag" @dblclick="resetWidth" />
  </aside>
</template>

<style scoped>
.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  height: 100%;
}
.drag-region {
  height: var(--drag-region-h);
  -webkit-app-region: drag;
  flex-shrink: 0;
}
.projects-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.footer-area {
  flex-shrink: 0;
  height: var(--footer-h);
  border-top: 1px solid var(--border);
}
.resize-handle {
  position: absolute;
  top: 0;
  right: -2px;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  z-index: 5;
}
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): Sidebar shell with resize handle and slots"`

---

### Task 5.4: `RightRegion.vue` shell

**Files:**
- Create: `frontend/src/components/shell/RightRegion.vue`
- Create: `frontend/src/components/shell/RightRegion.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RightRegion from './RightRegion.vue'

describe('RightRegion', () => {
  it('renders a slot container', () => {
    const w = mount(RightRegion, { slots: { tabbar: '<div class="tb-slot" />', area: '<div class="area-slot" />' } })
    expect(w.find('.tb-slot').exists()).toBe(true)
    expect(w.find('.area-slot').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Implement**

```vue
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
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): RightRegion shell with slots"`

---

### Task 5.5: `AppShell.vue`

**Files:**
- Create: `frontend/src/components/shell/AppShell.vue`

- [ ] **Step 1: Implement**

```vue
<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import RightRegion from './RightRegion.vue'
import StatusBar from './StatusBar.vue'
</script>

<template>
  <div class="app">
    <div class="main">
      <Sidebar>
        <template #tree>
          <div class="placeholder-pad">Projects go here</div>
        </template>
        <template #footer>
          <div class="placeholder-pad">Footer</div>
        </template>
      </Sidebar>
      <RightRegion>
        <template #tabbar>
          <!-- empty until Phase 7 -->
        </template>
        <template #area>
          <div class="area-placeholder">Right region</div>
        </template>
      </RightRegion>
    </div>
    <StatusBar />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.main {
  flex: 1;
  display: flex;
  min-height: 0;
}
.placeholder-pad {
  padding: var(--s-md);
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 11px;
}
.area-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: 12px;
}
</style>
```

- [ ] **Step 2: Replace `App.vue`**

```vue
<script setup lang="ts">
import AppShell from '@/components/shell/AppShell.vue'
</script>

<template>
  <AppShell />
</template>
```

- [ ] **Step 3: Boot-check + commit**

Run `pnpm run dev` and visually confirm the three regions render (placeholders are fine). Commit:

```bash
git add frontend/src/components/shell/AppShell.vue frontend/src/App.vue
git commit -m "feat(shell): AppShell wiring Sidebar, RightRegion, StatusBar"
```

---

### Phase 5 done when

- Boot renders the three-region shell with placeholders, themed correctly.
- Sidebar width drags, clamps, persists, double-click resets.
- `StatusBar` shows "Ready" when no workspace is selected (set `activeWorkspaceId = null` to verify) or workspace metadata when one is active.
