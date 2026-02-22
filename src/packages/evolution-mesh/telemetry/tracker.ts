/**
 * Evolution Mesh — Telemetry Tracker
 * Local outcome tracking. Optionally reports to SaaS dashboard.
 */

import { getConfig } from '../config';

export type OutcomeType = 'success' | 'safe_fail' | 'repaired_success' | 'escalated';

export interface OutcomeRecord {
  fnName: string;
  outcome: OutcomeType;
  durationMs: number;
  archetype?: string;
  repairType?: string;
  repairAttempted?: boolean;
  error?: string;
  timestamp: number;
}

export interface MeshMetrics {
  totalExecutions: number;
  successRate: number;
  repairRate: number;
  safeFails: number;
  escalations: number;
  avgDurationMs: number;
  byFunction: Map<string, {
    total: number;
    successes: number;
    repairs: number;
    safeFails: number;
    escalations: number;
  }>;
}

const outcomes: OutcomeRecord[] = [];
const MAX_OUTCOMES = 10_000;

export function recordOutcome(
  fnName: string,
  outcome: OutcomeType,
  durationMs: number,
  meta?: Partial<Omit<OutcomeRecord, 'fnName' | 'outcome' | 'durationMs' | 'timestamp'>>,
): void {
  const record: OutcomeRecord = {
    fnName,
    outcome,
    durationMs,
    timestamp: Date.now(),
    ...meta,
  };

  outcomes.push(record);
  if (outcomes.length > MAX_OUTCOMES) {
    outcomes.splice(0, outcomes.length - MAX_OUTCOMES);
  }

  // Optional: report to SaaS
  const config = getConfig();
  if (config.telemetryEndpoint && config.apiKey) {
    reportToSaaS(record, config.telemetryEndpoint, config.apiKey).catch(() => {
      // Silent fail — telemetry must never block execution
    });
  }
}

async function reportToSaaS(record: OutcomeRecord, endpoint: string, apiKey: string): Promise<void> {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(record),
    });
  } catch {
    // Never throw from telemetry
  }
}

export function getMetrics(): MeshMetrics {
  const byFunction = new Map<string, { total: number; successes: number; repairs: number; safeFails: number; escalations: number }>();

  let totalDuration = 0;
  let successes = 0;
  let repairs = 0;
  let safeFails = 0;
  let escalations = 0;

  for (const o of outcomes) {
    totalDuration += o.durationMs;

    if (!byFunction.has(o.fnName)) {
      byFunction.set(o.fnName, { total: 0, successes: 0, repairs: 0, safeFails: 0, escalations: 0 });
    }
    const fn = byFunction.get(o.fnName)!;
    fn.total++;

    switch (o.outcome) {
      case 'success': successes++; fn.successes++; break;
      case 'repaired_success': repairs++; fn.repairs++; break;
      case 'safe_fail': safeFails++; fn.safeFails++; break;
      case 'escalated': escalations++; fn.escalations++; break;
    }
  }

  const total = outcomes.length;
  return {
    totalExecutions: total,
    successRate: total > 0 ? (successes + repairs) / total : 0,
    repairRate: total > 0 ? repairs / total : 0,
    safeFails,
    escalations,
    avgDurationMs: total > 0 ? totalDuration / total : 0,
    byFunction,
  };
}
