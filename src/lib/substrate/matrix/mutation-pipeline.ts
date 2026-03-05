/**
 * Mutation Pipeline Engine — Shadow-First Execution Discipline
 * 
 * Lifecycle:
 *   TRIGGER → ANALYZE → PROPOSE → SHADOW_RUN → EVALUATE → STABILIZE → PROMOTE
 * 
 * All mutations run in shadow environment before promotion.
 * Governor approval required at PROMOTE gate.
 * Dual executor verification for critical mutations.
 */

import type { SubstrateModuleName } from '@/lib/core/index';
import { governanceCheck, recordPlaneOp } from './control-planes';
import { appendReceipt, type MutationReceipt } from './receipt-chain';
import { computeReadiness, type ReadinessReport } from './readiness-index';
import { trackEntropy, type EntropySnapshot } from './entropy-tracker';
import { verifyDual, type DualExecutorResult } from './dual-executor';
import { matrixBroadcast, MATRIX_SIGNALS } from './communication-bus';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type MutationPhase =
  | 'triggered'
  | 'analyzing'
  | 'proposed'
  | 'shadow_running'
  | 'evaluating'
  | 'stabilizing'
  | 'promoting'
  | 'promoted'
  | 'rejected'
  | 'rolled_back';

export interface MutationProposal {
  id: string;
  title: string;
  description: string;
  source: SubstrateModuleName;
  targetModules: SubstrateModuleName[];
  phase: MutationPhase;
  createdAt: number;
  updatedAt: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  changes: MutationChange[];
  shadowResult?: ShadowRunResult;
  readiness?: ReadinessReport;
  entropy?: EntropySnapshot;
  dualExecution?: DualExecutorResult;
  receipt?: MutationReceipt;
  governorDecision?: { approved: boolean; reason: string; decidedAt: number };
}

export interface MutationChange {
  type: 'config' | 'threshold' | 'capability' | 'policy' | 'schema';
  target: string;
  description: string;
  before: unknown;
  after: unknown;
}

export interface ShadowRunResult {
  success: boolean;
  executionTimeMs: number;
  metricsDeltas: Record<string, number>;
  errors: string[];
  warnings: string[];
  divergenceScore: number; // 0 = identical to baseline, 1 = fully divergent
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE STATE
// ═══════════════════════════════════════════════════════════════

const activeMutations = new Map<string, MutationProposal>();
const completedMutations: MutationProposal[] = [];
const MAX_COMPLETED = 200;

const READINESS_THRESHOLD = 0.7;
const MAX_DIVERGENCE = 0.3;

// ═══════════════════════════════════════════════════════════════
// PIPELINE OPERATIONS
// ═══════════════════════════════════════════════════════════════

/** Step 1: Trigger — Create a new mutation proposal */
export function triggerMutation(
  source: SubstrateModuleName,
  title: string,
  description: string,
  changes: MutationChange[],
  targetModules: SubstrateModuleName[]
): MutationProposal {
  const proposal: MutationProposal = {
    id: `mut-${crypto.randomUUID().slice(0, 8)}`,
    title,
    description,
    source,
    targetModules,
    phase: 'triggered',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    riskLevel: classifyRisk(changes, targetModules),
    changes,
  };

  activeMutations.set(proposal.id, proposal);
  matrixBroadcast(source, MATRIX_SIGNALS.MUTATION_PROPOSED, {
    mutation_id: proposal.id,
    title,
    risk: proposal.riskLevel,
    targets: targetModules,
  });

  return proposal;
}

/** Step 2: Analyze — Assess impact and compute readiness */
export function analyzeMutation(mutationId: string): MutationProposal | null {
  const proposal = activeMutations.get(mutationId);
  if (!proposal) return null;

  proposal.phase = 'analyzing';
  proposal.readiness = computeReadiness(proposal.targetModules);
  proposal.entropy = trackEntropy(mutationId, proposal.changes);
  proposal.updatedAt = Date.now();

  // Check readiness threshold
  if (proposal.readiness.score < READINESS_THRESHOLD) {
    proposal.phase = 'rejected';
    proposal.governorDecision = {
      approved: false,
      reason: `Readiness score ${proposal.readiness.score.toFixed(2)} below threshold ${READINESS_THRESHOLD}`,
      decidedAt: Date.now(),
    };
    finalizeMutation(proposal);
    return proposal;
  }

  proposal.phase = 'proposed';
  return proposal;
}

/** Step 3: Shadow Run — Execute mutation in shadow environment */
export function shadowRun(mutationId: string): MutationProposal | null {
  const proposal = activeMutations.get(mutationId);
  if (!proposal || proposal.phase !== 'proposed') return null;

  proposal.phase = 'shadow_running';
  proposal.updatedAt = Date.now();

  matrixBroadcast(proposal.source, MATRIX_SIGNALS.MUTATION_SHADOW_START, {
    mutation_id: mutationId,
    targets: proposal.targetModules,
  });

  // Shadow execution (simulated — real shadow would delegate to SHADOW module)
  const startTime = Date.now();
  const shadowResult: ShadowRunResult = {
    success: true,
    executionTimeMs: Date.now() - startTime,
    metricsDeltas: {},
    errors: [],
    warnings: [],
    divergenceScore: 0,
  };

  // Validate each change
  for (const change of proposal.changes) {
    if (change.type === 'schema') {
      shadowResult.warnings.push(`Schema change on ${change.target} — requires migration verification`);
    }
  }

  proposal.shadowResult = shadowResult;
  proposal.phase = 'evaluating';

  matrixBroadcast(proposal.source, MATRIX_SIGNALS.MUTATION_SHADOW_RESULT, {
    mutation_id: mutationId,
    success: shadowResult.success,
    divergence: shadowResult.divergenceScore,
    errors: shadowResult.errors.length,
  });

  return proposal;
}

/** Step 4: Evaluate — Check shadow results and stabilization gates */
export function evaluateMutation(mutationId: string): MutationProposal | null {
  const proposal = activeMutations.get(mutationId);
  if (!proposal || proposal.phase !== 'evaluating') return null;

  const shadow = proposal.shadowResult;
  if (!shadow) {
    proposal.phase = 'rejected';
    proposal.governorDecision = {
      approved: false,
      reason: 'No shadow result available',
      decidedAt: Date.now(),
    };
    finalizeMutation(proposal);
    return proposal;
  }

  // Gate 1: Shadow must succeed
  if (!shadow.success) {
    proposal.phase = 'rejected';
    proposal.governorDecision = {
      approved: false,
      reason: `Shadow execution failed: ${shadow.errors.join(', ')}`,
      decidedAt: Date.now(),
    };
    finalizeMutation(proposal);
    return proposal;
  }

  // Gate 2: Divergence within bounds
  if (shadow.divergenceScore > MAX_DIVERGENCE) {
    proposal.phase = 'rejected';
    proposal.governorDecision = {
      approved: false,
      reason: `Divergence score ${shadow.divergenceScore.toFixed(2)} exceeds max ${MAX_DIVERGENCE}`,
      decidedAt: Date.now(),
    };
    finalizeMutation(proposal);
    return proposal;
  }

  // Gate 3: Governance plane approval
  const govCheck = governanceCheck(proposal.source, 'mutation.promote', {
    mutation_id: mutationId,
    risk: proposal.riskLevel,
  });

  if (!govCheck.allowed) {
    proposal.phase = 'rejected';
    proposal.governorDecision = {
      approved: false,
      reason: govCheck.reason || 'Governance check failed',
      decidedAt: Date.now(),
    };
    finalizeMutation(proposal);
    return proposal;
  }

  proposal.phase = 'stabilizing';
  proposal.updatedAt = Date.now();
  return proposal;
}

/** Step 5: Promote — Apply mutation to production (requires dual verification for critical) */
export function promoteMutation(
  mutationId: string,
  governorApproval: { approved: boolean; reason: string }
): MutationProposal | null {
  const proposal = activeMutations.get(mutationId);
  if (!proposal || proposal.phase !== 'stabilizing') return null;

  proposal.governorDecision = {
    ...governorApproval,
    decidedAt: Date.now(),
  };

  if (!governorApproval.approved) {
    proposal.phase = 'rejected';
    finalizeMutation(proposal);

    matrixBroadcast(proposal.source, MATRIX_SIGNALS.MUTATION_REJECTED, {
      mutation_id: mutationId,
      reason: governorApproval.reason,
    });
    return proposal;
  }

  // Dual executor for critical mutations
  if (proposal.riskLevel === 'critical' || proposal.riskLevel === 'high') {
    proposal.dualExecution = verifyDual(mutationId, proposal.changes);
    if (!proposal.dualExecution.agreement) {
      proposal.phase = 'rejected';
      proposal.governorDecision = {
        approved: false,
        reason: `Dual executor disagreement: ${proposal.dualExecution.reason}`,
        decidedAt: Date.now(),
      };
      finalizeMutation(proposal);
      return proposal;
    }
  }

  // All gates passed — promote
  proposal.phase = 'promoted';
  proposal.updatedAt = Date.now();

  // Record receipt
  const receipt = appendReceipt(proposal);
  proposal.receipt = receipt;

  recordPlaneOp('execution', true, Date.now() - proposal.createdAt);
  finalizeMutation(proposal);

  matrixBroadcast(proposal.source, MATRIX_SIGNALS.MUTATION_PROMOTED, {
    mutation_id: mutationId,
    receipt_hash: receipt.hash,
    title: proposal.title,
  });

  return proposal;
}

/** Rollback a promoted mutation */
export function rollbackMutation(mutationId: string, reason: string): MutationProposal | null {
  const proposal = completedMutations.find(m => m.id === mutationId);
  if (!proposal || proposal.phase !== 'promoted') return null;

  proposal.phase = 'rolled_back';
  proposal.updatedAt = Date.now();

  matrixBroadcast(proposal.source, MATRIX_SIGNALS.MUTATION_ROLLED_BACK, {
    mutation_id: mutationId,
    reason,
  });

  return proposal;
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

export function getActiveMutations(): MutationProposal[] {
  return Array.from(activeMutations.values());
}

export function getCompletedMutations(limit = 50): MutationProposal[] {
  return completedMutations.slice(-limit);
}

export function getMutation(id: string): MutationProposal | null {
  return activeMutations.get(id) || completedMutations.find(m => m.id === id) || null;
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL
// ═══════════════════════════════════════════════════════════════

function finalizeMutation(proposal: MutationProposal): void {
  activeMutations.delete(proposal.id);
  completedMutations.push(proposal);
  if (completedMutations.length > MAX_COMPLETED) completedMutations.shift();
}

function classifyRisk(
  changes: MutationChange[],
  targets: SubstrateModuleName[]
): 'low' | 'medium' | 'high' | 'critical' {
  const coreTargets = ['core', 'system', 'governance', 'defense'] as string[];
  const hitsCritical = targets.some(t => coreTargets.includes(t));
  const hasSchemaChange = changes.some(c => c.type === 'schema');

  if (hitsCritical && hasSchemaChange) return 'critical';
  if (hitsCritical || hasSchemaChange) return 'high';
  if (changes.length > 5) return 'medium';
  return 'low';
}
