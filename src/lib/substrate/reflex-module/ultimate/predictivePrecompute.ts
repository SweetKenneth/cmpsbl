/**
 * REFLEX Ultimate — System 5: Predictive Pre-computation Engine
 * 
 * Anticipates likely decisions based on pattern history and pre-computes
 * responses for instant delivery. Frequency-based pattern learning
 * with decay for stale patterns.
 * 
 * @module reflex/ultimate/predictivePrecompute
 */

// ── Types ────────────────────────────────────────────────────────

export interface TriggerPattern {
  id: string;
  pattern: string;             // Trigger pattern (prefix match)
  frequency: number;           // Hit count
  lastSeenAt: number;
  avgLatencyMs: number;
  precomputedAction: string;
  precomputedConfidence: number;
  precomputedAt: number;
  stale: boolean;
}

export interface PrecomputeResult {
  hit: boolean;
  pattern: TriggerPattern | null;
  action: string;
  confidence: number;
  savedMs: number;             // Estimated latency saved
}

// ── State ────────────────────────────────────────────────────────

const patterns: Map<string, TriggerPattern> = new Map();
const MAX_PATTERNS = 500;
const STALENESS_MS = 300_000;  // 5 minutes
const MIN_FREQUENCY = 3;       // Must be seen 3 times before pre-computing
let totalHits = 0;
let totalMisses = 0;

// ── Core API ────────────────────────────────────────────────────

/** Learn from a completed decision */
export function learnPattern(trigger: string, action: string, latencyMs: number, confidence: number): void {
  // Normalize trigger to a pattern (first 3 tokens)
  const patternKey = trigger.split(/[\s:._-]/).slice(0, 3).join(':').toLowerCase();
  
  const existing = patterns.get(patternKey);
  if (existing) {
    existing.frequency++;
    existing.lastSeenAt = Date.now();
    existing.avgLatencyMs = existing.avgLatencyMs * 0.8 + latencyMs * 0.2;

    // Update precomputation if frequent enough
    if (existing.frequency >= MIN_FREQUENCY) {
      existing.precomputedAction = action;
      existing.precomputedConfidence = confidence * 0.95; // Slight confidence discount
      existing.precomputedAt = Date.now();
      existing.stale = false;
    }
  } else {
    const pattern: TriggerPattern = {
      id: `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pattern: patternKey,
      frequency: 1,
      lastSeenAt: Date.now(),
      avgLatencyMs: latencyMs,
      precomputedAction: action,
      precomputedConfidence: confidence * 0.9,
      precomputedAt: Date.now(),
      stale: true, // Not ready until MIN_FREQUENCY
    };
    patterns.set(patternKey, pattern);

    if (patterns.size > MAX_PATTERNS) {
      evictLeastUsed();
    }
  }
}

/** Try to get a pre-computed result for a trigger */
export function tryPrecompute(trigger: string): PrecomputeResult {
  const patternKey = trigger.split(/[\s:._-]/).slice(0, 3).join(':').toLowerCase();
  const pattern = patterns.get(patternKey);

  if (!pattern || pattern.stale || pattern.frequency < MIN_FREQUENCY) {
    totalMisses++;
    return { hit: false, pattern: null, action: 'none', confidence: 0, savedMs: 0 };
  }

  // Check staleness
  if (Date.now() - pattern.precomputedAt > STALENESS_MS) {
    pattern.stale = true;
    totalMisses++;
    return { hit: false, pattern, action: 'none', confidence: 0, savedMs: 0 };
  }

  totalHits++;
  return {
    hit: true,
    pattern,
    action: pattern.precomputedAction,
    confidence: pattern.precomputedConfidence,
    savedMs: Math.round(pattern.avgLatencyMs * 100) / 100,
  };
}

/** Decay stale patterns */
export function decayPatterns(): number {
  let decayed = 0;
  const now = Date.now();

  for (const [key, pattern] of patterns) {
    if (now - pattern.lastSeenAt > STALENESS_MS * 2) {
      pattern.frequency = Math.max(0, pattern.frequency - 1);
      pattern.stale = true;
      decayed++;
    }
    if (pattern.frequency === 0 && now - pattern.lastSeenAt > STALENESS_MS * 5) {
      patterns.delete(key);
    }
  }

  return decayed;
}

function evictLeastUsed(): void {
  let minFreq = Infinity;
  let minKey = '';
  for (const [key, pattern] of patterns) {
    if (pattern.frequency < minFreq) {
      minFreq = pattern.frequency;
      minKey = key;
    }
  }
  if (minKey) patterns.delete(minKey);
}

// ── Query ────────────────────────────────────────────────────────

export function getTopPatterns(count: number = 20): TriggerPattern[] {
  return Array.from(patterns.values())
    .filter(p => !p.stale)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, count);
}

export function getPrecomputeHealth() {
  const total = totalHits + totalMisses;
  const active = Array.from(patterns.values()).filter(p => !p.stale && p.frequency >= MIN_FREQUENCY);

  return {
    totalPatterns: patterns.size,
    activePatterns: active.length,
    hitRate: total > 0 ? Math.round((totalHits / total) * 100) : 0,
    totalHits,
    totalMisses,
    avgSavedMs: active.length > 0
      ? Math.round(active.reduce((s, p) => s + p.avgLatencyMs, 0) / active.length * 100) / 100
      : 0,
  };
}

export function resetPrecompute(): void {
  patterns.clear();
  totalHits = 0;
  totalMisses = 0;
}
