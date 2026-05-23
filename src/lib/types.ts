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
  size: number; // KB — tamaño en memoria (para segmentación: suma de segmentos)
  priority?: number; // menor = más prioritario
  // Para esquema "segmentation": tamaños de cada módulo/segmento (KB).
  // Si no se especifica, se asume un único segmento del tamaño total.
  segments?: number[];
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
export type Scheme = "mft" | "mvt" | "paging" | "segmentation";
export type CpuPolicy = "fcfs" | "rr" | "sjf" | "priority";

export interface ContiguousConfig {
  totalMemoryKB: number;
  osSizeKB: number;
  scheme: Scheme;
  fit: FitPolicy;
  // MFT: tamaños de particiones de usuario (KB). La suma debe ser ≤ memUsable.
  partitionsKB: number[];
  // MVT/segmentación: compactación habilitada y costo por ranura compactada.
  compaction: boolean;
  compactionCostPerSlot: number;
  cpu: CpuPolicy;
  quantum: number; // sólo RR
  maxTime: number; // cutoff defensivo
  // Paginación: tamaño de cada marco/página (KB). Default 1.
  pageSizeKB: number;
}

// Una "ranura" de memoria. En MFT es una partición fija, en MVT un hueco
// dinámico, en paginación un marco fijo, en segmentación un hueco asignado a
// un segmento de un proceso.
export interface MemorySlot {
  id: string;
  start: number; // dirección base en KB
  size: number; // tamaño total
  occupiedBy: ProcessId | null;
  usedBy: number; // KB efectivamente usados por el proceso (≤ size en MFT/paging)
  isOs?: boolean;
  // Paginación: índice de página dentro del proceso (cuál página del proceso
  // está cargada en este marco).
  pageIndex?: number;
  // Segmentación: índice y etiqueta del segmento del proceso en esta ranura.
  segmentIndex?: number;
  segmentLabel?: string;
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
