/**
 * S-Tier 199 — Mesh Topology Optimizer
 * ID: S-MSH03 | CJPI: 92 | Module: MESH
 */
export class MeshTopologyOptimizer {
  private nodes: Map<string, { connections: string[]; traffic: number }> = new Map();

  addNode(id: string, connections: string[]): void { this.nodes.set(id, { connections, traffic: 0 }); }

  recordTraffic(fromId: string, toId: string, volume: number): void {
    const node = this.nodes.get(fromId);
    if (node) node.traffic += volume;
  }

  optimize(): { added: [string, string][]; removed: [string, string][] } {
    const added: [string, string][] = [];
    const removed: [string, string][] = [];
    const nodes = [...this.nodes.entries()].sort((a, b) => b[1].traffic - a[1].traffic);
    // Connect high-traffic nodes directly
    for (let i = 0; i < Math.min(3, nodes.length); i++) {
      for (let j = i + 1; j < Math.min(5, nodes.length); j++) {
        if (!nodes[i][1].connections.includes(nodes[j][0])) {
          nodes[i][1].connections.push(nodes[j][0]);
          added.push([nodes[i][0], nodes[j][0]]);
        }
      }
    }
    return { added, removed };
  }

  getAvgHopCount(): number {
    const sizes = [...this.nodes.values()].map(n => n.connections.length);
    return sizes.length > 0 ? sizes.reduce((s, v) => s + v, 0) / sizes.length : 0;
  }
}
