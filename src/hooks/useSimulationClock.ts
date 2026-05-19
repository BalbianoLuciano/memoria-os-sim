"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ClockArgs {
  total: number;
  initialT?: number;
  speed: number; // multiplicador, 1 = 1 tick por 500ms
}

export function useSimulationClock({ total, initialT = 0, speed }: ClockArgs) {
  const [t, setT] = useState(initialT);
  const [playing, setPlaying] = useState(false);
  const lastRef = useRef<number>(0);
  const accRef = useRef<number>(0);

  // Si cambia el total (se regeneró la sim), clamp t.
  useEffect(() => {
    setT((prev) => Math.min(prev, Math.max(0, total - 1)));
  }, [total]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    lastRef.current = performance.now();
    const tickMs = 500 / speed;

    const loop = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      accRef.current += dt;
      while (accRef.current >= tickMs) {
        accRef.current -= tickMs;
        setT((prev) => {
          if (prev >= total - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total]);

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setT((prev) => Math.max(0, Math.min(total - 1, prev + dir))),
    [total]
  );
  const reset = useCallback(() => {
    setPlaying(false);
    setT(0);
  }, []);
  const scrub = useCallback(
    (n: number) => setT(Math.max(0, Math.min(total - 1, n))),
    [total]
  );

  return { t, playing, play, pause, step, reset, scrub, setPlaying };
}
