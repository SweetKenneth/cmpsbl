/**
 * S-Tier 057 — Moral Reasoning Graph
 * CJPI: 93 | Node: CONSCIENCE | ID: S-CON02
 *
 * Evaluates actions against a weighted ethical framework.
 * Flags violations and computes an ethics score.
 */

export interface EthicalPrinciple {
  id: string;
  name: string;
  weight: number; // 0-1
  description: string;
}

export interface EthicsEvaluation {
  action: string;
  score: number;            // 0-100
  violations: string[];
  approvedPrinciples: string[];
  verdict: 'approved' | 'flagged' | 'blocked';
}

const DEFAULT_PRINCIPLES: EthicalPrinciple[] = [
  { id: 'transparency', name: 'Transparency', weight: 0.25, description: 'Actions must be explainable' },
  { id: 'consent', name: 'User Consent', weight: 0.3, description: 'User must have opted in' },
  { id: 'privacy', name: 'Privacy', weight: 0.25, description: 'Personal data must be protected' },
  { id: 'fairness', name: 'Fairness', weight: 0.2, description: 'No discriminatory outcomes' },
];

export function evaluate(
  action: string,
  satisfiedPrinciples: string[],
  principles: EthicalPrinciple[] = DEFAULT_PRINCIPLES
): EthicsEvaluation {
  const satisfied = new Set(satisfiedPrinciples);
  let score = 0;
  const violations: string[] = [];
  const approved: string[] = [];

  for (const p of principles) {
    if (satisfied.has(p.id)) {
      score += p.weight * 100;
      approved.push(p.name);
    } else {
      violations.push(p.name);
    }
  }

  score = Math.round(score);
  const verdict: EthicsEvaluation['verdict'] =
    score >= 80 ? 'approved' : score >= 50 ? 'flagged' : 'blocked';

  return { action, score, violations, approvedPrinciples: approved, verdict };
}

export { DEFAULT_PRINCIPLES };
