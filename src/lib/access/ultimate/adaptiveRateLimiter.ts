/**
 * ACCESS Ultimate — System 2: Adaptive Rate Limiter
 * 
 * Sliding window counters, burst detection, per-endpoint rate shaping,
 * and EMA-smoothed threshold auto-tuning per developer.
 * 
 * @module access/ultimate/adaptiveRateLimiter
 */

// ── Types ────────────────────────────────────────────────────────

export interface RateLimitConfig {
  perMinute: number;
  perDay: number;
  burstAllowance: number;     // Extra requests allowed in a burst
  burstWindowMs: number;      // Window for burst detection
}

export interface SlidingWindow {
  keyId: string;
  endpoint: string;
  minuteSlots: number[];      // 60 one-second slots
  daySlots: number[];         // 24 one-hour slots
  currentMinuteIdx: number;
  currentDayIdx: number;
  lastMinuteTick: number;
  lastDayTick: number;
  totalRequests: number;
  emaRate: number;            // EMA-smoothed request rate
  burstCount: number;
  burstWindowStart: number;
}

export type RateLimitDecision = 'allow' | 'throttle' | 'deny';

export interface AdaptiveRateLimitResult {
  decision: RateLimitDecision;
  remaining: number;
  resetMs: number;
  retryAfterMs?: number;
  burstDetected: boolean;
}

export interface RateLimiterStats {
  totalChecks: number;
  allowedCount: number;
  throttledCount: number;
  deniedCount: number;
  burstsDetected: number;
  activeWindows: number;
  avgEmaRate: number;
}

// ── Constants ────────────────────────────────────────────────────

const DEFAULT_CONFIG: RateLimitConfig = {
  perMinute: 60,
  perDay: 10_000,
  burstAllowance: 20,
  burstWindowMs: 5_000,
};

const EMA_ALPHA = 0.1;
const MAX_WINDOWS = 2000;

// ── State ────────────────────────────────────────────────────────

const windows: Map<string, SlidingWindow> = new Map();
const configs: Map<string, RateLimitConfig> = new Map();
let totalChecks = 0;
let allowedCount = 0;
let throttledCount = 0;
let deniedCount = 0;
let burstsDetected = 0;

// ── Core API ────────────────────────────────────────────────────

/** Configure rate limits for a key */
export function configureRateLimit(keyId: string, config: Partial<RateLimitConfig>): void {
  const existing = configs.get(keyId) ?? { ...DEFAULT_CONFIG };
  configs.set(keyId, { ...existing, ...config });
}

/** Check rate limit for a request */
export function checkRateLimit(keyId: string, endpoint: string = '*'): AdaptiveRateLimitResult {
  totalChecks++;
  const config = configs.get(keyId) ?? DEFAULT_CONFIG;
  const windowKey = `${keyId}:${endpoint}`;
  const now = Date.now();

  let window = windows.get(windowKey);
  if (!window) {
    window = createWindow(keyId, endpoint, now);
    windows.set(windowKey, window);
    if (windows.size > MAX_WINDOWS) evictOldest();
  }

  // Advance minute slots
  advanceMinuteSlots(window, now);
  advanceDaySlots(window, now);

  // Count current minute usage
  const minuteTotal = window.minuteSlots.reduce((s, v) => s + v, 0);
  const dayTotal = window.daySlots.reduce((s, v) => s + v, 0);

  // Burst detection
  let burstDetected = false;
  if (now - window.burstWindowStart < config.burstWindowMs) {
    window.burstCount++;
    if (window.burstCount > config.burstAllowance) {
      burstDetected = true;
      burstsDetected++;
    }
  } else {
    window.burstWindowStart = now;
    window.burstCount = 1;
  }

  // Decision logic
  let decision: RateLimitDecision = 'allow';
  let retryAfterMs: number | undefined;

  if (dayTotal >= config.perDay) {
    decision = 'deny';
    retryAfterMs = 86_400_000 - (now % 86_400_000); // ms until midnight
    deniedCount++;
  } else if (minuteTotal >= config.perMinute) {
    if (burstDetected) {
      decision = 'deny';
      retryAfterMs = config.burstWindowMs;
      deniedCount++;
    } else {
      decision = 'throttle';
      retryAfterMs = 60_000 - (now % 60_000);
      throttledCount++;
    }
  } else {
    allowedCount++;
  }

  // Record the request if allowed
  if (decision === 'allow') {
    const secIdx = Math.floor((now / 1000) % 60);
    window.minuteSlots[secIdx]++;
    const hourIdx = Math.floor((now / 3_600_000) % 24);
    window.daySlots[hourIdx]++;
    window.totalRequests++;
  }

  // Update EMA
  window.emaRate = EMA_ALPHA * minuteTotal + (1 - EMA_ALPHA) * window.emaRate;

  return {
    decision,
    remaining: Math.max(0, config.perMinute - minuteTotal),
    resetMs: 60_000 - (now % 60_000),
    retryAfterMs,
    burstDetected,
  };
}

/** Auto-tune rate limits based on EMA usage patterns */
export function autoTuneLimits(keyId: string): { adjusted: boolean; newPerMinute?: number } {
  const windowsForKey = [...windows.values()].filter(w => w.keyId === keyId);
  if (windowsForKey.length === 0) return { adjusted: false };

  const avgEma = windowsForKey.reduce((s, w) => s + w.emaRate, 0) / windowsForKey.length;
  const config = configs.get(keyId) ?? { ...DEFAULT_CONFIG };

  // If average usage is consistently < 30% of limit, suggest lower limit
  // If usage is > 80% of limit and no bursts, suggest higher limit
  if (avgEma < config.perMinute * 0.3 && config.perMinute > 10) {
    const newLimit = Math.max(10, Math.round(avgEma * 2));
    config.perMinute = newLimit;
    configs.set(keyId, config);
    return { adjusted: true, newPerMinute: newLimit };
  } else if (avgEma > config.perMinute * 0.8) {
    const newLimit = Math.round(avgEma * 1.5);
    config.perMinute = newLimit;
    configs.set(keyId, config);
    return { adjusted: true, newPerMinute: newLimit };
  }

  return { adjusted: false };
}

// ── Helpers ──────────────────────────────────────────────────────

function createWindow(keyId: string, endpoint: string, now: number): SlidingWindow {
  return {
    keyId, endpoint,
    minuteSlots: new Array(60).fill(0),
    daySlots: new Array(24).fill(0),
    currentMinuteIdx: Math.floor((now / 1000) % 60),
    currentDayIdx: Math.floor((now / 3_600_000) % 24),
    lastMinuteTick: now,
    lastDayTick: now,
    totalRequests: 0,
    emaRate: 0,
    burstCount: 0,
    burstWindowStart: now,
  };
}

function advanceMinuteSlots(w: SlidingWindow, now: number): void {
  const elapsed = Math.floor((now - w.lastMinuteTick) / 1000);
  if (elapsed <= 0) return;
  for (let i = 0; i < Math.min(elapsed, 60); i++) {
    w.currentMinuteIdx = (w.currentMinuteIdx + 1) % 60;
    w.minuteSlots[w.currentMinuteIdx] = 0;
  }
  w.lastMinuteTick = now;
}

function advanceDaySlots(w: SlidingWindow, now: number): void {
  const elapsed = Math.floor((now - w.lastDayTick) / 3_600_000);
  if (elapsed <= 0) return;
  for (let i = 0; i < Math.min(elapsed, 24); i++) {
    w.currentDayIdx = (w.currentDayIdx + 1) % 24;
    w.daySlots[w.currentDayIdx] = 0;
  }
  w.lastDayTick = now;
}

function evictOldest(): void {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  for (const [key, w] of windows) {
    if (w.lastMinuteTick < oldestTime) {
      oldestTime = w.lastMinuteTick;
      oldestKey = key;
    }
  }
  if (oldestKey) windows.delete(oldestKey);
}

// ── Stats ────────────────────────────────────────────────────────

export function getRateLimiterStats(): RateLimiterStats {
  const allWindows = [...windows.values()];
  return {
    totalChecks,
    allowedCount,
    throttledCount,
    deniedCount,
    burstsDetected,
    activeWindows: windows.size,
    avgEmaRate: allWindows.length > 0
      ? Math.round(allWindows.reduce((s, w) => s + w.emaRate, 0) / allWindows.length * 100) / 100
      : 0,
  };
}

export function resetRateLimiter(): void {
  windows.clear();
  configs.clear();
  totalChecks = 0;
  allowedCount = 0;
  throttledCount = 0;
  deniedCount = 0;
  burstsDetected = 0;
}
