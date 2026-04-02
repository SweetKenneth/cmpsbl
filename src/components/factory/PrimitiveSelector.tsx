/**
 * PrimitiveSelector — Select up to 20 primitives for Ascension restoration
 * Shows scan team recommendations with impact scores.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Zap, Shield, Brain, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PrimitiveRecommendation } from "@/lib/factory/scan-team";

const MAX_SELECTIONS = 20;

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
}

export function PrimitiveSelector({ recommendations, onConfirm, isProcessing }: PrimitiveSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(() => {
    // Pre-select top recommendations
    const initial = new Set<string>();
    for (const rec of recommendations.slice(0, Math.min(8, recommendations.length))) {
      initial.add(rec.primitiveId);
    }
    return initial;
  });

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SELECTIONS) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const selectedPrimitives = recommendations.filter(r => selected.has(r.primitiveId));
    onConfirm(selectedPrimitives);
  }, [selected, recommendations, onConfirm]);

  // Group by category
  const grouped = recommendations.reduce<Record<string, PrimitiveRecommendation[]>>((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Select Primitives</h3>
          <p className="text-xs text-muted-foreground">
            {selected.size}/{MAX_SELECTIONS} selected · Scan team recommendations pre-selected
          </p>
        </div>
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
                    disabled={!isSelected && selected.size >= MAX_SELECTIONS}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-lg border text-left transition-all duration-200",
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/30 bg-card/10 hover:border-border/60",
                      !isSelected && selected.size >= MAX_SELECTIONS && "opacity-40 cursor-not-allowed",
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
