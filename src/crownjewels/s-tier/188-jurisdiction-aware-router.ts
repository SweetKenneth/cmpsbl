/**
 * S-Tier 188 — Jurisdiction-Aware Router (SYN06)
 * ID: S-SYN06 | CJPI: 92 | Module: COMPASS×SOVEREIGN
 *
 * Routes data to compliant processing zones based on jurisdiction,
 * supports multi-hop routing, policy intersection checks, and
 * latency-optimized path selection.
 */

export interface Zone {
  id: string;
  jurisdiction: string;
  policies: string[];
  latencyMs: number;
  capacityRps: number;
  currentLoad: number;
}

export interface RouteResult {
  zoneId: string;
  latencyMs: number;
  path: string[];
  complianceScore: number;
}

export class JurisdictionAwareRouter {
  private zones: Map<string, Zone> = new Map();
  private routeLog: { from: string; to: string; zoneId: string; timestamp: number }[] = [];

  registerZone(id: string, jurisdiction: string, policies: string[], latencyMs: number, capacityRps: number = 1000): void {
    this.zones.set(id, { id, jurisdiction, policies, latencyMs, capacityRps, currentLoad: 0 });
  }

  route(dataType: string, requiredJurisdiction: string, requiredPolicies: string[] = []): RouteResult | null {
    const candidates = [...this.zones.values()]
      .filter(z => z.jurisdiction === requiredJurisdiction)
      .filter(z => requiredPolicies.every(p => z.policies.includes(p)))
      .filter(z => z.currentLoad < z.capacityRps)
      .sort((a, b) => {
        // Weight: 60% latency, 40% available capacity
        const aScore = a.latencyMs * 0.6 + (a.currentLoad / a.capacityRps) * 100 * 0.4;
        const bScore = b.latencyMs * 0.6 + (b.currentLoad / b.capacityRps) * 100 * 0.4;
        return aScore - bScore;
      });

    if (candidates.length === 0) return null;

    const selected = candidates[0];
    selected.currentLoad++;
    const complianceScore = requiredPolicies.length > 0
      ? requiredPolicies.filter(p => selected.policies.includes(p)).length / requiredPolicies.length
      : 1;

    this.routeLog.push({ from: dataType, to: requiredJurisdiction, zoneId: selected.id, timestamp: Date.now() });
    if (this.routeLog.length > 1000) this.routeLog = this.routeLog.slice(-1000);

    return { zoneId: selected.id, latencyMs: selected.latencyMs, path: [selected.id], complianceScore };
  }

  routeMultiHop(dataType: string, jurisdictions: string[]): RouteResult[] | null {
    const results: RouteResult[] = [];
    for (const jurisdiction of jurisdictions) {
      const result = this.route(dataType, jurisdiction);
      if (!result) return null;
      results.push(result);
    }
    return results;
  }

  getCompliantZones(jurisdiction: string, requiredPolicies: string[] = []): Zone[] {
    return [...this.zones.values()]
      .filter(z => z.jurisdiction === jurisdiction)
      .filter(z => requiredPolicies.every(p => z.policies.includes(p)));
  }

  checkPolicyIntersection(zoneA: string, zoneB: string): { shared: string[]; aOnly: string[]; bOnly: string[] } {
    const a = new Set(this.zones.get(zoneA)?.policies ?? []);
    const b = new Set(this.zones.get(zoneB)?.policies ?? []);
    const shared = [...a].filter(p => b.has(p));
    return { shared, aOnly: [...a].filter(p => !b.has(p)), bOnly: [...b].filter(p => !a.has(p)) };
  }

  getStats(): { totalZones: number; jurisdictions: string[]; totalRoutes: number; avgLatency: number } {
    const zones = [...this.zones.values()];
    const jurisdictions = [...new Set(zones.map(z => z.jurisdiction))];
    const avgLatency = zones.length > 0 ? zones.reduce((s, z) => s + z.latencyMs, 0) / zones.length : 0;
    return { totalZones: zones.length, jurisdictions, totalRoutes: this.routeLog.length, avgLatency };
  }

  reset(): void {
    this.zones.clear();
    this.routeLog = [];
  }
}
