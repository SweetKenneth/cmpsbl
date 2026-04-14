/**
 * The Junkyard — Raw, sub-threshold, and broken tech available for free
 * Browse categories, search items, download to workbench, or send to Restoration Lab.
 * Includes LIVE discovery salvage — real sub-threshold discoveries from the reactor.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { RelatedCapabilities } from '@/components/RelatedCapabilities';
import { PublicBreadcrumb } from '@/components/navigation/PublicBreadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Archive, ChevronLeft, ChevronRight, Search, X, Wrench,
  AlertTriangle, Zap, Package, ArrowRight, Shield, Brain,
  Code, Layers, Eye, Cpu, HardDrive, CircuitBoard, Download, Waves,
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

import { buildArchiveCatalog, type ArchiveItem } from '@/lib/junkyard/static-archive';

type ArchiveCategory = 'Raw Discoveries' | 'Broken Tech' | 'Salvageable Parts' | 'Legacy Systems';

const ARCHIVE_ITEMS: ArchiveItem[] = buildArchiveCatalog({
  security: imgSecurity, governance: imgGovernance, monitoring: imgMonitoring,
  performance: imgPerformance, resilience: imgResilience, decision: imgDecision,
  brokenCircuit: imgBrokenCircuit, decommServer: imgDecommServer, corruptedData: imgCorruptedData,
  brokenInput: imgBrokenInput, crackedDisplay: imgCrackedDisplay, salvageRobot: imgSalvageRobot,
  tangledNetwork: imgTangledNetwork, legacyStorage: imgLegacyStorage,
});

const CATEGORIES: { id: ArchiveCategory; label: string; icon: typeof Archive; color: string; border: string; text: string; bg: string; subtitle: string }[] = [
  { id: 'Raw Discoveries', label: 'Raw Discoveries', icon: Archive, color: 'from-neon-cyan/20 to-neon-cyan/5', border: 'border-neon-cyan/30', text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', subtitle: 'Sub-68 scored. Free to take.' },
  { id: 'Broken Tech', label: 'Broken Tech', icon: AlertTriangle, color: 'from-destructive/20 to-destructive/5', border: 'border-destructive/30', text: 'text-destructive', bg: 'bg-destructive/10', subtitle: 'Damaged but diagnosable. Restoration available.' },
  { id: 'Salvageable Parts', label: 'Salvageable Parts', icon: Wrench, color: 'from-neon-amber/20 to-neon-amber/5', border: 'border-neon-amber/30', text: 'text-neon-amber', bg: 'bg-neon-amber/10', subtitle: 'Partial capabilities. Worth the rebuild.' },
  { id: 'Legacy Systems', label: 'Legacy Systems', icon: HardDrive, color: 'from-neon-purple/20 to-neon-purple/5', border: 'border-neon-purple/30', text: 'text-neon-purple', bg: 'bg-neon-purple/10', subtitle: 'Deprecated runtimes. Classic potential.' },
];

import { ScrollCarousel } from '@/components/shared/ScrollCarousel';

function ArchiveCard({ item }: { item: ArchiveItem }) {
  const isBroken = item.condition === 'broken';
  const isSalvageable = item.condition === 'salvageable';
  const isRestorable = isBroken || isSalvageable;
  const { user } = useAuth();
  const navigate = useNavigate();

  const conditionConfig = {
    raw: { label: 'RAW', className: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30', accent: 'from-neon-cyan via-neon-cyan to-neon-cyan' },
    broken: { label: 'BROKEN', className: 'bg-destructive/15 text-destructive border-destructive/30', accent: 'from-destructive via-neon-amber to-destructive' },
    salvageable: { label: 'SALVAGEABLE', className: 'bg-neon-amber/15 text-neon-amber border-neon-amber/30', accent: 'from-neon-amber via-neon-amber to-neon-amber' },
  }[item.condition];

  const handleDownload = () => {
    if (!user) {
      toast.error('Sign in to download items to your Workbench');
      navigate('/auth');
      return;
    }
    const key = 'cmpsbl_workbench_items';
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as string[];
    if (!existing.includes(item.id)) {
      existing.push(item.id);
      localStorage.setItem(key, JSON.stringify(existing));
    }
    toast.success(`${item.name} added to your Workbench`);
  };

  return (
    <div className="snap-start shrink-0 w-[260px] sm:w-[300px] md:w-[320px]">
      <div className={cn(
        "h-full rounded-xl border bg-card overflow-hidden transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl flex flex-col",
        isRestorable
          ? "border-neon-amber/20 hover:border-neon-amber/40 hover:shadow-neon-amber/10"
          : "border-border/40 hover:border-primary/30",
      )}>
        <div className={cn("h-[3px] w-full bg-gradient-to-r", conditionConfig.accent)} />
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
          <div className="absolute top-2.5 right-2.5">
            <Badge className={cn("text-xs font-bold backdrop-blur-md border", conditionConfig.className)}>
              {isBroken && <AlertTriangle className="w-3 h-3 mr-1" />}
              {isSalvageable && <Wrench className="w-3 h-3 mr-1" />}
              {conditionConfig.label}
            </Badge>
          </div>
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
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-sm leading-snug mb-1.5">{item.name}</h3>
          <p className="text-xs text-muted-foreground mb-3 flex-1 leading-relaxed">{item.description}</p>
          <div className="flex items-center justify-between gap-2">
            {isRestorable ? (
              <>
                <div>
                  <span className="text-xs text-muted-foreground line-through">{item.originalValue}</span>
                  <span className="text-sm font-bold text-neon-amber ml-1.5">{item.restorationCost}</span>
                </div>
                <Button asChild size="sm" variant="outline" className="gap-1 text-xs border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10">
                  <Link to="/ascension">
                    <Wrench className="w-3 h-3" />
                    Restore
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-neon-green">Free</span>
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handleDownload}>
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LiveDiscovery {
  id: string;
  name: string;
  description: string | null;
  category: string;
  cjpi: number;
  module_chain: string[];
  tier: string | null;
  created_at: string;
}

function useJunkyardDiscoveries() {
  const [discoveries, setDiscoveries] = useState<LiveDiscovery[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data, error }, { count: total }] = await Promise.all([
        supabase
          .from('discoveries')
          .select('id, name, description, category, cjpi, module_chain, tier, created_at')
          .eq('status', 'junkyard')
          .order('cjpi', { ascending: false })
          .limit(50),
        supabase
          .from('discoveries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'junkyard'),
      ]);
      if (!error && data) setDiscoveries(data as LiveDiscovery[]);
      setCount(total ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  return { discoveries, count, loading };
}

function LiveDiscoveryCard({ item }: { item: LiveDiscovery }) {
  const chainStr = item.module_chain.slice(0, 4).join(' → ');
  const hasMore = item.module_chain.length > 4;

  return (
    <div className="min-w-[260px] max-w-[320px] snap-start flex-shrink-0 rounded-xl border border-neon-cyan/20 bg-card overflow-hidden group hover:border-neon-cyan/40 transition-all">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-[10px] border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5">
            CJPI {item.cjpi}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">FREE</span>
        </div>
        <h3 className="font-bold text-sm mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {item.description || 'Sub-threshold discovery — free to take.'}
        </p>
        <div className="text-[10px] font-mono text-muted-foreground/60 mb-3 line-clamp-1">
          {chainStr}{hasMore ? ' …' : ''}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground capitalize">{item.category}</span>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-neon-cyan hover:text-neon-cyan hover:bg-neon-cyan/10" asChild>
            <Link to="/ascension">
              <Wrench className="w-3 h-3" />
              Restore
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Junkyard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory | null>(null);
  const { discoveries: liveDiscoveries, count: liveCount, loading: liveLoading } = useJunkyardDiscoveries();

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
      <SEO
        title="The Junkyard — Free Broken Tech & Raw Discoveries | CMPSBL"
        description="Browse raw discoveries, broken tech, and salvageable parts. Free to take or send to the Restoration Lab for certified rebuilds. The junkyard of cognitive infrastructure."
        canonical="https://cmpsbl.com/junkyard"
        image="https://cmpsbl.com/og/foundry.jpg"
        keywords={['junkyard', 'broken tech', 'raw discoveries', 'salvage', 'CMPSBL', 'restoration', 'free software']}
      />
      <PublicNav />

      {/* Breadcrumb */}
      <div className="container mx-auto px-3 sm:px-4 pt-20">
        <PublicBreadcrumb />
      </div>

      {/* Hero */}
      <section className="relative pt-8 sm:pt-10 pb-12 sm:pb-16 px-3 sm:px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-amber/20 bg-neon-amber/5 mb-5 sm:mb-6">
              <Archive className="w-4 h-4 text-neon-amber" />
              <span className="text-xs font-semibold tracking-wide text-neon-amber">THE JUNKYARD</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
              Discarded Software.
              <br />
              <span className="bg-gradient-to-r from-[hsl(var(--neon-amber))] to-[hsl(var(--neon-cyan))] bg-clip-text text-transparent">
                Hidden Gems.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed font-medium">
              Raw discoveries, damaged runtimes, and legacy systems — everything here is free to take or{" "}
              <Link to="/ascension" className="text-primary hover:underline font-semibold">send to the Restoration Lab</Link>{" "}
              and we'll bring it back to spec.
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {CATEGORIES.map((cat, i) => {
                const count = groupedByCategory[cat.id]?.length || 0;
                return (
                  <motion.div
                    key={cat.id}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card border border-border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <cat.icon className={cn("w-3.5 h-3.5", cat.text)} />
                    <span className="font-black text-base sm:text-lg">{count}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{cat.label}</span>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground/60 font-mono">
              {ARCHIVE_ITEMS.length + liveCount} items · {liveCount > 0 ? `${liveCount} from reactor · ` : ''}{ARCHIVE_ITEMS.filter(i => i.condition === 'broken' || i.condition === 'salvageable').length} restorable
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

        {/* ═══ LIVE DISCOVERY SALVAGE — real sub-threshold discoveries from the reactor ═══ */}
        {!liveLoading && liveDiscoveries.length > 0 && (
          <section className="mb-10 border-t border-neon-cyan/10 pt-10">
            <div className="container mx-auto px-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-neon-cyan/10">
                    <Zap className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Discovery Salvage</h2>
                    <p className="text-xs text-muted-foreground">
                      {liveCount} real discoveries scored below threshold — free to take or restore
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-neon-cyan/20 text-neon-cyan text-[10px]">
                  LIVE FROM REACTOR
                </Badge>
              </div>
            </div>
            <div className="container mx-auto px-4">
              <ScrollCarousel>
                {liveDiscoveries.map(d => (
                  <LiveDiscoveryCard key={d.id} item={d} />
                ))}
              </ScrollCarousel>
            </div>
          </section>
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
                The Restoration Lab can rebuild broken tech, upgrade salvageable parts, and
                even breathe new life into legacy systems. Every restoration includes full
                CJPI re-scoring and an ownership certificate.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/ascension">
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

        {/* Memory Stream CTA */}
        <section className="border-t border-border/50">
          <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-14">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
                <Waves className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono tracking-wider text-primary">MEMORY STREAM</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mb-3">Want More Than Scraps?</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed text-sm">
                The Memory Stream continuously discovers scored, certified software capabilities.
                Pull memories at your tier rate, build your vault, and collect capabilities that score 68+.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to="/foundry">
                  <Waves className="w-4 h-4" />
                  Open Memory Stream
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <RelatedCapabilities />
      <EnhancedFooter />
    </div>
  );
}
