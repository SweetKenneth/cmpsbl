/**
 * CMPSBL® Inventory Layer — Geospatial Intelligence
 * Caps: Spatial fusion · Tracked entities · Context scoring · Geofence governance
 *
 * Ingests location signals, fuses them with context, and produces tracked,
 * scored, inclusive geographic intelligence — making any product location-aware.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Geospatial Intelligence (proprietary).                     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblGeoPoint { lat: number; lon: number; ts?: number; conf?: number }

const _CMPSBL_GEO_EARTH_KM = 6371.0088;

export function cmpsbl_geo_haversine(a: CmpsblGeoPoint, b: CmpsblGeoPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * _CMPSBL_GEO_EARTH_KM * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function cmpsbl_geo_fuse(points: CmpsblGeoPoint[]): CmpsblGeoPoint {
  if (points.length === 0) return { lat: 0, lon: 0, conf: 0 };
  let wLat = 0, wLon = 0, wSum = 0;
  for (const p of points) {
    const w = Math.max(0.01, p.conf ?? 1);
    wLat += p.lat * w; wLon += p.lon * w; wSum += w;
  }
  return { lat: wLat / wSum, lon: wLon / wSum, conf: Math.min(1, wSum / points.length), ts: Date.now() };
}

export function cmpsbl_geo_geofence(pt: CmpsblGeoPoint, center: CmpsblGeoPoint, radiusKm: number): { inside: boolean; distanceKm: number } {
  const d = cmpsbl_geo_haversine(pt, center);
  return { inside: d <= radiusKm, distanceKm: d };
}

export function cmpsbl_geo_track_score(history: CmpsblGeoPoint[]): { stability: number; speedKmh: number } {
  if (history.length < 2) return { stability: 1, speedKmh: 0 };
  let totalDist = 0, totalTime = 0;
  for (let i = 1; i < history.length; i++) {
    const d = cmpsbl_geo_haversine(history[i - 1], history[i]);
    const dt = ((history[i].ts ?? 0) - (history[i - 1].ts ?? 0)) / 3_600_000;
    totalDist += d; totalTime += Math.max(dt, 1e-6);
  }
  const speedKmh = totalDist / totalTime;
  // Stability: low variance in inter-point distance → high stability
  const avg = totalDist / (history.length - 1);
  let varSum = 0;
  for (let i = 1; i < history.length; i++) {
    const d = cmpsbl_geo_haversine(history[i - 1], history[i]);
    varSum += (d - avg) ** 2;
  }
  const stability = 1 / (1 + Math.sqrt(varSum / (history.length - 1)));
  return { stability, speedKmh };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Geospatial Intelligence (proprietary).                     ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import math, time

_CMPSBL_GEO_EARTH_KM = 6371.0088

def cmpsbl_geo_haversine(a: dict, b: dict) -> float:
    to_rad = lambda d: d * math.pi / 180
    d_lat = to_rad(b['lat'] - a['lat'])
    d_lon = to_rad(b['lon'] - a['lon'])
    s = math.sin(d_lat / 2) ** 2 + math.cos(to_rad(a['lat'])) * math.cos(to_rad(b['lat'])) * math.sin(d_lon / 2) ** 2
    return 2 * _CMPSBL_GEO_EARTH_KM * math.asin(min(1.0, math.sqrt(s)))

def cmpsbl_geo_fuse(points: list) -> dict:
    if not points:
        return { 'lat': 0.0, 'lon': 0.0, 'conf': 0.0 }
    w_lat = w_lon = w_sum = 0.0
    for p in points:
        w = max(0.01, p.get('conf', 1.0))
        w_lat += p['lat'] * w; w_lon += p['lon'] * w; w_sum += w
    return { 'lat': w_lat / w_sum, 'lon': w_lon / w_sum,
             'conf': min(1.0, w_sum / len(points)), 'ts': int(time.time() * 1000) }

def cmpsbl_geo_geofence(pt: dict, center: dict, radius_km: float) -> dict:
    d = cmpsbl_geo_haversine(pt, center)
    return { 'inside': d <= radius_km, 'distance_km': d }

def cmpsbl_geo_track_score(history: list) -> dict:
    if len(history) < 2:
        return { 'stability': 1.0, 'speed_kmh': 0.0 }
    total_dist = total_time = 0.0
    dists = []
    for i in range(1, len(history)):
        d = cmpsbl_geo_haversine(history[i - 1], history[i])
        dt = (history[i].get('ts', 0) - history[i - 1].get('ts', 0)) / 3_600_000
        total_dist += d; total_time += max(dt, 1e-6); dists.append(d)
    avg = total_dist / (len(history) - 1)
    var = sum((d - avg) ** 2 for d in dists) / (len(history) - 1)
    return { 'stability': 1 / (1 + math.sqrt(var)), 'speed_kmh': total_dist / total_time }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_geo = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_geo(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const pts = (input as any)._cmpsbl_geo_points as unknown;
  if (Array.isArray(pts) && pts.length > 0) {
    (input as any)._cmpsbl_geo_fused = cmpsbl_geo_fuse(pts as any);
  }
  return _cmpsbl_raw_execute_geo(capabilityName, input);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_geo = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Geospatial Intelligence Layer (auto-wired)."""
    pts = input_data.get('_cmpsbl_geo_points')
    if isinstance(pts, list) and pts:
        input_data['_cmpsbl_geo_fused'] = cmpsbl_geo_fuse(pts)
    return _cmpsbl_raw_execute_geo(capability_name, input_data)`;

export const GEOSPATIAL_INTELLIGENCE_LAYER: CmpsblLayerDefinition = {
  id: 'geospatial-intelligence',
  name: 'Geospatial Intelligence Layer',
  crownJewelRank: 23,
  cjpi: 88,
  module: 'TERRAIN×TRACKING',
  description: 'Haversine spatial fusion, weighted multi-source location merge, geofence governance, and track-stability scoring.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_geo_fuse',
    behavior: 'Auto-fuses any _cmpsbl_geo_points array into a single weighted location and attaches it to the input as _cmpsbl_geo_fused.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
