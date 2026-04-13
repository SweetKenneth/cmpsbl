/**
 * Registry-to-Runtime Bridge — Lex Registry → Mana Runtime Enforcement
 * U.S. Patent App. No. 64/031,637
 *
 * Connects the Lex Registry (backend) to runtime Lex rules (engine or session).
 * When a package is looked up in the registry, its protection status
 * is hydrated into live Lex governance rules that govern runtime behavior.
 *
 * This turns the registry from a record system into an execution authority.
 *
 * Session-aware: when a ManaSession is provided, rules are scoped to that session.
 * Falls back to global Lex only when no session is given.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { LexRule, LexVerdict, ManaCapabilityOrWildcard } from './types';
import { registerRule as globalRegisterRule, revokeRule as globalRevokeRule } from './lex';
import type { LexRegistryEntry, LexRegistryStatus } from '@/services/lex-registry';
import { lookupRegistry } from '@/services/lex-registry';
import type { ManaSession } from './session';

// ═══════════════════════════════════════════════════════════════
// Registry Status → Lex Rule Mapping
// ═══════════════════════════════════════════════════════════════

interface RegistryPolicy {
  readonly defaultVerdict: LexVerdict;
  readonly priority: number;
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
// Rule Registration Abstraction (session-aware)
// ═══════════════════════════════════════════════════════════════

interface RuleOps {
  register(capability: ManaCapabilityOrWildcard, target: string, verdict: LexVerdict, reason: string, priority: number): LexRule;
  revoke(ruleId: string): boolean;
}

function getOps(session?: ManaSession): RuleOps {
  if (session) {
    return {
      register: (cap, target, verdict, reason, priority) =>
        session.registerRule(cap as Parameters<typeof session.registerRule>[0], target, verdict, reason, priority),
      revoke: (ruleId) => session.revokeRule(ruleId),
    };
  }
  return {
    register: globalRegisterRule,
    revoke: globalRevokeRule,
  };
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

export interface RegistryEnforcementResult {
  readonly status: LexRegistryStatus;
  readonly rulesCreated: number;
  readonly ruleIds: ReadonlyArray<string>;
  readonly policy: RegistryPolicy;
  readonly packageKey: string;
}

/**
 * Look up a package in the Lex Registry and hydrate runtime Lex rules
 * based on its registration status.
 *
 * Call this BEFORE attach() to ensure registry governance is in place.
 *
 * @param session - Optional ManaSession for session-scoped enforcement (recommended)
 * @param packageHash - SHA-256 hash of the package source (authoritative lookup)
 * @param packageName - Package name (convenience fallback, non-authoritative)
 * @param targetFunctions - Function names to apply rules to (use '*' for all)
 */
export async function enforceRegistryStatus(
  session?: ManaSession,
  packageHash?: string,
  packageName?: string,
  targetFunctions: string[] = ['*'],
): Promise<RegistryEnforcementResult> {
  if (!packageHash && !packageName) {
    throw new Error('[MANA/REGISTRY-BRIDGE] Must provide packageHash or packageName for lookup');
  }

  const entry: LexRegistryEntry = await lookupRegistry({
    hash: packageHash,
    name: packageName,
  });

  const status = entry.status;
  const policy = REGISTRY_POLICIES[status];
  const packageKey = packageHash ?? packageName ?? 'unknown';
  const ops = getOps(session);

  // Revoke any previously hydrated rules for this package
  clearHydratedRules(packageKey, session);

  // Hydrate Lex rules based on policy
  const ruleIds: string[] = [];

  if (status !== 'unregistered') {
    for (const target of targetFunctions) {
      // Wildcard capability — properly typed as ManaCapabilityOrWildcard
      const rule = ops.register(
        '*',
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
 */
export function clearHydratedRules(packageKey: string, session?: ManaSession): number {
  const ids = hydratedRuleIds.get(packageKey);
  if (!ids) return 0;

  const ops = getOps(session);
  let removed = 0;
  for (const id of ids) {
    if (ops.revoke(id)) removed++;
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
export function clearAllRegistryRules(session?: ManaSession): number {
  let total = 0;
  for (const key of Array.from(hydratedRuleIds.keys())) {
    total += clearHydratedRules(key, session);
  }
  return total;
}
