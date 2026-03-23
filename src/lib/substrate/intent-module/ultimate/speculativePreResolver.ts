/**
 * INTENT Ultimate — System 10: Speculative Pre-Resolution
 * 
 * Based on behavioral patterns, speculatively pre-resolves likely next intents.
 * Predictive, not reactive — pre-stages pipelines before they're needed.
 * 
 * @module intent/ultimate/speculativePreResolver
 */

// ── Types ────────────────────────────────────────────────────────

export interface IntentSequence {
  pattern: string[]; // e.g., ['analysis', 'mutation', 'query']
  frequency: number;
  lastSeen: string;
  confidence: number; // How reliable this prediction is
}

export interface PreResolution {
  id: string;
  predictedIntent: string;
  basedOnCurrent: string;
  confidence: number;
  preStagedNodes: string[];
  status: 'staged' | 'hit' | 'miss' | 'expired';
  stagedAt: string;
  resolvedAt?: string;
  ttlMs: number;
}

export interface PredictionStats {
  totalPredictions: number;
  hits: number;
  misses: number;
  expired: number;
  hitRate: number;
  avgLeadTimeMs: number;
}

// ── State ────────────────────────────────────────────────────────

const sequences: Map<string, IntentSequence> = new Map();
const intentStream: string[] = []; // Recent intent type stream
const preResolutions: PreResolution[] = [];
const MAX_STREAM = 100;
const MAX_RESOLUTIONS = 200;
const MAX_SEQUENCES = 150;
const DEFAULT_TTL_MS = 60_000; // 1 minute pre-stage TTL
const MIN_CONFIDENCE = 0.5;

// ── Sequence Learning ────────────────────────────────────────────

function updateSequences(intentType: string): void {
  intentStream.push(intentType);
  if (intentStream.length > MAX_STREAM) intentStream.splice(0, intentStream.length - MAX_STREAM);

  // Learn 2-gram and 3-gram patterns
  for (const n of [2, 3]) {
    if (intentStream.length < n) continue;
    const pattern = intentStream.slice(-n);
    const key = pattern.join('→');
    const existing = sequences.get(key);
    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date().toISOString();
      existing.confidence = Math.min(0.95, 0.3 + (existing.frequency * 0.05));
    } else {
      sequences.set(key, {
        pattern,
        frequency: 1,
        lastSeen: new Date().toISOString(),
        confidence: 0.3,
      });
      if (sequences.size > MAX_SEQUENCES) {
        // Evict lowest frequency
        let minKey = '';
        let minFreq = Infinity;
        for (const [k, v] of sequences) {
          if (v.frequency < minFreq) {
            minFreq = v.frequency;
            minKey = k;
          }
        }
        if (minKey) sequences.delete(minKey);
      }
    }
  }
}

/** Predict the most likely next intent */
function predictNext(currentIntent: string): { intent: string; confidence: number } | null {
  const candidates: Array<{ intent: string; confidence: number; frequency: number }> = [];

  for (const seq of sequences.values()) {
    const pattern = seq.pattern;
    // Check if current intent matches any non-final position
    for (let i = 0; i < pattern.length - 1; i++) {
      if (pattern[i] === currentIntent) {
        const nextIntent = pattern[i + 1];
        candidates.push({
          intent: nextIntent,
          confidence: seq.confidence,
          frequency: seq.frequency,
        });
      }
    }
  }

  if (candidates.length === 0) return null;

  // Best candidate by weighted confidence + frequency
  candidates.sort((a, b) => (b.confidence * b.frequency) - (a.confidence * a.frequency));
  const best = candidates[0];

  if (best.confidence < MIN_CONFIDENCE) return null;

  return { intent: best.intent, confidence: best.confidence };
}

// ── Core API ────────────────────────────────────────────────────

/** Record an intent and speculatively pre-resolve the next one */
export function recordAndPredict(
  intentType: string,
  preStageFn?: (predictedIntent: string) => string[], // Returns pre-staged node IDs
): PreResolution | null {
  // Check if any existing pre-resolution was a hit
  for (const pr of preResolutions) {
    if (pr.status === 'staged' && pr.predictedIntent === intentType) {
      pr.status = 'hit';
      pr.resolvedAt = new Date().toISOString();
    }
  }

  // Expire stale pre-resolutions
  const now = Date.now();
  for (const pr of preResolutions) {
    if (pr.status === 'staged' && (now - new Date(pr.stagedAt).getTime()) > pr.ttlMs) {
      pr.status = 'expired';
    }
  }

  // Learn from this intent
  updateSequences(intentType);

  // Predict next
  const prediction = predictNext(intentType);
  if (!prediction) return null;

  const preStagedNodes = preStageFn ? preStageFn(prediction.intent) : [];

  const preRes: PreResolution = {
    id: crypto.randomUUID(),
    predictedIntent: prediction.intent,
    basedOnCurrent: intentType,
    confidence: Math.round(prediction.confidence * 1000) / 1000,
    preStagedNodes,
    status: 'staged',
    stagedAt: new Date().toISOString(),
    ttlMs: DEFAULT_TTL_MS,
  };

  preResolutions.push(preRes);
  if (preResolutions.length > MAX_RESOLUTIONS) preResolutions.splice(0, preResolutions.length - MAX_RESOLUTIONS);

  return preRes;
}

/** Get prediction statistics */
export function getPredictionStats(): PredictionStats {
  const hits = preResolutions.filter(p => p.status === 'hit').length;
  const misses = preResolutions.filter(p => p.status === 'miss').length;
  const expired = preResolutions.filter(p => p.status === 'expired').length;
  const total = hits + misses + expired;

  // Average lead time for hits
  const hitLeadTimes = preResolutions
    .filter(p => p.status === 'hit' && p.resolvedAt)
    .map(p => new Date(p.resolvedAt!).getTime() - new Date(p.stagedAt).getTime());

  return {
    totalPredictions: preResolutions.length,
    hits,
    misses,
    expired,
    hitRate: total > 0 ? Math.round((hits / total) * 100) : 0,
    avgLeadTimeMs: hitLeadTimes.length > 0
      ? Math.round(hitLeadTimes.reduce((s, t) => s + t, 0) / hitLeadTimes.length)
      : 0,
  };
}

/** Get learned sequences */
export function getLearnedSequences(): IntentSequence[] {
  return Array.from(sequences.values())
    .sort((a, b) => b.frequency - a.frequency);
}

/** Get pre-resolution health */
export function getPreResolverHealth() {
  const stats = getPredictionStats();
  return {
    learnedSequences: sequences.size,
    streamDepth: intentStream.length,
    activePredictions: preResolutions.filter(p => p.status === 'staged').length,
    hitRate: stats.hitRate,
    totalPredictions: stats.totalPredictions,
  };
}

/** Reset */
export function resetPreResolver(): void {
  sequences.clear();
  intentStream.length = 0;
  preResolutions.length = 0;
}
