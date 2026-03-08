/**
 * Matrix Node Optimizations — CORE Sector
 * Node: CORE (Kernel orchestration & boot authority)
 * 
 * #1 Boot Checkpoint Journaling — Resume from last healthy phase on restart
 * #2 Cascading Weight Redistribution — Shift weights to healthy sectors during degradation
 */

// ── #1 Boot Checkpoint Journaling ──

export interface BootCheckpoint {
  phase: string;
  status: 'started' | 'completed' | 'failed';
  durationMs: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface BootJournal {
  bootId: string;
  startedAt: number;
  completedAt?: number;
  checkpoints: BootCheckpoint[];
  lastHealthyPhase: string | null;
  coldBoot: boolean;
  resumedFrom?: string;
}

const bootJournals: BootJournal[] = [];
const MAX_JOURNALS = 100;
let bootCounter = 0;

/**
 * Start a new boot journal entry.
 */
export function startBootJournal(coldBoot: boolean = true, resumeFrom?: string): BootJournal {
  const journal: BootJournal = {
    bootId: `boot_${++bootCounter}_${Date.now()}`,
    startedAt: Date.now(),
    checkpoints: [],
    lastHealthyPhase: null,
    coldBoot,
    resumedFrom: resumeFrom,
  };
  bootJournals.push(journal);
  if (bootJournals.length > MAX_JOURNALS) bootJournals.splice(0, bootJournals.length - MAX_JOURNALS);
  return journal;
}

/**
 * Record a boot phase checkpoint.
 */
export function recordBootCheckpoint(
  journal: BootJournal,
  phase: string,
  status: BootCheckpoint['status'],
  durationMs: number,
  metadata?: Record<string, unknown>,
): void {
  journal.checkpoints.push({ phase, status, durationMs, timestamp: Date.now(), metadata });
  if (status === 'completed') journal.lastHealthyPhase = phase;
}

/**
 * Complete a boot journal.
 */
export function completeBootJournal(journal: BootJournal): BootJournal {
  journal.completedAt = Date.now();
  return journal;
}

/**
 * Get the last healthy phase from the most recent boot, for warm-resume.
 */
export function getLastHealthyBootPhase(): string | null {
  if (bootJournals.length === 0) return null;
  return bootJournals[bootJournals.length - 1].lastHealthyPhase;
}

/**
 * Get boot journal history.
 */
export function getBootJournals(limit: number = 20): BootJournal[] {
  const clamped = Math.max(1, Math.min(limit, MAX_JOURNALS));
  return bootJournals.slice(-clamped).map(j => ({
    ...j,
    checkpoints: [...j.checkpoints],
  }));
}

/**
 * Get boot performance metrics.
 */
export function getBootMetrics(): {
  totalBoots: number;
  coldBoots: number;
  warmResumes: number;
  avgBootDurationMs: number;
  avgColdBootMs: number;
  avgWarmResumeMs: number;
  failureRate: number;
} {
  const completed = bootJournals.filter(j => j.completedAt);
  const cold = completed.filter(j => j.coldBoot);
  const warm = completed.filter(j => !j.coldBoot);
  const failed = bootJournals.filter(j => j.checkpoints.some(c => c.status === 'failed'));

  const avgDur = (arr: BootJournal[]) =>
    arr.length > 0 ? Math.round(arr.reduce((s, j) => s + ((j.completedAt ?? j.startedAt) - j.startedAt), 0) / arr.length) : 0;

  return {
    totalBoots: bootJournals.length,
    coldBoots: cold.length,
    warmResumes: warm.length,
    avgBootDurationMs: avgDur(completed),
    avgColdBootMs: avgDur(cold),
    avgWarmResumeMs: avgDur(warm),
    failureRate: bootJournals.length > 0 ? failed.length / bootJournals.length : 0,
  };
}

// ── #2 Cascading Weight Redistribution ──

import type { MatrixSector } from '@/lib/core/matrixNodeRegistry';

export interface WeightRedistribution {
  id: string;
  triggeredAt: number;
  degradedSector: MatrixSector;
  originalWeights: Record<string, number>;
  adjustedWeights: Record<string, number>;
  redistributedAmount: number;
  active: boolean;
  restoredAt?: number;
}

const redistributions: WeightRedistribution[] = [];
const MAX_REDISTRIBUTIONS = 200;
let redistCounter = 0;

/**
 * Redistribute weight from a degraded sector to healthy ones.
 * Returns adjusted weight map.
 */
export function redistributeWeights(
  degradedSector: MatrixSector,
  currentWeights: Record<string, { weight: number; sector: MatrixSector; health: number }>,
  degradationThreshold: number = 50,
): WeightRedistribution {
  const originalWeights: Record<string, number> = {};
  const adjustedWeights: Record<string, number> = {};

  // Calculate how much weight to redistribute
  let redistributeAmount = 0;
  const healthySectors: string[] = [];

  for (const [id, node] of Object.entries(currentWeights)) {
    originalWeights[id] = node.weight;
    if (node.sector === degradedSector && node.health < degradationThreshold) {
      // Reduce weight proportional to degradation
      const reduction = node.weight * (1 - node.health / 100) * 0.5; // max 50% reduction
      adjustedWeights[id] = Math.round((node.weight - reduction) * 10000) / 10000;
      redistributeAmount += reduction;
    } else {
      adjustedWeights[id] = node.weight;
      if (node.health >= 80) healthySectors.push(id);
    }
  }

  // Distribute reclaimed weight evenly among healthy nodes
  if (healthySectors.length > 0 && redistributeAmount > 0) {
    const perNode = redistributeAmount / healthySectors.length;
    for (const id of healthySectors) {
      adjustedWeights[id] = Math.round((adjustedWeights[id] + perNode) * 10000) / 10000;
    }
  }

  const redistribution: WeightRedistribution = {
    id: `redist_${++redistCounter}_${Date.now()}`,
    triggeredAt: Date.now(),
    degradedSector,
    originalWeights,
    adjustedWeights,
    redistributedAmount: Math.round(redistributeAmount * 10000) / 10000,
    active: true,
  };

  redistributions.push(redistribution);
  if (redistributions.length > MAX_REDISTRIBUTIONS) redistributions.splice(0, redistributions.length - MAX_REDISTRIBUTIONS);

  return redistribution;
}

/**
 * Restore original weights when sector recovers.
 */
export function restoreWeights(redistributionId: string): WeightRedistribution | null {
  const r = redistributions.find(rd => rd.id === redistributionId && rd.active);
  if (!r) return null;
  r.active = false;
  r.restoredAt = Date.now();
  return r;
}

/**
 * Get active redistributions.
 */
export function getActiveRedistributions(): WeightRedistribution[] {
  return redistributions.filter(r => r.active);
}
