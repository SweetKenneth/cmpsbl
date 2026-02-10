/**
 * LNCHBL Distribution — Tiered Capability Map
 * v2.0.0 — Maps all substrate systems to subscription tiers
 * 
 * FREE (Starter):  Core cognitive loop + basic memory
 * Builder ($49/mo): Infrastructure hardening + observability  
 * Pro ($149/mo):    Full autonomy + evolution + intelligence
 * Enterprise ($499/mo): Complete platform + custom + SLA
 */

export type DistributionTier = 'free' | 'builder' | 'pro' | 'enterprise';

export interface TieredCapability {
  id: string;
  name: string;
  tier: DistributionTier;
  category: string;
  description: string;
}

/**
 * FREE TIER — Core cognitive substrate
 * Everything needed to get started with persistent memory and basic AI
 */
export const FREE_CAPABILITIES: TieredCapability[] = [
  // Core Engines
  { id: 'memory_engine', name: 'Memory Engine', tier: 'free', category: 'cognitive', description: 'Persistent memory store/recall with tiered storage' },
  { id: 'learning_engine', name: 'Learning Engine', tier: 'free', category: 'cognitive', description: 'Reinforcement learning from feedback signals' },
  { id: 'context_engine', name: 'Context Engine', tier: 'free', category: 'cognitive', description: 'Contextual awareness and session state' },
  { id: 'personality_engine', name: 'Personality Engine (DECODE)', tier: 'free', category: 'cognitive', description: 'Unified personality profiles and tone detection' },
  { id: 'conversation_auto_store', name: 'Conversation Auto-Store', tier: 'free', category: 'cognitive', description: 'Automatic memory capture from conversations' },
  { id: 'nexus_engine', name: 'Nexus Engine', tier: 'free', category: 'integration', description: 'Multi-provider AI routing with fallback' },
  { id: 'audio_experience_engine', name: 'Audio Experience Engine', tier: 'free', category: 'experience', description: 'Voice and audio processing pipeline' },
  // Basic Infrastructure
  { id: 'engine_bus', name: 'Engine Bus', tier: 'free', category: 'infrastructure', description: 'Canonical task routing between engines' },
  { id: 'state_engine', name: 'State Engine', tier: 'free', category: 'infrastructure', description: 'Schema validation and state contracts' },
  { id: 'event_system', name: 'Event System', tier: 'free', category: 'infrastructure', description: 'Basic event emission and querying' },
  { id: 'semantic_search', name: 'Semantic Search', tier: 'free', category: 'intelligence', description: 'TF-IDF and n-gram memory recall' },
  { id: 'clm_basic', name: 'CLM (Basic)', tier: 'free', category: 'cognitive', description: 'Constant Learning Mode — core curriculum only' },
];

/**
 * BUILDER TIER — Infrastructure hardening + observability
 * For developers building production-grade cognitive applications
 */
export const BUILDER_CAPABILITIES: TieredCapability[] = [
  // Reliability
  { id: 'circuit_breaker', name: 'Circuit Breaker', tier: 'builder', category: 'reliability', description: 'Formalized open/half-open/closed module protection' },
  { id: 'boot_gates', name: 'Boot Health Gates', tier: 'builder', category: 'reliability', description: 'Dependency-aware module activation verification' },
  { id: 'regression_testing', name: 'Regression Testing', tier: 'builder', category: 'reliability', description: 'Automated smoke tests for system integrity' },
  { id: 'regression_trigger', name: 'Auto Regression Trigger', tier: 'builder', category: 'reliability', description: 'Fire tests automatically after evolution events' },
  // Observability
  { id: 'telemetry_engine', name: 'Telemetry Engine', tier: 'builder', category: 'observability', description: 'Full event tracing and performance metrics' },
  { id: 'cost_attribution', name: 'Cost Attribution', tier: 'builder', category: 'observability', description: 'Per-module token and budget tracking' },
  { id: 'self_benchmark', name: 'Self-Benchmark', tier: 'builder', category: 'observability', description: 'Composite health scoring (0-100)' },
  { id: 'health_api', name: 'Health Dashboard API', tier: 'builder', category: 'observability', description: 'Unified JSON endpoint for real-time system status' },
  // Memory Management
  { id: 'memory_gc', name: 'Memory GC', tier: 'builder', category: 'memory', description: 'Garbage collection and capacity enforcement' },
  { id: 'gc_scheduler', name: 'GC Scheduler', tier: 'builder', category: 'memory', description: 'Automated 6-hour memory maintenance cycles' },
  { id: 'memory_dedup', name: 'Memory Deduplication', tier: 'builder', category: 'memory', description: 'N-gram similarity-based duplicate merging' },
  // Communication
  { id: 'module_bus', name: 'Module Communication Bus', tier: 'builder', category: 'communication', description: 'Real-time pub/sub inter-module signals' },
  { id: 'realtime_bridge', name: 'Realtime Bridge', tier: 'builder', category: 'communication', description: 'Cross-tab/session signal propagation' },
  // Transfer
  { id: 'brain_transfer', name: 'Brain Transfer Pipeline', tier: 'builder', category: 'intelligence', description: 'Distill memories into module heuristics' },
  { id: 'pattern_scoring', name: 'Pattern Effectiveness Scoring', tier: 'builder', category: 'intelligence', description: 'Track ROI of transferred knowledge patterns' },
  { id: 'pattern_versioning', name: 'Pattern Versioning', tier: 'builder', category: 'intelligence', description: 'Schema versions for expert patterns with migration' },
];

/**
 * PRO TIER — Full autonomy + evolution + intelligence
 * For teams building self-improving cognitive systems
 */
export const PRO_CAPABILITIES: TieredCapability[] = [
  // Evolution
  { id: 'seba_engine', name: 'SEBA Evolution Engine', tier: 'pro', category: 'evolution', description: 'Self-Evolving Bounded Agent with 9 cognitive analyzers' },
  { id: 'modernizer', name: 'Modernizer (Omega Observer)', tier: 'pro', category: 'evolution', description: 'Shadow-to-production upgrade pipeline' },
  { id: 'evolution_ab', name: 'Evolution A/B Testing', tier: 'pro', category: 'evolution', description: 'Shadow two proposal variants, select better performer' },
  { id: 'evolution_rollback', name: 'Evolution Rollback', tier: 'pro', category: 'evolution', description: 'Auto-revert on regression test failures' },
  { id: 'impact_replay', name: 'Impact Replay', tier: 'pro', category: 'evolution', description: 'Replay queries against new states to verify impact' },
  // Autonomy
  { id: 'cortex_engine', name: 'Cortex Agency Engine', tier: 'pro', category: 'autonomy', description: 'PROPOSE → EVALUATE → APPLY → AUDIT → LEARN loop' },
  { id: 'dream_proposal', name: 'Dream → Proposal Pipeline', tier: 'pro', category: 'autonomy', description: 'Convert cognitive insights into evolution proposals' },
  { id: 'dream_chains', name: 'Multi-Step Dream Chains', tier: 'pro', category: 'autonomy', description: 'Sequences of dependent evolution proposals' },
  { id: 'knowledge_autofill', name: 'Knowledge Auto-Fill', tier: 'pro', category: 'autonomy', description: 'Auto-schedule CLM sessions for expertise gaps' },
  // Intelligence
  { id: 'reasoning_engine', name: 'Reasoning Engine', tier: 'pro', category: 'intelligence', description: 'Causal reasoning and hypothesis testing' },
  { id: 'imagination_engine', name: 'Imagination Engine', tier: 'pro', category: 'intelligence', description: 'Generative synthesis and pattern fusion' },
  { id: 'knowledge_map', name: 'Knowledge Map', tier: 'pro', category: 'intelligence', description: 'Expertise scoring and coverage gap analysis' },
  { id: 'anomaly_correlation', name: 'Anomaly Correlation', tier: 'pro', category: 'intelligence', description: 'Cross-module anomaly detection and correlation' },
  { id: 'incident_timeline', name: 'Incident Timeline', tier: 'pro', category: 'intelligence', description: 'Causal chain reconstruction for root-cause analysis' },
  // Advanced Ops
  { id: 'adaptive_budget', name: 'Adaptive Budget Allocation', tier: 'pro', category: 'operations', description: 'Dynamic token shifting based on module value' },
  { id: 'cost_forecast', name: 'Cost Forecasting', tier: 'pro', category: 'operations', description: 'EMA-based spend prediction and budget alerts' },
  { id: 'load_shedding', name: 'Load Shedding', tier: 'pro', category: 'operations', description: 'Autonomous module deprioritization under pressure' },
  { id: 'governance_guard', name: 'Governance Guard', tier: 'pro', category: 'governance', description: 'Ethical and coherence constraint enforcement' },
];

/**
 * ENTERPRISE TIER — Complete platform + custom + SLA
 * Full substrate access with enterprise-grade guarantees
 */
export const ENTERPRISE_CAPABILITIES: TieredCapability[] = [
  // Full Platform
  { id: 'capability_discovery', name: 'Module Capability Discovery', tier: 'enterprise', category: 'platform', description: 'Auto-detect module functionality via endpoint probing' },
  { id: 'orchestrator_engine', name: 'Orchestrator Engine', tier: 'enterprise', category: 'platform', description: 'Unified cognitive pipeline with preset modes' },
  { id: 'support_bot', name: 'Support Bot Engine', tier: 'enterprise', category: 'platform', description: 'Governed evolving support with memory-backed resolution' },
  { id: 'code_validation', name: 'Encoded Code Validation', tier: 'enterprise', category: 'platform', description: 'Pre-proposal syntax and safety checks' },
  // World-First Enhancements
  { id: 'world_first_cognitive', name: 'World-First: Cognitive', tier: 'enterprise', category: 'world-first', description: '14 cognitive enhancement orchestrations' },
  { id: 'world_first_operational', name: 'World-First: Operational', tier: 'enterprise', category: 'world-first', description: '14 operational enhancement orchestrations' },
  { id: 'world_first_intelligence', name: 'World-First: Intelligence', tier: 'enterprise', category: 'world-first', description: '14 intelligence enhancement orchestrations' },
  { id: 'world_first_governance', name: 'World-First: Governance', tier: 'enterprise', category: 'world-first', description: '14 governance enhancement orchestrations' },
  // Enterprise Features
  { id: 'parity_enforcement', name: 'Parity Enforcement', tier: 'enterprise', category: 'enterprise', description: 'Cross-module consistency and completeness checks' },
  { id: 'full_clm', name: 'CLM (Full Spectrum)', tier: 'enterprise', category: 'enterprise', description: 'All tiers of Constant Learning Mode including research' },
  { id: 'archived_adapters', name: 'Archived Capability Adapters', tier: 'enterprise', category: 'enterprise', description: 'Legacy function adapters for backward compatibility' },
  { id: 'custom_engines', name: 'Custom Engine Registration', tier: 'enterprise', category: 'enterprise', description: 'Register and deploy custom engines to the bus' },
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
