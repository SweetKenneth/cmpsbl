/**
 * CMPSBL® Ascension Node System — Public API
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Central barrel export for the entire Ingest → Node → Chain system.
 *
 * © CMPSBL® — All rights reserved.
 */

// Shared Types
export {
  ASCENSION_SCHEMA_VERSION,
  ASCENSION_PREFIX,
  RESERVED_MODULE_NAMES,
  buildAscensionModuleName,
  isAscensionModule,
  generateCorrelationId,
  migrateMetadata,
  type PrimitiveCategory,
  type ExtractedPrimitive,
  type ExtractionResult,
  type ExtractionStats,
  type QualityReport,
  type RejectedPrimitive,
  type QualitySummary,
  type AscensionNode,
  type NodeStatus,
  type NodeMode,
  type NodeListFilters,
  type NodeUpdatePayload,
  type NodeMetadata,
  type NodeSurface,
  type NodePerformance,
  type DeltaReport,
  type DeltaSnapshot,
  type DeltaComparison,
  type InjectionResult,
  type ChainParticipation,
  type LearningEvent,
  type LearningEventType,
  type PatternFrequency,
  type LearningInsights,
  type AuditEvent,
  type AuditEventType,
} from './types';

// Primitive Extraction
export {
  extractPrimitives,
  buildPrimitiveHandler,
} from './primitive-extractor';

// Quality Gate
export {
  runQualityGate,
  scorePrimitive,
  DEFAULT_QUALITY_CONFIG,
  type QualityGateConfig,
} from './quality-gate';

// Language Post-Processing
export {
  postProcessPrimitives,
  normalizeName,
} from './language-postprocessor';

// Deduplication
export {
  deduplicatePrimitives,
  type DeduplicationResult,
} from './deduplication';

// Delta Measurement
export {
  captureSnapshot,
  compareDelta,
  buildDeltaReport,
} from './delta-measurement';

// Node Registry
export {
  listNodes,
  getNode,
  extractAndAttachPrimitives,
  updateNode,
  deleteNode,
  recordRunParticipation,
} from './node-registry';

// Chain Injection
export {
  buildNodeEffect,
  injectNodeIntoChain,
  registerNodeEffect,
  getNodeEffect,
  clearNodeEffects,
  getRegisteredNodeCount,
} from './chain-injection';

// Brain Learning Bridge
export {
  recordExtractionLearning,
  recordChainLearning,
  recordDeltaLearning,
  recordLifecycleEvent,
  getPatternInsights,
  getLearningInsights,
  getLearningHistory,
} from './brain-learning-bridge';

// Audit Trail
export {
  logUpload,
  logExtraction,
  logQualityGate,
  logNodeCreated,
  logChainParticipation,
  logDeltaMeasured,
  logStatusChange,
  logDeletion,
  logAuditEvent,
  getAuditTrail,
} from './ingest-audit';

// Primitive Registry
export {
  registerPrimitive,
  getPrimitive,
  listPrimitives,
  removePrimitive,
  clearPrimitives,
  getPrimitiveCount,
  type PrimitiveHandler,
  type PrimitiveDefinition,
} from './primitive-registry';

// Primitive Defaults (auto-registers on import)
export { registerDefaults } from './primitive-defaults';

// Primitive Executor
export {
  executePrimitive,
  executePrimitiveBatch,
  type PrimitiveExecutionResult,
} from './primitive-executor';

// Primitive Executor Bridge (network-first → local → fallback)
export {
  primitiveExecutor,
  primitiveExecutorSync,
  setRemoteEndpoint,
  getRemoteEndpoint,
  setRuntimeType,
  getRuntimeMode,
  setTelemetrySink,
  getTelemetryBuffer,
  flushTelemetry,
  type PrimitiveResult,
  type RuntimeMode,
  type ExecutionTelemetry,
  type RemoteExecutionPayload,
} from './primitive-executor-bridge';

// Primitive Learning
export {
  recordPrimitiveOutcome,
  getPrimitiveLearningStats,
  isPrimitiveReliable,
  getRankedPrimitives,
  clearLearningState,
} from './primitive-learning';

// Primitive Governor
export {
  governorInjectPrimitive,
  governorDisablePrimitive,
  governorRemovePrimitive,
  governorGetPrimitiveSummary,
  type GovernorInjection,
} from './primitive-governor';

// Execution Binding (v2)
export {
  bindAndExecute,
  buildExecutableUnit,
  resolveExecutionStrategy,
  ensurePrimaryRegistered,
  type ExecutableUnit,
  type ExecutionBindingResult,
  type ExecutionStrategy,
  type StrategyResolution,
  type PrimaryHandlerRegistration,
} from './execution-binding';

// Primary Handler Factory
export {
  registerPrimaryHandler,
  hasPrimaryHandler,
  type PrimaryHandlerRegistration as PrimaryHandlerResult,
} from './primary-handler-factory';

// Universal Effect Injection (v2 + Visibility Patch)
export {
  detectPrimaryUnit,
  effectWrapper,
  autoMapModuleName,
  generateDefaultChain,
  ensureChain,
  applyEffectInjection,
  enrichExtractionWithEffects,
  generateEffectSummary,
  type EffectSignal,
  type IntelligenceMetrics,
  type EffectContext,
  type EffectInjectionResult,
  type PrimaryExecutionUnit,
  type EffectExtractionMeta,
  type EffectStatus,
  type EffectUIContract,
  type EffectSummary,
  type EffectTraceEntry,
} from './effect-injection';
