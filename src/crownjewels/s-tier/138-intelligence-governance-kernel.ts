/**
 * S-Tier 138 — Intelligence Governance Kernel
 * ID: S-CJ96 | CJPI: 86 | Module: GOVERNANCE
 * 
 * Core governance kernel for intelligence operations oversight.
 */

export interface GovernanceRule {
  id: string;
  scope: string;
  constraint: string;
  enforcement: 'strict' | 'advisory' | 'log_only';
  enabled: boolean;
}

export interface GovernanceViolation {
  id: string;
  ruleId: string;
  operation: string;
  details: string;
  severity: 'info' | 'warning' | 'violation' | 'critical';
  timestamp: string;
  resolved: boolean;
}

export class IntelligenceGovernanceKernel {
  private rules: Map<string, GovernanceRule> = new Map();
  private violations: GovernanceViolation[] = [];

  /** Evaluate a constraint expression against an operation */
  private evaluateConstraint(constraint: string, operation: string, scope: string): boolean {
    // Parse constraint DSL: supports operators like "deny:<pattern>", "require:<pattern>", "limit:<threshold>"
    const parts = constraint.split(':');
    const operator = parts[0]?.toLowerCase();
    const value = parts.slice(1).join(':');

    switch (operator) {
      case 'deny':
        // Operation matches a denied pattern
        return new RegExp(value, 'i').test(operation);
      case 'require':
        // Operation must match pattern — violation if it doesn't
        return !new RegExp(value, 'i').test(operation);
      case 'limit':
        // Check if operation count exceeds threshold (stateless check based on violations history)
        const threshold = parseInt(value, 10);
        if (isNaN(threshold)) return false;
        const recentViolations = this.violations.filter(
          v => v.operation === operation && !v.resolved &&
          Date.now() - new Date(v.timestamp).getTime() < 3600000
        ).length;
        return recentViolations >= threshold;
      case 'scope_match':
        // Scope must exactly match value
        return scope !== value;
      default:
        // Unknown constraint type — exact string match against operation
        return operation.toLowerCase().includes(constraint.toLowerCase());
    }
  }

  addRule(rule: GovernanceRule): void {
    this.rules.set(rule.id, rule);
  }

  check(operation: string, scope: string): { pass: boolean; violations: GovernanceViolation[] } {
    const applicableRules = [...this.rules.values()].filter(r => r.enabled && r.scope === scope);
    const newViolations: GovernanceViolation[] = [];
    let pass = true;

    for (const rule of applicableRules) {
      // Parse constraint expression and evaluate against the operation context
      const violated = this.evaluateConstraint(rule.constraint, operation, scope);
      if (violated) {
        const violation: GovernanceViolation = {
          id: crypto.randomUUID(),
          ruleId: rule.id,
          operation,
          details: `Constraint "${rule.constraint}" violated`,
          severity: rule.enforcement === 'strict' ? 'violation' : 'warning',
          timestamp: new Date().toISOString(),
          resolved: false,
        };
        newViolations.push(violation);
        this.violations.push(violation);
        if (rule.enforcement === 'strict') pass = false;
      }
    }

    return { pass, violations: newViolations };
  }

  resolve(violationId: string): boolean {
    const v = this.violations.find(v => v.id === violationId);
    if (!v) return false;
    v.resolved = true;
    return true;
  }

  getViolations(unresolvedOnly = true): GovernanceViolation[] {
    return this.violations.filter(v => !unresolvedOnly || !v.resolved);
  }

  getRules(): GovernanceRule[] { return [...this.rules.values()]; }
}
