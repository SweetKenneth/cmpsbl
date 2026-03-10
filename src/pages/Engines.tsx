/**
 * COMPOSABLE ENGINES — The Arsenal
 * Black-boxed sealed runtimes. Horizontal scroll. Mission-briefing aesthetic.
 */

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ENGINES, type Engine } from "@/lib/engines/catalog";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";

const TIER_COLORS: Record<string, string> = {
  APEX: "from-red-500/20 to-orange-500/10 border-red-500/30",
  ELITE: "from-purple-500/20 to-blue-500/10 border-purple-500/30",
  CORE: "from-cyan-500/20 to-green-500/10 border-cyan-500/30",
};

const TIER_BADGE: Record<string, string> = {
  APEX: "bg-red-500/15 text-red-400 border-red-500/25",
  ELITE: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  CORE: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
};

const TIER_GLOW: Record<string, string> = {
  APEX: "hover:shadow-red-500/8",
  ELITE: "hover:shadow-purple-500/8",
  CORE: "hover:shadow-cyan-500/8",
};

function EngineCard({ engine, index }: { engine: Engine; index: number }) {
  const href = engine.externalPath || `/engines/${engine.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="flex-shrink-0 w-[300px] sm:w-[340px]"
    >
      <Link to={href} className="block group h-full">
        <div className={cn(
          "relative h-full rounded-2xl border bg-card p-5 sm:p-6 transition-all duration-300",
          "hover:scale-[1.02] hover:shadow-2xl",
          "border-border/40 overflow-hidden",
          TIER_GLOW[engine.tier]
        )}>
          {/* Top accent line */}
          <div
            className="absolute top-0 inset-x-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ background: `linear-gradient(90deg, transparent, hsl(${engine.color}), transparent)` }}
          />

          {/* Threat level tag */}
          <div className="absolute top-0 right-0 px-3 py-1 bg-foreground/5 rounded-bl-xl">
            <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
              {engine.threatLevel.split("—")[0].trim()}
            </span>
          </div>

          {/* Icon + tier badge */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br border",
              TIER_COLORS[engine.tier]
            )}>
              <engine.icon className="w-6 h-6" style={{ color: `hsl(${engine.color})` }} />
            </div>
            <Badge variant="outline" className={cn("text-[11px] font-mono", TIER_BADGE[engine.tier])}>
              {engine.tier}
            </Badge>
          </div>

          {/* Title & tagline */}
          <h3 className="text-xl font-black tracking-tight mb-1 group-hover:text-primary transition-colors">{engine.codename}</h3>
          <p className="text-sm text-muted-foreground mb-4">{engine.tagline}</p>

          {/* Briefing */}
          <p className="text-xs text-muted-foreground/80 mb-6 leading-relaxed break-words">
            {engine.briefing}
          </p>

          {/* Price + CTA */}
          <div className="flex items-end justify-between mt-auto">
            <div>
              <span className="text-2xl font-black tracking-tight">{engine.priceDisplay}</span>
              {engine.isFree ? (
                <span className="text-xs text-emerald-400 font-semibold ml-1">No card required</span>
              ) : engine.isSubscription ? (
                <span className="text-xs text-muted-foreground ml-1">/ year</span>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground ml-1">standalone</span>
                  <span className="block text-sm text-primary font-semibold mt-0.5">
                    {engine.bundleDisplay} bundled
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
              <Lock className="w-3 h-3" />
              Dossier
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Edition tag */}
          <div className="mt-4 pt-3 border-t border-border/20">
            <span className="text-[11px] font-mono text-muted-foreground/50 tracking-wide">
              {engine.edition}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Engines() {
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
    el.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Composable Engines — Sealed Runtime Arsenal | CMPSBL</title>
        <meta name="description" content="20 black-boxed, tamper-proof composable engines. APEX $599, ELITE $399, CORE $199, 3 Free. 40% off when bundled. Own the tool. Own the outcome." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <PublicNav />

        {/* Breadcrumb trail */}
        <div className="container mx-auto px-3 sm:px-4 pt-20">
          <PublicBreadcrumb />
        </div>

        {/* Hero */}
        <section className="relative pt-8 sm:pt-10 pb-12 sm:pb-16 px-3 sm:px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative container mx-auto max-w-5xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5 sm:mb-6">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[11px] sm:text-xs font-mono tracking-wider text-primary">SEALED RUNTIME PROGRAM</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3 sm:mb-4">
                COMPOSABLE <span className="text-primary">ENGINES</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-3 leading-relaxed">
                Each Engine is a self-contained, obfuscated, tamper-proof runtime
                forged from our highest-scoring Apex Discovery artifacts. You don't see the source. You see the results.
              </p>
              <p className="text-sm text-muted-foreground/60 font-mono">
                20 sealed runtimes · 3 clearance tiers · Free to $599 · 40% off bundled
              </p>
            </motion.div>
          </div>
        </section>

        {/* Scroll gallery */}
        <section className="pb-24">
          <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {(["APEX", "ELITE", "CORE"] as const).map((tier) => (
                <Badge key={tier} variant="outline" className={cn("text-[11px] font-mono", TIER_BADGE[tier])}>
                  {tier} · {ENGINES.filter(e => e.tier === tier).length}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => scroll("left")} disabled={!canScrollLeft} aria-label="Scroll left">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => scroll("right")} disabled={!canScrollRight} aria-label="Scroll right">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-4 sm:gap-5 overflow-x-auto px-4 lg:px-8 pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {ENGINES.map((engine, i) => (
              <div key={engine.slug} className="snap-start">
                <EngineCard engine={engine} index={i} />
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="container mx-auto px-4 mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl border border-border/40 bg-card/50">
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                Every license includes a numbered Ownership Certificate, full documentation,
                and lifetime access to the sealed runtime binary. 3 engines are completely free.
              </p>
              <p className="text-xs font-mono text-muted-foreground/50">
                3 free · CORE $199 · ELITE $399 · APEX $599 · 40% off bundled
              </p>
              <div className="flex gap-3 mt-2">
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link to="/composable-cognitives">
                    Browse 20 Agents — 40% off bundled
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </>
  );
}
