/**
 * ORACLE Ultimate #9 — Dynamic Risk Matrix
 * Real-time risk scoring across all 40 nodes.
 * Risk = Probability × Impact, updated from live predictions.
 */

// ── Types ──

export type RiskCategory = 'security' | 'performance' | 'compliance' | 'availability' | 'data_integrity';
export type RiskLevel = 'negligible' | 'low' | 'moderate' | 'high' | 'critical';

export interface RiskEntry {
  nodeId: string;
  category: RiskCategory;
  probability: number;     // 0-1
  impact: number;          // 0-1
  riskScore: number;       // probability × impact
  level: RiskLevel;
  description: string;
  mitigations: string[];
  lastAssessed: number;
}

export interface RiskMatrixSnapshot {
  entries: RiskEntry[];
  overallRisk: number;
  highestRiskNode: string | null;
  categoryBreakdown: Record<RiskCategory, number>;
  nodeCount: number;
  generatedAt: number;
}

// ── State ──

const risks = new Map<string, RiskEntry>(); // key: `${nodeId}:${category}`
let totalAssessments = 0;

// ── Helpers ──

function computeLevel(score: number): RiskLevel {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.35) return 'moderate';
  if (score >= 0.15) return 'low';
  return 'negligible';
}

// ── Core ──

export function assessRisk(input: {
  nodeId: string;
  category: RiskCategory;
  probability: number;
  impact: number;
  description: string;
  mitigations?: string[];
}): RiskEntry {
  const riskScore = Math.round(input.probability * input.impact * 1000) / 1000;
  const entry: RiskEntry = {
    nodeId: input.nodeId,
    category: input.category,
    probability: input.probability,
    impact: input.impact,
    riskScore,
    level: computeLevel(riskScore),
    description: input.description,
    mitigations: input.mitigations ?? [],
    lastAssessed: Date.now(),
  };
  risks.set(`${input.nodeId}:${input.category}`, entry);
  totalAssessments++;
  return entry;
}

export function getNodeRisks(nodeId: string): RiskEntry[] {
  return Array.from(risks.values()).filter(r => r.nodeId === nodeId);
}

export function getRiskSnapshot(): RiskMatrixSnapshot {
  const entries = Array.from(risks.values());
  const categoryBreakdown: Record<RiskCategory, number> = {
    security: 0, performance: 0, compliance: 0, availability: 0, data_integrity: 0,
  };

  let totalScore = 0;
  let highestScore = 0;
  let highestNode: string | null = null;

  // Aggregate by node
  const nodeScores = new Map<string, number>();
  for (const e of entries) {
    categoryBreakdown[e.category] += e.riskScore;
    totalScore += e.riskScore;
    const ns = (nodeScores.get(e.nodeId) ?? 0) + e.riskScore;
    nodeScores.set(e.nodeId, ns);
    if (ns > highestScore) {
      highestScore = ns;
      highestNode = e.nodeId;
    }
  }

  // Normalize category scores
  for (const cat of Object.keys(categoryBreakdown) as RiskCategory[]) {
    const catEntries = entries.filter(e => e.category === cat);
    categoryBreakdown[cat] = catEntries.length > 0
      ? Math.round((categoryBreakdown[cat] / catEntries.length) * 1000) / 1000
      : 0;
  }

  return {
    entries,
    overallRisk: entries.length > 0 ? Math.round((totalScore / entries.length) * 1000) / 1000 : 0,
    highestRiskNode: highestNode,
    categoryBreakdown,
    nodeCount: nodeScores.size,
    generatedAt: Date.now(),
  };
}

export function getRiskStats(): { totalAssessments: number; activeRisks: number; criticalCount: number; highCount: number } {
  const all = Array.from(risks.values());
  return {
    totalAssessments,
    activeRisks: all.length,
    criticalCount: all.filter(r => r.level === 'critical').length,
    highCount: all.filter(r => r.level === 'high').length,
  };
}

export function resetRiskState(): void {
  risks.clear();
  totalAssessments = 0;
}
