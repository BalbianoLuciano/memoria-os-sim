"use client";

import { useState } from "react";
import { ConfigPanel } from "./ConfigPanel";
import { ProcessTable } from "./ProcessTable";
import { MemoryColumn } from "./MemoryColumn";
import { WaitQueue } from "./WaitQueue";
import { CpuBadge } from "./CpuBadge";
import { StatsPanel } from "./StatsPanel";
import { EventLog } from "./EventLog";
import { useT } from "./LanguageProvider";
import { simulate } from "@/lib/contiguousSim";
import { PRESETS } from "@/lib/presets";
import { translateWarning } from "@/lib/i18n";
import type { ContiguousConfig, ProcessSpec, Snapshot } from "@/lib/types";
import type { Unit } from "@/lib/units";

interface Props {
  unit: Unit;
  config: ContiguousConfig;
  setConfig: (next: ContiguousConfig) => void;
  processes: ProcessSpec[];
  setProcesses: (next: ProcessSpec[]) => void;
  snapshots: Snapshot[];
  t: number;
  loadPreset: (id: string) => void;
  warnings: string[];
}

type LeftTab = "config" | "procesos";

export function ContiguousMode({
  unit,
  config,
  setConfig,
  processes,
  setProcesses,
  snapshots,
  t,
  loadPreset,
  warnings,
}: Props) {
  const [tab, setTab] = useState<LeftTab>("config");
  const { t: tr, lang } = useT();
  const snap = snapshots[t] ?? snapshots[snapshots.length - 1];

  return (
    <div className="grid grid-cols-[320px_1fr_320px] gap-3 h-full p-3 overflow-hidden">
      {/* Columna izquierda */}
      <section className="flex flex-col bg-ink-900/60 border border-ink-800 rounded-lg p-3 min-h-0">
        <div className="flex gap-1 bg-ink-800 rounded p-0.5 mb-3 text-[10px] font-mono">
          {(["config", "procesos"] as LeftTab[]).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 px-2 py-1 rounded uppercase ${
                tab === id
                  ? "bg-neon-green/15 text-neon-green"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {id === "config" ? tr("mode.tab.config") : tr("mode.tab.processes")}
            </button>
          ))}
        </div>
        <div className="flex-1 min-h-0">
          {tab === "config" ? (
            <ConfigPanel
              config={config}
              setConfig={setConfig}
              unit={unit}
              onLoadPreset={loadPreset}
            />
          ) : (
            <ProcessTable
              processes={processes}
              setProcesses={setProcesses}
              unit={unit}
              showPriority={config.cpu === "priority"}
            />
          )}
        </div>
        {warnings.length > 0 && (
          <div className="mt-2 border border-neon-rose/40 bg-neon-rose/10 rounded p-2 text-[10px] font-mono text-neon-rose space-y-0.5 max-h-24 overflow-y-auto scrollbar-thin">
            {warnings.map((w, i) => (
              <div key={i}>• {translateWarning(w, lang)}</div>
            ))}
          </div>
        )}
      </section>

      {/* Columna central */}
      <section className="flex bg-ink-900/60 border border-ink-800 rounded-lg p-3 min-h-0 gap-3">
        <div className="flex-1 flex flex-col min-h-0">
          <MemoryColumn
            slots={snap.slots}
            total={config.totalMemoryKB}
            unit={unit}
            scheme={config.scheme}
          />
          <div className="mt-3 flex justify-center">
            <CpuBadge running={snap.running} ganttCell={snap.gantt} />
          </div>
        </div>
        <div className="w-20 shrink-0">
          <WaitQueue
            pids={snap.waitQueue}
            processes={snap.processes}
            unit={unit}
          />
        </div>
      </section>

      {/* Columna derecha */}
      <section className="flex flex-col bg-ink-900/60 border border-ink-800 rounded-lg p-3 min-h-0">
        <StatsPanel snapshot={snap} unit={unit} />
        <div className="border-t border-ink-800 mt-3 pt-3 flex-1 flex flex-col min-h-0">
          <EventLog events={snap.events} t={snap.t} />
        </div>
      </section>
    </div>
  );
}

// Reexport para no romper imports
export { simulate, PRESETS };
