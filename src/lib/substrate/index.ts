/**
 * promptfluid® Substrate Core Exports
 * v7.0.0 — SEBA Era (Self-Evolving Bounded Agent)
 * 
 * Complete export of all substrate engines, hooks, and utilities.
 * 14-module architecture: Kernel (CORE, RIPPLE, ACCESS) + Cognitive (BRAIN, DECODE, NEXUS)
 * + Operational (DEFENSE, VISION, DREAM, INTEGRATION) + Admin (SYSTEM, MODERNIZER, INCLUSIVE) + Orchestrator (CORTEX)
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

// CLM Module Hooks v7.0.0
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

// Module-Specific CLM v6.8.0
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

// Self-Evolving Bounded Agent (SEBA) v1.0.0
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

// Cross-Module Capabilities v6.9.0
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

// Archived Edge Function Adapters v6.9.1
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

// DECODE Personality Profiles v7.1.0
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

// Module Parity Enforcement v7.0.0
export {
  checkModuleParity,
  runParityCheck,
  getModulesNeedingWork,
  SUBSTRATE_MODULES_LIST,
  type ParityRequirement,
  type ModuleParityResult,
  type ParityReport,
} from './parity';

// Event System v7.0.0
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

// Version Registry v7.0.0
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

// Re-export substrate client from lib
export { substrate, type SubstrateModule, type SubstrateRequest, type SubstrateResponse } from '../substrate';
