/**
 * AUTO-SENTINEL v1.0.0
 * Autonomous Codebase Health Guardian
 *
 * A standalone enterprise-grade product composed from:
 *   - CJ-075: Self-Audit Loop (scanner patterns)
 *   - CJ-120: Autonomous Ops Steward (executor patterns)
 *   - CJ-160: Self-Repair Engine (triage patterns)
 *   - CJ-161: Workflow Composer (pipeline composition)
 *   - Immune System (safety envelope)
 *   - Audit Receipts (Merkle provenance chain)
 *
 * Primitive governance: GOVERNANCE, CONSCIENCE, DEFENSE, BEACON
 * Convex Core dependency: NONE — fully standalone
 *
 * @example
 * ```typescript
 * import { AutoSentinel } from '@cmpsbl/auto-sentinel';
 *
 * const sentinel = new AutoSentinel({
 *   cadenceMs: 4 * 60 * 60 * 1000,  // every 4 hours
 *   enableAutoFix: true,
 * });
 *
 * const report = await sentinel.run(scanContext);
 * console.log(`Found ${report.totalIssuesFound} issues, fixed ${report.fixesApplied}`);
 * console.log(`Prevented ${report.preventedIssues.length} issues from recurring`);
 * ```
 */

// Core engine
export { AutoSentinel } from './sentinel';

// Extension points
export { registerRule, removeRule, getRegisteredRules } from './scanner';
export { registerFixHandler } from './executor';

// Receipt chain (for external verification)
export { ReceiptChain } from './receipts';

// Types
export type {
  // Config
  SentinelConfig,
  GovernancePolicy,

  // Scanner
  ScanRule,
  ScanContext,
  FileEntry,
  DetectedIssue,

  // Triage
  TriageResult,

  // Governance
  GovernanceDecision,
  GovernanceVerdict,

  // Executor
  FixAttempt,

  // Reporter
  SentinelReport,
  SentinelFinding,
  PreventedIssue,

  // Receipts
  SentinelReceipt,

  // Enums
  IssueSeverity,
  IssueCategory,
  FixStrategy,
  FixOutcome,
  SentinelRunStatus,
} from './types';

export { DEFAULT_SENTINEL_CONFIG } from './types';

// Lifecycle bridge
export { getLifecycleSummary } from './reporter';
