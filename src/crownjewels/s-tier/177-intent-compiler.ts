/**
 * S-Tier 177 — Intent Compiler
 * ID: S-CJ135 | CJPI: 85 | Module: ENCODE
 * Compiles user intents into executable action plans.
 */

export interface IntentNode {
  id: string;
  intent: string;
  action: string;
  params: Record<string, unknown>;
  prerequisites: string[];
  compiled: boolean;
}

export interface CompiledPlan {
  id: string;
  nodes: IntentNode[];
  executionOrder: string[];
  compiledAt: string;
}

export class IntentCompiler {
  compile(intents: { intent: string; action: string; params: Record<string, unknown>; prerequisites?: string[] }[]): CompiledPlan {
    const nodes: IntentNode[] = intents.map(i => ({
      id: crypto.randomUUID(), intent: i.intent, action: i.action,
      params: i.params, prerequisites: i.prerequisites ?? [], compiled: false,
    }));

    // Topological sort
    const order: string[] = [];
    const visited = new Set<string>();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      const node = nodeMap.get(id);
      if (node) for (const p of node.prerequisites) visit(p);
      order.push(id);
    };
    for (const n of nodes) visit(n.id);
    for (const n of nodes) n.compiled = true;

    return {
      id: crypto.randomUUID(), nodes, executionOrder: order,
      compiledAt: new Date().toISOString(),
    };
  }
}
