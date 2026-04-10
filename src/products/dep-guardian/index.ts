/**
 * DEP-GUARDIAN v1.0.0
 * Autonomous Dependency Health Monitor
 *
 * A standalone enterprise-grade product composed from:
 *   - CJ-067: Technical Debt Quantifier (severity scoring)
 *   - CJ-148: Evolution Governance Engine (upgrade approval)
 *   - CJ-092: Cascading Failure Isolator (dependency graph)
 *   - CJ-101: Root Cause Analysis (temporal correlation)
 *
 * Primitives: ENGINEER, EVOLUTION, SOVEREIGN, COMPASS, DEFENSE,
 *             CONSCIENCE, BEACON, SHADOW, REFLEX
 * Convex Core dependency: NONE — fully standalone
 *
 * @example
 * ```typescript
 * import { DepGuardian } from '@cmpsbl/dep-guardian';
 *
 * const guardian = new DepGuardian({
 *   cadenceMs: 6 * 60 * 60 * 1000,
 *   enableAutoUpgrade: true,
 * });
 *
 * const report = await guardian.run(dependencyContext);
 * console.log(`Health: ${report.healthScore}/100`);
 * console.log(`License compliance: ${report.licenseCompliance.complianceRate}%`);
 * console.log(`Upgrades applied: ${report.upgradesApplied}`);
 * ```
 */

// Core engine
export { DepGuardian } from './guardian';

// Extension points
export { registerRule, removeRule, getRegisteredRules } from './scanner';
export { registerUpgradeHandler } from './upgrader';

// Receipt chain (for external verification)
export { ReceiptChain } from './receipts';

// Types
export type {
  // Config
  GuardianConfig,
  GovernancePolicy,

  // Dependencies
  DependencyEntry,
  DependencyContext,

  // Scanner
  DepScanRule,
  DetectedDepIssue,

  // Triage
  TriageResult,

  // Governance
  GovernanceDecision,
  GovernanceVerdict,

  // Upgrader
  UpgradeAttempt,

  // Reporter
  GuardianReport,
  GuardianFinding,
  PreventedIssue,
  LicenseComplianceReport,
  LicenseViolation,

  // Receipts
  GuardianReceipt,

  // Enums
  DepSeverity,
  DepCategory,
  UpgradeStrategy,
  UpgradeOutcome,
  GuardianRunStatus,
  LicenseRisk,
} from './types';

export { DEFAULT_GUARDIAN_CONFIG } from './types';

// Lifecycle bridge
export { getLifecycleSummary } from './reporter';
