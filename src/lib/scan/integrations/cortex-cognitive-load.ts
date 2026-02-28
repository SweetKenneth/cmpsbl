/**
 * CORTEX — Cognitive Load Estimation (#33)
 * Estimates developer effort required to remediate each finding,
 * enabling smarter priority ranking by factoring in human cost.
 */

export interface CognitiveLoadEstimate {
  findingId: string;
  category: string;
  cognitiveLoad: number; // 1-10 scale
  estimatedMinutes: number;
  factors: {
    complexity: number;      // code complexity of affected area
    contextSwitch: number;   // how many files/modules touched
    domainKnowledge: number; // specialized knowledge required
    testBurden: number;      // testing effort for the fix
    riskOfBreakage: number;  // chance of introducing new bugs
  };
  tier: 'trivial' | 'straightforward' | 'moderate' | 'complex' | 'heroic';
  automatable: boolean;
}

export interface CognitiveLoadReport {
  estimates: CognitiveLoadEstimate[];
  totalEstimatedHours: number;
  avgCognitiveLoad: number;
  automatableCount: number;
  tierDistribution: Record<CognitiveLoadEstimate['tier'], number>;
  quickWins: string[]; // findingIds with low load + high severity
  generatedAt: string;
}

interface Finding {
  id: string;
  category: string;
  severity: number;
  filePath?: string;
  affectedFiles?: string[];
  description: string;
}

/**
 * Estimate cognitive load for a batch of findings
 */
export function estimateCognitiveLoad(findings: Finding[]): CognitiveLoadReport {
  const estimates: CognitiveLoadEstimate[] = findings.map(f => {
    const complexity = estimateComplexity(f.category, f.description);
    const contextSwitch = Math.min(10, (f.affectedFiles?.length ?? 1) * 2);
    const domainKnowledge = estimateDomainKnowledge(f.category);
    const testBurden = estimateTestBurden(f.category);
    const riskOfBreakage = estimateBreakageRisk(f.category, f.severity);

    const cognitiveLoad = Math.min(10, Math.round(
      complexity * 0.3 + contextSwitch * 0.2 + domainKnowledge * 0.2 +
      testBurden * 0.15 + riskOfBreakage * 0.15
    ));

    const estimatedMinutes = cognitiveLoad <= 2 ? 10 :
      cognitiveLoad <= 4 ? 30 :
      cognitiveLoad <= 6 ? 90 :
      cognitiveLoad <= 8 ? 240 : 480;

    const tier: CognitiveLoadEstimate['tier'] =
      cognitiveLoad <= 2 ? 'trivial' :
      cognitiveLoad <= 4 ? 'straightforward' :
      cognitiveLoad <= 6 ? 'moderate' :
      cognitiveLoad <= 8 ? 'complex' : 'heroic';

    const automatable = cognitiveLoad <= 3 && ['accessibility', 'config_drift', 'dead_code'].includes(f.category);

    return {
      findingId: f.id,
      category: f.category,
      cognitiveLoad,
      estimatedMinutes,
      factors: { complexity, contextSwitch, domainKnowledge, testBurden, riskOfBreakage },
      tier,
      automatable,
    };
  });

  const tierDist: Record<CognitiveLoadEstimate['tier'], number> = {
    trivial: 0, straightforward: 0, moderate: 0, complex: 0, heroic: 0,
  };
  for (const e of estimates) tierDist[e.tier]++;

  const quickWins = estimates
    .filter(e => e.cognitiveLoad <= 3)
    .sort((a, b) => {
      const sevA = findings.find(f => f.id === a.findingId)?.severity ?? 0;
      const sevB = findings.find(f => f.id === b.findingId)?.severity ?? 0;
      return sevB - sevA;
    })
    .slice(0, 10)
    .map(e => e.findingId);

  return {
    estimates,
    totalEstimatedHours: Math.round(estimates.reduce((s, e) => s + e.estimatedMinutes, 0) / 60 * 10) / 10,
    avgCognitiveLoad: estimates.length > 0 ? Math.round(estimates.reduce((s, e) => s + e.cognitiveLoad, 0) / estimates.length * 10) / 10 : 0,
    automatableCount: estimates.filter(e => e.automatable).length,
    tierDistribution: tierDist,
    quickWins,
    generatedAt: new Date().toISOString(),
  };
}

function estimateComplexity(category: string, desc: string): number {
  const complexCategories: Record<string, number> = {
    security: 7, rls_policy: 8, privilege_escalation: 9,
    performance: 6, complexity: 5, migration: 7,
    accessibility: 3, dead_code: 2, config_drift: 3,
  };
  return complexCategories[category] ?? 5;
}

function estimateDomainKnowledge(category: string): number {
  const domains: Record<string, number> = {
    security: 8, rls_policy: 9, performance: 6,
    accessibility: 5, migration: 7, config_drift: 4,
  };
  return domains[category] ?? 4;
}

function estimateTestBurden(category: string): number {
  const burdens: Record<string, number> = {
    security: 8, performance: 7, migration: 6,
    accessibility: 3, dead_code: 2, config_drift: 2,
  };
  return burdens[category] ?? 4;
}

function estimateBreakageRisk(category: string, severity: number): number {
  if (category === 'security' && severity >= 8) return 7;
  if (category === 'migration') return 8;
  if (category === 'performance') return 5;
  return Math.min(10, Math.round(severity * 0.6));
}
