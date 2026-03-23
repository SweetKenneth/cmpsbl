/**
 * MEDIC — Triage Priority Engine
 * Real-time severity scoring using weighted composite of health degradation rate,
 * blast radius, and SLA criticality. Assigns triage codes with deterministic ordering.
 * @module medic/triagePriorityEngine
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type TriageCode = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

export interface TriageInput {
  nodeId: string;
  healthScore: number;          // 0–100
  degradationRate: number;      // health points lost per hour
  blastRadius: number;          // number of downstream nodes affected
  slaCriticality: number;       // 1–10 (10 = mission-critical)
  isResponsive: boolean;
}

export interface TriageAssessment {
  nodeId: string;
  code: TriageCode;
  compositeScore: number;       // 0–100 (higher = more urgent)
  reasoning: string;
  timestamp: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const WEIGHTS = {
  health: 0.30,
  degradation: 0.25,
  blastRadius: 0.20,
  sla: 0.25,
};

const CODE_THRESHOLDS: Array<{ min: number; code: TriageCode }> = [
  { min: 75, code: 'RED' },
  { min: 45, code: 'YELLOW' },
  { min: 0, code: 'GREEN' },
];

// ── State ──────────────────────────────────────────────────────────────────

const assessmentLog: TriageAssessment[] = [];
const MAX_LOG = 500;

// ── Core ───────────────────────────────────────────────────────────────────

export function assessTriage(input: TriageInput): TriageAssessment {
  // BLACK = unresponsive node (beyond saving in current cycle)
  if (!input.isResponsive) {
    const assessment: TriageAssessment = {
      nodeId: input.nodeId,
      code: 'BLACK',
      compositeScore: 100,
      reasoning: 'Node unresponsive — marked BLACK for deferred recovery',
      timestamp: Date.now(),
    };
    pushLog(assessment);
    return assessment;
  }

  const healthUrgency = Math.max(0, (100 - input.healthScore)) / 100;
  const degradationNorm = Math.min(1, input.degradationRate / 50); // 50 pts/hr = max urgency
  const blastNorm = Math.min(1, input.blastRadius / 20);           // 20 nodes = max blast
  const slaNorm = input.slaCriticality / 10;

  const compositeScore = Math.round(
    (WEIGHTS.health * healthUrgency +
     WEIGHTS.degradation * degradationNorm +
     WEIGHTS.blastRadius * blastNorm +
     WEIGHTS.sla * slaNorm) * 100
  );

  let code: TriageCode = 'GREEN';
  for (const threshold of CODE_THRESHOLDS) {
    if (compositeScore >= threshold.min) {
      code = threshold.code;
      break;
    }
  }

  const reasons: string[] = [];
  if (healthUrgency > 0.6) reasons.push(`health critical (${input.healthScore}%)`);
  if (degradationNorm > 0.5) reasons.push(`rapid decay (${input.degradationRate} pts/hr)`);
  if (blastNorm > 0.5) reasons.push(`wide blast radius (${input.blastRadius} nodes)`);
  if (slaNorm > 0.7) reasons.push(`high SLA criticality (${input.slaCriticality}/10)`);

  const assessment: TriageAssessment = {
    nodeId: input.nodeId,
    code,
    compositeScore,
    reasoning: reasons.length > 0 ? reasons.join('; ') : 'Within normal parameters',
    timestamp: Date.now(),
  };

  pushLog(assessment);
  return assessment;
}

export function triageMultiple(inputs: TriageInput[]): TriageAssessment[] {
  return inputs
    .map(assessTriage)
    .sort((a, b) => b.compositeScore - a.compositeScore);
}

function pushLog(a: TriageAssessment): void {
  assessmentLog.push(a);
  if (assessmentLog.length > MAX_LOG) assessmentLog.splice(0, assessmentLog.length - MAX_LOG);
}

export function getTriageLog(): TriageAssessment[] {
  return [...assessmentLog];
}

export function resetTriage(): void {
  assessmentLog.length = 0;
}
