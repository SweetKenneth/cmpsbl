/**
 * CMPSBL® Global Primitive Name Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Canonical list of ALL primitive names across the substrate and every
 * vertical. When creating a new vertical, consult this registry to avoid
 * naming collisions.
 *
 * RULE: No primitive name may appear in more than one substrate context.
 *
 * Dynamic verticals register names at instantiation time via
 * registerDynamicName(), which updates RESERVED_NAMES in place.
 *
 * © CMPSBL® — All rights reserved.
 */

/** Primitive name entry with provenance — context/vertical are open strings for dynamic verticals */
export interface PrimitiveNameEntry {
  name: string;
  context: string;
  vertical: string;
  role: 'organ' | 'layer' | 'engine' | 'agent';
}

/**
 * Complete registry of all primitive names across all substrates.
 * ─── BEFORE adding a new vertical, check that NONE of its primitive
 *     names appear in this list. ───
 */
export const GLOBAL_PRIMITIVE_NAMES: PrimitiveNameEntry[] = [
  // ═══ SPINE — 12 Organs (inherited by ALL verticals) ═══
  { name: 'CORE',        context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'SYSTEM',      context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'BRAIN',       context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'MEMORY',      context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'NERVE',       context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'NEXUS',       context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'IDENTITY',    context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'SOVEREIGN',   context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'ATLAS',       context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'MEDIC',       context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'RELAY',       context: 'spine-organ', vertical: 'core', role: 'organ' },
  { name: 'CONSCIENCE',  context: 'spine-organ', vertical: 'core', role: 'organ' },

  // ═══ SPINE — 12 Layers (inherited by ALL verticals) ═══
  { name: 'DEFENSE',     context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'IMMUNITY',    context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'GOVERNANCE',  context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'TREATY',      context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'EVOLUTION',   context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'REFLEX',      context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'COMPASS',     context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'INTEGRATION', context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'INTENT',      context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'ACCESS',      context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'VISION',      context: 'spine-layer', vertical: 'core', role: 'layer' },
  { name: 'SHADOW',      context: 'spine-layer', vertical: 'core', role: 'layer' },

  // ═══ STANDARD SUBSTRATE (cmpsbl.com) — 8 Engines (canonical primitives) ═══
  { name: 'DREAM',       context: 'standard-engine', vertical: 'core', role: 'engine' },
  { name: 'HARVEST',     context: 'standard-engine', vertical: 'core', role: 'engine' },
  { name: 'FORGE',       context: 'standard-engine', vertical: 'core', role: 'engine' },
  { name: 'LINGUA',      context: 'standard-engine', vertical: 'core', role: 'engine' },
  { name: 'ECHO',        context: 'standard-engine', vertical: 'core', role: 'engine' },
  { name: 'PHANTOM',     context: 'standard-engine', vertical: 'core', role: 'engine' },
  { name: 'SANDBOX',     context: 'standard-engine', vertical: 'core', role: 'engine' },
  { name: 'RIPPLE',      context: 'standard-engine', vertical: 'core', role: 'engine' },

  // ═══ STANDARD SUBSTRATE (cmpsbl.com) — 8 Agents (canonical primitives) ═══
  { name: 'ENCODE',      context: 'standard-agent', vertical: 'core', role: 'agent' },
  { name: 'DECODE',      context: 'standard-agent', vertical: 'core', role: 'agent' },
  { name: 'AUDIT',       context: 'standard-agent', vertical: 'core', role: 'agent' },
  { name: 'ECONOMY',     context: 'standard-agent', vertical: 'core', role: 'agent' },
  { name: 'INCLUSIVE',   context: 'standard-agent', vertical: 'core', role: 'agent' },
  { name: 'CORTEX',      context: 'standard-agent', vertical: 'core', role: 'agent' },
  { name: 'ORACLE',      context: 'standard-agent', vertical: 'core', role: 'agent' },
  { name: 'ENGINEER',    context: 'standard-agent', vertical: 'core', role: 'agent' },

  // ═══ CYBERSECURITY VERTICAL (security.cmpsbl.com) — 8 Engines ═══
  { name: 'WATCHTOWER', context: 'cyber-engine', vertical: 'security', role: 'engine' },
  { name: 'SHADE',      context: 'cyber-engine', vertical: 'security', role: 'engine' },
  { name: 'AEGIS',      context: 'cyber-engine', vertical: 'security', role: 'engine' },
  { name: 'CIPHER',     context: 'cyber-engine', vertical: 'security', role: 'engine' },
  { name: 'RECON',      context: 'cyber-engine', vertical: 'security', role: 'engine' },
  { name: 'VANGUARD',   context: 'cyber-engine', vertical: 'security', role: 'engine' },
  { name: 'BASTION',    context: 'cyber-engine', vertical: 'security', role: 'engine' },
  { name: 'TEMPEST',    context: 'cyber-engine', vertical: 'security', role: 'engine' },

  // ═══ CYBERSECURITY VERTICAL (security.cmpsbl.com) — 8 Agents ═══
  { name: 'PROWLER',    context: 'cyber-agent', vertical: 'security', role: 'agent' },
  { name: 'ONYX',       context: 'cyber-agent', vertical: 'security', role: 'agent' },
  { name: 'SPECTER',    context: 'cyber-agent', vertical: 'security', role: 'agent' },
  { name: 'BLACKOUT',   context: 'cyber-agent', vertical: 'security', role: 'agent' },
  { name: 'TRACER',     context: 'cyber-agent', vertical: 'security', role: 'agent' },
  { name: 'NOCTURNE',   context: 'cyber-agent', vertical: 'security', role: 'agent' },
  { name: 'IRONCLAD',   context: 'cyber-agent', vertical: 'security', role: 'agent' },
  { name: 'CITADEL',    context: 'cyber-agent', vertical: 'security', role: 'agent' },

  // ═══ ROBOTICS VERTICAL (robotics.cmpsbl.com) — 8 Engines ═══
  { name: 'SERVO',      context: 'robotics-engine', vertical: 'robotics', role: 'engine' },
  { name: 'KINETIC',    context: 'robotics-engine', vertical: 'robotics', role: 'engine' },
  { name: 'LIDAR',      context: 'robotics-engine', vertical: 'robotics', role: 'engine' },
  { name: 'FABRICATOR', context: 'robotics-engine', vertical: 'robotics', role: 'engine' },
  { name: 'FLUX',       context: 'robotics-engine', vertical: 'robotics', role: 'engine' },
  { name: 'VECTOR',     context: 'robotics-engine', vertical: 'robotics', role: 'engine' },
  { name: 'TENSOR',     context: 'robotics-engine', vertical: 'robotics', role: 'engine' },
  { name: 'CALIBER',    context: 'robotics-engine', vertical: 'robotics', role: 'engine' },

  // ═══ ROBOTICS VERTICAL (robotics.cmpsbl.com) — 8 Agents ═══
  { name: 'GRIPPER',    context: 'robotics-agent', vertical: 'robotics', role: 'agent' },
  { name: 'SWARM',      context: 'robotics-agent', vertical: 'robotics', role: 'agent' },
  { name: 'ENVIRON',    context: 'robotics-agent', vertical: 'robotics', role: 'agent' },
  { name: 'GUARDIAN',   context: 'robotics-agent', vertical: 'robotics', role: 'agent' },
  { name: 'CONDUCTOR',  context: 'robotics-agent', vertical: 'robotics', role: 'agent' },
  { name: 'WELDER',     context: 'robotics-agent', vertical: 'robotics', role: 'agent' },
  { name: 'INSPECTOR',  context: 'robotics-agent', vertical: 'robotics', role: 'agent' },
  { name: 'PIONEER',    context: 'robotics-agent', vertical: 'robotics', role: 'agent' },

  // ═══ QUANTUM VERTICAL (quantum.cmpsbl.com) — 8 Engines ═══
  { name: 'HADRON',    context: 'quantum-engine', vertical: 'quantum', role: 'engine' },
  { name: 'QUBIT',     context: 'quantum-engine', vertical: 'quantum', role: 'engine' },
  { name: 'PHOTON',    context: 'quantum-engine', vertical: 'quantum', role: 'engine' },
  { name: 'FERMION',   context: 'quantum-engine', vertical: 'quantum', role: 'engine' },
  { name: 'ENTANGLE',  context: 'quantum-engine', vertical: 'quantum', role: 'engine' },
  { name: 'LATTICE',   context: 'quantum-engine', vertical: 'quantum', role: 'engine' },
  { name: 'PLASMA',    context: 'quantum-engine', vertical: 'quantum', role: 'engine' },
  { name: 'CRYOGEN',   context: 'quantum-engine', vertical: 'quantum', role: 'engine' },

  // ═══ QUANTUM VERTICAL (quantum.cmpsbl.com) — 8 Agents ═══
  { name: 'MUON',      context: 'quantum-agent', vertical: 'quantum', role: 'agent' },
  { name: 'BOSON',     context: 'quantum-agent', vertical: 'quantum', role: 'agent' },
  { name: 'NEUTRINO',  context: 'quantum-agent', vertical: 'quantum', role: 'agent' },
  { name: 'GLUON',     context: 'quantum-agent', vertical: 'quantum', role: 'agent' },
  { name: 'GRAVITON',  context: 'quantum-agent', vertical: 'quantum', role: 'agent' },
  { name: 'TACHYON',   context: 'quantum-agent', vertical: 'quantum', role: 'agent' },
  { name: 'MESON',     context: 'quantum-agent', vertical: 'quantum', role: 'agent' },
  { name: 'PRISM',     context: 'quantum-agent', vertical: 'quantum', role: 'agent' },

  // ═══ LLM VERTICAL (llm.cmpsbl.com) — 8 Engines ═══
  { name: 'VERITAS',   context: 'llm-engine', vertical: 'llm', role: 'engine' },
  { name: 'RAMPART',   context: 'llm-engine', vertical: 'llm', role: 'engine' },
  { name: 'SYLLOGISM', context: 'llm-engine', vertical: 'llm', role: 'engine' },
  { name: 'LEXICON',   context: 'llm-engine', vertical: 'llm', role: 'engine' },
  { name: 'CLARITY',   context: 'llm-engine', vertical: 'llm', role: 'engine' },
  { name: 'FULCRUM',   context: 'llm-engine', vertical: 'llm', role: 'engine' },
  { name: 'TETHER',    context: 'llm-engine', vertical: 'llm', role: 'engine' },
  { name: 'SIEVE',     context: 'llm-engine', vertical: 'llm', role: 'engine' },

  // ═══ LLM VERTICAL (llm.cmpsbl.com) — 8 Agents ═══
  { name: 'SKEPTIC',   context: 'llm-agent', vertical: 'llm', role: 'agent' },
  { name: 'TRIBUNAL',  context: 'llm-agent', vertical: 'llm', role: 'agent' },
  { name: 'HERALD',    context: 'llm-agent', vertical: 'llm', role: 'agent' },
  { name: 'MIMIC',     context: 'llm-agent', vertical: 'llm', role: 'agent' },
  { name: 'LINEAGE',   context: 'llm-agent', vertical: 'llm', role: 'agent' },
  { name: 'EMBARGO',   context: 'llm-agent', vertical: 'llm', role: 'agent' },
  { name: 'GAUNTLET',  context: 'llm-agent', vertical: 'llm', role: 'agent' },
  { name: 'CUSTODIAN', context: 'llm-agent', vertical: 'llm', role: 'agent' },

  // ═══ AGENCY VERTICAL (agency.cmpsbl.com) — 8 Engines ═══
  { name: 'MANDATE',   context: 'agency-engine', vertical: 'agency', role: 'engine' },
  { name: 'DELEGATE',  context: 'agency-engine', vertical: 'agency', role: 'engine' },
  { name: 'RECONN',    context: 'agency-engine', vertical: 'agency', role: 'engine' },
  { name: 'UPLINK',    context: 'agency-engine', vertical: 'agency', role: 'engine' },
  { name: 'SCRIBE',    context: 'agency-engine', vertical: 'agency', role: 'engine' },
  { name: 'INCENTIVE', context: 'agency-engine', vertical: 'agency', role: 'engine' },
  { name: 'REASON',    context: 'agency-engine', vertical: 'agency', role: 'engine' },
  { name: 'TOOLKIT',   context: 'agency-engine', vertical: 'agency', role: 'engine' },

  // ═══ AGENCY VERTICAL (agency.cmpsbl.com) — 8 Agents ═══
  { name: 'OPERATOR',  context: 'agency-agent', vertical: 'agency', role: 'agent' },
  { name: 'OVERSEER',  context: 'agency-agent', vertical: 'agency', role: 'agent' },
  { name: 'DIPLOMAT',  context: 'agency-agent', vertical: 'agency', role: 'agent' },
  { name: 'SCHOLAR',   context: 'agency-agent', vertical: 'agency', role: 'agent' },
  { name: 'ENVOY',     context: 'agency-agent', vertical: 'agency', role: 'agent' },
  { name: 'WARDEN',    context: 'agency-agent', vertical: 'agency', role: 'agent' },
  { name: 'ROGUE',     context: 'agency-agent', vertical: 'agency', role: 'agent' },
  { name: 'ANCHOR',    context: 'agency-agent', vertical: 'agency', role: 'agent' },
];

/** Mutable set of all reserved primitive names (case-insensitive lookup) */
const RESERVED_NAMES = new Set(
  GLOBAL_PRIMITIVE_NAMES.map(e => e.name.toUpperCase())
);

/**
 * Check if a primitive name is already taken across any substrate.
 */
export function isPrimitiveNameTaken(name: string): boolean {
  return RESERVED_NAMES.has(name.toUpperCase());
}

/**
 * Register a dynamic vertical's primitive name into the global registry.
 * Called by the Vertical Factory Engine at instantiation time.
 */
export function registerDynamicName(entry: PrimitiveNameEntry): void {
  GLOBAL_PRIMITIVE_NAMES.push(entry);
  RESERVED_NAMES.add(entry.name.toUpperCase());
}

/**
 * Validate a list of proposed primitive names for a new vertical.
 * Returns names that collide with existing primitives.
 */
export function validateVerticalNames(proposedNames: string[]): string[] {
  return proposedNames.filter(n => RESERVED_NAMES.has(n.toUpperCase()));
}

/**
 * Get all names used by a specific vertical.
 */
export function getVerticalNames(vertical: string): string[] {
  return GLOBAL_PRIMITIVE_NAMES
    .filter(e => e.vertical === vertical)
    .map(e => e.name);
}

/**
 * Get all reserved names as a flat array.
 */
export function getAllReservedNames(): string[] {
  return Array.from(RESERVED_NAMES);
}