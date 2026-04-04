/**
 * S-Tier 214 — Geofenced Policy Engine
 * ID: S-CMP03 | CJPI: 91 | Module: COMPASS
 *
 * Location-aware policy enforcement with overlapping geofence resolution,
 * priority-based conflict handling, and policy audit trails.
 */

export interface Geofence {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radiusKm: number;
  policies: string[];
  priority: number;
  active: boolean;
  createdAt: number;
}

export interface PolicyResult {
  activePolicies: string[];
  matchedFences: { id: string; name: string; distance: number; priority: number }[];
  conflicts: string[];
}

export class GeofencedPolicyEngine {
  private geofences: Map<string, Geofence> = new Map();
  private queryLog: { lat: number; lon: number; matchCount: number; timestamp: number }[] = [];

  addGeofence(name: string, lat: number, lon: number, radiusKm: number, policies: string[], priority: number = 0): string {
    const id = crypto.randomUUID();
    this.geofences.set(id, { id, name, lat, lon, radiusKm, policies, priority, active: true, createdAt: Date.now() });
    return id;
  }

  removeGeofence(id: string): boolean {
    return this.geofences.delete(id);
  }

  toggleGeofence(id: string, active: boolean): boolean {
    const g = this.geofences.get(id);
    if (!g) return false;
    g.active = active;
    return true;
  }

  getActivePolicies(lat: number, lon: number): PolicyResult {
    const matched: { id: string; name: string; distance: number; priority: number; policies: string[] }[] = [];

    for (const g of this.geofences.values()) {
      if (!g.active) continue;
      const d = this.haversine(lat, lon, g.lat, g.lon);
      if (d <= g.radiusKm) {
        matched.push({ id: g.id, name: g.name, distance: d, priority: g.priority, policies: g.policies });
      }
    }

    // Sort by priority (highest first)
    matched.sort((a, b) => b.priority - a.priority);

    // Resolve conflicts: higher priority wins
    const policyOwner = new Map<string, number>(); // policy → priority
    const conflicts: string[] = [];
    const activePolicies = new Set<string>();

    for (const fence of matched) {
      for (const policy of fence.policies) {
        const existingPriority = policyOwner.get(policy);
        if (existingPriority !== undefined && existingPriority !== fence.priority) {
          conflicts.push(`${policy} (conflict between priority ${existingPriority} and ${fence.priority})`);
        }
        if (existingPriority === undefined || fence.priority >= existingPriority) {
          policyOwner.set(policy, fence.priority);
          activePolicies.add(policy);
        }
      }
    }

    this.queryLog.push({ lat, lon, matchCount: matched.length, timestamp: Date.now() });
    if (this.queryLog.length > 1000) this.queryLog.shift();

    return {
      activePolicies: [...activePolicies],
      matchedFences: matched.map(m => ({ id: m.id, name: m.name, distance: m.distance, priority: m.priority })),
      conflicts,
    };
  }

  findOverlaps(): { fenceA: string; fenceB: string; overlapKm: number }[] {
    const overlaps: { fenceA: string; fenceB: string; overlapKm: number }[] = [];
    const fences = [...this.geofences.values()];

    for (let i = 0; i < fences.length; i++) {
      for (let j = i + 1; j < fences.length; j++) {
        const dist = this.haversine(fences[i].lat, fences[i].lon, fences[j].lat, fences[j].lon);
        const combinedRadius = fences[i].radiusKm + fences[j].radiusKm;
        if (dist < combinedRadius) {
          overlaps.push({ fenceA: fences[i].id, fenceB: fences[j].id, overlapKm: combinedRadius - dist });
        }
      }
    }

    return overlaps;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  getStats(): { totalFences: number; activeFences: number; totalQueries: number; avgMatchesPerQuery: number } {
    const active = [...this.geofences.values()].filter(g => g.active).length;
    const avgMatches = this.queryLog.length > 0
      ? this.queryLog.reduce((s, q) => s + q.matchCount, 0) / this.queryLog.length
      : 0;
    return { totalFences: this.geofences.size, activeFences: active, totalQueries: this.queryLog.length, avgMatchesPerQuery: avgMatches };
  }

  reset(): void {
    this.geofences.clear();
    this.queryLog = [];
  }
}
