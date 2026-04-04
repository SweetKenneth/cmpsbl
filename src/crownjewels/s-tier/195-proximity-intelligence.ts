/**
 * S-Tier 195 — Proximity Intelligence Engine
 * ID: S-CMP02 | CJPI: 92 | Module: COMPASS
 *
 * Tracks entities in geospatial space, computes proximity alerts,
 * predicts collisions via velocity vectors, and clusters nearby entities.
 */

export interface TrackedEntity {
  id: string;
  type: string;
  lat: number;
  lon: number;
  velocity: number;
  heading: number;
  lastUpdated: number;
}

export interface ProximityAlert {
  entityA: string;
  entityB: string;
  distance: number;
  closingSpeed: number;
  estimatedContactMs: number | null;
}

export class ProximityIntelligenceEngine {
  private entities: Map<string, TrackedEntity> = new Map();
  private alerts: ProximityAlert[] = [];

  track(id: string, type: string, lat: number, lon: number, velocity: number = 0, heading: number = 0): void {
    this.entities.set(id, { id, type, lat, lon, velocity, heading, lastUpdated: Date.now() });
  }

  untrack(id: string): boolean {
    return this.entities.delete(id);
  }

  findNearby(lat: number, lon: number, radiusKm: number, typeFilter?: string): { id: string; distance: number; type: string; bearing: number }[] {
    return [...this.entities.values()]
      .filter(e => !typeFilter || e.type === typeFilter)
      .map(e => ({
        id: e.id,
        distance: this.haversine(lat, lon, e.lat, e.lon),
        type: e.type,
        bearing: this.bearing(lat, lon, e.lat, e.lon),
      }))
      .filter(e => e.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  detectProximityAlerts(thresholdKm: number): ProximityAlert[] {
    this.alerts = [];
    const entities = [...this.entities.values()];

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const a = entities[i];
        const b = entities[j];
        const distance = this.haversine(a.lat, a.lon, b.lat, b.lon);

        if (distance <= thresholdKm) {
          const closingSpeed = this.computeClosingSpeed(a, b);
          const estimatedContactMs = closingSpeed > 0 ? (distance / closingSpeed) * 3600000 : null;
          this.alerts.push({ entityA: a.id, entityB: b.id, distance, closingSpeed, estimatedContactMs });
        }
      }
    }

    return [...this.alerts].sort((a, b) => a.distance - b.distance);
  }

  cluster(maxDistanceKm: number): Map<number, string[]> {
    const entities = [...this.entities.values()];
    const visited = new Set<string>();
    const clusters = new Map<number, string[]>();
    let clusterId = 0;

    for (const entity of entities) {
      if (visited.has(entity.id)) continue;
      const cluster: string[] = [];
      const queue = [entity];

      while (queue.length > 0) {
        const current = queue.pop()!;
        if (visited.has(current.id)) continue;
        visited.add(current.id);
        cluster.push(current.id);

        for (const other of entities) {
          if (!visited.has(other.id) && this.haversine(current.lat, current.lon, other.lat, other.lon) <= maxDistanceKm) {
            queue.push(other);
          }
        }
      }

      if (cluster.length > 0) {
        clusters.set(clusterId++, cluster);
      }
    }

    return clusters;
  }

  private computeClosingSpeed(a: TrackedEntity, b: TrackedEntity): number {
    // Simplified: project velocities onto line connecting the two entities
    const bearingAtoB = this.bearing(a.lat, a.lon, b.lat, b.lon);
    const aComponent = a.velocity * Math.cos((a.heading - bearingAtoB) * Math.PI / 180);
    const bComponent = b.velocity * Math.cos((b.heading - bearingAtoB + 180) * Math.PI / 180);
    return Math.max(0, aComponent + bComponent);
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  }

  getStats(): { trackedEntities: number; types: string[]; activeAlerts: number; lastUpdateMs: number } {
    const entities = [...this.entities.values()];
    const types = [...new Set(entities.map(e => e.type))];
    const lastUpdate = entities.length > 0 ? Math.max(...entities.map(e => e.lastUpdated)) : 0;
    return { trackedEntities: entities.length, types, activeAlerts: this.alerts.length, lastUpdateMs: lastUpdate };
  }

  reset(): void {
    this.entities.clear();
    this.alerts = [];
  }
}
