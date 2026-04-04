/**
 * S-Tier 222 — Capability Forge Engine
 * CJPI: 90 | Module: FORGE | ID: S-FRG01
 *
 * Synthesizes new capabilities from registered primitives via
 * multi-stage composition. Tracks cost, validates compatibility,
 * and produces capability manifests. Zero dependencies.
 */

export interface ForgePrimitive {
  id: string;
  operation: string;
  cost: number;
  compatibleWith: string[];
}

export interface ForgedCapability {
  id: string;
  stages: string[];
  totalCost: number;
  compatibility: number;
  forgedAt: string;
}

export interface ForgeStats {
  registeredPrimitives: number;
  totalForged: number;
  avgCost: number;
  avgStages: number;
}

export function createCapabilityForge() {
  const primitives = new Map<string, ForgePrimitive>();
  const forged: ForgedCapability[] = [];

  function register(id: string, operation: string, cost: number, compatibleWith: string[] = []): void {
    primitives.set(id, { id, operation, cost, compatibleWith });
  }

  function synthesize(operations: string[]): ForgedCapability {
    let totalCost = 0;
    let compatCount = 0;
    let pairCount = 0;

    for (let i = 0; i < operations.length; i++) {
      const prim = [...primitives.values()].find(p => p.operation === operations[i]);
      totalCost += prim?.cost ?? 1;
      if (i > 0) {
        pairCount++;
        const prev = [...primitives.values()].find(p => p.operation === operations[i - 1]);
        if (prev && prim && prev.compatibleWith.includes(prim.id)) compatCount++;
      }
    }

    const capability: ForgedCapability = {
      id: `cap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stages: operations,
      totalCost,
      compatibility: pairCount > 0 ? compatCount / pairCount : 1,
      forgedAt: new Date().toISOString(),
    };

    forged.push(capability);
    return capability;
  }

  function validateComposition(operations: string[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    for (const op of operations) {
      if (![...primitives.values()].some(p => p.operation === op)) {
        issues.push(`Unknown operation: ${op}`);
      }
    }
    if (operations.length > 10) issues.push('Exceeds max stage limit (10)');
    return { valid: issues.length === 0, issues };
  }

  function getStats(): ForgeStats {
    return {
      registeredPrimitives: primitives.size,
      totalForged: forged.length,
      avgCost: forged.length > 0 ? forged.reduce((s, f) => s + f.totalCost, 0) / forged.length : 0,
      avgStages: forged.length > 0 ? forged.reduce((s, f) => s + f.stages.length, 0) / forged.length : 0,
    };
  }

  function reset(): void {
    primitives.clear();
    forged.length = 0;
  }

  return { register, synthesize, validateComposition, getStats, reset };
}
