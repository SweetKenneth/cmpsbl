/**
 * S-Tier 055 — Sovereign Authority Kernel
 * CJPI: 93 | Node: SOVEREIGN | ID: S-SOV01
 *
 * Central authority enforcement — validates that all data operations
 * comply with registered sovereignty policies before execution.
 */

export interface AuthorityPolicy {
  id: string;
  scope: string;          // e.g. 'user_data', 'analytics', 'telemetry'
  requireConsent: boolean;
  allowedRegions: string[];
  maxRetentionDays: number | null;
}

export interface AuthorityCheck {
  policyId: string;
  scope: string;
  allowed: boolean;
  reason: string;
}

const policies = new Map<string, AuthorityPolicy>();

export function registerPolicy(policy: AuthorityPolicy): void {
  policies.set(policy.id, policy);
}

export function checkAuthority(scope: string, region: string, hasConsent: boolean): AuthorityCheck {
  const matching = [...policies.values()].filter(p => p.scope === scope);
  if (matching.length === 0) {
    return { policyId: 'none', scope, allowed: true, reason: 'No policy registered for scope' };
  }
  for (const policy of matching) {
    if (policy.requireConsent && !hasConsent) {
      return { policyId: policy.id, scope, allowed: false, reason: 'Consent required but not provided' };
    }
    if (!policy.allowedRegions.includes(region) && !policy.allowedRegions.includes('*')) {
      return { policyId: policy.id, scope, allowed: false, reason: `Region ${region} not in allowed list` };
    }
  }
  return { policyId: matching[0].id, scope, allowed: true, reason: 'All authority checks passed' };
}

export function listPolicies(): AuthorityPolicy[] { return [...policies.values()]; }
export function removePolicy(id: string): boolean { return policies.delete(id); }
