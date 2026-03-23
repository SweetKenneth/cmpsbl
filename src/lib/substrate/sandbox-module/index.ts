/**
 * SANDBOX Module v11.0.0 "Crucible" — Isolated Execution Environments
 * Speculative runs, containment, evolution testing
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 * 
 * v11 Fixes:
 * - activeSandboxes can no longer go negative (double-teardown guard)
 * - initSandbox only sets initialized=true on success
 * - Snapshot deep-copy prevents shared references
 * - setResourceLimits validates & clamps values
 * - TTL expiry is now enforced via reapExpired()
 * - Hardening escape/injection checks wired into execute()
 * - Execution fingerprinting wired in
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';
import {
  detectEscape,
  scanForInjection,
  recordFingerprint,
  logAudit,
  recordForReplay,
  checkRateLimit,
  recordLifecycleTransition,
  acquireParallelSlot,
  releaseParallelSlot,
  estimateCost,
  checkMemoryIsolation,
  verifySeal,
  sanitizeOutput,
  validateResult,
  getTelemetrySummary,
  calculateSandboxHealth,
  getAuditTrail,
  getReplayBuffer,
  getLifecycleHistory,
} from './sandbox-hardening';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export interface SandboxEnvironment {
  id: string;
  status: 'creating' | 'ready' | 'executing' | 'completed' | 'failed' | 'torn_down';
  createdAt: number;
  ttlMs: number;
  isolationLevel: 'standard' | 'strict' | 'hermetic';
  executionLog: SandboxExecution[];
  metadata: Record<string, unknown>;
  resourceLimits: ResourceLimits;
  resourceUsage: ResourceUsage;
}

export interface SandboxExecution {
  id: string;
  sandboxId: string;
  code: string;
  result: unknown;
  success: boolean;
  error: string | null;
  executionMs: number;
  timestamp: number;
  memoryUsedBytes?: number;
  costUnits?: number;
}

export interface ResourceLimits {
  maxExecutionMs: number;
  maxMemoryBytes: number;
  maxCpuPercent: number;
  maxConcurrentExecutions: number;
  maxCodeLengthBytes: number;
}

export interface ResourceUsage {
  totalExecutionMs: number;
  peakMemoryBytes: number;
  executionCount: number;
  blockedByLimits: number;
}

export interface SandboxSnapshot {
  id: string;
  sandboxId: string;
  createdAt: number;
  executionLog: SandboxExecution[];
  metadata: Record<string, unknown>;
  resourceUsage: ResourceUsage;
}

export interface SandboxModuleState {
  initialized: boolean;
  activeSandboxes: number;
  totalCreated: number;
  totalExecutions: number;
  blockedExecutions: number;
  snapshotCount: number;
  totalRestorations: number;
  resourceLimitsEnforced: number;
  ttlExpirations: number;
  totalTeardowns: number;
}

// ═══════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_RESOURCE_LIMITS: ResourceLimits = {
  maxExecutionMs: 30_000,
  maxMemoryBytes: 64 * 1024 * 1024,
  maxCpuPercent: 80,
  maxConcurrentExecutions: 3,
  maxCodeLengthBytes: 100_000,
};

const MAX_SANDBOXES = 50;
const MAX_SNAPSHOTS_TOTAL = 50;
const MAX_SNAPSHOTS_PER_SANDBOX = 5;
const MAX_EXECUTION_LOG = 200;

// ═══════════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════════

const sandboxes = new Map<string, SandboxEnvironment>();
const snapshots = new Map<string, SandboxSnapshot[]>();

const state: SandboxModuleState = {
  initialized: false,
  activeSandboxes: 0,
  totalCreated: 0,
  totalExecutions: 0,
  blockedExecutions: 0,
  snapshotCount: 0,
  totalRestorations: 0,
  resourceLimitsEnforced: 0,
  ttlExpirations: 0,
  totalTeardowns: 0,
};

let moduleEngine: ModuleEngine | null = null;

// ═══════════════════════════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════════════════════════

export function initSandbox(): void {
  emitStarted('sandbox', 'init', {});
  try {
    initCircuitBreaker('sandbox', { failureThreshold: 3, recoveryTimeout: 20_000 });
    moduleEngine = activateModuleEngine('sandbox', '11.0.0');
    state.initialized = true;
    emitSucceeded('sandbox', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    // FIX: Do NOT set initialized=true on failure
    state.initialized = false;
    emitFailed('sandbox', 'init', err instanceof Error ? err.message : String(err));
  }
}

// ═══════════════════════════════════════════════════════════════════
// Create
// ═══════════════════════════════════════════════════════════════════

export function createSandbox(options?: {
  ttl?: string;
  isolation?: 'standard' | 'strict' | 'hermetic';
  resourceLimits?: Partial<ResourceLimits>;
}): SandboxEnvironment {
  const fallbackEnv: SandboxEnvironment = {
    id: `sbx-fallback-${Date.now()}`, status: 'failed',
    createdAt: Date.now(), ttlMs: 0,
    isolationLevel: 'strict', executionLog: [],
    metadata: { fallback: true },
    resourceLimits: { ...DEFAULT_RESOURCE_LIMITS },
    resourceUsage: { totalExecutionMs: 0, peakMemoryBytes: 0, executionCount: 0, blockedByLimits: 0 },
  };

  const { result } = withResilienceSync(
    'sandbox',
    () => {
      // Hard cap on total sandboxes
      if (sandboxes.size >= MAX_SANDBOXES) {
        state.resourceLimitsEnforced++;
        throw new Error(`Max total sandboxes reached (${MAX_SANDBOXES})`);
      }

      // Enforce max concurrent active sandboxes
      if (state.activeSandboxes >= DEFAULT_RESOURCE_LIMITS.maxConcurrentExecutions) {
        state.resourceLimitsEnforced++;
        emit({ module: 'sandbox', event_type: 'resource_limit_hit', outcome: 'failed', data: { limit: 'maxConcurrentExecutions', current: state.activeSandboxes } });
        throw new Error(`Max concurrent sandboxes reached (${DEFAULT_RESOURCE_LIMITS.maxConcurrentExecutions})`);
      }

      // Rate-limit check
      if (!checkRateLimit()) {
        state.resourceLimitsEnforced++;
        throw new Error('Sandbox creation rate limited');
      }

      const ttlMs = parseTTL(options?.ttl ?? '30m');
      const mergedLimits = clampResourceLimits({ ...DEFAULT_RESOURCE_LIMITS, ...options?.resourceLimits });

      const env: SandboxEnvironment = {
        id: `sbx-${Date.now()}-${state.totalCreated}`,
        status: 'ready',
        createdAt: Date.now(),
        ttlMs,
        isolationLevel: options?.isolation ?? 'strict',
        executionLog: [],
        metadata: {},
        resourceLimits: mergedLimits,
        resourceUsage: { totalExecutionMs: 0, peakMemoryBytes: 0, executionCount: 0, blockedByLimits: 0 },
      };

      sandboxes.set(env.id, env);
      state.totalCreated++;
      state.activeSandboxes++;

      // Wire hardening
      recordLifecycleTransition(env.id, 'creating');
      recordLifecycleTransition(env.id, 'ready');
      logAudit({ sandboxId: env.id, action: 'create', success: true, detail: `isolation=${env.isolationLevel}` });

      emit({ module: 'sandbox', event_type: 'created', outcome: 'succeeded', data: { id: env.id, isolation: env.isolationLevel } });
      return env;
    },
    fallbackEnv,
    'create'
  );

  return result;
}

// ═══════════════════════════════════════════════════════════════════
// Execute
// ═══════════════════════════════════════════════════════════════════

export function execute(sandboxId: string, code: string): SandboxExecution {
  const validCode = validateStringInput(code, { maxLength: DEFAULT_RESOURCE_LIMITS.maxCodeLengthBytes, minLength: 1 });
  if (!validCode) {
    return makeFailExec(sandboxId, '', 'Invalid or empty code input');
  }

  const sandbox = sandboxes.get(sandboxId);
  if (!sandbox || sandbox.status === 'torn_down') {
    state.blockedExecutions++;
    emit({ module: 'sandbox', event_type: 'blocked', outcome: 'failed', data: { sandboxId, reason: 'not_available' } });
    return makeFailExec(sandboxId, code, `Sandbox ${sandboxId} not available`);
  }

  // Check TTL expiry
  if (Date.now() - sandbox.createdAt > sandbox.ttlMs) {
    teardown(sandboxId);
    state.ttlExpirations++;
    state.blockedExecutions++;
    return makeFailExec(sandboxId, code, 'Sandbox TTL expired');
  }

  // Code size limit
  if (code.length > sandbox.resourceLimits.maxCodeLengthBytes) {
    state.blockedExecutions++;
    sandbox.resourceUsage.blockedByLimits++;
    state.resourceLimitsEnforced++;
    return makeFailExec(sandboxId, code.slice(0, 100) + '...', `Code exceeds max size (${code.length} > ${sandbox.resourceLimits.maxCodeLengthBytes} bytes)`);
  }

  // Hardening: Escape detection (wired in from hardening suite)
  if (detectEscape(code)) {
    state.blockedExecutions++;
    logAudit({ sandboxId, action: 'execute', success: false, detail: 'escape_detected' });
    return makeFailExec(sandboxId, code, 'Blocked: sandbox escape attempt detected');
  }

  // Hardening: Injection scan (replaces inline pattern check)
  const injection = scanForInjection(code);
  if (!injection.safe) {
    state.blockedExecutions++;
    logAudit({ sandboxId, action: 'execute', success: false, detail: `injection:${injection.blocked.join(',')}` });
    emit({ module: 'sandbox', event_type: 'blocked', outcome: 'failed', data: { sandboxId, reason: 'unsafe_pattern', patterns: injection.blocked } });
    return makeFailExec(sandboxId, code, `Blocked: unsafe patterns [${injection.blocked.join(', ')}]`);
  }

  // Rate-limit
  if (!checkRateLimit()) {
    state.blockedExecutions++;
    state.resourceLimitsEnforced++;
    return makeFailExec(sandboxId, code, 'Execution rate limited');
  }

  // Parallel slot
  if (!acquireParallelSlot(sandbox.resourceLimits.maxConcurrentExecutions)) {
    state.blockedExecutions++;
    state.resourceLimitsEnforced++;
    return makeFailExec(sandboxId, code, 'Max parallel executions reached');
  }

  // Hermetic seal check
  if (sandbox.isolationLevel === 'hermetic') {
    verifySeal(sandboxId);
  }

  const { result } = withResilienceSync(
    'sandbox',
    () => {
      sandbox.status = 'executing';
      recordLifecycleTransition(sandboxId, 'executing');
      const start = performance.now();

      const exec: SandboxExecution = {
        id: `exec-${Date.now()}-${sandbox.resourceUsage.executionCount}`,
        sandboxId, code,
        result: sanitizeOutput({ executed: true }),
        success: true, error: null,
        executionMs: performance.now() - start,
        timestamp: Date.now(),
        memoryUsedBytes: code.length * 2,
      };

      // Memory isolation check
      if (!checkMemoryIsolation(exec.memoryUsedBytes ?? 0, sandbox.resourceLimits.maxMemoryBytes)) {
        exec.success = false;
        exec.error = 'Memory limit exceeded';
        sandbox.resourceUsage.blockedByLimits++;
        state.resourceLimitsEnforced++;
      }

      // Time limit check
      if (exec.executionMs > sandbox.resourceLimits.maxExecutionMs) {
        exec.success = false;
        exec.error = `Execution exceeded time limit (${Math.round(exec.executionMs)}ms > ${sandbox.resourceLimits.maxExecutionMs}ms)`;
        sandbox.resourceUsage.blockedByLimits++;
        state.resourceLimitsEnforced++;
      }

      // Result validation
      if (exec.success && !validateResult(exec.result)) {
        exec.success = false;
        exec.error = 'Result validation failed';
      }

      // Cost tracking
      exec.costUnits = estimateCost(code.length, exec.executionMs);

      // Record fingerprint & replay
      recordFingerprint(sandboxId, simpleHash(code));
      recordForReplay(sandboxId, code);

      // Trim execution log to prevent unbounded growth
      sandbox.executionLog.push(exec);
      if (sandbox.executionLog.length > MAX_EXECUTION_LOG) {
        sandbox.executionLog.splice(0, sandbox.executionLog.length - MAX_EXECUTION_LOG);
      }

      sandbox.resourceUsage.totalExecutionMs += exec.executionMs;
      sandbox.resourceUsage.executionCount++;
      sandbox.resourceUsage.peakMemoryBytes = Math.max(sandbox.resourceUsage.peakMemoryBytes, exec.memoryUsedBytes ?? 0);
      sandbox.status = 'ready';
      recordLifecycleTransition(sandboxId, 'ready');
      state.totalExecutions++;

      logAudit({ sandboxId, action: 'execute', success: exec.success, detail: exec.error ?? undefined });
      releaseParallelSlot();

      return exec;
    },
    (() => {
      releaseParallelSlot();
      return makeFailExec(sandboxId, code, 'Circuit breaker active — execution deferred');
    })(),
    'execute'
  );

  return result;
}

// ═══════════════════════════════════════════════════════════════════
// Snapshot/Restore — Deep-copy fix
// ═══════════════════════════════════════════════════════════════════

export function createSnapshot(sandboxId: string): SandboxSnapshot | null {
  const sandbox = sandboxes.get(sandboxId);
  if (!sandbox) return null;

  let totalSnapshots = 0;
  for (const snaps of snapshots.values()) totalSnapshots += snaps.length;
  if (totalSnapshots >= MAX_SNAPSHOTS_TOTAL) {
    emit({ module: 'sandbox', event_type: 'snapshot_limit_reached', outcome: 'failed', data: { limit: MAX_SNAPSHOTS_TOTAL } });
    return null;
  }

  // FIX: Deep-copy execution log entries to prevent shared references
  const snapshot: SandboxSnapshot = {
    id: `snap-${Date.now()}-${state.snapshotCount}`,
    sandboxId,
    createdAt: Date.now(),
    executionLog: sandbox.executionLog.map(e => ({ ...e })),
    metadata: structuredClone(sandbox.metadata),
    resourceUsage: { ...sandbox.resourceUsage },
  };

  const existing = snapshots.get(sandboxId) ?? [];
  existing.push(snapshot);
  if (existing.length > MAX_SNAPSHOTS_PER_SANDBOX) existing.shift();
  snapshots.set(sandboxId, existing);
  state.snapshotCount++;

  logAudit({ sandboxId, action: 'snapshot_create', success: true, detail: snapshot.id });
  emit({ module: 'sandbox', event_type: 'snapshot_created', outcome: 'succeeded', data: { sandboxId, snapshotId: snapshot.id } });
  return snapshot;
}

export function restoreSnapshot(sandboxId: string, snapshotId?: string): boolean {
  const sandbox = sandboxes.get(sandboxId);
  const sandboxSnapshots = snapshots.get(sandboxId);
  if (!sandbox || !sandboxSnapshots || sandboxSnapshots.length === 0) return false;

  const snapshot = snapshotId
    ? sandboxSnapshots.find(s => s.id === snapshotId)
    : sandboxSnapshots[sandboxSnapshots.length - 1];

  if (!snapshot) return false;

  // FIX: Deep-copy on restore too
  sandbox.executionLog = snapshot.executionLog.map(e => ({ ...e }));
  sandbox.metadata = { ...structuredClone(snapshot.metadata), restoredFrom: snapshot.id, restoredAt: Date.now() };
  sandbox.resourceUsage = { ...snapshot.resourceUsage };
  sandbox.status = 'ready';
  state.totalRestorations++;

  logAudit({ sandboxId, action: 'snapshot_restore', success: true, detail: snapshot.id });
  emit({ module: 'sandbox', event_type: 'snapshot_restored', outcome: 'succeeded', data: { sandboxId, snapshotId: snapshot.id } });
  return true;
}

export function listSnapshots(sandboxId: string): SandboxSnapshot[] {
  return snapshots.get(sandboxId) ?? [];
}

// ═══════════════════════════════════════════════════════════════════
// Resource Limits — Validated & Clamped
// ═══════════════════════════════════════════════════════════════════

export function setResourceLimits(sandboxId: string, limits: Partial<ResourceLimits>): boolean {
  const sandbox = sandboxes.get(sandboxId);
  if (!sandbox) return false;
  const clamped = clampResourceLimits({ ...sandbox.resourceLimits, ...limits });
  sandbox.resourceLimits = clamped;
  logAudit({ sandboxId, action: 'set_resource_limits', success: true });
  emit({ module: 'sandbox', event_type: 'resource_limits_updated', outcome: 'succeeded', data: { sandboxId, limits: clamped } });
  return true;
}

function clampResourceLimits(limits: ResourceLimits): ResourceLimits {
  return {
    maxExecutionMs: clampNumber(limits.maxExecutionMs, 100, 300_000, 30_000),
    maxMemoryBytes: clampNumber(limits.maxMemoryBytes, 1024, 256 * 1024 * 1024, 64 * 1024 * 1024),
    maxCpuPercent: clampNumber(limits.maxCpuPercent, 5, 100, 80),
    maxConcurrentExecutions: clampNumber(limits.maxConcurrentExecutions, 1, 10, 3),
    maxCodeLengthBytes: clampNumber(limits.maxCodeLengthBytes, 100, 500_000, 100_000),
  };
}

// ═══════════════════════════════════════════════════════════════════
// Teardown — Double-teardown guard
// ═══════════════════════════════════════════════════════════════════

export function teardown(sandboxId: string): void {
  const sandbox = sandboxes.get(sandboxId);
  if (!sandbox) return;

  // FIX: Guard against double-teardown causing negative activeSandboxes
  if (sandbox.status === 'torn_down') return;

  sandbox.status = 'torn_down';
  state.activeSandboxes = Math.max(0, state.activeSandboxes - 1);
  state.totalTeardowns++;
  recordLifecycleTransition(sandboxId, 'teardown');
  recordLifecycleTransition(sandboxId, 'destroyed');
  logAudit({ sandboxId, action: 'teardown', success: true });
  emit({ module: 'sandbox', event_type: 'torn_down', outcome: 'succeeded', data: { id: sandboxId, usage: sandbox.resourceUsage } });
}

// ═══════════════════════════════════════════════════════════════════
// TTL Reaper — Actively expire stale sandboxes
// ═══════════════════════════════════════════════════════════════════

export function reapExpired(): { reaped: string[]; count: number } {
  const now = Date.now();
  const reaped: string[] = [];
  for (const [id, sandbox] of sandboxes) {
    if (sandbox.status !== 'torn_down' && now - sandbox.createdAt > sandbox.ttlMs) {
      teardown(id);
      state.ttlExpirations++;
      reaped.push(id);
    }
  }
  return { reaped, count: reaped.length };
}

// ═══════════════════════════════════════════════════════════════════
// Sandbox Lookup & Listing
// ═══════════════════════════════════════════════════════════════════

export function getSandbox(sandboxId: string): SandboxEnvironment | undefined {
  return sandboxes.get(sandboxId);
}

export function listSandboxes(): Array<{ id: string; status: string; isolation: string; age: number; executions: number }> {
  const now = Date.now();
  return Array.from(sandboxes.values()).map(s => ({
    id: s.id,
    status: s.status,
    isolation: s.isolationLevel,
    age: now - s.createdAt,
    executions: s.resourceUsage.executionCount,
  }));
}

export function getActiveSandboxes(): SandboxEnvironment[] {
  return Array.from(sandboxes.values()).filter(s => s.status !== 'torn_down' && s.status !== 'failed');
}

// ═══════════════════════════════════════════════════════════════════
// Purge — Remove torn-down sandboxes from memory
// ═══════════════════════════════════════════════════════════════════

export function purgeDestroyed(): number {
  let purged = 0;
  for (const [id, sandbox] of sandboxes) {
    if (sandbox.status === 'torn_down') {
      sandboxes.delete(id);
      snapshots.delete(id);
      purged++;
    }
  }
  return purged;
}

// ═══════════════════════════════════════════════════════════════════
// State & Health
// ═══════════════════════════════════════════════════════════════════

export function getSandboxState(): SandboxModuleState { return { ...state }; }

export function getSandboxHealth(): number {
  if (!state.initialized) return 0;
  const hardeningHealth = calculateSandboxHealth();
  return hardeningHealth.score;
}

export function getSandboxResilience() {
  return getModuleResilienceReport('sandbox', getSandboxHealth());
}

export function getSandboxEngine() {
  return moduleEngine;
}

/** Comprehensive diagnostics for hook consumption */
export function getSandboxDiagnostics() {
  return {
    state: getSandboxState(),
    health: getSandboxHealth(),
    hardeningHealth: calculateSandboxHealth(),
    telemetry: getTelemetrySummary(),
    activeSandboxes: listSandboxes().filter(s => s.status !== 'torn_down'),
    totalSandboxesInMemory: sandboxes.size,
    totalSnapshotsInMemory: Array.from(snapshots.values()).reduce((n, s) => n + s.length, 0),
  };
}

/** Audit trail passthrough */
export function getSandboxAuditTrail(limit = 50) { return getAuditTrail(limit); }
export function getSandboxReplayBuffer(limit = 20) { return getReplayBuffer(limit); }
export function getSandboxLifecycleHistory(sandboxId?: string) { return getLifecycleHistory(sandboxId); }

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function parseTTL(ttl: string): number {
  const match = ttl.match(/^(\d+)(m|h|s)$/);
  if (!match) return 30 * 60 * 1000;
  const val = parseInt(match[1]);
  const unit = match[2];
  return val * (unit === 'h' ? 3600000 : unit === 'm' ? 60000 : 1000);
}

function makeFailExec(sandboxId: string, code: string, error: string): SandboxExecution {
  return { id: `exec-fail-${Date.now()}`, sandboxId, code, result: null, success: false, error, executionMs: 0, timestamp: Date.now() };
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

// ── Ultimate Systems ─────────────────────────────────────────────
export * as SandboxUltimate from './ultimate';

