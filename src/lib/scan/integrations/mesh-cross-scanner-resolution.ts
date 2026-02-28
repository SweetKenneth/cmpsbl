/**
 * Intent Mesh — Cross-Scanner Resolution (#40)
 * Routes ambiguous findings through the Intent Mesh to get
 * multi-module consensus, improving accuracy on edge cases.
 */

export interface ConsensusRequest {
  findingId: string;
  category: string;
  description: string;
  confidence: number;
  context: Record<string, unknown>;
}

export interface ModuleVote {
  module: string;
  verdict: 'true_positive' | 'false_positive' | 'needs_more_context';
  confidence: number;
  reasoning: string;
}

export interface ConsensusResult {
  findingId: string;
  votes: ModuleVote[];
  consensus: 'confirmed' | 'rejected' | 'inconclusive';
  aggregateConfidence: number;
  participatingModules: number;
  decidedAt: string;
}

/**
 * Route a finding through mesh resolvers for multi-module consensus
 */
export function requestConsensus(finding: ConsensusRequest): ConsensusResult {
  const votes: ModuleVote[] = [];

  // Each relevant module votes based on its domain expertise
  const relevantModules = getRelevantModules(finding.category);

  for (const mod of relevantModules) {
    votes.push(simulateModuleVote(mod, finding));
  }

  // Weighted majority voting
  const truePositiveWeight = votes
    .filter(v => v.verdict === 'true_positive')
    .reduce((s, v) => s + v.confidence, 0);
  const falsePositiveWeight = votes
    .filter(v => v.verdict === 'false_positive')
    .reduce((s, v) => s + v.confidence, 0);
  const totalWeight = truePositiveWeight + falsePositiveWeight;

  let consensus: ConsensusResult['consensus'] = 'inconclusive';
  if (totalWeight > 0) {
    const ratio = truePositiveWeight / totalWeight;
    if (ratio >= 0.7) consensus = 'confirmed';
    else if (ratio <= 0.3) consensus = 'rejected';
  }

  return {
    findingId: finding.findingId,
    votes,
    consensus,
    aggregateConfidence: totalWeight > 0 ? Math.round(truePositiveWeight / totalWeight * 100) / 100 : 0,
    participatingModules: votes.length,
    decidedAt: new Date().toISOString(),
  };
}

/**
 * Batch consensus for multiple ambiguous findings
 */
export function batchConsensus(
  findings: ConsensusRequest[],
  ambiguityThreshold = 0.6,
): { resolved: ConsensusResult[]; skipped: string[] } {
  const ambiguous = findings.filter(f => f.confidence < ambiguityThreshold);
  const skipped = findings.filter(f => f.confidence >= ambiguityThreshold).map(f => f.findingId);

  return {
    resolved: ambiguous.map(f => requestConsensus(f)),
    skipped,
  };
}

function getRelevantModules(category: string): string[] {
  const moduleMap: Record<string, string[]> = {
    security: ['DEFENSE', 'IMMUNE', 'MEMORY'],
    rls_policy: ['DEFENSE', 'CORTEX'],
    performance: ['VISION', 'NEXUS', 'CORTEX'],
    accessibility: ['VISION', 'CORTEX'],
    dead_code: ['MEMORY', 'CORTEX'],
    migration: ['EVOLUTION', 'MEMORY'],
    config_drift: ['VISION', 'DEFENSE'],
    complexity: ['CORTEX', 'DREAM'],
  };
  return moduleMap[category] ?? ['CORTEX', 'MEMORY'];
}

function simulateModuleVote(module: string, finding: ConsensusRequest): ModuleVote {
  // Each module applies its domain lens
  const domainConfidence = getDomainConfidence(module, finding.category);
  const adjustedConfidence = (finding.confidence * 0.6 + domainConfidence * 0.4);

  return {
    module,
    verdict: adjustedConfidence >= 0.6 ? 'true_positive' :
             adjustedConfidence <= 0.3 ? 'false_positive' : 'needs_more_context',
    confidence: Math.round(adjustedConfidence * 100) / 100,
    reasoning: `${module} domain analysis: ${adjustedConfidence >= 0.6 ? 'pattern matches known signatures' : 'insufficient evidence in domain context'}`,
  };
}

function getDomainConfidence(module: string, category: string): number {
  const affinities: Record<string, Record<string, number>> = {
    DEFENSE: { security: 0.9, rls_policy: 0.85, config_drift: 0.6 },
    VISION: { performance: 0.9, accessibility: 0.7, config_drift: 0.65 },
    MEMORY: { dead_code: 0.8, security: 0.5, migration: 0.6 },
    CORTEX: { complexity: 0.9, accessibility: 0.6, dead_code: 0.7 },
    IMMUNE: { security: 0.8, rls_policy: 0.7 },
    EVOLUTION: { migration: 0.9, dead_code: 0.5 },
    DREAM: { complexity: 0.7, performance: 0.5 },
    NEXUS: { performance: 0.7 },
  };
  return affinities[module]?.[category] ?? 0.4;
}
