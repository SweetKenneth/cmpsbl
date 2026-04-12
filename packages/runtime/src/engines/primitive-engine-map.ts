/**
 * CMPSBL® Primitive Engine Map — Runtime Package (Inlined)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Phase 3: Full 159-primitive → engine classification inlined
 * for standalone runtime package use.
 *
 * This is the runtime-local copy of the classification map.
 * It MUST NOT import from `@/*` or any app-level aliases.
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

/** Full 159-primitive → engine archetype map */
const ENGINE_MAP: Record<string, BehaviorEngine> = {
  // Core Spine — 12 Organs
  CORE: 'orchestration', SYSTEM: 'orchestration', BRAIN: 'analysis', MEMORY: 'state',
  DREAM: 'analysis', NERVE: 'orchestration', IDENTITY: 'interception', RELAY: 'orchestration',
  AUDIT: 'observability', RIPPLE: 'interception', ACCESS: 'interception', GOVERNANCE: 'interception',
  // Core Spine — 12 Layers
  DEFENSE: 'interception', IMMUNITY: 'interception', INTENT: 'analysis', ATLAS: 'observability',
  ENGINEER: 'orchestration', DECODE: 'orchestration', ENCODE: 'execution', VISION: 'analysis',
  ECONOMY: 'analysis', SANDBOX: 'execution', INCLUSIVE: 'analysis', MEDIC: 'execution',
  // Spine Extensions
  CONSCIENCE: 'interception', SOVEREIGN: 'interception', SHADOW: 'analysis', REFLEX: 'execution',
  COMPASS: 'analysis', EVOLUTION: 'orchestration', BEACON: 'observability',
  // Cyber
  WATCHTOWER: 'analysis', SHADE: 'analysis', AEGIS: 'interception', CIPHER: 'interception',
  RECON: 'analysis', VANGUARD: 'execution', BASTION: 'interception', TEMPEST: 'execution',
  PROWLER: 'analysis', ONYX: 'analysis', SPECTER: 'execution', BLACKOUT: 'execution',
  TRACER: 'analysis', NOCTURNE: 'analysis', IRONCLAD: 'interception', CITADEL: 'interception',
  // Robotics
  SERVO: 'execution', KINETIC: 'orchestration', LIDAR: 'analysis', FABRICATOR: 'execution',
  FLUX: 'orchestration', VECTOR: 'orchestration', TENSOR: 'analysis', CALIBER: 'analysis',
  GRIPPER: 'execution', SWARM: 'orchestration', ENVIRON: 'analysis', MARSHAL: 'interception',
  DISPATCH: 'orchestration', WELDER: 'execution', INSPECTOR: 'analysis', PIONEER: 'orchestration',
  // Quantum
  HADRON: 'execution', QUBIT: 'orchestration', PHOTON: 'execution', FERMION: 'analysis',
  ENTANGLE: 'orchestration', LATTICE: 'analysis', PLASMA: 'execution', CRYOGEN: 'analysis',
  MUON: 'analysis', BOSON: 'analysis', NEUTRINO: 'analysis', GLUON: 'analysis',
  GRAVITON: 'analysis', TACHYON: 'analysis', MESON: 'analysis', PRISM: 'analysis',
  // LLM
  VERITAS: 'analysis', RAMPART: 'interception', SYLLOGISM: 'analysis', LEXICON: 'interception',
  CLARITY: 'analysis', FULCRUM: 'analysis', TETHER: 'state', SIEVE: 'interception',
  SKEPTIC: 'analysis', TRIBUNAL: 'analysis', HERALD: 'observability', MIMIC: 'analysis',
  LINEAGE: 'observability', EMBARGO: 'interception', GAUNTLET: 'execution', CUSTODIAN: 'interception',
  // Agency
  MANDATE: 'orchestration', DELEGATE: 'orchestration', RECON_AGENCY: 'analysis',
  UPLINK: 'orchestration', SCRIBE: 'execution', INCENTIVE: 'orchestration', REASON: 'analysis',
  TOOLKIT: 'execution', OPERATOR: 'execution', OVERSEER: 'observability', LIAISON: 'orchestration',
  SCHOLAR: 'state', ENVOY: 'orchestration', WARDEN: 'interception', ROGUE: 'execution', ANCHOR: 'state',
  // Media
  CANVAS: 'execution', SCORE: 'execution', REEL: 'execution', COPY: 'execution',
  CAMPAIGN: 'orchestration', FEED: 'orchestration', PALETTE: 'state', RENDER: 'execution',
  CURATOR: 'analysis', CRITIC: 'analysis', AMPLIFY: 'orchestration', PERSONA: 'analysis',
  STORYARC: 'orchestration', MUSE: 'analysis', COMPLY: 'interception', METRIC: 'observability',
  // Fintech
  LEDGER: 'state', VAULT_FIN: 'interception', TICKER: 'analysis', CLEARING: 'execution',
  RISKCORE: 'analysis', PAYRAIL: 'execution', REGULATOR: 'interception', MATCHBOOK: 'orchestration',
  SENTINEL_FIN: 'interception', UNDERWRITER: 'analysis', PORTFOLIO: 'analysis',
  AUDITOR_FIN: 'observability', RECONCILER: 'execution', COMPLIANCE_FIN: 'interception',
  LIQUIDATOR: 'execution', TREASURY: 'state',
  // Ultimate
  ULT_APEX: 'analysis', ULT_CONDUIT: 'orchestration', ULT_PRISM: 'analysis',
  ULT_GENESIS: 'orchestration', ULT_FLUX: 'orchestration', ULT_CRUCIBLE: 'execution',
  ULT_MERIDIAN: 'interception', ULT_DYNAMO: 'execution', ULT_SENTINEL: 'interception',
  ULT_CATALYST: 'analysis', ULT_ARBITER: 'execution', ULT_HERALD: 'observability',
  ULT_NOMAD: 'analysis', ULT_WELDER: 'orchestration', ULT_ORACLE: 'state', ULT_PHOENIX: 'execution',
};

/**
 * Resolve engine archetype for any primitive name.
 * Returns 'generic' only for truly unknown primitives (future verticals).
 */
export function resolveEngine(name: string): BehaviorEngine {
  return ENGINE_MAP[name] ?? ENGINE_MAP[name.toUpperCase()] ?? 'generic';
}

/**
 * Classify a primitive using keyword affinity when not in the static map.
 * Used for upcoming verticals (Healthcare, Legal, Gaming, Education).
 */
export function classifyByAffinity(capabilities: string[]): BehaviorEngine {
  const joined = capabilities.join(' ');
  if (/block|gate|shield|enforce|sanitiz|validat|deny|firewall|quarantine/i.test(joined)) return 'interception';
  if (/detect|analys|score|classif|correlat|inspect|audit|monitor/i.test(joined)) return 'analysis';
  if (/persist|store|snapshot|cache|memory|state|ledger|journal/i.test(joined)) return 'state';
  if (/retry|circuit|timeout|heal|recover|degrade|failover|resilience/i.test(joined)) return 'execution';
  if (/route|orchestrat|dispatch|coordinat|pipeline|schedule|compose/i.test(joined)) return 'orchestration';
  if (/telemetry|health|heartbeat|log|signal|beacon|emit|trace/i.test(joined)) return 'observability';
  return 'generic';
}

/** Total primitives classified */
export const CLASSIFIED_PRIMITIVE_COUNT = Object.keys(ENGINE_MAP).length;
