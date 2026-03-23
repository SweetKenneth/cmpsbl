/**
 * Repair Strategy Optimizer — SYSTEM v9.0.0
 * Tracks success/failure rates per strategy per subsystem,
 * dynamically reweighting selection based on empirical effectiveness.
 */

import { boundArray } from './hardening';

// --- Types ---

export type RepairStrategyId =
  | 'cache_reset'
  | 'health_recheck'
  | 'circuit_breaker_reset'
  | 'event_buffer_drain'
  | 'receipt_chain_rebuild';

export interface StrategyRecord {
  strategyId: RepairStrategyId;
  subsystem: string;
  attempts: number;
  successes: number;
  failures: number;
  avgDurationMs: number;
  successRate: number; // EMA-weighted
  lastUsed: number;
  riskLevel: number; // 0-1
}

export interface RepairOutcome {
  strategyId: RepairStrategyId;
  subsystem: string;
  success: boolean;
  durationMs: number;
  timestamp: number;
}

interface RankedStrategy {
  strategyId: RepairStrategyId;
  score: number;
  successRate: number;
  riskLevel: number;
}

// --- Constants ---

const EMA_ALPHA = 0.3;
const MAX_HISTORY = 500;

const BASE_RISK: Record<RepairStrategyId, number> = {
  cache_reset: 0.05,
  health_recheck: 0.0,
  circuit_breaker_reset: 0.2,
  event_buffer_drain: 0.3,
  receipt_chain_rebuild: 0.6,
};

// --- State ---

const records: Map<string, StrategyRecord> = new Map();
const outcomeHistory: RepairOutcome[] = [];

// --- Helpers ---

function recordKey(strategyId: RepairStrategyId, subsystem: string): string {
  return `${subsystem}::${strategyId}`;
}

function getOrCreateRecord(strategyId: RepairStrategyId, subsystem: string): StrategyRecord {
  const key = recordKey(strategyId, subsystem);
  let rec = records.get(key);
  if (!rec) {
    rec = {
      strategyId,
      subsystem,
      attempts: 0,
      successes: 0,
      failures: 0,
      avgDurationMs: 0,
      successRate: 0.5, // neutral prior
      lastUsed: 0,
      riskLevel: BASE_RISK[strategyId] ?? 0.5,
    };
    records.set(key, rec);
  }
  return rec;
}

// --- Core ---

export function recordOutcome(outcome: RepairOutcome): void {
  const rec = getOrCreateRecord(outcome.strategyId, outcome.subsystem);
  rec.attempts++;
  if (outcome.success) rec.successes++;
  else rec.failures++;

  // EMA for success rate
  const sample = outcome.success ? 1 : 0;
  rec.successRate = EMA_ALPHA * sample + (1 - EMA_ALPHA) * rec.successRate;

  // Running average duration
  rec.avgDurationMs = (rec.avgDurationMs * (rec.attempts - 1) + outcome.durationMs) / rec.attempts;
  rec.lastUsed = outcome.timestamp;

  outcomeHistory.push(outcome);
  if (outcomeHistory.length > MAX_HISTORY) {
    outcomeHistory.splice(0, outcomeHistory.length - MAX_HISTORY);
  }
}

export function rankStrategies(
  subsystem: string,
  maxRisk: number = 1.0
): RankedStrategy[] {
  const allStrategies: RepairStrategyId[] = [
    'cache_reset', 'health_recheck', 'circuit_breaker_reset',
    'event_buffer_drain', 'receipt_chain_rebuild',
  ];

  const ranked: RankedStrategy[] = [];

  for (const sid of allStrategies) {
    const rec = getOrCreateRecord(sid, subsystem);
    if (rec.riskLevel > maxRisk) continue;

    // Score = effectiveness * (1 - risk) * recency_bonus
    const recencyBonus = rec.lastUsed > 0
      ? Math.max(0.5, 1 - (Date.now() - rec.lastUsed) / (24 * 3600_000))
      : 0.7;

    const score = rec.successRate * (1 - rec.riskLevel) * recencyBonus;

    ranked.push({
      strategyId: sid,
      score: Math.round(score * 1000) / 1000,
      successRate: Math.round(rec.successRate * 100) / 100,
      riskLevel: rec.riskLevel,
    });
  }

  return ranked.sort((a, b) => b.score - a.score);
}

export function getBestStrategy(subsystem: string, maxRisk: number = 1.0): RepairStrategyId | null {
  const ranked = rankStrategies(subsystem, maxRisk);
  return ranked.length > 0 ? ranked[0].strategyId : null;
}

export function getStrategyStats(strategyId: RepairStrategyId, subsystem: string): StrategyRecord {
  return { ...getOrCreateRecord(strategyId, subsystem) };
}

export function getAllRecords(): StrategyRecord[] {
  return [...records.values()];
}

export function getOutcomeHistory(): RepairOutcome[] {
  return [...outcomeHistory];
}

export function clearOptimizerState(): void {
  records.clear();
  outcomeHistory.length = 0;
}
