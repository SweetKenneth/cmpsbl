/**
 * Engine Registry
 * v7.7.0 — 20 Cognitive Engines Consolidating 76 Capabilities
 * 
 * Each engine orchestrates multiple related capabilities into
 * a compound execution unit with enhanced value and IP protection.
 */

import type { EngineId, EngineDefinition, EngineCategory } from './types';

// ============================================================================
// ENGINE DEFINITIONS — 20 TOTAL ENGINES
// ============================================================================

export const ENGINE_REGISTRY: Record<EngineId, EngineDefinition> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // COGNITIVE ENGINES (4)
  // ═══════════════════════════════════════════════════════════════════════════
  
  reasoning_engine: {
    id: 'reasoning_engine',
    name: 'Reasoning Engine',
    description: 'Multi-modal reasoning with semantic understanding, intent resolution, and causal analysis. Combines graph navigation, similarity ranking, and ambiguity resolution into unified cognition.',
    category: 'cognitive',
    capabilities: [
      'knowledge_graph_navigator',
      'semantic_similarity_ranker',
      'cognitive_load_balancer',
      'multi_intent_resolver',
      'ambiguity_resolution_chain',
      'systems_causal_analysis',
    ],
    primaryModules: ['BRAIN', 'DECODE', 'CORTEX'],
    layer: 'Cognitive',
    synergyMultiplier: 2.4,
    complexityScore: 9,
    autonomyLevel: 'supervised',
    executionMode: 'adaptive',
    averageLatencyMs: 150,
    cacheable: true,
  },
  
  learning_engine: {
    id: 'learning_engine',
    name: 'Learning Engine',
    description: 'Continuous learning through pattern extraction, memory consolidation, and active exploration. Orchestrates idea incubation with adaptive personalization.',
    category: 'cognitive',
    capabilities: [
      'memory_consolidation_engine',
      'latent_pattern_extractor',
      'idea_incubation_scheduler',
      'active_learning_triggers',
      'adaptive_learning_personalization',
      'personality_adaptation_engine',
    ],
    primaryModules: ['BRAIN', 'DREAM', 'DECODE'],
    layer: 'Cognitive',
    synergyMultiplier: 2.2,
    complexityScore: 8,
    autonomyLevel: 'autonomous',
    executionMode: 'parallel',
    averageLatencyMs: 200,
    cacheable: false,
  },
  
  memory_engine: {
    id: 'memory_engine',
    name: 'Memory Engine',
    description: 'Context-aware memory management with temporal scoring, relevance ranking, and consolidation. Surfaces right memories at right time.',
    category: 'cognitive',
    capabilities: [
      'context_aware_memory_recall',
      'temporal_memory_scoring',
      'semantic_similarity_ranker',
      'context_window_optimizer',
    ],
    primaryModules: ['BRAIN', 'DECODE', 'DREAM'],
    layer: 'Cognitive',
    synergyMultiplier: 1.9,
    complexityScore: 7,
    autonomyLevel: 'assisted',
    executionMode: 'sequential',
    averageLatencyMs: 80,
    cacheable: true,
  },
  
  foresight_engine: {
    id: 'foresight_engine',
    name: 'Foresight Engine',
    description: 'Predictive analytics combining metric forecasting, capacity planning, lifecycle prediction, and drift detection for proactive system management.',
    category: 'cognitive',
    capabilities: [
      'metric_anomaly_forecaster',
      'capacity_planning_advisor',
      'lifecycle_state_predictor',
      'config_drift_detector',
      'predictive_issue_prevention',
      'health_trend_analyzer',
    ],
    primaryModules: ['VISION', 'BRAIN', 'SYSTEM'],
    layer: 'Operational',
    synergyMultiplier: 2.5,
    complexityScore: 9,
    autonomyLevel: 'autonomous',
    executionMode: 'parallel',
    averageLatencyMs: 250,
    cacheable: true,
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATIONAL ENGINES (4)
  // ═══════════════════════════════════════════════════════════════════════════
  
  resilience_engine: {
    id: 'resilience_engine',
    name: 'Resilience Engine',
    description: 'Self-healing infrastructure with fault isolation, graceful degradation, incident response, and integrity validation. Prevents cascade failures.',
    category: 'operational',
    capabilities: [
      'fault_boundary_orchestrator',
      'graceful_degradation_chain',
      'incident_response_automator',
      'backup_integrity_validator',
      'resilience_orchestration',
      'distributed_lock_coordinator',
    ],
    primaryModules: ['CORE', 'DEFENSE', 'SYSTEM'],
    layer: 'Kernel',
    synergyMultiplier: 2.8,
    complexityScore: 10,
    autonomyLevel: 'autonomous',
    executionMode: 'adaptive',
    averageLatencyMs: 50,
    cacheable: false,
  },
  
  optimization_engine: {
    id: 'optimization_engine',
    name: 'Optimization Engine',
    description: 'Multi-dimensional optimization across cost, quality, latency, and resources. Balances provider selection with connection pooling.',
    category: 'operational',
    capabilities: [
      'priority_queue_optimizer',
      'cost_quality_optimizer',
      'latency_prediction_engine',
      'connection_pool_optimizer',
      'resource_cleanup_scheduler',
      'nocturnal_optimization_runner',
    ],
    primaryModules: ['CORE', 'NEXUS', 'INTEGRATION'],
    layer: 'Kernel',
    synergyMultiplier: 2.3,
    complexityScore: 8,
    autonomyLevel: 'autonomous',
    executionMode: 'parallel',
    averageLatencyMs: 100,
    cacheable: true,
  },
  
  orchestration_engine: {
    id: 'orchestration_engine',
    name: 'Orchestration Engine',
    description: 'Multi-agent coordination with task decomposition, event correlation, and priority balancing. Manages complex workflow pipelines.',
    category: 'operational',
    capabilities: [
      'multi_agent_coordinator',
      'task_decomposition_engine',
      'event_correlation_engine',
      'execution_priority_balancer',
      'intelligent_task_delegation',
      'goal_alignment_validator',
    ],
    primaryModules: ['CORTEX', 'RIPPLE', 'NEXUS'],
    layer: 'Orchestrator',
    synergyMultiplier: 2.6,
    complexityScore: 9,
    autonomyLevel: 'supervised',
    executionMode: 'adaptive',
    averageLatencyMs: 120,
    cacheable: false,
  },
  
  scheduling_engine: {
    id: 'scheduling_engine',
    name: 'Scheduling Engine',
    description: 'Intelligent task scheduling with quota prediction, throttling, health monitoring, and deduplication. Ensures optimal resource utilization.',
    category: 'operational',
    capabilities: [
      'quota_burst_predictor',
      'broadcast_throttle_manager',
      'subscription_health_monitor',
      'message_deduplication_guard',
      'api_key_rotation_scheduler',
    ],
    primaryModules: ['ACCESS', 'RIPPLE', 'SYSTEM'],
    layer: 'Operational',
    synergyMultiplier: 2.0,
    complexityScore: 7,
    autonomyLevel: 'autonomous',
    executionMode: 'sequential',
    averageLatencyMs: 60,
    cacheable: true,
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INTELLIGENCE ENGINES (4)
  // ═══════════════════════════════════════════════════════════════════════════
  
  synthesis_engine: {
    id: 'synthesis_engine',
    name: 'Synthesis Engine',
    description: 'Creative synthesis through pattern fusion, cross-domain insights, and data transformation. Generates novel solutions from disparate sources.',
    category: 'intelligence',
    capabilities: [
      'creative_synthesis_engine',
      'pattern_fusion_synthesis',
      'cross_domain_insight_synthesis',
      'data_transformation_pipeline',
    ],
    primaryModules: ['DREAM', 'BRAIN', 'INTEGRATION'],
    layer: 'Cognitive',
    synergyMultiplier: 2.4,
    complexityScore: 9,
    autonomyLevel: 'supervised',
    executionMode: 'parallel',
    averageLatencyMs: 300,
    cacheable: true,
  },
  
  adaptation_engine: {
    id: 'adaptation_engine',
    name: 'Adaptation Engine',
    description: 'Dynamic adaptation to users, interfaces, and environments. Combines accessibility optimization with developer onboarding.',
    category: 'intelligence',
    capabilities: [
      'adaptive_interface_optimizer',
      'developer_onboarding_optimizer',
      'personality_adaptation_engine',
      'intent_amplification',
      'usage_anomaly_detector',
    ],
    primaryModules: ['INCLUSIVE', 'ACCESS', 'DECODE'],
    layer: 'Cognitive',
    synergyMultiplier: 2.1,
    complexityScore: 7,
    autonomyLevel: 'assisted',
    executionMode: 'sequential',
    averageLatencyMs: 90,
    cacheable: true,
  },
  
  insight_engine: {
    id: 'insight_engine',
    name: 'Insight Engine',
    description: 'Dashboard insights with hypothesis validation, impact analysis, and trend detection. Transforms data into actionable intelligence.',
    category: 'intelligence',
    capabilities: [
      'dashboard_insight_generator',
      'hypothesis_validation',
      'proposal_impact_analyzer',
      'health_trend_analyzer',
    ],
    primaryModules: ['VISION', 'BRAIN', 'MODERNIZER'],
    layer: 'Admin',
    synergyMultiplier: 2.0,
    complexityScore: 6,
    autonomyLevel: 'assisted',
    executionMode: 'parallel',
    averageLatencyMs: 180,
    cacheable: true,
  },
  
  prediction_engine: {
    id: 'prediction_engine',
    name: 'Prediction Engine',
    description: 'Multi-signal prediction combining provider health, fallback chains, compatibility, and conflict resolution for proactive routing.',
    category: 'intelligence',
    capabilities: [
      'provider_health_router',
      'fallback_chain_orchestrator',
      'adapter_compatibility_checker',
      'sync_conflict_resolver',
      'behavioral_drift_detection',
    ],
    primaryModules: ['NEXUS', 'INTEGRATION', 'DEFENSE'],
    layer: 'Operational',
    synergyMultiplier: 2.2,
    complexityScore: 8,
    autonomyLevel: 'autonomous',
    executionMode: 'adaptive',
    averageLatencyMs: 70,
    cacheable: true,
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GOVERNANCE ENGINES (3)
  // ═══════════════════════════════════════════════════════════════════════════
  
  compliance_engine: {
    id: 'compliance_engine',
    name: 'Compliance Engine',
    description: 'Regulatory compliance with drift detection, audit reporting, ethical guardrails, and feature governance. Ensures policy adherence.',
    category: 'governance',
    capabilities: [
      'compliance_drift_detector',
      'audit_compliance_reporter',
      'ethical_guardrails',
      'feature_flag_governor',
    ],
    primaryModules: ['DEFENSE', 'SYSTEM', 'CORTEX'],
    layer: 'Admin',
    synergyMultiplier: 2.3,
    complexityScore: 8,
    autonomyLevel: 'supervised',
    executionMode: 'sequential',
    averageLatencyMs: 150,
    cacheable: false,
  },
  
  quality_engine: {
    id: 'quality_engine',
    name: 'Quality Engine',
    description: 'Autonomous quality assurance with accessibility guards, WCAG remediation, inclusive testing, and review automation.',
    category: 'governance',
    capabilities: [
      'accessibility_regression_guard',
      'wcag_auto_remediation_engine',
      'inclusive_testing_orchestrator',
      'autonomous_quality_review',
    ],
    primaryModules: ['INCLUSIVE', 'MODERNIZER', 'CORTEX'],
    layer: 'Admin',
    synergyMultiplier: 2.1,
    complexityScore: 7,
    autonomyLevel: 'autonomous',
    executionMode: 'parallel',
    averageLatencyMs: 200,
    cacheable: false,
  },
  
  audit_engine: {
    id: 'audit_engine',
    name: 'Audit Engine',
    description: 'Comprehensive audit trail with confidence scoring, risk assessment, and documentation generation. Full traceability.',
    category: 'governance',
    capabilities: [
      'evolution_confidence_scoring',
      'migration_risk_scorer',
      'autonomous_documentation',
      'audit_compliance_reporter',
    ],
    primaryModules: ['MODERNIZER', 'SYSTEM', 'CORTEX'],
    layer: 'Admin',
    synergyMultiplier: 1.9,
    complexityScore: 6,
    autonomyLevel: 'assisted',
    executionMode: 'sequential',
    averageLatencyMs: 130,
    cacheable: true,
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY ENGINES (3)
  // ═══════════════════════════════════════════════════════════════════════════
  
  threat_engine: {
    id: 'threat_engine',
    name: 'Threat Engine',
    description: 'Proactive threat intelligence with pattern correlation, surface mapping, and behavioral drift. Identifies threats before impact.',
    category: 'security',
    capabilities: [
      'threat_pattern_correlator',
      'attack_surface_mapper',
      'behavioral_drift_detection',
      'usage_anomaly_detector',
    ],
    primaryModules: ['DEFENSE', 'VISION', 'ACCESS'],
    layer: 'Operational',
    synergyMultiplier: 2.7,
    complexityScore: 10,
    autonomyLevel: 'autonomous',
    executionMode: 'streaming',
    averageLatencyMs: 40,
    cacheable: false,
  },
  
  defense_engine: {
    id: 'defense_engine',
    name: 'Defense Engine',
    description: 'Real-time security with incident automation, hardening, and compliance enforcement. Active protection layer.',
    category: 'security',
    capabilities: [
      'realtime_security_hardening',
      'incident_response_automator',
      'compliance_drift_detector',
    ],
    primaryModules: ['DEFENSE', 'SYSTEM', 'VISION'],
    layer: 'Operational',
    synergyMultiplier: 2.5,
    complexityScore: 9,
    autonomyLevel: 'supervised',
    executionMode: 'adaptive',
    averageLatencyMs: 30,
    cacheable: false,
  },
  
  trust_engine: {
    id: 'trust_engine',
    name: 'Trust Engine',
    description: 'Trust scoring through goal alignment, ethical validation, and confidence assessment. Ensures system integrity.',
    category: 'security',
    capabilities: [
      'goal_alignment_validator',
      'ethical_guardrails',
      'evolution_confidence_scoring',
    ],
    primaryModules: ['CORTEX', 'DECODE', 'MODERNIZER'],
    layer: 'Orchestrator',
    synergyMultiplier: 2.0,
    complexityScore: 8,
    autonomyLevel: 'supervised',
    executionMode: 'sequential',
    averageLatencyMs: 100,
    cacheable: true,
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EVOLUTION ENGINES (2)
  // ═══════════════════════════════════════════════════════════════════════════
  
  evolution_engine: {
    id: 'evolution_engine',
    name: 'Evolution Engine',
    description: 'Self-improvement through continuous proposals, deprecation paths, and nocturnal optimization. The system that improves the system.',
    category: 'evolution',
    capabilities: [
      'continuous_improvement_engine',
      'deprecation_path_finder',
      'nocturnal_optimization_runner',
      'proposal_impact_analyzer',
      'active_learning_triggers',
    ],
    primaryModules: ['MODERNIZER', 'DREAM', 'BRAIN'],
    layer: 'Admin',
    synergyMultiplier: 3.0,
    complexityScore: 10,
    autonomyLevel: 'autonomous',
    executionMode: 'adaptive',
    averageLatencyMs: 500,
    cacheable: false,
  },
  
  modernization_engine: {
    id: 'modernization_engine',
    name: 'Modernization Engine',
    description: 'Architecture modernization with risk scoring, feature governance, and migration planning. Evolves the codebase safely.',
    category: 'evolution',
    capabilities: [
      'migration_risk_scorer',
      'feature_flag_governor',
      'proposal_impact_analyzer',
      'deprecation_path_finder',
    ],
    primaryModules: ['MODERNIZER', 'SYSTEM', 'CORTEX'],
    layer: 'Admin',
    synergyMultiplier: 2.4,
    complexityScore: 9,
    autonomyLevel: 'supervised',
    executionMode: 'sequential',
    averageLatencyMs: 350,
    cacheable: true,
  },
};

// ============================================================================
// REGISTRY ACCESS FUNCTIONS
// ============================================================================

export function getEngine(id: EngineId): EngineDefinition | undefined {
  return ENGINE_REGISTRY[id];
}

export function listEngines(): EngineDefinition[] {
  return Object.values(ENGINE_REGISTRY);
}

export function getEnginesByCategory(category: EngineCategory): EngineDefinition[] {
  return listEngines().filter(e => e.category === category);
}

export function getEnginesByModule(module: string): EngineDefinition[] {
  return listEngines().filter(e => e.primaryModules.includes(module));
}

export function getEngineCapabilityCount(id: EngineId): number {
  const engine = ENGINE_REGISTRY[id];
  return engine ? engine.capabilities.length : 0;
}

export function getTotalCapabilitiesOrchestrated(): number {
  // Count unique capabilities across all engines
  const allCaps = new Set<string>();
  listEngines().forEach(e => e.capabilities.forEach(c => allCaps.add(c)));
  return allCaps.size;
}

export function getEngineSummary() {
  const engines = listEngines();
  const byCategory: Record<EngineCategory, number> = {
    cognitive: 0,
    operational: 0,
    intelligence: 0,
    governance: 0,
    security: 0,
    evolution: 0,
  };
  
  let totalMultiplier = 0;
  let totalComplexity = 0;
  
  engines.forEach(e => {
    byCategory[e.category]++;
    totalMultiplier += e.synergyMultiplier;
    totalComplexity += e.complexityScore;
  });
  
  return {
    totalEngines: engines.length,
    enabledEngines: engines.length, // All enabled by default
    byCategory,
    totalCapabilitiesOrchestrated: getTotalCapabilitiesOrchestrated(),
    averageSynergyMultiplier: totalMultiplier / engines.length,
    averageComplexityScore: totalComplexity / engines.length,
  };
}

// ============================================================================
// ENGINE IDS LIST
// ============================================================================

export const ENGINE_IDS: EngineId[] = Object.keys(ENGINE_REGISTRY) as EngineId[];

export const ENGINES_BY_CATEGORY: Record<EngineCategory, EngineId[]> = {
  cognitive: ['reasoning_engine', 'learning_engine', 'memory_engine', 'foresight_engine'],
  operational: ['resilience_engine', 'optimization_engine', 'orchestration_engine', 'scheduling_engine'],
  intelligence: ['synthesis_engine', 'adaptation_engine', 'insight_engine', 'prediction_engine'],
  governance: ['compliance_engine', 'quality_engine', 'audit_engine'],
  security: ['threat_engine', 'defense_engine', 'trust_engine'],
  evolution: ['evolution_engine', 'modernization_engine'],
};
