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
}

/**
 * Engines we sell that are also running the substrate itself.
 * Updated as new engines are integrated.
 */
export const DOGFOOD_REGISTRY: DogfoodEntry[] = [
  {
    storeSlug: 'nexus',
    codename: 'NEXUS',
    internalPrimitives: ['NEXUS Router', 'AI Provider Selection', 'Cost-Aware Routing'],
    internalRole: 'Routes ALL AI calls through the substrate — model selection, failover, cost optimization, and token budget enforcement. Every LLM call in the platform passes through the same NEXUS engine customers buy.',
    active: true,
    activeSince: '2025-09-01',
  },
  {
    storeSlug: 'sentinel',
    codename: 'SENTINEL',
    internalPrimitives: ['DEFENSE Layer', 'Cognitive Threat Profiler', 'IMMUNITY Mesh'],
    internalRole: 'Powers the 6-layer Cognitive Security Mesh — perimeter defense, threat scoring, prompt injection shielding, and anomaly detection across all substrate operations.',
    active: true,
    activeSince: '2025-10-15',
  },
  {
    storeSlug: 'cortex',
    codename: 'CORTEX',
    internalPrimitives: ['CORTEX Orchestrator', 'Agency Runtime', 'Agent Competency Tracking'],
    internalRole: 'Orchestrates multi-agent coordination in the Agency system — task delegation, cognitive load balancing, shared memory coordination, and competency-based skill routing.',
    active: true,
    activeSince: '2025-11-01',
  },
  {
    storeSlug: 'architect',
    codename: 'ARCHITECT',
    internalPrimitives: ['CORE Kernel', 'Boot Sequencer', 'Module Lifecycle', 'Circuit Breaker Registry'],
    internalRole: 'The unified 8-stage pipeline (Parse → Route → Execute → Heal → Defend → Learn → Observe → Audit) is the substrate boot and runtime sequence itself. ARCHITECT IS the substrate.',
    active: true,
    activeSince: '2025-08-01',
  },
  {
    storeSlug: 'beacon',
    codename: 'BEACON',
    internalPrimitives: ['Health Engine v2.0.0', 'Mesh Telemetry', 'Intent Receipts'],
    internalRole: 'Powers all substrate observability — the 51-entity health monitoring, mesh communications dashboard, latency tracking, and the telemetry pipelines feeding admin dashboards.',
    active: true,
    activeSince: '2025-09-15',
  },
  {
    storeSlug: 'phantom',
    codename: 'PHANTOM',
    internalPrimitives: ['Self-Healing Consensus', 'Circuit Breakers', 'Graceful Degradation'],
    internalRole: 'The Self-Healing Consensus Meta-Engine IS PHANTOM running in production — Byzantine fault tolerance, automatic node recovery, and zero-downtime healing.',
    active: true,
    activeSince: '2026-03-28',
  },
  {
    storeSlug: 'oracle',
    codename: 'ORACLE',
    internalPrimitives: ['ORACLE Prophetic Engine', 'Drift Detector', 'Confidence Classifier'],
    internalRole: 'Predictive modeling for substrate health — drift detection, confidence gating before autonomous execution, and pattern recognition across system signals.',
    active: true,
    activeSince: '2025-12-01',
  },
  {
    storeSlug: 'forge',
    codename: 'FORGE',
    internalPrimitives: ['ENCODE Systems Engineer', 'SEBA Evolution Engine', 'Patch Writer'],
    internalRole: 'Powers the self-evolving substrate — SEBA uses FORGE\'s code generation and refactoring capabilities to write, audit, and apply surgical patches across the codebase.',
    active: true,
    activeSince: '2025-11-15',
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

/** Summary stats */
export function getDogfoodStats() {
  const active = DOGFOOD_REGISTRY.filter(e => e.active);
  return {
    totalEngines: DOGFOOD_REGISTRY.length,
    activeEngines: active.length,
    primitivesMonitored: active.flatMap(e => e.internalPrimitives).length,
    oldestActivation: active.reduce((oldest, e) => 
      e.activeSince < oldest ? e.activeSince : oldest, 
      active[0]?.activeSince ?? ''
    ),
  };
}
