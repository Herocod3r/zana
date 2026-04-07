# Zana

A fast, simple desktop app for managing multiple coding agents across git worktree workspaces.

> Status: planning. No code yet. See [`docs/architecture.md`](docs/architecture.md) for the full plan.

## What it is

You run Claude Code, Codex, Aider, and friends. You want them working in parallel on different branches without stepping on each other. Today that means juggling terminal windows, manually creating worktrees, losing context when you close a tab, and having no unified view of what's running where.

Zana is one window that organizes that work into **projects → workspaces → terminal panes**, where each workspace is a real git worktree. Open a project, spawn agents in parallel terminals, switch between workspaces without losing your place, quit and reopen exactly where you left off.

It's the anti-bloat take on the same idea Superset, Conductor, and a few others are exploring. Thin core, every pixel earns its place, the chrome disappears so the terminals can breathe.

## Why

Existing tools in this space bundle too much. The result feels heavy and slow even when the underlying idea is right. Zana's bet is that **simplicity is the feature**. The core does one thing well. Extensions do everything else, later.

The mental model is hierarchical, not multiplexed:

```
Project (a git repo)
└── Workspace (a git worktree, with a friendly name like "tokyo")
    ├── Terminal pane (claude code)
    ├── Terminal pane (dev server)
    └── Terminal pane (git status)
```

## Stack

- **Backend:** Go + [Wails v2](https://wails.io) (native webview, not Electron)
- **Frontend:** Vue 3 + Pinia + TypeScript
- **Terminal:** [xterm.js](https://xtermjs.org) initially, [ghostty-web](https://github.com/coder/ghostty-web) (libghostty compiled to WASM) once integrated
- **Storage:** SQLite via `modernc.org/sqlite` (pure Go, no CGo)
- **PTY:** `creack/pty`

The whole thing ships as a native binary via `wails build`. macOS first, Linux fast follow, Windows post-v1.

## v1 scope

- Add git repos as projects
- Create workspaces as git worktrees, with a New Workspace dialog (display name + branch + base branch)
- Spawn terminal panes per workspace, multi-pane grid (1 → N, auto-reflows)
- Per-pane activity indicator (green/yellow/gray dot based on PTY output recency)
- Quit and reopen with full visual restore (rendered terminal state via xterm.js SerializeAddon)
- Native macOS chrome, dark/light theme follows system, single window

What's NOT in v1: extension loader, multi-window, Windows builds, scrollback search, agent-specific intelligence, config files. See [`TODOS.md`](TODOS.md) for the full deferred list.

## Status

Planning complete. Architecture, design system, scope, and execution plan are all locked. See:

- [`docs/architecture.md`](docs/architecture.md) — full architecture, premises, technical decisions, eng-review hardenings
- [`docs/ceo-plan.md`](docs/ceo-plan.md) — scope decisions and cross-model resolutions
- [`docs/DESIGN.md`](docs/DESIGN.md) — visual design system (Industrial Minimalism)
- [`CLAUDE.md`](CLAUDE.md) — project conventions and security rules
- [`TODOS.md`](TODOS.md) — deferred work for post-v1

Next step: scaffold the Wails project and run the throughput spike (the riskiest path first).

## Build (when scaffolded)

```bash
# Prerequisites: Go 1.22+, Node 20+, Wails CLI
wails dev    # development with hot reload
wails build  # production binary
```

## Inspiration

- **[Ghostty](https://ghostty.org)** — the gold standard for confidence-through-restraint in terminal tools
- **[Linear](https://linear.app)** — typography discipline benchmark
- **[Conductor](https://conductor.build)** — workspace naming via wordlist (cities)
- **[Superset.sh](https://superset.sh)** — the right concept, the cautionary execution

## License

TBD. Will be open source (MIT or Apache 2.0) when v1 ships.
