/**
 * Scanner Orchestrator — Master Pipeline
 * Sequences all 25 scanner modules through the 5-phase pipeline.
 */

// Phase 0: Discovery
export { fingerprintRepo, type RepoFingerprint } from './discovery/repo-fingerprint';
export { buildSchemaMap, type SchemaMap } from './discovery/schema-introspection';
export { parseDependencyManifest, enrichWithVulnerabilities, type DependencyGraph } from './discovery/dependency-graph';
export { generateSelfAssessment, buildSelfImprovementPrompt, type SelfAssessmentPrompt } from './discovery/self-assessment';
export { scanForHardcodedSecrets, detectEnvironment, analyzeEnvVars, mapTopology, type EnvironmentProfile } from './discovery/environment-detection';

// Phase 1: Understanding
export { extractRoutes, type RouteMap } from './understanding/route-endpoint-mapper';
export { analyzeAuthFlows, type AuthFlowAnalysis } from './understanding/auth-flow-tracer';
export { analyzeDataFlows, type DataFlowAnalysis } from './understanding/data-flow-analyzer';
export { detectDeadCode, type DeadCodeReport } from './understanding/dead-code-detector';
export { detectConfigDrift, type ConfigDriftReport } from './understanding/config-drift-scanner';

// Phase 2: Security
export { analyzeRLSCompleteness, type RLSCompletenessReport } from './security/rls-completeness';
export { analyzePrivilegeEscalation, type PrivilegeEscalationReport } from './security/privilege-escalation';
export { scanForSecretExposures, type SecretExposureReport } from './security/secret-exposure';
export { auditHeaders, type HeaderAuditReport } from './security/cors-header-auditor';
export { analyzeRateLimits, type RateLimitReport } from './security/rate-limit-tester';

// Phase 3: Technical Debt
export { analyzeComplexity, type ComplexityReport } from './debt/complexity-scoring';
export { analyzeMigrationHealth, type MigrationHealthReport } from './debt/migration-health';
export { estimateTestCoverage, type TestCoverageEstimate } from './debt/test-coverage-estimator';
export { predictPerformanceBottlenecks, type PerformanceReport } from './debt/performance-predictor';
export { scanAccessibility, type AccessibilityReport } from './debt/accessibility-scanner';

// Phase 4: Evolution
export { generateSuggestionPairs, type SuggestionReport } from './evolution/suggestion-pairing';
export { rankByPriority, type PriorityRanking } from './evolution/priority-ranking';
export { distillHeuristics, getStackHints, type LearningCorpus } from './evolution/cross-scan-learning';
export { generateTripwires, checkTripwires, type TripwireReport } from './evolution/regression-tripwire';
export { generateProgressiveReport, formatExecutiveMarkdown, type ProgressiveReport } from './evolution/progressive-disclosure';

// Existing modules
export { calculateCorrelationScore } from './correlation-scoring';
export { ScanCache } from './scan-cache';
export { computeScanDiff } from './scan-diff';
export { type FalsePositiveRule } from './false-positive-suppression';
export { autoEscalateDepth } from './auto-escalate';

/**
 * Full 5-phase scan pipeline orchestrator
 */
export interface FullScanResult {
  phase0_discovery: {
    fingerprint: RepoFingerprint | null;
    schema: SchemaMap | null;
    dependencies: DependencyGraph | null;
    selfAssessment: SelfAssessmentPrompt | null;
    environment: EnvironmentProfile | null;
  };
  phase1_understanding: {
    routes: RouteMap | null;
    authFlows: AuthFlowAnalysis | null;
    dataFlows: DataFlowAnalysis | null;
    deadCode: DeadCodeReport | null;
    configDrift: ConfigDriftReport | null;
  };
  phase2_security: {
    rlsCompleteness: RLSCompletenessReport | null;
    privilegeEscalation: PrivilegeEscalationReport | null;
    secretExposure: SecretExposureReport | null;
    headerAudit: HeaderAuditReport | null;
    rateLimits: RateLimitReport | null;
  };
  phase3_debt: {
    complexity: ComplexityReport | null;
    migrationHealth: MigrationHealthReport | null;
    testCoverage: TestCoverageEstimate | null;
    performance: PerformanceReport | null;
    accessibility: AccessibilityReport | null;
  };
  phase4_evolution: {
    suggestions: SuggestionReport | null;
    priorityRanking: PriorityRanking | null;
    learningCorpus: LearningCorpus | null;
    tripwires: TripwireReport | null;
    progressiveReport: ProgressiveReport | null;
  };
  metadata: {
    scanStartedAt: string;
    scanCompletedAt: string;
    durationMs: number;
    phasesCompleted: number;
    totalFindings: number;
    overallGrade: string;
  };
}

export function createEmptyScanResult(): FullScanResult {
  return {
    phase0_discovery: { fingerprint: null, schema: null, dependencies: null, selfAssessment: null, environment: null },
    phase1_understanding: { routes: null, authFlows: null, dataFlows: null, deadCode: null, configDrift: null },
    phase2_security: { rlsCompleteness: null, privilegeEscalation: null, secretExposure: null, headerAudit: null, rateLimits: null },
    phase3_debt: { complexity: null, migrationHealth: null, testCoverage: null, performance: null, accessibility: null },
    phase4_evolution: { suggestions: null, priorityRanking: null, learningCorpus: null, tripwires: null, progressiveReport: null },
    metadata: { scanStartedAt: new Date().toISOString(), scanCompletedAt: '', durationMs: 0, phasesCompleted: 0, totalFindings: 0, overallGrade: 'F' },
  };
}
