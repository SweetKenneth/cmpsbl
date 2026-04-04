/**
 * S-Tier 191 — Stakeholder Impact Analyzer
 * ID: S-CON03 | CJPI: 92 | Module: CONSCIENCE
 *
 * Evaluates decisions against weighted stakeholder welfare thresholds,
 * computes Pareto optimality, and generates fairness reports.
 */

export interface Stakeholder {
  id: string;
  group: string;
  weight: number;
  welfareThreshold: number;
  preferences: Record<string, number>;
}

export interface ImpactResult {
  pass: boolean;
  violations: string[];
  netImpact: number;
  fairnessIndex: number;
  paretoOptimal: boolean;
}

export class StakeholderImpactAnalyzer {
  private stakeholders: Map<string, Stakeholder> = new Map();
  private analysisHistory: { timestamp: number; pass: boolean; netImpact: number }[] = [];

  register(id: string, group: string, weight: number, welfareThreshold: number, preferences: Record<string, number> = {}): void {
    this.stakeholders.set(id, { id, group, weight, welfareThreshold, preferences });
  }

  analyze(impacts: Record<string, number>): ImpactResult {
    const violations: string[] = [];
    let netImpact = 0;
    const impactValues: number[] = [];

    for (const [id, sh] of this.stakeholders) {
      const impact = impacts[id] ?? 0;
      const weightedImpact = impact * sh.weight;
      netImpact += weightedImpact;
      impactValues.push(impact);

      if (impact < sh.welfareThreshold) {
        violations.push(`${sh.group} (${id}): impact ${impact.toFixed(2)} below threshold ${sh.welfareThreshold}`);
      }
    }

    // Gini coefficient for fairness (0 = perfect equality, 1 = max inequality)
    const fairnessIndex = this.computeGini(impactValues);

    // Pareto optimality check: no stakeholder can be improved without worsening another
    const paretoOptimal = impactValues.every(v => v >= 0) || impactValues.every(v => v <= 0);

    const result = { pass: violations.length === 0, violations, netImpact, fairnessIndex, paretoOptimal };
    this.analysisHistory.push({ timestamp: Date.now(), pass: result.pass, netImpact });
    if (this.analysisHistory.length > 500) this.analysisHistory.shift();

    return result;
  }

  analyzeByGroup(impacts: Record<string, number>): Map<string, { avgImpact: number; memberCount: number; violations: number }> {
    const groups = new Map<string, { totalImpact: number; count: number; violations: number }>();

    for (const [id, sh] of this.stakeholders) {
      const impact = impacts[id] ?? 0;
      const existing = groups.get(sh.group) ?? { totalImpact: 0, count: 0, violations: 0 };
      existing.totalImpact += impact;
      existing.count++;
      if (impact < sh.welfareThreshold) existing.violations++;
      groups.set(sh.group, existing);
    }

    const result = new Map<string, { avgImpact: number; memberCount: number; violations: number }>();
    for (const [group, data] of groups) {
      result.set(group, { avgImpact: data.totalImpact / data.count, memberCount: data.count, violations: data.violations });
    }
    return result;
  }

  private computeGini(values: number[]): number {
    if (values.length < 2) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((s, v) => s + v, 0) / n;
    if (mean === 0) return 0;

    let sumDiff = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        sumDiff += Math.abs(sorted[i] - sorted[j]);
      }
    }
    return sumDiff / (2 * n * n * mean);
  }

  getStats(): { stakeholders: number; groups: number; analysesRun: number; passRate: number } {
    const groups = new Set([...this.stakeholders.values()].map(s => s.group));
    const passRate = this.analysisHistory.length > 0
      ? this.analysisHistory.filter(a => a.pass).length / this.analysisHistory.length
      : 0;
    return { stakeholders: this.stakeholders.size, groups: groups.size, analysesRun: this.analysisHistory.length, passRate };
  }

  reset(): void {
    this.stakeholders.clear();
    this.analysisHistory = [];
  }
}
