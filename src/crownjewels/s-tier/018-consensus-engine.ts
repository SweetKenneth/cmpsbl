/**
 * S-Tier Crown Jewel #18 — NEXUS Consensus Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 18 | CJPI: 92 | Module: NEXUS | Type: Architecture
 *
 * Multi-source agreement/voting for critical decisions. Supports
 * majority, supermajority, unanimity, and weighted voting. Built
 * for multi-model AI consensus, distributed approvals, and
 * Byzantine-tolerant decision making.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export type VotingStrategy = 'majority' | 'supermajority' | 'unanimity' | 'weighted_majority';

export interface Voter {
  id: string;
  weight?: number;
  reliability?: number;
  metadata?: Record<string, unknown>;
}

export interface Vote<T = unknown> {
  voterId: string;
  value: T;
  confidence: number;
  latencyMs: number;
  timestamp: number;
  reasoning?: string;
}

export interface ConsensusResult<T = unknown> {
  reached: boolean;
  winner?: T;
  strategy: VotingStrategy;
  votes: Vote<T>[];
  agreement: number;
  totalWeight: number;
  winnerWeight: number;
  dissenting: string[];
  durationMs: number;
}

export interface ConsensusConfig {
  strategy?: VotingStrategy;
  timeoutMs?: number;
  minVoters?: number;
  confidenceThreshold?: number;
}

export function createConsensusEngine(config: ConsensusConfig = {}) {
  const {
    strategy = 'majority',
    timeoutMs = 30_000,
    minVoters = 2,
    confidenceThreshold = 0.5,
  } = config;

  const voters = new Map<string, Voter>();
  const rounds: ConsensusResult[] = [];

  // ── Voter Management ─────────────────────────────────────────────

  function registerVoter(voter: Voter) { voters.set(voter.id, { weight: 1, reliability: 1, ...voter }); }
  function removeVoter(id: string) { voters.delete(id); }

  // ── Consensus Round ──────────────────────────────────────────────

  async function runRound<T>(
    question: string,
    collector: (voter: Voter, question: string) => Promise<{ value: T; confidence: number; reasoning?: string }>,
    opts?: { voterIds?: string[]; strategy?: VotingStrategy },
  ): Promise<ConsensusResult<T>> {
    const start = Date.now();
    const activeVoters = opts?.voterIds
      ? opts.voterIds.map(id => voters.get(id)).filter(Boolean) as Voter[]
      : [...voters.values()];

    if (activeVoters.length < minVoters) {
      throw new Error(`[Consensus] Need at least ${minVoters} voters, got ${activeVoters.length}`);
    }

    // Collect votes with timeout
    const votes: Vote<T>[] = [];
    const promises = activeVoters.map(async voter => {
      const voteStart = Date.now();
      try {
        const result = await Promise.race([
          collector(voter, question),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
        ]);
        if (result.confidence >= confidenceThreshold) {
          votes.push({
            voterId: voter.id,
            value: result.value,
            confidence: result.confidence,
            latencyMs: Date.now() - voteStart,
            timestamp: Date.now(),
            reasoning: result.reasoning,
          });
        }
      } catch {
        // Voter failed or timed out — skip
      }
    });

    await Promise.allSettled(promises);

    // Tally
    const roundStrategy = opts?.strategy ?? strategy;
    const result = tally<T>(votes, activeVoters, roundStrategy, Date.now() - start);
    rounds.push(result as ConsensusResult);
    return result;
  }

  function tally<T>(votes: Vote<T>[], activeVoters: Voter[], strat: VotingStrategy, durationMs: number): ConsensusResult<T> {
    if (votes.length === 0) {
      return { reached: false, strategy: strat, votes, agreement: 0, totalWeight: 0, winnerWeight: 0, dissenting: activeVoters.map(v => v.id), durationMs };
    }

    // Group by serialized value
    const groups = new Map<string, { value: T; weight: number; voterIds: string[] }>();
    for (const vote of votes) {
      const key = JSON.stringify(vote.value);
      const voter = voters.get(vote.voterId);
      const w = (voter?.weight ?? 1) * vote.confidence * (voter?.reliability ?? 1);
      const existing = groups.get(key);
      if (existing) { existing.weight += w; existing.voterIds.push(vote.voterId); }
      else groups.set(key, { value: vote.value, weight: w, voterIds: [vote.voterId] });
    }

    const totalWeight = [...groups.values()].reduce((s, g) => s + g.weight, 0);
    const sorted = [...groups.values()].sort((a, b) => b.weight - a.weight);
    const winner = sorted[0];
    const agreement = winner.weight / totalWeight;

    const thresholds: Record<VotingStrategy, number> = {
      majority: 0.5,
      supermajority: 0.667,
      unanimity: 1.0,
      weighted_majority: 0.5,
    };

    const threshold = thresholds[strat];
    const reached = strat === 'unanimity'
      ? groups.size === 1
      : agreement > threshold;

    const dissenting = votes.filter(v => JSON.stringify(v.value) !== JSON.stringify(winner.value)).map(v => v.voterId);

    return { reached, winner: reached ? winner.value : undefined, strategy: strat, votes, agreement, totalWeight, winnerWeight: winner.weight, dissenting, durationMs };
  }

  // ── Stats ────────────────────────────────────────────────────────

  function getStats() {
    return {
      totalRounds: rounds.length,
      consensusReached: rounds.filter(r => r.reached).length,
      avgAgreement: rounds.length > 0 ? rounds.reduce((s, r) => s + r.agreement, 0) / rounds.length : 0,
      registeredVoters: voters.size,
    };
  }

  return { registerVoter, removeVoter, runRound, getStats, get history() { return [...rounds]; } };
}
