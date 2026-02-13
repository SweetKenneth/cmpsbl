/**
 * promptfluid® Substrate Core Exports
 * v9.1.0 — ARCHITECT Epoch (6-Layer Architecture)
 * 
 * Complete export of all substrate engines, hooks, and utilities.
 * 3-Layer Architecture: Capabilities (269) → Engines (62) → Meta-Engines (20)
 * 
 * Engine Categories (16):
 * - Cognitive (4): Reasoning, Learning, Memory, Foresight
 * - Operational (4): Resilience, Optimization, Orchestration, Scheduling
 * - Intelligence (4): Synthesis, Adaptation, Insight, Prediction
 * - Governance (3): Compliance, Quality, Audit
 * - Security (3): Threat, Defense, Trust
 * - Evolution (2): Evolution, Modernization
 * + Communication, Integration, Analytics, Experience, Knowledge, Autonomy,
 *   Creativity, Perception, Resource, Workflow
 * 
 * Meta-Engines orchestrate engines into unified pipelines (2x-8x synergy):
 * - cognitive_mesh, system_guardian, autonomous_operator, quality_fabric
 * - intelligence_pipeline, adaptation_suite, security_fortress, performance_optimizer
 * - world_first_cognitive, world_first_operational, world_first_intelligence, world_first_governance
 */

// Engine Bus - Canonical Routing Layer (v6.4.0)
export {
  engineBus,
  EngineBusClient,
  type EngineName,
  type DispatchOptions,
  type DispatchResult,
  type DispatchStage,
  type DispatchErrorCode,
  type ChainContext,
  type BusState,
  type ExecutionEvent,
} from './engine-bus';

// Telemetry Engine - Canonical Observability Layer (v6.5.0)
export {
  telemetryEngine,
  TelemetryEngineClient,
  type TelemetryEventType,
  type TelemetrySeverity,
  type TelemetryEvent,
  type TelemetryState,
  type TelemetryQuery,
} from './telemetry-engine';

// State Engine - Canonical State Contract Layer (v6.5.0)
export {
  stateEngine,
  StateEngineClient,
  type StateSchemaName,
  type StateField,
  type StateSchema,
  type StateValidationResult,
  type StateEngineState,
} from './state-engine';

// Evolution Cycle - Unified Modernizer Engine (v6.5.0)
export {
  evolutionCycle,
  EvolutionCycleClient,
  type EvolutionPhase,
  type EvolutionPlan,
  type EvolutionState,
  type EvolutionCycleResult,
  type ScanResult,
  type ProposalItem,
  type VerificationResult,
  type GovernanceSignal,
} from './evolution-cycle';

// Memory Core - Unified Memory Lifecycle
export { 
  memoryCore, 
  MemoryCoreClient,
  type MemoryEntry,
  type MemoryQuery,
  type MemoryTier,
  type MemoryState,
  type MemoryType,
  type MemoryStateSchema,
  type LifecycleStage,
  type LifecycleResult,
} from './memory-core';

// Learning Engine - Unified Learning Lifecycle (train + optimize + reinforce)
export {
  learningEngine,
  LearningEngineClient,
  type LearningStage,
  type LearningState,
  type LearningInput,
  type FeedbackSignal,
  type LearningResult,
} from './learning-engine';

// Imagination Engine - Unified Imagination Lifecycle (dream + synthesize + pattern_fusion)
export {
  imaginationEngine,
  ImaginationEngineClient,
  type ImaginationStage,
  type ImaginationState,
  type LatentContent,
  type SynthesisOutput,
  type ImaginationResult,
} from './imagination-engine';

// Reasoning Engine - Unified Higher-Order Reasoning (causal + systems_reason + hypothesis_test)
export {
  reasoningEngine,
  ReasoningEngineClient,
  type ReasoningStage,
  type ReasoningState,
  type ReasoningInput,
  type ReasoningResult,
  type CausalLink,
  type Hypothesis,
} from './reasoning-engine';

// Governance Guard - Unified Ethical & Coherence Constraints (ethical + coherence_check)
export {
  governanceGuard,
  GovernanceGuardClient,
  type GovernanceStage,
  type GovernanceState,
  type GovernanceInput,
  type GovernanceResult,
  type GovernanceSignal as GovernanceGuardSignal,
  type CoherenceResult,
  type EthicalResult,
} from './governance-guard';

// Orchestrator Engine - Unified Cognitive Pipeline (v6.6.0)
export {
  orchestratorEngine,
  OrchestratorEngineClient,
  PRESET_PIPELINES,
  type OrchestratorMode,
  type PipelineStage,
  type PipelineConfig,
  type PipelineStageResult,
  type PipelineResult,
  type CognitiveCycleOptions,
  type CognitiveCycleResult,
  type OrchestratorState,
} from './orchestrator-engine';

// React Hooks (v6.6.0)
export {
  useMemory,
  useLearning,
  useImagination,
  useReasoning,
  useGovernance,
  useOrchestrator,
  useTelemetry,
  useEngineBus,
  useSubstrateState,
  type UseMemoryOptions,
  type UseMemoryReturn,
  type UseLearningReturn,
  type UseImaginationReturn,
  type UseReasoningReturn,
  type UseGovernanceReturn,
  type UseOrchestratorReturn,
  type UseTelemetryReturn,
  type UseEngineBusReturn,
} from './hooks';

// Utilities (v6.6.0)
export {
  // Quick actions
  remember,
  recall,
  learn,
  dream,
  analyze,
  validate,
  // Composite operations
  rememberAndLearn,
  analyzeAndSynthesize,
  cognize,
  // Health & diagnostics
  checkHealth,
  getTelemetrySummary,
  getStateSnapshot,
  // Pipeline shortcuts
  runMemoryPipeline,
  runCreativePipeline,
  runAnalyticalPipeline,
  runFullCognitive,
  // Format helpers
  formatMemory,
  formatTelemetryEvent,
  formatDuration,
  // Batch operations
  batchIngest,
  batchDispatch,
  type SubstrateHealthReport,
  type TelemetrySummary,
} from './utils';

// Constant Learning Mode (CLM) v6.7.0
export {
  budgetGovernor,
  topicBank,
  spacedRepetition,
  learningOrchestrator,
  tierCommand,
  DEFAULT_CLM_CONFIG,
  CORE_CURRICULUM,
  TIERS,
  getCLMStatus,
  runCLMCycle,
  enableCLM,
  disableCLM,
  activateKillSwitch,
  deactivateKillSwitch,
  isCLMReady,
  type CLMConfig,
  type BudgetState,
  type LearningJobResult,
  type Topic,
  type TopicCategory,
  type TopicSelection,
  type SpacedRepItem,
  type TierInfo,
  type TierLimits,
  type OrchestratorState as CLMOrchestratorState,
} from './clm';

export { useCLM, type UseCLMReturn } from './clm/useCLM';

// CLM Module Hooks v9.1.0 ARCHITECT
export {
  registerModuleHooks,
  getRegisteredModules,
  getModuleHook,
  runModuleLearningCycle,
  getAllModuleKPIs,
  runModuleReflection,
  type SubstrateModule as CLMSubstrateModule,
  type ModuleKPIs,
  type ReflectionResult as CLMReflectionResult,
  type ModuleLearningHook,
} from './clm/module-hooks';

// Module-Specific CLM v9.1.0 ARCHITECT
export {
  moduleCLM,
  ModuleCLMClient,
  MODULE_CLM_CONFIGS,
  type ModuleName,
  type ModuleLearningConfig,
  type ModuleSelfAnalysis,
  type ModuleCLMState,
} from './module-clm';

export { useModuleCLM, type UseModuleCLMReturn } from './module-clm/useModuleCLM';

// Self-Evolving Bounded Agent (SEBA) v2.0.0 — Full Spectrum Autonomy
export {
  sebaAgent,
  SEBAAgent,
  CognitiveAnalyzer,
  ProposalGenerator,
  GovernanceGate,
  EvolutionExecutor,
  DEFAULT_SEBA_CONFIG,
  type SEBAPhase,
  type SEBAMode,
  type ImprovementCategory,
  type RiskLevel,
  type ImprovementProposal,
  type ProposedAction,
  type GovernanceDecision,
  type EvolutionExecution,
  type SEBAState,
  type SEBACycleResult,
  type SEBAAuditEntry,
  type CognitiveInsight,
  type SEBAConfig,
  type SEBACommand,
  type SEBACommandResult,
} from './seba';

export { useSEBA, type UseSEBAReturn } from './seba/useSEBA';

// Cross-Module Capabilities v9.1.0 ARCHITECT
export {
  capabilityEngine,
  CapabilityEngineClient,
  CAPABILITY_REGISTRY,
  type CapabilityId,
  type CapabilityDefinition,
  type CapabilityExecutionResult,
  type CapabilityState,
  type ModuleLayer,
} from './capabilities';

export { useCapabilities, type UseCapabilitiesReturn } from './capabilities/useCapabilities';

// Archived Edge Function Adapters v9.1.0 ARCHITECT
export {
  archivedAdapters,
  invokeHypothesisTest,
  invokeSystemsReasoning,
  invokeSelfCritique,
  invokePatternFusion,
  invokeAnomalyDetection,
  invokeResilienceMonitor,
  invokeTemporalScore,
  invokeEthicalBoundary,
  invokeImprovementEngine,
  invokeCuriosityReflect,
  type HypothesisTestResult,
  type SystemsReasoningResult,
  type SelfCritiqueResult,
  type PatternFusionResult,
  type AnomalyDetectionResult,
  type ResilienceMonitorResult,
  type TemporalScoreResult,
  type EthicalBoundaryResult,
  type ImprovementEngineResult,
  type CuriosityReflectResult,
} from './capabilities/archived-adapters';

export { useArchivedCapabilities, type UseArchivedCapabilitiesReturn } from './capabilities/useArchivedCapabilities';

// Support Bot v1.0.0 — Governed Evolving Support System
export {
  supportBot,
  SupportBotEngine,
  DEFAULT_SUPPORT_BOT_CONFIG,
  type SupportBotState,
  type SupportBotConfig,
  type SupportBotPhase,
  type SupportCommand,
  type SupportCommandResult,
  type SupportResponse,
  type SupportTicket,
  type Resolution,
  type SupportMemory,
  type MemoryMatch as SupportMemoryMatch,
  type RecallResult as SupportRecallResult,
  type DetectedIntent,
  type DetectedSentiment,
  type IntentCategory,
  type PainPattern,
  type PatternAnalysis,
  type LearningEvent,
  type ConversationMessage,
  type AuditEntry,
  type EscalationReason,
  type UserFeedback,
  type TicketStatus,
  type ResolutionVerification,
  type LearningState as SupportLearningState,
  type SessionState,
  type BotStats,
  type ComplianceReport,
  type SuggestedAction,
} from './support-bot';

export { useSupportBot, type UseSupportBotReturn } from './support-bot/useSupportBot';

// DECODE Personality Profiles v8.0.0 SYNERGY+
export {
  personalityEngine,
  PersonalityEngineClient,
  PERSONALITY_PROFILES,
  type PersonalityProfile,
  type PersonalityConfig,
  type PersonalityState,
  type PersonalityDetectionResult,
  type DecodeInterpretation,
} from './decode';

export { useDecodePersonality, type UseDecodePersonalityReturn } from './decode/useDecodePersonality';

// Module Parity Enforcement v8.0.0 SYNERGY+
export {
  checkModuleParity,
  runParityCheck,
  getModulesNeedingWork,
  SUBSTRATE_MODULES_LIST,
  type ParityRequirement,
  type ModuleParityResult,
  type ParityReport,
} from './parity';

// Event System v8.0.0 SYNERGY+
export {
  emit,
  emitStarted,
  emitSucceeded,
  emitFailed,
  forceFlush,
  queryEvents,
  getRecentEvents,
  getModuleEvents,
  getTraceEvents,
  getEventStats,
  subscribeToEvents,
  invalidateEventCache,
  type SubstrateEvent,
  type EventOutcome,
  type EmitOptions,
  type EventRecord,
  type EventQueryOptions,
} from './events';

// Version Registry v8.0.0 SYNERGY+
export {
  MODULE_VERSIONS,
  CONTROL_PLANE_VERSIONS,
  SUBSTRATE_VERSION,
  SUBSTRATE_CODENAME,
  SUBSTRATE_BUILD,
  getModuleVersion,
  getAllVersions,
  isVersionCompatible,
} from './versions';

// Cognitive Engines v8.0.0 SYNERGY+ — 62 Engines + 20 Meta-Engines orchestrating 269 capabilities
export {
  // Types
  type EngineCategory,
  type EngineId,
  type EngineDefinition,
  type EngineExecutionContext,
  type EngineExecutionOptions,
  type EngineCapabilityResult,
  type EngineExecutionResult,
  type EngineState,
  type EngineRegistry,
  type EngineExecutor,
  type EngineSummary,
  
  // Registry
  ENGINE_REGISTRY,
  ENGINE_IDS,
  ENGINES_BY_CATEGORY,
  getEngine,
  listEngines,
  getEnginesByCategory,
  getEnginesByModule,
  getEngineCapabilityCount,
  getTotalCapabilitiesOrchestrated,
  getEngineSummary,
  
  // Executors
  ENGINE_EXECUTORS,
  runEngine,
  runEnginesBatch,
  
  // Hook
  useEngines,
} from './engines';

// ═══ Infrastructure Systems (v8.5.0) ═══

// Cron Runner — Scheduled task automation
export {
  cronRunner,
  registerDefaultCronJobs,
  type CronJob,
  type CronRunResult,
  type CronStats,
} from './cron-runner';

// Persistent Rate Limiter — Cross-tab synchronized rate limiting
export {
  persistentRateLimiter,
  type PersistentBucket,
  type PersistentRateLimitConfig,
} from './persistent-rate-limit';

// Rollback Snapshots — Enterprise-only state snapshots
export {
  rollbackSnapshots,
  type Snapshot,
  type SnapshotStats,
} from './rollback-snapshots';

// Capability Analytics — Usage tracking & dead-weight detection
export {
  capabilityAnalytics,
  type CapabilityUsageRecord,
  type AnalyticsSummary,
} from './capability-analytics';

// Streaming Pipeline — SSE-based partial response streaming
export {
  streamingPipeline,
  type StreamSession,
  type StreamStats,
} from './streaming-pipeline';

// File Processing Pipeline — Document ingestion (CSV, JSON, MD, HTML)
export {
  fileProcessingPipeline,
  type FileProcessingResult,
  type ProcessingStats,
} from './file-processing';

// Natural Language Terminal — NL → command parser
export {
  nlTerminal,
  type NLParseResult,
} from './nl-terminal';

// Re-export substrate client from lib
export { 
  substrate, 
  // Quick access module aliases (all 21 modules + SEBA + Infrastructure Six)
  core,
  brain,
  decode,
  defense,
  nexus,
  vision,
  dream as dreamModule,  // Avoid conflict with dream utility function
  ripple,
  access,
  system,
  modernizer,
  integration,
  inclusive,
  cortex,
  seba,
  // Infrastructure Six + Encode (v9.2.0)
  memoryMod,
  relayMod,
  auditMod,
  identityMod,
  economyMod,
  sandboxMod,
  encodeMod,
  type SubstrateModule, 
  type SubstrateRequest, 
  type SubstrateResponse 
} from '../substrate';

// Infrastructure Module direct exports (v9.2.0)
export {
  initMemoryModule,
  ingestKnowledge,
  semanticSearch,
  getMemoryModuleState,
  getMemoryModuleHealth,
  type VectorEntry,
  type RAGPipeline,
  type MemoryModuleState,
} from './memory-module/index';

export {
  initRelay,
  dispatch as relayDispatch,
  getRelayState,
  getRelayHealth,
  type DeliveryRecord,
  type RelayModuleState,
} from './relay-module/index';

export {
  initAudit,
  recordAuditEntry,
  verifyAuditChain,
  getAuditLog,
  getAuditState,
  getAuditHealth,
  type AuditEntry as AuditModuleEntry,
  type AuditModuleState,
} from './audit-module/index';

export {
  initIdentity,
  registerActor,
  whoami,
  setCurrentActor,
  signAction,
  getIdentityState,
  getIdentityHealth,
  type ActorIdentity,
  type ActorType,
  type IdentityModuleState,
} from './identity-module/index';

export {
  initEconomy,
  recordCost,
  setBudget,
  getCostsByModule,
  getEconomyState,
  getEconomyHealth,
  type CostRecord,
  type BudgetConfig,
  type EconomyModuleState,
} from './economy-module/index';

export {
  initSandbox,
  createSandbox,
  execute as sandboxExecute,
  teardown as sandboxTeardown,
  getSandboxState,
  getSandboxHealth,
  type SandboxEnvironment,
  type SandboxExecution,
  type SandboxModuleState,
} from './sandbox-module/index';
