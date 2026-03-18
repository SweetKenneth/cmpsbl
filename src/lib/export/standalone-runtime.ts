/**
 * CMPSBL® Mini-Runtime™ Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The official CMPSBL® portable runtime engine — a self-contained
 * micro-substrate that provides everything the Discovery Engine needs
 * to run WITHOUT the full substrate infrastructure.
 *
 * Includes:
 *   - CJPI scoring engine (weighted 6-axis evaluation)
 *   - Auto-tiering thresholds
 *   - Deterministic hashing (SHA-256 + djb2 fallback)
 *   - Finite state machine (workflow lifecycle)
 *   - Dependency graph (topological sort + cycle detection)
 *   - Pipeline composer (stage registry + validation)
 *   - Saga orchestrator (compensating transactions)
 *   - Pluggable storage adapter (in-memory default, swap to any DB)
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — PLUGGABLE STORAGE ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════

export interface StorageAdapter {
  get<T>(collection: string, id: string): Promise<T | null>;
  list<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]>;
  put<T extends { id: string }>(collection: string, item: T): Promise<void>;
  putMany<T extends { id: string }>(collection: string, items: T[]): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  count(collection: string): Promise<number>;
}

/** Default in-memory storage — works anywhere, no DB required */
export function createMemoryStorage(): StorageAdapter {
  const store = new Map<string, Map<string, unknown>>();

  function getCollection(name: string): Map<string, unknown> {
    if (!store.has(name)) store.set(name, new Map());
    return store.get(name)!;
  }

  return {
    async get<T>(collection: string, id: string): Promise<T | null> {
      return (getCollection(collection).get(id) as T) ?? null;
    },
    async list<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]> {
      const items = Array.from(getCollection(collection).values()) as T[];
      if (!filter) return items;
      return items.filter(item => {
        for (const [key, value] of Object.entries(filter)) {
          if ((item as any)[key] !== value) return false;
        }
        return true;
      });
    },
    async put<T extends { id: string }>(collection: string, item: T): Promise<void> {
      getCollection(collection).set(item.id, item);
    },
    async putMany<T extends { id: string }>(collection: string, items: T[]): Promise<void> {
      const col = getCollection(collection);
      for (const item of items) col.set(item.id, item);
    },
    async delete(collection: string, id: string): Promise<void> {
      getCollection(collection).delete(id);
    },
    async count(collection: string): Promise<number> {
      return getCollection(collection).size;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — CJPI SCORING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface CJPIScoreBreakdown {
  strategicLeverage: number;    // 30% weight
  recursionPotential: number;   // 20% weight
  crossNodeImpact: number;      // 15% weight
  composability: number;        // 15% weight
  governanceInfluence: number;  // 10% weight
  moatSensitivity: number;      // 10% weight
}

const CJPI_WEIGHTS: Record<keyof CJPIScoreBreakdown, number> = {
  strategicLeverage: 0.30,
  recursionPotential: 0.20,
  crossNodeImpact: 0.15,
  composability: 0.15,
  governanceInfluence: 0.10,
  moatSensitivity: 0.10,
};

/** Compute weighted CJPI score (0–100) from 6-axis breakdown */
export function computeCJPI(breakdown: CJPIScoreBreakdown): number {
  let score = 0;
  for (const [key, weight] of Object.entries(CJPI_WEIGHTS)) {
    score += (breakdown[key as keyof CJPIScoreBreakdown] ?? 0) * weight;
  }
  return Math.round(Math.min(100, Math.max(0, score)) * 10) / 10;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — AUTO-TIERING
// ═══════════════════════════════════════════════════════════════════════════════

export type CrystallizedTier = 'creator' | 'architect' | 'enterprise' | 'apex';

export const TIER_THRESHOLDS: Record<CrystallizedTier, { min: number; max: number }> = {
  creator:    { min: 55, max: 69 },
  architect:  { min: 70, max: 84 },
  enterprise: { min: 85, max: 94 },
  apex:       { min: 95, max: 100 },
};

/** Auto-assign tier based on CJPI score */
export function autoAssignTier(cjpiScore: number): CrystallizedTier | null {
  if (cjpiScore >= TIER_THRESHOLDS.apex.min) return 'apex';
  if (cjpiScore >= TIER_THRESHOLDS.enterprise.min) return 'enterprise';
  if (cjpiScore >= TIER_THRESHOLDS.architect.min) return 'architect';
  if (cjpiScore >= TIER_THRESHOLDS.creator.min) return 'creator';
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — DETERMINISTIC HASHING
// ═══════════════════════════════════════════════════════════════════════════════

/** Fast deterministic hash (djb2) — works in all environments */
export function djb2Hash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/** SHA-256 via WebCrypto (async), djb2 fallback */
export async function sha256(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return djb2Hash(input);
}

/** Stable JSON canonicalization (sorted keys, deep) */
export function canonicalize(obj: unknown): string {
  return JSON.stringify(sortKeys(obj));
}

function sortKeys(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(sortKeys);
  if (typeof val === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
      sorted[key] = sortKeys((val as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return val;
}

/** Compute stable deduplication ID for a discovery */
export function computeStableId(name: string, moduleChain: string[], category: string): string {
  const payload = `${name}|${[...moduleChain].sort().join(',')}|${category}`;
  return `disc-${djb2Hash(payload)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — FINITE STATE MACHINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface StateConfig<C = unknown> {
  onEnter?: (ctx: C) => void | Promise<void>;
  onExit?: (ctx: C) => void | Promise<void>;
  meta?: Record<string, unknown>;
}

export interface TransitionConfig<C = unknown> {
  from: string | string[];
  to: string;
  event: string;
  guard?: (ctx: C) => boolean;
  effect?: (ctx: C) => void | Promise<void>;
}

export interface MachineConfig<C = unknown> {
  id: string;
  initial: string;
  context: C;
  states: Record<string, StateConfig<C>>;
  transitions: TransitionConfig<C>[];
  maxHistory?: number;
  onTransition?: (from: string, to: string, event: string, ctx: C) => void;
}

export interface TransitionRecord {
  from: string;
  to: string;
  event: string;
  timestamp: number;
}

export function createStateMachine<C>(config: MachineConfig<C>) {
  const { id, initial, states, transitions, maxHistory = 100, onTransition } = config;
  let current = initial;
  let context = { ...config.context };
  const history: TransitionRecord[] = [];

  if (!states[initial]) throw new Error(`[FSM:${id}] Initial state '${initial}' not defined`);

  async function send(event: string): Promise<boolean> {
    const candidates = transitions.filter(t => {
      const froms = Array.isArray(t.from) ? t.from : [t.from];
      return froms.includes(current) && t.event === event;
    });

    for (const t of candidates) {
      if (t.guard && !t.guard(context)) continue;
      if (!states[t.to]) throw new Error(`[FSM:${id}] Target state '${t.to}' not defined`);

      const from = current;
      const exitHook = states[current]?.onExit;
      if (exitHook) await exitHook(context);
      if (t.effect) await t.effect(context);
      current = t.to;
      const enterHook = states[current]?.onEnter;
      if (enterHook) await enterHook(context);

      history.push({ from, to: current, event, timestamp: Date.now() });
      if (history.length > maxHistory) history.splice(0, history.length - maxHistory);
      onTransition?.(from, current, event, context);
      return true;
    }
    return false;
  }

  function can(event: string): boolean {
    return transitions.some(t => {
      const froms = Array.isArray(t.from) ? t.from : [t.from];
      return froms.includes(current) && t.event === event && (!t.guard || t.guard(context));
    });
  }

  function availableEvents(): string[] {
    return [...new Set(
      transitions
        .filter(t => {
          const froms = Array.isArray(t.from) ? t.from : [t.from];
          return froms.includes(current);
        })
        .filter(t => !t.guard || t.guard(context))
        .map(t => t.event),
    )];
  }

  return {
    send, can, availableEvents,
    matches: (state: string) => current === state,
    getContext: () => ({ ...context }),
    updateContext: (updater: (ctx: C) => C) => { context = updater(context); },
    getHistory: () => [...history],
    snapshot: () => ({ state: current, context: { ...context }, history: [...history] }),
    restore: (snap: { state: string; context: C }) => {
      if (!states[snap.state]) throw new Error(`[FSM:${id}] Cannot restore to unknown state '${snap.state}'`);
      current = snap.state;
      context = { ...snap.context };
    },
    get state() { return current; },
    get id() { return id; },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — DEPENDENCY GRAPH
// ═══════════════════════════════════════════════════════════════════════════════

export interface ModuleNode {
  id: string;
  name: string;
  dependencies: string[];
  bootOrder: number | null;
  status: 'unloaded' | 'loading' | 'ready' | 'failed';
  loadTimeMs: number | null;
}

export function createDependencyGraph() {
  const graph = new Map<string, ModuleNode>();

  function register(id: string, name: string, dependencies: string[] = []): ModuleNode {
    const node: ModuleNode = { id, name, dependencies, bootOrder: null, status: 'unloaded', loadTimeMs: null };
    graph.set(id, node);
    return node;
  }

  function computeBootOrder(): { order: string[]; cycles: string[][] } {
    const visited = new Set<string>();
    const stack = new Set<string>();
    const order: string[] = [];
    const cycles: string[][] = [];

    function visit(nodeId: string, path: string[]): boolean {
      if (stack.has(nodeId)) {
        cycles.push(path.slice(path.indexOf(nodeId)));
        return false;
      }
      if (visited.has(nodeId)) return true;
      stack.add(nodeId);
      const node = graph.get(nodeId);
      if (node) {
        for (const dep of node.dependencies) visit(dep, [...path, nodeId]);
      }
      stack.delete(nodeId);
      visited.add(nodeId);
      order.push(nodeId);
      return true;
    }

    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId)) visit(nodeId, []);
    }

    order.forEach((id, i) => {
      const node = graph.get(id);
      if (node) node.bootOrder = i;
    });

    return { order, cycles };
  }

  function getDependents(moduleId: string): string[] {
    return Array.from(graph.values()).filter(n => n.dependencies.includes(moduleId)).map(n => n.id);
  }

  function getTransitiveDeps(moduleId: string): string[] {
    const result = new Set<string>();
    const queue = [moduleId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = graph.get(current);
      if (node) {
        for (const dep of node.dependencies) {
          if (!result.has(dep)) { result.add(dep); queue.push(dep); }
        }
      }
    }
    return Array.from(result);
  }

  return {
    register, computeBootOrder, getDependents, getTransitiveDeps,
    setStatus: (id: string, status: ModuleNode['status'], loadTimeMs?: number) => {
      const node = graph.get(id);
      if (node) { node.status = status; if (loadTimeMs !== undefined) node.loadTimeMs = loadTimeMs; }
    },
    getAll: () => Array.from(graph.values()),
    get: (id: string) => graph.get(id),
    getReady: () => Array.from(graph.values()).filter(n => n.status === 'ready'),
    getFailed: () => Array.from(graph.values()).filter(n => n.status === 'failed'),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — PIPELINE COMPOSER
// ═══════════════════════════════════════════════════════════════════════════════

export interface PipelineStage {
  id: string;
  name: string;
  moduleId: string;
  handler: string;
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  timeoutMs: number;
  retries: number;
}

export interface ComposedPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  mode: 'sequential' | 'parallel' | 'adaptive';
  status: 'draft' | 'validated' | 'active' | 'archived';
  createdAt: number;
  lastRunAt: number | null;
  runCount: number;
}

export function createPipelineComposer() {
  const stageRegistry = new Map<string, PipelineStage>();
  const pipelines = new Map<string, ComposedPipeline>();

  function registerStage(stage: PipelineStage): PipelineStage {
    stageRegistry.set(stage.id, stage);
    return stage;
  }

  function compose(name: string, stageIds: string[], mode: ComposedPipeline['mode'] = 'sequential'): ComposedPipeline | null {
    const stages = stageIds.map(id => stageRegistry.get(id)).filter(Boolean) as PipelineStage[];
    if (stages.length !== stageIds.length) return null;
    const pipeline: ComposedPipeline = {
      id: `pipeline-${Date.now()}-${djb2Hash(name)}`,
      name, stages, mode, status: 'draft', createdAt: Date.now(), lastRunAt: null, runCount: 0,
    };
    pipelines.set(pipeline.id, pipeline);
    return pipeline;
  }

  function validate(pipelineId: string): { valid: boolean; errors: string[] } {
    const pipeline = pipelines.get(pipelineId);
    if (!pipeline) return { valid: false, errors: ['Pipeline not found'] };
    const errors: string[] = [];
    if (pipeline.mode === 'sequential') {
      for (let i = 1; i < pipeline.stages.length; i++) {
        const prev = pipeline.stages[i - 1];
        const curr = pipeline.stages[i];
        const missing = Object.keys(curr.inputSchema).filter(k => !Object.keys(prev.outputSchema).includes(k));
        if (missing.length > 0) errors.push(`Stage ${curr.id} missing inputs: ${missing.join(', ')} (from ${prev.id})`);
      }
    }
    if (errors.length === 0) pipeline.status = 'validated';
    return { valid: errors.length === 0, errors };
  }

  return {
    registerStage, compose, validate,
    getPipelines: () => Array.from(pipelines.values()),
    getStages: () => Array.from(stageRegistry.values()),
    get: (id: string) => pipelines.get(id),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — SAGA ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

type SagaStepFn<C> = (context: C) => Promise<C>;

interface SagaStep<C> {
  name: string;
  execute: SagaStepFn<C>;
  compensate: SagaStepFn<C>;
}

export interface SagaResult<C> {
  success: boolean;
  context: C;
  completedSteps: string[];
  failedStep?: string;
  error?: string;
  compensated: boolean;
}

export class Saga<C> {
  private steps: SagaStep<C>[] = [];
  readonly id: string;

  constructor(id: string) { this.id = id; }

  step(name: string, execute: SagaStepFn<C>, compensate: SagaStepFn<C>): this {
    this.steps.push({ name, execute, compensate });
    return this;
  }

  async run(initialContext: C): Promise<SagaResult<C>> {
    let context = initialContext;
    const completed: string[] = [];

    for (const step of this.steps) {
      try {
        context = await step.execute(context);
        completed.push(step.name);
      } catch (err) {
        let compensated = true;
        for (let i = completed.length - 1; i >= 0; i--) {
          const compStep = this.steps.find(s => s.name === completed[i]);
          try { if (compStep) context = await compStep.compensate(context); }
          catch { compensated = false; }
        }
        return {
          success: false, context, completedSteps: completed,
          failedStep: step.name, error: err instanceof Error ? err.message : String(err), compensated,
        };
      }
    }
    return { success: true, context, completedSteps: completed, compensated: false };
  }
}

export function createSaga<C>(id: string): Saga<C> { return new Saga<C>(id); }

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — SYNERGY MULTIPLIER
// ═══════════════════════════════════════════════════════════════════════════════

/** Compute synergy bonus based on module chain diversity */
export function computeSynergyMultiplier(moduleChain: string[]): number {
  const unique = new Set(moduleChain);
  if (unique.size >= 4) return 1.15;
  if (unique.size >= 3) return 1.08;
  return 1.0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §10 — CANONICAL MODULES (40-node matrix)
// ═══════════════════════════════════════════════════════════════════════════════

export const CANONICAL_MODULES = [
  // Core infrastructure (1-10)
  'CORE', 'BRAIN', 'MEMORY', 'NERVE', 'DECODE',
  'ENCODE', 'CORTEX', 'DEFENSE', 'ORACLE', 'CONSCIENCE',
  // Specialized operations (11-20)
  'PHANTOM', 'HARVEST', 'EVOLUTION', 'SHADOW', 'IMMUNITY',
  'INTENT', 'GOVERNANCE', 'ATLAS', 'FORGE', 'LINGUA',
  // Communication & authority (21-30)
  'ECHO', 'SOVEREIGN', 'REFLEX', 'TREATY', 'ENGINEER',
  'COMPASS', 'OBSERVER', 'RELAY', 'NEXUS', 'DREAM',
  // Extended capabilities (31-40)
  'PRISM', 'AUDIT', 'IDENTITY', 'MESH', 'ECONOMY',
  'ACCESS', 'VISION', 'ANALYTICS', 'MEDIC', 'RIPPLE',
] as const;

export type CanonicalModule = typeof CANONICAL_MODULES[number];

export const DISCOVERY_CATEGORIES = [
  'cognitive', 'evolution', 'security', 'routing', 'learning',
  'orchestration', 'integration', 'observability', 'governance',
  'compliance', 'prediction', 'ethics', 'privacy', 'synthesis',
  'localization', 'geospatial', 'simulation', 'contracts', 'acquisition', 'edge',
] as const;

export type DiscoveryCategory = typeof DISCOVERY_CATEGORIES[number];

export const ERROR_STRATEGIES = ['retry', 'skip', 'abort', 'rollback', 'fallback'] as const;
export type ErrorStrategy = typeof ERROR_STRATEGIES[number];

// ═══════════════════════════════════════════════════════════════════════════════
// §11 — CONCURRENCY LOCK (in-memory, no DB needed)
// ═══════════════════════════════════════════════════════════════════════════════

export function createLockManager() {
  const locks = new Map<string, { holder: string; expiresAt: number }>();

  return {
    acquire(lockId: string, holder: string, ttlMs = 300_000): boolean {
      const existing = locks.get(lockId);
      if (existing && existing.holder !== holder && existing.expiresAt > Date.now()) return false;
      locks.set(lockId, { holder, expiresAt: Date.now() + ttlMs });
      return true;
    },
    release(lockId: string): void {
      locks.delete(lockId);
    },
    isLocked(lockId: string): boolean {
      const lock = locks.get(lockId);
      return !!lock && lock.expiresAt > Date.now();
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §12 — RE-EXPORTS FROM CHAIN EXECUTOR & MODULE EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  executeChain,
  executeChainBatch,
  dryRunChain,
  formatExecutionSummary,
  type ChainManifest,
  type ChainExecutionResult,
  type ChainExecutorOptions,
  type EffectLogEntry,
  type DepthReportEntry,
} from './chain-executor';

export {
  resolveModuleEffect,
  hasDeepEffect,
  registerEffect,
  getRegisteredEffects,
  getRegisteredModuleCount,
  createPipelineContext,
  type PipelineContext,
  type StageTrace,
  type RecoveryRecord,
  type ModuleEffect,
  type EffectVerb,
} from './module-effects';

// ═══════════════════════════════════════════════════════════════════════════════
// §13 — RUNTIME FACTORY — one-liner to boot everything
// ═══════════════════════════════════════════════════════════════════════════════

import {
  executeChain as _executeChain,
  dryRunChain as _dryRunChain,
  formatExecutionSummary as _formatExecutionSummary,
} from './chain-executor';

import {
  resolveModuleEffect as _resolveModuleEffect,
  hasDeepEffect as _hasDeepEffect,
  registerEffect as _registerEffect,
  getRegisteredModuleCount as _getRegisteredModuleCount,
} from './module-effects';

export interface StandaloneRuntime {
  storage: StorageAdapter;
  graph: ReturnType<typeof createDependencyGraph>;
  pipelines: ReturnType<typeof createPipelineComposer>;
  locks: ReturnType<typeof createLockManager>;
  computeCJPI: typeof computeCJPI;
  autoAssignTier: typeof autoAssignTier;
  computeSynergyMultiplier: typeof computeSynergyMultiplier;
  computeStableId: typeof computeStableId;
  sha256: typeof sha256;
  canonicalize: typeof canonicalize;
  createStateMachine: typeof createStateMachine;
  createSaga: typeof createSaga;
  CANONICAL_MODULES: typeof CANONICAL_MODULES;
  DISCOVERY_CATEGORIES: typeof DISCOVERY_CATEGORIES;
  /** Chain executor — run discovered module chains */
  executeChain: typeof _executeChain;
  dryRunChain: typeof _dryRunChain;
  formatExecutionSummary: typeof _formatExecutionSummary;
  /** Module effect registry */
  resolveModuleEffect: typeof _resolveModuleEffect;
  hasDeepEffect: typeof _hasDeepEffect;
  registerEffect: typeof _registerEffect;
  getRegisteredModuleCount: typeof _getRegisteredModuleCount;
}

/** Boot a complete standalone runtime — one line, zero infrastructure */
export function createRuntime(storage?: StorageAdapter): StandaloneRuntime {
  // Auto-register ascension primitive defaults on boot
  try { import('@/lib/ascension/primitive-defaults').catch(() => {}); } catch { /* non-critical */ }
  return {
    storage: storage ?? createMemoryStorage(),
    graph: createDependencyGraph(),
    pipelines: createPipelineComposer(),
    locks: createLockManager(),
    computeCJPI,
    autoAssignTier,
    computeSynergyMultiplier,
    computeStableId,
    sha256,
    canonicalize,
    createStateMachine,
    createSaga,
    CANONICAL_MODULES,
    DISCOVERY_CATEGORIES,
    executeChain: _executeChain,
    dryRunChain: _dryRunChain,
    formatExecutionSummary: _formatExecutionSummary,
    resolveModuleEffect: _resolveModuleEffect,
    hasDeepEffect: _hasDeepEffect,
    registerEffect: _registerEffect,
    getRegisteredModuleCount: _getRegisteredModuleCount,
  };
}
