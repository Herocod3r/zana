# Zana App Layout — Implementation Plan (Index)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan phase-by-phase. Each phase file contains its own `- [ ]` checkbox tasks.

**Goal:** Build the Zana frontend shell and presentational component library, fully themed for dark/light/system, wired to mock fixture data (no backend).

**Architecture:** Vue 3 + TypeScript strict + Pinia on top of Wails v2. Industrial Minimalism aesthetic from `docs/DESIGN.md`. Project → Workspace → Split tree (+ optional tabs) hierarchy from `docs/superpowers/specs/2026-04-09-app-layout-design.md`. All primitives are hand-rolled (no component library). Icons via Phosphor. No terminal renderer yet — `TerminalPane` shows static mock content.

**Tech Stack:**

- Wails v2 (Go backend stubbed; frontend-only in this plan)
- Vue 3 (`<script setup>`, Composition API, strict TS)
- Pinia (state)
- Vite (build)
- Vitest + `@vue/test-utils` + `happy-dom` (component tests)
- Phosphor icons via `@phosphor-icons/vue`
- Geist Sans + Geist Mono (self-hosted via embedded assets)

**Spec:** `docs/superpowers/specs/2026-04-09-app-layout-design.md`

---

## Phase index

Each phase is a separate file in this directory. Execute in order — later phases depend on earlier ones.

| # | Phase | File | Summary |
|---|---|---|---|
| 1 | Scaffold & tokens | [phase-01-scaffold.md](./2026-04-09-app-layout-phase-01-scaffold.md) | Wails+Vue init, TS strict, Vitest, fonts, CSS tokens, theme flash script |
| 2 | Theme system | [phase-02-theme.md](./2026-04-09-app-layout-phase-02-theme.md) | `themeStore`, OS-sync listener, cycle button |
| 3 | Primitives | [phase-03-primitives.md](./2026-04-09-app-layout-phase-03-primitives.md) | `Icon`, `Button`, `ActivityDot`, `TextInput`, `Select`, `Toggle`, `Checkbox`, `Tooltip` |
| 4 | Fixtures & stores | [phase-04-fixtures-stores.md](./2026-04-09-app-layout-phase-04-fixtures-stores.md) | Mock fixtures, `projectStore`, `workspaceStore`, `tabStore`, `terminalStore`, `toastStore`, `services/api.ts` |
| 5 | Shell skeleton | [phase-05-shell.md](./2026-04-09-app-layout-phase-05-shell.md) | `AppShell`, empty `Sidebar`, empty `RightRegion`, `StatusBar`, traffic lights |
| 6 | Sidebar internals | [phase-06-sidebar.md](./2026-04-09-app-layout-phase-06-sidebar.md) | `ProjectTree`, `ProjectRow`, `WorkspaceRow`, `SidebarFooter`, resize handle |
| 7 | Right region internals | [phase-07-right-region.md](./2026-04-09-app-layout-phase-07-right-region.md) | `TabBar`, `TabItem`, `TerminalArea`, conditional tab bar, empty states |
| 8 | Terminal splits | [phase-08-splits.md](./2026-04-09-app-layout-phase-08-splits.md) | `TerminalSplits` recursive, `TerminalPane`, split controls, resize handles, focus/dim |
| 9 | Overlays | [phase-09-overlays.md](./2026-04-09-app-layout-phase-09-overlays.md) | `Modal`, `ConfirmDialog`, `NewWorkspaceDialog`, `AddProjectDialog`, `SettingsModal`, `Toast`, `ToastHost` |
| 10 | Context menus | [phase-10-context-menus.md](./2026-04-09-app-layout-phase-10-context-menus.md) | `ContextMenu` + wiring into project rows, workspace rows, tabs, panes |
| 11 | Keybinds & doc updates | [phase-11-keybinds-docs.md](./2026-04-09-app-layout-phase-11-keybinds-docs.md) | `lib/keybinds.ts`, registration in `AppShell`, updates to `DESIGN.md` and `architecture.md` |

---

## File structure (target)

```
frontend/
  index.html                     # Theme flash script inline
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  public/
    fonts/                       # Geist Sans + Geist Mono .woff2
  src/
    main.ts                      # Vue + Pinia boot
    App.vue                      # Renders <AppShell />
    styles/
      tokens.css                 # CSS variables (dark default + [data-theme=light])
      reset.css                  # Minimal reset
      globals.css                # Body, scrollbar, drag region rules
    components/
      shell/
        AppShell.vue
        Sidebar.vue
        ProjectTree.vue
        ProjectRow.vue
        WorkspaceRow.vue
        SidebarFooter.vue
        RightRegion.vue
        TabBar.vue
        TabItem.vue
        TerminalArea.vue
        TerminalSplits.vue
        TerminalPane.vue
        StatusBar.vue
      primitives/
        Button.vue
        Icon.vue
        ActivityDot.vue
        TextInput.vue
        Select.vue
        Toggle.vue
        Checkbox.vue
        Tooltip.vue
      overlays/
        Modal.vue
        ModalPortal.vue
        ConfirmDialog.vue
        NewWorkspaceDialog.vue
        AddProjectDialog.vue
        SettingsModal.vue
        Toast.vue
        ToastHost.vue
        ContextMenu.vue
    stores/
      theme.ts
      projects.ts
      workspaces.ts
      tabs.ts
      terminals.ts
      toasts.ts
    services/
      api.ts                     # Mock wrapper, will flip to Wails later
    mocks/
      fixtures.ts                # Hand-written mock data
    lib/
      keybinds.ts                # Central binding registration
      ghostty.ts                 # Stub adapter (noop)
      terminal-themes.ts         # Fixed ANSI palettes (stub)
    types/
      models.ts                  # Project, Workspace, Tab, Terminal, SplitNode types
    tests/
      helpers.ts                 # Shared test helpers (mount, stubs)
```

---

## Execution rules

1. **TDD**: every component gets at least a smoke test (`mount renders`) plus one behavioral test (emits an event, reacts to a prop). Run tests after each change.
2. **Commit frequently**: one commit per completed task (test + implementation together). Commit messages use conventional-commit prefixes (`feat`, `refactor`, `test`, `docs`, `chore`).
3. **No hardcoded hex** in any `.vue` or `.ts` file other than `styles/tokens.css` and `mocks/fixtures.ts`. The lint rule is set up in Phase 1.
4. **Type safety**: `tsconfig.json` uses `strict: true`. No `any` outside of explicit escape hatches (there should be none in this plan).
5. **Imports**: use path alias `@/` for `frontend/src/`. Configured in Phase 1.
6. **Vue conventions**: `<script setup lang="ts">` only. Single-file components. Scoped styles unless deliberately global.

---

## Known gaps (self-review findings)

The phase files cover the main flow but omit these items. Pick them up during execution — no separate phase needed.

1. **Tab drag-reorder UI** (Phase 7). `tabStore.reorderTabs()` is implemented but `TabBar.vue` does not yet wire HTML5 drag events to call it. Add `draggable="true"` to `TabItem`, dispatch drag start/end, and compute the new order inside `TabBar.vue`. 100ms ease-out slide animation on displaced tabs. Spec §6.1.
2. **Tab overflow chevron popover** (Phase 7). When `tabs.length * min-width` exceeds the region width, render a `⟩` chevron button at the right edge that opens a small popover listing every tab. Click a row to switch. Spec §6.1 (minimum version only — polished version is deferred).
3. **`TerminalArea.spawnInEmpty` fallback** (Phase 7). The current implementation only handles the case where the tree is a placeholder leaf. Guard for `tree === undefined` (fresh empty tab from `+` button): skip the leaf check and just call `terminals.setTreeFor(activeTabId, { kind: 'leaf', id: newLeafId, terminalId: newTerminalId })` directly.
4. **ProjectRow context menu** (Phase 10). Phase 10 wires workspace, tab, and pane menus. Add a fourth handler in `AppShell.vue` — `showProjectMenu` — following the same pattern: items are `{ id: 'rename', label: 'Rename' }` and `{ id: 'remove', label: 'Remove from Zana', destructive: true }`. Provide via `provide('showProjectMenu', ...)` and inject in `ProjectRow.vue`. Spec §5.3.

Each gap is a self-contained fix of <30 lines. They can be handled inline during their parent phase or as a cleanup pass at the very end.

---

## Done when

All 11 phases complete and the four known gaps are closed. Success criteria from spec §14:

1. Shell renders with hidden titlebar + traffic lights in sidebar on macOS.
2. Theme cycle works, no flash, respects OS preference.
3. Mock fixtures populate the tree (3 projects, 4–8 workspaces).
4. Clicking a workspace updates the right region; tab bar appears only when `tabs.length > 1`.
5. Split right/down work. Move to new tab works. Close pane works.
6. Sidebar resize drags smoothly, clamps 180–400, persists, double-click resets.
7. Both themes render correctly everywhere. No hex outside tokens/fixtures.
8. Every keybinding registered.
9. Every component in the inventory built and reachable.
