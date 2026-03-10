/**
 * LNCHBL Distribution — Tiered Capability Map
 * Maps all 124 substrate capabilities to subscription tiers
 * 
 * CROWN JEWELS (recursive self-improvement) are CMPSBL-ONLY — not available at any LNCHBL tier.
 * Remaining self-improvement (observational/planning) is Enterprise-only.
 * 
 * FREE (Starter):  Core cognitive loop + basic memory (16 capabilities)
 * Builder ($29/mo): Infrastructure hardening + observability (26 capabilities)
 * Pro ($79/mo):    Advanced intelligence + operations + multi-tenant (24 capabilities)
 * Enterprise ($499/mo): Self-improvement (non-recursive) + evolution + full platform + SLA (48 capabilities)
 * CMPSBL-Only:     10 Crown Jewel recursive self-improvement capabilities (never distributed)
 */

export type DistributionTier = 'free' | 'builder' | 'pro' | 'enterprise';

/**
 * CROWN JEWELS — CMPSBL-Only (10 capabilities)
 * Recursive self-improvement where software builds/modifies its own code.
 * These are NEVER distributed to LNCHBL at any tier.
 */
export const CROWN_JEWEL_IDS: readonly string[] = [
  'cortex_engine',                // Autonomous PROPOSE→APPLY→LEARN loop
  'seba_engine',                  // Self-Evolving Bounded Agent
  'evolution_engine',             // Shadow-to-production code diffs
  'evolution_ab',                 // Parallel evolution variant testing
  'evolution_rollback',           // Auto-revert of failed evolution
  'evolution_sandbox',            // Isolated evolution testing
  'dream_pool_federation',        // Cross-agency dream sharing
  'self_repair_engine',           // Autonomous degradation repair
  'autonomous_workflow_composer', // Self-assembling workflows
  'dream_lucidity_control',       // Directed dream cycle exploration
] as const;

export interface TieredCapability {
  id: string;
  name: string;
  tier: DistributionTier;
  category: string;
  description: string;
}

/**
 * FREE TIER — Core Cognitive Loop (16 capabilities)
 * v8.5.0: +4 high-value additions (hot reload, conversation analytics, emotion baseline, nexus health)
 */
export const FREE_CAPABILITIES: TieredCapability[] = [
  // Original 12
  { id: 'memory_engine', name: 'Memory Engine', tier: 'free', category: 'cognitive', description: 'Persistent memory store/recall with tiered storage' },
  { id: 'learning_engine', name: 'Learning Engine', tier: 'free', category: 'cognitive', description: 'Reinforcement learning from feedback signals' },
  { id: 'context_engine', name: 'Context Engine', tier: 'free', category: 'cognitive', description: 'Contextual awareness and session state' },
  { id: 'personality_engine', name: 'Personality Engine (DECODE)', tier: 'free', category: 'cognitive', description: 'Unified personality profiles and tone detection' },
  { id: 'conversation_auto_store', name: 'Conversation Auto-Store', tier: 'free', category: 'cognitive', description: 'Automatic memory capture from conversations' },
  { id: 'nexus_engine', name: 'Nexus Engine', tier: 'free', category: 'integration', description: 'Multi-provider AI routing with fallback' },
  { id: 'audio_experience_engine', name: 'Audio Experience Engine', tier: 'free', category: 'experience', description: 'Voice and audio processing pipeline' },
  { id: 'engine_bus', name: 'Engine Bus', tier: 'free', category: 'infrastructure', description: 'Canonical task routing between engines' },
  { id: 'state_engine', name: 'State Engine', tier: 'free', category: 'infrastructure', description: 'Schema validation and state contracts' },
  { id: 'event_system', name: 'Event System', tier: 'free', category: 'infrastructure', description: 'Basic event emission and querying' },
  { id: 'semantic_search', name: 'Semantic Search', tier: 'free', category: 'intelligence', description: 'TF-IDF and n-gram memory recall' },
  { id: 'clm_basic', name: 'CLM (Basic)', tier: 'free', category: 'cognitive', description: 'Constant Learning Mode — core curriculum only' },
  // v8.5.0 HIGH-VALUE additions (4)
  { id: 'hot_reload_orchestrator', name: 'Hot Reload Orchestrator', tier: 'free', category: 'infrastructure', description: 'Live config reload without restart' },
  { id: 'conversation_analytics', name: 'Conversation Analytics', tier: 'free', category: 'cognitive', description: 'Turn-level conversation quality metrics' },
  { id: 'emotion_baseline', name: 'Emotion Baseline Detector', tier: 'free', category: 'cognitive', description: 'Baseline emotional tone tracking per session' },
  { id: 'nexus_health_monitor', name: 'Nexus Health Monitor', tier: 'free', category: 'integration', description: 'Provider health status and uptime tracking' },
  // v9.3.0 — Repurposed from edge functions
  { id: 'dream_feeder_api', name: 'Dream Feeder API', tier: 'free', category: 'experience', description: 'Public dream submission endpoint for Dream-Eater interaction' },
  { id: 'memory_playground', name: 'Memory Playground', tier: 'free', category: 'experience', description: 'Interactive memory store/recall/forget SDK demo' },
];

/**
 * BUILDER TIER — Hardening & Observability (26 capabilities)
 * v8.5.0: +8 high-value additions across reliability, observability, and communication
 */
export const BUILDER_CAPABILITIES: TieredCapability[] = [
  // Original 18
  { id: 'circuit_breaker', name: 'Circuit Breaker', tier: 'builder', category: 'reliability', description: 'Formalized open/half-open/closed module protection' },
  { id: 'boot_gates', name: 'Boot Health Gates', tier: 'builder', category: 'reliability', description: 'Dependency-aware module activation verification' },
  { id: 'regression_testing', name: 'Regression Testing', tier: 'builder', category: 'reliability', description: 'Automated smoke tests for system integrity' },
  { id: 'regression_trigger', name: 'Auto Regression Trigger', tier: 'builder', category: 'reliability', description: 'Fire tests automatically after events' },
  { id: 'telemetry_engine', name: 'Telemetry Engine', tier: 'builder', category: 'observability', description: 'Full event tracing and performance metrics' },
  { id: 'cost_attribution', name: 'Cost Attribution', tier: 'builder', category: 'observability', description: 'Per-module token and budget tracking' },
  { id: 'self_benchmark', name: 'Self-Benchmark', tier: 'builder', category: 'observability', description: 'Composite health scoring (0-100)' },
  { id: 'health_api', name: 'Health Dashboard API', tier: 'builder', category: 'observability', description: 'Unified JSON endpoint for real-time system status' },
  { id: 'correlation_id', name: 'Correlation ID Propagation', tier: 'builder', category: 'observability', description: 'End-to-end request tracing across module boundaries' },
  { id: 'memory_gc', name: 'Memory GC', tier: 'builder', category: 'memory', description: 'Garbage collection and capacity enforcement' },
  { id: 'gc_scheduler', name: 'GC Scheduler', tier: 'builder', category: 'memory', description: 'Automated 6-hour memory maintenance cycles' },
  { id: 'memory_dedup', name: 'Memory Deduplication', tier: 'builder', category: 'memory', description: 'N-gram similarity-based duplicate merging' },
  { id: 'module_bus', name: 'Module Communication Bus', tier: 'builder', category: 'communication', description: 'Real-time pub/sub inter-module signals' },
  { id: 'realtime_bridge', name: 'Realtime Bridge', tier: 'builder', category: 'communication', description: 'Cross-tab/session signal propagation' },
  { id: 'brain_transfer', name: 'Brain Transfer Pipeline', tier: 'builder', category: 'intelligence', description: 'Distill memories into module heuristics' },
  { id: 'pattern_scoring', name: 'Pattern Effectiveness Scoring', tier: 'builder', category: 'intelligence', description: 'Track ROI of transferred knowledge patterns' },
  { id: 'pattern_versioning', name: 'Pattern Versioning', tier: 'builder', category: 'intelligence', description: 'Schema versions for expert patterns with migration' },
  { id: 'adaptive_rate_limit', name: 'Adaptive Rate Limiting', tier: 'builder', category: 'reliability', description: 'Dynamic rate limits based on system health and reputation' },
  // v8.5.0 HIGH-VALUE additions (8)
  { id: 'structured_error_recovery', name: 'Structured Error Recovery', tier: 'builder', category: 'reliability', description: 'Typed error classification with recovery strategies' },
  { id: 'event_replay_buffer', name: 'Event Replay Buffer', tier: 'builder', category: 'reliability', description: 'Buffered event replay for debugging and recovery' },
  { id: 'latency_heatmap', name: 'Latency Heatmap', tier: 'builder', category: 'observability', description: 'Per-engine latency visualization with percentile tracking' },
  { id: 'dependency_graph_viz', name: 'Dependency Graph Visualizer', tier: 'builder', category: 'observability', description: 'Real-time module dependency graph rendering' },
  { id: 'memory_compaction', name: 'Memory Compaction Engine', tier: 'builder', category: 'memory', description: 'Intelligent memory segment compaction and defragmentation' },
  { id: 'signal_priority_queue', name: 'Signal Priority Queue', tier: 'builder', category: 'communication', description: 'Priority-ordered inter-module signal delivery' },
  { id: 'config_snapshot', name: 'Config Snapshot & Restore', tier: 'builder', category: 'infrastructure', description: 'Point-in-time configuration backup and restore' },
  { id: 'audit_trail_lite', name: 'Audit Trail (Lite)', tier: 'builder', category: 'observability', description: 'Lightweight operation audit logging for debugging' },
  // v9.3.0 — Repurposed from edge functions
  { id: 'evolution_receipts', name: 'Evolution Receipts', tier: 'builder', category: 'observability', description: 'Read-only sanitized evolution audit trail with receipt history' },
];

/**
 * PRO TIER — Intelligence & Operations (24 capabilities)
 * v8.5.0: +10 high-value additions across intelligence, operations, and platform
 */
export const PRO_CAPABILITIES: TieredCapability[] = [
  // Original 14
  { id: 'reasoning_engine', name: 'Reasoning Engine', tier: 'pro', category: 'intelligence', description: 'Causal reasoning and hypothesis testing' },
  { id: 'imagination_engine', name: 'Imagination Engine', tier: 'pro', category: 'intelligence', description: 'Generative synthesis and pattern fusion' },
  { id: 'knowledge_map', name: 'Knowledge Map', tier: 'pro', category: 'intelligence', description: 'Expertise scoring and coverage gap analysis' },
  { id: 'anomaly_correlation', name: 'Anomaly Correlation', tier: 'pro', category: 'intelligence', description: 'Cross-module anomaly detection and correlation' },
  { id: 'incident_timeline', name: 'Incident Timeline', tier: 'pro', category: 'intelligence', description: 'Causal chain reconstruction for root-cause analysis' },
  { id: 'predictive_failure', name: 'Predictive Failure Detection', tier: 'pro', category: 'intelligence', description: 'Metric trend analysis to predict impending failures' },
  { id: 'adaptive_budget', name: 'Adaptive Budget Allocation', tier: 'pro', category: 'operations', description: 'Dynamic token shifting based on module value' },
  { id: 'cost_forecast', name: 'Cost Forecasting', tier: 'pro', category: 'operations', description: 'EMA-based spend prediction and budget alerts' },
  { id: 'load_shedding', name: 'Load Shedding', tier: 'pro', category: 'operations', description: 'Autonomous module deprioritization under pressure' },
  { id: 'governance_guard', name: 'Governance Guard', tier: 'pro', category: 'governance', description: 'Ethical and coherence constraint enforcement' },
  { id: 'multi_tenant', name: 'Multi-Tenant Isolation', tier: 'pro', category: 'platform', description: 'Tenant-scoped resource isolation for shared instances' },
  { id: 'capability_gate', name: 'Capability Gate Middleware', tier: 'pro', category: 'platform', description: 'Tier-based access control enforcement at runtime' },
  { id: 'dynamic_pipeline', name: 'Dynamic Pipeline Composition', tier: 'pro', category: 'operations', description: 'Runtime-composable execution pipelines from registered stages' },
  { id: 'federated_memory', name: 'Federated Memory Sync', tier: 'pro', category: 'memory', description: 'Cross-instance memory synchronization with privacy controls' },
  // v8.5.0 HIGH-VALUE additions (10)
  { id: 'associative_recall', name: 'Associative Recall', tier: 'pro', category: 'intelligence', description: 'Cross-domain memory association and pattern linking' },
  { id: 'hypothesis_generator', name: 'Hypothesis Generator', tier: 'pro', category: 'intelligence', description: 'Automated hypothesis formulation from anomaly signals' },
  { id: 'cognitive_load_balancer', name: 'Cognitive Load Balancer', tier: 'pro', category: 'operations', description: 'Distribute reasoning workload across engine clusters' },
  { id: 'intent_disambiguation', name: 'Intent Disambiguation', tier: 'pro', category: 'intelligence', description: 'Multi-signal intent resolution for ambiguous queries' },
  { id: 'context_compression', name: 'Context Compression', tier: 'pro', category: 'intelligence', description: 'Lossless semantic compression for long-context windows' },
  { id: 'sla_monitor', name: 'SLA Monitor', tier: 'pro', category: 'operations', description: 'Real-time SLA compliance tracking with alerting' },
  { id: 'canary_deployment', name: 'Canary Deployment Gate', tier: 'pro', category: 'platform', description: 'Percentage-based traffic shifting for safe rollouts' },
  { id: 'resource_quota_engine', name: 'Resource Quota Engine', tier: 'pro', category: 'operations', description: 'Per-tenant resource quotas with burst capacity' },
  { id: 'cross_module_insight', name: 'Cross-Module Insight Fusion', tier: 'pro', category: 'intelligence', description: 'Aggregate insights across module boundaries' },
  { id: 'adaptive_timeout', name: 'Adaptive Timeout Manager', tier: 'pro', category: 'operations', description: 'Dynamic timeout calibration based on engine latency profiles' },
];

/**
 * ENTERPRISE TIER — Self-Improvement + Full Platform (58 capabilities)
 * v8.5.0: +34 high-value additions including new engines and self-improvement enhancements
 * 
 * ⚠️  SELF-IMPROVEMENT IS EXCLUSIVELY ENTERPRISE.
 */
export const ENTERPRISE_CAPABILITIES: TieredCapability[] = [
  // === SELF-IMPROVEMENT (Non-Recursive — Enterprise-Only) ===
  // Crown Jewels (SEBA, EVOLUTION, Cortex, Evolution A/B, Rollback, Sandbox, Dream Pool,
  // Self-Repair, Autonomous Workflow Composer, Dream Lucidity) are CMPSBL-ONLY — not listed here.
  { id: 'impact_replay', name: 'Impact Replay', tier: 'enterprise', category: 'self-improvement', description: 'Replay queries against new states to verify impact' },
  { id: 'dream_proposal', name: 'Dream → Proposal Pipeline', tier: 'enterprise', category: 'self-improvement', description: 'Convert cognitive insights into evolution proposals' },
  { id: 'dream_chains', name: 'Multi-Step Dream Chains', tier: 'enterprise', category: 'self-improvement', description: 'Sequences of dependent evolution proposals' },
  { id: 'knowledge_autofill', name: 'Knowledge Auto-Fill', tier: 'enterprise', category: 'self-improvement', description: 'Auto-schedule CLM sessions for expertise gaps' },
  { id: 'hot_swap', name: 'Hot-Swap Engine Deployment', tier: 'enterprise', category: 'self-improvement', description: 'Zero-downtime engine replacement at runtime' },
  { id: 'deprecation_lifecycle', name: 'Deprecation Lifecycle', tier: 'enterprise', category: 'self-improvement', description: 'Managed sunset for capabilities: announced → removed' },
  // Full Platform (original 12)
  { id: 'capability_discovery', name: 'Module Capability Discovery', tier: 'enterprise', category: 'platform', description: 'Auto-detect module functionality via endpoint probing' },
  { id: 'orchestrator_engine', name: 'Orchestrator Engine', tier: 'enterprise', category: 'platform', description: 'Unified cognitive pipeline with preset modes' },
  { id: 'support_bot', name: 'Support Bot Engine', tier: 'enterprise', category: 'platform', description: 'Governed evolving support with memory-backed resolution' },
  { id: 'code_validation', name: 'Encoded Code Validation', tier: 'enterprise', category: 'platform', description: 'Pre-proposal syntax and safety checks' },
  { id: 'plugin_sdk', name: 'Plugin SDK', tier: 'enterprise', category: 'platform', description: 'Extension framework for third-party substrate plugins' },
  { id: 'world_first_cognitive', name: 'World-First: Cognitive', tier: 'enterprise', category: 'world-first', description: '14 cognitive enhancement orchestrations' },
  { id: 'world_first_operational', name: 'World-First: Operational', tier: 'enterprise', category: 'world-first', description: '14 operational enhancement orchestrations' },
  { id: 'world_first_intelligence', name: 'World-First: Intelligence', tier: 'enterprise', category: 'world-first', description: '14 intelligence enhancement orchestrations' },
  { id: 'world_first_governance', name: 'World-First: Governance', tier: 'enterprise', category: 'world-first', description: '14 governance enhancement orchestrations' },
  { id: 'parity_enforcement', name: 'Parity Enforcement', tier: 'enterprise', category: 'enterprise', description: 'Cross-module consistency and completeness checks' },
  { id: 'full_clm', name: 'CLM (Full Spectrum)', tier: 'enterprise', category: 'enterprise', description: 'All tiers of Constant Learning Mode including research' },
  { id: 'archived_adapters', name: 'Archived Capability Adapters', tier: 'enterprise', category: 'enterprise', description: 'Legacy function adapters for backward compatibility' },
  { id: 'custom_engines', name: 'Custom Engine Registration', tier: 'enterprise', category: 'enterprise', description: 'Register and deploy custom engines to the bus' },
  // v8.5.0 HIGH-VALUE additions (24 — Crown Jewels excluded)
  // Self-Improvement enhancements (non-recursive only)
  { id: 'evolution_impact_forecast', name: 'Evolution Impact Forecast', tier: 'enterprise', category: 'self-improvement', description: 'Predicted outcome modeling before evolution commits' },
  { id: 'evolution_lineage_tracker', name: 'Evolution Lineage Tracker', tier: 'enterprise', category: 'self-improvement', description: 'Full ancestry tracking for all evolution proposals' },
  { id: 'cognitive_debt_analyzer', name: 'Cognitive Debt Analyzer', tier: 'enterprise', category: 'self-improvement', description: 'Identify and prioritize cognitive technical debt' },
  // New engine capabilities
  { id: 'sandbox_engine', name: 'Sandbox Engine', tier: 'enterprise', category: 'platform', description: 'Isolated execution environment for untrusted capabilities' },
  { id: 'saga_engine', name: 'Saga Engine', tier: 'enterprise', category: 'platform', description: 'Distributed transaction coordination with compensating actions' },
  { id: 'policy_access_engine', name: 'Policy Access Engine', tier: 'enterprise', category: 'security', description: 'Attribute-based access control with policy evaluation' },
  { id: 'deep_cognition_engine', name: 'Deep Cognition Engine', tier: 'enterprise', category: 'intelligence', description: 'Multi-hop associative reasoning across knowledge domains' },
  { id: 'dialogue_engine', name: 'Dialogue Engine', tier: 'enterprise', category: 'intelligence', description: 'Advanced multi-turn dialogue state tracking and management' },
  { id: 'prompt_safety_engine', name: 'Prompt Safety Engine', tier: 'enterprise', category: 'security', description: 'Real-time prompt injection and jailbreak detection' },
  { id: 'observability_engine', name: 'Observability Engine', tier: 'enterprise', category: 'observability', description: 'Deep system introspection with distributed tracing' },
  { id: 'technical_debt_engine', name: 'Technical Debt Engine', tier: 'enterprise', category: 'evolution', description: 'Automated technical debt scoring and remediation planning' },
  // Meta-engine capabilities
  { id: 'resilience_shield_meta', name: 'Resilience Shield Meta-Engine', tier: 'enterprise', category: 'platform', description: 'Compound protection orchestrating sandbox, safety, saga, and policy engines' },
  { id: 'deep_cognition_nexus_meta', name: 'Deep Cognition Nexus Meta-Engine', tier: 'enterprise', category: 'intelligence', description: 'Compound intelligence orchestrating cognition, dialogue, observability, and debt engines' },
  // Advanced enterprise capabilities
  { id: 'fleet_orchestration', name: 'Fleet Orchestration', tier: 'enterprise', category: 'platform', description: 'Multi-instance substrate fleet coordination' },
  { id: 'compliance_report_gen', name: 'Compliance Report Generator', tier: 'enterprise', category: 'governance', description: 'Automated regulatory compliance report generation' },
  { id: 'knowledge_graph_federation', name: 'Knowledge Graph Federation', tier: 'enterprise', category: 'intelligence', description: 'Cross-instance knowledge graph merging and querying' },
  { id: 'capability_marketplace', name: 'Capability Marketplace', tier: 'enterprise', category: 'platform', description: 'Publish, discover, and install third-party capabilities' },
  { id: 'adaptive_personality_tuning', name: 'Adaptive Personality Tuning', tier: 'enterprise', category: 'cognitive', description: 'Runtime personality parameter adjustment based on context' },
  { id: 'multi_agent_negotiation', name: 'Multi-Agent Negotiation', tier: 'enterprise', category: 'platform', description: 'Protocol-based inter-agent negotiation and consensus' },
  { id: 'semantic_versioning_engine', name: 'Semantic Versioning Engine', tier: 'enterprise', category: 'governance', description: 'Automated semantic version management for capabilities' },
  { id: 'cost_anomaly_detector', name: 'Cost Anomaly Detector', tier: 'enterprise', category: 'operations', description: 'ML-based cost spike detection and root cause analysis' },
  { id: 'cognitive_replay_debugger', name: 'Cognitive Replay Debugger', tier: 'enterprise', category: 'intelligence', description: 'Step-through replay of cognitive execution chains' },
  { id: 'zero_trust_mesh', name: 'Zero Trust Mesh', tier: 'enterprise', category: 'security', description: 'Service mesh with mutual TLS and identity verification' },
  // evolution_sandbox and dream_pool_federation are Crown Jewels — CMPSBL-only
  { id: 'runtime_schema_migration', name: 'Runtime Schema Migration', tier: 'enterprise', category: 'platform', description: 'Live schema evolution without downtime' },
  { id: 'capability_health_score', name: 'Capability Health Score', tier: 'enterprise', category: 'observability', description: 'Per-capability health scoring with degradation alerts' },
  { id: 'cross_tenant_analytics', name: 'Cross-Tenant Analytics', tier: 'enterprise', category: 'operations', description: 'Anonymized aggregate analytics across tenant boundaries' },
  { id: 'intelligent_cache_engine', name: 'Intelligent Cache Engine', tier: 'enterprise', category: 'performance', description: 'Predictive caching with semantic-aware eviction' },
  { id: 'governance_workflow', name: 'Governance Workflow Engine', tier: 'enterprise', category: 'governance', description: 'Multi-stage approval workflows for sensitive operations' },
  { id: 'substrate_telemetry_export', name: 'Substrate Telemetry Export', tier: 'enterprise', category: 'observability', description: 'Export telemetry to external APM and monitoring systems' },
  // v9.3.0 — Repurposed from edge functions
  { id: 'agent_mesh', name: 'Agent Mesh', tier: 'enterprise', category: 'platform', description: 'Multi-agent coordination patterns: chain, parallel, supervisor, debate, swarm' },
];

/** All capabilities combined */
export const ALL_CAPABILITIES: TieredCapability[] = [
  ...FREE_CAPABILITIES,
  ...BUILDER_CAPABILITIES,
  ...PRO_CAPABILITIES,
  ...ENTERPRISE_CAPABILITIES,
];

/** Get capabilities for a specific tier (includes all lower tiers) */
export function getCapabilitiesForTier(tier: DistributionTier): TieredCapability[] {
  const tierOrder: DistributionTier[] = ['free', 'builder', 'pro', 'enterprise'];
  const tierIndex = tierOrder.indexOf(tier);
  return ALL_CAPABILITIES.filter(c => tierOrder.indexOf(c.tier) <= tierIndex);
}

/** Get capabilities unlocked at a specific tier (excludes lower) */
export function getNewCapabilitiesAtTier(tier: DistributionTier): TieredCapability[] {
  return ALL_CAPABILITIES.filter(c => c.tier === tier);
}

/** Check if a capability is available at a given tier */
export function isCapabilityAvailable(capabilityId: string, userTier: DistributionTier): boolean {
  // Crown Jewels are NEVER available in LNCHBL — any tier
  if (CROWN_JEWEL_IDS.includes(capabilityId)) return false;
  const cap = ALL_CAPABILITIES.find(c => c.id === capabilityId);
  if (!cap) return false;
  const tierOrder: DistributionTier[] = ['free', 'builder', 'pro', 'enterprise'];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(cap.tier);
}

/** Get tier summary stats */
export function getTierSummary() {
  return {
    free: { count: FREE_CAPABILITIES.length, categories: [...new Set(FREE_CAPABILITIES.map(c => c.category))] },
    builder: { count: BUILDER_CAPABILITIES.length, categories: [...new Set(BUILDER_CAPABILITIES.map(c => c.category))] },
    pro: { count: PRO_CAPABILITIES.length, categories: [...new Set(PRO_CAPABILITIES.map(c => c.category))] },
    enterprise: { count: ENTERPRISE_CAPABILITIES.length, categories: [...new Set(ENTERPRISE_CAPABILITIES.map(c => c.category))] },
    total: ALL_CAPABILITIES.length,
  };
}

/** Get capability IDs for a tier (for patch manifests) */
export function getTierCapabilityIds(tier: DistributionTier): string[] {
  return getCapabilitiesForTier(tier).map(c => c.id);
}

/** Check if a capability involves self-improvement */
export function isSelfImprovement(capabilityId: string): boolean {
  const cap = ALL_CAPABILITIES.find(c => c.id === capabilityId);
  return cap?.category === 'self-improvement';
}

/** Check if a capability is a Crown Jewel (CMPSBL-only, never distributed) */
export function isCrownJewel(capabilityId: string): boolean {
  return CROWN_JEWEL_IDS.includes(capabilityId);
}
