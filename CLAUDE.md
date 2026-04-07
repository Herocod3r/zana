# Zana

Desktop app for managing multiple coding agents (Claude Code, Codex, Aider) across git-worktree-isolated workspaces.

## Stack

- **Backend:** Go (Wails v2/v3), `creack/pty`, `modernc.org/sqlite` (pure Go), `slog`
- **Frontend:** Vue 3 + Pinia + TypeScript
- **Terminal:** ghostty-web (WASM, xterm.js-compatible API), fallback to xterm.js
- **Packaging:** Wails (native webview, cross-platform)
- **Distribution:** GitHub Releases + Homebrew tap

## Key documents

Read these before making any non-trivial change:

- `docs/architecture.md` — full architecture + premises + technical decisions
- `docs/ceo-plan.md` — CEO review scope decisions and cross-model resolutions
- `docs/DESIGN.md` — visual design system (colors, typography, spacing, motion)
- `TODOS.md` — deferred work for post-v1

## Design System

**Always read `docs/DESIGN.md` before making any visual or UI decisions.**
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match `DESIGN.md`.

The system is **Industrial Minimalism**: near-monochrome, monospace-forward, single accent color (electric lime `#A3E635` / `#65A30D`), compact spacing, near-zero motion. The chrome should disappear and let the terminals breathe.

System theme aware: dark mode for dark systems, light mode for light systems, manual override available.

## Architecture principles

- **Thin core, extension seams.** v1 ships projects + workspaces + terminals only. Extension loader is post-v1, but the core has 2-3 internal interfaces (`TerminalProvider`, `WorkspaceAction`, `SidebarPanel`) where extensions will plug in later.
- **Agent-agnostic.** A terminal is a terminal. The core doesn't know what agent runs inside it.
- **Git-only.** v1 only supports git repositories.
- **Single window.** v1 has no multi-window support.
- **macOS-first in practice.** Linux is a fast follow. Windows is post-v1.
- **No config files.** All preferences are in-app, persisted to SQLite at `~/.zana/zana.db`.

## Security

- **Never use `sh -c` or string interpolation for git commands.** Always `exec.Command("git", "worktree", "add", path, "-b", branch)` with separate argv.
- **Validate branch names** against git's ref-name rules before passing to git.
- **No `v-html` in Vue components.** Use `{{ }}` (auto-escaped) for all user-provided strings.
- **Validate project paths** (resolve symlinks, reject `..`, sanity check parent dirs).

## Anti-patterns to avoid

- Bundling features that aren't in the v1 scope. Add to TODOS.md instead.
- Reinventing tmux. Multi-pane is hierarchical (projects → workspaces → panes), not multiplexing.
- Adding agent-specific logic to the core. Agent intelligence lives in extensions.
- Generic Tailwind shadcn aesthetic. See DESIGN.md for the aesthetic constraints.
