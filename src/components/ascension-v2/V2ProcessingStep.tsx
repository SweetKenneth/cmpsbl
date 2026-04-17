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
  getSnapshot,
  type DiscoveredCapability,
  type DedupResult,
  // Phase A — V1 Bridge (gaps 1-6)
  bandDiscovery,
  runV2QualityGate,
  fingerprintSourceFiles,
  logV2Upload,
  logV2Extraction,
  logV2QualityGate,
  logV2ChainParticipation,
  logV2Discovery,
  scoreCollision,
  extractFileContracts,
  type CandidateContractBundle,
  // Phase B — V1 Bridge (gaps 7-11)
  simulateMergeBatch,
  measureDiscoveryDelta,
  recordCollisionOutcome,
  recordV2Confirmation,
  detectV2Drift,
  type CompatibilityReport,
} from '@/lib/ascension-v2';
import { appendAudit } from '@/lib/ascension-v2/audit-chain';
import { CANONICAL_PRIMITIVES } from '@/lib/ascension-v2/canonical-primitives';
// Canonical V1 method for promoting the user's software into Primitive #41 —
// must be registered in the handler registry BEFORE the collision loop
// or every chain involving the candidate resolves to "unknown".
import {
  extractPrimitives,
  buildPrimitiveHandler,
  registerPrimitive,
} from '@/lib/ascension';
import { formatEnhancedCapabilityName } from '@/lib/export/humanize-name';

// Canonical 40-Primitive Matrix (12 Organs · 12 Layers · 8 Engines · 8 Agents)
const SUBSTRATE_NODES = CANONICAL_PRIMITIVES;
const KNOWN_CHAIN_MODULES = new Set<string>([
  ...SUBSTRATE_NODES.map((primitive) => primitive.toUpperCase()),
  'CANDIDATE',
]);

function normalizeDiscoveredChain(
  chain: ReadonlyArray<string>,
  candidateModuleName: string,
  fallbackTarget: string,
): string[] {
  const candidateUpper = candidateModuleName.trim().toUpperCase();
  const fallbackUpper = fallbackTarget.trim().toUpperCase();

  const normalized = chain
    .map((moduleName) => {
      const upper = moduleName.trim().toUpperCase();
      if (!upper) return null;
      if (upper === candidateUpper || upper.startsWith('CANDIDATE_') || upper.startsWith('Ψ₄₁_')) {
        return 'CANDIDATE';
      }
      if (KNOWN_CHAIN_MODULES.has(upper)) {
        return upper;
      }
      return 'CANDIDATE';
    })
    .filter((moduleName, index, arr): moduleName is string => Boolean(moduleName) && (index === 0 || moduleName !== arr[index - 1]));

  if (normalized.length === 0) {
    return ['CANDIDATE', fallbackUpper];
  }

  if (normalized[0] !== 'CANDIDATE') {
    normalized.unshift('CANDIDATE');
  }

  if (!normalized.includes(fallbackUpper)) {
    normalized.push(fallbackUpper);
  }

  return normalized;
}

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

    // Phase A: capture runId once for ingest-audit correlation (#4)
    const runId = getSnapshot().runId || `v2_${Date.now().toString(36)}`;

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

    // ───────────────────────────────────────────────────────
    // Phase 0: Promote user software → Primitive #41
    // (canonical V1 method: extract → register handler → registry)
    // Without this step, the candidate is an "unknown primitive"
    // and every collision chain fails to resolve a real handler.
    //
    // V1-Bridge enrichment (Phase A — gaps 1-6):
    //   • per-file FNV-1a fingerprints  (#3 scan-integrity)
    //   • interface contract + env profile  (#6 contract-extractor)
    //   • quality gate over extracted primitives  (#2 quality-gate)
    //   • ingest audit for upload + extraction + quality-gate  (#4)
    // ───────────────────────────────────────────────────────
    let candidateContractBundle: CandidateContractBundle | null = null;
    let acceptedPrimitiveNames = new Set<string>();
    const phase0Start = performance.now();

    try {
      const sourceFiles = (candidate.metadata?.source_files ?? []) as Array<{
        name?: string;
        content?: string;
        extension?: string;
      }>;

      const extractable = sourceFiles
        .filter((f) => typeof f?.content === 'string' && (f.content as string).length > 0)
        .map((f) => ({
          name: f.name || `${candidateNode}.src`,
          content: f.content as string,
          language: (candidate.metadata?.language as string) || f.extension || 'typescript',
        }));

      // ── Gap #3: per-file integrity fingerprints ──
      if (extractable.length > 0) {
        const integrity = fingerprintSourceFiles(extractable);
        appendAudit(
          'integrity_fingerprints',
          `${integrity.fingerprints.length} files · ${integrity.uniqueHashes} unique · ${integrity.totalBytes}B`,
        );
        // ── Gap #4: ingest audit (upload event per file) ──
        for (const fp of integrity.fingerprints) {
          logV2Upload(fp.filename, fp.byteLength, extractable[0].language, user.id, runId);
        }
      }

      // ── Gap #11: semantic drift / ecosystem detection ──
      let driftEcosystem = (candidate.metadata?.language as string) || 'unknown';
      if (extractable.length > 0) {
        const drift = detectV2Drift(extractable, driftEcosystem);
        driftEcosystem = drift.ecosystem;
        appendAudit(
          'semantic_drift',
          `eco=${drift.ecosystem} canonicals=${drift.uniqueCanonicals} highConf=${drift.highConfidenceCount}`,
        );
      }

      // ── Gap #6: contract + environment profile (uses drift-detected ecosystem) ──
      candidateContractBundle = extractFileContracts(extractable, driftEcosystem);
      if (candidateContractBundle) {
        appendAudit(
          'contract_extracted',
          `exports=${candidateContractBundle.exportCount} shapes=${candidateContractBundle.dataShapeCount} deps=${candidateContractBundle.dependencyCount}`,
        );
      }

      // Always register the candidate name itself so collisions can resolve it,
      // even when source_files weren't persisted on this upload.
      registerPrimitive({
        id: `candidate.${candidateNode.toLowerCase()}`,
        name: candidateNode,
        category: 'user-software',
        source: 'external',
        handler: (input) => ({
          primitive: candidateNode,
          executed: true,
          input,
          via: 'candidate-shim',
          timestamp: Date.now(),
        }),
      });

      if (extractable.length > 0) {
        // ── Gap #2: quality gate before registering handlers ──
        const qg = runV2QualityGate({ files: extractable });
        acceptedPrimitiveNames = new Set(qg.acceptedNames.map((n) => n.toLowerCase()));
        const phase0Ms = Math.round(performance.now() - phase0Start);

        // Audit: extraction + quality-gate (#4 ingest-audit)
        logV2Extraction(
          candidateNode,
          qg.totalExtracted,
          qg.acceptedNames.length,
          qg.rejectedNames.length,
          phase0Ms,
          user.id,
          runId,
        );
        logV2QualityGate(
          candidateNode,
          qg.avgQuality,
          qg.acceptedNames.length,
          qg.rejectedNames.length,
          user.id,
          runId,
        );
        appendAudit(
          'quality_gate',
          `accepted=${qg.acceptedNames.length} rejected=${qg.rejectedNames.length} avg=${qg.avgQuality}`,
        );

        const { primitives } = extractPrimitives(extractable);
        let registered = 0;
        for (const prim of primitives) {
          const canonical = (prim.canonicalName || prim.name).toLowerCase();
          // Only register handlers that survived the quality gate
          if (acceptedPrimitiveNames.size > 0 && !acceptedPrimitiveNames.has(canonical)) continue;
          registerPrimitive({
            id: `candidate.${candidateNode.toLowerCase()}.${prim.id}`,
            name: prim.canonicalName || prim.name,
            category: prim.category,
            source: 'external',
            handler: buildPrimitiveHandler(prim),
          });
          registered++;
        }
        appendAudit(
          'candidate_registered',
          `${candidateNode} + ${registered}/${primitives.length} handlers (post-quality-gate)`,
        );
      } else {
        appendAudit('candidate_registered', `${candidateNode} (shim only — no source_files)`);
      }
    } catch (err) {
      // Registration must never block the run — fall back to shim only.
      const msg = err instanceof Error ? err.message : String(err);
      appendAudit('candidate_register_warning', msg);
    }

    // Use deterministic ordering from orchestrator (seeded by fingerprint)
    const orderedNodes = getNodeOrdering(SUBSTRATE_NODES);
    appendAudit('discovery_start', `${orderedNodes.length} primitives`);

    const BATCH = 4;
    let totalDiscovered = 0;
    let bestScore = 0;
    let lastFunctionError: string | null = null;
    const allCaps: DiscoveredCapability[] = [];
    // Phase B: collect compat reports for batch merge sim (#7) and source code for feedback loop (#10)
    const compatReports: CompatibilityReport[] = [];
    const candidateCorpus = candidateContractBundle
      ? ((candidate.metadata?.source_files as Array<{ content?: string }> | undefined) ?? [])
          .map((f) => f?.content ?? '')
          .join('\n\n')
      : '';

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

              const cjpi = bestCap.cjpi_score as number;
              const rawChain = (bestCap.chain || [candidateNode, targetNode]) as string[];
              const chain = normalizeDiscoveredChain(rawChain, candidateNode, targetNode);
              const chainDepth = bestCap.chain_depth || chain.length || 2;
              const description = bestCap.description || '';

              // ── Gap #1: confidence banding ──
              const banding = bandDiscovery({ cjpiScore: cjpi, chainDepth, description });

              // ── Gap #5: 4-axis compatibility scoring (uses contract from Phase 0) ──
              const compat = scoreCollision(
                targetNode,
                cjpi,
                candidateContractBundle?.contract ?? null,
                candidateContractBundle?.profile ?? null,
                new Set([candidateNode.toUpperCase(), targetNode.toUpperCase()]),
              );

              const cap: DiscoveredCapability = {
                name: bestCap.name,
                cjpiScore: cjpi,
                tier: bestCap.tier,
                description,
                chain,
                chainDepth,
                band: banding.band,
                bandChannelCount: banding.channelCount,
                compatibilityComposite: compat.axes.composite,
                closedGaps: compat.closedGaps,
                unlockedSynergies: compat.unlockedSynergies,
              };

              registerDiscovery(cap);
              allCaps.push(cap);
              compatReports.push(compat);
              // ── Gap #4: ingest audit (chain participation) ──
              logV2ChainParticipation(cap.name, cap.chain, cap.cjpiScore, user.id, runId);
              // ── Gap #9: record collision outcome (success) ──
              recordCollisionOutcome(targetNode, true);
              // ── Gap #10: feed high/medium-band confirmations back into glossary ──
              if (candidateCorpus && (banding.band === 'high' || banding.band === 'medium')) {
                try {
                  recordV2Confirmation({
                    codeContent: candidateCorpus,
                    primitive: targetNode,
                    archetypeId: targetNode.toLowerCase(),
                    matchTerms: [targetNode, ...(cap.chain ?? [])].filter(Boolean),
                  });
                } catch {
                  // Feedback loop must never block discovery
                }
              }
              const displayHit = formatEnhancedCapabilityName(
                cap.name,
                cap.chain.filter((p) => p !== 'CANDIDATE'),
              );
              setRecentHits((prev) => [displayHit, ...prev.filter((name) => name !== displayHit)].slice(0, 4));
              return cjpi;
            }
            // No capabilities surfaced — record as failed collision (#9)
            recordCollisionOutcome(targetNode, false);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (!lastFunctionError) {
              lastFunctionError = message;
            }
            recordCollisionOutcome(targetNode, false);
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

    // ── Gap #1+#4: band distribution summary ──
    const bandDist = allCaps.reduce<Record<string, number>>((acc, c) => {
      const k = c.band ?? 'unknown';
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
    appendAudit(
      'banding_summary',
      `high=${bandDist.high ?? 0} medium=${bandDist.medium ?? 0} low=${bandDist.low ?? 0} hypothesis=${bandDist.hypothesis ?? 0}`,
    );
    logV2Discovery(candidateNode, allCaps.length, user.id, runId);

    if (allCaps.length === 0) {
      const message = lastFunctionError || 'No capabilities emerged from the collision cycle.';
      setAnalysisError(message);
      appendAudit('discovery_empty', message);
      toastRef.current({ title: 'Analysis produced no capabilities', description: message, variant: 'destructive' });
      return;
    }

    // ───────────────────────────────────────────────────────
    // Phase 2: Merge Simulation + Dedup (70–85%)
    // ───────────────────────────────────────────────────────
    setProgress(72);
    setStatusIdx(5);

    // ── Gap #7: dry-run merge simulation with iterative selection growth ──
    // V1 logic depends on `selectedPrimitives` to score synergy. We grow the
    // selection greedily by descending CJPI so each subsequent simulation
    // sees the primitives that would already be in the merged build.
    const selection = new Set<string>([candidateNode.toUpperCase()]);
    const orderedReports = [...compatReports].sort(
      (a, b) => b.axes.composite - a.axes.composite,
    );
    const verdictByPrimitive = new Map<string, { verdict: 'beneficial' | 'neutral' | 'risky'; netImprovement: number }>();
    let beneficial = 0, neutral = 0, risky = 0, sumNet = 0;
    for (const report of orderedReports) {
      const sim = simulateMergeBatch([report], selection);
      const s = sim.simulations[0];
      if (!s) continue;
      verdictByPrimitive.set(s.primitive, { verdict: s.verdict, netImprovement: s.netImprovement });
      if (s.verdict === 'beneficial') { beneficial++; selection.add(s.primitive); }
      else if (s.verdict === 'neutral') neutral++;
      else risky++;
      sumNet += s.netImprovement;
    }
    const avgNet = orderedReports.length === 0
      ? 0
      : Math.round((sumNet / orderedReports.length) * 1000) / 1000;
    const mergeReport = { beneficial, neutral, risky, avgNetImprovement: avgNet };
    appendAudit(
      'merge_simulation',
      `beneficial=${mergeReport.beneficial} neutral=${mergeReport.neutral} risky=${mergeReport.risky} avgΔ=${mergeReport.avgNetImprovement}`,
    );

    // Attach merge verdicts to caps before dedup so the strongest survivor wins.
    const enrichedCaps: DiscoveredCapability[] = allCaps.map((c) => {
      const targetUpper = (c.chain[c.chain.length - 1] ?? c.name).toUpperCase();
      const sim = verdictByPrimitive.get(targetUpper);
      return sim
        ? { ...c, mergeVerdict: sim.verdict, mergeNetImprovement: sim.netImprovement }
        : c;
    });

    setProgress(78);
    const dedup = deduplicateCapabilities(enrichedCaps);
    setDedupResult(dedup);
    appendAudit('dedup_complete', `${dedup.rawCount} → ${dedup.capabilities.length} unique (${dedup.groupCount} groups)`);

    setProgress(82);

    // ───────────────────────────────────────────────────────
    // Phase 3: Auto-Lock (85–95%)
    // ───────────────────────────────────────────────────────
    setStatusIdx(6);
    setProgress(85);
    beginLocking();

    try {
      if (abortRef.current) return;
      // Persist deduped capabilities in a single batched insert (1 round-trip).
      const slugSeed = Date.now().toString(36);
      const rows = dedup.capabilities.map((cap, idx) => ({
        user_id: user.id,
        name: cap.name,
        slug: `v2-ascended-${cap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${slugSeed}-${idx}`,
        tier: cap.tier,
        category: 'proprietary-ascended-v2',
        description: cap.description || '',
        metadata: {
          cjpi_score: cap.cjpiScore,
          chain: [...cap.chain],
          chain_depth: cap.chainDepth,
          pipeline_version: 'v2',
          band: cap.band ?? null,
          merge_verdict: cap.mergeVerdict ?? null,
          merge_net_improvement: cap.mergeNetImprovement ?? null,
          compatibility_composite: cap.compatibilityComposite ?? null,
          closed_gaps: cap.closedGaps ?? [],
          unlocked_synergies: cap.unlockedSynergies ?? [],
          dedup_raw_count: dedup.rawCount,
          dedup_group_count: dedup.groupCount,
          persisted_at: new Date().toISOString(),
        },
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('artifact_registry').insert(rows);

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

    // ── Gap #8: discovery-set delta — proves the pipeline mutated state ──
    const delta = measureDiscoveryDelta(enrichedCaps, dedup.capabilities, dedup.capabilities.length);
    appendAudit(
      'discovery_delta',
      `verdict=${delta.verdict} collapse=${delta.collapseRatio} retention=${delta.retentionRatio} topΔ=${delta.topScoreDelta}`,
    );

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
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:p-6 text-center space-y-3">
        <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-destructive" />
        <p className="text-foreground font-medium text-sm sm:text-base">Collision cycle failed</p>
        <p className="text-xs sm:text-sm text-muted-foreground break-words">{analysisError}</p>
      </div>
    );
  }

  if (done && dedupResult) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 sm:py-16 animate-in fade-in">
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
        <p className="text-foreground font-medium text-sm sm:text-base">Analysis Complete</p>
        <p className="text-muted-foreground text-xs">
          {dedupResult.rawCount} discoveries → {dedupResult.capabilities.length} unique capabilities locked
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Analyzing Your Code</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Colliding against the 40-Primitive substrate
        </p>
      </div>

      {/* Progress bar — flowing gradient mirrors the homepage H1 palette */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden relative">
          <div
            className="h-full bg-ascension-gradient rounded-full transition-[width] duration-500 ease-out shadow-[0_0_12px_hsl(var(--neon-cyan)/0.45)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs gap-2">
          <span className="text-muted-foreground flex items-center gap-1 min-w-0 truncate">
            <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
            <span className="truncate">{STATUS_MESSAGES[statusIdx]}</span>
          </span>
          <span className="text-foreground font-mono font-semibold flex-shrink-0 tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-muted/30 rounded-xl p-3 sm:p-4 text-center">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
          <p className="text-xl sm:text-2xl font-bold text-foreground">{discovered}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Raw Discoveries</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 sm:p-4 text-center">
          {dedupResult ? (
            <>
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl sm:text-2xl font-bold text-foreground">{dedupResult.capabilities.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Unique Locked</p>
            </>
          ) : (
            <>
              <div className={cn(
                'w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 rounded-full',
                topScore >= 85 ? 'bg-amber-500' : topScore >= 60 ? 'bg-primary' : 'bg-muted-foreground'
              )} />
              <p className="text-xl sm:text-2xl font-bold text-foreground">{topScore > 0 ? topScore : '—'}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Top Score</p>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 w-full min-w-0">
        <div className="bg-muted/20 border border-border rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
          <p className="text-[10px] sm:text-xs font-medium text-foreground">Live Collision Batch</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 min-w-0">
            {currentBatch.length > 0 ? currentBatch.map((primitive) => (
              <span key={primitive} className="rounded-full bg-primary/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-mono text-primary break-all">
                {primitive}
              </span>
            )) : (
              <span className="text-[10px] sm:text-xs text-muted-foreground">Preparing primitives…</span>
            )}
          </div>
        </div>

        <div className="bg-muted/20 border border-border rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
          <p className="text-[10px] sm:text-xs font-medium text-foreground">Recent Discoveries</p>
          <div className="space-y-1 sm:space-y-1.5 min-w-0">
            {recentHits.length > 0 ? recentHits.map((hit) => (
              <div key={hit} className="text-[10px] sm:text-xs text-foreground truncate min-w-0 max-w-full">
                {hit}
              </div>
            )) : (
              <span className="text-[10px] sm:text-xs text-muted-foreground">Waiting for the first capability to surface…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
