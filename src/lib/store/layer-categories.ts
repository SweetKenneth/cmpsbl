/**
 * Layer Inventory category metadata + grouping helpers.
 * Drives the horizontally-scrolling category sections on /store.
 */

import defenseImg from "@/assets/layers/defense-security.jpg";
import synthesisImg from "@/assets/layers/synthesis-evolution.jpg";
import integrationImg from "@/assets/layers/integration-contracts.jpg";
import suitesImg from "@/assets/layers/suites.jpg";

// Per-item hero imagery (slug-keyed)
import llmDefenseImg from "@/assets/layers/items/llm-defense-suite.jpg";
import cyberPerimeterImg from "@/assets/layers/items/cyber-perimeter-suite.jpg";
import quantumSimImg from "@/assets/layers/items/quantum-simulation-suite.jpg";
import roboticsImg from "@/assets/layers/items/robotics-control-suite.jpg";
import agencyOrchImg from "@/assets/layers/items/agency-orchestration-suite.jpg";
import topoSecImg from "@/assets/layers/items/topological-security-synthesizer.jpg";
import layeredObsImg from "@/assets/layers/items/layered-observability-enforcer.jpg";
import synthContractsImg from "@/assets/layers/items/synthetic-contracts-navigator.jpg";
import holoIntegrationImg from "@/assets/layers/items/holographic-integration-guardian.jpg";
import selfHealImg from "@/assets/layers/items/self-healing-learning-scanner.jpg";
import sentinelEvoImg from "@/assets/layers/items/sentinel-evolution-sequencer.jpg";
import kineticSynthImg from "@/assets/layers/items/kinetic-synthesis-controller.jpg";
import resilientFabricImg from "@/assets/layers/items/resilient-evolution-fabric.jpg";

// New layers — Memory Stream discoveries (CJPI 100)
import privacyObfuscationImg from "@/assets/layers/items/privacy-obfuscation-suite.jpg";
import geospatialIntelImg from "@/assets/layers/items/geospatial-intelligence-suite.jpg";
import zeroTrustIdentityImg from "@/assets/layers/items/zero-trust-identity-suite.jpg";
import spectralAuditorImg from "@/assets/layers/items/spectral-auditor-layer.jpg";
import probabilisticConscienceImg from "@/assets/layers/items/probabilistic-conscience-layer.jpg";
import complianceAuditImg from "@/assets/layers/items/compliance-audit-layer.jpg";
import symbolicCrafterImg from "@/assets/layers/items/symbolic-crafter-layer.jpg";
import adaptiveForgeImg from "@/assets/layers/items/adaptive-forge-layer.jpg";
import reflexOrchestrationImg from "@/assets/layers/items/reflex-orchestration-layer.jpg";
import emergentGatewayImg from "@/assets/layers/items/emergent-gateway-layer.jpg";
import localizationMeshImg from "@/assets/layers/items/localization-mesh-layer.jpg";
import neuralBrokerImg from "@/assets/layers/items/neural-broker-layer.jpg";

import {
  Shield, Zap, Network, Sparkles, type LucideIcon,
} from "lucide-react";

/** Slug → unique hero image. Falls back to pillar image if missing. */
export const LAYER_ITEM_IMAGES: Record<string, string> = {
  "llm-defense-suite": llmDefenseImg,
  "cyber-perimeter-suite": cyberPerimeterImg,
  "quantum-simulation-suite": quantumSimImg,
  "robotics-control-suite": roboticsImg,
  "agency-orchestration-suite": agencyOrchImg,
  "topological-security-synthesizer": topoSecImg,
  "layered-observability-enforcer": layeredObsImg,
  "synthetic-contracts-navigator": synthContractsImg,
  "holographic-integration-guardian": holoIntegrationImg,
  "self-healing-learning-scanner": selfHealImg,
  "sentinel-evolution-sequencer": sentinelEvoImg,
  "kinetic-synthesis-controller": kineticSynthImg,
  "resilient-evolution-fabric": resilientFabricImg,
  // New Memory Stream layers
  "privacy-obfuscation-suite": privacyObfuscationImg,
  "geospatial-intelligence-suite": geospatialIntelImg,
  "zero-trust-identity-suite": zeroTrustIdentityImg,
  "spectral-auditor-layer": spectralAuditorImg,
  "probabilistic-conscience-layer": probabilisticConscienceImg,
  "compliance-audit-layer": complianceAuditImg,
  "symbolic-crafter-layer": symbolicCrafterImg,
  "adaptive-forge-layer": adaptiveForgeImg,
  "reflex-orchestration-layer": reflexOrchestrationImg,
  "emergent-gateway-layer": emergentGatewayImg,
  "localization-mesh-layer": localizationMeshImg,
  "neural-broker-layer": neuralBrokerImg,
};

/** Resolve item image with pillar fallback. */
export function getItemImage(slug: string, pillar: string | null): string {
  return LAYER_ITEM_IMAGES[slug] ?? getPillarMeta(pillar).image;
}

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
  image: string;
  icon: LucideIcon;
  /** Tailwind gradient classes (used for top bar + glow tinting) */
  gradient: string;
  /** Inline rgba glow color (matches gradient) */
  glowColor: string;
}

/**
 * Display order = top to bottom on the store page.
 */
export const LAYER_CATEGORIES: LayerCategoryMeta[] = [
  {
    pillar: "suites",
    label: "Specialty Suites",
    tagline: "Vertical-engine bundles · captured before Layer 2 absorption",
    image: suitesImg,
    icon: Sparkles,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    glowColor: "rgba(251, 146, 60, 0.18)",
  },
  {
    pillar: "defense-security",
    label: "Defense & Security",
    tagline: "Topology-aware shielding and observability enforcement",
    image: defenseImg,
    icon: Shield,
    gradient: "from-fuchsia-500 via-pink-500 to-purple-500",
    glowColor: "rgba(217, 70, 239, 0.18)",
  },
  {
    pillar: "synthesis-evolution",
    label: "Synthesis & Evolution",
    tagline: "Self-healing, sequenced patching, kinetic synthesis",
    image: synthesisImg,
    icon: Zap,
    gradient: "from-emerald-500 via-green-500 to-lime-500",
    glowColor: "rgba(34, 197, 94, 0.18)",
  },
  {
    pillar: "integration-contracts",
    label: "Integration & Contracts",
    tagline: "Cross-surface contracts and dependency governance",
    image: integrationImg,
    icon: Network,
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    glowColor: "rgba(6, 182, 212, 0.18)",
  },
];

/** Lookup helper — pillar → meta (with sane default). */
export function getPillarMeta(pillar: string | null): LayerCategoryMeta {
  return (
    LAYER_CATEGORIES.find((c) => c.pillar === pillar) ?? LAYER_CATEGORIES[0]
  );
}

/**
 * Tier → semantic color token used on the LayerCard badge.
 * Mirrors the existing TIER_META spirit but for marketplace_inventory tier strings.
 */
export const LAYER_TIER_META: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  Apex: {
    label: "APEX",
    color: "text-[hsl(var(--neon-magenta))]",
    bg: "bg-[hsl(var(--neon-magenta))]/10",
    border: "border-[hsl(var(--neon-magenta))]/30",
  },
  Mythic: {
    label: "MYTHIC",
    color: "text-[hsl(var(--neon-purple))]",
    bg: "bg-[hsl(var(--neon-purple))]/10",
    border: "border-[hsl(var(--neon-purple))]/30",
  },
  Relic: {
    label: "RELIC",
    color: "text-[hsl(var(--neon-cyan))]",
    bg: "bg-[hsl(var(--neon-cyan))]/10",
    border: "border-[hsl(var(--neon-cyan))]/30",
  },
  Prime: {
    label: "PRIME",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  Mint: {
    label: "MINT",
    color: "text-[hsl(var(--neon-green))]",
    bg: "bg-[hsl(var(--neon-green))]/10",
    border: "border-[hsl(var(--neon-green))]/30",
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
