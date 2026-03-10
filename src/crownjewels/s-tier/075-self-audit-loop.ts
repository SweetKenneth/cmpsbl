/**
 * S-Tier 075 — Self-Audit Loop
 * CJPI: 92 | Node: GOVERNANCE | ID: S-78
 *
 * Continuous self-audit engine that checks policy compliance,
 * detects configuration drift, and generates compliance reports.
 */

export interface AuditPolicy {
  id: string;
  name: string;
  check: () => { compliant: boolean; details: string };
}

export interface AuditResult {
  policyId: string;
  policyName: string;
  compliant: boolean;
  details: string;
  auditedAt: string;
}

export interface AuditReport {
  results: AuditResult[];
  totalPolicies: number;
  compliantCount: number;
  complianceRate: number;
  generatedAt: string;
}

const policies = new Map<string, AuditPolicy>();

export function registerPolicy(policy: AuditPolicy): void {
  policies.set(policy.id, policy);
}

export function removePolicy(id: string): boolean {
  return policies.delete(id);
}

export function runAudit(): AuditReport {
  const results: AuditResult[] = [];

  for (const policy of policies.values()) {
    try {
      const { compliant, details } = policy.check();
      results.push({ policyId: policy.id, policyName: policy.name, compliant, details, auditedAt: new Date().toISOString() });
    } catch (err) {
      results.push({
        policyId: policy.id,
        policyName: policy.name,
        compliant: false,
        details: `Audit check threw: ${err instanceof Error ? err.message : String(err)}`,
        auditedAt: new Date().toISOString(),
      });
    }
  }

  const compliantCount = results.filter(r => r.compliant).length;
  return {
    results,
    totalPolicies: results.length,
    compliantCount,
    complianceRate: results.length > 0 ? Math.round((compliantCount / results.length) * 100) : 100,
    generatedAt: new Date().toISOString(),
  };
}

export function getComplianceScore(): number {
  const report = runAudit();
  return report.complianceRate;
}
