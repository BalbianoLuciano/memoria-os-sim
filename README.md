# Memoria-OS Sim

[![Deploy](https://github.com/BalbianoLuciano/memoria-os-sim/actions/workflows/deploy.yml/badge.svg)](https://github.com/BalbianoLuciano/memoria-os-sim/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)

Interactive visualizer of **memory management + CPU scheduling**, tick by tick. Built as a teaching aid for an OS / Computer Architecture course (UTN-FRRe).

**Live:** [balbianoluciano.github.io/memoria-os-sim](https://balbianoluciano.github.io/memoria-os-sim/)

One screen, three modes:

- **Contiguous** — MFT (fixed partitions) and MVT (variable partitions) with **First-Fit / Best-Fit / Worst-Fit** placement, optional **compaction** with configurable cost, and **FCFS / Round Robin / SJF / Priority** CPU schedulers.
- **Paging** — logical → physical address translation, bit decomposition, page table from free-frame list.
- **Page replacement** — **FIFO / LRU / OPT** running side-by-side on the same reference string with per-step fault tracking.

The UI is available in **English, Spanish and Portuguese**, with a toggle in the header.

## Why

Standard OS textbook exercises ask you to walk through a memory/CPU snapshot every tick by hand: who's in memory, who's in the wait queue, which slot got chosen, did the chosen fit policy beat the alternative, where did internal/external fragmentation come from, when does compaction pay for itself. Memoria-OS Sim animates that, while keeping the same notation and presets you'd write on the blackboard.

## Stack

- **Next.js 14** (App Router, static export) + **TypeScript**
- **Tailwind CSS** with NVIDIA-inspired neon tokens
- **Framer Motion** for memory-block transitions
- **lucide-react** for icons
- **React** (`useState` + `useMemo`) — the simulation engine runs entirely client-side
- No backend, no database, no tracking

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Building

```bash
npm run build        # static export in ./out
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with `NEXT_PUBLIC_BASE_PATH=/memoria-os-sim` and publishes to GitHub Pages.

To enable Pages on a fresh fork:

1. `Settings → Pages`
2. `Build and deployment: GitHub Actions`

## Keyboard shortcuts

| Key      | Action           |
|----------|------------------|
| Space    | Play / Pause     |
| →        | Step forward     |
| ←        | Step back        |
| R        | Reset            |

## Project layout

```
src/
├── app/                # Next.js App Router entry
├── components/         # Shell, modes, panels, gantt, timeline, i18n provider
├── hooks/              # useSimulationClock
└── lib/                # Engine (contiguousSim, cpuSched, paging, replacement),
                        # presets, i18n dictionary, units, colors
```

See [PLAN.md](./PLAN.md) and [DESIGN.md](./DESIGN.md) for the full design spec and visual system documentation.

## Conventions

- **Time** is discrete: one snapshot per tick. Each snapshot is recomputed deterministically from config + processes, so scrubbing the timeline is O(1).
- **Memory** is the source of truth: every block knows its base address, size and occupant. MFT keeps partition slots static; MVT splits and coalesces holes.
- **Tie-breaking** is deterministic across schedulers: arrival, then alphabetical pid. No simulation should ever produce two different traces from the same input.
- **Sizes** can be entered in KB or MB (e.g. `64 MB`, `65536`). KB is the internal unit; MB is purely a display choice.

## License

MIT — see [LICENSE](./LICENSE).
