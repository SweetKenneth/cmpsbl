/**
 * Tier ↔ Layer mapping — single source of truth.
 *
 * v19.1 collapse: Public pricing is Free + Pro $29 only (Enterprise by contract).
 * The previous 4-tier ladder (Builder/Studio/Creator/Architect) was retired —
 * everything that was paid now sits behind the single Pro tier.
 *
 * Free (Builder) gets THREE everyday-power layers: Governance Shield,
 * Tamper-Evident Audit, and Pipeline Composition. Self-Healing and all
 * advanced intelligence/security/evolution/compliance layers are Pro-only.
 *
 * Governor unlocks everything regardless of tier.
 */

export type LayerTier = 'builder' | 'pro' | 'enterprise';

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
    name: 'Free',
    price: 0,
    priceLabel: 'Free',
    tagline: 'Governance, audit & composition — on the house',
    outcome: 'My code is verified, traceable, and orchestrated.',
    accent: 'border-emerald-400/30 bg-emerald-400/5',
    glyph: '🟢',
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    price: 29,
    priceLabel: '$29',
    tagline: 'Full system activation — all 20 layers',
    outcome: 'My software heals, predicts, defends, and evolves.',
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

/** Display order — Free → Pro → Enterprise. */
export const TIER_ORDER: LayerTier[] = ['builder', 'pro', 'enterprise'];

/**
 * Layers per tier, in unlock order. Each rank corresponds to V2LaunchLayers.
 *
 * Free (Builder): governance + audit + composition. Powerful, non-healing,
 * non-self-modifying — gives users a real win on day one without giving away
 * the marquee Pro layers (Self-Healing, Anomaly, Defense Breeding, etc.).
 *
 * Pro: every other launch layer in the Top 20.
 */
export const TIER_LAYERS: Record<Exclude<LayerTier, 'enterprise'>, TierLayerEntry[]> = {
  builder: [
    { rank: 19, name: 'Tamper-Evident Audit Layer', tag: 'AUDIT' },
    { rank: 18, name: 'Governance Shield Layer', tag: 'GOVERNANCE' },
    { rank: 15, name: 'Pipeline Composition Layer', tag: 'CORTEX' },
  ],
  pro: [
    { rank: 1,  name: 'Self-Healing Layer', tag: 'IMMUNITY' },
    { rank: 2,  name: 'Autonomous Triage Layer', tag: 'MEDIC' },
    { rank: 3,  name: 'Distributed Consensus Layer', tag: 'NERVE' },
    { rank: 4,  name: 'Oracle-Ripple Precognition Layer', tag: 'ORACLE×RIPPLE' },
    { rank: 5,  name: 'Anomaly Correlation Layer', tag: 'VISION' },
    { rank: 6,  name: 'Adaptive Defense Breeding Layer', tag: 'IMMUNITY×EVOLUTION' },
    { rank: 7,  name: 'Zero-Trust Identity Layer', tag: 'IDENTITY×DEFENSE' },
    { rank: 8,  name: 'Cyber Defense Layer', tag: 'WATCHTOWER×AEGIS' },
    { rank: 9,  name: 'Fleet Intelligence Layer', tag: 'NEXUS' },
    { rank: 10, name: 'AI Safety Layer', tag: 'DREAM×DEFENSE' },
    { rank: 11, name: 'AI Cost Intelligence Layer', tag: 'NEXUS' },
    { rank: 12, name: 'Cognitive Memory Layer', tag: 'BRAIN×MEMORY' },
    { rank: 13, name: 'Performance Surgery Layer', tag: 'APEX×VISION' },
    { rank: 14, name: 'Data Pipeline Resilience Layer', tag: 'CONDUIT' },
    { rank: 16, name: 'Universal Input Intelligence Layer', tag: 'DECODE' },
    { rank: 17, name: 'Self-Evolution Layer', tag: 'EVOLUTION' },
    { rank: 20, name: 'Regulatory Compliance Layer', tag: 'AUDIT×COMPASS' },
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
  for (const t of ['builder', 'pro'] as const) {
    if (TIER_LAYERS[t].some(l => l.rank === rank)) return t;
  }
  return 'pro';
}

/** Governor sees everything — UI helper. */
export function isGovernorTier(tier: string | null | undefined): boolean {
  return tier === 'governor';
}
