/**
 * S-Tier 132 — Cross-Pipeline Arbitration Engine
 * ID: S-CJ90 | CJPI: 87 | Module: CORTEX
 * 
 * Arbitrates resource conflicts across concurrent pipelines.
 */

export interface PipelineClaim {
  pipelineId: string;
  resourceId: string;
  priority: number;
  requiredUnits: number;
  deadline?: string;
}

export interface ArbitrationResult {
  id: string;
  winners: { pipelineId: string; resourceId: string; grantedUnits: number }[];
  deferred: { pipelineId: string; resourceId: string; reason: string }[];
  resolvedAt: string;
}

export class CrossPipelineArbitrationEngine {
  private resources: Map<string, number> = new Map(); // resourceId → available units

  setCapacity(resourceId: string, units: number): void {
    this.resources.set(resourceId, units);
  }

  arbitrate(claims: PipelineClaim[]): ArbitrationResult {
    // Group by resource
    const byResource = new Map<string, PipelineClaim[]>();
    for (const claim of claims) {
      const group = byResource.get(claim.resourceId) || [];
      group.push(claim);
      byResource.set(claim.resourceId, group);
    }

    const winners: ArbitrationResult['winners'] = [];
    const deferred: ArbitrationResult['deferred'] = [];

    for (const [resourceId, resourceClaims] of byResource) {
      let available = this.resources.get(resourceId) ?? 0;
      // Sort by priority (highest first), then by deadline (earliest first)
      const sorted = [...resourceClaims].sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
        return 0;
      });

      for (const claim of sorted) {
        if (claim.requiredUnits <= available) {
          winners.push({ pipelineId: claim.pipelineId, resourceId, grantedUnits: claim.requiredUnits });
          available -= claim.requiredUnits;
        } else if (available > 0) {
          // Partial grant
          winners.push({ pipelineId: claim.pipelineId, resourceId, grantedUnits: available });
          available = 0;
        } else {
          deferred.push({ pipelineId: claim.pipelineId, resourceId, reason: 'Insufficient capacity' });
        }
      }
    }

    return { id: crypto.randomUUID(), winners, deferred, resolvedAt: new Date().toISOString() };
  }
}
