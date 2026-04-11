/**
 * CMPSBL® Primitive → Engine Classification Map
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Tier 1: Maps ALL 159 primitives to behavioral archetypes.
 * Ensures zero 'generic' fallback for any known primitive.
 *
 * Archetypes:
 *   interception  — Input validation, security gates, policy enforcement
 *   analysis      — Observation, anomaly detection, telemetry
 *   state         — Persistence, memory, snapshots
 *   execution     — Resilience, retries, circuit breaking
 *   orchestration — Routing, coordination, composition
 *   observability — Health signals, logging, monitoring
 *   generic       — Novel/unknown patterns (fallback only)
 *
 * © CMPSBL® — All rights reserved.
 */

export type BehaviorEngine =
  | 'interception'
  | 'state'
  | 'execution'
  | 'analysis'
  | 'orchestration'
  | 'observability'
  | 'generic';

export const PRIMITIVE_ENGINE_MAP: Record<string, BehaviorEngine> = {
  // ═══════════════════════════════════════════════════════════════════
  // CORE SPINE — 12 Organs
  // ═══════════════════════════════════════════════════════════════════
  CORE: 'orchestration',
  SYSTEM: 'orchestration',
  BRAIN: 'analysis',
  MEMORY: 'state',
  DREAM: 'analysis',
  NERVE: 'orchestration',
  IDENTITY: 'interception',
  RELAY: 'orchestration',
  AUDIT: 'observability',
  RIPPLE: 'interception',
  ACCESS: 'interception',
  GOVERNANCE: 'interception',

  // ═══════════════════════════════════════════════════════════════════
  // CORE SPINE — 12 Layers
  // ═══════════════════════════════════════════════════════════════════
  DEFENSE: 'interception',
  IMMUNITY: 'interception',
  INTENT: 'analysis',
  ATLAS: 'observability',
  ENGINEER: 'orchestration',
  DECODE: 'orchestration',
  ENCODE: 'execution',
  VISION: 'analysis',
  ECONOMY: 'analysis',
  SANDBOX: 'execution',
  INCLUSIVE: 'analysis',
  MEDIC: 'execution',

  // ═══════════════════════════════════════════════════════════════════
  // CONCEPTUAL SPINE EXTENSIONS — 7 Primitives
  // ═══════════════════════════════════════════════════════════════════
  CONSCIENCE: 'interception',
  SOVEREIGN: 'interception',
  SHADOW: 'analysis',
  REFLEX: 'execution',
  COMPASS: 'analysis',
  EVOLUTION: 'orchestration',
  BEACON: 'observability',

  // ═══════════════════════════════════════════════════════════════════
  // CYBERSECURITY VERTICAL — 16 Primitives
  // ═══════════════════════════════════════════════════════════════════
  // Engines
  WATCHTOWER: 'analysis',
  SHADE: 'analysis',
  AEGIS: 'interception',
  CIPHER: 'interception',
  RECON: 'analysis',
  VANGUARD: 'execution',
  BASTION: 'interception',
  TEMPEST: 'execution',
  // Agents
  PROWLER: 'analysis',
  ONYX: 'analysis',
  SPECTER: 'execution',
  BLACKOUT: 'execution',
  TRACER: 'analysis',
  NOCTURNE: 'analysis',
  IRONCLAD: 'interception',
  CITADEL: 'interception',

  // ═══════════════════════════════════════════════════════════════════
  // ROBOTICS VERTICAL — 16 Primitives
  // ═══════════════════════════════════════════════════════════════════
  // Engines
  SERVO: 'execution',
  KINETIC: 'orchestration',
  LIDAR: 'analysis',
  FABRICATOR: 'execution',
  FLUX: 'orchestration',
  VECTOR: 'orchestration',
  TENSOR: 'analysis',
  CALIBER: 'analysis',
  // Agents
  GRIPPER: 'execution',
  SWARM: 'orchestration',
  ENVIRON: 'analysis',
  MARSHAL: 'interception',
  DISPATCH: 'orchestration',
  WELDER: 'execution',
  INSPECTOR: 'analysis',
  PIONEER: 'orchestration',

  // ═══════════════════════════════════════════════════════════════════
  // QUANTUM VERTICAL — 16 Primitives
  // ═══════════════════════════════════════════════════════════════════
  // Engines
  HADRON: 'execution',
  QUBIT: 'orchestration',
  PHOTON: 'execution',
  FERMION: 'analysis',
  ENTANGLE: 'orchestration',
  LATTICE: 'analysis',
  PLASMA: 'execution',
  CRYOGEN: 'analysis',
  // Agents
  MUON: 'analysis',
  BOSON: 'analysis',
  NEUTRINO: 'analysis',
  GLUON: 'analysis',
  GRAVITON: 'analysis',
  TACHYON: 'analysis',
  MESON: 'analysis',
  PRISM: 'analysis',

  // ═══════════════════════════════════════════════════════════════════
  // LLM VERTICAL — 16 Primitives
  // ═══════════════════════════════════════════════════════════════════
  // Engines
  VERITAS: 'analysis',
  RAMPART: 'interception',
  SYLLOGISM: 'analysis',
  LEXICON: 'interception',
  CLARITY: 'analysis',
  FULCRUM: 'analysis',
  TETHER: 'state',
  SIEVE: 'interception',
  // Agents
  SKEPTIC: 'analysis',
  TRIBUNAL: 'analysis',
  HERALD: 'observability',
  MIMIC: 'analysis',
  LINEAGE: 'observability',
  EMBARGO: 'interception',
  GAUNTLET: 'execution',
  CUSTODIAN: 'interception',

  // ═══════════════════════════════════════════════════════════════════
  // AGENCY VERTICAL — 16 Primitives
  // ═══════════════════════════════════════════════════════════════════
  // Engines
  MANDATE: 'orchestration',
  DELEGATE: 'orchestration',
  RECON_AGENCY: 'analysis',
  UPLINK: 'orchestration',
  SCRIBE: 'execution',
  INCENTIVE: 'orchestration',
  REASON: 'analysis',
  TOOLKIT: 'execution',
  // Agents
  OPERATOR: 'execution',
  OVERSEER: 'observability',
  LIAISON: 'orchestration',
  SCHOLAR: 'state',
  ENVOY: 'orchestration',
  WARDEN: 'interception',
  ROGUE: 'execution',
  ANCHOR: 'state',

  // ═══════════════════════════════════════════════════════════════════
  // MEDIA VERTICAL — 16 Primitives
  // ═══════════════════════════════════════════════════════════════════
  // Engines
  CANVAS: 'execution',
  SCORE: 'execution',
  REEL: 'execution',
  COPY: 'execution',
  CAMPAIGN: 'orchestration',
  FEED: 'orchestration',
  PALETTE: 'state',
  RENDER: 'execution',
  // Agents
  CURATOR: 'analysis',
  CRITIC: 'analysis',
  AMPLIFY: 'orchestration',
  PERSONA: 'analysis',
  STORYARC: 'orchestration',
  MUSE: 'analysis',
  COMPLY: 'interception',
  METRIC: 'observability',

  // ═══════════════════════════════════════════════════════════════════
  // FINTECH VERTICAL — 16 Primitives
  // ═══════════════════════════════════════════════════════════════════
  // Engines
  LEDGER: 'state',
  VAULT_FIN: 'interception',
  TICKER: 'analysis',
  CLEARING: 'execution',
  RISKCORE: 'analysis',
  PAYRAIL: 'execution',
  REGULATOR: 'interception',
  MATCHBOOK: 'orchestration',
  // Agents
  SENTINEL_FIN: 'interception',
  UNDERWRITER: 'analysis',
  PORTFOLIO: 'analysis',
  AUDITOR_FIN: 'observability',
  RECONCILER: 'execution',
  COMPLIANCE_FIN: 'interception',
  LIQUIDATOR: 'execution',
  TREASURY: 'state',

  // ═══════════════════════════════════════════════════════════════════
  // ULTIMATE VERTICAL — 16 Universal Gap-Fillers
  // ═══════════════════════════════════════════════════════════════════
  // Engines
  ULT_APEX: 'analysis',
  ULT_CONDUIT: 'orchestration',
  ULT_PRISM: 'analysis',
  ULT_GENESIS: 'orchestration',
  ULT_FLUX: 'orchestration',
  ULT_CRUCIBLE: 'execution',
  ULT_MERIDIAN: 'interception',
  ULT_DYNAMO: 'execution',
  // Agents
  ULT_SENTINEL: 'interception',
  ULT_CATALYST: 'analysis',
  ULT_ARBITER: 'execution',
  ULT_HERALD: 'observability',
  ULT_NOMAD: 'analysis',
  ULT_WELDER: 'orchestration',
  ULT_ORACLE: 'state',
  ULT_PHOENIX: 'execution',
};

/**
 * Resolve engine archetype for any primitive name.
 * Returns 'generic' only for truly unknown primitives.
 */
export function getEngineForPrimitive(name: string): BehaviorEngine {
  return PRIMITIVE_ENGINE_MAP[name] ?? PRIMITIVE_ENGINE_MAP[name.toUpperCase()] ?? 'generic';
}

/**
 * Classify a primitive using metadata when available.
 * Falls back to the static map, then keyword affinity, then 'generic'.
 */
export function classifyPrimitive(
  name: string,
  classification?: 'active' | 'passive' | 'hybrid',
  capabilities?: string[],
): BehaviorEngine {
  // Static map takes priority
  const mapped = PRIMITIVE_ENGINE_MAP[name] ?? PRIMITIVE_ENGINE_MAP[name.toUpperCase()];
  if (mapped) return mapped;

  // Keyword affinity from capabilities
  if (capabilities?.length) {
    const joined = capabilities.join(' ');
    if (/block|gate|shield|enforce|sanitiz|validat|deny|firewall|quarantine/i.test(joined)) return 'interception';
    if (/detect|analys|score|classif|correlat|inspect|audit|monitor/i.test(joined)) return 'analysis';
    if (/persist|store|snapshot|cache|memory|state|ledger|journal/i.test(joined)) return 'state';
    if (/retry|circuit|timeout|heal|recover|degrade|failover|resilience/i.test(joined)) return 'execution';
    if (/route|orchestrat|dispatch|coordinat|pipeline|schedule|compose/i.test(joined)) return 'orchestration';
    if (/telemetry|health|heartbeat|log|signal|beacon|emit|trace/i.test(joined)) return 'observability';
  }

  // Classification hint
  if (classification === 'active') return 'execution';
  if (classification === 'passive') return 'analysis';
  if (classification === 'hybrid') return 'orchestration';

  return 'generic';
}

/**
 * Get primitive count per engine archetype.
 */
export function getEngineDistribution(): Record<BehaviorEngine, number> {
  const dist: Record<BehaviorEngine, number> = {
    interception: 0,
    analysis: 0,
    state: 0,
    execution: 0,
    orchestration: 0,
    observability: 0,
    generic: 0,
  };

  for (const engine of Object.values(PRIMITIVE_ENGINE_MAP)) {
    dist[engine]++;
  }

  return dist;
}

/** Total primitives with explicit engine classification */
export function getClassifiedPrimitiveCount(): number {
  return Object.keys(PRIMITIVE_ENGINE_MAP).length;
}
