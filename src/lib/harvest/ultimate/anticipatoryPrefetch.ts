/**
 * HARVEST Ultimate — Anticipatory Prefetch
 * Watches BRAIN/ORACLE/CORTEX intent patterns and pre-fetches data
 * it predicts will be needed. Turns HARVEST from reactive to proactive.
 */

export interface IntentPattern {
  id: string;
  intentType: string;
  sourceModule: string;
  associatedSources: string[];   // source genome IDs that satisfy this intent
  frequency: number;             // how often this intent fires (EMA)
  lastSeenAt: number;
  predictedNextAt: number;       // estimated next occurrence
  avgIntervalMs: number;
  confidence: number;
}

export interface PrefetchJob {
  id: string;
  patternId: string;
  sourceId: string;
  status: 'scheduled' | 'fetching' | 'cached' | 'expired' | 'failed';
  scheduledAt: number;
  fetchedAt: number;
  expiresAt: number;
  hitCount: number;              // how many times cache was used
}

export interface PrefetchStats {
  totalPatterns: number;
  totalPrefetches: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  activePrefetches: number;
  predictiveAccuracy: number;
}

const EMA_ALPHA = 0.2;
const CACHE_TTL = 300_000; // 5 minutes
const MAX_PATTERNS = 200;
const MAX_PREFETCHES = 500;
const PREFETCH_LEAD_TIME = 10_000; // prefetch 10s before predicted need

const patterns = new Map<string, IntentPattern>();
const prefetches: PrefetchJob[] = [];
let totalHits = 0;
let totalMisses = 0;

export function observeIntent(intentType: string, sourceModule: string, associatedSources: string[]): void {
  const key = `${intentType}:${sourceModule}`;
  const existing = patterns.get(key);

  if (existing) {
    const now = Date.now();
    const interval = now - existing.lastSeenAt;
    existing.avgIntervalMs = existing.avgIntervalMs * (1 - EMA_ALPHA) + interval * EMA_ALPHA;
    existing.frequency = existing.frequency * (1 - EMA_ALPHA) + 1 * EMA_ALPHA;
    existing.lastSeenAt = now;
    existing.predictedNextAt = now + existing.avgIntervalMs;
    existing.confidence = Math.min(1, existing.confidence + 0.05);
    // Merge associated sources
    for (const s of associatedSources) {
      if (!existing.associatedSources.includes(s)) existing.associatedSources.push(s);
    }
  } else {
    if (patterns.size >= MAX_PATTERNS) {
      // Evict least confident
      let min: IntentPattern | null = null;
      for (const p of patterns.values()) {
        if (!min || p.confidence < min.confidence) min = p;
      }
      if (min) patterns.delete(`${min.intentType}:${min.sourceModule}`);
    }
    patterns.set(key, {
      id: key,
      intentType, sourceModule, associatedSources: [...associatedSources],
      frequency: 0.5, lastSeenAt: Date.now(),
      predictedNextAt: Date.now() + 60_000, avgIntervalMs: 60_000,
      confidence: 0.1,
    });
  }
}

export function schedulePrefetches(): PrefetchJob[] {
  const now = Date.now();
  const scheduled: PrefetchJob[] = [];

  for (const pattern of patterns.values()) {
    if (pattern.confidence < 0.3) continue;
    const timeUntilNeed = pattern.predictedNextAt - now;

    if (timeUntilNeed > 0 && timeUntilNeed <= PREFETCH_LEAD_TIME + pattern.avgIntervalMs * 0.2) {
      for (const sourceId of pattern.associatedSources) {
        // Don't duplicate
        const existing = prefetches.find(p =>
          p.patternId === pattern.id && p.sourceId === sourceId && p.status === 'cached' && p.expiresAt > now
        );
        if (existing) continue;

        const job: PrefetchJob = {
          id: `pf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          patternId: pattern.id, sourceId,
          status: 'scheduled',
          scheduledAt: now, fetchedAt: 0,
          expiresAt: now + CACHE_TTL, hitCount: 0,
        };
        if (prefetches.length >= MAX_PREFETCHES) prefetches.shift();
        prefetches.push(job);
        scheduled.push(job);
      }
    }
  }

  return scheduled;
}

export function completePrefetch(jobId: string): void {
  const job = prefetches.find(j => j.id === jobId);
  if (job) {
    job.status = 'cached';
    job.fetchedAt = Date.now();
  }
}

export function checkPrefetchCache(sourceId: string): boolean {
  const now = Date.now();
  const cached = prefetches.find(j =>
    j.sourceId === sourceId && j.status === 'cached' && j.expiresAt > now
  );
  if (cached) {
    cached.hitCount++;
    totalHits++;
    return true;
  }
  totalMisses++;
  return false;
}

export function getPrefetchStats(): PrefetchStats {
  const active = prefetches.filter(p => p.status === 'cached' && p.expiresAt > Date.now()).length;
  const totalPredictions = [...patterns.values()].filter(p => p.confidence >= 0.3).length;
  const accuratePredictions = [...patterns.values()].filter(p => p.confidence >= 0.6).length;

  return {
    totalPatterns: patterns.size,
    totalPrefetches: prefetches.length,
    cacheHits: totalHits,
    cacheMisses: totalMisses,
    hitRate: (totalHits + totalMisses) > 0 ? totalHits / (totalHits + totalMisses) : 0,
    activePrefetches: active,
    predictiveAccuracy: totalPredictions > 0 ? accuratePredictions / totalPredictions : 0,
  };
}

export function resetPrefetchState(): void {
  patterns.clear();
  prefetches.length = 0;
  totalHits = 0;
  totalMisses = 0;
}
