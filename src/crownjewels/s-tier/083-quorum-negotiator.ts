/**
 * S-Tier 083 — Quorum Negotiator
 * CJPI: 91 | Node: NERVE | ID: S-80
 *
 * Negotiates quorum across distributed substrate instances.
 * Prevents split-brain by requiring majority agreement.
 */

export interface QuorumVote {
  instanceId: string;
  proposalId: string;
  vote: 'accept' | 'reject' | 'abstain';
  timestamp: number;
}

export interface QuorumResult {
  proposalId: string;
  reached: boolean;
  acceptCount: number;
  rejectCount: number;
  abstainCount: number;
  totalVoters: number;
  quorumSize: number;
}

export function calculateQuorum(totalVoters: number): number {
  return Math.floor(totalVoters / 2) + 1;
}

export function evaluateQuorum(votes: QuorumVote[], totalVoters: number): QuorumResult {
  const proposalId = votes[0]?.proposalId ?? 'unknown';
  const accept = votes.filter(v => v.vote === 'accept').length;
  const reject = votes.filter(v => v.vote === 'reject').length;
  const abstain = votes.filter(v => v.vote === 'abstain').length;
  const quorumSize = calculateQuorum(totalVoters);

  return {
    proposalId,
    reached: accept >= quorumSize,
    acceptCount: accept,
    rejectCount: reject,
    abstainCount: abstain,
    totalVoters,
    quorumSize,
  };
}
