/**
 * COMPASS Ultimate — Coordinate Registry
 * Universal N-dimensional addressing system for every entity in the substrate.
 * Nodes, records, artifacts, users, intents — everything gets a position.
 */

export interface Coordinate {
  id: string;
  entityType: 'node' | 'record' | 'artifact' | 'user' | 'intent' | 'event' | 'capability';
  entityId: string;
  dimensions: number[];       // N-dimensional position vector
  labels: Record<string, string>;
  registeredAt: number;
  lastUpdatedAt: number;
}

export interface CoordinateQuery {
  results: Coordinate[];
  distancesFromOrigin: number[];
}

export interface CoordinateStats {
  totalEntities: number;
  byType: Record<string, number>;
  dimensionality: number;
  avgDensity: number;
}

const MAX_ENTITIES = 5000;
const DEFAULT_DIMS = 8;
const registry = new Map<string, Coordinate>();

function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function registerCoordinate(
  entityType: Coordinate['entityType'],
  entityId: string,
  dimensions?: number[],
  labels?: Record<string, string>
): Coordinate {
  const key = `${entityType}:${entityId}`;
  const dims = dimensions ?? Array.from({ length: DEFAULT_DIMS }, () => Math.random() * 2 - 1);

  const coord: Coordinate = {
    id: key, entityType, entityId,
    dimensions: dims, labels: labels ?? {},
    registeredAt: Date.now(), lastUpdatedAt: Date.now(),
  };

  if (registry.size >= MAX_ENTITIES && !registry.has(key)) {
    const oldest = [...registry.values()].sort((a, b) => a.lastUpdatedAt - b.lastUpdatedAt)[0];
    if (oldest) registry.delete(oldest.id);
  }
  registry.set(key, coord);
  return coord;
}

export function updatePosition(entityType: Coordinate['entityType'], entityId: string, dimensions: number[]): void {
  const key = `${entityType}:${entityId}`;
  const coord = registry.get(key);
  if (coord) {
    coord.dimensions = dimensions;
    coord.lastUpdatedAt = Date.now();
  }
}

export function findNearest(origin: number[], k: number = 5, filterType?: Coordinate['entityType']): CoordinateQuery {
  let candidates = [...registry.values()];
  if (filterType) candidates = candidates.filter(c => c.entityType === filterType);

  const withDist = candidates.map(c => ({ coord: c, dist: euclidean(origin, c.dimensions) }));
  withDist.sort((a, b) => a.dist - b.dist);

  const top = withDist.slice(0, k);
  return { results: top.map(t => t.coord), distancesFromOrigin: top.map(t => t.dist) };
}

export function getDistance(typeA: Coordinate['entityType'], idA: string, typeB: Coordinate['entityType'], idB: string): number {
  const a = registry.get(`${typeA}:${idA}`);
  const b = registry.get(`${typeB}:${idB}`);
  if (!a || !b) return Infinity;
  return euclidean(a.dimensions, b.dimensions);
}

export function getCoordinateStats(): CoordinateStats {
  const all = [...registry.values()];
  const byType: Record<string, number> = {};
  for (const c of all) {
    byType[c.entityType] = (byType[c.entityType] ?? 0) + 1;
  }
  const dims = all.length > 0 ? all[0].dimensions.length : DEFAULT_DIMS;
  return {
    totalEntities: all.length,
    byType,
    dimensionality: dims,
    avgDensity: all.length / Math.max(1, dims),
  };
}

export function resetCoordinateState(): void { registry.clear(); }
