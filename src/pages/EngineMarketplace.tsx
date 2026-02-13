/**
 * Engine Marketplace (OEM) — Premium Registry-Driven Subscription Commerce
 * v9.1.0 ARCHITECT — All 76 engines + 24 meta-engines from live registries
 * Self-improvement engines = internal (showcased, not sold)
 * 
 * UNIQUE DESIGN: Cinematic, premium, completely distinctive to CMPSBL
 */

import { useState, useMemo, useCallback } from "react";
import { useEngineSubscription } from "@/hooks/useEngineSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Terminal,
  Shield,
  Zap,
  Brain,
  Search,
  Crown,
  Check,
  Layers,
  Sparkles,
  Info,
  Package,
  Network,
  ArrowRight,
  Cpu,
  Eye,
  Lock,
  RefreshCw,
  Radio,
  Plug,
  BarChart,
  Heart,
  BookOpen,
  Bot,
  Palette,
  Wallet,
  GitBranch,
  Rocket,
  ChevronRight,
  Play,
  Gift,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import from real registries
import {
  getPublicEngines,
  getPublicMetaEngines,
  getInternalEnginesShowcase,
  getEngineCategories,
  getCatalogSummary,
  type PublicEngine,
  type PublicMetaEngine,
} from "@/lib/engines/publicCatalog";
import {
  SUBSCRIPTION_PLANS,
  TIER_DISPLAY,
  ENGINE_CATEGORY_CONFIG,
  type EngineVisibility,
  type SubscriptionPlan,
} from "@/lib/commerce/enginePricing";

// Icon mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  cognitive: Brain,
  operational: Zap,
  intelligence: Sparkles,
  governance: Shield,
  security: Lock,
  evolution: RefreshCw,
  communication: Radio,
  integration: Plug,
  analytics: BarChart,
  experience: Heart,
  knowledge: BookOpen,
  autonomy: Bot,
  creativity: Palette,
  perception: Eye,
  resource: Wallet,
  workflow: GitBranch,
  enhancement: Rocket,
  protection: Shield,
  performance: Zap,
  self_management: Bot,
  workflow_orchestration: Network,
};

function getCategoryIcon(category: string): React.ElementType {
  return CATEGORY_ICONS[category] || Cpu;
}

// Floating particle background
function FloatingParticle({ delay, x, hue }: { delay: number; x: number; hue: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 4,
        height: 4,
        left: `${x}%`,
        bottom: 0,
        background: `hsl(${hue} 70% 60%)`,
        boxShadow: `0 0 12px hsl(${hue} 70% 60% / 0.5)`,
      }}
      animate={{
        y: [0, -400, -700],
        opacity: [0, 0.7, 0],
        scale: [0.5, 1.2, 0.3],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

export default function EngineMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<EngineVisibility | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'engines' | 'meta' | 'internal'>('engines');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  
  // Subscription management
  const { tier: currentTier, subscribed, startCheckout, isLoading: subLoading } = useEngineSubscription();
  
  const handleSubscribe = useCallback(async (planId: SubscriptionPlan) => {
    if (planId === 'starter') {
      // Redirect to sign up for free tier
      window.location.href = '/auth?redirect=/engines';
      return;
    }
    if (planId === 'enterprise') {
      window.location.href = 'mailto:enterprise@cmpsbl.ai?subject=Enterprise%20Engine%20Subscription';
      return;
    }
    
    // Check if user is authenticated before checkout
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info('Please sign in to subscribe');
      window.location.href = `/auth?redirect=/engines&plan=${planId}&interval=${billingInterval}`;
      return;
    }
    
    await startCheckout(planId as 'builder' | 'pro', billingInterval);
  }, [startCheckout, billingInterval]);

  // Load from real registries
  const publicEngines = useMemo(() => getPublicEngines(), []);
  const publicMetaEngines = useMemo(() => getPublicMetaEngines(), []);
  const internalEngines = useMemo(() => getInternalEnginesShowcase(), []);
  const categories = useMemo(() => getEngineCategories(), []);
  const summary = useMemo(() => getCatalogSummary(), []);

  // Filter engines
  const filteredEngines = useMemo(() => {
    return publicEngines.filter((engine) => {
      if (visibilityFilter !== 'all' && engine.visibility !== visibilityFilter) return false;
      if (categoryFilter && engine.category !== categoryFilter) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        engine.name.toLowerCase().includes(query) ||
        engine.description.toLowerCase().includes(query) ||
        engine.category.toLowerCase().includes(query)
      );
    });
  }, [publicEngines, searchQuery, categoryFilter, visibilityFilter]);

  // Filter meta-engines
  const filteredMetaEngines = useMemo(() => {
    return publicMetaEngines.filter((meta) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        meta.name.toLowerCase().includes(query) ||
        meta.description.toLowerCase().includes(query)
      );
    });
  }, [publicMetaEngines, searchQuery]);

  // Particles data
  const particles = useMemo(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      delay: i * 0.4,
      x: 5 + Math.random() * 90,
      hue: [260, 185, 145, 340][Math.floor(Math.random() * 4)],
    })), []
  );

  return (
    <>
      <SEO
        title={`Cognitive Engine Marketplace | ${summary.totalEngines}+ Production AI Engines | CMPSBL®`}
        description="Subscribe to production-ready cognitive engines for AI orchestration. 62+ engines, 20 meta-engines, enterprise pricing. Multi-provider routing, persistent memory, self-improvement."
        canonical="https://cmpsbl.com/engines"
        keywords={["cognitive engines", "AI orchestration", "subscription AI", "enterprise AI engines", "multi-provider routing", "AI marketplace", "production AI", "CMPSBL engines"]}
        type="product"
        product={{
          name: "CMPSBL Engine Subscription",
          price: "49",
          currency: "USD",
          availability: "InStock"
        }}
      />

      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        {/* Cinematic Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <motion.div
            className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
            }}
            animate={{
              x: [-150, 100, -150],
              y: [-150, 50, -150],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(280 70% 50% / 0.1) 0%, transparent 50%)",
            }}
            animate={{
              x: [100, -50, 100],
              y: [100, -30, 100],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p, i) => (
              <FloatingParticle key={i} {...p} />
            ))}
          </div>

          <div className="container relative mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Premium badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/10 to-violet-500/15 backdrop-blur-md mb-8 shadow-xl shadow-primary/10"
              >
                <Crown className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-foreground">Official Engine Marketplace</span>
                <div className="flex items-center gap-1.5 pl-3 border-l border-primary/30">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-emerald-500"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-xs font-semibold text-emerald-500">v8.1.0</span>
                </div>
              </motion.div>

              {/* Main headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6"
              >
                <span className="text-foreground">Production-Ready</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
                  Cognitive Engines
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
              >
                {summary.totalEngines} engines orchestrating {summary.totalCapabilities}+ capabilities.
                Subscribe to unlock governed, versioned, production-grade orchestration.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-3xl mx-auto mb-10"
              >
                {[
                  { value: summary.publicEngines, label: "Engines", icon: Cpu, color: "text-cyan-500" },
                  { value: summary.publicMetaEngines, label: "Meta-Engines", icon: Layers, color: "text-violet-500" },
                  { value: summary.freeEngines, label: "Free Tier", icon: Gift, color: "text-emerald-500" },
                  { value: `${Math.round((summary.advancedEngines / summary.publicEngines) * 100)}%`, label: "Pro Coverage", icon: Crown, color: "text-amber-500" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="relative p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all"
                  >
                    <stat.icon className={cn("w-5 h-5 mb-2 mx-auto", stat.color)} />
                    <div className="text-2xl md:text-3xl font-black text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Free reminder */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-8"
              >
                <Gift className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-foreground">
                  <strong>Remember:</strong> Templates, Pipelines, Memory, CodeLab — all <span className="text-emerald-500 font-bold">FREE</span>
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Plans - Stacked on mobile, grid on desktop */}
        <section className="border-y border-border/50 bg-gradient-to-b from-card/50 to-background">
          <div className="container mx-auto px-4 py-12">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-center mb-4"
            >
              Choose Your Access Level
            </motion.h2>
            
            {/* Billing interval toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    billingInterval === 'monthly'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('annual')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    billingInterval === 'annual'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Annual
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 text-[10px] px-1.5 py-0">
                    Save 17%
                  </Badge>
                </button>
              </div>
            </div>
            
            {/* Mobile: Extra top margin for badge, Desktop: 4-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 sm:pt-0">
              {Object.values(SUBSCRIPTION_PLANS).map((plan, index) => {
                const displayPrice = billingInterval === 'annual' 
                  ? Math.round(plan.yearlyPrice / 12)
                  : plan.monthlyPrice;
                  
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative p-5 sm:p-6 rounded-2xl border transition-all overflow-visible",
                      plan.id === 'pro' 
                        ? "border-primary bg-gradient-to-br from-primary/10 to-violet-500/10 ring-2 ring-primary/30 shadow-xl shadow-primary/10 mt-8 sm:mt-0" 
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    {plan.id === 'pro' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-primary text-primary-foreground shadow-lg whitespace-nowrap">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <div className={cn(plan.id === 'pro' ? "pt-3" : "pt-1")}>
                      <h3 className="font-bold text-lg sm:text-xl mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl sm:text-4xl font-black">
                          {displayPrice === 0 ? 'Free' : `$${displayPrice}`}
                        </span>
                        {displayPrice > 0 && (
                          <span className="text-muted-foreground text-sm">/mo</span>
                        )}
                      </div>
                      {billingInterval === 'annual' && plan.yearlyPrice > 0 && (
                        <p className="text-sm text-emerald-500 mb-3">
                          ${plan.yearlyPrice}/yr billed annually
                        </p>
                      )}
                      {billingInterval === 'monthly' && plan.yearlyPrice > 0 && plan.monthlyPrice > 0 && (
                        <p className="text-sm text-muted-foreground mb-3">
                          or ${plan.yearlyPrice}/yr (save ~17%)
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      
                      <ul className="space-y-2 mb-5">
                        {plan.features.slice(0, 5).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full" 
                        variant={plan.id === 'pro' ? 'default' : 'outline'}
                        size="default"
                        disabled={currentTier === plan.id || subLoading}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {currentTier === plan.id 
                          ? 'Current Plan' 
                          : plan.id === 'starter' 
                            ? 'Get Started Free' 
                            : plan.id === 'enterprise' 
                              ? 'Contact Sales' 
                              : 'Subscribe Now'}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What is an Engine - Educational */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/20"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Info className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-3">What is an Engine?</h3>
                <p className="text-muted-foreground mb-4">
                  Engines are <strong className="text-foreground">governed orchestrations</strong> that combine multiple capabilities into reliable, versioned workflows. 
                  They're not just scripts — they're production-hardened, self-monitoring, and designed for enterprise deployment.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Shield, title: "Governed", desc: "Versioned, auditable, compliant" },
                    { icon: Zap, title: "Optimized", desc: "Batched ops, shared context" },
                    { icon: Lock, title: "Protected", desc: "Hard to replicate IP" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Search & Filters */}
        <section className="sticky top-16 z-40 border-y border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search engines by name, category, or capability..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={categoryFilter || ''}
                  onChange={(e) => setCategoryFilter(e.target.value || null)}
                  className="h-12 px-4 rounded-lg border bg-background text-sm font-medium"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as EngineVisibility | 'all')}
                  className="h-12 px-4 rounded-lg border bg-background text-sm font-medium"
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="standard">Builder ($49/mo)</option>
                  <option value="advanced">Pro ($149/mo)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-8 p-1 h-auto bg-muted/50 rounded-xl">
              <TabsTrigger value="engines" className="gap-2 py-3 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Cpu className="w-4 h-4" />
                <span className="hidden sm:inline">Engines</span> ({summary.publicEngines})
              </TabsTrigger>
              <TabsTrigger value="meta" className="gap-2 py-3 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Meta-Engines</span> ({summary.publicMetaEngines})
              </TabsTrigger>
              <TabsTrigger value="internal" className="gap-2 py-3 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Self-Improvement</span>
              </TabsTrigger>
            </TabsList>

            {/* Engines Tab */}
            <TabsContent value="engines">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <strong className="text-foreground">{filteredEngines.length}</strong> of {summary.publicEngines} engines
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEngines.map((engine, i) => (
                  <motion.div
                    key={engine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  >
                    <EngineCard engine={engine} />
                  </motion.div>
                ))}
              </div>
              {filteredEngines.length === 0 && (
                <EmptyState message="No engines match your filters" />
              )}
            </TabsContent>

            {/* Meta-Engines Tab */}
            <TabsContent value="meta">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <strong className="text-foreground">{filteredMetaEngines.length}</strong> of {summary.publicMetaEngines} meta-engines
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMetaEngines.map((meta, i) => (
                  <motion.div
                    key={meta.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <MetaEngineCard meta={meta} />
                  </motion.div>
                ))}
              </div>
              {filteredMetaEngines.length === 0 && (
                <EmptyState message="No meta-engines match your search" />
              )}
            </TabsContent>

            {/* Internal Showcase Tab */}
            <TabsContent value="internal">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto mb-10 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-primary/5 border border-violet-500/30"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-7 h-7 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Platform Self-Improvement</h3>
                    <p className="text-muted-foreground">
                      These engines run <strong className="text-foreground">inside the platform</strong> to continuously evolve and improve the system.
                      They're showcased here so you understand how CMPSBL maintains itself — but they're not purchasable.
                      The platform self-improves; you benefit automatically.
                    </p>
                  </div>
                </div>
              </motion.div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {internalEngines.map((engine, i) => (
                  <motion.div
                    key={engine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <EngineCard engine={engine} isShowcase />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Free CTA Section */}
        <section className="border-t border-border/50 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-500">
                <Gift className="w-3 h-3 mr-1" />
                100% Free
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Free First</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                Templates, pipelines, memory, and CodeLab are all FREE for exploration.
                Engines are the only products — everything else is adoption fuel.
              </p>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link to="/capabilities">
                    <Zap className="w-4 h-4" />
                    Free Capabilities
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link to="/marketplace">
                    <Package className="w-4 h-4" />
                    Free Templates
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link to="/synergies">
                    <Layers className="w-4 h-4" />
                    Free Pipelines
                  </Link>
                </Button>
                <Button size="lg" asChild className="gap-2">
                  <Link to="/docs/persistent-memory">
                    <Brain className="w-4 h-4" />
                    Add Persistent Memory
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function EngineCard({ engine, isShowcase = false }: { engine: PublicEngine; isShowcase?: boolean }) {
  const Icon = getCategoryIcon(engine.category);
  const tierConfig = TIER_DISPLAY[engine.visibility];

  return (
    <div
      className={cn(
        "group h-full p-5 rounded-xl border transition-all duration-300",
        isShowcase 
          ? "border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-transparent hover:border-violet-500/50" 
          : "border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
          isShowcase ? "bg-violet-500/15 text-violet-400" : "bg-primary/10 text-primary"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] capitalize px-2">
            {engine.category}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px] px-2", tierConfig.badge)}>
            {isShowcase ? 'Internal' : tierConfig.label}
          </Badge>
        </div>
      </div>

      <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
        {engine.name}
      </h3>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {engine.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {engine.synergyMultiplier}x
        </span>
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {engine.capabilityCount} caps
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {engine.averageLatencyMs}ms
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div>
          <div className={cn("text-lg font-bold", isShowcase ? "text-violet-400" : tierConfig.color)}>
            {isShowcase ? 'Platform' : tierConfig.priceLabel}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {isShowcase ? 'Self-improvement' : `${engine.requiredPlan} plan`}
          </div>
        </div>
        {!isShowcase && (
          <Button size="sm" variant={engine.visibility === 'free' ? 'outline' : 'default'} className="gap-1 h-8">
            {engine.visibility === 'free' ? (
              <>
                <Play className="w-3 h-3" />
                Run
              </>
            ) : (
              <>
                Subscribe
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function MetaEngineCard({ meta }: { meta: PublicMetaEngine }) {
  const Icon = getCategoryIcon(meta.category);
  const tierConfig = TIER_DISPLAY[meta.visibility];

  return (
    <div className="group h-full p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/15 text-primary group-hover:scale-110 transition-all">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary px-2">
            <Layers className="w-2.5 h-2.5 mr-1" />
            Meta
          </Badge>
          <Badge variant="outline" className={cn("text-[10px] px-2", tierConfig.badge)}>
            {tierConfig.label}
          </Badge>
        </div>
      </div>

      <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
        {meta.name}
      </h3>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {meta.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {meta.compoundSynergyMultiplier}x compound
        </span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          {meta.enginesOrchestrated} engines
        </span>
      </div>

      {/* Use cases */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {meta.useCases.slice(0, 2).map((uc, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {uc}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div>
          <div className={cn("text-lg font-bold", tierConfig.color)}>
            {tierConfig.priceLabel}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {meta.requiredPlan} plan
          </div>
        </div>
        <Button size="sm" className="gap-1 h-8">
          Subscribe
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <Terminal className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
    </motion.div>
  );
}
