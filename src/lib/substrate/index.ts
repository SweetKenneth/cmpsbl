/**
 * CMPSBL® Substrate Core Exports
 * 37-Node / 11-Sector Field-Based Topology
 * 
 * Complete export of all substrate engines, hooks, and utilities.
 * 3-Layer Architecture: Capabilities (675+) → Engines (76) → Meta-Engines (24)
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

// Observability Monitor — Bridge Activity, Latency, Error Hotspots (v11.5.0)
export {
  observabilityMonitor,
  ObservabilityMonitor,
  type BridgeInvocation,
  type CrossNodeLatency,
  type ErrorHotspot,
  type ObservabilitySummary,
} from './observability-monitor';


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

// Governance v10.5.3 — Veto Authority, Epistemic Discipline, Signal Arbitration
export {
  vetoAuthority,
  vetoLifecycle,
  signalArbitration,
  enforceResponsePolicy,
  validateEpistemicIntegrity,
  applyVoiceGuardrails,
  needsGuardrails,
  tagClaim,
  stripTags,
  normalizeScope,
  isModuleAffected,
  getScopesForModule,
  ALLOWED_SCOPES,
  SCOPE_MATRIX,
  DEFAULT_SCOPE,
  type VetoRequest,
  type VetoResolution,
  type VetoAuthority as VetoAuthorityType,
  type VetoScope as VetoScopeType,
  type VetoLifecycleEntry,
  type VetoLifecycleState,
  type EntropySnapshot,
  type ModuleSignal,
  type ArbitrationResult,
  type SignalSeverity,
  type ProvenanceTag,
  type PolicyResult,
  type PolicyViolation,
  type VoiceGuardrailResult,
  // v11.5.2 Governance Hardening
  validateTransition,
  evaluateTransition,
  commitTransition,
  getTransitionPath,
  requestTransition,
  approveTransition,
  finalizeTransition,
  getTransitionLog,
  getPendingApprovals,
  evaluateVetoEscalation,
  onGovernanceModeChange,
  auditCompliance,
  runComplianceAudit,
  getComplianceTrend,
  getLastComplianceReport,
  getComplianceScoreAvg,
  analyzeDrift,
  recordMutation,
  recordEscalation,
  recordVetoEvent,
  recordActivation,
  tickWindow,
  type TransitionValidation,
  type TransitionRequest,
  type VetoGovernanceEscalation,
  type ComplianceViolation,
  type ComplianceReport as GovernanceComplianceReport,
  type DriftSignal,
  type DriftReport,
  // v2.0.0 Governance Hardening — "Arbiter" (25 Enterprise Upgrades)
  GOVERNANCE_HARDENING_VERSION,
  GOVERNANCE_HARDENING_CODENAME,
  GOVERNANCE_HARDENING_UPGRADES,
  getGovernanceHardeningStatus,
  createPolicyVersion,
  getPolicyVersion,
  getPolicyHistory,
  createQuorum,
  submitQuorumVote,
  getQuorumStatus,
  getHardenedPendingQuorums,
  recordDecision,
  verifyDecisionChain,
  getDecisionChain,
  checkDutySeparation,
  detectPolicyConflicts,
  initiateEscalation,
  checkEscalationPromotion,
  getEscalationTiers,
  openGovernanceSession,
  addSessionDecision,
  closeGovernanceSession,
  getActiveSessions,
  evaluateRules,
  requireConsent,
  grantConsent,
  isConsentComplete,
  replayDecisions,
  replayByAuthority,
  replayByAction,
  simulatePolicy,
  createDelegation,
  resolveDelegation,
  enforceCooldown,
  getCooldownStatus,
  measureDecisionEntropy,
  setPolicyExpiry,
  getExpiredPolicies,
  getExpiringPolicies,
  createGovernanceCheckpoint,
  getCheckpoints,
  enforcePolicy,
  tryGovernanceAction,
  assessImpact,
  calculateGovernanceHealth,
  tracePolicyLineage,
  detectGovernanceAnomalies,
  issueEmergencyOverride,
  revokeEmergencyOverride,
  getActiveOverrides,
  isModuleOverridden,
  getGovernanceTelemetry,
  getGovernanceTelemetryByType,
  flushGovernanceTelemetry,
  sealGovernanceIntegrity,
  type PolicySnapshot,
  type PolicyRule,
  type QuorumRequest,
  type DecisionRecord,
  type GovernanceSession,
  type DelegationEntry,
  type GovernanceCheckpoint,
  type EmergencyOverride,
  type GovernanceTelemetryEvent,
  type GovernanceHealthReport,
  type PolicyConflict,
  type ImpactAssessment,
} from './governance';

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

// Cognitive Engines — 76 Engines + 24 Meta-Engines orchestrating 675+ capabilities
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
  // Quick access module aliases (10 entities + 5 overlays + 9 zones + SEBA)
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

// Infrastructure Module direct exports (v9.2.0, v11.0.0 tiering)
export {
  initMemoryModule,
  ingestKnowledge,
  semanticSearch,
  getMemoryModuleState,
  getMemoryModuleHealth,
  runLocalTiering,
  updateTieringConfig,
  getTieringConfig,
  stopAutoTiering,
  type VectorEntry,
  type RAGPipeline,
  type MemoryModuleState,
  type MemoryTieringConfig,
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

// ═══ Central Health Registry + Truth Boundary + Attribution Engine (v10.5.4) ═══
export {
  SYSTEM_TRUTH_MODE,
  updateHealthRegistry,
  logRecovery,
  getRegistryEntry,
  getAllRegistryEntries,
  getRegistryChangeLog,
  checkRegistryIntegrity,
  attributeHealthDrop,
  getAttributionSummary,
  attachTruthBoundary,
  referencesInfrastructure,
  getInferredQualifier,
  getShadowMeshState,
  updateShadowMeshState,
  resetRegistry,
  type TruthMode,
  type HealthCause,
  type HealthSource,
  type HealthEntryStatus,
  type HealthRegistryEntry,
  type AttributionResult,
  type AttributionFactor,
  type ShadowMeshState,
} from './health-registry';

// ═══ Truth Verification — Automated Parity Checks (v10.5.4) ═══
export {
  runParityCheck,
  quickParityCheck,
  type ParityCheckResult,
  type ParityMismatch,
} from './truth-verification';

// ═══ Unified Telemetry Aggregation (v10.5.4) ═══
export {
  aggregateTelemetry,
  type TelemetrySnapshot,
  type AiTelemetry,
  type AccessTelemetry,
  type BrainTelemetry,
  type ImmuneTelemetry,
  type EncodeTelemetry,
  type OverallTelemetry,
} from './telemetry-aggregator';

// ═══ Changelog Auto-Generation (v10.5.4) ═══
export {
  fetchAutoChangelog,
  formatChangelogDate,
  type AutoChangelogEntry,
} from './changelog-generator';

// ═══ Brain Auto-Tiering (v10.9.2) ═══
export {
  enforceAutoTiering,
  emergencyBulkDemotion,
  getTieringHealth,
  configureAutoTiering,
  getEnforcementHistory,
  type AutoTieringConfig,
  type TieringReport,
} from './brain-auto-tiering';

// ═══ Knowledge Distillation (v11.4.0) ═══
export {
  DISTILLATION_BUDGET,
  DISTILLATION_TECHNIQUES,
  type KnowledgeCrystal,
  type ReasoningTrace,
  type TransferHeuristic,
  type DistillationRun,
  type DistillationStatus,
} from './distillation';

// ═══ Inter-Node Bridges (SPARTA v11.5) ═══
export {
  evaluateEscalation,
  runEscalationBridge,
  onGovernanceEscalation,
  resetEscalation,
  generateEvolutionSignals,
  runConfidenceEvolutionBridge,
  getEvolutionPriorities,
  bridgeEventToAudit,
  bridgeEventsToAudit,
  resolveViaCapability,
  hasCapabilityRoute,
  getResolverGovernanceStatus,
  recordSynergyOutcome,
  getSynergyStats,
  getTopSynergies,
  getDegradingSynergies,
  getSynergyMemorySummary,
  type EscalationRule,
  type EscalationCallback,
  type EvolutionSignal,
  type SynergyOutcome,
  type SynergyStats,
} from './inter-node-bridges';

// ═══ CORE Kernel Hardening v2.0.0 (25 Enterprise Upgrades) ═══
export {
  // #1 Boot Integrity
  validateBootIntegrity,
  getBootManifest,
  // #2 Boot Timing
  markBootStart,
  markModuleBootStart,
  markModuleBootEnd,
  markBootEnd,
  getBootProfile,
  // #3 Sliding Window Failures
  initSlidingWindow,
  recordSlidingEvent,
  getSlidingWindowStats,
  // #4 Cascading Failure Detection
  recordModuleFailure,
  getCascadeAlerts,
  // #5 Heartbeat Jitter
  recordHeartbeatForJitter,
  analyzeJitter,
  getAllJitterAnalysis,
  // #6 Health Trends
  recordHealthScore,
  getHealthTrend,
  getAllHealthTrends,
  // #7 Request Deduplication
  deduplicatedInvoke,
  getInflightCount,
  makeRequestKey,
  // #8 Priority Queue
  enqueueRequest,
  getQueueStats,
  // #9 Correlation IDs
  generateCorrelationId,
  startCorrelation,
  endCorrelation,
  getCorrelationTrace,
  getRecentCorrelations,
  // #10 Rate Limiting
  configureRateLimit,
  tryAcquireRate,
  getRateLimitStats,
  // #11 Bulkhead Isolation
  configureBulkhead,
  withBulkhead,
  getBulkheadStats,
  // #12 Module Quarantine
  quarantineModule,
  isQuarantined,
  releaseFromQuarantine,
  getQuarantinedModules,
  // #13 Dead Letter Queue
  addToDeadLetterQueue,
  getDeadLetters,
  removeDeadLetter,
  getDLQStats,
  // #14 Shutdown Deadline
  setShutdownDeadline,
  startShutdownDeadline,
  clearShutdownDeadline,
  // #15 In-Flight Draining
  trackInflight,
  drainInflight,
  getInflightOps,
  // #16 Self-Test on Recovery
  registerSelfTest,
  runSelfTest,
  // #17 Boot Order Verification
  recordBoot,
  verifyBootOrder,
  getBootOrder,
  // #18 Health Checksum
  computeHealthChecksum,
  verifyHealthChecksum,
  // #19 Warm Standby Pool
  registerWarmStandby,
  getWarmStandby,
  getWarmPoolStatus,
  // #20 Adaptive Timeouts
  recordLatency,
  getAdaptiveTimeout,
  getLatencyStats,
  // #21 Error Taxonomy
  classifyError,
  getErrorTaxonomy,
  getRetriableErrors,
  type ErrorCategory,
  // #22 Breaker Analytics
  recordBreakerEvent,
  getBreakerAnalytics,
  // #23 Invoke Instrumentation
  InvokeInstrument,
  getRecentInvokeTraces,
  getSlowInvokeTraces,
  // #24 Composite Health Scoring
  calculateCompositeScore,
  // #25 Kernel Watchdog
  startKernelWatchdog,
  pingWatchdog,
  stopKernelWatchdog,
  getWatchdogState,
  // Status
  CORE_HARDENING_VERSION,
  CORE_HARDENING_UPGRADES,
  getCoreHardeningStatus,
} from './core-hardening';

// ═══ Hardened Invoke Layer v2.0.0 ("Ironclad") ═══
export {
  hardenedInvoke,
  createHardenedInvoker,
  shutdownHardenedInvoke,
  isHardenedLayerReady,
  getHardenedInvokeMetrics,
  resetHardenedInvokeMetrics,
  HARDENED_INVOKE_VERSION,
  HARDENED_INVOKE_CODENAME,
  type HardenedInvokeOptions,
  type HardenedInvokeResult,
  type InvokePriority,
} from './hardened-invoke';

// ═══════════════════════════════════════════════════════════════════
// EXPANSION MODULES v1.0.0 — 11-Node Expansion (37-Node Architecture)
// ═══════════════════════════════════════════════════════════════════

// SOVEREIGN — Data Sovereignty & Jurisdictional Compliance
export {
  initSovereign,
  registerJurisdiction,
  addResidencyRule,
  checkCompliance as checkSovereignCompliance,
  recordConsent,
  addRetentionPolicy,
  classifyData,
  getSovereignState,
  getSovereignHealth,
  getSovereignResilience,
  getSovereignEngine,
  getSovereignHardening,
  upgradeSovereignEngine,
  type Jurisdiction,
  type ComplianceFramework,
  type DataClassification,
  type ConsentStatus,
  type DataResidencyRule,
  type ComplianceCheck,
  type ComplianceViolation as SovereignComplianceViolation,
  type ConsentRecord,
  type DataRetentionPolicy,
  type SovereignModuleState,
} from './sovereign-module';

// ORACLE — Predictive Modeling & Probabilistic Reasoning
export {
  initOracle,
  createNetwork,
  updateBelief,
  runMonteCarlo,
  predict,
  getOracleState,
  getOracleHealth,
  getOracleResilience,
  getOracleEngine,
  getOracleHardening,
  upgradeOracleEngine,
  type BayesianNetwork,
  type BayesianNode,
  type CausalEdge,
  type MonteCarloSimulation,
  type Prediction,
  type OracleModuleState,
} from './oracle-module';

// CONSCIENCE — Ethical Reasoning & Value Alignment
export {
  initConscience,
  evaluate as evaluateEthics,
  checkAlignment,
  getConscienceState,
  getConscienceHealth,
  getConscienceResilience,
  getConscienceEngine,
  getConscienceHardening,
  upgradeConscienceEngine,
  type EthicalFramework,
  type BiasType,
  type ConscienceModuleState,
} from './conscience-module';

// PHANTOM — Synthetic Data & Privacy-Preserving Computation
export {
  initPhantom,
  generateSynthetic,
  anonymize,
  getPhantomState,
  getPhantomHealth,
  getPhantomResilience,
  getPhantomEngine,
  getPhantomHardening,
  upgradePhantomEngine,
  type PrivacyMechanism,
  type AnonymizationMethod,
  type PhantomModuleState,
} from './phantom-module';

// FORGE — Runtime Code Generation & Compilation
export {
  initForge,
  createBlueprint,
  generate as forgeGenerate,
  build as forgeBuild,
  getForgeState,
  getForgeHealth,
  getForgeResilience,
  getForgeEngine,
  getForgeHardening,
  upgradeForgeEngine,
  type ForgeLanguage,
  type ForgeArtifactType,
  type ForgeBlueprint,
  type ForgeArtifact,
  type ForgeBuild,
  type ForgeModuleState,
} from './forge-module';

// LINGUA — Universal Translation & Cross-Modal Communication
export {
  initLingua,
  translate,
  mapSchema,
  getLinguaState,
  getLinguaHealth,
  getLinguaResilience,
  getLinguaEngine,
  getLinguaHardening,
  upgradeLinguaEngine,
  type Modality,
  type TranslationQuality,
  type Translation,
  type FieldMapping,
  type LinguaModuleState,
} from './lingua-module';

// COMPASS — Spatial-Temporal Reasoning
export {
  initCompass,
  optimizeRoute,
  forecastTimeSeries,
  getCompassState,
  getCompassHealth,
  getCompassResilience,
  getCompassEngine,
  getCompassHardening,
  upgradeCompassEngine,
  type GeoPoint,
  type GeoRegion,
  type Route,
  type CompassModuleState,
} from './compass-module';

// ECHO — Simulation & Digital Twin Engine
export {
  initEcho,
  createTwin,
  syncTwin,
  runScenario,
  getEchoState,
  getEchoHealth,
  getEchoResilience,
  getEchoEngine,
  getEchoHardening,
  upgradeEchoEngine,
  type DigitalTwin,
  type Intervention,
  type EchoModuleState,
} from './echo-module';

// TREATY — Multi-Tenant Contract Negotiation & SLA Enforcement
export {
  initTreaty,
  createContract,
  activateContract,
  evaluateSLA,
  getTreatyState,
  getTreatyHealth,
  getTreatyResilience,
  getTreatyEngine,
  getTreatyHardening,
  upgradeTreatyEngine,
  type ContractStatus,
  type SLAMetric,
  type Contract,
  type TreatyModuleState,
} from './treaty-module';

// HARVEST — Autonomous Data Acquisition
export {
  initHarvest,
  registerSource as registerHarvestSource,
  runJob as runHarvestJob,
  createPipeline as createHarvestPipeline,
  getHarvestState,
  getHarvestHealth,
  getHarvestResilience,
  getHarvestEngine,
  getHarvestHardening,
  upgradeHarvestEngine,
  type SourceType,
  type FeedStatus,
  type DataSource,
  type HarvestModuleState,
} from './harvest-module';

// REFLEX — Real-Time Edge Computing Orchestration
export {
  initReflex,
  registerNode as registerEdgeNode,
  addRule as addReflexRule,
  decide,
  getReflexState,
  getReflexHealth,
  getReflexResilience,
  getReflexEngine,
  getReflexHardening,
  upgradeReflexEngine,
  type EdgeNodeStatus,
  type DecisionPriority,
  type EdgeNode,
  type ReflexModuleState,
} from './reflex-module';

// Module Hardening Suite v2.0.0 — Ironclad Expansion
export {
  createModuleHardening,
  getModuleHardening,
  getAllHardeningReports,
  getHardenedModules,
  initGlobalAutoRecovery,
  // Original Modules Retrofit
  retrofitOriginalModules,
  getOriginalModuleHardening,
  isRetrofitComplete,
  getModuleProfile,
  getAllModuleProfiles,
  getRetrofitSummary,
  teardownRetrofit,
  type ModuleHardening,
  type ModuleHardeningState,
  type DeadLetterEntry,
  type ShadowResult,
  type StateSnapshot as HardeningStateSnapshot,
  type RateLimitBucket,
  type BulkheadSlot,
} from './module-hardening';

// Autonomous Hardening Fabric v3.0.0 — 50 Capabilities + DEFENSE Authorities + Module Autonomy
export {
  // #26-#50 Hardening Capabilities
  recordEntropy,
  getSystemEntropy,
  sealCapabilityFingerprint,
  recordMemoryPressure,
  getMemoryTrend,
  consumeToken,
  getTokenBucketState,
  initiateConsensus,
  castVote,
  getConsensusResult,
  journalAction,
  getJournal,
  initConcurrencyLimit,
  adjustConcurrency,
  getConcurrencyLimit,
  updateDependencyHealth,
  isDependencyHealthy,
  setBackpressure,
  getBackpressure,
  shouldThrottle,
  appendToChain,
  verifyChainIntegrity,
  getChainLength,
  startWatchdog,
  petWatchdog,
  clearWatchdog,
  injectFault,
  removeFault,
  shouldFault,
  setResourceQuota,
  checkQuota,
  recordShadowExecution,
  getShadowDivergenceRate,
  setSamplingRate,
  shouldSample,
  createCheckpoint as createHardeningCheckpoint,
  getCheckpoint as getHardeningCheckpoint,
  listCheckpoints as listHardeningCheckpoints,
  addEventFilter,
  removeEventFilter,
  filterEvent,
  registerLivenessProbe,
  getLivenessStatus,
  stopLivenessProbe,
  initErrorBudget,
  trackErrorBudget,
  getErrorBudget,
  enforceCapabilityCooloff,
  estimateMutationImpact,
  markStateRefresh,
  getStaleModules,
  linkCorrelation,
  getCorrelationCluster,
  computeCompositeHealth,
  getHardeningManifest,
  // DEFENSE Autonomous Authorities
  autoBlockIP,
  autoQuarantineModule,
  autoRateLimit,
  autoPostureShift,
  autoCircuitBreak,
  setDefenseAuthority,
  getDefenseAuthority,
  isIPBlocked,
  isModuleQuarantined,
  getEntityRateLimit,
  getActiveDefenseActions,
  reverseAction,
  getDefenseActionHistory,
  // Module Autonomy Framework
  initializeModuleAutonomy,
  executeAutonomousAction,
  setModuleAutonomy,
  applyModuleCooldown,
  getAutonomyStatus,
  getModuleActions,
  getModuleExecutionLog,
  getTotalAutonomousActions,
} from './autonomous-hardening/barrel';
