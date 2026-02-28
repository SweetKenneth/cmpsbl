/**
 * useCountdown — Countdown timer hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function useCountdown(initialSeconds: number, autoStart = false) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!running || remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { setRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, remaining]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback((s?: number) => { setRemaining(s ?? initialSeconds); setRunning(false); }, [initialSeconds]);

  return { remaining, running, start, pause, reset, isFinished: remaining <= 0 };
}
