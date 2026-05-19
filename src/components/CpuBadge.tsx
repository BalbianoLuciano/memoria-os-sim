"use client";

import { colorFor } from "@/lib/colors";
import { useT } from "./LanguageProvider";

interface Props {
  running: string | null;
  ganttCell: string;
}

export function CpuBadge({ running, ganttCell }: Props) {
  const { t } = useT();
  if (ganttCell === "COMPACT") {
    return (
      <div className="px-3 py-1.5 rounded-md font-mono text-xs bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/50 shadow-glow-magenta animate-pulse-soft">
        CPU · COMPACT
      </div>
    );
  }
  if (!running) {
    return (
      <div className="px-3 py-1.5 rounded-md font-mono text-xs bg-ink-800 text-zinc-500 border border-ink-700">
        CPU · {t("cpu.idle")}
      </div>
    );
  }
  const c = colorFor(running);
  return (
    <div
      className="px-3 py-1.5 rounded-md font-mono text-xs flex items-center gap-2 animate-pulse-soft"
      style={{
        backgroundColor: c.hex + "1a",
        color: c.hex,
        border: `1px solid ${c.hex}66`,
        boxShadow: `0 0 18px -4px ${c.shadow}`,
      }}
    >
      <span>▶</span>
      <span>CPU · {running}</span>
    </div>
  );
}
