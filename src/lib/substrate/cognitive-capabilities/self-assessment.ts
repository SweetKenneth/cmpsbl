/**
 * Self-Assessment Probes
 * Nodes periodically evaluate recall accuracy and confidence calibration.
 * Non-destructive: read-only probes that produce diagnostic reports.
 */

import { emit } from '../events';
import { computeHealth, getModuleSnapshot } from '@/substrate/substrate-metrics';

export interface SelfAssessmentResult {
  nodeId: string;
  assessedAt: string;
  recallAccuracy: number;       // 0–1: how accurately the node retrieves relevant data
  confidenceCalibration: number; // 0–1: how well confidence scores match actual outcomes
  knowledgeCoverage: number;    // 0–1: estimated topic coverage breadth
  driftScore: number;           // 0–1: how much the node has drifted from baseline
  healthAtAssessment: number;   // 0–100: node health at time of probe
  recommendations: string[];
}

const MAX_HISTORY = 100;
const assessmentHistory: SelfAssessmentResult[] = [];

/**
 * Run a self-assessment probe on a specific node.
 * Uses the node's metrics snapshot to compute diagnostic scores.
 * This is a read-only operation — no state is mutated.
 */
export function runSelfAssessment(nodeId: string): SelfAssessmentResult {
  const id = nodeId.toUpperCase();
  const snapshot = getModuleSnapshot(id);
  const health = computeHealth(id);

  // Derive recall accuracy from error rate (lower errors = better recall)
  const totalOps = snapshot ? snapshot.opsCount + snapshot.errorCount : 0;
  const errorRate = totalOps > 0 ? snapshot!.errorCount / totalOps : 0;
  const recallAccuracy = Math.max(0, Math.min(1, 1 - errorRate * 2));

  // Confidence calibration based on latency consistency
  const latencySamples = snapshot?.latencySamples ?? [];
  let confidenceCalibration = 1.0;
  if (latencySamples.length >= 5) {
    const mean = latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length;
    const variance = latencySamples.reduce((sum, s) => sum + (s - mean) ** 2, 0) / latencySamples.length;
    const coeffOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 0;
    confidenceCalibration = Math.max(0, Math.min(1, 1 - coeffOfVariation));
  }

  // Knowledge coverage — based on ops volume relative to baseline
  const knowledgeCoverage = Math.min(1, totalOps / 100);

  // Drift detection — if health dropped significantly or circuit is open
  const circuitPenalty = snapshot?.circuitOpen ? 0.3 : 0;
  const healthPenalty = health < 60 ? (60 - health) / 100 : 0;
  const driftScore = Math.min(1, circuitPenalty + healthPenalty + errorRate * 0.5);

  // Generate recommendations
  const recommendations: string[] = [];
  if (recallAccuracy < 0.7) {
    recommendations.push('High error rate detected — consider circuit breaker reset or memory refresh');
  }
  if (confidenceCalibration < 0.6) {
    recommendations.push('Latency variance is high — response times are unpredictable');
  }
  if (driftScore > 0.4) {
    recommendations.push('Significant drift from baseline — dreaming cycle recommended');
  }
  if (knowledgeCoverage < 0.3) {
    recommendations.push('Low operation volume — node may need CLM training cycles');
  }
  if (recommendations.length === 0) {
    recommendations.push('Node operating within normal parameters');
  }

  const result: SelfAssessmentResult = {
    nodeId: id,
    assessedAt: new Date().toISOString(),
    recallAccuracy,
    confidenceCalibration,
    knowledgeCoverage,
    driftScore,
    healthAtAssessment: health,
    recommendations,
  };

  assessmentHistory.push(result);
  if (assessmentHistory.length > MAX_HISTORY) {
    assessmentHistory.splice(0, assessmentHistory.length - MAX_HISTORY);
  }

  emit({
    module: id.toLowerCase(),
    event_type: 'self_assessment',
    outcome: 'succeeded',
    data: {
      recallAccuracy: result.recallAccuracy,
      confidenceCalibration: result.confidenceCalibration,
      driftScore: result.driftScore,
      health: result.healthAtAssessment,
    },
  });

  return result;
}

/**
 * Get self-assessment history for a node (or all nodes).
 */
export function getSelfAssessmentHistory(
  nodeId?: string,
  limit: number = 20,
): SelfAssessmentResult[] {
  const filtered = nodeId
    ? assessmentHistory.filter(a => a.nodeId === nodeId.toUpperCase())
    : assessmentHistory;
  return [...filtered].reverse().slice(0, limit);
}
