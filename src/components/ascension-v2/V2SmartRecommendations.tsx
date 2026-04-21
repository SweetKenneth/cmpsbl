/**
 * V2 Smart Recommendations — split by unlock source.
 *
 * Two clearly-separated groups so the user always knows what they're
 * unlocking and how:
 *
 *   1. Tier-Included Layers — free with their current/next plan tier.
 *      No commerce, no per-SKU price. Plain "Add" toggles selection.
 *
 *   2. Store Layers — sold individually in /store. Each shows its own
 *      price. When the engine recommends ≥3 store layers, a single
 *      bundle-discount CTA appears at the bottom of the group with the
 *      blended price + savings, so the user only sees the discount when
 *      it's real and tied to a coherent recommendation set.
 *
 * No mixed-source bundles. No silent unlock failures.
 */

import { useMemo } from 'react';
import {
  Sparkles, Plus, Check, ArrowRight, Layers as LayersIcon,
  ShoppingBag, Package, Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  recommendLayers,
  isStoreLayer,
  summarizeStoreBundle,
  type LayerRecommendation,
} from '@/lib/factory/smart-recommendations';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { TIER_META, type LayerTier } from '@/lib/ascension-v2/tier-layers';

interface Props {
  /** Primitives covered by the current run (empty = pre-run heuristic mode) */
  coveredPrimitives: string[];
  /** Layer IDs the user has already selected (won't be recommended) */
  selectedLayerIds?: string[];
  /** If provided, each reco renders an Add button that toggles selection */
  onSelect?: (layerId: string) => void;
  /** Max recos to show (default 3 — we cap aggressively now) */
  limit?: number;
  /** Compact title override */
  title?: string;
  /** Override viewer tier (default: read from subscription hook) */
  userTier?: LayerTier;
  /**
   * User source files. When supplied, recommendations are driven by real
   * code signals (HTTP routes, DB calls, crypto, etc.) instead of canonical
   * primitive order. Falls back to gap/adjacency when no signals fire.
   */
  userSource?: ReadonlyArray<{ name: string; content: string }>;
}

function mapSubscriptionTier(tier: string | undefined): LayerTier {
  if (!tier) return 'builder';
  if (tier === 'enterprise') return 'enterprise';
  // All legacy paid tiers (studio/creator/architect/operator) collapse to Pro.
  if (
    tier === 'pro' ||
    tier === 'architect' ||
    tier === 'creator' ||
    tier === 'studio' ||
    tier === 'operator'
  ) {
    return 'pro';
  }
  return 'builder';
}

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)}`;
}

interface RecoRowProps {
  reco: LayerRecommendation;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  showPrice: boolean;
}

function RecoRow({ reco, isSelected, onSelect, showPrice }: RecoRowProps) {
  const Icon = reco.reason === 'gap' ? Plus : LayersIcon;
  return (
    <li className="flex items-start gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-background/60 border border-border/40">
      <div className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary shrink-0">
        <Icon className="h-3 w-3" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-foreground truncate">
            {reco.layer.name}
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">
            CJPI {reco.layer.cjpi}
          </span>
          {showPrice ? (
            <span className="text-[9px] font-mono text-foreground/80">
              {formatPrice(reco.layer.priceCents)}
            </span>
          ) : null}
          <span className={
            'text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ' +
            (reco.reason === 'signal'
              ? 'bg-primary/15 text-primary'
              : reco.reason === 'gap'
                ? 'bg-neon-amber/10 text-neon-amber'
                : 'bg-primary/10 text-primary')
          }>
            {reco.reason === 'signal'
              ? `match · ${reco.driverPrimitive}`
              : reco.reason === 'gap'
                ? `gap · ${reco.driverPrimitive}`
                : `adj · ${reco.driverPrimitive}`}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
          {reco.rationale}
        </p>
      </div>
      {reco.upgradeRequired ? (
        <Link
          to="/ascension-v2#tiers"
          className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded border border-neon-amber/40 bg-neon-amber/5 text-neon-amber hover:bg-neon-amber/10"
          title={`Unlocks at ${TIER_META[reco.upgradeRequired].name} (${TIER_META[reco.upgradeRequired].priceLabel})`}
        >
          <Lock className="h-3 w-3" />
          {TIER_META[reco.upgradeRequired].name}
        </Link>
      ) : onSelect ? (
        <button
          onClick={() => onSelect(reco.layer.id)}
          className={
            'shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded border transition-colors ' +
            (isSelected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-primary/40 text-primary hover:bg-primary/10')
          }
        >
          {isSelected ? <><Check className="h-3 w-3 inline" /> Added</> : 'Add'}
        </button>
      ) : (
        <Link
          to="/ascension-v2"
          className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary hover:underline"
        >
          Attach <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </li>
  );
}

export function V2SmartRecommendations({
  coveredPrimitives,
  selectedLayerIds = [],
  onSelect,
  limit = 3,
  title,
  userTier,
  userSource,
}: Props) {
  const subscription = useEngineSubscription();
  const { isGovernor } = useUserRole();
  // Governor bypasses every tier gate — they own the substrate.
  const effectiveTier: LayerTier =
    userTier ?? (isGovernor ? 'enterprise' : mapSubscriptionTier(subscription.tier));

  // Stable signatures so new array refs from parents don't bust the memo.
  const coveredKey = useMemo(
    () => [...coveredPrimitives].map((p) => p.toUpperCase()).sort().join('|'),
    [coveredPrimitives],
  );
  const selectedKey = useMemo(
    () => [...selectedLayerIds].sort().join('|'),
    [selectedLayerIds],
  );
  // Hash the source set so signal scans only re-run when the corpus changes.
  const sourceKey = useMemo(
    () => (userSource ?? []).map((f) => `${f.name}:${f.content.length}`).join('|'),
    [userSource],
  );

  // We pull a wider candidate pool so each unlock source has a real chance
  // to populate. Final per-group rendering still respects `limit`.
  const recos = useMemo(
    () => recommendLayers({
      coveredPrimitives,
      selectedLayerIds,
      limit: Math.max(limit * 2, 6),
      userTier: effectiveTier,
      userSource,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coveredKey, selectedKey, limit, effectiveTier, sourceKey],
  );

  const { tierRecos, storeRecos } = useMemo(() => {
    const tier: LayerRecommendation[] = [];
    const store: LayerRecommendation[] = [];
    for (const r of recos) {
      if (isStoreLayer(r.layer.id)) store.push(r);
      else tier.push(r);
    }
    return { tierRecos: tier.slice(0, limit), storeRecos: store.slice(0, limit) };
  }, [recos, limit]);

  if (tierRecos.length === 0 && storeRecos.length === 0) return null;

  const selectedSet = new Set(selectedLayerIds);
  const heading = title ?? (coveredPrimitives.length === 0
    ? 'Suggested Layers'
    : 'Smart Recommendations');

  // Bundle is offered only when the engine independently recommended ≥3
  // store layers — it's a real, opt-in saving on a coherent set.
  const bundleSummary = summarizeStoreBundle(storeRecos.map((r) => r.layer));
  const showBundleCta =
    bundleSummary.layerIds.length >= 3 && bundleSummary.discountPercent > 0;
  const allBundleAttached = bundleSummary.layerIds.every((id) => selectedSet.has(id));

  const handleAddBundle = () => {
    if (!onSelect) return;
    for (const id of bundleSummary.layerIds) {
      if (!selectedSet.has(id)) onSelect(id);
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3 sm:p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {heading}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          gap-driven · split by unlock
        </span>
      </div>

      {/* ── Tier-Included Layers ───────────────────────────────────────── */}
      {tierRecos.length > 0 ? (
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5">
            <LayersIcon className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
              Tier-Included Layers
            </span>
            <span className="text-[9px] text-muted-foreground">
              · unlock with your plan
            </span>
          </div>
          <ul className="space-y-1.5">
            {tierRecos.map((r) => (
              <RecoRow
                key={r.layer.id}
                reco={r}
                isSelected={selectedSet.has(r.layer.id)}
                onSelect={onSelect}
                showPrice={false}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {/* ── Store Layers ───────────────────────────────────────────────── */}
      {storeRecos.length > 0 ? (
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5">
            <ShoppingBag className="h-3 w-3 text-neon-amber" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
              Store Layers
            </span>
            <span className="text-[9px] text-muted-foreground">
              · sold individually in{' '}
              <Link to="/store" className="text-primary hover:underline">/store</Link>
            </span>
          </div>
          <ul className="space-y-1.5">
            {storeRecos.map((r) => (
              <RecoRow
                key={r.layer.id}
                reco={r}
                isSelected={selectedSet.has(r.layer.id)}
                onSelect={onSelect}
                showPrice
              />
            ))}
          </ul>

          {/* Bundle CTA — only when ≥3 recommended store layers qualify */}
          {showBundleCta ? (
            <div className="rounded-lg border border-neon-amber/30 bg-neon-amber/[0.04] p-2.5 sm:p-3 flex items-start gap-2 sm:gap-3">
              <Package className="h-4 w-4 text-neon-amber mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">
                    Bundle these {bundleSummary.layerIds.length} store layers
                  </span>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neon-amber/10 text-neon-amber font-mono">
                    −{bundleSummary.discountPercent}%
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  <span className="line-through">{formatPrice(bundleSummary.subtotalCents)}</span>{' '}
                  → <span className="text-foreground font-semibold">{formatPrice(bundleSummary.totalCents)}</span>{' '}
                  <span className="text-neon-amber">save {formatPrice(bundleSummary.savingsCents)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/80 leading-snug mt-1">
                  Discount applies only to this recommended set. Adds them to your selection now;
                  finalize purchase from{' '}
                  <Link to="/store" className="text-primary hover:underline">/store</Link>.
                </p>
              </div>
              {onSelect ? (
                <button
                  onClick={handleAddBundle}
                  disabled={allBundleAttached}
                  className={
                    'shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border transition-colors ' +
                    (allBundleAttached
                      ? 'border-primary bg-primary text-primary-foreground cursor-default'
                      : 'border-neon-amber/50 text-neon-amber hover:bg-neon-amber/10')
                  }
                >
                  {allBundleAttached ? (
                    <><Check className="h-3 w-3 inline" /> In Cart</>
                  ) : (
                    'Add Bundle'
                  )}
                </button>
              ) : (
                <Link
                  to="/store"
                  className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-neon-amber hover:underline"
                >
                  View <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
        {coveredPrimitives.length === 0
          ? 'Pre-run picks: highest-impact layers from each unlock source.'
          : 'Picked from the 40-Primitive matrix based on what your run covered (and what it didn\u2019t).'}
      </p>
    </div>
  );
}
