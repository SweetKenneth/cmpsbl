/**
 * High-Value Capabilities v8.5.0
 * 56 new capabilities — across all 40 nodes
 * Total: 269 (existing) + 56 = 325 capabilities (pre-expansion baseline)
 */

export interface HighValueCapability {
  id: string;
  name: string;
  module: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  reversible: boolean;
  category: string;
}

// ============================================================================
// KERNEL LAYER
// ============================================================================

/** CORE — Runtime Infrastructure (4) */
export const CORE_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'runtime_config_validator', name: 'Runtime Config Validator', module: 'CORE', description: 'Validates config integrity and schema compliance at runtime before hot-reload', risk: 'low', reversible: true, category: 'infrastructure' },
  { id: 'dependency_resolver', name: 'Dependency Resolver', module: 'CORE', description: 'Dynamically resolves module dependencies and detects circular references', risk: 'low', reversible: true, category: 'infrastructure' },
  { id: 'hot_reload_orchestrator', name: 'Hot-Reload Orchestrator', module: 'CORE', description: 'Zero-downtime config and module hot-reloading with rollback', risk: 'medium', reversible: true, category: 'infrastructure' },
  { id: 'environment_sandbox', name: 'Environment Sandbox', module: 'CORE', description: 'Isolated execution environments for testing module changes safely', risk: 'medium', reversible: true, category: 'infrastructure' },
];

/** RIPPLE — Event Infrastructure (4) */
export const RIPPLE_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'event_sourcing_engine', name: 'Event Sourcing Engine', module: 'RIPPLE', description: 'Full event sourcing with append-only log and temporal queries', risk: 'low', reversible: true, category: 'communication' },
  { id: 'saga_orchestrator', name: 'Saga Orchestrator', module: 'RIPPLE', description: 'Distributed transaction coordination with compensating actions', risk: 'medium', reversible: true, category: 'communication' },
  { id: 'backpressure_controller', name: 'Backpressure Controller', module: 'RIPPLE', description: 'Adaptive flow control to prevent message queue overflow under load', risk: 'low', reversible: true, category: 'reliability' },
  { id: 'event_schema_validator', name: 'Event Schema Validator', module: 'RIPPLE', description: 'Schema validation and versioning for all inter-module event payloads', risk: 'low', reversible: true, category: 'governance' },
];

/** ACCESS — Identity & Policy (4) */
export const ACCESS_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'policy_engine', name: 'Policy Engine', module: 'ACCESS', description: 'Attribute-based access control with dynamic policy evaluation', risk: 'medium', reversible: true, category: 'security' },
  { id: 'session_fingerprint', name: 'Session Fingerprint', module: 'ACCESS', description: 'Behavioral session identification for anomaly detection', risk: 'low', reversible: true, category: 'security' },
  { id: 'credential_vault', name: 'Credential Vault', module: 'ACCESS', description: 'Secure credential lifecycle management with auto-rotation', risk: 'high', reversible: false, category: 'security' },
  { id: 'consent_manager', name: 'Consent Manager', module: 'ACCESS', description: 'Privacy consent tracking and GDPR/CCPA compliance enforcement', risk: 'low', reversible: true, category: 'governance' },
];

// ============================================================================
// COGNITIVE LAYER
// ============================================================================

/** BRAIN — Deep Cognition (4) */
export const BRAIN_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'associative_recall', name: 'Associative Recall', module: 'BRAIN', description: 'Association-graph memory retrieval using spreading activation', risk: 'low', reversible: true, category: 'cognitive' },
  { id: 'cognitive_compression', name: 'Cognitive Compression', module: 'BRAIN', description: 'Information density optimization — distill verbose data to core facts', risk: 'low', reversible: true, category: 'cognitive' },
  { id: 'knowledge_distillation', name: 'Knowledge Distillation', module: 'BRAIN', description: 'Extract core insights from noisy multi-source data streams', risk: 'low', reversible: true, category: 'intelligence' },
  { id: 'temporal_reasoning', name: 'Temporal Reasoning', module: 'BRAIN', description: 'Time-aware causal inference and sequence prediction', risk: 'medium', reversible: true, category: 'intelligence' },
];

/** DECODE — Language Understanding (4) */
export const DECODE_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'tone_calibrator', name: 'Tone Calibrator', module: 'DECODE', description: 'Dynamic output tone adjustment based on context and user profile', risk: 'low', reversible: true, category: 'experience' },
  { id: 'semantic_disambiguator', name: 'Semantic Disambiguator', module: 'DECODE', description: 'Resolve meaning conflicts in ambiguous natural language input', risk: 'low', reversible: true, category: 'cognitive' },
  { id: 'dialogue_planner', name: 'Dialogue Planner', module: 'DECODE', description: 'Multi-turn conversation planning with goal tracking', risk: 'low', reversible: true, category: 'cognitive' },
  { id: 'language_detector', name: 'Language Detector', module: 'DECODE', description: 'Multilingual input classification with script detection', risk: 'low', reversible: true, category: 'intelligence' },
];

// ============================================================================
// OPERATIONAL LAYER
// ============================================================================

/** NEXUS — Provider Intelligence (4) */
export const NEXUS_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'provider_failover_mesh', name: 'Provider Failover Mesh', module: 'NEXUS', description: 'Mesh-based multi-provider failover with latency-aware selection', risk: 'medium', reversible: true, category: 'integration' },
  { id: 'token_economy_optimizer', name: 'Token Economy Optimizer', module: 'NEXUS', description: 'Minimize token spend through prompt compression and caching', risk: 'low', reversible: true, category: 'resource' },
  { id: 'model_selection_advisor', name: 'Model Selection Advisor', module: 'NEXUS', description: 'Recommend optimal model per task based on cost/quality/latency profile', risk: 'low', reversible: true, category: 'intelligence' },
  { id: 'latency_budget_allocator', name: 'Latency Budget Allocator', module: 'NEXUS', description: 'Distribute latency budgets across pipeline stages dynamically', risk: 'low', reversible: true, category: 'operations' },
];

/** DREAM — Creative Autonomy (4) */
export const DREAM_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'lucid_dream_controller', name: 'Lucid Dream Controller', module: 'DREAM', description: 'Directed dream-state management for targeted insight generation', risk: 'medium', reversible: true, category: 'self-improvement' },
  { id: 'subconscious_scanner', name: 'Subconscious Scanner', module: 'DREAM', description: 'Background pattern mining across dormant knowledge stores', risk: 'low', reversible: true, category: 'self-improvement' },
  { id: 'dream_priority_ranker', name: 'Dream Priority Ranker', module: 'DREAM', description: 'Rank dream-generated insights by actionability and impact', risk: 'low', reversible: true, category: 'intelligence' },
  { id: 'nocturnal_archiver', name: 'Nocturnal Archiver', module: 'DREAM', description: 'Permanently archive verified dream outputs to long-term memory', risk: 'low', reversible: true, category: 'memory' },
];

/** DEFENSE — AI Safety (4) */
export const DEFENSE_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'prompt_injection_guard', name: 'Prompt Injection Guard', module: 'DEFENSE', description: 'Detect and neutralize prompt injection attempts in real-time', risk: 'low', reversible: true, category: 'security' },
  { id: 'data_poisoning_detector', name: 'Data Poisoning Detector', module: 'DEFENSE', description: 'Identify training data corruption and adversarial inputs', risk: 'medium', reversible: true, category: 'security' },
  { id: 'output_sanitizer', name: 'Output Sanitizer', module: 'DEFENSE', description: 'Sanitize AI outputs for PII, toxicity, and hallucination markers', risk: 'low', reversible: true, category: 'security' },
  { id: 'adversarial_probe', name: 'Adversarial Probe', module: 'DEFENSE', description: 'Automated adversarial testing against known attack vectors', risk: 'high', reversible: true, category: 'security' },
];

/** VISION — Observability (4) */
export const VISION_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'real_time_dashboard', name: 'Real-Time Dashboard', module: 'VISION', description: 'Live system visualization with streaming metric updates', risk: 'low', reversible: true, category: 'observability' },
  { id: 'metric_correlation_engine', name: 'Metric Correlation Engine', module: 'VISION', description: 'Correlate metrics across modules to identify causal chains', risk: 'low', reversible: true, category: 'intelligence' },
  { id: 'alert_fatigue_reducer', name: 'Alert Fatigue Reducer', module: 'VISION', description: 'Intelligent alert deduplication and severity consolidation', risk: 'low', reversible: true, category: 'observability' },
  { id: 'performance_baseline', name: 'Performance Baseline', module: 'VISION', description: 'Establish and track performance baselines with drift detection', risk: 'low', reversible: true, category: 'observability' },
];

/** INTEGRATION — Connector Intelligence (4) */
export const INTEGRATION_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'webhook_lifecycle_manager', name: 'Webhook Lifecycle Manager', module: 'INTEGRATION', description: 'Full webhook lifecycle — registration, retry, rotation, and expiry', risk: 'medium', reversible: true, category: 'integration' },
  { id: 'schema_migration_advisor', name: 'Schema Migration Advisor', module: 'INTEGRATION', description: 'Suggest and validate integration schema migrations', risk: 'medium', reversible: true, category: 'intelligence' },
  { id: 'api_versioning_manager', name: 'API Versioning Manager', module: 'INTEGRATION', description: 'Handle API version transitions with compatibility shims', risk: 'medium', reversible: true, category: 'integration' },
  { id: 'connector_health_monitor', name: 'Connector Health Monitor', module: 'INTEGRATION', description: 'Continuous health monitoring for all active integrations', risk: 'low', reversible: true, category: 'observability' },
];

// ============================================================================
// ADMINISTRATIVE LAYER
// ============================================================================

/** SYSTEM — Platform Operations (4) */
export const SYSTEM_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'resource_quota_enforcer', name: 'Resource Quota Enforcer', module: 'SYSTEM', description: 'Enforce resource quotas with graceful degradation on breach', risk: 'medium', reversible: true, category: 'operations' },
  { id: 'module_lifecycle_manager', name: 'Module Lifecycle Manager', module: 'SYSTEM', description: 'Manage module startup, shutdown, and restart sequences', risk: 'medium', reversible: true, category: 'operations' },
  { id: 'config_snapshot_manager', name: 'Config Snapshot Manager', module: 'SYSTEM', description: 'Versioned config snapshots with point-in-time rollback', risk: 'low', reversible: true, category: 'self-improvement' },
  { id: 'maintenance_window_scheduler', name: 'Maintenance Window Scheduler', module: 'SYSTEM', description: 'Schedule and coordinate maintenance windows across modules', risk: 'low', reversible: true, category: 'operations' },
];

/** EVOLUTION — Architecture Evolution (4) */
export const EVOLUTION_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'code_smell_detector', name: 'Code Smell Detector', module: 'EVOLUTION', description: 'Identify architectural anti-patterns and code smells', risk: 'low', reversible: true, category: 'self-improvement' },
  { id: 'refactor_planner', name: 'Refactor Planner', module: 'EVOLUTION', description: 'Plan safe refactoring sequences with dependency analysis', risk: 'medium', reversible: true, category: 'self-improvement' },
  { id: 'technical_debt_scorer', name: 'Technical Debt Scorer', module: 'EVOLUTION', description: 'Quantify technical debt by node with priority ranking', risk: 'low', reversible: true, category: 'self-improvement' },
  { id: 'migration_path_optimizer', name: 'Migration Path Optimizer', module: 'EVOLUTION', description: 'Find optimal migration routes with minimum disruption', risk: 'medium', reversible: true, category: 'self-improvement' },
];

/** INCLUSIVE — Universal Access (4) */
export const INCLUSIVE_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'cognitive_accessibility_scorer', name: 'Cognitive Accessibility Scorer', module: 'INCLUSIVE', description: 'Score content for cognitive accessibility (readability, complexity)', risk: 'low', reversible: true, category: 'accessibility' },
  { id: 'aria_auto_generator', name: 'ARIA Auto-Generator', module: 'INCLUSIVE', description: 'Generate ARIA labels and descriptions automatically from DOM context', risk: 'low', reversible: true, category: 'accessibility' },
  { id: 'color_contrast_optimizer', name: 'Color Contrast Optimizer', module: 'INCLUSIVE', description: 'Optimize color palette for WCAG contrast compliance', risk: 'low', reversible: true, category: 'accessibility' },
  { id: 'screen_reader_optimizer', name: 'Screen Reader Optimizer', module: 'INCLUSIVE', description: 'Optimize output structure for screen reader consumption', risk: 'low', reversible: true, category: 'accessibility' },
];

// ============================================================================
// ORCHESTRATOR LAYER
// ============================================================================

/** CORTEX — Autonomous Orchestration (4) */
export const CORTEX_HV_CAPABILITIES: HighValueCapability[] = [
  { id: 'autonomous_workflow_composer', name: 'Autonomous Workflow Composer', module: 'CORTEX', description: 'Compose complex workflows dynamically from capability primitives', risk: 'high', reversible: true, category: 'self-improvement' },
  { id: 'cross_agent_negotiator', name: 'Cross-Agent Negotiator', module: 'CORTEX', description: 'Negotiate resource allocation and task priority between agents', risk: 'medium', reversible: true, category: 'orchestration' },
  { id: 'priority_arbitrator', name: 'Priority Arbitrator', module: 'CORTEX', description: 'Resolve conflicting priorities using multi-criteria decision analysis', risk: 'medium', reversible: true, category: 'governance' },
  { id: 'execution_replay_analyzer', name: 'Execution Replay Analyzer', module: 'CORTEX', description: 'Analyze past execution replays to identify optimization paths', risk: 'low', reversible: true, category: 'self-improvement' },
];

// ============================================================================
// AGGREGATION
// ============================================================================

// Import v9.0.0 infrastructure + apex capabilities
import { ALL_INFRASTRUCTURE_CAPABILITIES, APEX_CAPABILITIES } from './high-value-v9';

export const ALL_HIGH_VALUE_CAPABILITIES: HighValueCapability[] = [
  ...CORE_HV_CAPABILITIES,
  ...RIPPLE_HV_CAPABILITIES,
  ...ACCESS_HV_CAPABILITIES,
  ...BRAIN_HV_CAPABILITIES,
  ...DECODE_HV_CAPABILITIES,
  ...NEXUS_HV_CAPABILITIES,
  ...DREAM_HV_CAPABILITIES,
  ...DEFENSE_HV_CAPABILITIES,
  ...VISION_HV_CAPABILITIES,
  ...INTEGRATION_HV_CAPABILITIES,
  ...SYSTEM_HV_CAPABILITIES,
  ...EVOLUTION_HV_CAPABILITIES,
  ...INCLUSIVE_HV_CAPABILITIES,
  ...CORTEX_HV_CAPABILITIES,
  ...ALL_INFRASTRUCTURE_CAPABILITIES,
  ...APEX_CAPABILITIES,
];

/** Total: 56 (v8.5.0) + 54 (v9.0.0 infra) + 21 (apex) = 131 new + 269 existing = 400 */
export const HV_CAPABILITY_COUNT = ALL_HIGH_VALUE_CAPABILITIES.length; // 131
export const TOTAL_CAPABILITIES_V850 = 269 + 56; // 325 (legacy reference)
export const TOTAL_CAPABILITIES_V900 = 269 + HV_CAPABILITY_COUNT; // 400

/** Get capabilities by module */
export function getHVCapabilitiesByModule(module: string): HighValueCapability[] {
  return ALL_HIGH_VALUE_CAPABILITIES.filter(c => c.module === module);
}

/** Get self-improvement capabilities (Enterprise-only) */
export function getSelfImprovementCapabilities(): HighValueCapability[] {
  return ALL_HIGH_VALUE_CAPABILITIES.filter(c => c.category === 'self-improvement');
}
