// Algoritmos de reemplazo de páginas: FIFO, LRU, OPT.

export type ReplacementAlgo = "fifo" | "lru" | "opt";

export interface ReplacementStep {
  ref: number;
  fault: boolean;
  evicted: number | null;
  frames: (number | null)[];
}

export interface ReplacementResult {
  algo: ReplacementAlgo;
  steps: ReplacementStep[];
  faults: number;
  faultRate: number;
}

export function runReplacement(
  refs: number[],
  frameCount: number,
  algo: ReplacementAlgo
): ReplacementResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const steps: ReplacementStep[] = [];
  const order: number[] = []; // FIFO insertion order
  const recency: number[] = []; // LRU: pages from least-recent to most-recent
  let faults = 0;

  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const hitIdx = frames.indexOf(ref);
    if (hitIdx !== -1) {
      if (algo === "lru") {
        const idx = recency.indexOf(ref);
        if (idx !== -1) recency.splice(idx, 1);
        recency.push(ref);
      }
      steps.push({
        ref,
        fault: false,
        evicted: null,
        frames: [...frames],
      });
      continue;
    }

    faults += 1;
    let evicted: number | null = null;
    const emptyIdx = frames.indexOf(null);
    if (emptyIdx !== -1) {
      frames[emptyIdx] = ref;
      order.push(ref);
      if (algo === "lru") recency.push(ref);
    } else {
      // necesita reemplazar
      let victim: number;
      if (algo === "fifo") {
        victim = order.shift()!;
        order.push(ref);
      } else if (algo === "lru") {
        victim = recency.shift()!;
        recency.push(ref);
      } else {
        // OPT: el más lejano en el futuro (o no aparece)
        victim = pickOpt(frames as number[], refs, i + 1);
      }
      const vIdx = frames.indexOf(victim);
      frames[vIdx] = ref;
      evicted = victim;
    }

    steps.push({
      ref,
      fault: true,
      evicted,
      frames: [...frames],
    });
  }

  return {
    algo,
    steps,
    faults,
    faultRate: refs.length > 0 ? faults / refs.length : 0,
  };
}

function pickOpt(
  current: number[],
  refs: number[],
  fromIdx: number
): number {
  let victim = current[0];
  let farthest = -1;
  for (const cand of current) {
    const next = refs.indexOf(cand, fromIdx);
    if (next === -1) return cand; // no se vuelve a usar — víctima ideal
    if (next > farthest) {
      farthest = next;
      victim = cand;
    }
  }
  return victim;
}
