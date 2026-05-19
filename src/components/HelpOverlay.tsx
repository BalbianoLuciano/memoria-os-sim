"use client";

import { X } from "lucide-react";
import { useT } from "./LanguageProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HelpOverlay({ open, onClose }: Props) {
  const { t } = useT();
  if (!open) return null;
  const shortcuts: [string, string][] = [
    ["Space", t("help.shortcuts.space")],
    ["→", t("help.shortcuts.right")],
    ["←", t("help.shortcuts.left")],
    ["R", t("help.shortcuts.r")],
  ];
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
            {t("help.title")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("help.close")}
            className="p-1 rounded hover:bg-ink-800 text-zinc-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 text-sm text-zinc-300">
          <section>
            <h3 className="font-mono text-xs uppercase tracking-wider text-neon-cyan mb-2">
              {t("help.modes.title")}
            </h3>
            <ul className="text-xs space-y-1 text-zinc-400">
              <li>
                <span className="text-neon-green">{t("header.contiguous")}</span>{" "}
                · {t("help.modes.contiguous")}
              </li>
              <li>
                <span className="text-neon-green">{t("header.paging")}</span> ·{" "}
                {t("help.modes.paging")}
              </li>
              <li>
                <span className="text-neon-green">{t("header.replacement")}</span>{" "}
                · {t("help.modes.replacement")}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-mono text-xs uppercase tracking-wider text-neon-cyan mb-2">
              {t("help.shortcuts.title")}
            </h3>
            <ul className="text-xs space-y-1">
              {shortcuts.map(([k, v]) => (
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
              {t("help.tip.title")}
            </h3>
            <p className="text-xs text-zinc-400">{t("help.tip.body")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
