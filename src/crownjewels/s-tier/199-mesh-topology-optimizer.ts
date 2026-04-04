/**
 * S-Tier 199 — Mesh Topology Optimizer
 * ID: S-MSH03 | CJPI: 92 | Module: MESH
 *
 * Optimizes mesh network topology by analyzing traffic patterns,
 * adding high-traffic shortcuts, pruning underutilized links,
 * and computing reachability metrics.
 */

export interface TopologyMeshNode {
  id: string;
  connections: Set<string>;
  trafficIn: number;
  trafficOut: number;
  lastActive: number;
}

export class MeshTopologyOptimizer {
  private nodes: Map<string, TopologyMeshNode> = new Map();
  private optimizationLog: { action: string; detail: string; timestamp: number }[] = [];

  addNode(id: string, connections: string[] = []): void {
    this.nodes.set(id, { id, connections: new Set(connections), trafficIn: 0, trafficOut: 0, lastActive: Date.now() });
    // Ensure bidirectional links
    for (const conn of connections) {
      const peer = this.nodes.get(conn);
      if (peer) peer.connections.add(id);
    }
  }

  removeNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    // Remove references from peers
    for (const conn of node.connections) {
      this.nodes.get(conn)?.connections.delete(id);
    }
    this.nodes.delete(id);
    return true;
  }

  recordTraffic(fromId: string, toId: string, volume: number): void {
    const from = this.nodes.get(fromId);
    const to = this.nodes.get(toId);
    if (from) { from.trafficOut += volume; from.lastActive = Date.now(); }
    if (to) { to.trafficIn += volume; to.lastActive = Date.now(); }
  }

  optimize(config: { maxNewLinks?: number; pruneThreshold?: number } = {}): { added: [string, string][]; removed: [string, string][] } {
    const { maxNewLinks = 5, pruneThreshold = 0.01 } = config;
    const added: [string, string][] = [];
    const removed: [string, string][] = [];

    const nodeList = [...this.nodes.values()].sort((a, b) => (b.trafficIn + b.trafficOut) - (a.trafficIn + a.trafficOut));
    const totalTraffic = nodeList.reduce((s, n) => s + n.trafficIn + n.trafficOut, 0);

    // Add shortcuts between high-traffic nodes that are not directly connected
    let addCount = 0;
    for (let i = 0; i < Math.min(nodeList.length, 10) && addCount < maxNewLinks; i++) {
      for (let j = i + 1; j < Math.min(nodeList.length, 10) && addCount < maxNewLinks; j++) {
        if (!nodeList[i].connections.has(nodeList[j].id)) {
          nodeList[i].connections.add(nodeList[j].id);
          nodeList[j].connections.add(nodeList[i].id);
          added.push([nodeList[i].id, nodeList[j].id]);
          addCount++;
        }
      }
    }

    // Prune underutilized links from low-traffic nodes
    if (totalTraffic > 0) {
      for (const node of nodeList) {
        const nodeTrafficShare = (node.trafficIn + node.trafficOut) / totalTraffic;
        if (nodeTrafficShare < pruneThreshold && node.connections.size > 1) {
          // Keep at least one connection
          const conns = [...node.connections];
          const toRemove = conns.slice(1).filter(() => Math.random() < 0.3);
          for (const conn of toRemove) {
            node.connections.delete(conn);
            this.nodes.get(conn)?.connections.delete(node.id);
            removed.push([node.id, conn]);
          }
        }
      }
    }

    this.optimizationLog.push({ action: 'optimize', detail: `added=${added.length}, removed=${removed.length}`, timestamp: Date.now() });
    return { added, removed };
  }

  getShortestPath(fromId: string, toId: string): string[] | null {
    const visited = new Set<string>();
    const queue: { node: string; path: string[] }[] = [{ node: fromId, path: [fromId] }];
    visited.add(fromId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.node === toId) return current.path;

      const node = this.nodes.get(current.node);
      if (!node) continue;

      for (const conn of node.connections) {
        if (!visited.has(conn)) {
          visited.add(conn);
          queue.push({ node: conn, path: [...current.path, conn] });
        }
      }
    }

    return null;
  }

  getAvgHopCount(): number {
    const sizes = [...this.nodes.values()].map(n => n.connections.size);
    return sizes.length > 0 ? sizes.reduce((s, v) => s + v, 0) / sizes.length : 0;
  }

  getReachability(): number {
    if (this.nodes.size < 2) return 1;
    const firstNode = [...this.nodes.keys()][0];
    const visited = new Set<string>();
    const queue = [firstNode];
    visited.add(firstNode);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const conn of (this.nodes.get(current)?.connections ?? [])) {
        if (!visited.has(conn)) { visited.add(conn); queue.push(conn); }
      }
    }

    return visited.size / this.nodes.size;
  }

  getStats(): { nodes: number; totalEdges: number; avgDegree: number; reachability: number; totalTraffic: number } {
    const nodes = [...this.nodes.values()];
    const totalEdges = nodes.reduce((s, n) => s + n.connections.size, 0) / 2;
    const totalTraffic = nodes.reduce((s, n) => s + n.trafficIn + n.trafficOut, 0);
    return { nodes: nodes.length, totalEdges, avgDegree: this.getAvgHopCount(), reachability: this.getReachability(), totalTraffic };
  }

  reset(): void {
    this.nodes.clear();
    this.optimizationLog = [];
  }
}
