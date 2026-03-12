/**
 * GOAL Module Adapter — SYSTEM
 * Infrastructure health: uptime, memory pressure, error rates, storage, integrity.
 */

import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

/** Estimate storage usage from StorageManager API (where available) */
async function getStorageEstimate(): Promise<{ usedMB: number; quotaMB: number; utilization: number }> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      const usedMB = Math.round((est.usage ?? 0) / 1024 / 1024);
      const quotaMB = Math.round((est.quota ?? 0) / 1024 / 1024);
      return { usedMB, quotaMB, utilization: quotaMB > 0 ? usedMB / quotaMB : 0 };
    }
  } catch { /* not available */ }
  return { usedMB: 0, quotaMB: 0, utilization: 0 };
}

/** Count active service workers */
function getServiceWorkerCount(): number {
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      return navigator.serviceWorker.controller ? 1 : 0;
    }
  } catch { /* unavailable */ }
  return 0;
}

/** Collect ResourceTiming entries for network health */
function getResourceTimingStats(): { totalResources: number; avgLatencyMs: number; failedResources: number } {
  try {
    if (typeof performance === 'undefined') return { totalResources: 0, avgLatencyMs: 0, failedResources: 0 };
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    if (!entries.length) return { totalResources: 0, avgLatencyMs: 0, failedResources: 0 };

    let totalDuration = 0;
    let failed = 0;
    for (const e of entries) {
      totalDuration += e.duration;
      if (e.transferSize === 0 && e.decodedBodySize === 0 && e.duration > 0) failed++;
    }
    return {
      totalResources: entries.length,
      avgLatencyMs: Math.round(totalDuration / entries.length),
      failedResources: failed,
    };
  } catch { return { totalResources: 0, avgLatencyMs: 0, failedResources: 0 }; }
}

/** Count long tasks via PerformanceObserver snapshot */
function getLongTaskCount(): number {
  try {
    if (typeof performance === 'undefined') return 0;
    return (performance.getEntriesByType('longtask') ?? []).length;
  } catch { return 0; }
}

// ── Cached DOM measurements (expensive — refresh at most every 10s) ──
let _cachedDomNodes = 0;
let _cachedDomDepth = 0;
let _domCacheTs = 0;
const DOM_CACHE_TTL_MS = 10_000;

function getDomMetrics(): { domNodes: number; domDepth: number } {
  const now = Date.now();
  if (now - _domCacheTs < DOM_CACHE_TTL_MS) {
    return { domNodes: _cachedDomNodes, domDepth: _cachedDomDepth };
  }
  _cachedDomNodes = typeof document !== 'undefined' ? document.querySelectorAll('*').length : 0;
  _cachedDomDepth = typeof document !== 'undefined' ? getMaxDOMDepth(document.body) : 0;
  _domCacheTs = now;
  return { domNodes: _cachedDomNodes, domDepth: _cachedDomDepth };
}

export const systemAdapter: ModuleAdapter = {
  moduleId: 'system',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const perf = typeof performance !== 'undefined' ? performance : null;
    const nav = perf?.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;

    const pageLoadMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0;
    const domInteractiveMs = nav ? Math.round(nav.domInteractive - nav.startTime) : 0;
    const ttfbMs = nav ? Math.round(nav.responseStart - nav.requestStart) : 0;

    // Memory (Chrome only)
    const mem = (performance as any)?.memory;
    const heapUsedMB = mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : 0;
    const heapTotalMB = mem ? Math.round(mem.totalJSHeapSize / 1024 / 1024) : 0;
    const heapLimitMB = mem ? Math.round(mem.jsHeapSizeLimit / 1024 / 1024) : 512;
    const heapUtilization = heapLimitMB > 0 ? heapUsedMB / heapLimitMB : 0;
    const heapFragmentation = heapTotalMB > 0 ? 1 - (heapUsedMB / heapTotalMB) : 0;

    // DOM complexity (cached)
    const { domNodes, domDepth } = getDomMetrics();

    // Storage
    const storage = await getStorageEstimate();

    // Network resource health
    const resourceStats = getResourceTimingStats();

    // Long tasks (jank)
    const longTasks = getLongTaskCount();

    // Service workers
    const swCount = getServiceWorkerCount();

    // Connection info
    const conn = (navigator as any)?.connection;
    const effectiveType = conn?.effectiveType ?? 'unknown';
    const downlinkMbps = conn?.downlink ?? 0;

    // ── Health score (0-100) ──
    let healthScore = 100;

    // Memory pressure
    if (heapUtilization > 0.9) healthScore -= 40;
    else if (heapUtilization > 0.7) healthScore -= 20;
    else if (heapUtilization > 0.5) healthScore -= 5;

    // Heap fragmentation
    if (heapFragmentation > 0.5) healthScore -= 10;

    // DOM bloat
    if (domNodes > 5000) healthScore -= 15;
    else if (domNodes > 3000) healthScore -= 5;

    // DOM depth (excessive nesting)
    if (domDepth > 30) healthScore -= 10;
    else if (domDepth > 20) healthScore -= 3;

    // Page load
    if (pageLoadMs > 5000) healthScore -= 15;
    else if (pageLoadMs > 3000) healthScore -= 5;

    // TTFB
    if (ttfbMs > 2000) healthScore -= 10;
    else if (ttfbMs > 800) healthScore -= 3;

    // Long tasks / jank
    if (longTasks > 10) healthScore -= 10;
    else if (longTasks > 3) healthScore -= 3;

    // Failed resources
    if (resourceStats.failedResources > 5) healthScore -= 10;
    else if (resourceStats.failedResources > 0) healthScore -= 3;

    // Storage pressure
    if (storage.utilization > 0.9) healthScore -= 10;
    else if (storage.utilization > 0.7) healthScore -= 5;

    return {
      counters: {
        pageLoadMs,
        domInteractiveMs,
        ttfbMs,
        heapUsedMB,
        heapTotalMB,
        heapLimitMB,
        domNodeCount: domNodes,
        domDepth,
        storageUsedMB: storage.usedMB,
        storageQuotaMB: storage.quotaMB,
        totalResources: resourceStats.totalResources,
        avgResourceLatencyMs: resourceStats.avgLatencyMs,
        failedResources: resourceStats.failedResources,
        longTaskCount: longTasks,
        serviceWorkers: swCount,
        downlinkMbps,
      },
      rates: {
        heapUtilization,
        heapFragmentation,
        storageUtilization: storage.utilization,
      },
      healthScore: Math.max(0, Math.min(100, healthScore)),
      lastUpdated: new Date().toISOString(),
    };
  },
};

/** Walk DOM tree to find max nesting depth */
function getMaxDOMDepth(el: Element | null, depth = 0): number {
  if (!el) return depth;
  let max = depth;
  const children = el.children;
  for (let i = 0; i < Math.min(children.length, 100); i++) {
    max = Math.max(max, getMaxDOMDepth(children[i], depth + 1));
  }
  return max;
}
