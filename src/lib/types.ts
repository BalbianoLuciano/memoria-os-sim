// Modelos del simulador.

export type ProcessId = string;

export type ProcessState =
  | "new"
  | "wait-mem"
  | "ready"
  | "running"
  | "finished";

export interface ProcessSpec {
  id: ProcessId;
  arrival: number; // TA — tiempo de arribo
  burst: number; // TR — duración total de CPU
  size: number; // KB — tamaño en memoria
  priority?: number; // menor = más prioritario
  // TI (tiempo de inicio) y TF (tiempo de fin) son resultados de la sim.
}

export interface ProcessRuntime {
  spec: ProcessSpec;
  state: ProcessState;
  remaining: number;
  startedAt: number | null;
  finishedAt: number | null;
}

export type FitPolicy = "first" | "best" | "worst";
export type Scheme = "mft" | "mvt";
export type CpuPolicy = "fcfs" | "rr" | "sjf" | "priority";

export interface ContiguousConfig {
  totalMemoryKB: number;
  osSizeKB: number;
  scheme: Scheme;
  fit: FitPolicy;
  // MFT: tamaños de particiones de usuario (KB). La suma debe ser ≤ memUsable.
  partitionsKB: number[];
  // MVT: compactación habilitada y costo por ranura compactada.
  compaction: boolean;
  compactionCostPerSlot: number;
  cpu: CpuPolicy;
  quantum: number; // sólo RR
  maxTime: number; // cutoff defensivo
}

// Una "ranura" de memoria contigua. Puede ser una partición fija (MFT) o un hueco
// dinámico (MVT). En MFT el tamaño no cambia; en MVT los huecos se fragmentan y
// fusionan.
export interface MemorySlot {
  id: string;
  start: number; // dirección base en KB
  size: number; // tamaño total
  occupiedBy: ProcessId | null;
  usedBy: number; // KB efectivamente usados por el proceso (≤ size en MFT)
  isOs?: boolean;
}

export type EventKind =
  | "arrival"
  | "load"
  | "wait"
  | "compaction"
  | "start"
  | "preempt"
  | "finish"
  | "idle"
  | "cannot-load";

export interface TickEvent {
  kind: EventKind;
  pid?: ProcessId;
  detail?: string;
}

export interface Snapshot {
  t: number;
  slots: MemorySlot[];
  waitQueue: ProcessId[];
  readyQueue: ProcessId[];
  running: ProcessId | null;
  processes: Record<ProcessId, ProcessRuntime>;
  events: TickEvent[];
  gantt: string; // pid | "IDLE" | "COMPACT"
  fragInternal: number; // KB
  fragExternal: number; // KB
  freeTotal: number; // KB
  compactionLeft: number;
}

export interface SimulationResult {
  snapshots: Snapshot[];
  config: ContiguousConfig;
  processes: ProcessSpec[];
  warnings: string[];
}
