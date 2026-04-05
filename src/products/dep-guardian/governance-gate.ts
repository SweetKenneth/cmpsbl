/**
 * DEP-GUARDIAN — Governance Gate (SOVEREIGN + CONSCIENCE primitives)
 * Pattern: CJ-148 Evolution Governance Engine
 *
 * Every upgrade must pass through this gate:
 *   1. SOVEREIGN: policy classification (license, blocked categories)
 *   2. CONSCIENCE: ethical preflight (supply-chain trust, data sovereignty)
 *   3. Risk threshold check
 *   4. Major version review gate
 */

import type {
  DetectedDepIssue,
  TriageResult,
  GovernancePolicy,
  GovernanceDecision,
  GovernanceVerdict,
} from './types';

// ── CONSCIENCE: Ethical Preflight ──────────────────────────────────────

function ethicalPreflight(issue: DetectedDepIssue): string[] {
  const flags: string[] = [];

  // Supply-chain trust: unknown licenses are an ethical risk
  if (issue.category === 'license_violation') {
    const risk = issue.metadata?.risk as string | undefined;
    if (risk === 'unknown') {
      flags.push('Unknown license origin — supply-chain trust unverifiable');
    }
    if (risk === 'proprietary') {
      flags.push('Proprietary dependency — data sovereignty risk');
    }
  }

  // Vulnerability with no patch: ethical obligation to disclose
  if (issue.category === 'vulnerability' && issue.severity === 'critical') {
    flags.push('Critical vulnerability — ethical obligation to remediate immediately');
  }

  return flags;
}

// ── SOVEREIGN: Policy Classification ───────────────────────────────────

function classifyByPolicy(
  issue: DetectedDepIssue,
  triage: TriageResult,
  policy: GovernancePolicy,
): { verdict: GovernanceVerdict; reason: string; policyRef: string } {
  // Blocked categories — hard deny
  if (policy.blockedCategories.includes(issue.category)) {
    return {
      verdict: 'deny',
      reason: `Category "${issue.category}" is blocked by governance policy`,
      policyRef: 'blockedCategories',
    };
  }

  // License violations with blocked licenses — hard deny
  if (issue.category === 'license_violation') {
    const license = issue.metadata?.license as string | undefined;
    if (license && policy.blockedLicenses.includes(license)) {
      return {
        verdict: 'deny',
        reason: `License "${license}" is explicitly blocked`,
        policyRef: 'blockedLicenses',
      };
    }
  }

  // Major version upgrades require review
  if (triage.suggestedStrategy === 'major' && policy.requireReviewForMajor) {
    return {
      verdict: 'review_required',
      reason: 'Major version upgrades require manual review',
      policyRef: 'requireReviewForMajor',
    };
  }

  // Risk exceeds auto-upgrade threshold
  if (triage.riskScore > policy.maxRiskForAuto) {
    return {
      verdict: 'review_required',
      reason: `Risk score ${triage.riskScore} exceeds auto-upgrade threshold ${policy.maxRiskForAuto}`,
      policyRef: 'maxRiskForAuto',
    };
  }

  // Auto-upgrade disabled
  if (!policy.allowAutoUpgrade) {
    return {
      verdict: 'review_required',
      reason: 'Auto-upgrade is disabled — all upgrades require review',
      policyRef: 'allowAutoUpgrade',
    };
  }

  return {
    verdict: 'approve',
    reason: 'Passed all governance checks',
    policyRef: 'default',
  };
}

// ── Gate Evaluator ─────────────────────────────────────────────────────

export function evaluateGovernance(
  issue: DetectedDepIssue,
  triage: TriageResult,
  policy: GovernancePolicy,
): GovernanceDecision {
  const ethicalFlags = policy.ethicalPreflight ? ethicalPreflight(issue) : [];
  const { verdict, reason, policyRef } = classifyByPolicy(issue, triage, policy);

  // CONSCIENCE override: ethical flags escalate to review
  const finalVerdict: GovernanceVerdict =
    ethicalFlags.length > 0 && verdict === 'approve' ? 'review_required' : verdict;

  const finalReason =
    ethicalFlags.length > 0 && verdict === 'approve'
      ? `Ethical preflight raised ${ethicalFlags.length} flag(s) — escalated to review`
      : reason;

  return {
    issueId: issue.id,
    verdict: finalVerdict,
    reason: finalReason,
    policyRef,
    ethicalFlags,
  };
}

export function evaluateAll(
  issues: DetectedDepIssue[],
  triageResults: TriageResult[],
  policy: GovernancePolicy,
): GovernanceDecision[] {
  const triageMap = new Map(triageResults.map(t => [t.issueId, t]));

  return issues.map(issue => {
    const triage = triageMap.get(issue.id);
    if (!triage) {
      return {
        issueId: issue.id,
        verdict: 'deny' as const,
        reason: 'No triage result found — cannot evaluate',
        policyRef: 'missing_triage',
        ethicalFlags: [],
      };
    }
    return evaluateGovernance(issue, triage, policy);
  });
}
