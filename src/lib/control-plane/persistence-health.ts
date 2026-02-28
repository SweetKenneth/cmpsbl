/**
 * Persistence Health Monitor (v2 — Cluster-Aware)
 * Tracks durability, atomicity, lease status, and replayability.
 */

import { getPersistenceHealth } from './persistence';
import { isLeader } from './persistence-scheduler';
import { getWalStats } from './wal';
import { isEnabled } from '@/lib/substrate/feature-flags';
import type { DimensionScore } from '@/lib/substrate/health-scorecard';

const STALE_THRESHOLD_MS = 60_000;
const FAILURE_PENALTY = 10;

export function getPersistenceDimension(): Omit<DimensionScore, 'status'> {
  const health = getPersistenceHealth();
  const staleness = Date.now() - health.lastWriteAt;

  let score = 100;

  // Degrade if last write is stale
  if (staleness > STALE_THRESHOLD_MS) {
    const staleMinutes = (staleness - STALE_THRESHOLD_MS) / 60_000;
    score -= Math.min(40, staleMinutes * 10);
  }

  // Degrade for failures
  score -= Math.min(30, health.writeFailures * FAILURE_PENALTY);

  // Degraded mode penalty
  if (health.degradedMode) {
    score -= 20;
  }

  // Pending writes penalty
  if (health.pendingWrites > 5) {
    score -= Math.min(10, (health.pendingWrites - 5) * 2);
  }

  return {
    dimension: 'control_plane_durability',
    score: Math.max(0, Math.round(score)),
    weight: 0.8,
    details: `Rev: ${health.lastRevisionId ?? 'none'} | Hash: ${(health.lastSnapshotHash ?? 'none').slice(0, 8)} | Stale: ${staleness}ms | Failures: ${health.writeFailures} | Degraded: ${health.degradedMode}`,
  };
}

export function getClusterSafetyDimension(): Omit<DimensionScore, 'status'> {
  const leaderHeld = isLeader();
  const leaseEnabled = isEnabled('substrate.cp_leader_lease');

  let score = 100;

  if (leaseEnabled && !leaderHeld) {
    score -= 30; // Not leader = reduced safety
  }

  if (!leaseEnabled) {
    score -= 10; // No lease = potential race
  }

  return {
    dimension: 'control_plane_cluster_safety',
    score: Math.max(0, Math.round(score)),
    weight: 0.6,
    details: `Leader: ${leaderHeld} | Lease enabled: ${leaseEnabled}`,
  };
}

export function getAtomicityDimension(): Omit<DimensionScore, 'status'> {
  const health = getPersistenceHealth();
  const totalCommits = health.commitSuccessCount + health.commitFailureCount;
  const successRate = totalCommits > 0 ? health.commitSuccessCount / totalCommits : 1;
  const atomicEnabled = isEnabled('substrate.cp_atomic_commit');

  let score = 100;

  if (!atomicEnabled) {
    score -= 20; // Non-atomic = risk
  }

  // Degrade based on failure rate
  if (successRate < 0.95) {
    score -= Math.round((1 - successRate) * 60);
  }

  return {
    dimension: 'control_plane_atomicity',
    score: Math.max(0, Math.round(score)),
    weight: 0.7,
    details: `Atomic: ${atomicEnabled} | Success rate: ${(successRate * 100).toFixed(1)}% | Commits: ${totalCommits}`,
  };
}

export function getReplayabilityDimension(): Omit<DimensionScore, 'status'> {
  const walEnabled = isEnabled('substrate.cp_wal_enabled');
  const walStats = getWalStats();
  const health = getPersistenceHealth();

  let score = 100;

  if (!walEnabled) {
    score -= 30;
  }

  if (walStats.dropped > 0) {
    score -= Math.min(20, walStats.dropped);
  }

  if (!health.lastRevisionId) {
    score -= 15; // No revision = no restore point
  }

  return {
    dimension: 'control_plane_replayability',
    score: Math.max(0, Math.round(score)),
    weight: 0.5,
    details: `WAL: ${walEnabled} | Buffered: ${walStats.buffered} | Dropped: ${walStats.dropped} | Rev: ${health.lastRevisionId ?? 'none'}`,
  };
}
