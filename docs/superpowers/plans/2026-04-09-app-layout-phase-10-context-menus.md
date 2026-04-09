# Phase 10 — Context Menus

**Goal:** A reusable `ContextMenu.vue` component and wiring it into project rows, workspace rows, tabs, and terminal panes.

**Prerequisites:** Phases 1–9 complete.

---

### Task 10.1: `ContextMenu.vue`

**Files:**
- Create: `frontend/src/components/overlays/ContextMenu.vue`
- Create: `frontend/src/components/overlays/ContextMenu.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ContextMenu from './ContextMenu.vue'

const items = [
  { id: 'a', label: 'Alpha', shortcut: '⌘A' },
  { id: 'b', label: 'Beta' },
]

describe('ContextMenu', () => {
  it('emits select when an item is clicked', async () => {
    const w = mount(ContextMenu, {
      props: { open: true, x: 20, y: 20, items },
      attachTo: document.body,
    })
    const buttons = document.querySelectorAll('.item')
    ;(buttons[0] as HTMLElement).click()
    expect(w.emitted('select')?.[0]).toEqual(['a'])
    w.unmount()
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

export interface MenuItem {
  id: string
  label: string
  shortcut?: string
  destructive?: boolean
  separatorAfter?: boolean
  disabled?: boolean
}

interface Props {
  open: boolean
  x: number
  y: number
  items: MenuItem[]
}
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'select', id: string): void; (e: 'close'): void }>()

function onGlobalClick(e: MouseEvent) {
  if (!props.open) return
  const target = e.target as HTMLElement
  if (!target.closest('.ctx')) emit('close')
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => {
  window.addEventListener('mousedown', onGlobalClick)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousedown', onGlobalClick)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport v-if="open" to="#modal-portal">
    <div class="ctx" :style="{ left: `${x}px`, top: `${y}px` }">
      <template v-for="it in items" :key="it.id">
        <button
          class="item"
          :class="{ 'item--destructive': it.destructive, 'item--disabled': it.disabled }"
          :disabled="it.disabled"
          @click="!it.disabled && emit('select', it.id)"
        >
          <span class="label">{{ it.label }}</span>
          <span v-if="it.shortcut" class="shortcut">{{ it.shortcut }}</span>
        </button>
        <div v-if="it.separatorAfter" class="sep" />
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.ctx {
  position: fixed;
  background: var(--surface-elev);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: 4px 0;
  min-width: 180px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  z-index: 700;
}
[data-theme='light'] .ctx { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14); }
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  padding: 6px 12px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 12px;
  transition: background-color var(--dur-fast) var(--ease-out);
}
.item:hover:not(.item--disabled) { background: var(--border); }
.item--destructive { color: var(--error); }
.item--disabled { opacity: 0.5; cursor: not-allowed; }
.shortcut { color: var(--text-muted); font-size: 10px; }
.sep { height: 1px; background: var(--border); margin: 4px 0; }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(overlay): ContextMenu"`

---

### Task 10.2: Context menu controller composable

**Files:**
- Create: `frontend/src/lib/useContextMenu.ts`

- [ ] **Step 1: Implement**

```ts
import { ref } from 'vue'
import type { MenuItem } from '@/components/overlays/ContextMenu.vue'

export function useContextMenu() {
  const open = ref(false)
  const x = ref(0)
  const y = ref(0)
  const items = ref<MenuItem[]>([])
  let onSelect: ((id: string) => void) | null = null

  function show(ev: MouseEvent, next: MenuItem[], select: (id: string) => void) {
    x.value = ev.clientX
    y.value = ev.clientY
    items.value = next
    onSelect = select
    open.value = true
  }
  function close() {
    open.value = false
    onSelect = null
  }
  function select(id: string) {
    onSelect?.(id)
    close()
  }

  return { open, x, y, items, show, close, select }
}
```

- [ ] **Step 2: Commit** — `git commit -m "feat(lib): useContextMenu composable"`

---

### Task 10.3: Wire workspace, tab, and pane context menus

**Files:** `frontend/src/components/shell/AppShell.vue`

- [ ] **Step 1: Add a single shared context menu to `AppShell`**

Near the top of `AppShell.vue` `<script setup>`, add:

```ts
import ContextMenu from '@/components/overlays/ContextMenu.vue'
import { useContextMenu } from '@/lib/useContextMenu'
import { useTerminalStore } from '@/stores/terminals'

const terminals = useTerminalStore()
const menu = useContextMenu()

function showWorkspaceMenu(ev: MouseEvent, workspaceId: string) {
  menu.show(
    ev,
    [
      { id: 'rename', label: 'Rename' },
      { id: 'duplicate', label: 'Duplicate branch' },
      { id: 'delete', label: 'Delete', destructive: true },
    ],
    (id) => {
      if (id === 'delete') api.deleteWorkspace(workspaceId)
      else toasts.show({ message: `${id} not implemented`, variant: 'info' })
    },
  )
}

function showTabMenu(ev: MouseEvent, tabId: string, workspaceId: string) {
  menu.show(
    ev,
    [
      { id: 'rename', label: 'Rename' },
      { id: 'close', label: 'Close', destructive: true, shortcut: '⌘W' },
    ],
    (id) => {
      if (id === 'close') api.closeTab(workspaceId, tabId)
    },
  )
}

function showPaneMenu(ev: MouseEvent, tabId: string, leafId: string) {
  const tree = terminals.treeFor(tabId)
  const canDetach = tree && tree.kind === 'branch'
  menu.show(
    ev,
    [
      { id: 'split-right', label: 'Split right', shortcut: '⌘D' },
      { id: 'split-down', label: 'Split down', shortcut: '⌘⇧D', separatorAfter: true },
      { id: 'move-new-tab', label: 'Move to new tab', shortcut: '⌘⇧↵', disabled: !canDetach, separatorAfter: true },
      { id: 'close', label: 'Close pane', shortcut: '⌘⇧W', destructive: true },
    ],
    (id) => {
      if (id === 'split-right') terminals.splitPane(tabId, leafId, 'row')
      if (id === 'split-down') terminals.splitPane(tabId, leafId, 'column')
      if (id === 'close') terminals.closeLeaf(tabId, leafId)
      if (id === 'move-new-tab' && canDetach) {
        // Detach: create new tab, copy the leaf, remove from current tree.
        if (!workspaces.activeWorkspaceId) return
        const newTab = tabs.newTab(workspaces.activeWorkspaceId)
        const leaf = (function find(n): { kind: 'leaf'; id: string; terminalId: string } | null {
          if (n.kind === 'leaf') return n.id === leafId ? n : null
          return find(n.a) || find(n.b)
        })(tree!)
        if (leaf) {
          terminals.setTreeFor(newTab.id, { kind: 'leaf', id: `lf-moved-${Date.now()}`, terminalId: leaf.terminalId })
          terminals.closeLeaf(tabId, leafId)
          tabs.setActive(workspaces.activeWorkspaceId, newTab.id)
        }
      }
    },
  )
}

// Provide these handlers downward via provide/inject so deeply nested
// TerminalPane can request menus.
import { provide } from 'vue'
provide('showPaneMenu', showPaneMenu)
provide('showTabMenu', showTabMenu)
provide('showWorkspaceMenu', showWorkspaceMenu)
```

And add `<ContextMenu :open="menu.open.value" :x="menu.x.value" :y="menu.y.value" :items="menu.items.value" @select="menu.select" @close="menu.close" />` inside the `.app` div (after `<ToastHost />`).

- [ ] **Step 2: Consume the provided handlers**

In `WorkspaceRow.vue`, inject and call on `@contextmenu`:

```ts
import { inject } from 'vue'
const showMenu = inject<(ev: MouseEvent, workspaceId: string) => void>('showWorkspaceMenu')
function onContext(ev: MouseEvent) {
  showMenu?.(ev, props.workspace.id)
}
```

Emit `contextmenu` still works (`ProjectTree` can alternatively wire `@contextmenu` → `onContext`). Simpler: change `WorkspaceRow` template to call `onContext` directly and drop the `contextmenu` emit.

Same pattern for `TabItem.vue` (`showTabMenu`) and `TerminalPane.vue` (`showPaneMenu` — needs the tabId and leafId, injected by `TerminalSplits` via an additional prop — add `tabId` and `leafId` props to `TerminalPane`).

- [ ] **Step 3: Run tests + commit** — `git commit -m "feat(shell): wire ContextMenu into workspace, tab, and pane interactions"`

---

### Phase 10 done when

- Right-click on a workspace row opens a menu with Rename / Duplicate / Delete.
- Right-click on a tab opens Rename / Close.
- Right-click on a terminal pane opens Split right / Split down / Move to new tab / Close pane. "Move to new tab" is disabled when the current tab has a single pane.
- Clicking outside closes the menu. Esc closes it.
