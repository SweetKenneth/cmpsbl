/**
 * useThrottle — Throttle a value to update at most once per interval
 */

import { useState, useEffect, useRef } from 'react';

export function useThrottle<T>(value: T, intervalMs = 300): T {
  const [throttled, setThrottled] = useState(value);
  const lastUpdated = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdated.current;

    if (elapsed >= intervalMs) {
      setThrottled(value);
      lastUpdated.current = now;
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setThrottled(value);
        lastUpdated.current = Date.now();
      }, intervalMs - elapsed);
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [value, intervalMs]);

  return throttled;
}
