/**
 * V2 Smart Recommendations — Sprint 2 (Ascension V2 Phase 1)
 *
 * Surfaces gap+adjacency layer recommendations in:
 *   - V2EnhanceStep (pre-run, when no capabilities known yet → uses heuristic)
 *   - V2ResultsStep (post-run, with real covered primitives)
 *
 * Display-only. Tapping a reco can call onSelect(layerId) so the parent
 * (Enhance step) can add it to its selection set. On Results, no callback —
 * recommendations are informational with a link to re-run with them attached.
 */

import { useMemo } from 'react';
import { Sparkles, Plus, Check, ArrowRight, Layers as LayersIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recommendLayers } from '@/lib/factory/smart-recommendations';

interface Props {
  /** Primitives covered by the current run (empty = pre-run heuristic mode) */
  coveredPrimitives: string[];
  /** Layer IDs the user has already selected (won't be recommended) */
  selectedLayerIds?: string[];
  /** If provided, each reco renders an Add button that toggles selection */
  onSelect?: (layerId: string) => void;
  /** Max recos to show (default 4) */
  limit?: number;
  /** Compact title override */
  title?: string;
}

export function V2SmartRecommendations({
  coveredPrimitives,
  selectedLayerIds = [],
  onSelect,
  limit = 4,
  title,
}: Props) {
  // Stable signatures so new array refs from parents (e.g. Array.from(Set))
  // don't bust the memo every render.
  const coveredKey = useMemo(
    () => [...coveredPrimitives].map((p) => p.toUpperCase()).sort().join('|'),
    [coveredPrimitives],
  );
  const selectedKey = useMemo(
    () => [...selectedLayerIds].sort().join('|'),
    [selectedLayerIds],
  );
  const recos = useMemo(
    () => recommendLayers({ coveredPrimitives, selectedLayerIds, limit }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coveredKey, selectedKey, limit],
  );

  if (recos.length === 0) return null;

  const selectedSet = new Set(selectedLayerIds);
  const heading = title ?? (coveredPrimitives.length === 0
    ? 'Suggested Layers'
    : 'Smart Recommendations');

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {heading}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          gap-driven · balanced
        </span>
      </div>

      <ul className="space-y-1.5">
        {recos.map((r) => {
          const isSelected = selectedSet.has(r.layer.id);
          const Icon = r.reason === 'gap' ? Plus : LayersIcon;
          return (
            <li
              key={r.layer.id}
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-background/60 border border-border/40"
            >
              <div className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary shrink-0">
                <Icon className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium text-foreground truncate">
                    {r.layer.name}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    CJPI {r.layer.cjpi}
                  </span>
                  <span className={
                    'text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ' +
                    (r.reason === 'gap'
                      ? 'bg-neon-amber/10 text-neon-amber'
                      : 'bg-primary/10 text-primary')
                  }>
                    {r.reason === 'gap' ? `gap · ${r.driverPrimitive}` : `adj · ${r.driverPrimitive}`}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                  {r.rationale}
                </p>
              </div>
              {onSelect ? (
                <button
                  onClick={() => onSelect(r.layer.id)}
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
        })}
      </ul>

      <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
        {coveredPrimitives.length === 0
          ? 'Pre-run picks based on highest-impact uncovered primitives.'
          : 'Picked from the 40-Primitive matrix based on what your run covered (and what it didn\u2019t).'}
      </p>
    </div>
  );
}
