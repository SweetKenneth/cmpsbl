/**
 * ASCENSION Phase — Lock winning capabilities into deterministic memories
 * Renamed from "Crystallize" to "Ascend" (crystallization is Memory Stream only)
 */

import { useState, useEffect } from 'react';
import { Flame, Lock, CheckCircle2, Loader2, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
}

export function CrystallizationPhase() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [ascending, setAscending] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDiscoveries();
  }, []);

  const loadDiscoveries = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('artifact_registry')
      .select('id, name, metadata, tier, description')
      .eq('user_id', user.id)
      .in('category', ['proprietary-discovery', 'proprietary-ascended'])
      .order('created_at', { ascending: false })
      .limit(500);

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
        };
      }));
    }
    setLoading(false);
  };

  const ascend = async (discovery: Discovery) => {
    setAscending(discovery.id);
    try {
      const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'ascend',
          action: 'lock',
          input: { discovery_id: discovery.id },
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Ascension failed');

      setDiscoveries(prev =>
        prev.map(d => d.id === discovery.id ? { ...d, ascended: true } : d)
      );
      toast({ title: 'Memory ascended', description: `${discovery.name} is now locked` });
    } catch (err) {
      toast({ title: 'Ascension failed', description: String(err), variant: 'destructive' });
    } finally {
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
        description: `${data?.crystallized_count || 0} memories ascended`,
      });
      await loadDiscoveries();
    } catch (err) {
      toast({ title: 'Batch ascension failed', description: String(err), variant: 'destructive' });
    } finally {
      setCrystallizing(null);
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
        .in('category', ['proprietary-discovery', 'proprietary-crystallized']);
      setDiscoveries([]);
      toast({ title: 'All cleared', description: 'Discoveries and ascended memories removed.' });
    } catch (err) {
      toast({ title: 'Clear failed', description: String(err), variant: 'destructive' });
    }
  };

  const ascendedCount = discoveries.filter(d => d.crystallized).length;
  const sTier = discoveries.filter(d => d.cjpiScore >= 85);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (discoveries.length === 0) {
    return (
      <div className="border border-border/30 rounded-xl p-8 text-center bg-card/30">
        <Flame className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-foreground font-medium">No discoveries to ascend</p>
        <p className="text-xs text-muted-foreground mt-1">
          Run the Discovery phase first to find capabilities
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Discoveries', value: discoveries.length, icon: Sparkles },
          { label: 'S-Tier (CJPI≥85)', value: sTier.length, icon: Flame },
          { label: 'Ascended', value: ascendedCount, icon: Lock },
        ].map(s => (
          <div key={s.label} className="px-3 py-3 rounded-xl bg-card/40 border border-border/20 text-center">
            <s.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground font-mono">
          {discoveries.filter(d => !d.crystallized).length} eligible for ascension
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={clearAll}
            disabled={!!crystallizing}
            className="h-7 text-xs gap-1.5"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </Button>
          <Button
            size="sm"
            onClick={ascendAll}
            disabled={!!crystallizing}
            className="h-7 text-xs gap-1.5"
          >
            {crystallizing === 'batch' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Flame className="w-3 h-3" />
            )}
            Ascend All
          </Button>
        </div>
      </div>

      {/* Discovery List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {discoveries.map(d => (
          <div
            key={d.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
              d.crystallized
                ? "bg-primary/5 border-primary/20"
                : "bg-card/30 border-border/20 hover:border-border/40"
            )}
          >
            {d.crystallized ? (
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <Flame className="w-4 h-4 text-muted-foreground shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground font-medium truncate">{d.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {d.chain.length > 0
                  ? d.chain.join(' → ')
                  : `${d.nodeA} × ${d.nodeB}`} • {d.tier}
              </p>
              {d.description && (
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2 leading-relaxed">
                  {d.description}
                </p>
              )}
            </div>

            <span className={cn(
              "text-xs font-mono font-bold",
              d.cjpiScore >= 85 ? "text-amber-400" : d.cjpiScore >= 60 ? "text-primary" : "text-muted-foreground"
            )}>
              {d.cjpiScore}
            </span>

            {!d.crystallized && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => ascend(d)}
                disabled={!!crystallizing}
                className="h-7 text-[10px] gap-1"
              >
                {crystallizing === d.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Flame className="w-3 h-3" />
                )}
                Ascend
              </Button>
            )}

            {d.crystallized && (
              <ShieldCheck className="w-4 h-4 text-primary/60 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
