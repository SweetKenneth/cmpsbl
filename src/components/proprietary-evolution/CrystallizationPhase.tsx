/**
 * ASCENSION Phase — Orbital Lock Ring
 * 
 * Discoveries orbit a growing nucleus. Tap to ascend — watch each one
 * spiral inward, absorbed into your permanent memory core.
 * 
 * Post-lock: ascended memories reveal their full identity below.
 * PERF: Pure CSS animations — no framer-motion dependency.
 */

import { useState, useEffect, useMemo } from 'react';
import { Flame, Lock, CheckCircle2, Loader2, ShieldCheck, Sparkles, Trash2, ChevronDown } from 'lucide-react';
import { labelPrimitive } from '@/lib/export/primitive-labels';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getImpactTier, getImpactTierStyle, type ImpactTier } from '@/lib/discovery/chain-archetypes';
import { OrbitalLockRing, type OrbitalDiscovery } from './OrbitalLockRing';

interface Discovery {
  id: string;
  name: string;
  cjpiScore: number;
  tier: string;
  nodeA: string;
  nodeB: string;
  ascended: boolean;
  description: string;
  chain: string[];
  archetypeName: string | null;
  impactTier: ImpactTier | null;
}

export function CrystallizationPhase() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [ascending, setAscending] = useState<string | null>(null);
  const [expandedLocked, setExpandedLocked] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDiscoveries();
  }, []);

  const loadDiscoveries = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    // Fetch ascended memories (no limit) + top discoveries by CJPI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ascendedData } = await (supabase as any)
      .from('artifact_registry')
      .select('id, name, metadata, tier, description')
      .eq('user_id', user.id)
      .eq('category', 'proprietary-ascended');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: discoveryData } = await (supabase as any)
      .from('artifact_registry')
      .select('id, name, metadata, tier, description')
      .eq('user_id', user.id)
      .eq('category', 'proprietary-discovery')
      .order('created_at', { ascending: false })
      .limit(500);

    // Combine ascended + top 10 unascended by CJPI score
    const allDiscoveries = [...(ascendedData || []), ...(discoveryData || [])];
    const data = allDiscoveries;

    if (data) {
      setDiscoveries((data as any[]).map((d: any) => {
        const meta = d.metadata || {};
        return {
          id: d.id,
          name: d.name,
          cjpiScore: Number(meta.cjpi_score || 0),
          tier: d.tier || 'mint',
          nodeA: String(meta.node_a || ''),
          nodeB: String(meta.node_b || ''),
          ascended: meta.ascended === true,
          description: d.description || '',
          chain: (meta.chain as string[]) || [meta.node_a, meta.node_b].filter(Boolean),
          archetypeName: meta.archetype_name || null,
          impactTier: meta.impact_tier || null,
        };
      }));
    }
    setLoading(false);
  };

  const ascend = async (discoveryId: string) => {
    setAscending(discoveryId);
    // Snap to orbital ring
    setTimeout(() => {
      document.getElementById('crystallization-ring')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    try {
      const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'ascend',
          action: 'lock',
          input: { discovery_id: discoveryId },
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Ascension failed');

      setTimeout(() => {
        setDiscoveries(prev => {
          const disc = prev.find(d => d.id === discoveryId);
          if (disc) {
            toast({ title: 'Memory locked', description: `${disc.name || 'Capability'} is now permanent` });
          }
          return prev.map(d => d.id === discoveryId ? { ...d, ascended: true } : d);
        });
        setAscending(null);
      }, 1300);
    } catch (err) {
      toast({ title: 'Ascension failed', description: String(err), variant: 'destructive' });
      setAscending(null);
    }
  };

  const ascendAll = async () => {
    setAscending('batch');
    try {
      const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'ascend',
          action: 'batch-lock',
          input: { min_cjpi: 1 },
        },
      });

      if (error) throw error;
      toast({
        title: 'Batch ascension complete',
        description: `${data?.ascended_count || 0} memories locked`,
      });
      await loadDiscoveries();
    } catch (err) {
      toast({ title: 'Batch ascension failed', description: String(err), variant: 'destructive' });
    } finally {
      setAscending(null);
    }
  };

  const clearAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('artifact_registry')
        .delete()
        .eq('user_id', user.id)
        .in('category', ['proprietary-discovery', 'proprietary-ascended']);
      setDiscoveries([]);
      toast({ title: 'All cleared', description: 'Discoveries and ascended memories removed.' });
    } catch (err) {
      toast({ title: 'Clear failed', description: String(err), variant: 'destructive' });
    }
  };

  const ascendedList = useMemo(() => discoveries.filter(d => d.ascended), [discoveries]);
  const unascendedList = useMemo(() => discoveries.filter(d => !d.ascended), [discoveries]);
  const sTier = discoveries.filter(d => d.cjpiScore >= 85);

  const orbitalData: OrbitalDiscovery[] = useMemo(() =>
    discoveries.map(d => ({
      id: d.id,
      name: d.name,
      cjpiScore: d.cjpiScore,
      tier: d.tier,
      ascended: d.ascended,
      chainDepth: d.chain.length || 2,
      impactTier: d.impactTier || getImpactTier(d.chain.length || 2),
    })),
    [discoveries]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (discoveries.length === 0) {
    return (
      <div className="border border-border/30 rounded-xl p-8 text-center bg-card/30 space-y-3">
        <Flame className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-foreground font-medium">No discoveries to ascend</p>
        <p className="text-xs text-muted-foreground mt-1">
          Run the Discovery phase first to find capabilities worth locking into memory.
        </p>
        <p className="text-[10px] text-primary font-mono">← Go to Step 2 (Discovery) to start a collision cycle</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* ═══ STATS BAR ═══ */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Discoveries', value: discoveries.length, icon: Sparkles, color: 'text-muted-foreground' },
          { label: 'S-Tier', value: sTier.length, icon: Flame, color: 'text-neon-amber' },
          { label: 'Locked', value: ascendedList.length, icon: Lock, color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="px-3 py-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/20 text-center transition-colors hover:border-border/30">
            <s.icon className={cn("w-3.5 h-3.5 mx-auto mb-1", s.color)} />
            <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
            <p className="text-[9px] font-mono text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ═══ ORBITAL LOCK RING ═══ */}
      {unascendedList.length > 0 && (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-mono">
              Tap an orbiting discovery to lock it into memory
            </p>
          </div>

          <div id="crystallization-ring">
          <OrbitalLockRing
            discoveries={orbitalData}
            onAscend={ascend}
            ascending={ascending}
            totalCount={discoveries.length}
            ascendedCount={ascendedList.length}
          />
          </div>
        </div>
      )}

      {/* ═══ ALL LOCKED — VICTORY STATE (CSS animation) ═══ */}
      {unascendedList.length === 0 && ascendedList.length > 0 && (
        <div className="text-center py-6 space-y-3 animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border border-primary/30 flex items-center justify-center orbital-nucleus-pulse"
            style={{ '--nucleus-scale': 1, '--nucleus-opacity': 1 } as React.CSSProperties}
          >
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">All memories locked</p>
          <p className="text-xs text-muted-foreground">
            {ascendedList.length} capabilities permanently ascended — proceed to Export
          </p>
        </div>
      )}

      {/* ═══ ACTIONS ═══ */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-muted-foreground font-mono">
          {unascendedList.length} awaiting ascension
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={clearAll}
            disabled={!!ascending}
            className="h-10 min-h-[44px] text-xs gap-1.5 px-4"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
          {unascendedList.length > 1 && (
            <Button
              size="sm"
              onClick={ascendAll}
              disabled={!!ascending}
              className="h-10 min-h-[44px] text-xs gap-1.5 px-4"
            >
              {ascending === 'batch' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Flame className="w-3.5 h-3.5" />
              )}
              Ascend All
            </Button>
          )}
        </div>
      </div>

      {/* ═══ LOCKED MEMORIES — Post-Lock Reveal (CSS animations) ═══ */}
      {ascendedList.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Locked Memories ({ascendedList.length})
          </h3>
          <div className="space-y-1.5 max-h-[24rem] overflow-y-auto pr-1">
            {ascendedList.map((d, i) => {
              const isExpanded = expandedLocked === d.id;
              const impact = d.impactTier || getImpactTier(d.chain.length || 2);
              const impactStyle = getImpactTierStyle(impact);

              return (
                <div
                  key={d.id}
                  className="rounded-xl border border-primary/20 bg-primary/[0.03] overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  {/* Header row */}
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                    onClick={() => setExpandedLocked(isExpanded ? null : d.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs text-foreground font-medium break-words flex-1">
                      {d.name.replace(/_/g, ' ')}
                    </span>
                    <span className={cn(
                      "text-[8px] font-mono px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider shrink-0",
                      impactStyle
                    )}>
                      {impact === 'Enhancement' ? 'ENH' : impact === 'System Upgrade' ? 'SYS' : 'ARCH'}
                    </span>
                    <span className={cn(
                      "text-xs font-mono font-bold shrink-0",
                      d.cjpiScore >= 85 ? "text-neon-amber" :
                      d.cjpiScore >= 60 ? "text-primary" : "text-muted-foreground"
                    )}>
                      {d.cjpiScore}
                    </span>
                    <ChevronDown className={cn(
                      "w-3 h-3 text-muted-foreground transition-transform shrink-0",
                      isExpanded && "rotate-180"
                    )} />
                  </button>

                  {/* ═══ EXPANDED REVEAL — CSS grid transition ═══ */}
                  <div
                    className="overflow-hidden transition-[grid-template-rows] duration-250 ease-in-out"
                    style={{
                      display: 'grid',
                      gridTemplateRows: isExpanded ? '1fr' : '0fr',
                    }}
                  >
                    <div className="min-h-0">
                      <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-primary/10">
                        {d.archetypeName && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-primary/60 shrink-0" />
                            <span className="text-[11px] font-mono text-primary/70">{d.archetypeName}</span>
                          </div>
                        )}

                        {d.chain.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {d.chain.map((node, idx) => (
                              <span key={idx} className="flex items-center gap-0.5">
                                <span className={cn(
                                  "text-[9px] font-mono px-1.5 py-0.5 rounded",
                                  idx === 0
                                    ? "bg-primary/15 text-primary border border-primary/20"
                                    : "bg-muted/30 text-foreground/60"
                                )}>
                                  {idx === 0 ? `Ψ₄₁ ${node}` : labelPrimitive(node)}
                                </span>
                                {idx < d.chain.length - 1 && (
                                  <span className="text-muted-foreground/30 text-[7px]">→</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}

                        {d.description && (
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {d.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground/60">
                          <span>Tier: <span className="text-foreground/70 uppercase">{d.tier}</span></span>
                          <span>Depth: {d.chain.length}N</span>
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> Permanent
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
