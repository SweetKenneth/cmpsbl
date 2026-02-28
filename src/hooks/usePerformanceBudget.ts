/**
 * Performance Budget Monitor — Item #19
 * Monitors route-level load performance and reports violations.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PerformanceBudget {
  maxLCP: number;      // ms
  maxFID: number;      // ms
  maxCLS: number;      // unitless
  maxBundleKB: number; // KB
}

const DEFAULT_BUDGET: PerformanceBudget = {
  maxLCP: 2500,
  maxFID: 100,
  maxCLS: 0.1,
  maxBundleKB: 300,
};

// Heavy routes that get relaxed budgets
const RELAXED_ROUTES = new Set(['/substrate', '/admin', '/decode', '/lab']);

export function usePerformanceBudget() {
  const location = useLocation();
  const reported = useRef(new Set<string>());

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const budget = RELAXED_ROUTES.has(location.pathname)
      ? { ...DEFAULT_BUDGET, maxLCP: 4000, maxBundleKB: 500 }
      : DEFAULT_BUDGET;

    const key = location.pathname;
    if (reported.current.has(key)) return;

    // Observe LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry && lastEntry.startTime > budget.maxLCP) {
          console.warn(`[PerfBudget] LCP exceeded on ${key}: ${Math.round(lastEntry.startTime)}ms (budget: ${budget.maxLCP}ms)`);
        }
        reported.current.add(key);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      return () => lcpObserver.disconnect();
    } catch {
      // Older browsers
    }
  }, [location.pathname]);
}
