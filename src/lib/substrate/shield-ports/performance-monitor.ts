/**
 * Performance Monitor — Ported from aetherion-shield
 * Instrumentation for memory, slow-ops, and Web Vitals
 * Target nodes: VISION, NERVE, ANALYTICS
 */

import { boundArray } from '@/lib/system/hardening';

interface PerfMark {
  name: string;
  startTime: number;
}

interface PerfEntry {
  name: string;
  durationMs: number;
  success: boolean;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const SLOW_THRESHOLD_MS = 3000;
const MAX_HISTORY = 200;

class PerformanceMonitor {
  private marks = new Map<string, PerfMark>();
  private history: PerfEntry[] = [];
  private enabled = true;

  /** Start a named timer */
  start(name: string): void {
    if (!this.enabled) return;
    this.marks.set(name, { name, startTime: performance.now() });
  }

  /** End a named timer and record the result */
  end(name: string, metadata?: Record<string, unknown>): number | null {
    if (!this.enabled) return null;
    const mark = this.marks.get(name);
    if (!mark) return null;

    const duration = performance.now() - mark.startTime;
    this.marks.delete(name);

    const entry: PerfEntry = {
      name,
      durationMs: Math.round(duration * 100) / 100,
      success: true,
      timestamp: Date.now(),
      metadata,
    };

    this.history = boundArray([...this.history, entry], MAX_HISTORY);

    if (duration > SLOW_THRESHOLD_MS) {
      console.warn(`[PERF] Slow operation: ${name} took ${duration.toFixed(0)}ms`);
    }

    return duration;
  }

  /** Measure an async function's execution time */
  async measure<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name, { ...metadata, success: true });
      return result;
    } catch (err) {
      this.end(name, { ...metadata, success: false });
      throw err;
    }
  }

  /** Measure a sync function */
  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
    this.start(name);
    try {
      const result = fn();
      this.end(name, { ...metadata, success: true });
      return result;
    } catch (err) {
      this.end(name, { ...metadata, success: false });
      throw err;
    }
  }

  /** Snapshot current Web Vitals + memory usage */
  getWebVitals(): Record<string, string | number> {
    const vitals: Record<string, string | number> = {};

    if (typeof window === 'undefined') return vitals;

    // Navigation timing
    if (performance.timing) {
      const t = performance.timing;
      vitals.loadTimeMs = t.loadEventEnd - t.navigationStart;
      vitals.domReadyMs = t.domContentLoadedEventEnd - t.navigationStart;
      vitals.renderMs = t.domComplete - t.domLoading;
    }

    // Memory (Chrome only)
    if ('memory' in performance && (performance as any).memory) {
      const mem = (performance as any).memory;
      vitals.heapUsedMB = +(mem.usedJSHeapSize / 1_048_576).toFixed(2);
      vitals.heapTotalMB = +(mem.totalJSHeapSize / 1_048_576).toFixed(2);
      vitals.heapLimitMB = +(mem.jsHeapSizeLimit / 1_048_576).toFixed(2);
    }

    return vitals;
  }

  /** Get recent perf history */
  getHistory(): PerfEntry[] {
    return [...this.history];
  }

  /** Get entries slower than threshold */
  getSlowOps(thresholdMs = SLOW_THRESHOLD_MS): PerfEntry[] {
    return this.history.filter(e => e.durationMs > thresholdMs);
  }

  setEnabled(v: boolean): void { this.enabled = v; }
  reset(): void { this.marks.clear(); this.history = []; }
}

/** Global singleton */
export const performanceMonitor = new PerformanceMonitor();
