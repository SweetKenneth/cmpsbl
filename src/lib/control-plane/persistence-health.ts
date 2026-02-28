/**
 * Persistence Health Monitor
 * Tracks durability health as a HealthScorecard dimension.
 */

import { getPersistenceHealth } from './persistence';
import type { DimensionScore } from '@/lib/substrate/health-scorecard';

const STALE_THRESHOLD_MS = 60_000; // 60 seconds
const FAILURE_PENALTY = 10; // per failure

export function getPersistenceDimension(): Omit<DimensionScore, 'status'> {
  const { lastWriteAt, writeFailures, pendingWrites } = getPersistenceHealth();
  const staleness = Date.now() - lastWriteAt;

  let score = 100;

  // Degrade if last write is stale
  if (staleness > STALE_THRESHOLD_MS) {
    const staleMinutes = (staleness - STALE_THRESHOLD_MS) / 60_000;
    score -= Math.min(40, staleMinutes * 10);
  }

  // Degrade for failures
  score -= Math.min(30, writeFailures * FAILURE_PENALTY);

  // Minor penalty for large pending queue
  if (pendingWrites > 5) {
    score -= Math.min(10, (pendingWrites - 5) * 2);
  }

  return {
    dimension: 'control_plane_durability',
    score: Math.max(0, Math.round(score)),
    weight: 0.8,
    details: `Last write: ${staleness}ms ago | Failures: ${writeFailures} | Pending: ${pendingWrites}`,
  };
}
