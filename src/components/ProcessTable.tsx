"use client";

import { Trash2, Plus } from "lucide-react";
import { colorFor } from "@/lib/colors";
import { toDisplay, parseKB, type Unit } from "@/lib/units";
import type { ProcessSpec, Scheme } from "@/lib/types";
import { useT } from "./LanguageProvider";

interface Props {
  processes: ProcessSpec[];
  setProcesses: (next: ProcessSpec[]) => void;
  unit: Unit;
  showPriority: boolean;
  scheme: Scheme;
}

function segmentsToString(segs: number[] | undefined, unit: Unit): string {
  if (!segs || segs.length === 0) return "";
  return segs.map((kb) => toDisplay(kb, unit)).join(", ");
}

function parseSegments(raw: string): number[] | null {
  const parts = raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) return [];
  const vals: number[] = [];
  for (const p of parts) {
    const kb = parseKB(p);
    if (kb === null || kb <= 0) return null;
    vals.push(kb);
  }
  return vals;
}

export function ProcessTable({
  processes,
  setProcesses,
  unit,
  showPriority,
  scheme,
}: Props) {
  const { t } = useT();
  const showSegments = scheme === "segmentation";

  function update(idx: number, patch: Partial<ProcessSpec>) {
    const copy = processes.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    setProcesses(copy);
  }

  function remove(idx: number) {
    setProcesses(processes.filter((_, i) => i !== idx));
  }

  function add() {
    const ids = new Set(processes.map((p) => p.id));
    let n = processes.length + 1;
    while (ids.has(`P${n}`)) n++;
    setProcesses([
      ...processes,
      { id: `P${n}`, arrival: 0, burst: 3, size: 1024, priority: 1 },
    ]);
  }

  return (
    <div className="flex flex-col gap-2 text-xs h-full">
      <div className="flex items-center justify-between">
        <span className="font-mono uppercase tracking-wider text-zinc-500">
          {t("table.processes")}
        </span>
        <button
          onClick={add}
          className="flex items-center gap-1 px-2 py-1 rounded bg-neon-green/10 text-neon-green hover:bg-neon-green/20 text-[10px] font-mono"
        >
          <Plus size={12} /> {t("btn.add")}
        </button>
      </div>

      <div className="overflow-y-auto scrollbar-thin pr-1">
        <table className="w-full font-mono">
          <thead className="text-[9px] uppercase text-zinc-500">
            <tr>
              <th className="text-left pb-1">{t("table.col.id")}</th>
              <th className="text-right pb-1">{t("table.col.arrival")}</th>
              <th className="text-right pb-1">{t("table.col.burst")}</th>
              <th className="text-right pb-1">{t("table.col.size")}</th>
              {showSegments && (
                <th className="text-left pb-1 pl-2">
                  {t("table.col.segments")}
                </th>
              )}
              {showPriority && (
                <th className="text-right pb-1">{t("table.col.priority")}</th>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, idx) => {
              const c = colorFor(p.id);
              return (
                <tr key={idx} className="border-t border-ink-800">
                  <td>
                    <input
                      value={p.id}
                      onChange={(e) =>
                        update(idx, { id: e.target.value.toUpperCase() })
                      }
                      className="w-12 bg-transparent px-1 py-0.5 text-[11px] font-bold"
                      style={{ color: c.hex }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.arrival}
                      min={0}
                      onChange={(e) =>
                        update(idx, { arrival: parseInt(e.target.value) || 0 })
                      }
                      className="w-10 bg-transparent px-1 py-0.5 text-right text-zinc-200"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.burst}
                      min={1}
                      onChange={(e) =>
                        update(idx, { burst: parseInt(e.target.value) || 1 })
                      }
                      className="w-10 bg-transparent px-1 py-0.5 text-right text-zinc-200"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      defaultValue={toDisplay(p.size, unit)}
                      onBlur={(e) => {
                        const kb = parseKB(e.target.value);
                        if (kb !== null) update(idx, { size: kb });
                        e.target.value = toDisplay(kb ?? p.size, unit);
                      }}
                      key={`${p.size}-${unit}`}
                      className="w-20 bg-transparent px-1 py-0.5 text-right text-zinc-200"
                    />
                  </td>
                  {showSegments && (
                    <td className="pl-2">
                      <input
                        type="text"
                        defaultValue={segmentsToString(p.segments, unit)}
                        placeholder={t("table.col.segments.placeholder")}
                        onBlur={(e) => {
                          const segs = parseSegments(e.target.value);
                          if (segs === null) {
                            e.target.value = segmentsToString(
                              p.segments,
                              unit
                            );
                            return;
                          }
                          const patch: Partial<ProcessSpec> = {
                            segments: segs.length > 0 ? segs : undefined,
                          };
                          if (segs.length > 0) {
                            patch.size = segs.reduce((a, b) => a + b, 0);
                          }
                          update(idx, patch);
                        }}
                        key={`${segmentsToString(p.segments, unit)}-${unit}`}
                        className="w-28 bg-ink-800/40 border border-ink-800 rounded px-1 py-0.5 text-zinc-200 text-[10px]"
                      />
                    </td>
                  )}
                  {showPriority && (
                    <td>
                      <input
                        type="number"
                        value={p.priority ?? 0}
                        onChange={(e) =>
                          update(idx, {
                            priority: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-10 bg-transparent px-1 py-0.5 text-right text-zinc-200"
                      />
                    </td>
                  )}
                  <td className="text-right">
                    <button
                      onClick={() => remove(idx)}
                      aria-label={t("table.delete", { pid: p.id })}
                      className="p-0.5 text-zinc-600 hover:text-neon-rose"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
