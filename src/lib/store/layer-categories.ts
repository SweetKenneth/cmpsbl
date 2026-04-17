/**
 * Layer Inventory category metadata + grouping helpers.
 * Drives the horizontally-scrolling category sections on /store.
 */

export type LayerPillar =
  | "suites"
  | "defense-security"
  | "synthesis-evolution"
  | "integration-contracts"
  | "quantum-robotics";

export interface LayerInventoryRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  tier: string;
  price_cents: number;
  original_value_cents: number | null;
  cjpi_score: number;
  kind: string;
  pillar: string | null;
  origin_vertical: string | null;
  suite_capabilities: string[];
  primitive_chain: string[];
  is_featured: boolean | null;
  tags: string[] | null;
}

export interface LayerCategoryMeta {
  pillar: LayerPillar;
  label: string;
  tagline: string;
  accent: string; // tailwind color token suffix (e.g. "primary", "neon-cyan")
}

/**
 * Display order = top to bottom on the store page.
 * Order is intentional: Suites first (highest value), then defensive,
 * then evolutionary, then connective, then specialty (Q+R).
 */
export const LAYER_CATEGORIES: LayerCategoryMeta[] = [
  {
    pillar: "suites",
    label: "Specialty Suites",
    tagline: "Vertical-engine bundles · captured before Layer 2 absorption",
    accent: "primary",
  },
  {
    pillar: "defense-security",
    label: "Defense & Security",
    tagline: "Topology-aware shielding and observability enforcement",
    accent: "neon-magenta",
  },
  {
    pillar: "synthesis-evolution",
    label: "Synthesis & Evolution",
    tagline: "Self-healing, sequenced patching, kinetic synthesis",
    accent: "neon-green",
  },
  {
    pillar: "integration-contracts",
    label: "Integration & Contracts",
    tagline: "Cross-surface contracts and dependency governance",
    accent: "neon-cyan",
  },
];

/**
 * Tier → semantic color token used on the LayerCard badge.
 * Mirrors the existing TIER_META spirit but for marketplace_inventory tier strings.
 */
export const LAYER_TIER_META: Record<
  string,
  { color: string; bg: string; border: string; ring: string }
> = {
  Apex: {
    color: "text-[hsl(var(--neon-magenta))]",
    bg: "bg-[hsl(var(--neon-magenta))]/10",
    border: "border-[hsl(var(--neon-magenta))]/30",
    ring: "ring-[hsl(var(--neon-magenta))]/40",
  },
  Mythic: {
    color: "text-[hsl(var(--neon-purple))]",
    bg: "bg-[hsl(var(--neon-purple))]/10",
    border: "border-[hsl(var(--neon-purple))]/30",
    ring: "ring-[hsl(var(--neon-purple))]/40",
  },
  Relic: {
    color: "text-[hsl(var(--neon-cyan))]",
    bg: "bg-[hsl(var(--neon-cyan))]/10",
    border: "border-[hsl(var(--neon-cyan))]/30",
    ring: "ring-[hsl(var(--neon-cyan))]/40",
  },
  Prime: {
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    ring: "ring-primary/40",
  },
  Mint: {
    color: "text-[hsl(var(--neon-green))]",
    bg: "bg-[hsl(var(--neon-green))]/10",
    border: "border-[hsl(var(--neon-green))]/30",
    ring: "ring-[hsl(var(--neon-green))]/40",
  },
};

/** Group inventory rows by pillar, preserving display order from LAYER_CATEGORIES. */
export function groupByPillar(
  rows: LayerInventoryRow[]
): Array<{ meta: LayerCategoryMeta; items: LayerInventoryRow[] }> {
  return LAYER_CATEGORIES.map((meta) => ({
    meta,
    items: rows
      .filter((r) => r.pillar === meta.pillar)
      .sort((a, b) => b.price_cents - a.price_cents),
  })).filter((group) => group.items.length > 0);
}

/** Format cents to "$129" / "$24" — no decimals when whole dollars. */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
