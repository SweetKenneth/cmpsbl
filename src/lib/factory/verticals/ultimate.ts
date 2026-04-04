/**
 * CMPSBL® Ultimate Vertical Substrate
 * 
 * Subdomain: ultimate.cmpsbl.com
 * 
 * The Ultimate substrate is the ONLY substrate with NO locked primitives.
 * No spine lock. No organ/layer/engine/agent quotas. All 40 slots are
 * open. The Universal Pool Scanner evaluates every primitive in the entire
 * CMPSBL ecosystem — 120 candidates (24 Spine + 80 vertical expansion +
 * 16 Universal gap-fillers) — and selects the 40 that produce the maximum
 * compounding effect for the uploaded codebase.
 * 
 * Extended scan time ensures deep collision evaluation across all candidates.
 * The result is always the highest-impact 40-primitive surface possible —
 * no two scans alike.
 * 
 * Hot-swapped Default Engines (8) — Universal Gap-Fillers:
 *   APEX     — Peak performance optimization and hot-path analysis
 *   CONDUIT  — Data pipeline orchestration and stream processing
 *   PRISM    — Multi-paradigm code analysis (OOP, FP, reactive, procedural)
 *   GENESIS  — Project scaffolding, boilerplate detection, and architecture seeding
 *   FLUX     — State management patterns and reactive data flow
 *   CRUCIBLE — Load testing, stress analysis, and bottleneck identification
 *   MERIDIAN — API design, contract validation, and interface governance
 *   DYNAMO   — Concurrency patterns, async orchestration, and parallelism
 * 
 * Hot-swapped Default Agents (8) — Universal Gap-Fillers:
 *   SENTINEL — Universal input validation and boundary enforcement
 *   CATALYST — Dependency optimization and dead code elimination
 *   ARBITER  — Error handling strategy and recovery pattern analysis
 *   HERALD   — Logging, observability, and telemetry pattern discovery
 *   NOMAD    — Cross-platform compatibility and portability analysis
 *   WELDER   — Integration pattern detection (REST, GraphQL, gRPC, WebSocket)
 *   ORACLE   — Configuration management and feature flag governance
 *   PHOENIX  — Migration pattern detection and version upgrade pathways
 * 
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { getSpinePrimitives, assembleVerticalPrimitives } from '../vertical-substrate';
import { getCyberSecurityEngines, getCyberSecurityAgents } from './cybersecurity';
import { getRoboticsEngines, getRoboticsAgents } from './robotics';
import { getQuantumEngines, getQuantumAgents } from './quantum';
import { getLLMEngines, getLLMAgents } from './llm';
import { getAgencyEngines, getAgencyAgents } from './agency';

/* ─── Universal Engines (gap-fillers) ─── */

const ULTIMATE_ENGINES: VerticalPrimitive[] = [
  {
    id: 'ULT_APEX',
    name: 'APEX',
    role: 'engine',
    description: 'Peak performance optimization engine. Identifies hot paths, redundant allocations, algorithmic bottlenecks, and cache-miss patterns across any language or paradigm.',
    inherited: false,
    capabilities: [
      'hot_path_detection',
      'algorithmic_complexity_analysis',
      'memory_allocation_profiling',
      'cache_optimization',
      'loop_vectorization_hints',
      'branch_prediction_patterns',
      'lazy_evaluation_opportunities',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'ULT_CONDUIT',
    name: 'CONDUIT',
    role: 'engine',
    description: 'Data pipeline orchestration engine. Discovers ETL patterns, stream processing architectures, backpressure handling, and data transformation chains.',
    inherited: false,
    capabilities: [
      'etl_pipeline_detection',
      'stream_processing_patterns',
      'backpressure_handling',
      'data_transformation_chains',
      'batch_vs_stream_analysis',
      'data_partitioning_strategies',
      'pipeline_idempotency',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'ULT_PRISM',
    name: 'PRISM',
    role: 'engine',
    description: 'Multi-paradigm code analysis engine. Recognizes OOP, functional, reactive, procedural, and actor-model patterns and scores paradigm coherence.',
    inherited: false,
    capabilities: [
      'paradigm_detection',
      'design_pattern_recognition',
      'solid_principle_scoring',
      'functional_purity_analysis',
      'reactive_stream_mapping',
      'actor_model_detection',
      'paradigm_mixing_warnings',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'ULT_GENESIS',
    name: 'GENESIS',
    role: 'engine',
    description: 'Architecture seeding engine. Detects boilerplate, scaffolding patterns, project structure conventions, and architecture maturity level.',
    inherited: false,
    capabilities: [
      'boilerplate_detection',
      'project_structure_analysis',
      'architecture_maturity_scoring',
      'convention_compliance',
      'module_boundary_detection',
      'dependency_injection_patterns',
      'layer_separation_analysis',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'ULT_FLUX',
    name: 'FLUX',
    role: 'engine',
    description: 'State management engine. Discovers state flow patterns — Redux, MobX, signals, atoms, stores, event sourcing, CQRS, and state machine architectures.',
    inherited: false,
    capabilities: [
      'state_management_detection',
      'event_sourcing_patterns',
      'cqrs_architecture_detection',
      'state_machine_analysis',
      'immutability_scoring',
      'side_effect_isolation',
      'derived_state_optimization',
    ],
    weight: 0.025,
    classification: 'hybrid',
  },
  {
    id: 'ULT_CRUCIBLE',
    name: 'CRUCIBLE',
    role: 'engine',
    description: 'Stress analysis engine. Identifies load-bearing code paths, resource exhaustion risks, connection pool sizing, and scalability bottlenecks.',
    inherited: false,
    capabilities: [
      'load_bearing_path_detection',
      'resource_exhaustion_analysis',
      'connection_pool_sizing',
      'scalability_bottleneck_detection',
      'memory_leak_patterns',
      'thread_starvation_risks',
      'gc_pressure_estimation',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'ULT_MERIDIAN',
    name: 'MERIDIAN',
    role: 'engine',
    description: 'API governance engine. Validates API contracts, REST maturity levels, versioning strategies, schema evolution, and interface consistency.',
    inherited: false,
    capabilities: [
      'api_contract_validation',
      'rest_maturity_scoring',
      'versioning_strategy_detection',
      'schema_evolution_analysis',
      'breaking_change_detection',
      'pagination_pattern_analysis',
      'rate_limiting_governance',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'ULT_DYNAMO',
    name: 'DYNAMO',
    role: 'engine',
    description: 'Concurrency engine. Discovers async patterns, parallelism strategies, mutex usage, race condition risks, and deadlock potential.',
    inherited: false,
    capabilities: [
      'async_pattern_detection',
      'parallelism_strategy_analysis',
      'race_condition_detection',
      'deadlock_potential_scoring',
      'mutex_lock_analysis',
      'promise_chain_optimization',
      'worker_thread_patterns',
    ],
    weight: 0.025,
    classification: 'active',
  },
];

/* ─── Universal Agents (gap-fillers) ─── */

const ULTIMATE_AGENTS: VerticalPrimitive[] = [
  {
    id: 'ULT_SENTINEL',
    name: 'SENTINEL',
    role: 'agent',
    description: 'Universal input validation agent. Discovers sanitization patterns, boundary enforcement, type coercion risks, and injection vectors across any input surface.',
    inherited: false,
    capabilities: [
      'input_sanitization_patterns',
      'type_coercion_detection',
      'boundary_enforcement',
      'injection_vector_analysis',
      'schema_validation_patterns',
      'content_type_enforcement',
      'encoding_normalization',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'ULT_CATALYST',
    name: 'CATALYST',
    role: 'agent',
    description: 'Dependency optimization agent. Detects dead code, unused imports, circular dependencies, bundle bloat, and tree-shaking opportunities.',
    inherited: false,
    capabilities: [
      'dead_code_detection',
      'unused_import_analysis',
      'circular_dependency_detection',
      'bundle_size_optimization',
      'tree_shaking_opportunities',
      'duplicate_code_detection',
      'dependency_freshness_scoring',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'ULT_ARBITER',
    name: 'ARBITER',
    role: 'agent',
    description: 'Error handling strategy agent. Analyzes try-catch patterns, error propagation, recovery strategies, graceful degradation, and fault tolerance.',
    inherited: false,
    capabilities: [
      'error_propagation_analysis',
      'try_catch_pattern_scoring',
      'graceful_degradation_detection',
      'fault_tolerance_patterns',
      'retry_strategy_analysis',
      'circuit_breaker_detection',
      'error_boundary_coverage',
    ],
    weight: 0.025,
    classification: 'hybrid',
  },
  {
    id: 'ULT_HERALD',
    name: 'HERALD',
    role: 'agent',
    description: 'Observability agent. Discovers logging patterns, metrics collection, distributed tracing, health checks, and alerting strategies.',
    inherited: false,
    capabilities: [
      'logging_pattern_analysis',
      'metrics_collection_detection',
      'distributed_tracing_patterns',
      'health_check_coverage',
      'alerting_strategy_analysis',
      'log_level_governance',
      'structured_logging_scoring',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'ULT_NOMAD',
    name: 'NOMAD',
    role: 'agent',
    description: 'Cross-platform portability agent. Detects platform-specific code, environment coupling, OS dependencies, and containerization readiness.',
    inherited: false,
    capabilities: [
      'platform_coupling_detection',
      'environment_variable_governance',
      'os_dependency_analysis',
      'containerization_readiness',
      'cross_runtime_compatibility',
      'path_handling_portability',
      'encoding_portability',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'ULT_WELDER',
    name: 'WELDER',
    role: 'agent',
    description: 'Integration pattern agent. Discovers REST, GraphQL, gRPC, WebSocket, message queue, and webhook integration patterns and scores coupling.',
    inherited: false,
    capabilities: [
      'rest_integration_patterns',
      'graphql_schema_analysis',
      'grpc_service_detection',
      'websocket_pattern_analysis',
      'message_queue_patterns',
      'webhook_governance',
      'integration_coupling_scoring',
    ],
    weight: 0.025,
    classification: 'hybrid',
  },
  {
    id: 'ULT_ORACLE',
    name: 'ORACLE',
    role: 'agent',
    description: 'Configuration governance agent. Discovers config management patterns, feature flags, environment-specific overrides, and secrets handling.',
    inherited: false,
    capabilities: [
      'config_management_patterns',
      'feature_flag_detection',
      'environment_override_analysis',
      'secrets_handling_audit',
      'config_drift_detection',
      'default_value_governance',
      'config_schema_validation',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'ULT_PHOENIX',
    name: 'PHOENIX',
    role: 'agent',
    description: 'Migration and upgrade agent. Detects version migration patterns, deprecated API usage, upgrade pathways, and backward compatibility strategies.',
    inherited: false,
    capabilities: [
      'deprecation_detection',
      'migration_pattern_analysis',
      'version_compatibility_scoring',
      'backward_compat_strategies',
      'database_migration_patterns',
      'schema_evolution_detection',
      'upgrade_pathway_mapping',
    ],
    weight: 0.025,
    classification: 'hybrid',
  },
];

/* ─── All Ultimate expansion primitives for export ─── */

export const ULTIMATE_ALL_ENGINES = ULTIMATE_ENGINES;
export const ULTIMATE_ALL_AGENTS = ULTIMATE_AGENTS;

/* ─── Affinity signals for the universal pool scanner ─── */

export const ULTIMATE_AFFINITY_SIGNALS: Record<string, string[]> = {
  ULT_APEX: ['performance', 'optimize', 'cache', 'hot', 'bottleneck', 'latency', 'fast', 'slow', 'benchmark', 'profile', 'allocat'],
  ULT_CONDUIT: ['pipeline', 'etl', 'stream', 'transform', 'batch', 'ingest', 'kafka', 'queue', 'pubsub', 'event_stream'],
  ULT_PRISM: ['class', 'interface', 'abstract', 'extends', 'implements', 'functional', 'map', 'reduce', 'filter', 'observable', 'subscribe', 'actor'],
  ULT_GENESIS: ['scaffold', 'template', 'boilerplate', 'init', 'setup', 'config', 'convention', 'structure', 'bootstrap', 'module'],
  ULT_FLUX: ['state', 'store', 'reducer', 'dispatch', 'action', 'selector', 'atom', 'signal', 'computed', 'derived', 'event_source', 'cqrs'],
  ULT_CRUCIBLE: ['load', 'stress', 'pool', 'connection', 'exhaust', 'memory', 'leak', 'thread', 'gc', 'scale', 'concurrent'],
  ULT_MERIDIAN: ['api', 'endpoint', 'route', 'swagger', 'openapi', 'schema', 'version', 'contract', 'rest', 'graphql', 'grpc'],
  ULT_DYNAMO: ['async', 'await', 'promise', 'parallel', 'concurrent', 'mutex', 'lock', 'race', 'deadlock', 'worker', 'thread', 'channel'],
  ULT_SENTINEL: ['sanitize', 'validate', 'escape', 'inject', 'xss', 'csrf', 'input', 'boundary', 'coerce', 'parse'],
  ULT_CATALYST: ['unused', 'dead', 'circular', 'import', 'bundle', 'tree_shake', 'duplicate', 'depend', 'bloat', 'prune'],
  ULT_ARBITER: ['error', 'catch', 'throw', 'retry', 'fallback', 'circuit', 'breaker', 'recover', 'degrade', 'fault', 'resilient'],
  ULT_HERALD: ['log', 'metric', 'trace', 'monitor', 'alert', 'health', 'telemetry', 'observ', 'span', 'instrument'],
  ULT_NOMAD: ['platform', 'os', 'container', 'docker', 'portable', 'cross', 'runtime', 'env', 'path', 'encoding'],
  ULT_WELDER: ['rest', 'graphql', 'grpc', 'websocket', 'webhook', 'rabbitmq', 'kafka', 'nats', 'mqtt', 'integration', 'adapter'],
  ULT_ORACLE: ['config', 'env', 'feature_flag', 'toggle', 'secret', 'override', 'default', 'setting', 'option', 'preference'],
  ULT_PHOENIX: ['migrate', 'upgrade', 'deprecat', 'legacy', 'compat', 'version', 'schema', 'migration', 'backward', 'breaking'],
};

/* ─── Substrate Config Builder ─── */

export function getUltimateSubstrate(): VerticalSubstrateConfig {
  // Ultimate does NOT use assembleVerticalPrimitives — it has no spine lock.
  // The 16 Universal primitives serve as the "default" display surface.
  // During actual Ascension, the Universal Pool Scanner replaces all 40 slots.
  const primitives: VerticalPrimitive[] = [...ULTIMATE_ENGINES, ...ULTIMATE_AGENTS];
  return {
    verticalId: 'ultimate-v1',
    name: 'CMPSBL ULTIMATE™',
    tagline: '120 Candidates. 40 Slots. Zero Restrictions. Maximum Compounding.',
    domain: 'ultimate' as any,
    subdomain: 'ultimate',
    url: 'https://ultimate.cmpsbl.com',
    status: 'active',
    version: '1.0.0',
    primitives,
    clmCurriculum: {
      cyclesPerDay: 2400,
      curriculum: [
        'universal_pattern_recognition',
        'cross_domain_synthesis',
        'paradigm_agnostic_analysis',
        'full_spectrum_hardening',
        'maximum_compounding_strategies',
      ],
      priorityPrimitives: ['ULT_APEX', 'ULT_PRISM', 'ULT_ARBITER', 'ULT_DYNAMO'],
      batchSize: 8,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 6,
      scannerFocus: [
        'cross_vertical_patterns',
        'universal_hardening',
        'paradigm_fusion',
        'maximum_coverage_compositions',
      ],
      contributesToGlobal: true,
      retentionDays: 90,
    },
    ascensionConfig: {
      maxCapabilities: 40,
      enhancementArchetypes: [
        'Universal Hardening',
        'Cross-Domain Synthesis',
        'Maximum Coverage',
        'Paradigm Fusion',
        'Full-Spectrum Defense',
      ],
      cjpiWeights: {
        security: 0.25,
        performance: 0.25,
        reliability: 0.25,
        maintainability: 0.25,
      },
      collisionPriority: [],
    },
    theme: {
      primaryHue: 270,
      icon: 'Crown',
      gradientAngle: 135,
      darkAccent: 'hsl(270 80% 65%)',
      lightAccent: 'hsl(270 70% 50%)',
    },
    createdAt: '2026-04-04T00:00:00Z',
    updatedAt: '2026-04-04T00:00:00Z',
  };
}

/* ─── Public accessors ─── */

export function getUltimatePrimitives(): VerticalPrimitive[] {
  return getUltimateSubstrate().primitives;
}

export function getUltimateEngines(): VerticalPrimitive[] {
  return [...ULTIMATE_ENGINES];
}

export function getUltimateAgents(): VerticalPrimitive[] {
  return [...ULTIMATE_AGENTS];
}

export function getAllUltimateCapabilities(): string[] {
  const all: string[] = [];
  for (const p of [...ULTIMATE_ENGINES, ...ULTIMATE_AGENTS]) {
    all.push(...p.capabilities);
  }
  return all;
}
