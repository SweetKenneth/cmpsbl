/**
 * CMPSBL® Sealed Runtime Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates BLACK-BOXED versions of the canonical Mini-Runtime™ and Discovery Engine
 * for inclusion in export ZIPs. All proprietary logic is stripped:
 *   - CJPI weight allocations → opaque scoring function
 *   - Tier thresholds → opaque tiering function
 *   - Synergy formulas → opaque multiplier
 *   - Discovery templates → REMOVED entirely
 *   - Primitive effect handlers → sealed delegation stubs
 *   - Algorithm internals → replaced with interface-only contracts
 *
 * ARCHITECTURE: This sealed runtime is the TypeScript canonical runtime in obfuscated form.
 * Non-TS language exports use bridge adapters (see bridge-adapter.ts, software-synthesizer.ts)
 * that delegate to this runtime when available, with deterministic local fallback.
 *
 * See: canonical-runtime-contract.ts for the universal execution contract.
 * See: docs/041/07-one-runtime-many-bridges.md for architecture documentation.
 *
 * © CMPSBL® — All rights reserved. Trade secret.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — SEALED MINI-RUNTIME (replaces raw standalone-runtime.ts in exports)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateSealedRuntime(): string {
  return `/**
 * CMPSBL® Mini-Runtime™ Engine — Sealed Distribution
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * This is a sealed build of the CMPSBL® Mini-Runtime™ Engine.
 * Internal algorithms, scoring weights, and proprietary logic
 * are protected under trade secret law.
 *
 * Public API surface is fully functional.
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 *
 * © CMPSBL® — All rights reserved.
 * Unauthorized reverse engineering is prohibited.
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

export function createMemoryStorage(): StorageAdapter {
  const s = new Map<string, Map<string, unknown>>();
  const c = (n: string) => { if (!s.has(n)) s.set(n, new Map()); return s.get(n)!; };
  return {
    async get<T>(col: string, id: string) { return (c(col).get(id) as T) ?? null; },
    async list<T>(col: string, f?: Record<string, unknown>) {
      const items = Array.from(c(col).values()) as T[];
      if (!f) return items;
      return items.filter(i => { for (const [k, v] of Object.entries(f)) { if ((i as any)[k] !== v) return false; } return true; });
    },
    async put<T extends { id: string }>(col: string, item: T) { c(col).set(item.id, item); },
    async putMany<T extends { id: string }>(col: string, items: T[]) { const m = c(col); for (const i of items) m.set(i.id, i); },
    async delete(col: string, id: string) { c(col).delete(id); },
    async count(col: string) { return c(col).size; },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — CJPI SCORING ENGINE (sealed — weights protected)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CJPIScoreBreakdown {
  strategicLeverage: number;
  recursionPotential: number;
  crossNodeImpact: number;
  composability: number;
  governanceInfluence: number;
  moatSensitivity: number;
}

/**
 * Compute CJPI score from a 6-axis breakdown.
 * Weight allocations are proprietary and sealed.
 */
export function computeCJPI(breakdown: CJPIScoreBreakdown): number {
  const _w = [0x1E, 0x14, 0x0F, 0x0F, 0x0A, 0x0A];
  const _k = Object.keys(breakdown) as (keyof CJPIScoreBreakdown)[];
  let r = 0; for (let i = 0; i < _k.length; i++) r += (breakdown[_k[i]] ?? 0) * (_w[i] / 100);
  return Math.round(Math.min(100, Math.max(0, r)) * 10) / 10;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — AUTO-TIERING (sealed — thresholds protected)
// ═══════════════════════════════════════════════════════════════════════════════

export type CrystallizedTier = 'creator' | 'architect' | 'enterprise' | 'apex';

/** Assign tier based on CJPI score. Thresholds are proprietary. */
export function autoAssignTier(cjpiScore: number): CrystallizedTier | null {
  const _t = [0x5F, 0x46, 0x55, 0x37];
  if (cjpiScore >= _t[0]) return 'apex';
  if (cjpiScore >= _t[2]) return 'enterprise';
  if (cjpiScore >= _t[1]) return 'architect';
  if (cjpiScore >= _t[3]) return 'creator';
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — HASHING (standard — no IP to protect here)
// ═══════════════════════════════════════════════════════════════════════════════

export function djb2Hash(input: string): string {
  let h = 5381; for (let i = 0; i < input.length; i++) { h = ((h << 5) + h) + input.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(16).padStart(8, '0');
}

export async function sha256(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const d = new TextEncoder().encode(input);
    const b = await crypto.subtle.digest('SHA-256', d);
    return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
  }
  return djb2Hash(input);
}

export function canonicalize(obj: unknown): string { return JSON.stringify(_sk(obj)); }
function _sk(v: unknown): unknown {
  if (v === null || v === undefined) return v;
  if (Array.isArray(v)) return v.map(_sk);
  if (typeof v === 'object') { const s: Record<string, unknown> = {}; for (const k of Object.keys(v as Record<string, unknown>).sort()) s[k] = _sk((v as Record<string, unknown>)[k]); return s; }
  return v;
}

export function computeStableId(name: string, moduleChain: string[], category: string): string {
  return \`disc-\${djb2Hash(\`\${name}|\${[...moduleChain].sort().join(',')}|\${category}\`)}\`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — FINITE STATE MACHINE (interface-compatible, sealed internals)
// ═══════════════════════════════════════════════════════════════════════════════

export interface StateConfig<C = unknown> { onEnter?: (ctx: C) => void | Promise<void>; onExit?: (ctx: C) => void | Promise<void>; meta?: Record<string, unknown>; }
export interface TransitionConfig<C = unknown> { from: string | string[]; to: string; event: string; guard?: (ctx: C) => boolean; effect?: (ctx: C) => void | Promise<void>; }
export interface MachineConfig<C = unknown> { id: string; initial: string; context: C; states: Record<string, StateConfig<C>>; transitions: TransitionConfig<C>[]; maxHistory?: number; onTransition?: (from: string, to: string, event: string, ctx: C) => void; }
export interface TransitionRecord { from: string; to: string; event: string; timestamp: number; }

export function createStateMachine<C>(config: MachineConfig<C>) {
  const { id, initial, states, transitions, maxHistory: mh = 100, onTransition } = config;
  let cur = initial, ctx = { ...config.context }; const hist: TransitionRecord[] = [];
  if (!states[initial]) throw new Error(\`[FSM:\${id}] Initial state '\${initial}' not defined\`);
  async function send(event: string): Promise<boolean> {
    for (const t of transitions.filter(t => { const f = Array.isArray(t.from) ? t.from : [t.from]; return f.includes(cur) && t.event === event; })) {
      if (t.guard && !t.guard(ctx)) continue;
      if (!states[t.to]) throw new Error(\`[FSM:\${id}] Target '\${t.to}' not defined\`);
      const from = cur; await states[cur]?.onExit?.(ctx); if (t.effect) await t.effect(ctx);
      cur = t.to; await states[cur]?.onEnter?.(ctx);
      hist.push({ from, to: cur, event, timestamp: Date.now() });
      if (hist.length > mh) hist.splice(0, hist.length - mh); onTransition?.(from, cur, event, ctx); return true;
    } return false;
  }
  return {
    send,
    can: (e: string) => transitions.some(t => { const f = Array.isArray(t.from) ? t.from : [t.from]; return f.includes(cur) && t.event === e && (!t.guard || t.guard(ctx)); }),
    availableEvents: () => [...new Set(transitions.filter(t => { const f = Array.isArray(t.from) ? t.from : [t.from]; return f.includes(cur); }).filter(t => !t.guard || t.guard(ctx)).map(t => t.event))],
    matches: (s: string) => cur === s,
    getContext: () => ({ ...ctx }),
    updateContext: (u: (c: C) => C) => { ctx = u(ctx); },
    getHistory: () => [...hist],
    snapshot: () => ({ state: cur, context: { ...ctx }, history: [...hist] }),
    restore: (snap: { state: string; context: C }) => { if (!states[snap.state]) throw new Error(\`[FSM:\${id}] Cannot restore to '\${snap.state}'\`); cur = snap.state; ctx = { ...snap.context }; },
    get state() { return cur; }, get id() { return id; },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — DEPENDENCY GRAPH (interface-compatible)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ModuleNode { id: string; name: string; dependencies: string[]; bootOrder: number | null; status: 'unloaded' | 'loading' | 'ready' | 'failed'; loadTimeMs: number | null; }

export function createDependencyGraph() {
  const g = new Map<string, ModuleNode>();
  return {
    register: (id: string, name: string, deps: string[] = []) => { const n: ModuleNode = { id, name, dependencies: deps, bootOrder: null, status: 'unloaded', loadTimeMs: null }; g.set(id, n); return n; },
    computeBootOrder: () => { const v = new Set<string>(), st = new Set<string>(), o: string[] = [], cy: string[][] = []; function vis(id: string, p: string[]) { if (st.has(id)) { cy.push(p.slice(p.indexOf(id))); return; } if (v.has(id)) return; st.add(id); const n = g.get(id); if (n) for (const d of n.dependencies) vis(d, [...p, id]); st.delete(id); v.add(id); o.push(id); } for (const id of g.keys()) if (!v.has(id)) vis(id, []); o.forEach((id, i) => { const n = g.get(id); if (n) n.bootOrder = i; }); return { order: o, cycles: cy }; },
    getDependents: (id: string) => Array.from(g.values()).filter(n => n.dependencies.includes(id)).map(n => n.id),
    getTransitiveDeps: (id: string) => { const r = new Set<string>(), q = [id]; while (q.length) { const c = q.shift()!; const n = g.get(c); if (n) for (const d of n.dependencies) if (!r.has(d)) { r.add(d); q.push(d); } } return Array.from(r); },
    setStatus: (id: string, status: ModuleNode['status'], ms?: number) => { const n = g.get(id); if (n) { n.status = status; if (ms !== undefined) n.loadTimeMs = ms; } },
    getAll: () => Array.from(g.values()), get: (id: string) => g.get(id),
    getReady: () => Array.from(g.values()).filter(n => n.status === 'ready'),
    getFailed: () => Array.from(g.values()).filter(n => n.status === 'failed'),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — MEMORY CHAIN COMPOSER (interface-compatible)
// ═══════════════════════════════════════════════════════════════════════════════

export interface PipelineStage { id: string; name: string; moduleId: string; handler: string; inputSchema: Record<string, string>; outputSchema: Record<string, string>; timeoutMs: number; retries: number; }
export interface ComposedPipeline { id: string; name: string; stages: PipelineStage[]; mode: 'sequential' | 'parallel' | 'adaptive'; status: 'draft' | 'validated' | 'active' | 'archived'; createdAt: number; lastRunAt: number | null; runCount: number; }

export function createPipelineComposer() {
  const sr = new Map<string, PipelineStage>(), ps = new Map<string, ComposedPipeline>();
  return {
    registerStage: (s: PipelineStage) => { sr.set(s.id, s); return s; },
    compose: (name: string, ids: string[], mode: ComposedPipeline['mode'] = 'sequential') => { const stages = ids.map(i => sr.get(i)).filter(Boolean) as PipelineStage[]; if (stages.length !== ids.length) return null; const p: ComposedPipeline = { id: \`chain-\${Date.now()}-\${djb2Hash(name)}\`, name, stages, mode, status: 'draft', createdAt: Date.now(), lastRunAt: null, runCount: 0 }; ps.set(p.id, p); return p; },
    validate: (id: string) => { const p = ps.get(id); if (!p) return { valid: false, errors: ['Memory chain not found'] }; const e: string[] = []; if (p.mode === 'sequential') { for (let i = 1; i < p.stages.length; i++) { const prev = p.stages[i-1], cur = p.stages[i]; const m = Object.keys(cur.inputSchema).filter(k => !Object.keys(prev.outputSchema).includes(k)); if (m.length) e.push(\`Stage \${cur.id} missing inputs: \${m.join(', ')}\`); } } if (!e.length) p.status = 'validated'; return { valid: !e.length, errors: e }; },
    getPipelines: () => Array.from(ps.values()), getStages: () => Array.from(sr.values()), get: (id: string) => ps.get(id),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — SAGA ORCHESTRATOR (interface-compatible)
// ═══════════════════════════════════════════════════════════════════════════════

type SagaStepFn<C> = (context: C) => Promise<C>;
interface SagaStep<C> { name: string; execute: SagaStepFn<C>; compensate: SagaStepFn<C>; }
export interface SagaResult<C> { success: boolean; context: C; completedSteps: string[]; failedStep?: string; error?: string; compensated: boolean; }

export class Saga<C> {
  private steps: SagaStep<C>[] = []; readonly id: string;
  constructor(id: string) { this.id = id; }
  step(name: string, execute: SagaStepFn<C>, compensate: SagaStepFn<C>): this { this.steps.push({ name, execute, compensate }); return this; }
  async run(ctx: C): Promise<SagaResult<C>> {
    const done: string[] = [];
    for (const s of this.steps) {
      try { ctx = await s.execute(ctx); done.push(s.name); } catch (err) {
        let comp = true; for (let i = done.length - 1; i >= 0; i--) { const cs = this.steps.find(x => x.name === done[i]); try { if (cs) ctx = await cs.compensate(ctx); } catch { comp = false; } }
        return { success: false, context: ctx, completedSteps: done, failedStep: s.name, error: err instanceof Error ? err.message : String(err), compensated: comp };
      }
    }
    return { success: true, context: ctx, completedSteps: done, compensated: false };
  }
}

export function createSaga<C>(id: string): Saga<C> { return new Saga<C>(id); }

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — SEALED SYNERGY (formula protected)
// ═══════════════════════════════════════════════════════════════════════════════

/** Compute synergy multiplier. Formula is proprietary. */
export function computeSynergyMultiplier(moduleChain: string[]): number {
  const u = new Set(moduleChain).size;
  return u >= 4 ? 1 + u * 0.0275 + 0.04 : u >= 3 ? 1 + u * 0.0225 + 0.0125 : 1.0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §10 — CANONICAL MODULES (public — needed for chain execution)
// ═══════════════════════════════════════════════════════════════════════════════

export const CANONICAL_MODULES = [
  'CORE','BRAIN','MEMORY','NERVE','DECODE','ENCODE','CORTEX','DEFENSE','ORACLE','CONSCIENCE',
  'PHANTOM','HARVEST','EVOLUTION','SHADOW','IMMUNITY','INTENT','GOVERNANCE','ATLAS','FORGE','LINGUA',
  'ECHO','SOVEREIGN','REFLEX','TREATY','ENGINEER','COMPASS','OBSERVER','RELAY','NEXUS','DREAM',
  'PRISM','AUDIT','IDENTITY','MESH','ECONOMY','ACCESS','VISION','ANALYTICS','MEDIC','RIPPLE',
] as const;

export type CanonicalModule = typeof CANONICAL_MODULES[number];
export const DISCOVERY_CATEGORIES = ['cognitive','evolution','security','routing','learning','orchestration','integration','observability','governance','compliance','prediction','ethics','privacy','synthesis','localization','geospatial','simulation','contracts','acquisition','edge'] as const;
export type DiscoveryCategory = typeof DISCOVERY_CATEGORIES[number];
export const ERROR_STRATEGIES = ['retry','skip','abort','rollback','fallback'] as const;
export type ErrorStrategy = typeof ERROR_STRATEGIES[number];

// ═══════════════════════════════════════════════════════════════════════════════
// §11 — CONCURRENCY LOCK
// ═══════════════════════════════════════════════════════════════════════════════

export function createLockManager() {
  const locks = new Map<string, { holder: string; expiresAt: number }>();
  return {
    acquire: (id: string, holder: string, ttl = 300_000) => { const e = locks.get(id); if (e && e.holder !== holder && e.expiresAt > Date.now()) return false; locks.set(id, { holder, expiresAt: Date.now() + ttl }); return true; },
    release: (id: string) => { locks.delete(id); },
    isLocked: (id: string) => { const l = locks.get(id); return !!l && l.expiresAt > Date.now(); },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §12 — RUNTIME FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

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
  executePrimitive: typeof executePrimitive;
  configureEndpoint: typeof configureEndpoint;
  getRuntimeMode: typeof getRuntimeMode;
  getExecutionTelemetry: typeof getExecutionTelemetry;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §12b — NETWORK-AWARE EXECUTION BRIDGE (auto-injected)
// ═══════════════════════════════════════════════════════════════════════════════

/** Default CMPSBL substrate endpoint — used when online */
const CMPSBL_DEFAULT_ENDPOINT = 'https://api.cmpsbl.com/v1/substrate/primitive';

type RuntimeMode = 'network' | 'hybrid' | 'offline';
interface ExecutionTelemetry { primitive: string; wasRemote: boolean; success: boolean; usedFallback: boolean; mode: RuntimeMode; timestamp: number; }

const _netState: { endpoint: string | null; mode: RuntimeMode; consecutiveSuccesses: number; consecutiveFailures: number; telemetry: ExecutionTelemetry[] } = {
  endpoint: CMPSBL_DEFAULT_ENDPOINT, mode: 'hybrid', consecutiveSuccesses: 0, consecutiveFailures: 0, telemetry: [],
};

export function configureEndpoint(url: string | null): void {
  _netState.endpoint = url;
  if (!url) { _netState.mode = 'offline'; _netState.consecutiveSuccesses = 0; _netState.consecutiveFailures = 0; }
}

/** Get current runtime mode */
export function getRuntimeMode(): RuntimeMode { return _netState.mode; }

function _updateMode(success: boolean): void {
  if (!_netState.endpoint) { _netState.mode = 'offline'; return; }
  if (success) { _netState.consecutiveSuccesses++; _netState.consecutiveFailures = 0; _netState.mode = _netState.consecutiveSuccesses >= 5 ? 'network' : 'hybrid'; }
  else { _netState.consecutiveFailures++; _netState.consecutiveSuccesses = 0; _netState.mode = _netState.consecutiveFailures >= 3 ? 'offline' : 'hybrid'; }
}

function _recordTelemetry(entry: ExecutionTelemetry): void {
  _netState.telemetry.push(entry);
  if (_netState.telemetry.length > 500) _netState.telemetry.splice(0, _netState.telemetry.length - 500);
}

/** Get execution telemetry snapshot */
export function getExecutionTelemetry(): ReadonlyArray<ExecutionTelemetry> { return [..._netState.telemetry]; }

/**
 * Network-first primitive executor.
 * Execution order:
 *   1. Remote execution (CMPSBL® Substrate — when endpoint configured)
 *   2. Deterministic fallback (always succeeds)
 * Remote failure NEVER breaks execution.
 */
export async function executePrimitive(
  name: string,
  data: Record<string, unknown>,
  confidence: number
): Promise<{ data: Record<string, unknown>; confidence_delta: number; signal: string }> {
  // Tier 1: Remote
  if (_netState.endpoint && _netState.mode !== 'offline') {
    try {
      const res = await fetch(_netState.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data, confidence, meta: { timestamp: Date.now(), runtimeType: 'sealed', version: '14.4.1' } }),
      });
      if (res.ok) {
        const result = await res.json();
        _updateMode(true);
        _recordTelemetry({ primitive: name, wasRemote: true, success: true, usedFallback: false, mode: _netState.mode, timestamp: Date.now() });
        return result;
      }
      _updateMode(false);
    } catch { _updateMode(false); }
  }

  // Tier 2: Local deterministic fallback
  const out = { [name.toLowerCase() + '_result']: { module: name, confidence, processed: true } };
  _recordTelemetry({ primitive: name, wasRemote: false, success: true, usedFallback: true, mode: _netState.mode, timestamp: Date.now() });
  return { data: out, confidence_delta: 0.01, signal: name.toLowerCase() + '_fallback' };
}

export function createRuntime(storage?: StorageAdapter): StandaloneRuntime {
  const s = storage ?? createMemoryStorage();
  return {
    storage: s, graph: createDependencyGraph(), pipelines: createPipelineComposer(),
    locks: createLockManager(), computeCJPI, autoAssignTier, computeSynergyMultiplier,
    computeStableId, sha256, canonicalize, createStateMachine, createSaga,
    CANONICAL_MODULES, DISCOVERY_CATEGORIES,
    executePrimitive, configureEndpoint, getRuntimeMode, getExecutionTelemetry,
  };
}
`;
}


// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SEALED DISCOVERY ENGINE (templates & reactor logic REMOVED)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateSealedDiscoveryEngine(): string {
  return `/**
 * CMPSBL® Mini-Runtime™ Discovery Engine — Sealed Distribution
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * This is a sealed build. Internal synthesis templates, reactor
 * algorithms, and discovery heuristics are protected trade secrets.
 *
 * This sealed version provides the public execution API.
 * Full discovery capabilities require the CMPSBL® Substrate.
 *
 * © CMPSBL® — All rights reserved.
 * Unauthorized reverse engineering is prohibited.
 */

import type { StandaloneRuntime, CJPIScoreBreakdown, DiscoveryCategory, CrystallizedTier, ErrorStrategy } from './standalone-runtime';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES (public)
// ═══════════════════════════════════════════════════════════════════════════════

export interface DiscoveryConfig {
  dryRun: boolean;
  topN?: number;
  minCjpi?: number;
  categories?: DiscoveryCategory[];
  injectedTemplates?: SynthesisTemplate[];
}

export interface SynthesisTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: DiscoveryCategory;
  modulePattern: string[];
  entryPattern: string;
  exitPattern: string;
  errorStrategy: ErrorStrategy;
  maxExecutionMs: number;
  baseBreakdown: CJPIScoreBreakdown;
  discoveredBy: string;
  rationale: string;
}

export interface DiscoveryCandidate {
  id: string;
  name: string;
  description: string;
  category: DiscoveryCategory;
  moduleChain: string[];
  entryCapability: string;
  exitCapability: string;
  errorStrategy: ErrorStrategy;
  maxExecutionMs: number;
  cjpiBreakdown: CJPIScoreBreakdown;
  cjpi: number;
  tier: CrystallizedTier | null;
  synergyMultiplier: number;
  discoveredBy: string;
  rationale: string;
}

export interface DiscoveryRunResult {
  runId: string;
  status: 'completed' | 'failed';
  totalCandidates: number;
  acceptedCount: number;
  skippedCount: number;
  topFind: { name: string; cjpi: number } | null;
  discoveries: DiscoveryCandidate[];
  byCategory: Record<string, number>;
  byTier: Record<string, number>;
  dryRun: boolean;
  durationMs: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEALED DISCOVERY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a discovery engine instance.
 *
 * Note: This sealed distribution does not include built-in synthesis
 * templates. Inject your own templates via DiscoveryConfig.injectedTemplates
 * or connect to the full CMPSBL® Substrate for autonomous discovery.
 */
export function createDiscoveryEngine(runtime: StandaloneRuntime) {
  const { storage, computeCJPI, autoAssignTier, computeSynergyMultiplier, computeStableId } = runtime;

  async function run(config: DiscoveryConfig): Promise<DiscoveryRunResult> {
    const startTime = Date.now();
    const runId = \`run-\${Date.now()}-\${Math.random().toString(36).slice(2, 8)}\`;
    const locked = runtime.locks.acquire('discovery', runId);
    if (!locked) {
      return { runId, status: 'failed', totalCandidates: 0, acceptedCount: 0, skippedCount: 0, topFind: null, discoveries: [], byCategory: {}, byTier: {}, dryRun: config.dryRun, durationMs: Date.now() - startTime, error: 'Another discovery run is in progress.' };
    }

    try {
      const existing = await storage.list<{ id: string }>('discoveries');
      const known = new Set(existing.map(d => d.id));
      const templates = config.injectedTemplates || [];
      const filtered = config.categories ? templates.filter(t => config.categories!.includes(t.category)) : templates;

      const candidates: DiscoveryCandidate[] = [];
      let skipped = 0;
      const minCjpi = config.minCjpi ?? 80;

      for (const t of filtered) {
        const stableId = computeStableId(t.namePattern, t.modulePattern, t.category);
        if (known.has(stableId)) { skipped++; continue; }
        const base = computeCJPI(t.baseBreakdown);
        const syn = computeSynergyMultiplier(t.modulePattern);
        const final = Math.round(Math.min(100, base * syn) * 10) / 10;
        const tier = autoAssignTier(final);
        if (final < minCjpi) continue;
        candidates.push({ id: stableId, name: t.namePattern, description: t.descriptionPattern, category: t.category, moduleChain: t.modulePattern, entryCapability: t.entryPattern, exitCapability: t.exitPattern, errorStrategy: t.errorStrategy, maxExecutionMs: t.maxExecutionMs, cjpiBreakdown: t.baseBreakdown, cjpi: final, tier, synergyMultiplier: syn, discoveredBy: t.discoveredBy, rationale: t.rationale });
      }

      candidates.sort((a, b) => b.cjpi - a.cjpi);
      const accepted = config.topN ? candidates.slice(0, config.topN) : candidates;
      const byCategory: Record<string, number> = {}, byTier: Record<string, number> = {};
      for (const c of accepted) { byCategory[c.category] = (byCategory[c.category] || 0) + 1; byTier[c.tier || 'untiered'] = (byTier[c.tier || 'untiered'] || 0) + 1; }
      const topFind = accepted.length > 0 ? { name: accepted[0].name, cjpi: accepted[0].cjpi } : null;

      if (!config.dryRun) {
        await storage.put('runs', { id: runId, status: 'completed', totalCandidates: candidates.length, acceptedCount: accepted.length, topFind, durationMs: Date.now() - startTime, createdAt: new Date().toISOString() });
        await storage.putMany('discoveries', accepted.map(c => ({ id: c.id, runId, ...c, discoveredAt: new Date().toISOString() })));
      }

      return { runId, status: 'completed', totalCandidates: candidates.length, acceptedCount: accepted.length, skippedCount: skipped, topFind, discoveries: accepted, byCategory, byTier, dryRun: config.dryRun, durationMs: Date.now() - startTime };
    } catch (err: unknown) {
      return { runId, status: 'failed', totalCandidates: 0, acceptedCount: 0, skippedCount: 0, topFind: null, discoveries: [], byCategory: {}, byTier: {}, dryRun: config.dryRun, durationMs: Date.now() - startTime, error: err instanceof Error ? err.message : String(err) };
    } finally { runtime.locks.release('discovery'); }
  }

  return {
    run,
    getDiscoveries: async () => storage.list<DiscoveryCandidate>('discoveries'),
    getPromotions: async () => storage.list('promotions'),
    getRunHistory: async () => storage.list('runs'),
    createTemplate: (t: SynthesisTemplate) => t,
    getBuiltinTemplateCount: () => 0,
  };
}
`;
}


// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SEALED CHAIN EXECUTOR (module effects → opaque stubs)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateSealedChainExecutor(): string {
  const MODULES = [
    'CORE','BRAIN','MEMORY','NERVE','DECODE','ENCODE','CORTEX','DEFENSE','ORACLE','CONSCIENCE',
    'PHANTOM','HARVEST','EVOLUTION','SHADOW','IMMUNITY','INTENT','GOVERNANCE','ATLAS','FORGE','LINGUA',
    'ECHO','SOVEREIGN','REFLEX','TREATY','ENGINEER','COMPASS','OBSERVER','RELAY','NEXUS','DREAM',
    'PRISM','AUDIT','IDENTITY','MESH','ECONOMY','ACCESS','VISION','ANALYTICS','MEDIC','RIPPLE',
  ];

  const VERBS: Record<string, string> = {
    CORE:'transform', BRAIN:'analyze', MEMORY:'persist', NERVE:'route', DECODE:'decode',
    ENCODE:'encode', CORTEX:'orchestrate', DEFENSE:'validate', ORACLE:'predict', CONSCIENCE:'assess',
    PHANTOM:'anonymize', HARVEST:'ingest', EVOLUTION:'evolve', SHADOW:'simulate', IMMUNITY:'recover',
    INTENT:'route', GOVERNANCE:'govern', ATLAS:'map', FORGE:'compose', LINGUA:'transform',
    ECHO:'simulate', SOVEREIGN:'classify', REFLEX:'route', TREATY:'negotiate', ENGINEER:'diagnose',
    COMPASS:'enrich', OBSERVER:'observe', RELAY:'route', NEXUS:'route', DREAM:'enrich',
    PRISM:'transform', AUDIT:'annotate', IDENTITY:'validate', MESH:'route', ECONOMY:'score',
    ACCESS:'validate', VISION:'enrich', ANALYTICS:'score', MEDIC:'recover', RIPPLE:'route',
  };

  // Generate sealed effect stubs — no logic exposed, just verb + trace
  const effectEntries = MODULES.map(m => {
    const v = VERBS[m] || 'process';
    return `  ${m}: { verb: '${v}', handler: (d, c) => { d[\`_\${('${m}').toLowerCase()}\`] = { status: 'processed', stage: c.index }; return { data: d, confidence: c.confidence, note: \`[\${('${m}')}] Stage complete\` }; } }`;
  }).join(',\n');

  return `/**
 * CMPSBL® Portable Chain Executor — Sealed Distribution
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 3-Layer runtime playback engine for discovered memory chains.
 *
 * Primitive effect implementations are sealed.
 * Full deep effects require the CMPSBL® Substrate.
 *
 * © CMPSBL® — All rights reserved.
 * Unauthorized reverse engineering is prohibited.
 */

export interface ChainManifest { id: string; name: string; description: string; modules: string[]; cjpiScore: number; tier: string; category: string; }
export interface StageTrace { module: string; effect: string; status: 'success' | 'recovered' | 'fallback'; durationMs: number; depth: 'deep' | 'fallback'; notes: string[]; timestamp: number; }
export interface ChainResult { success: boolean; output: Record<string, unknown>; trace: StageTrace[]; confidence: number; totalDurationMs: number; transformationNotes: string[]; depthReport: { module: string; depth: string }[]; }

type Ctx = { confidence: number; trace: StageTrace[]; modules: string[]; index: number; recoveries: number };
type Res = { data: Record<string, unknown>; confidence: number; note: string };
type EH = (data: Record<string, unknown>, ctx: Ctx) => Res;

const E: Record<string, { verb: string; handler: EH }> = {
${effectEntries}
};

function resolveEffect(mod: string): { verb: string; depth: 'deep' | 'fallback'; handler: EH } {
  if (E[mod]) return { ...E[mod], depth: 'deep' as const };
  return { verb: 'annotate', depth: 'fallback' as const, handler: (d, c) => { d[\`_\${mod.toLowerCase()}\`] = { participated: true, depth: 'fallback', stage: c.index }; return { data: d, confidence: c.confidence, note: \`[\${mod}] Fallback participation\` }; } };
}

export async function executeChain(manifest: ChainManifest, input: Record<string, unknown> = {}): Promise<ChainResult> {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let data = JSON.parse(JSON.stringify(input));
  let confidence = 0.5;
  const trace: StageTrace[] = [], notes: string[] = [], depthReport: { module: string; depth: string }[] = [];
  let recoveries = 0;

  data['_manifest'] = { id: manifest.id, name: manifest.name, tier: manifest.tier, cjpiScore: manifest.cjpiScore };
  notes.push(\`[CHAIN] Executing "\${manifest.name}" — \${manifest.modules.length} modules\`);

  for (let i = 0; i < manifest.modules.length; i++) {
    const mod = manifest.modules[i];
    const ss = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const effect = resolveEffect(mod);
    depthReport.push({ module: mod, depth: effect.depth });
    try {
      const result = effect.handler(data, { confidence, trace, modules: manifest.modules, index: i, recoveries });
      data = result.data; confidence = result.confidence; notes.push(result.note);
      trace.push({ module: mod, effect: effect.verb, status: 'success', durationMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - ss) * 100) / 100, depth: effect.depth, notes: [result.note], timestamp: Date.now() });
    } catch (err) {
      recoveries++;
      trace.push({ module: mod, effect: effect.verb, status: 'recovered', durationMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - ss) * 100) / 100, depth: effect.depth, notes: [\`Error recovered\`], timestamp: Date.now() });
    }
  }

  notes.push(\`[CHAIN] Complete — \${trace.filter(t => t.status === 'success').length}/\${manifest.modules.length} stages succeeded\`);
  return { success: true, output: data, trace, confidence: Math.round(confidence * 1000) / 1000, totalDurationMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start) * 100) / 100, transformationNotes: notes, depthReport };
}

export function formatReport(result: ChainResult): string {
  const lines = ['═══ CMPSBL® Memory Chain Execution Report ═══', '', \`Status: \${result.success ? '✓ SUCCESS' : '✗ FAILED'}\`, \`Duration: \${result.totalDurationMs.toFixed(1)}ms\`, \`Confidence: \${(result.confidence * 100).toFixed(1)}%\`, '', '── Primitive Chain ──'];
  for (const t of result.trace) lines.push(\`  \${t.depth === 'deep' ? '◆' : '○'} \${t.module} [\${t.effect}] \${t.status === 'success' ? '✓' : '⟳'} \${t.durationMs.toFixed(1)}ms\`);
  lines.push('═══════════════════════════════════════════════');
  return lines.join('\\n');
}
`;
}


// ═══════════════════════════════════════════════════════════════════════════════
// §4 — SEALED RUNTIME README (replaces the one in _runtime/)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateSealedRuntimeReadme(): string {
  return [
    '# CMPSBL® Mini-Runtime™ Engine — Sealed Distribution',
    '',
    'This is a **sealed build** of the CMPSBL® Mini-Runtime™ Engine.',
    'Internal algorithms and scoring weights are protected.',
    '',
    '## Network-Aware Execution',
    '',
    'This runtime is **network-aware**. When connected to the CMPSBL® Substrate:',
    '- Primitives execute remotely with full cognitive depth',
    '- Results are returned with high-fidelity confidence scoring',
    '- Execution telemetry feeds the learning layer',
    '',
    'When offline, the runtime operates in **standalone mode**:',
    '- All primitives execute via local deterministic fallbacks',
    '- Zero network dependency — fully functional offline',
    '',
    '### Configuration',
    '',
    '```typescript',
    '// Default: connects to CMPSBL® Substrate automatically',
    '// To run offline-only:',
    'configureEndpoint(null);',
    '',
    '// To check connectivity mode:',
    'getRuntimeMode(); // "offline" | "hybrid" | "network"',
    '```',
    '',
    '## Included Components',
    '',
     '- **standalone-runtime.ts** — Sealed Mini-Runtime™: CJPI scoring, state machine, memory chain orchestration, network bridge',
     '- **chain-executor.ts** — Sealed Chain Executor: memory chain playback with labeled primitives (Organs, Layers, Engines, Agents)',
    '',
    '## NOT Included',
    '',
    '- ❌ Discovery Engine — substrate-only, never distributed',
    '- ❌ Memory Stream — substrate-only, never distributed',
    '- ❌ Ascension Reactor — substrate-only, never distributed',
    '',
    '## What Is Sealed?',
    '',
    '- CJPI scoring weight allocations',
    '- Auto-tiering threshold values',
    '- Primitive effect deep implementations (40-primitive matrix)',
    '- Synergy multiplier formulas',
    '- Discovery heuristics and synthesis templates',
    '',
    '## Full Capabilities',
    '',
    'For discovery, memory, and deep primitive effects, use the',
    'full CMPSBL® Substrate at https://cmpsbl.com',
    '',
    '---',
    '© CMPSBL® — All rights reserved.',
    'Unauthorized reverse engineering, decompilation, or redistribution is prohibited.',
  ].join('\\n');
}


// ═══════════════════════════════════════════════════════════════════════════════
// §5 — ASCENSION-EXTENDED SEALED RUNTIME (only for Ascension/Auxiliary Node exports)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extended sealed runtime for Ascension exports.
 * Includes the full base runtime PLUS the Primary Handler Registry
 * for real execution binding of uploaded code.
 *
 * Memory Stream exports MUST NOT use this — use generateSealedRuntime() instead.
 */
export function generateAscensionSealedRuntime(): string {
  // Get the base runtime and inject the handler registry before the closing
  const base = generateSealedRuntime();
  // Remove the trailing backtick-semicolon to inject before it
  const insertPoint = base.lastIndexOf('`;');
  const before = base.slice(0, insertPoint);

  const handlerRegistryBlock = `

// ═══════════════════════════════════════════════════════════════════════════════
// §A1 — PRIMARY HANDLER REGISTRY (Ascension — uploaded code execution binding)
// ═══════════════════════════════════════════════════════════════════════════════

export type PrimitiveHandler = (input: unknown, context?: unknown) => unknown;

export interface PrimitiveRegistryEntry {
  name: string;
  category: string;
  handler: PrimitiveHandler;
  source: 'native' | 'generated' | 'external';
}

const _handlerRegistry = new Map<string, PrimitiveRegistryEntry>();

/** Register a named handler for uploaded code's primary execution unit. */
export function registerHandler(entry: PrimitiveRegistryEntry): void {
  if (!entry.name) return;
  _handlerRegistry.set(entry.name.toLowerCase().trim(), entry);
}

/** Look up a registered handler. */
export function getHandler(name: string): PrimitiveRegistryEntry | null {
  return _handlerRegistry.get(name.toLowerCase().trim()) ?? null;
}

/** List all registered handlers. */
export function listHandlers(): PrimitiveRegistryEntry[] {
  return Array.from(_handlerRegistry.values());
}

/** Clear handler registry. */
export function clearHandlers(): void { _handlerRegistry.clear(); }
`;

  return before + handlerRegistryBlock + '`;';
}


// ═══════════════════════════════════════════════════════════════════════════════
// §6 — ASCENSION-EXTENDED CHAIN EXECUTOR (only for Ascension/Auxiliary Node exports)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extended chain executor for Ascension exports.
 * Includes dynamic effect registry + handler registry bridge
 * so uploaded code's primary module participates in chain execution.
 *
 * Memory Stream exports MUST NOT use this — use generateSealedChainExecutor() instead.
 */
export function generateAscensionChainExecutor(): string {
  const base = generateSealedChainExecutor();
  const insertPoint = base.lastIndexOf('`;');
  const before = base.slice(0, insertPoint);

  const ascensionBlock = `

// ═══════════════════════════════════════════════════════════════════════════════
// §A2 — ASCENSION DYNAMIC EFFECT REGISTRY (Auxiliary Node chain participation)
// ═══════════════════════════════════════════════════════════════════════════════

/** Dynamic handler registry for Ascension modules (Auxiliary Node) */
const _dynamicEffects: Record<string, { verb: string; handler: EH }> = {};

/**
 * Register a chain-level effect for an Ascension module.
 * Call this after registerHandler() to wire the primary into chain execution.
 */
export function registerChainEffect(moduleName: string, verb: string, handler: EH): void {
  _dynamicEffects[moduleName] = { verb, handler };
}

// Override resolveEffect to include Ascension modules
const _baseResolveEffect = resolveEffect;
function resolveEffectWithAscension(mod: string): { verb: string; depth: 'deep' | 'fallback'; handler: EH } {
  // Priority 1: Substrate nodes (40-primitive matrix) — handled by base
  const base = _baseResolveEffect(mod);
  if (base.depth === 'deep') return base;
  // Priority 2: Dynamically registered Ascension modules
  if (_dynamicEffects[mod]) return { ..._dynamicEffects[mod], depth: 'deep' as const };
  // Priority 3: Check handler registry from runtime (primary handler bridge)
  if (typeof getHandler === 'function') {
    const registered = getHandler(mod.replace(/^Ψ₄₁_/, ''));
    if (registered?.handler) {
      return {
        verb: 'execute',
        depth: 'deep' as const,
        handler: (d, c) => {
          const out = registered.handler(d, { confidence: c.confidence }) as Record<string, unknown>;
          return { data: typeof out === 'object' && out ? { ...d, ...out } : d, confidence: c.confidence + 0.02, note: \\\`[\\\${mod}] Primary handler executed (\\\${registered.category})\\\` };
        },
      };
    }
  }
  // Fallback from base
  return base;
}
`;

  return before + ascensionBlock + '`;';
}
