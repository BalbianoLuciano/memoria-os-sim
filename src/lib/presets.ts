import type { ContiguousConfig, ProcessSpec } from "./types";

export interface Preset {
  id: string;
  label: string;
  description: string;
  config: ContiguousConfig;
  processes: ProcessSpec[];
}

export const PRESETS: Preset[] = [
  {
    id: "whiteboard-fcfs-mft-ff",
    label: "Pizarrón: FCFS + MFT + First-Fit",
    description:
      "Caso del pizarrón de la cátedra. Particiones [12288, 8192, 8192, 4096, 5120].",
    config: {
      totalMemoryKB: 65536,
      osSizeKB: 27648,
      scheme: "mft",
      fit: "first",
      partitionsKB: [12288, 8192, 8192, 4096, 5120],
      compaction: false,
      compactionCostPerSlot: 1,
      cpu: "fcfs",
      quantum: 4,
      maxTime: 200,
    },
    processes: [
      { id: "P1", arrival: 0, burst: 5, size: 5120, priority: 1 },
      { id: "P2", arrival: 1, burst: 8, size: 3540, priority: 2 },
      { id: "P3", arrival: 2, burst: 3, size: 6144, priority: 3 },
      { id: "P4", arrival: 3, burst: 6, size: 9216, priority: 2 },
      { id: "P5", arrival: 6, burst: 4, size: 4096, priority: 1 },
    ],
  },
  {
    id: "ej-2-fcfs-mvt-ff",
    label: "Ej. 2: MVT + First-Fit",
    description:
      "Memoria fragmentada inicial. Ideal para comparar FF/BF/WF y la compactación.",
    config: {
      totalMemoryKB: 1024,
      osSizeKB: 100,
      scheme: "mvt",
      fit: "first",
      partitionsKB: [],
      compaction: true,
      compactionCostPerSlot: 1,
      cpu: "fcfs",
      quantum: 4,
      maxTime: 200,
    },
    processes: [
      { id: "P1", arrival: 0, burst: 4, size: 180, priority: 1 },
      { id: "P2", arrival: 1, burst: 3, size: 100, priority: 1 },
      { id: "P4", arrival: 2, burst: 5, size: 300, priority: 1 },
      { id: "P5", arrival: 3, burst: 2, size: 250, priority: 1 },
      { id: "P6", arrival: 4, burst: 6, size: 150, priority: 1 },
    ],
  },
  {
    id: "ej-5a-mft-ff-fcfs",
    label: "Ej. 5a: MFT + First-Fit + FCFS",
    description: "Particiones fijas con quantum no aplicable (FCFS).",
    config: {
      totalMemoryKB: 32768,
      osSizeKB: 4096,
      scheme: "mft",
      fit: "first",
      partitionsKB: [8192, 8192, 8192, 4096],
      compaction: false,
      compactionCostPerSlot: 1,
      cpu: "fcfs",
      quantum: 4,
      maxTime: 200,
    },
    processes: [
      { id: "P1", arrival: 0, burst: 4, size: 4096, priority: 1 },
      { id: "P2", arrival: 1, burst: 7, size: 7000, priority: 2 },
      { id: "P3", arrival: 2, burst: 3, size: 2000, priority: 3 },
      { id: "P4", arrival: 3, burst: 5, size: 6000, priority: 2 },
    ],
  },
  {
    id: "ej-6-mft-bf-rr",
    label: "Ej. 6: MFT + Best-Fit + RR (q=4)",
    description: "Round Robin con quantum 4 sobre MFT/Best-Fit.",
    config: {
      totalMemoryKB: 32768,
      osSizeKB: 4096,
      scheme: "mft",
      fit: "best",
      partitionsKB: [8192, 8192, 8192, 4096],
      compaction: false,
      compactionCostPerSlot: 1,
      cpu: "rr",
      quantum: 4,
      maxTime: 200,
    },
    processes: [
      { id: "P1", arrival: 0, burst: 8, size: 4096, priority: 1 },
      { id: "P2", arrival: 1, burst: 6, size: 7000, priority: 2 },
      { id: "P3", arrival: 2, burst: 10, size: 2000, priority: 3 },
      { id: "P4", arrival: 3, burst: 4, size: 6000, priority: 2 },
    ],
  },
];

export const DEFAULT_PRESET = PRESETS[0];
