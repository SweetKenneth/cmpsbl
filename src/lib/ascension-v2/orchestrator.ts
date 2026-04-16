/**
 * Ascension V2 Orchestrator — Immutable state machine
 * U.S. Patent App. No. 64/029,678
 *
 * Drives the 4-step pipeline: Upload → Analyze → Lock → Export
 * with deterministic execution, audit chain integration,
 * fingerprint gating, and buffered DB writes.
 *
 * © CMPSBL® — All rights reserved.
 */

import { appendAudit, getChainState, resetChain } from './audit-chain';
import { computeMultiFileFingerprint, type SourceFingerprint } from './fingerprint-gate';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type RunPhase = 'idle' | 'uploading' | 'analyzing' | 'locking' | 'exporting' | 'done' | 'error';

export interface DiscoveredCapability {
  readonly name: string;
  readonly cjpiScore: number;
  readonly tier: string;
  readonly description: string;
  readonly chain: ReadonlyArray<string>;
  readonly chainDepth: number;
  // Phase A — V1 Bridge enrichment (optional, never blocks the pipeline)
  readonly band?: 'high' | 'medium' | 'low' | 'hypothesis';
  readonly bandChannelCount?: number;
  readonly compatibilityComposite?: number;
  readonly closedGaps?: ReadonlyArray<string>;
  readonly unlockedSynergies?: ReadonlyArray<string>;
}

export interface RunSnapshot {
  readonly runId: string;
  readonly phase: RunPhase;
  readonly fingerprint: SourceFingerprint | null;
  readonly discovered: ReadonlyArray<DiscoveredCapability>;
  readonly ascended: number;
  readonly topScore: number;
  readonly progress: number;
  readonly startedAt: number | null;
  readonly completedAt: number | null;
  readonly auditLength: number;
  readonly error: string | null;
}

export interface OrchestratorCallbacks {
  onPhaseChange?: (phase: RunPhase) => void;
  onProgress?: (pct: number) => void;
  onDiscovery?: (cap: DiscoveredCapability) => void;
  onError?: (error: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// Immutable state
// ═══════════════════════════════════════════════════════════════

let runId = '';
let phase: RunPhase = 'idle';
let fingerprint: SourceFingerprint | null = null;
let discovered: DiscoveredCapability[] = [];
let ascendedCount = 0;
let topScore = 0;
let progress = 0;
let startedAt: number | null = null;
let completedAt: number | null = null;
let lastError: string | null = null;
let callbacks: OrchestratorCallbacks = {};

function setPhase(next: RunPhase): void {
  phase = next;
  appendAudit('phase_change', next);
  callbacks.onPhaseChange?.(next);
}

function setProgress(pct: number): void {
  progress = Math.min(pct, 100);
  callbacks.onProgress?.(progress);
}

// ═══════════════════════════════════════════════════════════════
// Retry utility — 2 attempts
// ═══════════════════════════════════════════════════════════════

async function retry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, 300 * (i + 1)));
      }
    }
  }
  throw lastErr;
}

// ═══════════════════════════════════════════════════════════════
// Seeded shuffle — deterministic ordering for reproducibility
// ═══════════════════════════════════════════════════════════════

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function fingerprintToSeed(fp: SourceFingerprint): number {
  return parseInt(fp.hash.slice(0, 8), 16) || 42;
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize a new V2 run.
 */
export function initRun(cbs?: OrchestratorCallbacks): string {
  resetChain();
  runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  phase = 'idle';
  fingerprint = null;
  discovered = [];
  ascendedCount = 0;
  topScore = 0;
  progress = 0;
  startedAt = null;
  completedAt = null;
  lastError = null;
  callbacks = cbs || {};

  appendAudit('run_init', runId);
  return runId;
}

/**
 * Commit uploaded files — computes fingerprint and transitions to analyzing.
 */
export function commitUpload(
  files: ReadonlyArray<{ name: string; content: string }>,
  language: string
): SourceFingerprint {
  if (phase !== 'idle') {
    throw new Error(`Cannot upload in phase: ${phase}`);
  }

  startedAt = Date.now();
  setPhase('uploading');

  fingerprint = computeMultiFileFingerprint(files, language);
  appendAudit('fingerprint_computed', fingerprint.hash);

  setProgress(5);
  setPhase('analyzing');
  return fingerprint;
}

/**
 * Register a discovered capability during analysis.
 */
export function registerDiscovery(cap: DiscoveredCapability): void {
  if (phase !== 'analyzing') {
    throw new Error(`Cannot register discovery in phase: ${phase}`);
  }

  discovered.push(cap);
  if (cap.cjpiScore > topScore) topScore = cap.cjpiScore;
  appendAudit('discovery', `${cap.name}:${cap.cjpiScore}`);
  callbacks.onDiscovery?.(cap);
}

/**
 * Transition to locking phase — no more discoveries accepted.
 */
export function beginLocking(): void {
  if (phase !== 'analyzing') {
    throw new Error(`Cannot lock in phase: ${phase}`);
  }
  setPhase('locking');
  setProgress(80);
  appendAudit('locking_started', `${discovered.length} capabilities`);
}

/**
 * Record ascension completion.
 */
export function commitAscension(count: number): void {
  if (phase !== 'locking') {
    throw new Error(`Cannot ascend in phase: ${phase}`);
  }
  ascendedCount = count;
  setProgress(95);
  appendAudit('ascension_complete', `${count} locked`);
  setPhase('exporting');
}

/**
 * Mark run as done.
 */
export function completeRun(): void {
  completedAt = Date.now();
  setProgress(100);
  setPhase('done');
  appendAudit('run_complete', `${ascendedCount} ascended, top=${topScore}`);
}

/**
 * Mark run as failed.
 */
export function failRun(error: string): void {
  lastError = error;
  setPhase('error');
  appendAudit('run_error', error);
  callbacks.onError?.(error);
}

/**
 * Get the deterministic node ordering for this run.
 */
export function getNodeOrdering(nodes: ReadonlyArray<string>): string[] {
  if (!fingerprint) return [...nodes];
  return seededShuffle([...nodes], fingerprintToSeed(fingerprint));
}

/**
 * Get immutable snapshot of current run state.
 */
export function getSnapshot(): RunSnapshot {
  const chain = getChainState();
  return Object.freeze({
    runId,
    phase,
    fingerprint,
    discovered: Object.freeze([...discovered]),
    ascended: ascendedCount,
    topScore,
    progress,
    startedAt,
    completedAt,
    auditLength: chain.length,
    error: lastError,
  });
}

/**
 * Export retry utility for use by processing step.
 */
export { retry, seededShuffle };
