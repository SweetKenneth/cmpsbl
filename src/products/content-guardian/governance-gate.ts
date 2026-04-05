/**
 * CONTENT-GUARDIAN — Governance Gate (GOVERNANCE + CONSCIENCE)
 * Pattern: CJ-148 Evolution Governance Engine
 *
 * Every remediation must pass:
 *   1. GOVERNANCE: policy checks (blocked categories, quality floor)
 *   2. CONSCIENCE: ethical preflight (brand integrity, audience trust)
 */

import type {
  DetectedContentIssue,
  ContentTriageResult,
  ContentGovernancePolicy,
  ContentGovernanceDecision,
  GovernanceVerdict,
} from './types';

function ethicalPreflight(issue: DetectedContentIssue): string[] {
  const flags: string[] = [];

  if (issue.category === 'nsfw_detected') {
    flags.push('NSFW content — audience trust and brand integrity at risk');
  }
  if (issue.category === 'audience_mismatch') {
    flags.push('Content targets inappropriate audience — ethical targeting concern');
  }
  if (issue.category === 'ad_regulation_violation') {
    flags.push('Missing ad disclosure — consumer transparency obligation');
  }
  if (issue.category === 'copyright_violation') {
    flags.push('Potential copyright infringement — intellectual property ethics');
  }

  return flags;
}

function classifyByPolicy(
  issue: DetectedContentIssue,
  triage: ContentTriageResult,
  policy: ContentGovernancePolicy,
): { verdict: GovernanceVerdict; reason: string; policyRef: string } {
  if (policy.blockedCategories.includes(issue.category)) {
    return {
      verdict: 'deny',
      reason: `Category "${issue.category}" is blocked by governance policy`,
      policyRef: 'blockedCategories',
    };
  }

  // Hard block for severity 'block'
  if (issue.severity === 'block') {
    return {
      verdict: 'deny',
      reason: 'Content flagged with block severity — publish denied',
      policyRef: 'severity_block',
    };
  }

  // Ads require review
  if (
    (issue.category === 'ad_regulation_violation' || issue.category === 'trademark_conflict') &&
    policy.requireReviewForAds
  ) {
    return {
      verdict: 'review_required',
      reason: 'Ad/trademark issues require manual review',
      policyRef: 'requireReviewForAds',
    };
  }

  if (triage.riskScore > policy.maxRiskForAuto) {
    return {
      verdict: 'review_required',
      reason: `Risk score ${triage.riskScore} exceeds auto-remediation threshold ${policy.maxRiskForAuto}`,
      policyRef: 'maxRiskForAuto',
    };
  }

  if (!policy.allowAutoCorrect) {
    return {
      verdict: 'review_required',
      reason: 'Auto-correct disabled — all remediations require review',
      policyRef: 'allowAutoCorrect',
    };
  }

  return {
    verdict: 'approve',
    reason: 'Passed all governance checks',
    policyRef: 'default',
  };
}

export function evaluateGovernance(
  issue: DetectedContentIssue,
  triage: ContentTriageResult,
  policy: ContentGovernancePolicy,
): ContentGovernanceDecision {
  const ethicalFlags = policy.ethicalPreflight ? ethicalPreflight(issue) : [];
  const { verdict, reason, policyRef } = classifyByPolicy(issue, triage, policy);

  const finalVerdict: GovernanceVerdict =
    ethicalFlags.length > 0 && verdict === 'approve' ? 'review_required' : verdict;

  const finalReason =
    ethicalFlags.length > 0 && verdict === 'approve'
      ? `Ethical preflight raised ${ethicalFlags.length} flag(s) — escalated to review`
      : reason;

  return { issueId: issue.id, verdict: finalVerdict, reason: finalReason, policyRef, ethicalFlags };
}

export function evaluateAll(
  issues: DetectedContentIssue[],
  triageResults: ContentTriageResult[],
  policy: ContentGovernancePolicy,
): ContentGovernanceDecision[] {
  const triageMap = new Map(triageResults.map(t => [t.issueId, t]));

  return issues.map(issue => {
    const triage = triageMap.get(issue.id);
    if (!triage) {
      return {
        issueId: issue.id,
        verdict: 'deny' as const,
        reason: 'No triage result — cannot evaluate',
        policyRef: 'missing_triage',
        ethicalFlags: [],
      };
    }
    return evaluateGovernance(issue, triage, policy);
  });
}
