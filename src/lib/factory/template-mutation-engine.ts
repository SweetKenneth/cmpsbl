/**
 * CMPSBL® — Template Mutation Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runs AFTER the existing template pass as an additive layer.
 * Takes proven high-scoring discoveries (CJPI ≥ 90), generates mutations
 * via four strategies, scores them, and persists winners to the database.
 *
 * Mutation types:
 *   1. Primitive Swap    — replace one primitive with a related one
 *   2. Chain Extension   — add one primitive from the vertical pool
 *   3. Chain Shortening  — remove the last primitive
 *   4. Crown Jewel Injection — inject a Crown Jewel capability at entry/exit
 *
 * Over time the template library grows from ~126 toward thousands of
 * proven patterns, each generation informed by the best of the last.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export type MutationType = 'primitive-swap' | 'chain-extension' | 'chain-shortening' | 'crown-jewel-injection';

export interface MutationCandidate {
  id: string;
  parentId: string;
  parentName: string;
  parentCjpi: number;
  name: string;
  description: string;
  chain: string[];
  cjpi: number;
  tier: string;
  status: string;
  mutationType: MutationType;
  generation: number;
  vertical: string;
  category: string;
  delta: number; // cjpi - parentCjpi
  promoted: boolean; // scored higher than parent
}

export interface MutationCycleResult {
  vertical: string;
  parentsProcessed: number;
  candidatesGenerated: number;
  promotedCount: number;
  junkyardCount: number;
  discardedCount: number;
  candidates: MutationCandidate[];
  completedAt: string;
}

interface ParentDiscovery {
  id: string;
  name: string;
  description: string;
  cjpi: number;
  module_chain: string[];
  vertical: string;
  category: string;
  generation: number;
  crown_jewel_capabilities: CrownJewelCap[] | null;
}

interface CrownJewelCap {
  primitive: string;
  capability: string;
  cjpi: number;
}

// ═══════════════════════════════════════════════════════════════
// §2 — PRIMITIVE AFFINITY MAPS
// ═══════════════════════════════════════════════════════════════

/**
 * Related primitives for swap mutations.
 * Each primitive maps to 2-4 semantically adjacent primitives.
 */
const PRIMITIVE_AFFINITIES: Record<string, string[]> = {
  // Spine — Organs
  CORE: ['SYSTEM', 'BRAIN', 'NERVE'],
  SYSTEM: ['CORE', 'INTEGRATION', 'ATLAS'],
  BRAIN: ['CORTEX', 'MEMORY', 'CONSCIENCE'],
  MEMORY: ['BRAIN', 'ANCHOR', 'ARCHIVE'],
  NERVE: ['RELAY', 'REFLEX', 'CORE'],
  NEXUS: ['RELAY', 'INTEGRATION', 'CORE'],
  IDENTITY: ['SOVEREIGN', 'ACCESS', 'CONSCIENCE'],
  SOVEREIGN: ['IDENTITY', 'GOVERNANCE', 'TREATY'],
  ATLAS: ['COMPASS', 'SYSTEM', 'INTEGRATION'],
  MEDIC: ['BEACON', 'INSPECTOR', 'SYSTEM'],
  RELAY: ['NERVE', 'NEXUS', 'UPLINK'],
  CONSCIENCE: ['BRAIN', 'GOVERNANCE', 'IDENTITY'],
  // Spine — Layers
  DEFENSE: ['IMMUNITY', 'BASTION', 'AEGIS'],
  IMMUNITY: ['DEFENSE', 'IRONCLAD', 'CITADEL'],
  GOVERNANCE: ['TREATY', 'SOVEREIGN', 'WARDEN'],
  TREATY: ['GOVERNANCE', 'DIPLOMAT', 'SOVEREIGN'],
  EVOLUTION: ['FORGE', 'DREAM', 'REFLEX'],
  REFLEX: ['NERVE', 'EVOLUTION', 'COMPASS'],
  COMPASS: ['ATLAS', 'REFLEX', 'INTENT'],
  INTEGRATION: ['SYSTEM', 'NEXUS', 'ATLAS'],
  INTENT: ['COMPASS', 'BRAIN', 'REASON'],
  ACCESS: ['IDENTITY', 'SOVEREIGN', 'CITADEL'],
  BEACON: ['MEDIC', 'INSPECTOR', 'WATCHTOWER'],
  SHADOW: ['PHANTOM', 'SHADE', 'SPECTER'],
  // Core Expansion — Engines
  DREAM: ['PHANTOM', 'EVOLUTION', 'HARVEST'],
  HARVEST: ['DREAM', 'FORGE', 'RECON'],
  FORGE: ['EVOLUTION', 'FABRICATOR', 'HARVEST'],
  LINGUA: ['LEXICON', 'CLARITY', 'ECHO'],
  ECHO: ['LINGUA', 'VOICE', 'RELAY'],
  PHANTOM: ['SHADOW', 'DREAM', 'SPECTER'],
  SANDBOX: ['SIMULATE', 'FORGE', 'PIONEER'],
  RIPPLE: ['RELAY', 'ECHO', 'FLUX'],
  // Core Expansion — Agents
  ENCODE: ['DECODE', 'CIPHER', 'CORTEX'],
  DECODE: ['ENCODE', 'CORTEX', 'SIEVE'],
  AUDIT: ['WARDEN', 'GOVERNANCE', 'TRACER'],
  ECONOMY: ['INCENTIVE', 'DISPATCH', 'ATLAS'],
  INCLUSIVE: ['CONSCIENCE', 'DIPLOMAT', 'ENVOY'],
  CORTEX: ['BRAIN', 'ENCODE', 'DECODE'],
  ORACLE: ['BRAIN', 'SKEPTIC', 'VERITAS'],
  ENGINEER: ['FABRICATOR', 'FORGE', 'PIONEER'],
  // Cyber
  WATCHTOWER: ['RECON', 'BEACON', 'TRACER'],
  SHADE: ['SHADOW', 'SPECTER', 'PROWLER'],
  AEGIS: ['DEFENSE', 'BASTION', 'IRONCLAD'],
  CIPHER: ['ENCODE', 'DECODE', 'IRONCLAD'],
  RECON: ['WATCHTOWER', 'PROWLER', 'RECONN'],
  VANGUARD: ['AEGIS', 'BASTION', 'MARSHAL'],
  BASTION: ['CITADEL', 'AEGIS', 'DEFENSE'],
  TEMPEST: ['FLUX', 'RIPPLE', 'BLACKOUT'],
  PROWLER: ['RECON', 'SHADE', 'SPECTER'],
  ONYX: ['TRACER', 'RECON', 'ORACLE'],
  SPECTER: ['PHANTOM', 'SHADE', 'PROWLER'],
  BLACKOUT: ['NOCTURNE', 'TEMPEST', 'SHADE'],
  TRACER: ['ONYX', 'AUDIT', 'RECON'],
  NOCTURNE: ['BLACKOUT', 'SHADOW', 'SHADE'],
  IRONCLAD: ['IMMUNITY', 'AEGIS', 'CITADEL'],
  CITADEL: ['BASTION', 'IRONCLAD', 'DEFENSE'],
  // Robotics
  SERVO: ['KINETIC', 'FLUX', 'CALIBER'],
  KINETIC: ['SERVO', 'VECTOR', 'FLUX'],
  LIDAR: ['ENVIRON', 'CALIBER', 'INSPECTOR'],
  FABRICATOR: ['FORGE', 'WELDER', 'ENGINEER'],
  FLUX: ['SERVO', 'KINETIC', 'RIPPLE'],
  VECTOR: ['KINETIC', 'TENSOR', 'COMPASS'],
  TENSOR: ['VECTOR', 'CORTEX', 'CALIBER'],
  CALIBER: ['SERVO', 'LIDAR', 'INSPECTOR'],
  GRIPPER: ['FABRICATOR', 'SERVO', 'WELDER'],
  SWARM: ['MARSHAL', 'DISPATCH', 'RELAY'],
  ENVIRON: ['LIDAR', 'ATLAS', 'INSPECTOR'],
  MARSHAL: ['DISPATCH', 'SWARM', 'VANGUARD'],
  DISPATCH: ['MARSHAL', 'SWARM', 'MANDATE'],
  WELDER: ['FABRICATOR', 'GRIPPER', 'FORGE'],
  INSPECTOR: ['CALIBER', 'ENVIRON', 'BEACON'],
  PIONEER: ['ENGINEER', 'SANDBOX', 'RECON'],
  // LLM
  VERITAS: ['SKEPTIC', 'ORACLE', 'LINEAGE'],
  RAMPART: ['DEFENSE', 'GAUNTLET', 'EMBARGO'],
  SYLLOGISM: ['REASON', 'SKEPTIC', 'BRAIN'],
  LEXICON: ['LINGUA', 'CLARITY', 'SIEVE'],
  CLARITY: ['LEXICON', 'LINGUA', 'VERITAS'],
  FULCRUM: ['HERALD', 'TRIBUNAL', 'ECONOMY'],
  TETHER: ['EMBARGO', 'RAMPART', 'GOVERNANCE'],
  SIEVE: ['LEXICON', 'DECODE', 'CLARITY'],
  SKEPTIC: ['VERITAS', 'TRIBUNAL', 'SYLLOGISM'],
  TRIBUNAL: ['SKEPTIC', 'GOVERNANCE', 'WARDEN'],
  HERALD: ['FULCRUM', 'ENVOY', 'BROADCAST'],
  MIMIC: ['ECHO', 'PHANTOM', 'CORTEX'],
  LINEAGE: ['VERITAS', 'AUDIT', 'TRACER'],
  EMBARGO: ['TETHER', 'RAMPART', 'DEFENSE'],
  GAUNTLET: ['RAMPART', 'SHADE', 'DEFENSE'],
  CUSTODIAN: ['WARDEN', 'GOVERNANCE', 'EMBARGO'],
  // Quantum
  QUBIT: ['ENTANGLE', 'SUPERPOSE', 'MEASURE'],
  ENTANGLE: ['QUBIT', 'TELEPORT', 'SUPERPOSE'],
  SUPERPOSE: ['QUBIT', 'HADAMARD', 'ENTANGLE'],
  DECOHERE: ['FIDELITY', 'SURFACE', 'MEASURE'],
  TELEPORT: ['ENTANGLE', 'RELAY', 'QUBIT'],
  ANNEAL: ['GROVER', 'LATTICE', 'TOPOLOGY'],
  TOPOLOGY: ['SURFACE', 'LATTICE', 'ANNEAL'],
  HADAMARD: ['SUPERPOSE', 'PHASE', 'QUBIT'],
  GROVER: ['SHOR', 'ANNEAL', 'QUBIT'],
  SHOR: ['GROVER', 'CIPHER', 'QUBIT'],
  MEASURE: ['QUBIT', 'DECOHERE', 'FIDELITY'],
  SURFACE: ['TOPOLOGY', 'DECOHERE', 'LATTICE'],
  FIDELITY: ['DECOHERE', 'MEASURE', 'CALIBER'],
  LATTICE: ['TOPOLOGY', 'SURFACE', 'ANNEAL'],
  BOSON: ['PHASE', 'QUBIT', 'SUPERPOSE'],
  PHASE: ['HADAMARD', 'BOSON', 'SUPERPOSE'],
  // Agency
  MANDATE: ['OPERATOR', 'DISPATCH', 'DELEGATE'],
  OPERATOR: ['MANDATE', 'OVERSEER', 'REASON'],
  REASON: ['SYLLOGISM', 'BRAIN', 'OPERATOR'],
  DELEGATE: ['MANDATE', 'DIPLOMAT', 'DISPATCH'],
  RECONN: ['RECON', 'SCHOLAR', 'HARVEST'],
  DIPLOMAT: ['TREATY', 'DELEGATE', 'ENVOY'],
  SCHOLAR: ['BRAIN', 'MEMORY', 'RECONN'],
  WARDEN: ['GOVERNANCE', 'CUSTODIAN', 'AUDIT'],
  ANCHOR: ['MEMORY', 'LINEAGE', 'ARCHIVE'],
  SCRIBE: ['LEXICON', 'ENVOY', 'LINGUA'],
  ENVOY: ['DIPLOMAT', 'HERALD', 'SCRIBE'],
  ROGUE: ['PHANTOM', 'SHADE', 'PIONEER'],
  OVERSEER: ['OPERATOR', 'WARDEN', 'INSPECTOR'],
  UPLINK: ['RELAY', 'BROADCAST', 'NERVE'],
  TOOLKIT: ['ENGINEER', 'FORGE', 'FABRICATOR'],
  INCENTIVE: ['ECONOMY', 'SCHOLAR', 'MANDATE'],
  // Media
  CANVAS: ['PALETTE', 'PIXEL', 'FRAME'],
  LENS: ['LIDAR', 'FILTER', 'FRAME'],
  STAGE: ['STUDIO', 'BROADCAST', 'RENDER'],
  SCORE: ['VOICE', 'ECHO', 'TIMELINE'],
  FRAME: ['CANVAS', 'MONTAGE', 'TIMELINE'],
  PALETTE: ['CANVAS', 'FILTER', 'PIXEL'],
  MONTAGE: ['FRAME', 'TIMELINE', 'ARCHIVE'],
  VOICE: ['SCORE', 'ECHO', 'LINGUA'],
  RENDER: ['PIXEL', 'STUDIO', 'FORGE'],
  PIXEL: ['RENDER', 'CANVAS', 'PALETTE'],
  STUDIO: ['STAGE', 'RENDER', 'BROADCAST'],
  BROADCAST: ['PUBLISHER', 'STAGE', 'HERALD'],
  ARCHIVE: ['MEMORY', 'MONTAGE', 'ANCHOR'],
  FILTER: ['SIEVE', 'PALETTE', 'LENS'],
  TIMELINE: ['FRAME', 'MONTAGE', 'SCORE'],
  PUBLISHER: ['BROADCAST', 'HERALD', 'SCRIBE'],
};

// ═══════════════════════════════════════════════════════════════
// §3 — VERTICAL PRIMITIVE POOLS
// ═══════════════════════════════════════════════════════════════

const SPINE = [
  'CORE', 'SYSTEM', 'BRAIN', 'MEMORY', 'NERVE', 'NEXUS',
  'IDENTITY', 'SOVEREIGN', 'ATLAS', 'MEDIC', 'RELAY', 'CONSCIENCE',
  'DEFENSE', 'IMMUNITY', 'GOVERNANCE', 'TREATY', 'EVOLUTION', 'REFLEX',
  'COMPASS', 'INTEGRATION', 'INTENT', 'ACCESS', 'BEACON', 'SHADOW',
];

const VERTICAL_POOLS: Record<string, string[]> = {
  primary: [...SPINE, 'DREAM', 'HARVEST', 'FORGE', 'LINGUA', 'ECHO', 'PHANTOM', 'SANDBOX', 'RIPPLE', 'ENCODE', 'DECODE', 'AUDIT', 'ECONOMY', 'INCLUSIVE', 'CORTEX', 'ORACLE', 'ENGINEER'],
  cyber: [...SPINE, 'WATCHTOWER', 'SHADE', 'AEGIS', 'CIPHER', 'RECON', 'VANGUARD', 'BASTION', 'TEMPEST', 'PROWLER', 'ONYX', 'SPECTER', 'BLACKOUT', 'TRACER', 'NOCTURNE', 'IRONCLAD', 'CITADEL'],
  robotics: [...SPINE, 'SERVO', 'KINETIC', 'LIDAR', 'FABRICATOR', 'FLUX', 'VECTOR', 'TENSOR', 'CALIBER', 'GRIPPER', 'SWARM', 'ENVIRON', 'MARSHAL', 'DISPATCH', 'WELDER', 'INSPECTOR', 'PIONEER'],
  llm: [...SPINE, 'VERITAS', 'RAMPART', 'SYLLOGISM', 'LEXICON', 'CLARITY', 'FULCRUM', 'TETHER', 'SIEVE', 'SKEPTIC', 'TRIBUNAL', 'HERALD', 'MIMIC', 'LINEAGE', 'EMBARGO', 'GAUNTLET', 'CUSTODIAN'],
  quantum: [...SPINE, 'QUBIT', 'ENTANGLE', 'SUPERPOSE', 'DECOHERE', 'TELEPORT', 'ANNEAL', 'TOPOLOGY', 'HADAMARD', 'GROVER', 'SHOR', 'MEASURE', 'SURFACE', 'FIDELITY', 'LATTICE', 'BOSON', 'PHASE'],
  agency: [...SPINE, 'MANDATE', 'OPERATOR', 'REASON', 'DELEGATE', 'RECONN', 'DIPLOMAT', 'SCHOLAR', 'WARDEN', 'ANCHOR', 'SCRIBE', 'ENVOY', 'ROGUE', 'OVERSEER', 'UPLINK', 'TOOLKIT', 'INCENTIVE'],
  media: [...SPINE, 'CANVAS', 'LENS', 'STAGE', 'SCORE', 'FRAME', 'PALETTE', 'MONTAGE', 'VOICE', 'RENDER', 'PIXEL', 'STUDIO', 'BROADCAST', 'ARCHIVE', 'FILTER', 'TIMELINE', 'PUBLISHER'],
  ultimate: [
    ...SPINE,
    'DREAM', 'HARVEST', 'FORGE', 'LINGUA', 'ECHO', 'PHANTOM', 'SANDBOX', 'RIPPLE',
    'ENCODE', 'DECODE', 'AUDIT', 'ECONOMY', 'INCLUSIVE', 'CORTEX', 'ORACLE', 'ENGINEER',
    'WATCHTOWER', 'SHADE', 'AEGIS', 'CIPHER', 'RECON', 'VANGUARD', 'BASTION', 'TEMPEST', 'PROWLER', 'ONYX', 'SPECTER', 'BLACKOUT', 'TRACER', 'NOCTURNE', 'IRONCLAD', 'CITADEL',
    'SERVO', 'KINETIC', 'LIDAR', 'FABRICATOR', 'FLUX', 'VECTOR', 'TENSOR', 'CALIBER', 'GRIPPER', 'SWARM', 'ENVIRON', 'MARSHAL', 'DISPATCH', 'WELDER', 'INSPECTOR', 'PIONEER',
    'VERITAS', 'RAMPART', 'SYLLOGISM', 'LEXICON', 'CLARITY', 'FULCRUM', 'TETHER', 'SIEVE', 'SKEPTIC', 'TRIBUNAL', 'HERALD', 'MIMIC', 'LINEAGE', 'EMBARGO', 'GAUNTLET', 'CUSTODIAN',
    'QUBIT', 'ENTANGLE', 'SUPERPOSE', 'DECOHERE', 'TELEPORT', 'ANNEAL', 'TOPOLOGY', 'HADAMARD', 'GROVER', 'SHOR', 'MEASURE', 'SURFACE', 'FIDELITY', 'LATTICE', 'BOSON', 'PHASE',
    'MANDATE', 'OPERATOR', 'REASON', 'DELEGATE', 'RECONN', 'DIPLOMAT', 'SCHOLAR', 'WARDEN', 'ANCHOR', 'SCRIBE', 'ENVOY', 'ROGUE', 'OVERSEER', 'UPLINK', 'TOOLKIT', 'INCENTIVE',
    'CANVAS', 'LENS', 'STAGE', 'SCORE', 'FRAME', 'PALETTE', 'MONTAGE', 'VOICE', 'RENDER', 'PIXEL', 'STUDIO', 'BROADCAST', 'ARCHIVE', 'FILTER', 'TIMELINE', 'PUBLISHER',
  ],
};

// ═══════════════════════════════════════════════════════════════
// §4 — DETERMINISTIC RNG (seeded per cycle)
// ═══════════════════════════════════════════════════════════════

function seedRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ═══════════════════════════════════════════════════════════════
// §5 — SCORING (matches existing seed engine formula)
// ═══════════════════════════════════════════════════════════════

function scoreMutationCjpi(chain: string[], rand: () => number): number {
  const chainBonus = chain.length * 5;
  // Spine primitives in chain add a small affinity bonus
  const spineCount = chain.filter(p => SPINE.includes(p)).length;
  const spineBonus = Math.min(spineCount * 2, 10);
  // Unique primitive diversity bonus
  const uniqueBonus = new Set(chain).size === chain.length ? 3 : 0;
  const base = 45 + chainBonus + spineBonus + uniqueBonus + Math.floor(rand() * 12);
  return Math.min(100, Math.max(30, base));
}

function classifyTier(score: number): string {
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  if (score >= 68) return 'Mint';
  return 'Raw';
}

function classifyStatus(cjpi: number): string {
  if (cjpi >= 95) return 'registry';
  if (cjpi >= 68) return 'showroom';
  return 'junkyard';
}

// ═══════════════════════════════════════════════════════════════
// §6 — MUTATION STRATEGIES
// ═══════════════════════════════════════════════════════════════

/**
 * 1. Primitive Swap — replace one primitive with a related one.
 */
function mutatePrimitiveSwap(chain: string[], rand: () => number): string[] | null {
  const swappable = chain.filter(p => PRIMITIVE_AFFINITIES[p]?.length);
  if (swappable.length === 0) return null;

  const target = swappable[Math.floor(rand() * swappable.length)];
  const alternatives = PRIMITIVE_AFFINITIES[target].filter(a => !chain.includes(a));
  if (alternatives.length === 0) return null;

  const replacement = alternatives[Math.floor(rand() * alternatives.length)];
  return chain.map(p => p === target ? replacement : p);
}

/**
 * 2. Chain Extension — add one primitive from the vertical pool.
 */
function mutateChainExtension(chain: string[], pool: string[], rand: () => number): string[] | null {
  if (chain.length >= 12) return null; // cap at 12
  const candidates = pool.filter(p => !chain.includes(p));
  if (candidates.length === 0) return null;

  const addition = candidates[Math.floor(rand() * candidates.length)];
  return [...chain, addition];
}

/**
 * 3. Chain Shortening — remove the last primitive.
 */
function mutateChainShortening(chain: string[]): string[] | null {
  if (chain.length <= 2) return null; // minimum viable chain
  return chain.slice(0, -1);
}

/**
 * 4. Crown Jewel Injection — pull a CJ capability and inject at entry/exit.
 * This connects Crown Jewels to the discovery process.
 */
async function mutateCrownJewelInjection(
  chain: string[],
  vertical: string,
  rand: () => number,
): Promise<string[] | null> {
  // Find Crown Jewels whose primitives overlap with this chain
  const { data: jewels } = await supabase
    .from('discoveries')
    .select('module_chain, crown_jewel_capabilities')
    .eq('is_crown_jewel', true)
    .eq('vertical', vertical)
    .limit(50);

  if (!jewels || jewels.length === 0) {
    // Fall back to primary vertical Crown Jewels
    const { data: fallback } = await supabase
      .from('discoveries')
      .select('module_chain, crown_jewel_capabilities')
      .eq('is_crown_jewel', true)
      .eq('vertical', 'primary')
      .limit(50);
    if (!fallback || fallback.length === 0) return null;
    return injectFromJewels(chain, fallback, rand);
  }

  return injectFromJewels(chain, jewels, rand);
}

function injectFromJewels(
  chain: string[],
  jewels: Array<{ module_chain: string[]; crown_jewel_capabilities: unknown }>,
  rand: () => number,
): string[] | null {
  // Collect primitives from Crown Jewel chains that aren't already in our chain
  const candidates: string[] = [];
  for (const j of jewels) {
    const jChain = Array.isArray(j.module_chain) ? j.module_chain : [];
    for (const p of jChain) {
      if (!chain.includes(p) && !candidates.includes(p)) {
        candidates.push(p);
      }
    }
  }

  if (candidates.length === 0) return null;

  const injection = candidates[Math.floor(rand() * candidates.length)];
  const newChain = [...chain];

  // Inject at entry (position 0) or exit (last position)
  if (rand() > 0.5) {
    newChain.unshift(injection);
  } else {
    newChain.push(injection);
  }

  // Cap at 12
  if (newChain.length > 12) return newChain.slice(0, 12);
  return newChain;
}

// ═══════════════════════════════════════════════════════════════
// §7 — MUTATION NAME GENERATOR
// ═══════════════════════════════════════════════════════════════

const MUTATION_PREFIXES: Record<MutationType, string[]> = {
  'primitive-swap': ['Variant', 'Alternate', 'Divergent', 'Shifted', 'Recombined'],
  'chain-extension': ['Extended', 'Augmented', 'Deepened', 'Expanded', 'Amplified'],
  'chain-shortening': ['Condensed', 'Distilled', 'Refined', 'Focused', 'Essential'],
  'crown-jewel-injection': ['Jewel-Fused', 'Crown-Infused', 'Heritage', 'Ascended', 'Enriched'],
};

function generateMutationName(parentName: string, mutationType: MutationType, rand: () => number): string {
  const prefixes = MUTATION_PREFIXES[mutationType];
  const prefix = prefixes[Math.floor(rand() * prefixes.length)];
  // Take first 3-4 words of parent name
  const core = parentName.split(' ').slice(0, 4).join(' ');
  return `${prefix} ${core}`;
}

// ═══════════════════════════════════════════════════════════════
// §8 — MAIN MUTATION CYCLE
// ═══════════════════════════════════════════════════════════════

const MUTATIONS_PER_PARENT = 5;
const TOP_PARENTS_PER_VERTICAL = 20;
const MIN_PARENT_CJPI = 90;

/**
 * Run a single mutation cycle for one vertical.
 * Fetches the top 20 highest-scoring discoveries, generates up to 5
 * mutations per parent, scores them, and persists to the database.
 */
export async function runMutationCycle(
  vertical: string,
  cycleSeed?: number,
): Promise<MutationCycleResult> {
  const seed = cycleSeed ?? (Date.now() ^ 0xAE08CAFE);
  const rand = seedRng(seed);
  const pool = VERTICAL_POOLS[vertical] ?? VERTICAL_POOLS['primary'];

  // 1. Fetch top parents
  const { data: parents, error: fetchErr } = await supabase
    .from('discoveries')
    .select('id, name, description, cjpi, module_chain, vertical, category, generation, crown_jewel_capabilities')
    .eq('vertical', vertical)
    .gte('cjpi', MIN_PARENT_CJPI)
    .order('cjpi', { ascending: false })
    .limit(TOP_PARENTS_PER_VERTICAL);

  if (fetchErr || !parents || parents.length === 0) {
    return {
      vertical,
      parentsProcessed: 0,
      candidatesGenerated: 0,
      promotedCount: 0,
      junkyardCount: 0,
      discardedCount: 0,
      candidates: [],
      completedAt: new Date().toISOString(),
    };
  }

  const candidates: MutationCandidate[] = [];
  const mutationTypes: MutationType[] = [
    'primitive-swap',
    'chain-extension',
    'chain-shortening',
    'crown-jewel-injection',
  ];

  // 2. Generate mutations for each parent
  for (const parent of parents as unknown as ParentDiscovery[]) {
    const parentChain = Array.isArray(parent.module_chain)
      ? parent.module_chain
      : [];
    if (parentChain.length < 2) continue;

    const parentGen = parent.generation ?? 0;

    for (let m = 0; m < MUTATIONS_PER_PARENT; m++) {
      // Rotate through mutation types
      const mutType = mutationTypes[m % mutationTypes.length];
      // 5th mutation is always a random type
      const effectiveType = m === 4
        ? mutationTypes[Math.floor(rand() * mutationTypes.length)]
        : mutType;

      let mutatedChain: string[] | null = null;

      switch (effectiveType) {
        case 'primitive-swap':
          mutatedChain = mutatePrimitiveSwap(parentChain, rand);
          break;
        case 'chain-extension':
          mutatedChain = mutateChainExtension(parentChain, pool, rand);
          break;
        case 'chain-shortening':
          mutatedChain = mutateChainShortening(parentChain);
          break;
        case 'crown-jewel-injection':
          mutatedChain = await mutateCrownJewelInjection(parentChain, vertical, rand);
          break;
      }

      if (!mutatedChain || mutatedChain.length < 2) continue;

      // 3. Score the mutation
      const cjpi = scoreMutationCjpi(mutatedChain, rand);
      const tier = classifyTier(cjpi);
      const status = classifyStatus(cjpi);
      const delta = cjpi - parent.cjpi;
      const promoted = cjpi > parent.cjpi;

      const candidateId = `MUT-${vertical.substring(0, 3).toUpperCase()}-${Date.now().toString(36)}-${String(candidates.length).padStart(3, '0')}`;

      candidates.push({
        id: candidateId,
        parentId: parent.id,
        parentName: parent.name,
        parentCjpi: parent.cjpi,
        name: generateMutationName(parent.name, effectiveType, rand),
        description: `Mutation (${effectiveType}) of "${parent.name}". Chain: ${mutatedChain.join(' → ')}.`,
        chain: mutatedChain,
        cjpi,
        tier,
        status,
        mutationType: effectiveType,
        generation: parentGen + 1,
        vertical,
        category: parent.category,
        delta,
        promoted,
      });
    }
  }

  // 4. Persist to database
  const promotedCount = candidates.filter(c => c.promoted).length;
  const junkyardCount = candidates.filter(c => c.status === 'junkyard').length;
  const discardedCount = candidates.filter(c => !c.promoted && c.status === 'junkyard' && c.cjpi < 40).length;

  // Only persist candidates above score 40 (discard truly worthless mutations)
  const persistable = candidates.filter(c => c.cjpi >= 40);

  if (persistable.length > 0) {
    const BATCH = 50;
    for (let i = 0; i < persistable.length; i += BATCH) {
      const batch = persistable.slice(i, i + BATCH);
      const rows = batch.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        tier: c.tier,
        cjpi: c.cjpi,
        synergy_multiplier: 1.0,
        components: JSON.stringify([]),
        module_chain: c.chain,
        status: c.status,
        is_crown_jewel: c.cjpi >= 95,
        vertical: c.vertical,
        crown_jewel_capabilities: c.cjpi >= 95
          ? JSON.stringify(c.chain.map(p => ({ primitive: p, capability: c.name, cjpi: c.cjpi })))
          : JSON.stringify([]),
        mutation_source: c.parentId,
        generation: c.generation,
      }));

      await supabase
        .from('discoveries')
        .upsert(rows as any, { onConflict: 'id', ignoreDuplicates: true });
    }
  }

  return {
    vertical,
    parentsProcessed: parents.length,
    candidatesGenerated: candidates.length,
    promotedCount,
    junkyardCount,
    discardedCount,
    candidates,
    completedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// §9 — FULL SUBSTRATE MUTATION CYCLE
// ═══════════════════════════════════════════════════════════════

const ALL_VERTICALS = ['primary', 'cyber', 'robotics', 'llm', 'quantum', 'agency', 'media', 'ultimate'];

/**
 * Run a complete mutation cycle across all verticals.
 * Called after the existing template pass in the CDM cycle.
 * Generates up to 700 new candidates (100 per vertical × 7).
 */
export async function runFullMutationCycle(cycleSeed?: number): Promise<MutationCycleResult[]> {
  const baseSeed = cycleSeed ?? Date.now();
  const results: MutationCycleResult[] = [];

  for (const vertical of ALL_VERTICALS) {
    // Each vertical gets a unique seed derived from the base
    const vertSeed = baseSeed ^ hashStr(vertical);
    const result = await runMutationCycle(vertical, vertSeed);
    results.push(result);
  }

  return results;
}

/** Simple string hash for seed derivation */
function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// ═══════════════════════════════════════════════════════════════
// §10 — DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════

/**
 * Run a diagnostic mutation cycle and return formatted results.
 * Does NOT persist to database — dry run only.
 */
export async function runMutationDiagnostic(
  vertical: string,
  maxParents = 10,
): Promise<string> {
  const rand = seedRng(0xD1A6_CAFE);
  const pool = VERTICAL_POOLS[vertical] ?? VERTICAL_POOLS['primary'];

  const { data: parents } = await supabase
    .from('discoveries')
    .select('id, name, description, cjpi, module_chain, vertical, category, generation, crown_jewel_capabilities')
    .eq('vertical', vertical)
    .gte('cjpi', MIN_PARENT_CJPI)
    .order('cjpi', { ascending: false })
    .limit(maxParents);

  if (!parents || parents.length === 0) return 'No parents found above CJPI 90.';

  const lines: string[] = [`Mutation Diagnostic — ${vertical} (${parents.length} parents)`];
  lines.push('─'.repeat(80));

  for (const parent of parents as unknown as ParentDiscovery[]) {
    const chain = Array.isArray(parent.module_chain) ? parent.module_chain : [];
    if (chain.length < 2) continue;

    // Generate one of each type
    const swap = mutatePrimitiveSwap(chain, rand);
    const ext = mutateChainExtension(chain, pool, rand);
    const short = mutateChainShortening(chain);
    const cjInj = await mutateCrownJewelInjection(chain, vertical, rand);

    const mutations = [
      { type: 'swap' as const, chain: swap },
      { type: 'extension' as const, chain: ext },
      { type: 'shortening' as const, chain: short },
      { type: 'cj-inject' as const, chain: cjInj },
    ];

    for (const m of mutations) {
      if (!m.chain) continue;
      const score = scoreMutationCjpi(m.chain, rand);
      const delta = score - parent.cjpi;
      const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
      lines.push(
        `${parent.name} (${parent.cjpi}) → [${m.type}] → ${score} (${arrow}${Math.abs(delta)}) | ${m.chain.join('→')}`,
      );
    }
  }

  return lines.join('\n');
}
