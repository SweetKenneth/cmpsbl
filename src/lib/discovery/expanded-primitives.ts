/**
 * CMPSBL® Expanded Primitive Pool — 159 Primitives
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single source of truth for ALL primitives across all verticals.
 * Used by the Discovery Reactor and Template Generator for
 * combinatorial synthesis across the full primitive matrix.
 *
 * Structure: 24 Core Spine + 7 Spine Extensions + 16×8 Vertical Slots = 159
 *
 * © CMPSBL® — All rights reserved.
 */

import type { DiscoveryCategory } from '@/lib/capabilities/synergies/discovery-epoch';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — PRIMITIVE POOLS
// ═══════════════════════════════════════════════════════════════════════════════

/** Core 40 Primitives (original matrix) */
export const CORE_PRIMITIVES = [
  // 12 Organs
  'CORE', 'BRAIN', 'MEMORY', 'NERVE', 'DECODE', 'ENCODE', 'CORTEX', 'DEFENSE', 'ORACLE', 'CONSCIENCE',
  'SYSTEM', 'RELAY',
  // 12 Layers
  'IMMUNITY', 'INTENT', 'GOVERNANCE', 'ATLAS', 'ENGINEER', 'FORGE', 'VISION', 'ECONOMY', 'SANDBOX',
  'INCLUSIVE', 'MEDIC', 'EVOLUTION',
  // Spine Extensions
  'SOVEREIGN', 'SHADOW', 'REFLEX', 'COMPASS', 'BEACON',
  // Additional Core
  'PHANTOM', 'HARVEST', 'LINGUA', 'ECHO', 'TREATY', 'OBSERVER', 'NEXUS', 'DREAM',
  'PRISM', 'AUDIT', 'IDENTITY', 'MESH', 'ACCESS', 'ANALYTICS', 'RIPPLE',
] as const;

/** Cyber Vertical Primitives */
export const CYBER_PRIMITIVES = [
  'WATCHTOWER', 'SHADE', 'AEGIS', 'CIPHER', 'RECON', 'VANGUARD', 'BASTION', 'TEMPEST',
  'PROWLER', 'ONYX', 'SPECTER', 'BLACKOUT', 'TRACER', 'NOCTURNE', 'IRONCLAD', 'CITADEL',
] as const;

/** Robotics Vertical Primitives */
export const ROBOTICS_PRIMITIVES = [
  'SERVO', 'KINETIC', 'LIDAR', 'FABRICATOR', 'FLUX', 'VECTOR', 'TENSOR', 'CALIBER',
  'GRIPPER', 'SWARM', 'ENVIRON', 'MARSHAL', 'DISPATCH', 'WELDER', 'INSPECTOR', 'PIONEER',
] as const;

/** Quantum Vertical Primitives */
export const QUANTUM_PRIMITIVES = [
  'HADRON', 'QUBIT', 'PHOTON', 'FERMION', 'ENTANGLE', 'LATTICE', 'PLASMA', 'CRYOGEN',
  'MUON', 'BOSON', 'NEUTRINO', 'GLUON', 'GRAVITON', 'TACHYON', 'MESON', 'PRISM',
] as const;

/** LLM Vertical Primitives */
export const LLM_PRIMITIVES = [
  'VERITAS', 'RAMPART', 'SYLLOGISM', 'LEXICON', 'CLARITY', 'FULCRUM', 'TETHER', 'SIEVE',
  'SKEPTIC', 'TRIBUNAL', 'HERALD', 'MIMIC', 'LINEAGE', 'EMBARGO', 'GAUNTLET', 'CUSTODIAN',
] as const;

/** Agency Vertical Primitives */
export const AGENCY_PRIMITIVES = [
  'MANDATE', 'DELEGATE', 'RECON_AGENCY', 'UPLINK', 'SCRIBE', 'INCENTIVE', 'REASON', 'TOOLKIT',
  'OPERATOR', 'OVERSEER', 'LIAISON', 'SCHOLAR', 'ENVOY', 'WARDEN', 'ROGUE', 'ANCHOR',
] as const;

/** Media Vertical Primitives */
export const MEDIA_PRIMITIVES = [
  'CANVAS', 'SCORE', 'REEL', 'COPY', 'CAMPAIGN', 'FEED', 'PALETTE', 'RENDER',
  'CURATOR', 'CRITIC', 'AMPLIFY', 'PERSONA', 'STORYARC', 'MUSE', 'COMPLY', 'METRIC',
] as const;

/** Fintech Vertical Primitives */
export const FINTECH_PRIMITIVES = [
  'LEDGER', 'VAULT_FIN', 'TICKER', 'CLEARING', 'RISKCORE', 'PAYRAIL', 'REGULATOR', 'MATCHBOOK',
  'SENTINEL_FIN', 'UNDERWRITER', 'PORTFOLIO', 'AUDITOR_FIN', 'RECONCILER', 'COMPLIANCE_FIN', 'LIQUIDATOR', 'TREASURY',
] as const;

/** Ultimate Vertical Primitives */
export const ULTIMATE_PRIMITIVES = [
  'ULT_APEX', 'ULT_CONDUIT', 'ULT_PRISM', 'ULT_GENESIS', 'ULT_FLUX', 'ULT_CRUCIBLE',
  'ULT_MERIDIAN', 'ULT_DYNAMO', 'ULT_SENTINEL', 'ULT_CATALYST', 'ULT_ARBITER', 'ULT_HERALD',
  'ULT_NOMAD', 'ULT_WELDER', 'ULT_ORACLE', 'ULT_PHOENIX',
] as const;

/** All 159 Primitives combined */
export const ALL_PRIMITIVES: string[] = [
  ...new Set([
    ...CORE_PRIMITIVES,
    ...CYBER_PRIMITIVES,
    ...ROBOTICS_PRIMITIVES,
    ...QUANTUM_PRIMITIVES,
    ...LLM_PRIMITIVES,
    ...AGENCY_PRIMITIVES,
    ...MEDIA_PRIMITIVES,
    ...FINTECH_PRIMITIVES,
    ...ULTIMATE_PRIMITIVES,
  ]),
];

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — VERTICAL METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export type VerticalId = 'core' | 'cyber' | 'robotics' | 'quantum' | 'llm' | 'agency' | 'media' | 'fintech' | 'ultimate';

export interface VerticalSpec {
  id: VerticalId;
  label: string;
  primitives: readonly string[];
}

export const VERTICALS: VerticalSpec[] = [
  { id: 'core', label: 'Core (Prime)', primitives: CORE_PRIMITIVES },
  { id: 'cyber', label: 'Cybersecurity', primitives: CYBER_PRIMITIVES },
  { id: 'robotics', label: 'Robotics', primitives: ROBOTICS_PRIMITIVES },
  { id: 'quantum', label: 'Quantum', primitives: QUANTUM_PRIMITIVES },
  { id: 'llm', label: 'LLM Safety', primitives: LLM_PRIMITIVES },
  { id: 'agency', label: 'Agency', primitives: AGENCY_PRIMITIVES },
  { id: 'media', label: 'Media', primitives: MEDIA_PRIMITIVES },
  { id: 'fintech', label: 'Fintech', primitives: FINTECH_PRIMITIVES },
  { id: 'ultimate', label: 'Ultimate', primitives: ULTIMATE_PRIMITIVES },
];

/** Get primitives for a specific pool selection */
export function getPrimitivePool(mode: 'core' | 'full' | VerticalId): string[] {
  if (mode === 'core') return [...CORE_PRIMITIVES];
  if (mode === 'full') return [...ALL_PRIMITIVES];
  const vertical = VERTICALS.find(v => v.id === mode);
  // Vertical mode = core spine + vertical-specific
  return vertical
    ? [...new Set([...CORE_PRIMITIVES, ...vertical.primitives])]
    : [...ALL_PRIMITIVES];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — EXPANDED CATEGORY AFFINITY (159-primitive aware)
// ═══════════════════════════════════════════════════════════════════════════════

/** Extended discovery categories including vertical domains */
export const EXPANDED_CATEGORIES: DiscoveryCategory[] = [
  // Original 20
  'cognitive', 'evolution', 'security', 'routing', 'learning',
  'orchestration', 'integration', 'observability', 'governance',
  'compliance', 'prediction', 'ethics', 'privacy', 'synthesis',
  'localization', 'geospatial', 'simulation', 'contracts', 'acquisition', 'edge',
];

/** 
 * Extended affinity map covering all 159 primitives.
 * Each category now includes relevant vertical primitives.
 */
export const EXPANDED_AFFINITY: Record<string, string[]> = {
  // Original categories (enhanced with vertical primitives)
  cognitive: ['BRAIN', 'CORTEX', 'MEMORY', 'DREAM', 'DECODE', 'ORACLE', 'REASON', 'SCHOLAR', 'SKEPTIC', 'SYLLOGISM', 'CLARITY', 'FULCRUM', 'ULT_APEX', 'ULT_CATALYST', 'TENSOR'],
  evolution: ['EVOLUTION', 'CORTEX', 'BRAIN', 'VISION', 'DREAM', 'ANALYTICS', 'FORGE', 'ULT_GENESIS', 'ULT_FLUX', 'ULT_PHOENIX', 'PIONEER', 'MUSE'],
  security: ['DEFENSE', 'ACCESS', 'GOVERNANCE', 'AUDIT', 'SYSTEM', 'IDENTITY', 'PHANTOM', 'WATCHTOWER', 'AEGIS', 'CIPHER', 'BASTION', 'IRONCLAD', 'CITADEL', 'SENTINEL_FIN', 'RAMPART', 'WARDEN', 'ULT_SENTINEL', 'ULT_MERIDIAN'],
  routing: ['NEXUS', 'CORTEX', 'ANALYTICS', 'SYSTEM', 'GOVERNANCE', 'REFLEX', 'RELAY', 'DISPATCH', 'UPLINK', 'ULT_CONDUIT', 'VECTOR', 'FLUX'],
  learning: ['BRAIN', 'DREAM', 'CORTEX', 'MEMORY', 'EVOLUTION', 'ANALYTICS', 'ECHO', 'SCHOLAR', 'TETHER', 'ANCHOR', 'LINEAGE', 'ULT_ORACLE'],
  orchestration: ['CORTEX', 'SYSTEM', 'ANALYTICS', 'NEXUS', 'VISION', 'NERVE', 'REFLEX', 'MANDATE', 'DELEGATE', 'KINETIC', 'SWARM', 'ENTANGLE', 'CAMPAIGN', 'STORYARC', 'MATCHBOOK', 'ULT_CONDUIT'],
  integration: ['DECODE', 'NEXUS', 'BRAIN', 'VISION', 'LINGUA', 'TREATY', 'UPLINK', 'LIAISON', 'ENVOY', 'RECONCILER', 'ULT_WELDER'],
  observability: ['VISION', 'ANALYTICS', 'CORTEX', 'BRAIN', 'NERVE', 'ECHO', 'ATLAS', 'BEACON', 'HERALD', 'LINEAGE', 'OVERSEER', 'METRIC', 'INSPECTOR', 'LIDAR', 'TRACER', 'ULT_HERALD'],
  governance: ['GOVERNANCE', 'BRAIN', 'DEFENSE', 'CORTEX', 'AUDIT', 'ACCESS', 'SOVEREIGN', 'CONSCIENCE', 'TRIBUNAL', 'REGULATOR', 'COMPLIANCE_FIN', 'COMPLY', 'ULT_ARBITER'],
  compliance: ['SOVEREIGN', 'GOVERNANCE', 'AUDIT', 'DEFENSE', 'ACCESS', 'CONSCIENCE', 'REGULATOR', 'COMPLIANCE_FIN', 'COMPLY', 'CUSTODIAN'],
  prediction: ['ORACLE', 'BRAIN', 'ANALYTICS', 'CORTEX', 'VISION', 'DREAM', 'TICKER', 'UNDERWRITER', 'RISKCORE', 'PORTFOLIO', 'ULT_ORACLE', 'FERMION'],
  ethics: ['CONSCIENCE', 'GOVERNANCE', 'BRAIN', 'CORTEX', 'SOVEREIGN', 'AUDIT', 'VERITAS', 'TRIBUNAL', 'SIEVE', 'EMBARGO'],
  privacy: ['PHANTOM', 'DEFENSE', 'ACCESS', 'IDENTITY', 'SOVEREIGN', 'GOVERNANCE', 'SHADE', 'NOCTURNE', 'CIPHER', 'BLACKOUT'],
  synthesis: ['FORGE', 'BRAIN', 'DREAM', 'CORTEX', 'EVOLUTION', 'FABRICATOR', 'CANVAS', 'RENDER', 'SCRIBE', 'ULT_CRUCIBLE', 'ULT_DYNAMO'],
  localization: ['LINGUA', 'DECODE', 'BRAIN', 'COMPASS', 'LEXICON', 'COPY', 'PERSONA'],
  geospatial: ['COMPASS', 'ANALYTICS', 'VISION', 'ORACLE', 'HARVEST', 'LIDAR', 'ENVIRON', 'VECTOR', 'PIONEER'],
  simulation: ['ECHO', 'BRAIN', 'CORTEX', 'ORACLE', 'ANALYTICS', 'VISION', 'QUBIT', 'HADRON', 'PLASMA', 'LATTICE', 'PHOTON', 'ULT_PRISM'],
  contracts: ['TREATY', 'GOVERNANCE', 'SOVEREIGN', 'ACCESS', 'AUDIT', 'CLEARING', 'LEDGER', 'TREASURY', 'MATCHBOOK'],
  acquisition: ['HARVEST', 'DECODE', 'ANALYTICS', 'VISION', 'COMPASS', 'RECON', 'PROWLER', 'RECON_AGENCY', 'CURATOR', 'FEED'],
  edge: ['REFLEX', 'NEXUS', 'SYSTEM', 'NERVE', 'CORTEX', 'ANALYTICS', 'VANGUARD', 'TEMPEST', 'SPECTER', 'OPERATOR', 'TOOLKIT', 'GRIPPER', 'SERVO'],
};

/** 
 * Cross-vertical synergy pairs — primitives that create emergent
 * capabilities when combined across verticals.
 */
export const CROSS_VERTICAL_SYNERGIES: Array<[string, string, number]> = [
  // Core × Cyber
  ['DEFENSE', 'WATCHTOWER', 0.15],
  ['DEFENSE', 'AEGIS', 0.12],
  ['BRAIN', 'RECON', 0.10],
  ['GOVERNANCE', 'CITADEL', 0.12],
  ['IDENTITY', 'CIPHER', 0.13],
  // Core × Robotics
  ['CORTEX', 'KINETIC', 0.12],
  ['NERVE', 'SERVO', 0.14],
  ['VISION', 'LIDAR', 0.15],
  ['FORGE', 'FABRICATOR', 0.13],
  ['ENGINEER', 'PIONEER', 0.11],
  // Core × Quantum
  ['BRAIN', 'QUBIT', 0.12],
  ['DREAM', 'ENTANGLE', 0.15],
  ['ANALYTICS', 'FERMION', 0.10],
  ['ORACLE', 'TACHYON', 0.11],
  // Core × LLM
  ['BRAIN', 'VERITAS', 0.14],
  ['DECODE', 'LEXICON', 0.13],
  ['CONSCIENCE', 'SKEPTIC', 0.12],
  ['GOVERNANCE', 'EMBARGO', 0.11],
  // Core × Agency
  ['CORTEX', 'MANDATE', 0.12],
  ['RELAY', 'DELEGATE', 0.13],
  ['BRAIN', 'REASON', 0.14],
  ['MEMORY', 'SCHOLAR', 0.12],
  // Core × Media
  ['FORGE', 'CANVAS', 0.12],
  ['DREAM', 'MUSE', 0.15],
  ['VISION', 'CURATOR', 0.11],
  ['ANALYTICS', 'METRIC', 0.10],
  // Core × Fintech
  ['MEMORY', 'LEDGER', 0.14],
  ['ECONOMY', 'TREASURY', 0.15],
  ['AUDIT', 'AUDITOR_FIN', 0.13],
  ['GOVERNANCE', 'REGULATOR', 0.12],
  ['ACCESS', 'VAULT_FIN', 0.11],
  // Cross-Vertical Synergies (Cyber × Fintech, etc.)
  ['WATCHTOWER', 'SENTINEL_FIN', 0.13],
  ['CIPHER', 'VAULT_FIN', 0.14],
  ['RECON', 'RECON_AGENCY', 0.12],
  ['SWARM', 'DELEGATE', 0.11],
  ['VERITAS', 'TRIBUNAL', 0.13],
  ['CANVAS', 'RENDER', 0.12],
  ['SCORE', 'REEL', 0.11],
  ['FABRICATOR', 'ULT_CRUCIBLE', 0.13],
  ['QUBIT', 'ULT_PRISM', 0.12],
];

/** 
 * Look up cross-vertical synergy bonus for a pair of primitives.
 * Returns 0 if no known synergy.
 */
export function getCrossVerticalSynergy(a: string, b: string): number {
  for (const [p1, p2, bonus] of CROSS_VERTICAL_SYNERGIES) {
    if ((a === p1 && b === p2) || (a === p2 && b === p1)) return bonus;
  }
  return 0;
}

/**
 * Compute enhanced synergy multiplier using cross-vertical bonuses.
 * Stacks bonuses from all pairs in the chain (capped at 1.35).
 */
export function computeExpandedSynergy(moduleChain: string[]): number {
  let bonus = 0;
  const unique = [...new Set(moduleChain)];

  // Base synergy from chain length
  if (unique.length >= 5) bonus += 0.18;
  else if (unique.length >= 4) bonus += 0.15;
  else if (unique.length >= 3) bonus += 0.08;

  // Cross-vertical pair bonuses
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      bonus += getCrossVerticalSynergy(unique[i], unique[j]);
    }
  }

  return Math.min(1 + bonus, 1.35);
}

/** Total classified primitive count */
export const TOTAL_PRIMITIVE_COUNT = ALL_PRIMITIVES.length;
