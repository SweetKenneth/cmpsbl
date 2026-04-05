/**
 * AUTO-SENTINEL — Governance Gate
 * Primitives: GOVERNANCE + CONSCIENCE
 *
 * Determines whether an auto-fix should be applied, denied,
 * or flagged for human review. This is the ethical checkpoint
 * that prevents autonomous damage.
 */

import type {
  DetectedIssue,
  TriageResult,
  GovernanceDecision,
  GovernancePolicy,
  GovernanceVerdict,
  IssueSeverity,
} from './types';

// ── Severity Ordering ──────────────────────────────────────────────────

const SEVERITY_ORDER: Record<IssueSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function severityExceedsMax(severity: IssueSeverity, max: IssueSeverity): boolean {
  return SEVERITY_ORDER[severity] > SEVERITY_ORDER[max];
}

// ── Governance Gate ────────────────────────────────────────────────────

export function evaluateGovernance(
  issue: DetectedIssue,
  triage: TriageResult,
  policy: GovernancePolicy,
  currentFixCount: number,
): GovernanceDecision {
  const reasons: string[] = [];
  let verdict: GovernanceVerdict = 'approve';

  // Gate 1: Max fixes per run
  if (currentFixCount >= policy.maxAutoFixesPerRun) {
    verdict = 'deny';
    reasons.push(`Fix cap reached (${policy.maxAutoFixesPerRun}/${policy.maxAutoFixesPerRun}).`);
  }

  // Gate 2: Severity ceiling
  if (severityExceedsMax(issue.severity, policy.maxAutoFixSeverity)) {
    verdict = 'deny';
    reasons.push(`Severity "${issue.severity}" exceeds auto-fix ceiling "${policy.maxAutoFixSeverity}".`);
  }

  // Gate 3: Blocked categories
  if (policy.blockedCategories.includes(issue.category)) {
    verdict = 'deny';
    reasons.push(`Category "${issue.category}" is blocked from auto-fix.`);
  }

  // Gate 4: Not auto-fixable per triage
  if (!triage.autoFixable) {
    verdict = 'deny';
    reasons.push('Triage determined issue is not auto-fixable.');
  }

  // Gate 5: Confidence floor
  if (triage.confidence < policy.minConfidenceForAutoFix) {
    verdict = verdict === 'approve' ? 'review_required' : verdict;
    reasons.push(`Confidence ${triage.confidence}% below minimum ${policy.minConfidenceForAutoFix}%.`);
  }

  // Gate 6: Risk ceiling
  if (triage.riskScore > policy.maxRiskForAutoFix) {
    verdict = verdict === 'approve' ? 'review_required' : verdict;
    reasons.push(`Risk ${triage.riskScore} exceeds auto-fix maximum ${policy.maxRiskForAutoFix}.`);
  }

  // Gate 7: Review threshold (CONSCIENCE pre-flight)
  if (triage.riskScore > policy.requireReviewAboveRisk && verdict === 'approve') {
    verdict = 'review_required';
    reasons.push(`Risk ${triage.riskScore} exceeds review threshold ${policy.requireReviewAboveRisk}.`);
  }

  // Approved path
  if (verdict === 'approve') {
    reasons.push('All governance gates passed. Auto-fix authorized.');
  }

  return {
    issueId: issue.id,
    verdict,
    reason: reasons.join(' '),
    riskScore: triage.riskScore,
    confidenceThreshold: policy.minConfidenceForAutoFix,
    decidedAt: new Date().toISOString(),
  };
}

// ── Batch Evaluation ───────────────────────────────────────────────────

export function evaluateAll(
  issues: DetectedIssue[],
  triageResults: TriageResult[],
  policy: GovernancePolicy,
): GovernanceDecision[] {
  const triageMap = new Map(triageResults.map(t => [t.issueId, t]));
  const decisions: GovernanceDecision[] = [];
  let fixCount = 0;

  for (const issue of issues) {
    const triage = triageMap.get(issue.id);
    if (!triage) {
      decisions.push({
        issueId: issue.id,
        verdict: 'deny',
        reason: 'No triage result found for issue.',
        riskScore: 100,
        confidenceThreshold: policy.minConfidenceForAutoFix,
        decidedAt: new Date().toISOString(),
      });
      continue;
    }

    const decision = evaluateGovernance(issue, triage, policy, fixCount);
    decisions.push(decision);

    if (decision.verdict === 'approve') {
      fixCount++;
    }
  }

  return decisions;
}
