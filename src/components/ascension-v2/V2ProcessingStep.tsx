/**
 * V2 Processing Step — Discovery + Dedup + Auto-Lock
 * Uses V2 orchestrator for deterministic ordering, dedup engine for
 * collapsing duplicates, then auto-actuates the top 4–7 capabilities.
 *
 * No manual lock step — capabilities are sealed automatically.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Loader2, Zap, CheckCircle2, Filter, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  registerDiscovery,
  beginLocking,
  commitAscension,
  getNodeOrdering,
  retry,
  deduplicateCapabilities,
  type DiscoveredCapability,
  type DedupResult,
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
  'Deduplicating discoveries…',
  'Auto-locking top capabilities…',
  'Finalizing…',
];

interface Props {
  onComplete: (caps: DiscoveredCapability[], dedup: DedupResult) => void;
}

export function V2ProcessingStep({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [discovered, setDiscovered] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [dedupResult, setDedupResult] = useState<DedupResult | null>(null);
  const [currentBatch, setCurrentBatch] = useState<string[]>([]);
  const [recentHits, setRecentHits] = useState<string[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const abortRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const runPipeline = useCallback(async () => {
    abortRef.current = false;
    setAnalysisError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAnalysisError('Sign in is required before the collision cycle can run.');
      toastRef.current({ title: 'Not signed in', variant: 'destructive' });
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
      setAnalysisError('Upload registration is missing, so the collision engine has no candidate to analyze.');
      toastRef.current({ title: 'No code uploaded', description: 'Go back and upload first.', variant: 'destructive' });
      return;
    }

    const candidateNode = candidate.name.replace('CANDIDATE_', '');

    // Use deterministic ordering from orchestrator (seeded by fingerprint)
    const orderedNodes = getNodeOrdering(SUBSTRATE_NODES);
    appendAudit('discovery_start', `${orderedNodes.length} primitives`);

    const BATCH = 4;
    let totalDiscovered = 0;
    let bestScore = 0;
    let lastFunctionError: string | null = null;
    const allCaps: DiscoveredCapability[] = [];

    // ───────────────────────────────────────────────────────
    // Phase 1: Discovery (0–70%)
    // ───────────────────────────────────────────────────────
    for (let i = 0; i < orderedNodes.length; i += BATCH) {
      if (abortRef.current) return;

      const batch = orderedNodes.slice(i, i + BATCH);
      setCurrentBatch(batch);
      const pct = Math.round(((i + batch.length) / orderedNodes.length) * 70);
      setProgress(pct);
      setStatusIdx(Math.min(Math.floor(pct / 14), 4));

      const results = await Promise.allSettled(
        batch.map(async (targetNode) => {
          try {
            const data = await retry(async () => {
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

              if (error) throw error;
              return data;
            });

            if (data?.capabilities?.length > 0) {
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

              registerDiscovery(cap);
              allCaps.push(cap);
              setRecentHits((prev) => [cap.name, ...prev.filter((name) => name !== cap.name)].slice(0, 4));
              return bestCap.cjpi_score as number;
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (!lastFunctionError) {
              lastFunctionError = message;
            }
            appendAudit('collision_error', `${targetNode}: ${message}`);
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

    appendAudit('discovery_complete', `${totalDiscovered} raw discoveries`);

    if (allCaps.length === 0) {
      const message = lastFunctionError || 'No capabilities emerged from the collision cycle.';
      setAnalysisError(message);
      appendAudit('discovery_empty', message);
      toastRef.current({ title: 'Analysis produced no capabilities', description: message, variant: 'destructive' });
      return;
    }

    // ───────────────────────────────────────────────────────
    // Phase 2: Dedup (70–85%)
    // ───────────────────────────────────────────────────────
    setProgress(75);
    setStatusIdx(5);

    const dedup = deduplicateCapabilities(allCaps);
    setDedupResult(dedup);
    appendAudit('dedup_complete', `${dedup.rawCount} → ${dedup.capabilities.length} unique (${dedup.groupCount} groups)`);

    setProgress(80);

    // ───────────────────────────────────────────────────────
    // Phase 3: Auto-Lock (85–95%)
    // ───────────────────────────────────────────────────────
    setStatusIdx(6);
    setProgress(85);
    beginLocking();

    try {
      // Persist deduped capabilities as ascended
      for (const cap of dedup.capabilities) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('artifact_registry').insert({
          user_id: user.id,
          name: cap.name,
          slug: `v2-ascended-${cap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
          tier: cap.tier,
          category: 'proprietary-ascended-v2',
          description: cap.description || '',
          metadata: {
            cjpi_score: cap.cjpiScore,
            chain: [...cap.chain],
            chain_depth: cap.chainDepth,
            pipeline_version: 'v2',
            dedup_raw_count: dedup.rawCount,
            dedup_group_count: dedup.groupCount,
            persisted_at: new Date().toISOString(),
          },
        });
      }

      await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'ascend',
          action: 'batch-lock',
          input: { min_cjpi: 1 },
        },
      });
    } catch {
      // Non-fatal — capabilities are still in memory
      appendAudit('auto_lock_warning', 'Edge function lock call failed, proceeding with local caps');
    }

    commitAscension(dedup.capabilities.length);
    appendAudit('auto_lock_complete', `${dedup.capabilities.length} sealed`);

    setProgress(95);
    setStatusIdx(7);

    setDone(true);
    setTimeout(() => onCompleteRef.current([...dedup.capabilities], dedup), 800);
  }, []);

  useEffect(() => {
    runPipeline();
    return () => { abortRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (analysisError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
        <p className="text-foreground font-medium">Collision cycle failed</p>
        <p className="text-sm text-muted-foreground">{analysisError}</p>
      </div>
    );
  }

  if (done && dedupResult) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 animate-in fade-in">
        <CheckCircle2 className="w-12 h-12 text-primary" />
        <p className="text-foreground font-medium">Analysis Complete</p>
        <p className="text-muted-foreground text-xs">
          {dedupResult.rawCount} discoveries → {dedupResult.capabilities.length} unique capabilities locked
        </p>
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
          <p className="text-xs text-muted-foreground">Raw Discoveries</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          {dedupResult ? (
            <>
              <Filter className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-foreground">{dedupResult.capabilities.length}</p>
              <p className="text-xs text-muted-foreground">Unique Locked</p>
            </>
          ) : (
            <>
              <div className={cn(
                'w-5 h-5 mx-auto mb-1 rounded-full',
                topScore >= 85 ? 'bg-amber-500' : topScore >= 60 ? 'bg-primary' : 'bg-muted-foreground'
              )} />
              <p className="text-2xl font-bold text-foreground">{topScore > 0 ? topScore : '—'}</p>
              <p className="text-xs text-muted-foreground">Top Score</p>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-foreground">Live Collision Batch</p>
          <div className="flex flex-wrap gap-2">
            {currentBatch.length > 0 ? currentBatch.map((primitive) => (
              <span key={primitive} className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-mono text-primary">
                {primitive}
              </span>
            )) : (
              <span className="text-xs text-muted-foreground">Preparing primitives…</span>
            )}
          </div>
        </div>

        <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-foreground">Recent Discoveries</p>
          <div className="space-y-1.5">
            {recentHits.length > 0 ? recentHits.map((hit) => (
              <div key={hit} className="text-xs text-foreground truncate">
                {hit}
              </div>
            )) : (
              <span className="text-xs text-muted-foreground">Waiting for the first capability to surface…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
