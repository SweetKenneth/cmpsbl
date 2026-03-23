/**
 * COMPASS Ultimate — System 16: Temporal Fusion Engine
 * 
 * Merge spatial + temporal dimensions — where AND when patterns
 * co-occur. Spatiotemporal event correlation and hotspot detection.
 * 
 * @module compass/ultimate/temporalFusion
 */

// ── Types ────────────────────────────────────────────────────────

export interface SpatioTemporalEvent {
  id: string;
  entityId: string;
  lat: number;
  lon: number;
  timestamp: number;
  eventType: string;
  metadata: Record<string, unknown>;
}

export interface SpatioTemporalPattern {
  id: string;
  patternType: 'co_occurrence' | 'recurring' | 'hotspot' | 'cold_zone' | 'migration';
  spatialCenter: { lat: number; lon: number };
  temporalWindow: { startHour: number; endHour: number };
  frequency: number;
  confidence: number;        // 0-1
  eventCount: number;
  firstSeen: number;
  lastSeen: number;
}

export interface Hotspot {
  id: string;
  lat: number;
  lon: number;
  intensity: number;         // Events per unit time
  radiusM: number;
  peakHour: number;
  eventCount: number;
}

export interface TemporalFusionStats {
  totalEvents: number;
  totalPatterns: number;
  totalHotspots: number;
  coOccurrencePatterns: number;
  recurringPatterns: number;
  avgConfidence: number;
}

// ── State ────────────────────────────────────────────────────────

const events: SpatioTemporalEvent[] = [];
const patterns: SpatioTemporalPattern[] = [];
const hotspots: Hotspot[] = [];
const MAX_EVENTS = 5000;
const MAX_PATTERNS = 300;
const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_M = 6_378_137;

// ── Core API ────────────────────────────────────────────────────

/** Record a spatiotemporal event */
export function recordSpatioTemporalEvent(
  entityId: string, lat: number, lon: number, eventType: string,
  metadata: Record<string, unknown> = {}, timestamp?: number,
): SpatioTemporalEvent {
  const event: SpatioTemporalEvent = {
    id: `ste-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityId, lat, lon, eventType, metadata,
    timestamp: timestamp ?? Date.now(),
  };

  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);

  return event;
}

/** Detect co-occurrence: events of different types near each other in space AND time */
export function detectCoOccurrences(
  radiusM: number = 500,
  timeWindowMs: number = 3_600_000, // 1 hour
): SpatioTemporalPattern[] {
  const detected: SpatioTemporalPattern[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      if (events[i].eventType === events[j].eventType) continue;

      const timeDiff = Math.abs(events[i].timestamp - events[j].timestamp);
      if (timeDiff > timeWindowMs) continue;

      const dist = haversine(events[i].lat, events[i].lon, events[j].lat, events[j].lon);
      if (dist > radiusM) continue;

      const key = `${events[i].eventType}:${events[j].eventType}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const centerLat = (events[i].lat + events[j].lat) / 2;
      const centerLon = (events[i].lon + events[j].lon) / 2;
      const hour = new Date(events[i].timestamp).getHours();

      detected.push({
        id: `pat-co-${Date.now()}-${detected.length}`,
        patternType: 'co_occurrence',
        spatialCenter: { lat: centerLat, lon: centerLon },
        temporalWindow: { startHour: hour, endHour: (hour + 1) % 24 },
        frequency: 1,
        confidence: Math.max(0.3, 1 - dist / radiusM),
        eventCount: 2,
        firstSeen: Math.min(events[i].timestamp, events[j].timestamp),
        lastSeen: Math.max(events[i].timestamp, events[j].timestamp),
      });
    }

    if (detected.length > 50) break; // Cap per analysis run
  }

  for (const p of detected) {
    patterns.push(p);
    if (patterns.length > MAX_PATTERNS) patterns.splice(0, patterns.length - MAX_PATTERNS);
  }

  return detected;
}

/** Detect spatial hotspots (high density areas) */
export function detectHotspots(radiusM: number = 500, minEvents: number = 5): Hotspot[] {
  const detected: Hotspot[] = [];
  const used = new Set<number>();

  for (let i = 0; i < events.length; i++) {
    if (used.has(i)) continue;

    const neighbors: number[] = [i];
    for (let j = 0; j < events.length; j++) {
      if (i === j || used.has(j)) continue;
      if (haversine(events[i].lat, events[i].lon, events[j].lat, events[j].lon) <= radiusM) {
        neighbors.push(j);
      }
    }

    if (neighbors.length >= minEvents) {
      for (const n of neighbors) used.add(n);
      const pts = neighbors.map(n => events[n]);
      const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
      const lon = pts.reduce((s, p) => s + p.lon, 0) / pts.length;

      // Find peak hour
      const hourCounts: Record<number, number> = {};
      for (const p of pts) {
        const h = new Date(p.timestamp).getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
      const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

      const timeSpan = Math.max(1, (pts[pts.length - 1].timestamp - pts[0].timestamp) / 3_600_000); // hours
      detected.push({
        id: `hot-${Date.now()}-${detected.length}`,
        lat: Math.round(lat * 1e6) / 1e6,
        lon: Math.round(lon * 1e6) / 1e6,
        intensity: Math.round((pts.length / timeSpan) * 100) / 100,
        radiusM,
        peakHour: peakHour ? parseInt(peakHour[0]) : 0,
        eventCount: pts.length,
      });
    }
  }

  hotspots.push(...detected);
  return detected;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

// ── Query ────────────────────────────────────────────────────────

export function getSpatioTemporalEvents(count?: number): SpatioTemporalEvent[] {
  return count ? events.slice(-count) : [...events];
}
export function getPatterns(): SpatioTemporalPattern[] { return [...patterns]; }
export function getHotspots(): Hotspot[] { return [...hotspots]; }

export function getTemporalFusionStats(): TemporalFusionStats {
  return {
    totalEvents: events.length,
    totalPatterns: patterns.length,
    totalHotspots: hotspots.length,
    coOccurrencePatterns: patterns.filter(p => p.patternType === 'co_occurrence').length,
    recurringPatterns: patterns.filter(p => p.patternType === 'recurring').length,
    avgConfidence: patterns.length > 0
      ? Math.round(patterns.reduce((s, p) => s + p.confidence, 0) / patterns.length * 100) / 100
      : 0,
  };
}

export function resetTemporalFusion(): void {
  events.length = 0;
  patterns.length = 0;
  hotspots.length = 0;
}
