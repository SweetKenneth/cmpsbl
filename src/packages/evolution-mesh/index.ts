/**
 * Evolution Mesh SDK — Public API Surface
 * Framework-agnostic immune system for any JS/TS async function.
 * 
 * Usage:
 *   import { wrap, defineSchema } from '@cmpsbl/sdk/evolution-mesh';
 *   
 *   const safe = wrap(myHandler, {
 *     schema: defineSchema({
 *       email: { type: 'string', required: true },
 *       age: { type: 'number' },
 *     }),
 *   });
 */

// Core wrapper
export { wrap, type WrapConfig, type WrappedFunction } from './core/wrap';

// Schema & validation
export { defineSchema } from './schema/validator';
export type { FieldSchema, ExecutorSchema, ValidationReport, ValidationIssue } from './schema/types';
export type { InputArchetype } from './schema/archetypes';

// Repair engine (read-only stats)
export { getRepairStats } from './repair/deterministic';

// Learning (read-only)
export { getRules, getPerformanceStats } from './learning/rules';

// Shadow mode
export { shadow, type ShadowResult } from './shadow/probe';

// Telemetry
export { configure, type EvolutionMeshConfig } from './config';
export { getMetrics, type MeshMetrics } from './telemetry/tracker';

// ── Training ──
export {
  initExecutor, recordAttempt, promoteExecutor,
  getExecutorProgress, getAllExecutorProgress, isMutationAllowed,
  getTierDefinition, DIFFICULTY_TIERS,
  type DifficultyTier, type TierDefinition, type ExecutorProgress,
} from './training/difficulty-ladder';

export {
  captureGap, replayGap, getUnresolvedGaps, getResolvedGaps, getReplayStats,
  type GapSnapshot, type ReplayResult,
} from './training/replay-sandbox';

export {
  runWarmUp, getWarmUpHistory, getWarmUpSequence,
  type WarmUpResult, type WarmUpStep, type WarmUpCheck,
} from './training/warmup';

export {
  startDrill, completeDrill, getDrillStats, getRollbackScenarios,
  type RollbackScenario, type DrillAttempt, type DrillStats,
} from './training/rollback-drills';

// ── Diagnostics ──
export {
  startFeedbackSession, recordStep, completeFeedbackSession,
  getFeedbackSessions, getFeedbackMetrics,
  type FeedbackSession, type MicroStep, type FeedbackSignal,
} from './diagnostics/micro-feedback';

export {
  recordSkillEvent, analyzeSkillDecay, getDecayAlerts, getExecutorSkillProfiles,
  type SkillProfile, type DecayAlert,
} from './diagnostics/skill-decay';

export {
  recordCalibration, getCalibrationReport, getCalibrationPoints,
  type CalibrationReport, type CalibrationPoint,
} from './diagnostics/confidence-calibration';

export {
  startStaminaSession, recordCheckpoint, endStaminaSession, getStaminaReport,
  type StaminaSession, type StaminaReport,
} from './diagnostics/stamina-metrics';

export {
  scoreMutationComplexity,
  type ComplexityScore, type ComplexityDimension,
} from './diagnostics/mutation-complexity';

export {
  classifyFailure, getFailureTaxonomyReport,
  type ClassifiedFailure, type FailureTaxonomyReport, type FailureCategory,
} from './diagnostics/failure-taxonomy';

export {
  generatePostMortem, getPostMortems, searchPostMortems,
  type PostMortem,
} from './diagnostics/postmortem';

export {
  recordStrategyOutcome, getStrategyEffectiveness, getRankedStrategies, getBestStrategyForArchetype,
  type StrategyEffectiveness,
} from './diagnostics/repair-effectiveness';

// ── Knowledge ──
export {
  addPattern, findPatternsByRCA, findPatternsByArchetype, referencePattern,
  getPatterns, getLibraryStats,
  type PatternEntry, type PatternType,
} from './knowledge/pattern-library';

export {
  initSpecialtyTree, recordSpecialtyAttempt, getSpecialtySnapshot, getSpecialtyTree,
  type SpecialtyTree, type SpecialtyNode, type SpecialtySnapshot,
} from './knowledge/domain-specialty';

export {
  createKnowledgePack, publishPack, importKnowledgePack,
  getAvailablePacks, getPacksBySource, getImportHistory,
  type KnowledgePack, type ImportResult,
} from './knowledge/knowledge-packs';
