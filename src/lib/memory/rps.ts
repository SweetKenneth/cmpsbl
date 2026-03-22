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

/** Compute recency score (0–1) based on time since last access */
function recencyScore(lastAccessedAt: string, nowMs: number): number {
  const ageHours = (nowMs - new Date(lastAccessedAt).getTime()) / 3_600_000;
  // Exponential decay: half-life of 48 hours
  return Math.exp(-LN2_OVER_48 * ageHours);
}

/** Compute staleness penalty (0–1) based on time since creation with no access */
function stalenessScore(createdAt: string, accessCount: number, nowMs: number): number {
  if (accessCount > 3) return 0; // well-used items aren't stale
  const ageDays = (nowMs - new Date(createdAt).getTime()) * INV_86400000;
  return ageDays > 30 ? 1 : ageDays / 30;
}

/** Compute full RPS for a memory entry */
export function computeRPS(entry: MemoryEntry, weights: RpsWeights = DEFAULT_RPS_WEIGHTS): number {
  const now = Date.now();
  const recency = recencyScore(entry.last_accessed_at, now);
  const frequency = entry.access_count >= 20 ? 1 : entry.access_count / 20;
  const centrality = entry.link_count >= 10 ? 1 : entry.link_count / 10;
  const relevance = entry.task_relevance;
  const staleness = stalenessScore(entry.created_at, entry.access_count, now);

  let rps =
    weights.alpha * recency +
    weights.beta * frequency +
    weights.gamma * centrality +
    weights.delta * relevance -
    weights.epsilon * staleness;

  // Contradiction penalty: halve RPS if contradicted
  if (entry.contradicted) rps *= 0.5;

  // Source credibility weighting
  rps *= CREDIBILITY_WEIGHTS[entry.source_credibility];

  return rps > 1 ? 1 : rps < 0 ? 0 : rps;
}
