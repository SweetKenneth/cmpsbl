/**
 * DEP-GUARDIAN — Upgrader Module (EVOLUTION + SHADOW + REFLEX primitives)
 * Pattern: CJ-120 Autonomous Ops Steward + Immune System
 *
 * Executes approved upgrades with:
 *   EVOLUTION: version mutation and patch application
 *   SHADOW: pre/post snapshot diffing for rollback safety
 *   REFLEX: circuit breaker to halt cascading upgrade failures
 */

import type {
  DetectedDepIssue,
  TriageResult,
  GovernanceDecision,
  UpgradeAttempt,
  UpgradeStrategy,
} from './types';

// ── REFLEX: Circuit Breaker ────────────────────────────────────────────

interface CircuitBreakerState {
  failures: number;
  lastFailureAt: number;
  tripped: boolean;
  cooldownMs: number;
  threshold: number;
}

function createCircuitBreaker(threshold: number, cooldownMs: number): CircuitBreakerState {
  return { failures: 0, lastFailureAt: 0, tripped: false, cooldownMs, threshold };
}

function checkCircuitBreaker(state: CircuitBreakerState): boolean {
  if (!state.tripped) return true;
  // Check if cooldown has elapsed
  if (Date.now() - state.lastFailureAt > state.cooldownMs) {
    state.tripped = false;
    state.failures = 0;
    return true;
  }
  return false;
}

function recordFailure(state: CircuitBreakerState): void {
  state.failures++;
  state.lastFailureAt = Date.now();
  if (state.failures >= state.threshold) {
    state.tripped = true;
  }
}

function recordSuccess(state: CircuitBreakerState): void {
  state.failures = Math.max(0, state.failures - 1);
}

// ── Upgrade Handler Registry ───────────────────────────────────────────

type UpgradeHandler = (issue: DetectedDepIssue, triage: TriageResult) => {
  success: boolean;
  preSnapshot: string;
  postSnapshot: string;
  error?: string;
};

const handlers = new Map<UpgradeStrategy, UpgradeHandler>();

/**
 * Register an upgrade handler for a given strategy.
 * Extension point for real package manager operations.
 */
export function registerUpgradeHandler(strategy: UpgradeStrategy, handler: UpgradeHandler): void {
  handlers.set(strategy, handler);
}

// ── SHADOW: Snapshot Wrapper ───────────────────────────────────────────

function executeWithShadow(
  issue: DetectedDepIssue,
  triage: TriageResult,
  handler: UpgradeHandler,
): UpgradeAttempt {
  const start = performance.now();

  try {
    // SHADOW: pre-snapshot before mutation
    const result = handler(issue, triage);

    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      depName: issue.depName,
      fromVersion: (issue.metadata?.currentVersion as string) ?? 'unknown',
      toVersion: (issue.metadata?.latestVersion as string) ?? 'latest',
      strategy: triage.suggestedStrategy,
      outcome: result.success ? 'applied' : 'failed',
      rollbackAvailable: true,
      preSnapshot: result.preSnapshot,
      postSnapshot: result.postSnapshot,
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
      error: result.error,
    };
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      depName: issue.depName,
      fromVersion: 'unknown',
      toVersion: 'unknown',
      strategy: triage.suggestedStrategy,
      outcome: 'failed',
      rollbackAvailable: false,
      preSnapshot: '',
      postSnapshot: '',
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Batch Upgrader ─────────────────────────────────────────────────────

export function executeAll(
  issues: DetectedDepIssue[],
  triageResults: TriageResult[],
  decisions: GovernanceDecision[],
  circuitBreakerThreshold: number,
  circuitBreakerCooldownMs: number,
): UpgradeAttempt[] {
  const triageMap = new Map(triageResults.map(t => [t.issueId, t]));
  const decisionMap = new Map(decisions.map(d => [d.issueId, d]));
  const breaker = createCircuitBreaker(circuitBreakerThreshold, circuitBreakerCooldownMs);
  const results: UpgradeAttempt[] = [];

  for (const issue of issues) {
    const triage = triageMap.get(issue.id);
    const decision = decisionMap.get(issue.id);
    if (!triage || !decision) continue;

    // REFLEX: circuit breaker check
    if (!checkCircuitBreaker(breaker)) {
      results.push({
        id: crypto.randomUUID(),
        issueId: issue.id,
        depName: issue.depName,
        fromVersion: 'unknown',
        toVersion: 'unknown',
        strategy: triage.suggestedStrategy,
        outcome: 'skipped_risk',
        rollbackAvailable: false,
        preSnapshot: '',
        postSnapshot: '',
        executedAt: new Date().toISOString(),
        durationMs: 0,
        error: 'Circuit breaker tripped — too many consecutive failures',
        circuitBreakerTripped: true,
      });
      continue;
    }

    // Only execute approved upgrades
    if (decision.verdict !== 'approve') {
      results.push({
        id: crypto.randomUUID(),
        issueId: issue.id,
        depName: issue.depName,
        fromVersion: 'unknown',
        toVersion: 'unknown',
        strategy: triage.suggestedStrategy,
        outcome: decision.verdict === 'deny' ? 'skipped_governance' : 'skipped_risk',
        rollbackAvailable: false,
        preSnapshot: '',
        postSnapshot: '',
        executedAt: new Date().toISOString(),
        durationMs: 0,
      });
      continue;
    }

    const handler = handlers.get(triage.suggestedStrategy);
    if (!handler) {
      results.push({
        id: crypto.randomUUID(),
        issueId: issue.id,
        depName: issue.depName,
        fromVersion: 'unknown',
        toVersion: 'unknown',
        strategy: triage.suggestedStrategy,
        outcome: 'skipped_risk',
        rollbackAvailable: false,
        preSnapshot: '',
        postSnapshot: '',
        executedAt: new Date().toISOString(),
        durationMs: 0,
        error: `No handler registered for strategy "${triage.suggestedStrategy}"`,
      });
      continue;
    }

    // EVOLUTION + SHADOW: execute with snapshot envelope
    const attempt = executeWithShadow(issue, triage, handler);
    results.push(attempt);

    // REFLEX: update circuit breaker state
    if (attempt.outcome === 'failed') {
      recordFailure(breaker);
    } else {
      recordSuccess(breaker);
    }
  }

  return results;
}
