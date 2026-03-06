/**
 * Memory Tiering — RPS-driven tier management with receipts
 * Extends SM-2 repetition scheduling with RPS + credibility + contradiction guards
 *
 * FIX #14: inferReason now uses rps score for threshold-based reasoning
 */

import { computeRPS, type MemoryEntry, type RpsWeights, DEFAULT_RPS_WEIGHTS } from './rps';

export type MemoryTier = 'hot' | 'warm' | 'cold' | 'glacier';

export interface TierThresholds {
  hot_min: number;     // RPS >= this → hot
  warm_min: number;    // RPS >= this → warm
  cold_min: number;    // RPS >= this → cold
  // below cold_min → glacier
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

  const reason = inferReason(entry, currentTier, newTier, rps);
  const confidenceAdjust = entry.contradicted ? entry.confidence * 0.7 : entry.confidence;

  return {
    memory_id: entry.id,
    reason_code: reason,
    before_tier: currentTier,
    after_tier: newTier,
    before_confidence: entry.confidence,
    after_confidence: confidenceAdjust,
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

/**
 * FIX #14: inferReason now uses rps score for threshold-based reasoning
 */
function inferReason(entry: MemoryEntry, from: MemoryTier, to: MemoryTier, rps: number): TierMoveReason {
  if (entry.contradicted) return 'contradiction_penalty';

  const isPromotion = TIER_RANK[to] > TIER_RANK[from];

  if (isPromotion) {
    // Distinguish strong promotions from marginal ones
    if (rps >= DEFAULT_TIER_THRESHOLDS.hot_min) return 'used_recently';
    return 'rps_promotion';
  }

  // Demotion reasons
  if (entry.access_count <= 1) return 'staleness_decay';
  if (rps < DEFAULT_TIER_THRESHOLDS.cold_min) return 'rps_demotion';
  return 'rps_marginal_demotion';
}

/** Check if memory should be hidden by default (below glacier threshold) */
export function shouldHide(entry: MemoryEntry, weights?: RpsWeights): boolean {
  const rps = computeRPS(entry, weights ?? DEFAULT_RPS_WEIGHTS);
  return rps < DEFAULT_TIER_THRESHOLDS.cold_min * 0.5;
}
