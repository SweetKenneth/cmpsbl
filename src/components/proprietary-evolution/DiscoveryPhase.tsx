/**
 * ASCENSION Phase — Discovery Engine
 * Runs multi-node chain collisions between Node 41 (user's capability surface)
 * and the 40-node substrate matrix.
 * 
 * Node 41 is a first-class participant with its own capability verbs and sector.
 */

import { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, RotateCcw, Activity, TrendingUp, Loader2, Trophy, Link2, Layers, Cpu, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CollisionGraph } from './CollisionGraph';

interface CandidateSurface {
  nodeName: string;
  capabilities: string[];
  sector: string;
  domain: string;
  description?: string;
  components?: string[];
}

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

// No CJPI threshold — all discoveries are surfaced for the user to curate

export function DiscoveryPhase() {
  const [candidateNode, setCandidateNode] = useState<string | null>(null);
  const [candidateSurface, setCandidateSurface] = useState<CandidateSurface | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [permutations, setPermutations] = useState(0);
  const [results, setResults] = useState<CollisionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [discoveryHit, setDiscoveryHit] = useState<CollisionResult | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [discardingId, setDiscardingId] = useState<string | null>(null);
  const abortRef = useRef(false);
  const { toast } = useToast();

  // Load registered candidate node + derived surface (user-scoped)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('artifact_registry')
        .select('name, slug, metadata')
        .eq('user_id', user.id)
        .eq('category', 'proprietary-evolution')
        .eq('tier', 'candidate')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setCandidateNode(data.name.replace('CANDIDATE_', ''));
        // Load derived capability surface from metadata
        const meta = data.metadata || {};
        if (meta.derived_surface) {
          setCandidateSurface(meta.derived_surface as CandidateSurface);
        }
      }
      setLoading(false);
    })();
  }, []);

  // Load existing discovery results (user-scoped)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('artifact_registry')
        .select('name, metadata, tier, description')
        .eq('user_id', user.id)
        .eq('category', 'proprietary-discovery')
        .order('created_at', { ascending: false })
        .limit(500);

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
        const bestExisting = mapped.reduce((best: CollisionResult | null, r: CollisionResult) => (!best || r.cjpiScore > best.cjpiScore) ? r : best, null as CollisionResult | null);
        if (bestExisting) setDiscoveryHit(bestExisting);

        // Try to get surface from discovery metadata
        if (!candidateSurface && data.length > 0) {
          const firstMeta = (data as any[])[0]?.metadata;
          if (firstMeta?.candidate_surface) {
            setCandidateSurface(firstMeta.candidate_surface as CandidateSurface);
          }
        }
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

    let foundHit: CollisionResult | null = null;
    const shuffledNodes = [...SUBSTRATE_NODES].sort(() => Math.random() - 0.5);

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

        const interNodeDelay = i < 3
          ? Math.floor(Math.random() * 6000) + 6000
          : Math.floor(Math.random() * 600) + 150;
        await new Promise(r => setTimeout(r, interNodeDelay));
        if (abortRef.current) break;

        const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
          body: {
            module: 'discovery',
            action: 'collide',
            input: {
              candidate_node: candidateNode,
              target_node: targetNode,
              permutation_depth: 7,
            },
          },
        });

        if (!error && data) {
          // Capture candidate surface from first response
          if (data.candidate_surface && !candidateSurface) {
            setCandidateSurface(data.candidate_surface as CandidateSurface);
          }

          if (data.capabilities) {
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
              nodeA: candidateSurface?.nodeName || candidateNode,
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

            const hit = newResults.reduce((best: CollisionResult | null, r: CollisionResult) => (!best || r.cjpiScore > best.cjpiScore) ? r : best, null as CollisionResult | null);
            if (hit && hit.cjpiScore >= 70) {
              foundHit = hit;
              setDiscoveryHit(hit);
              toast({
                title: '🎯 High-value chain discovered',
                description: `${hit.capability} — ${hit.chainDepth}-node chain, CJPI ${hit.cjpiScore}`,
              });
              break;
            } else if (hit) {
              setDiscoveryHit(prev => (!prev || hit.cjpiScore > prev.cjpiScore) ? hit : prev);
            }
          }
        }
      }

      if (!abortRef.current && !foundHit) {
        toast({
          title: 'Collision sweep complete',
          description: `Tested ${shuffledNodes.length} nodes. ${results.length > 0 ? 'Review discoveries in the vault below.' : 'No archetype matches — try richer code.'}`,
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

  const stopDiscovery = () => { abortRef.current = true; };

  /** Discard a discovery from the database */
  const discardDiscovery = async (result: CollisionResult, idx: number) => {
    setDiscardingId(`${idx}`);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // Find and delete matching artifact_registry entry
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: matches } = await (supabase as any)
        .from('artifact_registry')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', 'proprietary-discovery')
        .eq('name', result.capability)
        .limit(1);
      if (matches && matches.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('artifact_registry')
          .delete()
          .eq('id', matches[0].id)
          .eq('user_id', user.id);
      }
      setResults(prev => prev.filter((_, i) => i !== idx));
      toast({ title: 'Discovery discarded', description: `${result.capability} removed from vault.` });
    } catch (err) {
      toast({ title: 'Discard failed', description: String(err), variant: 'destructive' });
    } finally {
      setDiscardingId(null);
    }
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

  const apexCount = results.filter(r => r.cjpiScore >= 92).length;
  const maxChainDepth = results.length > 0 ? Math.max(...results.map(r => r.chainDepth || 2)) : 0;

  const node41DisplayName = candidateSurface?.nodeName || candidateNode || '#41';

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
        <p className="text-xs text-muted-foreground mt-1">Complete the Ingest phase first to register a candidate</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══ Candidate Surface Identity Card ═══ */}
      {candidateSurface && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-primary font-bold">
              Ψ₄₁ {candidateSurface.nodeName}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30">
              {candidateSurface.sector}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {candidateSurface.capabilities.map((verb, i) => (
              <span key={i} className="text-[9px] font-mono text-primary/70 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/10">
                {verb}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Discovery Hit Banner */}
      {discoveryHit && !running && (
        <div className={cn("rounded-xl p-4 flex flex-col gap-2 border", tierBorder(discoveryHit.tier))}>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {(discoveryHit.chainDepth || 2) > 2 ? 'Multi-Chain ' : ''}Capability Discovered — CJPI {discoveryHit.cjpiScore}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{discoveryHit.capability}</p>
            </div>
            <span className={cn("text-xs font-mono font-bold uppercase", tierColor(discoveryHit.tier))}>
              {discoveryHit.tier}
            </span>
          </div>
          {discoveryHit.chain && discoveryHit.chain.length > 2 && (
            <div className="flex items-center gap-1 flex-wrap mt-1">
              {discoveryHit.chain.map((node, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 rounded",
                    idx === 0 ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"
                  )}>
                    {idx === 0 ? `Ψ₄₁ ${node}` : node}
                  </span>
                  {idx < discoveryHit.chain!.length - 1 && (
                    <span className="text-muted-foreground/40 text-[8px]">→</span>
                  )}
                </span>
              ))}
            </div>
          )}
          {discoveryHit.description && (
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{discoveryHit.description}</p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-mono text-primary">Ψ₄₁ {node41DisplayName}</span>
          <span className="text-[10px] text-muted-foreground">× 40 nodes × 2-8 depth</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/20">
          <span className="text-[9px] font-mono text-muted-foreground">All CJPI levels eligible</span>
        </div>

        <div className="flex-1" />

        {running ? (
          <Button size="sm" variant="destructive" onClick={stopDiscovery} className="h-8 text-xs gap-1.5">
            <Pause className="w-3 h-3" /> Stop
          </Button>
        ) : (
          <Button size="sm" onClick={startDiscovery} className="h-8 text-xs gap-1.5">
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
            <span>Ψ₄₁ {node41DisplayName} → {currentTarget || '...'} ({permutations}/{SUBSTRATE_NODES.length})</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Collision Graph */}
      {(running || results.length > 0) && (
        <CollisionGraph
          candidateNode={node41DisplayName}
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

      {/* Results List — Discovery Vault */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Discovery Vault ({results.length}) — Keep or discard before crystallization
          </h3>
          <div className="space-y-1.5 max-h-[28rem] overflow-y-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className={cn("rounded-lg transition-colors border", tierBorder(r.tier))}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                >
                  <span className={cn("text-[10px] font-mono font-bold uppercase shrink-0", tierColor(r.tier))}>
                    {r.tier}
                  </span>
                  <span className="text-xs text-foreground/80 truncate flex-1">{r.capability}</span>
                  
                  {(r.chainDepth || 2) > 2 && (
                    <span className="flex items-center gap-0.5 text-[9px] font-mono text-muted-foreground shrink-0">
                      <Link2 className="w-2.5 h-2.5" />
                      {r.chainDepth}N
                    </span>
                  )}
                  
                  {(r.sectorsCrossed || 1) > 1 && (
                    <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                      {r.sectorsCrossed}S
                    </span>
                  )}

                  <span className={cn(
                    "text-xs font-mono font-bold shrink-0",
                    r.cjpiScore >= 85 ? "text-amber-400" : r.cjpiScore >= 65 ? "text-purple-400" : r.cjpiScore >= 45 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {r.cjpiScore}
                  </span>
                </div>

                {expandedIdx === i && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border/10 pt-2">
                    {r.chain && r.chain.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {r.chain.map((node, idx) => (
                          <span key={idx} className="flex items-center gap-1">
                            <span className={cn(
                              "text-[9px] font-mono px-1.5 py-0.5 rounded",
                              idx === 0 ? "bg-primary/20 text-primary" : "bg-muted/30 text-foreground/70"
                            )}>
                              {idx === 0 ? `Ψ₄₁ ${node}` : node}
                            </span>
                            {idx < r.chain!.length - 1 && (
                              <span className="text-muted-foreground/40 text-[8px]">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-3 text-[9px] font-mono text-muted-foreground">
                      <span>CJPI: {r.cjpiScore}</span>
                      <span>Depth: {r.chainDepth || 2}</span>
                      <span>Sectors: {r.sectorsCrossed || 1}</span>
                      {(r.synergyBonus || 0) > 0 && <span>Synergy: +{r.synergyBonus}</span>}
                    </div>

                    {r.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {r.description}
                      </p>
                    )}

                    {/* Keep / Discard actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center gap-1 text-[9px] font-mono text-primary/70">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Kept — will appear in Crystallization</span>
                      </div>
                      <div className="flex-1" />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={discardingId === `${i}`}
                        onClick={(e) => { e.stopPropagation(); discardDiscovery(r, i); }}
                      >
                        {discardingId === `${i}` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Discard
                      </Button>
                    </div>
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
