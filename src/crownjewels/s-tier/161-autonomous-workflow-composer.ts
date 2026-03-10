/**
 * S-Tier 161 — Autonomous Workflow Composer
 * ID: S-CJ119 | CJPI: 85 | Module: CORTEX
 * Composes workflows autonomously from capability graph.
 */

export interface CapabilityPrimitive {
  id: string;
  name: string;
  inputType: string;
  outputType: string;
  cost: number;
  reliability: number;
}

export interface ComposedWorkflow {
  id: string;
  steps: { capabilityId: string; order: number }[];
  estimatedCost: number;
  estimatedReliability: number;
  composedAt: string;
}

export class AutonomousWorkflowComposer {
  private capabilities: Map<string, CapabilityPrimitive> = new Map();

  register(cap: CapabilityPrimitive): void { this.capabilities.set(cap.id, cap); }

  compose(inputType: string, outputType: string): ComposedWorkflow | null {
    // BFS to find shortest path from inputType to outputType
    const queue: { type: string; path: string[] }[] = [{ type: inputType, path: [] }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { type, path } = queue.shift()!;
      if (type === outputType && path.length > 0) {
        const steps = path.map((id, i) => ({ capabilityId: id, order: i }));
        return {
          id: crypto.randomUUID(), steps,
          estimatedCost: path.reduce((s, id) => s + (this.capabilities.get(id)?.cost ?? 0), 0),
          estimatedReliability: path.reduce((r, id) => r * (this.capabilities.get(id)?.reliability ?? 1), 1),
          composedAt: new Date().toISOString(),
        };
      }
      if (visited.has(type)) continue;
      visited.add(type);
      for (const cap of this.capabilities.values()) {
        if (cap.inputType === type) queue.push({ type: cap.outputType, path: [...path, cap.id] });
      }
    }
    return null;
  }

  getCapabilities(): CapabilityPrimitive[] { return [...this.capabilities.values()]; }
}
