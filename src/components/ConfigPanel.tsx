"use client";

import { Plus, Trash2 } from "lucide-react";
import { toDisplay, parseKB, type Unit } from "@/lib/units";
import type { ContiguousConfig } from "@/lib/types";
import { PRESETS } from "@/lib/presets";
import { useT } from "./LanguageProvider";

interface Props {
  config: ContiguousConfig;
  setConfig: (next: ContiguousConfig) => void;
  unit: Unit;
  onLoadPreset: (id: string) => void;
}

export function ConfigPanel({ config, setConfig, unit, onLoadPreset }: Props) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-3 text-xs h-full overflow-y-auto scrollbar-thin pr-1">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
          {t("config.preset")}
        </label>
        <select
          onChange={(e) => onLoadPreset(e.target.value)}
          defaultValue=""
          className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 text-zinc-200"
        >
          <option value="" disabled>
            {t("config.preset.load")}
          </option>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {t(p.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <Field label={t("config.scheme")}>
        <Segmented
          value={config.scheme}
          options={[
            { id: "mft", label: "MFT" },
            { id: "mvt", label: "MVT" },
          ]}
          onChange={(v) =>
            setConfig({ ...config, scheme: v as ContiguousConfig["scheme"] })
          }
        />
      </Field>

      <Field label={t("config.fit")}>
        <Segmented
          value={config.fit}
          options={[
            { id: "first", label: "FF" },
            { id: "best", label: "BF" },
            { id: "worst", label: "WF" },
          ]}
          onChange={(v) =>
            setConfig({ ...config, fit: v as ContiguousConfig["fit"] })
          }
        />
      </Field>

      <Field label={t("config.cpu")}>
        <Segmented
          value={config.cpu}
          options={[
            { id: "fcfs", label: "FCFS" },
            { id: "rr", label: "RR" },
            { id: "sjf", label: "SJF" },
            { id: "priority", label: "PR" },
          ]}
          onChange={(v) =>
            setConfig({ ...config, cpu: v as ContiguousConfig["cpu"] })
          }
        />
      </Field>

      {config.cpu === "rr" && (
        <Field label={t("config.quantum")}>
          <input
            type="number"
            min={1}
            value={config.quantum}
            onChange={(e) =>
              setConfig({
                ...config,
                quantum: Math.max(1, parseInt(e.target.value) || 1),
              })
            }
            className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 text-zinc-200 font-mono"
          />
        </Field>
      )}

      <Field label={t("config.totalMemory")}>
        <UnitInput
          valueKB={config.totalMemoryKB}
          unit={unit}
          onChangeKB={(v) => setConfig({ ...config, totalMemoryKB: v })}
        />
      </Field>

      <Field label={t("config.osSize")}>
        <UnitInput
          valueKB={config.osSizeKB}
          unit={unit}
          onChangeKB={(v) => setConfig({ ...config, osSizeKB: v })}
        />
      </Field>

      {config.scheme === "mft" ? (
        <Partitions config={config} setConfig={setConfig} unit={unit} />
      ) : (
        <div className="flex items-center justify-between border border-ink-800 rounded px-2 py-1.5">
          <span className="font-mono text-[11px] text-zinc-300">
            {t("config.compaction")}
          </span>
          <button
            onClick={() =>
              setConfig({ ...config, compaction: !config.compaction })
            }
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
              config.compaction
                ? "bg-neon-magenta/15 text-neon-magenta"
                : "bg-ink-800 text-zinc-500"
            }`}
          >
            {config.compaction
              ? t("config.compaction.on")
              : t("config.compaction.off")}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 bg-ink-800 rounded p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex-1 px-1 py-0.5 rounded text-[10px] font-mono ${
            value === o.id
              ? "bg-neon-green/15 text-neon-green"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function UnitInput({
  valueKB,
  unit,
  onChangeKB,
}: {
  valueKB: number;
  unit: Unit;
  onChangeKB: (v: number) => void;
}) {
  return (
    <input
      key={`${valueKB}-${unit}`}
      defaultValue={toDisplay(valueKB, unit)}
      onBlur={(e) => {
        const kb = parseKB(e.target.value);
        if (kb !== null) onChangeKB(kb);
      }}
      className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 text-zinc-200 font-mono"
    />
  );
}

function Partitions({
  config,
  setConfig,
  unit,
}: {
  config: ContiguousConfig;
  setConfig: (c: ContiguousConfig) => void;
  unit: Unit;
}) {
  const { t } = useT();
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {t("config.partitions")}
        </span>
        <button
          onClick={() =>
            setConfig({
              ...config,
              partitionsKB: [...config.partitionsKB, 1024],
            })
          }
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green text-[10px] font-mono"
        >
          <Plus size={10} /> {t("btn.add")}
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {config.partitionsKB.map((kb, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-zinc-500 w-6">
              #{idx + 1}
            </span>
            <input
              defaultValue={toDisplay(kb, unit)}
              key={`${kb}-${unit}`}
              onBlur={(e) => {
                const v = parseKB(e.target.value);
                if (v !== null) {
                  const arr = [...config.partitionsKB];
                  arr[idx] = v;
                  setConfig({ ...config, partitionsKB: arr });
                }
              }}
              className="flex-1 bg-ink-800 border border-ink-700 rounded px-1.5 py-0.5 text-zinc-200 font-mono text-[11px]"
            />
            <button
              onClick={() =>
                setConfig({
                  ...config,
                  partitionsKB: config.partitionsKB.filter((_, i) => i !== idx),
                })
              }
              className="text-zinc-600 hover:text-neon-rose"
              aria-label={t("config.partitions.delete")}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
