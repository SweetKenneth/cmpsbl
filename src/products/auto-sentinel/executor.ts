/**
 * AUTO-SENTINEL — Executor Module
 * Pattern: CJ-120 Autonomous Ops Steward + Immune System
 *
 * Applies approved fixes with rollback safety.
 * Every fix is wrapped in an immune envelope:
 *   pre-snapshot → apply → verify → commit or rollback
 */

import type {
  DetectedIssue,
  TriageResult,
  GovernanceDecision,
  FixAttempt,
  FixStrategy,
} from './types';

// ── Fix Handler Registry ───────────────────────────────────────────────

type FixHandler = (issue: DetectedIssue, triage: TriageResult) => {
  success: boolean;
  preHash: string;
  postHash: string;
  error?: string;
};

const handlers = new Map<FixStrategy, FixHandler>();

/**
 * Register a fix handler for a given strategy.
 * This is the extension point — consumers wire in real file-system
 * operations, AST transforms, or config updaters here.
 */
export function registerFixHandler(strategy: FixStrategy, handler: FixHandler): void {
  handlers.set(strategy, handler);
}

// ── Immune Wrapper ─────────────────────────────────────────────────────

/**
 * Wraps fix execution in safety envelope:
 * 1. Pre-snapshot (state before fix)
 * 2. Execute handler
 * 3. Post-snapshot (state after fix)
 * 4. Verify (handler reports success/failure)
 * 5. If failed → rollback available
 */
export function executeFix(
  issue: DetectedIssue,
  triage: TriageResult,
  governance: GovernanceDecision,
): FixAttempt {
  const start = performance.now();

  // Only execute approved fixes
  if (governance.verdict !== 'approve') {
    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      strategy: triage.suggestedStrategy,
      outcome: governance.verdict === 'deny' ? 'skipped_governance' : 'skipped_risk',
      rollbackAvailable: false,
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
    };
  }

  const handler = handlers.get(triage.suggestedStrategy);

  // No handler registered for this strategy
  if (!handler) {
    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      strategy: triage.suggestedStrategy,
      outcome: 'skipped_risk',
      rollbackAvailable: false,
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
      error: `No fix handler registered for strategy "${triage.suggestedStrategy}"`,
    };
  }

  // Execute within immune envelope
  try {
    const result = handler(issue, triage);

    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      strategy: triage.suggestedStrategy,
      outcome: result.success ? 'applied' : 'failed',
      rollbackAvailable: true,
      preSnapshot: result.preHash,
      postSnapshot: result.postHash,
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
      error: result.error,
    };
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      strategy: triage.suggestedStrategy,
      outcome: 'failed',
      rollbackAvailable: false,
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Batch Executor ─────────────────────────────────────────────────────

export function executeAll(
  issues: DetectedIssue[],
  triageResults: TriageResult[],
  decisions: GovernanceDecision[],
): FixAttempt[] {
  const triageMap = new Map(triageResults.map(t => [t.issueId, t]));
  const decisionMap = new Map(decisions.map(d => [d.issueId, d]));

  return issues
    .map(issue => {
      const triage = triageMap.get(issue.id);
      const decision = decisionMap.get(issue.id);
      if (!triage || !decision) return null;
      return executeFix(issue, triage, decision);
    })
    .filter((f): f is FixAttempt => f !== null);
}
