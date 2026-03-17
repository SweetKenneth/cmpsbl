/**
 * StoreCollectorCard — Unified flip card for agents & engines.
 * Front: image/icon + identity + tier badge + full bio (no truncation).
 * Back: capabilities + acquire CTA.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Zap, ShoppingCart, Cpu, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StoreItem } from "@/lib/store/catalog";
import { TIER_META } from "@/lib/store/catalog";

interface StoreCollectorCardProps {
  item: StoreItem;
  focused: boolean;
  onToggleFocus: () => void;
}

export function StoreCollectorCard({ item, focused, onToggleFocus }: StoreCollectorCardProps) {
  const [flipped, setFlipped] = useState(false);
  const tier = TIER_META[item.tier];
  const isAgent = item.kind === "agent";

  return (
    <div
      className={cn(
        "mx-auto transition-all duration-500 ease-out",
        focused ? "w-[calc(100vw-2rem)] max-w-[420px]" : "w-[calc(100vw-4rem)] max-w-[360px]",
      )}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onClick={onToggleFocus}
      >
        {/* ═══ FRONT ═══ */}
        <div
          className={cn(
            "rounded-2xl overflow-hidden",
            "border bg-card/90 backdrop-blur-sm flex flex-col",
            tier.border,
            focused && "shadow-2xl ring-1 ring-primary/20",
            !focused && "shadow-lg hover:shadow-xl",
            "transition-shadow duration-500"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Top gradient bar */}
          <div className={cn("h-1.5 w-full bg-gradient-to-r", item.gradient)} />

          {/* Visual area */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            ) : (
              <div className={cn(
                "w-full h-full bg-gradient-to-br flex items-center justify-center",
                item.gradient, "opacity-20"
              )}>
                <item.icon className="w-20 h-20 sm:w-24 sm:h-24 text-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

            {/* Kind badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/40">
              {isAgent ? <Lock className="w-3 h-3 text-muted-foreground/70" /> : <Cpu className="w-3 h-3 text-muted-foreground/70" />}
              <span className="text-[9px] font-black tracking-widest text-muted-foreground/70">
                {isAgent ? "AGENT" : "ENGINE"}
              </span>
            </div>

            {/* Tier badge */}
            <div className={cn(
              "absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-wider border",
              tier.bg, tier.color, tier.border
            )}>
              {tier.label}
            </div>
          </div>

          {/* Identity — no truncation */}
          <div className="relative z-10 px-4 sm:px-5 pb-4 sm:pb-5 -mt-10">
            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {item.name}
            </h3>
            <p className="text-[11px] font-mono text-muted-foreground/50 mt-0.5">
              {item.subtitle}
            </p>
            <p className="text-xs sm:text-[13px] text-muted-foreground/70 leading-relaxed mt-2">
              {item.bio}
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary/60" />
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground/60">
                  {item.capabilities.length} {isAgent ? "POWERS" : "CAPABILITIES"}
                </span>
              </div>
              {item.fusedFrom && (
                <div className="flex gap-1 flex-wrap justify-end max-w-[55%]">
                  {item.fusedFrom.slice(0, 3).map((name) => (
                    <span
                      key={name}
                      className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-foreground/5 text-muted-foreground/50 border border-border/20"
                    >
                      {name}
                    </span>
                  ))}
                  {item.fusedFrom.length > 3 && (
                    <span className="text-[8px] font-mono text-muted-foreground/30">
                      +{item.fusedFrom.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price + flip trigger */}
            <div className="flex items-center justify-between mt-3">
              <span className={cn("text-sm sm:text-base font-black", tier.color)}>
                {item.priceDisplay}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                className={cn(
                  "text-[10px] sm:text-[11px] font-bold text-primary/70 hover:text-primary",
                  "transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5",
                  "flex items-center gap-1.5"
                )}
              >
                FLIP TO INSPECT
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ BACK ═══ */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden",
            "border bg-card/95 backdrop-blur-sm flex flex-col",
            tier.border,
            focused && "shadow-2xl",
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className={cn("h-1.5 w-full bg-gradient-to-r", item.gradient)} />

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  {item.name}
                </h3>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-black border shrink-0",
                  tier.bg, tier.color, tier.border
                )}>
                  {isAgent ? "AGENT" : "ENGINE"}
                </span>
              </div>
              <div className={cn(
                "px-2.5 py-1 rounded-full text-[9px] font-black border shrink-0",
                tier.bg, tier.color, tier.border
              )}>
                {tier.label}
              </div>
            </div>

            {/* Full description — no truncation */}
            <p className="text-xs sm:text-[13px] text-muted-foreground/70 leading-relaxed">
              {item.description}
            </p>

            {/* Capabilities */}
            <div>
              <h4 className="text-[10px] font-black tracking-widest text-primary/60 mb-2.5">
                {isAgent ? "⚙ CROWN JEWEL POWERS" : "⚡ CAPABILITIES"}
              </h4>
              <div className="space-y-1.5">
                {item.capabilities.map((cap) => (
                  <div
                    key={cap}
                    className="rounded-lg border border-border/30 bg-background/30 px-3 py-2.5"
                  >
                    <span className="text-[11px] sm:text-xs font-bold text-foreground">
                      {cap}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 sm:p-5 border-t border-border/30 space-y-2.5">
            <Button
              size="sm"
              className={cn(
                "w-full gap-2 text-xs sm:text-sm font-black min-h-[44px]",
                "bg-gradient-to-r text-white hover:opacity-90 transition-opacity",
                item.gradient
              )}
              onClick={(e) => { e.stopPropagation(); }}
            >
              <ShoppingCart className="w-4 h-4" />
              {item.priceCents === 0 ? "Activate Free" : `Acquire · ${item.priceDisplay}`}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[11px] font-bold min-h-[40px] gap-1.5"
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
            >
              <RotateCcw className="w-3 h-3" />
              FLIP BACK
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
