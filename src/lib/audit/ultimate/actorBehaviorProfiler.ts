/**
 * AUDIT — Actor Behavior Profiler
 * Builds behavioral fingerprints per actor tracking action frequency,
 * timing patterns, scope of changes, and baseline deviation.
 * @module audit/actorBehaviorProfiler
 * @version 9.0.0 — Sentinel
 */

import type { AuditReceipt, ReceiptType } from '../receipts';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ActorProfile {
  actor: string;
  totalActions: number;
  actionBreakdown: Partial<Record<ReceiptType, number>>;
  avgIntervalMs: number;
  minIntervalMs: number;
  firstSeen: number;
  lastSeen: number;
  activeDays: number;
  riskScore: number;          // 0–100
  anomalies: string[];
}

export interface BehaviorBaseline {
  actor: string;
  avgActionsPerHour: number;
  typicalTypes: ReceiptType[];
  typicalHours: number[];     // 0–23
  stdDevInterval: number;
}

// ── State ──────────────────────────────────────────────────────────────────

const baselines = new Map<string, BehaviorBaseline>();

// ── Core ───────────────────────────────────────────────────────────────────

export function profileActor(actor: string, receipts: AuditReceipt[]): ActorProfile {
  const actorReceipts = receipts.filter(r => r.actor === actor);

  if (actorReceipts.length === 0) {
    return {
      actor, totalActions: 0, actionBreakdown: {},
      avgIntervalMs: 0, minIntervalMs: 0,
      firstSeen: 0, lastSeen: 0, activeDays: 0,
      riskScore: 0, anomalies: [],
    };
  }

  const times = actorReceipts.map(r => new Date(r.timestamp).getTime()).sort((a, b) => a - b);
  const intervals: number[] = [];
  for (let i = 1; i < times.length; i++) {
    intervals.push(times[i] - times[i - 1]);
  }

  const breakdown: Partial<Record<ReceiptType, number>> = {};
  for (const r of actorReceipts) {
    breakdown[r.type] = (breakdown[r.type] ?? 0) + 1;
  }

  const uniqueDays = new Set(times.map(t => new Date(t).toDateString()));
  const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
  const minInterval = intervals.length > 0 ? Math.min(...intervals) : 0;

  // Risk scoring
  const anomalies: string[] = [];
  let riskScore = 0;

  // Rapid-fire actions
  if (minInterval < 100 && actorReceipts.length > 10) {
    riskScore += 25;
    anomalies.push('Rapid-fire actions detected (<100ms intervals)');
  }

  // Config changes by non-governor
  const configChanges = breakdown['config_change'] ?? 0;
  if (configChanges > 10 && actor !== 'governor' && actor !== 'system') {
    riskScore += 30;
    anomalies.push(`${configChanges} config changes by non-governor actor`);
  }

  // Unusual breadth of action types
  const typeCount = Object.keys(breakdown).length;
  if (typeCount >= 7) {
    riskScore += 15;
    anomalies.push(`Unusually broad action scope (${typeCount} types)`);
  }

  // Compare against baseline
  const baseline = baselines.get(actor);
  if (baseline) {
    const hoursSpan = (times[times.length - 1] - times[0]) / (3600 * 1000) || 1;
    const currentRate = actorReceipts.length / hoursSpan;
    if (currentRate > baseline.avgActionsPerHour * 3) {
      riskScore += 20;
      anomalies.push(`Action rate ${Math.round(currentRate)}/hr exceeds baseline ${Math.round(baseline.avgActionsPerHour)}/hr by 3x`);
    }
  }

  return {
    actor,
    totalActions: actorReceipts.length,
    actionBreakdown: breakdown,
    avgIntervalMs: Math.round(avgInterval),
    minIntervalMs: Math.round(minInterval),
    firstSeen: times[0],
    lastSeen: times[times.length - 1],
    activeDays: uniqueDays.size,
    riskScore: Math.min(100, riskScore),
    anomalies,
  };
}

export function profileAllActors(receipts: AuditReceipt[]): ActorProfile[] {
  const actors = [...new Set(receipts.map(r => r.actor))];
  return actors.map(a => profileActor(a, receipts)).sort((a, b) => b.riskScore - a.riskScore);
}

export function updateBaseline(actor: string, receipts: AuditReceipt[]): BehaviorBaseline {
  const actorReceipts = receipts.filter(r => r.actor === actor);
  const times = actorReceipts.map(r => new Date(r.timestamp).getTime()).sort((a, b) => a - b);
  const hours = actorReceipts.map(r => new Date(r.timestamp).getHours());
  const types = [...new Set(actorReceipts.map(r => r.type))];

  const hoursSpan = times.length >= 2 ? (times[times.length - 1] - times[0]) / (3600 * 1000) : 1;
  const intervals: number[] = [];
  for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
  const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
  const variance = intervals.length > 1
    ? intervals.reduce((s, v) => s + (v - avgInterval) ** 2, 0) / (intervals.length - 1)
    : 0;

  const baseline: BehaviorBaseline = {
    actor,
    avgActionsPerHour: Math.round((actorReceipts.length / hoursSpan) * 100) / 100,
    typicalTypes: types,
    typicalHours: [...new Set(hours)].sort((a, b) => a - b),
    stdDevInterval: Math.round(Math.sqrt(variance)),
  };

  baselines.set(actor, baseline);
  return baseline;
}

export function getBaseline(actor: string): BehaviorBaseline | undefined {
  return baselines.get(actor);
}

export function resetProfiles(): void {
  baselines.clear();
}
