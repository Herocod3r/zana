# Design System — Zana

## Product Context
- **What this is:** Zana is a desktop app for managing multiple coding agents (Claude Code, Codex, Aider, etc.) across git-worktree-isolated workspaces. Projects → workspaces → terminal panes.
- **Who it's for:** Developers running multiple AI coding agents in parallel. Built for the maintainer first, open source if it works.
- **Space/industry:** Developer tools / agent orchestration. Peers: Superset.sh (anti-reference), Conductor, Warp, Ghostty, Linear (typography benchmark).
- **Project type:** Cross-platform desktop application (Wails + Vue + Go). Single window. macOS-first.

## Aesthetic Direction
- **Direction:** Industrial Minimalism
- **Decoration level:** Minimal — no textures, no gradients, no decoration. Typography and a single accent color do all the work.
- **Mood:** A developer tool that takes itself seriously. Function-first, near-monochrome, monospace-forward identity. The terminals are the product. Everything else is scaffolding that recedes when work is happening.
- **The principle:** Zana's chrome should disappear and let the terminals breathe. The opposite of Superset's busy chrome.
- **Reference sites:** ghostty.org (the gold standard for confidence-through-restraint), linear.app (typography discipline), raycast.com (centered minimalism), conductor.build (workspace naming via city wordlist).

## Theming
- **System theme aware.** The app reads `prefers-color-scheme` from the OS. Dark mode by default if the OS is dark, light mode if the OS is light.
- **Manual override.** A theme setting in preferences allows the user to lock to dark, lock to light, or follow system (default).
- **Future:** Custom themes via extensions (post-v1).

## Color

### Dark theme (default for dark systems)
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0B0B0E` | Window background, terminal background |
| `surface` | `#141418` | Sidebar, panels |
| `surface-elev` | `#1C1C22` | Modals, tooltips, hover states |
| `border` | `#26262E` | 1px hairlines, dividers |
| `border-strong` | `#34343E` | Input borders, stronger dividers |
| `accent` | `#A3E635` | Focused pane border, active activity dot, primary CTA |
| `accent-fg` | `#0a0a0a` | Foreground on accent backgrounds |
| `text` | `#E8E8EA` | Primary text (off-white, easier on eyes) |
| `text-2` | `#9090A0` | Secondary text |
| `text-muted` | `#5C5C68` | Muted/disabled text, idle activity dot |
| `warning` | `#FBBF24` | Recent activity dot, warning toasts |
| `error` | `#F87171` | Error toasts, destructive actions |
| `success` | `#A3E635` | Same as accent |

### Light theme (default for light systems)
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#F8F8FA` | Window background |
| `surface` | `#FFFFFF` | Sidebar, panels |
| `surface-elev` | `#FFFFFF` | Modals, tooltips |
| `border` | `#E4E4EA` | 1px hairlines |
| `border-strong` | `#D0D0D8` | Input borders |
| `accent` | `#65A30D` | Darker lime for contrast on white |
| `accent-fg` | `#FFFFFF` | Foreground on accent backgrounds |
| `text` | `#0B0B0E` | Primary text |
| `text-2` | `#5C5C68` | Secondary text |
| `text-muted` | `#9090A0` | Muted text |
| `warning` | `#D97706` | Darker amber |
| `error` | `#DC2626` | Darker red |

### Activity dot states (both themes)
| State | Dark | Light | Trigger |
|-------|------|-------|---------|
| Active | `#A3E635` | `#65A30D` | PTY had output in the last 5 seconds |
| Recent | `#FBBF24` | `#D97706` | Output in the last 60 seconds |
| Idle | `#5C5C68` | `#9090A0` | No output for >1 minute |

The accent color is the only saturated color in the entire UI. It appears ONLY on:
1. The focused terminal pane border (1px lime line)
2. The active activity dot (with subtle glow in dark mode)
3. The primary CTA button background
4. The active workspace indicator (2px line on the active sidebar item)

Everywhere else: gray on near-black (or dark on light).

## Typography

- **Display/Hero:** Geist Sans 32px/500 — modal titles, empty states. Letter-spacing -0.02em.
- **Body:** Geist Sans 14px/400 — paragraph text in modals, settings, dialogs.
- **UI Labels (sidebar, tabs, buttons, status text):** Geist Mono 12px/500 — the unconventional choice. Mono everywhere echoes the terminal content and signals "we are a developer tool, proud of it." Locks character widths so the sidebar doesn't shimmer.
- **UI Headers (section labels):** Geist Mono 11px/600 uppercase, letter-spacing 0.08em — `PROJECTS`, `WORKSPACES`, etc.
- **Terminal:** Geist Mono 13px/400 — default terminal font. User can override via the terminal renderer (xterm.js or ghostty-web).
- **Code in non-terminal contexts:** Geist Mono 12px (file paths in tooltips, code in modals).

**Loading:** Google Fonts via `<link>` for the marketing site. Bundled in the app via Wails embed for offline use. CSS variable: `--mono` and `--sans`.

**Stretch goal:** Offer Berkeley Mono as a premium font option for users with the license. Hot-swappable via terminal preferences.

**Why Geist:** Vercel-built, free, modern, technical, no licensing drama, mono+sans pair perfectly. Not on the slop blacklist (Inter, Roboto, Poppins, etc.).

## Spacing

**Base unit:** 4px

| Token | Value | Usage |
|-------|-------|-------|
| `2xs` | 2px | Micro gaps between dots, icon-text gaps |
| `xs` | 4px | Tight spacing within compact components |
| `sm` | 8px | Standard component padding |
| `md` | 12px | Sidebar item padding, button padding |
| `lg` | 16px | Section spacing |
| `xl` | 24px | Modal padding, major section gaps |
| `2xl` | 32px | Large section gaps |

**Density:** Compact. Developer tool, not a marketing site.
- Sidebar item: 6px vertical, 8px horizontal padding
- Tab bar height: 32px
- Sidebar width: 240px
- Terminal pane padding: 6-8px
- Modal padding: 24px

## Layout

- **Approach:** Grid-disciplined for the app. No creative-editorial bending here, this is a tool.
- **Single window in v1.** No multi-window or multi-monitor support.
- **Three-region layout:** sidebar (240px) → workspace tab bar (32px) → terminal grid (fills remainder).
- **Min window size:** 800x500.
- **Max content width:** N/A (the app uses 100% of the window).
- **Border radius scale:**
  - Window itself: 10px (matches macOS native window radius)
  - Internal elements (buttons, inputs, cards): 4px (subtle, not bubbly, not sharp)
  - Activity dots: 50% (circles)
- **Shadows:** Almost none. Modals get a single soft shadow: `0 8px 24px rgba(0,0,0,0.4)` in dark, `0 8px 24px rgba(0,0,0,0.12)` in light. Nothing else has shadows — depth comes from background tone, not blur.

## Terminal grid layout

When a workspace has multiple terminal panes, they tile in a CSS Grid where:
- N = number of panes
- Columns = `ceil(sqrt(N))`
- Rows = `ceil(N / columns)`
- 1 pane = full width
- 2 panes = side by side
- 3 panes = 2 + 1
- 4 panes = 2x2
- 5 panes = 3 + 2
- 6 panes = 3x2

Resize handles between panes allow proportional adjustment within the grid. The focused pane has a 1px accent border (only border in the entire UI that uses the accent color outside of buttons/dots).

## Motion

**Approach:** Almost none. Tool, not toy.

- **Hover transitions:** 80ms `ease-out` on color/background changes
- **Pane mount fade-in:** 120ms `ease-out` opacity transition
- **Activity dot color transitions:** 200ms `ease-out` between states (active → recent → idle should fade smoothly, not snap)
- **Tab switching:** instant (no slide, no fade — focus shifts immediately)
- **Modal open:** 100ms fade-in only (no scale, no slide)
- **No bounce, no spring, no scroll-triggered animations.**

The one exception (activity dots) earns its motion budget because watching the dots fade between states is the visual signal for "agent stopped responding."

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-06 | Initial design system created | /design-consultation after /office-hours and /plan-ceo-review |
| 2026-04-06 | Chose Industrial Minimalism over the generic shadcn dark aesthetic | The whole product is anti-bloat. The aesthetic must reinforce that. |
| 2026-04-06 | Geist Mono for ALL UI labels (not just code) | Echoes the terminal content. Locks widths. Distinctive. Risk: 5% reading speed cost in sidebar. Worth it. |
| 2026-04-06 | Electric lime `#A3E635` accent instead of blue/purple | Unique in the dev tool space. Echoes the terminal cursor aesthetic. Pairs naturally with Ghostty. |
| 2026-04-06 | Compact 4px spacing base unit | Developer tool density. Maximum information per screen. |
| 2026-04-06 | Near-zero motion | Multiple agents streaming output is already visually busy. Adding chrome animation would distract. |
| 2026-04-06 | System theme aware (dark/light) | Respect OS preference. Manual override available. Custom themes via extensions later. |

## Anti-patterns (DO NOT do these)

- **No purple gradients.** Anywhere. Period.
- **No 3-column feature grids with icons in colored circles.** Marketing slop.
- **No centered everything with uniform spacing.** This isn't a landing page.
- **No bubbly border-radius.** 4px max on internal elements.
- **No gradient buttons.** Solid accent only.
- **No more than ONE accent color in the entire UI.** Lime stays the only saturated color.
- **No `v-html` in Vue components.** XSS risk and visual inconsistency risk.
- **No `Inter`, `Roboto`, `Poppins`, `Open Sans`** as primary fonts. Geist or nothing.
- **No motion for the sake of feeling "modern."** Every animation must earn its budget by aiding comprehension.
- **No emoji in UI labels.** This is a tool.

## Implementation notes

- Use CSS custom properties (`--bg`, `--surface`, etc.) for all values. Never hardcode hex.
- The `[data-theme="light"]` attribute on `<html>` switches the palette.
- A media query `@media (prefers-color-scheme: light)` handles the system default.
- A Pinia store `themeStore` exposes `mode: 'auto' | 'dark' | 'light'` and writes to localStorage.
- All buttons, inputs, and cards should use `--accent-fg` for foreground when the background is `--accent`.

## Reference

Visual preview: `/tmp/zana-design-preview.html` (during /design-consultation session)
Created by: `/design-consultation` on 2026-04-06
Following: `docs/design.md` (architecture) and `docs/ceo-plan.md` (scope decisions)
