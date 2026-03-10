/**
 * S-Tier 167 — Cascade Prevention
 * ID: S-CJ125 | CJPI: 85 | Module: CORE
 * Proactive cascade failure prevention through early detection.
 */

export interface CascadeRisk {
  id: string;
  sourceNode: string;
  affectedNodes: string[];
  riskScore: number;
  detectedAt: string;
  mitigated: boolean;
}

export class CascadePrevention {
  private dependencies: Map<string, string[]> = new Map();
  private risks: CascadeRisk[] = [];

  setDependencies(nodeId: string, deps: string[]): void { this.dependencies.set(nodeId, deps); }

  analyzeRisk(failingNode: string): CascadeRisk {
    const affected = this.getTransitiveDependents(failingNode);
    const risk: CascadeRisk = {
      id: crypto.randomUUID(), sourceNode: failingNode,
      affectedNodes: affected, riskScore: affected.length / Math.max(1, this.dependencies.size),
      detectedAt: new Date().toISOString(), mitigated: false,
    };
    this.risks.push(risk);
    return risk;
  }

  private getTransitiveDependents(nodeId: string): string[] {
    const dependents: Set<string> = new Set();
    const queue = [nodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const [node, deps] of this.dependencies) {
        if (deps.includes(current) && !dependents.has(node)) {
          dependents.add(node);
          queue.push(node);
        }
      }
    }
    return [...dependents];
  }

  mitigate(riskId: string): boolean {
    const risk = this.risks.find(r => r.id === riskId);
    if (!risk) return false;
    risk.mitigated = true;
    return true;
  }

  getActiveRisks(): CascadeRisk[] { return this.risks.filter(r => !r.mitigated); }
}
