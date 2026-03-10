/**
 * S-Tier 118 — Decision Confidence Governor
 * ID: S-CJ76 | CJPI: 88 | Module: GOVERNANCE
 * 
 * Confidence-weighted decision gating with threshold management.
 */

export interface Decision {
  id: string;
  action: string;
  confidence: number; // 0-1
  sources: DecisionSource[];
  context: Record<string, unknown>;
  timestamp: string;
}

export interface DecisionSource {
  name: string;
  confidence: number;
  weight: number;
  reasoning: string;
}

export interface GateResult {
  decisionId: string;
  allowed: boolean;
  finalConfidence: number;
  threshold: number;
  action: 'approve' | 'reject' | 'defer' | 'escalate';
  reason: string;
}

export interface ConfidenceThreshold {
  action: string;
  minConfidence: number;
  deferRange: [number, number]; // [lower, upper] — in between = defer
  escalateBelow: number;
  requiresConsensus: boolean;
}

export class DecisionConfidenceGovernor {
  private thresholds: Map<string, ConfidenceThreshold> = new Map();
  private decisionLog: GateResult[] = [];
  private defaultThreshold: ConfidenceThreshold = {
    action: '*',
    minConfidence: 0.7,
    deferRange: [0.5, 0.7],
    escalateBelow: 0.3,
    requiresConsensus: false,
  };

  setThreshold(threshold: ConfidenceThreshold): void {
    this.thresholds.set(threshold.action, threshold);
  }

  evaluate(decision: Decision): GateResult {
    const threshold = this.thresholds.get(decision.action) || this.defaultThreshold;

    // Calculate weighted confidence from sources
    const totalWeight = decision.sources.reduce((s, src) => s + src.weight, 0);
    const weightedConfidence = totalWeight > 0
      ? decision.sources.reduce((s, src) => s + src.confidence * src.weight, 0) / totalWeight
      : decision.confidence;

    // Consensus check
    if (threshold.requiresConsensus && decision.sources.length > 1) {
      const agreeing = decision.sources.filter(s => s.confidence > threshold.deferRange[1]);
      if (agreeing.length < decision.sources.length * 0.5) {
        return this.makeResult(decision, weightedConfidence, threshold, 'defer', 'Consensus not reached');
      }
    }

    let action: GateResult['action'];
    let reason: string;

    if (weightedConfidence >= threshold.minConfidence) {
      action = 'approve';
      reason = `Confidence ${(weightedConfidence * 100).toFixed(1)}% meets threshold ${(threshold.minConfidence * 100).toFixed(1)}%`;
    } else if (weightedConfidence >= threshold.deferRange[0]) {
      action = 'defer';
      reason = `Confidence ${(weightedConfidence * 100).toFixed(1)}% in defer range`;
    } else if (weightedConfidence >= threshold.escalateBelow) {
      action = 'reject';
      reason = `Confidence ${(weightedConfidence * 100).toFixed(1)}% below threshold`;
    } else {
      action = 'escalate';
      reason = `Confidence ${(weightedConfidence * 100).toFixed(1)}% critically low — escalation required`;
    }

    return this.makeResult(decision, weightedConfidence, threshold, action, reason);
  }

  getLog(): GateResult[] { return [...this.decisionLog]; }

  getApprovalRate(): number {
    if (this.decisionLog.length === 0) return 0;
    return this.decisionLog.filter(r => r.allowed).length / this.decisionLog.length;
  }

  private makeResult(
    decision: Decision,
    confidence: number,
    threshold: ConfidenceThreshold,
    action: GateResult['action'],
    reason: string
  ): GateResult {
    const result: GateResult = {
      decisionId: decision.id,
      allowed: action === 'approve',
      finalConfidence: confidence,
      threshold: threshold.minConfidence,
      action,
      reason,
    };
    this.decisionLog.push(result);
    return result;
  }
}
