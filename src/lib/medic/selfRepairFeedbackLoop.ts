/**
 * MEDIC — Self-Repair Feedback Loop
 * Closed-loop system tracking repair outcomes, updating strategy confidence,
 * and learning which repairs work for which failure signatures.
 * @module medic/selfRepairFeedbackLoop
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type RepairOutcome = 'success' | 'partial' | 'failed';

export interface RepairRecord {
  id: string;
  failureSignature: string;
  repairAction: string;
  nodeId: string;
  outcome: RepairOutcome;
  healthBefore: number;
  healthAfter: number;
  durationMs: number;
  timestamp: number;
}

export interface StrategyConfidence {
  failureSignature: string;
  repairAction: string;
  emaScore: number;        // 0–1
  totalAttempts: number;
  successCount: number;
  avgHealthImprovement: number;
}

export interface RecommendedStrategy {
  repairAction: string;
  confidence: number;
  attempts: number;
  avgImprovement: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const EMA_ALPHA = 0.3;
const MAX_RECORDS = 500;

// ── State ──────────────────────────────────────────────────────────────────

const records: RepairRecord[] = [];
const confidenceMap = new Map<string, StrategyConfidence>();
let idCounter = 0;

// ── Core ───────────────────────────────────────────────────────────────────

function confidenceKey(sig: string, action: string): string {
  return `${sig}::${action}`;
}

export function recordRepair(
  failureSignature: string,
  repairAction: string,
  nodeId: string,
  outcome: RepairOutcome,
  healthBefore: number,
  healthAfter: number,
  durationMs: number,
): RepairRecord {
  const record: RepairRecord = {
    id: `repair-${++idCounter}`,
    failureSignature,
    repairAction,
    nodeId,
    outcome,
    healthBefore,
    healthAfter,
    durationMs,
    timestamp: Date.now(),
  };

  records.push(record);
  if (records.length > MAX_RECORDS) records.splice(0, records.length - MAX_RECORDS);

  // Update confidence
  const key = confidenceKey(failureSignature, repairAction);
  const existing = confidenceMap.get(key);
  const outcomeScore = outcome === 'success' ? 1 : outcome === 'partial' ? 0.5 : 0;
  const improvement = healthAfter - healthBefore;

  if (existing) {
    existing.emaScore = EMA_ALPHA * outcomeScore + (1 - EMA_ALPHA) * existing.emaScore;
    existing.totalAttempts++;
    if (outcome === 'success') existing.successCount++;
    existing.avgHealthImprovement =
      EMA_ALPHA * improvement + (1 - EMA_ALPHA) * existing.avgHealthImprovement;
  } else {
    confidenceMap.set(key, {
      failureSignature,
      repairAction,
      emaScore: outcomeScore,
      totalAttempts: 1,
      successCount: outcome === 'success' ? 1 : 0,
      avgHealthImprovement: improvement,
    });
  }

  return record;
}

export function recommendStrategy(failureSignature: string): RecommendedStrategy[] {
  const candidates: RecommendedStrategy[] = [];

  for (const [, conf] of confidenceMap) {
    if (conf.failureSignature === failureSignature) {
      candidates.push({
        repairAction: conf.repairAction,
        confidence: Math.round(conf.emaScore * 100) / 100,
        attempts: conf.totalAttempts,
        avgImprovement: Math.round(conf.avgHealthImprovement * 100) / 100,
      });
    }
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);
}

export function getConfidenceMap(): StrategyConfidence[] {
  return Array.from(confidenceMap.values());
}

export function getRepairHistory(nodeId?: string): RepairRecord[] {
  const filtered = nodeId ? records.filter(r => r.nodeId === nodeId) : records;
  return [...filtered];
}

export function getStats() {
  const total = records.length;
  const successes = records.filter(r => r.outcome === 'success').length;
  const avgDuration = total > 0
    ? Math.round(records.reduce((s, r) => s + r.durationMs, 0) / total)
    : 0;

  return {
    totalRepairs: total,
    successRate: total > 0 ? Math.round((successes / total) * 100) : 0,
    avgDurationMs: avgDuration,
    uniqueSignatures: new Set(records.map(r => r.failureSignature)).size,
    uniqueStrategies: confidenceMap.size,
  };
}

export function resetFeedbackLoop(): void {
  records.length = 0;
  confidenceMap.clear();
  idCounter = 0;
}
