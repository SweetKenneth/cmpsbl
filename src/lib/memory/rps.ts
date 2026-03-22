/**
 * Recall Priority Score (RPS) — Memory tiering beyond SM-2
 * RPS = α*recency + β*use_frequency + γ*link_centrality + δ*task_relevance - ε*staleness
 */

export interface RpsWeights {
  alpha: number; // recency
  beta: number;  // use_frequency
  gamma: number; // link_centrality
  delta: number; // task_relevance
  epsilon: number; // staleness penalty
}

export const DEFAULT_RPS_WEIGHTS: RpsWeights = {
  alpha: 0.30,
  beta: 0.25,
  gamma: 0.15,
  delta: 0.20,
  epsilon: 0.10,
};

export interface MemoryEntry {
  id: string;
  last_accessed_at: string;
  access_count: number;
  link_count: number;        // connections to other memories
  task_relevance: number;    // 0–1 contextual relevance
  created_at: string;
  confidence: number;
  contradicted: boolean;
  source_credibility: SourceCredibility;
}

export type SourceCredibility = 'audit_verified' | 'system_telemetry' | 'user_notes' | 'inferred';

export const CREDIBILITY_WEIGHTS: Record<SourceCredibility, number> = {
  audit_verified: 1.0,
  system_telemetry: 0.85,
  user_notes: 0.65,
  inferred: 0.40,
};

/** Pre-computed constants */
const LN2_OVER_48 = 0.693 / 48;
const INV_86400000 = 1 / 86_400_000;
const INV_3600000 = 1 / 3_600_000;
const INV_20 = 1 / 20;
const INV_10 = 1 / 10;
const INV_30 = 1 / 30;

/** Compute recency score (0–1) based on time since last access */
function recencyScore(lastAccessedAt: string, nowMs: number): number {
  const ageHours = (nowMs - new Date(lastAccessedAt).getTime()) * INV_3600000;
  return Math.exp(-LN2_OVER_48 * ageHours);
}

/** Compute staleness penalty (0–1) based on time since creation with no access */
function stalenessScore(createdAt: string, accessCount: number, nowMs: number): number {
  if (accessCount > 3) return 0;
  const ageDays = (nowMs - new Date(createdAt).getTime()) * INV_86400000;
  return ageDays > 30 ? 1 : ageDays * INV_30;
}

/** Clamp value to 0–1 */
function clamp01(v: number): number {
  return v > 1 ? 1 : v < 0 ? 0 : v;
}

/** Compute full RPS for a memory entry */
export function computeRPS(entry: MemoryEntry, weights: RpsWeights = DEFAULT_RPS_WEIGHTS): number {
  const now = Date.now();
  return computeRPSAt(entry, now, weights);
}

/** Internal: compute RPS with pre-resolved timestamp (avoids repeated Date.now()) */
function computeRPSAt(entry: MemoryEntry, nowMs: number, weights: RpsWeights): number {
  const recency = recencyScore(entry.last_accessed_at, nowMs);
  const frequency = entry.access_count >= 20 ? 1 : entry.access_count * INV_20;
  const centrality = entry.link_count >= 10 ? 1 : entry.link_count * INV_10;
  const relevance = entry.task_relevance;
  const staleness = stalenessScore(entry.created_at, entry.access_count, nowMs);

  let rps =
    weights.alpha * recency +
    weights.beta * frequency +
    weights.gamma * centrality +
    weights.delta * relevance -
    weights.epsilon * staleness;

  if (entry.contradicted) rps *= 0.5;
  rps *= CREDIBILITY_WEIGHTS[entry.source_credibility];

  return clamp01(rps);
}

/**
 * Batch-compute RPS for an array of entries.
 * Shares a single Date.now() call across all entries — avoids N syscalls.
 */
export function computeRPSBatch(
  entries: MemoryEntry[],
  weights: RpsWeights = DEFAULT_RPS_WEIGHTS
): number[] {
  const now = Date.now();
  const results = new Array<number>(entries.length);
  for (let i = 0; i < entries.length; i++) {
    results[i] = computeRPSAt(entries[i], now, weights);
  }
  return results;
}