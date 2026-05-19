"use client";

import { useMemo, useState } from "react";
import { computePaging, translate } from "@/lib/paging";
import { useT } from "./LanguageProvider";

export function PagingMode() {
  const { t } = useT();
  const [pBits, setPBits] = useState(4);
  const [dBits, setDBits] = useState(10);
  const [sizeKB, setSizeKB] = useState(12);
  const [freeFrames, setFreeFrames] = useState("3,5,8,2,11");
  const [logical, setLogical] = useState("0001100000001100");

  const result = useMemo(() => {
    const frames = freeFrames
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
    return computePaging({
      pBits,
      dBits,
      processSizeKB: sizeKB,
      freeFrames: frames,
    });
  }, [pBits, dBits, sizeKB, freeFrames]);

  const translation = useMemo(() => {
    const trimmed = logical.trim();
    if (!trimmed) return null;
    const value = /^[01]+$/.test(trimmed)
      ? parseInt(trimmed, 2)
      : parseInt(trimmed, 10);
    if (Number.isNaN(value)) return null;
    return translate(value, pBits, dBits, result.table);
  }, [logical, pBits, dBits, result.table]);

  return (
    <div className="grid grid-cols-[320px_1fr] gap-4 h-full p-4 overflow-hidden">
      <div className="space-y-3 overflow-y-auto scrollbar-thin pr-2 text-xs">
        <h2 className="font-mono uppercase tracking-wider text-neon-green text-sm">
          {t("paging.title")}
        </h2>
        <Field label={t("paging.pBits")}>
          <input
            type="number"
            min={1}
            max={20}
            value={pBits}
            onChange={(e) => setPBits(parseInt(e.target.value) || 1)}
            className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 font-mono"
          />
        </Field>
        <Field label={t("paging.dBits")}>
          <input
            type="number"
            min={1}
            max={20}
            value={dBits}
            onChange={(e) => setDBits(parseInt(e.target.value) || 1)}
            className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 font-mono"
          />
        </Field>
        <Field label={t("paging.processSize")}>
          <input
            type="number"
            min={1}
            value={sizeKB}
            onChange={(e) => setSizeKB(parseInt(e.target.value) || 1)}
            className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 font-mono"
          />
        </Field>
        <Field label={t("paging.freeFrames")}>
          <input
            value={freeFrames}
            onChange={(e) => setFreeFrames(e.target.value)}
            className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 font-mono"
          />
        </Field>
        <Field label={t("paging.logicalAddr")}>
          <input
            value={logical}
            onChange={(e) => setLogical(e.target.value)}
            className="w-full bg-ink-800 border border-ink-700 rounded px-2 py-1 font-mono"
          />
        </Field>

        <div className="border-t border-ink-800 pt-2 space-y-1 font-mono text-[11px] text-zinc-300">
          <div>{t("paging.addressablePages", { n: result.pageCount })}</div>
          <div>{t("paging.pageSize", { n: result.pageSizeWords })}</div>
          <div>{t("paging.totalAddr", { n: result.totalAddrSpaceWords })}</div>
          <div>{t("paging.pagesNeeded", { n: result.pagesNeeded })}</div>
          {result.unassigned > 0 && (
            <div className="text-neon-rose">
              {t("paging.unassigned", { n: result.unassigned })}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 overflow-auto scrollbar-thin border border-ink-800 rounded-md p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
            {t("paging.table")}
          </div>
          <table className="w-full font-mono text-xs">
            <thead className="text-[10px] uppercase text-zinc-500">
              <tr>
                <th className="text-left pb-1">{t("paging.col.page")}</th>
                <th className="text-left pb-1">{t("paging.col.frame")}</th>
                <th className="text-left pb-1">{t("paging.col.physBase")}</th>
              </tr>
            </thead>
            <tbody>
              {result.table.map((row) => (
                <tr key={row.page} className="border-t border-ink-800">
                  <td className="text-neon-cyan py-1">{row.page}</td>
                  <td className="text-neon-green py-1">{row.frame}</td>
                  <td className="text-zinc-400 py-1">
                    {(row.frame << dBits).toString(2).padStart(pBits + dBits, "0")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {translation && (
          <div className="border border-ink-800 rounded-md p-3 text-xs font-mono space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">
              {t("paging.translation")}
            </div>
            <div className="text-zinc-300">
              {t("paging.logical")}{" "}
              <span className="text-neon-cyan">
                {splitBits(translation.bitsLogical, dBits)}
              </span>{" "}
              ({translation.logical})
            </div>
            <div>
              {t("paging.page_eq", { p: translation.page, o: translation.offset })}
            </div>
            {translation.frame !== null ? (
              <>
                <div>{t("paging.frame_eq", { f: translation.frame })}</div>
                <div className="text-zinc-300">
                  {t("paging.physical")}{" "}
                  <span className="text-neon-green">
                    {splitBits(translation.bitsPhysical!, dBits)}
                  </span>{" "}
                  ({translation.physical})
                </div>
              </>
            ) : (
              <div className="text-neon-rose">{t("paging.noFrame")}</div>
            )}
          </div>
        )}
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

function splitBits(s: string, dBits: number): string {
  const head = s.slice(0, s.length - dBits);
  const tail = s.slice(s.length - dBits);
  return `${head}·${tail}`;
}
