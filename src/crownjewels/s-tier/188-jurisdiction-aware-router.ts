/**
 * S-Tier 188 — Jurisdiction-Aware Router (SYN06)
 * ID: S-SYN06 | CJPI: 92 | Module: COMPASS×SOVEREIGN
 */
export class JurisdictionAwareRouter {
  private zones: Map<string, { jurisdiction: string; policies: string[]; latencyMs: number }> = new Map();

  registerZone(id: string, jurisdiction: string, policies: string[], latencyMs: number): void {
    this.zones.set(id, { jurisdiction, policies, latencyMs });
  }

  route(dataType: string, requiredJurisdiction: string): { zoneId: string; latencyMs: number } | null {
    const candidates = [...this.zones.entries()]
      .filter(([, z]) => z.jurisdiction === requiredJurisdiction)
      .sort((a, b) => a[1].latencyMs - b[1].latencyMs);
    return candidates.length > 0 ? { zoneId: candidates[0][0], latencyMs: candidates[0][1].latencyMs } : null;
  }

  getCompliantZones(jurisdiction: string): string[] {
    return [...this.zones.entries()].filter(([, z]) => z.jurisdiction === jurisdiction).map(([id]) => id);
  }
}
