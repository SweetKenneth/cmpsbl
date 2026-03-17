/**
 * ASCENSION Phase — Discovery Engine
 * Runs multi-node chain collisions between Candidate #41 and the 40-node substrate matrix.
 * Explores 2-6 node chain depths with cross-sector synergy scoring.
 * Stops when a capability chain with CJPI ≥ 90 is discovered.
 */

import { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, RotateCcw, Activity, TrendingUp, Loader2, Trophy, Link2, Layers } from 'lucide-react';
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
  chain?: string[];
  chainDepth?: number;
  sectorsCrossed?: number;
  synergyBonus?: number;
  description?: string;
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
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
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
        .select('name, metadata, tier, description')
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
            chain: meta.chain || [meta.node_a, meta.node_b],
            chainDepth: Number(meta.chain_depth || 2),
            sectorsCrossed: Number(meta.sectors_crossed || 1),
            synergyBonus: Number(meta.synergy_bonus || 0),
            description: d.description || '',
          };
        });
        setResults(mapped);
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
    setExpandedIdx(null);
    abortRef.current = false;

    const shuffledNodes = [...SUBSTRATE_NODES].sort(() => Math.random() - 0.5);

    // Suspense delay: let the graph spin 5-14 seconds before first collision
    const suspenseDelay = Math.floor(Math.random() * 10000) + 5000;
    await new Promise(r => setTimeout(r, suspenseDelay));
    if (abortRef.current) { setRunning(false); return; }

    try {
      for (let i = 0; i < shuffledNodes.length; i++) {
        if (abortRef.current) break;

        const targetNode = shuffledNodes[i];
        setCurrentTarget(targetNode);
        setPermutations(prev => prev + 1);
        setProgress(Math.round(((i + 1) / shuffledNodes.length) * 100));

        // Suspense pacing for early nodes
        const interNodeDelay = i < 3
          ? Math.floor(Math.random() * 6000) + 6000
          : Math.floor(Math.random() * 600) + 150;
        await new Promise(r => setTimeout(r, interNodeDelay));
        if (abortRef.current) break;

        // Request deeper chains — permutation_depth 5 enables 2-6 node chains
        const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
          body: {
            module: 'discovery',
            action: 'collide',
            input: {
              candidate_node: candidateNode,
              target_node: targetNode,
              permutation_depth: 5,
            },
          },
        });

        if (!error && data?.capabilities) {
          const newResults: CollisionResult[] = (data.capabilities as Array<{
            name: string;
            cjpi_score: number;
            tier: string;
            chain?: string[];
            chain_depth?: number;
            sectors_crossed?: number;
            synergy_bonus?: number;
            description?: string;
          }>).map((cap) => ({
            nodeA: candidateNode,
            nodeB: targetNode,
            capability: cap.name,
            cjpiScore: cap.cjpi_score,
            tier: cap.tier,
            chain: cap.chain || [candidateNode, targetNode],
            chainDepth: cap.chain_depth || 2,
            sectorsCrossed: cap.sectors_crossed || 1,
            synergyBonus: cap.synergy_bonus || 0,
            description: cap.description || '',
          }));
          setResults(prev => [...newResults, ...prev]);

          // Check for CJPI ≥ 90 hit — stop discovery
          const hit = newResults.find(r => r.cjpiScore >= CJPI_THRESHOLD);
          if (hit) {
            setDiscoveryHit(hit);
            toast({
              title: '🎯 High-value chain discovered',
              description: `${hit.capability} — ${hit.chainDepth}-node chain, CJPI ${hit.cjpiScore}`,
            });
            break;
          }
        }
      }

      if (!abortRef.current && !discoveryHit) {
        toast({
          title: 'Collision sweep complete',
          description: `Tested ${shuffledNodes.length} nodes with multi-chain exploration. No CJPI ≥ ${CJPI_THRESHOLD} found — try re-ingesting with richer code.`,
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

  const tierBorder = (tier: string) => {
    const colors: Record<string, string> = {
      apex: 'border-amber-500/30 bg-amber-500/5',
      mythic: 'border-purple-500/20 bg-purple-500/5',
      relic: 'border-blue-500/20 bg-blue-500/5',
      prime: 'border-emerald-500/15 bg-emerald-500/5',
      mint: 'border-border/20 bg-muted/10',
    };
    return colors[tier] || 'border-border/20 bg-muted/10';
  };

  const collisionEvents = results.map(r => ({
    targetNode: r.nodeB,
    cjpiScore: r.cjpiScore,
    tier: r.tier,
    active: false,
  }));

  // Stats
  const apexCount = results.filter(r => r.cjpiScore >= 92).length;
  const maxChainDepth = results.length > 0 ? Math.max(...results.map(r => r.chainDepth || 2)) : 0;
  const maxSectors = results.length > 0 ? Math.max(...results.map(r => r.sectorsCrossed || 1)) : 0;

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
        <div className={cn("rounded-xl p-4 flex flex-col gap-2 border", tierBorder(discoveryHit.tier))}>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {(discoveryHit.chainDepth || 2) > 2 ? 'Multi-Chain ' : ''}Capability Discovered — CJPI {discoveryHit.cjpiScore}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                {discoveryHit.capability}
              </p>
            </div>
            <span className={cn("text-xs font-mono font-bold uppercase", tierColor(discoveryHit.tier))}>
              {discoveryHit.tier}
            </span>
          </div>
          {/* Chain visualization */}
          {discoveryHit.chain && discoveryHit.chain.length > 2 && (
            <div className="flex items-center gap-1 flex-wrap mt-1">
              {discoveryHit.chain.map((node, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 rounded",
                    idx === 0 ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"
                  )}>
                    {node}
                  </span>
                  {idx < discoveryHit.chain!.length - 1 && (
                    <span className="text-muted-foreground/40 text-[8px]">→</span>
                  )}
                </span>
              ))}
              <span className="text-[8px] font-mono text-muted-foreground ml-2">
                {discoveryHit.sectorsCrossed || 1} sectors • {discoveryHit.chainDepth || 2} nodes
              </span>
            </div>
          )}
          {discoveryHit.description && (
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
              {discoveryHit.description}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-mono text-primary">{candidateNode}</span>
          <span className="text-[10px] text-muted-foreground">× 40 nodes × 2-6 depth</span>
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
          onClick={() => { setResults([]); setProgress(0); setPermutations(0); setDiscoveryHit(null); setExpandedIdx(null); }}
          className="h-8 text-xs gap-1.5"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </Button>
      </div>

      {/* Progress */}
      {running && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Chaining: {currentTarget || '...'} ({permutations}/{SUBSTRATE_NODES.length})</span>
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
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Permutations', value: permutations, icon: Activity },
          { label: 'Discoveries', value: results.length, icon: Zap },
          { label: 'Apex Chains', value: apexCount, icon: TrendingUp },
          { label: 'Max Depth', value: maxChainDepth > 0 ? `${maxChainDepth}N` : '—', icon: Layers },
        ].map(s => (
          <div key={s.label} className="px-2 py-3 rounded-xl bg-card/40 border border-border/20 text-center">
            <s.icon className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-[9px] font-mono text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Discovered Capabilities ({results.length})
          </h3>
          <div className="space-y-1.5 max-h-[28rem] overflow-y-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg transition-colors cursor-pointer",
                  tierBorder(r.tier),
                  "border"
                )}
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              >
                {/* Header row */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className={cn("text-[10px] font-mono font-bold uppercase shrink-0", tierColor(r.tier))}>
                    {r.tier}
                  </span>
                  <span className="text-xs text-foreground/80 truncate flex-1">{r.capability}</span>
                  
                  {/* Chain depth badge */}
                  {(r.chainDepth || 2) > 2 && (
                    <span className="flex items-center gap-0.5 text-[9px] font-mono text-muted-foreground shrink-0">
                      <Link2 className="w-2.5 h-2.5" />
                      {r.chainDepth}N
                    </span>
                  )}
                  
                  {/* Sectors badge */}
                  {(r.sectorsCrossed || 1) > 1 && (
                    <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                      {r.sectorsCrossed}S
                    </span>
                  )}

                  <span className={cn(
                    "text-xs font-mono font-bold shrink-0",
                    r.cjpiScore >= CJPI_THRESHOLD ? "text-amber-400" : r.cjpiScore >= 80 ? "text-purple-400" : r.cjpiScore >= 60 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {r.cjpiScore}
                  </span>
                </div>

                {/* Expanded detail */}
                {expandedIdx === i && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border/10 pt-2">
                    {/* Chain visualization */}
                    {r.chain && r.chain.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {r.chain.map((node, idx) => (
                          <span key={idx} className="flex items-center gap-1">
                            <span className={cn(
                              "text-[9px] font-mono px-1.5 py-0.5 rounded",
                              idx === 0 ? "bg-primary/20 text-primary" : "bg-muted/30 text-foreground/70"
                            )}>
                              {node}
                            </span>
                            {idx < r.chain!.length - 1 && (
                              <span className="text-muted-foreground/40 text-[8px]">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="flex gap-3 text-[9px] font-mono text-muted-foreground">
                      <span>Chain: {r.chainDepth || 2} nodes</span>
                      <span>Sectors: {r.sectorsCrossed || 1}</span>
                      {(r.synergyBonus || 0) > 0 && <span>Synergy: +{r.synergyBonus}</span>}
                    </div>

                    {/* Description */}
                    {r.description && (
                      <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                        {r.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
