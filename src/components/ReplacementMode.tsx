"use client";

import { useMemo, useState } from "react";
import { runReplacement, type ReplacementAlgo } from "@/lib/replacement";
import { useT } from "./LanguageProvider";

const ALGOS: ReplacementAlgo[] = ["fifo", "lru", "opt"];

export function ReplacementMode() {
  const { t } = useT();
  const [refsText, setRefsText] = useState(
    "1-2-3-4-2-1-5-6-2-1-2-3-7-6-3-2-1-2-3-6"
  );
  const [frameCount, setFrameCount] = useState(3);

  const refs = useMemo(
    () =>
      refsText
        .split(/[\s,\-]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n)),
    [refsText]
  );

  const results = useMemo(
    () => ALGOS.map((a) => runReplacement(refs, frameCount, a)),
    [refs, frameCount]
  );

  return (
    <div className="grid grid-cols-[320px_1fr] gap-4 h-full p-4 overflow-hidden">
      <div className="space-y-3 text-xs">
        <h2 className="font-mono uppercase tracking-wider text-neon-green text-sm">
          {t("replacement.title")}
        </h2>
        <Field label={t("replacement.refs")}>
          <textarea
            value={refsText}
            onChange={(e) => setRefsText(e.target.value)}
            rows={4}
            className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 font-mono"
          />
        </Field>
        <Field label={t("replacement.frameCount")}>
          <input
            type="number"
            min={1}
            max={10}
            value={frameCount}
            onChange={(e) => setFrameCount(parseInt(e.target.value) || 1)}
            className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 font-mono"
          />
        </Field>
        <div className="border-t border-ink-800 pt-2 space-y-1 font-mono text-[11px] text-zinc-400">
          {results.map((r) => (
            <div key={r.algo} className="flex justify-between">
              <span className="uppercase">{r.algo}</span>
              <span>
                {t("replacement.faults", {
                  f: r.faults,
                  p: (r.faultRate * 100).toFixed(1),
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto scrollbar-thin pr-1">
        {results.map((r) => (
          <div key={r.algo} className="border border-ink-800 rounded-md p-3">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono uppercase tracking-wider text-neon-cyan">
                {r.algo}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                {t("replacement.faultsOf", { f: r.faults, n: refs.length })}
              </span>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="font-mono text-[11px]">
                <thead>
                  <tr>
                    <th className="text-left pr-3 pb-1 text-zinc-500">
                      {t("replacement.col.ref")}
                    </th>
                    {r.steps.map((s, i) => (
                      <th
                        key={i}
                        className={`px-1 pb-1 text-center ${
                          s.fault ? "text-neon-rose" : "text-neon-green"
                        }`}
                      >
                        {s.ref}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: frameCount }).map((_, frameIdx) => (
                    <tr key={frameIdx}>
                      <td className="text-zinc-500 pr-3">m{frameIdx}</td>
                      {r.steps.map((s, i) => (
                        <td key={i} className="px-1 text-center text-zinc-300">
                          {s.frames[frameIdx] ?? "·"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="text-zinc-500 pr-3">f</td>
                    {r.steps.map((s, i) => (
                      <td key={i} className="text-center text-neon-rose">
                        {s.fault ? "✗" : ""}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
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
