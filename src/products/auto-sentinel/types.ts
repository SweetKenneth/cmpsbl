/**
 * AUTO-SENTINEL v1.0.0 — Type System
 * Autonomous Codebase Health Guardian
 *
 * Composed from:
 *   CJ-075 (Self-Audit Loop), CJ-160 (Self-Repair Engine),
 *   CJ-120 (Ops Steward), CJ-161 (Workflow Composer),
 *   Immune System, Audit Receipts
 *
 * Primitives: GOVERNANCE, CONSCIENCE, DEFENSE, BEACON
 * Dependency on Convex Core: ZERO
 */

// ── Severity & Status ──────────────────────────────────────────────────

export type IssueSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type IssueCategory =
  | 'dead_code'
  | 'unused_export'
  | 'circular_dependency'
  | 'missing_error_handling'
  | 'stale_config'
  | 'type_inconsistency'
  | 'security_smell'
  | 'performance_anti_pattern'
  | 'documentation_drift'
  | 'dependency_health';

export type FixStrategy = 'remove' | 'refactor' | 'annotate' | 'update' | 'isolate' | 'skip';

export type FixOutcome = 'applied' | 'rolled_back' | 'skipped_governance' | 'skipped_risk' | 'failed';

export type GovernanceVerdict = 'approve' | 'deny' | 'review_required';

export type SentinelRunStatus = 'running' | 'completed' | 'completed_with_issues' | 'failed' | 'aborted';

// ── Scanner ────────────────────────────────────────────────────────────

export interface ScanRule {
  readonly id: string;
  readonly name: string;
  readonly category: IssueCategory;
  readonly severity: IssueSeverity;
  readonly description: string;
  readonly detect: (context: ScanContext) => DetectedIssue[];
}

export interface ScanContext {
  readonly fileIndex: FileEntry[];
  readonly configSnapshot: Record<string, unknown>;
  readonly previousRunFindings: DetectedIssue[];
}

export interface FileEntry {
  readonly path: string;
  readonly sizeBytes: number;
  readonly lastModified: string;
  readonly exports?: string[];
  readonly imports?: string[];
}

export interface DetectedIssue {
  readonly id: string;
  readonly ruleId: string;
  readonly category: IssueCategory;
  readonly severity: IssueSeverity;
  readonly filePath: string;
  readonly line?: number;
  readonly message: string;
  readonly evidence: string;
  readonly suggestedFix?: string;
  readonly detectedAt: string;
}

// ── Triage ─────────────────────────────────────────────────────────────

export interface TriageResult {
  readonly issueId: string;
  readonly severity: IssueSeverity;
  readonly riskScore: number;           // 0-100, higher = riskier to auto-fix
  readonly autoFixable: boolean;
  readonly suggestedStrategy: FixStrategy;
  readonly confidence: number;          // 0-100, confidence in the fix
  readonly rationale: string;
}

// ── Governance Gate ────────────────────────────────────────────────────

export interface GovernanceDecision {
  readonly issueId: string;
  readonly verdict: GovernanceVerdict;
  readonly reason: string;
  readonly riskScore: number;
  readonly confidenceThreshold: number;
  readonly decidedAt: string;
}

export interface GovernancePolicy {
  readonly maxAutoFixSeverity: IssueSeverity;
  readonly minConfidenceForAutoFix: number;  // 0-100
  readonly maxRiskForAutoFix: number;        // 0-100
  readonly blockedCategories: IssueCategory[];
  readonly requireReviewAboveRisk: number;   // 0-100
  readonly maxAutoFixesPerRun: number;
}

// ── Executor ───────────────────────────────────────────────────────────

export interface FixAttempt {
  readonly id: string;
  readonly issueId: string;
  readonly strategy: FixStrategy;
  readonly outcome: FixOutcome;
  readonly rollbackAvailable: boolean;
  readonly preSnapshot?: string;         // hash of pre-fix state
  readonly postSnapshot?: string;        // hash of post-fix state
  readonly executedAt: string;
  readonly durationMs: number;
  readonly error?: string;
}

// ── Reporter ───────────────────────────────────────────────────────────

export interface SentinelReport {
  readonly id: string;
  readonly runNumber: number;
  readonly status: SentinelRunStatus;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;

  // Scan results
  readonly totalIssuesFound: number;
  readonly issuesBySeverity: Record<IssueSeverity, number>;
  readonly issuesByCategory: Partial<Record<IssueCategory, number>>;

  // Triage results
  readonly autoFixableCount: number;
  readonly reviewRequiredCount: number;
  readonly skippedCount: number;

  // Execution results
  readonly fixesApplied: number;
  readonly fixesRolledBack: number;
  readonly fixesDeniedByGovernance: number;
  readonly fixesSkippedByRisk: number;

  // Prevention value
  readonly preventedIssues: PreventedIssue[];

  // Audit trail
  readonly receiptChainHead: string;
  readonly findings: SentinelFinding[];
}

export interface SentinelFinding {
  readonly issue: DetectedIssue;
  readonly triage: TriageResult;
  readonly governance: GovernanceDecision;
  readonly fix?: FixAttempt;
}

export interface PreventedIssue {
  readonly category: IssueCategory;
  readonly description: string;
  readonly potentialImpact: string;
  readonly preventedAt: string;
}

// ── Audit Receipt ──────────────────────────────────────────────────────

export interface SentinelReceipt {
  readonly id: string;
  readonly action: 'scan' | 'triage' | 'governance' | 'fix' | 'rollback' | 'report';
  readonly actor: 'sentinel';
  readonly inputHash: string;
  readonly outputHash: string;
  readonly timestamp: string;
  readonly prevHash: string;
}

// ── Orchestrator ───────────────────────────────────────────────────────

export interface SentinelConfig {
  readonly version: string;
  readonly cadenceMs: number;
  readonly governancePolicy: GovernancePolicy;
  readonly enabledCategories: IssueCategory[];
  readonly maxIssuesPerScan: number;
  readonly enableAutoFix: boolean;
  readonly enableReceipts: boolean;
  readonly beaconHealthSignal: boolean;
}

export const DEFAULT_SENTINEL_CONFIG: SentinelConfig = {
  version: '1.0.0',
  cadenceMs: 4 * 60 * 60 * 1000,  // 4 hours
  governancePolicy: {
    maxAutoFixSeverity: 'medium',
    minConfidenceForAutoFix: 75,
    maxRiskForAutoFix: 30,
    blockedCategories: ['security_smell'],
    requireReviewAboveRisk: 50,
    maxAutoFixesPerRun: 10,
  },
  enabledCategories: [
    'dead_code', 'unused_export', 'circular_dependency',
    'missing_error_handling', 'stale_config', 'type_inconsistency',
    'performance_anti_pattern', 'documentation_drift', 'dependency_health',
  ],
  maxIssuesPerScan: 100,
  enableAutoFix: true,
  enableReceipts: true,
  beaconHealthSignal: true,
};
