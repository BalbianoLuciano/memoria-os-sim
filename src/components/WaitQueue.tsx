"use client";

import { motion, AnimatePresence } from "framer-motion";
import { colorFor } from "@/lib/colors";
import type { ProcessRuntime } from "@/lib/types";
import { toDisplay, type Unit } from "@/lib/units";

interface Props {
  pids: string[];
  processes: Record<string, ProcessRuntime>;
  unit: Unit;
}

export function WaitQueue({ pids, processes, unit }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 h-full justify-start pt-6">
      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        wait-mem
      </span>
      <div className="flex flex-col gap-2 items-center overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {pids.map((pid) => {
            const color = colorFor(pid);
            const size = processes[pid]?.spec.size ?? 0;
            return (
              <motion.div
                key={pid}
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.2 }}
                title={`${pid} — ${toDisplay(size, unit)}`}
                className="relative w-12 h-14 flex flex-col items-center justify-center rounded-t-full rounded-b-md border font-mono text-xs"
                style={{
                  borderColor: color.hex + "88",
                  backgroundColor: color.hex + "1a",
                  color: color.hex,
                  boxShadow: `0 0 10px -2px ${color.shadow}`,
                }}
              >
                <span className="font-bold">{pid}</span>
                <span className="text-[9px] text-zinc-400">
                  {toDisplay(size, unit)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {pids.length === 0 && (
          <span className="text-[10px] text-zinc-600 font-mono">vacía</span>
        )}
      </div>
    </div>
  );
}
