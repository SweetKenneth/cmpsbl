/**
 * ShowroomPreview — Teaser for the Showroom with mini horizontal scroll
 * Matches the new tier-carousel Showroom layout
 */

import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import imgSecurity from "@/assets/showroom/security-compliance.jpg";
import imgGovernance from "@/assets/showroom/governance-policy.jpg";
import imgIntelligence from "@/assets/showroom/decision-intelligence.jpg";
import imgObservability from "@/assets/showroom/monitoring-visibility.jpg";
import imgResilience from "@/assets/showroom/resilience-recovery.jpg";
import imgOptimization from "@/assets/showroom/performance-optimization.jpg";

const PREVIEW_ITEMS = [
  { name: "Compliance Certification Suite", score: 100, tier: "Apex", price: "$1,952", image: imgGovernance, color: "text-primary", border: "border-primary/30" },
  { name: "Drift Prevention Engine", score: 97, tier: "Mythic", price: "$194", image: imgGovernance, color: "text-purple-400", border: "border-purple-500/30" },
  { name: "Encrypted State Vault", score: 96, tier: "Mythic", price: "$192", image: imgSecurity, color: "text-purple-400", border: "border-purple-500/30" },
  { name: "Real-Time Anomaly Detector", score: 93, tier: "Relic", price: "$140", image: imgObservability, color: "text-amber-400", border: "border-amber-500/30" },
  { name: "Self-Healing Runtime", score: 91, tier: "Relic", price: "$137", image: imgResilience, color: "text-amber-400", border: "border-amber-500/30" },
  { name: "Predictive Decision Core", score: 88, tier: "Prime", price: "$110", image: imgIntelligence, color: "text-sky-400", border: "border-sky-500/30" },
  { name: "Cost Optimization Engine", score: 82, tier: "Prime", price: "$103", image: imgOptimization, color: "text-sky-400", border: "border-sky-500/30" },
] as const;

export function ShowroomPreview() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="relative z-10 px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/40 bg-card/40 mb-4">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">The Showroom</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
            Every Discovery Has a Price
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Scored by CJPI. Priced by tier. Once purchased, permanently retired.
          </p>
        </div>

        {/* Horizontal scroll carousel — matches Showroom page */}
        <div className="group relative mb-8">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PREVIEW_ITEMS.map((item) => (
              <div
                key={item.name}
                className={cn(
                  "snap-start shrink-0 w-[240px] sm:w-[280px] rounded-2xl border bg-card overflow-hidden",
                  "hover:scale-[1.02] hover:shadow-xl transition-all duration-300",
                  "border-border/40",
                )}
              >
                {/* Image */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={768}
                    height={512}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <Badge
                    variant="outline"
                    className={cn("absolute top-2.5 left-2.5 text-[10px] font-black tracking-wider backdrop-blur-sm", item.border, item.color)}
                  >
                    {item.tier}
                  </Badge>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/30">
                    <span className="text-xs font-black text-foreground">{item.price}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-foreground leading-tight mb-1.5">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground/50">CJPI {item.score}</span>
                    <span className={cn("text-[10px] font-bold", item.color)}>{item.tier}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hidden md:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-muted-foreground/60 mb-5 max-w-md mx-auto">
            Unique certificate, structural fingerprint, and retirement seal with every purchase.
          </p>
          <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold text-sm">
            <Link to="/showroom">
              <Sparkles className="w-4 h-4 mr-2" />
              Browse the Showroom
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
