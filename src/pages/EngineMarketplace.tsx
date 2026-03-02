/**
 * Engines (OEM) — Supreme × Canva Layout (matching Store & Blog)
 * Mobile-first with sticky toolbar, category carousels,
 * tier filter pills, browse/grid modes, and horizontal snap-scroll.
 */

import { useState, useMemo, useCallback, useRef } from "react";
import { useEngineSubscription } from "@/hooks/useEngineSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Terminal, Shield, Zap, Brain, Search, Crown, Check,
  Layers, Sparkles, Info, Package, Network, ArrowRight,
  Cpu, Eye, Lock, RefreshCw, Radio, Plug, BarChart,
  Heart, BookOpen, Bot, Palette, Wallet, GitBranch,
  Rocket, ChevronRight, ChevronLeft, Play, Gift, Star,
  Filter, X, Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FlipCard } from "@/components/commerce/FlipCard";

import {
  getPublicEngines, getPublicMetaEngines, getInternalEnginesShowcase,
  getEngineCategories, getCatalogSummary,
  type PublicEngine, type PublicMetaEngine,
} from "@/lib/engines/publicCatalog";
import {
  SUBSCRIPTION_PLANS, TIER_DISPLAY, ENGINE_CATEGORY_CONFIG,
  type EngineVisibility, type SubscriptionPlan,
} from "@/lib/commerce/enginePricing";

// ─── Category config (matching Store/Blog style) ───
const ENGINE_CATEGORIES = [
  { id: 'cognitive', label: 'Cognitive', icon: Brain, color: 'from-violet-500/20 to-violet-600/5', border: 'border-violet-500/30', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  { id: 'operational', label: 'Operational', icon: Zap, color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'intelligence', label: 'Intelligence', icon: Sparkles, color: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'governance', label: 'Governance', icon: Shield, color: 'from-rose-500/20 to-rose-600/5', border: 'border-rose-500/30', text: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'security', label: 'Security', icon: Lock, color: 'from-red-500/20 to-red-600/5', border: 'border-red-500/30', text: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'evolution', label: 'Evolution', icon: RefreshCw, color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'communication', label: 'Communication', icon: Radio, color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'integration', label: 'Integration', icon: Plug, color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'analytics', label: 'Analytics', icon: BarChart, color: 'from-teal-500/20 to-teal-600/5', border: 'border-teal-500/30', text: 'text-teal-400', bg: 'bg-teal-500/10' },
  { id: 'experience', label: 'Experience', icon: Heart, color: 'from-pink-500/20 to-pink-600/5', border: 'border-pink-500/30', text: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen, color: 'from-indigo-500/20 to-indigo-600/5', border: 'border-indigo-500/30', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'autonomy', label: 'Autonomy', icon: Bot, color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/30', text: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'creativity', label: 'Creativity', icon: Palette, color: 'from-fuchsia-500/20 to-fuchsia-600/5', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
  { id: 'perception', label: 'Perception', icon: Eye, color: 'from-sky-500/20 to-sky-600/5', border: 'border-sky-500/30', text: 'text-sky-400', bg: 'bg-sky-500/10' },
  { id: 'resource', label: 'Resource', icon: Wallet, color: 'from-lime-500/20 to-lime-600/5', border: 'border-lime-500/30', text: 'text-lime-400', bg: 'bg-lime-500/10' },
  { id: 'workflow', label: 'Workflow', icon: GitBranch, color: 'from-slate-500/20 to-slate-600/5', border: 'border-slate-500/30', text: 'text-slate-400', bg: 'bg-slate-500/10' },
  { id: 'enhancement', label: 'Enhancement', icon: Rocket, color: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/30', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
] as const;

function findCategory(id: string) {
  return ENGINE_CATEGORIES.find(c => c.id === id) || ENGINE_CATEGORIES[0];
}

type EngineType = 'all' | 'engines' | 'meta' | 'internal';
type TierFilter = 'all' | EngineVisibility;

// ─── Horizontal Scroll Carousel (same as Store/Blog) ───
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
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hidden md:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hidden md:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Engine Card (carousel-sized, Supreme card style) ───
function EngineCard({ engine, isShowcase = false, isMeta = false }: { engine: PublicEngine | PublicMetaEngine; isShowcase?: boolean; isMeta?: boolean }) {
  const tierConfig = TIER_DISPLAY[engine.visibility];
  const cat = findCategory(engine.category);
  const CatIcon = cat.icon;

  return (
    <div className={cn(
      "snap-start shrink-0 w-[280px] min-h-[220px]",
      "rounded-xl border bg-gradient-to-br overflow-hidden",
      "hover:border-primary/30 hover:-translate-y-1 transition-all duration-200",
      "flex flex-col",
      isShowcase
        ? "border-violet-500/20 from-violet-500/[0.04] to-transparent"
        : isMeta
        ? "border-primary/20 from-primary/[0.04] to-transparent"
        : "border-border from-card to-card"
    )}>
      {/* Top accent bar */}
      <div className={cn(
        "h-1 w-full",
        isShowcase ? "bg-gradient-to-r from-violet-500 to-purple-500"
        : isMeta ? "bg-gradient-to-r from-primary to-violet-500"
        : engine.visibility === 'free' ? "bg-emerald-500"
        : engine.visibility === 'standard' ? "bg-cyan-500"
        : "bg-violet-500"
      )} />

      <div className="p-4 flex-1 flex flex-col">
        {/* Type + tier badge row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px]", cat.bg, cat.text, cat.border)}>
              <CatIcon className="w-2.5 h-2.5 mr-1" />
              {engine.category}
            </Badge>
            {isMeta && (
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                <Layers className="w-2.5 h-2.5 mr-1" /> Meta
              </Badge>
            )}
          </div>
          <span className={cn(
            "text-[10px] font-bold flex items-center gap-0.5",
            isShowcase ? "text-violet-400"
            : engine.visibility === 'free' ? "text-emerald-400"
            : engine.visibility === 'standard' ? "text-cyan-400"
            : "text-violet-400"
          )}>
            {isShowcase ? (
              <><RefreshCw className="w-2.5 h-2.5" /> INTERNAL</>
            ) : engine.visibility === 'free' ? (
              <><Unlock className="w-2.5 h-2.5" /> FREE</>
            ) : (
              <><Lock className="w-2.5 h-2.5" /> {tierConfig.label}</>
            )}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-bold text-sm leading-tight mb-1.5 line-clamp-2">{engine.name}</h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{engine.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {'synergyMultiplier' in engine && (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {engine.synergyMultiplier}x
            </span>
          )}
          {'capabilityCount' in engine && (
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {(engine as PublicEngine).capabilityCount} caps
            </span>
          )}
          {'enginesOrchestrated' in engine && (
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {(engine as PublicMetaEngine).enginesOrchestrated} engines
            </span>
          )}
          {'averageLatencyMs' in engine && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {(engine as PublicEngine).averageLatencyMs}ms
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            <div className={cn("text-sm font-bold", isShowcase ? "text-violet-400" : tierConfig.color)}>
              {isShowcase ? 'Platform' : tierConfig.priceLabel}
            </div>
          </div>
          {!isShowcase && (
            <Button
              size="sm"
              variant={engine.visibility === 'free' ? 'outline' : 'default'}
              className="gap-1 h-7 text-xs"
              asChild
            >
              {engine.visibility === 'free' ? (
                <a href="/os"><Play className="w-3 h-3" /> Run</a>
              ) : (
                <a href="/upgrade">Subscribe <ChevronRight className="w-3 h-3" /></a>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Grid Engine Card (FlipCard-powered) ───
function GridEngineCard({ engine, isShowcase = false, isMeta = false, index }: { engine: PublicEngine | PublicMetaEngine; isShowcase?: boolean; isMeta?: boolean; index: number }) {
  const tierConfig = TIER_DISPLAY[engine.visibility];
  const cat = findCategory(engine.category);
  const CatIcon = cat.icon;

  const accentBar = isShowcase
    ? "bg-gradient-to-r from-violet-500 to-purple-500"
    : isMeta ? "bg-gradient-to-r from-primary to-violet-500"
    : engine.visibility === 'free' ? "bg-emerald-500"
    : engine.visibility === 'standard' ? "bg-cyan-500"
    : "bg-violet-500";

  const borderCls = isShowcase
    ? "border-violet-500/25"
    : isMeta ? "border-primary/25"
    : "border-border";

  const capabilities = 'capabilities' in engine && Array.isArray((engine as any).capabilities)
    ? (engine as any).capabilities as string[]
    : [engine.description];

  const stats: { label: string; value: string; icon?: React.ReactNode }[] = [];
  if ('synergyMultiplier' in engine) stats.push({ label: '', value: `${engine.synergyMultiplier}x`, icon: <Sparkles className="w-3 h-3 text-amber-500" /> });
  if ('capabilityCount' in engine) stats.push({ label: 'caps', value: String((engine as PublicEngine).capabilityCount), icon: <Layers className="w-3 h-3" /> });
  if ('enginesOrchestrated' in engine) stats.push({ label: 'engines', value: String((engine as PublicMetaEngine).enginesOrchestrated), icon: <Cpu className="w-3 h-3" /> });

  return (
    <FlipCard
      className="h-[260px]"
      index={index}
      frontTitle={engine.name}
      frontSubtitle={engine.description}
      frontIcon={<CatIcon className={cn("w-5 h-5", cat.text)} />}
      frontBadge={isShowcase ? 'Internal' : isMeta ? 'Meta' : tierConfig.label}
      frontBadgeClass={isShowcase ? "text-violet-400 border-violet-500/30" : isMeta ? "border-primary/30 text-primary" : tierConfig.badge}
      frontAccentBar={accentBar}
      frontStats={stats}
      backCapabilities={capabilities}
      backPrice={isShowcase ? 'Platform' : tierConfig.priceLabel}
      backCta={isShowcase ? undefined : engine.visibility === 'free'
        ? { label: 'Run', href: '/os' }
        : { label: 'Subscribe', href: '/upgrade' }
      }
      borderClass={borderCls}
    />
  );
}

// ─── Unified item type for filtering ───
type UnifiedEngine = {
  engine: PublicEngine | PublicMetaEngine;
  kind: 'engine' | 'meta' | 'internal';
};

export default function EngineMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [engineType, setEngineType] = useState<EngineType>('all');
  const [viewMode, setViewMode] = useState<'browse' | 'grid'>('browse');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  const { tier: currentTier, subscribed, startCheckout, isLoading: subLoading } = useEngineSubscription();

  const handleSubscribe = useCallback(async (planId: SubscriptionPlan) => {
    if (planId === 'free') { window.location.href = '/auth?redirect=/upgrade'; return; }
    if (planId === 'enterprise') { window.location.href = 'mailto:Dev@CMPSBL.com?subject=Enterprise%20Subscription'; return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.info('Please sign in to subscribe'); window.location.href = `/auth?redirect=/upgrade&plan=${planId}`; return; }
    toast.info('Opening checkout...');
    const { data, error } = await supabase.functions.invoke('tier-checkout', { body: { tier: planId } });
    if (error) { toast.error('Checkout failed'); return; }
    if (data?.url) window.location.assign(data.url);
  }, []);

  // Load from registries
  const publicEngines = useMemo(() => getPublicEngines(), []);
  const publicMetaEngines = useMemo(() => getPublicMetaEngines(), []);
  const internalEngines = useMemo(() => getInternalEnginesShowcase(), []);
  const summary = useMemo(() => getCatalogSummary(), []);

  // Build unified list
  const allEngines = useMemo((): UnifiedEngine[] => {
    const engines: UnifiedEngine[] = publicEngines.map(e => ({ engine: e, kind: 'engine' as const }));
    const metas: UnifiedEngine[] = publicMetaEngines.map(e => ({ engine: e, kind: 'meta' as const }));
    const internals: UnifiedEngine[] = internalEngines.map(e => ({ engine: e, kind: 'internal' as const }));
    return [...engines, ...metas, ...internals];
  }, [publicEngines, publicMetaEngines, internalEngines]);

  // Filter
  const filteredEngines = useMemo(() => {
    return allEngines.filter(({ engine, kind }) => {
      if (engineType !== 'all') {
        if (engineType === 'engines' && kind !== 'engine') return false;
        if (engineType === 'meta' && kind !== 'meta') return false;
        if (engineType === 'internal' && kind !== 'internal') return false;
      }
      if (tierFilter !== 'all' && kind !== 'internal' && engine.visibility !== tierFilter) return false;
      if (selectedCategory && engine.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!engine.name.toLowerCase().includes(q) && !engine.description.toLowerCase().includes(q) && !engine.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allEngines, searchQuery, selectedCategory, tierFilter, engineType]);

  // Group by category for browse mode
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, UnifiedEngine[]> = {};
    filteredEngines.forEach(item => {
      const cat = item.engine.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredEngines]);

  const totalCount = allEngines.length;
  const engineCount = publicEngines.length;
  const metaCount = publicMetaEngines.length;
  const internalCount = internalEngines.length;

  return (
    <>
      <SEO
        title="AI Orchestration Engines | CMPSBL"
        description="Pre-validated orchestration engines for enterprise AI workloads. Canonized workflows built, tested, and maintained by CMPSBL engineering."
        canonical="https://cmpsbl.com/engines"
        image="https://cmpsbl.com/og/engines.jpg"
        keywords={["AI orchestration engines", "canonized workflows", "enterprise AI engines", "multi-provider routing", "agentic AI workflows"]}
        type="product"
        product={{ name: "CMPSBL Engine Subscription", price: "9", currency: "USD", availability: "InStock" }}
      />

      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        {/* Breadcrumb trail */}
        <div className="container mx-auto px-4 pt-20">
          <PublicBreadcrumb />
        </div>

        {/* ═══ HERO — Supreme drop announcement style (matching Store/Blog) ═══ */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />

          <div className="relative container mx-auto px-4 py-14 md:py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Top pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 mb-6 text-xs font-medium text-muted-foreground">
                <Crown className="w-3 h-3 text-primary" />
                OFFICIAL ENGINE REGISTRY
              </div>

              {/* Supreme-style stacked type */}
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-4">
                <motion.span
                  className="block font-mono uppercase tracking-[-0.05em]"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Cognitive
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-primary via-[hsl(var(--neon-cyan))] to-primary bg-clip-text text-transparent font-mono uppercase tracking-[-0.05em]"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Engines
                </motion.span>
              </h1>

              {/* Counter badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4, type: 'spring' }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
              >
                <motion.span className="font-mono font-black text-2xl sm:text-3xl text-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  {summary.totalEngines}+
                </motion.span>
                <span className="text-sm text-muted-foreground font-medium">Engines</span>
              </motion.div>

              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-4">
                Production-ready, governed orchestrations with persistence and SLAs.
              </p>
              <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto mb-8">
                Subscribe to unlock versioned, self-monitoring cognitive engines. Free tier includes {summary.freeEngines} engines.
              </p>

              {/* Stats pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  { label: 'Engines', count: String(summary.publicEngines), color: 'bg-cyan-500' },
                  { label: 'Meta-Engines', count: String(summary.publicMetaEngines), color: 'bg-violet-500' },
                  { label: 'Free Tier', count: String(summary.freeEngines), color: 'bg-emerald-500' },
                  { label: 'Self-Improvement', count: String(internalCount), color: 'bg-amber-500' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className={cn("w-2 h-2 rounded-full", stat.color)} />
                    <span className="font-black text-lg">{stat.count}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ PRICING PLANS (collapsible on mobile) ═══ */}
        <section className="border-b border-border/50 bg-gradient-to-b from-card/50 to-background">
          <div className="container mx-auto px-4 py-10">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4">Choose Your Access Level</h2>

            {/* Billing toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all", billingInterval === 'monthly' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >Monthly</button>
                <button
                  onClick={() => setBillingInterval('annual')}
                  className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5", billingInterval === 'annual' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  Annual
                  <Badge variant="secondary" className="bg-[hsl(var(--system-green))]/20 text-[hsl(var(--system-green))] text-[10px] px-1.5 py-0">Save 17%</Badge>
                </button>
              </div>
            </div>

            {/* Plans grid — stacks on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 sm:pt-0">
              {Object.values(SUBSCRIPTION_PLANS).map((plan, index) => {
                const displayPrice = billingInterval === 'annual' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative p-4 rounded-xl border transition-all overflow-visible",
                      plan.id === 'creator'
                        ? "border-primary bg-gradient-to-br from-primary/10 to-violet-500/10 ring-2 ring-primary/30 shadow-lg shadow-primary/10 mt-6 sm:mt-0"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    {plan.id === 'creator' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-primary text-primary-foreground shadow-lg whitespace-nowrap">
                          <Star className="w-3 h-3 mr-1" /> Most Popular
                        </Badge>
                      </div>
                    )}

                    <div className={cn(plan.id === 'creator' ? "pt-2" : "")}>
                      <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-2xl font-black">{displayPrice === 0 ? 'Free' : `$${displayPrice}`}</span>
                        {displayPrice > 0 && <span className="text-muted-foreground text-xs">/mo</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>

                      <ul className="space-y-1.5 mb-4">
                        {plan.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={plan.id === 'creator' ? 'default' : 'outline'}
                        size="sm"
                        disabled={currentTier === plan.id || subLoading}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {currentTier === plan.id ? 'Current Plan' : plan.id === 'free' ? 'Get Started Free' : plan.id === 'enterprise' ? 'Contact Sales' : 'Subscribe Now'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ STICKY TOOLBAR (matching Store/Blog) ═══ */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${totalCount}+ engines...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl bg-card border-border"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Type tabs + tier filter + view toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {([
                  { id: 'all' as EngineType, label: 'All', count: totalCount },
                  { id: 'engines' as EngineType, label: 'Engines', count: engineCount },
                  { id: 'meta' as EngineType, label: 'Meta', count: metaCount },
                  { id: 'internal' as EngineType, label: 'Internal', count: internalCount },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setEngineType(tab.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                      engineType === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tab.label}
                    <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Tier filter + view toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex gap-1 border-r border-border/50 pr-2 mr-1">
                  {([
                    { id: 'all' as TierFilter, label: 'All Tiers' },
                    { id: 'free' as TierFilter, label: 'Free' },
                    { id: 'standard' as TierFilter, label: 'Creator' },
                    { id: 'advanced' as TierFilter, label: 'Architect' },
                  ]).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTierFilter(t.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all",
                        tierFilter === t.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >{t.label}</button>
                  ))}
                </div>

                <div className="hidden md:flex gap-1">
                  <button
                    onClick={() => setViewMode('browse')}
                    className={cn("p-2 rounded-lg transition-colors", viewMode === 'browse' ? 'bg-muted' : 'hover:bg-muted/50')}
                    title="Category browse"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50')}
                    title="Grid view"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category pills — horizontal scroll */}
          <div className="border-t border-border/30">
            <div className="container mx-auto px-4 py-2.5">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pr-8" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0",
                    !selectedCategory
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  All Categories
                </button>
                {ENGINE_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const hasItems = !!groupedByCategory[cat.id]?.length;
                  if (!hasItems && selectedCategory !== cat.id) return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0 flex items-center gap-1.5",
                        selectedCategory === cat.id
                          ? cn(cat.bg, cat.text, cat.border)
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CONTENT ═══ */}
        <main className="flex-1">
          {/* Results count */}
          <div className="container mx-auto px-4 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredEngines.length} engines
                {tierFilter !== 'all' && <> · <span className="text-foreground font-medium capitalize">{tierFilter === 'standard' ? 'Creator' : tierFilter === 'advanced' ? 'Architect' : tierFilter}</span> tier</>}
                {searchQuery && <> matching "<span className="text-foreground font-medium">{searchQuery}</span>"</>}
              </p>
              {(tierFilter !== 'all' || searchQuery || selectedCategory || engineType !== 'all') && (
                <button
                  onClick={() => { setTierFilter('all'); setSearchQuery(''); setSelectedCategory(null); setEngineType('all'); }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Browse Mode: Horizontal carousels per category */}
          {(viewMode === 'browse' && !searchQuery && !selectedCategory) ? (
            <div className="pb-12">
              {/* Internal engines banner (if showing) */}
              {engineType !== 'engines' && engineType !== 'meta' && groupedByCategory['evolution']?.some(e => e.kind === 'internal') && null}

              {ENGINE_CATEGORIES.filter(cat => groupedByCategory[cat.id]?.length).map(cat => {
                const items = groupedByCategory[cat.id] || [];
                const Icon = cat.icon;

                return (
                  <section key={cat.id} className="mb-8">
                    <div className="container mx-auto px-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.bg)}>
                            <Icon className={cn("w-4 h-4", cat.text)} />
                          </div>
                          <div>
                            <h2 className="font-bold text-lg">{cat.label}</h2>
                            <p className="text-xs text-muted-foreground">{items.length} engines</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedCategory(cat.id); setViewMode('grid'); }}
                          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                        >
                          View all <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="container mx-auto px-4">
                      <ScrollCarousel>
                        {items.slice(0, 20).map(({ engine, kind }, i) => (
                          <EngineCard
                            key={`${kind}-${engine.id}-${i}`}
                            engine={engine}
                            isShowcase={kind === 'internal'}
                            isMeta={kind === 'meta'}
                          />
                        ))}
                        {items.length > 20 && (
                          <div
                            className="snap-start shrink-0 w-[200px] rounded-xl border border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/30 transition-colors"
                            onClick={() => { setSelectedCategory(cat.id); setViewMode('grid'); }}
                          >
                            <div className="text-center p-4">
                              <p className="font-bold text-lg text-primary">+{items.length - 20}</p>
                              <p className="text-xs text-muted-foreground">View all</p>
                            </div>
                          </div>
                        )}
                      </ScrollCarousel>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            /* Grid Mode */
            <div className="container mx-auto px-4 py-6">
              {filteredEngines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredEngines.map(({ engine, kind }, i) => (
                    <GridEngineCard
                      key={`${kind}-${engine.id}-${i}`}
                      engine={engine}
                      isShowcase={kind === 'internal'}
                      isMeta={kind === 'meta'}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No engines found</h3>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setTierFilter('all'); setEngineType('all'); }}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Free CTA Section */}
          <section className="border-t border-border/50 bg-card/30">
            <div className="container mx-auto px-4 py-12 md:py-16 text-center">
              <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-500">
                <Gift className="w-3 h-3 mr-1" />
                Free Tier Included
              </Badge>
              <h2 className="text-2xl md:text-3xl font-black mb-3">Explore Free Resources</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Templates, pipelines, memory, and CodeLab are included in the free tier.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link to="/explore"><Package className="w-4 h-4" /> Composable Artifacts</Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link to="/explore"><Layers className="w-4 h-4" /> Explore Pipelines</Link>
                </Button>
                <Button size="lg" asChild className="gap-2">
                  <Link to="/docs/persistent-memory"><Brain className="w-4 h-4" /> Add Persistent Memory <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
}
