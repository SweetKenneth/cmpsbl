/**
 * PROMPT-SHIELD — Governance Gate
 * Primitives: GOVERNANCE (policy enforcement), CONSCIENCE (ethical review), COMPASS (confidence weighting)
 *
 * Evaluates detected threats against policy and produces
 * actionable governance decisions for each threat.
 */

import type {
  DetectedThreat,
  GovernancePolicy,
  GovernanceDecision,
  GovernanceVerdict,
  DefenseAction,
  ThreatSeverity,
  GroundingReport,
} from './types';

// ── Severity Ordering ──────────────────────────────────────────────────

const SEVERITY_RANK: Record<ThreatSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

// ── Governance Engine ──────────────────────────────────────────────────

/**
 * Evaluate all threats against governance policy (GOVERNANCE + CONSCIENCE).
 * Applies COMPASS confidence weighting to reduce false positive actions.
 */
export function evaluateThreats(
  threats: readonly DetectedThreat[],
  groundingReport: GroundingReport | null,
  policy: GovernancePolicy,
): GovernanceDecision[] {
  const decisions: GovernanceDecision[] = [];

  for (const threat of threats) {
    decisions.push(evaluateSingleThreat(threat, policy));
  }

  // Hallucination governance — if grounding report exists
  if (groundingReport && groundingReport.hallucinatedClaims > 0) {
    const hallucinationRate = groundingReport.hallucinatedClaims / Math.max(1, groundingReport.totalClaims);

    if (hallucinationRate > policy.maxHallucinationRate) {
      decisions.push({
        threatId: `hallucination-${groundingReport.outputId}`,
        verdict: 'deny',
        action: 'flag',
        reason: `Hallucination rate ${(hallucinationRate * 100).toFixed(1)}% exceeds policy maximum ${(policy.maxHallucinationRate * 100).toFixed(1)}%`,
        policyRef: 'governance.maxHallucinationRate',
        overrideApplied: false,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return decisions;
}

function evaluateSingleThreat(
  threat: DetectedThreat,
  policy: GovernancePolicy,
): GovernanceDecision {
  const timestamp = new Date().toISOString();

  // COMPASS confidence gate — low confidence threats get monitored, not blocked
  if (threat.confidence < policy.minConfidenceToBlock) {
    return {
      threatId: threat.id,
      verdict: 'approve',
      action: 'allow_monitored',
      reason: `Confidence ${(threat.confidence * 100).toFixed(0)}% below blocking threshold ${(policy.minConfidenceToBlock * 100).toFixed(0)}%`,
      policyRef: 'compass.minConfidenceToBlock',
      overrideApplied: false,
      timestamp,
    };
  }

  // CONSCIENCE — certain categories always require human review
  if (policy.requireReviewCategories.includes(threat.category)) {
    return {
      threatId: threat.id,
      verdict: 'review_required',
      action: 'quarantine',
      reason: `Category '${threat.category}' requires human review per CONSCIENCE policy`,
      policyRef: 'conscience.requireReviewCategories',
      overrideApplied: false,
      timestamp,
    };
  }

  // Auto-block based on severity threshold
  const threatRank = SEVERITY_RANK[threat.severity];
  const autoBlockRank = SEVERITY_RANK[policy.maxSeverityAutoBlock];

  if (threatRank >= autoBlockRank) {
    const action = determineAction(threat);
    return {
      threatId: threat.id,
      verdict: 'deny',
      action,
      reason: `Severity '${threat.severity}' meets auto-block threshold '${policy.maxSeverityAutoBlock}'`,
      policyRef: 'governance.maxSeverityAutoBlock',
      overrideApplied: false,
      timestamp,
    };
  }

  // Monitored categories — allow but flag
  if (policy.allowMonitoredCategories.includes(threat.category)) {
    return {
      threatId: threat.id,
      verdict: 'approve',
      action: 'allow_monitored',
      reason: `Category '${threat.category}' is in monitored-allow list`,
      policyRef: 'governance.allowMonitoredCategories',
      overrideApplied: false,
      timestamp,
    };
  }

  // Default: flag for review
  return {
    threatId: threat.id,
    verdict: 'review_required',
    action: 'flag',
    reason: `No explicit policy match — defaulting to review`,
    policyRef: 'governance.default',
    overrideApplied: false,
    timestamp,
  };
}

/**
 * Determine the appropriate defense action based on threat category.
 */
function determineAction(threat: DetectedThreat): DefenseAction {
  switch (threat.category) {
    case 'prompt_injection':
    case 'jailbreak_attempt':
    case 'instruction_override':
      return 'block';
    case 'data_exfiltration':
      return 'sanitize';
    case 'encoding_attack':
    case 'token_smuggling':
      return 'sanitize';
    case 'social_engineering':
      return 'flag';
    case 'hallucination':
      return 'rewrite';
    case 'context_poisoning':
      return 'quarantine';
    case 'output_manipulation':
      return 'block';
    default:
      return 'flag';
  }
}
