/**
 * S-Tier 195 — Proximity Intelligence Engine
 * ID: S-CMP02 | CJPI: 92 | Module: COMPASS
 */
export class ProximityIntelligenceEngine {
  private entities: Map<string, { type: string; lat: number; lon: number; velocity: number; heading: number }> = new Map();

  track(id: string, type: string, lat: number, lon: number, velocity: number = 0, heading: number = 0): void {
    this.entities.set(id, { type, lat, lon, velocity, heading });
  }

  findNearby(lat: number, lon: number, radiusKm: number): { id: string; distance: number; type: string }[] {
    return [...this.entities.entries()]
      .map(([id, e]) => ({ id, distance: this.haversine(lat, lon, e.lat, e.lon), type: e.type }))
      .filter(e => e.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
