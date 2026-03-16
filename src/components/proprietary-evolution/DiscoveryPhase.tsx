/**
 * DISCOVERY Phase — Collision Chamber
 * Bounces Candidate Node #41 against the 40-node substrate matrix
 */

import { useState, useEffect } from 'react';
import { Zap, Play, Pause, RotateCcw, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CollisionResult {
  nodeA: string;
  nodeB: string;
  capability: string;
  cjpiScore: number;
  tier: string;
}

const SUBSTRATE_NODES = [
  'CORE','BRAIN','MEMORY','NERVE','DECODE','ENCODE','CORTEX','DEFENSE','ORACLE',
  'CONSCIENCE','PHANTOM','HARVEST','EVOLUTION','SHADOW','IMMUNITY','INTENT',
  'GOVERNANCE','ATLAS','FORGE','LINGUA','ECHO','SOVEREIGN','REFLEX','TREATY',
  'ENGINEER','COMPASS','OBSERVER','GENESIS','ANCHOR','PRISM','SENTRY','MEDIC',
  'SIGNAL','TENSOR','ARBITER','FLUX','VECTOR','SYNTH','RELAY','NEXUS',
];

export function DiscoveryPhase() {
  const [candidateNode, setCandidateNode] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [permutations, setPermutations] = useState(0);
  const [results, setResults] = useState<CollisionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load registered candidate node
  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('artifact_registry')
        .select('name, slug')
        .eq('category', 'proprietary-evolution')
        .eq('tier', 'candidate')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setCandidateNode(data.name.replace('CANDIDATE_', ''));
      setLoading(false);
    })();
  }, []);

  // Load existing discovery results
  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('artifact_registry')
        .select('name, metadata, tier')
        .eq('category', 'proprietary-discovery')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setResults((data as any[]).map((d: any) => {
          const meta = d.metadata || {};
          return {
            nodeA: String(meta.node_a || 'CANDIDATE'),
            nodeB: String(meta.node_b || ''),
            capability: d.name,
            cjpiScore: Number(meta.cjpi_score || 0),
            tier: d.tier || 'mint',
          };
        }));
      }
    })();
  }, []);

  const startDiscovery = async () => {
    if (!candidateNode) return;
    setRunning(true);
    setProgress(0);
    setPermutations(0);

    try {
      // Run collision testing against each of the 40 nodes
      for (let i = 0; i < SUBSTRATE_NODES.length; i++) {
        const targetNode = SUBSTRATE_NODES[i];
        setPermutations(prev => prev + 1);
        setProgress(Math.round(((i + 1) / SUBSTRATE_NODES.length) * 100));

        const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
          body: {
            module: 'discovery',
            action: 'collide',
            input: {
              candidate_node: candidateNode,
              target_node: targetNode,
              permutation_depth: 3,
            },
          },
        });

        if (!error && data?.capabilities) {
          const newResults: CollisionResult[] = (data.capabilities as Array<{
            name: string;
            cjpi_score: number;
            tier: string;
          }>).map((cap) => ({
            nodeA: candidateNode,
            nodeB: targetNode,
            capability: cap.name,
            cjpiScore: cap.cjpi_score,
            tier: cap.tier,
          }));
          setResults(prev => [...newResults, ...prev]);
        }

        // Small delay to avoid hammering
        await new Promise(r => setTimeout(r, 150));
      }

      toast({ title: 'Collision sweep complete', description: `Tested ${SUBSTRATE_NODES.length} nodes` });
    } catch (err) {
      console.error('Discovery error:', err);
      toast({ title: 'Discovery error', description: String(err), variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  const tierColor = (tier: string) => {
    const colors: Record<string, string> = {
      apex: 'text-amber-400', mythic: 'text-purple-400', relic: 'text-blue-400',
      prime: 'text-emerald-400', mint: 'text-muted-foreground',
    };
    return colors[tier] || 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!candidateNode) {
    return (
      <div className="border border-border/30 rounded-xl p-8 text-center bg-card/30">
        <Zap className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-foreground font-medium">No Candidate Node registered</p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete the INGEST phase first to create Node #41
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-mono text-primary">{candidateNode}</span>
          <span className="text-[10px] text-muted-foreground">× 40 nodes</span>
        </div>

        <div className="flex-1" />

        <Button
          size="sm"
          onClick={startDiscovery}
          disabled={running}
          className="h-8 text-xs gap-1.5"
        >
          {running ? (
            <><Pause className="w-3 h-3" /> Running...</>
          ) : (
            <><Play className="w-3 h-3" /> Start Collision Test</>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => { setResults([]); setProgress(0); setPermutations(0); }}
          className="h-8 text-xs gap-1.5"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </Button>
      </div>

      {/* Progress */}
      {running && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Colliding: {permutations}/{SUBSTRATE_NODES.length}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Permutations', value: permutations, icon: Activity },
          { label: 'Discoveries', value: results.length, icon: Zap },
          { label: 'S-Tier Hits', value: results.filter(r => r.cjpiScore >= 85).length, icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="px-3 py-3 rounded-xl bg-card/40 border border-border/20 text-center">
            <s.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Discovered Capabilities
          </h3>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                <span className={cn("text-[10px] font-mono font-bold uppercase", tierColor(r.tier))}>
                  {r.tier}
                </span>
                <span className="text-xs text-foreground/80 truncate flex-1">{r.capability}</span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {r.nodeA} × {r.nodeB}
                </span>
                <span className={cn(
                  "text-xs font-mono font-bold",
                  r.cjpiScore >= 85 ? "text-amber-400" : r.cjpiScore >= 60 ? "text-primary" : "text-muted-foreground"
                )}>
                  {r.cjpiScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
