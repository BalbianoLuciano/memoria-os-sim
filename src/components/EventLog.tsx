"use client";

import { colorFor } from "@/lib/colors";
import type { TickEvent } from "@/lib/types";

interface Props {
  events: TickEvent[];
  t: number;
}

const LABEL: Record<TickEvent["kind"], string> = {
  arrival: "arribó",
  load: "cargó en memoria",
  wait: "no entra (espera)",
  compaction: "compactación",
  start: "obtiene CPU",
  preempt: "preempt (quantum)",
  finish: "termina y libera",
  idle: "CPU idle",
  "cannot-load": "no puede cargar",
};

const EMOJI: Record<TickEvent["kind"], string> = {
  arrival: "→",
  load: "✓",
  wait: "…",
  compaction: "⟳",
  start: "▶",
  preempt: "⇄",
  finish: "■",
  idle: "·",
  "cannot-load": "✗",
};

export function EventLog({ events, t }: Props) {
  return (
    <div
      aria-live="polite"
      className="flex-1 overflow-y-auto scrollbar-thin text-[11px] font-mono space-y-1"
    >
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
        eventos t={t}
      </div>
      {events.length === 0 && (
        <div className="text-zinc-600">sin eventos</div>
      )}
      {events.map((e, i) => {
        const color = e.pid ? colorFor(e.pid).hex : "#a1a1aa";
        return (
          <div key={i} className="flex items-start gap-2">
            <span style={{ color }}>{EMOJI[e.kind]}</span>
            {e.pid && (
              <span style={{ color }} className="font-bold">
                {e.pid}
              </span>
            )}
            <span className="text-zinc-300">
              {LABEL[e.kind]}
              {e.detail && (
                <span className="text-zinc-500"> · {e.detail}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
