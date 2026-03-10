/**
 * S-Tier 074 — Capability Gate Engine
 * CJPI: 92 | Node: ATLAS | ID: S-77
 *
 * Feature-flag gating with entitlement checking and progressive rollout.
 * Controls which capabilities are active based on rules and entitlements.
 */

export interface CapabilityGate {
  id: string;
  capability: string;
  enabled: boolean;
  rolloutPct: number;     // 0-100
  requiredEntitlement?: string;
  conditions: Record<string, unknown>;
}

export interface GateEvaluation {
  capability: string;
  allowed: boolean;
  reason: string;
}

const gates = new Map<string, CapabilityGate>();

export function registerGate(gate: CapabilityGate): void {
  gates.set(gate.id, gate);
}

export function evaluateGate(
  capabilityId: string,
  context: { userId?: string; entitlements?: string[]; attributes?: Record<string, unknown> }
): GateEvaluation {
  const gate = [...gates.values()].find(g => g.capability === capabilityId);
  if (!gate) return { capability: capabilityId, allowed: true, reason: 'No gate registered' };
  if (!gate.enabled) return { capability: capabilityId, allowed: false, reason: 'Gate disabled' };

  // Entitlement check
  if (gate.requiredEntitlement && !(context.entitlements ?? []).includes(gate.requiredEntitlement)) {
    return { capability: capabilityId, allowed: false, reason: `Missing entitlement: ${gate.requiredEntitlement}` };
  }

  // Rollout percentage (deterministic by userId)
  if (gate.rolloutPct < 100 && context.userId) {
    const hash = [...context.userId].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
    const bucket = Math.abs(hash) % 100;
    if (bucket >= gate.rolloutPct) {
      return { capability: capabilityId, allowed: false, reason: `Outside rollout (${gate.rolloutPct}%)` };
    }
  }

  return { capability: capabilityId, allowed: true, reason: 'All gate checks passed' };
}

export function listGates(): CapabilityGate[] { return [...gates.values()]; }
export function removeGate(id: string): boolean { return gates.delete(id); }
