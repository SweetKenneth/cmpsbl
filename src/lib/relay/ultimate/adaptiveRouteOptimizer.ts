/**
 * RELAY Ultimate — Adaptive Route Optimizer
 * Shortest-path routing using weighted adjacency matrix.
 * Learns optimal paths from historical latency. Recalculates on topology changes.
 */

export interface RouteEdge {
  from: string;
  to: string;
  latencyMs: number;
  errorRate: number;
  throughput: number;
  healthy: boolean;
  lastUpdated: number;
}

export interface RouteScore {
  destination: string;
  path: string[];
  totalLatency: number;
  reliability: number;      // 0–1
  hops: number;
  score: number;             // composite
  computedAt: number;
}

export interface RouteOptimizerStats {
  totalEdges: number;
  totalRoutes: number;
  avgLatency: number;
  avgReliability: number;
  recalculations: number;
}

const LATENCY_WEIGHT = 0.50;
const RELIABILITY_WEIGHT = 0.35;
const HOPS_WEIGHT = 0.15;
const MAX_EDGES = 500;
const MAX_ROUTES = 300;

const edges = new Map<string, RouteEdge>();
const routeCache = new Map<string, RouteScore>();
let recalculations = 0;

function edgeKey(from: string, to: string): string { return `${from}→${to}`; }

export function registerEdge(from: string, to: string, latencyMs: number = 10, errorRate: number = 0): RouteEdge {
  const key = edgeKey(from, to);
  const edge: RouteEdge = {
    from, to, latencyMs: Math.max(0, latencyMs),
    errorRate: Math.max(0, Math.min(1, errorRate)),
    throughput: 0, healthy: errorRate < 0.5,
    lastUpdated: Date.now(),
  };
  if (edges.size >= MAX_EDGES && !edges.has(key)) {
    const oldest = [...edges.entries()].sort((a, b) => a[1].lastUpdated - b[1].lastUpdated)[0];
    if (oldest) edges.delete(oldest[0]);
  }
  edges.set(key, edge);
  return edge;
}

export function updateEdgeMetrics(from: string, to: string, latencyMs: number, errorRate: number): void {
  const key = edgeKey(from, to);
  const edge = edges.get(key);
  if (!edge) return;
  // EMA smoothing
  edge.latencyMs = edge.latencyMs * 0.7 + latencyMs * 0.3;
  edge.errorRate = edge.errorRate * 0.7 + Math.max(0, Math.min(1, errorRate)) * 0.3;
  edge.healthy = edge.errorRate < 0.5;
  edge.throughput++;
  edge.lastUpdated = Date.now();
}

export function findOptimalRoute(from: string, to: string): RouteScore | null {
  const cacheKey = `${from}→${to}`;
  const cached = routeCache.get(cacheKey);
  if (cached && Date.now() - cached.computedAt < 30_000) return cached;

  // BFS shortest path with latency weighting
  const visited = new Set<string>();
  const queue: Array<{ node: string; path: string[]; totalLatency: number; reliability: number }> = [
    { node: from, path: [from], totalLatency: 0, reliability: 1 }
  ];
  let bestRoute: RouteScore | null = null;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.node === to) {
      const hops = current.path.length - 1;
      const maxHops = 10;
      const latencyNorm = 1 - Math.min(1, current.totalLatency / 1000);
      const hopsNorm = 1 - Math.min(1, hops / maxHops);
      const score = latencyNorm * LATENCY_WEIGHT + current.reliability * RELIABILITY_WEIGHT + hopsNorm * HOPS_WEIGHT;

      if (!bestRoute || score > bestRoute.score) {
        bestRoute = {
          destination: to, path: current.path,
          totalLatency: current.totalLatency,
          reliability: current.reliability, hops, score,
          computedAt: Date.now(),
        };
      }
      continue;
    }

    if (visited.has(current.node)) continue;
    visited.add(current.node);

    for (const [, edge] of edges) {
      if (edge.from === current.node && edge.healthy && !visited.has(edge.to)) {
        queue.push({
          node: edge.to,
          path: [...current.path, edge.to],
          totalLatency: current.totalLatency + edge.latencyMs,
          reliability: current.reliability * (1 - edge.errorRate),
        });
      }
    }
  }

  if (bestRoute) {
    if (routeCache.size >= MAX_ROUTES) {
      const oldest = [...routeCache.entries()].sort((a, b) => a[1].computedAt - b[1].computedAt)[0];
      if (oldest) routeCache.delete(oldest[0]);
    }
    routeCache.set(cacheKey, bestRoute);
    recalculations++;
  }

  return bestRoute;
}

export function invalidateRoutes(): void {
  routeCache.clear();
  recalculations++;
}

export function getRouteOptimizerStats(): RouteOptimizerStats {
  const allEdges = [...edges.values()];
  return {
    totalEdges: allEdges.length,
    totalRoutes: routeCache.size,
    avgLatency: allEdges.length > 0 ? allEdges.reduce((s, e) => s + e.latencyMs, 0) / allEdges.length : 0,
    avgReliability: allEdges.length > 0 ? allEdges.reduce((s, e) => s + (1 - e.errorRate), 0) / allEdges.length : 1,
    recalculations,
  };
}

export function resetRouteOptimizerState(): void { edges.clear(); routeCache.clear(); recalculations = 0; }
