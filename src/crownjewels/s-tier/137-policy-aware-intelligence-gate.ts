/**
 * S-Tier 137 — Policy-Aware Intelligence Gate
 * ID: S-CJ95 | CJPI: 86 | Module: GOVERNANCE
 * 
 * Policy-driven gating for intelligence operations.
 */

export interface IntelligencePolicy {
  id: string;
  name: string;
  conditions: PolicyCondition[];
  effect: 'allow' | 'deny' | 'require_approval';
  priority: number;
}

export interface PolicyCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'in';
  value: unknown;
}

export interface GateRequest {
  operation: string;
  context: Record<string, unknown>;
  requestedBy: string;
}

export interface GateDecision {
  requestId: string;
  allowed: boolean;
  matchedPolicyId: string | null;
  effect: 'allow' | 'deny' | 'require_approval';
  reason: string;
}

export class PolicyAwareIntelligenceGate {
  private policies: IntelligencePolicy[] = [];

  addPolicy(policy: IntelligencePolicy): void {
    this.policies.push(policy);
    this.policies.sort((a, b) => b.priority - a.priority);
  }

  evaluate(request: GateRequest): GateDecision {
    for (const policy of this.policies) {
      if (this.matchesAllConditions(policy.conditions, { ...request.context, operation: request.operation })) {
        return {
          requestId: crypto.randomUUID(),
          allowed: policy.effect === 'allow',
          matchedPolicyId: policy.id,
          effect: policy.effect,
          reason: `Matched policy: ${policy.name}`,
        };
      }
    }
    // Default deny
    return {
      requestId: crypto.randomUUID(),
      allowed: false,
      matchedPolicyId: null,
      effect: 'deny',
      reason: 'No matching policy — default deny',
    };
  }

  private matchesAllConditions(conditions: PolicyCondition[], context: Record<string, unknown>): boolean {
    return conditions.every(c => {
      const value = context[c.field];
      switch (c.operator) {
        case 'eq': return value === c.value;
        case 'neq': return value !== c.value;
        case 'gt': return typeof value === 'number' && typeof c.value === 'number' && value > c.value;
        case 'lt': return typeof value === 'number' && typeof c.value === 'number' && value < c.value;
        case 'contains': return typeof value === 'string' && typeof c.value === 'string' && value.includes(c.value);
        case 'in': return Array.isArray(c.value) && c.value.includes(value);
        default: return false;
      }
    });
  }

  getPolicies(): IntelligencePolicy[] { return [...this.policies]; }
}
