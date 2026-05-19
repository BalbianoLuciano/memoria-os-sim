"use client";

import { useEffect, useMemo, useState } from "react";
import { Header, type AppMode } from "@/components/Header";
import { ContiguousMode } from "@/components/ContiguousMode";
import { PagingMode } from "@/components/PagingMode";
import { ReplacementMode } from "@/components/ReplacementMode";
import { TimelineControls } from "@/components/TimelineControls";
import { GanttChart } from "@/components/GanttChart";
import { HelpOverlay } from "@/components/HelpOverlay";
import { simulate } from "@/lib/contiguousSim";
import { DEFAULT_PRESET, PRESETS } from "@/lib/presets";
import { useSimulationClock } from "@/hooks/useSimulationClock";
import type { Unit } from "@/lib/units";

export default function Page() {
  const [mode, setMode] = useState<AppMode>("contiguous");
  const [unit, setUnit] = useState<Unit>("KB");
  const [config, setConfig] = useState(DEFAULT_PRESET.config);
  const [processes, setProcesses] = useState(DEFAULT_PRESET.processes);
  const [helpOpen, setHelpOpen] = useState(false);
  const [speed, setSpeed] = useState(1);

  const sim = useMemo(
    () => simulate(config, processes),
    [config, processes]
  );

  const { t, playing, play, pause, step, reset, scrub } =
    useSimulationClock({ total: sim.snapshots.length, speed });

  // Si cambia la sim, volver al principio para evitar leer un índice obsoleto.
  useEffect(() => {
    scrub(0);
  }, [config, processes, scrub]);

  const ganttCells = useMemo(
    () => sim.snapshots.slice(1).map((s) => s.gantt),
    [sim.snapshots]
  );

  function loadPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setConfig(p.config);
    setProcesses(p.processes);
  }

  return (
    <main className="h-screen w-screen flex flex-col">
      <Header
        mode={mode}
        setMode={setMode}
        unit={unit}
        setUnit={setUnit}
        onHelp={() => setHelpOpen(true)}
      />

      <div className="flex-1 min-h-0">
        {mode === "contiguous" && (
          <ContiguousMode
            unit={unit}
            config={config}
            setConfig={setConfig}
            processes={processes}
            setProcesses={setProcesses}
            snapshots={sim.snapshots}
            t={t}
            loadPreset={loadPreset}
            warnings={sim.warnings}
          />
        )}
        {mode === "paging" && <PagingMode />}
        {mode === "replacement" && <ReplacementMode />}
      </div>

      <footer className="h-[140px] shrink-0 border-t border-ink-800 bg-ink-900/80 flex flex-col gap-2 px-3 py-2">
        <TimelineControls
          t={t}
          total={sim.snapshots.length}
          playing={playing}
          speed={speed}
          setSpeed={setSpeed}
          play={play}
          pause={pause}
          step={step}
          reset={reset}
          scrub={scrub}
        />
        <div className="flex-1 min-h-0">
          <GanttChart
            cells={ganttCells}
            currentT={Math.max(0, t - 1)}
            onSeek={scrub}
          />
        </div>
      </footer>

      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>
  );
}
