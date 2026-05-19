"use client";

import { toDisplay, type Unit } from "@/lib/units";
import type { Snapshot } from "@/lib/types";
import { useT } from "./LanguageProvider";

interface Props {
  snapshot: Snapshot;
  unit: Unit;
}

export function StatsPanel({ snapshot, unit }: Props) {
  const { t } = useT();
  return (
    <div className="space-y-2 text-xs font-mono">
      <Stat label={t("stats.tick")} value={`${snapshot.t}`} />
      <Stat
        label={t("stats.fragInternal")}
        value={toDisplay(snapshot.fragInternal, unit)}
        accent="amber"
      />
      <Stat
        label={t("stats.fragExternal")}
        value={toDisplay(snapshot.fragExternal, unit)}
        accent="amber"
      />
      <Stat
        label={t("stats.freeTotal")}
        value={toDisplay(snapshot.freeTotal, unit)}
        accent="cyan"
      />
      <Stat
        label={t("stats.waitMem")}
        value={`${snapshot.waitQueue.length}`}
        accent="rose"
      />
      <Stat
        label={t("stats.ready")}
        value={`${snapshot.readyQueue.length}`}
        accent="green"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "amber" | "cyan" | "green" | "rose";
}) {
  const color =
    accent === "amber"
      ? "text-neon-amber"
      : accent === "cyan"
        ? "text-neon-cyan"
        : accent === "green"
          ? "text-neon-green"
          : accent === "rose"
            ? "text-neon-rose"
            : "text-zinc-200";
  return (
    <div className="flex justify-between border-b border-ink-800 pb-1">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span className={`text-[11px] ${color}`}>{value}</span>
    </div>
  );
}
