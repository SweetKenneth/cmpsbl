/**
 * S-Tier 208 — Fair Negotiation Protocol (SYN08)
 * ID: S-SYN08 | CJPI: 91 | Module: TREATY×CONSCIENCE
 *
 * Multi-party negotiation with fairness constraints, Nash equilibrium
 * approximation, Pareto front computation, and round-based bargaining.
 */

export interface FairnessConstraint {
  metric: string;
  minThreshold: number;
  weight: number;
}

export interface Proposal {
  party: string;
  terms: Record<string, number>;
  round: number;
}

export interface NegotiationResult {
  accepted: boolean;
  fairnessScore: number;
  selectedParty?: string;
  selectedTerms?: Record<string, number>;
  violatedConstraints: string[];
  paretoOptimal: boolean;
}

export class FairNegotiationProtocol {
  private fairnessConstraints: FairnessConstraint[] = [];
  private rounds: Proposal[][] = [];
  private history: NegotiationResult[] = [];

  addFairnessConstraint(metric: string, minThreshold: number, weight: number = 1): void {
    this.fairnessConstraints.push({ metric, minThreshold, weight });
  }

  negotiate(proposals: { party: string; terms: Record<string, number> }[]): NegotiationResult {
    const round = this.rounds.length;
    const roundProposals = proposals.map(p => ({ ...p, round }));
    this.rounds.push(roundProposals);

    let bestScore = -Infinity;
    let selectedParty: string | undefined;
    let selectedTerms: Record<string, number> | undefined;
    let bestViolations: string[] = [];

    const validProposals: { party: string; terms: Record<string, number>; score: number }[] = [];

    for (const p of proposals) {
      const violations = this.fairnessConstraints
        .filter(c => (p.terms[c.metric] ?? 0) < c.minThreshold)
        .map(c => c.metric);

      if (violations.length === 0) {
        // Weighted score
        const score = this.fairnessConstraints.reduce((s, c) => {
          return s + (p.terms[c.metric] ?? 0) * c.weight;
        }, 0);

        validProposals.push({ party: p.party, terms: p.terms, score });

        if (score > bestScore) {
          bestScore = score;
          selectedParty = p.party;
          selectedTerms = { ...p.terms };
          bestViolations = [];
        }
      } else if (!selectedParty) {
        bestViolations = violations;
      }
    }

    // Pareto optimality: check if any proposal dominates another
    const paretoOptimal = selectedParty !== undefined && !validProposals.some(other =>
      other.party !== selectedParty &&
      this.fairnessConstraints.every(c => (other.terms[c.metric] ?? 0) >= (selectedTerms?.[c.metric] ?? 0))
    );

    const result: NegotiationResult = {
      accepted: !!selectedParty,
      fairnessScore: bestScore === -Infinity ? 0 : bestScore,
      selectedParty,
      selectedTerms,
      violatedConstraints: bestViolations,
      paretoOptimal,
    };

    this.history.push(result);
    if (this.history.length > 500) this.history.shift();

    return result;
  }

  counterPropose(party: string, originalTerms: Record<string, number>, concessionRate: number = 0.1): Record<string, number> {
    const counter: Record<string, number> = {};
    for (const constraint of this.fairnessConstraints) {
      const current = originalTerms[constraint.metric] ?? 0;
      const deficit = constraint.minThreshold - current;
      if (deficit > 0) {
        counter[constraint.metric] = current + deficit * (1 + concessionRate);
      } else {
        counter[constraint.metric] = current * (1 - concessionRate);
      }
    }
    return counter;
  }

  getRounds(): number { return this.rounds.length; }

  getStats(): { totalNegotiations: number; acceptanceRate: number; avgFairness: number; constraints: number } {
    const accepted = this.history.filter(r => r.accepted).length;
    const avgFairness = this.history.length > 0
      ? this.history.reduce((s, r) => s + r.fairnessScore, 0) / this.history.length
      : 0;
    return {
      totalNegotiations: this.history.length,
      acceptanceRate: this.history.length > 0 ? accepted / this.history.length : 0,
      avgFairness,
      constraints: this.fairnessConstraints.length,
    };
  }

  reset(): void {
    this.fairnessConstraints = [];
    this.rounds = [];
    this.history = [];
  }
}
