/**
 * S-Tier 149 — Autonomous Operator
 * ID: S-CJ107 | CJPI: 85 | Module: SYSTEM
 * Fully autonomous system operator with policy-bounded actions.
 */

export interface OperatorPolicy {
  id: string;
  scope: string;
  allowedActions: string[];
  maxImpactLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
  cooldownMs: number;
}

export interface OperatorAction {
  id: string;
  action: string;
  target: string;
  impactLevel: string;
  policyId: string;
  status: 'pending' | 'approved' | 'executed' | 'rejected' | 'rolled_back';
  executedAt?: string;
  result?: Record<string, unknown>;
}

export class AutonomousOperator {
  private policies: Map<string, OperatorPolicy> = new Map();
  private actions: OperatorAction[] = [];
  private lastActionTime: Map<string, number> = new Map();

  addPolicy(policy: OperatorPolicy): void {
    this.policies.set(policy.id, policy);
  }

  propose(action: string, target: string, impactLevel: 'low' | 'medium' | 'high' | 'critical'): OperatorAction | null {
    const policy = this.findMatchingPolicy(action);
    if (!policy) return null;

    const impactRank = { low: 1, medium: 2, high: 3, critical: 4 };
    if (impactRank[impactLevel] > impactRank[policy.maxImpactLevel]) return null;

    const lastTime = this.lastActionTime.get(policy.id) ?? 0;
    if (Date.now() - lastTime < policy.cooldownMs) return null;

    const op: OperatorAction = {
      id: crypto.randomUUID(),
      action, target, impactLevel, policyId: policy.id,
      status: policy.requiresApproval ? 'pending' : 'approved',
    };
    this.actions.push(op);
    return op;
  }

  execute(actionId: string): boolean {
    const action = this.actions.find(a => a.id === actionId);
    if (!action || (action.status !== 'approved')) return false;
    action.status = 'executed';
    action.executedAt = new Date().toISOString();
    this.lastActionTime.set(action.policyId, Date.now());
    return true;
  }

  private findMatchingPolicy(action: string): OperatorPolicy | undefined {
    return [...this.policies.values()].find(p => p.allowedActions.includes(action));
  }

  getHistory(): OperatorAction[] { return [...this.actions]; }
}
