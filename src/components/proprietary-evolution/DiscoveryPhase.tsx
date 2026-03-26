/**
 * ASCENSION Phase — Discovery Engine
 * Runs multi-primitive chain collisions between the Auxiliary Primitive (user's capability surface)
 * and the 40-primitive substrate matrix.
 * 
 * The Auxiliary Node is a first-class participant with its own capability verbs and sector.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Play, Pause, RotateCcw, Activity, TrendingUp, Loader2, Trophy, Link2, Layers, Cpu, Trash2, CheckCircle2 } from 'lucide-react';
import { labelPrimitive } from '@/lib/export/primitive-labels';
import { CapabilityMarketplace, type CollisionResult as MarketplaceResult } from './CapabilityMarketplace';
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

// Canonical 40-primitive matrix — must match edge function VALID_NODES exactly
const SUBSTRATE_NODES = [
  'CORE','SYSTEM','BRAIN','MEMORY','DREAM',
  'RIPPLE','ACCESS','IDENTITY','RELAY','AUDIT','NERVE',
  'DECODE','ENCODE','VISION','CORTEX','NEXUS','ECONOMY','SANDBOX','INCLUSIVE','MEDIC','INTEGRATION',
  'SOVEREIGN','ORACLE','CONSCIENCE','TREATY',
  'COMPASS','ECHO','REFLEX',
  'FORGE','LINGUA','HARVEST',
  'EVOLUTION','SHADOW','PHANTOM',
  'IMMUNITY','INTENT',
  'GOVERNANCE','ATLAS','ENGINEER',
  'DEFENSE',
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
  const [selectedCapabilities, setSelectedCapabilities] = useState<Set<string>>(new Set());
  const abortRef = useRef(false);
  const accumulatedResultsRef = useRef<CollisionResult[]>([]);
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
        setSelectedCapabilities(new Set(mapped.map((r: CollisionResult) => r.capability)));
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

  /** Clear all discoveries from the database */
  const clearAllDiscoveries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('artifact_registry')
        .delete()
        .eq('user_id', user.id)
        .eq('category', 'proprietary-discovery');
      setResults([]);
      setDiscoveryHit(null);
      setExpandedIdx(null);
      toast({ title: 'Vault cleared', description: 'All discoveries removed.' });
    } catch (err) {
      toast({ title: 'Clear failed', description: String(err), variant: 'destructive' });
    }
  };

  const startDiscovery = async () => {
    if (!candidateNode) return;
    setRunning(true);
    setProgress(0);
    setPermutations(0);
    setDiscoveryHit(null);
    setExpandedIdx(null);
    abortRef.current = false;
    accumulatedResultsRef.current = [];

    const shuffledNodes = [...SUBSTRATE_NODES].sort(() => Math.random() - 0.5);

    // Shorter initial suspense
    const suspenseDelay = Math.floor(Math.random() * 4000) + 2000;
    await new Promise(r => setTimeout(r, suspenseDelay));
    if (abortRef.current) { setRunning(false); return; }

    try {
      for (let i = 0; i < shuffledNodes.length; i++) {
        if (abortRef.current) break;

        const targetNode = shuffledNodes[i];
        setCurrentTarget(targetNode);
        setPermutations(prev => prev + 1);
        setProgress(Math.round(((i + 1) / shuffledNodes.length) * 100));

        // Shorter delays — first 3 primitives get 2-4s, rest get 100-400ms
        const interNodeDelay = i < 3
          ? Math.floor(Math.random() * 2000) + 2000
          : Math.floor(Math.random() * 300) + 100;
        await new Promise(r => setTimeout(r, interNodeDelay));
        if (abortRef.current) break;

        try {
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
            if (data.candidate_surface && !candidateSurface) {
              setCandidateSurface(data.candidate_surface as CandidateSurface);
            }

            if (data.capabilities && (data.capabilities as any[]).length > 0) {
              // Only take the top-1 weighted result from this collision
              const allCaps = (data.capabilities as Array<{
                name: string;
                cjpi_score: number;
                tier: string;
                chain?: string[];
                chain_depth?: number;
                sectors_crossed?: number;
                synergy_bonus?: number;
                description?: string;
              }>);
              
              const bestCap = allCaps.reduce((best, cap) => 
                !best || cap.cjpi_score > best.cjpi_score ? cap : best, allCaps[0]);
              
              const topResult: CollisionResult = {
                nodeA: candidateSurface?.nodeName || candidateNode,
                nodeB: targetNode,
                capability: bestCap.name,
                cjpiScore: bestCap.cjpi_score,
                tier: bestCap.tier,
                chain: bestCap.chain || [candidateNode, targetNode],
                chainDepth: bestCap.chain_depth || 2,
                sectorsCrossed: bestCap.sectors_crossed || 1,
                synergyBonus: bestCap.synergy_bonus || 0,
                description: bestCap.description || '',
              };
              
              accumulatedResultsRef.current.push(topResult);
              setResults(prev => [topResult, ...prev]);
              setDiscoveryHit(prev => (!prev || topResult.cjpiScore > prev.cjpiScore) ? topResult : prev);
            }
          }
        } catch (fnErr) {
          // Single node failure — continue to next node
          console.warn(`Collision with ${targetNode} failed:`, fnErr);
        }
      }

      // Auto-select all discovered capabilities using ref (not stale state)
      const allAccumulated = accumulatedResultsRef.current;
      setSelectedCapabilities(new Set(allAccumulated.map(r => r.capability)));

      toast({
        title: 'Collision sweep complete',
        description: `Tested ${shuffledNodes.length} primitives. ${allAccumulated.length > 0 ? `${allAccumulated.length} discoveries found. Select capabilities in the marketplace below.` : 'No archetype matches — try richer code.'}`,
      });
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
      apex: 'text-neon-amber', mythic: 'text-neon-purple', relic: 'text-neon-blue',
      prime: 'text-neon-green', mint: 'text-muted-foreground',
    };
    return colors[tier] || 'text-muted-foreground';
  };

  const tierBorder = (tier: string) => {
    const colors: Record<string, string> = {
      apex: 'border-neon-amber/30 bg-neon-amber/5',
      mythic: 'border-neon-purple/20 bg-neon-purple/5',
      relic: 'border-neon-blue/20 bg-neon-blue/5',
      prime: 'border-neon-green/15 bg-neon-green/5',
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
            <Trophy className="w-6 h-6 text-neon-amber shrink-0" />
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
                    {idx === 0 ? `Ψ₄₁ ${node}` : labelPrimitive(node)}
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
          <span className="text-[10px] text-muted-foreground">× 40 primitives × 2-8 depth</span>
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

        {results.length > 0 && !running && (
          <Button
            size="sm"
            variant="destructive"
            onClick={clearAllDiscoveries}
            className="h-8 text-xs gap-1.5"
          >
            <Trash2 className="w-3 h-3" /> Clear Vault
          </Button>
        )}
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

      {/* ═══ Capability Marketplace ═══ */}
      {results.length > 0 && !running && (
        <CapabilityMarketplace
          results={results}
          selectedCapabilities={selectedCapabilities}
          onSelectionChange={setSelectedCapabilities}
          onDiscard={discardDiscovery}
          discardingId={discardingId}
        />
      )}

      {/* Legacy flat list during active scan */}
      {results.length > 0 && running && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Live Discoveries ({results.length})
          </h3>
          <div className="space-y-1.5 max-h-[16rem] overflow-y-auto">
            {results.slice(0, 10).map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/20 bg-card/30">
                <span className={cn("text-[10px] font-mono font-bold uppercase shrink-0", 
                  r.tier === 'apex' ? 'text-neon-amber' : r.tier === 'mythic' ? 'text-neon-purple' : 'text-muted-foreground'
                )}>
                  {r.tier}
                </span>
                <span className="text-xs text-foreground/80 truncate flex-1">{r.capability}</span>
                <span className={cn(
                  "text-xs font-mono font-bold shrink-0",
                  r.cjpiScore >= 85 ? "text-neon-amber" : r.cjpiScore >= 65 ? "text-neon-purple" : "text-muted-foreground"
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
