/**
 * CMPSBL® Reserve Primitive Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Manages domain-specialized "Reserve Primitives" that stack on top of the
 * 40-primitive Ascension as Vertical Packs. Each vertical defines 5 reserve
 * primitives tuned for a specific market (agents, DeFi, security, etc.).
 *
 * Architecture: Hybrid Stacking — the core 40-primitive matrix is never
 * modified. Reserve primitives run as an additional 5-primitive pass after
 * the main Ascension, producing domain-specialized discoveries.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type VerticalSlug = 'agent-forge' | 'defi-forge' | 'security-forge' | 'iot-forge' | 'data-forge';

export interface ReservePrimitive {
  /** Unique identifier within the vertical */
  id: string;
  /** Display name (e.g. SENTINEL, SWARM) */
  name: string;
  /** Functional category for scoring affinity */
  category: 'defense' | 'coordination' | 'optimization' | 'identity' | 'arbitration' | 'compliance' | 'telemetry' | 'pipeline';
  /** Parent vertical slug */
  vertical: VerticalSlug;
  /** Human-readable description of what this primitive discovers */
  description: string;
  /** Specific capabilities this primitive searches for in user code */
  capabilities: string[];
  /** Keywords that boost affinity score when found in ingested code */
  affinitySignals: string[];
  /** Base weight for CJPI scoring (0–1) */
  baseWeight: number;
  /** Icon key for UI rendering */
  icon: string;
}

export interface VerticalPack {
  slug: VerticalSlug;
  name: string;
  tagline: string;
  description: string;
  primitives: ReservePrimitive[];
  /** Minimum product tier required */
  requiredTier: 'creator' | 'architect';
  /** Whether this vertical is currently available */
  available: boolean;
  /** Marketing color accent (HSL values) */
  accentHue: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — AGENT FORGE VERTICAL (First Vertical)
// ═══════════════════════════════════════════════════════════════════════════════

const AGENT_FORGE_PRIMITIVES: ReservePrimitive[] = [
  {
    id: 'reserve-sentinel',
    name: 'SENTINEL',
    category: 'defense',
    vertical: 'agent-forge',
    description: 'Behavioral threat detection, prompt injection defense, and adversarial input hardening',
    capabilities: [
      'input_sanitization_patterns',
      'prompt_injection_detection',
      'behavioral_anomaly_guards',
      'output_validation_chains',
      'adversarial_resilience_scoring',
      'jailbreak_pattern_recognition',
      'token_smuggling_detection',
      'context_boundary_enforcement',
      'recursive_prompt_traps',
      'payload_depth_analysis',
    ],
    affinitySignals: [
      'prompt', 'injection', 'sanitize', 'validate', 'guard', 'filter',
      'malicious', 'attack', 'security', 'defense', 'threat', 'jailbreak',
      'input_check', 'boundary', 'escape', 'restrict', 'payload', 'smuggle',
    ],
    baseWeight: 0.85,
    icon: 'Shield',
  },
  {
    id: 'reserve-swarm',
    name: 'SWARM',
    category: 'coordination',
    vertical: 'agent-forge',
    description: 'Multi-agent coordination, task delegation, and consensus orchestration',
    capabilities: [
      'task_delegation_patterns',
      'agent_communication_protocols',
      'consensus_mechanisms',
      'work_distribution_strategies',
      'inter_agent_state_sync',
      'leader_election_protocols',
      'capability_based_routing',
      'swarm_health_quorum',
      'hierarchical_task_decomposition',
      'agent_lifecycle_management',
    ],
    affinitySignals: [
      'agent', 'delegate', 'coordinate', 'task', 'worker', 'queue',
      'dispatch', 'orchestrate', 'multi', 'parallel', 'swarm', 'crew',
      'team', 'collaborate', 'handoff', 'pipeline', 'leader', 'election',
    ],
    baseWeight: 0.90,
    icon: 'Network',
  },
  {
    id: 'reserve-thrift',
    name: 'THRIFT',
    category: 'optimization',
    vertical: 'agent-forge',
    description: 'Cost-aware model routing, token budget management, and compute optimization',
    capabilities: [
      'token_budget_enforcement',
      'model_routing_optimization',
      'cost_per_action_tracking',
      'tiered_model_selection',
      'batch_consolidation_patterns',
      'prompt_compression_strategies',
      'cache_hit_maximization',
      'latency_cost_tradeoff_scoring',
      'idle_compute_reclamation',
      'context_window_packing',
    ],
    affinitySignals: [
      'token', 'cost', 'budget', 'model', 'gpt', 'claude', 'llm',
      'api_call', 'rate_limit', 'pricing', 'tier', 'fallback',
      'cheap', 'expensive', 'optimize', 'batch', 'cache', 'compress',
    ],
    baseWeight: 0.80,
    icon: 'Coins',
  },
  {
    id: 'reserve-persona',
    name: 'PERSONA',
    category: 'identity',
    vertical: 'agent-forge',
    description: 'Identity persistence, personality continuity across sessions, and behavioral consistency',
    capabilities: [
      'session_state_persistence',
      'personality_vector_extraction',
      'behavioral_consistency_scoring',
      'memory_window_management',
      'identity_drift_detection',
      'tone_calibration_engine',
      'expertise_domain_binding',
      'cross_session_goal_tracking',
      'adaptive_verbosity_control',
      'user_preference_imprinting',
    ],
    affinitySignals: [
      'persona', 'identity', 'memory', 'session', 'context', 'history',
      'personality', 'character', 'system_prompt', 'role', 'behavior',
      'state', 'persistent', 'recall', 'continuity', 'profile', 'tone', 'style',
    ],
    baseWeight: 0.75,
    icon: 'User',
  },
  {
    id: 'reserve-arbiter',
    name: 'ARBITER',
    category: 'arbitration',
    vertical: 'agent-forge',
    description: 'Conflict resolution between competing agent goals, priority negotiation, and deadlock prevention',
    capabilities: [
      'goal_conflict_detection',
      'priority_negotiation_protocols',
      'deadlock_prevention_patterns',
      'resource_contention_resolution',
      'decision_audit_trails',
      'weighted_voting_mechanisms',
      'escalation_policy_enforcement',
      'fairness_constraint_balancing',
      'timeout_circuit_breakers',
      'multi_objective_pareto_ranking',
    ],
    affinitySignals: [
      'conflict', 'priority', 'resolve', 'deadlock', 'contention',
      'negotiate', 'arbiter', 'decision', 'vote', 'consensus',
      'lock', 'mutex', 'semaphore', 'race', 'compete', 'resource', 'escalate', 'fairness',
    ],
    baseWeight: 0.78,
    icon: 'Scale',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — VERTICAL PACK REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const VERTICAL_PACKS: Map<VerticalSlug, VerticalPack> = new Map([
  ['agent-forge', {
    slug: 'agent-forge',
    name: 'Agent Forge',
    tagline: 'Turn Any Agent Into 5 Production Specialists',
    description: 'Specialized 5-primitive pass that discovers defense, coordination, cost optimization, identity persistence, and conflict resolution capabilities in your agent code.',
    primitives: AGENT_FORGE_PRIMITIVES,
    requiredTier: 'architect',
    available: true,
    accentHue: 280,
  }],
  ['defi-forge', {
    slug: 'defi-forge',
    name: 'DeFi Forge',
    tagline: 'Harden Smart Contracts With Structural Discovery',
    description: 'Discovers ledger integrity, oracle safety, vault patterns, compliance checks, and arbitration mechanisms in DeFi code.',
    primitives: [],
    requiredTier: 'architect',
    available: false,
    accentHue: 160,
  }],
  ['security-forge', {
    slug: 'security-forge',
    name: 'Security Forge',
    tagline: 'Discover Hidden Security Surfaces',
    description: 'Finds sentinel patterns, shadow testing, cloaking strategies, forensic trails, and honeypot architectures in your codebase.',
    primitives: [],
    requiredTier: 'architect',
    available: false,
    accentHue: 0,
  }],
  ['iot-forge', {
    slug: 'iot-forge',
    name: 'IoT Forge',
    tagline: 'Edge Intelligence For Connected Devices',
    description: 'Discovers pulse monitoring, mesh communication, telemetry pipelines, edge computation, and failover patterns.',
    primitives: [],
    requiredTier: 'architect',
    available: false,
    accentHue: 200,
  }],
  ['data-forge', {
    slug: 'data-forge',
    name: 'Data Forge',
    tagline: 'Structural Discovery For Data Pipelines',
    description: 'Finds pipeline orchestration, schema evolution, data lineage, quality gates, and archival patterns in data engineering code.',
    primitives: [],
    requiredTier: 'architect',
    available: false,
    accentHue: 40,
  }],
]);

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/** Get a vertical pack by slug */
export function getVerticalPack(slug: VerticalSlug): VerticalPack | null {
  return VERTICAL_PACKS.get(slug) ?? null;
}

/** List all vertical packs (optionally filter by availability) */
export function listVerticalPacks(onlyAvailable = false): VerticalPack[] {
  const all = Array.from(VERTICAL_PACKS.values());
  return onlyAvailable ? all.filter(v => v.available) : all;
}

/** Get the reserve primitives for a specific vertical */
export function getReservePrimitives(slug: VerticalSlug): ReservePrimitive[] {
  return VERTICAL_PACKS.get(slug)?.primitives ?? [];
}

/**
 * Score how well a vertical's reserve primitives match the ingested code.
 * Returns 0–1 affinity score based on signal keyword matching.
 */
export function scoreVerticalAffinity(slug: VerticalSlug, codeContent: string): number {
  const primitives = getReservePrimitives(slug);
  if (primitives.length === 0) return 0;

  const lowerCode = codeContent.toLowerCase();
  let totalHits = 0;
  let totalSignals = 0;

  for (const prim of primitives) {
    for (const signal of prim.affinitySignals) {
      totalSignals++;
      if (lowerCode.includes(signal.toLowerCase())) {
        totalHits++;
      }
    }
  }

  return totalSignals > 0 ? Math.min(totalHits / (totalSignals * 0.3), 1) : 0;
}

/**
 * Score a single reserve primitive against ingested code.
 * Returns 0–1 with baseWeight factored in.
 */
export function scoreReservePrimitiveAffinity(primitive: ReservePrimitive, codeContent: string): number {
  const lowerCode = codeContent.toLowerCase();
  let hits = 0;

  for (const signal of primitive.affinitySignals) {
    if (lowerCode.includes(signal.toLowerCase())) {
      hits++;
    }
  }

  const rawAffinity = primitive.affinitySignals.length > 0
    ? hits / (primitive.affinitySignals.length * 0.4)
    : 0;

  return Math.min(rawAffinity * primitive.baseWeight, 1);
}
