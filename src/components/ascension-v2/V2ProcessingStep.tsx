/**
 * V2 Processing Step — Discovery phase with orchestrator integration
 * Uses V2 orchestrator for deterministic node ordering and audit chain.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Loader2, Zap, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  registerDiscovery,
  beginLocking,
  getNodeOrdering,
  getSnapshot,
  retry,
  type DiscoveredCapability,
} from '@/lib/ascension-v2';
import { appendAudit } from '@/lib/ascension-v2/audit-chain';

// 40 substrate primitives
const SUBSTRATE_NODES = [
  'DEFENSE','GOVERNANCE','CONSCIENCE','COMPASS','AUDIT','BEACON',
  'BRAIN','MEMORY','CORTEX','ORACLE','INTENT','LINGUA',
  'IDENTITY','TRUST','VERITAS','RAMPART','SIEVE','GAUNTLET',
  'BASTION','WATCHTOWER','ATLAS','RELAY','FAILSAFE','DREAM',
  'NERVE','REFLEX','EVOLUTION','VISION','ARCHITECT','MONOLITH',
  'OBSIDIAN','WRAITH','RAPTOR','PRIMITIVE','AUTOMATON','SENTINEL',
  'PHANTOM','CIPHER','NEXUS','FORGE',
];

const STATUS_MESSAGES = [
  'Initializing substrate collision…',
  'Scanning function boundaries…',
  'Running 40-Primitive collision matrix…',
  'Scoring CJPI compatibility…',
  'Evaluating capability chains…',
  'Quality-gating discoveries…',
  'Finalizing analysis…',
];

interface Props {
  onComplete: (caps: DiscoveredCapability[]) => void;
}

export function V2ProcessingStep({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [discovered, setDiscovered] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [done, setDone] = useState(false);
  const abortRef = useRef(false);
  const { toast } = useToast();

  const runPipeline = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Not signed in', variant: 'destructive' });
      return;
    }

    // Get candidate from v2 category
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: candidate } = await (supabase as any)
      .from('artifact_registry')
      .select('name, metadata')
      .eq('user_id', user.id)
      .eq('category', 'proprietary-evolution-v2')
      .eq('tier', 'candidate')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!candidate) {
      toast({ title: 'No code uploaded', description: 'Go back and upload first.', variant: 'destructive' });
      return;
    }

    const candidateNode = candidate.name.replace('CANDIDATE_', '');
    
    // Use deterministic ordering from orchestrator (seeded by fingerprint)
    const orderedNodes = getNodeOrdering(SUBSTRATE_NODES);
    appendAudit('discovery_start', `${orderedNodes.length} primitives`);

    const BATCH = 4;
    let totalDiscovered = 0;
    let bestScore = 0;
    const allCaps: DiscoveredCapability[] = [];

    for (let i = 0; i < orderedNodes.length; i += BATCH) {
      if (abortRef.current) return;

      const batch = orderedNodes.slice(i, i + BATCH);
      const pct = Math.round(((i + batch.length) / orderedNodes.length) * 75);
      setProgress(pct);
      setStatusIdx(Math.min(Math.floor(pct / 12), STATUS_MESSAGES.length - 2));

      const results = await Promise.allSettled(
        batch.map(async (targetNode) => {
          const callFn = () => supabase.functions.invoke('pf-proprietary-evolution', {
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

          const { data, error } = await retry(callFn);
          if (!error && data?.capabilities?.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const bestCap = data.capabilities.reduce(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (best: any, cap: any) => (!best || cap.cjpi_score > best.cjpi_score ? cap : best),
              data.capabilities[0]
            );

            const cap: DiscoveredCapability = {
              name: bestCap.name,
              cjpiScore: bestCap.cjpi_score,
              tier: bestCap.tier,
              description: bestCap.description || '',
              chain: bestCap.chain || [candidateNode, targetNode],
              chainDepth: bestCap.chain_depth || 2,
            };

            // Register in orchestrator audit chain
            registerDiscovery(cap);

            // Persist to DB with v2 category
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('artifact_registry').insert({
              user_id: user.id,
              name: bestCap.name,
              slug: `v2-discovery-${bestCap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
              tier: bestCap.tier,
              category: 'proprietary-discovery-v2',
              description: bestCap.description || '',
              metadata: {
                node_a: candidateNode,
                node_b: targetNode,
                cjpi_score: bestCap.cjpi_score,
                chain: bestCap.chain || [candidateNode, targetNode],
                chain_depth: bestCap.chain_depth || 2,
                pipeline_version: 'v2',
                persisted_at: new Date().toISOString(),
              },
            });

            allCaps.push(cap);
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

      if (i + BATCH < orderedNodes.length) {
        await new Promise(r => setTimeout(r, 150));
      }
    }

    // Transition to locking
    beginLocking();
    setProgress(80);
    setStatusIdx(STATUS_MESSAGES.length - 1);

    appendAudit('discovery_complete', `${totalDiscovered} found, best=${bestScore}`);

    setDone(true);
    setTimeout(() => onComplete(allCaps), 800);
  }, [toast, onComplete]);

  useEffect(() => {
    runPipeline();
    return () => { abortRef.current = true; };
  }, [runPipeline]);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 animate-in fade-in">
        <CheckCircle2 className="w-12 h-12 text-primary" />
        <p className="text-foreground font-medium">Analysis Complete</p>
        <p className="text-muted-foreground text-xs">{discovered} capabilities discovered</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Analyzing Your Code</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Colliding against the 40-Primitive substrate
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            {STATUS_MESSAGES[statusIdx]}
          </span>
          <span className="text-foreground font-mono">{progress}%</span>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{discovered}</p>
          <p className="text-xs text-muted-foreground">Capabilities Found</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <div className={cn(
            'w-5 h-5 mx-auto mb-1 rounded-full',
            topScore >= 85 ? 'bg-amber-500' : topScore >= 60 ? 'bg-primary' : 'bg-muted-foreground'
          )} />
          <p className="text-2xl font-bold text-foreground">{topScore > 0 ? topScore : '—'}</p>
          <p className="text-xs text-muted-foreground">Top Score</p>
        </div>
      </div>
    </div>
  );
}
