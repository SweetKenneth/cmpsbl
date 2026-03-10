/**
 * S-Tier 214 — Geofenced Policy Engine
 * ID: S-CMP03 | CJPI: 91 | Module: COMPASS
 */
export class GeofencedPolicyEngine {
  private geofences: { id: string; lat: number; lon: number; radiusKm: number; policies: string[] }[] = [];

  addGeofence(lat: number, lon: number, radiusKm: number, policies: string[]): string {
    const id = crypto.randomUUID();
    this.geofences.push({ id, lat, lon, radiusKm, policies });
    return id;
  }

  getActivePolicies(lat: number, lon: number): string[] {
    const active: string[] = [];
    for (const g of this.geofences) {
      const d = Math.sqrt((lat - g.lat) ** 2 + (lon - g.lon) ** 2) * 111;
      if (d <= g.radiusKm) active.push(...g.policies);
    }
    return [...new Set(active)];
  }
}
