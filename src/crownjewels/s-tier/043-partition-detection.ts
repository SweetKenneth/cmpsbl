/**
 * S-Tier 043 — Partition Detection Engine
 * CJPI: 93 | Node: NERVE | ID: S-75
 *
 * Monitors module connectivity and detects network partitions
 * (groups of nodes that can't communicate). Used by NERVE to
 * trigger split-brain resolution protocols.
 */

export interface NodeConnectivity {
  nodeId: string;
  connectedTo: string[];
  lastSeen: number;
}

export interface Partition {
  id: number;
  nodes: string[];
  size: number;
  hasQuorum: boolean;
}

export interface PartitionReport {
  partitioned: boolean;
  partitions: Partition[];
  totalNodes: number;
  quorumSize: number;
  generatedAt: string;
}

function bfs(adjacency: Map<string, Set<string>>, start: string, visited: Set<string>): string[] {
  const component: string[] = [];
  const queue = [start];
  visited.add(start);
  while (queue.length) {
    const node = queue.shift()!;
    component.push(node);
    for (const neighbor of adjacency.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return component;
}

export function detectPartitions(nodes: NodeConnectivity[], staleThresholdMs = 10_000): PartitionReport {
  const now = Date.now();
  const activeNodes = nodes.filter(n => now - n.lastSeen < staleThresholdMs);
  const adjacency = new Map<string, Set<string>>();

  for (const node of activeNodes) {
    if (!adjacency.has(node.nodeId)) adjacency.set(node.nodeId, new Set());
    for (const peer of node.connectedTo) {
      adjacency.get(node.nodeId)!.add(peer);
      if (!adjacency.has(peer)) adjacency.set(peer, new Set());
      adjacency.get(peer)!.add(node.nodeId);
    }
  }

  const visited = new Set<string>();
  const partitions: Partition[] = [];
  let partId = 0;

  for (const nodeId of adjacency.keys()) {
    if (visited.has(nodeId)) continue;
    const component = bfs(adjacency, nodeId, visited);
    const quorumSize = Math.ceil(nodes.length / 2);
    partitions.push({
      id: partId++,
      nodes: component,
      size: component.length,
      hasQuorum: component.length >= quorumSize,
    });
  }

  const quorumSize = Math.ceil(nodes.length / 2);
  return {
    partitioned: partitions.length > 1,
    partitions,
    totalNodes: nodes.length,
    quorumSize,
    generatedAt: new Date().toISOString(),
  };
}
