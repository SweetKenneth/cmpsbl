/**
 * StoreCollectorCard — Unified flip card for agents & engines.
 * Front: image + identity + tier badge + full bio (no truncation).
 * Back: capabilities + acquire CTA.
 * Tier-specific glow halos. Production-ready polish.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Zap, ShoppingCart, Cpu, RotateCcw, ExternalLink } from "lucide-react";
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
        focused ? "w-[calc(100vw-2rem)] max-w-[420px]" : "w-[calc(100vw-4rem)] max-w-[380px]",
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
            "border bg-card/95 backdrop-blur-md flex flex-col",
            tier.border,
            focused && "shadow-2xl ring-1 ring-primary/20",
            !focused && "shadow-xl hover:shadow-2xl",
            "transition-all duration-500"
          )}
          style={{
            backfaceVisibility: "hidden",
            boxShadow: focused
              ? `0 0 40px ${item.glowColor}, 0 25px 50px -12px rgba(0,0,0,0.5)`
              : `0 0 20px ${item.glowColor}, 0 20px 40px -12px rgba(0,0,0,0.4)`
          }}
        >
          {/* Top gradient bar */}
          <div className={cn("h-1 w-full bg-gradient-to-r", item.gradient)} />

          {/* Visual area */}
          <div className="relative aspect-[4/3] overflow-hidden bg-background/50">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className={cn(
                "w-full h-full bg-gradient-to-br flex items-center justify-center",
                item.gradient, "opacity-15"
              )}>
                <item.icon className="w-20 h-20 sm:w-24 sm:h-24 text-foreground/15" />
              </div>
            )}
            {/* Cinematic overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            <div className={cn("absolute inset-0 bg-gradient-to-t opacity-30", item.gradient, "mix-blend-overlay")} />

            {/* Kind badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md border border-border/30">
              {isAgent
                ? <Lock className="w-3 h-3 text-muted-foreground/60" />
                : <Cpu className="w-3 h-3 text-muted-foreground/60" />
              }
              <span className="text-[8px] font-black tracking-[0.15em] text-muted-foreground/60">
                {isAgent ? "SEALED AGENT" : "ENGINE"}
              </span>
            </div>

            {/* Tier badge */}
            <div className={cn(
              "absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black tracking-wider border backdrop-blur-sm",
              tier.bg, tier.color, tier.border
            )}>
              {tier.label}
            </div>
          </div>

          {/* Identity — no truncation */}
          <div className="relative z-10 px-5 sm:px-6 pb-5 sm:pb-6 -mt-8">
            <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">
              {item.name}
            </h3>
            <p className="text-[10px] font-mono tracking-wider text-muted-foreground/40 mt-1 uppercase">
              {item.subtitle}
            </p>
            <p className="text-xs sm:text-[13px] text-muted-foreground/70 leading-relaxed mt-3">
              {item.bio}
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary/50" />
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground/50 tracking-wider">
                  {item.capabilities.length} {isAgent ? "POWERS" : "CAPS"}
                </span>
              </div>
              {item.fusedFrom && (
                <div className="flex gap-1 flex-wrap justify-end max-w-[55%]">
                  {item.fusedFrom.slice(0, 3).map((name) => (
                    <span
                      key={name}
                      className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-foreground/5 text-muted-foreground/40 border border-border/15"
                    >
                      {name}
                    </span>
                  ))}
                  {item.fusedFrom.length > 3 && (
                    <span className="text-[7px] font-mono text-muted-foreground/25">
                      +{item.fusedFrom.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price + flip trigger */}
            <div className="flex items-center justify-between mt-3">
              <span className={cn("text-base sm:text-lg font-black tracking-tight", tier.color)}>
                {item.priceDisplay}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                className={cn(
                  "text-[10px] font-bold text-primary/60 hover:text-primary",
                  "transition-all px-3 py-2 rounded-xl hover:bg-primary/10",
                  "flex items-center gap-1.5 min-h-[40px]"
                )}
              >
                <span className="tracking-wider">INSPECT</span>
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ BACK ═══ */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden",
            "border bg-card/98 backdrop-blur-md flex flex-col",
            tier.border,
            focused && "shadow-2xl",
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: `0 0 30px ${item.glowColor}, 0 20px 40px -12px rgba(0,0,0,0.4)`
          }}
        >
          <div className={cn("h-1 w-full bg-gradient-to-r", item.gradient)} />

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    {item.name}
                  </h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider border shrink-0",
                    tier.bg, tier.color, tier.border
                  )}>
                    {isAgent ? "AGENT" : "ENGINE"}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground/40 mt-0.5 tracking-wider">
                  {item.subtitle}
                </p>
              </div>
              <div className={cn(
                "px-2.5 py-1 rounded-full text-[8px] font-black border shrink-0 tracking-wider",
                tier.bg, tier.color, tier.border
              )}>
                {tier.label}
              </div>
            </div>

            {/* Full description — no truncation */}
            <p className="text-xs sm:text-[13px] text-muted-foreground/60 leading-relaxed">
              {item.description}
            </p>

            {/* Capabilities */}
            <div>
              <h4 className="text-[9px] font-black tracking-[0.2em] text-primary/50 mb-3 uppercase">
                {isAgent ? "Crown Jewel Powers" : "Capabilities"}
              </h4>
              <div className="space-y-1.5">
                {item.capabilities.map((cap, i) => (
                  <div
                    key={cap}
                    className="rounded-xl border border-border/20 bg-background/20 px-3.5 py-2.5 flex items-center gap-2"
                  >
                    <div className={cn("w-1 h-1 rounded-full shrink-0 bg-gradient-to-r", item.gradient)} />
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground/90">
                      {cap}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 sm:p-5 border-t border-border/20 space-y-2">
            <Button
              size="sm"
              className={cn(
                "w-full gap-2 text-xs sm:text-sm font-black min-h-[48px] rounded-xl",
                "bg-gradient-to-r text-white shadow-lg transition-all duration-300",
                "hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
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
              className="w-full text-[10px] font-bold min-h-[40px] gap-1.5 rounded-xl tracking-wider text-muted-foreground/60 hover:text-foreground"
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