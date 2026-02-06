/**
 * Render Loop Detector
 * Monitors component render frequency to detect infinite loops
 */

import { useRef, useEffect } from "react";
import { diagEnabled, diagLog } from "./diag";

/**
 * Hook to detect excessive re-renders in a component
 * @param name - Component identifier for logging
 * @param thresholdPer5s - Warn if renders exceed this in 5 seconds (default: 40)
 */
export function useRenderLoopDetector(name: string, thresholdPer5s = 40): void {
  const countRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Increment render count (runs on every render)
  if (diagEnabled()) {
    countRef.current += 1;
  }

  useEffect(() => {
    if (!diagEnabled()) return;

    // Clear any existing interval to prevent duplicates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const count = countRef.current;
      if (count > thresholdPer5s) {
        diagLog("warn", "render-loop suspected", { 
          component: name, 
          rendersPer5s: count,
          threshold: thresholdPer5s 
        });
      } else if (count > 0) {
        diagLog("log", "render-rate", { 
          component: name, 
          rendersPer5s: count 
        });
      }
      countRef.current = 0;
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [name, thresholdPer5s]);
}
