/**
 * Audit Engine — v10.5.0 ARCHITECT Epoch
 * Production readiness validation framework
 */

export { runFullAudit } from './audit-runner';
export type { AuditReport, AuditFinding, AuditSeverity, AuditCategory } from './audit-types';

// Substrate Health Check — structural integrity primitive
export { runSubstrateHealthCheck, quickStructuralCheck } from './substrate-health-check';
export type { HealthCheckReport, LayerResult, CheckResult, LayerId, Verdict } from './substrate-health-check';
