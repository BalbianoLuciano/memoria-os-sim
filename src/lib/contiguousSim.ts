import { pickNext } from "./cpuSched";
import type {
  ContiguousConfig,
  MemorySlot,
  ProcessId,
  ProcessRuntime,
  ProcessSpec,
  Scheme,
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

function segmentsOf(spec: ProcessSpec): number[] {
  if (spec.segments && spec.segments.length > 0) return spec.segments;
  return [spec.size];
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
  } else if (cfg.scheme === "paging") {
    const pageSize = Math.max(1, cfg.pageSizeKB || 1);
    const userMem = Math.max(0, cfg.totalMemoryKB - cfg.osSizeKB);
    const nFrames = Math.floor(userMem / pageSize);
    for (let i = 0; i < nFrames; i++) {
      slots.push({
        id: `frame-${i}`,
        start: cfg.osSizeKB + i * pageSize,
        size: pageSize,
        occupiedBy: null,
        usedBy: 0,
      });
    }
  } else {
    // MVT y segmentación: un único hueco libre con todo lo que sobra del SO.
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
  fit: ContiguousConfig["fit"]
): number | null {
  const candidates: number[] = [];
  slots.forEach((s, idx) => {
    if (s.isOs) return;
    if (s.occupiedBy !== null) return;
    if (s.size >= size) candidates.push(idx);
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

function carveMVT(state: MutableState, idx: number, size: number): MemorySlot {
  // Talla el hueco al tamaño pedido. Devuelve la ranura tallada (la misma).
  const slot = state.slots[idx];
  const remainder = slot.size - size;
  slot.size = size;
  if (remainder > 0) {
    state.slots.splice(idx + 1, 0, {
      id: `hole-${slot.start + size}`,
      start: slot.start + size,
      size: remainder,
      occupiedBy: null,
      usedBy: 0,
    });
  }
  return slot;
}

function tryAllocate(
  state: MutableState,
  cfg: ContiguousConfig,
  pid: ProcessId
): boolean {
  const spec = state.processes[pid].spec;

  if (cfg.scheme === "mft") {
    const idx = findFit(state.slots, spec.size, cfg.fit);
    if (idx === null) return false;
    const slot = state.slots[idx];
    slot.occupiedBy = pid;
    slot.usedBy = spec.size;
    return true;
  }

  if (cfg.scheme === "mvt") {
    const idx = findFit(state.slots, spec.size, cfg.fit);
    if (idx === null) return false;
    const slot = carveMVT(state, idx, spec.size);
    slot.occupiedBy = pid;
    slot.usedBy = spec.size;
    return true;
  }

  if (cfg.scheme === "paging") {
    const pageSize = Math.max(1, cfg.pageSizeKB || 1);
    const pagesNeeded = Math.ceil(spec.size / pageSize);
    const freeFrames: number[] = [];
    for (let i = 0; i < state.slots.length; i++) {
      const s = state.slots[i];
      if (s.isOs) continue;
      if (s.occupiedBy === null) freeFrames.push(i);
      if (freeFrames.length === pagesNeeded) break;
    }
    if (freeFrames.length < pagesNeeded) return false;
    let remainingBytes = spec.size;
    for (let p = 0; p < pagesNeeded; p++) {
      const slot = state.slots[freeFrames[p]];
      slot.occupiedBy = pid;
      slot.pageIndex = p;
      const fill = Math.min(pageSize, remainingBytes);
      slot.usedBy = fill;
      remainingBytes -= fill;
    }
    return true;
  }

  // segmentation: all-or-nothing con rollback en caso de fallo.
  const segs = segmentsOf(spec);
  const backup = state.slots.map((s) => ({ ...s }));
  for (let segI = 0; segI < segs.length; segI++) {
    const size = segs[segI];
    const idx = findFit(state.slots, size, cfg.fit);
    if (idx === null) {
      state.slots = backup;
      return false;
    }
    const slot = carveMVT(state, idx, size);
    slot.occupiedBy = pid;
    slot.usedBy = size;
    slot.segmentIndex = segI;
    slot.segmentLabel = `S${segI}`;
  }
  return true;
}

function coalesceAll(state: MutableState): void {
  // Fusiona ranuras libres consecutivas (excluyendo SO).
  for (let i = state.slots.length - 1; i > 0; i--) {
    const cur = state.slots[i];
    const prev = state.slots[i - 1];
    if (
      !cur.isOs &&
      !prev.isOs &&
      cur.occupiedBy === null &&
      prev.occupiedBy === null
    ) {
      prev.size += cur.size;
      state.slots.splice(i, 1);
    }
  }
}

function release(
  state: MutableState,
  scheme: Scheme,
  pid: ProcessId
): void {
  if (scheme === "mft") {
    const slot = state.slots.find((s) => s.occupiedBy === pid);
    if (!slot) return;
    slot.occupiedBy = null;
    slot.usedBy = 0;
    return;
  }

  if (scheme === "paging") {
    for (const slot of state.slots) {
      if (slot.occupiedBy === pid) {
        slot.occupiedBy = null;
        slot.usedBy = 0;
        slot.pageIndex = undefined;
      }
    }
    return;
  }

  // MVT y segmentación: liberar todas las ranuras del proceso y fusionar.
  for (const slot of state.slots) {
    if (slot.occupiedBy === pid) {
      slot.occupiedBy = null;
      slot.usedBy = 0;
      slot.segmentIndex = undefined;
      slot.segmentLabel = undefined;
    }
  }
  coalesceAll(state);
}

function totalFree(slots: MemorySlot[]): number {
  return slots
    .filter((s) => !s.isOs && s.occupiedBy === null)
    .reduce((acc, s) => acc + s.size, 0);
}

function compact(state: MutableState): number {
  // Compacta (MVT/segmentación): empuja todo lo ocupado al inicio,
  // deja un único hueco al final. Devuelve la cantidad de ranuras libres
  // que se eliminaron (≥1).
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

function pendingMinForScheme(
  state: MutableState,
  cfg: ContiguousConfig
): number | null {
  if (state.waitQueue.length === 0) return null;
  if (cfg.scheme === "segmentation") {
    // El "más chico que está esperando hueco" es el mínimo de todos los
    // segmentos pendientes — si entra algo de ese tamaño, la espera puede
    // moverse aunque sea para un sub-proceso.
    let m = Infinity;
    for (const pid of state.waitQueue) {
      const spec = state.processes[pid].spec;
      for (const seg of segmentsOf(spec)) {
        if (seg < m) m = seg;
      }
    }
    return m === Infinity ? null : m;
  }
  // Resto: tamaño total del proceso.
  return Math.min(
    ...state.waitQueue.map((pid) => state.processes[pid].spec.size)
  );
}

function computeFragmentation(
  slots: MemorySlot[],
  scheme: Scheme,
  pendingMinSize: number | null
): { internal: number; external: number } {
  let internal = 0;
  let external = 0;

  if (scheme === "paging") {
    // Sólo frag interna en la última página de cada proceso.
    for (const s of slots) {
      if (s.isOs) continue;
      if (s.occupiedBy !== null) internal += s.size - s.usedBy;
    }
    return { internal, external: 0 };
  }

  for (const s of slots) {
    if (s.isOs) continue;
    if (s.occupiedBy !== null) {
      if (scheme === "mft") internal += s.size - s.usedBy;
    } else {
      if (pendingMinSize !== null && s.size < pendingMinSize) {
        external += s.size;
      } else if (pendingMinSize === null) {
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
  const pendingMin = pendingMinForScheme(state, cfg);
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
  if (cfg.scheme === "paging" && (!cfg.pageSizeKB || cfg.pageSizeKB <= 0)) {
    errs.push("El tamaño de página debe ser > 0.");
  }
  if (cfg.cpu === "rr" && cfg.quantum <= 0)
    errs.push("El quantum debe ser > 0 para Round Robin.");
  if (procs.length === 0) errs.push("Ingresá al menos un proceso.");

  const userMem = cfg.totalMemoryKB - cfg.osSizeKB;

  for (const p of procs) {
    if (cfg.scheme === "mft") {
      const usable = Math.max(...cfg.partitionsKB, 0);
      if (p.size > usable)
        errs.push(`${p.id} (${p.size}K) no entra en la memoria utilizable.`);
    } else if (cfg.scheme === "mvt") {
      if (p.size > userMem)
        errs.push(`${p.id} (${p.size}K) no entra en la memoria utilizable.`);
    } else if (cfg.scheme === "paging") {
      const pageSize = Math.max(1, cfg.pageSizeKB || 1);
      const nFrames = Math.floor(userMem / pageSize);
      const pagesNeeded = Math.ceil(p.size / pageSize);
      if (pagesNeeded > nFrames)
        errs.push(`${p.id} (${p.size}K) no entra en la memoria utilizable.`);
    } else if (cfg.scheme === "segmentation") {
      const segs = segmentsOf(p);
      const sum = segs.reduce((a, b) => a + b, 0);
      if (sum > userMem)
        errs.push(`${p.id} (${sum}K) no entra en la memoria utilizable.`);
      const maxSeg = Math.max(...segs, 0);
      if (maxSeg > userMem)
        errs.push(`${p.id} (${maxSeg}K) no entra en la memoria utilizable.`);
    }
  }
  return errs;
}

function sizeFor(
  state: MutableState,
  cfg: ContiguousConfig,
  pid: ProcessId
): number {
  // Memoria total que necesita este proceso para entrar (para decidir si
  // compactar). Para segmentación, suma de segmentos.
  const spec = state.processes[pid].spec;
  if (cfg.scheme === "segmentation") {
    return segmentsOf(spec).reduce((a, b) => a + b, 0);
  }
  return spec.size;
}

function compactionApplies(scheme: Scheme): boolean {
  return scheme === "mvt" || scheme === "segmentation";
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
        const allocated = tryAllocate(state, cfg, pid);
        if (allocated) {
          state.waitQueue = state.waitQueue.filter((x) => x !== pid);
          state.readyQueue.push(pid);
          state.processes[pid].state = "ready";
          events.push({ kind: "load", pid });
          progress = true;
        } else if (
          compactionApplies(cfg.scheme) &&
          cfg.compaction &&
          totalFree(state.slots) >= sizeFor(state, cfg, pid)
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
