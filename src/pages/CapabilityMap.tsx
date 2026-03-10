/**
 * Capability Map — Visual atlas of baseline, pack-bound, and reserved capabilities.
 * Horizontal-scroll category UX with card carousels (like SubstrateStore/Blog).
 */
import { useState, useMemo, useRef } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BASELINE_PILLARS } from '@/lib/substrate/baseline-pillars';
import { ARTIFACT_PACKS, STRATEGIC_DOMAINS, PRODUCT_TIER_LABELS, type ProductTier } from '@/lib/quarry/types';
import { useCrystallizedEntitlements } from '@/hooks/useCrystallizedEntitlements';
import { useArtifactSlots } from '@/hooks/useArtifactSlots';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Map, Search, Shield, Lock, Unlock, Package, Brain, Route, ShieldCheck,
  Workflow, Activity, Scale, Dna, Fingerprint, Radio, Lightbulb, Layers,
  ChevronRight, ChevronLeft, Zap, Sparkles, Eye, Cpu, Globe, Database,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ICON_MAP: Record<string, React.ElementType> = {
  Brain, Route, ShieldCheck, Workflow, Activity, Scale, Dna, Fingerprint, Radio, Lightbulb,
};

// ─── Categories for baseline pillars ───
const BASELINE_CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'intelligence', label: 'Intelligence', icon: Brain },
  { id: 'routing', label: 'Routing', icon: Route },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'orchestration', label: 'Orchestration', icon: Workflow },
  { id: 'observability', label: 'Observability', icon: Activity },
  { id: 'governance', label: 'Governance', icon: Scale },
  { id: 'evolution', label: 'Evolution', icon: Dna },
  { id: 'identity', label: 'Identity', icon: Fingerprint },
] as const;

// Map pillar icons to categories
function getPillarCategory(pillar: typeof BASELINE_PILLARS[number]): string {
  const iconCategoryMap: Record<string, string> = {
    Brain: 'intelligence',
    Route: 'routing',
    ShieldCheck: 'security',
    Workflow: 'orchestration',
    Activity: 'observability',
    Scale: 'governance',
    Dna: 'evolution',
    Fingerprint: 'identity',
    Radio: 'orchestration',
    Lightbulb: 'intelligence',
  };
  return iconCategoryMap[pillar.icon] || 'all';
}

type MapView = 'baseline' | 'packs' | 'reserved';

// ─── Horizontal Scroll Carousel ───
function ScrollCarousel({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.7;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className={cn("relative group", className)}>
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border/50 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
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
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border/50 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function CapabilityMap() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<MapView>('baseline');
  const [baselineCategory, setBaselineCategory] = useState('all');
  const { tier: currentTier } = useEngineSubscription();
  const slotState = useArtifactSlots(currentTier);
  const { assets, releasedCount, reservedCount, isLoading } = useCrystallizedEntitlements();

  const reservedAssets = useMemo(
    () => assets.filter(a => a.status === 'reserved'),
    [assets]
  );

  const filteredBaseline = useMemo(() => {
    const q = search.toLowerCase();
    return BASELINE_PILLARS.filter(p => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
      const matchesCategory = baselineCategory === 'all' || getPillarCategory(p) === baselineCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, baselineCategory]);

  const filteredPacks = useMemo(() => {
    const q = search.toLowerCase();
    return ARTIFACT_PACKS.filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredReserved = useMemo(() => {
    const q = search.toLowerCase();
    return reservedAssets.filter(a =>
      !q || a.display_name.toLowerCase().includes(q) || a.asset_key.toLowerCase().includes(q)
    );
  }, [search, reservedAssets]);

  const views: { value: MapView; label: string; icon: React.ElementType; count: number }[] = [
    { value: 'baseline', label: 'Baseline', icon: Zap, count: BASELINE_PILLARS.length },
    { value: 'packs', label: 'Packs', icon: Package, count: ARTIFACT_PACKS.length },
    { value: 'reserved', label: 'Reserved', icon: Lock, count: reservedCount },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Capability Map — CMPSBL"
        description="Explore every capability: baseline nodes, artifact packs, and reserved internals. See what's always on, what's activatable, and what's coming."
      />
      <PublicNav />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10 space-y-4"
            >
              <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30">
                <Map className="w-3 h-3 mr-1.5 inline" />
                System Atlas
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Capability Map</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
                Every capability in CMPSBL — categorized by access level.
              </p>
            </motion.div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
              {views.map(v => (
                <button
                  key={v.value}
                  onClick={() => setView(v.value)}
                  className={cn(
                    "text-center p-3 sm:p-4 rounded-xl border transition-all duration-200",
                    view === v.value
                      ? "bg-primary/10 border-primary/30 shadow-sm"
                      : "bg-muted/30 border-border/50 hover:border-primary/20"
                  )}
                >
                  <v.icon className={cn(
                    'w-5 h-5 mx-auto mb-1.5 transition-colors',
                    view === v.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <div className={cn(
                    "text-xl sm:text-2xl font-bold",
                    view === v.value ? 'text-foreground' : 'text-muted-foreground'
                  )}>{v.count}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{v.label}</div>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md mx-auto mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search capabilities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* ═══ BASELINE VIEW ═══ */}
            {view === 'baseline' && (
              <section>
                {/* Horizontal category tabs */}
                <div className="mb-6">
                  <div
                    className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:justify-center"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {BASELINE_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setBaselineCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                          baselineCategory === cat.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-emerald-500/20" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Always Active
                  </h2>
                  <div className="h-px flex-1 bg-emerald-500/20" />
                </div>

                {/* Horizontal scroll cards */}
                {filteredBaseline.length > 0 ? (
                  <ScrollCarousel>
                    {filteredBaseline.map((pillar, i) => {
                      const Icon = ICON_MAP[pillar.icon] || Layers;
                      return (
                        <motion.div
                          key={pillar.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="snap-start shrink-0 w-[280px] sm:w-[320px]"
                        >
                          <Card className="border-emerald-500/10 bg-emerald-500/[0.02] hover:border-emerald-500/20 transition-colors h-full">
                            <CardHeader className="pb-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                                  <Icon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <span className="truncate">{pillar.name}</span>
                                  </CardTitle>
                                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 mt-1">
                                    <Unlock className="w-2.5 h-2.5 mr-1" />
                                    Always On
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{pillar.summary}</p>
                              <div className="flex flex-wrap gap-1">
                                {pillar.highlights.slice(0, 3).map(h => (
                                  <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                                    {h}
                                  </span>
                                ))}
                                {pillar.highlights.length > 3 && (
                                  <span className="text-[10px] text-muted-foreground/60">
                                    +{pillar.highlights.length - 3}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </ScrollCarousel>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Map className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No capabilities match your search.</p>
                  </div>
                )}
              </section>
            )}

            {/* ═══ PACKS VIEW ═══ */}
            {view === 'packs' && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-primary/20" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    Pack-Bound — 1 Slot Each
                  </h2>
                  <div className="h-px flex-1 bg-primary/20" />
                </div>

                {filteredPacks.length > 0 ? (
                  <ScrollCarousel>
                    {filteredPacks.map((pack, i) => {
                      const active = slotState.isPackActive(pack.id);
                      return (
                        <motion.div
                          key={pack.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="snap-start shrink-0 w-[260px] sm:w-[300px]"
                        >
                          <Card className={cn(
                            'transition-colors h-full',
                            active
                              ? 'border-primary/30 bg-primary/[0.03]'
                              : 'border-border/50 hover:border-primary/20'
                          )}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center justify-between">
                                <span className="truncate">{pack.name}</span>
                                {active ? (
                                  <Badge className="text-[10px] bg-primary/20 text-primary border-0 shrink-0">Active</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] shrink-0">Inactive</Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                              <p className="text-xs text-muted-foreground line-clamp-3">{pack.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {pack.components.slice(0, 4).map(c => (
                                  <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground font-mono">
                                    {c}
                                  </span>
                                ))}
                                {pack.components.length > 4 && (
                                  <span className="text-[10px] text-muted-foreground/60">
                                    +{pack.components.length - 4}
                                  </span>
                                )}
                              </div>
                              {!active && (
                                <Link
                                  to="/packs"
                                  className="inline-flex items-center text-xs text-primary hover:underline"
                                >
                                  Activate <ChevronRight className="w-3 h-3 ml-0.5" />
                                </Link>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </ScrollCarousel>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No packs match your search.</p>
                  </div>
                )}
              </section>
            )}

            {/* ═══ RESERVED VIEW ═══ */}
            {view === 'reserved' && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-muted-foreground/20" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Reserved — Internal Only
                  </h2>
                  <div className="h-px flex-1 bg-muted-foreground/20" />
                </div>

                {filteredReserved.length > 0 ? (
                  <ScrollCarousel>
                    {filteredReserved.map((asset, i) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="snap-start shrink-0 w-[260px] sm:w-[300px]"
                      >
                        <Card className="border-muted-foreground/10 bg-muted/20 opacity-70 h-full">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="truncate">{asset.display_name}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground">
                              Internal substrate capability. Not available for external activation.
                            </p>
                            <Badge variant="outline" className="mt-2 text-[10px] border-muted-foreground/20">
                              <Lock className="w-2.5 h-2.5 mr-1" />
                              Reserved
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </ScrollCarousel>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Lock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{search ? 'No reserved capabilities match.' : 'No reserved capabilities found.'}</p>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
