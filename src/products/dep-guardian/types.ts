/**
 * DEP-GUARDIAN v1.0.0 — Type System
 * Autonomous Dependency Health Monitor
 *
 * Composed from:
 *   CJ-067 (Technical Debt Quantifier) — severity/effort scoring
 *   CJ-148 (Evolution Governance Engine) — upgrade approval workflows
 *   CJ-092 (Cascading Failure Isolator) — dependency graph analysis
 *   CJ-101 (Root Cause Analysis) — temporal correlation
 *
 * Primitives: ENGINEER, EVOLUTION, SOVEREIGN, COMPASS, DEFENSE,
 *             CONSCIENCE, BEACON, SHADOW, REFLEX
 * Dependency on Convex Core: ZERO
 */

// ── Enums & Literals ───────────────────────────────────────────────────

export type DepSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type DepCategory =
  | 'vulnerability'
  | 'staleness'
  | 'license_violation'
  | 'deprecation'
  | 'breaking_change'
  | 'size_bloat'
  | 'duplicate'
  | 'phantom_dep';

export type UpgradeStrategy = 'patch' | 'minor' | 'major' | 'replace' | 'remove' | 'pin' | 'skip';

export type UpgradeOutcome = 'applied' | 'rolled_back' | 'skipped_governance' | 'skipped_risk' | 'failed';

export type GovernanceVerdict = 'approve' | 'deny' | 'review_required';

export type GuardianRunStatus = 'running' | 'completed' | 'completed_with_issues' | 'failed' | 'aborted';

export type LicenseRisk = 'permissive' | 'weak_copyleft' | 'strong_copyleft' | 'proprietary' | 'unknown';

// ── Dependency Model ───────────────────────────────────────────────────

export interface DependencyEntry {
  readonly name: string;
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly installedAt: string;
  readonly lastUpdated: string;
  readonly license: string;
  readonly licenseRisk: LicenseRisk;
  readonly isDirectDep: boolean;
  readonly dependents: string[];
  readonly sizeBytes: number;
  readonly downloadCount?: number;
}

export interface DependencyContext {
  readonly dependencies: DependencyEntry[];
  readonly lockfileHash: string;
  readonly packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  readonly projectLicense: string;
  readonly blockedLicenses: string[];
  readonly previousRunFindings: DetectedDepIssue[];
}

// ── Scanner ────────────────────────────────────────────────────────────

export interface DepScanRule {
  readonly id: string;
  readonly name: string;
  readonly category: DepCategory;
  readonly severity: DepSeverity;
  readonly description: string;
  readonly detect: (context: DependencyContext) => DetectedDepIssue[];
}

export interface DetectedDepIssue {
  readonly id: string;
  readonly ruleId: string;
  readonly category: DepCategory;
  readonly severity: DepSeverity;
  readonly depName: string;
  readonly message: string;
  readonly detectedAt: string;
  readonly metadata?: Record<string, unknown>;
}

// ── Triage (COMPASS) ───────────────────────────────────────────────────

export interface TriageResult {
  readonly issueId: string;
  readonly priorityScore: number;
  readonly confidenceScore: number;
  readonly riskScore: number;
  readonly suggestedStrategy: UpgradeStrategy;
  readonly autoUpgradeable: boolean;
  readonly recurrent: boolean;
  readonly severityOrder: number;
}

// ── Governance (SOVEREIGN + CONSCIENCE) ────────────────────────────────

export interface GovernancePolicy {
  readonly allowAutoUpgrade: boolean;
  readonly maxRiskForAuto: number;
  readonly blockedLicenses: string[];
  readonly blockedCategories: DepCategory[];
  readonly requireReviewForMajor: boolean;
  readonly ethicalPreflight: boolean;
}

export interface GovernanceDecision {
  readonly issueId: string;
  readonly verdict: GovernanceVerdict;
  readonly reason: string;
  readonly policyRef: string;
  readonly ethicalFlags: string[];
}

// ── Upgrade Executor (EVOLUTION + SHADOW + REFLEX) ─────────────────────

export interface UpgradeAttempt {
  readonly id: string;
  readonly issueId: string;
  readonly depName: string;
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly strategy: UpgradeStrategy;
  readonly outcome: UpgradeOutcome;
  readonly rollbackAvailable: boolean;
  readonly preSnapshot: string;
  readonly postSnapshot: string;
  readonly executedAt: string;
  readonly durationMs: number;
  readonly error?: string;
  readonly circuitBreakerTripped?: boolean;
}

// ── Reporter ───────────────────────────────────────────────────────────

export interface GuardianReport {
  readonly runNumber: number;
  readonly status: GuardianRunStatus;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly totalDeps: number;
  readonly totalIssuesFound: number;
  readonly upgradesApplied: number;
  readonly upgradesRolledBack: number;
  readonly preventedIssues: PreventedIssue[];
  readonly findings: GuardianFinding[];
  readonly licenseCompliance: LicenseComplianceReport;
  readonly healthScore: number;
  readonly receiptHead: string | null;
}

export interface GuardianFinding {
  readonly issue: DetectedDepIssue;
  readonly triage: TriageResult;
  readonly decision: GovernanceDecision;
  readonly upgrade: UpgradeAttempt | null;
}

export interface PreventedIssue {
  readonly depName: string;
  readonly category: DepCategory;
  readonly description: string;
  readonly preventedBy: string;
}

export interface LicenseComplianceReport {
  readonly totalScanned: number;
  readonly compliant: number;
  readonly violations: LicenseViolation[];
  readonly complianceRate: number;
}

export interface LicenseViolation {
  readonly depName: string;
  readonly license: string;
  readonly risk: LicenseRisk;
  readonly reason: string;
}

// ── Receipts ───────────────────────────────────────────────────────────

export interface GuardianReceipt {
  readonly hash: string;
  readonly parentHash: string | null;
  readonly phase: string;
  readonly input: Record<string, unknown>;
  readonly output: Record<string, unknown>;
  readonly timestamp: string;
}

// ── Config ─────────────────────────────────────────────────────────────

export interface GuardianConfig {
  readonly version: string;
  readonly cadenceMs: number;
  readonly enableAutoUpgrade: boolean;
  readonly enableReceipts: boolean;
  readonly maxIssuesPerScan: number;
  readonly circuitBreakerThreshold: number;
  readonly circuitBreakerCooldownMs: number;
  readonly beaconHealthSignal: boolean;
  readonly shadowMode: boolean;
  readonly governancePolicy: GovernancePolicy;
  readonly enabledCategories: DepCategory[];
}

export const DEFAULT_GUARDIAN_CONFIG: GuardianConfig = {
  version: '1.0.0',
  cadenceMs: 6 * 60 * 60 * 1000,
  enableAutoUpgrade: true,
  enableReceipts: true,
  maxIssuesPerScan: 200,
  circuitBreakerThreshold: 3,
  circuitBreakerCooldownMs: 30 * 60 * 1000,
  beaconHealthSignal: true,
  shadowMode: false,
  governancePolicy: {
    allowAutoUpgrade: true,
    maxRiskForAuto: 0.5,
    blockedLicenses: ['GPL-3.0', 'AGPL-3.0', 'SSPL-1.0'],
    blockedCategories: [],
    requireReviewForMajor: true,
    ethicalPreflight: true,
  },
  enabledCategories: [
    'vulnerability',
    'staleness',
    'license_violation',
    'deprecation',
    'breaking_change',
    'size_bloat',
    'duplicate',
    'phantom_dep',
  ],
};
