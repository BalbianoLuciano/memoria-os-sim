"use client";

import { colorFor } from "@/lib/colors";
import type { TickEvent } from "@/lib/types";
import { useT } from "./LanguageProvider";
import type { Key } from "@/lib/i18n";

interface Props {
  events: TickEvent[];
  t: number;
}

const LABEL_KEY: Record<TickEvent["kind"], Key> = {
  arrival: "events.arrival",
  load: "events.load",
  wait: "events.wait",
  compaction: "events.compaction",
  start: "events.start",
  preempt: "events.preempt",
  finish: "events.finish",
  idle: "events.idle",
  "cannot-load": "events.cannotLoad",
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
  const { t: tr } = useT();
  return (
    <div
      aria-live="polite"
      className="flex-1 overflow-y-auto scrollbar-thin text-[11px] font-mono space-y-1"
    >
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
        {tr("events.title", { t })}
      </div>
      {events.length === 0 && (
        <div className="text-zinc-600">{tr("events.empty")}</div>
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
              {tr(LABEL_KEY[e.kind])}
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
