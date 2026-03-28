/**
 * TREATY Ultimate — Dispute Resolution Engine
 * Automated arbitration for contract disputes with multi-party mediation,
 * evidence weighting, and binding verdict generation.
 */

export type DisputeStatus = 'filed' | 'evidence_gathering' | 'arbitrating' | 'resolved' | 'escalated' | 'dismissed';
export type VerdictOutcome = 'upheld' | 'partially_upheld' | 'dismissed' | 'settled' | 'escalated';

export interface Dispute {
  id: string;
  contractId: string;
  filedBy: string;
  against: string;
  clause: string;
  description: string;
  status: DisputeStatus;
  evidence: Evidence[];
  verdict: Verdict | null;
  filedAt: number;
  resolvedAt: number | null;
  escalationLevel: number;
}

export interface Evidence {
  id: string;
  submittedBy: string;
  type: 'metric_log' | 'timestamp_proof' | 'witness_statement' | 'audit_trail';
  content: string;
  weight: number; // 0–1, calculated by evidence quality
  submittedAt: number;
}

export interface Verdict {
  outcome: VerdictOutcome;
  reasoning: string;
  penaltyAdjustment: number; // -1 to +1 multiplier on existing penalties
  compensationAmount: number;
  bindingUntil: number;
  issuedAt: number;
}

const MAX_DISPUTES = 500;
const disputes: Dispute[] = [];
let disputeCounter = 0;
let totalResolved = 0;
let totalEscalated = 0;

export function fileDispute(
  contractId: string,
  filedBy: string,
  against: string,
  clause: string,
  description: string,
): Dispute {
  const dispute: Dispute = {
    id: `dispute-${++disputeCounter}`,
    contractId,
    filedBy,
    against,
    clause,
    description,
    status: 'filed',
    evidence: [],
    verdict: null,
    filedAt: Date.now(),
    resolvedAt: null,
    escalationLevel: 0,
  };

  if (disputes.length >= MAX_DISPUTES) disputes.shift();
  disputes.push(dispute);
  return dispute;
}

export function submitEvidence(disputeId: string, submittedBy: string, type: Evidence['type'], content: string): Evidence | null {
  const dispute = disputes.find(d => d.id === disputeId);
  if (!dispute || dispute.status === 'resolved' || dispute.status === 'dismissed') return null;

  // Evidence quality weighting by type
  const typeWeights: Record<Evidence['type'], number> = {
    audit_trail: 0.95,
    metric_log: 0.85,
    timestamp_proof: 0.80,
    witness_statement: 0.60,
  };

  const evidence: Evidence = {
    id: `ev-${disputeId}-${dispute.evidence.length}`,
    submittedBy,
    type,
    content,
    weight: typeWeights[type],
    submittedAt: Date.now(),
  };

  dispute.evidence.push(evidence);
  if (dispute.status === 'filed') dispute.status = 'evidence_gathering';
  return evidence;
}

export function arbitrate(disputeId: string): Verdict | null {
  const dispute = disputes.find(d => d.id === disputeId);
  if (!dispute || dispute.status === 'resolved' || dispute.status === 'dismissed') return null;

  dispute.status = 'arbitrating';

  // Weighted evidence scoring per party
  const filerEvidence = dispute.evidence.filter(e => e.submittedBy === dispute.filedBy);
  const defendantEvidence = dispute.evidence.filter(e => e.submittedBy === dispute.against);

  const filerScore = filerEvidence.reduce((s, e) => s + e.weight, 0);
  const defendantScore = defendantEvidence.reduce((s, e) => s + e.weight, 0);
  const totalWeight = filerScore + defendantScore;

  let outcome: VerdictOutcome;
  let penaltyAdjustment: number;
  let compensationAmount: number;

  if (totalWeight === 0) {
    // No evidence — dismiss
    outcome = 'dismissed';
    penaltyAdjustment = 0;
    compensationAmount = 0;
  } else {
    const filerRatio = filerScore / totalWeight;

    if (filerRatio >= 0.75) {
      outcome = 'upheld';
      penaltyAdjustment = 0.5; // increase penalties on defendant
      compensationAmount = Math.round(filerScore * 100);
    } else if (filerRatio >= 0.55) {
      outcome = 'partially_upheld';
      penaltyAdjustment = 0.2;
      compensationAmount = Math.round(filerScore * 50);
    } else if (filerRatio >= 0.4) {
      outcome = 'settled';
      penaltyAdjustment = 0;
      compensationAmount = 0;
    } else {
      outcome = 'dismissed';
      penaltyAdjustment = -0.2; // reduce penalties (defendant was right)
      compensationAmount = 0;
    }
  }

  const verdict: Verdict = {
    outcome,
    reasoning: `Evidence weight: filer=${filerScore.toFixed(2)}, defendant=${defendantScore.toFixed(2)}. ${dispute.evidence.length} exhibits reviewed.`,
    penaltyAdjustment,
    compensationAmount,
    bindingUntil: Date.now() + 90 * 86400_000, // 90-day binding period
    issuedAt: Date.now(),
  };

  dispute.verdict = verdict;
  dispute.status = outcome === 'escalated' ? 'escalated' : 'resolved';
  dispute.resolvedAt = Date.now();

  if (dispute.status === 'resolved') totalResolved++;
  else totalEscalated++;

  return verdict;
}

export function escalateDispute(disputeId: string): boolean {
  const dispute = disputes.find(d => d.id === disputeId);
  if (!dispute || dispute.status === 'resolved') return false;

  dispute.escalationLevel++;
  dispute.status = 'escalated';
  totalEscalated++;
  return true;
}

export function getDisputeStats() {
  return {
    total: disputes.length,
    resolved: totalResolved,
    escalated: totalEscalated,
    pending: disputes.filter(d => d.status !== 'resolved' && d.status !== 'dismissed').length,
    avgEvidencePerDispute: disputes.length > 0
      ? Math.round(disputes.reduce((s, d) => s + d.evidence.length, 0) / disputes.length * 10) / 10
      : 0,
  };
}

export function getDisputes(): Dispute[] { return [...disputes]; }
export function getDispute(id: string): Dispute | undefined { return disputes.find(d => d.id === id); }
