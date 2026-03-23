/**
 * Capability Auto-Activation Registry
 * 
 * Maps 50 substrate capabilities to precise event triggers.
 * Each entry defines: which capability activates, under what signal conditions,
 * which node owns it, and what priority/cooldown governs it.
 * 
 * Tiers:
 *   T1 — Critical (immediate, <100ms decision)
 *   T2 — Operational (fast, <500ms)
 *   T3 — Intelligence (background, <2s)
 *   T4 — Optimization (deferred, <5s)
 *   T5 — Autonomous (idle-triggered)
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ActivationTier = 'T1_CRITICAL' | 'T2_OPERATIONAL' | 'T3_INTELLIGENCE' | 'T4_OPTIMIZATION' | 'T5_AUTONOMOUS';

export interface ActivationTrigger {
  /** Source node that emits the triggering signal */
  sourceNode: string;
  /** Signal type to match (e.g. 'threat_detected', 'latency_spike') */
  signalType: string;
  /** Severity minimum to activate (0–10 scale, 0 = any) */
  minSeverity: number;
  /** Optional payload predicate for fine-grained matching */
  condition?: (payload: Record<string, unknown>) => boolean;
}

export interface CapabilityActivationRule {
  /** Unique rule ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** The capability ID to activate */
  capabilityId: string;
  /** Owning node */
  ownerNode: string;
  /** Activation tier */
  tier: ActivationTier;
  /** Trigger conditions */
  trigger: ActivationTrigger;
  /** Cooldown between activations (ms) */
  cooldownMs: number;
  /** Whether GOVERNANCE can override/block */
  governable: boolean;
  /** Description of what happens on activation */
  effect: string;
  /** Whether the rule is currently active */
  enabled: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 50 ACTIVATION RULES
// ═══════════════════════════════════════════════════════════════

export const ACTIVATION_RULES: CapabilityActivationRule[] = [

  // ────────────────────────────────────────────────────────────
  // T1 — CRITICAL (1–10): Immediate response, security & stability
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_001', name: 'Threat Neutralization',
    capabilityId: 'realtime_security_hardening', ownerNode: 'DEFENSE', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'defense', signalType: 'threat_detected', minSeverity: 7 },
    cooldownMs: 5_000, governable: false, enabled: true,
    effect: 'Engages kill-chain correlation and actor quarantine',
  },
  {
    id: 'ACT_002', name: 'Cascade Containment',
    capabilityId: 'fault_boundary_orchestrator', ownerNode: 'NERVE', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'nerve', signalType: 'cascade_detected', minSeverity: 8 },
    cooldownMs: 3_000, governable: false, enabled: true,
    effect: 'Activates cascade failure detector and isolation boundaries',
  },
  {
    id: 'ACT_003', name: 'Session Kill on Leakage',
    capabilityId: 'shd_shadow_session_killer', ownerNode: 'SHADOW', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'shadow', signalType: 'data_leakage', minSeverity: 9 },
    cooldownMs: 2_000, governable: false, enabled: true,
    effect: 'Immediately terminates compromised sessions and isolates actor',
  },
  {
    id: 'ACT_004', name: 'Zero-Day Shield',
    capabilityId: 'imm_zero_day_shield', ownerNode: 'IMMUNITY', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'defense', signalType: 'unknown_signature', minSeverity: 8 },
    cooldownMs: 5_000, governable: false, enabled: true,
    effect: 'Deploys behavioral analysis and signature-less threat blocking',
  },
  {
    id: 'ACT_005', name: 'Privilege Escalation Block',
    capabilityId: 'acc_privilege_escalation_blocker', ownerNode: 'ACCESS', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'access', signalType: 'privilege_escalation', minSeverity: 9 },
    cooldownMs: 1_000, governable: false, enabled: true,
    effect: 'Revokes elevated permissions and quarantines requesting identity',
  },
  {
    id: 'ACT_006', name: 'Privacy Budget Alarm',
    capabilityId: 'pht_differential_privacy_engine', ownerNode: 'PHANTOM', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'phantom', signalType: 'privacy_budget_exceeded', minSeverity: 8 },
    cooldownMs: 10_000, governable: true, enabled: true,
    effect: 'Halts data operations and re-calibrates noise injection thresholds',
  },
  {
    id: 'ACT_007', name: 'Circuit Breaker Trip',
    capabilityId: 'resilience_orchestration', ownerNode: 'NERVE', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'nerve', signalType: 'breaker_tripped', minSeverity: 7 },
    cooldownMs: 5_000, governable: false, enabled: true,
    effect: 'Engages predictive circuit breaker with Z-score trend analysis',
  },
  {
    id: 'ACT_008', name: 'Exfiltration Block',
    capabilityId: 'shd_exfiltration_detector', ownerNode: 'SHADOW', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'defense', signalType: 'exfiltration_attempt', minSeverity: 9 },
    cooldownMs: 2_000, governable: false, enabled: true,
    effect: 'Blocks outbound data channels and alerts governance',
  },
  {
    id: 'ACT_009', name: 'Sovereign Jurisdiction Lock',
    capabilityId: 'gov_emergency_lockdown', ownerNode: 'SOVEREIGN', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'sovereign', signalType: 'jurisdiction_violation', minSeverity: 8 },
    cooldownMs: 30_000, governable: false, enabled: true,
    effect: 'Enforces data residency rules and blocks cross-boundary transfers',
  },
  {
    id: 'ACT_010', name: 'Integrity Violation Response',
    capabilityId: 'aud_integrity_hash_verifier', ownerNode: 'AUDIT', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'audit', signalType: 'integrity_violation', minSeverity: 9 },
    cooldownMs: 5_000, governable: false, enabled: true,
    effect: 'Freezes affected data paths and initiates forensic chain verification',
  },

  // ────────────────────────────────────────────────────────────
  // T2 — OPERATIONAL (11–20): Fast infrastructure responses
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_011', name: 'Adaptive Route Optimization',
    capabilityId: 'nrv_service_mesh_optimizer', ownerNode: 'RELAY', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'relay', signalType: 'latency_spike', minSeverity: 5,
      condition: (p) => (p.latencyMs as number) > 500 },
    cooldownMs: 15_000, governable: true, enabled: true,
    effect: 'Re-scores routing adjacency matrix and redirects traffic',
  },
  {
    id: 'ACT_012', name: 'Backpressure Engagement',
    capabilityId: 'nrv_rate_adaptation_controller', ownerNode: 'NERVE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'nerve', signalType: 'queue_depth_warning', minSeverity: 6,
      condition: (p) => (p.depth as number) / (p.capacity as number) > 0.75 },
    cooldownMs: 10_000, governable: true, enabled: true,
    effect: 'Engages adaptive backpressure calibrator with EMA tuning',
  },
  {
    id: 'ACT_013', name: 'Self-Heal Trigger',
    capabilityId: 'eng_self_healing_orchestrator', ownerNode: 'MEDIC', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'medic', signalType: 'health_degraded', minSeverity: 6 },
    cooldownMs: 30_000, governable: true, enabled: true,
    effect: 'Initiates targeted repair sequence on degraded module',
  },
  {
    id: 'ACT_014', name: 'Cortex Load Shedding',
    capabilityId: 'intelligent_task_delegation', ownerNode: 'CORTEX', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'cortex', signalType: 'pipeline_overload', minSeverity: 6,
      condition: (p) => (p.queuedTasks as number) > 50 },
    cooldownMs: 20_000, governable: true, enabled: true,
    effect: 'Activates predictive load shedding and task redistribution',
  },
  {
    id: 'ACT_015', name: 'Dead Letter Recovery',
    capabilityId: 'nrv_signal_propagation_engine', ownerNode: 'NERVE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'nerve', signalType: 'dlq_threshold', minSeverity: 5,
      condition: (p) => (p.dlqSize as number) > 20 },
    cooldownMs: 60_000, governable: true, enabled: true,
    effect: 'Batch-retries eligible dead letters with exponential backoff',
  },
  {
    id: 'ACT_016', name: 'Provider Failover',
    capabilityId: 'graceful_degradation_chain', ownerNode: 'NEXUS', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'nexus', signalType: 'provider_down', minSeverity: 7 },
    cooldownMs: 10_000, governable: true, enabled: true,
    effect: 'Reranks provider health scores and reroutes to backup',
  },
  {
    id: 'ACT_017', name: 'Topology Self-Repair',
    capabilityId: 'eng_fleet_health_surveyor', ownerNode: 'NERVE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'nerve', signalType: 'topology_broken', minSeverity: 6 },
    cooldownMs: 30_000, governable: true, enabled: true,
    effect: 'Rebuilds communication topology and re-registers edges',
  },
  {
    id: 'ACT_018', name: 'Quota Burst Protection',
    capabilityId: 'quota_burst_predictor', ownerNode: 'ECONOMY', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'economy', signalType: 'quota_warning', minSeverity: 5,
      condition: (p) => (p.usagePercent as number) > 85 },
    cooldownMs: 60_000, governable: true, enabled: true,
    effect: 'Applies rate limiting and alerts on projected overage',
  },
  {
    id: 'ACT_019', name: 'Config Drift Correction',
    capabilityId: 'eng_engine_version_controller', ownerNode: 'SYSTEM', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'system', signalType: 'config_drift', minSeverity: 5 },
    cooldownMs: 120_000, governable: true, enabled: true,
    effect: 'Detects runtime config divergence and applies correction patches',
  },
  {
    id: 'ACT_020', name: 'Heartbeat Zombie Detection',
    capabilityId: 'eng_degradation_trend_detector', ownerNode: 'NERVE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'nerve', signalType: 'heartbeat_anomaly', minSeverity: 6 },
    cooldownMs: 30_000, governable: true, enabled: true,
    effect: 'Fingerprints zombie nodes and initiates recovery protocol',
  },

  // ────────────────────────────────────────────────────────────
  // T3 — INTELLIGENCE (21–30): Learning & predictive capabilities
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_021', name: 'Memory Tier Promotion',
    capabilityId: 'temporal_memory_scoring', ownerNode: 'MEMORY', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'memory', signalType: 'access_frequency_spike', minSeverity: 3,
      condition: (p) => (p.accessCount as number) > 10 },
    cooldownMs: 60_000, governable: true, enabled: true,
    effect: 'Promotes hot memories from Cold/Warm to Hot tier via EMA scoring',
  },
  {
    id: 'ACT_022', name: 'Anomaly Prediction',
    capabilityId: 'predictive_issue_prevention', ownerNode: 'ORACLE', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'oracle', signalType: 'pattern_anomaly', minSeverity: 4 },
    cooldownMs: 120_000, governable: true, enabled: true,
    effect: 'Runs Bayesian network prediction on detected anomaly patterns',
  },
  {
    id: 'ACT_023', name: 'Behavioral Drift Alert',
    capabilityId: 'behavioral_drift_detection', ownerNode: 'OBSERVER', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'observer', signalType: 'drift_detected', minSeverity: 4 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Analyzes behavioral baseline deviation and flags for review',
  },
  {
    id: 'ACT_024', name: 'Knowledge Graph Update',
    capabilityId: 'knowledge_graph_navigator', ownerNode: 'BRAIN', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'brain', signalType: 'new_knowledge_edge', minSeverity: 2 },
    cooldownMs: 60_000, governable: true, enabled: true,
    effect: 'Integrates new knowledge edges via Hebbian pathway strengthening',
  },
  {
    id: 'ACT_025', name: 'Mutation Shadow Testing',
    capabilityId: 'shd_shadow_run_orchestrator', ownerNode: 'SHADOW', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'evolution', signalType: 'mutation_proposed', minSeverity: 3 },
    cooldownMs: 120_000, governable: true, enabled: true,
    effect: 'Auto-shadows proposed mutations with A/B verdict scoring',
  },
  {
    id: 'ACT_026', name: 'Causal Inference Activation',
    capabilityId: 'systems_causal_analysis', ownerNode: 'BRAIN', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'nerve', signalType: 'correlation_detected', minSeverity: 4 },
    cooldownMs: 180_000, governable: true, enabled: true,
    effect: 'Runs Pearl causal hierarchy analysis on correlated signal chains',
  },
  {
    id: 'ACT_027', name: 'Context Enrichment Injection',
    capabilityId: 'context_aware_memory_recall', ownerNode: 'MEMORY', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'decode', signalType: 'context_gap', minSeverity: 3 },
    cooldownMs: 30_000, governable: true, enabled: true,
    effect: 'Augments conversation context with semantic memory retrieval',
  },
  {
    id: 'ACT_028', name: 'Skill Proficiency Boost',
    capabilityId: 'adaptive_learning_personalization', ownerNode: 'EVOLUTION', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'evolution', signalType: 'skill_gap_detected', minSeverity: 3 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Triggers focused CLM study sessions on weakest proficiency areas',
  },
  {
    id: 'ACT_029', name: 'Heuristic Refinement Cycle',
    capabilityId: 'continuous_improvement_engine', ownerNode: 'DREAM', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'dream', signalType: 'heuristic_stale', minSeverity: 3 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Consolidates recent execution data to refine decision heuristics',
  },
  {
    id: 'ACT_030', name: 'Semantic Similarity Reindex',
    capabilityId: 'semantic_similarity_ranker', ownerNode: 'BRAIN', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'memory', signalType: 'index_stale', minSeverity: 2 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Rebuilds cross-tier semantic index with updated FNV-1a hashes',
  },

  // ────────────────────────────────────────────────────────────
  // T4 — OPTIMIZATION (31–40): Background performance tuning
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_031', name: 'Provider Health Reranking',
    capabilityId: 'active_learning_triggers', ownerNode: 'NEXUS', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'nexus', signalType: 'health_check_complete', minSeverity: 0 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Recomputes provider reliability rankings from latest health data',
  },
  {
    id: 'ACT_032', name: 'Pipeline Bottleneck Analysis',
    capabilityId: 'priority_queue_optimizer', ownerNode: 'CORTEX', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'cortex', signalType: 'throughput_drop', minSeverity: 4 },
    cooldownMs: 120_000, governable: true, enabled: true,
    effect: 'Identifies critical path bottlenecks and reallocates resources',
  },
  {
    id: 'ACT_033', name: 'Resource Leak Detection',
    capabilityId: 'eng_resource_leak_detector', ownerNode: 'ENGINEER', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'system', signalType: 'memory_pressure', minSeverity: 5 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Scans for resource leaks and orphaned allocations',
  },
  {
    id: 'ACT_034', name: 'Technical Debt Quantification',
    capabilityId: 'eng_technical_debt_quantifier', ownerNode: 'ENGINEER', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'engineer', signalType: 'maintenance_window', minSeverity: 0 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Calculates and reports current technical debt metrics',
  },
  {
    id: 'ACT_035', name: 'SLA Compliance Check',
    capabilityId: 'eng_sla_compliance_tracker', ownerNode: 'TREATY', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'treaty', signalType: 'sla_check_due', minSeverity: 0 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Evaluates all active SLA constraints against current performance',
  },
  {
    id: 'ACT_036', name: 'Telemetry Aggregation Sweep',
    capabilityId: 'eng_telemetry_aggregator', ownerNode: 'ANALYTICS', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'analytics', signalType: 'aggregation_due', minSeverity: 0 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Compresses and aggregates raw telemetry into summary snapshots',
  },
  {
    id: 'ACT_037', name: 'Canary Deployment Validation',
    capabilityId: 'eng_canary_deployment_manager', ownerNode: 'ENGINEER', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'evolution', signalType: 'upgrade_deployed', minSeverity: 3 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Monitors canary metrics and auto-rolls-back on regression',
  },
  {
    id: 'ACT_038', name: 'Intent Amplification Tuning',
    capabilityId: 'intent_amplification', ownerNode: 'INTENT', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'intent', signalType: 'resolution_accuracy_drop', minSeverity: 4 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Re-calibrates intent routing weights based on recent accuracy data',
  },
  {
    id: 'ACT_039', name: 'Cross-Engine Impact Analysis',
    capabilityId: 'eng_cross_engine_impact_analyzer', ownerNode: 'ENGINEER', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'engineer', signalType: 'change_proposed', minSeverity: 3 },
    cooldownMs: 120_000, governable: true, enabled: true,
    effect: 'Simulates blast radius of proposed engine changes across modules',
  },
  {
    id: 'ACT_040', name: 'Compass Spatial Reindex',
    capabilityId: 'cmp_geospatial_query_optimizer', ownerNode: 'COMPASS', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'compass', signalType: 'spatial_index_stale', minSeverity: 2 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Rebuilds R-tree spatial index for optimal temporal-spatial queries',
  },

  // ────────────────────────────────────────────────────────────
  // T5 — AUTONOMOUS (41–50): Idle-triggered self-improvement
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_041', name: 'Dream Consolidation Cycle',
    capabilityId: 'memory_consolidation_engine', ownerNode: 'DREAM', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0 },
    cooldownMs: 1_800_000, governable: true, enabled: true,
    effect: 'Runs full sleep-cycle memory consolidation and dream synthesis',
  },
  {
    id: 'ACT_042', name: 'Evolution Fitness Sweep',
    capabilityId: 'evolution_confidence_scoring', ownerNode: 'EVOLUTION', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 60_000 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Evaluates all module fitness scores and proposes upgrade candidates',
  },
  {
    id: 'ACT_043', name: 'Forge Discovery Sweep',
    capabilityId: 'cross_domain_insight_synthesis', ownerNode: 'FORGE', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 120_000 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Explores combinatorial capability space for novel pipeline discoveries',
  },
  {
    id: 'ACT_044', name: 'Ethics Baseline Refresh',
    capabilityId: 'ethical_guardrails', ownerNode: 'CONSCIENCE', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 300_000 },
    cooldownMs: 7_200_000, governable: true, enabled: true,
    effect: 'Re-evaluates ethical constraint baselines against recent decisions',
  },
  {
    id: 'ACT_045', name: 'Echo Twin Synchronization',
    capabilityId: 'eco_digital_twin_simulator', ownerNode: 'ECHO', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'echo', signalType: 'twin_divergence', minSeverity: 3 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Resynchronizes digital twin state with live substrate metrics',
  },
  {
    id: 'ACT_046', name: 'Reflex Edge Calibration',
    capabilityId: 'rfx_edge_decision_optimizer', ownerNode: 'REFLEX', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'reflex', signalType: 'calibration_due', minSeverity: 0 },
    cooldownMs: 1_800_000, governable: true, enabled: true,
    effect: 'Re-calibrates edge computing decision thresholds from recent data',
  },
  {
    id: 'ACT_047', name: 'Lingua Translation Model Refresh',
    capabilityId: 'lng_translation_quality_scorer', ownerNode: 'LINGUA', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'lingua', signalType: 'translation_drift', minSeverity: 3 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Recalibrates translation quality scoring from accumulated feedback',
  },
  {
    id: 'ACT_048', name: 'Governance Policy Audit',
    capabilityId: 'gov_policy_compliance_auditor', ownerNode: 'GOVERNANCE', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 600_000 },
    cooldownMs: 7_200_000, governable: false, enabled: true,
    effect: 'Full governance policy sweep verifying all constraint satisfaction',
  },
  {
    id: 'ACT_049', name: 'Atlas Knowledge Map Refresh',
    capabilityId: 'atl_knowledge_map_enricher', ownerNode: 'ATLAS', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'atlas', signalType: 'map_stale', minSeverity: 2 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Rebuilds the global knowledge topology map with new discoveries',
  },
  {
    id: 'ACT_050', name: 'Harvest ETL Pipeline Optimization',
    capabilityId: 'hrv_etl_pipeline_optimizer', ownerNode: 'HARVEST', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'harvest', signalType: 'pipeline_inefficiency', minSeverity: 3 },
    cooldownMs: 1_800_000, governable: true, enabled: true,
    effect: 'Analyzes ETL pipeline bottlenecks and restructures data flow',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // WAVE 2 — 50 ADDITIONAL ACTIVATION RULES (ACT_051–ACT_100)
  // Strongest capabilities per node, reactive + scheduled
  // ════════════════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────
  // T1 — CRITICAL (51–58): Deep security & integrity
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_051', name: 'Immune Response Orchestration',
    capabilityId: 'imm_immune_response_orchestrator', ownerNode: 'IMMUNITY', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'immunity', signalType: 'pathogen_detected', minSeverity: 8 },
    cooldownMs: 5_000, governable: false, enabled: true,
    effect: 'Full immune response: isolate, neutralize, generate antibody rules',
  },
  {
    id: 'ACT_052', name: 'Quarantine Zone Activation',
    capabilityId: 'imm_quarantine_zone_manager', ownerNode: 'IMMUNITY', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'defense', signalType: 'infection_spreading', minSeverity: 9 },
    cooldownMs: 3_000, governable: false, enabled: true,
    effect: 'Isolates infected modules in quarantine zones with network fencing',
  },
  {
    id: 'ACT_053', name: 'Identity Theft Response',
    capabilityId: 'idn_identity_resolution_engine', ownerNode: 'IDENTITY', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'identity', signalType: 'identity_collision', minSeverity: 8 },
    cooldownMs: 5_000, governable: false, enabled: true,
    effect: 'Resolves identity conflicts and locks compromised credentials',
  },
  {
    id: 'ACT_054', name: 'Tamper Detection Alert',
    capabilityId: 'aud_tamper_detection_engine', ownerNode: 'AUDIT', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'audit', signalType: 'tamper_detected', minSeverity: 9 },
    cooldownMs: 2_000, governable: false, enabled: true,
    effect: 'Freezes audit chain, validates Merkle tree, preserves evidence',
  },
  {
    id: 'ACT_055', name: 'Outbreak Containment',
    capabilityId: 'imm_outbreak_containment_engine', ownerNode: 'IMMUNITY', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'immunity', signalType: 'outbreak_detected', minSeverity: 9,
      condition: (p) => (p.affectedNodes as number) >= 3 },
    cooldownMs: 5_000, governable: false, enabled: true,
    effect: 'Multi-node containment with propagation blocking and sentinel coordination',
  },
  {
    id: 'ACT_056', name: 'Governance Emergency Override',
    capabilityId: 'gov_governance_escalation_router', ownerNode: 'GOVERNANCE', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'governance', signalType: 'emergency_escalation', minSeverity: 9 },
    cooldownMs: 10_000, governable: false, enabled: true,
    effect: 'Escalates to highest governance authority with emergency powers',
  },
  {
    id: 'ACT_057', name: 'Fault Domain Isolation',
    capabilityId: 'nrv_fault_domain_isolator', ownerNode: 'NERVE', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'nerve', signalType: 'fault_domain_breach', minSeverity: 8 },
    cooldownMs: 5_000, governable: false, enabled: true,
    effect: 'Isolates fault domains to prevent cross-boundary failure propagation',
  },
  {
    id: 'ACT_058', name: 'Poison Message Quarantine',
    capabilityId: 'rly_poison_message_quarantiner', ownerNode: 'RELAY', tier: 'T1_CRITICAL',
    trigger: { sourceNode: 'relay', signalType: 'poison_message', minSeverity: 7 },
    cooldownMs: 3_000, governable: false, enabled: true,
    effect: 'Quarantines toxic messages, alerts origin node, preserves forensics',
  },

  // ────────────────────────────────────────────────────────────
  // T2 — OPERATIONAL (59–70): Infrastructure intelligence
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_059', name: 'Graceful Shutdown Orchestration',
    capabilityId: 'nrv_graceful_shutdown_orchestrator', ownerNode: 'NERVE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'system', signalType: 'shutdown_requested', minSeverity: 5 },
    cooldownMs: 30_000, governable: true, enabled: true,
    effect: 'Drains in-flight signals, persists state, coordinates ordered node shutdown',
  },
  {
    id: 'ACT_060', name: 'Relay Failover Engagement',
    capabilityId: 'rly_relay_failover_manager', ownerNode: 'RELAY', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'relay', signalType: 'channel_down', minSeverity: 7 },
    cooldownMs: 10_000, governable: true, enabled: true,
    effect: 'Activates backup relay channels and reroutes message traffic',
  },
  {
    id: 'ACT_061', name: 'Warm Standby Activation',
    capabilityId: 'nrv_warm_standby_manager', ownerNode: 'NERVE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'nerve', signalType: 'primary_degraded', minSeverity: 6 },
    cooldownMs: 30_000, governable: true, enabled: true,
    effect: 'Promotes warm standby nodes to active and begins state sync',
  },
  {
    id: 'ACT_062', name: 'Traffic Shaping Engagement',
    capabilityId: 'nrv_traffic_shaping_engine', ownerNode: 'NERVE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'nerve', signalType: 'traffic_burst', minSeverity: 5,
      condition: (p) => (p.burstRatio as number) > 3.0 },
    cooldownMs: 15_000, governable: true, enabled: true,
    effect: 'Shapes traffic with priority queuing and burst absorption',
  },
  {
    id: 'ACT_063', name: 'Connection Pool Recovery',
    capabilityId: 'nrv_connection_pool_guardian', ownerNode: 'NERVE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'nerve', signalType: 'pool_exhaustion', minSeverity: 6 },
    cooldownMs: 20_000, governable: true, enabled: true,
    effect: 'Evicts stale connections, expands pool, applies health checks',
  },
  {
    id: 'ACT_064', name: 'Retry Budget Enforcement',
    capabilityId: 'nrv_retry_budget_manager', ownerNode: 'NERVE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'nerve', signalType: 'retry_storm', minSeverity: 6,
      condition: (p) => (p.retryRate as number) > 50 },
    cooldownMs: 30_000, governable: true, enabled: true,
    effect: 'Caps retry budgets to prevent thundering herd and cascading retries',
  },
  {
    id: 'ACT_065', name: 'Fan-Out Coordination',
    capabilityId: 'rly_fan_out_coordinator', ownerNode: 'RELAY', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'cortex', signalType: 'broadcast_requested', minSeverity: 3 },
    cooldownMs: 10_000, governable: true, enabled: true,
    effect: 'Coordinates multi-target message delivery with backpressure awareness',
  },
  {
    id: 'ACT_066', name: 'Self-Healing Trigger',
    capabilityId: 'imm_self_healing_trigger', ownerNode: 'IMMUNITY', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'medic', signalType: 'repair_needed', minSeverity: 5 },
    cooldownMs: 60_000, governable: true, enabled: true,
    effect: 'Triggers immune-system self-healing with recovery playbooks',
  },
  {
    id: 'ACT_067', name: 'Consumer Group Rebalance',
    capabilityId: 'rly_consumer_group_balancer', ownerNode: 'RELAY', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'relay', signalType: 'consumer_imbalance', minSeverity: 4 },
    cooldownMs: 60_000, governable: true, enabled: true,
    effect: 'Rebalances message consumer groups for even load distribution',
  },
  {
    id: 'ACT_068', name: 'Engine Graceful Restart',
    capabilityId: 'eng_restart_engine', ownerNode: 'ENGINEER', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'engineer', signalType: 'engine_unresponsive', minSeverity: 7 },
    cooldownMs: 60_000, governable: true, enabled: true,
    effect: 'Gracefully restarts unresponsive engine with state preservation',
  },
  {
    id: 'ACT_069', name: 'Schema Evolution Management',
    capabilityId: 'enc_schema_evolution_manager', ownerNode: 'ENCODE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'encode', signalType: 'schema_mismatch', minSeverity: 5 },
    cooldownMs: 120_000, governable: true, enabled: true,
    effect: 'Manages schema migration with backward compatibility validation',
  },
  {
    id: 'ACT_070', name: 'Incident Response Automation',
    capabilityId: 'incident_response_automator', ownerNode: 'DEFENSE', tier: 'T2_OPERATIONAL',
    trigger: { sourceNode: 'defense', signalType: 'incident_declared', minSeverity: 6 },
    cooldownMs: 30_000, governable: true, enabled: true,
    effect: 'Executes automated incident response playbook with stakeholder notification',
  },

  // ────────────────────────────────────────────────────────────
  // T3 — INTELLIGENCE (71–82): Deep cognitive capabilities
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_071', name: 'Latent Pattern Extraction',
    capabilityId: 'latent_pattern_extractor', ownerNode: 'DREAM', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'brain', signalType: 'pattern_cluster_found', minSeverity: 3 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Extracts latent patterns from accumulated signal clusters for new insights',
  },
  {
    id: 'ACT_072', name: 'Scenario Simulation Launch',
    capabilityId: 'scenario_simulation_engine', ownerNode: 'ORACLE', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'oracle', signalType: 'forecast_divergence', minSeverity: 4 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Runs Monte Carlo simulations on divergent forecasts to bound uncertainty',
  },
  {
    id: 'ACT_073', name: 'Bias Detection Scan',
    capabilityId: 'bias_detection_scanner', ownerNode: 'CONSCIENCE', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'conscience', signalType: 'fairness_drift', minSeverity: 4 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Scans recent decisions for systematic bias patterns and flags for review',
  },
  {
    id: 'ACT_074', name: 'Threat Intelligence Aggregation',
    capabilityId: 'imm_threat_intelligence_aggregator', ownerNode: 'IMMUNITY', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'defense', signalType: 'new_threat_intel', minSeverity: 3 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Aggregates threat intelligence from defense signals into immune memory bank',
  },
  {
    id: 'ACT_075', name: 'Anomaly Root Cause Analysis',
    capabilityId: 'anl_anomaly_root_cause_finder', ownerNode: 'ANALYTICS', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'analytics', signalType: 'anomaly_cluster', minSeverity: 5 },
    cooldownMs: 120_000, governable: true, enabled: true,
    effect: 'Traces anomaly clusters to root causes via causal graph traversal',
  },
  {
    id: 'ACT_076', name: 'Immune Learning Cycle',
    capabilityId: 'imm_immune_learning_engine', ownerNode: 'IMMUNITY', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'immunity', signalType: 'threat_resolved', minSeverity: 2 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Learns from resolved threats to strengthen future immune responses',
  },
  {
    id: 'ACT_077', name: 'Predictive Model Recalibration',
    capabilityId: 'predictive_model_calibrator', ownerNode: 'ORACLE', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'oracle', signalType: 'prediction_error_high', minSeverity: 4,
      condition: (p) => (p.errorRate as number) > 0.15 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Recalibrates Bayesian prediction models using recent outcome data',
  },
  {
    id: 'ACT_078', name: 'Metric Correlation Discovery',
    capabilityId: 'anl_metric_correlation_discoverer', ownerNode: 'ANALYTICS', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'analytics', signalType: 'new_data_batch', minSeverity: 2,
      condition: (p) => (p.batchSize as number) > 100 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Discovers hidden correlations between system metrics for new insights',
  },
  {
    id: 'ACT_079', name: 'Creative Mutation Generation',
    capabilityId: 'creative_mutation_generator', ownerNode: 'FORGE', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'evolution', signalType: 'stagnation_detected', minSeverity: 3 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Generates creative capability mutations to break evolutionary stagnation',
  },
  {
    id: 'ACT_080', name: 'Data Lineage Tracking',
    capabilityId: 'aud_data_lineage_tracker', ownerNode: 'AUDIT', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'audit', signalType: 'lineage_gap', minSeverity: 4 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Traces data provenance chains to fill lineage gaps and ensure traceability',
  },
  {
    id: 'ACT_081', name: 'Forecast Confidence Scoring',
    capabilityId: 'forecast_confidence_scorer', ownerNode: 'ORACLE', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'oracle', signalType: 'forecast_generated', minSeverity: 0 },
    cooldownMs: 120_000, governable: true, enabled: true,
    effect: 'Scores forecast reliability using historical accuracy and model uncertainty',
  },
  {
    id: 'ACT_082', name: 'Behavioral Baseline Rebuild',
    capabilityId: 'imm_behavioral_baseline_builder', ownerNode: 'IMMUNITY', tier: 'T3_INTELLIGENCE',
    trigger: { sourceNode: 'immunity', signalType: 'baseline_stale', minSeverity: 2 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Rebuilds behavioral baselines from recent traffic patterns for anomaly detection',
  },

  // ────────────────────────────────────────────────────────────
  // T4 — OPTIMIZATION (83–92): Background performance intelligence
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_083', name: 'Attack Surface Mapping',
    capabilityId: 'attack_surface_mapper', ownerNode: 'DEFENSE', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'defense', signalType: 'surface_scan_due', minSeverity: 0 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Maps complete attack surface and identifies newly exposed vectors',
  },
  {
    id: 'ACT_084', name: 'Policy Conflict Detection',
    capabilityId: 'gov_policy_conflict_detector', ownerNode: 'GOVERNANCE', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'governance', signalType: 'policy_updated', minSeverity: 2 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Scans for conflicting governance policies after updates and flags contradictions',
  },
  {
    id: 'ACT_085', name: 'Permission Graph Audit',
    capabilityId: 'idn_permission_graph_navigator', ownerNode: 'IDENTITY', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'identity', signalType: 'permission_audit_due', minSeverity: 0 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Traverses permission graph to detect over-privileged paths and orphan grants',
  },
  {
    id: 'ACT_086', name: 'Relay Topology Optimization',
    capabilityId: 'rly_relay_topology_optimizer', ownerNode: 'RELAY', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'relay', signalType: 'topology_suboptimal', minSeverity: 3 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Restructures relay topology for minimal latency and maximal throughput',
  },
  {
    id: 'ACT_087', name: 'Encoding Performance Profile',
    capabilityId: 'enc_encoding_performance_profiler', ownerNode: 'ENCODE', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'encode', signalType: 'encoding_slow', minSeverity: 4 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Profiles encoding pipeline bottlenecks and recommends codec optimizations',
  },
  {
    id: 'ACT_088', name: 'Dynamic Pricing Adjustment',
    capabilityId: 'eco_dynamic_pricing_engine', ownerNode: 'ECONOMY', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'economy', signalType: 'demand_shift', minSeverity: 3 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Adjusts pricing models based on demand elasticity and capacity utilization',
  },
  {
    id: 'ACT_089', name: 'Compliance Gap Analysis',
    capabilityId: 'gov_compliance_gap_analyzer', ownerNode: 'GOVERNANCE', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'governance', signalType: 'regulation_change', minSeverity: 3 },
    cooldownMs: 600_000, governable: true, enabled: true,
    effect: 'Identifies compliance gaps from regulatory changes and generates remediation plans',
  },
  {
    id: 'ACT_090', name: 'Data Quality Scoring',
    capabilityId: 'data_quality_scorer', ownerNode: 'HARVEST', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'harvest', signalType: 'ingestion_complete', minSeverity: 0 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Scores freshly ingested data for completeness, accuracy, and consistency',
  },
  {
    id: 'ACT_091', name: 'Simulation Drift Correction',
    capabilityId: 'simulation_drift_detector', ownerNode: 'ECHO', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'echo', signalType: 'simulation_drift', minSeverity: 4 },
    cooldownMs: 300_000, governable: true, enabled: true,
    effect: 'Detects and corrects drift between digital twin simulations and live state',
  },
  {
    id: 'ACT_092', name: 'Preventive Maintenance Scheduling',
    capabilityId: 'eng_preventive_maintenance_scheduler', ownerNode: 'ENGINEER', tier: 'T4_OPTIMIZATION',
    trigger: { sourceNode: 'engineer', signalType: 'decay_threshold_crossed', minSeverity: 3 },
    cooldownMs: 1_800_000, governable: true, enabled: true,
    effect: 'Schedules preventive maintenance based on EMA decay projections',
  },

  // ────────────────────────────────────────────────────────────
  // T5 — AUTONOMOUS (93–100): Deep self-improvement cycles
  // ────────────────────────────────────────────────────────────

  {
    id: 'ACT_093', name: 'Nocturnal Optimization Run',
    capabilityId: 'nocturnal_optimization_runner', ownerNode: 'DREAM', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 180_000 },
    cooldownMs: 7_200_000, governable: true, enabled: true,
    effect: 'Runs full nocturnal optimization: defragmentation, index rebuilds, cache warming',
  },
  {
    id: 'ACT_094', name: 'Resilience Stress Testing',
    capabilityId: 'imm_resilience_stress_tester', ownerNode: 'IMMUNITY', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 600_000 },
    cooldownMs: 7_200_000, governable: true, enabled: true,
    effect: 'Runs chaos-engineering stress tests against immune defenses during idle',
  },
  {
    id: 'ACT_095', name: 'Orphan Account Cleanup',
    capabilityId: 'idn_orphan_account_detector', ownerNode: 'IDENTITY', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 300_000 },
    cooldownMs: 7_200_000, governable: true, enabled: true,
    effect: 'Scans for orphaned accounts, expired tokens, and stale sessions for cleanup',
  },
  {
    id: 'ACT_096', name: 'Artifact Recombination Discovery',
    capabilityId: 'artifact_recombination_engine', ownerNode: 'FORGE', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 240_000 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Recombines existing artifacts to discover novel capability compositions',
  },
  {
    id: 'ACT_097', name: 'Immune Strength Assessment',
    capabilityId: 'imm_immune_strength_scorer', ownerNode: 'IMMUNITY', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 120_000 },
    cooldownMs: 3_600_000, governable: true, enabled: true,
    effect: 'Comprehensive immune strength assessment across all defense layers',
  },
  {
    id: 'ACT_098', name: 'Control Effectiveness Audit',
    capabilityId: 'aud_control_effectiveness_scorer', ownerNode: 'AUDIT', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 600_000 },
    cooldownMs: 7_200_000, governable: true, enabled: true,
    effect: 'Scores effectiveness of all security controls and flags degraded ones',
  },
  {
    id: 'ACT_099', name: 'Idea Incubation Cycle',
    capabilityId: 'idea_incubation_scheduler', ownerNode: 'DREAM', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 900_000 },
    cooldownMs: 7_200_000, governable: true, enabled: true,
    effect: 'Incubates promising but unvalidated ideas from the discovery pipeline',
  },
  {
    id: 'ACT_100', name: 'Cross-Domain Policy Harmonization',
    capabilityId: 'gov_cross_domain_policy_harmonizer', ownerNode: 'GOVERNANCE', tier: 'T5_AUTONOMOUS',
    trigger: { sourceNode: 'system', signalType: 'idle_detected', minSeverity: 0,
      condition: (p) => (p.idleDurationMs as number) > 600_000 },
    cooldownMs: 7_200_000, governable: true, enabled: true,
    effect: 'Harmonizes policies across governance domains to eliminate contradictions',
  },
];

// ═══════════════════════════════════════════════════════════════
// REGISTRY HELPERS
// ═══════════════════════════════════════════════════════════════

const ruleMap = new Map<string, CapabilityActivationRule>();
for (const rule of ACTIVATION_RULES) ruleMap.set(rule.id, rule);

export function getRule(id: string): CapabilityActivationRule | null {
  return ruleMap.get(id) ?? null;
}

export function getRulesByTier(tier: ActivationTier): CapabilityActivationRule[] {
  return ACTIVATION_RULES.filter(r => r.tier === tier);
}

export function getRulesForNode(node: string): CapabilityActivationRule[] {
  const lower = node.toLowerCase();
  return ACTIVATION_RULES.filter(r =>
    r.ownerNode.toLowerCase() === lower ||
    r.trigger.sourceNode === lower
  );
}

export function getEnabledRules(): CapabilityActivationRule[] {
  return ACTIVATION_RULES.filter(r => r.enabled);
}

export function getRegistryStats() {
  const tiers: Record<ActivationTier, number> = {
    T1_CRITICAL: 0, T2_OPERATIONAL: 0, T3_INTELLIGENCE: 0,
    T4_OPTIMIZATION: 0, T5_AUTONOMOUS: 0,
  };
  for (const r of ACTIVATION_RULES) tiers[r.tier]++;
  return {
    totalRules: ACTIVATION_RULES.length,
    enabledRules: ACTIVATION_RULES.filter(r => r.enabled).length,
    governableRules: ACTIVATION_RULES.filter(r => r.governable).length,
    byTier: tiers,
  };
}
