/**
 * OPERATIVES — The Arsenal
 * Black-boxed sealed runtimes. Horizontal scroll. Mission-briefing aesthetic.
 */

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OPERATIVES, type Operative } from "@/lib/operatives/catalog";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

const TIER_COLORS: Record<string, string> = {
  APEX: "from-red-500/20 to-orange-500/20 border-red-500/30",
  ELITE: "from-purple-500/20 to-blue-500/20 border-purple-500/30",
  CORE: "from-cyan-500/20 to-green-500/20 border-cyan-500/30",
};

const TIER_BADGE: Record<string, string> = {
  APEX: "bg-red-500/20 text-red-400 border-red-500/30",
  ELITE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CORE: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

function OperativeCard({ op, index }: { op: Operative; index: number }) {
  const href = op.externalPath || `/operatives/${op.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="flex-shrink-0 w-[320px] sm:w-[360px]"
    >
      <Link to={href} className="block group h-full">
        <div className={cn(
          "relative h-full rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300",
          "hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10",
          "bg-card border-border/50",
          "overflow-hidden"
        )}>
          {/* Classified ribbon */}
          <div className="absolute top-0 right-0 px-3 py-1 bg-foreground/5 rounded-bl-xl">
            <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
              {op.threatLevel.split("—")[0].trim()}
            </span>
          </div>

          {/* Sealed badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br",
              TIER_COLORS[op.tier]
            )}>
              <op.icon className="w-6 h-6" style={{ color: `hsl(${op.color})` }} />
            </div>
            <Badge variant="outline" className={cn("text-[10px] font-mono", TIER_BADGE[op.tier])}>
              {op.tier}
            </Badge>
          </div>

          {/* Name */}
          <h3 className="text-xl font-bold tracking-tight mb-1">{op.codename}</h3>
          <p className="text-sm text-muted-foreground mb-4">{op.tagline}</p>

          {/* Dossier preview */}
          <p className="text-xs text-muted-foreground/80 line-clamp-3 mb-6 leading-relaxed">
            {op.briefing}
          </p>

          {/* Price & CTA */}
          <div className="flex items-end justify-between mt-auto">
            <div>
              <span className="text-2xl font-bold tracking-tight">{op.priceDisplay}</span>
              {op.isSubscription ? (
                <span className="text-xs text-muted-foreground ml-1">/ year</span>
              ) : (
                <span className="text-xs text-muted-foreground ml-1">one-time</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
              <Lock className="w-3 h-3" />
              Open Dossier
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Edition */}
          <div className="mt-4 pt-3 border-t border-border/30">
            <span className="text-[10px] font-mono text-muted-foreground/60 tracking-wide">
              {op.edition}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Operatives() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 20);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -380 : 380, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>OPERATIVES — Sealed Runtime Arsenal | CMPSBL</title>
        <meta name="description" content="Black-boxed, tamper-proof software operatives. Each one a sealed runtime built for a specific mission. Own the tool. Own the outcome." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-28 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative container mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono tracking-wider text-primary">SEALED RUNTIME PROGRAM</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                THE <span className="text-primary">OPERATIVES</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
                Each Operative is a self-contained, obfuscated, tamper-proof runtime
                engineered for a single mission. You don't see the source. You see the results.
              </p>
              <p className="text-sm text-muted-foreground/70 font-mono">
                14 sealed runtimes • 3 clearance tiers • Collector's license included
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tier Labels + Horizontal Scroll */}
        <section className="pb-24">
          {/* Scroll controls */}
          <div className="container mx-auto px-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {(["APEX", "ELITE", "CORE"] as const).map((tier) => (
                <Badge key={tier} variant="outline" className={cn("text-[10px] font-mono", TIER_BADGE[tier])}>
                  {tier} · {OPERATIVES.filter(o => o.tier === tier).length}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable cards */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-5 overflow-x-auto px-4 lg:px-8 pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {OPERATIVES.map((op, i) => (
              <div key={op.slug} className="snap-start">
                <OperativeCard op={op} index={i} />
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="container mx-auto px-4 mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/50 bg-card/50">
              <p className="text-sm text-muted-foreground">
                Every license includes a numbered Ownership Certificate, full documentation,
                and lifetime access to the sealed runtime binary.
              </p>
              <p className="text-xs font-mono text-muted-foreground/60">
                You own it. It runs forever. No subscriptions (except ARCHITECT).
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
