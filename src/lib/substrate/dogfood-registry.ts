/**
 * DOGFOOD REGISTRY — Store Engines Running Inside the Substrate
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Maps store-sold engines to the internal substrate primitives
 * they power. This is not simulation — these engines are the
 * actual substrate infrastructure customers are buying.
 *
 * "We eat our own dog food."
 */

export interface DogfoodEntry {
  /** Engine slug from the store catalog */
  storeSlug: string;
  /** Engine codename */
  codename: string;
  /** Internal substrate primitives this engine powers */
  internalPrimitives: string[];
  /** What it does inside the substrate */
  internalRole: string;
  /** Whether it's currently active */
  active: boolean;
  /** Since when */
  activeSince: string;
  /** Category for grouping */
  category: 'kernel' | 'intelligence' | 'defense' | 'evolution' | 'resilience' | 'governance' | 'observability' | 'memory' | 'routing' | 'workflow';
}

/**
 * Engines we sell that are also running the substrate itself.
 * 31 engines actively powering the CMPSBL substrate.
 */
export const DOGFOOD_REGISTRY: DogfoodEntry[] = [
  // ═══════════════════════════════════════════════════════════════
  // KERNEL & CORE INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════════════
  {
    storeSlug: 'architect',
    codename: 'ARCHITECT',
    internalPrimitives: ['CORE Kernel', 'Boot Sequencer', 'Module Lifecycle', 'Circuit Breaker Registry'],
    internalRole: 'The unified 8-stage pipeline (Parse → Route → Execute → Heal → Defend → Learn → Observe → Audit) is the substrate boot and runtime sequence itself. ARCHITECT IS the substrate.',
    active: true,
    activeSince: '2025-08-01',
    category: 'kernel',
  },
  {
    storeSlug: 'titan',
    codename: 'TITAN',
    internalPrimitives: ['Circuit Breaker Fabric', 'Consensus Heartbeat', 'Distributed Consensus Mesh', 'Quorum Negotiator', 'Homeostatic Regulator'],
    internalRole: 'Powers the Self-Healing Consensus Meta-Engine — Byzantine fault tolerance, automatic breaker coordination, quorum negotiation, and mesh topology optimization across all 40 substrate primitives.',
    active: true,
    activeSince: '2026-01-15',
    category: 'kernel',
  },
  {
    storeSlug: 'bastion',
    codename: 'BASTION',
    internalPrimitives: ['Health-Aware Routing', 'RELAY Module', 'Load Distribution'],
    internalRole: 'Health-aware traffic routing and load distribution across substrate nodes. RELAY primitive uses BASTION patterns for priority-aware signal distribution.',
    active: true,
    activeSince: '2026-02-01',
    category: 'kernel',
  },

  // ═══════════════════════════════════════════════════════════════
  // INTELLIGENCE & ROUTING
  // ═══════════════════════════════════════════════════════════════
  {
    storeSlug: 'nexus',
    codename: 'NEXUS',
    internalPrimitives: ['NEXUS Router', 'AI Provider Selection', 'Cost-Aware Routing'],
    internalRole: 'Routes ALL AI calls through the substrate — model selection, failover, cost optimization, and token budget enforcement. Every LLM call in the platform passes through the same NEXUS engine customers buy.',
    active: true,
    activeSince: '2025-09-01',
    category: 'routing',
  },
  {
    storeSlug: 'conductor',
    codename: 'CONDUCTOR',
    internalPrimitives: ['Intent Router', 'broadcastIntent()', 'Receipt Pipeline'],
    internalRole: 'The Intent Router IS CONDUCTOR — all system actions flow through broadcastIntent(), which routes to resolvers, aggregates responses, and emits mesh communications. The substrate\'s nervous system.',
    active: true,
    activeSince: '2025-09-01',
    category: 'routing',
  },
  {
    storeSlug: 'catalyst',
    codename: 'CATALYST',
    internalPrimitives: ['Mesh Communications', 'mesh_comms table', 'Node Signaling'],
    internalRole: 'Powers the pub/sub Mesh Communications layer — every node-to-node signal, acknowledgement, heartbeat, and escalation event flows through CATALYST\'s event-driven architecture.',
    active: true,
    activeSince: '2025-10-01',
    category: 'routing',
  },
  {
    storeSlug: 'synapse',
    codename: 'SYNAPSE',
    internalPrimitives: ['NERVE Module', 'Cross-Primitive Signaling', 'Context Threading'],
    internalRole: 'NERVE uses SYNAPSE patterns for cross-primitive signaling, context threading across multi-hop resolver chains, and inter-agent messaging in the Agency system.',
    active: true,
    activeSince: '2026-02-15',
    category: 'routing',
  },

  // ═══════════════════════════════════════════════════════════════
  // DEFENSE & SECURITY
  // ═══════════════════════════════════════════════════════════════
  {
    storeSlug: 'sentinel',
    codename: 'SENTINEL',
    internalPrimitives: ['DEFENSE Layer', 'Cognitive Threat Profiler', 'IMMUNITY Mesh'],
    internalRole: 'Powers the 6-layer Cognitive Security Mesh — perimeter defense, threat scoring, prompt injection shielding, and anomaly detection across all substrate operations.',
    active: true,
    activeSince: '2025-10-15',
    category: 'defense',
  },
  {
    storeSlug: 'harbinger',
    codename: 'HARBINGER',
    internalPrimitives: ['DEFENSE Predictive Layer', 'Anomaly Correlation', 'Cascade Prevention'],
    internalRole: 'Predictive threat detection — identifies emergent threat patterns before they materialize, correlates anomalies across substrate signals, and halts failure cascades at origin.',
    active: true,
    activeSince: '2026-01-01',
    category: 'defense',
  },
  {
    storeSlug: 'cerberus',
    codename: 'CERBERUS',
    internalPrimitives: ['Prompt Injection Shield', 'Input Sanitization', 'Hallucination Guard', 'Veto Authority'],
    internalRole: 'Multi-gate defense matrix — guards every substrate input with prompt injection shielding, sanitization, output validation, and executive veto authority on dangerous autonomous actions.',
    active: true,
    activeSince: '2026-01-15',
    category: 'defense',
  },
  {
    storeSlug: 'aegis',
    codename: 'AEGIS',
    internalPrimitives: ['IDENTITY Module', 'TierGate', 'RBAC Engine', 'Session Attestation'],
    internalRole: 'Powers the IDENTITY primitive and TierGate system — fine-grained RBAC, credential management, session attestation, and zero-trust perimeter enforcement for all substrate access.',
    active: true,
    activeSince: '2026-02-01',
    category: 'defense',
  },
  {
    storeSlug: 'warden',
    codename: 'WARDEN',
    internalPrimitives: ['SANDBOX Module', 'Graduated Autonomy', 'Compliance Gate'],
    internalRole: 'Powers the SANDBOX primitive — sealed execution environments for untrusted code, graduated autonomy calibration for ADA decisions, and compliance gating at every boundary.',
    active: true,
    activeSince: '2026-03-01',
    category: 'defense',
  },
  {
    storeSlug: 'seraph',
    codename: 'SERAPH',
    internalPrimitives: ['CONSCIENCE Module', 'Ethical Constraint Engine', 'Value Alignment'],
    internalRole: 'Powers the CONSCIENCE primitive — ethical constraint reasoning for ADA decisions, bias detection in autonomous outputs, fairness auditing, and harm prevention gating across all substrate actions.',
    active: true,
    activeSince: '2026-03-28',
    category: 'defense',
  },

  // ═══════════════════════════════════════════════════════════════
  // EVOLUTION & SELF-IMPROVEMENT
  // ═══════════════════════════════════════════════════════════════
  {
    storeSlug: 'forge',
    codename: 'FORGE',
    internalPrimitives: ['ENCODE Systems Engineer', 'SEBA Evolution Engine', 'Patch Writer'],
    internalRole: 'Powers the self-evolving substrate — SEBA uses FORGE\'s code generation and refactoring capabilities to write, audit, and apply surgical patches across the codebase.',
    active: true,
    activeSince: '2025-11-15',
    category: 'evolution',
  },
  {
    storeSlug: 'prometheus',
    codename: 'PROMETHEUS',
    internalPrimitives: ['SEBA 7-Gate Pipeline', 'Mutation Proposal Engine', 'Shadow Run Environment'],
    internalRole: 'The SEBA Evolution Engine IS PROMETHEUS — 7-gate safety-bounded evolution, mutation proposal, shadow run testing, and autonomous self-improvement. 262 validated patches across 490 cycles.',
    active: true,
    activeSince: '2026-01-01',
    category: 'evolution',
  },
  {
    storeSlug: 'crucible',
    codename: 'CRUCIBLE',
    internalPrimitives: ['TSAC Verification', 'Chaos Testing', 'Mutation Testing', 'Adversarial Simulation'],
    internalRole: 'Powers TSAC (Total System Assurance Check) — automated stress testing of SEBA patches before promotion, chaos engineering for resilience verification, and adversarial simulation of failure scenarios.',
    active: true,
    activeSince: '2026-03-28',
    category: 'evolution',
  },
  {
    storeSlug: 'axiom',
    codename: 'AXIOM',
    internalPrimitives: ['Patch Correctness Verification', 'Constraint Satisfaction', 'Logical Validation'],
    internalRole: 'Formal verification gate in the SEBA pipeline — validates patch correctness through constraint satisfaction, ensures logical consistency of mutations before application, and proves invariant preservation.',
    active: true,
    activeSince: '2026-03-28',
    category: 'evolution',
  },
  {
    storeSlug: 'progenitor',
    codename: 'PROGENITOR',
    internalPrimitives: ['Pipeline Foundry', 'Capability Discovery', 'Artifact Hardening'],
    internalRole: 'Powers the Pipeline Foundry — capability genesis from resolver combinations, blueprint evolution through iterative refinement, and artifact hardening for production-grade exports.',
    active: true,
    activeSince: '2026-03-01',
    category: 'evolution',
  },

  // ═══════════════════════════════════════════════════════════════
  // RESILIENCE & RECOVERY
  // ═══════════════════════════════════════════════════════════════
  {
    storeSlug: 'phantom',
    codename: 'PHANTOM',
    internalPrimitives: ['Self-Healing Consensus', 'Circuit Breakers', 'Graceful Degradation'],
    internalRole: 'The Self-Healing Consensus Meta-Engine IS PHANTOM running in production — Byzantine fault tolerance, automatic node recovery, and zero-downtime healing.',
    active: true,
    activeSince: '2026-03-28',
    category: 'resilience',
  },
  {
    storeSlug: 'hydra',
    codename: 'HYDRA',
    internalPrimitives: ['IMMUNITY Mesh', 'Self-Repair Engine', 'Cascading Failure Isolation'],
    internalRole: 'Powers the IMMUNITY mesh self-repair — autonomous repair of failing subsystems, blast radius quarantine, multi-level fallback strategies, and subsystem regeneration from blueprints.',
    active: true,
    activeSince: '2026-01-15',
    category: 'resilience',
  },
  {
    storeSlug: 'genesis',
    codename: 'GENESIS',
    internalPrimitives: ['Health Engine v2.0.0', 'Autonomous Triage', '7-Phase Heal All Pipeline'],
    internalRole: 'Powers the Health Engine Vital Signs — 51-entity monitoring, real-time failure classification, severity scoring, and the 7-phase Heal All pipeline (Edge execution, breaker reset, health restoration, registry flush, subsystem recovery).',
    active: true,
    activeSince: '2026-01-01',
    category: 'resilience',
  },
  {
    storeSlug: 'phoenix',
    codename: 'PHOENIX',
    internalPrimitives: ['Organ Transplant', 'Root Cause Analysis', 'Health Aggregation'],
    internalRole: 'Autonomous recovery matrix — hot-swaps failing subsystems, traces root causes across service boundaries, and provides unified health scoring for the 12·12·8·8 health matrix.',
    active: true,
    activeSince: '2026-02-15',
    category: 'resilience',
  },

  // ═══════════════════════════════════════════════════════════════
  // GOVERNANCE & WORKFLOW
  // ═══════════════════════════════════════════════════════════════
  {
    storeSlug: 'sovereign',
    codename: 'SOVEREIGN',
    internalPrimitives: ['ADA (Autonomous Decision Authority)', 'GOVERNANCE Module', 'Policy Gate'],
    internalRole: 'Powers the Autonomous Decision Authority (ADA) — 15-domain scoped autonomy, 7-gate pipeline, trust calibration, and policy-aware governance across all substrate decisions.',
    active: true,
    activeSince: '2026-01-01',
    category: 'governance',
  },
  {
    storeSlug: 'cortex',
    codename: 'CORTEX',
    internalPrimitives: ['CORTEX Orchestrator', 'Agency Runtime', 'Agent Competency Tracking'],
    internalRole: 'Orchestrates multi-agent coordination in the Agency system — task delegation, cognitive load balancing, shared memory coordination, and competency-based skill routing.',
    active: true,
    activeSince: '2025-11-01',
    category: 'workflow',
  },
  {
    storeSlug: 'automaton',
    codename: 'AUTOMATON',
    internalPrimitives: ['Agency Scheduler', 'Scheduled Tasks', 'Event-Driven Workflows'],
    internalRole: 'Powers the Agency scheduled task system — conditional workflows, scheduled execution cycles, event-driven automation, and retry/error handling across all agency operations.',
    active: true,
    activeSince: '2026-02-01',
    category: 'workflow',
  },
  {
    storeSlug: 'golem',
    codename: 'GOLEM',
    internalPrimitives: ['Agency Task DAG', 'Goal Decomposition', 'Pipeline Composition'],
    internalRole: 'Powers Agency task execution — complex DAG resolution with cycle detection, goal decomposition into executable steps, and dynamic pipeline composition for multi-step agency workflows.',
    active: true,
    activeSince: '2026-02-01',
    category: 'workflow',
  },

  // ═══════════════════════════════════════════════════════════════
  // OBSERVABILITY & INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════
  {
    storeSlug: 'beacon',
    codename: 'BEACON',
    internalPrimitives: ['Health Engine v2.0.0', 'Mesh Telemetry', 'Intent Receipts'],
    internalRole: 'Powers all substrate observability — the 51-entity health monitoring, mesh communications dashboard, latency tracking, and the telemetry pipelines feeding admin dashboards.',
    active: true,
    activeSince: '2025-09-15',
    category: 'observability',
  },
  {
    storeSlug: 'oracle',
    codename: 'ORACLE',
    internalPrimitives: ['ORACLE Prophetic Engine', 'Drift Detector', 'Confidence Classifier'],
    internalRole: 'Predictive modeling for substrate health — drift detection, confidence gating before autonomous execution, and pattern recognition across system signals.',
    active: true,
    activeSince: '2025-12-01',
    category: 'intelligence',
  },
  {
    storeSlug: 'echo',
    codename: 'ECHO',
    internalPrimitives: ['ECHO Feedback Module', 'Drift Correction', 'Confidence Recalibration'],
    internalRole: 'Powers the ECHO primitive feedback loops — outcome tracking, reinforcement learning for SEBA effectiveness, drift correction across primitive performance, and confidence recalibration.',
    active: true,
    activeSince: '2026-02-15',
    category: 'intelligence',
  },

  // ═══════════════════════════════════════════════════════════════
  // MEMORY & DATA
  // ═══════════════════════════════════════════════════════════════
  {
    storeSlug: 'leviathan',
    codename: 'LEVIATHAN',
    internalPrimitives: ['4-Tier Memory (HOT/WARM/COLD/GLACIER)', 'State Synchronization', 'Gossip Protocol'],
    internalRole: 'Powers the 4-tier memory architecture — HOT (in-memory), WARM (session), COLD (database), GLACIER (archival). Context threading, immune memory persistence, and predictive state pre-loading.',
    active: true,
    activeSince: '2026-01-01',
    category: 'memory',
  },
  {
    storeSlug: 'cipher',
    codename: 'CIPHER',
    internalPrimitives: ['Memory HOT Tier', 'In-Memory Cache', 'TTL Eviction'],
    internalRole: 'Powers the HOT memory tier — distributed in-memory caching for substrate state, intelligent invalidation, and tiered storage patterns (hot/warm/cold) for the CLM system.',
    active: true,
    activeSince: '2026-02-01',
    category: 'memory',
  },
  {
    storeSlug: 'obelisk',
    codename: 'OBELISK',
    internalPrimitives: ['AUDIT Chain', 'Tamper-Evident Logging', 'FNV-1a Integrity Hashing'],
    internalRole: 'Powers the immutable audit chain — 1000-entry tamper-evident logging with FNV-1a integrity hashing, self-audit verification, and forensic replay for governance review.',
    active: true,
    activeSince: '2026-01-15',
    category: 'governance',
  },
  {
    storeSlug: 'chimera',
    codename: 'CHIMERA',
    internalPrimitives: ['CLM (Cognitive Lifecycle Manager)', 'Intent Drift Tracker', 'Personality Adaptation'],
    internalRole: 'Powers the Cognitive Lifecycle Manager — adaptive product intelligence, intent drift tracking, friction auto-removal, and personality adaptation across all 40 substrate primitives.',
    active: true,
    activeSince: '2026-01-15',
    category: 'intelligence',
  },
  {
    storeSlug: 'prism',
    codename: 'PRISM',
    internalPrimitives: ['Memory Stream', 'Semantic Knowledge Graph', 'Pipeline Discovery'],
    internalRole: 'Powers the Memory Stream discovery engine — semantic knowledge graph construction from substrate behavior signals, entity-relationship mapping across discovered pipelines, and RAG-powered retrieval for substrate knowledge.',
    active: true,
    activeSince: '2026-03-28',
    category: 'intelligence',
  },
  {
    storeSlug: 'dynamo',
    codename: 'DYNAMO',
    internalPrimitives: ['AI Cost Optimizer', 'Token Budget Controller', 'ECONOMY Module'],
    internalRole: 'Powers the ECONOMY primitive — real-time AI cost tracking and minimization, per-model token budget enforcement, resource arbitrage across providers, and waste detection to maintain ≤$0.05/SEBA-run cost discipline.',
    active: true,
    activeSince: '2026-03-28',
    category: 'observability',
  },
];

/** Get all currently active dogfooded engines */
export function getActiveDogfoodEngines(): DogfoodEntry[] {
  return DOGFOOD_REGISTRY.filter(e => e.active);
}

/** Check if a specific store engine is dogfooded */
export function isEngineDogfooded(slug: string): boolean {
  return DOGFOOD_REGISTRY.some(e => e.storeSlug === slug && e.active);
}

/** Get entries by category */
export function getDogfoodByCategory(category: DogfoodEntry['category']): DogfoodEntry[] {
  return DOGFOOD_REGISTRY.filter(e => e.category === category && e.active);
}

/** Summary stats */
export function getDogfoodStats() {
  const active = DOGFOOD_REGISTRY.filter(e => e.active);
  const categories = [...new Set(active.map(e => e.category))];
  return {
    totalEngines: DOGFOOD_REGISTRY.length,
    activeEngines: active.length,
    primitivesMonitored: active.flatMap(e => e.internalPrimitives).length,
    categories: categories.length,
    oldestActivation: active.reduce((oldest, e) =>
      e.activeSince < oldest ? e.activeSince : oldest,
      active[0]?.activeSince ?? ''
    ),
  };
}
