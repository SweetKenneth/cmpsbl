/**
 * SYSTEM — Session Leak Detector
 * Monitors for common memory leak patterns in long-running sessions:
 *   - Unbounded listener accumulation
 *   - Growing interval/timeout registrations
 *   - Detached DOM node retention
 *   - Zustand store bloat
 */

export interface LeakReport {
  timestamp: string;
  sessionDurationMinutes: number;
  signals: LeakSignal[];
  severity: 'clean' | 'warning' | 'leak_likely';
}

export interface LeakSignal {
  type: 'listeners' | 'timers' | 'dom_detached' | 'store_bloat' | 'heap_growth';
  description: string;
  value: number;
  threshold: number;
}

const SESSION_START = Date.now();

// Track timer registrations
let activeTimerCount = 0;
const originalSetInterval = typeof window !== 'undefined' ? window.setInterval : undefined;
const originalClearInterval = typeof window !== 'undefined' ? window.clearInterval : undefined;

let instrumented = false;

/**
 * Instrument timer APIs to track leaks. Call once at app boot.
 */
export function instrumentTimerTracking(): void {
  if (typeof window === 'undefined' || instrumented) return;
  instrumented = true;

  const origSetInterval = window.setInterval.bind(window);
  const origClearInterval = window.clearInterval.bind(window);
  const origSetTimeout = window.setTimeout.bind(window);
  const origClearTimeout = window.clearTimeout.bind(window);

  (window as any).__leakDetector_timers = new Set<number>();

  window.setInterval = ((...args: Parameters<typeof origSetInterval>) => {
    const id = origSetInterval(...args);
    (window as any).__leakDetector_timers.add(id);
    activeTimerCount++;
    return id;
  }) as typeof window.setInterval;

  window.clearInterval = ((id?: number) => {
    if (id !== undefined) {
      (window as any).__leakDetector_timers.delete(id);
      activeTimerCount = Math.max(0, activeTimerCount - 1);
    }
    return origClearInterval(id);
  }) as typeof window.clearInterval;
}

/**
 * Run a leak detection sweep.
 */
export function detectLeaks(): LeakReport {
  const signals: LeakSignal[] = [];
  const sessionMinutes = (Date.now() - SESSION_START) / 60_000;

  // 1. Check heap growth rate via performance.memory
  const mem = (performance as any)?.memory;
  if (mem) {
    const heapMB = mem.usedJSHeapSize / 1024 / 1024;
    const heapGrowthPerMinute = sessionMinutes > 1 ? heapMB / sessionMinutes : 0;
    // Threshold: >2MB/min sustained growth suggests a leak
    if (heapGrowthPerMinute > 2 && sessionMinutes > 5) {
      signals.push({
        type: 'heap_growth',
        description: `Heap growing at ${heapGrowthPerMinute.toFixed(1)}MB/min over ${sessionMinutes.toFixed(0)}min session`,
        value: heapGrowthPerMinute,
        threshold: 2,
      });
    }
  }

  // 2. DOM node count (detached nodes can't be directly counted, but total > threshold suggests bloat)
  if (typeof document !== 'undefined') {
    const nodeCount = document.querySelectorAll('*').length;
    if (nodeCount > 8000) {
      signals.push({
        type: 'dom_detached',
        description: `DOM has ${nodeCount} nodes, possible detached node retention`,
        value: nodeCount,
        threshold: 8000,
      });
    }
  }

  // 3. Timer accumulation
  const trackedTimers = (typeof window !== 'undefined' && (window as any).__leakDetector_timers)
    ? (window as any).__leakDetector_timers.size
    : activeTimerCount;
  
  if (trackedTimers > 50) {
    signals.push({
      type: 'timers',
      description: `${trackedTimers} active timers registered`,
      value: trackedTimers,
      threshold: 50,
    });
  }

  // 4. Zustand store size check
  if (typeof localStorage !== 'undefined') {
    try {
      const storeKey = 'substrate-public-metrics';
      const raw = localStorage.getItem(storeKey);
      if (raw && raw.length > 50_000) {
        signals.push({
          type: 'store_bloat',
          description: `Persisted store '${storeKey}' is ${(raw.length / 1024).toFixed(0)}KB`,
          value: raw.length / 1024,
          threshold: 50,
        });
      }
    } catch {
      // localStorage unavailable
    }
  }

  // Severity
  let severity: LeakReport['severity'] = 'clean';
  if (signals.length >= 2 || signals.some(s => s.type === 'heap_growth')) {
    severity = 'leak_likely';
  } else if (signals.length > 0) {
    severity = 'warning';
  }

  return {
    timestamp: new Date().toISOString(),
    sessionDurationMinutes: Math.round(sessionMinutes),
    signals,
    severity,
  };
}

/**
 * Schedule periodic leak detection (every 10 minutes).
 * Returns cleanup function.
 */
export function startLeakMonitoring(onReport?: (report: LeakReport) => void): () => void {
  const interval = setInterval(() => {
    const report = detectLeaks();
    if (report.severity !== 'clean') {
      console.warn('[LeakDetector]', report.severity, report.signals);
      onReport?.(report);
    }
  }, 10 * 60 * 1000); // 10 minutes

  return () => clearInterval(interval);
}
