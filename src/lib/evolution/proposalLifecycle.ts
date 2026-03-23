/**
 * Proposal Lifecycle Engine — EVOLUTION v9.0.0
 * Deterministic 13-step mutation loop with state persistence and step rollback.
 */

// --- Types ---

export type ProposalStep =
  | 'DRAFT' | 'LINT' | 'TEST' | 'SCAN' | 'SIMULATE'
  | 'REVIEW' | 'GATE' | 'APPROVE' | 'SHADOW' | 'APPLY'
  | 'VERIFY' | 'ANCHOR' | 'PROMOTE';

export type ProposalStatus = 'active' | 'completed' | 'failed' | 'rolled_back';

export interface MutationProposal {
  id: string;
  title: string;
  description: string;
  impactedModules: string[];
  currentStep: ProposalStep;
  status: ProposalStatus;
  stepHistory: StepRecord[];
  createdAt: number;
  updatedAt: number;
  metadata: Record<string, unknown>;
}

export interface StepRecord {
  step: ProposalStep;
  enteredAt: number;
  exitedAt?: number;
  result: 'pending' | 'passed' | 'failed' | 'skipped';
  findings: string[];
}

// --- Constants ---

const STEP_ORDER: ProposalStep[] = [
  'DRAFT', 'LINT', 'TEST', 'SCAN', 'SIMULATE',
  'REVIEW', 'GATE', 'APPROVE', 'SHADOW', 'APPLY',
  'VERIFY', 'ANCHOR', 'PROMOTE',
];

const MAX_PROPOSALS = 200;

// --- State ---

const proposals: Map<string, MutationProposal> = new Map();

// --- Core ---

export function createProposal(
  id: string,
  title: string,
  description: string,
  impactedModules: string[]
): MutationProposal {
  const now = Date.now();
  const proposal: MutationProposal = {
    id, title, description, impactedModules,
    currentStep: 'DRAFT',
    status: 'active',
    stepHistory: [{ step: 'DRAFT', enteredAt: now, result: 'pending', findings: [] }],
    createdAt: now,
    updatedAt: now,
    metadata: {},
  };

  proposals.set(id, proposal);

  if (proposals.size > MAX_PROPOSALS) {
    const oldest = [...proposals.entries()]
      .filter(([, p]) => p.status !== 'active')
      .sort((a, b) => a[1].updatedAt - b[1].updatedAt);
    if (oldest.length > 0) proposals.delete(oldest[0][0]);
  }

  return { ...proposal };
}

export function advanceStep(
  proposalId: string,
  result: 'passed' | 'failed',
  findings: string[] = []
): { success: boolean; error?: string; newStep?: ProposalStep } {
  const proposal = proposals.get(proposalId);
  if (!proposal) return { success: false, error: 'Proposal not found' };
  if (proposal.status !== 'active') return { success: false, error: `Proposal is ${proposal.status}` };

  const currentIdx = STEP_ORDER.indexOf(proposal.currentStep);
  const currentRecord = proposal.stepHistory[proposal.stepHistory.length - 1];

  currentRecord.exitedAt = Date.now();
  currentRecord.result = result;
  currentRecord.findings = findings;

  if (result === 'failed') {
    proposal.status = 'failed';
    proposal.updatedAt = Date.now();
    return { success: true, newStep: proposal.currentStep };
  }

  // Advance to next step
  if (currentIdx >= STEP_ORDER.length - 1) {
    proposal.status = 'completed';
    proposal.updatedAt = Date.now();
    return { success: true, newStep: 'PROMOTE' };
  }

  const nextStep = STEP_ORDER[currentIdx + 1];
  proposal.currentStep = nextStep;
  proposal.stepHistory.push({ step: nextStep, enteredAt: Date.now(), result: 'pending', findings: [] });
  proposal.updatedAt = Date.now();

  return { success: true, newStep: nextStep };
}

export function rollbackStep(proposalId: string): { success: boolean; error?: string; step?: ProposalStep } {
  const proposal = proposals.get(proposalId);
  if (!proposal) return { success: false, error: 'Proposal not found' };

  const currentIdx = STEP_ORDER.indexOf(proposal.currentStep);
  if (currentIdx <= 0) return { success: false, error: 'Cannot rollback past DRAFT' };

  const prevStep = STEP_ORDER[currentIdx - 1];
  proposal.currentStep = prevStep;
  proposal.stepHistory.push({ step: prevStep, enteredAt: Date.now(), result: 'pending', findings: ['Rolled back'] });
  proposal.status = 'active';
  proposal.updatedAt = Date.now();

  return { success: true, step: prevStep };
}

export function getProposal(id: string): MutationProposal | null {
  const p = proposals.get(id);
  return p ? { ...p, stepHistory: [...p.stepHistory] } : null;
}

export function getActiveProposals(): MutationProposal[] {
  return [...proposals.values()].filter(p => p.status === 'active').map(p => ({ ...p }));
}

export function getAllProposals(): MutationProposal[] {
  return [...proposals.values()].map(p => ({ ...p }));
}

export function getStepOrder(): ProposalStep[] {
  return [...STEP_ORDER];
}

export function clearProposalState(): void {
  proposals.clear();
}
