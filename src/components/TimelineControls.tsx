"use client";

import {
  Play,
  Pause,
  StepForward,
  StepBack,
  RotateCcw,
} from "lucide-react";
import { useEffect } from "react";

interface Props {
  t: number;
  total: number;
  playing: boolean;
  speed: number;
  setSpeed: (n: number) => void;
  play: () => void;
  pause: () => void;
  step: (dir: 1 | -1) => void;
  reset: () => void;
  scrub: (n: number) => void;
}

const SPEEDS = [0.5, 1, 2, 4];

export function TimelineControls({
  t,
  total,
  playing,
  speed,
  setSpeed,
  play,
  pause,
  step,
  reset,
  scrub,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        if (playing) pause();
        else play();
      } else if (e.code === "ArrowRight") {
        step(1);
      } else if (e.code === "ArrowLeft") {
        step(-1);
      } else if (e.code === "KeyR") {
        reset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, play, pause, step, reset]);

  return (
    <div className="flex items-center gap-3 px-2">
      <button
        onClick={reset}
        aria-label="Reset"
        className="p-1.5 rounded text-zinc-400 hover:text-neon-green hover:bg-ink-800"
      >
        <RotateCcw size={16} />
      </button>
      <button
        onClick={() => step(-1)}
        aria-label="Paso atrás"
        className="p-1.5 rounded text-zinc-400 hover:text-neon-green hover:bg-ink-800"
      >
        <StepBack size={16} />
      </button>
      <button
        onClick={playing ? pause : play}
        aria-label={playing ? "Pausar" : "Reproducir"}
        className="p-1.5 rounded bg-neon-green/15 text-neon-green hover:bg-neon-green/25 shadow-glow-green"
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button
        onClick={() => step(1)}
        aria-label="Paso adelante"
        className="p-1.5 rounded text-zinc-400 hover:text-neon-green hover:bg-ink-800"
      >
        <StepForward size={16} />
      </button>

      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={t}
        onChange={(e) => scrub(parseInt(e.target.value, 10))}
        className="flex-1 accent-neon-green"
        aria-label="Scrub"
      />

      <div className="font-mono text-[10px] text-zinc-400 w-20 text-right">
        t = {t} / {Math.max(0, total - 1)}
      </div>

      <div className="flex gap-1 bg-ink-800 rounded p-0.5 text-[10px] font-mono">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-1.5 py-0.5 rounded ${
              speed === s
                ? "bg-neon-cyan/15 text-neon-cyan"
                : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
