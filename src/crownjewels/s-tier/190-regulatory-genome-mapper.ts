/**
 * S-Tier 190 — Regulatory Genome Mapper
 * ID: S-SOV03 | CJPI: 92 | Module: SOVEREIGN
 *
 * Maps regulatory frameworks across jurisdictions, computes compliance gaps,
 * generates transition plans, and tracks regulatory drift over time.
 */

export interface RegulatoryConstraint {
  framework: string;
  requirement: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  effectiveDate?: string;
  tags?: string[];
}

export interface ComplianceGap {
  requirement: string;
  severity: string;
  presentIn: string[];
  missingFrom: string[];
}

export class RegulatoryGenomeMapper {
  private constraints: Map<string, RegulatoryConstraint[]> = new Map();
  private auditLog: { jurisdiction: string; action: string; timestamp: string }[] = [];

  mapFramework(jurisdiction: string, constraints: RegulatoryConstraint[]): void {
    this.constraints.set(jurisdiction, constraints);
    this.auditLog.push({ jurisdiction, action: 'mapped', timestamp: new Date().toISOString() });
  }

  addConstraint(jurisdiction: string, constraint: RegulatoryConstraint): void {
    const existing = this.constraints.get(jurisdiction) ?? [];
    existing.push(constraint);
    this.constraints.set(jurisdiction, existing);
  }

  getProfile(jurisdiction: string): RegulatoryConstraint[] {
    return [...(this.constraints.get(jurisdiction) ?? [])];
  }

  getProfileBySeverity(jurisdiction: string, severity: RegulatoryConstraint['severity']): RegulatoryConstraint[] {
    return this.getProfile(jurisdiction).filter(c => c.severity === severity);
  }

  compareJurisdictions(a: string, b: string): { shared: number; aOnly: number; bOnly: number; gaps: ComplianceGap[] } {
    const aReqs = this.constraints.get(a) ?? [];
    const bReqs = this.constraints.get(b) ?? [];
    const aSet = new Set(aReqs.map(c => c.requirement));
    const bSet = new Set(bReqs.map(c => c.requirement));

    const shared = [...aSet].filter(r => bSet.has(r));
    const aOnly = [...aSet].filter(r => !bSet.has(r));
    const bOnly = [...bSet].filter(r => !aSet.has(r));

    const gaps: ComplianceGap[] = [
      ...aOnly.map(r => {
        const constraint = aReqs.find(c => c.requirement === r);
        return { requirement: r, severity: constraint?.severity ?? 'medium', presentIn: [a], missingFrom: [b] };
      }),
      ...bOnly.map(r => {
        const constraint = bReqs.find(c => c.requirement === r);
        return { requirement: r, severity: constraint?.severity ?? 'medium', presentIn: [b], missingFrom: [a] };
      }),
    ];

    return { shared: shared.length, aOnly: aOnly.length, bOnly: bOnly.length, gaps };
  }

  generateTransitionPlan(fromJurisdiction: string, toJurisdiction: string): { additions: RegulatoryConstraint[]; removals: string[]; effort: 'low' | 'medium' | 'high' } {
    const fromReqs = new Set((this.constraints.get(fromJurisdiction) ?? []).map(c => c.requirement));
    const toReqs = this.constraints.get(toJurisdiction) ?? [];

    const additions = toReqs.filter(c => !fromReqs.has(c.requirement));
    const removals = [...fromReqs].filter(r => !toReqs.some(c => c.requirement === r));

    const criticalCount = additions.filter(a => a.severity === 'critical').length;
    const effort: 'low' | 'medium' | 'high' = criticalCount > 3 ? 'high' : additions.length > 10 ? 'medium' : 'low';

    return { additions, removals, effort };
  }

  getJurisdictions(): string[] {
    return [...this.constraints.keys()];
  }

  getStats(): { jurisdictions: number; totalConstraints: number; criticalCount: number; auditEntries: number } {
    let totalConstraints = 0;
    let criticalCount = 0;
    for (const constraints of this.constraints.values()) {
      totalConstraints += constraints.length;
      criticalCount += constraints.filter(c => c.severity === 'critical').length;
    }
    return { jurisdictions: this.constraints.size, totalConstraints, criticalCount, auditEntries: this.auditLog.length };
  }

  reset(): void {
    this.constraints.clear();
    this.auditLog = [];
  }
}
