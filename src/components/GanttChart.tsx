"use client";

import { useEffect, useRef } from "react";
import { colorFor } from "@/lib/colors";
import { useT } from "./LanguageProvider";

interface Props {
  cells: string[]; // por tick: pid | "IDLE" | "COMPACT"
  currentT: number;
  onSeek?: (tick: number) => void;
}

export function GanttChart({ cells, currentT, onSeek }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useT();
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
          {t("gantt.label")}
        </span>
        <span className="font-mono text-[10px] text-zinc-600">
          {t("gantt.ticks", { n: cells.length })}
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
            const label =
              cell === "IDLE"
                ? t("cpu.idle")
                : cell === "COMPACT"
                ? t("events.compaction")
                : cell;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSeek?.(i + 1)}
                title={`t=${i + 1} · ${label}`}
                aria-label={`t=${i + 1} · ${label}`}
                className="relative h-full w-[22px] shrink-0 border-r border-ink-900 flex items-end justify-center cursor-pointer hover:brightness-125 hover:ring-1 hover:ring-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
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
              </button>
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
