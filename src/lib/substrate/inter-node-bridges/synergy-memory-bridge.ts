/**
 * Synergy → Memory Persistence Bridge
 * 
 * Persists synergy execution results to MEMORY so the substrate can
 * learn which cross-module pipelines produce good outcomes. Without
 * this, synergy results are ephemeral and the system can't optimize
 * pipeline selection over time.
 *
 * SYNERGY ENGINE → execution result → [THIS BRIDGE] → MEMORY module + brain_events
 */

import { emit } from '@/lib/substrate/events';
import { log } from '@/lib/system/log';
import { secureGet, secureSet } from '@/lib/system/secureStorage';
import { boundArray } from '@/lib/system/hardening';

export interface SynergyOutcome {
  synergyId: string;
  modules: string[];
  category: string;
  success: boolean;
  executionMs: number;
  confidence: number;
  errorSummary?: string;
  timestamp: string;
}

interface SynergyMemory {
  outcomes: SynergyOutcome[];
  stats: Record<string, SynergyStats>;
  lastUpdated: string;
}

export interface SynergyStats {
  synergyId: string;
  totalRuns: number;
  successCount: number;
  failCount: number;
  avgExecutionMs: number;
  avgConfidence: number;
  successRate: number;
  trend: 'improving' | 'stable' | 'degrading';
  lastRun: string;
}

const STORAGE_KEY = 'synergy_memory';
const MAX_OUTCOMES = 500;

function loadMemory(): SynergyMemory {
  return secureGet<SynergyMemory>(STORAGE_KEY) ?? {
    outcomes: [],
    stats: {},
    lastUpdated: new Date().toISOString(),
  };
}

function saveMemory(memory: SynergyMemory): void {
  memory.lastUpdated = new Date().toISOString();
  secureSet(STORAGE_KEY, memory);
}

/**
 * Record a synergy execution outcome for learning.
 */
export function recordSynergyOutcome(outcome: SynergyOutcome): void {
  const memory = loadMemory();
  
  // Add outcome, bound to prevent unbounded growth
  memory.outcomes.push(outcome);
  memory.outcomes = boundArray(memory.outcomes, MAX_OUTCOMES) as SynergyOutcome[];

  // Update stats
  const existing = memory.stats[outcome.synergyId];
  if (existing) {
    existing.totalRuns++;
    if (outcome.success) existing.successCount++;
    else existing.failCount++;
    existing.avgExecutionMs = (existing.avgExecutionMs * (existing.totalRuns - 1) + outcome.executionMs) / existing.totalRuns;
    existing.avgConfidence = (existing.avgConfidence * (existing.totalRuns - 1) + outcome.confidence) / existing.totalRuns;
    existing.successRate = existing.successCount / existing.totalRuns;
    existing.lastRun = outcome.timestamp;

    // Trend: compare last 5 runs to previous 5
    const recentOutcomes = memory.outcomes
      .filter(o => o.synergyId === outcome.synergyId)
      .slice(-10);
    if (recentOutcomes.length >= 10) {
      const recent5 = recentOutcomes.slice(-5);
      const prev5 = recentOutcomes.slice(0, 5);
      const recentRate = recent5.filter(o => o.success).length / 5;
      const prevRate = prev5.filter(o => o.success).length / 5;
      existing.trend = recentRate > prevRate + 0.1 ? 'improving' : recentRate < prevRate - 0.1 ? 'degrading' : 'stable';
    }
  } else {
    memory.stats[outcome.synergyId] = {
      synergyId: outcome.synergyId,
      totalRuns: 1,
      successCount: outcome.success ? 1 : 0,
      failCount: outcome.success ? 0 : 1,
      avgExecutionMs: outcome.executionMs,
      avgConfidence: outcome.confidence,
      successRate: outcome.success ? 1 : 0,
      trend: 'stable',
      lastRun: outcome.timestamp,
    };
  }

  saveMemory(memory);

  // Emit for telemetry
  emit({
    module: 'MEMORY',
    event_type: 'synergy.outcome_recorded',
    outcome: 'succeeded',
    data: {
      synergyId: outcome.synergyId,
      success: outcome.success,
      confidence: outcome.confidence,
      category: outcome.category,
    },
  });
}

/**
 * Get stats for a specific synergy pipeline.
 */
export function getSynergyStats(synergyId: string): SynergyStats | undefined {
  return loadMemory().stats[synergyId];
}

/**
 * Get the top-performing synergies by success rate.
 */
export function getTopSynergies(topN = 10): SynergyStats[] {
  const memory = loadMemory();
  return Object.values(memory.stats)
    .filter(s => s.totalRuns >= 3) // Minimum sample size
    .sort((a, b) => b.successRate - a.successRate || b.avgConfidence - a.avgConfidence)
    .slice(0, topN);
}

/**
 * Get degrading synergies that need attention.
 */
export function getDegradingSynergies(): SynergyStats[] {
  const memory = loadMemory();
  return Object.values(memory.stats)
    .filter(s => s.trend === 'degrading' || s.successRate < 0.5)
    .sort((a, b) => a.successRate - b.successRate);
}

/**
 * Get a summary of synergy memory for the dashboard.
 */
export function getSynergyMemorySummary(): {
  totalOutcomes: number;
  uniqueSynergies: number;
  overallSuccessRate: number;
  degradingCount: number;
  topPerformer: string | null;
} {
  const memory = loadMemory();
  const allStats = Object.values(memory.stats);
  const totalSuccess = allStats.reduce((s, st) => s + st.successCount, 0);
  const totalRuns = allStats.reduce((s, st) => s + st.totalRuns, 0);
  const top = allStats.sort((a, b) => b.successRate - a.successRate)[0];

  return {
    totalOutcomes: memory.outcomes.length,
    uniqueSynergies: allStats.length,
    overallSuccessRate: totalRuns > 0 ? totalSuccess / totalRuns : 0,
    degradingCount: allStats.filter(s => s.trend === 'degrading').length,
    topPerformer: top?.synergyId ?? null,
  };
}
