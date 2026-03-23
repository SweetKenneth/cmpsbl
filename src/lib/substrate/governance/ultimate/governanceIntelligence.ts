/**
 * GOVERNANCE Ultimate — System 8: Governance Intelligence (CLM)
 * 
 * Pattern analysis across decisions, policy effectiveness scoring,
 * false positive detection, and policy refinement recommendations.
 * 
 * @module governance/ultimate/governanceIntelligence
 */

// ── Types ────────────────────────────────────────────────────────

export interface PolicyEffectivenessScore {
  policyId: string;
  policyName: string;
  triggerCount: number;
  appealCount: number;
  falsePositiveRate: number;     // 0-1
  effectivenessScore: number;    // 0-100 (EMA-weighted)
  trend: 'improving' | 'stable' | 'degrading';
  lastTriggeredAt: number | null;
}

export interface GovernancePattern {
  id: string;
  patternType: 'frequent_trigger' | 'false_positive' | 'escalation_cluster' | 'approval_bottleneck' | 'mode_oscillation';
  description: string;
  severity: 'info' | 'warning' | 'action_required';
  affectedPolicies: string[];
  detectedAt: number;
  recommendation: string;
}

export interface RefinementRecommendation {
  id: string;
  policyId: string;
  type: 'relax' | 'tighten' | 'deprecate' | 'split' | 'merge';
  reason: string;
  confidence: number;           // 0-1
  createdAt: number;
}

export interface GovernanceIntelligenceStats {
  policiesTracked: number;
  patternsDetected: number;
  recommendationsGenerated: number;
  avgEffectivenessScore: number;
  highFalsePositivePolicies: number;
  actionRequiredCount: number;
}

// ── State ────────────────────────────────────────────────────────

const scores: Map<string, PolicyEffectivenessScore> = new Map();
const patterns: GovernancePattern[] = [];
const recommendations: RefinementRecommendation[] = [];
const EMA_ALPHA = 0.15;
const MAX_PATTERNS = 500;
const MAX_RECOMMENDATIONS = 300;

function genId(prefix: string): string { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

// ── Core API ────────────────────────────────────────────────────

/** Record a policy trigger event */
export function recordPolicyTrigger(policyId: string, policyName: string, wasCorrect: boolean): void {
  if (!scores.has(policyId)) {
    scores.set(policyId, {
      policyId, policyName,
      triggerCount: 0, appealCount: 0,
      falsePositiveRate: 0, effectivenessScore: 50,
      trend: 'stable', lastTriggeredAt: null,
    });
  }

  const score = scores.get(policyId)!;
  score.triggerCount++;
  score.lastTriggeredAt = Date.now();

  // Update false positive rate with EMA
  const fpVal = wasCorrect ? 0 : 1;
  score.falsePositiveRate = EMA_ALPHA * fpVal + (1 - EMA_ALPHA) * score.falsePositiveRate;

  // Update effectiveness score (inverse of false positive rate)
  const prevScore = score.effectivenessScore;
  score.effectivenessScore = Math.round(
    EMA_ALPHA * (wasCorrect ? 100 : 20) + (1 - EMA_ALPHA) * score.effectivenessScore
  );

  // Update trend
  if (score.effectivenessScore > prevScore + 2) score.trend = 'improving';
  else if (score.effectivenessScore < prevScore - 2) score.trend = 'degrading';
  else score.trend = 'stable';
}

/** Record a policy appeal */
export function recordPolicyAppeal(policyId: string): void {
  const score = scores.get(policyId);
  if (score) score.appealCount++;
}

/** Run pattern detection across all tracked policies */
export function detectPatterns(): GovernancePattern[] {
  const detected: GovernancePattern[] = [];

  for (const score of scores.values()) {
    // Frequent false positive pattern
    if (score.falsePositiveRate > 0.3 && score.triggerCount > 10) {
      detected.push({
        id: genId('pat'), patternType: 'false_positive',
        description: `Policy "${score.policyName}" has ${Math.round(score.falsePositiveRate * 100)}% false positive rate`,
        severity: 'action_required',
        affectedPolicies: [score.policyId],
        detectedAt: Date.now(),
        recommendation: `Consider relaxing policy "${score.policyName}" — high false positive rate suggests overly strict conditions`,
      });
    }

    // Frequent trigger pattern
    if (score.triggerCount > 50 && score.effectivenessScore < 40) {
      detected.push({
        id: genId('pat'), patternType: 'frequent_trigger',
        description: `Policy "${score.policyName}" triggers frequently (${score.triggerCount}x) with low effectiveness (${score.effectivenessScore})`,
        severity: 'warning',
        affectedPolicies: [score.policyId],
        detectedAt: Date.now(),
        recommendation: `Review policy "${score.policyName}" for relevance — high trigger count with low effectiveness`,
      });
    }

    // Approval bottleneck
    if (score.appealCount > score.triggerCount * 0.5 && score.triggerCount > 5) {
      detected.push({
        id: genId('pat'), patternType: 'approval_bottleneck',
        description: `Policy "${score.policyName}" generates excessive appeals (${score.appealCount}/${score.triggerCount})`,
        severity: 'warning',
        affectedPolicies: [score.policyId],
        detectedAt: Date.now(),
        recommendation: `Split policy "${score.policyName}" into separate rules for different severity levels`,
      });
    }
  }

  for (const pattern of detected) {
    patterns.push(pattern);
    generateRecommendation(pattern);
  }

  if (patterns.length > MAX_PATTERNS) patterns.splice(0, patterns.length - MAX_PATTERNS);
  return detected;
}

/** Generate a refinement recommendation from a pattern */
function generateRecommendation(pattern: GovernancePattern): void {
  const type = pattern.patternType === 'false_positive' ? 'relax' as const :
    pattern.patternType === 'frequent_trigger' ? 'deprecate' as const :
      pattern.patternType === 'approval_bottleneck' ? 'split' as const : 'tighten' as const;

  for (const policyId of pattern.affectedPolicies) {
    const rec: RefinementRecommendation = {
      id: genId('rec'), policyId, type,
      reason: pattern.recommendation,
      confidence: pattern.severity === 'action_required' ? 0.9 : 0.6,
      createdAt: Date.now(),
    };
    recommendations.push(rec);
    if (recommendations.length > MAX_RECOMMENDATIONS) recommendations.splice(0, recommendations.length - MAX_RECOMMENDATIONS);
  }
}

// ── Query ────────────────────────────────────────────────────────

export function getPolicyScore(policyId: string): PolicyEffectivenessScore | undefined { return scores.get(policyId); }
export function getAllPolicyScores(): PolicyEffectivenessScore[] { return [...scores.values()]; }
export function getGovernancePatterns(type?: GovernancePattern['patternType']): GovernancePattern[] {
  return type ? patterns.filter(p => p.patternType === type) : [...patterns];
}
export function getRefinementRecommendations(policyId?: string): RefinementRecommendation[] {
  return policyId ? recommendations.filter(r => r.policyId === policyId) : [...recommendations];
}

export function getGovernanceIntelligenceStats(): GovernanceIntelligenceStats {
  const allScores = [...scores.values()];
  return {
    policiesTracked: allScores.length,
    patternsDetected: patterns.length,
    recommendationsGenerated: recommendations.length,
    avgEffectivenessScore: allScores.length > 0
      ? Math.round(allScores.reduce((s, sc) => s + sc.effectivenessScore, 0) / allScores.length)
      : 100,
    highFalsePositivePolicies: allScores.filter(s => s.falsePositiveRate > 0.3).length,
    actionRequiredCount: patterns.filter(p => p.severity === 'action_required').length,
  };
}

export function resetGovernanceIntelligence(): void {
  scores.clear();
  patterns.length = 0;
  recommendations.length = 0;
}
