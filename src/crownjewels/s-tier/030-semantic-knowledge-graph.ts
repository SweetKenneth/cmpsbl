/**
 * S-Tier 030 — Semantic Knowledge Graph
 * CJPI: 94 | Node: BRAIN | ID: S-74
 *
 * In-memory directed graph that maps concepts → relations → concepts.
 * Supports traversal, shortest-path, and neighbourhood queries.
 */

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
  weight: number; // 0-1 strength
}

export interface KnowledgeGraph {
  addNode(node: GraphNode): void;
  addEdge(edge: GraphEdge): void;
  getNeighbours(nodeId: string, depth?: number): GraphNode[];
  shortestPath(from: string, to: string): string[] | null;
  query(concept: string): GraphNode[];
  stats(): { nodes: number; edges: number; density: number };
}

export function createKnowledgeGraph(): KnowledgeGraph {
  const nodes = new Map<string, GraphNode>();
  const adjacency = new Map<string, GraphEdge[]>();

  const addNode = (node: GraphNode) => {
    nodes.set(node.id, node);
    if (!adjacency.has(node.id)) adjacency.set(node.id, []);
  };

  const addEdge = (edge: GraphEdge) => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from)!.push(edge);
  };

  const getNeighbours = (nodeId: string, depth = 1): GraphNode[] => {
    const visited = new Set<string>();
    let frontier = [nodeId];
    for (let d = 0; d < depth; d++) {
      const next: string[] = [];
      for (const nid of frontier) {
        for (const edge of adjacency.get(nid) ?? []) {
          if (!visited.has(edge.to)) {
            visited.add(edge.to);
            next.push(edge.to);
          }
        }
      }
      frontier = next;
    }
    return [...visited].map(id => nodes.get(id)!).filter(Boolean);
  };

  const shortestPath = (from: string, to: string): string[] | null => {
    if (!nodes.has(from) || !nodes.has(to)) return null;
    const queue: string[][] = [[from]];
    const visited = new Set<string>([from]);
    while (queue.length) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      if (current === to) return path;
      for (const edge of adjacency.get(current) ?? []) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.push([...path, edge.to]);
        }
      }
    }
    return null;
  };

  const query = (concept: string): GraphNode[] => {
    const lower = concept.toLowerCase();
    return [...nodes.values()].filter(n =>
      n.label.toLowerCase().includes(lower) || n.type.toLowerCase().includes(lower)
    );
  };

  const stats = () => {
    const n = nodes.size;
    const e = [...adjacency.values()].reduce((s, edges) => s + edges.length, 0);
    return { nodes: n, edges: e, density: n > 1 ? e / (n * (n - 1)) : 0 };
  };

  return { addNode, addEdge, getNeighbours, shortestPath, query, stats };
}
