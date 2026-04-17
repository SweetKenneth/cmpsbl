/**
 * LayerCard — collector-style card for a Layer or Suite.
 * Mirrors the StoreCollectorCard format: gradient bar, hero image, tier badges,
 * flip-to-inspect, capability chips, glow shadow.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Cpu, RotateCcw, Loader2, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  LAYER_TIER_META,
  getPillarMeta,
  getItemImage,
  formatPrice,
  type LayerInventoryRow,
} from "@/lib/store/layer-categories";

interface LayerCardProps {
  item: LayerInventoryRow;
}

export function LayerCard({ item }: LayerCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [buying, setBuying] = useState(false);
  const tier = LAYER_TIER_META[item.tier] ?? LAYER_TIER_META.Mint;
  const pillarMeta = getPillarMeta(item.pillar);
  const heroImage = getItemImage(item.slug, item.pillar);
  const isSuite = item.kind === "suite";
  const PillarIcon = pillarMeta.icon;

  const capabilities = isSuite
    ? item.suite_capabilities
    : item.primitive_chain;

  const flipVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const handleAcquire = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buying) return;
    setBuying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to acquire", { description: "Redirecting to login..." });
        window.location.href = `/auth?redirect=/store`;
        return;
      }
      const { data, error } = await supabase.functions.invoke("marketplace-checkout", {
        body: {
          product_type: "layer", // annual subscription, $19–$99/yr
          unit_amount_usd: Math.round(item.price_cents / 100),
          item_name: `CMPSBL Layer: ${item.title}`,
          capability_id: item.id,
          product_id: item.slug,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      toast.error("Checkout failed", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="snap-start shrink-0 w-[calc(100vw-4rem)] max-w-[320px] sm:max-w-[340px] min-h-[600px] flex">
      <AnimatePresence mode="wait">
        {!flipped ? (
          /* ═══ FRONT ═══ */
          <motion.div
            key="front"
            variants={flipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "rounded-2xl overflow-hidden border bg-card/95 backdrop-blur-md flex flex-col h-full",
              "shadow-xl hover:shadow-2xl transition-shadow duration-500",
              tier.border
            )}
            style={{
              boxShadow: `0 0 20px ${pillarMeta.glowColor}, 0 20px 40px -12px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Top gradient bar */}
            <div className={cn("h-1 w-full bg-gradient-to-r shrink-0", pillarMeta.gradient)} />

            {/* Hero image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-background/50">
              <img
                src={heroImage}
                alt={item.title}
                className="w-full h-full object-cover object-center"
                loading="lazy"
                width={768}
                height={576}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              <div className={cn("absolute inset-0 bg-gradient-to-t opacity-25 mix-blend-overlay", pillarMeta.gradient)} />

              {/* Kind chip — top right */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md border border-border/30">
                {isSuite ? (
                  <Sparkles className="w-3 h-3 text-muted-foreground/60" />
                ) : (
                  <Cpu className="w-3 h-3 text-muted-foreground/60" />
                )}
                <span className="text-[8px] font-black tracking-[0.15em] text-muted-foreground/60">
                  LAYER
                </span>
              </div>

              {/* Tier badge — top left */}
              <div
                className={cn(
                  "absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black tracking-wider border backdrop-blur-sm",
                  tier.bg, tier.color, tier.border
                )}
              >
                {tier.label}
              </div>
            </div>

            {/* Body */}
            <div className="relative z-10 px-5 sm:px-6 pb-5 sm:pb-6 -mt-8 flex-1 flex flex-col">
              <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-tight">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-[10px] font-mono tracking-wider text-foreground/75 dark:text-foreground/60 mt-1.5 uppercase line-clamp-2">
                  {item.subtitle}
                </p>
              )}

              {/* Description — what this Layer does for your software */}
              {item.description && (
                <p className="text-[12px] sm:text-[13px] text-foreground/85 dark:text-foreground/75 leading-relaxed mt-3">
                  {item.description}
                </p>
              )}

              {/* Capability count + chips */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                <div className="flex items-center gap-1.5">
                  <PillarIcon className="w-3.5 h-3.5 text-primary/50" />
                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground/60 tracking-wider">
                    {capabilities.length} {isSuite ? "CAPS" : "PRIMS"}
                  </span>
                </div>
                {capabilities.length > 0 && (
                  <div className="flex gap-1 flex-wrap justify-end max-w-[60%]">
                    {capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-foreground/5 text-muted-foreground/50 border border-border/15"
                      >
                        {cap}
                      </span>
                    ))}
                    {capabilities.length > 3 && (
                      <span className="text-[7px] font-mono text-muted-foreground/30">
                        +{capabilities.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Price + Inspect */}
              <div className="flex items-center justify-between mt-auto pt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className={cn("text-base sm:text-lg font-black tracking-tight", tier.color)}>
                    {formatPrice(item.price_cents)}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground/50 tracking-wider">/yr</span>
                  {item.original_value_cents && item.original_value_cents > item.price_cents && (
                    <span className="text-[10px] text-muted-foreground/40 line-through ml-1">
                      {formatPrice(item.original_value_cents)}
                    </span>
                  )}
                </div>
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
          </motion.div>
        ) : (
          /* ═══ BACK ═══ */
          <motion.div
            key="back"
            variants={flipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "rounded-2xl overflow-hidden border bg-card/98 backdrop-blur-md flex flex-col h-full",
              tier.border
            )}
            style={{
              boxShadow: `0 0 30px ${pillarMeta.glowColor}, 0 20px 40px -12px rgba(0,0,0,0.4)`,
            }}
          >
            <div className={cn("h-1 w-full bg-gradient-to-r shrink-0", pillarMeta.gradient)} />

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                      {item.title}
                    </h3>
                    <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider border shrink-0", tier.bg, tier.color, tier.border)}>
                      LAYER
                    </span>
                  </div>
                  {item.subtitle && (
                    <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5 tracking-wider">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <div className={cn("px-2.5 py-1 rounded-full text-[8px] font-black border shrink-0 tracking-wider", tier.bg, tier.color, tier.border)}>
                  {tier.label}
                </div>
              </div>

              {item.description && (
                <p className="text-xs sm:text-[13px] text-muted-foreground/70 leading-relaxed">
                  {item.description}
                </p>
              )}

              {capabilities.length > 0 && (
                <div>
                  <h4 className="text-[9px] font-black tracking-[0.2em] text-primary/50 mb-3 uppercase">
                    {isSuite ? "Bundled Capabilities" : "Primitive Chain"}
                  </h4>
                  <div className="space-y-1.5">
                    {capabilities.map((cap) => (
                      <div key={cap} className="rounded-xl border border-border/20 bg-background/20 px-3.5 py-2.5 flex items-center gap-2">
                        <div className={cn("w-1 h-1 rounded-full shrink-0 bg-gradient-to-r", pillarMeta.gradient)} />
                        <span className="text-[11px] sm:text-xs font-semibold text-foreground/90">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.cjpi_score > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-border/20">
                  <span className="text-[10px] font-mono tracking-wider text-muted-foreground/50 uppercase">CJPI Score</span>
                  <span className={cn("text-sm font-black tabular-nums", tier.color)}>{item.cjpi_score}</span>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-border/20 space-y-2 shrink-0">
              <Button
                size="sm"
                disabled={buying}
                className={cn(
                  "w-full gap-2 text-xs sm:text-sm font-black min-h-[48px] rounded-xl",
                  "bg-gradient-to-r text-white shadow-lg transition-all duration-300",
                  "hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
                  "disabled:opacity-70 disabled:hover:scale-100",
                  pillarMeta.gradient
                )}
                onClick={handleAcquire}
              >
                {buying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening checkout…
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Subscribe · {formatPrice(item.price_cents)}/yr
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[10px] font-bold min-h-[40px] gap-1.5 rounded-xl tracking-wider text-muted-foreground/60 hover:text-foreground"
                onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              >
                <RotateCcw className="w-3 h-3" /> FLIP BACK
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
