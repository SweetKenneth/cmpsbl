/**
 * Memory Tiering — RPS-driven tier management with receipts
 * Extends SM-2 repetition scheduling with RPS + credibility + contradiction guards
 */

import { computeRPS, computeRPSBatch, type MemoryEntry, type RpsWeights, DEFAULT_RPS_WEIGHTS } from './rps';

export type MemoryTier = 'hot' | 'warm' | 'cold' | 'glacier';

export interface TierThresholds {
  hot_min: number;
  warm_min: number;
  cold_min: number;
}

export const DEFAULT_TIER_THRESHOLDS: TierThresholds = {
  hot_min: 0.70,
  warm_min: 0.40,
  cold_min: 0.15,
};

export type TierMoveReason =
  | 'used_recently'
  | 'linked_active_pipeline'
  | 'dream_resurrected'
  | 'manual_pin'
  | 'contradiction_penalty'
  | 'staleness_decay'
  | 'rps_promotion'
  | 'rps_demotion'
  | 'rps_marginal_demotion';

export type TierMoveActor = 'system' | 'user' | 'governor';

export interface TierMoveReceipt {
  memory_id: string;
  reason_code: TierMoveReason;
  before_tier: MemoryTier;
  after_tier: MemoryTier;
  before_confidence: number;
  after_confidence: number;
  rps_score: number;
  actor: TierMoveActor;
  evidence: Record<string, unknown>;
  timestamp: string;
}

const TIER_RANK: Record<MemoryTier, number> = { hot: 3, warm: 2, cold: 1, glacier: 0 };

/** Pre-computed hide threshold */
const HIDE_THRESHOLD = DEFAULT_TIER_THRESHOLDS.cold_min * 0.5;

/** Determine tier from RPS */
export function tierFromRPS(rps: number, thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS): MemoryTier {
  if (rps >= thresholds.hot_min) return 'hot';
  if (rps >= thresholds.warm_min) return 'warm';
  if (rps >= thresholds.cold_min) return 'cold';
  return 'glacier';
}

/** Compute tier move and generate receipt if tier changed */
export function computeTierMove(
  entry: MemoryEntry,
  currentTier: MemoryTier,
  actor: TierMoveActor = 'system',
  weights?: RpsWeights
): TierMoveReceipt | null {
  const rps = computeRPS(entry, weights ?? DEFAULT_RPS_WEIGHTS);
  const newTier = tierFromRPS(rps);

  if (newTier === currentTier) return null;

  return buildReceipt(entry, currentTier, newTier, rps, actor);
}

/**
 * Batch-compute tier moves for an array of entries.
 * Shares a single Date.now() across all RPS calculations.
 * Returns only entries that changed tier (filters nulls).
 */
export function computeTierMovesBatch(
  entries: MemoryEntry[],
  currentTiers: MemoryTier[],
  actor: TierMoveActor = 'system',
  weights?: RpsWeights
): TierMoveReceipt[] {
  const w = weights ?? DEFAULT_RPS_WEIGHTS;
  const scores = computeRPSBatch(entries, w);
  const receipts: TierMoveReceipt[] = [];

  for (let i = 0; i < entries.length; i++) {
    const rps = scores[i];
    const newTier = tierFromRPS(rps);
    if (newTier === currentTiers[i]) continue;
    receipts.push(buildReceipt(entries[i], currentTiers[i], newTier, rps, actor));
  }

  return receipts;
}

/** Shared receipt builder */
function buildReceipt(
  entry: MemoryEntry,
  beforeTier: MemoryTier,
  afterTier: MemoryTier,
  rps: number,
  actor: TierMoveActor
): TierMoveReceipt {
  const reason = inferReason(entry, beforeTier, afterTier, rps);
  return {
    memory_id: entry.id,
    reason_code: reason,
    before_tier: beforeTier,
    after_tier: afterTier,
    before_confidence: entry.confidence,
    after_confidence: entry.contradicted ? entry.confidence * 0.7 : entry.confidence,
    rps_score: rps,
    actor,
    evidence: {
      access_count: entry.access_count,
      link_count: entry.link_count,
      contradicted: entry.contradicted,
      source_credibility: entry.source_credibility,
      rps_score: rps,
    },
    timestamp: new Date().toISOString(),
  };
}

function inferReason(entry: MemoryEntry, from: MemoryTier, to: MemoryTier, rps: number): TierMoveReason {
  if (entry.contradicted) return 'contradiction_penalty';

  if (TIER_RANK[to] > TIER_RANK[from]) {
    return rps >= DEFAULT_TIER_THRESHOLDS.hot_min ? 'used_recently' : 'rps_promotion';
  }

  return entry.access_count <= 1 ? 'staleness_decay'
    : rps < DEFAULT_TIER_THRESHOLDS.cold_min ? 'rps_demotion'
    : 'rps_marginal_demotion';
}

/** Check if memory should be hidden by default (below glacier threshold) */
export function shouldHide(entry: MemoryEntry, weights?: RpsWeights): boolean {
  return computeRPS(entry, weights ?? DEFAULT_RPS_WEIGHTS) < HIDE_THRESHOLD;
}