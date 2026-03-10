/**
 * S-Tier 190 — Regulatory Genome Mapper
 * ID: S-SOV03 | CJPI: 92 | Module: SOVEREIGN
 */
export class RegulatoryGenomeMapper {
  private constraints: Map<string, { framework: string; requirement: string; severity: 'critical' | 'high' | 'medium' | 'low' }[]> = new Map();

  mapFramework(jurisdiction: string, constraints: { framework: string; requirement: string; severity: 'critical' | 'high' | 'medium' | 'low' }[]): void {
    this.constraints.set(jurisdiction, constraints);
  }

  getProfile(jurisdiction: string): { framework: string; requirement: string; severity: string }[] {
    return this.constraints.get(jurisdiction) ?? [];
  }

  compareJurisdictions(a: string, b: string): { shared: number; aOnly: number; bOnly: number } {
    const aReqs = new Set((this.constraints.get(a) ?? []).map(c => c.requirement));
    const bReqs = new Set((this.constraints.get(b) ?? []).map(c => c.requirement));
    const shared = [...aReqs].filter(r => bReqs.has(r)).length;
    return { shared, aOnly: aReqs.size - shared, bOnly: bReqs.size - shared };
  }
}
