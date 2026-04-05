/**
 * CONTENT-GUARDIAN — Remediator (SHADOW primitive)
 * Applies approved remediations with pre/post snapshot comparison.
 */

import type {
  DetectedContentIssue,
  ContentTriageResult,
  ContentGovernanceDecision,
  RemediationAttempt,
  RemediationStrategy,
} from './types';

type RemediationHandler = (issue: DetectedContentIssue, triage: ContentTriageResult) => {
  success: boolean;
  preSnapshot: string;
  postSnapshot: string;
  suggestion?: string;
  error?: string;
};

const handlers = new Map<RemediationStrategy, RemediationHandler>();

export function registerRemediationHandler(
  strategy: RemediationStrategy,
  handler: RemediationHandler,
): void {
  handlers.set(strategy, handler);
}

function executeRemediation(
  issue: DetectedContentIssue,
  triage: ContentTriageResult,
  decision: ContentGovernanceDecision,
): RemediationAttempt {
  const start = performance.now();

  if (decision.verdict !== 'approve') {
    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      contentId: issue.contentId,
      strategy: triage.suggestedStrategy,
      outcome: decision.verdict === 'deny' ? 'blocked' : 'skipped_governance',
      preSnapshot: '',
      postSnapshot: '',
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
    };
  }

  const handler = handlers.get(triage.suggestedStrategy);
  if (!handler) {
    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      contentId: issue.contentId,
      strategy: triage.suggestedStrategy,
      outcome: 'skipped_risk',
      preSnapshot: '',
      postSnapshot: '',
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
      error: `No handler for strategy "${triage.suggestedStrategy}"`,
    };
  }

  try {
    const result = handler(issue, triage);
    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      contentId: issue.contentId,
      strategy: triage.suggestedStrategy,
      outcome: result.success ? 'corrected' : 'failed',
      preSnapshot: result.preSnapshot,
      postSnapshot: result.postSnapshot,
      suggestion: result.suggestion,
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
      error: result.error,
    };
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      issueId: issue.id,
      contentId: issue.contentId,
      strategy: triage.suggestedStrategy,
      outcome: 'failed',
      preSnapshot: '',
      postSnapshot: '',
      executedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function executeAll(
  issues: DetectedContentIssue[],
  triageResults: ContentTriageResult[],
  decisions: ContentGovernanceDecision[],
): RemediationAttempt[] {
  const triageMap = new Map(triageResults.map(t => [t.issueId, t]));
  const decisionMap = new Map(decisions.map(d => [d.issueId, d]));

  return issues
    .map(issue => {
      const triage = triageMap.get(issue.id);
      const decision = decisionMap.get(issue.id);
      if (!triage || !decision) return null;
      return executeRemediation(issue, triage, decision);
    })
    .filter((r): r is RemediationAttempt => r !== null);
}
