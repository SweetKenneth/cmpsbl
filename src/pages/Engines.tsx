/**
 * COMPOSABLE ENGINES — The Arsenal
 * Category-first browsing with horizontal-scroll carousels per tier.
 * Inspired by Blog page's category layout.
 */

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, ArrowRight, ShieldCheck, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ENGINES, type Engine } from "@/lib/engines/catalog";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";

// ─── Tier config (styled like Blog categories) ───
const TIER_CONFIG = [
  {
    id: "META" as const,
    label: "META",
    subtitle: "Recursive super-memories",
    price: "$1,999",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    color: "from-amber-500/20 to-yellow-500/10",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    glow: "hover:shadow-amber-500/8",
    accent: "from-amber-500 via-yellow-400 to-amber-600",
  },
  {
    id: "APEX" as const,
    label: "APEX",
    subtitle: "Supreme sealed runtimes",
    price: "$599–$999",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    color: "from-red-500/20 to-orange-500/10",
    badgeClass: "bg-red-500/15 text-red-400 border-red-500/25",
    glow: "hover:shadow-red-500/8",
    accent: "from-red-500 via-orange-400 to-red-600",
  },
  {
    id: "ELITE" as const,
    label: "ELITE",
    subtitle: "Professional-grade engines",
    price: "$399",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    color: "from-purple-500/20 to-blue-500/10",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    glow: "hover:shadow-purple-500/8",
    accent: "from-purple-500 via-violet-400 to-purple-600",
  },
  {
    id: "CORE" as const,
    label: "CORE",
    subtitle: "Essential building blocks",
    price: "$199 & Free",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    color: "from-cyan-500/20 to-green-500/10",
    badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
    glow: "hover:shadow-cyan-500/8",
    accent: "from-cyan-500 via-teal-400 to-cyan-600",
  },
] as const;

type TierConfig = typeof TIER_CONFIG[number];

// ─── Horizontal Scroll Carousel ───
function ScrollCarousel({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.7;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className={cn("group relative", className)}>
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hidden md:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div
        ref={ref}
        className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hidden md:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function EngineCard({ engine, index, tierConfig }: { engine: Engine; index: number; tierConfig: TierConfig }) {
  const href = engine.externalPath || `/engines/${engine.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="snap-start shrink-0 w-[300px] sm:w-[340px]"
    >
      <Link to={href} className="block group h-full">
        <div className={cn(
          "relative h-full rounded-2xl border bg-card p-5 sm:p-6 transition-all duration-300",
          "hover:scale-[1.02] hover:shadow-2xl",
          "border-border/40 overflow-hidden",
          tierConfig.glow
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
              tierConfig.color, tierConfig.border
            )}>
              <engine.icon className="w-6 h-6" style={{ color: `hsl(${engine.color})` }} />
            </div>
            <Badge variant="outline" className={cn("text-[11px] font-mono", tierConfig.badgeClass)}>
              {engine.tier}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border/30">
              v{engine.version}
            </Badge>
            {engine.isFeatured && (
              <Badge className="text-[10px] font-mono bg-primary/15 text-primary border-primary/25">
                FEATURED
              </Badge>
            )}
          </div>

          {/* Title & tagline */}
          <h3 className="text-xl font-black tracking-tight mb-1 group-hover:text-primary transition-colors">{engine.codename}</h3>
          <p className="text-sm text-muted-foreground mb-4">{engine.tagline}</p>

          {/* Briefing */}
          <p className="text-xs text-muted-foreground/80 mb-6 leading-relaxed break-words line-clamp-3">
            {engine.briefing}
          </p>

          {/* Price + CTA */}
          <div className="flex items-end justify-between mt-auto">
            <div>
              <span className="text-2xl font-black tracking-tight">{engine.priceDisplay}</span>
              {engine.isFree ? (
                <span className="text-xs text-emerald-400 font-semibold ml-1">No card required</span>
              ) : engine.freeForSubscribers ? (
                <>
                  <span className="text-xs text-muted-foreground ml-1">one-time</span>
                  <span className="block text-xs text-emerald-400 font-semibold mt-0.5">
                    Free with Creator+ subscription
                  </span>
                </>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // Group engines by tier
  const enginesByTier: Record<string, Engine[]> = {};
  ENGINES.forEach((engine) => {
    if (!enginesByTier[engine.tier]) enginesByTier[engine.tier] = [];
    enginesByTier[engine.tier].push(engine);
  });

  // Filter engines for search/tier filter
  const filteredEngines = ENGINES.filter((e) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.codename.toLowerCase().includes(q) ||
        e.tagline.toLowerCase().includes(q) ||
        e.briefing.toLowerCase().includes(q) ||
        e.tier.toLowerCase().includes(q)
      );
    }
    if (selectedTier) return e.tier === selectedTier;
    return true;
  });

  const showBrowseMode = !searchQuery && !selectedTier;

  return (
    <>
      <Helmet>
        <title>54 Engines — META to CORE Tier Arsenal | CMPSBL</title>
        <meta name="description" content="Browse CMPSBL's 54 composable engines across 4 tiers: META recursive super-memories like GODMIND, 30 S-tier sealed runtimes, APEX and ELITE units. 154 primitives, 40% agent bundle discount." />
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
                Engines are hosted{" "}
                <a href="https://en.wikipedia.org/wiki/Runtime_system" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cognitive runtimes</a>{" "}
                that power your <strong className="text-foreground">websites, apps, and AI agents</strong> via the <Link to="/architecture" className="text-primary hover:underline font-medium">CMPSBL substrate</Link>.
                When you purchase an engine, you get an <strong className="text-foreground">API key + copy-paste SDK</strong> to
                call it from your own stack — any language, any framework.
                You don't see the source. You see the results.{" "}
                Browse <Link to="/use-cases" className="text-primary hover:underline font-medium">industry use cases</Link>{" "}
                or <Link to="/start-here" className="text-primary hover:underline font-medium">start free</Link>.
              </p>

              {/* SDK + FAILSAFE callout */}
              <div className="max-w-2xl mx-auto mb-4 p-4 rounded-xl border border-border/50 bg-card/50 text-left">
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  <strong className="text-foreground">How it works:</strong> Every engine purchase includes a
                  single-file <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TypeScript</a> SDK (<code className="text-xs bg-muted px-1 py-0.5 rounded">cmpsbl-engine-sdk.ts</code>)
                  you copy into your project. The SDK calls the engine API — your website or app stays in your stack,
                  the heavy compute runs on ours. No infrastructure to manage.{" "}
                  See the <Link to="/documentation" className="text-primary hover:underline font-medium">full API docs</Link>.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-emerald-400">⚡ Special: FAILSAFE</strong> is the only <em>standalone</em> engine —
                  it's a self-contained edge function you deploy directly to your own project.
                  No API key needed. No dependency on CMPSBL infrastructure. <strong className="text-foreground">Use it to transfer off Lovable Cloud</strong> to your own hosting, create disaster recovery checkpoints, or migrate between platforms.
                </p>
              </div>

              {/* Stats pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {TIER_CONFIG.map((tier, i) => {
                  const count = enginesByTier[tier.id]?.length || 0;
                  return (
                    <motion.div
                      key={tier.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      <div className={cn("w-4 h-[3px] rounded bg-gradient-to-r", tier.accent)} />
                      <span className="font-black text-lg">{count}</span>
                      <span className="text-xs text-muted-foreground">{tier.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground/60 font-mono">
                {ENGINES.length} sealed runtimes · 40% off bundled with agent
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══ STICKY TOOLBAR ═══ */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${ENGINES.length} engines...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl bg-card border-border"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted" aria-label="Clear search">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Tier filter pills */}
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setSelectedTier(null)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0",
                  !selectedTier
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                )}
              >
                All Tiers
              </button>
              {TIER_CONFIG.map((tier) => {
                const count = enginesByTier[tier.id]?.length || 0;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0 flex items-center gap-1.5",
                      selectedTier === tier.id
                        ? cn(tier.bg, tier.text, tier.border)
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    {tier.label}
                    <span className="opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ CONTENT ═══ */}
        <main className="flex-1">
          {/* Results count */}
          <div className="container mx-auto px-4 pt-6 pb-2">
            <p className="text-sm text-muted-foreground">
              {filteredEngines.length} engines
              {searchQuery && <> matching "<span className="text-foreground font-medium">{searchQuery}</span>"</>}
            </p>
          </div>

          {/* Browse Mode: Horizontal carousels per tier */}
          {showBrowseMode ? (
            <div className="pb-12">
              {TIER_CONFIG.filter(tier => enginesByTier[tier.id]?.length).map(tier => {
                const items = enginesByTier[tier.id] || [];

                return (
                  <section key={tier.id} className="mb-10">
                    {/* Tier header */}
                    <div className="container mx-auto px-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tier.bg)}>
                            <ShieldCheck className={cn("w-4 h-4", tier.text)} />
                          </div>
                          <div>
                            <h2 className="font-bold text-lg">{tier.label}</h2>
                            <p className="text-xs text-muted-foreground">
                              {items.length} engines · {tier.price}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedTier(tier.id)}
                          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                        >
                          View all <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal scroll carousel */}
                    <div className="container mx-auto px-4">
                      <ScrollCarousel>
                        {items.map((engine, i) => (
                          <EngineCard key={engine.slug} engine={engine} index={i} tierConfig={tier} />
                        ))}
                      </ScrollCarousel>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            /* Grid Mode (search or tier filter active) */
            <div className="container mx-auto px-4 py-6">
              {filteredEngines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredEngines.map((engine, i) => {
                    const tierConfig = TIER_CONFIG.find(t => t.id === engine.tier) || TIER_CONFIG[0];
                    return (
                      <EngineCard key={engine.slug} engine={engine} index={i} tierConfig={tierConfig} />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <ShieldCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No engines found</h3>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedTier(null); }}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Footer note */}
          <section className="border-t border-border/50 bg-card/30">
            <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 text-center">
              <div className="inline-flex flex-col items-center gap-3 p-5 sm:p-8 rounded-2xl border border-border/40 bg-card/50 glass-edge">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
                  Every license includes a numbered Ownership Certificate, full documentation,
                  and lifetime access to the sealed runtime binary. 3 engines are completely free.
                </p>
                {/* Tier legend */}
                <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                  {TIER_CONFIG.map((tier) => (
                    <div key={tier.id} className="flex items-center gap-2">
                      <div className={cn("w-6 h-[3px] rounded bg-gradient-to-r", tier.accent)} />
                      <span>{tier.label} · {tier.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <Link to="/composable-cognitives">
                      Browse 5 Meta-Agents — 40% off bundled
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <RelatedCapabilities />
        <PageSEOBlock path="/engines" title="54 Composable Engines" faq={[
          { question: "What are CMPSBL engines?", answer: "Engines are composable processing units within the CMPSBL substrate. 54 engines across 4 tiers (META, CORE, FLUX, SPEC) handle specific AI workloads from reasoning to code generation." },
          { question: "How do engine tiers work?", answer: "Engines are organized into META (recursive super-memories), CORE (foundation processing), FLUX (adaptive routing), and SPEC (specialized workloads). Higher tiers unlock more advanced capabilities." },
          { question: "Can I use engines without a paid plan?", answer: "Yes. The free Builder tier includes 3 memory slots and access to baseline engine capabilities. Premium engine tiers unlock with Studio, Creator, and Architect plans." },
        ]} />
        <EnhancedFooter />
      </div>
    </>
  );
}
