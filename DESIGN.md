# DESIGN

NVIDIA-inspired design system for Memoria-OS Sim.

## Philosophy

A **technical-terminal** aesthetic: deep black background, NVIDIA green as the primary accent, mono typography for every numeric reading, subtle glow on active elements. No purple gradients, no glassmorphism. The user should feel like they're reading the output of a low-level tool.

## Color tokens

| Token           | Value      | Use |
|-----------------|------------|-----|
| `ink-950`       | `#050606`  | Page background |
| `ink-900`       | `#0a0c0a`  | Primary surfaces |
| `ink-800`       | `#13161a`  | Cards, panels, segmented controls |
| `ink-700`       | `#1c2026`  | Borders |
| `neon-green`    | `#76B900`  | NVIDIA accent — active processes, CTAs, focus |
| `neon-cyan`     | `#22d3ee`  | Secondary processes, metrics |
| `neon-magenta`  | `#ff2bd6`  | Compaction, critical events |
| `neon-amber`    | `#ffb020`  | Warnings, idle, fragmentation regions |
| `neon-rose`     | `#ff5577`  | Errors, "doesn't fit" |
| `neon-violet`   | `#a78bfa`  | Language picker |

## Per-process palette

Eight neon accents, cycled deterministically by the trailing digit of the `pid` (`P1 → green`, `P2 → cyan`, …). The same color is reused across the memory block, the wait-queue cylinder, the gantt cell, the event-log badge, and the process-table row.

| pid | color    |
|-----|----------|
| P1  | green    |
| P2  | cyan     |
| P3  | magenta  |
| P4  | amber    |
| P5  | rose     |
| P6  | lime     |
| P7  | violet   |
| P8  | orange   |

## Typography

- **JetBrains Mono** — tables, IDs, KB/MB sizes, code, anything technical.
- **Inter** — prose, descriptions, help.
- Headlines use mono uppercase with `tracking-wider` for the terminal vibe.

## Effects

- Glow on active borders: `box-shadow: 0 0 18px -2px <hex with alpha>`.
- Background grid: two 32px `linear-gradient`s at 4% alpha over green.
- Framer Motion transitions for memory blocks entering / leaving. Disabled under `prefers-reduced-motion`.
- No `transition: all`. Only explicit opacity / layout / color transitions.

## Layout

The whole app lives in `100vh × 100vw`, no page scroll. Internal panels scroll when they need to. Contiguous mode uses three columns: left (config + processes, 320px), center (memory + queue), right (stats + log, 320px). Timeline + Gantt sit as a 140px fixed footer.

## Accessibility

- Minimum AA contrast for all text on `ink-950` and `ink-900`.
- Visible neon focus ring on buttons, inputs and controls.
- `aria-live="polite"` on the event log.
- Keyboard shortcuts for play / pause / step / reset.
- Inputs accept both KB and `64 MB` (with unit prefix).

## Rules

1. No new tones without adding them to the token set.
2. Animations never obstruct reading the current tick.
3. The gantt and the memory column always share the palette — reading the gantt should *be* reading the memory.
