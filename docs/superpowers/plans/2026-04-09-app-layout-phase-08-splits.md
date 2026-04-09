# Phase 8 — Terminal Splits

**Goal:** The recursive `TerminalSplits` renderer and the leaf `TerminalPane`. Splitting, closing, resizing, focus/dim, and hover-reveal split controls all work against the `terminalStore`.

**Prerequisites:** Phases 1–7 complete.

---

### Task 8.1: `TerminalPane.vue`

**Files:**
- Create: `frontend/src/components/shell/TerminalPane.vue`
- Create: `frontend/src/components/shell/TerminalPane.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TerminalPane from './TerminalPane.vue'

const term = {
  id: 't-1', tabId: 'tab-1', cwd: '/x', command: 'claude',
  scrollback: ['$ claude', '› working'], lastOutputAt: Date.now(),
}

describe('TerminalPane', () => {
  it('renders mock output lines', () => {
    const w = mount(TerminalPane, { props: { terminal: term, focused: false } })
    expect(w.text()).toContain('working')
  })
  it('applies focus class', () => {
    const w = mount(TerminalPane, { props: { terminal: term, focused: true } })
    expect(w.classes()).toContain('pane--focused')
  })
  it('emits split-right on right button click', async () => {
    const w = mount(TerminalPane, { props: { terminal: term, focused: true } })
    await w.find('.split-right').trigger('click')
    expect(w.emitted('split-right')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import Icon from '@/components/primitives/Icon.vue'
import type { Terminal } from '@/types/models'
interface Props {
  terminal: Terminal
  focused: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'focus'): void
  (e: 'split-right'): void
  (e: 'split-down'): void
  (e: 'contextmenu', ev: MouseEvent): void
}>()
</script>

<template>
  <div
    :class="['pane', { 'pane--focused': focused, 'pane--dimmed': !focused }]"
    @click="emit('focus')"
    @contextmenu.prevent="emit('contextmenu', $event)"
  >
    <div class="header">{{ terminal.command }} &nbsp; <span class="cwd">{{ terminal.cwd }}</span></div>
    <pre class="body">{{ terminal.scrollback.join('\n') }}</pre>
    <div class="split-controls" @click.stop>
      <button class="sc split-right" @click="emit('split-right')" title="Split right">
        <Icon name="columns" :size="12" />
      </button>
      <button class="sc split-down" @click="emit('split-down')" title="Split down">
        <Icon name="rows" :size="12" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.pane {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid transparent;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text);
  overflow: hidden;
  transition: filter var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
.pane--focused { border-color: var(--accent); }
.pane--dimmed { filter: opacity(0.7); }
.header {
  color: var(--text-muted);
  font-size: 10px;
  margin-bottom: 6px;
}
.cwd { color: var(--text-muted); }
.body {
  margin: 0;
  white-space: pre-wrap;
  color: var(--text-2);
}
.split-controls {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-out);
}
.pane:hover .split-controls { opacity: 1; }
.sc {
  width: 20px;
  height: 20px;
  background: var(--surface-elev);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
.sc:hover { color: var(--text); border-color: var(--text-muted); }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): TerminalPane with focus, dim, split controls"`

---

### Task 8.2: `TerminalSplits.vue` (recursive)

**Files:**
- Create: `frontend/src/components/shell/TerminalSplits.vue`
- Create: `frontend/src/components/shell/TerminalSplits.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TerminalSplits from './TerminalSplits.vue'
import { useTerminalStore } from '@/stores/terminals'

describe('TerminalSplits', () => {
  it('renders leaves and branches', () => {
    const p = createTestingPinia({ stubActions: false, createSpy: () => () => {} })
    const terms = useTerminalStore(p)
    terms.load()
    const w = mount(TerminalSplits, {
      global: { plugins: [p] },
      props: { node: terms.treeFor('tab-osaka-default')!, tabId: 'tab-osaka-default' },
    })
    // Two panes, both commands present
    expect(w.text()).toContain('claude')
    expect(w.text()).toContain('codex')
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import TerminalPane from './TerminalPane.vue'
import { useTerminalStore } from '@/stores/terminals'
import type { SplitNode } from '@/types/models'

interface Props {
  node: SplitNode
  tabId: string
}
const props = defineProps<Props>()
const terminals = useTerminalStore()

const isLeaf = computed(() => props.node.kind === 'leaf')
const style = computed(() => {
  if (props.node.kind !== 'branch') return {}
  const pct = `${(props.node.ratio * 100).toFixed(2)}%`
  const remain = `${((1 - props.node.ratio) * 100).toFixed(2)}%`
  return props.node.direction === 'row'
    ? { gridTemplateColumns: `${pct} 1px ${remain}` }
    : { gridTemplateRows: `${pct} 1px ${remain}` }
})

function onFocus(leafId: string) {
  terminals.setFocus(props.tabId, leafId)
}
function splitRight(leafId: string) {
  terminals.splitPane(props.tabId, leafId, 'row')
}
function splitDown(leafId: string) {
  terminals.splitPane(props.tabId, leafId, 'column')
}
function onDragStart(ev: MouseEvent) {
  if (props.node.kind !== 'branch') return
  const branch = props.node
  const direction = branch.direction
  const startPos = direction === 'row' ? ev.clientX : ev.clientY
  const container = (ev.currentTarget as HTMLElement).parentElement
  if (!container) return
  const size = direction === 'row' ? container.clientWidth : container.clientHeight
  const startRatio = branch.ratio
  function onMove(e: MouseEvent) {
    const delta = (direction === 'row' ? e.clientX : e.clientY) - startPos
    terminals.resizeSplit(props.tabId, branch.id, startRatio + delta / size)
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}
</script>

<template>
  <template v-if="isLeaf">
    <TerminalPane
      :terminal="terminals.terminal((node as any).terminalId)!"
      :focused="terminals.focusedLeaf(tabId) === (node as any).id"
      @focus="onFocus((node as any).id)"
      @split-right="splitRight((node as any).id)"
      @split-down="splitDown((node as any).id)"
    />
  </template>
  <template v-else>
    <div :class="['branch', `branch--${(node as any).direction}`]" :style="style">
      <TerminalSplits :node="(node as any).a" :tab-id="tabId" />
      <div :class="['divider', `divider--${(node as any).direction}`]" @mousedown="onDragStart" />
      <TerminalSplits :node="(node as any).b" :tab-id="tabId" />
    </div>
  </template>
</template>

<style scoped>
.branch { display: grid; width: 100%; height: 100%; }
.branch--row { grid-auto-flow: column; }
.branch--column { grid-auto-flow: row; }
.divider { background: var(--border); }
.divider--row { cursor: col-resize; width: 1px; }
.divider--column { cursor: row-resize; height: 1px; }
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(shell): TerminalSplits recursive renderer with resize"`

---

### Task 8.3: Wire `TerminalSplits` into `TerminalArea`

**Files:** `frontend/src/components/shell/TerminalArea.vue`

- [ ] **Step 1: Update**

Find the `<slot name="splits" />` placeholder in State C and replace the whole `<div v-else ...>` with:

```vue
<div v-else class="splits-container">
  <TerminalSplits v-if="activeTabId && tree" :node="tree" :tab-id="activeTabId" />
</div>
```

And add the import at the top:

```ts
import TerminalSplits from './TerminalSplits.vue'
```

Change the `.splits-placeholder` style to `.splits-container` with:

```css
.splits-container { flex: 1; display: flex; min-width: 0; min-height: 0; }
```

- [ ] **Step 2: Run tests + commit** — `git commit -m "feat(shell): render TerminalSplits in TerminalArea State C"`

---

### Task 8.4: Keybinds for split actions (hoist into keybinds later)

**Files:** `frontend/src/components/shell/TerminalArea.vue`

Register local keybinds on window while `TerminalArea` is mounted. Phase 11 hoists these into a central module.

- [ ] **Step 1: Add keybind logic**

In `TerminalArea.vue` `<script setup>`, add:

```ts
import { onBeforeUnmount, onMounted } from 'vue'

function onKeydown(e: KeyboardEvent) {
  if (!active.value || !activeTabId.value) return
  const focused = terminals.focusedLeaf(activeTabId.value)
  if (!focused) return
  const mod = e.metaKey || e.ctrlKey
  if (!mod) return
  if (e.key === 'd' && !e.shiftKey) {
    e.preventDefault()
    terminals.splitPane(activeTabId.value, focused, 'row')
  } else if (e.key === 'D' && e.shiftKey) {
    e.preventDefault()
    terminals.splitPane(activeTabId.value, focused, 'column')
  } else if (e.key === 'w' && e.shiftKey) {
    e.preventDefault()
    terminals.closeLeaf(activeTabId.value, focused)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
```

- [ ] **Step 2: Commit** — `git commit -m "feat(shell): local keybinds for split/close in TerminalArea"`

---

### Phase 8 done when

- Selecting `ws-osaka` shows the pre-split tree (claude | codex).
- `⌘D` on the focused pane splits right and creates a new mock terminal.
- Dragging the divider between panes resizes smoothly.
- Focused pane has the lime border, others are dimmed.
- Hover over a pane reveals the split-right / split-down buttons on its right edge.
- `⌘⇧W` closes the focused pane; if it was the last pane the `TerminalArea` falls back to State B.
