/**
 * CONTENT-GUARDIAN v1.0.0 — Type System
 * Autonomous Content Quality & Compliance Engine
 *
 * Composed from Media vertical primitives + Spine governance:
 *   CRITIC  — quality scoring, A/B evaluation, creative feedback
 *   PALETTE — brand consistency enforcement, style guide validation
 *   COMPLY  — copyright detection, platform policy, NSFW, ad regulation
 *   METRIC  — performance analytics, attribution, ROI measurement
 *   PERSONA — audience segmentation for content targeting
 *   STORYARC — narrative coherence and messaging consistency
 *   + GOVERNANCE, CONSCIENCE, BEACON, COMPASS, AUDIT, SHADOW
 *
 * Primitives: 6 Media expansion + 6 Spine/Conceptual = 12 total
 * Dependency on Convex Core: ZERO
 */

// ── Enums & Literals ───────────────────────────────────────────────────

export type ContentSeverity = 'info' | 'warning' | 'violation' | 'block';

export type ContentCategory =
  | 'brand_drift'
  | 'quality_below_threshold'
  | 'copyright_violation'
  | 'platform_policy_breach'
  | 'nsfw_detected'
  | 'ad_regulation_violation'
  | 'trademark_conflict'
  | 'narrative_inconsistency'
  | 'audience_mismatch'
  | 'tone_deviation';

export type RemediationStrategy =
  | 'auto_correct'
  | 'flag_for_review'
  | 'block_publish'
  | 'suggest_alternative'
  | 'adjust_targeting'
  | 'skip';

export type RemediationOutcome =
  | 'corrected'
  | 'flagged'
  | 'blocked'
  | 'skipped_governance'
  | 'skipped_risk'
  | 'failed';

export type GovernanceVerdict = 'approve' | 'deny' | 'review_required';

export type GuardianRunStatus = 'running' | 'completed' | 'completed_with_issues' | 'failed';

// ── Content Model ──────────────────────────────────────────────────────

export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'ad' | 'email' | 'social_post';

export interface ContentPiece {
  readonly id: string;
  readonly type: ContentType;
  readonly title: string;
  readonly body: string;
  readonly metadata: Record<string, unknown>;
  readonly targetAudience: string[];
  readonly targetPlatforms: string[];
  readonly campaignId?: string;
  readonly createdAt: string;
}

export interface BrandProfile {
  readonly name: string;
  readonly voiceTone: string[];
  readonly colorPalette: string[];
  readonly typographyRules: string[];
  readonly prohibitedTerms: string[];
  readonly logoUsageRules: string[];
  readonly messagingPillars: string[];
}

export interface AudienceSegment {
  readonly id: string;
  readonly name: string;
  readonly demographics: Record<string, string>;
  readonly preferences: string[];
  readonly avoidTopics: string[];
}

export interface ContentContext {
  readonly content: ContentPiece[];
  readonly brandProfile: BrandProfile;
  readonly audienceSegments: AudienceSegment[];
  readonly platformPolicies: PlatformPolicy[];
  readonly previousFindings: DetectedContentIssue[];
  readonly narrativeArc: NarrativeArc | null;
}

export interface PlatformPolicy {
  readonly platform: string;
  readonly maxLength?: number;
  readonly prohibitedContent: string[];
  readonly adRegulations: string[];
  readonly contentRating: string;
}

export interface NarrativeArc {
  readonly campaignId: string;
  readonly themes: string[];
  readonly messagingSequence: string[];
  readonly toneProgression: string[];
}

// ── Scanner ────────────────────────────────────────────────────────────

export interface ContentScanRule {
  readonly id: string;
  readonly name: string;
  readonly category: ContentCategory;
  readonly severity: ContentSeverity;
  readonly description: string;
  readonly detect: (context: ContentContext) => DetectedContentIssue[];
}

export interface DetectedContentIssue {
  readonly id: string;
  readonly ruleId: string;
  readonly category: ContentCategory;
  readonly severity: ContentSeverity;
  readonly contentId: string;
  readonly message: string;
  readonly detectedAt: string;
  readonly metadata?: Record<string, unknown>;
}

// ── Triage (COMPASS) ───────────────────────────────────────────────────

export interface ContentTriageResult {
  readonly issueId: string;
  readonly priorityScore: number;
  readonly confidenceScore: number;
  readonly riskScore: number;
  readonly suggestedStrategy: RemediationStrategy;
  readonly autoRemediable: boolean;
  readonly recurrent: boolean;
  readonly severityOrder: number;
}

// ── Quality Score (CRITIC) ─────────────────────────────────────────────

export interface QualityScore {
  readonly contentId: string;
  readonly overallScore: number;
  readonly brandAlignment: number;
  readonly readability: number;
  readonly audienceResonance: number;
  readonly complianceScore: number;
  readonly narrativeCoherence: number;
  readonly breakdown: Record<string, number>;
}

// ── Governance (GOVERNANCE + CONSCIENCE) ───────────────────────────────

export interface ContentGovernancePolicy {
  readonly allowAutoCorrect: boolean;
  readonly maxRiskForAuto: number;
  readonly qualityFloor: number;
  readonly blockedCategories: ContentCategory[];
  readonly requireReviewForAds: boolean;
  readonly ethicalPreflight: boolean;
  readonly brandStrictnessLevel: number;
}

export interface ContentGovernanceDecision {
  readonly issueId: string;
  readonly verdict: GovernanceVerdict;
  readonly reason: string;
  readonly policyRef: string;
  readonly ethicalFlags: string[];
}

// ── Remediation (SHADOW for pre/post comparison) ──────────────────────

export interface RemediationAttempt {
  readonly id: string;
  readonly issueId: string;
  readonly contentId: string;
  readonly strategy: RemediationStrategy;
  readonly outcome: RemediationOutcome;
  readonly preSnapshot: string;
  readonly postSnapshot: string;
  readonly suggestion?: string;
  readonly executedAt: string;
  readonly durationMs: number;
  readonly error?: string;
}

// ── Performance Tracking (METRIC) ─────────────────────────────────────

export interface ContentPerformance {
  readonly contentId: string;
  readonly impressions: number;
  readonly clicks: number;
  readonly engagementRate: number;
  readonly conversionRate: number;
  readonly costPerEngagement: number;
  readonly roi: number;
  readonly measuredAt: string;
}

// ── Reporter ───────────────────────────────────────────────────────────

export interface ContentGuardianReport {
  readonly runNumber: number;
  readonly status: GuardianRunStatus;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly totalContentScanned: number;
  readonly totalIssuesFound: number;
  readonly remediationsApplied: number;
  readonly contentBlocked: number;
  readonly preventedIssues: PreventedContentIssue[];
  readonly findings: ContentGuardianFinding[];
  readonly qualityScores: QualityScore[];
  readonly brandComplianceRate: number;
  readonly averageQualityScore: number;
  readonly receiptHead: string | null;
}

export interface ContentGuardianFinding {
  readonly issue: DetectedContentIssue;
  readonly triage: ContentTriageResult;
  readonly decision: ContentGovernanceDecision;
  readonly remediation: RemediationAttempt | null;
}

export interface PreventedContentIssue {
  readonly contentId: string;
  readonly category: ContentCategory;
  readonly description: string;
  readonly preventedBy: string;
}

// ── Receipts ───────────────────────────────────────────────────────────

export interface ContentGuardianReceipt {
  readonly hash: string;
  readonly parentHash: string | null;
  readonly phase: string;
  readonly input: Record<string, unknown>;
  readonly output: Record<string, unknown>;
  readonly timestamp: string;
}

// ── Config ─────────────────────────────────────────────────────────────

export interface ContentGuardianConfig {
  readonly version: string;
  readonly cadenceMs: number;
  readonly enableAutoCorrect: boolean;
  readonly enableReceipts: boolean;
  readonly maxIssuesPerScan: number;
  readonly beaconHealthSignal: boolean;
  readonly shadowMode: boolean;
  readonly governancePolicy: ContentGovernancePolicy;
  readonly enabledCategories: ContentCategory[];
}

export const DEFAULT_CONTENT_GUARDIAN_CONFIG: ContentGuardianConfig = {
  version: '1.0.0',
  cadenceMs: 2 * 60 * 60 * 1000,
  enableAutoCorrect: true,
  enableReceipts: true,
  maxIssuesPerScan: 500,
  beaconHealthSignal: true,
  shadowMode: false,
  governancePolicy: {
    allowAutoCorrect: true,
    maxRiskForAuto: 0.4,
    qualityFloor: 60,
    blockedCategories: [],
    requireReviewForAds: true,
    ethicalPreflight: true,
    brandStrictnessLevel: 0.7,
  },
  enabledCategories: [
    'brand_drift',
    'quality_below_threshold',
    'copyright_violation',
    'platform_policy_breach',
    'nsfw_detected',
    'ad_regulation_violation',
    'trademark_conflict',
    'narrative_inconsistency',
    'audience_mismatch',
    'tone_deviation',
  ],
};
