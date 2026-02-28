/**
 * Scanner Orchestrator — Master Pipeline
 * Sequences all 25 scanner modules through the 5-phase pipeline.
 */

import type { RepoFingerprint } from './discovery/repo-fingerprint';
import type { SchemaMap } from './discovery/schema-introspection';
import type { DependencyGraph } from './discovery/dependency-graph';
import type { SelfAssessmentPrompt } from './discovery/self-assessment';
import type { EnvironmentProfile } from './discovery/environment-detection';
import type { RouteMap } from './understanding/route-endpoint-mapper';
import type { AuthFlowAnalysis } from './understanding/auth-flow-tracer';
import type { DataFlowAnalysis } from './understanding/data-flow-analyzer';
import type { DeadCodeReport } from './understanding/dead-code-detector';
import type { ConfigDriftReport } from './understanding/config-drift-scanner';
import type { RLSCompletenessReport } from './security/rls-completeness';
import type { PrivilegeEscalationReport } from './security/privilege-escalation';
import type { SecretExposureReport } from './security/secret-exposure';
import type { HeaderAuditReport } from './security/cors-header-auditor';
import type { RateLimitReport } from './security/rate-limit-tester';
import type { ComplexityReport } from './debt/complexity-scoring';
import type { MigrationHealthReport } from './debt/migration-health';
import type { TestCoverageEstimate } from './debt/test-coverage-estimator';
import type { PerformanceReport } from './debt/performance-predictor';
import type { AccessibilityReport } from './debt/accessibility-scanner';
import type { SuggestionReport } from './evolution/suggestion-pairing';
import type { PriorityRanking } from './evolution/priority-ranking';
import type { LearningCorpus } from './evolution/cross-scan-learning';
import type { TripwireReport } from './evolution/regression-tripwire';
import type { ProgressiveReport } from './evolution/progressive-disclosure';

// Re-export Phase 0: Discovery
export { fingerprintRepo } from './discovery/repo-fingerprint';
export { buildSchemaMap } from './discovery/schema-introspection';
export { parseDependencyManifest, enrichWithVulnerabilities } from './discovery/dependency-graph';
export { generateSelfAssessment, buildSelfImprovementPrompt } from './discovery/self-assessment';
export { scanForHardcodedSecrets, detectEnvironment, analyzeEnvVars, mapTopology } from './discovery/environment-detection';

// Re-export Phase 1: Understanding
export { extractRoutes } from './understanding/route-endpoint-mapper';
export { analyzeAuthFlows } from './understanding/auth-flow-tracer';
export { analyzeDataFlows } from './understanding/data-flow-analyzer';
export { detectDeadCode } from './understanding/dead-code-detector';
export { detectConfigDrift } from './understanding/config-drift-scanner';

// Re-export Phase 2: Security
export { analyzeRLSCompleteness } from './security/rls-completeness';
export { analyzePrivilegeEscalation } from './security/privilege-escalation';
export { scanForSecretExposures } from './security/secret-exposure';
export { auditHeaders } from './security/cors-header-auditor';
export { analyzeRateLimits } from './security/rate-limit-tester';

// Re-export Phase 3: Technical Debt
export { analyzeComplexity } from './debt/complexity-scoring';
export { analyzeMigrationHealth } from './debt/migration-health';
export { estimateTestCoverage } from './debt/test-coverage-estimator';
export { predictPerformanceBottlenecks } from './debt/performance-predictor';
export { scanAccessibility } from './debt/accessibility-scanner';

// Re-export Phase 4: Evolution
export { generateSuggestionPairs } from './evolution/suggestion-pairing';
export { rankByPriority } from './evolution/priority-ranking';
export { distillHeuristics, getStackHints } from './evolution/cross-scan-learning';
export { generateTripwires, checkTripwires } from './evolution/regression-tripwire';
export { generateProgressiveReport, formatExecutiveMarkdown } from './evolution/progressive-disclosure';

// Re-export Substrate Integrations
export { routeScanFinding, routeScanBatch, getScanRoutingPriority } from './integrations/nexus-scan-routing';
export { planCostOptimizedScan, allocateScanBudget, recordScanCost } from './integrations/nexus-cost-optimized';
export { createFailoverSession, handleScanFailure, handleScanSuccess, getSessionHealth } from './integrations/nexus-failover-scanning';
export { correlatePerformanceDebt } from './integrations/vision-performance-debt';
export { mapErrorHotspots, reprioritizeByErrors } from './integrations/vision-error-hotspots';
export { evaluateFixEffectiveness, createRegressionMonitor, batchEvaluateFixes } from './integrations/vision-regression-loop';
export { registerScanProposals, applyScanProposal, failScanProposal, inferDependencies } from './integrations/evolution-proposal-chain';
export { generateRegressionTests, linkTestsToTripwires } from './integrations/evolution-auto-regression';
export { deduplicateFindings, registerFinding, resolveFinding, getFindingLifecycleStats, applyDecayWeighting } from './integrations/memory-finding-dedup';
export { correlateThreatIntelligence, getAttackSurfaceSummary } from './integrations/defense-threat-correlation';
export { verifyFix, batchVerifyFixes, shouldPromoteFix } from './integrations/fix-verification-loop';
export { registerSchedule, emitTrigger, getSchedulerStatus, registerDefaultSchedules, recordScanCompletion } from './integrations/scan-scheduler';
export { generatePatchPlan, generatePatchCommands } from './integrations/dependency-auto-patch';
export { startScanRun, persistFindings, resolveAbsentFindings, completeScanRun, getScanTrends, getActiveFindings, getFindingAnalytics } from './integrations/finding-persistence';

// Substrate Integrations — Wave 2
export { clusterFindings } from './integrations/memory-semantic-clustering';
export { detectRecurringPatterns } from './integrations/memory-cross-session-patterns';
export { estimateCognitiveLoad } from './integrations/cortex-cognitive-load';
export { calibrateThresholds, applyCalibration } from './integrations/cortex-false-positive-calibration';
export { mineDreamOptimizations } from './integrations/dream-offline-optimization';
export { buildAttackSurfaceMap } from './integrations/defense-attack-surface-map';
export { issueReceipt, verifyReceipt, validateChain, getReceiptsForFinding } from './integrations/evolution-fix-receipt-chain';
export { calculateDecay } from './integrations/evolution-confidence-decay';
export { withSelfHealing, getScannerHealthReport, resetHealingLog } from './integrations/immune-scanner-self-healing';
export { requestConsensus, batchConsensus } from './integrations/mesh-cross-scanner-resolution';
export { profileResourceWaste } from './integrations/vision-resource-profiling';
export { selectConsensusModels, aggregateVerdicts } from './integrations/nexus-multi-model-consensus';

// Re-export all types
export type {
  RepoFingerprint, SchemaMap, DependencyGraph, SelfAssessmentPrompt, EnvironmentProfile,
  RouteMap, AuthFlowAnalysis, DataFlowAnalysis, DeadCodeReport, ConfigDriftReport,
  RLSCompletenessReport, PrivilegeEscalationReport, SecretExposureReport, HeaderAuditReport, RateLimitReport,
  ComplexityReport, MigrationHealthReport, TestCoverageEstimate, PerformanceReport, AccessibilityReport,
  SuggestionReport, PriorityRanking, LearningCorpus, TripwireReport, ProgressiveReport,
};

/**
 * Full 5-phase scan pipeline result
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
