"use client";

import { useEffect, useRef } from "react";
import { colorFor } from "@/lib/colors";

interface Props {
  cells: string[]; // por tick: pid | "IDLE" | "COMPACT"
  currentT: number;
}

export function GanttChart({ cells, currentT }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cellWidth = 22;
    const target = currentT * cellWidth;
    const viewportW = el.clientWidth;
    if (target < el.scrollLeft || target > el.scrollLeft + viewportW - 60) {
      el.scrollTo({ left: Math.max(0, target - viewportW / 2), behavior: "smooth" });
    }
  }, [currentT]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          gantt
        </span>
        <span className="font-mono text-[10px] text-zinc-600">
          {cells.length} ticks
        </span>
      </div>
      <div
        ref={ref}
        className="flex-1 overflow-x-auto scrollbar-thin relative border border-ink-800 rounded-md bg-ink-900/40"
      >
        <div className="flex h-full min-w-full" style={{ width: cells.length * 22 }}>
          {cells.map((cell, i) => {
            const isCurrent = i === currentT;
            const bg = ganttCellStyle(cell);
            return (
              <div
                key={i}
                className="relative h-full w-[22px] shrink-0 border-r border-ink-900 flex items-end justify-center"
                style={bg}
              >
                {i % 5 === 0 && (
                  <span className="absolute top-0 left-0.5 text-[8px] font-mono text-zinc-600">
                    {i}
                  </span>
                )}
                <span className="text-[9px] font-mono pb-0.5">
                  {cell === "IDLE" ? "·" : cell === "COMPACT" ? "C" : cell}
                </span>
                {isCurrent && (
                  <div className="absolute inset-y-0 left-0 right-0 ring-1 ring-neon-green pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ganttCellStyle(cell: string): React.CSSProperties {
  if (cell === "IDLE")
    return {
      backgroundColor: "rgba(63,63,70,0.25)",
      color: "#71717a",
    };
  if (cell === "COMPACT")
    return {
      backgroundColor: "rgba(255,43,214,0.18)",
      color: "#ff2bd6",
    };
  const c = colorFor(cell);
  return {
    backgroundColor: c.hex + "22",
    color: c.hex,
    boxShadow: `inset 0 -2px 0 ${c.hex}88`,
  };
}
