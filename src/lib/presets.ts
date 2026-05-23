import type { ContiguousConfig, ProcessSpec } from "./types";
import type { Key } from "./i18n";

export interface Preset {
  id: string;
  labelKey: Key;
  descKey: Key;
  config: ContiguousConfig;
  processes: ProcessSpec[];
}

export const PRESETS: Preset[] = [
  {
    id: "whiteboard-fcfs-mft-ff",
    labelKey: "preset.whiteboard.label",
    descKey: "preset.whiteboard.desc",
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
      pageSizeKB: 1024,
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
    labelKey: "preset.ej2.label",
    descKey: "preset.ej2.desc",
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
      pageSizeKB: 64,
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
    labelKey: "preset.ej5a.label",
    descKey: "preset.ej5a.desc",
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
      pageSizeKB: 1024,
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
    labelKey: "preset.ej6.label",
    descKey: "preset.ej6.desc",
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
      pageSizeKB: 1024,
    },
    processes: [
      { id: "P1", arrival: 0, burst: 8, size: 4096, priority: 1 },
      { id: "P2", arrival: 1, burst: 6, size: 7000, priority: 2 },
      { id: "P3", arrival: 2, burst: 10, size: 2000, priority: 3 },
      { id: "P4", arrival: 3, burst: 4, size: 6000, priority: 2 },
    ],
  },
  {
    id: "paging-basic-fcfs",
    labelKey: "preset.paging.label",
    descKey: "preset.paging.desc",
    config: {
      totalMemoryKB: 64,
      osSizeKB: 8,
      scheme: "paging",
      fit: "first",
      partitionsKB: [],
      compaction: false,
      compactionCostPerSlot: 1,
      cpu: "fcfs",
      quantum: 4,
      maxTime: 200,
      pageSizeKB: 4,
    },
    processes: [
      { id: "P1", arrival: 0, burst: 4, size: 12, priority: 1 },
      { id: "P2", arrival: 1, burst: 3, size: 9, priority: 1 },
      { id: "P3", arrival: 2, burst: 5, size: 16, priority: 1 },
      { id: "P4", arrival: 5, burst: 2, size: 7, priority: 1 },
    ],
  },
  {
    id: "segmentation-bf-compaction",
    labelKey: "preset.seg.label",
    descKey: "preset.seg.desc",
    config: {
      totalMemoryKB: 1024,
      osSizeKB: 100,
      scheme: "segmentation",
      fit: "best",
      partitionsKB: [],
      compaction: true,
      compactionCostPerSlot: 1,
      cpu: "fcfs",
      quantum: 4,
      maxTime: 200,
      pageSizeKB: 64,
    },
    processes: [
      {
        id: "P1",
        arrival: 0,
        burst: 4,
        size: 320,
        segments: [200, 80, 40],
        priority: 1,
      },
      {
        id: "P2",
        arrival: 1,
        burst: 3,
        size: 220,
        segments: [120, 60, 40],
        priority: 1,
      },
      {
        id: "P3",
        arrival: 2,
        burst: 5,
        size: 260,
        segments: [180, 60, 20],
        priority: 1,
      },
      {
        id: "P4",
        arrival: 4,
        burst: 2,
        size: 160,
        segments: [100, 40, 20],
        priority: 1,
      },
    ],
  },
];

export const DEFAULT_PRESET = PRESETS[0];
