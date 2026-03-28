/**
 * TREATY Ultimate — Multi-Party Arbitration
 * N-party contract mediation with weighted voting,
 * quorum requirements, and binding resolution.
 */

export type ArbitrationStatus = 'convened' | 'voting' | 'quorum_reached' | 'resolved' | 'failed';

export interface ArbitrationCase {
  id: string;
  contractId: string;
  parties: string[];
  issue: string;
  options: ArbitrationOption[];
  votes: ArbitrationVote[];
  quorumThreshold: number; // 0–1, fraction of parties needed
  status: ArbitrationStatus;
  resolution: string | null;
  winningOption: string | null;
  convenedAt: number;
  resolvedAt: number | null;
}

export interface ArbitrationOption {
  id: string;
  description: string;
  proposedBy: string;
}

export interface ArbitrationVote {
  partyId: string;
  optionId: string;
  weight: number; // party voting weight
  reason: string;
  timestamp: number;
}

const MAX_CASES = 200;
const cases: ArbitrationCase[] = [];
let caseCounter = 0;

export function conveneArbitration(
  contractId: string,
  parties: string[],
  issue: string,
  options: Array<{ description: string; proposedBy: string }>,
  quorumThreshold: number = 0.67,
): ArbitrationCase {
  const arbCase: ArbitrationCase = {
    id: `arb-${++caseCounter}`,
    contractId,
    parties,
    issue,
    options: options.map((o, i) => ({ id: `opt-${i}`, ...o })),
    votes: [],
    quorumThreshold: Math.max(0.5, Math.min(1, quorumThreshold)),
    status: 'convened',
    resolution: null,
    winningOption: null,
    convenedAt: Date.now(),
    resolvedAt: null,
  };

  if (cases.length >= MAX_CASES) cases.shift();
  cases.push(arbCase);
  return arbCase;
}

export function castVote(
  caseId: string,
  partyId: string,
  optionId: string,
  weight: number = 1,
  reason: string = '',
): boolean {
  const arbCase = cases.find(c => c.id === caseId);
  if (!arbCase || arbCase.status === 'resolved' || arbCase.status === 'failed') return false;
  if (!arbCase.parties.includes(partyId)) return false;
  if (!arbCase.options.find(o => o.id === optionId)) return false;

  // Replace existing vote if party already voted
  const existingIdx = arbCase.votes.findIndex(v => v.partyId === partyId);
  const vote: ArbitrationVote = {
    partyId, optionId, weight: Math.max(0.1, weight), reason, timestamp: Date.now(),
  };

  if (existingIdx >= 0) arbCase.votes[existingIdx] = vote;
  else arbCase.votes.push(vote);

  arbCase.status = 'voting';

  // Check quorum
  const votedParties = new Set(arbCase.votes.map(v => v.partyId));
  const quorumReached = votedParties.size / arbCase.parties.length >= arbCase.quorumThreshold;

  if (quorumReached) {
    arbCase.status = 'quorum_reached';
    resolveCase(arbCase);
  }

  return true;
}

function resolveCase(arbCase: ArbitrationCase): void {
  // Weighted vote tally
  const tally = new Map<string, number>();
  for (const vote of arbCase.votes) {
    tally.set(vote.optionId, (tally.get(vote.optionId) ?? 0) + vote.weight);
  }

  let maxVotes = 0;
  let winningId: string | null = null;
  for (const [optId, votes] of tally) {
    if (votes > maxVotes) {
      maxVotes = votes;
      winningId = optId;
    }
  }

  if (winningId) {
    const option = arbCase.options.find(o => o.id === winningId);
    arbCase.winningOption = winningId;
    arbCase.resolution = option?.description ?? 'Unknown option';
    arbCase.status = 'resolved';
  } else {
    arbCase.status = 'failed';
  }

  arbCase.resolvedAt = Date.now();
}

export function getCases(): ArbitrationCase[] { return [...cases]; }
export function getCase(id: string): ArbitrationCase | undefined { return cases.find(c => c.id === id); }
export function getArbitrationStats() {
  return {
    total: cases.length,
    resolved: cases.filter(c => c.status === 'resolved').length,
    failed: cases.filter(c => c.status === 'failed').length,
    pending: cases.filter(c => c.status === 'convened' || c.status === 'voting').length,
    avgPartiesPerCase: cases.length > 0
      ? Math.round(cases.reduce((s, c) => s + c.parties.length, 0) / cases.length * 10) / 10
      : 0,
  };
}
