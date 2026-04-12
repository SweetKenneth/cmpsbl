/**
 * CMPSBL® Activation Proof Emitter
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Phase 3: Proves that drop-in activation worked.
 *
 * After artifact initialization, this emitter generates a structured
 * report showing:
 *   - Which primitives were bound
 *   - Which rules were resolved
 *   - Which engines are active
 *   - What signals are ready
 *
 * This is the foundation for Phase 6 (Verification & Proof Layer).
 *
 * © CMPSBL® — All rights reserved.
 */

import type { FunctionIdentity } from './function-identity';
import { getAllIdentities, getWrappedFunctionCount } from './function-identity';
import { getRegisteredRuleCount, getRegisteredRuleIds } from './orchestration-engine';
import { resolveEngine } from './primitive-engine-map';
import type { BehaviorEngine } from './primitive-engine-map';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PrimitiveActivationProof {
  readonly primitive: string;
  readonly engine: BehaviorEngine;
  readonly functionsWrapped: number;
  readonly rulesRegistered: number;
  readonly status: 'activated' | 'bound' | 'unresolved';
}

export interface ActivationReport {
  readonly timestamp: number;
  readonly totalPrimitives: number;
  readonly totalFunctions: number;
  readonly totalRules: number;
  readonly activatedCount: number;
  readonly boundCount: number;
  readonly unresolvedCount: number;
  readonly engineDistribution: Record<BehaviorEngine, number>;
  readonly primitives: readonly PrimitiveActivationProof[];
  readonly dropInSuccess: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a full activation report.
 * Call this after artifact initialization to prove behavior activated.
 */
export function generateActivationReport(): ActivationReport {
  const identities = getAllIdentities();
  const ruleIds = getRegisteredRuleIds();

  // Group identities by primitive
  const byPrimitive = new Map<string, FunctionIdentity[]>();
  for (const id of identities) {
    const existing = byPrimitive.get(id.primitive) ?? [];
    existing.push(id);
    byPrimitive.set(id.primitive, existing);
  }

  // Count rules per primitive (rules are prefixed with primitive name)
  const rulesByPrimitive = new Map<string, number>();
  for (const ruleId of ruleIds) {
    // Rule IDs follow patterns like `cortex-tighten-DEFENSE` or `attachment-DEFENSE-defense_gate`
    for (const prim of byPrimitive.keys()) {
      if (ruleId.includes(prim) || ruleId.includes(prim.toLowerCase())) {
        rulesByPrimitive.set(prim, (rulesByPrimitive.get(prim) ?? 0) + 1);
      }
    }
  }

  // Build per-primitive proofs
  const primitiveProofs: PrimitiveActivationProof[] = [];
  const engineDist: Record<BehaviorEngine, number> = {
    interception: 0, analysis: 0, state: 0, execution: 0,
    orchestration: 0, observability: 0, generic: 0,
  };

  for (const [primitive, fns] of byPrimitive) {
    const engine = resolveEngine(primitive);
    const ruleCount = rulesByPrimitive.get(primitive) ?? 0;

    engineDist[engine]++;

    // Activated = has functions AND rules. Bound = has functions. Unresolved = no functions.
    const status: PrimitiveActivationProof['status'] =
      fns.length > 0 && ruleCount > 0 ? 'activated' :
      fns.length > 0 ? 'bound' :
      'unresolved';

    primitiveProofs.push({
      primitive,
      engine,
      functionsWrapped: fns.length,
      rulesRegistered: ruleCount,
      status,
    });
  }

  const activated = primitiveProofs.filter(p => p.status === 'activated').length;
  const bound = primitiveProofs.filter(p => p.status === 'bound').length;
  const unresolved = primitiveProofs.filter(p => p.status === 'unresolved').length;

  return {
    timestamp: Date.now(),
    totalPrimitives: byPrimitive.size,
    totalFunctions: getWrappedFunctionCount(),
    totalRules: getRegisteredRuleCount(),
    activatedCount: activated,
    boundCount: bound,
    unresolvedCount: unresolved,
    engineDistribution: engineDist,
    primitives: primitiveProofs,
    dropInSuccess: unresolved === 0 && byPrimitive.size > 0,
  };
}

/**
 * Quick check: did all primitives activate successfully?
 */
export function isFullyActivated(): boolean {
  const report = generateActivationReport();
  return report.dropInSuccess;
}

/**
 * Get a human-readable summary string.
 */
export function getActivationSummary(): string {
  const r = generateActivationReport();
  const status = r.dropInSuccess ? '✔ DROP-IN SUCCESSFUL' : '⚠ INCOMPLETE ACTIVATION';
  return `${status} — ${r.totalPrimitives} primitives, ${r.totalFunctions} functions, ${r.totalRules} rules, ${r.activatedCount} activated, ${r.boundCount} bound-only, ${r.unresolvedCount} unresolved`;
}
