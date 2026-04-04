/**
 * Crown Jewel Canon — Module Whitelist & Drift Enforcement
 * Prevents non-canonical module references in S-tier artifacts.
 */

/** All canonical substrate primitives + vertical expansion primitives */
export const CANONICAL_MODULES = [
  // Core 40 Primitives — 12 Organs
  'CORE', 'SYSTEM', 'BRAIN', 'MEMORY', 'NERVE', 'NEXUS',
  'IDENTITY', 'SOVEREIGN', 'ATLAS', 'MEDIC', 'RELAY', 'CONSCIENCE',
  // Core 40 Primitives — 12 Layers
  'DEFENSE', 'IMMUNITY', 'GOVERNANCE', 'TREATY', 'EVOLUTION', 'REFLEX',
  'COMPASS', 'INTEGRATION', 'INTENT', 'ACCESS', 'VISION', 'SHADOW',
  // Core 40 Primitives — 8 Engines
  'DREAM', 'HARVEST', 'FORGE', 'LINGUA', 'ECHO', 'PHANTOM', 'SANDBOX', 'RIPPLE',
  // Core 40 Primitives — 8 Agents
  'ENCODE', 'DECODE', 'AUDIT', 'ECONOMY', 'INCLUSIVE', 'CORTEX', 'ORACLE', 'ENGINEER',
  // CYBER™ Vertical Engines
  'WATCHTOWER', 'SHADE', 'AEGIS', 'CIPHER', 'RECON', 'VANGUARD', 'BASTION', 'TEMPEST',
  // CYBER™ Vertical Agents
  'PROWLER', 'ONYX', 'SPECTER', 'BLACKOUT', 'TRACER', 'NOCTURNE', 'IRONCLAD', 'CITADEL',
  // ROBOTICS™ Vertical Engines
  'SERVO', 'KINETIC', 'LIDAR', 'FABRICATOR', 'FLUX', 'VECTOR', 'TENSOR', 'CALIBER',
  // ROBOTICS™ Vertical Agents
  'GRIPPER', 'SWARM', 'ENVIRON', 'MARSHAL', 'DISPATCH', 'WELDER', 'INSPECTOR', 'PIONEER',
  // QUANTUM™ Vertical Engines
  'HADRON', 'QUBIT', 'PHOTON', 'FERMION', 'ENTANGLE', 'LATTICE', 'PLASMA', 'CRYOGEN',
  // QUANTUM™ Vertical Agents
  'MUON', 'BOSON', 'NEUTRINO', 'GLUON', 'GRAVITON', 'TACHYON', 'MESON', 'PRISM',
  // LLM™ Vertical Engines
  'VERITAS', 'RAMPART', 'SYLLOGISM', 'LEXICON', 'CLARITY', 'FULCRUM', 'TETHER', 'SIEVE',
  // LLM™ Vertical Agents
  'SKEPTIC', 'TRIBUNAL', 'HERALD', 'MIMIC', 'LINEAGE', 'EMBARGO', 'GAUNTLET', 'CUSTODIAN',
  // AGENCY™ Vertical Engines
  'MANDATE', 'DELEGATE', 'RECONN', 'UPLINK', 'SCRIBE', 'INCENTIVE', 'REASON', 'TOOLKIT',
  // AGENCY™ Vertical Agents
  'OPERATOR', 'OVERSEER', 'LIAISON', 'SCHOLAR', 'ENVOY', 'WARDEN', 'ROGUE', 'ANCHOR',
] as const;

export type CanonicalModule = typeof CANONICAL_MODULES[number];

/** Cross-module compound references (e.g. CORTEX×BRAIN) */
export function parseModuleRef(ref: string): string[] {
  return ref.split(/[×x×]/i).map(s => s.trim());
}

export function isCanonicalModule(mod: string): boolean {
  const parts = parseModuleRef(mod);
  return parts.every(p => (CANONICAL_MODULES as readonly string[]).includes(p));
}

/** Drift log — in-memory for client-side, could be persisted */
export interface DriftAttempt {
  timestamp: string;
  artifactId: string;
  invalidModule: string;
  reason: string;
}

const driftLog: DriftAttempt[] = [];

export function logDrift(artifactId: string, invalidModule: string, reason: string): void {
  driftLog.push({
    timestamp: new Date().toISOString(),
    artifactId,
    invalidModule,
    reason,
  });
  console.warn(`[CJ-DRIFT] ${reason}: "${invalidModule}" in artifact ${artifactId}`);
}

export function getDriftLog(): DriftAttempt[] {
  return [...driftLog];
}

export function clearDriftLog(): void {
  driftLog.length = 0;
}

/**
 * Validate an artifact's module reference against the canon.
 * Returns true if valid, false + logs drift if invalid.
 */
export function validateArtifactModule(artifactId: string, moduleRef: string): boolean {
  if (isCanonicalModule(moduleRef)) return true;
  logDrift(artifactId, moduleRef, 'Non-whitelisted module reference');
  return false;
}
