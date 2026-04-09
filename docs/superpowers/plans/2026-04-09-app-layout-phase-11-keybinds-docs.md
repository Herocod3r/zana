# Phase 11 — Keybinds & Doc Updates

**Goal:** Central `lib/keybinds.ts` registry that replaces the per-component listeners. Update `docs/DESIGN.md` and `docs/architecture.md` to match what shipped.

**Prerequisites:** Phases 1–10 complete.

---

### Task 11.1: Central keybinds registry

**Files:**
- Create: `frontend/src/lib/keybinds.ts`
- Create: `frontend/src/lib/keybinds.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it, vi } from 'vitest'
import { registerKeybinds } from './keybinds'

// Force macOS detection so tests are deterministic across CI platforms.
Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true })

function makeKey(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
}

describe('keybinds', () => {
  it('invokes mapped handler on matching event (mac mod=meta)', () => {
    const fn = vi.fn()
    const off = registerKeybinds({ 'mod+n': fn })
    document.body.dispatchEvent(makeKey({ key: 'n', metaKey: true }))
    expect(fn).toHaveBeenCalled()
    off()
  })
  it('does NOT match ctrl+n on macOS (ctrl should pass through to terminal)', () => {
    const fn = vi.fn()
    const off = registerKeybinds({ 'mod+n': fn })
    document.body.dispatchEvent(makeKey({ key: 'n', ctrlKey: true }))
    expect(fn).not.toHaveBeenCalled()
    off()
  })
  it('ignores events when an input is focused', () => {
    const fn = vi.fn()
    const off = registerKeybinds({ 'mod+n': fn })
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    // Dispatch from the focused element so e.target is the input.
    input.dispatchEvent(makeKey({ key: 'n', metaKey: true }))
    expect(fn).not.toHaveBeenCalled()
    off()
    document.body.removeChild(input)
  })
})
```

- [ ] **Step 2: Implement**

```ts
// frontend/src/lib/keybinds.ts
//
// `mod` is platform-specific: Cmd on macOS, Ctrl on Linux/Windows. We never
// alias both together — on macOS Ctrl combos (e.g. Ctrl+C, Ctrl+D) must pass
// through to the terminal, not be intercepted as app shortcuts.

export type Handler = (e: KeyboardEvent) => void

function isMac(): boolean {
  return /Mac|iPhone|iPad/.test(navigator.platform)
}

function normalize(e: KeyboardEvent): string {
  const parts: string[] = []
  const mod = isMac() ? e.metaKey : e.ctrlKey
  if (mod) parts.push('mod')
  if (e.altKey) parts.push('alt')
  if (e.shiftKey) parts.push('shift')
  // Map named keys to canonical lowercase tokens.
  const map: Record<string, string> = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Enter: 'enter',
    Escape: 'escape',
    Backspace: 'backspace',
    Tab: 'tab',
    ' ': 'space',
  }
  const key = map[e.key] ?? (e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase())
  parts.push(key)
  return parts.join('+')
}

function isEditable(target: EventTarget | null): boolean {
  if (!target) return false
  const el = target as HTMLElement
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return true
  if (el.isContentEditable) return true
  return false
}

export function registerKeybinds(map: Record<string, Handler>): () => void {
  function onKey(e: KeyboardEvent) {
    if (isEditable(e.target)) return
    const key = normalize(e)
    const fn = map[key]
    if (fn) {
      e.preventDefault()
      fn(e)
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(lib): central keybinds registry"`

---

### Task 11.2: Replace per-component keydown with central binds

**Files:**
- Modify: `frontend/src/components/shell/TerminalArea.vue` (remove local `onKeydown`)
- Modify: `frontend/src/components/shell/AppShell.vue`

- [ ] **Step 1: Remove `TerminalArea.vue` local keybind registration**

Delete the `onMounted(() => window.addEventListener('keydown', onKeydown))` and `onBeforeUnmount` block added in Phase 8.

- [ ] **Step 2: Register bindings in `AppShell.vue`**

Add to `<script setup>`:

```ts
import { onBeforeUnmount, onMounted } from 'vue'
import { registerKeybinds } from '@/lib/keybinds'
import { useThemeStore } from '@/stores/theme'

// --- split tree helpers -------------------------------------------------

function withActiveTab<T>(fn: (workspaceId: string, tabId: string) => T | void) {
  if (!workspaces.activeWorkspaceId) return
  const tabId = tabs.activeTabId(workspaces.activeWorkspaceId)
  if (!tabId) return
  return fn(workspaces.activeWorkspaceId, tabId)
}

function withFocusedLeaf<T>(fn: (workspaceId: string, tabId: string, leafId: string) => T | void) {
  withActiveTab((workspaceId, tabId) => {
    const leafId = terminals.focusedLeaf(tabId)
    if (!leafId) return
    fn(workspaceId, tabId, leafId)
  })
}

function splitFocused(direction: 'row' | 'column') {
  withFocusedLeaf((_, tabId, leafId) => terminals.splitPane(tabId, leafId, direction))
}

function closeFocusedPane() {
  withFocusedLeaf((_, tabId, leafId) => terminals.closeLeaf(tabId, leafId))
}

function closeCurrentTab() {
  withActiveTab((workspaceId, tabId) => api.closeTab(workspaceId, tabId))
}

function newCurrentTab() {
  if (workspaces.activeWorkspaceId) tabs.newTab(workspaces.activeWorkspaceId)
}

// --- State-B recovery spawn (used by ⌘⇧T) ------------------------------
//
// When the current tab's split tree is empty (recovery state), spawn a new
// terminal into the tab. Otherwise fall through to splitting the focused
// pane to the right (common "new terminal" expectation in split mode).
function spawnOrSplit() {
  withActiveTab((workspaceId, tabId) => {
    const tree = terminals.treeFor(tabId)
    const emptyLeaf = tree && tree.kind === 'leaf' && !terminals.terminal(tree.terminalId)
    if (!tree || emptyLeaf) {
      const id = `t-spawn-${Date.now()}`
      const ws = workspaces.workspaces.find((w) => w.id === workspaceId)
      terminals.terminalsById[id] = {
        id,
        tabId,
        cwd: ws?.worktreePath ?? '/',
        command: 'zsh',
        mockOutput: ['$ _'],
        lastOutputAt: Date.now(),
      }
      terminals.setTreeFor(tabId, { kind: 'leaf', id: `lf-spawn-${Date.now()}`, terminalId: id })
      return
    }
    const leafId = terminals.focusedLeaf(tabId)
    if (leafId) terminals.splitPane(tabId, leafId, 'row')
  })
}

// --- "Move to new tab" detachment --------------------------------------

function moveFocusedPaneToNewTab() {
  withFocusedLeaf((workspaceId, tabId, leafId) => {
    const tree = terminals.treeFor(tabId)
    if (!tree || tree.kind === 'leaf') return // nothing to detach when there's only one pane
    // Find the leaf's terminalId
    let terminalId: string | null = null
    const stack = [tree]
    while (stack.length) {
      const n = stack.pop()!
      if (n.kind === 'leaf' && n.id === leafId) {
        terminalId = n.terminalId
        break
      }
      if (n.kind === 'branch') {
        stack.push(n.a, n.b)
      }
    }
    if (!terminalId) return
    const newTab = tabs.newTab(workspaceId)
    terminals.setTreeFor(newTab.id, {
      kind: 'leaf',
      id: `lf-moved-${Date.now()}`,
      terminalId,
    })
    terminals.closeLeaf(tabId, leafId)
    tabs.setActive(workspaceId, newTab.id)
  })
}

// --- Tab and workspace cycling -----------------------------------------

function cycleTab(delta: number) {
  if (!workspaces.activeWorkspaceId) return
  const list = tabs.tabsFor(workspaces.activeWorkspaceId)
  if (list.length === 0) return
  const currentId = tabs.activeTabId(workspaces.activeWorkspaceId)
  const idx = Math.max(0, list.findIndex((t) => t.id === currentId))
  const next = list[(idx + delta + list.length) % list.length]
  tabs.setActive(workspaces.activeWorkspaceId, next.id)
}

function cycleWorkspace(delta: number) {
  const list = workspaces.workspaces
  if (list.length === 0) return
  const idx = Math.max(0, list.findIndex((w) => w.id === workspaces.activeWorkspaceId))
  const next = list[(idx + delta + list.length) % list.length]
  workspaces.select(next.id)
}

function cyclePaneFocus(delta: number) {
  withActiveTab((_, tabId) => {
    const tree = terminals.treeFor(tabId)
    if (!tree) return
    const leaves: string[] = []
    const stack = [tree]
    while (stack.length) {
      const n = stack.pop()!
      if (n.kind === 'leaf') leaves.push(n.id)
      else {
        // Push right first so left is processed first (in-order left-to-right).
        stack.push(n.b, n.a)
      }
    }
    if (leaves.length === 0) return
    const current = terminals.focusedLeaf(tabId)
    const idx = Math.max(0, leaves.indexOf(current ?? ''))
    const next = leaves[(idx + delta + leaves.length) % leaves.length]
    terminals.setFocus(tabId, next)
  })
}

// --- Registration --------------------------------------------------------

let unbind: (() => void) | null = null
onMounted(() => {
  unbind = registerKeybinds({
    // Creation
    'mod+shift+n': () => { addProjectOpen.value = true },
    'mod+n': () => { newWorkspaceOpen.value = true },
    'mod+t': () => newCurrentTab(),
    'mod+shift+t': () => spawnOrSplit(), // ⌘⇧T — State-B recovery / new terminal in current tab

    // Closing
    'mod+w': () => closeCurrentTab(),
    'mod+shift+w': () => closeFocusedPane(),

    // Splitting
    'mod+d': () => splitFocused('row'),
    'mod+shift+d': () => splitFocused('column'),

    // Detachment
    'mod+shift+enter': () => moveFocusedPaneToNewTab(), // ⌘⇧↵

    // Cycling
    'mod+alt+right': () => cycleTab(1),  // ⌘⌥→
    'mod+alt+left': () => cycleTab(-1),  // ⌘⌥←
    'mod+alt+up': () => cycleWorkspace(-1), // ⌘⌥↑
    'mod+alt+down': () => cycleWorkspace(1), // ⌘⌥↓
    'mod+]': () => cyclePaneFocus(1),    // ⌘]
    'mod+[': () => cyclePaneFocus(-1),   // ⌘[

    // Settings / theme
    'mod+,': () => { settingsOpen.value = true },
    'mod+shift+l': () => { useThemeStore().cycle() },
  })
})
onBeforeUnmount(() => {
  unbind?.()
})
```

**Note:** `⌘Q` is not bound here — quit is the OS's responsibility (macOS handles it via the application menu).

- [ ] **Step 3: Commit** — `git commit -m "feat(shell): hoist keybindings into AppShell via central registry"`

---

### Task 11.3: Stub `lib/ghostty.ts`

**Files:**
- Create: `frontend/src/lib/ghostty.ts`
- Create: `frontend/src/lib/terminal-themes.ts`

- [ ] **Step 1: Stub `ghostty.ts`**

```ts
// Stub terminal renderer adapter. Real implementation ships in a later phase
// (xterm.js first, then ghostty-web). TerminalPane renders mock content
// directly in scope B; this stub exists so the import path stabilizes.

export interface TerminalAdapter {
  init(container: HTMLElement): void
  write(data: string): void
  onInput(handler: (data: string) => void): () => void
  resize(cols: number, rows: number): void
  fit(): { cols: number; rows: number }
  focus(): void
  blur(): void
  clear(): void
  reset(): void
  serialize(): string
  restore(snapshot: string): void
  dispose(): void
}

export function createNoopAdapter(): TerminalAdapter {
  return {
    init() {},
    write() {},
    onInput() { return () => {} },
    resize() {},
    fit() { return { cols: 80, rows: 24 } },
    focus() {},
    blur() {},
    clear() {},
    reset() {},
    serialize() { return '' },
    restore() {},
    dispose() {},
  }
}
```

- [ ] **Step 2: Stub `terminal-themes.ts`**

```ts
// Placeholder ANSI palettes. Real palettes ship with the xterm integration.
export const darkPalette = { name: 'zana-dark' }
export const lightPalette = { name: 'zana-light' }
```

- [ ] **Step 3: Commit** — `git commit -m "feat(lib): stub ghostty adapter and terminal themes"`

---

### Task 11.4: Update `docs/DESIGN.md`

**Files:** `docs/DESIGN.md`

- [ ] **Step 1: Replace the "Terminal grid layout" section**

Find the section titled `## Terminal grid layout`. Replace its body (keep the heading) with:

```markdown
Terminals inside a tab are arranged as a **binary split tree**, not a fixed grid. Splitting is directional:

- `⌘D` splits the focused terminal to the right (creates a horizontal row with a new terminal on the right).
- `⌘⇧D` splits the focused terminal downward (creates a vertical column with a new terminal below).
- Each split operation wraps the focused leaf in a branch node containing the original leaf and a new leaf.

Each branch has a resize handle (1px hairline using `--border`) that can be dragged to adjust the ratio between its two children, clamped between 0.1 and 0.9. Cursor changes to `col-resize` or `row-resize` on hover. No snap points.

The focused pane has a 1px `--accent` border inset 1px so it does not shift layout. Unfocused panes drop to 70% foreground opacity so the eye falls on the focused pane.

Each pane has hover-reveal split controls on its right edge (columns / rows icons). Close via `⌘⇧W` or right-click → Close pane.

When all panes in a tab are closed, the tab shows an empty state with a centered "New terminal" ghost button. When the last tab in a workspace is closed, a new empty tab is created automatically (invariant: every workspace has at least one tab).
```

- [ ] **Step 2: Add the resizable sidebar note under "Layout"**

After the "Three-region layout" bullet, add:

```markdown
- **Sidebar width is resizable**: default 240px, minimum 180px, maximum 400px. Drag the 1px hairline between sidebar and right region to resize; double-click to reset. Width is persisted to `localStorage.zana.sidebar.width`.
```

- [ ] **Step 3: Add the conditional tab bar note**

After the three-region layout bullet, add:

```markdown
- **Tab bar visibility**: the 32px tab bar is rendered only when the active workspace has more than one tab. A workspace with a single tab shows its terminal area flush against the sidebar drag region (no tab bar). This matches Ghostty's progressive disclosure.
```

- [ ] **Step 4: Add status bar to the layout section**

After the tab bar note:

```markdown
- **Status bar**: a 22px bottom strip across the full width shows the active workspace name, git branch, tab and terminal counts, and a rolled-up activity dot on the right.
```

- [ ] **Step 5: Update theme toggle wording**

Find the "manual override" section under Theming and ensure it says the theme cycle button in the sidebar footer cycles `System → Light → Dark → System`.

- [ ] **Step 6: Commit** — `git commit -m "docs(design): binary splits, resizable sidebar, tab bar visibility, status bar"`

---

### Task 11.5: Update `docs/architecture.md`

**Files:** `docs/architecture.md`

- [ ] **Step 1: Replace decision 4 (terminal grid)**

Find the decision titled "Terminal grid:" (around line 153 in the current file). Replace the body text with:

```markdown
4. **Terminal layout:** Each tab holds a binary split tree of terminal panes (not an auto-grid). New workspaces are auto-created with one default tab whose split tree is a single terminal spawned in the worktree directory. Users split the focused pane via `⌘D` (right) or `⌘⇧D` (down); each split wraps the focused leaf in a branch node. Branches have draggable resize handles clamped between 0.1 and 0.9 of the axis. Closing the last pane in a tab leaves an empty state with a centered "New terminal" button; closing the last tab in a workspace auto-creates a new empty tab (invariant: every workspace has at least one tab).
```

- [ ] **Step 2: Add a new decision about the tab layer**

After decision 4, add:

```markdown
4a. **Tab layer (optional container):** A workspace has one or more tabs. Each tab owns its own split tree. The tab bar (32px) is rendered only when the workspace has more than one tab; a workspace with exactly one tab renders its terminal area without a tab bar. Tabs are created explicitly via `⌘T` (empty tab with a "New terminal" button) or implicitly via "Move to new tab" on a focused pane in an existing split tree. Closing a tab replaces the last surviving tab with a fresh empty tab rather than leaving the workspace in a tab-less state.
```

- [ ] **Step 3: Update the project structure snippet**

Find the front-end `frontend/src/` subtree in the architecture doc and expand it with the actual phase-4 layout (shell, primitives, overlays, stores, services, mocks, lib, types, tests). Copy the tree from `docs/superpowers/plans/2026-04-09-app-layout-plan.md` §"File structure (target)."

- [ ] **Step 4: Remove the OSC-7 confusion and the auto-sqrt grid mention elsewhere**

Skim the document for any remaining references to `ceil(sqrt(pane_count))` and replace with a pointer to the new binary-split description.

**Preserve the "optional tabs" framing.** The hierarchy is **Project → Workspace → Split tree (+ optional Tabs)**, NOT `workspaces → tabs → panes`. The default single-tab case has no tab layer at all — the split tree lives directly under the workspace. When you update any wording in the architecture doc, phrase it as "a workspace holds a split tree of terminal panes; when the user explicitly creates additional tabs, each tab owns its own split tree and the 32px tab bar becomes visible." Do NOT insert `tabs` as a mandatory middle layer.

- [ ] **Step 5: Commit** — `git commit -m "docs(architecture): binary-split tree, optional tab layer, updated frontend tree"`

---

### Task 11.6: Final verification

- [ ] **Step 1: Run full test suite**

```bash
cd frontend && pnpm run typecheck && pnpm run lint && pnpm run test
```
Expected: everything green.

- [ ] **Step 2: Boot-check**

```bash
pnpm run dev
```
Click through the app:

1. Default state — `ws-osaka` selected, no tab bar, two tiled panes (claude + codex).
2. Select `ws-kyoto` — tab bar appears with "investigation" and "logs" tabs.
3. Select `ws-madrid` — State B with "New terminal" button.
4. Click "New terminal" → terminal appears.
5. Press `⌘D` → splits right.
6. Press `⌘⇧D` → splits down.
7. Press `⌘⇧W` → closes focused pane.
8. Right-click a pane in a split tree — menu with "Move to new tab" enabled.
9. Click "Move to new tab" — tab bar appears with the new tab.
10. Cycle theme via footer button → UI flips instantly.
11. Cmd+, opens Settings; change theme there too.
12. Cmd+Shift+N opens AddProject dialog.
13. Resize the sidebar by dragging the right edge — clamps at 180 and 400. Double-click resets.

- [ ] **Step 3: Commit any remaining tweaks**

If the boot-check reveals minor issues, fix them with targeted commits. No bulk refactors.

---

### Phase 11 done when

- Full test suite passes.
- Manual boot-check passes every step.
- `DESIGN.md` and `architecture.md` reflect the shipped layout.
- `docs/superpowers/plans/2026-04-09-app-layout-plan.md` entries are all checked off.
