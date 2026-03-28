/**
 * CONSCIENCE — Ethical Memory (Precedent Engine)
 * Stores past ethical decisions and retrieves relevant precedents
 * for consistency in future evaluations.
 *
 * Uses a fixed-size ring buffer (O(1) insert) with FNV-1a fingerprints
 * for fast precedent lookup (O(n) scan, capped at MAX_PRECEDENTS).
 */

export interface EthicalPrecedent {
  id: string;
  action: string;
  fingerprint: number;
  compositeScore: number;
  recommendation: 'proceed' | 'caution' | 'block';
  frameworkScores: Record<string, number>;
  context: Record<string, unknown>;
  outcome?: 'positive' | 'negative' | 'neutral';
  createdAt: number;
}

export interface PrecedentMatch {
  precedent: EthicalPrecedent;
  similarity: number; // 0-1
}

const MAX_PRECEDENTS = 500;
const precedents: EthicalPrecedent[] = [];
let writeIndex = 0;
let totalStored = 0;

/** FNV-1a 32-bit hash for fast string fingerprinting */
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

/** Normalize action text for fingerprinting */
function normalizeAction(action: string): string {
  return action.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/** Store a new precedent in the ring buffer */
export function storePrecedent(
  action: string,
  compositeScore: number,
  recommendation: 'proceed' | 'caution' | 'block',
  frameworkScores: Record<string, number>,
  context: Record<string, unknown> = {},
): EthicalPrecedent {
  const normalized = normalizeAction(action);
  const precedent: EthicalPrecedent = {
    id: `prec-${Date.now()}-${totalStored}`,
    action: normalized.slice(0, 200),
    fingerprint: fnv1a(normalized),
    compositeScore,
    recommendation,
    frameworkScores: { ...frameworkScores },
    context,
    createdAt: Date.now(),
  };

  if (totalStored < MAX_PRECEDENTS) {
    precedents.push(precedent);
  } else {
    precedents[writeIndex] = precedent;
  }
  writeIndex = (writeIndex + 1) % MAX_PRECEDENTS;
  totalStored++;

  return precedent;
}

/** Record an outcome for a precedent (post-action feedback) */
export function recordOutcome(precedentId: string, outcome: 'positive' | 'negative' | 'neutral'): boolean {
  const p = precedents.find(pr => pr.id === precedentId);
  if (p) { p.outcome = outcome; return true; }
  return false;
}

/** Find similar precedents by action fingerprint and keyword overlap */
export function findPrecedents(action: string, maxResults: number = 5): PrecedentMatch[] {
  if (precedents.length === 0) return [];

  const normalized = normalizeAction(action);
  const fingerprint = fnv1a(normalized);
  const words = new Set(normalized.split(' ').filter(w => w.length > 2));

  const scored: PrecedentMatch[] = [];

  for (const p of precedents) {
    let similarity = 0;

    // Exact fingerprint match = high similarity
    if (p.fingerprint === fingerprint) {
      similarity = 1.0;
    } else {
      // Word overlap similarity
      const pWords = p.action.split(' ').filter(w => w.length > 2);
      if (pWords.length > 0 && words.size > 0) {
        let overlap = 0;
        for (const w of pWords) {
          if (words.has(w)) overlap++;
        }
        similarity = overlap / Math.max(words.size, pWords.length);
      }
    }

    if (similarity > 0.15) {
      scored.push({ precedent: p, similarity });
    }
  }

  // Sort descending by similarity, take top N
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, maxResults);
}

/** Get consistency score: how aligned is a new decision with past precedents */
export function getConsistencyScore(
  action: string,
  proposedRecommendation: 'proceed' | 'caution' | 'block',
): { score: number; conflicts: number; total: number } {
  const matches = findPrecedents(action, 10);
  if (matches.length === 0) return { score: 1, conflicts: 0, total: 0 };

  let conflicts = 0;
  for (const m of matches) {
    if (m.similarity >= 0.5 && m.precedent.recommendation !== proposedRecommendation) {
      conflicts++;
    }
  }

  return {
    score: matches.length > 0 ? 1 - (conflicts / matches.length) : 1,
    conflicts,
    total: matches.length,
  };
}

/** Get precedent stats */
export function getPrecedentStats() {
  const outcomes = { positive: 0, negative: 0, neutral: 0, unknown: 0 };
  for (const p of precedents) {
    if (p.outcome) outcomes[p.outcome]++;
    else outcomes.unknown++;
  }
  return {
    totalStored: precedents.length,
    totalLifetime: totalStored,
    outcomes,
    oldestAt: precedents.length > 0 ? Math.min(...precedents.map(p => p.createdAt)) : 0,
    newestAt: precedents.length > 0 ? Math.max(...precedents.map(p => p.createdAt)) : 0,
  };
}
