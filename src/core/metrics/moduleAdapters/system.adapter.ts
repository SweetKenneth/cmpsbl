/**
 * GOAL Module Adapter — SYSTEM
 * Infrastructure health: uptime, memory pressure, error rates.
 */

import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const systemAdapter: ModuleAdapter = {
  moduleId: 'system',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    // Client-side performance metrics
    const perf = typeof performance !== 'undefined' ? performance : null;
    const nav = perf?.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;

    const pageLoadMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0;
    const domInteractiveMs = nav ? Math.round(nav.domInteractive - nav.startTime) : 0;

    // Memory (Chrome only)
    const mem = (performance as any)?.memory;
    const heapUsedMB = mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : 0;
    const heapLimitMB = mem ? Math.round(mem.jsHeapSizeLimit / 1024 / 1024) : 512;
    const heapUtilization = heapLimitMB > 0 ? heapUsedMB / heapLimitMB : 0;

    // DOM complexity
    const domNodes = typeof document !== 'undefined' ? document.querySelectorAll('*').length : 0;

    // Health based on memory + DOM
    let healthScore = 100;
    if (heapUtilization > 0.9) healthScore -= 40;
    else if (heapUtilization > 0.7) healthScore -= 20;
    if (domNodes > 5000) healthScore -= 15;
    else if (domNodes > 3000) healthScore -= 5;
    if (pageLoadMs > 5000) healthScore -= 15;
    else if (pageLoadMs > 3000) healthScore -= 5;

    return {
      counters: {
        pageLoadMs,
        domInteractiveMs,
        heapUsedMB,
        domNodeCount: domNodes,
      },
      rates: {
        heapUtilization,
      },
      healthScore: Math.max(0, Math.min(100, healthScore)),
      lastUpdated: new Date().toISOString(),
    };
  },
};
