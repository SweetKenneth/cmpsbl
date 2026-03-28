/**
 * S-Tier 172 — Topology Mutation
 * ID: S-CJ130 | CJPI: 85 | Module: SYSTEM
 * Runtime topology mutation with live system reconfiguration.
 */

export interface TopologyNode {
  id: string;
  role: string;
  connections: string[];
  weight: number;
}

export interface TopologyMutation {
  id: string;
  type: 'add_node' | 'remove_node' | 'add_edge' | 'remove_edge' | 'reweight';
  target: string;
  params: Record<string, unknown>;
  appliedAt?: string;
  rolledBack: boolean;
}

export class TopologyMutator {
  private nodes: Map<string, TopologyNode> = new Map();
  private mutations: TopologyMutation[] = [];

  addNode(node: TopologyNode): void { this.nodes.set(node.id, node); }

  mutate(type: TopologyMutation['type'], target: string, params: Record<string, unknown> = {}): TopologyMutation {
    const mutation: TopologyMutation = {
      id: crypto.randomUUID(), type, target, params,
      appliedAt: new Date().toISOString(), rolledBack: false,
    };

    switch (type) {
      case 'add_edge': {
        const node = this.nodes.get(target);
        const to = params.to as string;
        if (node && to && !node.connections.includes(to)) node.connections.push(to);
        break;
      }
      case 'remove_edge': {
        const node = this.nodes.get(target);
        const edge = params.edge as string;
        if (node) node.connections = node.connections.filter(c => c !== edge);
        break;
      }
      case 'reweight': {
        const node = this.nodes.get(target);
        if (node) node.weight = params.weight as number;
        break;
      }
    }

    this.mutations.push(mutation);
    return mutation;
  }

  getTopology(): TopologyNode[] { return Array.from(this.nodes.values()); }
  getMutationHistory(): TopologyMutation[] { return [...this.mutations]; }
}
