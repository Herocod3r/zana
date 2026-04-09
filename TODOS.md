# Zana TODOs

Items deferred from /office-hours and /plan-ceo-review (2026-04-06). Tackle after v1 ships and you've used Zana for at least a week.

## P1 — Tackle when v1 dogfooding reveals the need

### Workspace notes panel
**What:** A text panel per workspace where you can write notes. Plain text in v1.
**Why:** When you have 5 worktrees and 5 agents running, you forget what each one was supposed to do. A 2-line note solves it.
**Effort:** S (CC: ~half day)
**Depends on:** v1 ships, you've used it enough to feel the pain.

### Cmd+P fuzzy switcher
**What:** Cmd+P opens a fuzzy finder over projects, workspaces, and terminal panes. Type a few letters, jump there.
**Why:** Sidebar navigation gets slow once you have 3+ projects with multiple workspaces. Power-user feature.
**Effort:** S (CC: ~half to 1 day)
**Depends on:** v1 ships and you have enough projects to need it.

### Multi-window + drag-drop tabs
**What:** Support opening multiple Zana windows. Each window shares the same project+workspace tree (sidebar) but has its own active workspace and terminal focus. Drag-drop tabs between windows to move a workspace's view to another window.
**Why:** Multi-monitor developers want to put different agents on different screens. The nested-tree sidebar (option A) was chosen partly because it grows naturally into this model — every window renders the same tree with its own selection pointer.
**Effort:** M-L (window lifecycle, state sync, tab detach/attach, per-window Wails context).
**Depends on:** v1 single-window ships, dogfooding proves the need.

### Per-project `.zana/init.sh` setup script
**What:** Optional shell script at `.zana/init.sh` in the repo. Runs in new worktrees on creation. Examples: `pnpm install`, `cp .env.example .env`.
**Why:** Every new worktree means re-running setup. For monorepos this is painful.
**Effort:** S-M (CC: ~half day)
**Risk:** Convention creep. Discipline required to keep it just one script, not init.toml.
**Depends on:** v1 ships, you've felt the pain.

## P2 — Phase 2 (extension system)

### Extension loader
**What:** A real plugin system. Load Go plugins (or run JavaScript extensions in a sandboxed context). Use the seams from A+ as the contract.
**Why:** Extensibility is the 10x vision from /office-hours. The thin core was designed to enable this.
**Effort:** M-L
**Depends on:** A week+ of dogfooding to know what extensions actually need.

### Workspace name generator extension
**What:** Pluggable name generator for new workspaces. Default ships with city names. Extensions can swap to other wordlists (planets, animals, fictional characters, etc.).
**Why:** Conductor.build's city names feel cool. The user wants this. Naming the extension API around it is a forcing function.
**Effort:** S (after extension loader exists).

## P3 — Phase 3 (workspace-as-memory)

### Persistent agent session metadata
**What:** Beyond visual scrollback, capture command history, file changes per workspace, and a "what was this for?" intent field. Make workspaces forkable and diffable.
**Why:** Codex's "durable replayable unit of thought" insight from /office-hours.
**Effort:** L
**Depends on:** Phase 2 extension system, real usage pain.

### Apple Developer signing + auto-update
**What:** $99/yr Apple Developer cert. Sign + notarize macOS .app bundles. Add Sparkle or similar for auto-update.
**Why:** Removes Gatekeeper friction. Required if Zana takes off and has non-developer users.
**Effort:** S (mostly setup) + ongoing $99/yr.
**Depends on:** Real users who care about smoother install.

### Windows support
**What:** Windows builds in CI, test PTY behavior on Windows (ConPTY), test webview on WebView2.
**Why:** Cross-platform completeness.
**Effort:** M (PTY differences are real).
**Depends on:** Real Windows users asking for it.
