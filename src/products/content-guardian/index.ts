/**
 * CONTENT-GUARDIAN v1.0.0
 * Autonomous Content Quality & Compliance Engine
 *
 * A standalone enterprise-grade product composed from:
 *   Media: CRITIC, PALETTE, COMPLY, METRIC, PERSONA, STORYARC
 *   Spine: GOVERNANCE, CONSCIENCE, BEACON, COMPASS, AUDIT, SHADOW
 *
 * Convex Core dependency: NONE — fully standalone
 *
 * @example
 * ```typescript
 * import { ContentGuardian } from '@cmpsbl/content-guardian';
 *
 * const guardian = new ContentGuardian({
 *   cadenceMs: 2 * 60 * 60 * 1000,
 *   enableAutoCorrect: true,
 * });
 *
 * const report = await guardian.run(contentContext);
 * console.log(`Quality: ${report.averageQualityScore}/100`);
 * console.log(`Brand compliance: ${report.brandComplianceRate}%`);
 * console.log(`Issues remediated: ${report.remediationsApplied}`);
 * ```
 */

export { ContentGuardian } from './guardian';
export { registerRule, removeRule, getRegisteredRules } from './scanner';
export { registerRemediationHandler } from './remediator';
export { scoreContent, scoreAll } from './quality-scorer';
export { ReceiptChain } from './receipts';

export type {
  ContentGuardianConfig,
  ContentGovernancePolicy,
  ContentPiece,
  ContentContext,
  BrandProfile,
  AudienceSegment,
  PlatformPolicy,
  NarrativeArc,
  ContentScanRule,
  DetectedContentIssue,
  ContentTriageResult,
  QualityScore,
  ContentGovernanceDecision,
  GovernanceVerdict,
  RemediationAttempt,
  ContentGuardianReport,
  ContentGuardianFinding,
  PreventedContentIssue,
  ContentPerformance,
  ContentGuardianReceipt,
  ContentSeverity,
  ContentCategory,
  ContentType,
  RemediationStrategy,
  RemediationOutcome,
  GuardianRunStatus,
} from './types';

export { DEFAULT_CONTENT_GUARDIAN_CONFIG } from './types';
