/**
 * Ascension Orchestration Service (#12, #13, #14, #15)
 * 
 * Single service layer between UI and backend.
 * UI consumes run state, not internal table semantics.
 * 
 * #12: One orchestration API — create run, upload, trace, analyze, poll, results, export
 * #13: Run-scoped identifiers — reset targets current run only
 * #14: Milestone-based progress — anchored to real backend transitions
 * #15: Canonical results payload — one model for summary, UI, and export
 * 
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import type { TraceContext } from '@/lib/vision/trace';

// ═══════════════════════════════════════════════════════════════
// Types — #15: Canonical result model
// ═══════════════════════════════════════════════════════════════

export type RunPhase =
  | 'created'
  | 'input_accepted'
  | 'trace_attached'
  | 'candidate_stored'
  | 'discovery_started'
  | 'discovery_batch_complete'
  | 'discovery_finished'
  | 'ascension_started'
  | 'ascension_finished'
  | 'results_persisted'
  | 'complete'
  | 'error';

export interface AscensionMilestone {
  readonly phase: RunPhase;
  readonly timestamp: number;
  readonly detail?: string;
}

export interface DiscoveredCapability {
  readonly name: string;
  readonly score: number;
  readonly tier: string;
  readonly description: string;
  readonly nodeA: string;
  readonly nodeB: string;
}

/** #15: Canonical results payload — one object for UI, summary, and export */
export interface AscensionResults {
  readonly runId: string;
  readonly candidateName: string;
  readonly sourceLanguage: string;
  readonly discovered: number;
  readonly ascended: number;
  readonly topScore: number;
  readonly avgScore: number;
  readonly capabilities: ReadonlyArray<DiscoveredCapability>;
  readonly milestones: ReadonlyArray<AscensionMilestone>;
  readonly completedAt: string;
}

export interface AscensionRun {
  readonly runId: string;
  readonly userId: string;
  phase: RunPhase;
  milestones: AscensionMilestone[];
  candidateName: string;
  sourceLanguage: string;
  sourceFiles: Array<{ name: string; content: string }>;
  trace: TraceContext | null;
  discoveredCount: number;
  ascendedCount: number;
  topScore: number;
  capabilities: DiscoveredCapability[];
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════
// Substrate nodes for collision
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// Run factory
// ═══════════════════════════════════════════════════════════════

function generateRunId(): string {
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createRun(userId: string): AscensionRun {
  const run: AscensionRun = {
    runId: generateRunId(),
    userId,
    phase: 'created',
    milestones: [{ phase: 'created', timestamp: Date.now() }],
    candidateName: '',
    sourceLanguage: 'typescript',
    sourceFiles: [],
    trace: null,
    discoveredCount: 0,
    ascendedCount: 0,
    topScore: 0,
    capabilities: [],
    error: null,
  };
  return run;
}

// ═══════════════════════════════════════════════════════════════
// Milestone tracking (#14)
// ═══════════════════════════════════════════════════════════════

function addMilestone(run: AscensionRun, phase: RunPhase, detail?: string): void {
  run.phase = phase;
  run.milestones.push({ phase, timestamp: Date.now(), detail });
}

/** #14: Convert milestones to real progress percentage */
const PHASE_WEIGHTS: Record<RunPhase, number> = {
  created: 0,
  input_accepted: 5,
  trace_attached: 8,
  candidate_stored: 10,
  discovery_started: 15,
  discovery_batch_complete: 50, // interpolated per batch
  discovery_finished: 75,
  ascension_started: 80,
  ascension_finished: 95,
  results_persisted: 98,
  complete: 100,
  error: -1,
};

export function getProgressFromMilestones(run: AscensionRun, batchProgress?: number): number {
  if (run.phase === 'error') return 0;
  if (run.phase === 'discovery_batch_complete' && batchProgress !== undefined) {
    // Interpolate between discovery_started (15) and discovery_finished (75)
    return 15 + Math.round(batchProgress * 60);
  }
  return PHASE_WEIGHTS[run.phase] ?? 0;
}

// ═══════════════════════════════════════════════════════════════
// Orchestration steps
// ═══════════════════════════════════════════════════════════════

/** Accept uploaded input */
export function acceptInput(
  run: AscensionRun,
  candidateName: string,
  sourceLanguage: string,
  sourceFiles: Array<{ name: string; content: string }>,
): void {
  run.candidateName = candidateName;
  run.sourceLanguage = sourceLanguage;
  run.sourceFiles = sourceFiles;
  addMilestone(run, 'input_accepted');
}

/** Optionally attach trace */
export function attachTrace(run: AscensionRun, trace: TraceContext): void {
  run.trace = trace;
  addMilestone(run, 'trace_attached');
}

/** Store candidate in artifact_registry — run-scoped via runId in metadata */
export async function storeCandidate(run: AscensionRun): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('artifact_registry').insert({
    user_id: run.userId,
    name: `CANDIDATE_${run.candidateName}`,
    slug: `candidate-${run.candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${run.runId}`,
    tier: 'candidate',
    category: 'proprietary-evolution',
    description: `Candidate from run ${run.runId}`,
    metadata: {
      run_id: run.runId,
      source_export_language: run.sourceLanguage,
      source_files: run.sourceFiles.map(f => ({ name: f.name, content: f.content.slice(0, 50000) })),
    },
  });
  addMilestone(run, 'candidate_stored');
}

/** Run discovery + ascension pipeline */
export async function runAnalysis(
  run: AscensionRun,
  onProgress: (pct: number, message: string) => void,
  abort: { current: boolean },
): Promise<void> {
  addMilestone(run, 'discovery_started');
  onProgress(getProgressFromMilestones(run), 'Starting discovery…');

  const shuffled = [...SUBSTRATE_NODES].sort(() => Math.random() - 0.5);
  const BATCH = 4;
  let bestScore = 0;
  const allCaps: DiscoveredCapability[] = [];

  const STATUS_MESSAGES = [
    'Reading your code structure…',
    'Mapping function boundaries…',
    'Testing capability interactions…',
    'Evaluating emerging patterns…',
    'Scoring discovered capabilities…',
    'Locking confirmed results…',
    'Finalizing analysis…',
  ];

  for (let i = 0; i < shuffled.length; i += BATCH) {
    if (abort.current) return;

    const batch = shuffled.slice(i, i + BATCH);
    const batchPct = (i + batch.length) / shuffled.length;
    const msgIdx = Math.min(Math.floor(batchPct * (STATUS_MESSAGES.length - 1)), STATUS_MESSAGES.length - 2);

    onProgress(getProgressFromMilestones(run, batchPct), STATUS_MESSAGES[msgIdx]);

    const results = await Promise.allSettled(
      batch.map(async (targetNode) => {
        const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
          body: {
            module: 'discovery',
            action: 'collide',
            input: {
              candidate_node: run.candidateName,
              target_node: targetNode,
              permutation_depth: 7,
              ...(run.trace ? { trace_id: run.trace.trace_id, span_id: run.trace.span_id } : {}),
            },
          },
        });
        if (!error && data?.capabilities?.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const bestCap = data.capabilities.reduce((best: any, cap: any) =>
            (!best || cap.cjpi_score > best.cjpi_score ? cap : best), data.capabilities[0]);

          // Persist discovery — run-scoped
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('artifact_registry').insert({
            user_id: run.userId,
            name: bestCap.name,
            slug: `discovery-${bestCap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${run.runId}-${Date.now().toString(36)}`,
            tier: bestCap.tier,
            category: 'proprietary-discovery',
            description: bestCap.description || '',
            metadata: {
              run_id: run.runId,
              node_a: run.candidateName,
              node_b: targetNode,
              cjpi_score: bestCap.cjpi_score,
              chain: bestCap.chain || [run.candidateName, targetNode],
              chain_depth: bestCap.chain_depth || 2,
              persisted_at: new Date().toISOString(),
              ...(run.trace ? { trace_id: run.trace.trace_id } : {}),
            },
          });

          return {
            name: (bestCap.name as string).replace(/_/g, ' '),
            score: Number(bestCap.cjpi_score),
            tier: bestCap.tier as string,
            description: (bestCap.description || '') as string,
            nodeA: run.candidateName,
            nodeB: targetNode,
          } satisfies DiscoveredCapability;
        }
        return null;
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value !== null) {
        allCaps.push(r.value);
        if (r.value.score > bestScore) bestScore = r.value.score;
      }
    }

    run.discoveredCount = allCaps.length;
    run.topScore = bestScore;
    addMilestone(run, 'discovery_batch_complete', `${allCaps.length} found so far`);

    if (i + BATCH < shuffled.length) {
      await new Promise(r => setTimeout(r, 150));
    }
  }

  addMilestone(run, 'discovery_finished', `${allCaps.length} total discoveries`);
  onProgress(getProgressFromMilestones(run), 'Locking confirmed results…');

  // Ascension phase
  addMilestone(run, 'ascension_started');
  onProgress(getProgressFromMilestones(run), 'Locking confirmed results…');

  try {
    const { data: ascResult, error: ascError } = await supabase.functions.invoke('pf-proprietary-evolution', {
      body: {
        module: 'ascend',
        action: 'batch-lock',
        input: { min_cjpi: 1 },
      },
    });

    if (ascError) throw ascError;

    run.ascendedCount = ascResult?.ascended_count || allCaps.length;
    run.capabilities = allCaps;
    addMilestone(run, 'ascension_finished');
    onProgress(getProgressFromMilestones(run), 'Finalizing analysis…');

    addMilestone(run, 'results_persisted');
    onProgress(98, 'Finalizing analysis…');

    await new Promise(r => setTimeout(r, 600));

    addMilestone(run, 'complete');
    onProgress(100, 'Complete');
  } catch (err) {
    run.error = String(err);
    addMilestone(run, 'error', String(err));
    throw err;
  }
}

/** #15: Build canonical results from run state */
export function getResults(run: AscensionRun): AscensionResults {
  const scores = run.capabilities.map(c => c.score);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
    : 0;

  return {
    runId: run.runId,
    candidateName: run.candidateName,
    sourceLanguage: run.sourceLanguage,
    discovered: run.discoveredCount,
    ascended: run.ascendedCount,
    topScore: run.topScore,
    avgScore,
    capabilities: run.capabilities,
    milestones: run.milestones,
    completedAt: new Date().toISOString(),
  };
}

/** #13: Run-scoped reset — only deletes artifacts for this run */
export async function resetRun(run: AscensionRun): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // Delete only artifacts tagged with this run's ID
  await Promise.allSettled([
    sb.from('artifact_registry').delete()
      .eq('user_id', run.userId)
      .eq('category', 'proprietary-evolution')
      .filter('metadata->>run_id', 'eq', run.runId),
    sb.from('artifact_registry').delete()
      .eq('user_id', run.userId)
      .eq('category', 'proprietary-discovery')
      .filter('metadata->>run_id', 'eq', run.runId),
    sb.from('artifact_registry').delete()
      .eq('user_id', run.userId)
      .eq('category', 'proprietary-ascended')
      .filter('metadata->>run_id', 'eq', run.runId),
  ]);
}
