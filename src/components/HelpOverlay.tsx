"use client";

import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  ["Espacio", "Play / Pausa"],
  ["→", "Paso adelante"],
  ["←", "Paso atrás"],
  ["R", "Reset"],
];

export function HelpOverlay({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-ink-900 border border-ink-700 rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono uppercase tracking-wider text-neon-green">
            ayuda
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1 rounded hover:bg-ink-800 text-zinc-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 text-sm text-zinc-300">
          <section>
            <h3 className="font-mono text-xs uppercase tracking-wider text-neon-cyan mb-2">
              modos
            </h3>
            <ul className="text-xs space-y-1 text-zinc-400">
              <li>
                <span className="text-neon-green">Contiguo</span> · MFT/MVT con
                FF/BF/WF, compactación opcional, CPU schedulers.
              </li>
              <li>
                <span className="text-neon-green">Paginación</span> · traducción
                lógica→física, descomposición de bits, tabla de páginas.
              </li>
              <li>
                <span className="text-neon-green">Reemplazo</span> · FIFO, LRU y
                OPT comparados sobre la misma cadena.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-mono text-xs uppercase tracking-wider text-neon-cyan mb-2">
              atajos
            </h3>
            <ul className="text-xs space-y-1">
              {SHORTCUTS.map(([k, v]) => (
                <li key={k} className="flex gap-3">
                  <kbd className="font-mono bg-ink-800 px-2 py-0.5 rounded text-neon-green min-w-12 text-center">
                    {k}
                  </kbd>
                  <span className="text-zinc-400">{v}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-mono text-xs uppercase tracking-wider text-neon-cyan mb-2">
              tip
            </h3>
            <p className="text-xs text-zinc-400">
              Los tamaños pueden ingresarse en KB o MB (ej.{" "}
              <code className="text-neon-amber">64 MB</code>). Toggle global en
              el header.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
