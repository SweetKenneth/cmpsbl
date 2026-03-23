/**
 * COMPASS Ultimate — Route Optimizer
 * Finds optimal execution paths through the substrate's node topology.
 * Uses Dijkstra-variant with dynamic edge weights (latency, cost, reliability).
 */

export interface TopologyEdge {
  from: string;
  to: string;
  latencyMs: number;
  cost: number;
  reliability: number;  // 0–1
  weight: number;        // computed composite
}

export interface OptimalRoute {
  id: string;
  path: string[];
  totalWeight: number;
  totalLatency: number;
  totalCost: number;
  avgReliability: number;
  computedAt: number;
}

export interface RouteStats {
  totalEdges: number;
  totalRoutes: number;
  avgPathLength: number;
  avgLatency: number;
  avgReliability: number;
}

const WEIGHT_LATENCY = 0.4;
const WEIGHT_COST = 0.3;
const WEIGHT_RELIABILITY = 0.3;
const MAX_ROUTES = 200;

const edges = new Map<string, TopologyEdge[]>(); // from → edges[]
const routeHistory: OptimalRoute[] = [];

function computeWeight(e: TopologyEdge): number {
  return e.latencyMs * WEIGHT_LATENCY + e.cost * WEIGHT_COST + (1 - e.reliability) * 100 * WEIGHT_RELIABILITY;
}

export function registerEdge(from: string, to: string, latencyMs: number, cost: number, reliability: number): TopologyEdge {
  const edge: TopologyEdge = { from, to, latencyMs, cost, reliability, weight: 0 };
  edge.weight = computeWeight(edge);

  if (!edges.has(from)) edges.set(from, []);
  const existing = edges.get(from)!;
  const idx = existing.findIndex(e => e.to === to);
  if (idx >= 0) existing[idx] = edge;
  else existing.push(edge);

  return edge;
}

export function updateEdgeMetrics(from: string, to: string, latencyMs: number, reliability: number): void {
  const list = edges.get(from);
  if (!list) return;
  const edge = list.find(e => e.to === to);
  if (edge) {
    edge.latencyMs = edge.latencyMs * 0.7 + latencyMs * 0.3; // EMA
    edge.reliability = edge.reliability * 0.8 + reliability * 0.2;
    edge.weight = computeWeight(edge);
  }
}

export function findOptimalRoute(from: string, to: string): OptimalRoute | null {
  // Dijkstra's algorithm
  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();

  // Collect all nodes
  const allNodes = new Set<string>();
  for (const [f, edgeList] of edges) {
    allNodes.add(f);
    for (const e of edgeList) allNodes.add(e.to);
  }

  if (!allNodes.has(from) || !allNodes.has(to)) return null;

  for (const n of allNodes) dist.set(n, Infinity);
  dist.set(from, 0);

  while (true) {
    // Find unvisited node with min distance
    let minNode: string | null = null;
    let minDist = Infinity;
    for (const [n, d] of dist) {
      if (!visited.has(n) && d < minDist) {
        minNode = n;
        minDist = d;
      }
    }
    if (!minNode || minNode === to) break;

    visited.add(minNode);
    const neighbors = edges.get(minNode) ?? [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;
      const alt = minDist + edge.weight;
      if (alt < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, alt);
        prev.set(edge.to, minNode);
      }
    }
  }

  if (!prev.has(to) && from !== to) return null;

  // Reconstruct path
  const path: string[] = [];
  let current: string | undefined = to;
  while (current) {
    path.unshift(current);
    current = prev.get(current);
  }

  // Compute aggregate metrics
  let totalLatency = 0, totalCost = 0, relSum = 0, edgeCount = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const e = (edges.get(path[i]) ?? []).find(e => e.to === path[i + 1]);
    if (e) {
      totalLatency += e.latencyMs;
      totalCost += e.cost;
      relSum += e.reliability;
      edgeCount++;
    }
  }

  const route: OptimalRoute = {
    id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    path, totalWeight: dist.get(to) ?? Infinity,
    totalLatency, totalCost,
    avgReliability: edgeCount > 0 ? relSum / edgeCount : 0,
    computedAt: Date.now(),
  };

  if (routeHistory.length >= MAX_ROUTES) routeHistory.shift();
  routeHistory.push(route);
  return route;
}

export function getRouteStats(): RouteStats {
  const totalEdges = [...edges.values()].reduce((s, e) => s + e.length, 0);
  return {
    totalEdges,
    totalRoutes: routeHistory.length,
    avgPathLength: routeHistory.length > 0 ? routeHistory.reduce((s, r) => s + r.path.length, 0) / routeHistory.length : 0,
    avgLatency: routeHistory.length > 0 ? routeHistory.reduce((s, r) => s + r.totalLatency, 0) / routeHistory.length : 0,
    avgReliability: routeHistory.length > 0 ? routeHistory.reduce((s, r) => s + r.avgReliability, 0) / routeHistory.length : 0,
  };
}

export function resetRouteState(): void { edges.clear(); routeHistory.length = 0; }
