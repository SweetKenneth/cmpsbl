/**
 * Capabilities Depot — Main Page
 * Marketplace surface for downloadable capability artifacts
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Category config with icons
const CATEGORY_CONFIG: Record<CapabilityCategory, { icon: typeof Brain; label: string; color: string }> = {
  intelligence: { icon: Brain, label: 'Intelligence', color: 'cyan' },
  optimization: { icon: TrendingUp, label: 'Optimization', color: 'emerald' },
  resilience: { icon: Zap, label: 'Resilience', color: 'amber' },
  security: { icon: Shield, label: 'Security', color: 'rose' },
  accessibility: { icon: Accessibility, label: 'Accessibility', color: 'violet' },
  automation: { icon: Settings, label: 'Automation', color: 'blue' },
  orchestration: { icon: Settings, label: 'Orchestration', color: 'purple' },
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
      <DepotSEO totalCount={totalCount} />

      <PublicNav />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section — Premium Polish */}
        <section className="relative overflow-hidden border-b border-border/50">
          {/* Multi-layer background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />
          
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 via-cyan-500/10 to-transparent blur-3xl"
            animate={{ 
              x: [0, 80, 0], 
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.6, 0.4] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-violet-500/15 via-fuchsia-500/10 to-transparent blur-3xl"
            animate={{ 
              x: [0, -60, 0], 
              y: [0, 40, 0],
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-emerald-500/5 via-transparent to-amber-500/5 blur-3xl"
            animate={{ 
              rotate: [0, 180, 360],
              opacity: [0.2, 0.35, 0.2] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMXYxaC0xeiIgZmlsbD0icmdiYSgxMjgsMTI4LDEyOCwwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-30" />

          <div className="relative container mx-auto px-4 py-20 md:py-28">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* Premium badge with glow */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/10 to-cyan-500/15 backdrop-blur-md mb-8 shadow-lg shadow-primary/10"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Package className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                  86+ Cognitive Artifacts
                </span>
                <span className="w-px h-4 bg-border/50" />
                <span className="text-xs text-muted-foreground">v1.3.0</span>
              </motion.div>

              {/* Main headline with enhanced typography */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6"
              >
                <span className="text-foreground">Capabilities</span>
                <br className="sm:hidden" />
                <span className="relative ml-2 sm:ml-4">
                  <span className="bg-gradient-to-r from-primary via-cyan-400 to-violet-500 bg-clip-text text-transparent">
                    Depot
                  </span>
                  <motion.span
                    className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-cyan-400/20 to-violet-500/20 blur-xl -z-10"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </span>
              </motion.h1>

              {/* Enhanced description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Licensed cognitive capabilities for{' '}
                <span className="text-foreground font-medium">local execution</span>.{' '}
                Download, integrate, and run in{' '}
                <span className="text-foreground font-medium">your own infrastructure</span>.
              </motion.p>

              {/* Premium Stats with glass cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10"
              >
                {[
                  { value: totalCount, label: 'Capabilities', color: 'primary' },
                  { value: 7, label: 'Categories', color: 'cyan-500' },
                  { value: 4, label: 'Pricing Tiers', color: 'violet-500' },
                  { value: '$19', label: 'Starting at', color: 'emerald-500' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative px-6 py-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                      <div className={cn(
                        "text-3xl md:text-4xl font-black",
                        stat.color === 'primary' ? 'text-primary' : `text-${stat.color}`
                      )}>
                        {stat.value}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Enhanced disclaimer banner */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setShowDisclaimer(true)}
                className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-300 shadow-lg shadow-amber-500/5"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium text-left">
                  Artifacts sold as-is for local execution. No support, hosting, or SLA included.
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 group-hover:translate-y-0.5 transition-transform" />
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
