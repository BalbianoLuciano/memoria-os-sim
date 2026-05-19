"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";
import { useT } from "./LanguageProvider";

const BREAKPOINT_PX = 1024;

export function SmallScreenGate() {
  const { t } = useT();
  const [tooSmall, setTooSmall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT_PX - 1}px)`);
    const update = () => setTooSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!tooSmall || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink-950/95 backdrop-blur flex items-center justify-center p-6">
      <div className="max-w-sm w-full border border-ink-800 rounded-lg bg-ink-900 p-5 flex flex-col gap-4 text-center">
        <div className="flex justify-center text-neon-cyan">
          <Monitor size={40} />
        </div>
        <h2 className="font-mono text-base text-zinc-100">
          {t("smallscreen.title")}
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {t("smallscreen.body")}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-1 self-center px-3 py-1.5 rounded text-xs font-mono bg-ink-800 text-zinc-300 hover:bg-ink-700 hover:text-neon-green"
        >
          {t("smallscreen.continue")}
        </button>
      </div>
    </div>
  );
}
