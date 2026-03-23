/**
 * IMMUNITY Ultimate — Cytokine Storm Preventer
 * 
 * Prevents immune overreaction that damages healthy systems.
 * - Immune response rate limiter (max concurrent responses)
 * - Collateral damage estimator: blast radius scoring
 * - Proportionality engine: scales response to match threat level
 * - Auto-dampening: halts if immune actions cause more errors than the threat
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ImmuneResponse {
  id: string;
  threatSeverity: number;       // 1–10
  responseSeverity: number;     // 1–10 (should match threat)
  affectedNodes: string[];
  startedAt: number;
  completedAt: number | null;
  collateralDamage: number;     // 0–1
  dampened: boolean;
}

export interface ProportionalityAssessment {
  threatLevel: number;
  recommendedResponseLevel: number;
  maxAffectedNodes: number;
  blastRadiusScore: number;     // 0–1
  approved: boolean;
  reason: string;
}

export interface CytokineStormHealth {
  activeResponses: number;
  maxConcurrent: number;
  totalResponses: number;
  dampenedCount: number;
  avgCollateralDamage: number;
  proportionalityScore: number; // 0–1
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const MAX_CONCURRENT_RESPONSES = 5;
const COLLATERAL_THRESHOLD = 0.3;     // auto-dampen above 30% collateral
const EMA_ALPHA = 0.2;

const activeResponses = new Map<string, ImmuneResponse>();
const responseHistory: ImmuneResponse[] = [];
let totalResponses = 0;
let dampenedCount = 0;
let avgCollateralEma = 0;
let proportionalityEma = 1.0;

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Assess proportionality before launching an immune response */
export function assessProportionality(
  threatSeverity: number,
  proposedResponseSeverity: number,
  affectedNodeCount: number,
  totalNodes: number,
): ProportionalityAssessment {
  const blastRadius = totalNodes > 0 ? affectedNodeCount / totalNodes : 0;
  const severityRatio = threatSeverity > 0 ? proposedResponseSeverity / threatSeverity : 1;

  // Response should not be more than 1.5x the threat
  const proportional = severityRatio <= 1.5;
  // Blast radius should not exceed threat severity ratio
  const blastOk = blastRadius <= (threatSeverity / 10) * 0.5;
  // Concurrency check
  const capacityOk = activeResponses.size < MAX_CONCURRENT_RESPONSES;

  const approved = proportional && blastOk && capacityOk;
  const recommendedLevel = Math.min(10, Math.ceil(threatSeverity * 1.2));

  let reason = 'approved';
  if (!capacityOk) reason = 'max_concurrent_responses_reached';
  else if (!proportional) reason = `disproportionate_response (${severityRatio.toFixed(1)}x threat)`;
  else if (!blastOk) reason = `blast_radius_too_large (${(blastRadius * 100).toFixed(0)}%)`;

  return {
    threatLevel: threatSeverity,
    recommendedResponseLevel: recommendedLevel,
    maxAffectedNodes: Math.ceil(totalNodes * (threatSeverity / 10) * 0.5),
    blastRadiusScore: Math.round(blastRadius * 100) / 100,
    approved,
    reason,
  };
}

/** Start tracking an immune response */
export function startResponse(
  threatSeverity: number,
  responseSeverity: number,
  affectedNodes: string[],
): ImmuneResponse | null {
  if (activeResponses.size >= MAX_CONCURRENT_RESPONSES) return null;

  const response: ImmuneResponse = {
    id: `ir_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    threatSeverity,
    responseSeverity,
    affectedNodes: [...affectedNodes],
    startedAt: Date.now(),
    completedAt: null,
    collateralDamage: 0,
    dampened: false,
  };

  activeResponses.set(response.id, response);
  totalResponses++;
  return response;
}

/** Update collateral damage for an active response */
export function reportCollateral(responseId: string, collateralScore: number): boolean {
  const response = activeResponses.get(responseId);
  if (!response) return false;

  response.collateralDamage = Math.max(0, Math.min(1, collateralScore));

  // Auto-dampen if collateral exceeds threshold
  if (response.collateralDamage > COLLATERAL_THRESHOLD) {
    response.dampened = true;
    dampenedCount++;
  }

  return true;
}

/** Complete an immune response */
export function completeResponse(responseId: string): ImmuneResponse | null {
  const response = activeResponses.get(responseId);
  if (!response) return null;

  response.completedAt = Date.now();
  activeResponses.delete(responseId);

  // Update EMAs
  avgCollateralEma = EMA_ALPHA * response.collateralDamage + (1 - EMA_ALPHA) * avgCollateralEma;
  const ratio = response.threatSeverity > 0
    ? Math.min(1, response.threatSeverity / Math.max(1, response.responseSeverity))
    : 1;
  proportionalityEma = EMA_ALPHA * ratio + (1 - EMA_ALPHA) * proportionalityEma;

  responseHistory.push(response);
  if (responseHistory.length > 200) responseHistory.shift();

  return response;
}

/** Force-dampen all active responses (emergency brake) */
export function emergencyDampen(): number {
  let count = 0;
  for (const response of activeResponses.values()) {
    if (!response.dampened) {
      response.dampened = true;
      dampenedCount++;
      count++;
    }
  }
  return count;
}

/** Get active responses */
export function getActiveResponses(): ImmuneResponse[] {
  return Array.from(activeResponses.values());
}

/** Get health summary */
export function getCytokineStormHealth(): CytokineStormHealth {
  return {
    activeResponses: activeResponses.size,
    maxConcurrent: MAX_CONCURRENT_RESPONSES,
    totalResponses,
    dampenedCount,
    avgCollateralDamage: Math.round(avgCollateralEma * 100) / 100,
    proportionalityScore: Math.round(proportionalityEma * 100) / 100,
  };
}
