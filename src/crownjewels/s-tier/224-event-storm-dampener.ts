/**
 * S-Tier 224 — Event Storm Dampener
 * CJPI: 90 | Module: RIPPLE | ID: S-RPL03
 *
 * Detects and dampens event storms via sliding windows, adaptive
 * thresholds, per-type rate limiting, and backpressure signals.
 * Zero dependencies. Pure TypeScript.
 */

export interface DampenerConfig {
  defaultThreshold: number;
  defaultWindowMs: number;
  backpressureMultiplier: number;
}

export interface StormEvent {
  eventType: string;
  dampened: boolean;
  pressure: number;
  timestamp: number;
}

export interface DampenerStats {
  totalEvents: number;
  dampenedEvents: number;
  activeStorms: string[];
  dampenRate: number;
}

export function createEventStormDampener(config: Partial<DampenerConfig> = {}) {
  const { defaultThreshold = 100, defaultWindowMs = 5000, backpressureMultiplier = 1.5 } = config;
  const windows = new Map<string, { events: number[]; threshold: number; windowMs: number }>();
  let totalEvents = 0;
  let dampenedEvents = 0;
  const stormLog: StormEvent[] = [];

  function getWindow(eventType: string) {
    if (!windows.has(eventType)) {
      windows.set(eventType, { events: [], threshold: defaultThreshold, windowMs: defaultWindowMs });
    }
    return windows.get(eventType)!;
  }

  function shouldDampen(eventType: string): boolean {
    const now = Date.now();
    const w = getWindow(eventType);
    w.events = w.events.filter(t => now - t < w.windowMs);
    w.events.push(now);
    totalEvents++;

    const pressure = w.events.length / w.threshold;
    const dampened = w.events.length > w.threshold;

    if (dampened) {
      dampenedEvents++;
      w.threshold = Math.ceil(w.threshold * backpressureMultiplier);
    } else if (w.threshold > defaultThreshold && w.events.length < defaultThreshold * 0.5) {
      w.threshold = Math.max(defaultThreshold, w.threshold - 1);
    }

    stormLog.push({ eventType, dampened, pressure, timestamp: now });
    if (stormLog.length > 2000) stormLog.splice(0, 500);
    return dampened;
  }

  function setThreshold(eventType: string, threshold: number, windowMs?: number): void {
    const w = getWindow(eventType);
    w.threshold = threshold;
    if (windowMs !== undefined) w.windowMs = windowMs;
  }

  function getPressure(eventType: string): number {
    const w = windows.get(eventType);
    if (!w) return 0;
    const now = Date.now();
    const active = w.events.filter(t => now - t < w.windowMs).length;
    return active / w.threshold;
  }

  function getStats(): DampenerStats {
    const activeStorms: string[] = [];
    for (const [type] of windows) {
      if (getPressure(type) > 1) activeStorms.push(type);
    }
    return {
      totalEvents,
      dampenedEvents,
      activeStorms,
      dampenRate: totalEvents > 0 ? dampenedEvents / totalEvents : 0,
    };
  }

  function reset(): void {
    windows.clear();
    totalEvents = 0;
    dampenedEvents = 0;
    stormLog.length = 0;
  }

  return { shouldDampen, setThreshold, getPressure, getStats, reset };
}
