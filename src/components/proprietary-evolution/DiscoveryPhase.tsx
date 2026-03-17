/**
 * ASCENSION Phase — Discovery Engine
 * Runs interaction cycles between the candidate node and the 40-node substrate matrix.
 * Stops when a capability chain with CJPI ≥ 90 is discovered.
 * With real-time collision graph visualization.
 */

import { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, RotateCcw, Activity, TrendingUp, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CollisionGraph } from './CollisionGraph';

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

const CJPI_THRESHOLD = 90;

export function DiscoveryPhase() {
  const [candidateNode, setCandidateNode] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [permutations, setPermutations] = useState(0);
  const [results, setResults] = useState<CollisionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [discoveryHit, setDiscoveryHit] = useState<CollisionResult | null>(null);
  const abortRef = useRef(false);
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
        const mapped = (data as any[]).map((d: any) => {
          const meta = d.metadata || {};
          return {
            nodeA: String(meta.node_a || 'CANDIDATE'),
            nodeB: String(meta.node_b || ''),
            capability: d.name,
            cjpiScore: Number(meta.cjpi_score || 0),
            tier: d.tier || 'mint',
          };
        });
        setResults(mapped);
        // Check if there's already a ≥90 hit
        const existing90 = mapped.find(r => r.cjpiScore >= CJPI_THRESHOLD);
        if (existing90) setDiscoveryHit(existing90);
      }
    })();
  }, []);

  const startDiscovery = async () => {
    if (!candidateNode) return;
    setRunning(true);
    setProgress(0);
    setPermutations(0);
    setDiscoveryHit(null);
    abortRef.current = false;

    // Randomize the node order so each run starts on a different node
    const shuffledNodes = [...SUBSTRATE_NODES].sort(() => Math.random() - 0.5);

    // Suspense delay: let the graph spin 5-14 seconds before first collision
    const suspenseDelay = Math.floor(Math.random() * 10000) + 5000; // 5000-14000ms
    await new Promise(r => setTimeout(r, suspenseDelay));
    if (abortRef.current) { setRunning(false); return; }

    try {
      for (let i = 0; i < shuffledNodes.length; i++) {
        if (abortRef.current) break;

        const targetNode = shuffledNodes[i];
        setCurrentTarget(targetNode);
        setPermutations(prev => prev + 1);
        setProgress(Math.round(((i + 1) / shuffledNodes.length) * 100));

        // Random inter-node delay (6-11 seconds) for first few nodes to build suspense
        const interNodeDelay = i < 3
          ? Math.floor(Math.random() * 6000) + 6000   // 6-11s for first 3 nodes
          : Math.floor(Math.random() * 600) + 150;     // 150-750ms after warm-up
        await new Promise(r => setTimeout(r, interNodeDelay));
        if (abortRef.current) break;

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

          // Check for CJPI ≥ 90 hit — stop discovery
          const hit = newResults.find(r => r.cjpiScore >= CJPI_THRESHOLD);
          if (hit) {
            setDiscoveryHit(hit);
            toast({
              title: '🎯 High-value capability discovered',
              description: `${hit.capability} scored CJPI ${hit.cjpiScore} — Discovery complete.`,
            });
            break;
          }
        }
      }

      if (!abortRef.current && !discoveryHit) {
        toast({
          title: 'Collision sweep complete',
          description: `Tested ${shuffledNodes.length} nodes. No CJPI ≥ ${CJPI_THRESHOLD} capability found — try a deeper permutation or re-ingest evolved code.`,
        });
      }
    } catch (err) {
      console.error('Discovery error:', err);
      toast({ title: 'Discovery error', description: String(err), variant: 'destructive' });
    } finally {
      setRunning(false);
      setCurrentTarget(null);
    }
  };

  const stopDiscovery = () => {
    abortRef.current = true;
  };

  const tierColor = (tier: string) => {
    const colors: Record<string, string> = {
      apex: 'text-amber-400', mythic: 'text-purple-400', relic: 'text-blue-400',
      prime: 'text-emerald-400', mint: 'text-muted-foreground',
    };
    return colors[tier] || 'text-muted-foreground';
  };

  const collisionEvents = results.map(r => ({
    targetNode: r.nodeB,
    cjpiScore: r.cjpiScore,
    tier: r.tier,
    active: false,
  }));

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
        <p className="text-sm text-foreground font-medium">No candidate node registered</p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete the Ingest phase first to register a candidate
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Discovery Hit Banner */}
      {discoveryHit && !running && (
        <div className="border border-amber-500/30 rounded-xl p-4 bg-amber-500/5 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Capability Discovered — CJPI {discoveryHit.cjpiScore}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {discoveryHit.capability} • {discoveryHit.nodeA} × {discoveryHit.nodeB}
            </p>
          </div>
          <span className={cn("text-xs font-mono font-bold uppercase", tierColor(discoveryHit.tier))}>
            {discoveryHit.tier}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-mono text-primary">{candidateNode}</span>
          <span className="text-[10px] text-muted-foreground">× 40 nodes</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/20">
          <span className="text-[9px] font-mono text-muted-foreground">Target: CJPI ≥ {CJPI_THRESHOLD}</span>
        </div>

        <div className="flex-1" />

        {running ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={stopDiscovery}
            className="h-8 text-xs gap-1.5"
          >
            <Pause className="w-3 h-3" /> Stop
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={startDiscovery}
            className="h-8 text-xs gap-1.5"
          >
            <Play className="w-3 h-3" /> Start Ascension Cycle
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => { setResults([]); setProgress(0); setPermutations(0); setDiscoveryHit(null); }}
          className="h-8 text-xs gap-1.5"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </Button>
      </div>

      {/* Progress */}
      {running && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Colliding: {currentTarget || '...'} ({permutations}/{SUBSTRATE_NODES.length})</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Collision Graph Visualization */}
      {(running || results.length > 0) && (
        <CollisionGraph
          candidateNode={candidateNode}
          collisions={collisionEvents}
          running={running}
          currentTarget={currentTarget}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Permutations', value: permutations, icon: Activity },
          { label: 'Discoveries', value: results.length, icon: Zap },
          { label: `CJPI ≥ ${CJPI_THRESHOLD}`, value: results.filter(r => r.cjpiScore >= CJPI_THRESHOLD).length, icon: TrendingUp },
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
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  r.cjpiScore >= CJPI_THRESHOLD
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-muted/10 hover:bg-muted/20"
                )}
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
                  r.cjpiScore >= CJPI_THRESHOLD ? "text-amber-400" : r.cjpiScore >= 60 ? "text-primary" : "text-muted-foreground"
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
