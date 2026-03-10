/**
 * S-Tier Crown Jewel #12 — Mutation Proposal Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 12 | CJPI: 95 | Version: 1.0.0
 * Module: EVOLUTION | Type: Architecture
 * Signature: 5e628c4b
 *
 * Generates, evaluates, and queues system mutations with
 * fitness scoring and rollback safety gates.
 */

type MutationType = 'config' | 'topology' | 'capability' | 'policy' | 'threshold';
type MutationState = 'draft' | 'proposed' | 'approved' | 'applied' | 'rolled_back' | 'rejected';

interface MutationProposal {
  id: string;
  type: MutationType;
  title: string;
  description: string;
  targetModule: string;
  patch: Record<string, unknown>;
  rollbackPatch: Record<string, unknown>;
  fitnessScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  state: MutationState;
  createdAt: number;
  appliedAt?: number;
  rolledBackAt?: number;
  evaluationResults?: EvaluationResult;
}

interface EvaluationResult {
  qualityScore: number;     // 0-100
  safetyScore: number;      // 0-100
  performanceImpact: number; // -100 to +100
  riskAssessment: string;
  approved: boolean;
}

interface FitnessWeights {
  qualityWeight: number;
  safetyWeight: number;
  performanceWeight: number;
  noveltyWeight: number;
}

const DEFAULT_WEIGHTS: FitnessWeights = {
  qualityWeight: 0.3,
  safetyWeight: 0.35,
  performanceWeight: 0.25,
  noveltyWeight: 0.1,
};

export function createMutationEngine(weights: Partial<FitnessWeights> = {}) {
  const proposals = new Map<string, MutationProposal>();
  const appliedStack: string[] = [];
  const effectiveWeights = { ...DEFAULT_WEIGHTS, ...weights };

  let idCounter = 0;
  function nextId(): string {
    return `mut-${Date.now()}-${++idCounter}`;
  }

  function propose(params: {
    type: MutationType;
    title: string;
    description: string;
    targetModule: string;
    patch: Record<string, unknown>;
    rollbackPatch: Record<string, unknown>;
  }): MutationProposal {
    const id = nextId();

    const proposal: MutationProposal = {
      id,
      ...params,
      fitnessScore: 0,
      riskLevel: 'low',
      state: 'draft',
      createdAt: Date.now(),
    };

    // Auto-classify risk
    if (params.type === 'topology' || params.type === 'policy') {
      proposal.riskLevel = 'high';
    } else if (params.type === 'capability') {
      proposal.riskLevel = 'medium';
    }

    proposals.set(id, proposal);
    return proposal;
  }

  function evaluate(id: string): EvaluationResult | null {
    const proposal = proposals.get(id);
    if (!proposal) return null;

    // Simulated fitness evaluation
    const patchComplexity = Object.keys(proposal.patch).length;
    const qualityScore = Math.max(0, 100 - patchComplexity * 5);
    const safetyScore = proposal.riskLevel === 'low' ? 95 :
      proposal.riskLevel === 'medium' ? 75 :
        proposal.riskLevel === 'high' ? 55 : 30;
    const performanceImpact = Math.min(50, patchComplexity * 3);

    const fitness =
      qualityScore * effectiveWeights.qualityWeight +
      safetyScore * effectiveWeights.safetyWeight +
      Math.max(0, 50 + performanceImpact) * effectiveWeights.performanceWeight +
      (proposal.type === 'capability' ? 80 : 50) * effectiveWeights.noveltyWeight;

    const result: EvaluationResult = {
      qualityScore,
      safetyScore,
      performanceImpact,
      riskAssessment: `Risk: ${proposal.riskLevel} | Patch complexity: ${patchComplexity} fields`,
      approved: fitness >= 60 && safetyScore >= 50,
    };

    proposal.fitnessScore = Math.round(fitness);
    proposal.evaluationResults = result;
    proposal.state = 'proposed';

    return result;
  }

  function approve(id: string): boolean {
    const proposal = proposals.get(id);
    if (!proposal || proposal.state !== 'proposed') return false;
    if (!proposal.evaluationResults?.approved) return false;
    proposal.state = 'approved';
    return true;
  }

  function apply(id: string): boolean {
    const proposal = proposals.get(id);
    if (!proposal || proposal.state !== 'approved') return false;
    proposal.state = 'applied';
    proposal.appliedAt = Date.now();
    appliedStack.push(id);
    return true;
  }

  function rollback(id: string): boolean {
    const proposal = proposals.get(id);
    if (!proposal || proposal.state !== 'applied') return false;
    proposal.state = 'rolled_back';
    proposal.rolledBackAt = Date.now();
    const idx = appliedStack.indexOf(id);
    if (idx !== -1) appliedStack.splice(idx, 1);
    return true;
  }

  function reject(id: string): boolean {
    const proposal = proposals.get(id);
    if (!proposal) return false;
    proposal.state = 'rejected';
    return true;
  }

  function getProposal(id: string) { return proposals.get(id); }
  function listProposals(state?: MutationState) {
    const all = [...proposals.values()];
    return state ? all.filter(p => p.state === state) : all;
  }
  function getAppliedStack() { return [...appliedStack]; }

  return {
    propose, evaluate, approve, apply, rollback, reject,
    getProposal, listProposals, getAppliedStack,
    size: () => proposals.size,
  };
}
