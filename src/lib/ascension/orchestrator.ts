/**
 * Ascension Orchestration Service — Hardened V1
 * 
 * Corrections applied:
 * A1: Immutable run snapshots via commitRun()
 * A2: Concurrency guard (_executing flag + phase check)
 * A3: Extracted persistDiscovery() — decoupled from loop
 * A4: Keyed deduplication via Map<string, DiscoveredCapability>
 * A5: Top score computed once after loop from deduped set
 * B1: Phase transition validation (assertValidTransition)
 * B2: Stable progress from processedNodes / totalNodes
 * B3: getProgressFromMilestones is single source of truth
 * C1: run_id enforced on every insert path
 * C2: resetRun scoped + guarded
 * D1: Single executeRun() entry point — UI calls one function
 * D2: AbortController replaces manual ref
 * D3: Error state is terminal (phase = 'error', early return)
 * E2: Deterministic fingerprint hashes replace synthetic IDs
 * E3: Results include run snapshot + ordered milestones for replay
 * G1: Seeded deterministic shuffle — same input = same order
 * G2: MAX_DISCOVERIES_PER_RUN cap
 * 
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import type { TraceContext } from '@/lib/vision/trace';

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const MAX_DISCOVERIES_PER_RUN = 50;

// ═══════════════════════════════════════════════════════════════
// Types — Canonical result model
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

/** Canonical results payload — one object for UI, summary, and export */
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
  /** E3: Seed used for deterministic replay */
  readonly seed: number;
}

/** Immutable run state — never mutate, always commitRun() */
export interface AscensionRun {
  readonly runId: string;
  readonly userId: string;
  readonly phase: RunPhase;
  readonly milestones: ReadonlyArray<AscensionMilestone>;
  readonly candidateName: string;
  readonly sourceLanguage: string;
  readonly sourceFiles: ReadonlyArray<{ name: string; content: string }>;
  readonly trace: TraceContext | null;
  readonly discoveredCount: number;
  readonly ascendedCount: number;
  readonly topScore: number;
  readonly capabilities: ReadonlyArray<DiscoveredCapability>;
  readonly error: string | null;
  readonly seed: number;
  /** A2: Concurrency guard */
  readonly _executing: boolean;
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
// A1: Immutable state transitions
// ═══════════════════════════════════════════════════════════════

/** Apply a partial patch to a run — returns a new immutable snapshot */
export function commitRun(prev: AscensionRun, patch: Partial<Omit<AscensionRun, 'runId' | 'userId'>>): AscensionRun {
  return { ...prev, ...patch };
}

// ═══════════════════════════════════════════════════════════════
// B1: Phase transition validation
// ═══════════════════════════════════════════════════════════════

const VALID_TRANSITIONS: Record<RunPhase, RunPhase[]> = {
  created: ['input_accepted', 'error'],
  input_accepted: ['trace_attached', 'candidate_stored', 'error'],
  trace_attached: ['candidate_stored', 'error'],
  candidate_stored: ['discovery_started', 'error'],
  discovery_started: ['discovery_batch_complete', 'discovery_finished', 'error'],
  discovery_batch_complete: ['discovery_batch_complete', 'discovery_finished', 'error'],
  discovery_finished: ['ascension_started', 'error'],
  ascension_started: ['ascension_finished', 'error'],
  ascension_finished: ['results_persisted', 'error'],
  results_persisted: ['complete', 'error'],
  complete: ['error'],
  error: [],
};

function assertValidTransition(from: RunPhase, to: RunPhase): void {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new Error(`Invalid phase transition: ${from} → ${to}`);
  }
}

function transitionPhase(run: AscensionRun, phase: RunPhase, detail?: string): AscensionRun {
  assertValidTransition(run.phase, phase);
  return commitRun(run, {
    phase,
    milestones: [...run.milestones, { phase, timestamp: Date.now(), detail }],
  });
}

// ═══════════════════════════════════════════════════════════════
// B2/B3: Progress from milestones — single source of truth
// ═══════════════════════════════════════════════════════════════

const PHASE_WEIGHTS: Record<RunPhase, number> = {
  created: 0,
  input_accepted: 5,
  trace_attached: 8,
  candidate_stored: 10,
  discovery_started: 15,
  discovery_batch_complete: 50,
  discovery_finished: 75,
  ascension_started: 80,
  ascension_finished: 95,
  results_persisted: 98,
  complete: 100,
  error: 0,
};

/** B2: Progress from processed/total — no interpolation drift */
export function getProgressFromMilestones(run: AscensionRun, processedNodes?: number, totalNodes?: number): number {
  if (run.phase === 'error') return 0;
  if (run.phase === 'discovery_batch_complete' && processedNodes !== undefined && totalNodes && totalNodes > 0) {
    const batchPct = Math.min(processedNodes / totalNodes, 1);
    return Math.min(15 + Math.round(batchPct * 60), 74);
  }
  return PHASE_WEIGHTS[run.phase] ?? 0;
}

// ═══════════════════════════════════════════════════════════════
// G1: Seeded deterministic shuffle
// ═══════════════════════════════════════════════════════════════

function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

function seededShuffle<T>(arr: ReadonlyArray<T>, seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// E2: Deterministic fingerprint for export
// ═══════════════════════════════════════════════════════════════

export function deterministicFingerprint(name: string, nodeA: string, nodeB: string, runId: string): string {
  const input = `${name}:${nodeA}:${nodeB}:${runId}`;
  return `fp_${fnv1aHash(input).toString(36)}`;
}

// ═══════════════════════════════════════════════════════════════
// Run factory
// ═══════════════════════════════════════════════════════════════

function generateRunId(): string {
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createRun(userId: string): AscensionRun {
  return Object.freeze({
    runId: generateRunId(),
    userId,
    phase: 'created' as const,
    milestones: Object.freeze([{ phase: 'created' as const, timestamp: Date.now() }]),
    candidateName: '',
    sourceLanguage: 'typescript',
    sourceFiles: Object.freeze([]),
    trace: null,
    discoveredCount: 0,
    ascendedCount: 0,
    topScore: 0,
    capabilities: Object.freeze([]),
    error: null,
    seed: 0,
    _executing: false,
  });
}

// ═══════════════════════════════════════════════════════════════
// Orchestration steps (pure transforms for pre-analysis)
// ═══════════════════════════════════════════════════════════════

/** Accept uploaded input — returns new run */
export function acceptInput(
  run: AscensionRun,
  candidateName: string,
  sourceLanguage: string,
  sourceFiles: Array<{ name: string; content: string }>,
): AscensionRun {
  const seed = fnv1aHash(candidateName);
  const next = commitRun(run, { candidateName, sourceLanguage, sourceFiles, seed });
  return transitionPhase(next, 'input_accepted');
}

/** Optionally attach trace — returns new run */
export function attachTrace(run: AscensionRun, trace: TraceContext): AscensionRun {
  const next = commitRun(run, { trace });
  return transitionPhase(next, 'trace_attached');
}

// ═══════════════════════════════════════════════════════════════
// A3: Extracted persistence — decoupled from discovery loop
// ═══════════════════════════════════════════════════════════════

async function persistDiscovery(
  userId: string,
  runId: string,
  cap: DiscoveredCapability,
  trace: TraceContext | null,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('artifact_registry').insert({
    user_id: userId,
    name: cap.name,
    slug: `discovery-${cap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${runId}-${Date.now().toString(36)}`,
    tier: cap.tier,
    category: 'proprietary-discovery',
    description: cap.description || '',
    metadata: {
      run_id: runId,
      node_a: cap.nodeA,
      node_b: cap.nodeB,
      cjpi_score: cap.score,
      chain: [cap.nodeA, cap.nodeB],
      chain_depth: 2,
      persisted_at: new Date().toISOString(),
      ...(trace ? { trace_id: trace.trace_id } : {}),
    },
  });
}

/** Store candidate in artifact_registry — run-scoped */
async function storeCandidate(run: AscensionRun): Promise<AscensionRun> {
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
  return transitionPhase(run, 'candidate_stored');
}

// ═══════════════════════════════════════════════════════════════
// D1: Single executeRun() entry point
// D2: AbortController
// D3: Terminal error state
// ═══════════════════════════════════════════════════════════════

export interface RunCallbacks {
  onRunUpdate: (run: AscensionRun) => void;
  onProgress: (pct: number, message: string) => void;
}

/** D1: Single orchestration entry — UI calls this one function */
export async function executeRun(
  initialRun: AscensionRun,
  callbacks: RunCallbacks,
  abortSignal: AbortSignal,
): Promise<AscensionResults> {
  let run = initialRun;

  // A2: Concurrency guard
  if (run._executing) {
    throw new Error('Run already executing');
  }
  if (run.phase !== 'input_accepted' && run.phase !== 'trace_attached') {
    throw new Error(`Cannot execute from phase: ${run.phase}`);
  }

  run = commitRun(run, { _executing: true });
  callbacks.onRunUpdate(run);

  const emit = (r: AscensionRun) => {
    callbacks.onRunUpdate(r);
    callbacks.onProgress(
      getProgressFromMilestones(r),
      STATUS_MESSAGES_MAP[r.phase] || 'Processing…',
    );
  };

  try {
    // Store candidate
    run = await storeCandidate(run);
    emit(run);

    if (abortSignal.aborted) throw new Error('Aborted');

    // Discovery phase
    run = transitionPhase(run, 'discovery_started');
    emit(run);

    // G1: Seeded shuffle — same candidate = same order
    const shuffled = seededShuffle(SUBSTRATE_NODES, run.seed);
    const BATCH = 4;
    // A4: Keyed dedup map
    const capMap = new Map<string, DiscoveredCapability>();
    let processedNodes = 0;
    const totalNodes = shuffled.length;

    for (let i = 0; i < shuffled.length; i += BATCH) {
      if (abortSignal.aborted) throw new Error('Aborted');

      // G2: Discovery cap
      if (capMap.size >= MAX_DISCOVERIES_PER_RUN) break;

      const batch = shuffled.slice(i, i + BATCH);

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

            const cap: DiscoveredCapability = {
              name: (bestCap.name as string).replace(/_/g, ' '),
              score: Number(bestCap.cjpi_score),
              tier: bestCap.tier as string,
              description: (bestCap.description || '') as string,
              nodeA: run.candidateName,
              nodeB: targetNode,
            };

            // A3: Extracted persistence
            await persistDiscovery(run.userId, run.runId, cap, run.trace);
            return cap;
          }
          return null;
        })
      );

      for (const r of results) {
        if (r.status === 'fulfilled' && r.value !== null) {
          // A4: Dedup by name key
          const key = `${r.value.name}::${r.value.nodeB}`;
          if (!capMap.has(key)) {
            capMap.set(key, r.value);
          }
        }
      }

      processedNodes += batch.length;

      // Update run snapshot
      const caps = Array.from(capMap.values());
      // A5: Compute top score from deduped set after batch
      const topScore = caps.reduce((max, c) => Math.max(max, c.score), 0);
      run = commitRun(run, {
        discoveredCount: caps.length,
        topScore,
        capabilities: caps,
      });
      run = transitionPhase(run, 'discovery_batch_complete', `${caps.length} found so far`);

      // B2: Stable progress from absolute counts
      callbacks.onProgress(
        getProgressFromMilestones(run, processedNodes, totalNodes),
        getStatusMessage(processedNodes / totalNodes),
      );
      callbacks.onRunUpdate(run);

      if (i + BATCH < shuffled.length) {
        await new Promise(r => setTimeout(r, 150));
      }
    }

    if (abortSignal.aborted) throw new Error('Aborted');

    run = transitionPhase(run, 'discovery_finished', `${capMap.size} total discoveries`);
    emit(run);

    // Ascension phase
    run = transitionPhase(run, 'ascension_started');
    emit(run);

    const { data: ascResult, error: ascError } = await supabase.functions.invoke('pf-proprietary-evolution', {
      body: {
        module: 'ascend',
        action: 'batch-lock',
        input: { min_cjpi: 1 },
      },
    });

    if (ascError) throw ascError;

    const finalCaps = Array.from(capMap.values());
    run = commitRun(run, {
      ascendedCount: ascResult?.ascended_count || finalCaps.length,
      capabilities: finalCaps,
    });
    run = transitionPhase(run, 'ascension_finished');
    emit(run);

    run = transitionPhase(run, 'results_persisted');
    emit(run);

    await new Promise(r => setTimeout(r, 600));

    run = transitionPhase(run, 'complete');
    run = commitRun(run, { _executing: false });
    emit(run);

    return getResults(run);
  } catch (err) {
    // D3: Terminal error state — no continuation
    const errorMsg = String(err);
    try {
      run = commitRun(run, {
        phase: 'error',
        error: errorMsg,
        _executing: false,
        milestones: [...run.milestones, { phase: 'error', timestamp: Date.now(), detail: errorMsg }],
      });
    } catch {
      // Phase transition may also fail if already in error — force it
      run = { ...run, phase: 'error', error: errorMsg, _executing: false };
    }
    callbacks.onRunUpdate(run);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════
// Status messages
// ═══════════════════════════════════════════════════════════════

const STATUS_MESSAGES_MAP: Partial<Record<RunPhase, string>> = {
  candidate_stored: 'Code stored. Starting discovery…',
  discovery_started: 'Starting discovery…',
  discovery_finished: 'Discovery complete. Locking results…',
  ascension_started: 'Locking confirmed results…',
  ascension_finished: 'Finalizing analysis…',
  results_persisted: 'Finalizing analysis…',
  complete: 'Complete',
};

const STATUS_MESSAGES = [
  'Reading your code structure…',
  'Mapping function boundaries…',
  'Testing capability interactions…',
  'Evaluating emerging patterns…',
  'Scoring discovered capabilities…',
  'Locking confirmed results…',
  'Finalizing analysis…',
];

function getStatusMessage(pct: number): string {
  const idx = Math.min(Math.floor(pct * (STATUS_MESSAGES.length - 1)), STATUS_MESSAGES.length - 1);
  return STATUS_MESSAGES[idx];
}

// ═══════════════════════════════════════════════════════════════
// Results builder — E3: includes seed for replay
// ═══════════════════════════════════════════════════════════════

export function getResults(run: AscensionRun): AscensionResults {
  const caps = Array.from(run.capabilities);
  const scores = caps.map(c => c.score);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
    : 0;
  const topScore = scores.length > 0 ? Math.max(...scores) : 0;

  return {
    runId: run.runId,
    candidateName: run.candidateName,
    sourceLanguage: run.sourceLanguage,
    discovered: caps.length,
    ascended: run.ascendedCount,
    topScore,
    avgScore,
    capabilities: caps,
    milestones: [...run.milestones],
    completedAt: new Date().toISOString(),
    seed: run.seed,
  };
}

// ═══════════════════════════════════════════════════════════════
// C1/C2: Run-scoped reset — only this run's artifacts
// ═══════════════════════════════════════════════════════════════

export async function resetRun(run: AscensionRun): Promise<void> {
  // C2: Only delete for this specific run
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

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
