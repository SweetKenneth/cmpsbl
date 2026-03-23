/**
 * COMPASS Ultimate — Semantic Proximity Graph
 * Maps conceptual distance between any two entities using embedding-based similarity.
 * Answers "what's near X?" across domains.
 */

export interface ProximityNode {
  id: string;
  label: string;
  domain: string;
  embedding: number[];
  connections: Map<string, number>; // id → similarity score
}

export interface ProximityQuery {
  queryId: string;
  nearest: Array<{ id: string; label: string; similarity: number }>;
}

export interface ProximityStats {
  totalNodes: number;
  totalEdges: number;
  avgConnections: number;
  domains: string[];
  avgSimilarity: number;
}

const MAX_NODES = 3000;
const SIMILARITY_THRESHOLD = 0.3;
const MAX_CONNECTIONS = 20;

const graph = new Map<string, ProximityNode>();

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom > 0 ? dot / denom : 0;
}

export function addProximityNode(id: string, label: string, domain: string, embedding: number[]): ProximityNode {
  const node: ProximityNode = { id, label, domain, embedding, connections: new Map() };

  if (graph.size >= MAX_NODES && !graph.has(id)) {
    // Evict least connected
    let minConn: ProximityNode | null = null;
    for (const n of graph.values()) {
      if (!minConn || n.connections.size < minConn.connections.size) minConn = n;
    }
    if (minConn) {
      // Remove references from other nodes
      for (const other of graph.values()) other.connections.delete(minConn.id);
      graph.delete(minConn.id);
    }
  }

  // Compute connections to existing nodes
  for (const [otherId, other] of graph) {
    const sim = cosineSimilarity(embedding, other.embedding);
    if (sim >= SIMILARITY_THRESHOLD) {
      node.connections.set(otherId, sim);
      other.connections.set(id, sim);
      // Trim if too many connections
      if (other.connections.size > MAX_CONNECTIONS) {
        const sorted = [...other.connections.entries()].sort((a, b) => a[1] - b[1]);
        other.connections.delete(sorted[0][0]);
      }
    }
  }
  if (node.connections.size > MAX_CONNECTIONS) {
    const sorted = [...node.connections.entries()].sort((a, b) => a[1] - b[1]);
    while (node.connections.size > MAX_CONNECTIONS) {
      node.connections.delete(sorted.shift()![0]);
    }
  }

  graph.set(id, node);
  return node;
}

export function queryNearest(id: string, k: number = 5): ProximityQuery {
  const node = graph.get(id);
  if (!node) return { queryId: id, nearest: [] };

  const sorted = [...node.connections.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k);

  return {
    queryId: id,
    nearest: sorted.map(([nId, sim]) => ({
      id: nId,
      label: graph.get(nId)?.label ?? nId,
      similarity: sim,
    })),
  };
}

export function queryByEmbedding(embedding: number[], k: number = 5): ProximityQuery {
  const scored = [...graph.values()].map(n => ({
    id: n.id, label: n.label,
    similarity: cosineSimilarity(embedding, n.embedding),
  }));
  scored.sort((a, b) => b.similarity - a.similarity);

  return { queryId: 'embedding-query', nearest: scored.slice(0, k) };
}

export function getProximityStats(): ProximityStats {
  const all = [...graph.values()];
  const totalEdges = all.reduce((s, n) => s + n.connections.size, 0) / 2;
  const domains = [...new Set(all.map(n => n.domain))];
  let totalSim = 0, edgeCount = 0;
  for (const n of all) {
    for (const sim of n.connections.values()) {
      totalSim += sim;
      edgeCount++;
    }
  }
  return {
    totalNodes: all.length,
    totalEdges: Math.round(totalEdges),
    avgConnections: all.length > 0 ? all.reduce((s, n) => s + n.connections.size, 0) / all.length : 0,
    domains,
    avgSimilarity: edgeCount > 0 ? totalSim / edgeCount : 0,
  };
}

export function resetProximityState(): void { graph.clear(); }
