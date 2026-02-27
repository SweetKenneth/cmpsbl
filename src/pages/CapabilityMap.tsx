/**
 * Capability Map — Visual atlas of baseline, pack-bound, and reserved capabilities.
 * Phase 5 deliverable: public surface at /capability-map
 */
import { useState, useMemo } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  ChevronRight, Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ICON_MAP: Record<string, React.ElementType> = {
  Brain, Route, ShieldCheck, Workflow, Activity, Scale, Dna, Fingerprint, Radio, Lightbulb,
};

type MapFilter = 'all' | 'baseline' | 'pack-bound' | 'reserved';

export default function CapabilityMap() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MapFilter>('all');
  const { tier: currentTier } = useEngineSubscription();
  const slotState = useArtifactSlots(currentTier);
  const { assets, releasedCount, reservedCount, isLoading } = useCrystallizedEntitlements();

  const filters: { value: MapFilter; label: string; count: number }[] = useMemo(() => [
    { value: 'all', label: 'All Capabilities', count: BASELINE_PILLARS.length + ARTIFACT_PACKS.length + reservedCount },
    { value: 'baseline', label: 'Baseline (Always On)', count: BASELINE_PILLARS.length },
    { value: 'pack-bound', label: 'Pack-Bound', count: ARTIFACT_PACKS.length },
    { value: 'reserved', label: 'Reserved', count: reservedCount },
  ], [reservedCount]);

  const reservedAssets = useMemo(
    () => assets.filter(a => a.status === 'reserved'),
    [assets]
  );

  const filteredBaseline = useMemo(() => {
    if (filter === 'pack-bound' || filter === 'reserved') return [];
    const q = search.toLowerCase();
    return BASELINE_PILLARS.filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
    );
  }, [filter, search]);

  const filteredPacks = useMemo(() => {
    if (filter === 'baseline' || filter === 'reserved') return [];
    const q = search.toLowerCase();
    return ARTIFACT_PACKS.filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [filter, search]);

  const filteredReserved = useMemo(() => {
    if (filter === 'baseline' || filter === 'pack-bound') return [];
    const q = search.toLowerCase();
    return reservedAssets.filter(a =>
      !q || a.display_name.toLowerCase().includes(q) || a.asset_key.toLowerCase().includes(q)
    );
  }, [filter, search, reservedAssets]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Capability Map — Clockless"
        description="Explore every capability in the substrate: baseline pillars, pack-bound features, and reserved internals."
      />
      <PublicNav />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12 space-y-4"
            >
              <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30">
                <Map className="w-3 h-3 mr-1.5 inline" />
                System Atlas
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Capability Map</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Every capability in the substrate — categorized by access level.
                Baseline pillars run for everyone. Packs unlock specialized surfaces.
                Reserved capabilities are internal only.
              </p>
            </motion.div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-10">
              {[
                { label: 'Baseline Pillars', value: BASELINE_PILLARS.length, icon: Zap, color: 'text-emerald-400' },
                { label: 'Artifact Packs', value: ARTIFACT_PACKS.length, icon: Package, color: 'text-primary' },
                { label: 'Reserved', value: reservedCount, icon: Lock, color: 'text-muted-foreground' },
              ].map(s => (
                <div key={s.label} className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                  <s.icon className={cn('w-5 h-5 mx-auto mb-2', s.color)} />
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Search + Filters */}
            <div className="space-y-4 mb-10">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search capabilities..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {filters.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      filter === f.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {f.label}
                    <span className="ml-1.5 opacity-60">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ═══ BASELINE PILLARS ═══ */}
            {filteredBaseline.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-emerald-500/20" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Baseline — Always Active
                  </h2>
                  <div className="h-px flex-1 bg-emerald-500/20" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredBaseline.map((pillar, i) => {
                    const Icon = ICON_MAP[pillar.icon] || Layers;
                    return (
                      <motion.div
                        key={pillar.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Card className="border-emerald-500/10 bg-emerald-500/[0.02] hover:border-emerald-500/20 transition-colors">
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-emerald-500/10">
                                <Icon className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base flex items-center gap-2">
                                  {pillar.name}
                                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                                    <Unlock className="w-2.5 h-2.5 mr-1" />
                                    Always On
                                  </Badge>
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-3">{pillar.summary}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {pillar.highlights.map(h => (
                                <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ═══ PACK-BOUND FEATURES ═══ */}
            {filteredPacks.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-primary/20" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Pack-Bound — 1 Slot Each
                  </h2>
                  <div className="h-px flex-1 bg-primary/20" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPacks.map((pack, i) => {
                    const active = slotState.isPackActive(pack.id);
                    return (
                      <motion.div
                        key={pack.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
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
                                  +{pack.components.length - 4} more
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
                </div>
              </section>
            )}

            {/* ═══ RESERVED ═══ */}
            {filteredReserved.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-muted-foreground/20" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Reserved — Internal Only
                  </h2>
                  <div className="h-px flex-1 bg-muted-foreground/20" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReserved.map((asset, i) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card className="border-muted-foreground/10 bg-muted/20 opacity-70">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            {asset.display_name}
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
                </div>
              </section>
            )}

            {/* Empty state */}
            {filteredBaseline.length === 0 && filteredPacks.length === 0 && filteredReserved.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Map className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No capabilities match your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
