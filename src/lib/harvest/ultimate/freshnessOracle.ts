/**
 * HARVEST Ultimate — Freshness Oracle
 * Predicts optimal re-fetch timing per source using decay curves.
 * High-churn sources fetched more often, stable sources less — saving budget.
 */

export interface FreshnessProfile {
  sourceId: string;
  churnRate: number;           // 0–1 EMA: how often content changes
  avgTimeBetweenChanges: number; // ms EMA
  optimalPollInterval: number;   // ms — calculated
  lastChangedAt: number;
  lastCheckedAt: number;
  totalChecks: number;
  totalChanges: number;
  decayFunction: 'linear' | 'exponential' | 'logarithmic';
  confidence: number;           // 0–1
}

export interface FreshnessRecommendation {
  sourceId: string;
  shouldFetchNow: boolean;
  urgency: number;             // 0–1
  nextFetchAt: number;         // timestamp
  reason: string;
}

export interface FreshnessStats {
  totalProfiles: number;
  avgChurnRate: number;
  avgPollInterval: number;
  highChurnSources: number;
  lowChurnSources: number;
}

const EMA_ALPHA = 0.2;
const MIN_POLL_INTERVAL = 5_000;      // 5s min
const MAX_POLL_INTERVAL = 86_400_000; // 24h max
const MAX_PROFILES = 1000;

const profiles = new Map<string, FreshnessProfile>();

export function registerFreshnessProfile(sourceId: string): FreshnessProfile {
  const profile: FreshnessProfile = {
    sourceId, churnRate: 0.5, avgTimeBetweenChanges: 3_600_000,
    optimalPollInterval: 60_000, lastChangedAt: 0, lastCheckedAt: 0,
    totalChecks: 0, totalChanges: 0,
    decayFunction: 'exponential', confidence: 0.1,
  };
  if (profiles.size >= MAX_PROFILES) {
    // Evict least confident
    let min: FreshnessProfile | null = null;
    for (const p of profiles.values()) {
      if (!min || p.confidence < min.confidence) min = p;
    }
    if (min) profiles.delete(min.sourceId);
  }
  profiles.set(sourceId, profile);
  return profile;
}

export function recordCheck(sourceId: string, contentChanged: boolean): void {
  let p = profiles.get(sourceId);
  if (!p) p = registerFreshnessProfile(sourceId);

  const now = Date.now();
  p.totalChecks++;

  if (contentChanged) {
    p.totalChanges++;
    if (p.lastChangedAt > 0) {
      const gap = now - p.lastChangedAt;
      p.avgTimeBetweenChanges = p.avgTimeBetweenChanges * (1 - EMA_ALPHA) + gap * EMA_ALPHA;
    }
    p.lastChangedAt = now;
  }

  p.churnRate = p.churnRate * (1 - EMA_ALPHA) + (contentChanged ? 1 : 0) * EMA_ALPHA;
  p.lastCheckedAt = now;

  // Confidence grows with observations
  p.confidence = Math.min(1, p.totalChecks / 50);

  // Select decay function based on churn pattern
  if (p.churnRate > 0.7) p.decayFunction = 'linear';
  else if (p.churnRate > 0.3) p.decayFunction = 'exponential';
  else p.decayFunction = 'logarithmic';

  // Calculate optimal poll interval
  recalculateInterval(p);
}

function recalculateInterval(p: FreshnessProfile): void {
  let interval: number;
  switch (p.decayFunction) {
    case 'linear':
      interval = p.avgTimeBetweenChanges * 0.5;
      break;
    case 'exponential':
      interval = p.avgTimeBetweenChanges * 0.7;
      break;
    case 'logarithmic':
      interval = p.avgTimeBetweenChanges * 1.2;
      break;
  }
  p.optimalPollInterval = Math.max(MIN_POLL_INTERVAL, Math.min(MAX_POLL_INTERVAL, interval));
}

export function getRecommendation(sourceId: string): FreshnessRecommendation {
  const p = profiles.get(sourceId);
  if (!p) {
    return { sourceId, shouldFetchNow: true, urgency: 0.5, nextFetchAt: Date.now(), reason: 'Unknown source — initial fetch' };
  }

  const now = Date.now();
  const elapsed = now - p.lastCheckedAt;
  const ratio = elapsed / p.optimalPollInterval;
  const urgency = Math.min(1, ratio);
  const shouldFetch = ratio >= 1;

  return {
    sourceId,
    shouldFetchNow: shouldFetch,
    urgency,
    nextFetchAt: p.lastCheckedAt + p.optimalPollInterval,
    reason: shouldFetch
      ? `${(elapsed / 1000).toFixed(0)}s elapsed, interval is ${(p.optimalPollInterval / 1000).toFixed(0)}s`
      : `Next fetch in ${((p.optimalPollInterval - elapsed) / 1000).toFixed(0)}s`,
  };
}

export function getDueForFetch(): FreshnessRecommendation[] {
  return [...profiles.keys()]
    .map(id => getRecommendation(id))
    .filter(r => r.shouldFetchNow)
    .sort((a, b) => b.urgency - a.urgency);
}

export function getFreshnessStats(): FreshnessStats {
  const all = [...profiles.values()];
  return {
    totalProfiles: all.length,
    avgChurnRate: all.length > 0 ? all.reduce((s, p) => s + p.churnRate, 0) / all.length : 0,
    avgPollInterval: all.length > 0 ? all.reduce((s, p) => s + p.optimalPollInterval, 0) / all.length : 0,
    highChurnSources: all.filter(p => p.churnRate > 0.6).length,
    lowChurnSources: all.filter(p => p.churnRate < 0.2).length,
  };
}

export function resetFreshnessState(): void { profiles.clear(); }
