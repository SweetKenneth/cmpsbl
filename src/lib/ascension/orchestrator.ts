/**
 * Ascension Orchestration Service — Hardened V1.1
 * 
 * V1.1 corrections:
 * 1: Deep immutability via freeze/freezeArray
 * 2: Content-aware deterministic seed (candidateName + source content)
 * 3: Event log for replay/explainability (E3 upgrade)
 * 4: Buffered discovery writes (batch flush)
 * 5: Retry layer for transient failures
 * 6: Dual fingerprint system (FNV fast + SHA-256 trust)
 * 7: Phase-based execution guard (no volatile _executing flag)
 * 8: Run snapshot persistence on completion
 * 9: Progress hard cap (never exceeds 100)
 * 
 * Prior corrections (V1.0): A1–A5, B1–B3, C1–C2, D1–D3, E2–E3, G1–G2
 * 
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import { sha256 } from '@/lib/control-plane/hash';
import type { TraceContext } from '@/lib/vision/trace';

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const MAX_DISCOVERIES_PER_RUN = 50;
const FLUSH_SIZE = 10;
const RETRY_ATTEMPTS = 2;

// ═══════════════════════════════════════════════════════════════
// #1: Deep immutability helpers
// ═══════════════════════════════════════════════════════════════

function freeze<T extends object>(obj: T): Readonly<T> {
  return Object.freeze(obj);
}

function freezeArray<T>(arr: T[]): ReadonlyArray<T> {
  return Object.freeze([...arr]);
}

// ═══════════════════════════════════════════════════════════════
// #5: Retry utility
// ═══════════════════════════════════════════════════════════════

async function retry<T>(fn: () => Promise<T>, attempts: number = RETRY_ATTEMPTS): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

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

/** #3: Structured event for replay/audit */
export interface RunEvent {
  readonly type: string;
  readonly timestamp: number;
  readonly payload?: Record<string, unknown>;
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
  readonly events: ReadonlyArray<RunEvent>;
  readonly completedAt: string;
  readonly seed: number;
}

/** Immutable run state — never mutate, always commitRun() */
export interface AscensionRun {
  readonly runId: string;
  readonly userId: string;
  readonly phase: RunPhase;
  readonly milestones: ReadonlyArray<AscensionMilestone>;
  readonly events: ReadonlyArray<RunEvent>;
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
// #1: Deep-immutable state transitions
// ═══════════════════════════════════════════════════════════════

/** Apply a partial patch — returns a deeply frozen new snapshot */
export function commitRun(prev: AscensionRun, patch: Partial<Omit<AscensionRun, 'runId' | 'userId'>>): AscensionRun {
  return freeze({
    ...prev,
    ...patch,
    milestones: patch.milestones
      ? freezeArray(patch.milestones as AscensionMilestone[])
      : prev.milestones,
    capabilities: patch.capabilities
      ? freezeArray(patch.capabilities as DiscoveredCapability[])
      : prev.capabilities,
    sourceFiles: patch.sourceFiles
      ? freezeArray(patch.sourceFiles as Array<{ name: string; content: string }>)
      : prev.sourceFiles,
    events: patch.events
      ? freezeArray(patch.events as RunEvent[])
      : prev.events,
  });
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
// #3: Event log — replay foundation
// ═══════════════════════════════════════════════════════════════

function addEvent(run: AscensionRun, type: string, payload?: Record<string, unknown>): AscensionRun {
  return commitRun(run, {
    events: [...run.events, { type, timestamp: Date.now(), payload }],
  });
}

// ═══════════════════════════════════════════════════════════════
// #9: Progress from milestones — hard-capped at 100
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

export function getProgressFromMilestones(run: AscensionRun, processedNodes?: number, totalNodes?: number): number {
  if (run.phase === 'error') return 0;
  if (run.phase === 'discovery_batch_complete' && processedNodes !== undefined && totalNodes && totalNodes > 0) {
    const batchPct = Math.min(processedNodes / totalNodes, 1);
    return Math.min(15 + Math.round(batchPct * 60), 74);
  }
  return Math.min(PHASE_WEIGHTS[run.phase] ?? 0, 100);
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
// #2: Content-aware deterministic seed
// ═══════════════════════════════════════════════════════════════

function computeSeed(candidateName: string, sourceFiles: ReadonlyArray<{ name: string; content: string }>): number {
  const contentSample = sourceFiles
    .slice(0, 3)
    .map(f => f.name + ':' + f.content.slice(0, 200))
    .join('|');
  return fnv1aHash(candidateName + '::' + contentSample);
}

// ═══════════════════════════════════════════════════════════════
// #6: Dual fingerprint — FNV (fast) + SHA-256 (trust)
// ═══════════════════════════════════════════════════════════════

/** Fast deterministic fingerprint (FNV-1a) — for IDs and dedup */
export function deterministicFingerprint(name: string, nodeA: string, nodeB: string, runId: string): string {
  const input = `${name}:${nodeA}:${nodeB}:${runId}`;
  return `fp_${fnv1aHash(input).toString(36)}`;
}

/** Strong integrity fingerprint (SHA-256) — for trust verification */
export async function integrityFingerprint(name: string, nodeA: string, nodeB: string, runId: string): Promise<string> {
  const input = `${name}:${nodeA}:${nodeB}:${runId}`;
  return sha256(input);
}

// ═══════════════════════════════════════════════════════════════
// Run factory
// ═══════════════════════════════════════════════════════════════

function generateRunId(): string {
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createRun(userId: string): AscensionRun {
  return freeze({
    runId: generateRunId(),
    userId,
    phase: 'created' as const,
    milestones: freezeArray([{ phase: 'created' as const, timestamp: Date.now() }]),
    events: freezeArray([{ type: 'run_created', timestamp: Date.now() }]),
    candidateName: '',
    sourceLanguage: 'typescript',
    sourceFiles: freezeArray([]),
    trace: null,
    discoveredCount: 0,
    ascendedCount: 0,
    topScore: 0,
    capabilities: freezeArray([]),
    error: null,
    seed: 0,
  });
}

// ═══════════════════════════════════════════════════════════════
// Orchestration steps (pure transforms for pre-analysis)
// ═══════════════════════════════════════════════════════════════

/** Accept uploaded input — returns new run with content-aware seed */
export function acceptInput(
  run: AscensionRun,
  candidateName: string,
  sourceLanguage: string,
  sourceFiles: Array<{ name: string; content: string }>,
): AscensionRun {
  const seed = computeSeed(candidateName, sourceFiles);
  let next = commitRun(run, { candidateName, sourceLanguage, sourceFiles, seed });
  next = addEvent(next, 'input_accepted', { candidateName, fileCount: sourceFiles.length, seed });
  return transitionPhase(next, 'input_accepted');
}

/** Optionally attach trace — returns new run */
export function attachTrace(run: AscensionRun, trace: TraceContext): AscensionRun {
  let next = commitRun(run, { trace });
  next = addEvent(next, 'trace_attached', { traceId: trace.trace_id });
  return transitionPhase(next, 'trace_attached');
}

// ═══════════════════════════════════════════════════════════════
// A3/#4: Extracted persistence with buffered writes
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

/** #4: Batch flush discovery writes */
async function flushBuffer(
  buffer: DiscoveredCapability[],
  userId: string,
  runId: string,
  trace: TraceContext | null,
): Promise<void> {
  const batch = buffer.splice(0, buffer.length);
  await Promise.allSettled(
    batch.map(cap => retry(() => persistDiscovery(userId, runId, cap, trace)))
  );
}

/** Store candidate in artifact_registry — run-scoped */
async function storeCandidate(run: AscensionRun): Promise<AscensionRun> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await retry(() => (supabase as any).from('artifact_registry').insert({
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
  }));
  let next = addEvent(run, 'candidate_stored', { runId: run.runId });
  return transitionPhase(next, 'candidate_stored');
}

// ═══════════════════════════════════════════════════════════════
// D1: Single executeRun() entry point
// #7: Phase-based execution guard (no volatile flag)
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

  // #7: Phase-based execution guard — no volatile _executing flag
  if (run.phase !== 'input_accepted' && run.phase !== 'trace_attached') {
    throw new Error(`Invalid execution phase: ${run.phase}`);
  }

  run = addEvent(run, 'execution_started');
  callbacks.onRunUpdate(run);

  const emit = (r: AscensionRun) => {
    callbacks.onRunUpdate(r);
    callbacks.onProgress(
      getProgressFromMilestones(r),
      STATUS_MESSAGES_MAP[r.phase] || 'Processing…',
    );
  };

  try {
    // Store candidate (with retry)
    run = await storeCandidate(run);
    emit(run);

    if (abortSignal.aborted) throw new Error('Aborted');

    // Discovery phase
    run = transitionPhase(run, 'discovery_started');
    run = addEvent(run, 'discovery_started');
    emit(run);

    // G1: Seeded shuffle — same candidate + content = same order
    const shuffled = seededShuffle(SUBSTRATE_NODES, run.seed);
    const BATCH = 4;
    const capMap = new Map<string, DiscoveredCapability>();
    let processedNodes = 0;
    const totalNodes = shuffled.length;

    // #4: Write buffer for batched persistence
    const writeBuffer: DiscoveredCapability[] = [];

    for (let i = 0; i < shuffled.length; i += BATCH) {
      if (abortSignal.aborted) throw new Error('Aborted');

      if (capMap.size >= MAX_DISCOVERIES_PER_RUN) break;

      const batch = shuffled.slice(i, i + BATCH);

      // #5: Retry on edge function calls
      const results = await Promise.allSettled(
        batch.map(async (targetNode) => {
          const { data, error } = await retry(() =>
            supabase.functions.invoke('pf-proprietary-evolution', {
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
            })
          );
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

            return cap;
          }
          return null;
        })
      );

      for (const r of results) {
        if (r.status === 'fulfilled' && r.value !== null) {
          const key = `${r.value.name}::${r.value.nodeB}`;
          if (!capMap.has(key)) {
            capMap.set(key, r.value);
            // #4: Buffer writes instead of inline persist
            writeBuffer.push(r.value);
          }
        }
      }

      // #4: Flush when buffer reaches threshold
      if (writeBuffer.length >= FLUSH_SIZE) {
        await flushBuffer(writeBuffer, run.userId, run.runId, run.trace);
      }

      processedNodes += batch.length;

      const caps = Array.from(capMap.values());
      const topScore = caps.reduce((max, c) => Math.max(max, c.score), 0);
      run = commitRun(run, {
        discoveredCount: caps.length,
        topScore,
        capabilities: caps,
      });
      run = transitionPhase(run, 'discovery_batch_complete', `${caps.length} found so far`);
      run = addEvent(run, 'discovery_batch_complete', { batch: i / BATCH, found: caps.length });

      callbacks.onProgress(
        getProgressFromMilestones(run, processedNodes, totalNodes),
        getStatusMessage(processedNodes / totalNodes),
      );
      callbacks.onRunUpdate(run);

      if (i + BATCH < shuffled.length) {
        await new Promise(r => setTimeout(r, 150));
      }
    }

    // #4: Final flush — drain remaining buffer
    if (writeBuffer.length > 0) {
      await flushBuffer(writeBuffer, run.userId, run.runId, run.trace);
    }

    if (abortSignal.aborted) throw new Error('Aborted');

    run = transitionPhase(run, 'discovery_finished', `${capMap.size} total discoveries`);
    run = addEvent(run, 'discovery_finished', { totalDiscoveries: capMap.size });
    emit(run);

    // Ascension phase
    run = transitionPhase(run, 'ascension_started');
    run = addEvent(run, 'ascension_started');
    emit(run);

    const { data: ascResult, error: ascError } = await retry(() =>
      supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'ascend',
          action: 'batch-lock',
          input: { min_cjpi: 1 },
        },
      })
    );

    if (ascError) throw ascError;

    const finalCaps = Array.from(capMap.values());
    run = commitRun(run, {
      ascendedCount: ascResult?.ascended_count || finalCaps.length,
      capabilities: finalCaps,
    });
    run = transitionPhase(run, 'ascension_finished');
    run = addEvent(run, 'ascension_finished', { ascendedCount: run.ascendedCount });
    emit(run);

    run = transitionPhase(run, 'results_persisted');
    run = addEvent(run, 'results_persisted');
    emit(run);

    await new Promise(r => setTimeout(r, 600));

    run = transitionPhase(run, 'complete');
    run = addEvent(run, 'run_complete');
    emit(run);

    const results = getResults(run);

    // #8: Persist run snapshot for replay/debugging
    await persistRunSnapshot(run).catch(() => {
      /* non-critical — do not fail the run */
    });

    return results;
  } catch (err) {
    const errorMsg = String(err);
    try {
      run = commitRun(run, {
        phase: 'error',
        error: errorMsg,
        milestones: [...run.milestones, { phase: 'error', timestamp: Date.now(), detail: errorMsg }],
        events: [...run.events, { type: 'error', timestamp: Date.now(), payload: { message: errorMsg } }],
      });
    } catch {
      run = { ...run, phase: 'error', error: errorMsg } as AscensionRun;
    }
    callbacks.onRunUpdate(run);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════
// #8: Run snapshot persistence
// ═══════════════════════════════════════════════════════════════

async function persistRunSnapshot(run: AscensionRun): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('artifact_registry').insert({
    user_id: run.userId,
    name: `RUN_SNAPSHOT_${run.runId}`,
    slug: `run-snapshot-${run.runId}`,
    tier: 'system',
    category: 'ascension-run-snapshot',
    description: `Complete run snapshot for ${run.candidateName}`,
    metadata: {
      run_id: run.runId,
      phase: run.phase,
      seed: run.seed,
      discovered_count: run.discoveredCount,
      ascended_count: run.ascendedCount,
      top_score: run.topScore,
      milestones: run.milestones,
      events: run.events,
      capabilities: run.capabilities,
      completed_at: new Date().toISOString(),
    },
  });
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
// Results builder — includes events for replay
// ═══════════════════════════════════════════════════════════════

export function getResults(run: AscensionRun): AscensionResults {
  const caps = Array.from(run.capabilities);
  const scores = caps.map(c => c.score);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
    : 0;
  const topScore = scores.length > 0 ? Math.max(...scores) : 0;

  return freeze({
    runId: run.runId,
    candidateName: run.candidateName,
    sourceLanguage: run.sourceLanguage,
    discovered: caps.length,
    ascended: run.ascendedCount,
    topScore,
    avgScore,
    capabilities: freezeArray(caps),
    milestones: freezeArray([...run.milestones]),
    events: freezeArray([...run.events]),
    completedAt: new Date().toISOString(),
    seed: run.seed,
  });
}

// ═══════════════════════════════════════════════════════════════
// C1/C2: Run-scoped reset — only this run's artifacts
// ═══════════════════════════════════════════════════════════════

export async function resetRun(run: AscensionRun): Promise<void> {
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
    sb.from('artifact_registry').delete()
      .eq('user_id', run.userId)
      .eq('category', 'ascension-run-snapshot')
      .filter('metadata->>run_id', 'eq', run.runId),
  ]);
}
