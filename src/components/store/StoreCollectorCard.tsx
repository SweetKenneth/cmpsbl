/**
 * StoreCollectorCard — Unified flip card for agents & engines.
 * Front: image/icon + identity + tier badge + stats.
 * Back: capabilities + acquire CTA.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Zap, ShoppingCart, Package, Cpu } from "lucide-react";
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
        "collector-perspective mx-auto transition-all duration-500 ease-out",
        focused ? "w-[340px] sm:w-[400px]" : "w-[280px] sm:w-[320px]",
      )}
      style={{ aspectRatio: "3/4" }}
    >
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onClick={onToggleFocus}
      >
        {/* ═══ FRONT ═══ */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden",
            "border bg-card/80 backdrop-blur-sm flex flex-col",
            tier.border,
            focused && `shadow-2xl ring-1`,
            !focused && "shadow-lg hover:shadow-xl",
            "transition-shadow duration-500"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className={cn("h-1 w-full bg-gradient-to-r", item.gradient)} />

          {/* Visual area */}
          <div className="relative flex-1 min-h-0 overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" loading="lazy" />
            ) : (
              <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", item.gradient, "opacity-20")}>
                <item.icon className="w-24 h-24 text-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

            {/* Kind badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-sm border border-border/30">
              {isAgent ? <Lock className="w-2.5 h-2.5 text-muted-foreground/60" /> : <Cpu className="w-2.5 h-2.5 text-muted-foreground/60" />}
              <span className="text-[8px] font-black tracking-widest text-muted-foreground/60">
                {isAgent ? "AGENT" : "ENGINE"}
              </span>
            </div>

            {/* Tier badge */}
            <div className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider border", tier.bg, tier.color, tier.border)}>
              {tier.label}
            </div>
          </div>

          {/* Identity */}
          <div className="relative z-10 px-4 pb-4 -mt-12">
            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{item.name}</h3>
            <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">{item.subtitle}</p>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed mt-1.5 line-clamp-2">{item.bio}</p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-primary/60" />
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground/60">
                  {item.capabilities.length} {isAgent ? "POWERS" : "CAPABILITIES"}
                </span>
              </div>
              {item.fusedFrom && (
                <div className="flex gap-1 overflow-hidden max-w-[50%]">
                  {item.fusedFrom.slice(0, 3).map((name) => (
                    <span key={name} className="text-[7px] font-mono font-bold px-1 py-0.5 rounded bg-foreground/5 text-muted-foreground/40 border border-border/20 truncate">
                      {name}
                    </span>
                  ))}
                  {item.fusedFrom.length > 3 && (
                    <span className="text-[7px] font-mono text-muted-foreground/30">+{item.fusedFrom.length - 3}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className={cn("text-xs font-black", tier.color)}>{item.priceDisplay}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                className="text-[9px] font-bold text-primary/70 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
              >
                FLIP TO INSPECT →
              </button>
            </div>
          </div>
        </div>

        {/* ═══ BACK ═══ */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden",
            "border bg-card/90 backdrop-blur-sm flex flex-col",
            tier.border,
            focused && "shadow-2xl",
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className={cn("h-1 w-full bg-gradient-to-r", item.gradient)} />

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-foreground tracking-tight">{item.name}</h3>
                <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black border", tier.bg, tier.color, tier.border)}>
                  {isAgent ? "AGENT" : "ENGINE"}
                </span>
              </div>
              <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black border", tier.bg, tier.color, tier.border)}>
                {tier.label}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{item.description}</p>

            <div>
              <h4 className="text-[9px] font-black tracking-widest text-primary/60 mb-2">
                {isAgent ? "⚙ CROWN JEWEL POWERS" : "⚡ CAPABILITIES"}
              </h4>
              <div className="space-y-1.5">
                {item.capabilities.map((cap) => (
                  <div key={cap} className="rounded-lg border border-border/30 bg-background/30 px-3 py-2">
                    <span className="text-[10px] font-bold text-foreground">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border/30 space-y-2">
            <Button
              size="sm"
              className={cn("w-full gap-2 text-xs font-black bg-gradient-to-r text-white hover:opacity-90", item.gradient)}
              onClick={(e) => { e.stopPropagation(); }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {item.priceCents === 0 ? "Activate Free" : `Acquire · ${item.priceDisplay}`}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[10px] font-bold"
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
            >
              ← FLIP BACK
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
