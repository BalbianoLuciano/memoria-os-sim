import type { CpuPolicy, ProcessId, ProcessRuntime } from "./types";

export interface PickContext {
  readyQueue: ProcessId[];
  processes: Record<ProcessId, ProcessRuntime>;
  policy: CpuPolicy;
}

// Devuelve el pid elegido para correr, según política. Los empates se rompen
// por arrival ascendente y luego por id (alfabético) para que la simulación
// sea determinística.
export function pickNext({
  readyQueue,
  processes,
  policy,
}: PickContext): ProcessId | null {
  if (readyQueue.length === 0) return null;

  switch (policy) {
    case "fcfs":
    case "rr":
      return readyQueue[0] ?? null;

    case "sjf": {
      const sorted = [...readyQueue].sort((a, b) => {
        const pa = processes[a].spec;
        const pb = processes[b].spec;
        return (
          pa.burst - pb.burst ||
          pa.arrival - pb.arrival ||
          pa.id.localeCompare(pb.id)
        );
      });
      return sorted[0] ?? null;
    }

    case "priority": {
      const sorted = [...readyQueue].sort((a, b) => {
        const pa = processes[a].spec;
        const pb = processes[b].spec;
        const prA = pa.priority ?? 0;
        const prB = pb.priority ?? 0;
        return (
          prA - prB ||
          pa.arrival - pb.arrival ||
          pa.id.localeCompare(pb.id)
        );
      });
      return sorted[0] ?? null;
    }
  }
}
