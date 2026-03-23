/**
 * COMPASS Ultimate — System 12: Multi-Projection Engine
 * 
 * Coordinate system transformations (WGS84, UTM, Mercator, custom)
 * with datum awareness and batch transformation support.
 * 
 * @module compass/ultimate/projectionEngine
 */

// ── Types ────────────────────────────────────────────────────────

export type ProjectionType = 'wgs84' | 'utm' | 'mercator' | 'equirectangular' | 'custom';

export interface GeoPoint {
  lat: number;   // Degrees
  lon: number;   // Degrees
  alt?: number;  // Meters
}

export interface ProjectedPoint {
  x: number;
  y: number;
  z?: number;
  projection: ProjectionType;
}

export interface ProjectionConfig {
  id: string;
  type: ProjectionType;
  params: Record<string, number>;
  name: string;
  registeredAt: number;
}

export interface ProjectionStats {
  totalTransformations: number;
  transformationsByType: Record<string, number>;
  avgTransformTimeMs: number;
  customProjections: number;
}

// ── Constants ────────────────────────────────────────────────────

const EARTH_RADIUS_M = 6_378_137;
const DEG_TO_RAD = Math.PI / 180;

// ── State ────────────────────────────────────────────────────────

const customProjections: Map<string, ProjectionConfig> = new Map();
let totalTransformations = 0;
let totalTransformTimeMs = 0;
const transformByType: Record<string, number> = {};

// ── Core Projections ─────────────────────────────────────────────

/** WGS84 → Mercator */
export function toMercator(point: GeoPoint): ProjectedPoint {
  const start = performance.now();
  const x = EARTH_RADIUS_M * point.lon * DEG_TO_RAD;
  const latRad = point.lat * DEG_TO_RAD;
  const y = EARTH_RADIUS_M * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  recordTransform('mercator', performance.now() - start);
  return { x, y, z: point.alt, projection: 'mercator' };
}

/** Mercator → WGS84 */
export function fromMercator(point: ProjectedPoint): GeoPoint {
  const start = performance.now();
  const lon = (point.x / EARTH_RADIUS_M) / DEG_TO_RAD;
  const lat = (2 * Math.atan(Math.exp(point.y / EARTH_RADIUS_M)) - Math.PI / 2) / DEG_TO_RAD;
  recordTransform('mercator_inv', performance.now() - start);
  return { lat, lon, alt: point.z };
}

/** WGS84 → UTM (simplified) */
export function toUTM(point: GeoPoint): ProjectedPoint & { zone: number; hemisphere: 'N' | 'S' } {
  const start = performance.now();
  const zone = Math.floor((point.lon + 180) / 6) + 1;
  const centralMeridian = (zone - 1) * 6 - 180 + 3;

  const latRad = point.lat * DEG_TO_RAD;
  const lonDiff = (point.lon - centralMeridian) * DEG_TO_RAD;

  // Simplified transverse Mercator
  const x = 500000 + EARTH_RADIUS_M * lonDiff * Math.cos(latRad) * 0.9996;
  let y = EARTH_RADIUS_M * latRad * 0.9996;
  if (point.lat < 0) y += 10_000_000;

  recordTransform('utm', performance.now() - start);
  return { x, y, z: point.alt, projection: 'utm', zone, hemisphere: point.lat >= 0 ? 'N' : 'S' };
}

/** WGS84 → Equirectangular (simple plate carrée) */
export function toEquirectangular(point: GeoPoint, refLat: number = 0): ProjectedPoint {
  const start = performance.now();
  const x = EARTH_RADIUS_M * point.lon * DEG_TO_RAD * Math.cos(refLat * DEG_TO_RAD);
  const y = EARTH_RADIUS_M * point.lat * DEG_TO_RAD;
  recordTransform('equirectangular', performance.now() - start);
  return { x, y, z: point.alt, projection: 'equirectangular' };
}

/** Haversine distance between two WGS84 points (meters) */
export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const dLat = (b.lat - a.lat) * DEG_TO_RAD;
  const dLon = (b.lon - a.lon) * DEG_TO_RAD;
  const aLatR = a.lat * DEG_TO_RAD;
  const bLatR = b.lat * DEG_TO_RAD;

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLatR) * Math.cos(bLatR) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Batch transform an array of points */
export function batchTransform(
  points: GeoPoint[],
  target: 'mercator' | 'utm' | 'equirectangular',
): ProjectedPoint[] {
  switch (target) {
    case 'mercator': return points.map(p => toMercator(p));
    case 'utm': return points.map(p => toUTM(p));
    case 'equirectangular': return points.map(p => toEquirectangular(p));
  }
}

// ── Custom Projections ──────────────────────────────────────────

export function registerCustomProjection(name: string, params: Record<string, number>): ProjectionConfig {
  const config: ProjectionConfig = {
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'custom',
    params,
    name,
    registeredAt: Date.now(),
  };
  customProjections.set(config.id, config);
  return config;
}

export function getCustomProjections(): ProjectionConfig[] { return [...customProjections.values()]; }

// ── Internal ────────────────────────────────────────────────────

function recordTransform(type: string, elapsed: number): void {
  totalTransformations++;
  totalTransformTimeMs += elapsed;
  transformByType[type] = (transformByType[type] || 0) + 1;
}

// ── Stats ────────────────────────────────────────────────────────

export function getProjectionStats(): ProjectionStats {
  return {
    totalTransformations,
    transformationsByType: { ...transformByType },
    avgTransformTimeMs: totalTransformations > 0
      ? Math.round((totalTransformTimeMs / totalTransformations) * 1000) / 1000
      : 0,
    customProjections: customProjections.size,
  };
}

export function resetProjectionEngine(): void {
  customProjections.clear();
  totalTransformations = 0;
  totalTransformTimeMs = 0;
  Object.keys(transformByType).forEach(k => delete transformByType[k]);
}
