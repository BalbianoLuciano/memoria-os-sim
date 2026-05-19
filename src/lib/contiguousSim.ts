import { pickNext } from "./cpuSched";
import type {
  ContiguousConfig,
  MemorySlot,
  ProcessId,
  ProcessRuntime,
  ProcessSpec,
  Snapshot,
  SimulationResult,
  TickEvent,
} from "./types";

interface MutableState {
  slots: MemorySlot[];
  waitQueue: ProcessId[];
  readyQueue: ProcessId[];
  running: ProcessId | null;
  processes: Record<ProcessId, ProcessRuntime>;
  compactionLeft: number;
  quantumLeft: number;
}

function freshState(cfg: ContiguousConfig, procs: ProcessSpec[]): MutableState {
  const slots: MemorySlot[] = [];
  // El SO siempre ocupa el inicio.
  slots.push({
    id: "os",
    start: 0,
    size: cfg.osSizeKB,
    occupiedBy: null,
    usedBy: cfg.osSizeKB,
    isOs: true,
  });

  if (cfg.scheme === "mft") {
    let cursor = cfg.osSizeKB;
    cfg.partitionsKB.forEach((size, i) => {
      slots.push({
        id: `part-${i + 1}`,
        start: cursor,
        size,
        occupiedBy: null,
        usedBy: 0,
      });
      cursor += size;
    });
  } else {
    // MVT: un único hueco libre con todo lo que sobra del SO.
    slots.push({
      id: "hole-0",
      start: cfg.osSizeKB,
      size: Math.max(0, cfg.totalMemoryKB - cfg.osSizeKB),
      occupiedBy: null,
      usedBy: 0,
    });
  }

  const processes: Record<ProcessId, ProcessRuntime> = {};
  for (const p of procs) {
    processes[p.id] = {
      spec: p,
      state: "new",
      remaining: p.burst,
      startedAt: null,
      finishedAt: null,
    };
  }

  return {
    slots,
    waitQueue: [],
    readyQueue: [],
    running: null,
    processes,
    compactionLeft: 0,
    quantumLeft: 0,
  };
}

function findFit(
  slots: MemorySlot[],
  size: number,
  fit: ContiguousConfig["fit"],
  scheme: ContiguousConfig["scheme"]
): number | null {
  const candidates: number[] = [];
  slots.forEach((s, idx) => {
    if (s.isOs) return;
    if (s.occupiedBy !== null) return;
    const free = scheme === "mft" ? s.size : s.size; // huecos puros
    if (free >= size) candidates.push(idx);
  });
  if (candidates.length === 0) return null;

  switch (fit) {
    case "first":
      return candidates[0];
    case "best":
      return candidates.reduce((best, idx) =>
        slots[idx].size < slots[best].size ? idx : best
      );
    case "worst":
      return candidates.reduce((worst, idx) =>
        slots[idx].size > slots[worst].size ? idx : worst
      );
  }
}

function allocate(
  state: MutableState,
  scheme: ContiguousConfig["scheme"],
  idx: number,
  pid: ProcessId
): void {
  const slot = state.slots[idx];
  const size = state.processes[pid].spec.size;

  if (scheme === "mft") {
    slot.occupiedBy = pid;
    slot.usedBy = size;
    return;
  }

  // MVT: talla el hueco al tamaño exacto y, si sobra, deja un nuevo hueco.
  const remainder = slot.size - size;
  slot.size = size;
  slot.occupiedBy = pid;
  slot.usedBy = size;
  if (remainder > 0) {
    state.slots.splice(idx + 1, 0, {
      id: `hole-${slot.start + size}`,
      start: slot.start + size,
      size: remainder,
      occupiedBy: null,
      usedBy: 0,
    });
  }
}

function release(
  state: MutableState,
  scheme: ContiguousConfig["scheme"],
  pid: ProcessId
): void {
  const idx = state.slots.findIndex((s) => s.occupiedBy === pid);
  if (idx === -1) return;
  const slot = state.slots[idx];
  slot.occupiedBy = null;
  slot.usedBy = 0;

  if (scheme === "mvt") {
    // Coalescing: fusionar con vecinos libres.
    const i = idx;
    if (i + 1 < state.slots.length) {
      const next = state.slots[i + 1];
      if (!next.isOs && next.occupiedBy === null) {
        slot.size += next.size;
        state.slots.splice(i + 1, 1);
      }
    }
    if (i - 1 >= 0) {
      const prev = state.slots[i - 1];
      if (!prev.isOs && prev.occupiedBy === null) {
        prev.size += slot.size;
        state.slots.splice(i, 1);
      }
    }
  }
}

function totalFree(slots: MemorySlot[]): number {
  return slots
    .filter((s) => !s.isOs && s.occupiedBy === null)
    .reduce((acc, s) => acc + s.size, 0);
}

function compact(state: MutableState): number {
  // Compacta MVT: empuja procesos al inicio, deja un único hueco al final.
  // "Ranuras compactadas" = cantidad de huecos no terminales que se eliminan.
  const occupied = state.slots.filter((s) => !s.isOs && s.occupiedBy !== null);
  const osSlot = state.slots.find((s) => s.isOs)!;
  const totalFreeKB = totalFree(state.slots);
  const ranuras = state.slots.filter(
    (s) => !s.isOs && s.occupiedBy === null
  ).length;

  let cursor = osSlot.size;
  const newSlots: MemorySlot[] = [osSlot];
  for (const slot of occupied) {
    slot.start = cursor;
    newSlots.push(slot);
    cursor += slot.size;
  }
  if (totalFreeKB > 0) {
    newSlots.push({
      id: `hole-${cursor}`,
      start: cursor,
      size: totalFreeKB,
      occupiedBy: null,
      usedBy: 0,
    });
  }
  state.slots = newSlots;
  return Math.max(1, ranuras);
}

function computeFragmentation(
  slots: MemorySlot[],
  scheme: ContiguousConfig["scheme"],
  pendingMinSize: number | null
): { internal: number; external: number } {
  let internal = 0;
  let external = 0;
  for (const s of slots) {
    if (s.isOs) continue;
    if (s.occupiedBy !== null) {
      if (scheme === "mft") internal += s.size - s.usedBy;
    } else {
      if (pendingMinSize !== null && s.size < pendingMinSize) {
        external += s.size;
      } else if (pendingMinSize === null) {
        // sin pendientes: la frag externa es el total libre disperso (suma de huecos)
        external += s.size;
      }
    }
  }
  return { internal, external };
}

function snapshot(
  state: MutableState,
  cfg: ContiguousConfig,
  t: number,
  events: TickEvent[],
  ganttCell: string
): Snapshot {
  const pendingSizes = state.waitQueue.map(
    (pid) => state.processes[pid].spec.size
  );
  const pendingMin = pendingSizes.length > 0 ? Math.min(...pendingSizes) : null;
  const { internal, external } = computeFragmentation(
    state.slots,
    cfg.scheme,
    pendingMin
  );
  return {
    t,
    slots: state.slots.map((s) => ({ ...s })),
    waitQueue: [...state.waitQueue],
    readyQueue: [...state.readyQueue],
    running: state.running,
    processes: Object.fromEntries(
      Object.entries(state.processes).map(([k, v]) => [k, { ...v }])
    ),
    events: [...events],
    gantt: ganttCell,
    fragInternal: internal,
    fragExternal: external,
    freeTotal: totalFree(state.slots),
    compactionLeft: state.compactionLeft,
  };
}

export function validate(
  cfg: ContiguousConfig,
  procs: ProcessSpec[]
): string[] {
  const errs: string[] = [];
  if (cfg.totalMemoryKB <= 0) errs.push("La memoria total debe ser > 0.");
  if (cfg.osSizeKB >= cfg.totalMemoryKB)
    errs.push("El SO no puede ser mayor o igual a la memoria total.");
  if (cfg.scheme === "mft") {
    const sum = cfg.partitionsKB.reduce((a, b) => a + b, 0);
    if (sum > cfg.totalMemoryKB - cfg.osSizeKB)
      errs.push("La suma de particiones excede la memoria utilizable.");
  }
  if (cfg.cpu === "rr" && cfg.quantum <= 0)
    errs.push("El quantum debe ser > 0 para Round Robin.");
  if (procs.length === 0) errs.push("Ingresá al menos un proceso.");
  for (const p of procs) {
    const usable =
      cfg.scheme === "mft"
        ? Math.max(...cfg.partitionsKB, 0)
        : cfg.totalMemoryKB - cfg.osSizeKB;
    if (p.size > usable)
      errs.push(`${p.id} (${p.size}K) no entra en la memoria utilizable.`);
  }
  return errs;
}

export function simulate(
  cfg: ContiguousConfig,
  procs: ProcessSpec[]
): SimulationResult {
  const warnings = validate(cfg, procs);
  const state = freshState(cfg, procs);
  const snapshots: Snapshot[] = [];

  if (warnings.length > 0) {
    snapshots.push(snapshot(state, cfg, 0, [], "IDLE"));
    return { snapshots, config: cfg, processes: procs, warnings };
  }

  // Snapshot inicial t=-1 que muestra el estado limpio antes del primer tick.
  snapshots.push(snapshot(state, cfg, 0, [], "IDLE"));

  for (let t = 0; t < cfg.maxTime; t++) {
    const events: TickEvent[] = [];
    let ganttCell: string = "IDLE";

    // 1. Compactación en curso
    if (state.compactionLeft > 0) {
      state.compactionLeft -= 1;
      ganttCell = "COMPACT";
      snapshots.push(snapshot(state, cfg, t, events, ganttCell));
      if (allFinished(state)) break;
      continue;
    }

    // 2. Arribos
    for (const p of procs) {
      if (p.arrival === t) {
        state.processes[p.id].state = "wait-mem";
        state.waitQueue.push(p.id);
        events.push({ kind: "arrival", pid: p.id });
      }
    }

    // 3. Cargas wait-mem → memoria
    let progress = true;
    while (progress) {
      progress = false;
      for (const pid of [...state.waitQueue]) {
        const size = state.processes[pid].spec.size;
        const idx = findFit(state.slots, size, cfg.fit, cfg.scheme);
        if (idx !== null) {
          allocate(state, cfg.scheme, idx, pid);
          state.waitQueue = state.waitQueue.filter((x) => x !== pid);
          state.readyQueue.push(pid);
          state.processes[pid].state = "ready";
          events.push({ kind: "load", pid });
          progress = true;
        } else if (
          cfg.scheme === "mvt" &&
          cfg.compaction &&
          totalFree(state.slots) >= size
        ) {
          const slots = compact(state);
          state.compactionLeft = slots * cfg.compactionCostPerSlot;
          events.push({
            kind: "compaction",
            detail: `${slots} ranura(s), costo ${state.compactionLeft}t`,
          });
          ganttCell = "COMPACT";
          // gasta el tick
          state.compactionLeft -= 1;
          snapshots.push(snapshot(state, cfg, t, events, ganttCell));
          if (allFinished(state)) return finish(snapshots, cfg, procs, warnings);
          // continue al siguiente tick sin ejecutar 4 ni 5
          progress = false;
          break;
        } else {
          events.push({
            kind: "wait",
            pid,
            detail: "no hay hueco / memoria insuficiente",
          });
        }
      }
      if (ganttCell === "COMPACT") break;
    }
    if (ganttCell === "COMPACT") {
      if (allFinished(state)) break;
      continue;
    }

    // 4. Despachar CPU si no hay nadie corriendo
    if (state.running === null && state.readyQueue.length > 0) {
      const pid = pickNext({
        readyQueue: state.readyQueue,
        processes: state.processes,
        policy: cfg.cpu,
      });
      if (pid) {
        state.running = pid;
        state.readyQueue = state.readyQueue.filter((x) => x !== pid);
        state.processes[pid].state = "running";
        if (state.processes[pid].startedAt === null) {
          state.processes[pid].startedAt = t;
        }
        if (cfg.cpu === "rr") state.quantumLeft = cfg.quantum;
        events.push({ kind: "start", pid });
      }
    }

    // 5. Ejecutar 1 unidad
    if (state.running !== null) {
      const pid = state.running;
      const rt = state.processes[pid];
      rt.remaining -= 1;
      ganttCell = pid;

      if (rt.remaining === 0) {
        rt.state = "finished";
        rt.finishedAt = t + 1;
        release(state, cfg.scheme, pid);
        events.push({ kind: "finish", pid });
        state.running = null;
      } else if (cfg.cpu === "rr") {
        state.quantumLeft -= 1;
        if (state.quantumLeft === 0) {
          rt.state = "ready";
          state.readyQueue.push(pid);
          events.push({ kind: "preempt", pid });
          state.running = null;
        }
      }
    } else {
      events.push({ kind: "idle" });
    }

    snapshots.push(snapshot(state, cfg, t, events, ganttCell));

    if (allFinished(state) && state.waitQueue.length === 0) break;
  }

  return finish(snapshots, cfg, procs, warnings);
}

function allFinished(state: MutableState): boolean {
  return Object.values(state.processes).every((p) => p.state === "finished");
}

function finish(
  snapshots: Snapshot[],
  cfg: ContiguousConfig,
  procs: ProcessSpec[],
  warnings: string[]
): SimulationResult {
  return { snapshots, config: cfg, processes: procs, warnings };
}
