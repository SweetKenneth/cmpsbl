/**
 * S-Tier 196 — Mutation Rehearsal Engine
 * CJPI: 92 | Module: ECHO | ID: S-ECH03
 *
 * Rehearses mutations in isolation before applying them to
 * production. Tracks performance deltas, failure modes,
 * rollback safety, and historical verdict accuracy.
 */

export interface RehearsalInput {
  mutation: string;
  baselinePerf: number;
  mutatedPerf: number;
  failureModes: string[];
  rollbackCost?: number;
}

export interface RehearsalResult {
  id: string;
  mutation: string;
  performanceDelta: number;
  failureModes: string[];
  verdict: 'safe' | 'risky' | 'blocked';
  rollbackSafe: boolean;
  confidence: number;
  rehearsedAt: string;
}

export interface RehearsalStats {
  totalRehearsals: number;
  safeCount: number;
  riskyCount: number;
  blockedCount: number;
  avgDelta: number;
  verdictAccuracy: number;
}

export function createMutationRehearsalEngine() {
  const history: RehearsalResult[] = [];
  const outcomes: { id: string; actualSafe: boolean }[] = [];

  function rehearse(input: RehearsalInput): RehearsalResult {
    const delta = input.baselinePerf > 0
      ? (input.mutatedPerf - input.baselinePerf) / input.baselinePerf
      : 0;

    const failureWeight = input.failureModes.length;
    const verdict: RehearsalResult['verdict'] =
      failureWeight > 3 ? 'blocked' :
      failureWeight > 1 || delta < -0.15 ? 'risky' : 'safe';

    const rollbackSafe = (input.rollbackCost ?? 0) < input.baselinePerf * 0.1;
    const confidence = Math.min(0.98, Math.max(0.3,
      1 - failureWeight * 0.15 - Math.abs(delta) * 0.3
    ));

    const result: RehearsalResult = {
      id: `reh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mutation: input.mutation, performanceDelta: delta,
      failureModes: input.failureModes, verdict, rollbackSafe,
      confidence, rehearsedAt: new Date().toISOString(),
    };

    history.push(result);
    if (history.length > 500) history.shift();
    return result;
  }

  function recordOutcome(rehearsalId: string, actualSafe: boolean): void {
    outcomes.push({ id: rehearsalId, actualSafe });
  }

  function getSafeToApply(): string[] {
    return history.filter(r => r.verdict === 'safe').map(r => r.mutation);
  }

  function getHistory(limit: number = 50): RehearsalResult[] {
    return history.slice(-limit);
  }

  function getStats(): RehearsalStats {
    const deltas = history.map(r => r.performanceDelta);
    let correct = 0;
    for (const o of outcomes) {
      const reh = history.find(r => r.id === o.id);
      if (reh && ((reh.verdict === 'safe') === o.actualSafe)) correct++;
    }
    return {
      totalRehearsals: history.length,
      safeCount: history.filter(r => r.verdict === 'safe').length,
      riskyCount: history.filter(r => r.verdict === 'risky').length,
      blockedCount: history.filter(r => r.verdict === 'blocked').length,
      avgDelta: deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0,
      verdictAccuracy: outcomes.length > 0 ? correct / outcomes.length : 0,
    };
  }

  function reset(): void { history.length = 0; outcomes.length = 0; }

  return { rehearse, recordOutcome, getSafeToApply, getHistory, getStats, reset };
}
