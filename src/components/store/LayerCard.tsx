/**
 * LayerCard — compact merchandise card for a single Layer or Suite.
 * Used inside a horizontal snap-scroll row on /store.
 */

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LAYER_TIER_META,
  formatPrice,
  type LayerInventoryRow,
} from "@/lib/store/layer-categories";

interface LayerCardProps {
  item: LayerInventoryRow;
  index: number;
}

export function LayerCard({ item, index }: LayerCardProps) {
  const tierMeta = LAYER_TIER_META[item.tier] ?? LAYER_TIER_META.Mint;
  const isSuite = item.kind === "suite";
  const capabilities = isSuite ? item.suite_capabilities : item.primitive_chain;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.45 }}
      className={cn(
        "snap-start shrink-0 w-[280px] sm:w-[320px]",
        "rounded-2xl border bg-card/60 backdrop-blur-md",
        "p-5 sm:p-6 flex flex-col gap-4",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        tierMeta.border,
        `hover:${tierMeta.ring}`,
        "hover:ring-1"
      )}
    >
      {/* Tier + featured */}
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-black tracking-[0.15em] uppercase",
            tierMeta.color,
            tierMeta.bg,
            tierMeta.border
          )}
        >
          {item.tier}
        </Badge>
        {item.is_featured && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
            <Sparkles className="w-3 h-3" />
            Featured
          </span>
        )}
      </div>

      {/* Title + subtitle */}
      <div className="space-y-1.5">
        <h4 className="text-base font-black tracking-tight text-foreground leading-tight">
          {item.title}
        </h4>
        {item.subtitle && (
          <p className="text-xs text-muted-foreground/90 leading-relaxed">
            {item.subtitle}
          </p>
        )}
      </div>

      {/* Capability chips */}
      {capabilities && capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold",
                "bg-muted/60 text-muted-foreground border border-border/40"
              )}
            >
              {cap}
            </span>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Price + CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-xl font-black tracking-tight", tierMeta.color)}>
            {formatPrice(item.price_cents)}
          </span>
          {item.original_value_cents && item.original_value_cents > item.price_cents && (
            <span className="text-[11px] text-muted-foreground/50 line-through">
              {formatPrice(item.original_value_cents)}
            </span>
          )}
        </div>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-8 text-xs font-bold rounded-lg hover:border-primary/50 hover:bg-primary/5"
        >
          <Link to={`/marketplace/${item.slug}`}>View</Link>
        </Button>
      </div>
    </motion.article>
  );
}
