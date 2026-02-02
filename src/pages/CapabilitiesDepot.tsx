/**
 * Capabilities Depot — Main Page
 * Marketplace surface for downloadable capability artifacts
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Search, 
  Filter, 
  Package, 
  Download, 
  AlertTriangle,
  Sparkles,
  Brain,
  Zap,
  Shield,
  Settings,
  Accessibility,
  TrendingUp,
  ChevronDown,
  Info,
  ExternalLink,
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
import { DepotDisclaimer } from '@/components/depot/DepotDisclaimer';
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

// Category config with icons
const CATEGORY_CONFIG: Record<CapabilityCategory, { icon: typeof Brain; label: string; color: string }> = {
  intelligence: { icon: Brain, label: 'Intelligence', color: 'cyan' },
  optimization: { icon: TrendingUp, label: 'Optimization', color: 'emerald' },
  resilience: { icon: Zap, label: 'Resilience', color: 'amber' },
  security: { icon: Shield, label: 'Security', color: 'rose' },
  accessibility: { icon: Accessibility, label: 'Accessibility', color: 'violet' },
  automation: { icon: Settings, label: 'Automation', color: 'blue' },
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
      <Helmet>
        <title>Capabilities Depot — CMPSBL Substrate</title>
        <meta name="description" content="Download licensed cognitive capabilities for local execution. No support, no hosting — pure artifacts." />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/50">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
            animate={{ x: [0, 50, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl"
            animate={{ x: [0, -50, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 12, repeat: Infinity }}
          />

          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-6">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Downloadable Artifacts</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                <span className="text-foreground">Capabilities</span>{' '}
                <span className="bg-gradient-to-r from-primary via-cyan-500 to-violet-500 bg-clip-text text-transparent">
                  Depot
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Licensed cognitive capabilities for local execution. 
                Download, integrate, and run in your own infrastructure.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-foreground">{totalCount}</div>
                  <div className="text-sm text-muted-foreground">Capabilities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-foreground">6</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-foreground">4</div>
                  <div className="text-sm text-muted-foreground">Pricing Tiers</div>
                </div>
              </div>

              {/* Disclaimer banner */}
              <motion.button
                onClick={() => setShowDisclaimer(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Capabilities are downloadable artifacts. Execution, hosting, and support are the responsibility of the licensee.
                </span>
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </motion.div>
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
                      {CATEGORY_CONFIG[cat].label} ({categoryStats[cat]})
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No capabilities found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{capabilities.length}</span> capabilities
                </p>
                <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  UNSUPPORTED
                </Badge>
              </div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {capabilities.map((capability) => (
                  <CapabilityCard 
                    key={capability.id} 
                    capability={capability} 
                    categoryConfig={CATEGORY_CONFIG}
                  />
                ))}
              </motion.div>
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
          <DepotDisclaimer onClose={() => setShowDisclaimer(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
