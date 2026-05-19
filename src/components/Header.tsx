"use client";

import { Cpu, HelpCircle } from "lucide-react";
import type { Unit } from "@/lib/units";

export type AppMode = "contiguous" | "paging" | "replacement";

interface Props {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  unit: Unit;
  setUnit: (u: Unit) => void;
  onHelp: () => void;
}

const MODES: { id: AppMode; label: string }[] = [
  { id: "contiguous", label: "Contiguo" },
  { id: "paging", label: "Paginación" },
  { id: "replacement", label: "Reemplazo" },
];

export function Header({ mode, setMode, unit, setUnit, onHelp }: Props) {
  return (
    <header className="h-14 shrink-0 border-b border-ink-800 bg-ink-900/80 backdrop-blur flex items-center px-4 gap-4">
      <div className="flex items-center gap-2">
        <Cpu className="text-neon-green" size={20} />
        <span className="font-mono uppercase tracking-wider text-sm text-neon-green text-glow-green">
          Memoria-OS
        </span>
        <span className="text-xs text-zinc-500 ml-1">sim</span>
      </div>

      <nav
        role="tablist"
        aria-label="Modos de simulación"
        className="flex bg-ink-800 rounded-md p-1 ml-2 text-xs"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1 rounded transition-colors font-mono ${
              mode === m.id
                ? "bg-neon-green/15 text-neon-green shadow-glow-green"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3 text-xs font-mono">
        <div className="flex bg-ink-800 rounded-md p-1">
          {(["KB", "MB"] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-2 py-1 rounded ${
                unit === u
                  ? "bg-neon-cyan/15 text-neon-cyan"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              aria-pressed={unit === u}
            >
              {u}
            </button>
          ))}
        </div>
        <button
          onClick={onHelp}
          className="p-1.5 rounded hover:bg-ink-800 text-zinc-400 hover:text-neon-green"
          aria-label="Ayuda"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
}
