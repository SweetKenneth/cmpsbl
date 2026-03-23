/**
 * Adaptive Rate Governor
 * 
 * Per-provider intelligent rate limiting that learns API limits,
 * applies predictive throttling, and manages priority queues.
 * 
 * @module integration/ultimate/adaptiveRateGovernor
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export interface ProviderLimits {
  providerId: string;
  maxPerMinute: number;
  maxPerHour: number;
  retryAfterMs: number | null;
  detectedAt: number;
  source: 'header' | 'inferred' | 'manual';
}

export interface RateWindow {
  providerId: string;
  windowStartMs: number;
  requestCount: number;
  windowDurationMs: number;
}

export interface ThrottleDecision {
  allowed: boolean;
  reason: string;
  waitMs: number;
  currentUsagePct: number;
}

type RequestPriority = 'T1_CRITICAL' | 'T2_OPERATIONAL' | 'T3_NORMAL' | 'T4_LOW' | 'T5_BACKGROUND';

// ── Constants ──────────────────────────────────────────────────

const PREDICTIVE_THRESHOLD = 0.80; // Throttle at 80% usage
const BURST_BUDGET_DEFAULT = 10;
const BURST_COOLDOWN_MS = 30_000;

// ── State ──────────────────────────────────────────────────────

const providerLimits = new Map<string, ProviderLimits>();
const slidingWindows = new Map<string, RateWindow>();
const burstBudgets = new Map<string, { remaining: number; cooldownUntil: number }>();

// ── Core ───────────────────────────────────────────────────────

/** Learn rate limits from response headers */
export function learnFromHeaders(providerId: string, headers: Record<string, string>): ProviderLimits | null {
  const limitHeader = headers['x-ratelimit-limit'] || headers['X-RateLimit-Limit'];
  const retryHeader = headers['retry-after'] || headers['Retry-After'];

  if (!limitHeader && !retryHeader) return null;

  const limits: ProviderLimits = {
    providerId,
    maxPerMinute: limitHeader ? parseInt(limitHeader, 10) : 60,
    maxPerHour: limitHeader ? parseInt(limitHeader, 10) * 60 : 3600,
    retryAfterMs: retryHeader ? parseInt(retryHeader, 10) * 1000 : null,
    detectedAt: Date.now(),
    source: 'header',
  };

  providerLimits.set(providerId, limits);
  return limits;
}

/** Set manual rate limits for a provider */
export function setLimits(providerId: string, maxPerMinute: number, maxPerHour: number): void {
  providerLimits.set(providerId, {
    providerId, maxPerMinute, maxPerHour,
    retryAfterMs: null, detectedAt: Date.now(), source: 'manual',
  });
}

/** Check if a request should be allowed */
export function shouldAllow(providerId: string, priority: RequestPriority = 'T3_NORMAL'): ThrottleDecision {
  const limits = providerLimits.get(providerId);
  const now = Date.now();

  // No known limits — allow
  if (!limits) return { allowed: true, reason: 'no_limits_known', waitMs: 0, currentUsagePct: 0 };

  // Check retry-after
  if (limits.retryAfterMs && (now - limits.detectedAt) < limits.retryAfterMs) {
    const waitMs = limits.retryAfterMs - (now - limits.detectedAt);
    return { allowed: false, reason: 'retry_after', waitMs, currentUsagePct: 100 };
  }

  // Sliding window check
  const window = getOrCreateWindow(providerId, now);
  const usagePct = window.requestCount / limits.maxPerMinute;

  // T1 bypasses throttle
  if (priority === 'T1_CRITICAL') {
    return { allowed: true, reason: 'priority_bypass', waitMs: 0, currentUsagePct: Math.round(usagePct * 100) };
  }

  // Predictive throttling
  if (usagePct >= PREDICTIVE_THRESHOLD) {
    // Check burst budget
    const burst = burstBudgets.get(providerId);
    if (burst && burst.remaining > 0 && now > burst.cooldownUntil) {
      burst.remaining--;
      return { allowed: true, reason: 'burst_budget', waitMs: 0, currentUsagePct: Math.round(usagePct * 100) };
    }

    // T5 deferred always
    if (priority === 'T4_LOW' || priority === 'T5_BACKGROUND') {
      return { allowed: false, reason: 'low_priority_throttled', waitMs: 60_000, currentUsagePct: Math.round(usagePct * 100) };
    }

    if (usagePct >= 1.0) {
      return { allowed: false, reason: 'limit_reached', waitMs: window.windowDurationMs - (now - window.windowStartMs), currentUsagePct: 100 };
    }
  }

  return { allowed: true, reason: 'within_limits', waitMs: 0, currentUsagePct: Math.round(usagePct * 100) };
}

/** Record a request being made */
export function recordRequest(providerId: string): void {
  const window = getOrCreateWindow(providerId, Date.now());
  window.requestCount++;
}

function getOrCreateWindow(providerId: string, now: number): RateWindow {
  let window = slidingWindows.get(providerId);
  if (!window || (now - window.windowStartMs) >= window.windowDurationMs) {
    window = { providerId, windowStartMs: now, requestCount: 0, windowDurationMs: 60_000 };
    slidingWindows.set(providerId, window);
    // Reset burst budget on new window
    burstBudgets.set(providerId, { remaining: BURST_BUDGET_DEFAULT, cooldownUntil: now + BURST_COOLDOWN_MS });
  }
  return window;
}

export function getRateGovernorHealth() {
  return {
    trackedProviders: providerLimits.size,
    activeWindows: slidingWindows.size,
    providers: Array.from(providerLimits.values()).map(p => ({
      id: p.providerId, maxPerMinute: p.maxPerMinute, source: p.source,
    })),
  };
}

export function resetRateGovernor(): void {
  providerLimits.clear();
  slidingWindows.clear();
  burstBudgets.clear();
}
