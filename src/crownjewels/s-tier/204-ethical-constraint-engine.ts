/**
 * S-Tier 204 — Ethical Constraint Engine
 * CJPI: 91 | Module: CONSCIENCE | ID: S-CON01
 *
 * Evaluates actions against registered ethical constraints with
 * weighted scoring, harm potential analysis, override tracking,
 * and appeal mechanisms. Zero dependencies. Pure TypeScript.
 */

export interface EthicalConstraint {
  id: string;
  policy: string;
  weight: number;
  harmThreshold: number;
  category: string;
}

export interface EthicalEvaluation {
  id: string;
  action: string;
  allowed: boolean;
  score: number;
  violations: string[];
  overridden: boolean;
  evaluatedAt: string;
}

export interface EthicsStats {
  totalEvaluations: number;
  allowedCount: number;
  blockedCount: number;
  overriddenCount: number;
  avgScore: number;
  topViolatedPolicies: { policy: string; count: number }[];
}

export function createEthicalConstraintEngine() {
  const constraints: EthicalConstraint[] = [];
  const evaluations: EthicalEvaluation[] = [];
  const violationCounts = new Map<string, number>();

  function addConstraint(policy: string, weight: number, harmThreshold: number, category: string = 'general'): string {
    const id = `eth-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    constraints.push({ id, policy, weight, harmThreshold, category });
    return id;
  }

  function removeConstraint(id: string): boolean {
    const idx = constraints.findIndex(c => c.id === id);
    if (idx < 0) return false;
    constraints.splice(idx, 1);
    return true;
  }

  function evaluate(action: string, harmPotential: number, context?: Record<string, unknown>): EthicalEvaluation {
    const violations: string[] = [];
    let score = 1;
    for (const c of constraints) {
      if (harmPotential > c.harmThreshold) {
        const severity = (harmPotential - c.harmThreshold) / (1 - c.harmThreshold + 0.001);
        score -= c.weight * severity * 0.3;
        violations.push(c.policy);
        violationCounts.set(c.policy, (violationCounts.get(c.policy) ?? 0) + 1);
      }
    }
    score = Math.max(0, Math.min(1, score));
    const evaluation: EthicalEvaluation = {
      id: `eval-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action, allowed: violations.length === 0, score,
      violations, overridden: false,
      evaluatedAt: new Date().toISOString(),
    };
    evaluations.push(evaluation);
    if (evaluations.length > 1000) evaluations.shift();
    return evaluation;
  }

  function override(evaluationId: string, reason: string): boolean {
    const ev = evaluations.find(e => e.id === evaluationId);
    if (!ev) return false;
    ev.overridden = true;
    ev.allowed = true;
    return true;
  }

  function getStats(): EthicsStats {
    return {
      totalEvaluations: evaluations.length,
      allowedCount: evaluations.filter(e => e.allowed).length,
      blockedCount: evaluations.filter(e => !e.allowed).length,
      overriddenCount: evaluations.filter(e => e.overridden).length,
      avgScore: evaluations.length > 0 ? evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length : 0,
      topViolatedPolicies: [...violationCounts.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([policy, count]) => ({ policy, count })),
    };
  }

  function reset(): void { constraints.length = 0; evaluations.length = 0; violationCounts.clear(); }

  return { addConstraint, removeConstraint, evaluate, override, getStats, reset };
}
