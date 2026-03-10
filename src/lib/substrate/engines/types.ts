/**
 * Cognitive Engine Types
 * 80 Engines + 26 Meta-Engines
 * 
 * Engines consolidate related capabilities into compound execution units.
 * This architecture provides:
 * - Higher-order abstraction over raw capabilities
 * - Optimized cross-capability context sharing
 * - Simplified API surface for consumers
 * - IP protection through orchestration complexity
 * 
 * v10.9.0 covers 400+ capabilities across 80 engines + 26 meta-engines
 */

import type { CapabilityId, ModuleLayer } from '../capabilities';

// ============================================================================
// ENGINE CATEGORIES — 18 Total
// ============================================================================

export type EngineCategory =
  | 'cognitive'       // Reasoning, learning, memory engines
  | 'operational'     // Resilience, optimization, orchestration
  | 'intelligence'    // Synthesis, adaptation, foresight
  | 'governance'      // Compliance, quality, audit
  | 'security'        // Threat, defense, trust
  | 'evolution'       // Self-improvement, modernization
  | 'communication'   // Event, broadcast, subscription
  | 'integration'     // Provider routing, data transformation
  | 'analytics'       // Dashboard, health, capacity
  | 'experience'      // Accessibility, personalization
  | 'knowledge'       // Graph, memory, context
  | 'autonomy'        // Self-documentation, self-healing
  | 'creativity'      // Dream, synthesis, innovation
  | 'perception'      // Intent, emotion, multimodal
  | 'resource'        // Budget, quota, cost
  | 'workflow'        // Pipeline, coordination, delegation
  | 'enhancement'     // World-first enhancement engines (NEW v8.1.0)
  | 'orchestration';  // High-level meta-engine coordination (NEW v8.1.0)

// ============================================================================
// ENGINE DEFINITIONS — 76 Total
// ============================================================================

export type EngineId =
  // Cognitive Engines (4)
  | 'reasoning_engine'
  | 'learning_engine'
  | 'memory_engine'
  | 'foresight_engine'
  
  // Operational Engines (4)
  | 'resilience_engine'
  | 'optimization_engine'
  | 'orchestration_engine'
  | 'scheduling_engine'
  
  // Intelligence Engines (4)
  | 'synthesis_engine'
  | 'adaptation_engine'
  | 'insight_engine'
  | 'prediction_engine'
  
  // Governance Engines (3)
  | 'compliance_engine'
  | 'quality_engine'
  | 'audit_engine'
  
  // Security Engines (3)
  | 'threat_engine'
  | 'defense_engine'
  | 'trust_engine'
  
  // Evolution Engines (2)
  | 'evolution_engine'
  | 'modernization_engine'
  
  // Communication Engines (2)
  | 'broadcast_engine'
  | 'event_engine'
  
  // Integration Engines (2)
  | 'routing_engine'
  | 'transformation_engine'
  
  // Analytics Engines (2)
  | 'monitoring_engine'
  | 'capacity_engine'
  
  // Experience Engines (2)
  | 'accessibility_engine'
  | 'personalization_engine'
  
  // Knowledge Engines (2)
  | 'graph_engine'
  | 'context_engine'
  
  // Autonomy Engines (2)
  | 'self_healing_engine'
  | 'self_documentation_engine'
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EXPANSION ENGINES — 16 Additional
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Creativity Engines (3) — DREAM + BRAIN synthesis
  | 'imagination_engine'      // Creative generation, idea incubation
  | 'innovation_engine'       // Cross-domain fusion, emergent patterns
  | 'dream_engine'            // Nocturnal optimization, crystallization
  
  // Perception Engines (3) — DECODE + BRAIN understanding
  | 'intent_engine'           // Intent resolution, amplification
  | 'emotion_engine'          // Emotional resonance, affect detection
  | 'multimodal_engine'       // Cross-modal synthesis, fusion
  
  // Resource Engines (3) — ACCESS + NEXUS + CORE management
  | 'budget_engine'           // Cost governance, arbitrage, optimization
  | 'quota_engine'            // Rate limiting, burst prediction
  | 'entitlement_engine'      // Access control, permission graphs
  
  // Workflow Engines (3) — CORTEX + RIPPLE orchestration
  | 'pipeline_engine'         // Stage orchestration, DAG execution
  | 'coordination_engine'     // Multi-agent, cross-team sync
  | 'delegation_engine'       // Task routing, intelligent assignment
  
  // Advanced Cognitive (2) — High-level reasoning
  | 'metacognition_engine'    // Self-reflection, confidence calibration
  | 'hypothesis_engine'       // Testing, validation, counter-evidence
  
  // Advanced Security (2) — Proactive defense
  | 'attack_surface_engine'   // Mapping, exposure analysis
  | 'incident_engine'         // Response automation, blast radius
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HIGH-VALUE CAPABILITY ENGINES — 8 Additional
  // ═══════════════════════════════════════════════════════════════════════════
  
  | 'sandbox_engine'           // CORE: runtime validation, dependency resolution, hot-reload, sandboxing
  | 'saga_engine'              // RIPPLE: event sourcing, saga orchestration, backpressure, schema validation
  | 'policy_access_engine'     // ACCESS: policy engine, session fingerprint, credential vault, consent
  | 'deep_cognition_engine'    // BRAIN: associative recall, compression, distillation, temporal reasoning
  | 'dialogue_engine'          // DECODE: tone calibration, disambiguation, dialogue planning, language detection
  | 'prompt_safety_engine'     // DEFENSE: prompt injection, data poisoning, output sanitization, adversarial probing
  | 'observability_engine'     // VISION: real-time dashboard, metric correlation, alert fatigue, baselines
  | 'technical_debt_engine'    // EVOLUTION: code smells, refactoring, debt scoring, migration paths

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW v8.1.0 ENGINES — 14 World-First Enhancement Engines
  // ═══════════════════════════════════════════════════════════════════════════
  
  // World-First Enhancement Engines (14) — One per module
  | 'attention_memory_engine'      // BRAIN: AttentionMechanism, MemoryConsolidator, SemanticIndexer, EmotionalResonance
  | 'provider_governance_engine'   // NEXUS: BudgetGovernance, LoadBalancer, RequestQueue, CostArbitrage
  | 'threat_containment_engine'    // DEFENSE: BehavioralFingerprint, ZeroTrustValidator, ThreatAnticipator, IPContainment
  | 'predictive_analytics_engine'  // VISION: PredictiveSLA, AnomalyForecaster, PerformanceInsight, CapacityPlanner
  | 'system_resilience_engine'     // SYSTEM: ResourceProfiler, DependencyGraph, SelfHealOrchestrator, BackupIntegrity
  | 'cortex_orchestration_engine'  // CORTEX: PipelineScheduler, MultiAgentCoordinator, GoalDecomposer, DecisionGovernor
  | 'creative_evolution_engine'    // DREAM: CreativeMutator, InsightCrystallizer, PatternEvolver, DreamJournal
  | 'intent_understanding_engine'  // DECODE: IntentAmplifier, ContextualParser, EmotionDetector, MultimodalFusion
  | 'event_replay_engine'          // RIPPLE: EventRouter, PriorityQueue, DeadLetterHandler, EventReplay
  | 'entitlement_audit_engine'     // ACCESS: EntitlementGraph, QuotaPredictor, AuditTrail
  | 'config_runtime_engine'        // CORE: FeatureFlagEngine, ConfigHotReload, EnvironmentValidator
  | 'adapter_transform_engine'     // INTEGRATION: AdapterHealthMonitor, WebhookOrchestrator, DataTransformer
  | 'cognitive_accessibility_engine'  // INCLUSIVE: CognitiveLoadOptimizer, AccessibilityScorer, RemediationEngine
  | 'evolution_governance_engine'  // MODERNIZER: EvolutionPredictor, RollbackAuthority, ImpactAnalyzer, ProposalRanker

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW v9.0.0 ENGINES — 6 Infrastructure Layer Engines
  // ═══════════════════════════════════════════════════════════════════════════
  
  | 'knowledge_retrieval_engine'   // MEMORY: vector indexing, embedding, RAG, knowledge graphs, context optimization
  | 'delivery_orchestrator'        // RELAY: webhook dispatch, notification routing, circuit breaking, DLQ
  | 'compliance_audit_engine'      // AUDIT: immutable logs, hash chains, data lineage, compliance reporting
  | 'zero_trust_engine'            // IDENTITY: SSO federation, tenant isolation, token lifecycle, device trust
  | 'finops_engine'                // ECONOMY: usage metering, billing aggregation, cost anomaly, budget governance
  | 'resilience_lab'               // SANDBOX: ephemeral envs, chaos injection, load gen, regression detection

  // ═══════════════════════════════════════════════════════════════════════════
  // v10.9.0 ENGINES — 4 Discovered High-Value Engines
  // ═══════════════════════════════════════════════════════════════════════════
  
  | 'governor_engine'              // GOVERNOR: policy enforcement, rate governance, capability gating, tier enforcement
  | 'immune_engine'                // ENCODE: immune system, repair cascades, graduated autonomy, rule propagation
  | 'salience_engine'              // BRAIN+MEMORY: unified salience scoring, cross-module consensus, reinforcement decay
  | 'temporal_engine';             // BRAIN+DREAM: time-series reasoning, temporal causal chains, chronological synthesis

export interface EngineDefinition {
  id: EngineId;
  name: string;
  description: string;
  category: EngineCategory;
  capabilities: string[];  // Changed from CapabilityId[] to support synergy IDs
  primaryModules: string[];
  layer: ModuleLayer;
  
  // Compound value metrics
  synergyMultiplier: number;      // How much more value vs individual caps
  complexityScore: number;        // IP protection score (1-10)
  autonomyLevel: 'assisted' | 'supervised' | 'autonomous';
  
  // Execution characteristics
  executionMode: 'sequential' | 'parallel' | 'adaptive' | 'streaming' | 'staged';
  averageLatencyMs: number;
  cacheable: boolean;
  
  // v9.1.0 additions (all optional for backward compatibility)
  capabilityCount?: number;        // Explicit count for metrics
  worldFirstEnhancements?: string[]; // Linked world-first classes
  synergyPipelines?: string[];    // Linked synergy executor names
}

export interface EngineExecutionContext {
  engineId: EngineId;
  input: Record<string, unknown>;
  caller: string;
  traceId: string;
  options?: EngineExecutionOptions;
}

export interface EngineExecutionOptions {
  timeout?: number;
  retries?: number;
  skipCapabilities?: string[];
  dryRun?: boolean;
  verbose?: boolean;
}

export interface EngineCapabilityResult {
  capabilityId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

export interface EngineExecutionResult<T = unknown> {
  engineId: EngineId;
  success: boolean;
  data?: T;
  error?: string;
  
  // Execution metrics
  totalDurationMs: number;
  capabilitiesExecuted: number;
  capabilityResults: EngineCapabilityResult[];
  
  // Value metrics
  synergyGain: number;           // Multiplied value from orchestration
  confidenceScore: number;       // 0-1 confidence in result
  
  // Trace
  traceId: string;
  timestamp: string;
}

export interface EngineState {
  enabled: boolean;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  averageLatency: number;
  totalSynergyGain: number;
}

// ============================================================================
// ENGINE REGISTRY TYPE
// ============================================================================

export interface EngineRegistry {
  engines: Map<EngineId, EngineDefinition>;
  states: Map<EngineId, EngineState>;
  executors: Map<EngineId, EngineExecutor>;
}

export type EngineExecutor<T = unknown> = (
  context: EngineExecutionContext
) => Promise<EngineExecutionResult<T>>;

// ============================================================================
// ENGINE SUMMARY
// ============================================================================

export interface EngineSummary {
  totalEngines: number;
  enabledEngines: number;
  byCategory: Record<EngineCategory, number>;
  totalCapabilitiesOrchestrated: number;
  averageSynergyMultiplier: number;
  averageComplexityScore: number;
  
  // v9.1.0 additions
  totalWorldFirstEnhancements: number;
  totalSynergyPipelines: number;
}

// ============================================================================
// CAPABILITY SOURCES
// ============================================================================

export interface CapabilitySource {
  type: 'native' | 'synergy' | 'world-first' | 'archived';
  id: string;
  name: string;
  modules: string[];
}

export const CAPABILITY_INVENTORY = {
  version: '10.1.0',
  synergies: 147,
  worldFirst: 56,
  highValue: 56,
  infrastructure: 54,
  archived: 10,
  native: 76,
  total: 379,
  engineCoverage: {
    originalEngines: 48,
    worldFirstEngines: 14,
    highValueEngines: 8,
    infrastructureEngines: 6,
    totalEngines: 76,
    metaEngines: 24,
  },
};
