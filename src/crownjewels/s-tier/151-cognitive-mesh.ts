/**
 * S-Tier 151 — Cognitive Mesh
 * ID: S-CJ109 | CJPI: 85 | Module: MESH
 * Distributed cognitive mesh for collaborative intelligence.
 */

export interface CognitiveNode {
  id: string;
  specialization: string;
  capacity: number;
  load: number;
  peers: string[];
  lastSeen: number;
}

export interface MeshTask {
  id: string;
  type: string;
  assignedTo: string;
  fragments: { nodeId: string; portion: number }[];
  status: 'pending' | 'distributed' | 'aggregated';
}

export class CognitiveMesh {
  private nodes: Map<string, CognitiveNode> = new Map();
  private tasks: MeshTask[] = [];

  addNode(node: CognitiveNode): void { this.nodes.set(node.id, node); }

  distribute(taskType: string, complexity: number): MeshTask | null {
    const available = [...this.nodes.values()]
      .filter(n => n.capacity - n.load > 0 && Date.now() - n.lastSeen < 30000)
      .sort((a, b) => (b.capacity - b.load) - (a.capacity - a.load));
    if (available.length === 0) return null;

    let remaining = complexity;
    const fragments: MeshTask['fragments'] = [];
    for (const node of available) {
      if (remaining <= 0) break;
      const portion = Math.min(remaining, node.capacity - node.load);
      fragments.push({ nodeId: node.id, portion });
      node.load += portion;
      remaining -= portion;
    }

    const task: MeshTask = {
      id: crypto.randomUUID(), type: taskType,
      assignedTo: fragments[0]?.nodeId ?? '', fragments, status: 'distributed',
    };
    this.tasks.push(task);
    return task;
  }

  getTopology(): { nodes: number; edges: number; avgLoad: number } {
    const nodes = [...this.nodes.values()];
    const edges = nodes.reduce((s, n) => s + n.peers.length, 0) / 2;
    const avgLoad = nodes.length > 0 ? nodes.reduce((s, n) => s + n.load / n.capacity, 0) / nodes.length : 0;
    return { nodes: nodes.length, edges, avgLoad };
  }
}
