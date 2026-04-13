/**
 * Registry-to-Runtime Bridge — Lex Registry → Mana Runtime Enforcement
 * U.S. Patent App. No. 64/031,637
 *
 * Connects the Lex Registry (backend) to runtime Lex rules (engine).
 * When a package is looked up in the registry, its protection status
 * is hydrated into live Lex governance rules that govern runtime behavior.
 *
 * This turns the registry from a record system into an execution authority.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ManaCapability, LexRule } from './types';
import { registerRule, revokeRule } from './lex';
import type { LexRegistryEntry, LexRegistryStatus } from '@/services/lex-registry';
import { lookupRegistry } from '@/services/lex-registry';

// ═══════════════════════════════════════════════════════════════
// Registry Status → Lex Rule Mapping
// ═══════════════════════════════════════════════════════════════

/**
 * Policy map: how each registry status translates to runtime governance.
 *
 * - protected → all capabilities denied unless explicitly allowed
 * - licensed → observation mode (capabilities allowed but audited)
 * - unregistered → permissive (no registry-driven restrictions)
 */
interface RegistryPolicy {
  /** Default Lex verdict for all capabilities on this package */
  readonly defaultVerdict: 'allow' | 'deny' | 'observe';
  /** Lex rule priority — lower = higher precedence */
  readonly priority: number;
  /** Human-readable reason for audit trail */
  readonly reason: string;
}

const REGISTRY_POLICIES: Record<LexRegistryStatus, RegistryPolicy> = {
  protected: {
    defaultVerdict: 'deny',
    priority: 10,
    reason: 'Registry: package is PROTECTED — Layer 2 attachment blocked by IP governance',
  },
  licensed: {
    defaultVerdict: 'observe',
    priority: 50,
    reason: 'Registry: package is LICENSED — Layer 2 capabilities allowed with full audit',
  },
  unregistered: {
    defaultVerdict: 'allow',
    priority: 200,
    reason: 'Registry: package is UNREGISTERED — no registry-driven restrictions',
  },
};

// ═══════════════════════════════════════════════════════════════
// Hydrated Rule Tracking
// ═══════════════════════════════════════════════════════════════

/** Tracks which rules were injected by the registry bridge for clean removal */
const hydratedRuleIds = new Map<string, string[]>();

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

export interface RegistryEnforcementResult {
  /** Registry status resolved */
  readonly status: LexRegistryStatus;
  /** Number of Lex rules hydrated */
  readonly rulesCreated: number;
  /** Rule IDs for later revocation */
  readonly ruleIds: ReadonlyArray<string>;
  /** Policy applied */
  readonly policy: RegistryPolicy;
  /** Package identifier used for lookup */
  readonly packageKey: string;
}

/**
 * Look up a package in the Lex Registry and hydrate runtime Lex rules
 * based on its registration status.
 *
 * Call this BEFORE attach() to ensure registry governance is in place.
 *
 * @param packageHash - SHA-256 hash of the package source (authoritative lookup)
 * @param packageName - Package name (convenience fallback, non-authoritative)
 * @param targetFunctions - Function names to apply rules to (use '*' for all)
 */
export async function enforceRegistryStatus(
  packageHash?: string,
  packageName?: string,
  targetFunctions: string[] = ['*'],
): Promise<RegistryEnforcementResult> {
  if (!packageHash && !packageName) {
    throw new Error('[MANA/REGISTRY-BRIDGE] Must provide packageHash or packageName for lookup');
  }

  // Look up in the registry — hash is authoritative, name is fallback
  const entry: LexRegistryEntry = await lookupRegistry({
    hash: packageHash,
    name: packageName,
  });

  const status = entry.status;
  const policy = REGISTRY_POLICIES[status];
  const packageKey = packageHash ?? packageName ?? 'unknown';

  // Revoke any previously hydrated rules for this package
  clearHydratedRules(packageKey);

  // Hydrate Lex rules based on policy
  const ruleIds: string[] = [];

  if (status !== 'unregistered') {
    for (const target of targetFunctions) {
      // Apply wildcard capability rule — governs ALL capabilities on this target
      const rule = registerRule(
        '*' as ManaCapability,
        target,
        policy.defaultVerdict,
        policy.reason,
        policy.priority,
      );
      ruleIds.push(rule.id);
    }
  }

  hydratedRuleIds.set(packageKey, ruleIds);

  return {
    status,
    rulesCreated: ruleIds.length,
    ruleIds,
    policy,
    packageKey,
  };
}

/**
 * Remove all registry-hydrated rules for a package.
 * Call this before re-hydrating or when detaching.
 */
export function clearHydratedRules(packageKey: string): number {
  const ids = hydratedRuleIds.get(packageKey);
  if (!ids) return 0;

  let removed = 0;
  for (const id of ids) {
    if (revokeRule(id)) removed++;
  }
  hydratedRuleIds.delete(packageKey);
  return removed;
}

/**
 * Check if a package has active registry-hydrated rules.
 */
export function hasRegistryEnforcement(packageKey: string): boolean {
  const ids = hydratedRuleIds.get(packageKey);
  return !!ids && ids.length > 0;
}

/**
 * Get all currently hydrated package keys.
 */
export function getEnforcedPackages(): ReadonlyArray<string> {
  return Array.from(hydratedRuleIds.keys());
}

/**
 * Clear all registry-hydrated rules across all packages.
 */
export function clearAllRegistryRules(): number {
  let total = 0;
  for (const key of hydratedRuleIds.keys()) {
    total += clearHydratedRules(key);
  }
  return total;
}
