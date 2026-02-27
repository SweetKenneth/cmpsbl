/**
 * Capability Depot — FREE Exploration Layer
 * Atomic, stateless building blocks — ALL UNLOCKED
 * No pricing, no checkout, all capabilities free
 */

import { useState, useMemo, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMetric } from '@/stores/publicMetricsStore';
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
  Layers,
  Info,
  ArrowRight,
  Unlock,
  Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { CapabilityCardFree } from '@/components/depot/CapabilityCardFree';
import { DepotSEO } from '@/components/depot/DepotSEO';
import { CapabilityDetailModal } from '@/components/depot/CapabilityDetailModal';
import {
  filterCapabilities,
  getCategoryStats,
  getTotalCapabilityCount,
  type CapabilityCategory,
  type ExecutorType,
  type CapabilityFilters,
  type CapabilityArtifact,
} from '@/lib/capabilities/depot';
import { cn } from '@/lib/utils';

// Lazy load the disclaimer modal
const DepotDisclaimer = lazy(() => import('@/components/depot/DepotDisclaimer').then(m => ({ default: m.DepotDisclaimer })));

// Category config with icons - colorful badges (not overlays)
const CATEGORY_CONFIG: Record<CapabilityCategory, { icon: typeof Brain; label: string; colorClass: string }> = {
  intelligence: { icon: Brain, label: 'Intelligence', colorClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
  optimization: { icon: TrendingUp, label: 'Optimization', colorClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  resilience: { icon: Zap, label: 'Resilience', colorClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  security: { icon: Shield, label: 'Security', colorClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
  accessibility: { icon: Accessibility, label: 'Accessibility', colorClass: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
  automation: { icon: Settings, label: 'Automation', colorClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  orchestration: { icon: Layers, label: 'Orchestration', colorClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
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
  
  // Centralized metrics
  const capabilitiesCount = useMetric('capabilitiesCount');
  
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

      <main className="min-h-screen bg-background">
        {/* FREE Hero Section */}
        <section className="relative py-16 md:py-24 border-b border-border/50 bg-gradient-to-b from-emerald-500/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
              <Unlock className="w-3 h-3 mr-1" />
              ALL UNLOCKED
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Capability Depot
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              All {totalCount}+ capabilities are <strong className="text-emerald-400">free and unlocked</strong>.
              Atomic, stateless building blocks for exploration and integration.
            </p>
            
            {/* Explainer */}
            <div className="max-w-2xl mx-auto p-4 rounded-xl bg-muted/50 border border-border/50 mb-6">
              <div className="flex items-start gap-3 text-left">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Capabilities are primitives.</strong> Use them freely in your apps.
                  For saved, governed orchestration with persistence and versioning, explore our <Link to="/upgrade" className="text-primary hover:underline">subscription tiers</Link>.
                </div>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/docs/persistent-memory">
                <Button variant="outline" className="gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10">
                  <Brain className="w-4 h-4" />
                  Add Persistent Memory
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/codelab">
                <Button variant="ghost" className="gap-2">
                  <Package className="w-4 h-4" />
                  View in CodeLab
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-b border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-emerald-400">{totalCount}+</div>
                <div className="text-xs text-muted-foreground">Unlocked</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl md:text-3xl font-black text-emerald-400">
                  <Check className="w-6 h-6" />
                  FREE
                </div>
                <div className="text-xs text-muted-foreground">No Purchase</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-cyan-400">7</div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-amber-400">Stateless</div>
                <div className="text-xs text-muted-foreground">Atomic</div>
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
                  Showing <span className="font-semibold text-foreground">{capabilities.length}</span> unlocked capabilities
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Free Tier
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
                  <CapabilityCardFree 
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

        {/* Engine CTA */}
        <section className="border-t border-border/50 bg-muted/30">
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Build?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Capabilities are free primitives. Upgrade your plan for governed orchestration with persistence and versioning.
            </p>
            <Button asChild>
              <Link to="/upgrade">
                <Layers className="w-4 h-4 mr-2" />
                View Plans
              </Link>
            </Button>
          </div>
        </section>

        {/* Philosophy Footer */}
        <section className="border-t border-border/30 bg-muted/30">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              <strong>Capability</strong> = atomic, composable primitive. <strong>Engine</strong> = saved, governed, monetized.
              Free tier capabilities fuel adoption. Engines are the products.
            </p>
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
