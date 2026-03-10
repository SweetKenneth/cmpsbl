/**
 * S-Tier 191 — Stakeholder Impact Analyzer
 * ID: S-CON03 | CJPI: 92 | Module: CONSCIENCE
 */
export class StakeholderImpactAnalyzer {
  private stakeholders: Map<string, { group: string; weight: number; welfareThreshold: number }> = new Map();

  register(id: string, group: string, weight: number, welfareThreshold: number): void {
    this.stakeholders.set(id, { group, weight, welfareThreshold });
  }

  analyze(impacts: Record<string, number>): { pass: boolean; violations: string[]; netImpact: number } {
    const violations: string[] = [];
    let netImpact = 0;
    for (const [id, sh] of this.stakeholders) {
      const impact = impacts[id] ?? 0;
      netImpact += impact * sh.weight;
      if (impact < sh.welfareThreshold) violations.push(`${sh.group}: impact ${impact} below threshold ${sh.welfareThreshold}`);
    }
    return { pass: violations.length === 0, violations, netImpact };
  }
}
