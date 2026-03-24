/**
 * FlipCard — Heroic 3D card-flip component for product marketplaces.
 * Front shows summary; back reveals capabilities + CTA.
 * Uses CSS grid stacking for robust 3D flip on all browsers.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  frontTitle: string;
  frontSubtitle: string;
  frontIcon: React.ReactNode;
  frontBadge?: string;
  frontBadgeClass?: string;
  frontAccentBar?: string;
  frontStats?: { label: string; value: string; icon?: React.ReactNode }[];
  backCapabilities?: string[];
  backCta?: { label: string; href?: string };
  backPrice?: string;
  backPriceLabel?: string;
  onAction?: () => void;
  className?: string;
  borderClass?: string;
  glowClass?: string;
  index?: number;
}

export function FlipCard({
  frontTitle,
  frontSubtitle,
  frontIcon,
  frontBadge,
  frontBadgeClass,
  frontAccentBar = "bg-primary",
  frontStats,
  backCapabilities = [],
  backCta,
  backPrice,
  backPriceLabel,
  onAction,
  className,
  borderClass = "border-border",
  glowClass,
  index = 0,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction();
    } else if (backCta?.href && backCta.href !== '#') {
      window.location.href = backCta.href;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className={cn("group cursor-pointer", className)}
      style={{ perspective: "1200px" }}
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 80, damping: 16 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full"
      >
        {/* Grid stacking — both faces in same cell for robust height */}
        <div className="grid w-full h-full" style={{ gridTemplate: "1fr / 1fr" }}>
          {/* ═══ FRONT ═══ */}
          <div
            className={cn(
              "rounded-xl border bg-card overflow-hidden flex flex-col",
              "hover:shadow-xl transition-shadow duration-300",
              borderClass, glowClass,
              "[grid-area:1/1]"
            )}
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className={cn("h-1 w-full", frontAccentBar)} />

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/30 flex items-center justify-center">
                  {frontIcon}
                </div>
                <div className="flex items-center gap-1.5">
                  {frontBadge && (
                    <Badge variant="outline" className={cn("text-[11px]", frontBadgeClass)}>
                      {frontBadge}
                    </Badge>
                  )}
                  <div className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <RotateCcw className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-sm sm:text-base leading-tight mb-1 group-hover:text-primary transition-colors break-words">
                {frontTitle}
              </h3>
              <p className="text-xs text-muted-foreground mb-auto leading-relaxed break-words">
                {frontSubtitle}
              </p>

              {frontStats && frontStats.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
                  {frontStats.map((s, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {s.icon}
                      <span className="font-semibold text-foreground">{s.value}</span>
                      <span>{s.label}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 pb-3 text-[11px] text-muted-foreground/50 font-mono text-center">
              TAP TO FLIP
            </div>
          </div>

          {/* ═══ BACK ═══ */}
          <div
            className={cn(
              "rounded-xl border bg-card overflow-hidden flex flex-col",
              borderClass, glowClass,
              "[grid-area:1/1]"
            )}
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className={cn("h-1 w-full", frontAccentBar)} />

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-[11px] sm:text-xs font-mono text-muted-foreground tracking-widest uppercase">
                    Capabilities
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center">
                  <RotateCcw className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5 flex-1 overflow-hidden">
                {backCapabilities.slice(0, 5).map((cap, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground leading-tight break-words">{cap}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-auto border-t border-border/30 flex items-center justify-between">
                {backPrice && (
                  <div>
                    <span className="text-lg font-black tracking-tight">{backPrice}</span>
                    {backPriceLabel && (
                      <span className="block text-[10px] text-muted-foreground leading-tight mt-0.5">{backPriceLabel}</span>
                    )}
                  </div>
                )}
                {backCta && (
                  <Button
                    size="sm"
                    className="gap-1 h-7 text-xs"
                    onClick={handleCtaClick}
                  >
                    {backCta.label}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
