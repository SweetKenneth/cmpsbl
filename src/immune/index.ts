/**
 * Executor Immune Pilot — Module Exports (v2.0)
 * Immune wrapper layer with intelligent repair, schema validation,
 * outcome tracking, and escalation pattern mining.
 */

// Types
export type {
  ImmuneSeverity,
  ImmuneStage,
  ImmuneOutcome,
  ImmuneEvent,
  EscalationPayload,
  ExecutorMeta,
  WrappableExecutor,
  RepairResult,
} from './types';

// Wrapper
export { wrapExecutor } from './wrapExecutor';

// Repairs
export { repair, registerRepair } from './repairs';

// Deterministic Repair
export { deterministicRepair, type DeterministicRepairResult } from './deterministic-repair';

// Schema Validation (#5)
export {
  validateInput,
  getExecutorSchema,
  getAllSchemas,
  type ExecutorSchema,
  type ValidationReport,
  type InputArchetype,
  type ValidationIssue,
} from './schema-validator';

// Intelligent Repair (#1-4, #7, #10, #11)
export {
  intelligentRepair,
  recordRepairOutcome,
  preNormalize,
  mineEscalationPattern,
  getEscalationPatterns,
  getRepairIntelligenceStats,
  type IntelligentRepairResult,
} from './repair-intelligence';

// Outcome Tracking (#8, #9)
export {
  trackOutcome,
  getOutcomeStats,
  produceDreamDigest,
  resetOutcomeTracker,
  type OutcomeRecord,
} from './outcome-tracker';

// Logger
export { logImmuneEvent, redactContext } from './logger';

// Queue
export { enqueueEscalation, getOpenEscalations } from './queue';

// Metrics
export {
  getMetrics,
  resetMetrics,
  formatMetricsSummary,
  incrementMetric,
  recordOutcome,
  type ImmuneMetrics,
} from './metrics';

// Pilot executor list & registration
export {
  PILOT_EXECUTORS,
  isPilotExecutor,
  createImmuneAwareRegister,
  getWrappedExecutor,
} from './pilotExecutors';

// Probe mini
export { runProbeMini, type ProbeResult } from './probeMini';

// ENCODE handoff
export {
  getEncodeWorkQueue,
  claimEscalation,
  resolveEscalation,
  printEncodeWorkQueue,
  type EncodeWorkItem,
} from './claimEscalations';

// ENCODE Escalation Learning Loop (Phase 3 v3.0)
export {
  captureEscalation,
  runLearningCycle,
  getLearningStats,
  getPatternClusters,
  getCandidateRules,
  resetLearningState,
  shadowValidateRule,
  promoteRule,
  rollbackRule,
  findBestRuleForEscalation,
  recordResolutionFeedback,
  learnFromResolution,
  warmStartFromDB,
  getSimilarExecutors,
  type EscalationSignal,
  type PatternCluster,
  type CandidateRule,
  type RepairStrategy,
} from './escalation-learning';

// ENCODE Escalation Resolution Telemetry
export {
  recordClaim,
  recordResolution,
  recordEscalationInflow,
  getEscalationTelemetry,
  formatEscalationTelemetry,
  resetEscalationTelemetry,
  type ResolutionEvent,
  type EscalationTelemetrySnapshot,
} from '@/lib/substrate/encode-module/escalation-telemetry';
