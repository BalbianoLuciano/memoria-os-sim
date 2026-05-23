"use client";

import { motion, AnimatePresence } from "framer-motion";
import { colorFor } from "@/lib/colors";
import type { MemorySlot, Scheme } from "@/lib/types";
import { toDisplay, type Unit } from "@/lib/units";
import { useT } from "./LanguageProvider";

interface Props {
  slots: MemorySlot[];
  total: number;
  unit: Unit;
  scheme: Scheme;
  running: string | null;
}

export function MemoryColumn({ slots, total, unit, scheme, running }: Props) {
  const { t } = useT();
  // Para paginación, indexamos los marcos en orden visual (ignorando SO).
  let frameCounter = 0;
  return (
    <div className="flex flex-col h-full w-full max-w-[260px] mx-auto">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          {t("memory.label")}
        </span>
        <span className="font-mono text-xs text-zinc-400">
          {toDisplay(total, unit)}
        </span>
      </div>
      <div className="flex-1 relative border border-ink-700 rounded-md overflow-hidden bg-ink-900/60">
        <AnimatePresence initial={false}>
          {slots.map((slot) => {
            const heightPct = (slot.size / total) * 100;
            const color = slot.isOs
              ? { hex: "#3f3f46", shadow: "rgba(63,63,70,0.5)" }
              : slot.occupiedBy
                ? colorFor(slot.occupiedBy)
                : null;
            const showsInternalStripe =
              (scheme === "mft" || scheme === "paging") &&
              slot.occupiedBy !== null &&
              slot.usedBy < slot.size;
            const innerUsedPct = showsInternalStripe
              ? (slot.usedBy / slot.size) * 100
              : 100;
            const frameIdx = !slot.isOs && scheme === "paging" ? frameCounter++ : -1;
            const subLabel =
              scheme === "paging" && slot.occupiedBy && slot.pageIndex !== undefined
                ? `f${frameIdx}·p${slot.pageIndex}`
                : scheme === "paging" && !slot.isOs && !slot.occupiedBy
                  ? `f${frameIdx}`
                  : scheme === "segmentation" &&
                      slot.occupiedBy &&
                      slot.segmentLabel
                    ? slot.segmentLabel
                    : null;
            return (
              <motion.div
                key={slot.id + ":" + slot.start}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ height: `${heightPct}%` }}
                className="relative border-b border-ink-800 last:border-b-0"
              >
                {slot.isOs ? (
                  <div className="h-full w-full bg-zinc-800/60 flex items-center justify-center font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    {t("memory.os")} · {toDisplay(slot.size, unit)}
                  </div>
                ) : slot.occupiedBy ? (
                  <div
                    className={`h-full w-full relative flex items-center justify-center ${
                      slot.occupiedBy === running ? "animate-pulse-soft" : ""
                    }`}
                    style={{
                      backgroundColor:
                        color!.hex + (slot.occupiedBy === running ? "44" : "22"),
                      boxShadow:
                        slot.occupiedBy === running
                          ? `inset 0 0 0 2px ${color!.hex}, 0 0 24px -2px ${color!.shadow}`
                          : `inset 0 0 0 1px ${color!.hex}55`,
                    }}
                  >
                    {slot.occupiedBy === running && (
                      <span
                        aria-hidden
                        className="absolute left-1 top-1 text-[10px] font-mono"
                        style={{ color: color!.hex }}
                      >
                        ▶
                      </span>
                    )}
                    <div className="text-center font-mono leading-tight">
                      <div
                        className="text-xs font-bold"
                        style={{ color: color!.hex }}
                      >
                        {slot.occupiedBy}
                        {subLabel && (
                          <span className="ml-1 text-[9px] opacity-80">
                            {subLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {toDisplay(slot.usedBy, unit)}
                        {showsInternalStripe
                          ? ` / ${toDisplay(slot.size, unit)}`
                          : ""}
                      </div>
                    </div>
                    {showsInternalStripe && (
                      <div
                        className="absolute left-0 right-0 bottom-0 bg-[repeating-linear-gradient(45deg,rgba(255,176,32,0.12)_0_6px,transparent_6px_12px)]"
                        style={{
                          height: `${100 - innerUsedPct}%`,
                        }}
                        title={t("memory.fragInternal", { size: toDisplay(slot.size - slot.usedBy, unit) })}
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-full w-full bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0_8px,transparent_8px_16px)] flex items-center justify-center">
                    <span className="font-mono text-[10px] text-zinc-500">
                      {subLabel ? `${subLabel} · ` : ""}
                      {t("memory.free")} · {toDisplay(slot.size, unit)}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
