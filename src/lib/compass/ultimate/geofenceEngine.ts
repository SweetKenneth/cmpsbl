/**
 * COMPASS Ultimate — System 13: Geofence Engine
 * 
 * Define polygonal/circular zones with enter/exit/dwell event
 * triggering. Real-time tracking of entity positions against zones.
 * 
 * @module compass/ultimate/geofenceEngine
 */

// ── Types ────────────────────────────────────────────────────────

export type GeofenceShape = 'circle' | 'polygon';
export type GeofenceEventType = 'enter' | 'exit' | 'dwell';

export interface CircleFence {
  shape: 'circle';
  centerLat: number;
  centerLon: number;
  radiusM: number;
}

export interface PolygonFence {
  shape: 'polygon';
  vertices: Array<{ lat: number; lon: number }>;
}

export interface Geofence {
  id: string;
  name: string;
  config: CircleFence | PolygonFence;
  tags: string[];
  enabled: boolean;
  createdAt: number;
}

export interface GeofenceEvent {
  id: string;
  fenceId: string;
  entityId: string;
  eventType: GeofenceEventType;
  position: { lat: number; lon: number };
  dwellMs?: number;
  timestamp: number;
}

export interface GeofenceStats {
  totalFences: number;
  enabledFences: number;
  totalEvents: number;
  enterEvents: number;
  exitEvents: number;
  dwellEvents: number;
  trackedEntities: number;
}

// ── State ────────────────────────────────────────────────────────

const fences: Map<string, Geofence> = new Map();
const events: GeofenceEvent[] = [];
const entityPositions: Map<string, { fenceId: string | null; enteredAt: number | null }> = new Map();
const MAX_EVENTS = 3000;
const MAX_FENCES = 500;
const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_M = 6_378_137;

// ── Core API ────────────────────────────────────────────────────

/** Create a circular geofence */
export function createCircleFence(name: string, centerLat: number, centerLon: number, radiusM: number, tags: string[] = []): Geofence {
  const fence: Geofence = {
    id: `fence-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name, tags, enabled: true, createdAt: Date.now(),
    config: { shape: 'circle', centerLat, centerLon, radiusM },
  };
  fences.set(fence.id, fence);
  if (fences.size > MAX_FENCES) evictOldest();
  return fence;
}

/** Create a polygonal geofence */
export function createPolygonFence(name: string, vertices: Array<{ lat: number; lon: number }>, tags: string[] = []): Geofence {
  const fence: Geofence = {
    id: `fence-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name, tags, enabled: true, createdAt: Date.now(),
    config: { shape: 'polygon', vertices },
  };
  fences.set(fence.id, fence);
  if (fences.size > MAX_FENCES) evictOldest();
  return fence;
}

/** Update entity position and check all fences */
export function updateEntityPosition(entityId: string, lat: number, lon: number): GeofenceEvent[] {
  const triggered: GeofenceEvent[] = [];
  const prevState = entityPositions.get(entityId) ?? { fenceId: null, enteredAt: null };

  let insideFenceId: string | null = null;

  for (const fence of fences.values()) {
    if (!fence.enabled) continue;
    if (isInsideFence(lat, lon, fence)) {
      insideFenceId = fence.id;

      if (prevState.fenceId !== fence.id) {
        // Exit old fence if was in one
        if (prevState.fenceId) {
          triggered.push(emitEvent(prevState.fenceId, entityId, 'exit', lat, lon));
        }
        // Enter new fence
        triggered.push(emitEvent(fence.id, entityId, 'enter', lat, lon));
        entityPositions.set(entityId, { fenceId: fence.id, enteredAt: Date.now() });
      } else if (prevState.enteredAt) {
        // Dwell event
        const dwellMs = Date.now() - prevState.enteredAt;
        if (dwellMs > 30_000) { // >30s dwell
          triggered.push(emitEvent(fence.id, entityId, 'dwell', lat, lon, dwellMs));
        }
      }
      break;
    }
  }

  // Exited all fences
  if (!insideFenceId && prevState.fenceId) {
    triggered.push(emitEvent(prevState.fenceId, entityId, 'exit', lat, lon));
    entityPositions.set(entityId, { fenceId: null, enteredAt: null });
  }

  return triggered;
}

/** Check if a point is inside a fence */
function isInsideFence(lat: number, lon: number, fence: Geofence): boolean {
  if (fence.config.shape === 'circle') {
    const c = fence.config;
    const dist = haversine(lat, lon, c.centerLat, c.centerLon);
    return dist <= c.radiusM;
  }
  // Ray casting for polygon
  const v = fence.config.vertices;
  let inside = false;
  for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
    if ((v[i].lon > lon) !== (v[j].lon > lon) &&
      lat < (v[j].lat - v[i].lat) * (lon - v[i].lon) / (v[j].lon - v[i].lon) + v[i].lat) {
      inside = !inside;
    }
  }
  return inside;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

function emitEvent(fenceId: string, entityId: string, type: GeofenceEventType, lat: number, lon: number, dwellMs?: number): GeofenceEvent {
  const event: GeofenceEvent = {
    id: `gev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fenceId, entityId, eventType: type,
    position: { lat, lon },
    dwellMs,
    timestamp: Date.now(),
  };
  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  return event;
}

function evictOldest(): void {
  const oldest = [...fences.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
  if (oldest) fences.delete(oldest.id);
}

// ── Query ────────────────────────────────────────────────────────

export function getFence(id: string): Geofence | undefined { return fences.get(id); }
export function getAllFences(): Geofence[] { return [...fences.values()]; }
export function getGeofenceEvents(fenceId?: string, count?: number): GeofenceEvent[] {
  let filtered = fenceId ? events.filter(e => e.fenceId === fenceId) : events;
  if (count) filtered = filtered.slice(-count);
  return filtered;
}

export function setFenceEnabled(id: string, enabled: boolean): boolean {
  const fence = fences.get(id);
  if (!fence) return false;
  fence.enabled = enabled;
  return true;
}

export function getGeofenceStats(): GeofenceStats {
  return {
    totalFences: fences.size,
    enabledFences: [...fences.values()].filter(f => f.enabled).length,
    totalEvents: events.length,
    enterEvents: events.filter(e => e.eventType === 'enter').length,
    exitEvents: events.filter(e => e.eventType === 'exit').length,
    dwellEvents: events.filter(e => e.eventType === 'dwell').length,
    trackedEntities: entityPositions.size,
  };
}

export function resetGeofenceEngine(): void {
  fences.clear();
  events.length = 0;
  entityPositions.clear();
}
