/**
 * IMMUNITY — Post-Execution Outcome Tracking & Dream Cycle Integration
 *
 * Tracks repair outcomes with full context so the system can learn
 * which repairs work for which input patterns.
 */

import { log } from '@/lib/system/log';
import type { InputArchetype } from './schema-validator';

export interface OutcomeRecord {
  executor: string;
  timestamp: number;
  archetype: InputArchetype;
  repairType: string | null;
  repairConfidence: number;
  retrySucceeded: boolean;
  inputShape: string; // sorted keys
  stagesApplied: number;
  chained: boolean;
  preNormalized: boolean;
  durationMs: number;
}

/** Ring buffer of recent outcomes for real-time analysis */
const OUTCOME_BUFFER_SIZE = 500;
const outcomeBuffer: OutcomeRecord[] = [];

/**
 * Record a repair outcome for learning.
 */
export function trackOutcome(record: OutcomeRecord): void {
  outcomeBuffer.push(record);
  if (outcomeBuffer.length > OUTCOME_BUFFER_SIZE) {
    outcomeBuffer.shift();
  }
}

/**
 * Get aggregated outcome statistics per executor.
 */
export function getOutcomeStats(): Record<string, {
  total: number;
  retrySuccessRate: number;
  avgConfidence: number;
  avgStages: number;
  archetypeDistribution: Record<string, number>;
  topRepairTypes: Array<{ type: string; count: number; successRate: number }>;
}> {
  const byExecutor = new Map<string, OutcomeRecord[]>();

  for (const r of outcomeBuffer) {
    const arr = byExecutor.get(r.executor) ?? [];
    arr.push(r);
    byExecutor.set(r.executor, arr);
  }

  const stats: Record<string, any> = {};

  for (const [exec, records] of byExecutor) {
    const total = records.length;
    const successes = records.filter(r => r.retrySucceeded).length;
    const avgConf = records.reduce((s, r) => s + r.repairConfidence, 0) / total;
    const avgStages = records.reduce((s, r) => s + r.stagesApplied, 0) / total;

    // Archetype distribution
    const archetypes: Record<string, number> = {};
    for (const r of records) {
      archetypes[r.archetype] = (archetypes[r.archetype] ?? 0) + 1;
    }

    // Top repair types with success rates
    const repairTypeMap = new Map<string, { count: number; successes: number }>();
    for (const r of records) {
      if (!r.repairType) continue;
      const existing = repairTypeMap.get(r.repairType) ?? { count: 0, successes: 0 };
      existing.count++;
      if (r.retrySucceeded) existing.successes++;
      repairTypeMap.set(r.repairType, existing);
    }

    const topRepairTypes = Array.from(repairTypeMap.entries())
      .map(([type, s]) => ({ type, count: s.count, successRate: s.count > 0 ? s.successes / s.count : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    stats[exec] = {
      total,
      retrySuccessRate: total > 0 ? successes / total : 0,
      avgConfidence: avgConf,
      avgStages: avgStages,
      archetypeDistribution: archetypes,
      topRepairTypes,
    };
  }

  return stats;
}

/**
 * #9: Dream Cycle Integration Hook
 * Produces a learning digest that can be consumed by the dream cycle
 * to generate new repair rules autonomously.
 */
export function produceDreamDigest(): {
  lowConfidencePatterns: Array<{ executor: string; archetype: string; avgConfidence: number; count: number }>;
  highFailureRepairs: Array<{ repairType: string; executor: string; failRate: number; count: number }>;
  suggestions: string[];
} {
  const lowConfidencePatterns: Array<{ executor: string; archetype: string; avgConfidence: number; count: number }> = [];
  const highFailureRepairs: Array<{ repairType: string; executor: string; failRate: number; count: number }> = [];
  const suggestions: string[] = [];

  // Group by executor+archetype
  const grouped = new Map<string, OutcomeRecord[]>();
  for (const r of outcomeBuffer) {
    const key = `${r.executor}:${r.archetype}`;
    const arr = grouped.get(key) ?? [];
    arr.push(r);
    grouped.set(key, arr);
  }

  for (const [key, records] of grouped) {
    const [executor, archetype] = key.split(':');
    const avgConf = records.reduce((s, r) => s + r.repairConfidence, 0) / records.length;
    if (avgConf < 0.6 && records.length >= 3) {
      lowConfidencePatterns.push({ executor, archetype, avgConfidence: avgConf, count: records.length });
      suggestions.push(
        `Low confidence (${(avgConf * 100).toFixed(0)}%) for ${executor} with ${archetype} inputs (${records.length} cases). ` +
        `Consider adding specialized repair rules for this archetype.`
      );
    }
  }

  // Find repair types with high failure rates
  const repairTypeGroups = new Map<string, { executor: string; records: OutcomeRecord[] }>();
  for (const r of outcomeBuffer) {
    if (!r.repairType) continue;
    const key = `${r.executor}:${r.repairType}`;
    const existing = repairTypeGroups.get(key) ?? { executor: r.executor, records: [] };
    existing.records.push(r);
    repairTypeGroups.set(key, existing);
  }

  for (const [key, { executor, records }] of repairTypeGroups) {
    const failures = records.filter(r => !r.retrySucceeded).length;
    const failRate = failures / records.length;
    if (failRate > 0.5 && records.length >= 3) {
      const repairType = key.split(':').slice(1).join(':');
      highFailureRepairs.push({ repairType, executor, failRate, count: records.length });
      suggestions.push(
        `High failure rate (${(failRate * 100).toFixed(0)}%) for repair "${repairType}" on ${executor}. ` +
        `This rule may need refinement or an alternative approach.`
      );
    }
  }

  if (suggestions.length > 0) {
    log.info('immune', `Dream digest: ${suggestions.length} improvement suggestions generated`);
  }

  return { lowConfidencePatterns, highFailureRepairs, suggestions };
}

/**
 * Reset outcome buffer (for telemetry reset)
 */
export function resetOutcomeTracker(): void {
  outcomeBuffer.length = 0;
}
