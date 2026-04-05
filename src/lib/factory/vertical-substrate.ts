/**
 * CMPSBL® Vertical Substrate Architecture
 * 
 * The Factory thesis: the 40-primitive matrix is a TEMPLATE.
 * Each vertical substrate inherits the Organ/Layer spine (24 primitives)
 * and hot-swaps Engines (8) and Agents (8) for domain-specific cognitive infrastructure.
 * 
 * Model: Shared spine + vertical-specific execution surface
 * Isolation: Hybrid (shared governance DB + vertical-specific tables)
 */

import type { SpecialtyDomain } from './specialty-substrates';

/* ─── Primitive Classification ─── */

export type PrimitiveRole = 'organ' | 'layer' | 'engine' | 'agent';

export interface VerticalPrimitive {
  id: string;
  name: string;
  role: PrimitiveRole;
  description: string;
  /** Whether this primitive is inherited from the core spine (organs/layers) */
  inherited: boolean;
  /** Whether this primitive replaces a core engine/agent */
  replaces?: string;
  /** Capabilities this primitive provides */
  capabilities: string[];
  /** Health weight in the vertical's integrity calculation */
  weight: number;
  /** Classification for Ascension recommendations */
  classification: 'active' | 'passive' | 'hybrid';
}

/* ─── Substrate Instance ─── */

export type VerticalSubstrateStatus = 'blueprint' | 'assembling' | 'active' | 'maintenance' | 'archived';

export interface VerticalSubstrateConfig {
  /** Unique vertical identifier */
  verticalId: string;
  /** Display name */
  name: string;
  /** Marketing tagline */
  tagline: string;
  /** Domain category from specialty-substrates */
  domain: SpecialtyDomain;
  /** Subdomain under cmpsbl.com */
  subdomain: string;
  /** Full URL */
  url: string;
  /** Status of this vertical instance */
  status: VerticalSubstrateStatus;
  /** Version of the vertical substrate */
  version: string;
  /** The 40 primitives for THIS vertical (24 inherited + up to 16 custom) */
  primitives: VerticalPrimitive[];
  /** CLM curriculum specific to this vertical */
  clmCurriculum: VerticalCLMConfig;
  /** Memory Stream configuration */
  memoryStreamConfig: VerticalMemoryConfig;
  /** Ascension tuning for this vertical */
  ascensionConfig: VerticalAscensionConfig;
  /** Theme overrides */
  theme: VerticalTheme;
  /** Created timestamp */
  createdAt: string;
  /** Last updated */
  updatedAt: string;
}

/* ─── CLM Configuration ─── */

export interface VerticalCLMConfig {
  /** Cycles per day allocated to this vertical */
  cyclesPerDay: number;
  /** Domain-specific learning topics */
  curriculum: string[];
  /** Priority primitives for learning (health < 70 gets extra cycles) */
  priorityPrimitives: string[];
  /** Batch size for module learning */
  batchSize: number;
}

/* ─── Memory Stream Configuration ─── */

export interface VerticalMemoryConfig {
  /** Autonomous cycle interval in hours */
  cycleIntervalHours: number;
  /** Domain-specific scanner focus areas */
  scannerFocus: string[];
  /** Whether to contribute to the global Memory Stream pool */
  contributesToGlobal: boolean;
  /** Retention policy in days */
  retentionDays: number;
}

/* ─── Ascension Configuration ─── */

export interface VerticalAscensionConfig {
  /** Maximum capabilities per restoration */
  maxCapabilities: number;
  /** Domain-specific enhancement archetypes */
  enhancementArchetypes: string[];
  /** CJPI scoring weights tuned for this vertical */
  cjpiWeights: {
    security: number;
    performance: number;
    reliability: number;
    maintainability: number;
  };
  /** Primitives prioritized in collision results */
  collisionPriority: string[];
}

/* ─── Theme ─── */

export interface VerticalTheme {
  /** Primary accent color (HSL) */
  primaryHue: number;
  /** Icon identifier */
  icon: string;
  /** Gradient direction */
  gradientAngle: number;
  /** Dark mode primary */
  darkAccent: string;
  /** Light mode primary */
  lightAccent: string;
}

/* ─── Core Spine (always inherited) ─── */

const SPINE_ORGANS: VerticalPrimitive[] = [
  { id: 'CORE', name: 'CORE', role: 'organ', description: 'Kernel boot, matrix integrity', inherited: true, capabilities: ['boot_sequence', 'integrity_check', 'lifecycle_management'], weight: 0.110, classification: 'active' },
  { id: 'SYSTEM', name: 'SYSTEM', role: 'organ', description: 'Lifecycle, configuration, environment', inherited: true, capabilities: ['config_management', 'env_resolution', 'lifecycle_events'], weight: 0.035, classification: 'passive' },
  { id: 'BRAIN', name: 'BRAIN', role: 'organ', description: 'Reasoning and knowledge fusion', inherited: true, capabilities: ['knowledge_store', 'reasoning_engine', 'pattern_matching'], weight: 0.040, classification: 'active' },
  { id: 'MEMORY', name: 'MEMORY', role: 'organ', description: 'Persistent state across 4 tiers', inherited: true, capabilities: ['hot_memory', 'warm_memory', 'cold_memory', 'glacier_memory'], weight: 0.040, classification: 'passive' },
  { id: 'DREAM', name: 'DREAM', role: 'organ', description: 'Sub-threshold synthesis, pre-conscious emergence', inherited: true, capabilities: ['fragment_collection', 'resonance_amplification', 'emergence_detection'], weight: 0.035, classification: 'passive' },
  { id: 'NERVE', name: 'NERVE', role: 'organ', description: 'Autonomic signal routing', inherited: true, capabilities: ['signal_dispatch', 'reaction_chains', 'auto_activation'], weight: 0.025, classification: 'active' },
  { id: 'IDENTITY', name: 'IDENTITY', role: 'organ', description: 'Authentication and identity resolution', inherited: true, capabilities: ['auth_resolution', 'session_management', 'identity_binding'], weight: 0.020, classification: 'passive' },
  { id: 'RELAY', name: 'RELAY', role: 'organ', description: 'Event routing and message passing', inherited: true, capabilities: ['event_routing', 'message_passing', 'pub_sub'], weight: 0.020, classification: 'active' },
  { id: 'AUDIT', name: 'AUDIT', role: 'organ', description: 'Tamper-evident logging', inherited: true, capabilities: ['immutable_log', 'chain_anchoring', 'compliance_trail'], weight: 0.020, classification: 'passive' },
  { id: 'RIPPLE', name: 'RIPPLE', role: 'organ', description: 'Compliance and boundary enforcement', inherited: true, capabilities: ['boundary_enforcement', 'compliance_check', 'policy_propagation'], weight: 0.020, classification: 'hybrid' },
  { id: 'ACCESS', name: 'ACCESS', role: 'organ', description: 'Authorization and permission management', inherited: true, capabilities: ['rbac', 'permission_check', 'scope_validation'], weight: 0.020, classification: 'passive' },
  { id: 'GOVERNANCE', name: 'GOVERNANCE', role: 'organ', description: 'Supervisory legitimacy checks', inherited: true, capabilities: ['legitimacy_check', 'action_approval', 'mutation_gate'], weight: 0.030, classification: 'active' },
];

const SPINE_LAYERS: VerticalPrimitive[] = [
  { id: 'DEFENSE', name: 'DEFENSE', role: 'layer', description: 'Terminal containment boundary', inherited: true, capabilities: ['threat_assessment', 'perimeter_security', 'encryption_layer'], weight: 0.030, classification: 'active' },
  { id: 'IMMUNITY', name: 'IMMUNITY', role: 'layer', description: 'Cross-cutting transformation fabric', inherited: true, capabilities: ['anomaly_detection', 'self_healing', 'quarantine'], weight: 0.020, classification: 'hybrid' },
  { id: 'INTENT', name: 'INTENT', role: 'layer', description: 'Purpose resolution and routing', inherited: true, capabilities: ['intent_parsing', 'goal_extraction', 'action_mapping'], weight: 0.020, classification: 'active' },
  { id: 'ATLAS', name: 'ATLAS', role: 'layer', description: 'Governance hub and topology mapping', inherited: true, capabilities: ['topology_map', 'capability_discovery', 'health_grid'], weight: 0.020, classification: 'passive' },
  { id: 'ENGINEER', name: 'ENGINEER', role: 'layer', description: 'Maintenance intelligence', inherited: true, capabilities: ['maintenance_proposals', 'patch_planning', 'drift_detection'], weight: 0.020, classification: 'hybrid' },
  { id: 'DECODE', name: 'DECODE', role: 'layer', description: 'Conversational interface', inherited: true, capabilities: ['natural_language', 'context_resolution', 'conversation_state'], weight: 0.015, classification: 'active' },
  { id: 'ENCODE', name: 'ENCODE', role: 'layer', description: 'Systems engineering and code generation', inherited: true, capabilities: ['code_generation', 'patch_writing', 'blueprint_execution'], weight: 0.015, classification: 'active' },
  { id: 'VISION', name: 'VISION', role: 'layer', description: 'Visual analysis and perception', inherited: true, capabilities: ['image_analysis', 'visual_reasoning', 'pattern_recognition'], weight: 0.015, classification: 'passive' },
  { id: 'ECONOMY', name: 'ECONOMY', role: 'layer', description: 'Cost optimization and resource allocation', inherited: true, capabilities: ['cost_tracking', 'resource_allocation', 'roi_calculation'], weight: 0.015, classification: 'passive' },
  { id: 'SANDBOX', name: 'SANDBOX', role: 'layer', description: 'Isolated execution environment', inherited: true, capabilities: ['isolated_execution', 'safe_eval', 'containment'], weight: 0.010, classification: 'passive' },
  { id: 'INCLUSIVE', name: 'INCLUSIVE', role: 'layer', description: 'Accessibility and adaptation', inherited: true, capabilities: ['a11y_enforcement', 'adaptive_interface', 'universal_design'], weight: 0.010, classification: 'passive' },
  { id: 'MEDIC', name: 'MEDIC', role: 'layer', description: 'Diagnostic triage and autonomous repair assessment', inherited: true, capabilities: ['health_diagnostic', 'recovery_protocol', 'system_triage', 'severity_assessment', 'repair_planning', 'damage_analysis'], weight: 0.015, classification: 'hybrid' },
];

/**
 * Conceptual Spine Extensions
 * These 7 primitives exist as high-intent signal mappings in the scanner
 * and are now materialized as selectable candidates for the Universal Pool.
 * They are NOT part of the 24-spine (12+12) — they are spine-class
 * primitives available exclusively to the Ultimate scanner's 136+ pool.
 */
export const CONCEPTUAL_SPINE_PRIMITIVES: VerticalPrimitive[] = [
  {
    id: 'CONSCIENCE',
    name: 'CONSCIENCE',
    role: 'organ',
    description: 'Ethical pre-flight interception and moral boundary enforcement',
    inherited: false,
    capabilities: [
      'ethical_preflight',
      'bias_detection',
      'moral_boundary_check',
      'transparency_audit',
      'blocked_category_enforcement',
      'review_gate',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'SOVEREIGN',
    name: 'SOVEREIGN',
    role: 'organ',
    description: 'Policy compliance classification and jurisdictional governance',
    inherited: false,
    capabilities: [
      'policy_classification',
      'jurisdictional_routing',
      'consent_management',
      'data_sovereignty',
      'regulation_mapping',
      'compliance_scoring',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'SHADOW',
    name: 'SHADOW',
    role: 'layer',
    description: 'Canary deployment, A/B comparison, and pre/post-snapshot diffing',
    inherited: false,
    capabilities: [
      'canary_deployment',
      'ab_comparison',
      'pre_post_snapshot',
      'baseline_tracking',
      'shadow_execution',
      'zero_downtime_swap',
    ],
    weight: 0.020,
    classification: 'hybrid',
  },
  {
    id: 'REFLEX',
    name: 'REFLEX',
    role: 'layer',
    description: 'Circuit breaker, retry logic, and graceful degradation patterns',
    inherited: false,
    capabilities: [
      'circuit_breaker',
      'retry_with_backoff',
      'timeout_management',
      'graceful_degradation',
      'fallback_routing',
      'cooldown_enforcement',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'COMPASS',
    name: 'COMPASS',
    role: 'layer',
    description: 'Priority ranking, severity ordering, and confidence-weighted decision routing',
    inherited: false,
    capabilities: [
      'priority_ranking',
      'severity_ordering',
      'confidence_weighting',
      'threshold_gating',
      'risk_scoring',
      'triage_routing',
    ],
    weight: 0.015,
    classification: 'active',
  },
  {
    id: 'EVOLUTION',
    name: 'EVOLUTION',
    role: 'layer',
    description: 'Autonomous mutation, patch generation, and fitness-selected upgrades',
    inherited: false,
    capabilities: [
      'mutation_planning',
      'fitness_evaluation',
      'patch_generation',
      'version_upgrade',
      'config_evolution',
      'adaptive_selection',
    ],
    weight: 0.015,
    classification: 'hybrid',
  },
  {
    id: 'BEACON',
    name: 'BEACON',
    role: 'layer',
    description: 'Structured health signals, telemetry emission, and uptime heartbeats',
    inherited: false,
    capabilities: [
      'health_signal_emission',
      'telemetry_dispatch',
      'heartbeat_generation',
      'uptime_tracking',
      'status_broadcasting',
      'monitoring_integration',
    ],
    weight: 0.015,
    classification: 'passive',
  },
];

/**
 * Get the 24 inherited spine primitives (organs + layers)
 * These are the non-negotiable backbone of every vertical substrate
 */
export function getSpinePrimitives(): VerticalPrimitive[] {
  return [...SPINE_ORGANS, ...SPINE_LAYERS];
}

/**
 * Get the 7 conceptual spine extensions (available to Ultimate pool only)
 */
export function getConceptualSpinePrimitives(): VerticalPrimitive[] {
  return [...CONCEPTUAL_SPINE_PRIMITIVES];
}

/**
 * Assemble a complete vertical substrate primitive set
 * Spine (24) + custom engines (up to 8) + custom agents (up to 8) = 40
 */
export function assembleVerticalPrimitives(
  customEngines: VerticalPrimitive[],
  customAgents: VerticalPrimitive[]
): VerticalPrimitive[] {
  if (customEngines.length > 8) {
    throw new Error(`Maximum 8 engines per vertical substrate, got ${customEngines.length}`);
  }
  if (customAgents.length > 8) {
    throw new Error(`Maximum 8 agents per vertical substrate, got ${customAgents.length}`);
  }

  return [
    ...SPINE_ORGANS,
    ...SPINE_LAYERS,
    ...customEngines,
    ...customAgents,
  ];
}

/**
 * Calculate vertical substrate health from its primitive set
 */
export function calculateVerticalHealth(
  primitives: VerticalPrimitive[],
  healthScores: Map<string, number>
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const p of primitives) {
    const score = healthScores.get(p.id) ?? 50;
    weightedSum += score * p.weight;
    totalWeight += p.weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Validate a vertical substrate configuration
 */
export function validateVerticalConfig(config: VerticalSubstrateConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const organs = config.primitives.filter(p => p.role === 'organ');
  const layers = config.primitives.filter(p => p.role === 'layer');
  const engines = config.primitives.filter(p => p.role === 'engine');
  const agents = config.primitives.filter(p => p.role === 'agent');

  if (organs.length !== 12) errors.push(`Expected 12 organs, got ${organs.length}`);
  if (layers.length !== 12) errors.push(`Expected 12 layers, got ${layers.length}`);
  if (engines.length < 1 || engines.length > 8) errors.push(`Engines must be 1-8, got ${engines.length}`);
  if (agents.length < 1 || agents.length > 8) errors.push(`Agents must be 1-8, got ${agents.length}`);

  const inheritedOrgans = organs.filter(o => o.inherited);
  if (inheritedOrgans.length !== 12) errors.push('All 12 organs must be inherited from spine');

  const inheritedLayers = layers.filter(l => l.inherited);
  if (inheritedLayers.length !== 12) errors.push('All 12 layers must be inherited from spine');

  const totalWeight = config.primitives.reduce((sum, p) => sum + p.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.01) errors.push(`Primitive weights must sum to 1.0, got ${totalWeight.toFixed(3)}`);

  if (!config.subdomain.match(/^[a-z0-9-]+$/)) errors.push('Subdomain must be lowercase alphanumeric with hyphens');

  return { valid: errors.length === 0, errors };
}
