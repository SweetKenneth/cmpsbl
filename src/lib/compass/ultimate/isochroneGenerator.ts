/**
 * COMPASS Ultimate — System 15: Isochrone Generator
 * 
 * "What's reachable within X minutes?" contour generation from any
 * origin point. Grid-based reachability with speed profiles.
 * 
 * @module compass/ultimate/isochroneGenerator
 */

// ── Types ────────────────────────────────────────────────────────

export type TravelMode = 'walk' | 'bike' | 'drive' | 'transit';

export interface IsochroneRequest {
  originLat: number;
  originLon: number;
  timeMinutes: number;
  mode: TravelMode;
  resolution?: number;         // Grid cells per degree (default 20)
}

export interface IsochroneContour {
  id: string;
  origin: { lat: number; lon: number };
  timeMinutes: number;
  mode: TravelMode;
  boundary: Array<{ lat: number; lon: number }>;
  areaSqKm: number;
  cellsReachable: number;
  generatedAt: number;
  generationTimeMs: number;
}

export interface IsochroneStats {
  totalGenerated: number;
  avgGenerationTimeMs: number;
  byMode: Record<string, number>;
}

// ── Constants ────────────────────────────────────────────────────

// Average speeds in m/s
const SPEED_PROFILES: Record<TravelMode, number> = {
  walk: 1.4,    // ~5 km/h
  bike: 4.2,    // ~15 km/h
  drive: 11.1,  // ~40 km/h (urban average)
  transit: 8.3, // ~30 km/h
};

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_M = 6_378_137;

// ── State ────────────────────────────────────────────────────────

const contours: IsochroneContour[] = [];
const MAX_CONTOURS = 200;
let totalGenerated = 0;
let totalGenTimeMs = 0;
const byMode: Record<string, number> = {};

// ── Core API ────────────────────────────────────────────────────

/** Generate an isochrone contour */
export function generateIsochrone(request: IsochroneRequest): IsochroneContour {
  const start = performance.now();
  const resolution = request.resolution ?? 20;
  const speedMps = SPEED_PROFILES[request.mode];
  const maxDistanceM = speedMps * request.timeMinutes * 60;

  // Generate reachable cells (BFS-like grid expansion)
  const reachableCells: Array<{ lat: number; lon: number }> = [];
  const degPerCell = 1 / resolution;

  // Approximate degree range
  const latRange = maxDistanceM / 111_320; // 1 deg lat ≈ 111.32 km
  const lonRange = maxDistanceM / (111_320 * Math.cos(request.originLat * DEG_TO_RAD));

  for (let dLat = -latRange; dLat <= latRange; dLat += degPerCell) {
    for (let dLon = -lonRange; dLon <= lonRange; dLon += degPerCell) {
      const cellLat = request.originLat + dLat;
      const cellLon = request.originLon + dLon;
      const dist = haversine(request.originLat, request.originLon, cellLat, cellLon);

      if (dist <= maxDistanceM) {
        reachableCells.push({ lat: Math.round(cellLat * 1e4) / 1e4, lon: Math.round(cellLon * 1e4) / 1e4 });
      }
    }
  }

  // Extract boundary (outermost cells via convex hull approximation)
  const boundary = extractBoundary(reachableCells, request.originLat, request.originLon);

  // Estimate area
  const areaSqKm = Math.PI * (maxDistanceM / 1000) ** 2 * (reachableCells.length > 0 ? 0.85 : 0); // ~85% fill factor

  const elapsed = performance.now() - start;
  totalGenerated++;
  totalGenTimeMs += elapsed;
  byMode[request.mode] = (byMode[request.mode] || 0) + 1;

  const contour: IsochroneContour = {
    id: `iso-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    origin: { lat: request.originLat, lon: request.originLon },
    timeMinutes: request.timeMinutes,
    mode: request.mode,
    boundary,
    areaSqKm: Math.round(areaSqKm * 100) / 100,
    cellsReachable: reachableCells.length,
    generatedAt: Date.now(),
    generationTimeMs: Math.round(elapsed * 100) / 100,
  };

  contours.push(contour);
  if (contours.length > MAX_CONTOURS) contours.splice(0, contours.length - MAX_CONTOURS);

  return contour;
}

/** Extract boundary points (simplified convex hull via angular sweep) */
function extractBoundary(
  cells: Array<{ lat: number; lon: number }>,
  originLat: number,
  originLon: number,
): Array<{ lat: number; lon: number }> {
  if (cells.length === 0) return [];

  // Angular bucket approach: divide into 36 sectors (10° each)
  const SECTORS = 36;
  const buckets: Array<{ lat: number; lon: number; dist: number } | null> = new Array(SECTORS).fill(null);

  for (const cell of cells) {
    const angle = Math.atan2(cell.lon - originLon, cell.lat - originLat) / DEG_TO_RAD;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const sector = Math.floor(normalizedAngle / (360 / SECTORS)) % SECTORS;
    const dist = haversine(originLat, originLon, cell.lat, cell.lon);

    if (!buckets[sector] || dist > buckets[sector]!.dist) {
      buckets[sector] = { lat: cell.lat, lon: cell.lon, dist };
    }
  }

  return buckets.filter((b): b is { lat: number; lon: number; dist: number } => b !== null)
    .map(b => ({ lat: b.lat, lon: b.lon }));
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

// ── Query ────────────────────────────────────────────────────────

export function getContours(count?: number): IsochroneContour[] {
  return count ? contours.slice(-count) : [...contours];
}

export function getIsochroneStats(): IsochroneStats {
  return {
    totalGenerated,
    avgGenerationTimeMs: totalGenerated > 0 ? Math.round((totalGenTimeMs / totalGenerated) * 100) / 100 : 0,
    byMode: { ...byMode },
  };
}

export function resetIsochroneGenerator(): void {
  contours.length = 0;
  totalGenerated = 0;
  totalGenTimeMs = 0;
  Object.keys(byMode).forEach(k => delete byMode[k]);
}
