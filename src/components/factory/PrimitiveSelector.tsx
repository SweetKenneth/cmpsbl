/**
 * PrimitiveSelector — Enterprise-grade primitive selection for Ascension
 * Shows finding-linked primitives prominently, with impact scores and rationale.
 * Supports auto-fix mode for scanner-recommended primitives.
 */

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Zap,
  Shield,
  Brain,
  Layers,
  Search as SearchIcon,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PrimitiveRecommendation } from "@/lib/factory/scan-team";

const DEFAULT_MAX_SELECTIONS = 20;

const CATEGORY_ICONS: Record<string, typeof Brain> = {
  Organ: Brain,
  Layer: Layers,
  Engine: Zap,
  Agent: Shield,
};

const CATEGORY_COLORS: Record<string, string> = {
  Organ: "text-[hsl(var(--neon-cyan))]",
  Layer: "text-[hsl(var(--neon-purple))]",
  Engine: "text-primary",
  Agent: "text-[hsl(var(--neon-magenta))]",
};

interface PrimitiveSelectorProps {
  recommendations: PrimitiveRecommendation[];
  onConfirm: (selected: PrimitiveRecommendation[]) => void;
  isProcessing?: boolean;
  maxSelections?: number;
  defaultSelectionCount?: number;
}

export function PrimitiveSelector({
  recommendations,
  onConfirm,
  isProcessing,
  maxSelections = DEFAULT_MAX_SELECTIONS,
  defaultSelectionCount = Math.min(8, maxSelections),
}: PrimitiveSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const rec of recommendations.slice(0, Math.min(defaultSelectionCount, recommendations.length, maxSelections))) {
      initial.add(rec.primitiveId);
    }
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Separate finding-linked (🔍 prefix) from general recommendations
  const { findingLinked, general } = useMemo(() => {
    const linked: PrimitiveRecommendation[] = [];
    const gen: PrimitiveRecommendation[] = [];
    for (const rec of recommendations) {
      if (rec.rationale.startsWith('🔍')) {
        linked.push(rec);
      } else {
        gen.push(rec);
      }
    }
    return { findingLinked: linked, general: gen };
  }, [recommendations]);

  const filteredGeneral = useMemo(() => {
    if (!searchQuery.trim()) return general;
    const q = searchQuery.toLowerCase();
    return general.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.rationale.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  }, [general, searchQuery]);

  const toggle = useCallback((id: string) => {
    // Haptic feedback on toggle
    try { if ('vibrate' in navigator) navigator.vibrate([8]); } catch { /* non-critical */ }
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < maxSelections) {
        next.add(id);
      }
      return next;
    });
  }, [maxSelections]);

  const selectAll = useCallback(() => {
    const all = new Set<string>();
    for (const rec of recommendations.slice(0, maxSelections)) {
      all.add(rec.primitiveId);
    }
    setSelected(all);
  }, [recommendations, maxSelections]);

  const selectFindingLinkedOnly = useCallback(() => {
    const linked = new Set<string>();
    for (const rec of findingLinked) {
      linked.add(rec.primitiveId);
    }
    setSelected(linked);
  }, [findingLinked]);

  const handleConfirm = useCallback(() => {
    const selectedPrimitives = recommendations.filter(r => selected.has(r.primitiveId));
    onConfirm(selectedPrimitives);
  }, [selected, recommendations, onConfirm]);

  // Group general by category
  const grouped = filteredGeneral.reduce<Record<string, PrimitiveRecommendation[]>>((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {});

  const findingLinkedCount = findingLinked.filter(r => selected.has(r.primitiveId)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Select Primitives</h3>
          <p className="text-xs text-muted-foreground">
            {selected.size}/{maxSelections} selected
            {findingLinked.length > 0 && (
              <> · <span className="text-primary font-semibold">{findingLinkedCount} fix{findingLinkedCount !== 1 ? 'es' : ''}</span> from scan findings</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {findingLinked.length > 0 && (
            <Button
              onClick={selectFindingLinkedOnly}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs gap-1.5"
            >
              <AlertTriangle className="w-3 h-3" />
              Fix Issues Only ({findingLinked.length})
            </Button>
          )}
          <Button
            onClick={selectAll}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5"
          >
            <Sparkles className="w-3 h-3" />
            Select All
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selected.size === 0 || isProcessing}
            size="sm"
            className="rounded-xl font-bold gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            {isProcessing ? "Restoring..." : `Run ${selected.size} Primitives`}
          </Button>
        </div>
      </div>

      {/* ═══ Finding-Linked Primitives — Always shown first ═══ */}
      {findingLinked.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Scanner-Recommended Fixes ({findingLinked.length})
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">
            These primitives directly address issues found in your code. They are pre-selected for maximum impact.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {findingLinked.map((primitive) => {
              const isSelected = selected.has(primitive.primitiveId);
              const CatIcon = CATEGORY_ICONS[primitive.category] ?? Brain;
              const catColor = CATEGORY_COLORS[primitive.category] ?? "text-primary";
              return (
                <button
                  key={primitive.primitiveId}
                  onClick={() => toggle(primitive.primitiveId)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200",
                    isSelected
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/30 bg-card/10 hover:border-primary/30",
                  )}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <CatIcon className={cn("w-3 h-3", catColor)} />
                      <span className="text-xs font-bold text-foreground">{primitive.name}</span>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", catColor, "bg-current/10")}>
                        {primitive.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {primitive.rationale.replace('🔍 ', '')}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="h-1.5 flex-1 rounded-full bg-border/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${primitive.impactScore}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-primary font-mono font-bold">
                        {primitive.impactScore}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Search for general primitives ═══ */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
        <input
          type="text"
          placeholder="Search primitives..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border/30 bg-card/20 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
        />
      </div>

      {/* ═══ General Primitives by Category ═══ */}
      {Object.entries(grouped).map(([category, primitives]) => {
        const CatIcon = CATEGORY_ICONS[category] ?? Brain;
        const catColor = CATEGORY_COLORS[category] ?? "text-primary";

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              <CatIcon className={cn("w-3.5 h-3.5", catColor)} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", catColor)}>
                {category}s ({primitives.length})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {primitives.map((primitive) => {
                const isSelected = selected.has(primitive.primitiveId);
                return (
                  <button
                    key={primitive.primitiveId}
                    onClick={() => toggle(primitive.primitiveId)}
                    disabled={!isSelected && selected.size >= maxSelections}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-lg border text-left transition-all duration-200",
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/30 bg-card/10 hover:border-border/60",
                      !isSelected && selected.size >= maxSelections && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{primitive.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {primitive.rationale}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-1 flex-1 rounded-full bg-border/30 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${primitive.impactScore}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground/60 font-mono">
                          {primitive.impactScore}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
