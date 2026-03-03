/**
 * DEFENSE Guardrail — Traffic Spike Detection (Phase 3)
 * 
 * Detects sudden request-rate surges and freezes all adaptive
 * adjustments to prevent anomaly-driven instability during
 * legitimate traffic spikes (flash sales, viral events, etc.).
 * 
 * Rolling window average → multiplier check → freeze + cooldown.
 */

import { guardrailLog } from './logger';
import { setSpikeActive as _setSpikeActive } from './proposal-store';

// ── Configuration ──────────────────────────────────────────────

interface SpikeConfig {
  /** Rolling window size for computing average (ms) */
  windowMs: number;
  /** Number of buckets to divide the window into */
  bucketCount: number;
  /** Spike multiplier — current rate must exceed avg × multiplier */
  spikeMultiplier: number;
  /** Cooldown after spike detection before allowing adjustments again (ms) */
  cooldownMs: number;
  /** Minimum absolute request count to avoid false spikes on low traffic */
  minBaselineRequests: number;
}

const DEFAULT_CONFIG: SpikeConfig = {
  windowMs: 5 * 60 * 1000,       // 5-minute rolling window
  bucketCount: 10,                // 30s buckets
  spikeMultiplier: 3.0,           // 3× average = spike
  cooldownMs: 10 * 60 * 1000,    // 10-minute cooldown
  minBaselineRequests: 10,        // need ≥10 requests to form a baseline
};

// ── State ──────────────────────────────────────────────────────

let config: SpikeConfig = { ...DEFAULT_CONFIG };

interface Bucket {
  startMs: number;
  count: number;
}

const buckets: Bucket[] = [];
let spikeDetectedAt: number | null = null;
let conservativeMode = false;

// ── Helpers ────────────────────────────────────────────────────

function getBucketDurationMs(): number {
  return Math.max(1000, Math.floor(config.windowMs / config.bucketCount));
}

function pruneOldBuckets(now: number): void {
  const cutoff = now - config.windowMs;
  while (buckets.length > 0 && buckets[0].startMs < cutoff) {
    buckets.shift();
  }
  // Safety bound — never hold more than 2× expected buckets
  const maxBuckets = config.bucketCount * 2;
  if (buckets.length > maxBuckets) {
    buckets.splice(0, buckets.length - maxBuckets);
  }
}

function getCurrentBucket(now: number): Bucket {
  const duration = getBucketDurationMs();
  const bucketStart = Math.floor(now / duration) * duration;

  if (buckets.length > 0) {
    const last = buckets[buckets.length - 1];
    if (last.startMs === bucketStart) return last;
  }

  const newBucket: Bucket = { startMs: bucketStart, count: 0 };
  buckets.push(newBucket);
  return newBucket;
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Record a request. Call this on every incoming request.
 * Returns whether a spike is currently active.
 */
export function recordTrafficEvent(): boolean {
  const now = Date.now();
  pruneOldBuckets(now);

  const bucket = getCurrentBucket(now);
  bucket.count++;

  return evaluateSpike(now);
}

/**
 * Evaluate spike condition based on current rolling window.
 */
function evaluateSpike(now: number): boolean {
  // Check if cooldown has expired
  if (spikeDetectedAt !== null) {
    if (now - spikeDetectedAt >= config.cooldownMs) {
      // Cooldown expired — clear spike
      spikeDetectedAt = null;
      conservativeMode = false;
      _setSpikeActive(false);

      guardrailLog('spike_cleared', {
        reason: 'Spike cooldown elapsed — resuming normal operations',
        metadata: { cooldownMs: config.cooldownMs },
      });
    } else {
      // Still in cooldown
      return true;
    }
  }

  // Need at least 2 buckets to compare
  if (buckets.length < 2) return false;

  // Calculate average rate from older buckets (exclude latest)
  const olderBuckets = buckets.slice(0, -1);
  const totalOlder = olderBuckets.reduce((sum, b) => sum + b.count, 0);

  // Guard: minimum baseline
  if (totalOlder < config.minBaselineRequests) return false;

  const avgPerBucket = totalOlder / olderBuckets.length;

  // Guard: avoid division by zero (already checked above, but defensive)
  if (avgPerBucket <= 0) return false;

  const currentBucket = buckets[buckets.length - 1];
  const ratio = currentBucket.count / avgPerBucket;

  if (ratio >= config.spikeMultiplier) {
    // SPIKE DETECTED
    spikeDetectedAt = now;
    conservativeMode = true;
    _setSpikeActive(true);

    guardrailLog('spike_detected', {
      reason: `Traffic spike: current bucket ${currentBucket.count} is ${ratio.toFixed(1)}× the rolling average (${avgPerBucket.toFixed(1)}/bucket)`,
      previous_value: avgPerBucket,
      proposed_value: currentBucket.count,
      metadata: {
        ratio,
        spikeMultiplier: config.spikeMultiplier,
        windowBuckets: buckets.length,
        cooldownMs: config.cooldownMs,
      },
    });

    return true;
  }

  return false;
}

/**
 * Check if a spike is currently active (includes cooldown window).
 */
export function isSpikeActive(): boolean {
  // Re-evaluate cooldown expiry
  if (spikeDetectedAt !== null) {
    const now = Date.now();
    if (now - spikeDetectedAt >= config.cooldownMs) {
      spikeDetectedAt = null;
      conservativeMode = false;
      _setSpikeActive(false);
    }
  }
  return spikeDetectedAt !== null;
}

/**
 * Whether system is in conservative mode (spike-triggered).
 */
export function isConservativeMode(): boolean {
  // Ensure state is fresh
  isSpikeActive();
  return conservativeMode;
}

/**
 * Get current spike detector state (read-only snapshot).
 */
export function getSpikeState() {
  const now = Date.now();
  pruneOldBuckets(now);

  const totalRequests = buckets.reduce((sum, b) => sum + b.count, 0);
  const avgPerBucket = buckets.length > 1
    ? buckets.slice(0, -1).reduce((sum, b) => sum + b.count, 0) / (buckets.length - 1)
    : 0;
  const currentRate = buckets.length > 0 ? buckets[buckets.length - 1].count : 0;

  return {
    spikeActive: isSpikeActive(),
    conservativeMode,
    spikeDetectedAt,
    cooldownRemainingMs: spikeDetectedAt
      ? Math.max(0, config.cooldownMs - (now - spikeDetectedAt))
      : 0,
    rollingWindowRequests: totalRequests,
    avgPerBucket: Number(avgPerBucket.toFixed(2)),
    currentBucketRate: currentRate,
    bucketCount: buckets.length,
    config: { ...config },
  };
}

/**
 * Update spike detector configuration.
 */
export function configureSpikeDetector(partial: Partial<SpikeConfig>): void {
  config = {
    ...config,
    ...partial,
    // Enforce safety bounds
    windowMs: Math.max(10_000, Math.min(30 * 60 * 1000, partial.windowMs ?? config.windowMs)),
    bucketCount: Math.max(2, Math.min(60, partial.bucketCount ?? config.bucketCount)),
    spikeMultiplier: Math.max(1.5, Math.min(20, partial.spikeMultiplier ?? config.spikeMultiplier)),
    cooldownMs: Math.max(30_000, Math.min(60 * 60 * 1000, partial.cooldownMs ?? config.cooldownMs)),
    minBaselineRequests: Math.max(1, Math.min(1000, partial.minBaselineRequests ?? config.minBaselineRequests)),
  };

  guardrailLog('spike_config_updated', {
    reason: 'Spike detector configuration changed',
    metadata: { ...config },
  });
}

/**
 * Clear spike state (testing only).
 */
export function clearSpikeState(): void {
  buckets.length = 0;
  spikeDetectedAt = null;
  conservativeMode = false;
  _setSpikeActive(false);
  config = { ...DEFAULT_CONFIG };
}
