/**
 * Evolution Promotion Rules — Two-man rule + evidence gates
 */

import type { ConfidenceResult } from './confidence';
import type { EvidenceBundle } from './evidence';
import { validateEvidenceBundle } from './evidence';

export interface PromotionDecision {
  allowed: boolean;
  reason: string;
  requires_governor_approval: boolean;
  requires_second_reviewer: boolean;
  confidence: ConfidenceResult;
  evidence_valid: boolean;
}

const AUTO_PROMOTE_THRESHOLD = 0.80;

/** Evaluate whether a proposal can be promoted */
export function evaluatePromotion(
  confidence: ConfidenceResult,
  evidence: EvidenceBundle
): PromotionDecision {
  const evidenceValidation = validateEvidenceBundle(evidence);

  // Evidence must be valid
  if (!evidenceValidation.valid) {
    return {
      allowed: false,
      reason: `Evidence bundle invalid: ${evidenceValidation.errors.join(', ')}`,
      requires_governor_approval: false,
      requires_second_reviewer: false,
      confidence,
      evidence_valid: false,
    };
  }

  // Critical class: NEVER auto-promote, always require two-man rule
  if (confidence.requires_two_man) {
    return {
      allowed: false, // blocked until governor + second reviewer approve
      reason: 'Critical class: requires governor approval + second reviewer signature',
      requires_governor_approval: true,
      requires_second_reviewer: true,
      confidence,
      evidence_valid: true,
    };
  }

  // Below threshold: blocked
  if (confidence.final_score < AUTO_PROMOTE_THRESHOLD) {
    return {
      allowed: false,
      reason: `Confidence ${confidence.final_score.toFixed(2)} below threshold ${AUTO_PROMOTE_THRESHOLD}`,
      requires_governor_approval: false,
      requires_second_reviewer: false,
      confidence,
      evidence_valid: true,
    };
  }

  // Above threshold + non-critical + valid evidence → auto-promote allowed
  return {
    allowed: true,
    reason: `Confidence ${confidence.final_score.toFixed(2)} >= ${AUTO_PROMOTE_THRESHOLD}, evidence valid, non-critical class`,
    requires_governor_approval: false,
    requires_second_reviewer: false,
    confidence,
    evidence_valid: true,
  };
}
