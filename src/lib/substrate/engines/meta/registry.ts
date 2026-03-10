/**
 * Meta-Engine Registry
 * 24 Meta-Engines Orchestrating 76 Engines → 675+ Capabilities
 * 
 * Meta-Engines provide the highest level of abstraction,
 * combining multiple engines into unified execution pipelines.
 * 
 * Categories: cognitive, protection, autonomous, governance, intelligence,
 * experience, performance, communication, integration, knowledge, self_management,
 * creativity, perception, resource, workflow
 */

import type { MetaEngineId, MetaEngineDefinition, MetaEngineCategory } from './types';

// ============================================================================
// META-ENGINE DEFINITIONS — 20 TOTAL
// ============================================================================

export const META_ENGINE_REGISTRY: Record<MetaEngineId, MetaEngineDefinition> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // COGNITIVE MESH
  // ═══════════════════════════════════════════════════════════════════════════
  
  cognitive_mesh: {
    id: 'cognitive_mesh',
    name: 'Cognitive Mesh',
    description: 'Unified cognitive stack combining reasoning, learning, and memory into a distributed cognition fabric. Enables emergent intelligence through cross-engine context sharing.',
    category: 'cognitive',
    engines: ['reasoning_engine', 'learning_engine', 'memory_engine', 'foresight_engine'],
    totalCapabilities: 22,
    compoundSynergyMultiplier: 5.2,
    complexityScore: 10,
    orchestrationMode: 'adaptive',
    estimatedLatencyMs: 400,
    enterpriseValue: 'enterprise',
    useCases: [
      'Complex multi-step reasoning',
      'Adaptive learning workflows',
      'Context-aware decision making',
      'Predictive intelligence pipelines',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM GUARDIAN
  // ═══════════════════════════════════════════════════════════════════════════
  
  system_guardian: {
    id: 'system_guardian',
    name: 'System Guardian',
    description: 'Complete system protection combining resilience, defense, and threat detection into an always-on security fabric with self-healing capabilities.',
    category: 'protection',
    engines: ['resilience_engine', 'defense_engine', 'threat_engine'],
    totalCapabilities: 13,
    compoundSynergyMultiplier: 6.8,
    complexityScore: 10,
    orchestrationMode: 'parallel',
    estimatedLatencyMs: 80,
    enterpriseValue: 'enterprise',
    useCases: [
      'Zero-downtime protection',
      'Automated incident response',
      'Proactive threat neutralization',
      'Self-healing infrastructure',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTONOMOUS OPERATOR
  // ═══════════════════════════════════════════════════════════════════════════
  
  autonomous_operator: {
    id: 'autonomous_operator',
    name: 'Autonomous Operator',
    description: 'Self-driving operations combining evolution, orchestration, and foresight into autonomous system management with bounded decision authority.',
    category: 'autonomous',
    engines: ['evolution_engine', 'orchestration_engine', 'foresight_engine', 'optimization_engine'],
    totalCapabilities: 23,
    compoundSynergyMultiplier: 7.4,
    complexityScore: 10,
    orchestrationMode: 'staged',
    estimatedLatencyMs: 800,
    enterpriseValue: 'enterprise',
    useCases: [
      'Autonomous system evolution',
      'Self-optimizing workflows',
      'Predictive capacity management',
      'Bounded autonomous operations',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // QUALITY FABRIC
  // ═══════════════════════════════════════════════════════════════════════════
  
  quality_fabric: {
    id: 'quality_fabric',
    name: 'Quality Fabric',
    description: 'End-to-end governance combining quality, compliance, and audit into continuous assurance with full traceability.',
    category: 'governance',
    engines: ['quality_engine', 'compliance_engine', 'audit_engine'],
    totalCapabilities: 12,
    compoundSynergyMultiplier: 4.8,
    complexityScore: 8,
    orchestrationMode: 'cascade',
    estimatedLatencyMs: 350,
    enterpriseValue: 'premium',
    useCases: [
      'Regulatory compliance automation',
      'Continuous quality assurance',
      'Audit-ready documentation',
      'Policy enforcement pipelines',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INTELLIGENCE PIPELINE
  // ═══════════════════════════════════════════════════════════════════════════
  
  intelligence_pipeline: {
    id: 'intelligence_pipeline',
    name: 'Intelligence Pipeline',
    description: 'Full intelligence workflow combining synthesis, insight, and prediction into actionable intelligence generation.',
    category: 'intelligence',
    engines: ['synthesis_engine', 'insight_engine', 'prediction_engine'],
    totalCapabilities: 13,
    compoundSynergyMultiplier: 5.6,
    complexityScore: 9,
    orchestrationMode: 'cascade',
    estimatedLatencyMs: 500,
    enterpriseValue: 'enterprise',
    useCases: [
      'Strategic intelligence synthesis',
      'Cross-domain insight generation',
      'Predictive analytics pipelines',
      'Decision support systems',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ADAPTATION SUITE
  // ═══════════════════════════════════════════════════════════════════════════
  
  adaptation_suite: {
    id: 'adaptation_suite',
    name: 'Adaptation Suite',
    description: 'User experience evolution combining adaptation, learning, and memory for personalized, accessible experiences that improve over time.',
    category: 'experience',
    engines: ['adaptation_engine', 'learning_engine', 'memory_engine'],
    totalCapabilities: 15,
    compoundSynergyMultiplier: 4.6,
    complexityScore: 8,
    orchestrationMode: 'adaptive',
    estimatedLatencyMs: 250,
    enterpriseValue: 'premium',
    useCases: [
      'Personalized user experiences',
      'Adaptive accessibility',
      'Continuous UX improvement',
      'Behavioral learning pipelines',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY FORTRESS
  // ═══════════════════════════════════════════════════════════════════════════
  
  security_fortress: {
    id: 'security_fortress',
    name: 'Security Fortress',
    description: 'Zero-trust security stack combining threat, defense, and trust engines with compliance for comprehensive security posture.',
    category: 'protection',
    engines: ['threat_engine', 'defense_engine', 'trust_engine', 'compliance_engine'],
    totalCapabilities: 14,
    compoundSynergyMultiplier: 7.2,
    complexityScore: 10,
    orchestrationMode: 'parallel',
    estimatedLatencyMs: 100,
    enterpriseValue: 'enterprise',
    useCases: [
      'Zero-trust architecture',
      'Comprehensive threat defense',
      'Trust-based access control',
      'Security compliance automation',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PERFORMANCE OPTIMIZER
  // ═══════════════════════════════════════════════════════════════════════════
  
  performance_optimizer: {
    id: 'performance_optimizer',
    name: 'Performance Optimizer',
    description: 'Resource maximization combining optimization, scheduling, and foresight for peak system performance with predictive capacity management.',
    category: 'performance',
    engines: ['optimization_engine', 'scheduling_engine', 'foresight_engine'],
    totalCapabilities: 17,
    compoundSynergyMultiplier: 5.4,
    complexityScore: 9,
    orchestrationMode: 'adaptive',
    estimatedLatencyMs: 200,
    enterpriseValue: 'premium',
    useCases: [
      'Resource utilization optimization',
      'Predictive scaling',
      'Cost-performance balancing',
      'Workload optimization',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT FABRIC — v9.1.0 ARCHITECT
  // ═══════════════════════════════════════════════════════════════════════════
  
  event_fabric: {
    id: 'event_fabric',
    name: 'Event Fabric',
    description: 'Unified event-driven orchestration combining broadcast, event processing, and monitoring into a real-time communication backbone.',
    category: 'communication',
    engines: ['broadcast_engine', 'event_engine', 'monitoring_engine'],
    totalCapabilities: 11,
    compoundSynergyMultiplier: 5.0,
    complexityScore: 8,
    orchestrationMode: 'parallel',
    estimatedLatencyMs: 50,
    enterpriseValue: 'premium',
    useCases: [
      'Real-time event processing',
      'System-wide broadcast orchestration',
      'Event correlation and analytics',
      'Pub/sub infrastructure management',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DATA HIGHWAY — v9.1.0 ARCHITECT
  // ═══════════════════════════════════════════════════════════════════════════
  
  data_highway: {
    id: 'data_highway',
    name: 'Data Highway',
    description: 'Cross-system data orchestration combining routing, transformation, and capacity management for seamless data flow.',
    category: 'integration',
    engines: ['routing_engine', 'transformation_engine', 'capacity_engine'],
    totalCapabilities: 12,
    compoundSynergyMultiplier: 5.2,
    complexityScore: 8,
    orchestrationMode: 'cascade',
    estimatedLatencyMs: 150,
    enterpriseValue: 'premium',
    useCases: [
      'Multi-provider data routing',
      'Format transformation pipelines',
      'Capacity-aware data distribution',
      'Cross-system synchronization',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // KNOWLEDGE NEXUS — v9.1.0 ARCHITECT
  // ═══════════════════════════════════════════════════════════════════════════
  
  knowledge_nexus: {
    id: 'knowledge_nexus',
    name: 'Knowledge Nexus',
    description: 'Unified knowledge management combining graph, context, and synthesis for intelligent information retrieval and generation.',
    category: 'knowledge',
    engines: ['graph_engine', 'context_engine', 'synthesis_engine'],
    totalCapabilities: 12,
    compoundSynergyMultiplier: 5.8,
    complexityScore: 9,
    orchestrationMode: 'adaptive',
    estimatedLatencyMs: 300,
    enterpriseValue: 'enterprise',
    useCases: [
      'Semantic knowledge retrieval',
      'Context-aware synthesis',
      'Cross-domain insight generation',
      'Intelligent information assembly',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SELF GOVERNANCE — v9.1.0 ARCHITECT
  // ═══════════════════════════════════════════════════════════════════════════
  
  self_governance: {
    id: 'self_governance',
    name: 'Self Governance',
    description: 'Autonomous self-management combining healing, documentation, and evolution for a truly self-sustaining system.',
    category: 'self_management',
    engines: ['self_healing_engine', 'self_documentation_engine', 'evolution_engine'],
    totalCapabilities: 13,
    compoundSynergyMultiplier: 6.5,
    complexityScore: 10,
    orchestrationMode: 'staged',
    estimatedLatencyMs: 600,
    enterpriseValue: 'enterprise',
    useCases: [
      'Autonomous system maintenance',
      'Self-documenting architecture',
      'Continuous self-improvement',
      'Homeostatic system balance',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CREATIVE FORGE — v9.1.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  creative_forge: {
    id: 'creative_forge',
    name: 'Creative Forge',
    description: 'Full creative stack combining imagination, innovation, and dream engines for generative synthesis, pattern evolution, and nocturnal optimization.',
    category: 'creativity',
    engines: ['imagination_engine', 'innovation_engine', 'dream_engine'],
    totalCapabilities: 12,
    compoundSynergyMultiplier: 6.2,
    complexityScore: 10,
    orchestrationMode: 'adaptive',
    estimatedLatencyMs: 800,
    enterpriseValue: 'enterprise',
    useCases: [
      'Creative solution generation',
      'Cross-domain innovation',
      'Nocturnal system optimization',
      'Emergent pattern discovery',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PERCEPTION MATRIX — v9.1.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  perception_matrix: {
    id: 'perception_matrix',
    name: 'Perception Matrix',
    description: 'Full understanding stack combining intent, emotion, and multimodal engines for deep user comprehension and empathetic interaction.',
    category: 'perception',
    engines: ['intent_engine', 'emotion_engine', 'multimodal_engine'],
    totalCapabilities: 12,
    compoundSynergyMultiplier: 5.5,
    complexityScore: 9,
    orchestrationMode: 'parallel',
    estimatedLatencyMs: 150,
    enterpriseValue: 'enterprise',
    useCases: [
      'Deep intent understanding',
      'Empathetic AI interactions',
      'Multimodal input processing',
      'Emotional intelligence',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RESOURCE GOVERNOR — v9.1.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  resource_governor: {
    id: 'resource_governor',
    name: 'Resource Governor',
    description: 'Complete resource management combining budget, quota, and entitlement engines for cost optimization and access control.',
    category: 'resource',
    engines: ['budget_engine', 'quota_engine', 'entitlement_engine'],
    totalCapabilities: 12,
    compoundSynergyMultiplier: 5.8,
    complexityScore: 9,
    orchestrationMode: 'parallel',
    estimatedLatencyMs: 80,
    enterpriseValue: 'enterprise',
    useCases: [
      'Cost governance automation',
      'Quota management optimization',
      'Access control orchestration',
      'Budget-aware routing',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WORKFLOW ORCHESTRATOR — v9.1.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  workflow_orchestrator: {
    id: 'workflow_orchestrator',
    name: 'Workflow Orchestrator',
    description: 'Full workflow stack combining pipeline, coordination, and delegation engines for complex multi-agent orchestration.',
    category: 'workflow',
    engines: ['pipeline_engine', 'coordination_engine', 'delegation_engine'],
    totalCapabilities: 12,
    compoundSynergyMultiplier: 6.8,
    complexityScore: 10,
    orchestrationMode: 'staged',
    estimatedLatencyMs: 200,
    enterpriseValue: 'enterprise',
    useCases: [
      'Complex workflow automation',
      'Multi-agent coordination',
      'Intelligent task delegation',
      'DAG-based orchestration',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD-FIRST COGNITIVE — v8.1.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  world_first_cognitive: {
    id: 'world_first_cognitive',
    name: 'World-First Cognitive',
    description: 'Unified cognitive world-first enhancements combining BRAIN attention/memory, DECODE intent understanding, and DREAM creative evolution for deep cognitive capabilities.',
    category: 'cognitive',
    engines: ['attention_memory_engine', 'intent_understanding_engine', 'creative_evolution_engine'],
    totalCapabilities: 12,
    compoundSynergyMultiplier: 7.8,
    complexityScore: 10,
    orchestrationMode: 'adaptive',
    estimatedLatencyMs: 300,
    enterpriseValue: 'enterprise',
    useCases: [
      'Advanced attention-based reasoning',
      'Emotional resonance processing',
      'Semantic memory clustering',
      'Creative insight crystallization',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD-FIRST OPERATIONAL — v8.1.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  world_first_operational: {
    id: 'world_first_operational',
    name: 'World-First Operational',
    description: 'Complete operational world-first stack combining NEXUS provider governance, SYSTEM resilience, CORE runtime config, and INTEGRATION adapter management.',
    category: 'autonomous',
    engines: ['provider_governance_engine', 'system_resilience_engine', 'config_runtime_engine', 'adapter_transform_engine'],
    totalCapabilities: 14,
    compoundSynergyMultiplier: 8.2,
    complexityScore: 10,
    orchestrationMode: 'parallel',
    estimatedLatencyMs: 80,
    enterpriseValue: 'enterprise',
    useCases: [
      'Zero-cost provider optimization',
      'Self-healing infrastructure',
      'Live configuration management',
      'Cross-system data transformation',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD-FIRST INTELLIGENCE — v8.1.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  world_first_intelligence: {
    id: 'world_first_intelligence',
    name: 'World-First Intelligence',
    description: 'Full intelligence world-first stack combining VISION predictive analytics, CORTEX orchestration, and EVOLUTION governance for strategic foresight.',
    category: 'intelligence',
    engines: ['predictive_analytics_engine', 'cortex_orchestration_engine', 'evolution_governance_engine'],
    totalCapabilities: 12,
    compoundSynergyMultiplier: 7.5,
    complexityScore: 10,
    orchestrationMode: 'staged',
    estimatedLatencyMs: 400,
    enterpriseValue: 'enterprise',
    useCases: [
      'SLA breach prediction',
      'Autonomous goal decomposition',
      'Evolution outcome forecasting',
      'Multi-agent coordination',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD-FIRST GOVERNANCE — v8.1.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  world_first_governance: {
    id: 'world_first_governance',
    name: 'World-First Governance',
    description: 'Complete governance world-first stack combining DEFENSE threat containment, ACCESS entitlement audit, RIPPLE event replay, and INCLUSIVE accessibility for full compliance.',
    category: 'governance',
    engines: ['threat_containment_engine', 'entitlement_audit_engine', 'event_replay_engine', 'cognitive_accessibility_engine'],
    totalCapabilities: 14,
    compoundSynergyMultiplier: 7.2,
    complexityScore: 10,
    orchestrationMode: 'cascade',
    estimatedLatencyMs: 200,
    enterpriseValue: 'enterprise',
    useCases: [
      'Zero-trust behavioral analysis',
      'Permission graph traversal',
      'Audit trail integrity verification',
      'WCAG auto-remediation',
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // RESILIENCE SHIELD — v8.5.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  resilience_shield: {
    id: 'resilience_shield',
    name: 'Resilience Shield',
    description: 'Comprehensive system protection combining sandbox isolation, prompt safety, saga-based rollback, and policy-driven access control into an impenetrable operational shield.',
    category: 'protection',
    engines: ['sandbox_engine', 'prompt_safety_engine', 'saga_engine', 'policy_access_engine'],
    totalCapabilities: 18,
    compoundSynergyMultiplier: 7.6,
    complexityScore: 10,
    orchestrationMode: 'parallel',
    estimatedLatencyMs: 90,
    enterpriseValue: 'enterprise',
    useCases: [
      'Sandboxed capability execution',
      'Prompt injection defense',
      'Saga-based transactional rollback',
      'Policy-driven zero-trust access',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DEEP COGNITION NEXUS — v8.5.0
  // ═══════════════════════════════════════════════════════════════════════════
  
  deep_cognition_nexus: {
    id: 'deep_cognition_nexus',
    name: 'Deep Cognition Nexus',
    description: 'Advanced cognitive intelligence combining deep reasoning, dialogue understanding, system observability, and technical debt analysis for strategic substrate evolution.',
    category: 'intelligence',
    engines: ['deep_cognition_engine', 'dialogue_engine', 'observability_engine', 'technical_debt_engine'],
    totalCapabilities: 20,
    compoundSynergyMultiplier: 7.4,
    complexityScore: 10,
    orchestrationMode: 'staged',
    estimatedLatencyMs: 450,
    enterpriseValue: 'enterprise',
    useCases: [
      'Deep associative reasoning',
      'Multi-turn dialogue comprehension',
      'System-wide observability synthesis',
      'Technical debt prioritization',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ENTERPRISE TRUST FABRIC
  // ═══════════════════════════════════════════════════════════════════════════
  
  enterprise_trust_fabric: {
    id: 'enterprise_trust_fabric',
    name: 'Enterprise Trust Fabric',
    description: 'End-to-end enterprise trust combining zero-trust identity, tamper-evident compliance auditing, and encrypted relay delivery into a unified governance mesh.',
    category: 'governance',
    engines: ['zero_trust_engine', 'compliance_audit_engine', 'delivery_orchestrator'],
    totalCapabilities: 27,
    compoundSynergyMultiplier: 8.2,
    complexityScore: 10,
    orchestrationMode: 'staged',
    estimatedLatencyMs: 350,
    enterpriseValue: 'enterprise',
    useCases: [
      'SOC 2 / ISO 27001 continuous compliance',
      'Zero-trust identity with full audit trail',
      'Encrypted cross-system data delivery',
      'Multi-tenant enterprise onboarding',
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PLATFORM ECONOMICS ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  
  platform_economics_engine: {
    id: 'platform_economics_engine',
    name: 'Platform Economics Engine',
    description: 'Full-stack cost and value attribution combining FinOps metering, knowledge-driven context optimization, and revenue analytics into a unified platform economics layer.',
    category: 'resource',
    engines: ['finops_engine', 'knowledge_retrieval_engine', 'resilience_lab'],
    totalCapabilities: 27,
    compoundSynergyMultiplier: 7.6,
    complexityScore: 9,
    orchestrationMode: 'adaptive',
    estimatedLatencyMs: 280,
    enterpriseValue: 'enterprise',
    useCases: [
      'Per-capability cost attribution and ROI',
      'Intelligent context optimization for cost reduction',
      'Marketplace settlement and billing',
      'Capacity planning with cost modeling',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY INTELLIGENCE FABRIC — v10.9.0 Discovered
  // ═══════════════════════════════════════════════════════════════════════════

  memory_intelligence_fabric: {
    id: 'memory_intelligence_fabric',
    name: 'Memory Intelligence Fabric',
    description: 'Deep memory intelligence combining tiered memory management, deep cognition, knowledge retrieval, attention allocation, and unified salience scoring into a complete memory-aware reasoning pipeline.',
    category: 'cognitive',
    engines: ['memory_engine', 'deep_cognition_engine', 'knowledge_retrieval_engine', 'attention_memory_engine', 'salience_engine'],
    totalCapabilities: 31,
    compoundSynergyMultiplier: 8.4,
    complexityScore: 10,
    orchestrationMode: 'adaptive',
    estimatedLatencyMs: 320,
    enterpriseValue: 'enterprise',
    useCases: [
      'Salience-driven memory retrieval',
      'Cross-tier memory intelligence',
      'Attention-weighted context assembly',
      'Deep associative reasoning with recall',
      'SM-2 reinforcement-aware memory management',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IMMUNE AUTONOMY MESH — v10.9.0 Discovered
  // ═══════════════════════════════════════════════════════════════════════════

  immune_autonomy_mesh: {
    id: 'immune_autonomy_mesh',
    name: 'Immune Autonomy Mesh',
    description: 'Autonomous immune defense combining ENCODE graduated repair, self-healing infrastructure, system resilience profiling, and fault isolation into a self-repairing defense grid.',
    category: 'autonomous',
    engines: ['immune_engine', 'self_healing_engine', 'system_resilience_engine', 'resilience_engine'],
    totalCapabilities: 24,
    compoundSynergyMultiplier: 8.0,
    complexityScore: 10,
    orchestrationMode: 'parallel',
    estimatedLatencyMs: 90,
    enterpriseValue: 'enterprise',
    useCases: [
      'Graduated autonomy repair cascades',
      'Cross-executor rule propagation',
      'Zero-downtime immune recovery',
      'Adversarial mutation resilience testing',
      'Self-healing with structural scoring',
    ],
  },
};

export function getMetaEngine(id: MetaEngineId): MetaEngineDefinition | undefined {
  return META_ENGINE_REGISTRY[id];
}

export function listMetaEngines(): MetaEngineDefinition[] {
  return Object.values(META_ENGINE_REGISTRY);
}

export function getMetaEnginesByCategory(category: MetaEngineCategory): MetaEngineDefinition[] {
  return listMetaEngines().filter(m => m.category === category);
}

export function getMetaEnginesByEngine(engineId: string): MetaEngineDefinition[] {
  return listMetaEngines().filter(m => (m.engines as readonly string[]).includes(engineId));
}

export function getTotalCapabilitiesReached(): number {
  return 379; // All capabilities reachable through meta-engines (v9.0.0)
}

export function getMetaEngineSummary() {
  const metaEngines = listMetaEngines();
  const byCategory: Record<MetaEngineCategory, number> = {
    cognitive: 0,
    protection: 0,
    autonomous: 0,
    governance: 0,
    intelligence: 0,
    experience: 0,
    performance: 0,
    communication: 0,
    integration: 0,
    knowledge: 0,
    self_management: 0,
    creativity: 0,
    perception: 0,
    resource: 0,
    workflow: 0,
  };
  
  let totalSynergy = 0;
  let totalEngines = 0;
  
  metaEngines.forEach(m => {
    byCategory[m.category]++;
    totalSynergy += m.compoundSynergyMultiplier;
    totalEngines += m.engines.length;
  });
  
  return {
    totalMetaEngines: metaEngines.length,
    totalEnginesOrchestrated: totalEngines,
    totalCapabilitiesReached: getTotalCapabilitiesReached(),
    averageCompoundSynergy: totalSynergy / metaEngines.length,
    byCategory,
  };
}

// ============================================================================
// META-ENGINE IDS LIST
// ============================================================================

export const META_ENGINE_IDS: MetaEngineId[] = Object.keys(META_ENGINE_REGISTRY) as MetaEngineId[];

export const META_ENGINES_BY_CATEGORY: Record<MetaEngineCategory, MetaEngineId[]> = {
  cognitive: ['cognitive_mesh', 'world_first_cognitive', 'memory_intelligence_fabric'],
  protection: ['system_guardian', 'security_fortress', 'resilience_shield'],
  autonomous: ['autonomous_operator', 'world_first_operational', 'immune_autonomy_mesh'],
  governance: ['quality_fabric', 'world_first_governance', 'enterprise_trust_fabric'],
  intelligence: ['intelligence_pipeline', 'world_first_intelligence', 'deep_cognition_nexus'],
  experience: ['adaptation_suite'],
  performance: ['performance_optimizer'],
  communication: ['event_fabric'],
  integration: ['data_highway'],
  knowledge: ['knowledge_nexus'],
  self_management: ['self_governance'],
  creativity: ['creative_forge'],
  perception: ['perception_matrix'],
  resource: ['resource_governor', 'platform_economics_engine'],
  workflow: ['workflow_orchestrator'],
};
