/**
 * CLM Node Priorities — Top 2 CLM-derived capabilities for all 40 matrix nodes
 * Each node's highest-priority learning topics translated into registered capabilities.
 * These represent what each node WANTS most from its Constant Learning Mode.
 * 
 * Generation 1 = original core learning nodes
 * Generation 2 = expansion and governance nodes added later
 */

type RegisterCapabilityFn = (
  module: string,
  capability: string,
  priority?: number,
) => void;

// ─── Priority Definitions ───────────────────────────────────────────────────

export interface CLMPriority {
  node: string;
  displayName: string;
  sector: string;
  priorities: [
    { capability: string; description: string; priority: number },
    { capability: string; description: string; priority: number },
  ];
  acknowledged: boolean;
  /** Generation 1 = original learning nodes, Generation 2 = recently created nodes */
  generation: 1 | 2;
}

export const NODE_CLM_PRIORITIES: CLMPriority[] = [
  // ═══════ CORE + SYSTEM ═══════════════════════════════════════════════════
  {
    node: 'core', displayName: 'CORE', sector: 'CORE',
    priorities: [
      { capability: 'clm_scheduler_optimization', description: 'Task prioritization and lifecycle management optimization', priority: 92 },
      { capability: 'clm_mesh_intent_composition', description: 'Broadcast richer intents to the capability mesh', priority: 88 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'system', displayName: 'SYSTEM', sector: 'SYSTEM',
    priorities: [
      { capability: 'clm_health_check_design', description: 'Deep vs shallow checks with cascading health detection', priority: 91 },
      { capability: 'clm_incident_detection', description: 'Anomaly thresholds, correlation, and root cause analysis', priority: 88 },
    ],
    acknowledged: true, generation: 1,
  },

  // ═══════ CCR Zone ═══════════════════════════════════════════════════════
  {
    node: 'brain', displayName: 'BRAIN', sector: 'CCR',
    priorities: [
      { capability: 'clm_memory_tiering_strategy', description: 'Hot/warm/cold promotion and demotion strategies', priority: 92 },
      { capability: 'clm_knowledge_graph_density', description: 'Triple extraction and relationship scoring', priority: 89 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'memory', displayName: 'MEMORY', sector: 'CCR',
    priorities: [
      { capability: 'clm_vector_embedding_lifecycle', description: 'Vector embedding creation, indexing, and retirement', priority: 90 },
      { capability: 'clm_rag_pipeline_optimization', description: 'Retrieval-augmented generation pipeline tuning', priority: 87 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'dream', displayName: 'DREAM', sector: 'CCR',
    priorities: [
      { capability: 'clm_offpeak_pattern_analysis', description: 'Off-peak pattern analysis and consolidation', priority: 88 },
      { capability: 'clm_memory_consolidation_strategy', description: 'Memory consolidation during low-activity periods', priority: 85 },
    ],
    acknowledged: true, generation: 1,
  },

  // ═══════ OCG Zone ═══════════════════════════════════════════════════════
  {
    node: 'ripple', displayName: 'RIPPLE', sector: 'OCG',
    priorities: [
      { capability: 'clm_webhook_reliability', description: 'Retry strategies, dead letter queues, and idempotency', priority: 91 },
      { capability: 'clm_event_driven_architecture', description: 'Pub/sub patterns and event sourcing', priority: 87 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'access', displayName: 'ACCESS', sector: 'OCG',
    priorities: [
      { capability: 'clm_auth_flow_optimization', description: 'Token refresh, session management, and MFA flows', priority: 91 },
      { capability: 'clm_rls_policy_design', description: 'Least privilege, row ownership, and role hierarchies', priority: 88 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'identity', displayName: 'IDENTITY', sector: 'OCG',
    priorities: [
      { capability: 'clm_actor_attribution', description: 'Precise actor attribution across sessions and devices', priority: 90 },
      { capability: 'clm_passkey_management', description: 'Passkey lifecycle, rotation, and cross-platform support', priority: 86 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'relay', displayName: 'RELAY', sector: 'OCG',
    priorities: [
      { capability: 'clm_delivery_guarantees', description: 'Webhook delivery guarantees with exactly-once semantics', priority: 89 },
      { capability: 'clm_retry_strategies', description: 'Exponential backoff, jitter, and dead letter handling', priority: 86 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'audit', displayName: 'AUDIT', sector: 'OCG',
    priorities: [
      { capability: 'clm_hash_chain_integrity', description: 'Merkle chain validation and tamper detection', priority: 91 },
      { capability: 'clm_compliance_reporting', description: 'Automated compliance report generation', priority: 87 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'nerve', displayName: 'NERVE', sector: 'OCG',
    priorities: [
      { capability: 'clm_signal_propagation_optimization', description: 'Minimize inter-node signal latency and hops', priority: 91 },
      { capability: 'clm_consensus_repair_protocol', description: 'Quorum-based consensus repair for split-brain scenarios', priority: 87 },
    ],
    acknowledged: true, generation: 2,
  },

  // ═══════ Execution Sector ═══════════════════════════════════════════════
  {
    node: 'decode', displayName: 'DECODE', sector: 'Execution',
    priorities: [
      { capability: 'clm_conversational_fluency', description: 'Natural language understanding and intent classification', priority: 92 },
      { capability: 'clm_user_recognition', description: 'Identity persistence, preference recall, personality adaptation', priority: 89 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'encode', displayName: 'ENCODE', sector: 'Execution',
    priorities: [
      { capability: 'clm_typescript_mastery', description: 'Branded types, discriminated unions, template literals', priority: 92 },
      { capability: 'clm_react_excellence', description: 'Hook composition, render optimization, Suspense patterns', priority: 89 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'vision', displayName: 'VISION', sector: 'Execution',
    priorities: [
      { capability: 'clm_dashboard_design', description: 'Real-time data visualization best practices', priority: 90 },
      { capability: 'clm_anomaly_detection_methods', description: 'Statistical methods, threshold tuning, and alerting', priority: 88 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'cortex', displayName: 'CORTEX', sector: 'Execution',
    priorities: [
      { capability: 'clm_pipeline_orchestration_optimization', description: 'Parallel vs sequential vs staged execution strategies', priority: 91 },
      { capability: 'clm_module_coordination', description: 'Dependency resolution and deadlock prevention', priority: 88 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'nexus', displayName: 'NEXUS', sector: 'Execution',
    priorities: [
      { capability: 'clm_cost_arbitrage', description: 'Model selection by task complexity and cost curves', priority: 93 },
      { capability: 'clm_cache_optimization', description: 'Semantic caching, TTL strategies, and invalidation', priority: 89 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'economy', displayName: 'ECONOMY', sector: 'Execution',
    priorities: [
      { capability: 'clm_cost_attribution_accuracy', description: 'Per-request cost attribution across providers', priority: 89 },
      { capability: 'clm_budget_enforcement', description: 'Hard caps, soft warnings, and predictive overage alerts', priority: 86 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'sandbox', displayName: 'SANDBOX', sector: 'Execution',
    priorities: [
      { capability: 'clm_isolation_guarantees', description: 'Process isolation, memory fencing, and side-effect prevention', priority: 91 },
      { capability: 'clm_execution_safety', description: 'Timeout enforcement, resource caps, and escape detection', priority: 88 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'inclusive', displayName: 'INCLUSIVE', sector: 'Execution',
    priorities: [
      { capability: 'clm_wcag_coverage', description: 'WCAG 2.2 AA/AAA success criteria coverage gaps', priority: 90 },
      { capability: 'clm_autofix_strategies', description: 'DOM manipulation, ARIA injection, color contrast fixes', priority: 87 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'medic', displayName: 'MEDIC', sector: 'Execution',
    priorities: [
      { capability: 'clm_self_diagnostics', description: 'Deep module health introspection and root cause isolation', priority: 91 },
      { capability: 'clm_predictive_failure_analysis', description: 'Anticipate failures before they occur via trend analysis', priority: 88 },
    ],
    acknowledged: true, generation: 2,
  },
  {
    node: 'integration', displayName: 'INTEGRATION', sector: 'Execution',
    priorities: [
      { capability: 'clm_adapter_reliability', description: 'Adapter uptime, retry patterns, and health monitoring', priority: 89 },
      { capability: 'clm_enterprise_sync', description: 'Enterprise system synchronization and conflict resolution', priority: 86 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'modernizer', displayName: 'MODERNIZER', sector: 'Execution',
    priorities: [
      { capability: 'clm_legacy_migration_patterns', description: 'Safe legacy-to-modern migration strategies with rollback', priority: 88 },
      { capability: 'clm_api_versioning_strategy', description: 'Semver enforcement, deprecation schedules, and sunset policies', priority: 85 },
    ],
    acknowledged: true, generation: 1,
  },

  // ═══════ ESZ — Expansion Sovereignty Zone ═══════════════════════════════
  {
    node: 'sovereign', displayName: 'SOVEREIGN', sector: 'ESZ',
    priorities: [
      { capability: 'clm_data_residency_enforcement', description: 'Jurisdiction-aware data routing and storage compliance', priority: 91 },
      { capability: 'clm_regulatory_adaptation', description: 'Auto-adapt to changing regulatory frameworks (GDPR, CCPA, etc)', priority: 88 },
    ],
    acknowledged: true, generation: 2,
  },
  {
    node: 'oracle', displayName: 'ORACLE', sector: 'ESZ',
    priorities: [
      { capability: 'clm_bayesian_calibration', description: 'Bayesian model calibration and confidence interval tuning', priority: 90 },
      { capability: 'clm_scenario_planning', description: 'Multi-scenario simulation with branching probability trees', priority: 87 },
    ],
    acknowledged: true, generation: 2,
  },
  {
    node: 'conscience', displayName: 'CONSCIENCE', sector: 'ESZ',
    priorities: [
      { capability: 'clm_bias_detection_training', description: 'Statistical and contextual bias detection in AI outputs', priority: 90 },
      { capability: 'clm_ethical_impact_scoring', description: 'Quantified ethical impact assessment for system actions', priority: 87 },
    ],
    acknowledged: true, generation: 2,
  },
  {
    node: 'treaty', displayName: 'TREATY', sector: 'ESZ',
    priorities: [
      { capability: 'clm_contract_lifecycle', description: 'SLA creation, monitoring, breach detection, and renewal', priority: 88 },
      { capability: 'clm_negotiation_protocols', description: 'Automated multi-party agreement negotiation', priority: 84 },
    ],
    acknowledged: true, generation: 2,
  },

  // ═══════ EPZ — Expansion Perception Zone ════════════════════════════════
  {
    node: 'compass', displayName: 'COMPASS', sector: 'EPZ',
    priorities: [
      { capability: 'clm_geospatial_intelligence', description: 'Geospatial analysis for latency-optimized routing', priority: 85 },
      { capability: 'clm_regional_risk_mapping', description: 'Risk scoring by geographic region and infrastructure', priority: 82 },
    ],
    acknowledged: true, generation: 2,
  },
  {
    node: 'echo', displayName: 'ECHO', sector: 'EPZ',
    priorities: [
      { capability: 'clm_digital_twin_fidelity', description: 'Digital twin synchronization accuracy and drift detection', priority: 88 },
      { capability: 'clm_scenario_replay', description: 'Historical scenario replay for regression validation', priority: 85 },
    ],
    acknowledged: true, generation: 2,
  },
  {
    node: 'reflex', displayName: 'REFLEX', sector: 'EPZ',
    priorities: [
      { capability: 'clm_edge_orchestration', description: 'Sub-millisecond edge decision routing', priority: 91 },
      { capability: 'clm_low_latency_decisions', description: 'Pre-computed decision trees for critical-path responses', priority: 88 },
    ],
    acknowledged: true, generation: 2,
  },

  // ═══════ EMZ — Expansion Manufacturing Zone ════════════════════════════
  {
    node: 'forge', displayName: 'FORGE', sector: 'EMZ',
    priorities: [
      { capability: 'clm_artifact_synthesis', description: 'Template-driven artifact generation with quality gates', priority: 88 },
      { capability: 'clm_template_generation', description: 'Parameterized template creation from production patterns', priority: 85 },
    ],
    acknowledged: true, generation: 2,
  },
  {
    node: 'lingua', displayName: 'LINGUA', sector: 'EMZ',
    priorities: [
      { capability: 'clm_translation_accuracy', description: 'Context-aware translation with domain-specific glossaries', priority: 88 },
      { capability: 'clm_localization_coverage', description: 'Automated locale coverage tracking and gap analysis', priority: 84 },
    ],
    acknowledged: true, generation: 2,
  },
  {
    node: 'harvest', displayName: 'HARVEST', sector: 'EMZ',
    priorities: [
      { capability: 'clm_data_acquisition_strategy', description: 'Source discovery, validation, and ingestion pipelines', priority: 88 },
      { capability: 'clm_etl_optimization', description: 'Extract-transform-load pipeline performance tuning', priority: 85 },
    ],
    acknowledged: true, generation: 2,
  },

  // ═══════ CSZ — Cognitive Shadow Zone ════════════════════════════════════
  {
    node: 'evolution', displayName: 'EVOLUTION', sector: 'CSZ',
    priorities: [
      { capability: 'clm_shadow_validation', description: 'Safe code evolution via shadow-apply and canary deployment', priority: 89 },
      { capability: 'clm_regression_detection', description: 'Behavioral testing and snapshot comparison for regressions', priority: 86 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'shadow', displayName: 'SHADOW', sector: 'CSZ',
    priorities: [
      { capability: 'clm_shadow_execution_fidelity', description: 'High-fidelity shadow execution without production side-effects', priority: 90 },
      { capability: 'clm_divergence_analysis', description: 'Shadow vs production output comparison and scoring', priority: 87 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'phantom', displayName: 'PHANTOM', sector: 'CSZ',
    priorities: [
      { capability: 'clm_pii_masking_accuracy', description: 'PII detection and masking with zero false negatives', priority: 91 },
      { capability: 'clm_differential_privacy', description: 'Statistical noise injection for privacy-preserving analytics', priority: 87 },
    ],
    acknowledged: true, generation: 2,
  },

  // ═══════ Fields ═════════════════════════════════════════════════════════
  {
    node: 'immunity', displayName: 'IMMUNITY', sector: 'Fields',
    priorities: [
      { capability: 'clm_cascade_breaking_strategy', description: 'Cascade failure isolation and circuit breaker optimization', priority: 92 },
      { capability: 'clm_anomaly_signature_training', description: 'Immune signature database expansion from novel threats', priority: 88 },
    ],
    acknowledged: true, generation: 1,
  },
  {
    node: 'intent', displayName: 'INTENT', sector: 'Fields',
    priorities: [
      { capability: 'clm_goal_decomposition', description: 'Compound intent breakdown into atomic sub-intents', priority: 89 },
      { capability: 'clm_capability_mesh_routing', description: 'Optimal capability-to-node routing via the intent mesh', priority: 86 },
    ],
    acknowledged: true, generation: 1,
  },

  // ═══════ Plane ══════════════════════════════════════════════════════════
  {
    node: 'governance', displayName: 'GOVERNANCE', sector: 'Plane',
    priorities: [
      { capability: 'clm_veto_precision', description: 'Reduce false veto triggers while maintaining security', priority: 93 },
      { capability: 'clm_policy_lifecycle', description: 'Automated policy creation, testing, and retirement', priority: 89 },
    ],
    acknowledged: true, generation: 1,
  },

  // ═══════ Shell ══════════════════════════════════════════════════════════
  {
    node: 'defense', displayName: 'DEFENSE', sector: 'Shell',
    priorities: [
      { capability: 'clm_ip_blocking_strategy', description: 'Reputation scoring, geo-blocking, and proxy detection', priority: 93 },
      { capability: 'clm_bot_detection', description: 'Behavioral signals, browser fingerprinting, anti-evasion', priority: 90 },
    ],
    acknowledged: true, generation: 1,
  },

  // ═══════ ENGINEER — Maintenance Intelligence ═══════════════════════════
  {
    node: 'engineer', displayName: 'ENGINEER', sector: 'Plane',
    priorities: [
      { capability: 'clm_engine_health_scoring', description: 'Deep health scoring for all 62 engines and 20 meta-engines', priority: 92 },
      { capability: 'clm_maintenance_scheduling', description: 'Predictive maintenance windows based on degradation trends', priority: 89 },
    ],
    acknowledged: true, generation: 1,
  },
];

// ─── Registration ───────────────────────────────────────────────────────────

let _registered = false;

/**
 * Register all CLM-priority capabilities (40 nodes × 2 each)
 * into the capability router.
 * 
 * NOTE: These are registered for routing resolution only.
 * Actual capability activation requires ENGINEER approval
 * through the governance flow.
 */
export function registerCLMPriorities(): void {
  if (_registered) return;
  _registered = true;

  for (const node of NODE_CLM_PRIORITIES) {
    for (const p of node.priorities) {
      registerCapability(node.node, p.capability, p.priority);
    }
  }
}

// ─── Query Helpers ──────────────────────────────────────────────────────────

export function getNodePriorities(nodeId: string): CLMPriority | undefined {
  return NODE_CLM_PRIORITIES.find(n => n.node === nodeId);
}

export function getAllAcknowledgedNodes(): CLMPriority[] {
  return NODE_CLM_PRIORITIES.filter(n => n.acknowledged);
}

export function getNodesBySector(sector: string): CLMPriority[] {
  return NODE_CLM_PRIORITIES.filter(n => n.sector === sector);
}

export function getNodesByGeneration(gen: 1 | 2): CLMPriority[] {
  return NODE_CLM_PRIORITIES.filter(n => n.generation === gen);
}

export function getCLMPrioritySummary(): {
  totalNodes: number;
  totalCapabilities: number;
  acknowledged: number;
  sectors: string[];
  generation1Count: number;
  generation2Count: number;
} {
  const sectors = [...new Set(NODE_CLM_PRIORITIES.map(n => n.sector))];
  return {
    totalNodes: NODE_CLM_PRIORITIES.length,
    totalCapabilities: NODE_CLM_PRIORITIES.length * 2,
    acknowledged: NODE_CLM_PRIORITIES.filter(n => n.acknowledged).length,
    sectors,
    generation1Count: NODE_CLM_PRIORITIES.filter(n => n.generation === 1).length,
    generation2Count: NODE_CLM_PRIORITIES.filter(n => n.generation === 2).length,
  };
}
