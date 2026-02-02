/**
 * Capabilities Depot — Main Page
 * Marketplace surface for downloadable capability artifacts
 * v1.3.1 — Performance Optimized
 */

import { useState, useMemo, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Package, 
  FileText,
  Brain,
  Zap,
  Shield,
  Settings,
  Accessibility,
  TrendingUp,
  ChevronDown,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { CapabilityCard } from '@/components/depot/CapabilityCard';
import { DepotSEO } from '@/components/depot/DepotSEO';
import {
  filterCapabilities,
  getCategoryStats,
  getTotalCapabilityCount,
  PRICING_TIERS,
  type CapabilityCategory,
  type ExecutorType,
  type PricingTier,
  type CapabilityFilters,
} from '@/lib/capabilities/depot';
import { cn } from '@/lib/utils';

// Lazy load the disclaimer modal
const DepotDisclaimer = lazy(() => import('@/components/depot/DepotDisclaimer').then(m => ({ default: m.DepotDisclaimer })));

// Category config with icons - static color classes for production build
const CATEGORY_CONFIG: Record<CapabilityCategory, { icon: typeof Brain; label: string; colorClass: string }> = {
  intelligence: { icon: Brain, label: 'Intelligence', colorClass: 'bg-cyan-500/10 text-cyan-500' },
  optimization: { icon: TrendingUp, label: 'Optimization', colorClass: 'bg-emerald-500/10 text-emerald-500' },
  resilience: { icon: Zap, label: 'Resilience', colorClass: 'bg-amber-500/10 text-amber-500' },
  security: { icon: Shield, label: 'Security', colorClass: 'bg-rose-500/10 text-rose-500' },
  accessibility: { icon: Accessibility, label: 'Accessibility', colorClass: 'bg-violet-500/10 text-violet-500' },
  automation: { icon: Settings, label: 'Automation', colorClass: 'bg-blue-500/10 text-blue-500' },
  orchestration: { icon: Layers, label: 'Orchestration', colorClass: 'bg-purple-500/10 text-purple-500' },
};

const EXECUTOR_LABELS: Record<ExecutorType, string> = {
  js: 'JavaScript',
  edge: 'Edge Function',
  wasm: 'WebAssembly',
  container: 'Container',
};

export default function CapabilitiesDepotPage() {
  const [filters, setFilters] = useState<CapabilityFilters>({
    sortBy: 'downloads',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Memoize expensive calculations
  const categoryStats = useMemo(() => getCategoryStats(), []);
  const totalCount = useMemo(() => getTotalCapabilityCount(), []);

  const capabilities = useMemo(() => {
    return filterCapabilities({
      ...filters,
      search: searchQuery || undefined,
    });
  }, [filters, searchQuery]);

  const updateFilter = <K extends keyof CapabilityFilters>(
    key: K, 
    value: CapabilityFilters[K] | undefined
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      <DepotSEO totalCount={totalCount} />

      <PublicNav />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section — Lightweight Performance Optimized */}
        <section className="relative overflow-hidden border-b border-border/50">
          {/* Static gradient background - no animations */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />

          {/* Static decorative orbs - CSS only, no JS animation */}
          <div className="absolute -top-20 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-primary/15 via-cyan-500/5 to-transparent blur-2xl opacity-50" />
          <div className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-500/10 to-transparent blur-2xl opacity-40" />

          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              {/* Premium badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/10 to-cyan-500/15 backdrop-blur-sm mb-8 shadow-lg shadow-primary/10">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                  {totalCount}+ Cognitive Artifacts
                </span>
                <span className="w-px h-4 bg-border/50" />
                <span className="text-xs text-muted-foreground">v1.3.1</span>
              </div>

              {/* Main headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6">
                <span className="text-foreground">Capabilities</span>
                <br className="sm:hidden" />
                <span className="ml-2 sm:ml-4 bg-gradient-to-r from-primary via-cyan-400 to-violet-500 bg-clip-text text-transparent">
                  Depot
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                Licensed cognitive capabilities for{' '}
                <span className="text-foreground font-medium">local execution</span>.{' '}
                Download, integrate, and run in{' '}
                <span className="text-foreground font-medium">your own infrastructure</span>.
              </p>

              {/* Stats - static, no animations */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
                <div className="px-5 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="text-2xl md:text-3xl font-black text-primary">{totalCount}</div>
                  <div className="text-xs text-muted-foreground">Capabilities</div>
                </div>
                <div className="px-5 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="text-2xl md:text-3xl font-black text-cyan-500">7</div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </div>
                <div className="px-5 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="text-2xl md:text-3xl font-black text-violet-500">4</div>
                  <div className="text-xs text-muted-foreground">Tiers</div>
                </div>
                <div className="px-5 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="text-2xl md:text-3xl font-black text-emerald-500">$19</div>
                  <div className="text-xs text-muted-foreground">Starting</div>
                </div>
              </div>

              {/* Terms button */}
              <button
                onClick={() => setShowDisclaimer(true)}
                className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:border-border transition-all duration-200"
              >
                <FileText className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium text-left">
                  View Terms of Use
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filter */}
              <Select
                value={filters.category || 'all'}
                onValueChange={(v) => updateFilter('category', v === 'all' ? undefined : v as CapabilityCategory)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(Object.keys(CATEGORY_CONFIG) as CapabilityCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_CONFIG[cat].label} ({categoryStats[cat] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Pricing tier filter */}
              <Select
                value={filters.pricingTier || 'all'}
                onValueChange={(v) => updateFilter('pricingTier', v === 'all' ? undefined : v as PricingTier)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Price Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {(Object.keys(PRICING_TIERS) as PricingTier[]).map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {PRICING_TIERS[tier].name} (${PRICING_TIERS[tier].minPrice}+)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Executor type filter */}
              <Select
                value={filters.executorType || 'all'}
                onValueChange={(v) => updateFilter('executorType', v === 'all' ? undefined : v as ExecutorType)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Executor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Executors</SelectItem>
                  {(Object.keys(EXECUTOR_LABELS) as ExecutorType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {EXECUTOR_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={filters.sortBy || 'downloads'}
                onValueChange={(v) => updateFilter('sortBy', v as CapabilityFilters['sortBy'])}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downloads">Popular</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="lastUpdated">Recent</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="container mx-auto px-4 py-12">
          {capabilities.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No capabilities found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{capabilities.length}</span> capabilities
                </p>
                <Badge variant="outline" className="text-primary border-primary/30">
                  <Package className="w-3 h-3 mr-1" />
                  Licensed Artifacts
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {capabilities.map((capability) => (
                  <CapabilityCard 
                    key={capability.id} 
                    capability={capability} 
                    categoryConfig={CATEGORY_CONFIG}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-border/50 bg-muted/30">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Custom Capabilities?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Contact us for enterprise licensing, custom development, or capability consulting.
            </p>
            <Button asChild size="lg">
              <a href="mailto:PromptFluid@gmail.com">
                Contact Sales
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <EnhancedFooter />

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <Suspense fallback={null}>
            <DepotDisclaimer onClose={() => setShowDisclaimer(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}
