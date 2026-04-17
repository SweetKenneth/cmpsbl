/**
 * Tier ↔ Layer mapping — single source of truth.
 *
 * Maps each of the Top 20 Launch Layers to the tier that unlocks it.
 * Tiers ascend: builder → studio → creator → architect (full activation).
 * Enterprise is a custom-substrate tier; Governor unlocks everything.
 *
 * The `rank` field matches the rank in V2LaunchLayers so the UI can
 * cross-reference layer details without duplicating descriptions.
 */

export type LayerTier = 'builder' | 'studio' | 'creator' | 'architect' | 'enterprise';

export interface TierMeta {
  key: LayerTier;
  name: string;
  /** Display price (USD/month, 0 = free, null = custom) */
  price: number | null;
  priceLabel: string;
  tagline: string;
  outcome: string;
  /** Tailwind ring/border accent (semantic-token compatible) */
  accent: string;
  /** Used for the tier dot and emoji header */
  glyph: string;
}

export interface TierLayerEntry {
  /** Matches the rank in V2LaunchLayers */
  rank: number;
  name: string;
  /** Short pillar tag e.g. "IMMUNITY", "AUDIT", "CORTEX" */
  tag: string;
}

export const TIER_META: Record<LayerTier, TierMeta> = {
  builder: {
    key: 'builder',
    name: 'Builder',
    price: 0,
    priceLabel: 'Free',
    tagline: 'Baseline protection & verification',
    outcome: 'Your code is verified, traceable, and protected.',
    accent: 'border-emerald-400/30 bg-emerald-400/5',
    glyph: '🟢',
  },
  studio: {
    key: 'studio',
    name: 'Studio',
    price: 29,
    priceLabel: '$29',
    tagline: 'Core system reliability & control',
    outcome: 'My software runs better, recovers, and handles inputs safely.',
    accent: 'border-amber-400/40 bg-amber-400/5',
    glyph: '🟡',
  },
  creator: {
    key: 'creator',
    name: 'Creator',
    price: 49,
    priceLabel: '$49',
    tagline: 'Intelligence, foresight & coordination',
    outcome: 'My system predicts, coordinates, and remembers.',
    accent: 'border-sky-400/40 bg-sky-400/5',
    glyph: '🔵',
  },
  architect: {
    key: 'architect',
    name: 'Architect',
    price: 79,
    priceLabel: '$79',
    tagline: 'Full system activation — all 20 layers',
    outcome: 'This is fully upgraded, production-grade software.',
    accent: 'border-fuchsia-400/40 bg-fuchsia-400/5',
    glyph: '🟣',
  },
  enterprise: {
    key: 'enterprise',
    name: 'Enterprise',
    price: null,
    priceLabel: '$999+',
    tagline: 'Custom substrate systems',
    outcome: 'Built-for-you cognitive software system.',
    accent: 'border-indigo-400/40 bg-indigo-400/5',
    glyph: '🏢',
  },
};

/** Display order — exactly the progression Kenneth specified. */
export const TIER_ORDER: LayerTier[] = ['builder', 'studio', 'creator', 'architect', 'enterprise'];

/**
 * Layers per tier, in unlock order. Each rank corresponds to V2LaunchLayers.
 * Builder gets the two governance/verification layers + always-on Hardening.
 * Studio adds reliability + safety + composition + input intelligence.
 * Creator adds prediction + coordination + memory + cost intelligence.
 * Architect unlocks the remaining advanced security/perf/evolution/compliance set.
 */
export const TIER_LAYERS: Record<Exclude<LayerTier, 'enterprise'>, TierLayerEntry[]> = {
  builder: [
    { rank: 19, name: 'Tamper-Evident Audit Chain', tag: 'AUDIT' },
    { rank: 18, name: 'Governance Shield Suite', tag: 'GOVERNANCE' },
  ],
  studio: [
    { rank: 1,  name: 'Self-Healing Orchestrator', tag: 'IMMUNITY' },
    { rank: 2,  name: 'Autonomous Triage Engine', tag: 'MEDIC' },
    { rank: 10, name: 'AI Safety Suite', tag: 'DREAM×DEFENSE' },
    { rank: 15, name: 'Pipeline Composition Engine', tag: 'CORTEX' },
    { rank: 16, name: 'Universal Input Intelligence', tag: 'DECODE' },
  ],
  creator: [
    { rank: 4,  name: 'Oracle-Ripple Precognition Chain', tag: 'ORACLE×RIPPLE' },
    { rank: 5,  name: 'Anomaly Correlation Engine', tag: 'VISION' },
    { rank: 3,  name: 'Distributed Consensus Suite', tag: 'NERVE' },
    { rank: 9,  name: 'Fleet Intelligence Orchestrator', tag: 'NEXUS' },
    { rank: 11, name: 'AI Cost Intelligence Suite', tag: 'NEXUS' },
    { rank: 12, name: 'Cognitive Memory Suite', tag: 'BRAIN×MEMORY' },
  ],
  architect: [
    { rank: 6,  name: 'Adaptive Defense Breeding Suite', tag: 'IMMUNITY×EVOLUTION' },
    { rank: 7,  name: 'Zero-Trust Identity Suite', tag: 'IDENTITY×DEFENSE' },
    { rank: 8,  name: 'Cyber Defense Suite', tag: 'WATCHTOWER×AEGIS' },
    { rank: 13, name: 'Performance Surgery Suite', tag: 'APEX×VISION' },
    { rank: 14, name: 'Data Pipeline Resilience Suite', tag: 'CONDUIT' },
    { rank: 17, name: 'Self-Evolution Suite', tag: 'EVOLUTION' },
    { rank: 20, name: 'Regulatory Compliance Suite', tag: 'AUDIT×COMPASS' },
  ],
};

/** Always-on layer included with every tier (incl. Builder). */
export const ALWAYS_ON = {
  name: 'CMPSBL Hardening Layer',
  tag: 'CORE',
  description: 'Always-on baseline hardening shipped with every tier.',
} as const;

/** Reverse lookup: layer rank → tier that unlocks it. */
export function tierForRank(rank: number): LayerTier {
  for (const t of ['builder', 'studio', 'creator', 'architect'] as const) {
    if (TIER_LAYERS[t].some(l => l.rank === rank)) return t;
  }
  return 'architect';
}

/** Governor sees everything — UI helper. */
export function isGovernorTier(tier: string | null | undefined): boolean {
  return tier === 'governor';
}
