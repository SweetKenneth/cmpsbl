/**
 * NERVE Ultimate — Chain Orchestrator Guard Layer
 *
 * Three interlocking safety + observability layers that wrap the Primary
 * Memory Chain trigger & execution flow:
 *
 *   1. Node Lock Guard
 *      • Prevents a node from being targeted by two chains simultaneously.
 *      • Short-TTL locks (configurable, default 8 s) keyed by nodeId.
 *      • Locks are acquired at stage-start, released on completion/timeout.
 *      • Higher-priority constraint than cooldown — a chain whose *any*
 *        target node is locked is deferred rather than executed.
 *
 *   2. Cascade Relationship Tracker
 *      • Records chainA → chainB "followed-by" edges when chainB fires
 *        within a temporal window of chainA completing.
 *      • Tracks cascade depth via execution context; blocks/defers when
 *        depth exceeds a configurable threshold (default 3).
 *      • Bounded in-memory relationship log for offline analysis.
 *
 *   3. Activity Telemetry
 *      • Lightweight per-chain counters: executions, lastExecutedAt,
 *        EMA avgDuration, simple success ratio.
 *      • `getChainActivitySummary()` surfaces hot / slow / failing chains.
 *      • Purely observational — never mutates chain definitions or logic.
 *
 * All guards are non-blocking: they skip or defer rather than throw.
 * The entire layer is deterministic and reversible (clear/reset helpers).
 */

import type {
  ChainId,
  PrimaryChainDefinition,
  ChainExecution,
} from './primaryMemoryChains';

import {
  evaluateTriggers as rawEvaluateTriggers,
  executeChain as rawExecuteChain,
} from './primaryMemoryChains';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface GuardConfig {
  /** Node lock TTL in ms (default 8000) */
  nodeLockTtlMs: number;
  /** Max cascade depth before blocking (default 3) */
  maxCascadeDepth: number;
  /** Temporal window in ms to detect chain→chain follow (default 5000) */
  cascadeWindowMs: number;
  /** Max relationship log entries (default 500) */
  maxRelationshipLogSize: number;
  /** EMA alpha for activity telemetry (default 0.2) */
  emaAlpha: number;
}

const DEFAULT_CONFIG: GuardConfig = {
  nodeLockTtlMs: 8_000,
  maxCascadeDepth: 3,
  cascadeWindowMs: 5_000,
  maxRelationshipLogSize: 500,
  emaAlpha: 0.2,
};

let config: GuardConfig = { ...DEFAULT_CONFIG };

/** Update guard configuration (partial merge) */
export function configureGuard(partial: Partial<GuardConfig>): GuardConfig {
  config = { ...config, ...partial };
  return { ...config };
}

/** Get current guard configuration */
export function getGuardConfig(): GuardConfig {
  return { ...config };
}

// ═══════════════════════════════════════════════════════════════
// 1. NODE LOCK GUARD
// ═══════════════════════════════════════════════════════════════

interface NodeLock {
  nodeId: string;
  chainId: ChainId;
  executionId: string;
  lockedAt: number;
  ttlMs: number;
}

const nodeLocks = new Map<string, NodeLock>();

/** Acquire a lock for a node. Returns true if acquired. */
function acquireNodeLock(
  nodeId: string,
  chainId: ChainId,
  executionId: string,
): boolean {
  evictExpiredLocks();
  const existing = nodeLocks.get(nodeId);
  if (existing) return false; // Already locked
  nodeLocks.set(nodeId, {
    nodeId,
    chainId,
    executionId,
    lockedAt: Date.now(),
    ttlMs: config.nodeLockTtlMs,
  });
  return true;
}

/** Release a specific node lock */
function releaseNodeLock(nodeId: string, executionId: string): void {
  const lock = nodeLocks.get(nodeId);
  if (lock && lock.executionId === executionId) {
    nodeLocks.delete(nodeId);
  }
}

/** Release all locks owned by an execution */
function releaseAllLocksForExecution(executionId: string): void {
  for (const [nodeId, lock] of nodeLocks) {
    if (lock.executionId === executionId) {
      nodeLocks.delete(nodeId);
    }
  }
}

/** Evict locks whose TTL has expired */
function evictExpiredLocks(): void {
  const now = Date.now();
  for (const [nodeId, lock] of nodeLocks) {
    if (now - lock.lockedAt > lock.ttlMs) {
      nodeLocks.delete(nodeId);
    }
  }
}

/** Check if all target nodes in a chain are available (unlocked) */
function areChainNodesAvailable(chain: PrimaryChainDefinition): boolean {
  evictExpiredLocks();
  for (const stage of chain.stages) {
    if (nodeLocks.has(stage.node)) return false;
  }
  return true;
}

/** Get current active node locks (diagnostic) */
export function getActiveNodeLocks(): NodeLock[] {
  evictExpiredLocks();
  return Array.from(nodeLocks.values()).map(l => ({ ...l }));
}

/** Force-clear all node locks (emergency / testing) */
export function clearAllNodeLocks(): number {
  const count = nodeLocks.size;
  nodeLocks.clear();
  return count;
}

// ═══════════════════════════════════════════════════════════════
// 2. CASCADE RELATIONSHIP TRACKER
// ═══════════════════════════════════════════════════════════════

export interface CascadeRelationship {
  parentChainId: ChainId;
  childChainId: ChainId;
  parentExecutionId: string;
  childExecutionId: string;
  delayMs: number;
  depth: number;
  recordedAt: number;
}

export interface CascadeContext {
  parentChainId: ChainId;
  parentExecutionId: string;
  depth: number;
  completedAt: number;
}

/** Recent chain completion records for temporal matching */
interface RecentCompletion {
  chainId: ChainId;
  executionId: string;
  completedAt: number;
  depth: number;
}

const recentCompletions: RecentCompletion[] = [];
const MAX_RECENT_COMPLETIONS = 100;

const cascadeRelationships: CascadeRelationship[] = [];

/** Record a chain completion for later cascade matching */
function recordCompletion(
  chainId: ChainId,
  executionId: string,
  depth: number,
): void {
  recentCompletions.push({
    chainId,
    executionId,
    completedAt: Date.now(),
    depth,
  });
  if (recentCompletions.length > MAX_RECENT_COMPLETIONS) {
    recentCompletions.splice(0, recentCompletions.length - MAX_RECENT_COMPLETIONS);
  }
}

/**
 * Resolve the cascade context for a new chain execution.
 * Checks if any chain completed within the cascade window.
 */
function resolveCascadeContext(chainId: ChainId): CascadeContext | null {
  const now = Date.now();
  // Walk backwards to find the most recent completion within the window
  for (let i = recentCompletions.length - 1; i >= 0; i--) {
    const rc = recentCompletions[i];
    if (rc.chainId === chainId) continue; // Skip self
    if (now - rc.completedAt <= config.cascadeWindowMs) {
      return {
        parentChainId: rc.chainId,
        parentExecutionId: rc.executionId,
        depth: rc.depth + 1,
        completedAt: rc.completedAt,
      };
    }
  }
  return null;
}

/** Record a cascade relationship */
function recordCascadeRelationship(
  parentChainId: ChainId,
  childChainId: ChainId,
  parentExecutionId: string,
  childExecutionId: string,
  delayMs: number,
  depth: number,
): void {
  cascadeRelationships.push({
    parentChainId,
    childChainId,
    parentExecutionId,
    childExecutionId,
    delayMs,
    depth,
    recordedAt: Date.now(),
  });
  if (cascadeRelationships.length > config.maxRelationshipLogSize) {
    cascadeRelationships.splice(
      0,
      cascadeRelationships.length - config.maxRelationshipLogSize,
    );
  }
}

/** Get the cascade relationship log */
export function getCascadeRelationships(limit = 50): CascadeRelationship[] {
  return cascadeRelationships.slice(-limit).map(r => ({ ...r }));
}

/** Get cascade frequency map (how often chainA triggers chainB) */
export function getCascadeFrequencyMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of cascadeRelationships) {
    const key = `${r.parentChainId} → ${r.childChainId}`;
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}

/** Clear cascade tracking state */
export function clearCascadeTracking(): void {
  recentCompletions.length = 0;
  cascadeRelationships.length = 0;
}

// ═══════════════════════════════════════════════════════════════
// 3. ACTIVITY TELEMETRY
// ═══════════════════════════════════════════════════════════════

export interface ChainActivity {
  chainId: ChainId;
  executions: number;
  successes: number;
  failures: number;
  deferred: number;        // blocked by guard layer
  lastExecutedAt: number | null;
  avgDurationMs: number;   // EMA
  successRatio: number;    // simple ratio
}

export interface ChainActivitySummary {
  totalExecutions: number;
  totalDeferred: number;
  hotChains: ChainActivity[];       // most executions
  slowChains: ChainActivity[];      // highest avgDuration
  failingChains: ChainActivity[];   // lowest successRatio (with >= 3 execs)
  allActivity: ChainActivity[];
}

const activityMap = new Map<ChainId, ChainActivity>();

function ensureActivity(chainId: ChainId): ChainActivity {
  let a = activityMap.get(chainId);
  if (!a) {
    a = {
      chainId,
      executions: 0,
      successes: 0,
      failures: 0,
      deferred: 0,
      lastExecutedAt: null,
      avgDurationMs: 0,
      successRatio: 1,
    };
    activityMap.set(chainId, a);
  }
  return a;
}

function recordActivityExecution(chainId: ChainId, execution: ChainExecution): void {
  const a = ensureActivity(chainId);
  a.executions++;
  a.lastExecutedAt = execution.triggeredAt;

  if (execution.outcome === 'success') a.successes++;
  else if (execution.outcome === 'failed') a.failures++;

  // Simple success ratio
  a.successRatio = a.executions > 0 ? a.successes / a.executions : 1;

  // EMA duration
  if (execution.durationMs !== null) {
    a.avgDurationMs = config.emaAlpha * execution.durationMs +
      (1 - config.emaAlpha) * a.avgDurationMs;
  }
}

function recordActivityDeferred(chainId: ChainId): void {
  const a = ensureActivity(chainId);
  a.deferred++;
}

/** Get full activity summary with hot/slow/failing analysis */
export function getChainActivitySummary(): ChainActivitySummary {
  const all = Array.from(activityMap.values()).map(a => ({ ...a }));
  const totalExecs = all.reduce((s, a) => s + a.executions, 0);
  const totalDeferred = all.reduce((s, a) => s + a.deferred, 0);

  // Hot = most executions (top 5)
  const hotChains = [...all]
    .sort((a, b) => b.executions - a.executions)
    .slice(0, 5);

  // Slow = highest avgDuration (top 5, must have at least 1 execution)
  const slowChains = [...all]
    .filter(a => a.executions > 0)
    .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
    .slice(0, 5);

  // Failing = lowest successRatio (top 5, must have at least 3 executions)
  const failingChains = [...all]
    .filter(a => a.executions >= 3)
    .sort((a, b) => a.successRatio - b.successRatio)
    .slice(0, 5);

  return {
    totalExecutions: totalExecs,
    totalDeferred: totalDeferred,
    hotChains,
    slowChains,
    failingChains,
    allActivity: all,
  };
}

/** Get activity for a single chain */
export function getChainActivity(chainId: ChainId): ChainActivity | null {
  return activityMap.has(chainId) ? { ...activityMap.get(chainId)! } : null;
}

/** Clear all activity telemetry */
export function clearActivityTelemetry(): void {
  activityMap.clear();
}

// ═══════════════════════════════════════════════════════════════
// GUARDED WRAPPERS
// ═══════════════════════════════════════════════════════════════

export type DeferReason = 'node_locked' | 'cascade_depth_exceeded';

export interface GuardedTriggerResult {
  /** Chains that passed all guards and are ready to execute */
  eligible: PrimaryChainDefinition[];
  /** Chains that matched triggers but were deferred by guards */
  deferred: Array<{
    chain: PrimaryChainDefinition;
    reason: DeferReason;
    detail: string;
  }>;
}

/**
 * Guarded version of evaluateTriggers.
 * Runs the original trigger evaluation, then filters through:
 *   1. Node lock guard — skips chains with locked target nodes
 *   2. Cascade depth guard — skips chains exceeding cascade depth
 *
 * Non-blocking: deferred chains are reported, never crash.
 */
export function guardedEvaluateTriggers(
  sourceNode: string,
  signalType: string,
  payload: Record<string, unknown>,
): GuardedTriggerResult {
  const raw = rawEvaluateTriggers(sourceNode, signalType, payload);
  const eligible: PrimaryChainDefinition[] = [];
  const deferred: GuardedTriggerResult['deferred'] = [];

  for (const chain of raw) {
    // Guard 1: Node locks
    if (!areChainNodesAvailable(chain)) {
      deferred.push({
        chain,
        reason: 'node_locked',
        detail: `One or more target nodes locked: ${chain.stages
          .filter(s => nodeLocks.has(s.node))
          .map(s => s.node.toUpperCase())
          .join(', ')}`,
      });
      recordActivityDeferred(chain.id);
      continue;
    }

    // Guard 2: Cascade depth
    const ctx = resolveCascadeContext(chain.id);
    if (ctx && ctx.depth >= config.maxCascadeDepth) {
      deferred.push({
        chain,
        reason: 'cascade_depth_exceeded',
        detail: `Cascade depth ${ctx.depth} exceeds max ${config.maxCascadeDepth} (parent: ${ctx.parentChainId})`,
      });
      recordActivityDeferred(chain.id);
      continue;
    }

    eligible.push(chain);
  }

  return { eligible, deferred };
}

/**
 * Guarded version of executeChain.
 * Wraps each stage with node lock acquire/release and tracks cascade
 * relationships + activity telemetry.
 *
 * Non-blocking: if a node lock cannot be acquired for a stage, the
 * stage is skipped (if optional) or the chain fails gracefully.
 */
export async function guardedExecuteChain(
  chainId: ChainId,
  triggerPayload: Record<string, unknown>,
  executor: (
    node: string,
    action: string,
    input: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>,
): Promise<ChainExecution> {
  // Resolve cascade context before execution
  const cascadeCtx = resolveCascadeContext(chainId);
  const depth = cascadeCtx ? cascadeCtx.depth : 0;

  // Generate a predictable execution ID for lock tracking
  const lockExecutionId = `guard-${chainId}-${Date.now()}`;

  // Wrap the executor to add node lock semantics
  const guardedExecutor = async (
    node: string,
    action: string,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> => {
    const acquired = acquireNodeLock(node, chainId, lockExecutionId);
    if (!acquired) {
      throw new Error(
        `Node '${node}' is locked by another chain execution`,
      );
    }
    try {
      const result = await executor(node, action, input);
      return result;
    } finally {
      releaseNodeLock(node, lockExecutionId);
    }
  };

  let execution: ChainExecution;
  try {
    execution = await rawExecuteChain(chainId, triggerPayload, guardedExecutor);
  } catch (err) {
    // Ensure locks are cleaned up on unexpected errors
    releaseAllLocksForExecution(lockExecutionId);
    throw err;
  }

  // Cleanup any lingering locks (safety net)
  releaseAllLocksForExecution(lockExecutionId);

  // Record cascade relationship if this was a follow-on chain
  if (cascadeCtx) {
    recordCascadeRelationship(
      cascadeCtx.parentChainId,
      chainId,
      cascadeCtx.parentExecutionId,
      execution.executionId,
      Date.now() - cascadeCtx.completedAt,
      depth,
    );
  }

  // Record completion for future cascade detection
  recordCompletion(chainId, execution.executionId, depth);

  // Activity telemetry
  recordActivityExecution(chainId, execution);

  return execution;
}

// ═══════════════════════════════════════════════════════════════
// FULL RESET (testing / recovery)
// ═══════════════════════════════════════════════════════════════

/** Reset all guard state — node locks, cascade tracking, activity telemetry */
export function resetGuardLayer(): void {
  nodeLocks.clear();
  recentCompletions.length = 0;
  cascadeRelationships.length = 0;
  activityMap.clear();
  config = { ...DEFAULT_CONFIG };
}
