# Zana — App Layout Design Spec

**Date:** 2026-04-09
**Scope:** Frontend shell and component library (presentational, mock-backed). No backend wiring.
**Related docs:** `docs/architecture.md`, `docs/DESIGN.md`, `docs/ceo-plan.md`, `TODOS.md`

---

## 1. Purpose

Design and build the Vue 3 frontend layout for the Zana desktop app: a presentational shell and a complete set of styled components wired to mock data. At the end of this work, every visible surface of the app exists, every component is themed for dark and light, and the whole thing can be reviewed aesthetically without any backend integration. Later phases will replace the mocks in `services/api.ts` with real Wails bindings.

Deliverable: you can open the app, flip through every state by mutating fixture data, and the experience matches the Industrial Minimalism aesthetic locked in `docs/DESIGN.md`.

## 2. Scope

**In scope:**

- Application shell: window frame, 3-region layout, status bar.
- Sidebar: nested project → workspace tree, footer actions, resize handle.
- Right region: conditional tab bar, terminal area with split tree rendering, all empty states.
- Theme system: `system | light | dark` preference, resolved mode, flash prevention, CSS variable tokens.
- Component library: layout primitives, form primitives, overlays, context menus (see §9).
- Mock fixtures: projects, workspaces, tabs, split trees, activity states.
- Pinia stores for theme, projects, workspaces, tabs, terminal metadata, toasts — all backed by mock data.
- Keyboard shortcut registration (bindings fire but most actions mutate mock state only).
- Updates to `docs/architecture.md` and `docs/DESIGN.md` to reflect structural decisions from this spec (see §12).

**Out of scope (deferred to later phases or `TODOS.md`):**

1. Wails bindings and real backend integration. `services/api.ts` returns mocks; it will be the only file to flip when backend wiring happens.
2. xterm.js / ghostty-web rendering. `TerminalPane` shows static mock content. The `lib/ghostty.ts` adapter is stubbed to a noop.
3. Session persistence. No save/restore; mocks reset on reload.
4. Drag-to-reorder workspaces in the sidebar. Tab drag-reorder **is** in scope.
5. Real create/delete/rename for projects, workspaces, and tabs — the destructive actions need backend. Menu items exist and wire to mock no-ops.
6. Cmd+P fuzzy switcher (`⌘K` / `⌘P` are reserved, not implemented).
7. Multi-window support and drag-drop tabs between windows.
8. Settings modal wiring beyond the theme toggle. Font-size and font-family fields are placeholders.
9. Sidebar collapse hotkey.
10. Polished tab overflow dropdown (a minimal popover list is in scope; keyboard nav and fuzzy filter are not).

## 3. Structural decisions

### 3.1 Hierarchy

**Project → Workspace → Split tree (optional: Tabs)**

- **Project:** a git repo the user has added to Zana.
- **Workspace:** one git worktree under a project. Always selected exclusively; one workspace is "active" per window.
- **Split tree:** a binary tree of terminal panes inside a workspace. Every non-empty workspace has exactly one split tree.
- **Tab:** an _additional_ split tree in the same workspace. Tabs only exist when the user explicitly asks for more than one split tree. This is the critical simplification — see §3.4.

This replaces the `projects → workspaces → panes` hierarchy implied in `docs/architecture.md`. Tabs are a new concept, introduced as an _optional_ multiplier on split trees rather than a required container.

### 3.2 Sidebar information architecture

**Nested tree, all projects visible (VS Code file explorer model).** Each project is a collapsible group. Workspaces render as indented children under their project. This is Option A from the brainstorming session and was chosen partly because it is the only sidebar shape that grows cleanly into future multi-window support — each window would render the same tree with its own selection pointer.

Alternatives considered and rejected:

- **Two-pane drill-down** (projects top, workspaces bottom): adds a horizontal rule and costs a click per project switch. Compromise that doesn't commit to either model.
- **Swap/breadcrumb** (single project visible, switcher pill on top, Linear-style): tighter mental model but loses at-a-glance cross-project scanning and blocks the multi-window future.

### 3.3 Binary-tree splits, not auto-sqrt grid

Terminals within a split tree are arranged via **directional binary splits** (tmux/iTerm model), not the `ceil(sqrt(N))` auto-grid currently specified in `DESIGN.md`. Users split explicitly — right or down — and the layout is a binary tree of left/right and top/bottom divisions. This is more expressive, more familiar, and removes the need for the layout engine to reshuffle pane positions when a pane is added or removed.

**`DESIGN.md` update required:** the "Terminal grid layout" section must be rewritten to describe binary splits.

### 3.4 Tab bar visibility — the Ghostty rule

**The tab bar is hidden when a workspace has exactly one split tree.** It appears only when the user creates a second tab (either via `⌘T` or via "Move to new tab" on a pane). This is the same progressive disclosure Ghostty uses.

Consequences:

- A brand new workspace auto-spawns its first terminal in the worktree directory. The user never has to click through an "empty workspace" state on the happy path.
- The word "tab" may never enter the vocabulary of users who only ever want split panes.
- Going from 1 → 2 tabs causes one 32px layout shift. This is tolerated because it happens at most once per workspace switch.
- Going from 2 → 1 tab hides the bar again. One rule, easy to reason about, no session-scoped stickiness.

### 3.5 Window single-window v1

Multi-window support and drag-drop tabs between windows are deferred to `TODOS.md`. Every decision in this spec is compatible with a future multi-window world — the sidebar tree can be shared across windows, and each window can hold its own active-workspace pointer.

## 4. Layout and frame

### 4.1 Window chrome

Hidden titlebar using Wails' macOS `titlebarAppearsTransparent: true` + `titleBarStyle: hiddenInset`. Traffic lights float over the top-left of the sidebar. No native titlebar strip.

- Window min size: 800 × 500
- Corner radius: 10px (matches macOS native)
- Drag region: the top 44px of the sidebar is a `-webkit-app-region: drag` zone. Traffic lights occupy the top-left of that zone. No other drag regions.
- Status bar is NOT a drag region.

**Linux fallback:** Wails + GTK may not honor `hiddenInset`. On Linux, fall back to a native titlebar. macOS is the reference experience.

### 4.2 Three regions + status bar

```
┌─────────────────────────────────────────────┐
│ 🔴🟡🟢                                      │  ← 44px drag zone (sidebar top)
├────────────────┬────────────────────────────┤
│                │  (tab bar 32px — only      │
│  SIDEBAR       │   when tabs.length > 1)    │
│  (resizable    ├────────────────────────────┤
│   180–400px,   │                            │
│   default 240) │  TERMINAL AREA             │
│                │  (fills remainder,         │
│                │   binary-split tree)       │
│                │                            │
│ ─── footer ─── │                            │  ← sidebar footer 40px
│  [+] [⚙] [◐]   │                            │
├────────────────┴────────────────────────────┤
│ STATUS BAR 22px — workspace · branch · …    │
└─────────────────────────────────────────────┘
```

**Measurements:**

- Sidebar width: default 240px, min 180px, max 400px. Resizable via dragging the 1px hairline at the right edge (4px invisible hit area). Double-click hairline resets to 240px. Persisted to `localStorage.zana.sidebar.width`.
- Tab bar: 32px height when present.
- Sidebar footer: 40px height.
- Status bar: 22px height.
- Dividers: 1px hairlines using `--border` token. No shadows, no gradients, no insets.

**Edge treatments:**

- Terminal panes go edge-to-edge against the sidebar hairline, the tab bar hairline (when present), and the status bar hairline. No padding around terminals — internal padding lives inside the xterm.js instance once rendering is wired.

## 5. Sidebar

### 5.1 Vertical structure

```
┌──────────────────────────┐
│   (44px drag region)     │
├──────────────────────────┤
│  PROJECTS                │  ← section header, 24px
├──────────────────────────┤
│  ▾ zana                  │  ← ProjectRow, 26px
│      ● tokyo             │  ← WorkspaceRow, 24px
│      ● osaka   (active)  │
│      ● kyoto             │
│                          │
│  ▸ finplat               │
│  ▸ gstack                │
│         (scrolls)        │
├──────────────────────────┤
│  [+]  [⚙]  [◐]           │  ← footer, 40px
└──────────────────────────┘
```

### 5.2 Section header `PROJECTS`

- Geist Mono 11px / 600 / uppercase / letter-spacing 0.08em
- Color: `--text-muted`
- Padding: 8px 12px
- No trailing actions (the `+` button lives in the footer only — avoids duplicating the affordance).

### 5.3 ProjectRow

- 26px tall, 12px left padding.
- Twisty glyph: `▸` (collapsed) / `▾` (expanded), 10px, color `--text-2`. Rotates via the glyph itself, no CSS rotation.
- Name: Geist Mono 12px / 500, color `--text-2` (dim by default — projects are grouping headers, not focused content).
- Hover: background `--surface-elev`.
- Click anywhere on the row toggles collapse.
- No active state. Projects never "select."
- Right-click: context menu (Rename, Remove from Zana) — all items wired to mock no-ops in this scope.

### 5.4 WorkspaceRow

- 24px tall, 28px left padding (indented under the project).
- Leading: 5px activity dot with 6px bounding box.
- Name: Geist Mono 12px / 500, color `--text-2`.
- Hover: background `--surface-elev`, name brightens to `--text`.
- **Active state:** 2px lime left bar (`--accent`), name brightens to `--text`, row background `rgba(from var(--accent) r g b / 0.06)`. The lime bar sits at the inner left edge of the sidebar (margin-left: -2px).
- Click: select this workspace. The right region updates immediately.
- Right-click: context menu (Rename, Delete, Duplicate branch) — mock no-ops.

**Activity dot states** (`ActivityDot.vue`):

- `active`: `--accent` with a subtle 4px glow (box-shadow). Trigger in the real backend: PTY output in the last 5 seconds. In mocks: driven by fixtures.
- `recent`: `--warning`. Trigger: 5–60s since last output.
- `idle`: `--text-muted`. Trigger: >60s or no terminals.
- **Workspace rollup:** the dot equals the max activity across every terminal in every tab of that workspace.

Transitions between states: 200ms ease-out on `background-color` and `box-shadow`.

### 5.5 Scroll

The project list scrolls when it overflows. Scrollbar: 6px wide, auto-hide, visible only on sidebar hover. Use `scrollbar-width: thin` + custom WebKit pseudo-elements (`::-webkit-scrollbar*`).

### 5.6 Empty state (no projects)

- Vertically centered in the project list area.
- Single line: "No projects yet" in Geist Mono 12px, `--text-muted`.
- Below: one ghost button "Add project" (14px height, minimal chrome). Click opens the folder picker (mocked).
- No illustrations, no large hero, no welcome text.

### 5.7 Footer (40px)

- 1px top hairline separates the footer from the scroll area.
- Three icon buttons, left-aligned, 28px square, 4px gap, 8px left padding:
  1. `plus` — Add project. Click opens the folder picker (mock).
  2. `gear-six` — Settings. Click opens `SettingsModal`.
  3. `moon-stars` / `sun` / `circle-half` — Theme toggle. Icon reflects current **preference** (not resolved). Click cycles `system → light → dark → system`.
- Icons via Phosphor (see §9.2). Stroke-only variants. 14px, `--text-muted` at rest, `--text` on hover.
- No labels. Tooltip on hover (Geist Mono 11px, 200ms delay).

## 6. Right region

### 6.1 Conditional tab bar (32px)

The tab bar is rendered only when `activeWorkspace.tabs.length > 1`. See §3.4 for the rationale.

**Tab element:**

- 32px tall, flush with the left sidebar hairline.
- Width: `fit-content`, `min-width: 120px`, `max-width: 200px`. Labels truncate with ellipsis beyond 200px.
- Padding: 0 12px.
- Content left-to-right: 5px activity dot → 8px gap → label → 6px gap → `×` close button.
- Active tab: 2px lime bottom border (`--accent`), label brightens to `--text`. No background fill.
- Inactive tab: no background, label `--text-2`. 1px separator on the right at ~8% opacity.
- Hover inactive: label brightens to `--text`, `×` fades in (opacity 0 → 1, 80ms).
- `×` close button on the active tab is always visible.

**Tab activity dot rollup:** max activity across all terminals in that tab's split tree.

**New tab button:** `+` icon flush after the last tab (not pinned to the right edge). 28px square. Creates an **empty** tab with the centered "New terminal" prompt.

**Overflow:** when tabs exceed the right region's width, the `+` button and trailing tabs are clipped. A `⟩` chevron button appears at the right edge — click opens a minimal popover listing all tabs (Geist Mono 12px, active highlighted, click to switch). Polished overflow is deferred.

**Reorder:** drag-and-drop. Horizontal only. 100ms ease-out slide animation on other tabs when one is dragged past (this is an allowed motion exception — drag without animation feels broken on touchpads).

**Close tab:**

- 0 terminals in the tab → close immediately.
- 1+ terminals → `ConfirmDialog`: "N terminals are still running. Close anyway?" Default = Cancel.
- Closing the second-to-last tab causes `tabs.length === 1`, which hides the bar again.

**Double-click tab label → inline rename.** Field swaps into place with the label's text preselected. Enter commits, Escape cancels, blur commits.

### 6.2 Terminal area

Below the tab bar (or directly below the drag region when no tab bar is present). Renders one of:

**State A — no workspace selected** (`activeWorkspace == null`):

- Centered: "Select a workspace" in Geist Sans 14px, `--text-muted`.
- Below: "Or create one with ⌘N" in Geist Mono 11px, `--text-muted`.

**State B — workspace selected, active split tree is empty** (recovery state):

- Reached only when the user explicitly closes the last pane in the current split tree.
- Centered 140 × 56 ghost button labeled "New terminal" (Geist Mono 12px / 500). 1px `--border-strong`, 4px radius, transparent background.
- Hover: border brightens to `--accent`, label to `--text`.
- Below button: "⌘⇧T" in Geist Mono 11px, `--text-muted`.
- Click: spawns a terminal in the workspace's worktree directory (mock).

**State C — workspace selected, split tree has terminals:**

- Renders `<TerminalSplits>` with the workspace's active split tree.
- Terminal panes fill the area. 1px `--border` hairlines between panes.
- Drag hairlines to resize: cursor becomes `col-resize` or `row-resize`. No snap points. Resize is instant.

**Focused pane:**

- 1px lime border (`--accent`) inset 1px so it does not shift layout.
- Only one pane has focus at a time (per workspace).

**Unfocused panes:**

- Foreground opacity drops to 70% (`filter: opacity(0.7)`) while another pane in the same tab is focused. This draws the eye to the active pane (research pattern from Ghostty/Warp).
- Click any pane to focus it. `⌘[` / `⌘]` cycle focus forward/back.

**Split controls per pane:**

- Two small icon buttons on the right edge of each pane, vertically centered, 4px from the edge: `▮→` split-right, `▮↓` split-down.
- 16px square, stroke-only, `--text-muted` at rest, `--text` on hover.
- **Hover-reveal on that specific pane only.** Not visible at rest.
- Keybinds: `⌘D` = split right, `⌘⇧D` = split down.

**Close pane:** `⌘⇧W` or right-click → Close pane. Confirm dialog if terminal is "running" (mock always reports running).

**Right-click pane context menu:**

```
Split right          ⌘D
Split down           ⌘⇧D
───────────
Move to new tab      ⌘⇧↵
───────────
Close pane           ⌘⇧W   (destructive, red)
```

"Move to new tab" detaches the clicked pane from the current split tree and creates a new tab containing just that pane. If the current tab would be left empty by the detach, the detach is still allowed (the remaining pane in the current tab is the only one) — but in practice the operation is **disabled** when the current tab has exactly one pane (nothing to detach).

## 7. Status bar (22px)

Rendered at the bottom of the window, across both sidebar and right region.

- 1px top hairline (`--border`).
- Background: `--surface`.
- Font: Geist Mono 10px, color `--text-muted`.
- Horizontal layout, 12px padding:
  - **Left cluster** (workspace context): `<workspace name>` · `<git branch>` · `<terminal count>` — each separated by a dim `·`. When no workspace is selected, shows `Ready`.
  - **Right cluster** (transient): most recent toast-worthy message, auto-clears after 4s. Or empty.
  - **Far right:** a single activity dot showing the rolled-up activity for the entire window (max across all workspaces) — this is the at-a-glance "anything running?" indicator.

Text never wraps. Overflow uses ellipsis in the middle (workspace name can be long; branch name can be long; we truncate the longer one first).

## 8. Theme system

### 8.1 Store shape

```ts
// frontend/src/stores/theme.ts
interface ThemeState {
  preference: 'system' | 'light' | 'dark'
  resolved: 'light' | 'dark'
}
```

Persisted to localStorage as `zana.theme.preference`. Only the preference persists; `resolved` is always derived.

### 8.2 Initialization — prevent flash

1. **Inline script in `index.html`** runs before Vue mounts. Synchronously reads `localStorage.zana.theme.preference` (defaults to `'system'` if absent), computes resolved by consulting `matchMedia('(prefers-color-scheme: dark)')` when preference is `'system'`, sets `document.documentElement.setAttribute('data-theme', resolved)`.
2. **Vue mounts.** The theme store runs the same logic reactively.
3. **OS-change listener.** When preference is `'system'`, the store subscribes to `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', …)` and updates `resolved` and the `data-theme` attribute when the OS flips.
4. **User toggles preference in settings or via the footer cycle button.** The store updates, writes to localStorage, recomputes resolved, updates the DOM attribute.

### 8.3 CSS variable tokens

Tokens live in `frontend/src/styles/tokens.css`. Dark is the `:root` default; light is a `[data-theme="light"]` override. Exact values match `docs/DESIGN.md` §Color:

```css
:root {
  --bg: #0B0B0E;
  --surface: #141418;
  --surface-elev: #1C1C22;
  --border: #26262E;
  --border-strong: #34343E;
  --accent: #A3E635;
  --accent-fg: #0a0a0a;
  --text: #E8E8EA;
  --text-2: #9090A0;
  --text-muted: #5C5C68;
  --warning: #FBBF24;
  --error: #F87171;
  --mono: 'Geist Mono', ui-monospace, Menlo, monospace;
  --sans: 'Geist Sans', -apple-system, system-ui, sans-serif;
}

[data-theme="light"] {
  --bg: #F8F8FA;
  --surface: #FFFFFF;
  --surface-elev: #FFFFFF;
  --border: #E4E4EA;
  --border-strong: #D0D0D8;
  --accent: #65A30D;
  --accent-fg: #FFFFFF;
  --text: #0B0B0E;
  --text-2: #5C5C68;
  --text-muted: #9090A0;
  --warning: #D97706;
  --error: #DC2626;
}
```

### 8.4 No hardcoded hex

Components must reference CSS variables only. A lint rule rejects hex literals (`/#[0-9a-f]{3,8}\b/i`) in any `.vue` or `.ts` file other than `tokens.css` and the fixture files.

### 8.5 No theme transition animation

Theme swaps are instant. Per `DESIGN.md`'s near-zero-motion rule. Crossfades fight the aesthetic and add a jarring UI moment on OS theme changes.

### 8.6 Terminal theming (stubbed in scope B)

The `lib/ghostty.ts` adapter is a noop for now, but its expected contract for theming is:

- Derive an `xterm`-compatible theme object from the current CSS variables (bg, fg, cursor, ANSI palette).
- The ANSI palette is defined in `frontend/src/lib/terminal-themes.ts` — one fixed palette for dark, one for light. User overrides are post-v1.
- On theme change, the adapter iterates through live terminal instances (held in a non-reactive ref per `TerminalPane`) and applies the new theme imperatively.

In scope B, `TerminalPane` displays static mock content styled directly with the CSS variables, so theme changes update mock terminals automatically via CSS.

## 9. Component inventory

### 9.1 Layout shell

| Component | Purpose |
|---|---|
| `AppShell.vue` | Root. Hosts the 3-region grid, status bar, modal portal. Applies `data-theme` from `themeStore`. |
| `Sidebar.vue` | 240px (resizable) left region. Owns the width persistence and drag handle. |
| `ProjectTree.vue` | Scrollable list; maps over `projectStore.projects`. Renders empty state when empty. |
| `ProjectRow.vue` | Collapsible project header. Props: `project`, `expanded`. Emits `toggle`. |
| `WorkspaceRow.vue` | Single workspace item. Props: `workspace`, `active`. Emits `select`. |
| `SidebarFooter.vue` | 40px bottom strip with three icon buttons. Emits intents. |
| `RightRegion.vue` | Tab bar (conditional) + terminal area. Decides which state to render based on the active workspace and its active split tree. |
| `TabBar.vue` | 32px row of tabs. Handles drag-reorder, overflow, `+` button. |
| `TabItem.vue` | Single tab. Double-click label for inline rename. |
| `TerminalArea.vue` | Switches between State A (no workspace), State B (empty split tree), State C (splits). |
| `TerminalSplits.vue` | Recursive binary-tree split container. Handles resize drag between panes. |
| `TerminalPane.vue` | Leaf of the split tree. Wraps the (stubbed) terminal renderer, shows focus border and dim state, hover-reveal split controls. |
| `StatusBar.vue` | 22px bottom strip. |

### 9.2 Primitives

| Component | Purpose |
|---|---|
| `Button.vue` | Variants: `primary` (solid accent), `ghost` (1px border, transparent), `icon` (bare). Sizes: `sm`, `md`. |
| `TextInput.vue` | Borderless, 1px bottom rule that brightens to `--accent` on focus. v-model. |
| `Select.vue` | Dropdown in the same borderless style. v-model. |
| `Toggle.vue` | 28×16 switch with 14px knob. 120ms ease-out slide (allowed motion exception — switches feel broken without it). |
| `Checkbox.vue` | 14×14 square with lime check. |
| `Tooltip.vue` | Hover tooltip. Geist Mono 11px, 200ms delay. Likely implemented with a small handwritten positioner; swap to Floating UI if needed. |
| `Icon.vue` | Thin wrapper around the Phosphor icon set (stroke-only variants). Bundled set for v1: `plus`, `gear-six`, `moon-stars`, `sun`, `circle-half`, `caret-right`, `caret-down`, `x`, `columns`, `rows`, `folder`, `warning`, `x-circle`, `check`. |
| `ActivityDot.vue` | 5px circle. Props: `state` (`active`/`recent`/`idle`). 200ms ease-out transitions on color and glow. |

**Icon library:** Phosphor (MIT licensed, stroke variants match the Industrial Minimalism aesthetic well).

### 9.3 Overlays

| Component | Purpose |
|---|---|
| `Modal.vue` | Base modal. No title bar, no close `×`. Raycast-style. Props: `open`, `width` (default 480px). Teleports to `ModalPortal`. Esc closes. Click outside closes. |
| `ModalPortal.vue` | Single mount point for all modals, instantiated by `AppShell`. |
| `ConfirmDialog.vue` | Built on `Modal`. Props: `title`, `body`, `confirmLabel`, `cancelLabel`, `destructive`. Enter = confirm, Esc = cancel. |
| `NewWorkspaceDialog.vue` | Fields: display name (with Suggest button), branch name, base branch (`Select`), "Create new branch" toggle. Per `architecture.md` §9a. Wired to mock no-ops. |
| `AddProjectDialog.vue` | Single path field + folder picker button. Validates repo existence (mocked). |
| `SettingsModal.vue` | Sections: **Appearance** (theme preference radio group: System / Light / Dark — fully functional). **Terminal** (placeholder fields for font size and family — stubbed). |
| `Toast.vue` | Single notification card. Variants: `info`, `success`, `warning`, `error`. |
| `ToastHost.vue` | Stack of up to 3 toasts, bottom-right above the status bar, 16px margin. Auto-dismiss after 4s unless hovered. Backed by `toastStore`. |

### 9.4 Context menus

| Component | Purpose |
|---|---|
| `ContextMenu.vue` | Right-click menu. Positioned at cursor. Each item: label + optional keyboard shortcut hint. Keyboard nav with arrow keys + Enter. Used by project rows, workspace rows, tabs, and terminal panes. |

### 9.5 Dev fixtures

`frontend/src/mocks/fixtures.ts` — hardcoded mock data. Exports:

- 3 projects: `zana`, `finplat`, `gstack`.
- 4–8 workspaces total, unevenly distributed across projects.
- Each workspace carries one split tree by default, plus an optional list of extra tabs for testing the tab-bar-visible case.
- Each terminal has a static scrollback sample (10–15 lines of mock output), a mock `cwd`, and a mock command.
- Activity states spread across `active`, `recent`, `idle`.
- Mock branch names to populate the status bar.

The fixtures file is the _only_ source of state in scope B, consumed by the Pinia stores at boot.

### 9.6 Pinia stores

All stores live in `frontend/src/stores/`. Shape-compatible with the eventual real backend so the flip to Wails is a single-file change.

| Store | Status | Shape summary |
|---|---|---|
| `themeStore` | Real | `{ preference, resolved }` + actions to set preference. |
| `projectStore` | Mock-backed | `{ projects, expandedIds }` + `addProject` (no-op), `removeProject` (no-op), `toggleExpand`. |
| `workspaceStore` | Mock-backed | `{ workspacesByProject, activeWorkspaceId }` + `selectWorkspace`, `createWorkspace` (adds to local state). |
| `tabStore` | Mock-backed | `{ tabsByWorkspace, activeTabByWorkspace }` + `newTab`, `closeTab`, `reorderTabs`, `renameTab`, `moveToNewTab(paneId)`. |
| `terminalStore` | Mock-backed, metadata only | Split trees per tab, focus per tab. Per decision E12 in `architecture.md`, this store never holds PTY data streams. In scope B there are no streams at all. |
| `toastStore` | Real | `{ toasts }` + `show`, `dismiss`. |

### 9.7 Services

`frontend/src/services/api.ts` — a thin mock wrapper that will later be replaced by Wails bindings. In scope B, every method either returns fixture data or mutates the Pinia mocks. The signatures match the eventual Wails API surface defined in `docs/architecture.md` §"Wails API surface."

## 10. Keyboard shortcuts

Bindings use `⌘` on macOS and `Ctrl` on Linux. Registered via a single `frontend/src/lib/keybinds.ts` module that maps shortcuts to intent functions, so individual components do not have to listen to `keydown` directly.

| Action | Keybind |
|---|---|
| New project | `⌘⇧N` |
| New workspace | `⌘N` |
| New tab (explicit empty) | `⌘T` |
| Close tab | `⌘W` |
| Close pane | `⌘⇧W` |
| Split right | `⌘D` |
| Split down | `⌘⇧D` |
| Move pane to new tab | `⌘⇧↵` |
| Cycle tab forward / back | `⌘⌥→` / `⌘⌥←` |
| Cycle pane focus forward / back | `⌘]` / `⌘[` |
| Switch workspace up / down | `⌘⌥↑` / `⌘⌥↓` |
| Toggle theme (cycle) | `⌘⇧L` |
| Open settings | `⌘,` |
| Quit | `⌘Q` |

`⌘K` and `⌘P` are reserved for the deferred fuzzy switcher and are not bound in v1.

**Conflict model:** app-level shortcuts are captured before the focused terminal receives input. Unmodified keys and `⌥`-prefixed keys always go to the terminal.

## 11. Empty states (complete list)

1. **No projects.** Sidebar: "No projects yet" + ghost "Add project" button. Right region: State A ("Select a workspace" — correct because there is nothing to select).
2. **Projects exist, no workspace selected.** Sidebar: project tree. Right region: State A.
3. **Workspace selected, split tree empty** (recovery). Right region: State B (centered "New terminal" button + `⌘⇧T` hint).
4. **First launch.** Same as state 1. No welcome copy, no onboarding wizard.

## 12. Documentation updates

The following changes to existing docs land as part of this work:

- **`docs/architecture.md`:**
  - Replace the "projects → workspaces → panes" hierarchy with "projects → workspaces → split tree (+ optional tabs)."
  - Document the tab concept and the "hidden when tabs ≤ 1" visibility rule.
  - Replace the `ceil(sqrt(N))` terminal grid rule with binary-tree splits.
  - Clarify that a workspace's first terminal is auto-spawned on creation.
- **`docs/DESIGN.md`:**
  - Rewrite the "Terminal grid layout" section to describe binary splits and the hover-reveal split controls.
  - Add the resizable sidebar measurements (180–400px, default 240).
  - Add the 22px status bar to the layout section.
  - Clarify the theme toggle cycles `system → light → dark → system`.
- **`TODOS.md`:** multi-window + drag-drop tabs entry already added during brainstorming. Also add:
  - Sidebar collapse hotkey.
  - Polished tab overflow dropdown.
  - Real terminal ANSI palette picker.
  - `Cmd+P` fuzzy switcher (already present).

## 13. Motion budget (explicit)

The entire layout uses motion in exactly these places, no others:

1. **Hover color transitions** — 80ms ease-out on `color` and `background-color` across all interactive elements.
2. **Activity dot state transitions** — 200ms ease-out on `background-color` and `box-shadow`.
3. **Pane mount fade-in** — 120ms ease-out on `opacity` when a new pane appears.
4. **Modal open** — 100ms ease-out fade-in on the backdrop and content.
5. **Tab drag reorder** — 100ms ease-out slide on tabs that move aside.
6. **Toggle switch knob** — 120ms ease-out on the knob `translateX`.

Everything else is instant. No bounces, no springs, no scroll-triggered animations. Theme changes do not animate.

## 14. Success criteria

1. Opening the app renders the shell in dark mode (on a dark-mode OS) with the traffic lights in the sidebar and no native titlebar.
2. Toggling the theme preference via the footer button cycles `system → light → dark → system` and the whole UI swaps instantly with no flash.
3. Mock fixture data drives a fully populated sidebar tree (3 projects, 4–8 workspaces), each workspace has its own split tree and optional tab list.
4. Clicking a workspace in the sidebar updates the right region to show that workspace's split tree. If the workspace has >1 tab, the tab bar appears.
5. Splitting a terminal (via keybind or hover button) adds a new pane to the binary tree. Closing a pane removes it and re-layouts the tree.
6. "Move to new tab" on a pane detaches it into a new tab and reveals the tab bar (if it was hidden).
7. Resizing the sidebar drags smoothly, clamps at 180 and 400, persists the width, and resets on double-click.
8. All components render correctly in both themes with no hardcoded hex.
9. Every keybinding in §10 is registered and (where possible given mocks) fires the expected intent.
10. The entire component inventory (§9) is built and used somewhere reachable in the app.

## 15. What this spec deliberately does NOT decide

- Exact Pinia store internals beyond shape — left for the implementation plan.
- Testing strategy — Vitest component tests for primitives and shallow render tests for layout components are assumed but not enumerated here.
- How the mock fixtures are generated (hand-written is fine; no need for a factory library in scope B).
- The precise visual design of the `SettingsModal` beyond its sections.
- Any decision that belongs to the backend wiring phase, including the full Wails binding surface (already spec'd in `architecture.md`).
