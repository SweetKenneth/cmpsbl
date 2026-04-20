/**
 * Bundle Suggestions — Sprint 2 (Ascension V2)
 *
 * Curated **behavior stacks** that compose into a known-good outcome.
 * Not "add all organs" — each bundle is a hand-picked recipe of layers
 * that have been verified to compose without conflict and deliver a
 * specific runtime guarantee (e.g. "Hardened Defense", "Resilient Runtime").
 *
 * Strategy
 * ────────
 *   1. Each bundle is defined by `BUNDLE_RECIPES` below — a fixed set of
 *      layer IDs that together produce a coherent outcome.
 *   2. At runtime we filter to the layers that actually exist in the
 *      catalog (gracefully tolerates layer churn) and require ≥3 to ship
 *      a bundle SKU.
 *   3. Tiered discounts on the paid layers only:
 *        3 layers  → 10% off
 *        4 layers  → 15% off
 *        5+ layers → 20% off
 *      Free layers count toward stack size but $0 toward subtotal.
 *      A stack with 100% free layers is still surfaced as "Free Stack"
 *      (no SKU; one-click attach for the value, not the discount).
 *   4. Bundles fully covered by `selectedLayerIds` are hidden.
 *
 * Pure data-layer, deterministic, no DB / network calls.
 *
 * © CMPSBL® · PromptFluid™
 */

import {
  getAvailableLayers,
  type CmpsblLayerDefinition,
} from '@/lib/export/cmpsbl-layers';

export type BundleOutcome =
  | 'hardened-defense'
  | 'resilient-runtime'
  | 'audit-compliance'
  | 'ai-governance'
  | 'observability-forensics'
  | 'privacy-sovereignty'
  | 'self-evolving';

interface BundleRecipe {
  id: BundleOutcome;
  name: string;
  outcome: string;
  rationale: string;
  /** Ordered layer IDs — composition order matters for the rationale narrative */
  layerIds: string[];
}

/**
 * Curated stacks. Each entry is a real composition recipe — the layers in
 * it have been picked because they produce a coherent guarantee together,
 * not because they share a primitive family.
 */
const BUNDLE_RECIPES: BundleRecipe[] = [
  {
    id: 'hardened-defense',
    name: 'Hardened Defense Stack',
    outcome: 'Block, detect, and counter-attack threats in one layered shield.',
    rationale:
      'Perimeter blocks · biometrics detect · honeypots deceive · wargame breeds counters.',
    layerIds: [
      'cyber-defense',
      'cyber-perimeter-suite',
      'behavioral-biometrics',
      'honeypot-intelligence',
      'adversarial-wargame',
    ],
  },
  {
    id: 'resilient-runtime',
    name: 'Resilient Runtime Stack',
    outcome: 'Survive failure, heal automatically, degrade gracefully under load.',
    rationale:
      'Self-heal repairs · triage isolates · pipelines stay live · consensus prevents split-brain.',
    layerIds: [
      'self-healing',
      'autonomous-triage',
      'pipeline-resilience',
      'distributed-consensus',
    ],
  },
  {
    id: 'audit-compliance',
    name: 'Audit & Compliance Stack',
    outcome: 'Every action is cryptographically provable and regulator-ready.',
    rationale:
      'Audit chain seals every action · compliance maps to frameworks · replay vault proves it on demand.',
    layerIds: [
      'audit-chain',
      'regulatory-compliance',
      'compliance-audit',
      'spectral-auditor',
      'deterministic-replay-vault',
    ],
  },
  {
    id: 'ai-governance',
    name: 'AI Governance Stack',
    outcome: 'Safe, cost-controlled, multi-model AI with provable guardrails.',
    rationale:
      'Safety gates outputs · consensus removes single-model risk · cost intel caps spend · LLM defense blocks injection.',
    layerIds: [
      'ai-safety',
      'multi-model-consensus',
      'ai-cost',
      'llm-defense-suite',
      'governance-shield',
    ],
  },
  {
    id: 'observability-forensics',
    name: 'Observability & Forensics Stack',
    outcome: 'See everything, predict the next failure, replay any incident.',
    rationale:
      'Layered metrics · anomaly correlation · oracle precog · deterministic replay vault.',
    layerIds: [
      'layered-observability-suite',
      'anomaly-correlation-engine',
      'oracle-ripple-precognition',
      'deterministic-replay-vault',
    ],
  },
  {
    id: 'privacy-sovereignty',
    name: 'Privacy & Sovereignty Stack',
    outcome: 'PII-safe, region-locked, zero-trust by default.',
    rationale:
      'Obfuscation hides PII · partitioner enforces region · zero-trust gates identity · topology hardens edges.',
    layerIds: [
      'privacy-obfuscation',
      'data-sovereignty-partitioner',
      'zero-trust',
      'topological-security-suite',
    ],
  },
  {
    id: 'self-evolving',
    name: 'Self-Evolving System Stack',
    outcome: 'Learns from incidents, adapts in production, breeds new defenses.',
    rationale:
      'Self-evolution mutates · adaptive defense breeds · nocturne consolidates wins · sentinel governs change.',
    layerIds: [
      'self-evolution',
      'adaptive-defense',
      'nocturne-consolidation',
      'sentinel-evolution',
      'self-healing-scanner',
    ],
  },
];

export interface BundleSku {
  id: string;
  outcome: BundleOutcome;
  /** Display name (e.g. "Hardened Defense Stack") */
  name: string;
  /** One-line outcome statement */
  outcomeStatement: string;
  /** Composition narrative — how the layers stack */
  rationale: string;
  /** Layers in this bundle (in composition order, filtered to what exists) */
  layers: CmpsblLayerDefinition[];
  /** Sum of individual layer.priceCents (cents) */
  subtotalCents: number;
  /** Discount percentage applied (0–100) */
  discountPercent: number;
  /** Final price (cents) after discount */
  totalCents: number;
  /** Savings (cents) */
  savingsCents: number;
  /** Average CJPI of bundled layers */
  avgCjpi: number;
  /** True if every layer in the bundle is free (informational stack) */
  isFreeStack: boolean;
}

/** Discount tier ladder for paid stacks. */
function discountTier(layerCount: number): number {
  if (layerCount >= 5) return 20;
  if (layerCount === 4) return 15;
  if (layerCount === 3) return 10;
  return 0;
}

export interface BundleInput {
  /** Layer IDs already selected — bundles fully covered by these are hidden */
  selectedLayerIds?: string[];
  /** Cap on bundles returned (default = all qualifying recipes) */
  limit?: number;
}

/**
 * Compute bundle SKUs from the curated recipe list.
 * Returns ordered by total savings desc, with free stacks ranked last.
 */
export function suggestBundles(input: BundleInput = {}): BundleSku[] {
  const selected = new Set(input.selectedLayerIds ?? []);
  const all = getAvailableLayers();
  const byId = new Map(all.map((l) => [l.id, l]));

  const skus: BundleSku[] = [];

  for (const recipe of BUNDLE_RECIPES) {
    // Resolve to actual layer objects, skip any that no longer exist
    const layers = recipe.layerIds
      .map((id) => byId.get(id))
      .filter((l): l is CmpsblLayerDefinition => Boolean(l));

    // Need at least 3 real layers to qualify as a stack
    if (layers.length < 3) continue;

    // Hide bundles the user already fully attached
    if (layers.every((l) => selected.has(l.id))) continue;

    const subtotalCents = layers.reduce((s, l) => s + l.priceCents, 0);
    const isFreeStack = subtotalCents === 0;

    const discountPercent = isFreeStack ? 0 : discountTier(layers.length);
    const savingsCents = isFreeStack
      ? 0
      : Math.round((subtotalCents * discountPercent) / 100);
    const totalCents = subtotalCents - savingsCents;
    const avgCjpi = Math.round(
      layers.reduce((s, l) => s + (Number(l.cjpi) || 0), 0) / layers.length,
    );

    skus.push({
      id: `bundle-${recipe.id}`,
      outcome: recipe.id,
      name: recipe.name,
      outcomeStatement: recipe.outcome,
      rationale: recipe.rationale,
      layers,
      subtotalCents,
      discountPercent,
      totalCents,
      savingsCents,
      avgCjpi,
      isFreeStack,
    });
  }

  // Paid stacks first (by savings desc), free stacks last (by avg CJPI desc)
  skus.sort((a, b) => {
    if (a.isFreeStack !== b.isFreeStack) return a.isFreeStack ? 1 : -1;
    if (a.isFreeStack) return b.avgCjpi - a.avgCjpi;
    return b.savingsCents - a.savingsCents;
  });

  return typeof input.limit === 'number' ? skus.slice(0, input.limit) : skus;
}

/** Format cents → $X.XX (USD), no trailing-zero shenanigans. */
export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)}`;
}
