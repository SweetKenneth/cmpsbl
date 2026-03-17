/**
 * CRYSTALLIZATION Phase — Lock winning capabilities into deterministic memories
 * Structurally dependent on the developer's Candidate Node
 */

import { useState, useEffect } from 'react';
import { Diamond, Lock, CheckCircle2, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
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
  crystallized: boolean;
  description: string;
  chain: string[];
}

export function CrystallizationPhase() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [crystallizing, setCrystallizing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDiscoveries();
  }, []);

  const loadDiscoveries = async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('artifact_registry')
      .select('id, name, metadata, tier, description')
      .in('category', ['proprietary-discovery', 'proprietary-crystallized'])
      .order('created_at', { ascending: false })
      .limit(100);

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
          crystallized: meta.crystallized === true,
          description: d.description || '',
          chain: (meta.chain as string[]) || [meta.node_a, meta.node_b].filter(Boolean),
        };
      }));
    }
    setLoading(false);
  };

  const crystallize = async (discovery: Discovery) => {
    setCrystallizing(discovery.id);
    try {
      const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'crystallize',
          action: 'lock',
          input: { discovery_id: discovery.id },
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Crystallization failed');

      setDiscoveries(prev =>
        prev.map(d => d.id === discovery.id ? { ...d, crystallized: true } : d)
      );
      toast({ title: 'Capability crystallized', description: `${discovery.name} is now locked` });
    } catch (err) {
      toast({ title: 'Crystallization failed', description: String(err), variant: 'destructive' });
    } finally {
      setCrystallizing(null);
    }
  };

  const crystallizeAll = async () => {
    setCrystallizing('batch');
    try {
      const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'crystallize',
          action: 'batch-lock',
          input: { min_cjpi: 70 },
        },
      });

      if (error) throw error;
      toast({
        title: 'Batch crystallization complete',
        description: `${data?.crystallized_count || 0} capabilities locked`,
      });
      await loadDiscoveries();
    } catch (err) {
      toast({ title: 'Batch crystallization failed', description: String(err), variant: 'destructive' });
    } finally {
      setCrystallizing(null);
    }
  };

  const sTier = discoveries.filter(d => d.cjpiScore >= 85);
  const crystallizedCount = discoveries.filter(d => d.crystallized).length;

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
        <Diamond className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-foreground font-medium">No discoveries to crystallize</p>
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
          { label: 'S-Tier (CJPI≥85)', value: sTier.length, icon: Diamond },
          { label: 'Crystallized', value: crystallizedCount, icon: Lock },
        ].map(s => (
          <div key={s.label} className="px-3 py-3 rounded-xl bg-card/40 border border-border/20 text-center">
            <s.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Batch Action */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-mono">
          {discoveries.filter(d => !d.crystallized && d.cjpiScore >= 70).length} eligible for crystallization
        </p>
        <Button
          size="sm"
          onClick={crystallizeAll}
          disabled={!!crystallizing}
          className="h-7 text-xs gap-1.5"
        >
          {crystallizing === 'batch' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Diamond className="w-3 h-3" />
          )}
          Crystallize All (CJPI≥70)
        </Button>
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
              <Diamond className="w-4 h-4 text-muted-foreground shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground font-medium truncate">{d.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {d.nodeA} × {d.nodeB} • {d.tier}
              </p>
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
                onClick={() => crystallize(d)}
                disabled={!!crystallizing}
                className="h-7 text-[10px] gap-1"
              >
                {crystallizing === d.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                Lock
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
