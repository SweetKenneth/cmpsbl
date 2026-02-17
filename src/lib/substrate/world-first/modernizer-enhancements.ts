/**
 * MODERNIZER Module Enhancements — v10.5.4 ARCHITECT Epoch
 * EvolutionPredictor, RollbackAuthority, ImpactAnalyzer, ProposalRanker
 */

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION PREDICTOR — Predict evolution cycle outcomes
// ═══════════════════════════════════════════════════════════════════════════════

interface EvolutionHistory {
  id: string;
  proposalType: string;
  success: boolean;
  impactScore: number;
  executionTime: number;
  timestamp: number;
}

interface PredictionResult {
  proposalType: string;
  predictedSuccess: number;
  predictedImpact: number;
  confidence: number;
  riskFactors: string[];
  recommendation: 'proceed' | 'review' | 'defer' | 'reject';
}

export class EvolutionPredictor {
  private history: EvolutionHistory[] = [];
  private successRateByType: Map<string, { success: number; total: number }> = new Map();

  /** Record an evolution outcome */
  recordOutcome(outcome: EvolutionHistory): void {
    this.history.push(outcome);
    if (this.history.length > 1000) this.history.shift();

    // Update success rates
    const stats = this.successRateByType.get(outcome.proposalType) || { success: 0, total: 0 };
    stats.total++;
    if (outcome.success) stats.success++;
    this.successRateByType.set(outcome.proposalType, stats);
  }

  /** Predict outcome for a proposed evolution */
  predict(proposalType: string, estimatedImpact: number): PredictionResult {
    const typeStats = this.successRateByType.get(proposalType);
    const riskFactors: string[] = [];

    // Base success prediction
    let predictedSuccess = 0.7; // Default
    if (typeStats && typeStats.total >= 5) {
      predictedSuccess = typeStats.success / typeStats.total;
    } else {
      riskFactors.push('Limited historical data for this proposal type');
    }

    // Adjust based on impact
    if (estimatedImpact > 0.8) {
      predictedSuccess *= 0.85; // High impact = higher risk
      riskFactors.push('High-impact changes carry additional risk');
    }

    // Check recent failures
    const recentFailures = this.history
      .slice(-10)
      .filter(h => !h.success && h.proposalType === proposalType).length;
    if (recentFailures >= 2) {
      predictedSuccess *= 0.7;
      riskFactors.push(`${recentFailures} recent failures for this type`);
    }

    // Calculate confidence based on data availability
    const confidence = Math.min(1, (typeStats?.total || 0) / 20);

    // Predicted impact (weighted average of historical impacts)
    const typeHistory = this.history.filter(h => h.proposalType === proposalType);
    const predictedImpact = typeHistory.length > 0
      ? typeHistory.reduce((a, b) => a + b.impactScore, 0) / typeHistory.length
      : estimatedImpact;

    // Recommendation
    let recommendation: PredictionResult['recommendation'] = 'proceed';
    if (predictedSuccess < 0.5) recommendation = 'reject';
    else if (predictedSuccess < 0.7 || riskFactors.length > 2) recommendation = 'review';
    else if (confidence < 0.3) recommendation = 'defer';

    return {
      proposalType,
      predictedSuccess,
      predictedImpact,
      confidence,
      riskFactors,
      recommendation,
    };
  }

  /** Get evolution trends */
  getTrends(): {
    overallSuccessRate: number;
    avgImpact: number;
    trend: 'improving' | 'stable' | 'declining';
    topPerformingTypes: string[];
  } {
    if (this.history.length === 0) {
      return {
        overallSuccessRate: 0,
        avgImpact: 0,
        trend: 'stable',
        topPerformingTypes: [],
      };
    }

    const overallSuccessRate = this.history.filter(h => h.success).length / this.history.length;
    const avgImpact = this.history.reduce((a, b) => a + b.impactScore, 0) / this.history.length;

    // Calculate trend
    const midpoint = Math.floor(this.history.length / 2);
    const oldSuccess = this.history.slice(0, midpoint).filter(h => h.success).length / midpoint || 0;
    const newSuccess = this.history.slice(midpoint).filter(h => h.success).length / (this.history.length - midpoint) || 0;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (newSuccess - oldSuccess > 0.1) trend = 'improving';
    else if (oldSuccess - newSuccess > 0.1) trend = 'declining';

    // Top performing types
    const topPerforming = Array.from(this.successRateByType.entries())
      .filter(([, stats]) => stats.total >= 3)
      .map(([type, stats]) => ({ type, rate: stats.success / stats.total }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5)
      .map(t => t.type);

    return { overallSuccessRate, avgImpact, trend, topPerformingTypes: topPerforming };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROLLBACK AUTHORITY — Manage and execute rollbacks
// ═══════════════════════════════════════════════════════════════════════════════

interface Checkpoint {
  id: string;
  evolutionId: string;
  state: Record<string, unknown>;
  createdAt: number;
  description: string;
}

interface RollbackResult {
  success: boolean;
  checkpointId: string;
  restoredState: Record<string, unknown>;
  rollbackTime: number;
  affectedModules: string[];
}

export class RollbackAuthority {
  private checkpoints: Checkpoint[] = [];
  private maxCheckpoints: number = 50;
  private rollbackHistory: RollbackResult[] = [];

  /** Create a checkpoint before evolution */
  createCheckpoint(evolutionId: string, state: Record<string, unknown>, description: string): string {
    const id = `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.checkpoints.push({
      id,
      evolutionId,
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      createdAt: Date.now(),
      description,
    });

    // Prune old checkpoints
    if (this.checkpoints.length > this.maxCheckpoints) {
      this.checkpoints.shift();
    }

    return id;
  }

  /** Execute a rollback to a checkpoint */
  rollback(checkpointId: string): RollbackResult {
    const startTime = Date.now();
    const checkpoint = this.checkpoints.find(c => c.id === checkpointId);

    if (!checkpoint) {
      return {
        success: false,
        checkpointId,
        restoredState: {},
        rollbackTime: Date.now() - startTime,
        affectedModules: [],
      };
    }

    // Identify affected modules by comparing states
    const affectedModules = Object.keys(checkpoint.state);

    const result: RollbackResult = {
      success: true,
      checkpointId,
      restoredState: JSON.parse(JSON.stringify(checkpoint.state)),
      rollbackTime: Date.now() - startTime,
      affectedModules,
    };

    this.rollbackHistory.push(result);
    if (this.rollbackHistory.length > 100) {
      this.rollbackHistory.shift();
    }

    return result;
  }

  /** Get available checkpoints */
  getCheckpoints(limit: number = 10): Checkpoint[] {
    return this.checkpoints.slice(-limit).reverse();
  }

  /** Get checkpoint for specific evolution */
  getCheckpointForEvolution(evolutionId: string): Checkpoint | null {
    return this.checkpoints.find(c => c.evolutionId === evolutionId) || null;
  }

  /** Validate rollback is possible */
  canRollback(checkpointId: string): { possible: boolean; reason: string } {
    const checkpoint = this.checkpoints.find(c => c.id === checkpointId);
    
    if (!checkpoint) {
      return { possible: false, reason: 'Checkpoint not found' };
    }

    const age = Date.now() - checkpoint.createdAt;
    if (age > 7 * 24 * 60 * 60 * 1000) {
      return { possible: false, reason: 'Checkpoint too old (>7 days)' };
    }

    return { possible: true, reason: 'Rollback available' };
  }

  /** Get rollback statistics */
  getStats(): { totalCheckpoints: number; totalRollbacks: number; avgRollbackTime: number } {
    return {
      totalCheckpoints: this.checkpoints.length,
      totalRollbacks: this.rollbackHistory.length,
      avgRollbackTime: this.rollbackHistory.length > 0
        ? this.rollbackHistory.reduce((a, b) => a + b.rollbackTime, 0) / this.rollbackHistory.length
        : 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPACT ANALYZER — Analyze potential impact of changes
// ═══════════════════════════════════════════════════════════════════════════════

interface ImpactFactor {
  name: string;
  weight: number;
  score: number;        // 0-1
  description: string;
}

interface ImpactAnalysis {
  overallImpact: number;  // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: ImpactFactor[];
  affectedAreas: string[];
  mitigations: string[];
}

export class ImpactAnalyzer {
  private impactFactors: Array<{ name: string; weight: number; evaluator: (change: Record<string, unknown>) => number }> = [
    {
      name: 'Scope',
      weight: 0.25,
      evaluator: (change) => {
        const scope = change['scope'] as string || 'local';
        const scores: Record<string, number> = { local: 0.2, module: 0.5, system: 0.8, global: 1.0 };
        return scores[scope] || 0.5;
      },
    },
    {
      name: 'Reversibility',
      weight: 0.2,
      evaluator: (change) => {
        const reversible = change['reversible'] as boolean ?? true;
        return reversible ? 0.2 : 0.9;
      },
    },
    {
      name: 'Data Changes',
      weight: 0.25,
      evaluator: (change) => {
        const dataChanges = change['dataChanges'] as boolean ?? false;
        const destructive = change['destructive'] as boolean ?? false;
        if (destructive) return 1.0;
        if (dataChanges) return 0.6;
        return 0.1;
      },
    },
    {
      name: 'Dependencies',
      weight: 0.15,
      evaluator: (change) => {
        const deps = change['affectedDependencies'] as number ?? 0;
        return Math.min(1, deps / 10);
      },
    },
    {
      name: 'User Impact',
      weight: 0.15,
      evaluator: (change) => {
        const users = change['affectedUsers'] as string || 'none';
        const scores: Record<string, number> = { none: 0, internal: 0.3, subset: 0.6, all: 1.0 };
        return scores[users] || 0.3;
      },
    },
  ];

  /** Analyze impact of a proposed change */
  analyze(change: Record<string, unknown>): ImpactAnalysis {
    const factors: ImpactFactor[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const factor of this.impactFactors) {
      const score = factor.evaluator(change);
      factors.push({
        name: factor.name,
        weight: factor.weight,
        score,
        description: this.getFactorDescription(factor.name, score),
      });
      totalWeightedScore += score * factor.weight;
      totalWeight += factor.weight;
    }

    const overallImpact = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    // Determine risk level
    let riskLevel: ImpactAnalysis['riskLevel'] = 'low';
    if (overallImpact > 0.8) riskLevel = 'critical';
    else if (overallImpact > 0.6) riskLevel = 'high';
    else if (overallImpact > 0.4) riskLevel = 'medium';

    // Identify affected areas
    const affectedAreas = this.identifyAffectedAreas(change);

    // Generate mitigations
    const mitigations = this.generateMitigations(factors, riskLevel);

    return {
      overallImpact,
      riskLevel,
      factors,
      affectedAreas,
      mitigations,
    };
  }

  private getFactorDescription(name: string, score: number): string {
    const level = score < 0.3 ? 'Low' : score < 0.6 ? 'Moderate' : score < 0.8 ? 'High' : 'Very High';
    return `${level} ${name.toLowerCase()} impact`;
  }

  private identifyAffectedAreas(change: Record<string, unknown>): string[] {
    const areas: string[] = [];
    
    if (change['scope'] === 'global' || change['scope'] === 'system') {
      areas.push('All modules');
    }
    if (change['dataChanges']) areas.push('Data layer');
    if (change['apiChanges']) areas.push('API contracts');
    if (change['uiChanges']) areas.push('User interface');
    if (change['configChanges']) areas.push('Configuration');

    return areas.length > 0 ? areas : ['Local scope only'];
  }

  private generateMitigations(factors: ImpactFactor[], riskLevel: string): string[] {
    const mitigations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      mitigations.push('Create checkpoint before execution');
      mitigations.push('Execute during low-traffic window');
      mitigations.push('Prepare rollback procedure');
    }

    const highImpactFactors = factors.filter(f => f.score > 0.6);
    for (const factor of highImpactFactors) {
      if (factor.name === 'Data Changes') {
        mitigations.push('Backup affected data before changes');
      }
      if (factor.name === 'Dependencies') {
        mitigations.push('Notify dependent module owners');
      }
      if (factor.name === 'User Impact') {
        mitigations.push('Communicate changes to users in advance');
      }
    }

    return mitigations.length > 0 ? mitigations : ['Standard monitoring recommended'];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSAL RANKER — Rank and prioritize evolution proposals
// ═══════════════════════════════════════════════════════════════════════════════

interface Proposal {
  id: string;
  title: string;
  type: string;
  estimatedBenefit: number;  // 0-1
  estimatedCost: number;     // 0-1
  risk: number;              // 0-1
  urgency: number;           // 0-1
  sponsor?: string;
  dependencies?: string[];
}

interface RankedProposal {
  proposal: Proposal;
  rank: number;
  score: number;
  rationale: string[];
}

export class ProposalRanker {
  private weights = {
    benefit: 0.35,
    costEfficiency: 0.25,
    risk: 0.2,
    urgency: 0.2,
  };

  /** Rank a list of proposals */
  rank(proposals: Proposal[]): RankedProposal[] {
    const scored = proposals.map(proposal => ({
      proposal,
      score: this.calculateScore(proposal),
      rationale: this.generateRationale(proposal),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Assign ranks
    return scored.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  private calculateScore(proposal: Proposal): number {
    // Cost efficiency: benefit relative to cost
    const costEfficiency = proposal.estimatedCost > 0 
      ? proposal.estimatedBenefit / proposal.estimatedCost 
      : proposal.estimatedBenefit;
    const normalizedEfficiency = Math.min(1, costEfficiency / 2);

    // Risk is inverse (lower risk = higher score)
    const riskScore = 1 - proposal.risk;

    // Calculate weighted score
    const score = 
      (proposal.estimatedBenefit * this.weights.benefit) +
      (normalizedEfficiency * this.weights.costEfficiency) +
      (riskScore * this.weights.risk) +
      (proposal.urgency * this.weights.urgency);

    return Math.min(1, Math.max(0, score));
  }

  private generateRationale(proposal: Proposal): string[] {
    const rationale: string[] = [];

    if (proposal.estimatedBenefit > 0.7) {
      rationale.push('High expected benefit');
    }
    if (proposal.estimatedCost < 0.3) {
      rationale.push('Low implementation cost');
    }
    if (proposal.risk < 0.3) {
      rationale.push('Low risk profile');
    }
    if (proposal.urgency > 0.7) {
      rationale.push('Time-sensitive');
    }
    if (proposal.estimatedBenefit / (proposal.estimatedCost || 0.1) > 2) {
      rationale.push('Excellent ROI');
    }
    if (proposal.dependencies && proposal.dependencies.length > 0) {
      rationale.push(`Has ${proposal.dependencies.length} dependencies`);
    }

    return rationale.length > 0 ? rationale : ['Standard proposal'];
  }

  /** Get quick wins (high benefit, low cost/risk) */
  getQuickWins(proposals: Proposal[], limit: number = 5): RankedProposal[] {
    return this.rank(proposals)
      .filter(rp => 
        rp.proposal.estimatedBenefit > 0.5 &&
        rp.proposal.estimatedCost < 0.4 &&
        rp.proposal.risk < 0.4
      )
      .slice(0, limit);
  }

  /** Compare two proposals */
  compare(a: Proposal, b: Proposal): {
    winner: string;
    scoreA: number;
    scoreB: number;
    advantages: { a: string[]; b: string[] };
  } {
    const scoreA = this.calculateScore(a);
    const scoreB = this.calculateScore(b);

    const advantagesA: string[] = [];
    const advantagesB: string[] = [];

    if (a.estimatedBenefit > b.estimatedBenefit) advantagesA.push('Higher benefit');
    else if (b.estimatedBenefit > a.estimatedBenefit) advantagesB.push('Higher benefit');

    if (a.estimatedCost < b.estimatedCost) advantagesA.push('Lower cost');
    else if (b.estimatedCost < a.estimatedCost) advantagesB.push('Lower cost');

    if (a.risk < b.risk) advantagesA.push('Lower risk');
    else if (b.risk < a.risk) advantagesB.push('Lower risk');

    if (a.urgency > b.urgency) advantagesA.push('More urgent');
    else if (b.urgency > a.urgency) advantagesB.push('More urgent');

    return {
      winner: scoreA >= scoreB ? a.id : b.id,
      scoreA,
      scoreB,
      advantages: { a: advantagesA, b: advantagesB },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const modernizerEnhancements = {
  EvolutionPredictor,
  RollbackAuthority,
  ImpactAnalyzer,
  ProposalRanker,
};

export type {
  EvolutionHistory,
  PredictionResult,
  Checkpoint,
  RollbackResult,
  ImpactFactor,
  ImpactAnalysis,
  Proposal,
  RankedProposal,
};
