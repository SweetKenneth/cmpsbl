/**
 * ProcessingStep — Unified Discovery + Ascension behind a single progress bar
 * User sees: animated progress with friendly status messages
 * Behind the scenes: collision cycles + batch ascension
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TraceContext } from '@/lib/vision/trace';

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

const STATUS_MESSAGES = [
  'Reading your code structure…',
  'Mapping function boundaries…',
  'Testing capability interactions…',
  'Evaluating emerging patterns…',
  'Scoring discovered capabilities…',
  'Locking confirmed results…',
  'Finalizing analysis…',
];

interface Props {
  trace: TraceContext | null;
  onComplete: (stats: { discovered: number; ascended: number; topScore: number }) => void;
}

export function ProcessingStep({ trace, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [phase, setPhase] = useState<'discovering' | 'ascending' | 'done'>('discovering');
  const [discovered, setDiscovered] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const abortRef = useRef(false);
  const { toast } = useToast();

  const runPipeline = useCallback(async () => {
    // Phase 1: Discovery
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Not signed in', variant: 'destructive' });
      return;
    }

    // Get candidate node
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: candidate } = await (supabase as any)
      .from('artifact_registry')
      .select('name, metadata')
      .eq('user_id', user.id)
      .eq('category', 'proprietary-evolution')
      .eq('tier', 'candidate')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!candidate) {
      toast({ title: 'No code uploaded', description: 'Go back and upload first.', variant: 'destructive' });
      return;
    }

    const candidateNode = candidate.name.replace('CANDIDATE_', '');
    const shuffled = [...SUBSTRATE_NODES].sort(() => Math.random() - 0.5);
    const BATCH = 4;
    let totalDiscovered = 0;
    let bestScore = 0;

    // Discovery phase — 0% to 75%
    for (let i = 0; i < shuffled.length; i += BATCH) {
      if (abortRef.current) return;

      const batch = shuffled.slice(i, i + BATCH);
      const pct = Math.round(((i + batch.length) / shuffled.length) * 75);
      setProgress(pct);
      setStatusIdx(Math.min(Math.floor(pct / 15), STATUS_MESSAGES.length - 2));

      const results = await Promise.allSettled(
        batch.map(async (targetNode) => {
          const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
            body: {
              module: 'discovery',
              action: 'collide',
              input: {
                candidate_node: candidateNode,
                target_node: targetNode,
                permutation_depth: 7,
                ...(trace ? { trace_id: trace.trace_id, span_id: trace.span_id } : {}),
              },
            },
          });
          if (!error && data?.capabilities?.length > 0) {
            const bestCap = data.capabilities.reduce(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (best: any, cap: any) => (!best || cap.cjpi_score > best.cjpi_score ? cap : best),
              data.capabilities[0]
            );
            // Persist discovery
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('artifact_registry').insert({
              user_id: user.id,
              name: bestCap.name,
              slug: `discovery-${bestCap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
              tier: bestCap.tier,
              category: 'proprietary-discovery',
              description: bestCap.description || '',
              metadata: {
                node_a: candidateNode,
                node_b: targetNode,
                cjpi_score: bestCap.cjpi_score,
                chain: bestCap.chain || [candidateNode, targetNode],
                chain_depth: bestCap.chain_depth || 2,
                persisted_at: new Date().toISOString(),
                ...(trace ? { trace_id: trace.trace_id } : {}),
              },
            });
            return bestCap.cjpi_score as number;
          }
          return null;
        })
      );

      for (const r of results) {
        if (r.status === 'fulfilled' && r.value !== null) {
          totalDiscovered++;
          if (r.value > bestScore) bestScore = r.value;
        }
      }
      setDiscovered(totalDiscovered);
      setTopScore(bestScore);

      // Small delay between batches for rate control
      if (i + BATCH < shuffled.length) {
        await new Promise(r => setTimeout(r, 150));
      }
    }

    // Phase 2: Batch ascension — 75% to 95%
    setPhase('ascending');
    setProgress(80);
    setStatusIdx(STATUS_MESSAGES.length - 2);

    try {
      const { data: ascResult, error: ascError } = await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'ascend',
          action: 'batch-lock',
          input: { min_cjpi: 1 },
        },
      });

      if (ascError) throw ascError;

      setProgress(95);
      setStatusIdx(STATUS_MESSAGES.length - 1);

      await new Promise(r => setTimeout(r, 800));

      setProgress(100);
      setPhase('done');

      const ascendedCount = ascResult?.ascended_count || totalDiscovered;

      setTimeout(() => {
        onComplete({
          discovered: totalDiscovered,
          ascended: ascendedCount,
          topScore: bestScore,
        });
      }, 1000);
    } catch (err) {
      toast({ title: 'Analysis error', description: String(err), variant: 'destructive' });
    }
  }, [trace, toast, onComplete]);

  useEffect(() => {
    runPipeline();
    return () => { abortRef.current = true; };
  }, [runPipeline]);

  const statusMessage = STATUS_MESSAGES[statusIdx];

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-bold text-foreground">Analysis Complete</p>
          <p className="text-sm text-muted-foreground">
            {discovered} capabilities discovered
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12 space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Analyzing Your Code</h2>
        <p className="text-sm text-muted-foreground">
          Testing your code against the substrate to discover new capabilities
        </p>
      </div>

      {/* Main progress */}
      <div className="space-y-4">
        <Progress value={progress} className="h-3 rounded-full" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">{statusMessage}</span>
          </div>
          <span className="text-sm font-bold text-foreground tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/20 bg-card/40 p-4 text-center">
          <Sparkles className="w-4 h-4 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground tabular-nums">{discovered}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Capabilities Found</p>
        </div>
        <div className="rounded-xl border border-border/20 bg-card/40 p-4 text-center">
          <div className={cn(
            "w-4 h-4 mx-auto mb-2 rounded-full",
            topScore >= 85 ? "bg-neon-amber" : topScore >= 60 ? "bg-primary" : "bg-muted-foreground"
          )} />
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {topScore > 0 ? topScore : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Top Score</p>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="text-center">
        <span className={cn(
          "text-[10px] font-mono px-3 py-1 rounded-full border",
          phase === 'ascending'
            ? "text-primary border-primary/20 bg-primary/5"
            : "text-muted-foreground border-border/20 bg-muted/10"
        )}>
          {phase === 'discovering' ? 'DISCOVERY PHASE' : 'LOCKING RESULTS'}
        </span>
      </div>
    </div>
  );
}
