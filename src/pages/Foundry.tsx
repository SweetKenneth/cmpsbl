/**
 * The Open Archive — Junkyard of raw, sub-threshold, and broken tech
 * Blog-style layout with horizontal scroll carousels, images, and restoration CTAs.
 * Authenticated users still see their vault/mining experience.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MemoryStreamOnboarding } from '@/components/onboarding/MemoryStreamOnboarding';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useFoundryState } from '@/hooks/useFoundryState';
import { useVaultState } from '@/hooks/useVaultState';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { usePricingEngine } from '@/hooks/usePricingEngine';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FoundryMiningPanel } from '@/components/foundry/FoundryMiningPanel';
import { FoundryInventory } from '@/components/foundry/FoundryInventory';
import { FoundryStats } from '@/components/foundry/FoundryStats';
import { FoundryTierLegend } from '@/components/foundry/FoundryTierLegend';
import { MemoryRiver } from '@/components/hero/MemoryRiver';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { RelatedCapabilities } from '@/components/RelatedCapabilities';
import { PublicBreadcrumb } from '@/components/navigation/PublicBreadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Archive, ChevronLeft, ChevronRight, Search, X, Wrench,
  AlertTriangle, Zap, Package, ArrowRight, Shield, Brain,
  Code, Layers, Eye, Cpu, HardDrive, CircuitBoard,
} from 'lucide-react';

// Junkyard images
import imgBrokenCircuit from '@/assets/junkyard/broken-circuit-salvage.jpg';
import imgDecommServer from '@/assets/junkyard/decommissioned-server.jpg';
import imgCorruptedData from '@/assets/junkyard/corrupted-data-stream.jpg';
import imgBrokenInput from '@/assets/junkyard/broken-input-device.jpg';
import imgCrackedDisplay from '@/assets/junkyard/cracked-display-module.jpg';
import imgSalvageRobot from '@/assets/junkyard/salvage-robotics.jpg';
import imgTangledNetwork from '@/assets/junkyard/tangled-network-salvage.jpg';
import imgLegacyStorage from '@/assets/junkyard/legacy-storage-platters.jpg';

// Showroom images (reuse for archive items)
import imgSecurity from '@/assets/showroom/security-compliance.jpg';
import imgGovernance from '@/assets/showroom/governance-policy.jpg';
import imgMonitoring from '@/assets/showroom/monitoring-visibility.jpg';
import imgPerformance from '@/assets/showroom/performance-optimization.jpg';
import imgResilience from '@/assets/showroom/resilience-recovery.jpg';
import imgDecision from '@/assets/showroom/decision-intelligence.jpg';

// ─── Types ───
type ItemCondition = 'raw' | 'broken' | 'salvageable';
type ArchiveCategory = 'Raw Discoveries' | 'Broken Tech' | 'Salvageable Parts' | 'Legacy Systems';

interface ArchiveItem {
  id: string;
  name: string;
  description: string;
  category: ArchiveCategory;
  condition: ItemCondition;
  score: number;
  image: string;
  imageAlt: string;
  restorationCost?: string;
  originalValue?: string;
}

// ─── Category config ───
const CATEGORIES: { id: ArchiveCategory; label: string; icon: typeof Archive; color: string; border: string; text: string; bg: string; subtitle: string }[] = [
  { id: 'Raw Discoveries', label: 'Raw Discoveries', icon: Archive, color: 'from-neon-cyan/20 to-neon-cyan/5', border: 'border-neon-cyan/30', text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', subtitle: 'Sub-68 scored. Free to take.' },
  { id: 'Broken Tech', label: 'Broken Tech', icon: AlertTriangle, color: 'from-destructive/20 to-destructive/5', border: 'border-destructive/30', text: 'text-destructive', bg: 'bg-destructive/10', subtitle: 'Damaged but diagnosable. Restoration available.' },
  { id: 'Salvageable Parts', label: 'Salvageable Parts', icon: Wrench, color: 'from-neon-amber/20 to-neon-amber/5', border: 'border-neon-amber/30', text: 'text-neon-amber', bg: 'bg-neon-amber/10', subtitle: 'Partial capabilities. Worth the rebuild.' },
  { id: 'Legacy Systems', label: 'Legacy Systems', icon: HardDrive, color: 'from-neon-purple/20 to-neon-purple/5', border: 'border-neon-purple/30', text: 'text-neon-purple', bg: 'bg-neon-purple/10', subtitle: 'Deprecated runtimes. Classic potential.' },
];

// ─── Static archive catalog ───
const ARCHIVE_ITEMS: ArchiveItem[] = [
  // Raw Discoveries (sub-68 score, free)
  { id: 'raw-1', name: 'Partial Thread Isolator', description: 'Discovered during Cycle 4,812. Scored 41 — thread boundary detection works but leaks under concurrent load. Interesting foundation.', category: 'Raw Discoveries', condition: 'raw', score: 41, image: imgSecurity, imageAlt: 'Partial thread isolation capability' },
  { id: 'raw-2', name: 'Naive Pattern Matcher v0.3', description: 'Early-stage regex alternative. Fast on simple patterns, catastrophic backtracking on nested groups. Score 33.', category: 'Raw Discoveries', condition: 'raw', score: 33, image: imgMonitoring, imageAlt: 'Pattern matching capability' },
  { id: 'raw-3', name: 'Drift Signal Collector', description: 'Captures semantic drift between API versions. Noisy output, no deduplication. Score 52 — promising concept.', category: 'Raw Discoveries', condition: 'raw', score: 52, image: imgDecision, imageAlt: 'Drift signal collection' },
  { id: 'raw-4', name: 'Config Entropy Scanner', description: 'Measures configuration complexity. Over-flags in monorepos. Score 47 but the metric is novel.', category: 'Raw Discoveries', condition: 'raw', score: 47, image: imgPerformance, imageAlt: 'Configuration entropy analysis' },
  { id: 'raw-5', name: 'Shallow Dependency Walker', description: 'Walks first-level deps only. Misses transitive vulnerabilities. Score 38 — too shallow for production.', category: 'Raw Discoveries', condition: 'raw', score: 38, image: imgGovernance, imageAlt: 'Dependency analysis' },
  { id: 'raw-6', name: 'Stale Cache Detector', description: 'Identifies cache entries older than TTL. False positives on warm caches. Score 44.', category: 'Raw Discoveries', condition: 'raw', score: 44, image: imgResilience, imageAlt: 'Cache detection capability' },

  // Broken Tech (damaged, can be restored)
  { id: 'broken-1', name: 'CORTEX-7 Reasoning Module', description: 'Previously rated CJPI 82. Corrupted during a failed migration. Core logic intact but the inference bridge is severed. Restorable.', category: 'Broken Tech', condition: 'broken', score: 82, image: imgCorruptedData, imageAlt: 'Corrupted reasoning module data stream', restorationCost: '$149', originalValue: '$329' },
  { id: 'broken-2', name: 'SENTINEL Firewall Array', description: 'Multi-layer packet inspector. Clock desync bricked the timing module. Hardware-era code, still beautiful under the damage.', category: 'Broken Tech', condition: 'broken', score: 76, image: imgBrokenCircuit, imageAlt: 'Broken circuit board of firewall array', restorationCost: '$89', originalValue: '$199' },
  { id: 'broken-3', name: 'MERIDIAN Load Balancer', description: 'Distributed traffic shaper. Memory leak in the connection pool. Was running 10k req/s before it went down.', category: 'Broken Tech', condition: 'broken', score: 71, image: imgDecommServer, imageAlt: 'Decommissioned server rack', restorationCost: '$119', originalValue: '$249' },
  { id: 'broken-4', name: 'ORACLE Prediction Engine', description: 'Time-series forecasting runtime. Training data corruption caused drift in the confidence intervals. Fixable with re-calibration.', category: 'Broken Tech', condition: 'broken', score: 88, image: imgCrackedDisplay, imageAlt: 'Cracked display of prediction engine', restorationCost: '$199', originalValue: '$449' },

  // Salvageable Parts (partial, worth rebuilding)
  { id: 'salvage-1', name: 'Authentication Handshake Module', description: 'OAuth2 + PKCE implementation. Token refresh logic works, but the CSRF guard is stripped. 60% functional.', category: 'Salvageable Parts', condition: 'salvageable', score: 58, image: imgSalvageRobot, imageAlt: 'Salvageable robotics components', restorationCost: '$49', originalValue: '$99' },
  { id: 'salvage-2', name: 'Rate Limiter Core', description: 'Token bucket algorithm with sliding window. Works for single-instance but no distributed coordination. Great starting point.', category: 'Salvageable Parts', condition: 'salvageable', score: 62, image: imgTangledNetwork, imageAlt: 'Tangled network cables of rate limiter', restorationCost: '$39', originalValue: '$79' },
  { id: 'salvage-3', name: 'Webhook Dispatcher v2', description: 'Reliable delivery with exponential backoff. Missing dead-letter queue and retry dashboard. Core is solid.', category: 'Salvageable Parts', condition: 'salvageable', score: 55, image: imgBrokenInput, imageAlt: 'Input device for webhook dispatcher', restorationCost: '$59', originalValue: '$129' },

  // Legacy Systems (deprecated but classic)
  { id: 'legacy-1', name: 'ATLAS v1 Navigation Core', description: 'First-gen capability mapper. Sequential scan only — no parallel discovery. Historical artifact from Cycle 200.', category: 'Legacy Systems', condition: 'raw', score: 45, image: imgLegacyStorage, imageAlt: 'Legacy storage platters' },
  { id: 'legacy-2', name: 'BEACON v0 Health Check', description: 'The original heartbeat monitor. UDP only, no TLS. The grandfather of our current BEACON engine.', category: 'Legacy Systems', condition: 'raw', score: 39, image: imgDecommServer, imageAlt: 'Original BEACON server hardware' },
  { id: 'legacy-3', name: 'Proto-DREAM Synthesizer', description: 'Before DREAM was DREAM. This early prototype used random walks instead of sub-threshold synthesis. Fascinating failure.', category: 'Legacy Systems', condition: 'raw', score: 51, image: imgCorruptedData, imageAlt: 'Proto-DREAM data visualization' },
];

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
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
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

// ─── Archive Item Card ───
function ArchiveCard({ item }: { item: ArchiveItem }) {
  const isBroken = item.condition === 'broken';
  const isSalvageable = item.condition === 'salvageable';
  const isRestorable = isBroken || isSalvageable;

  const conditionConfig = {
    raw: { label: 'RAW', className: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30', accent: 'from-neon-cyan via-neon-cyan to-neon-cyan' },
    broken: { label: 'BROKEN', className: 'bg-destructive/15 text-destructive border-destructive/30', accent: 'from-destructive via-neon-amber to-destructive' },
    salvageable: { label: 'SALVAGEABLE', className: 'bg-neon-amber/15 text-neon-amber border-neon-amber/30', accent: 'from-neon-amber via-neon-amber to-neon-amber' },
  }[item.condition];

  return (
    <div className="snap-start shrink-0 w-[300px] sm:w-[320px]">
      <div className={cn(
        "h-full rounded-xl border bg-card overflow-hidden transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl flex flex-col",
        isRestorable
          ? "border-neon-amber/20 hover:border-neon-amber/40 hover:shadow-neon-amber/10"
          : "border-border/40 hover:border-primary/30",
      )}>
        {/* Top accent */}
        <div className={cn("h-[3px] w-full bg-gradient-to-r", conditionConfig.accent)} />

        {/* Image */}
        <div className="aspect-[16/10] overflow-hidden relative">
          <img
            src={item.image}
            alt={item.imageAlt}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
            width={768}
            height={512}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Condition badge */}
          <div className="absolute top-2.5 right-2.5">
            <Badge className={cn("text-xs font-bold backdrop-blur-md border", conditionConfig.className)}>
              {isBroken && <AlertTriangle className="w-3 h-3 mr-1" />}
              {isSalvageable && <Wrench className="w-3 h-3 mr-1" />}
              {conditionConfig.label}
            </Badge>
          </div>

          {/* Score */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-black/50 text-white border-white/20 backdrop-blur-md font-mono">
              CJPI {item.score}
            </Badge>
            {isRestorable && item.restorationCost && (
              <Badge className="text-xs bg-neon-amber/20 text-neon-amber border-neon-amber/30 backdrop-blur-md">
                <Wrench className="w-2.5 h-2.5 mr-1" />
                Restore {item.restorationCost}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-sm leading-snug mb-1.5 line-clamp-2">{item.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1 leading-relaxed">{item.description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {isRestorable ? (
              <>
                <div>
                  <span className="text-xs text-muted-foreground line-through">{item.originalValue}</span>
                  <span className="text-sm font-bold text-neon-amber ml-1.5">{item.restorationCost}</span>
                </div>
                <Button asChild size="sm" variant="outline" className="gap-1 text-xs border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10">
                  <Link to="/consultation">
                    <Wrench className="w-3 h-3" />
                    Restore
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-neon-green">Free</span>
                <span className="text-xs text-muted-foreground">No certificate · unlimited copies</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Anonymous Archive View ───
function ArchiveBrowseView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory | null>(null);

  const groupedByCategory: Record<string, ArchiveItem[]> = {};
  ARCHIVE_ITEMS.forEach(item => {
    if (!groupedByCategory[item.category]) groupedByCategory[item.category] = [];
    groupedByCategory[item.category].push(item);
  });

  const filteredItems = ARCHIVE_ITEMS.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    if (selectedCategory) return item.category === selectedCategory;
    return true;
  });

  const showBrowseMode = !searchQuery && !selectedCategory;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Breadcrumb */}
      <div className="container mx-auto px-3 sm:px-4 pt-20">
        <PublicBreadcrumb />
      </div>

      {/* Hero */}
      <section className="relative pt-8 sm:pt-10 pb-12 sm:pb-16 px-3 sm:px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-transparent to-transparent" />
        <div className="relative container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-destructive/20 bg-destructive/5 mb-5 sm:mb-6">
              <Archive className="w-4 h-4 text-destructive" />
              <span className="text-xs font-mono tracking-wider text-destructive">THE OPEN ARCHIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
              Where <span className="text-destructive">Broken Tech</span> Gets a Second Life
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              Raw discoveries scored below 68. Damaged runtimes pulled from production.
              Legacy systems that shaped what we build today. Everything here is free to take —
              or <Link to="/consultation" className="text-neon-amber hover:underline font-medium">send it to the Restoration Lab</Link> and
              we'll bring it back to spec.
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {CATEGORIES.map((cat, i) => {
                const count = groupedByCategory[cat.id]?.length || 0;
                return (
                  <motion.div
                    key={cat.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <cat.icon className={cn("w-3.5 h-3.5", cat.text)} />
                    <span className="font-black text-lg">{count}</span>
                    <span className="text-xs text-muted-foreground">{cat.label}</span>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground/60 font-mono">
              {ARCHIVE_ITEMS.length} items · {ARCHIVE_ITEMS.filter(i => i.condition === 'broken' || i.condition === 'salvageable').length} restorable
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky toolbar */}
      <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${ARCHIVE_ITEMS.length} items...`}
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

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0",
                !selectedCategory
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              All Items
            </button>
            {CATEGORIES.map(cat => {
              const count = groupedByCategory[cat.id]?.length || 0;
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
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                  <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6 pb-2">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} items
            {searchQuery && <> matching "<span className="text-foreground font-medium">{searchQuery}</span>"</>}
          </p>
        </div>

        {showBrowseMode ? (
          <div className="pb-12">
            {CATEGORIES.filter(cat => groupedByCategory[cat.id]?.length).map(cat => {
              const items = groupedByCategory[cat.id] || [];
              const Icon = cat.icon;

              return (
                <section key={cat.id} className="mb-10">
                  <div className="container mx-auto px-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.bg)}>
                          <Icon className={cn("w-4 h-4", cat.text)} />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg">{cat.label}</h2>
                          <p className="text-xs text-muted-foreground">{cat.subtitle}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                      >
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="container mx-auto px-4">
                    <ScrollCarousel>
                      {items.map(item => (
                        <ArchiveCard key={item.id} item={item} />
                      ))}
                    </ScrollCarousel>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="container mx-auto px-4 py-6">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                  <ArchiveCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Archive className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
                <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Restoration CTA */}
        <section className="border-t border-border/50 bg-card/30">
          <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-amber/20 bg-neon-amber/5 mb-5">
                <Wrench className="w-4 h-4 text-neon-amber" />
                <span className="text-xs font-mono tracking-wider text-neon-amber">RESTORATION LAB</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">See Something Worth Saving?</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
                Our Restoration Lab can rebuild broken tech, upgrade salvageable parts, and
                even breathe new life into legacy systems. Every restoration includes full
                CJPI re-scoring and an ownership certificate.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/consultation">
                    <Wrench className="w-4 h-4" />
                    Visit the Restoration Lab
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <Link to="/showroom">
                    <Package className="w-4 h-4" />
                    Browse Certified Showroom
                  </Link>
                </Button>
              </div>

              {/* Condition legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[3px] rounded bg-gradient-to-r from-neon-cyan via-neon-cyan to-neon-cyan" />
                  <span>Raw · Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[3px] rounded bg-gradient-to-r from-destructive via-neon-amber to-destructive" />
                  <span>Broken · Restorable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[3px] rounded bg-gradient-to-r from-neon-amber via-neon-amber to-neon-amber" />
                  <span>Salvageable · Partial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[3px] rounded bg-gradient-to-r from-neon-purple via-neon-purple to-neon-purple" />
                  <span>Legacy · Classic</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <RelatedCapabilities />
      <EnhancedFooter />
    </div>
  );
}

// ─── Main Export ───
export default function Foundry() {
  const { user, loading: authLoading } = useAuth();
  const foundry = useFoundryState();
  const vaultState = useVaultState();
  const { tier: subscriptionTier } = useEngineSubscription();
  const pricingEngine = usePricingEngine();
  const [activeTab, setActiveTab] = useState<'mine' | 'inventory'>('mine');
  const [crystallizing, setCrystallizing] = useState(false);

  const handleRepriceAll = useCallback(async () => {
    const result = await pricingEngine.repriceAllDiscoveries();
    if (result.success === 0 && result.failed === 0) {
      toast.info('All items already priced — nothing to do');
    } else {
      toast.success(`Priced ${result.success} new artifacts${result.failed ? ` (${result.failed} failed)` : ''}`);
    }
    await foundry.reload();
  }, [foundry.reload, pricingEngine]);

  const handleRepriceOne = useCallback(async (id: string) => {
    const item = foundry.inventory?.find((i: any) => i.id === id);
    if (!item) return;
    await pricingEngine.priceOne({
      vault_id: item.id,
      pipeline_name: item.artifactName,
      pipeline_score: item.score,
      pipeline_tier: item.publicTier,
      pipeline_category: item.category,
      system_chain: item.systemChain,
      valuation_display: item.valuationDisplay,
    });
    toast.success(`Repriced ${item.artifactName}`);
    await foundry.reload();
  }, [foundry.inventory, foundry.reload, pricingEngine]);

  const handleInventoryRemove = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('foundry_inventory')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) return false;
    await foundry.reload();
    return true;
  }, [user, foundry.reload]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary"
        />
        <div className="text-muted-foreground font-mono text-sm">Loading...</div>
      </div>
    );
  }

  // Anonymous users see the archive browse experience
  if (!user) {
    return (
      <>
        <SEO
          title="The Open Archive — Broken Tech & Raw Discoveries | CMPSBL"
          description="Browse raw discoveries, broken tech, and salvageable parts. Free to take or send to the Restoration Lab for certified rebuilds. The junkyard of cognitive infrastructure."
          canonical="https://cmpsbl.com/foundry"
          image="https://cmpsbl.com/og-memory-stream.jpg"
          keywords={['open archive', 'broken tech', 'raw discoveries', 'salvage', 'CMPSBL', 'restoration', 'junkyard']}
        />
        <MemoryStreamOnboarding />
        <ArchiveBrowseView />
      </>
    );
  }

  if (foundry.isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary"
        />
        <div className="text-muted-foreground font-mono text-sm">Loading Memory Stream...</div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Memory Stream — Discover & Collect Software Capabilities | CMPSBL"
        description="Discover scored, tiered, exportable software capabilities. 5 rarity tiers from Mint to Apex, quality floor of 68+, and per-user persistent vault. Start mining free."
        canonical="https://cmpsbl.com/foundry"
        image="https://cmpsbl.com/og-memory-stream.jpg"
        keywords={['memory stream', 'crystallized memories', 'AI software discovery', 'CMPSBL', 'quality scoring', 'composable capabilities']}
      />

      <PublicNav />
      <MemoryStreamOnboarding />

      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 substrate-grid-bg opacity-30" />
        <div className="absolute inset-0 pointer-events-none z-0 animate-substrate-breathe">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06), transparent)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.04), transparent)" }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16 relative z-10">
          {/* Header */}
          <div className="text-center mb-10 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-live-pulse" />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary/80">Memory Stream</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4"
            >
              <span className="section-gradient-text">Crystallize Memories</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground/70 max-w-lg mx-auto text-sm leading-relaxed"
            >
              The Memory Stream continuously discovers new software capabilities.
              The engine scores each discovery and crystallizes the best into your vault.
              Quality floor: 68+. No filler. Only proven capabilities survive.
            </motion.p>
          </div>

          {/* Memory Stream visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="relative w-full mb-8"
          >
            <MemoryRiver crystallizing={crystallizing} compact hideTagline hideLegend />
          </motion.div>

          <FoundryStats
            inventoryCount={foundry.inventoryCount}
            bestPull={foundry.bestPull}
            totalMines={foundry.userState?.totalMines ?? 0}
            streakDays={foundry.userState?.streakDays ?? 0}
            tierCounts={foundry.tierCounts}
            inventory={foundry.inventory?.map((i: any) => ({ score: i.score, category: i.category, systemChain: i.systemChain }))}
          />

          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-border/20 mb-8 mt-8">
            <button
              onClick={() => setActiveTab('mine')}
              className={`relative px-5 py-3 sm:py-2.5 font-mono text-sm transition-colors -mb-px min-h-[44px] ${
                activeTab === 'mine'
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Crystallize
              {activeTab === 'mine' && (
                <motion.div
                  layoutId="foundry-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] memory-stream-bar"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`relative px-5 py-3 sm:py-2.5 font-mono text-sm transition-colors -mb-px min-h-[44px] ${
                activeTab === 'inventory'
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Vault ({vaultState.vaultCount})
              {activeTab === 'inventory' && (
                <motion.div
                  layoutId="foundry-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] memory-stream-bar"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>

          {activeTab === 'mine' ? (
            <div className="space-y-8">
              <FoundryMiningPanel
                isMining={foundry.isMining}
                lastResult={foundry.lastMineResult}
                onMine={foundry.mine}
                onCrystallizing={setCrystallizing}
                subscriptionTier={subscriptionTier}
                vaultCount={vaultState.vaultCount}
                pullsToday={vaultState.pullsToday}
                onVaultChange={vaultState.refresh}
                onKeepPipeline={vaultState.keepPipeline}
                onRecordPull={vaultState.recordPull}
              />
              <FoundryTierLegend />
            </div>
          ) : (
            <FoundryInventory inventory={foundry.inventory} onRemove={handleInventoryRemove} onReprice={handleRepriceOne} onRepriceAll={handleRepriceAll} repricing={pricingEngine.loading} subscriptionTier={subscriptionTier} />
          )}
        </div>
      </div>

      <RelatedCapabilities />
      <EnhancedFooter />
    </>
  );
}
