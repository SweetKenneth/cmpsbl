/**
 * Capabilities Depot — Main Page
 * Marketplace surface for downloadable capability artifacts
 * v1.5.0 — Self-Improvement Hero, Mobile-First Polish
 */

import { useState, useMemo, lazy, Suspense, useCallback } from 'react';
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
  Crown,
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
import { CapabilityDetailModal } from '@/components/depot/CapabilityDetailModal';
import { SelfImprovementHero } from '@/components/depot/SelfImprovementHero';
import {
  filterCapabilities,
  getCategoryStats,
  getTotalCapabilityCount,
  PRICING_TIERS,
  getRecursiveCapabilityById,
  type CapabilityCategory,
  type ExecutorType,
  type PricingTier,
  type CapabilityFilters,
  type CapabilityArtifact,
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
  const [selectedCapability, setSelectedCapability] = useState<CapabilityArtifact | null>(null);
  
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

  // Scroll to grid
  const scrollToGrid = useCallback(() => {
    const grid = document.getElementById('capabilities-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // View Apex capability
  const handleViewApex = useCallback(() => {
    const apex = getRecursiveCapabilityById('recursive-self-optimization-core');
    if (apex) {
      setSelectedCapability(apex);
    }
  }, []);

  return (
    <>
      <DepotSEO totalCount={totalCount} />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Self-Improvement Hero */}
        <SelfImprovementHero 
          onExplore={scrollToGrid}
          onViewApex={handleViewApex}
        />

        {/* Stats Bar — Social Proof */}
        <section className="border-b border-border/50 bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary">{totalCount}+</div>
                <div className="text-xs text-muted-foreground">Capabilities</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-violet-500">10</div>
                <div className="text-xs text-muted-foreground">Self-Improvement</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-cyan-500">22</div>
                <div className="text-xs text-muted-foreground">S-Tier Premium</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-emerald-500">$19</div>
                <div className="text-xs text-muted-foreground">Starting Price</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section — Mobile-first sticky */}
        <section id="capabilities-grid" className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile: Stacked, Desktop: Row */}
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              {/* Search - Full width on mobile */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 touch-manipulation"
                />
              </div>

              {/* Filter row - 2x2 grid on mobile */}
              <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
                {/* Category filter */}
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(v) => updateFilter('category', v === 'all' ? undefined : v as CapabilityCategory)}
                >
                  <SelectTrigger className="w-full md:w-40 h-11 touch-manipulation">
                    <Filter className="w-4 h-4 mr-1.5 shrink-0" />
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
                  <SelectTrigger className="w-full md:w-40 h-11 touch-manipulation">
                    <SelectValue placeholder="Tier" />
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
                  <SelectTrigger className="w-full md:w-36 h-11 touch-manipulation">
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
                  <SelectTrigger className="w-full md:w-32 h-11 touch-manipulation">
                    <SelectValue placeholder="Sort" />
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
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          {capabilities.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No capabilities found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{capabilities.length}</span> capabilities
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-primary border-primary/30">
                    <Package className="w-3 h-3 mr-1" />
                    Licensed Artifacts
                  </Badge>
                  <button
                    onClick={() => setShowDisclaimer(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Terms
                  </button>
                </div>
              </div>

              {/* Responsive grid: 1 col mobile, 2 tablet, 3 desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {capabilities.map((capability) => (
                  <CapabilityCard 
                    key={capability.id} 
                    capability={capability} 
                    categoryConfig={CATEGORY_CONFIG}
                    onViewDetails={() => setSelectedCapability(capability)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Bottom CTA — Enterprise */}
        <section className="border-t border-border/50 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 py-16 md:py-20 text-center">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/30">
              <Crown className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Need Custom Self-Improvement Capabilities?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-base md:text-lg">
              Contact us for enterprise licensing, custom recursive development, or capability consulting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 touch-manipulation">
                <a href="mailto:PromptFluid@gmail.com">
                  Contact Sales
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 touch-manipulation">
                <a href="/support">
                  Get Support
                </a>
              </Button>
            </div>
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

      {/* Capability Detail Modal */}
      {selectedCapability && (
        <CapabilityDetailModal
          capability={selectedCapability}
          categoryConfig={CATEGORY_CONFIG}
          onClose={() => setSelectedCapability(null)}
        />
      )}
    </>
  );
}
