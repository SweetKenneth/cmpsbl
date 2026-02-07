/**
 * Engine Marketplace — Real Registry-Driven Subscription Commerce
 * v8.1.0 — All 62 engines + 20 meta-engines from live registries
 * Self-improvement engines = internal (showcased, not sold)
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

export default function EngineMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<EngineVisibility | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'engines' | 'meta' | 'internal'>('engines');

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

  return (
    <>
      <SEO
        title={`Engine Marketplace | ${summary.totalEngines} Engines | CMPSBL`}
        description="Production-ready cognitive engines with subscription access. 62 engines, 20 meta-engines, real pricing."
        keywords={["cognitive engines", "AI orchestration", "subscription", "enterprise AI"]}
      />

      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        {/* Hero */}
        <section className="relative py-16 md:py-20 border-b border-border/50 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              v8.1.0 — {summary.totalEngines} Engines · {summary.totalMetaEngines} Meta-Engines
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Engine Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Subscription access to production-ready orchestration engines.
              Capabilities, templates, and pipelines are free — engines are the products.
            </p>
            
            {/* What is an Engine */}
            <div className="max-w-3xl mx-auto p-4 rounded-xl bg-muted/50 border border-border/50 mb-6">
              <div className="flex items-start gap-3 text-left">
                <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">What is an Engine?</h3>
                  <p className="text-sm text-muted-foreground">
                    Engines are <strong>governed orchestrations</strong> that combine multiple capabilities into reliable, versioned workflows. 
                    Meta-engines compose engines for even more sophisticated pipelines. 
                    Self-improvement engines run internally to evolve the platform — they're showcased but not sold.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="border-b border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-xl font-bold text-center mb-6">Subscription Plans</h2>
            <div className="grid gap-4 md:grid-cols-4">
              {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "p-5 rounded-xl border transition-all",
                    plan.id === 'pro' 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30" 
                      : "border-border bg-card"
                  )}
                >
                  {plan.id === 'pro' && (
                    <Badge className="mb-2 bg-primary text-primary-foreground">Most Popular</Badge>
                  )}
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="mt-2 mb-3">
                    <span className="text-3xl font-bold">
                      {plan.monthlyPrice === 0 ? 'Free' : `$${plan.monthlyPrice}`}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-sm text-muted-foreground">/mo</span>
                    )}
                  </div>
                  {plan.yearlyPrice > 0 && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-emerald-500 mb-3">
                      ${plan.yearlyPrice}/yr (~2 months free)
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.id === 'pro' ? 'default' : 'outline'}
                    size="sm"
                  >
                    {plan.id === 'starter' ? 'Get Started' : plan.id === 'enterprise' ? 'Request Access' : 'Subscribe'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search engines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={categoryFilter || ''}
                  onChange={(e) => setCategoryFilter(e.target.value || null)}
                  className="h-11 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as EngineVisibility | 'all')}
                  className="h-11 px-3 rounded-md border bg-background text-sm"
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="mb-6">
              <TabsTrigger value="engines" className="gap-2">
                <Cpu className="w-4 h-4" />
                Engines ({summary.publicEngines})
              </TabsTrigger>
              <TabsTrigger value="meta" className="gap-2">
                <Layers className="w-4 h-4" />
                Meta-Engines ({summary.publicMetaEngines})
              </TabsTrigger>
              <TabsTrigger value="internal" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Platform Self-Improvement
              </TabsTrigger>
            </TabsList>

            {/* Engines Tab */}
            <TabsContent value="engines">
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredEngines.length} of {summary.publicEngines} engines
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredEngines.map((engine) => (
                  <EngineCard key={engine.id} engine={engine} />
                ))}
              </div>
              {filteredEngines.length === 0 && (
                <EmptyState message="No engines match your filters" />
              )}
            </TabsContent>

            {/* Meta-Engines Tab */}
            <TabsContent value="meta">
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredMetaEngines.length} of {summary.publicMetaEngines} meta-engines
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMetaEngines.map((meta) => (
                  <MetaEngineCard key={meta.id} meta={meta} />
                ))}
              </div>
              {filteredMetaEngines.length === 0 && (
                <EmptyState message="No meta-engines match your search" />
              )}
            </TabsContent>

            {/* Internal Showcase Tab */}
            <TabsContent value="internal">
              <div className="max-w-3xl mx-auto mb-8 p-6 rounded-xl bg-violet-500/10 border border-violet-500/30">
                <div className="flex items-start gap-4">
                  <RefreshCw className="w-8 h-8 text-violet-400 shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Platform Self-Improvement</h3>
                    <p className="text-muted-foreground">
                      These engines run <strong>inside the platform</strong> to continuously evolve and improve the system.
                      They're showcased here so you understand how CMPSBL maintains itself — but they're not purchasable.
                      The platform self-improves; you benefit automatically.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {internalEngines.map((engine) => (
                  <EngineCard key={engine.id} engine={engine} isShowcase />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Free CTA */}
        <section className="border-t border-border/50 bg-muted/30">
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Explore Free First</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Capabilities, templates, and pipelines are all FREE for exploration.
              Engines are the only products — everything else is adoption fuel.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/capabilities">
                  <Zap className="w-4 h-4 mr-2" />
                  Free Capabilities
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/marketplace">
                  <Package className="w-4 h-4 mr-2" />
                  Free Templates
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/synergies">
                  <Layers className="w-4 h-4 mr-2" />
                  Free Pipelines
                </Link>
              </Button>
              <Button asChild>
                <Link to="/docs/persistent-memory">
                  <Brain className="w-4 h-4 mr-2" />
                  Add Persistent Memory (FREE)
                </Link>
              </Button>
            </div>
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
        "group p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all",
        isShowcase && "border-violet-500/30 bg-violet-500/5"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-muted", tierConfig.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] capitalize">
            {engine.category}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px]", tierConfig.badge)}>
            {isShowcase ? 'Internal' : tierConfig.label}
          </Badge>
        </div>
      </div>

      <h3 className="font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
        {engine.name}
      </h3>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {engine.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {engine.synergyMultiplier}x synergy
        </span>
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {engine.capabilityCount} caps
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div>
          <div className={cn("text-lg font-bold", tierConfig.color)}>
            {isShowcase ? 'Platform' : tierConfig.priceLabel}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {isShowcase ? 'Self-improvement' : `${engine.requiredPlan} plan`}
          </div>
        </div>
        {!isShowcase && (
          <Button size="sm" variant={engine.visibility === 'free' ? 'outline' : 'default'} className="gap-1">
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
    <div className="group p-5 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-all ring-1 ring-primary/10">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            <Layers className="w-2.5 h-2.5 mr-1" />
            Meta
          </Badge>
          <Badge variant="outline" className={cn("text-[10px]", tierConfig.badge)}>
            {tierConfig.label}
          </Badge>
        </div>
      </div>

      <h3 className="font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
        {meta.name}
      </h3>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {meta.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {meta.compoundSynergyMultiplier}x compound
        </span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          {meta.enginesOrchestrated} engines
        </span>
      </div>

      {/* Use cases */}
      <div className="flex flex-wrap gap-1 mb-4">
        {meta.useCases.slice(0, 2).map((uc, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {uc}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div>
          <div className={cn("text-lg font-bold", tierConfig.color)}>
            {tierConfig.priceLabel}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {meta.requiredPlan} plan
          </div>
        </div>
        <Button size="sm" className="gap-1">
          Subscribe
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <Terminal className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      <p className="text-muted-foreground">Try adjusting your search or filter</p>
    </div>
  );
}
