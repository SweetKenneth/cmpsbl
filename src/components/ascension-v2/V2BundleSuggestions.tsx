/**
 * V2 Bundle Suggestions — Sprint 2 final deliverable
 *
 * Surfaces co-attached layer bundles (Family Packs) with a discounted SKU.
 * One-click "Add bundle" selects every layer in the pack via the parent's
 * onSelect callback (toggle-add — already-selected layers stay selected).
 *
 * Pure display + click-handler. All math comes from suggestBundles().
 */

import { useMemo } from 'react';
import { Package, Check, Sparkles } from 'lucide-react';
import {
  suggestBundles,
  formatPrice,
  type BundleSku,
} from '@/lib/factory/bundle-suggestions';

interface Props {
  /** Layer IDs already selected — bundles fully covered by these are hidden */
  selectedLayerIds?: string[];
  /** Toggle a single layer in the parent's selection set */
  onSelect: (layerId: string) => void;
  /** Max bundles to render (default 3) */
  limit?: number;
}

export function V2BundleSuggestions({
  selectedLayerIds = [],
  onSelect,
  limit = 3,
}: Props) {
  const selectedKey = useMemo(
    () => [...selectedLayerIds].sort().join('|'),
    [selectedLayerIds],
  );
  const bundles = useMemo(
    () => suggestBundles({ selectedLayerIds, limit }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedKey, limit],
  );

  if (bundles.length === 0) return null;

  const selectedSet = new Set(selectedLayerIds);

  const handleAddBundle = (b: BundleSku) => {
    for (const layer of b.layers) {
      if (!selectedSet.has(layer.id)) onSelect(layer.id);
    }
  };

  return (
    <div className="rounded-xl border border-neon-amber/25 bg-neon-amber/[0.03] p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-neon-amber" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Bundle Discounts
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          family packs · stacked savings
        </span>
      </div>

      <ul className="space-y-2">
        {bundles.map((b) => {
          const allSelected = b.layers.every((l) => selectedSet.has(l.id));
          const addedCount = b.layers.filter((l) => selectedSet.has(l.id))
            .length;

          return (
            <li
              key={b.id}
              className="rounded-lg bg-background/60 border border-border/40 p-2.5 sm:p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">
                      {b.name}
                    </span>
                    {b.isFreeStack ? (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
                        free stack
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neon-amber/10 text-neon-amber font-mono">
                        −{b.discountPercent}%
                      </span>
                    )}
                    <span className="text-[9px] font-mono text-muted-foreground">
                      avg CJPI {b.avgCjpi}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/90 leading-snug mt-1">
                    {b.outcomeStatement}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                    {b.rationale}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-foreground">
                    {formatPrice(b.totalCents)}
                  </div>
                  {b.savingsCents > 0 ? (
                    <div className="text-[9px] text-muted-foreground">
                      <span className="line-through">
                        {formatPrice(b.subtotalCents)}
                      </span>{' '}
                      <span className="text-neon-amber">
                        save {formatPrice(b.savingsCents)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <ul className="flex flex-wrap gap-1">
                {b.layers.map((l) => {
                  const isSel = selectedSet.has(l.id);
                  return (
                    <li
                      key={l.id}
                      className={
                        'inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ' +
                        (isSel
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border/40 bg-background/40 text-muted-foreground')
                      }
                      title={l.description}
                    >
                      {isSel ? <Check className="h-2.5 w-2.5" /> : null}
                      {l.name}
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-muted-foreground">
                  {addedCount} / {b.layers.length} attached
                </span>
                <button
                  onClick={() => handleAddBundle(b)}
                  disabled={allSelected}
                  className={
                    'shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border transition-colors ' +
                    (allSelected
                      ? 'border-primary bg-primary text-primary-foreground cursor-default'
                      : 'border-neon-amber/50 text-neon-amber hover:bg-neon-amber/10')
                  }
                >
                  {allSelected ? (
                    <>
                      <Check className="h-3 w-3 inline" /> Bundle Added
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 inline" /> Add Bundle
                    </>
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
        Family packs combine top-impact layers from the same primitive family
        with stacked discounts. Already-attached layers stay attached.
      </p>
    </div>
  );
}
