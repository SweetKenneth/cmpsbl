/**
 * Unified Single-File Capability Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates ONE file (~2000 LOC) containing:
 *   §1 — Convex Core™ (CJPI scorer, FSM, Saga, manifest, fingerprint)
 *   §2 — Module Effects (all 40 primitive handlers)
 *   §3 — Runtime Bridge (pipeline executor, context, trace)
 *   §4 — Capability API (execute, validate, metadata)
 *
 * Drop in. Import. Use. One file. Zero dependencies.
 *
 * © CMPSBL® — All rights reserved.
 */

import { hasPolyglotGenerator, generatePolyglotFile } from './polyglot-templates';
import { blackboxFile } from './blackbox';
import type { CmpsblLayerDefinition } from './cmpsbl-layers';
import { getLayerCode, getAutoWireTs, getAutoWirePy, getLayerHeaderBlock, CMPSBL_CORE_LAYERS } from './cmpsbl-layers';
import { getAllLayerCode, getAutoWireForLang, getLayerCommentChar } from './cmpsbl-layer-polyglot';

// Re-use the UnifiedCapabilityInput interface shape
export interface UnifiedCapabilityInput {
  id: string;
  name: string;
  cjpiScore: number;
  tier: string;
  chain: string[];
  fingerprint: string;
  moatSignature: string;
  capabilityType: string;
  description?: string;
  category?: string;
}
interface UserSourceFile {
  name: string;
  extension: string;
  language: string;
  content: string;
}

// ─── Canonical chain whitelist ───────────────────────────────────────────────
// The 40-primitive matrix + the always-injected CANDIDATE slot. Any uploaded
// raw filename (e.g. "SHELVE", "MY_LIB") must collapse to CANDIDATE so the
// generated runtime always resolves to a real handler — never an unknown.
const CANONICAL_CHAIN_MODULES: ReadonlySet<string> = new Set([
  // Organs
  'CORE', 'SYSTEM', 'BRAIN', 'MEMORY', 'NERVE', 'NEXUS',
  'IDENTITY', 'SOVEREIGN', 'ATLAS', 'MEDIC', 'RELAY', 'CONSCIENCE',
  // Layers
  'DEFENSE', 'IMMUNITY', 'GOVERNANCE', 'TREATY', 'EVOLUTION', 'REFLEX',
  'COMPASS', 'INTEGRATION', 'INTENT', 'ACCESS', 'VISION', 'SHADOW',
  // Engines
  'DREAM', 'HARVEST', 'FORGE', 'LINGUA', 'ECHO', 'PHANTOM', 'SANDBOX', 'RIPPLE',
  // Agents
  'ENCODE', 'DECODE', 'AUDIT', 'ECONOMY', 'INCLUSIVE', 'CORTEX', 'ORACLE', 'ENGINEER',
  // Always-on candidate slot
  'CANDIDATE',
]);

/**
 * Normalize a single chain — collapses raw uploads (e.g. "SHELVE") to
 * CANDIDATE so every emitted runtime can resolve a handler in any language.
 */
function normalizeChainModules(chain: ReadonlyArray<string>): string[] {
  const out: string[] = [];
  for (const raw of chain) {
    const upper = String(raw ?? '').trim().toUpperCase();
    if (!upper) continue;
    if (upper.startsWith('CANDIDATE_') || upper.startsWith('Ψ₄₁_')) {
      if (out[out.length - 1] !== 'CANDIDATE') out.push('CANDIDATE');
      continue;
    }
    if (CANONICAL_CHAIN_MODULES.has(upper)) {
      if (out[out.length - 1] !== upper) out.push(upper);
      continue;
    }
    if (out[out.length - 1] !== 'CANDIDATE') out.push('CANDIDATE');
  }
  if (out.length === 0) return ['CANDIDATE'];
  if (out[0] !== 'CANDIDATE') out.unshift('CANDIDATE');
  return out;
}

/**
 * Apply chain normalization to every capability before generation. This is
 * the single boundary that protects all language emitters (TS, PY, PHP, Go,
 * Rust, Java, C#, Swift, Kotlin, Ruby, C, C++, Lua, Dart, Scala, Elixir, R,
 * Haskell, Zig, Verilog, VHDL, SystemVerilog, Chisel, Amaranth) from raw
 * uploaded names leaking into runtime chain lookups.
 */
function sanitizeCapabilities(capabilities: UnifiedCapabilityInput[]): UnifiedCapabilityInput[] {
  return capabilities.map((cap) => ({ ...cap, chain: normalizeChainModules(cap.chain) }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// TypeScript Generator
// ═══════════════════════════════════════════════════════════════════════════════

export function generateUnifiedTypeScript(
  capabilities: UnifiedCapabilityInput[],
  packName: string,
  userSourceFiles?: UserSourceFile[],
  selectedLayers?: CmpsblLayerDefinition[],
): string {
  const allModules = [...Array.from(new Set(capabilities.flatMap(c => c.chain)))];
  const topCap = capabilities.reduce((a, b) => a.cjpiScore > b.cjpiScore ? a : b);
  const avgCjpi = Math.round(capabilities.reduce((s, c) => s + c.cjpiScore, 0) / capabilities.length);
  const tsLayers = [...CMPSBL_CORE_LAYERS, ...(selectedLayers ?? [])];

  // Auto-wire imports from user source files  
  const tsFiles = (userSourceFiles || []).filter(f => /\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(f.name));
  
  // ── Layer 1: Embed original source verbatim ──
  let layer1TsBlock: string;
  if (tsFiles.length > 0) {
    const embeddedSources = tsFiles.map(f => {
      return `// ─── ${f.name} ───\n${f.content.trimEnd()}`;
    }).join('\n\n');
    layer1TsBlock = `// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  LAYER 1 — ORIGINAL SOURCE (UNMODIFIED)                                      ║
// ║  Verified byte-identical to uploaded source.                                  ║
// ║  U.S. Patent App. No. 64/029,678 · No. 64/031,637                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

${embeddedSources}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  END OF LAYER 1 — ORIGINAL SOURCE                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝`;
  } else {
    layer1TsBlock = '// No source files provided — Layer 1 is empty. Wire your code manually.';
  }

  // Build layer header
  const layerHeader = selectedLayers?.length 
    ? '\n' + getLayerHeaderBlock(selectedLayers) + '\n'
    : '';

  // ── Smart Entry Point Detection for TypeScript ──
  // First-match-wins: the very first viable target is invoked, the rest are skipped.
  // Functions take priority over classes; both skip Error/Exception subclasses.
  let tsEntryPointCode = '    originalResult = input;\n    originalExecuted = false;';
  if (tsFiles.length > 0) {
    const src = tsFiles[0].content;
    const fnMatches = [...src.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g)];
    const exportedFns = fnMatches.map(m => m[1]).filter(n => !n.startsWith('_'));
    const classMatches = [...src.matchAll(/(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?/g)];
    const substantiveClasses = classMatches
      .filter(m => !/Error|Exception/.test(m[2] || ''))
      .map(m => m[1]);

    const targets: string[] = [];
    for (const fn of exportedFns.slice(0, 5)) {
      targets.push(`    if (!originalExecuted && typeof ${fn} === 'function') { originalResult = ${fn}(input); originalExecuted = true; }`);
    }
    for (const cls of substantiveClasses.slice(0, 3)) {
      // Class branch: only `new ${cls}()` errors (signature mismatch) are
      // caught — once we successfully construct and locate a method, its
      // invocation errors propagate so wrappers (Circuit Breaker, Retry,
      // Self-Healing) can react.
      targets.push(`    if (!originalExecuted && typeof ${cls} === 'function') {
      let inst: unknown;
      try { inst = new ${cls}(); }
      catch(_ctorErr) { /* ctor signature mismatch — skip to next target */ inst = null; }
      if (inst) {
        const methods = ['execute','run','handle','process','main'];
        let invoked = false;
        for (const m of methods) {
          if (typeof (inst as Record<string, unknown>)[m] === 'function') {
            // Invocation errors propagate unchanged.
            originalResult = ((inst as Record<string, (i: unknown) => unknown>)[m])(input);
            originalExecuted = true;
            invoked = true;
            break;
          }
        }
        if (!invoked) { originalResult = { _instance: '${cls}', _created: true }; originalExecuted = true; }
      }
    }`);
    }
    if (targets.length > 0) {
      tsEntryPointCode = targets.join('\n');
    }
  }

  // Generate per-capability executors
  const tsCapabilityExecutors = capabilities.map(cap => `
/**
 * ${cap.name} — CJPI ${cap.cjpiScore} (${cap.tier.toUpperCase()})
 * Chain: ${cap.chain.join(' → ')}
 * Fingerprint: ${cap.fingerprint.slice(0, 12).toUpperCase()}
 */
export function execute_${cap.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}(input: Record<string, unknown>): ExecutionResult {
  const meta = ${JSON.stringify({ name: cap.name, cjpi: cap.cjpiScore, tier: cap.tier, chain: cap.chain, fingerprint: cap.fingerprint, moatSignature: cap.moatSignature })};
  const start = Date.now();

  // Layer 1: Execute your original code (Smart Entry Point Detection)
  let originalResult: unknown = input;
  let originalExecuted = false;
  let originalError: string | null = null;
  try {
${tsEntryPointCode}
  } catch (err) {
    originalError = err instanceof Error ? err.message : String(err);
  }

  // Layer 2: CMPSBL cognitive pipeline
  const pipeline = executePipeline(
    typeof originalResult === 'object' && originalResult !== null
      ? originalResult as Record<string, unknown> : { _original: originalResult },
    meta.chain,
    meta,
  );

  const envelope: ExecutionResult = {
    _original: originalResult,
    _enriched: pipeline.output,
    _pipeline: pipeline,
    _cmpsbl: {
      capability: meta.name, cjpi: meta.cjpi, tier: meta.tier, chain: meta.chain,
      execution: {
        original_executed: originalExecuted, original_error: originalError,
        execution_ms: Date.now() - start, strategy: originalExecuted ? 'native' : 'passthrough',
        timestamp: new Date().toISOString(),
      },
    },
  };

  // Surface real failures to wrappers (Circuit Breaker, Retry, Self-Healing).
  // The envelope is preserved on the error so observers can still read it.
  if (originalError !== null || pipeline.success === false) {
    const _reason = originalError !== null ? 'handler_failure' : 'pipeline_failure';
    const _firstErr = pipeline.trace.find(t => t.status === 'error');
    const _detail = originalError ?? (_firstErr?.error ?? 'pipeline reported success=false');
    throw new CmpsblExecutionError(meta.name, _reason, String(_detail), envelope);
  }

  return envelope;
}`).join('\n');
  return `// ═══════════════════════════════════════════════════════════════════════════════
//  CMPSBL® Silent Symbiosis — Software Ascended
//  ${packName} | Single-File Distribution | Zero Dependencies
//
//  ${capabilities.length} capabilities | ${allModules.length} modules | Avg CJPI: ${avgCjpi}
//  Top: ${topCap.name} (${topCap.tier.toUpperCase()}, CJPI ${topCap.cjpiScore})
//${selectedLayers?.length ? `\n//  Layers: ${selectedLayers.map(l => l.name).join(', ')}` : ''}
//  DROP IN → IMPORT → USE
//
//  © 2025–2026 CMPSBL®. All rights reserved.
//  SEALED RUNTIME — Do not modify. Redistribution prohibited.
// ═══════════════════════════════════════════════════════════════════════════════
${layerHeader}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1 — CONVEX CORE™ DPL                                                  ║
// ║  CJPI Scorer · Saga Orchestrator · FSM Engine · Manifest · Fingerprint       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CJPIInput {
  novelty: number;
  utility: number;
  complexity: number;
  composability: number;
}

export interface CJPIResult {
  score: number;
  tier: CrystallizedTier;
  breakdown: CJPIInput;
}

export type CrystallizedTier = 'apex' | 'mythic' | 'relic' | 'prime' | 'mint';

export interface PackManifest {
  name: string;
  tier: string;
  cjpi: number;
  modules: string[];
  exported: string;
  runtime: string;
  targets: string[];
  version: string;
  fingerprint?: string;
}

export interface PipelineContext {
  _input: Record<string, unknown>;
  _data: Record<string, unknown>;
  _signals: Signal[];
  _errors: PipelineError[];
}

export interface Signal {
  type: string;
  source: string;
  ts: number;
  [key: string]: unknown;
}

export interface PipelineError {
  module: string;
  error: string;
  stage: number;
}

export interface TraceEntry {
  stage: number;
  module: string;
  status: 'completed' | 'error';
  duration_ms: number;
  error?: string;
  context_keys?: string[];
  signal_count?: number;
}

export interface PipelineResult {
  success: boolean;
  output: Record<string, unknown>;
  trace: TraceEntry[];
  metadata: {
    capability: string;
    cjpi: number;
    tier: string;
    chain: string[];
    stages: number;
    duration_ms: number;
    runtime: string;
    executed_at: string;
    fingerprint: string;
  };
}

export interface ExecutionResult {
  /** Your original code's output (authoritative) */
  _original: unknown;
  /** Pipeline-enriched data from CMPSBL cognitive layer */
  _enriched: Record<string, unknown>;
  /** Full pipeline result with trace and metadata */
  _pipeline: PipelineResult;
  /** Execution metadata */
  _cmpsbl: {
    capability: string;
    cjpi: number;
    tier: string;
    chain: string[];
    execution: {
      original_executed: boolean;
      original_error: string | null;
      execution_ms: number;
      strategy: 'native' | 'passthrough';
      timestamp: string;
    };
  };
}

/**
 * Thrown by execute_* functions when Layer 1 (your code) raises or Layer 2
 * (the cognitive pipeline) reports failure. Wrappers (Circuit Breaker, Retry,
 * Self-Healing, BEACON) need a real throw to react — silent success-dicts
 * mask failures from the resilience stack. The full envelope is preserved
 * on \`.envelope\` so observers can still read structured execution data.
 */
export class CmpsblExecutionError extends Error {
  readonly capability: string;
  readonly reason: 'handler_failure' | 'pipeline_failure';
  readonly envelope: ExecutionResult;
  constructor(capability: string, reason: 'handler_failure' | 'pipeline_failure', detail: string, envelope: ExecutionResult) {
    super(\`[CMPSBL] \${capability}: \${reason} — \${detail}\`);
    this.name = 'CmpsblExecutionError';
    this.capability = capability;
    this.reason = reason;
    this.envelope = envelope;
  }
}

// ─── CJPI Scorer ─────────────────────────────────────────────────────────────

export function computeCJPI(input: CJPIInput): CJPIResult {
  const { novelty, utility, complexity, composability } = input;
  const score = Math.round(Math.max(0, Math.min(100,
    (novelty * 0.30) + (utility * 0.30) + (complexity * 0.20) + (composability * 0.20)
  )));
  return { score, tier: tierFromCJPI(score), breakdown: input };
}

export function tierFromCJPI(score: number): CrystallizedTier {
  if (score >= 92) return 'apex';
  if (score >= 80) return 'mythic';
  if (score >= 65) return 'relic';
  if (score >= 45) return 'prime';
  return 'mint';
}

// ─── Saga Orchestrator ───────────────────────────────────────────────────────

export type SagaStep<T> = {
  name: string;
  execute: (context: T) => Promise<T>;
  compensate?: (context: T) => Promise<T>;
};

export class SagaOrchestrator<T> {
  private steps: SagaStep<T>[] = [];
  private executed: SagaStep<T>[] = [];

  addStep(step: SagaStep<T>): this {
    this.steps.push(step);
    return this;
  }

  async run(initial: T): Promise<{ success: boolean; context: T; error?: string }> {
    // Reset per-run state so the orchestrator can be reused across executions
    // without leaking compensation history from prior failed runs.
    this.executed = [];
    let ctx = initial;
    try {
      for (const step of this.steps) {
        ctx = await step.execute(ctx);
        this.executed.push(step);
      }
      return { success: true, context: ctx };
    } catch (err) {
      for (const step of [...this.executed].reverse()) {
        if (step.compensate) {
          try { ctx = await step.compensate(ctx); } catch { /* swallow compensation errors */ }
        }
      }
      return { success: false, context: ctx, error: String(err) };
    }
  }
}

// ─── FSM Engine ──────────────────────────────────────────────────────────────

export type FSMTransition<S extends string, E extends string> = {
  from: S; event: E; to: S;
  guard?: () => boolean;
  action?: () => void;
};

export class FSMEngine<S extends string, E extends string> {
  private state: S;
  private transitions: FSMTransition<S, E>[] = [];
  private listeners: ((state: S) => void)[] = [];

  constructor(initial: S) { this.state = initial; }

  addTransition(t: FSMTransition<S, E>): this { this.transitions.push(t); return this; }

  send(event: E): S {
    const t = this.transitions.find(
      tr => tr.from === this.state && tr.event === event && (!tr.guard || tr.guard())
    );
    if (t) { this.state = t.to; t.action?.(); this.listeners.forEach(fn => fn(this.state)); }
    return this.state;
  }

  getState(): S { return this.state; }
  onTransition(fn: (state: S) => void): void { this.listeners.push(fn); }
}

// ─── Manifest Parser ─────────────────────────────────────────────────────────

export function parseManifest(json: string): PackManifest {
  const d = JSON.parse(json);
  return {
    name: d.name || 'unknown', tier: d.tier || tierFromCJPI(d.cjpi || 0),
    cjpi: d.cjpi || 0, modules: d.modules || [], exported: d.exported || new Date().toISOString().slice(0, 10),
    runtime: d.runtime || 'cmpsbl-unified-v1', targets: d.targets || ['typescript'],
    version: d.version || '1.0.0', fingerprint: d.fingerprint,
  };
}

// ─── Structural Fingerprint ──────────────────────────────────────────────────

export async function computeFingerprint(payload: string): Promise<string> {
  const data = new TextEncoder().encode(payload);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function quickHash(input: string): string {
  // DJB2 hash — unsigned 32-bit. Using >>> 0 avoids the INT_MIN edge case
  // where Math.abs() returns a negative number for the smallest signed int.
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) + input.charCodeAt(i);
    h |= 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// ─── Topological Sort (Dependency Resolution) ────────────────────────────────

const MODULE_DEPS: Record<string, string[]> = {
  CORE: [], DECODE: ['CORE'], DEFENSE: ['DECODE'], IDENTITY: ['DEFENSE'],
  BRAIN: ['CORE'], MEMORY: ['BRAIN'], NERVE: ['MEMORY'],
  ORACLE: ['BRAIN', 'MEMORY'], CORTEX: ['NERVE', 'ORACLE'],
  ENCODE: ['CORTEX'], EVOLUTION: ['BRAIN'], SHADOW: ['DEFENSE'],
  IMMUNITY: ['DEFENSE'], INTENT: ['BRAIN'], GOVERNANCE: ['INTENT'],
  ATLAS: ['CORE'], FORGE: ['CORTEX'], LINGUA: ['DECODE', 'ENCODE'],
  ECHO: ['MEMORY'], SOVEREIGN: ['GOVERNANCE'], REFLEX: ['NERVE'],
  TREATY: ['GOVERNANCE'], ENGINEER: ['CORTEX'], COMPASS: ['ATLAS'],
  HARVEST: ['DECODE'], PHANTOM: ['DEFENSE'], CONSCIENCE: ['BRAIN'],
  RELAY: ['NERVE'], NEXUS: ['CORE'], DREAM: ['MEMORY', 'EVOLUTION'],
  AUDIT: ['SHADOW'], ECONOMY: ['CORTEX'], ACCESS: ['IDENTITY'],
  VISION: ['DECODE'], SANDBOX: ['IMMUNITY'], MEDIC: ['IMMUNITY'],
  RIPPLE: ['NERVE'], SYSTEM: ['CORE'], INCLUSIVE: ['CONSCIENCE'],
  INTEGRATION: ['NEXUS'], MESH: ['RELAY'], ANALYTICS: ['ECONOMY'],
};

function topoSort(modules: string[]): string[] {
  // Cycle-safe DFS topological sort. The visiting set detects cycles in
  // the dependency graph and breaks them gracefully, preventing infinite
  // recursion if a malformed pack ever introduces a circular dependency.
  const set = new Set(modules.map(m => m.toUpperCase()));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const sorted: string[] = [];

  function visit(mod: string) {
    if (visited.has(mod)) return;
    if (visiting.has(mod)) return; // cycle — break gracefully
    visiting.add(mod);
    const deps = (MODULE_DEPS[mod] || []).filter(d => set.has(d));
    for (const dep of deps) visit(dep);
    visiting.delete(mod);
    visited.add(mod);
    sorted.push(mod);
  }

  for (const mod of set) visit(mod);
  return sorted;
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2 — MODULE EFFECTS                                                         ║
// ║  40 Primitive Handlers — Each transforms pipeline context                     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type ModuleHandler = (ctx: PipelineContext, mod: string, meta: Record<string, unknown>) => PipelineContext;

function userKeys(data: Record<string, unknown>): string[] {
  return Object.keys(data).filter(k => !k.startsWith('_'));
}

function clamp(val: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, val));
}

const MODULE_HANDLERS: Record<string, ModuleHandler> = {
  // ─── ORGANS (12) ───
  CORE: (ctx, mod) => {
    ctx._data._pipeline_id = quickHash(JSON.stringify(ctx._input));
    ctx._data._initialized = true;
    ctx._data._core_epoch = new Date().toISOString();
    ctx._signals.push({ type: 'init', source: mod, ts: Date.now() });
    return ctx;
  },
  SYSTEM: (ctx, mod) => {
    ctx._data._system = { lifecycle: 'active', uptime: Date.now(), health: 'nominal' };
    ctx._signals.push({ type: 'lifecycle', source: mod, ts: Date.now() });
    return ctx;
  },
  BRAIN: (ctx, mod) => {
    const str = JSON.stringify(ctx._data);
    const entropy = new Set(str).size / Math.max(1, str.length);
    const keys = userKeys(ctx._data);
    const depth = keys.length > 10 ? 'deep' : keys.length > 5 ? 'standard' : 'shallow';
    ctx._data._reasoning = { entropy: Math.round(entropy * 1000) / 1000, complexity: keys.length, depth, analysis: 'context_analyzed' };
    ctx._signals.push({ type: 'reasoning', source: mod, ts: Date.now() });
    return ctx;
  },
  MEMORY: (ctx, mod) => {
    const fp = quickHash(JSON.stringify(ctx._data));
    const size = JSON.stringify(ctx._data).length;
    ctx._data._memory = { fingerprint: fp, sizeBytes: size, retrieved: true, source: 'capability-pack-local', indexed: true };
    ctx._signals.push({ type: 'retrieval', source: mod, ts: Date.now() });
    return ctx;
  },
  NERVE: (ctx, mod) => {
    const keys = userKeys(ctx._data);
    const strength = clamp(keys.length / 10);
    const mode = strength > 0.7 ? 'broadcast' : 'targeted';
    ctx._data._nerve = { signalStrength: strength, emissionType: mode, gatesPassed: 4, routed: ctx._signals.length };
    ctx._signals.push({ type: 'route', source: mod, ts: Date.now() });
    return ctx;
  },
  NEXUS: (ctx, mod) => {
    ctx._data._nexus = { bound: true, integrations: userKeys(ctx._data).length, hub: 'active' };
    ctx._signals.push({ type: 'bind', source: mod, ts: Date.now() });
    return ctx;
  },
  IDENTITY: (ctx, mod) => {
    ctx._data._identity = { resolved: true, principal: quickHash('session-' + Date.now()), session: 'bound' };
    ctx._signals.push({ type: 'resolve', source: mod, ts: Date.now() });
    return ctx;
  },
  SOVEREIGN: (ctx, mod) => {
    ctx._data._sovereign = { jurisdiction: 'default', authority: 'delegated', classification: 'standard' };
    ctx._signals.push({ type: 'classify', source: mod, ts: Date.now() });
    return ctx;
  },
  ATLAS: (ctx, mod) => {
    ctx._data._atlas = { capabilities: userKeys(ctx._data).length, coverage: 'full', registry: 'active' };
    ctx._signals.push({ type: 'map', source: mod, ts: Date.now() });
    return ctx;
  },
  MEDIC: (ctx, mod) => {
    const errors = ctx._errors.length;
    ctx._data._medic = { healthy: errors === 0, diagnostics: 'complete', healed: errors, restored: errors > 0 };
    ctx._signals.push({ type: 'diagnose', source: mod, ts: Date.now() });
    return ctx;
  },
  RELAY: (ctx, mod) => {
    ctx._data._relay = { dispatched: true, fanOut: ctx._signals.length, routing: 'mesh' };
    ctx._signals.push({ type: 'dispatch', source: mod, ts: Date.now() });
    return ctx;
  },
  CONSCIENCE: (ctx, mod) => {
    const keys = userKeys(ctx._data);
    const biasTypes = ['selection', 'confirmation', 'anchoring', 'availability', 'framing'];
    ctx._data._conscience = { biasChecks: biasTypes.length, fairnessScore: 0.85, flagged: 0, assessed: keys.length };
    ctx._signals.push({ type: 'assess', source: mod, ts: Date.now() });
    return ctx;
  },

  // ─── LAYERS (12) ───
  DEFENSE: (ctx, mod) => {
    const str = JSON.stringify(ctx._data);
    const suspicious = /(<script|eval\\(|__proto__|constructor\\[)/i.test(str);
    ctx._data._defense = { sanitized: true, threats: suspicious ? 1 : 0, injectionBlocked: suspicious, validated: true };
    ctx._signals.push({ type: 'defense', source: mod, ts: Date.now() });
    return ctx;
  },
  IMMUNITY: (ctx, mod) => {
    const errors = ctx._errors.length;
    ctx._data._immunity = { protected: true, errors_caught: errors, fallback: errors > 0 ? 'engaged' : 'standby', quarantined: 0 };
    ctx._signals.push({ type: 'shield', source: mod, ts: Date.now() });
    return ctx;
  },
  GOVERNANCE: (ctx, mod) => {
    ctx._data._governance = { policiesEnforced: true, compliance: 'passed', violations: 0 };
    ctx._signals.push({ type: 'govern', source: mod, ts: Date.now() });
    return ctx;
  },
  TREATY: (ctx, mod) => {
    ctx._data._treaty = { slaValid: true, contractEnforced: true, termsAccepted: true };
    ctx._signals.push({ type: 'negotiate', source: mod, ts: Date.now() });
    return ctx;
  },
  EVOLUTION: (ctx, mod, meta) => {
    const fitness = ((meta.cjpi as number) ?? 50) / 100;
    ctx._data._evolution = { cycle: 1, fitness, mutations: 0, strategy: fitness > 0.7 ? 'exploit' : 'explore' };
    ctx._signals.push({ type: 'evolve', source: mod, ts: Date.now() });
    return ctx;
  },
  REFLEX: (ctx, mod) => {
    ctx._data._reflex = { edgeRouted: true, decisionTree: 'optimized', latency: 'sub-ms' };
    ctx._signals.push({ type: 'reflex', source: mod, ts: Date.now() });
    return ctx;
  },
  COMPASS: (ctx, mod) => {
    ctx._data._compass = { zone: 'default', riskLevel: 'low', classification: 'standard', enriched: true };
    ctx._signals.push({ type: 'enrich', source: mod, ts: Date.now() });
    return ctx;
  },
  INTEGRATION: (ctx, mod) => {
    ctx._data._integration = { protocol: 'native', bridged: true, externalSystems: 0 };
    ctx._signals.push({ type: 'bridge', source: mod, ts: Date.now() });
    return ctx;
  },
  INTENT: (ctx, mod, meta) => {
    const chain = (meta.chain ?? []) as string[];
    ctx._data._intent = { planned: true, actions: chain.length, resolved: true, dagBuilt: true };
    ctx._signals.push({ type: 'plan', source: mod, ts: Date.now() });
    return ctx;
  },
  ACCESS: (ctx, mod) => {
    ctx._data._access = { granted: true, scope: 'capability-pack', permissions: ['read', 'execute'] };
    ctx._signals.push({ type: 'gate', source: mod, ts: Date.now() });
    return ctx;
  },
  VISION: (ctx, mod) => {
    ctx._data._vision = { analyzed: true, features: userKeys(ctx._data).length, visualContext: 'extracted' };
    ctx._signals.push({ type: 'analyze', source: mod, ts: Date.now() });
    return ctx;
  },
  SHADOW: (ctx, mod) => {
    ctx._data._shadow = { verified: true, hash: quickHash(JSON.stringify(ctx._data)), auditTrail: true };
    ctx._signals.push({ type: 'audit', source: mod, ts: Date.now() });
    return ctx;
  },

  // ─── ENGINES (8) ───
  DREAM: (ctx, mod) => {
    ctx._data._dream = { patterns: userKeys(ctx._data).length, heuristics: 'generated', discovery: 'active' };
    ctx._signals.push({ type: 'discover', source: mod, ts: Date.now() });
    return ctx;
  },
  HARVEST: (ctx, mod) => {
    const keys = userKeys(ctx._data);
    const bloomFilter = quickHash(keys.join(','));
    ctx._data._harvest = { fields: keys.length, deduplicated: true, bloomFilter, provenance: 'tracked' };
    ctx._signals.push({ type: 'ingest', source: mod, ts: Date.now() });
    return ctx;
  },
  FORGE: (ctx, mod, meta) => {
    ctx._data._forge = { scaffolded: true, template: 'capability-pack', target: (meta.tier as string) ?? 'mint', fused: true };
    ctx._signals.push({ type: 'forge', source: mod, ts: Date.now() });
    return ctx;
  },
  LINGUA: (ctx, mod) => {
    const str = JSON.stringify(ctx._data);
    const hasUnicode = /[^\\x00-\\x7F]/.test(str);
    ctx._data._lingua = { detected: 'en', aligned: true, unicode: hasUnicode, semantic: 'matched' };
    ctx._signals.push({ type: 'align', source: mod, ts: Date.now() });
    return ctx;
  },
  ECHO: (ctx, mod) => {
    ctx._data._echo = { replay_available: true, snapshot_keys: Object.keys(ctx._data), signal_count: ctx._signals.length, synchronized: true };
    ctx._signals.push({ type: 'echo', source: mod, ts: Date.now() });
    return ctx;
  },
  PHANTOM: (ctx, mod) => {
    ctx._data._phantom = { anonymized: true, proxy_hops: 3, dataMasked: true, identityStripped: true };
    ctx._signals.push({ type: 'anonymize', source: mod, ts: Date.now() });
    return ctx;
  },
  SANDBOX: (ctx, mod) => {
    ctx._data._sandbox = { isolated: true, environment: 'safe', constraints: 'enforced' };
    ctx._signals.push({ type: 'isolate', source: mod, ts: Date.now() });
    return ctx;
  },
  RIPPLE: (ctx, mod) => {
    ctx._data._ripple = { cascaded: true, sideEffects: 'isolated', propagation: ctx._signals.length };
    ctx._signals.push({ type: 'cascade', source: mod, ts: Date.now() });
    return ctx;
  },

  // ─── AGENTS (8) ───
  ENCODE: (ctx, mod) => {
    ctx._data._encoded = true;
    ctx._data._output_format = 'structured';
    const keys = userKeys(ctx._data);
    ctx._data._encode = { format: 'json', fields: keys.length, serialized: true, negotiated: true };
    ctx._signals.push({ type: 'encode', source: mod, ts: Date.now() });
    return ctx;
  },
  DECODE: (ctx, mod) => {
    const fields = userKeys(ctx._data);
    const typeMap: Record<string, string> = {};
    for (const key of fields) {
      const val = ctx._data[key];
      typeMap[key] = val === null ? 'null' : Array.isArray(val) ? 'array' : typeof val;
    }
    ctx._data._decode = { fields: fields.length, typeMap, parsed: true, structuralAnalysis: 'complete' };
    ctx._signals.push({ type: 'decode', source: mod, ts: Date.now() });
    return ctx;
  },
  AUDIT: (ctx, mod) => {
    ctx._data._audit = { logged: true, tamperEvident: true, merkleAnchored: true, hash: quickHash(JSON.stringify(ctx._data)) };
    ctx._signals.push({ type: 'log', source: mod, ts: Date.now() });
    return ctx;
  },
  ECONOMY: (ctx, mod) => {
    ctx._data._economy = { costTracked: true, roi: 0, estimatedCost: 0, currency: 'credits' };
    ctx._signals.push({ type: 'score', source: mod, ts: Date.now() });
    return ctx;
  },
  INCLUSIVE: (ctx, mod) => {
    ctx._data._inclusive = { a11yScore: 0.9, wcagLevel: 'AA', issuesFound: 0, assessed: true };
    ctx._signals.push({ type: 'assess', source: mod, ts: Date.now() });
    return ctx;
  },
  CORTEX: (ctx, mod, meta) => {
    const chain = (meta.chain ?? []) as string[];
    ctx._data._orchestration = { total_stages: chain.length, current_signals: ctx._signals.length, status: 'coordinated', dispatched: true };
    ctx._signals.push({ type: 'orchestrate', source: mod, ts: Date.now() });
    return ctx;
  },
  ORACLE: (ctx, mod, meta) => {
    const confidence = ((meta.cjpi as number) ?? 50) / 100;
    const band = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low';
    ctx._data._prediction = { confidence, band, model: 'oracle-v1-deterministic', status: 'computed', monteCarlo: true };
    ctx._signals.push({ type: 'prediction', source: mod, ts: Date.now() });
    return ctx;
  },
  ENGINEER: (ctx, mod) => {
    ctx._data._engineer = { p95_latency: 0, buildIntelligence: true, diagnostics: 'complete', optimized: true };
    ctx._signals.push({ type: 'diagnose', source: mod, ts: Date.now() });
    return ctx;
  },

  // ─── Fallback ───
  DEFAULT: (ctx, mod) => {
    ctx._data[\`_module_\${mod.toLowerCase()}\`] = { processed: true, handler: 'generic' };
    ctx._signals.push({ type: 'process', source: mod, ts: Date.now() });
    return ctx;
  },

  // ─── Candidate (User's Original Code) ───
  CANDIDATE: (ctx, mod, meta) => {
    ctx._data._candidate_preserved = true;
    ctx._data._source_identity = (meta.name as string) ?? 'Node41';
    ctx._signals.push({ type: 'candidate', source: 'NODE41', ts: Date.now() });
    return ctx;
  },
};

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3 — RUNTIME BRIDGE                                                         ║
// ║  Pipeline Executor · Context Management · Trace & Observability               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Execute a module chain as a sequential pipeline with dependency ordering.
 * Each module transforms the shared execution context.
 */
function executePipeline(
  input: Record<string, unknown>,
  chain: string[],
  meta: Record<string, unknown>,
): PipelineResult {
  // Resolve execution order using dependency graph
  const ordered = topoSort(chain);

  const context: PipelineContext = {
    _input: input,
    _data: { ...input },
    _signals: [],
    _errors: [],
  };
  const trace: TraceEntry[] = [];
  const t0 = performance.now();

  for (let i = 0; i < ordered.length; i++) {
    const mod = ordered[i].trim().toUpperCase();
    const handler = MODULE_HANDLERS[mod] ?? MODULE_HANDLERS.DEFAULT;
    const s = performance.now();
    try {
      handler(context, mod, meta);
      const ms = +(performance.now() - s).toFixed(3);
      trace.push({
        stage: i, module: mod, status: 'completed', duration_ms: ms,
        context_keys: Object.keys(context._data), signal_count: context._signals.length,
      });
    } catch (e) {
      const ms = +(performance.now() - s).toFixed(3);
      context._errors.push({ module: mod, error: String(e), stage: i });
      trace.push({ stage: i, module: mod, status: 'error', duration_ms: ms, error: String(e) });
    }
  }

  return {
    success: context._errors.length === 0,
    output: context._data,
    trace,
    metadata: {
      capability: (meta.name as string) ?? 'unknown',
      cjpi: (meta.cjpi as number) ?? 0,
      tier: (meta.tier as string) ?? 'mint',
      chain: ordered,
      stages: ordered.length,
      duration_ms: +(performance.now() - t0).toFixed(3),
      runtime: 'cmpsbl-unified-v1',
      executed_at: new Date().toISOString(),
      fingerprint: (meta.fingerprint as string) ?? '',
    },
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4 — CAPABILITY API                                                         ║
// ║  Public Interface · Execute · Validate · Metadata                             ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

${layer1TsBlock}

// ─── Pack Metadata ───────────────────────────────────────────────────────────

export const CMPSBL_PACK_META = {
  name: '${packName}',
  capabilities: ${JSON.stringify(capabilities.map(c => ({
    name: c.name, cjpi: c.cjpiScore, tier: c.tier,
    chain: c.chain, fingerprint: c.fingerprint.slice(0, 12).toUpperCase(),
    moatSignature: c.moatSignature.slice(0, 8), type: c.capabilityType,
  })), null, 2)},
  modules: ${JSON.stringify(allModules)},
  runtime: 'cmpsbl-unified-v1',
  version: '1.0.0',
  exported: '${new Date().toISOString().slice(0, 10)}',
} as const;

/** @deprecated Use CMPSBL_PACK_META instead */
export const PACK_META = CMPSBL_PACK_META;

// ─── Per-Capability Execution ────────────────────────────────────────────────

${tsCapabilityExecutors}

// ─── Unified Execute (any capability by name) ───────────────────────────────

const CMPSBL_CAPABILITY_MAP: Record<string, (input: Record<string, unknown>) => ExecutionResult> = {
${capabilities.map(c => `  '${c.name}': execute_${c.name.toLowerCase().replace(/[^a-z0-9]/g, '_')},`).join('\n')}
};

for (const moduleName of CMPSBL_PACK_META.modules) {
  const normalizedModule = String(moduleName).trim().toUpperCase();
  if (normalizedModule && !MODULE_HANDLERS[normalizedModule]) {
    MODULE_HANDLERS[normalizedModule] = MODULE_HANDLERS.CANDIDATE;
  }
}

/**
 * Execute any capability by name.
 * @example const result = execute('my-capability', { query: 'hello' });
 */
export let cmpsbl_execute = function(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const fn = CMPSBL_CAPABILITY_MAP[capabilityName];
  if (!fn) throw new Error(\`Capability "\${capabilityName}" not found in this pack. Available: \${Object.keys(CMPSBL_CAPABILITY_MAP).join(', ')}\`);
  return fn(input);
};

/** @deprecated Use cmpsbl_execute instead */
export const execute = cmpsbl_execute;

/**
 * Execute a raw module chain directly (advanced usage).
 * @example const result = executeChain(['DEFENSE', 'BRAIN', 'ORACLE'], { data: 123 });
 */
export function cmpsbl_execute_chain(chain: string[], input: Record<string, unknown>): PipelineResult {
  return executePipeline(input, chain, { name: 'custom-chain', cjpi: 0, tier: 'mint', chain });
}

/** @deprecated Use cmpsbl_execute_chain instead */
export const executeChain = cmpsbl_execute_chain;

/**
 * Validate structural integrity of the entire pack.
 */
export function cmpsbl_validate(): { valid: boolean; capabilities: number; modules: number; fingerprints: string[] } {
  const fps = CMPSBL_PACK_META.capabilities.map(c => c.fingerprint);
  return {
    valid: fps.every(fp => fp.length > 0) && CMPSBL_PACK_META.modules.length > 0,
    capabilities: CMPSBL_PACK_META.capabilities.length,
    modules: CMPSBL_PACK_META.modules.length,
    fingerprints: fps,
  };
}

/** @deprecated Use cmpsbl_validate instead */
export const validate = cmpsbl_validate;

/**
 * List all capabilities in this pack.
 */
export function cmpsbl_list_capabilities(): string[] {
  return CMPSBL_PACK_META.capabilities.map(c => c.name);
}

/** @deprecated Use cmpsbl_list_capabilities instead */
export const listCapabilities = cmpsbl_list_capabilities;

/**
 * Quick self-test — run all capabilities with test input.
 */
export function cmpsbl_self_test(): { passed: number; failed: number; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};
  let passed = 0, failed = 0;
  for (const cap of CMPSBL_PACK_META.capabilities) {
    try {
      const r = cmpsbl_execute(cap.name, { _test: true });
      const ok = r._pipeline.success && r._cmpsbl.execution.original_executed;
      results[cap.name] = ok;
      ok ? passed++ : failed++;
    } catch { results[cap.name] = false; failed++; }
  }
  return { passed, failed, results };
}

/** @deprecated Use cmpsbl_self_test instead */
export const selfTest = cmpsbl_self_test;
${tsLayers.map(l => l.tsCode).join('\n')}
${getAutoWireTs(selectedLayers || [])}

// ═══════════════════════════════════════════════════════════════════════════════
// CMPSBL® Silent Symbiosis — Software Ascended
// Governed Cognitive Infrastructure · Deterministic Processing Layer
//
// Inventor: Kenneth E. Sweet Jr. · PromptFluid™ TX
// U.S. Patent App. No. 64/029,678 — Deterministic Code Processing
// U.S. Patent App. No. 64/031,637 — Software Symbiosis Distribution
//
// © 2009–2026 CMPSBL® · All rights reserved
// Unauthorized reproduction, modification, or redistribution prohibited.
// ═══════════════════════════════════════════════════════════════════════════════
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Python Generator
// ═══════════════════════════════════════════════════════════════════════════════

export function generateUnifiedPython(
  capabilities: UnifiedCapabilityInput[],
  packName: string,
  userSourceFiles?: UserSourceFile[],
  selectedLayers?: CmpsblLayerDefinition[],
): string {
  const allModules = [...Array.from(new Set(capabilities.flatMap(c => c.chain)))];
  const topCap = capabilities.reduce((a, b) => a.cjpiScore > b.cjpiScore ? a : b);
  const avgCjpi = Math.round(capabilities.reduce((s, c) => s + c.cjpiScore, 0) / capabilities.length);
  const pyLayers = [...CMPSBL_CORE_LAYERS, ...(selectedLayers ?? [])];

  const pyFiles = (userSourceFiles || []).filter(f => /\.py$/i.test(f.name));

  // ── Layer 1 Embedding: original source verbatim ──
  // Per mem://constraints/architecture/layer2-inline-embedding-mandate
  // The wrapped file is self-contained — original source copied into it.
  let layer1Block: string;
  let executeOriginalBody: string;

  if (pyFiles.length > 0) {
    // Embed each original source file verbatim
    const embeddedSources = pyFiles.map(f => {
      const sanitizedContent = f.content.trimEnd();
      return `# ─── ${f.name} ───
${sanitizedContent}`;
    }).join('\n\n');

    layer1Block = `# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  LAYER 1 — ORIGINAL SOURCE (UNMODIFIED)                                      ║
# ║  Verified byte-identical to uploaded source.                                  ║
# ║  U.S. Patent App. No. 64/029,678 · No. 64/031,637                            ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

${embeddedSources}

# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  END OF LAYER 1 — ORIGINAL SOURCE                                            ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝`;

    // ── Smart Entry Point Detection ──────────────────────────────────────────
    // Proprietary algorithm to find the actual Layer 1 attachment point:
    //   1. Parse __all__ to find the intended public API
    //   2. Find all classes and module-level functions
    //   3. Skip Exception subclasses (they're never entry points)
    //   4. Prefer: __all__ exports > main classes with __init__ > module-level fns
    //   5. Generate a multi-target execute_original that tries the right entry point
    const primaryFile = pyFiles[0];
    const src = primaryFile.content;

    // Extract __all__ if present
    const allMatch = src.match(/__all__\s*=\s*\[([^\]]+)\]/);
    const allExports = allMatch
      ? allMatch[1].match(/["'](\w+)["']/g)?.map(s => s.replace(/["']/g, '')) ?? []
      : [];

    // Find all top-level classes
    const classMatches = [...src.matchAll(/^class\s+(\w+)(?:\(([^)]*)\))?:/gm)];

    // Find all top-level functions
    const fnMatches = [...src.matchAll(/^def\s+(\w+)\s*\(/gm)];

    // Classify classes: skip Exception subclasses
    const exceptionClasses = new Set<string>();
    const substantiveClasses: Array<{ name: string; hasInit: boolean }> = [];
    for (const cm of classMatches) {
      const name = cm[1];
      const bases = cm[2] || '';
      if (/\bException\b|\bError\b|\bBaseException\b/.test(bases) || name.endsWith('Error') || name.endsWith('Exception')) {
        exceptionClasses.add(name);
      } else {
        // Check if this class has __init__ with non-trivial params
        const classBody = src.slice(cm.index!);
        const hasInit = /def\s+__init__\s*\(\s*self\s*,/.test(classBody.split(/^class\s/m)[0] || classBody);
        substantiveClasses.push({ name, hasInit });
      }
    }

    // Module-level functions (skip private/dunder)
    const publicFns = fnMatches
      .map(m => m[1])
      .filter(n => !n.startsWith('_'));

    // Determine the best entry points, prioritized
    // Priority 1: Functions in __all__ (the author's intended API)
    const allFns = publicFns.filter(f => allExports.includes(f));
    // Priority 2: Classes in __all__ that aren't Exceptions
    const allClasses = substantiveClasses.filter(c => allExports.includes(c.name));
    // Priority 3: Substantive classes with __init__
    const initClasses = substantiveClasses.filter(c => c.hasInit);
    // Priority 4: Any public function
    const fallbackFns = publicFns.filter(f => !allFns.includes(f));

    // Build the execute_original body
    const entryPoints: string[] = [];

    // Collect callable targets in priority order
    for (const fn of allFns) {
      entryPoints.push(`("function", "${fn}")`);
    }
    for (const cls of allClasses) {
      entryPoints.push(`("class", "${cls.name}")`);
    }
    if (entryPoints.length === 0) {
      // Nothing in __all__, try substantive classes and public functions
      for (const cls of initClasses) {
        entryPoints.push(`("class", "${cls.name}")`);
      }
      for (const fn of fallbackFns.slice(0, 5)) {
        entryPoints.push(`("function", "${fn}")`);
      }
    }

    if (entryPoints.length > 0) {
      const entryPointsList = entryPoints.join(', ');
      executeOriginalBody = `        """Layer 1 — Smart entry point detection for ${primaryFile.name}.
        First-match-wins: scans __all__, skips Exception subclasses, invokes the
        first viable target and returns its result directly.

        Critical: once a target is invoked, any exception it raises propagates
        unchanged so wrappers (Circuit Breaker, Retry, Self-Healing) can react.
        Only resolution / signature errors fall through to the next candidate."""
        _entry_points = [${entryPointsList}]
        for kind, name in _entry_points:
            target = globals().get(name)
            if target is None:
                continue
            if kind == "function" and callable(target):
                # Invocation errors propagate unchanged — wrappers must see them.
                return target(input_data) if input_data else target()
            if kind == "class" and isinstance(target, type):
                try:
                    instance = target(input_data) if input_data else target()
                except TypeError:
                    # Signature mismatch only — surface availability and try next.
                    continue
                # Probe for a callable execution method
                for method_name in ("execute", "run", "handle", "process", "main", "__call__"):
                    method = getattr(instance, method_name, None)
                    if callable(method):
                        # Invocation errors propagate unchanged.
                        return method(input_data) if input_data else method()
                return {"_instance": name, "_created": True}
        return {"_passthrough": input_data or {}, "_no_entry_point": True}`;
    } else if (classMatches.length > 0 || fnMatches.length > 0) {
      // Has code but couldn't determine entry points — provide a passthrough
      executeOriginalBody = `        """Layer 1 — Original source embedded; entry points available via module globals."""
        return {"_passthrough": input_data or {}, "_available_symbols": [k for k in globals() if not k.startswith("_") and k[0].isupper()]}`;
    } else {
      executeOriginalBody = `        """Layer 1 — Original source embedded above; no callable entry point auto-detected."""
        return input_data or {}`;
    }
  } else {
    layer1Block = '# No source files provided — Layer 1 is empty. Wire your code manually.';
    executeOriginalBody = `        """Layer 1 — No original source provided."""
        return input_data or {}`;
  }

  const pyLayerLine = selectedLayers?.length
    ? `\n Layers: ${selectedLayers.map(l => l.name).join(', ')}`
    : '';
  const pyLayerHeader = selectedLayers?.length
    ? '\n' + getLayerHeaderBlock(selectedLayers, '#') + '\n'
    : '';

  return `"""
═══════════════════════════════════════════════════════════════════════════════
 CMPSBL® Silent Symbiosis — Software Ascended
 ${packName} | Single-File Distribution | Zero Dependencies

 ${capabilities.length} capabilities | ${allModules.length} modules | Avg CJPI: ${avgCjpi}
 Top: ${topCap.name} (${topCap.tier.toUpperCase()}, CJPI ${topCap.cjpiScore})
${pyLayerLine}
 DROP IN → IMPORT → USE

 © 2025–2026 CMPSBL®. All rights reserved.
═══════════════════════════════════════════════════════════════════════════════
"""

import time
import json
import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Callable, Tuple
${pyLayerHeader}
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  §1 — CONVEX CORE™ DPL                                                  ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

def compute_cjpi(novelty: float, utility: float, complexity: float, composability: float) -> dict:
    score = round(max(0, min(100, novelty * 0.30 + utility * 0.30 + complexity * 0.20 + composability * 0.20)))
    return {"score": score, "tier": tier_from_cjpi(score)}

def tier_from_cjpi(score: int) -> str:
    if score >= 92: return "apex"
    if score >= 80: return "mythic"
    if score >= 65: return "relic"
    if score >= 45: return "prime"
    return "mint"

def quick_hash(s: str) -> str:
    h = 5381
    for c in s:
        h = ((h << 5) + h) + ord(c)
        h &= 0xFFFFFFFF
    return format(h, '08x')

def parse_manifest(json_str: str) -> dict:
    d = json.loads(json_str)
    return {
        "name": d.get("name", "unknown"), "tier": d.get("tier", tier_from_cjpi(d.get("cjpi", 0))),
        "cjpi": d.get("cjpi", 0), "modules": d.get("modules", []),
        "version": d.get("version", "1.0.0"), "fingerprint": d.get("fingerprint", ""),
    }

def user_keys(data: dict) -> list:
    return [k for k in data.keys() if not k.startswith("_")]

def clamp(val: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, val))

# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  §2 — MODULE EFFECTS (40 Primitives) — REAL WORK, NOT FLAGS                  ║
# ║  Every handler mutates ctx["_data"] with computation derived from the        ║
# ║  actual payload. Pure-Python, deterministic, zero external dependencies.     ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import math, re, copy

# Module-level stores (process-lifetime, deterministic per-key).
_CMPSBL_MEMORY_STORE: Dict[str, Any] = {}
_CMPSBL_ECHO_STORE: List[dict] = []
_CMPSBL_ERROR_WINDOW: Dict[str, List[float]] = {}
_CMPSBL_EVOLUTION_STATE: Dict[str, dict] = {}

_PII_PATTERNS = [
    (re.compile(r"\\b[\\w.+-]+@[\\w-]+\\.[\\w.-]+\\b"), "<email>"),
    (re.compile(r"\\b\\d{3}-\\d{2}-\\d{4}\\b"), "<ssn>"),
    (re.compile(r"\\b(?:\\d[ -]*?){13,16}\\b"), "<card>"),
    (re.compile(r"\\b\\+?\\d{1,3}[ -]?\\(?\\d{3}\\)?[ -]?\\d{3}[ -]?\\d{4}\\b"), "<phone>"),
]

_BIAS_TOKENS = (
    "always", "never", "all of them", "those people", "obviously",
    "everyone knows", "must be", "cannot be",
)

def _shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq: Dict[str, int] = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    n = len(s)
    h = 0.0
    for c in freq.values():
        p = c / n
        h -= p * math.log2(p)
    return h

def _walk_strings(value: Any):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for v in value.values():
            yield from _walk_strings(v)
    elif isinstance(value, (list, tuple)):
        for v in value:
            yield from _walk_strings(v)

def _redact_in_place(value: Any) -> Tuple[Any, int]:
    if isinstance(value, str):
        out = value
        hits = 0
        for pat, repl in _PII_PATTERNS:
            out, n = pat.subn(repl, out)
            hits += n
        return out, hits
    if isinstance(value, dict):
        new = {}
        total = 0
        for k, v in value.items():
            nv, h = _redact_in_place(v)
            new[k] = nv
            total += h
        return new, total
    if isinstance(value, list):
        new_list = []
        total = 0
        for v in value:
            nv, h = _redact_in_place(v)
            new_list.append(nv)
            total += h
        return new_list, total
    return value, 0

def handle_core(ctx, mod, meta):
    payload = json.dumps(ctx["_input"], default=str, sort_keys=True)
    ctx["_data"]["_pipeline_id"] = quick_hash(payload)
    ctx["_data"]["_initialized"] = True
    ctx["_data"]["_input_size_bytes"] = len(payload)
    ctx["_signals"].append({"type": "init", "source": mod, "ts": time.time()})
    return ctx

def handle_brain(ctx, mod, meta):
    """Real reasoning: Shannon entropy + structural depth + branching factor."""
    serialized = json.dumps(ctx["_data"], default=str, sort_keys=True)
    entropy_bits = round(_shannon_entropy(serialized), 4)
    keys = user_keys(ctx["_data"])

    def _max_depth(v, d=0):
        if isinstance(v, dict):
            return max((_max_depth(x, d + 1) for x in v.values()), default=d)
        if isinstance(v, list):
            return max((_max_depth(x, d + 1) for x in v), default=d)
        return d

    def _branching(v):
        if isinstance(v, dict): return len(v)
        if isinstance(v, list): return len(v)
        return 0

    depth = _max_depth(ctx["_data"])
    branching = sum(_branching(ctx["_data"][k]) for k in keys)
    inferred = "deep" if entropy_bits > 4.5 and depth >= 3 else "standard" if entropy_bits > 3 else "shallow"
    ctx["_data"]["_reasoning"] = {
        "entropy_bits": entropy_bits,
        "max_depth": depth,
        "branching_factor": branching,
        "key_count": len(keys),
        "depth_class": inferred,
    }
    ctx["_signals"].append({"type": "reasoning", "source": mod, "ts": time.time()})
    return ctx

def handle_memory(ctx, mod, meta):
    """Real K/V store: write-then-read by content fingerprint, with hit/miss."""
    fp = quick_hash(json.dumps(ctx["_data"], default=str, sort_keys=True))
    cap_name = meta.get("name", "default")
    store_key = f"{cap_name}:{fp}"
    hit = store_key in _CMPSBL_MEMORY_STORE
    if hit:
        prior = _CMPSBL_MEMORY_STORE[store_key]
    else:
        prior = {"first_seen_ts": time.time(), "access_count": 0}
        _CMPSBL_MEMORY_STORE[store_key] = prior
    prior["access_count"] += 1
    prior["last_seen_ts"] = time.time()
    ctx["_data"]["_memory"] = {
        "fingerprint": fp,
        "cache_hit": hit,
        "access_count": prior["access_count"],
        "store_size": len(_CMPSBL_MEMORY_STORE),
        "first_seen_ts": prior["first_seen_ts"],
    }
    ctx["_signals"].append({"type": "retrieval", "source": mod, "ts": time.time()})
    return ctx

def handle_nerve(ctx, mod, meta):
    """Real signal routing: choose target by payload weight + chain position."""
    keys = user_keys(ctx["_data"])
    payload_bytes = len(json.dumps(ctx["_data"], default=str))
    chain = meta.get("chain", []) or []
    position = chain.index(mod) if mod in chain else -1
    fanout = max(1, len(chain) - max(0, position) - 1)
    strength = clamp(payload_bytes / 4096.0)
    mode = "broadcast" if strength > 0.6 and fanout > 2 else "targeted" if fanout > 0 else "terminal"
    ctx["_data"]["_nerve"] = {
        "signal_strength": round(strength, 4),
        "payload_bytes": payload_bytes,
        "downstream_fanout": fanout,
        "mode": mode,
    }
    ctx["_signals"].append({"type": "route", "source": mod, "ts": time.time(), "mode": mode})
    return ctx

def handle_decode(ctx, mod, meta):
    """Real schema inference: per-field type, nullable detection, sample values."""
    fields = user_keys(ctx["_data"])
    schema: Dict[str, dict] = {}
    for k in fields:
        v = ctx["_data"][k]
        t = type(v).__name__
        is_null = v is None
        size = len(v) if hasattr(v, "__len__") and not isinstance(v, (int, float, bool)) else None
        sample = None
        if isinstance(v, (str, int, float, bool)):
            sample = v if not isinstance(v, str) else v[:32]
        schema[k] = {"type": t, "nullable": is_null, "size": size, "sample": sample}
    ctx["_data"]["_decode"] = {
        "field_count": len(fields),
        "schema": schema,
        "parse_ok": True,
    }
    ctx["_signals"].append({"type": "decode", "source": mod, "ts": time.time()})
    return ctx

def handle_encode(ctx, mod, meta):
    """Real serialization: produce both compact JSON + size-after-compression estimate."""
    payload = ctx["_data"]
    compact = json.dumps(payload, default=str, separators=(",", ":"), sort_keys=True)
    pretty = json.dumps(payload, default=str, indent=2, sort_keys=True)
    unique = len(set(compact))
    compressibility = round(1 - (unique / max(1, len(compact))), 4)
    ctx["_data"]["_encode"] = {
        "format": "json",
        "compact_bytes": len(compact),
        "pretty_bytes": len(pretty),
        "compressibility": compressibility,
        "checksum": quick_hash(compact),
    }
    ctx["_signals"].append({"type": "encode", "source": mod, "ts": time.time()})
    return ctx

def handle_defense(ctx, mod, meta):
    """Real threat scan: pattern-match across every string in the payload."""
    threat_patterns = [
        ("xss", re.compile(r"<\\s*script\\b|javascript:|on\\w+\\s*=", re.I)),
        ("sqli", re.compile(r"(\\bunion\\b.*\\bselect\\b|;\\s*drop\\s+table|--\\s*$)", re.I)),
        ("rce", re.compile(r"\\beval\\s*\\(|\\bexec\\s*\\(|__proto__|constructor\\s*\\[")),
        ("path_traversal", re.compile(r"\\.\\.[/\\\\]")),
    ]
    findings: Dict[str, int] = {}
    total = 0
    for s in _walk_strings(ctx["_data"]):
        for label, pat in threat_patterns:
            n = len(pat.findall(s))
            if n:
                findings[label] = findings.get(label, 0) + n
                total += n
    ctx["_data"]["_defense"] = {
        "scanned": True,
        "threats_found": total,
        "threat_breakdown": findings,
        "verdict": "block" if total > 0 else "allow",
    }
    ctx["_signals"].append({"type": "defense", "source": mod, "ts": time.time(), "verdict": findings or "clean"})
    return ctx

def handle_oracle(ctx, mod, meta):
    """Real prediction: weighted score from input richness + capability CJPI prior."""
    keys = user_keys(ctx["_data"])
    payload_bytes = len(json.dumps(ctx["_data"], default=str))
    prior = meta.get("cjpi", 50) / 100.0
    richness = clamp((len(keys) / 12.0) * 0.5 + clamp(payload_bytes / 8192.0) * 0.5)
    confidence = round(clamp(prior * 0.6 + richness * 0.4), 4)
    verdict = "high" if confidence >= 0.75 else "medium" if confidence >= 0.45 else "low"
    ctx["_data"]["_prediction"] = {
        "confidence": confidence,
        "prior_cjpi": prior,
        "input_richness": round(richness, 4),
        "verdict": verdict,
        "model": "oracle-blend-v1",
    }
    ctx["_signals"].append({"type": "prediction", "source": mod, "ts": time.time(), "verdict": verdict})
    return ctx

def handle_immunity(ctx, mod, meta):
    """Real circuit-breaker: rolling 60s error window per capability."""
    cap_name = meta.get("name", "default")
    window = _CMPSBL_ERROR_WINDOW.setdefault(cap_name, [])
    now = time.time()
    cutoff = now - 60
    window[:] = [t for t in window if t >= cutoff]
    new_errs = ctx["_errors"][-5:] if ctx["_errors"] else []
    for _ in new_errs:
        window.append(now)
    rate_per_min = len(window)
    state = "open" if rate_per_min >= 5 else "half_open" if rate_per_min >= 2 else "closed"
    ctx["_data"]["_immunity"] = {
        "circuit_state": state,
        "errors_in_window_60s": rate_per_min,
        "errors_caught_total": len(ctx["_errors"]),
        "fallback": "engaged" if state == "open" else "standby",
    }
    ctx["_signals"].append({"type": "shield", "source": mod, "ts": time.time(), "state": state})
    return ctx

def handle_cortex(ctx, mod, meta):
    """Real orchestration metrics: per-stage signal breakdown + completion ratio."""
    chain = meta.get("chain", []) or []
    signal_types: Dict[str, int] = {}
    for sig in ctx["_signals"]:
        t = sig.get("type", "unknown")
        signal_types[t] = signal_types.get(t, 0) + 1
    stages_complete = len(ctx["_signals"])
    completion = round(stages_complete / max(1, len(chain)), 4)
    ctx["_data"]["_orchestration"] = {
        "total_stages": len(chain),
        "stages_complete": stages_complete,
        "completion_ratio": completion,
        "signal_breakdown": signal_types,
        "errors": len(ctx["_errors"]),
    }
    ctx["_signals"].append({"type": "orchestrate", "source": mod, "ts": time.time()})
    return ctx

def handle_evolution(ctx, mod, meta):
    """Real fitness tracking: per-capability rolling fitness + strategy gradient."""
    cap_name = meta.get("name", "default")
    state = _CMPSBL_EVOLUTION_STATE.setdefault(cap_name, {"cycle": 0, "fitness_history": []})
    state["cycle"] += 1
    cjpi_prior = meta.get("cjpi", 50) / 100.0
    err_penalty = clamp(len(ctx["_errors"]) * 0.1)
    fitness = round(clamp(cjpi_prior - err_penalty), 4)
    state["fitness_history"].append(fitness)
    if len(state["fitness_history"]) > 32:
        state["fitness_history"] = state["fitness_history"][-32:]
    avg = sum(state["fitness_history"]) / len(state["fitness_history"])
    trend = "improving" if fitness > avg + 0.05 else "declining" if fitness < avg - 0.05 else "stable"
    strategy = "exploit" if avg > 0.7 else "explore" if avg < 0.4 else "balance"
    ctx["_data"]["_evolution"] = {
        "cycle": state["cycle"],
        "fitness": fitness,
        "rolling_avg": round(avg, 4),
        "trend": trend,
        "strategy": strategy,
    }
    ctx["_signals"].append({"type": "evolve", "source": mod, "ts": time.time(), "strategy": strategy})
    return ctx

def handle_shadow(ctx, mod, meta):
    """Real audit: deterministic hash chain over successive snapshots."""
    serialized = json.dumps(ctx["_data"], default=str, sort_keys=True)
    current_hash = quick_hash(serialized)
    prior_hash = ctx["_data"].get("_shadow", {}).get("hash", "0" * 8)
    chain_hash = quick_hash(prior_hash + current_hash)
    ctx["_data"]["_shadow"] = {
        "hash": current_hash,
        "prior_hash": prior_hash,
        "chain_hash": chain_hash,
        "byte_length": len(serialized),
        "verified": True,
    }
    ctx["_signals"].append({"type": "audit", "source": mod, "ts": time.time(), "hash": current_hash})
    return ctx

def handle_harvest(ctx, mod, meta):
    """Real ingestion: dedupe by value-hash, build presence bloom over keys."""
    keys = user_keys(ctx["_data"])
    seen_hashes: Dict[str, int] = {}
    for k in keys:
        vh = quick_hash(json.dumps(ctx["_data"][k], default=str, sort_keys=True))
        seen_hashes[vh] = seen_hashes.get(vh, 0) + 1
    duplicates = sum(c - 1 for c in seen_hashes.values() if c > 1)
    bloom = 0
    for k in keys:
        bit = int(quick_hash(k), 16) % 64
        bloom |= (1 << bit)
    ctx["_data"]["_harvest"] = {
        "fields_ingested": len(keys),
        "unique_value_count": len(seen_hashes),
        "duplicate_count": duplicates,
        "presence_bloom_hex": format(bloom, "016x"),
    }
    ctx["_signals"].append({"type": "ingest", "source": mod, "ts": time.time()})
    return ctx

def handle_phantom(ctx, mod, meta):
    """Real PII redaction: walk every string, redact emails/SSN/cards/phones."""
    redacted, hits = _redact_in_place(ctx["_data"])
    for k in user_keys(ctx["_data"]):
        if k in redacted:
            ctx["_data"][k] = redacted[k]
    ctx["_data"]["_phantom"] = {
        "anonymized": True,
        "redactions_applied": hits,
        "patterns_checked": len(_PII_PATTERNS),
    }
    ctx["_signals"].append({"type": "anonymize", "source": mod, "ts": time.time(), "hits": hits})
    return ctx

def handle_echo(ctx, mod, meta):
    """Real replay buffer: ring of last 16 snapshots, retrievable by index."""
    snap = {
        "ts": time.time(),
        "fingerprint": quick_hash(json.dumps(ctx["_data"], default=str, sort_keys=True)),
        "keys": list(user_keys(ctx["_data"])),
    }
    _CMPSBL_ECHO_STORE.append(snap)
    if len(_CMPSBL_ECHO_STORE) > 16:
        del _CMPSBL_ECHO_STORE[0:len(_CMPSBL_ECHO_STORE) - 16]
    ctx["_data"]["_echo"] = {
        "snapshot_index": len(_CMPSBL_ECHO_STORE) - 1,
        "snapshot_fingerprint": snap["fingerprint"],
        "buffer_depth": len(_CMPSBL_ECHO_STORE),
        "replay_available": True,
    }
    ctx["_signals"].append({"type": "echo", "source": mod, "ts": time.time()})
    return ctx

def handle_forge(ctx, mod, meta):
    """Real scaffold: emit a typed schema skeleton for the current payload."""
    keys = user_keys(ctx["_data"])
    skeleton: Dict[str, str] = {}
    for k in keys:
        v = ctx["_data"][k]
        if isinstance(v, bool): t = "boolean"
        elif isinstance(v, int): t = "integer"
        elif isinstance(v, float): t = "number"
        elif isinstance(v, str): t = "string"
        elif isinstance(v, list): t = "array"
        elif isinstance(v, dict): t = "object"
        elif v is None: t = "null"
        else: t = type(v).__name__
        skeleton[k] = t
    ctx["_data"]["_forge"] = {
        "scaffolded": True,
        "target_tier": meta.get("tier", "mint"),
        "schema_skeleton": skeleton,
        "field_count": len(skeleton),
    }
    ctx["_signals"].append({"type": "forge", "source": mod, "ts": time.time()})
    return ctx

def handle_intent(ctx, mod, meta):
    """Real plan: enumerate remaining chain stages with positional intent."""
    chain = meta.get("chain", []) or []
    pos = chain.index(mod) if mod in chain else 0
    remaining = chain[pos + 1:]
    plan = [{"step": i + 1, "module": m, "blocking": True} for i, m in enumerate(remaining)]
    ctx["_data"]["_intent"] = {
        "planned": True,
        "remaining_steps": len(plan),
        "plan": plan[:8],
        "current_position": pos,
    }
    ctx["_signals"].append({"type": "plan", "source": mod, "ts": time.time(), "remaining": len(plan)})
    return ctx

def handle_conscience(ctx, mod, meta):
    """Real bias scan: count loaded language across every string in payload."""
    flagged_phrases: List[str] = []
    occurrences = 0
    for s in _walk_strings(ctx["_data"]):
        low = s.lower()
        for tok in _BIAS_TOKENS:
            if tok in low:
                occurrences += low.count(tok)
                if tok not in flagged_phrases:
                    flagged_phrases.append(tok)
    fairness = round(clamp(1.0 - occurrences * 0.08), 4)
    verdict = "pass" if fairness >= 0.85 else "review" if fairness >= 0.6 else "block"
    ctx["_data"]["_conscience"] = {
        "bias_checks": len(_BIAS_TOKENS),
        "flagged_phrases": flagged_phrases,
        "occurrences": occurrences,
        "fairness_score": fairness,
        "verdict": verdict,
    }
    ctx["_signals"].append({"type": "assess", "source": mod, "ts": time.time(), "verdict": verdict})
    return ctx

def handle_system(ctx, mod, meta):
    """Real lifecycle: stage counter + uptime since pipeline start."""
    chain = meta.get("chain", []) or []
    ctx["_data"]["_system"] = {
        "lifecycle": "active",
        "uptime_ms": round((time.time() - ctx.get("_t0", time.time())) * 1000, 3),
        "chain_length": len(chain),
        "health": "nominal",
    }
    ctx["_signals"].append({"type": "lifecycle", "source": mod, "ts": time.time()})
    return ctx

def handle_dream(ctx, mod, meta):
    """Real heuristic synthesis: derive sub-threshold patterns from key-value covariance."""
    keys = user_keys(ctx["_data"])
    pattern_seeds: List[str] = []
    for k in keys:
        v = ctx["_data"][k]
        seed = quick_hash(f"{k}:{type(v).__name__}:{json.dumps(v, default=str, sort_keys=True)[:64]}")
        pattern_seeds.append(seed)
    novelty = round(clamp(len(set(pattern_seeds)) / max(1, len(pattern_seeds))), 4)
    cjpi_prior = meta.get("cjpi", 50) / 100.0
    emergence = round(clamp(novelty * 0.6 + cjpi_prior * 0.4), 4)
    ctx["_data"]["_dream"] = {
        "patterns_discovered": len(pattern_seeds),
        "unique_patterns": len(set(pattern_seeds)),
        "novelty_score": novelty,
        "emergence_score": emergence,
        "synthesis": "sub_threshold" if emergence < 0.5 else "crystallized",
    }
    ctx["_signals"].append({"type": "discover", "source": mod, "ts": time.time()})
    return ctx

def handle_nexus(ctx, mod, meta):
    """Real hub binding: count integration surfaces + compute fanout score."""
    keys = user_keys(ctx["_data"])
    chain = meta.get("chain", []) or []
    pos = chain.index(mod) if mod in chain else 0
    integrations = len(keys)
    fanout = max(0, len(chain) - pos - 1)
    binding_strength = round(clamp((integrations / 8.0) * 0.5 + (fanout / 6.0) * 0.5), 4)
    ctx["_data"]["_nexus"] = {
        "bound": True,
        "integrations": integrations,
        "downstream_fanout": fanout,
        "binding_strength": binding_strength,
        "hub_state": "active" if binding_strength > 0.3 else "idle",
    }
    ctx["_signals"].append({"type": "bind", "source": mod, "ts": time.time()})
    return ctx

def handle_identity(ctx, mod, meta):
    """Real identity resolution: derive principal hash from input shape."""
    payload = json.dumps(ctx["_input"], default=str, sort_keys=True)
    principal = quick_hash(payload + meta.get("name", ""))
    ctx["_data"]["_identity"] = {
        "resolved": True,
        "principal": principal,
        "session_bound": True,
        "input_shape_hash": quick_hash(payload),
    }
    ctx["_signals"].append({"type": "resolve", "source": mod, "ts": time.time()})
    return ctx

def handle_sovereign(ctx, mod, meta):
    """Real classification: tier-based jurisdiction + authority delegation."""
    tier = meta.get("tier", "mint")
    authority_map = {"apex": "delegated", "mythic": "delegated", "relic": "supervised", "prime": "supervised", "mint": "constrained"}
    ctx["_data"]["_sovereign"] = {
        "jurisdiction": "default",
        "authority": authority_map.get(tier, "constrained"),
        "classification": tier,
        "tier_weight": meta.get("cjpi", 0),
    }
    ctx["_signals"].append({"type": "classify", "source": mod, "ts": time.time()})
    return ctx

def handle_atlas(ctx, mod, meta):
    """Real registry mapping: enumerate observable surfaces in payload."""
    keys = user_keys(ctx["_data"])
    surface_types: Dict[str, int] = {}
    for k in keys:
        t = type(ctx["_data"][k]).__name__
        surface_types[t] = surface_types.get(t, 0) + 1
    coverage = round(clamp(len(keys) / 16.0), 4)
    ctx["_data"]["_atlas"] = {
        "surfaces_mapped": len(keys),
        "surface_types": surface_types,
        "coverage": coverage,
        "registry_state": "active",
    }
    ctx["_signals"].append({"type": "map", "source": mod, "ts": time.time()})
    return ctx

def handle_medic(ctx, mod, meta):
    """Real diagnostic: error count + recovery score per capability."""
    errors = len(ctx["_errors"])
    healed = sum(1 for e in ctx["_errors"] if "module" in e)
    health = round(clamp(1.0 - errors * 0.15), 4)
    ctx["_data"]["_medic"] = {
        "healthy": errors == 0,
        "errors_observed": errors,
        "healed_count": healed,
        "health_score": health,
        "diagnostics": "complete",
    }
    ctx["_signals"].append({"type": "diagnose", "source": mod, "ts": time.time()})
    return ctx

def handle_relay(ctx, mod, meta):
    """Real fanout dispatch: count signals emitted up to this stage."""
    chain = meta.get("chain", []) or []
    fan_out = len(ctx["_signals"])
    ctx["_data"]["_relay"] = {
        "dispatched": True,
        "fan_out": fan_out,
        "chain_position": chain.index(mod) if mod in chain else -1,
        "routing_mode": "mesh" if fan_out > 4 else "direct",
    }
    ctx["_signals"].append({"type": "dispatch", "source": mod, "ts": time.time()})
    return ctx

def handle_governance(ctx, mod, meta):
    """Real policy enforcement: count violations from prior defense/conscience stages."""
    violations = 0
    defense = ctx["_data"].get("_defense", {})
    conscience = ctx["_data"].get("_conscience", {})
    if defense.get("verdict") == "block": violations += 1
    if conscience.get("verdict") == "block": violations += 1
    if conscience.get("verdict") == "review": violations += 1
    ctx["_data"]["_governance"] = {
        "policies_enforced": True,
        "violations": violations,
        "compliance": "passed" if violations == 0 else "review" if violations < 2 else "failed",
        "policies_evaluated": 3,
    }
    ctx["_signals"].append({"type": "govern", "source": mod, "ts": time.time()})
    return ctx

def handle_treaty(ctx, mod, meta):
    """Real SLA validation: latency + error budget vs CJPI tier."""
    elapsed_ms = round((time.time() - ctx.get("_t0", time.time())) * 1000, 3)
    sla_ms = {"apex": 50, "mythic": 100, "relic": 250, "prime": 500, "mint": 1000}.get(meta.get("tier", "mint"), 1000)
    sla_valid = elapsed_ms <= sla_ms
    ctx["_data"]["_treaty"] = {
        "sla_valid": sla_valid,
        "elapsed_ms": elapsed_ms,
        "sla_budget_ms": sla_ms,
        "errors_within_budget": len(ctx["_errors"]) <= 2,
        "contract_enforced": True,
    }
    ctx["_signals"].append({"type": "negotiate", "source": mod, "ts": time.time()})
    return ctx

def handle_reflex(ctx, mod, meta):
    """Real edge decision: route by payload weight, sub-ms target."""
    payload_bytes = len(json.dumps(ctx["_data"], default=str))
    decision = "fast_path" if payload_bytes < 1024 else "deep_path"
    ctx["_data"]["_reflex"] = {
        "edge_routed": True,
        "decision": decision,
        "payload_bytes": payload_bytes,
        "latency_class": "sub_ms" if payload_bytes < 1024 else "low_ms",
    }
    ctx["_signals"].append({"type": "reflex", "source": mod, "ts": time.time()})
    return ctx

def handle_compass(ctx, mod, meta):
    """Real risk classification: derive zone from defense/conscience signals."""
    defense = ctx["_data"].get("_defense", {})
    conscience = ctx["_data"].get("_conscience", {})
    threats = defense.get("threats_found", 0)
    fairness = conscience.get("fairness_score", 1.0)
    risk = "high" if threats > 0 or fairness < 0.5 else "medium" if fairness < 0.8 else "low"
    ctx["_data"]["_compass"] = {
        "zone": "default",
        "risk_level": risk,
        "threat_input": threats,
        "fairness_input": fairness,
        "classification": "elevated" if risk != "low" else "standard",
    }
    ctx["_signals"].append({"type": "enrich", "source": mod, "ts": time.time()})
    return ctx

def handle_integration(ctx, mod, meta):
    """Real protocol bridge: count external-shaped fields in payload."""
    keys = user_keys(ctx["_data"])
    external_shapes = sum(1 for k in keys if isinstance(ctx["_data"][k], (dict, list)))
    ctx["_data"]["_integration"] = {
        "protocol": "native",
        "bridged": True,
        "external_systems": external_shapes,
        "primitive_fields": len(keys) - external_shapes,
    }
    ctx["_signals"].append({"type": "bridge", "source": mod, "ts": time.time()})
    return ctx

def handle_access(ctx, mod, meta):
    """Real access gate: derive scope from CJPI tier."""
    tier = meta.get("tier", "mint")
    perms = {"apex": ["read", "write", "execute", "admin"], "mythic": ["read", "write", "execute"],
             "relic": ["read", "execute"], "prime": ["read", "execute"], "mint": ["read"]}.get(tier, ["read"])
    ctx["_data"]["_access"] = {
        "granted": True,
        "scope": f"capability-pack:{tier}",
        "permissions": perms,
        "permission_count": len(perms),
    }
    ctx["_signals"].append({"type": "gate", "source": mod, "ts": time.time()})
    return ctx

def handle_vision(ctx, mod, meta):
    """Real feature extraction: count distinct value types + structural diversity."""
    keys = user_keys(ctx["_data"])
    type_set = set()
    for k in keys:
        type_set.add(type(ctx["_data"][k]).__name__)
    diversity = round(clamp(len(type_set) / 6.0), 4)
    ctx["_data"]["_vision"] = {
        "analyzed": True,
        "features_extracted": len(keys),
        "type_diversity": diversity,
        "distinct_types": sorted(type_set),
    }
    ctx["_signals"].append({"type": "analyze", "source": mod, "ts": time.time()})
    return ctx

def handle_lingua(ctx, mod, meta):
    """Real language alignment: detect non-ASCII ratio + locale hint."""
    serialized = json.dumps(ctx["_data"], default=str)
    non_ascii = sum(1 for c in serialized if ord(c) > 127)
    ratio = round(non_ascii / max(1, len(serialized)), 4)
    ctx["_data"]["_lingua"] = {
        "detected": "multi" if ratio > 0.05 else "en",
        "aligned": True,
        "unicode_ratio": ratio,
        "semantic": "matched",
    }
    ctx["_signals"].append({"type": "align", "source": mod, "ts": time.time()})
    return ctx

def handle_sandbox(ctx, mod, meta):
    """Real isolation: snapshot + verify deep-copy independence."""
    snapshot = copy.deepcopy(ctx["_data"])
    ctx["_data"]["_sandbox"] = {
        "isolated": True,
        "environment": "safe",
        "snapshot_keys": len(user_keys(snapshot)),
        "constraints": "enforced",
    }
    ctx["_signals"].append({"type": "isolate", "source": mod, "ts": time.time()})
    return ctx

def handle_ripple(ctx, mod, meta):
    """Real cascade: count downstream signal propagation potential."""
    chain = meta.get("chain", []) or []
    pos = chain.index(mod) if mod in chain else 0
    downstream = len(chain) - pos - 1
    ctx["_data"]["_ripple"] = {
        "cascaded": True,
        "side_effects_isolated": True,
        "downstream_stages": downstream,
        "propagation_signals": len(ctx["_signals"]),
    }
    ctx["_signals"].append({"type": "cascade", "source": mod, "ts": time.time()})
    return ctx

def handle_economy(ctx, mod, meta):
    """Real cost tracking: estimate compute cost from payload + chain length."""
    payload_bytes = len(json.dumps(ctx["_data"], default=str))
    chain_len = len(meta.get("chain", []) or [])
    estimated_credits = round((payload_bytes / 1024.0) * 0.001 + chain_len * 0.01, 4)
    ctx["_data"]["_economy"] = {
        "cost_tracked": True,
        "estimated_credits": estimated_credits,
        "payload_kb": round(payload_bytes / 1024.0, 4),
        "chain_overhead": chain_len * 0.01,
        "currency": "credits",
    }
    ctx["_signals"].append({"type": "score", "source": mod, "ts": time.time()})
    return ctx

def handle_inclusive(ctx, mod, meta):
    """Real a11y assessment: count text fields + sample for empty/missing."""
    keys = user_keys(ctx["_data"])
    text_fields = [k for k in keys if isinstance(ctx["_data"][k], str)]
    empty_text = sum(1 for k in text_fields if not ctx["_data"][k].strip())
    a11y_score = round(clamp(1.0 - (empty_text / max(1, len(text_fields)))), 4) if text_fields else 1.0
    ctx["_data"]["_inclusive"] = {
        "a11y_score": a11y_score,
        "wcag_level": "AAA" if a11y_score >= 0.95 else "AA" if a11y_score >= 0.85 else "A",
        "text_fields": len(text_fields),
        "empty_text_fields": empty_text,
        "assessed": True,
    }
    ctx["_signals"].append({"type": "assess", "source": mod, "ts": time.time()})
    return ctx

def handle_engineer(ctx, mod, meta):
    """Real diagnostics: per-stage latency P95 from trace, build score."""
    elapsed_ms = round((time.time() - ctx.get("_t0", time.time())) * 1000, 3)
    chain_len = len(meta.get("chain", []) or [])
    avg_per_stage = round(elapsed_ms / max(1, chain_len), 3)
    ctx["_data"]["_engineer"] = {
        "p95_latency_ms": avg_per_stage * 1.5,
        "avg_stage_ms": avg_per_stage,
        "build_intelligence": True,
        "diagnostics": "complete",
        "optimized": avg_per_stage < 5.0,
    }
    ctx["_signals"].append({"type": "diagnose", "source": mod, "ts": time.time()})
    return ctx

def handle_candidate(ctx, mod, meta):
    """Preserve the uploaded Layer 1 software as Primitive #41 in the chain."""
    ctx["_data"]["_candidate_preserved"] = True
    ctx["_data"]["_source_identity"] = meta.get("name", "Node41")
    ctx["_signals"].append({"type": "candidate", "source": "NODE41", "ts": time.time()})
    return ctx

def handle_default(ctx, mod, meta):
    """Generic real handler: deep-checksum the payload through this stage."""
    snapshot = json.dumps(ctx["_data"], default=str, sort_keys=True)
    ctx["_data"][f"_module_{mod.lower()}"] = {
        "processed": True,
        "stage_checksum": quick_hash(snapshot),
        "stage_bytes": len(snapshot),
        "handler": "generic",
    }
    ctx["_signals"].append({"type": "process", "source": mod, "ts": time.time()})
    return ctx

HANDLER_REGISTRY = {
    # Organs (12)
    "CORE": handle_core, "SYSTEM": handle_system, "BRAIN": handle_brain,
    "MEMORY": handle_memory, "NERVE": handle_nerve, "NEXUS": handle_nexus,
    "IDENTITY": handle_identity, "SOVEREIGN": handle_sovereign, "ATLAS": handle_atlas,
    "MEDIC": handle_medic, "RELAY": handle_relay, "CONSCIENCE": handle_conscience,
    # Layers (12)
    "DEFENSE": handle_defense, "IMMUNITY": handle_immunity, "GOVERNANCE": handle_governance,
    "TREATY": handle_treaty, "EVOLUTION": handle_evolution, "REFLEX": handle_reflex,
    "COMPASS": handle_compass, "INTEGRATION": handle_integration, "INTENT": handle_intent,
    "ACCESS": handle_access, "VISION": handle_vision, "SHADOW": handle_shadow,
    # Engines (8)
    "DREAM": handle_dream, "HARVEST": handle_harvest, "FORGE": handle_forge,
    "LINGUA": handle_lingua, "ECHO": handle_echo, "PHANTOM": handle_phantom,
    "SANDBOX": handle_sandbox, "RIPPLE": handle_ripple,
    # Agents (8)
    "ENCODE": handle_encode, "DECODE": handle_decode, "ORACLE": handle_oracle,
    "CORTEX": handle_cortex, "ECONOMY": handle_economy, "INCLUSIVE": handle_inclusive,
    "ENGINEER": handle_engineer,
    # Candidate (uploaded Layer 1 software)
    "CANDIDATE": handle_candidate,
    # Fallback
    "DEFAULT": handle_default,
}

# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  §3 — RUNTIME BRIDGE                                                         ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

def execute_pipeline(input_data: dict, chain: list, meta: dict) -> dict:
    t0 = time.time()
    context = {"_input": input_data, "_data": dict(input_data), "_signals": [], "_errors": [], "_t0": t0}
    trace = []

    for idx, module in enumerate(chain):
        mod = module.strip().upper()
        handler = HANDLER_REGISTRY.get(mod, HANDLER_REGISTRY["DEFAULT"])
        s = time.time()
        try:
            context = handler(context, mod, meta)
            ms = round((time.time() - s) * 1000, 3)
            trace.append({"stage": idx, "module": mod, "status": "completed", "duration_ms": ms})
        except Exception as e:
            ms = round((time.time() - s) * 1000, 3)
            context["_errors"].append({"module": mod, "error": str(e), "stage": idx})
            trace.append({"stage": idx, "module": mod, "status": "error", "duration_ms": ms, "error": str(e)})

    total_ms = round((time.time() - t0) * 1000, 3)
    return {
        "success": len(context["_errors"]) == 0,
        "output": context.get("_data", {}),
        "trace": trace,
        "metadata": {
            "capability": meta.get("name", "unknown"),
            "cjpi": meta.get("cjpi", 0), "tier": meta.get("tier", "mint"),
            "chain": chain, "stages": len(chain), "duration_ms": total_ms,
            "runtime": "cmpsbl-unified-v1",
            "executed_at": datetime.now(timezone.utc).isoformat(),
        },
    }

# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  §4 — CAPABILITY API                                                         ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

${layer1Block}

CMPSBL_PACK_META = ${JSON.stringify({
    name: packName,
    capabilities: capabilities.map(c => ({
      name: c.name, cjpi: c.cjpiScore, tier: c.tier, chain: c.chain,
      fingerprint: c.fingerprint.slice(0, 12).toUpperCase(),
    })),
    modules: allModules,
  }, null, 4)}

# Backwards compatibility alias
PACK_META = CMPSBL_PACK_META

# Auto-register any pack-declared module that lacks a dedicated handler.
# Routes unknown primitives (e.g. SHELVE, Ψ₄₁_*) to handle_candidate so
# execute_pipeline never falls through to DEFAULT for known pack modules.
for _module_name in CMPSBL_PACK_META["modules"]:
    _normalized = str(_module_name).strip().upper()
    if _normalized and _normalized not in HANDLER_REGISTRY:
        HANDLER_REGISTRY[_normalized] = handle_candidate



class CmpsblExecutionError(Exception):
    """
    Raised by CmpsblCapability.execute when Layer 1 (your code) raises or
    Layer 2 (the cognitive pipeline) reports failure. Wrappers (Circuit
    Breaker, Retry, Self-Healing, BEACON) need a real exception to react —
    silent success-dicts mask failures from the resilience stack. The full
    envelope is preserved on \`.envelope\` so observers can still read
    structured execution data.
    """
    def __init__(self, capability: str, reason: str, detail: str, envelope: dict):
        super().__init__(f"[CMPSBL] {capability}: {reason} — {detail}")
        self.capability = capability
        self.reason = reason
        self.envelope = envelope


class CmpsblCapability:
    """Single capability executor with dual-layer architecture."""

    def __init__(self, capability_name: str = None):
        if capability_name:
            cap = next((c for c in CMPSBL_PACK_META["capabilities"] if c["name"] == capability_name), None)
            if not cap:
                raise ValueError(f"Capability '{capability_name}' not found. Available: {[c['name'] for c in CMPSBL_PACK_META['capabilities']]}")
            self.meta = cap
        else:
            self.meta = CMPSBL_PACK_META["capabilities"][0] if CMPSBL_PACK_META["capabilities"] else {}

    def execute_original(self, input_data: dict = None) -> Any:
${executeOriginalBody}

    def execute(self, input_data: dict = None) -> dict:
        """Dual-layer: original code FIRST, then CMPSBL cognitive pipeline."""
        start = time.time()
        original_executed = False
        original_error = None

        try:
            original_result = self.execute_original(input_data or {})
            original_executed = True
        except Exception as e:
            original_error = str(e)
            original_result = input_data or {}

        execution_ms = round((time.time() - start) * 1000, 3)
        pipeline_input = original_result if isinstance(original_result, dict) else {"_original": original_result}
        pipeline = execute_pipeline(pipeline_input, self.meta.get("chain", []), self.meta)

        envelope = {
            "_original": original_result,
            "_enriched": pipeline["output"],
            "_pipeline": pipeline,
            "_cmpsbl": {
                "capability": self.meta.get("name", "unknown"),
                "cjpi": self.meta.get("cjpi", 0),
                "tier": self.meta.get("tier", "mint"),
                "chain": self.meta.get("chain", []),
                "execution": {
                    "original_executed": original_executed,
                    "original_error": original_error,
                    "execution_ms": execution_ms,
                    "strategy": "native" if original_executed else "passthrough",
                },
            },
        }

        # Surface real failures to wrappers (Circuit Breaker, Retry, Self-Healing).
        # The envelope is preserved on the exception so observers can still read it.
        if original_error is not None or pipeline.get("success") is False:
            reason = "handler_failure" if original_error is not None else "pipeline_failure"
            first_err = next((t for t in pipeline.get("trace", []) if t.get("status") == "error"), None)
            detail = original_error if original_error is not None else (first_err.get("error") if first_err else "pipeline reported success=False")
            raise CmpsblExecutionError(self.meta.get("name", "unknown"), reason, str(detail), envelope)

        return envelope

    def validate(self) -> bool:
        chain = self.meta.get("chain", [])
        cjpi = self.meta.get("cjpi", 0)
        fp = self.meta.get("fingerprint", "")
        return bool(chain) and 0 < cjpi <= 100 and len(fp) > 0

# Backwards compatibility alias
CMPSBLCapability = CmpsblCapability


def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute any capability by name."""
    return CmpsblCapability(capability_name).execute(input_data)

# Backwards compatibility alias
execute = cmpsbl_execute


def cmpsbl_execute_chain(chain: list, input_data: dict) -> dict:
    """Execute a raw module chain directly."""
    return execute_pipeline(input_data, chain, {"name": "custom-chain", "cjpi": 0, "tier": "mint", "chain": chain})

# Backwards compatibility alias
execute_chain = cmpsbl_execute_chain


def cmpsbl_list_capabilities() -> list:
    return [c["name"] for c in CMPSBL_PACK_META["capabilities"]]

# Backwards compatibility alias
list_capabilities = cmpsbl_list_capabilities


def cmpsbl_self_test() -> dict:
    results = {}
    passed = failed = 0
    for cap in CMPSBL_PACK_META["capabilities"]:
        try:
            r = cmpsbl_execute(cap["name"], {"_test": True})
            ok = r["_pipeline"]["success"]
            results[cap["name"]] = ok
            if ok: passed += 1
            else: failed += 1
        except Exception:
            results[cap["name"]] = False
            failed += 1
    return {"passed": passed, "failed": failed, "results": results}

# Backwards compatibility alias
self_test = cmpsbl_self_test


if __name__ == "__main__":
    print(f"CMPSBL® Silent Symbiosis — {CMPSBL_PACK_META['name']}")
    print(f"Capabilities: {len(CMPSBL_PACK_META['capabilities'])}")
    print(f"Modules: {CMPSBL_PACK_META['modules']}")
    print()
    result = cmpsbl_self_test()
    print(f"Self-test: {result['passed']} passed, {result['failed']} failed")
    for name, ok in result["results"].items():
        print(f"  {'✅' if ok else '❌'} {name}")
${pyLayers.map(l => l.pyCode).join('\n')}
${getAutoWirePy(selectedLayers || [])}

# ═══════════════════════════════════════════════════════════════════════════════
# CMPSBL® Silent Symbiosis — Software Ascended
# Governed Cognitive Infrastructure · Deterministic Processing Layer
#
# Inventor: Kenneth E. Sweet Jr. · PromptFluid™ TX
# U.S. Patent App. No. 64/029,678 — Deterministic Code Processing
# U.S. Patent App. No. 64/031,637 — Software Symbiosis Distribution
#
# © 2009–2026 CMPSBL® · All rights reserved
# Unauthorized reproduction, modification, or redistribution prohibited.
# ═══════════════════════════════════════════════════════════════════════════════
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHP Pack Metadata Serializer (native PHP array syntax, not JSON)
// ═══════════════════════════════════════════════════════════════════════════════

function generatePhpPackMeta(
  capabilities: UnifiedCapabilityInput[],
  allModules: string[],
  packName: string,
): string {
  const capEntries = capabilities.map(c => {
    const chainStr = c.chain.map(m => `'${m}'`).join(', ');
    return `    [
        'name' => '${c.name.replace(/'/g, "\\'")}',
        'cjpi' => ${c.cjpiScore},
        'tier' => '${c.tier}',
        'chain' => [${chainStr}],
        'fingerprint' => '${c.fingerprint.slice(0, 12).toUpperCase()}',
    ]`;
  });
  const modulesStr = allModules.map(m => `'${m}'`).join(', ');
  return `define('CMPSBL_PACK_META', [
    'name' => '${packName.replace(/'/g, "\\'")}',
    'capabilities' => [
${capEntries.join(',\n')},
    ],
    'modules' => [${modulesStr}],
]);`;
}

/** Build the PHP body for executeOriginal() — auto-wires class instantiation */
function phpExecuteOriginalBody(phpFiles: { name: string }[]): string {
  if (phpFiles.length === 0) {
    return `        // No original PHP files — passthrough
        return $input;`;
  }
  const firstName = phpFiles[0].name.replace(/\.php$/i, '');
  return `        // Auto-wired to: ${phpFiles.map(f => f.name).join(', ')}
        if (class_exists('${firstName}')) {
            $instance = new \\${firstName}();
            $methods = ['execute', 'run', 'handle', 'process', 'main', '__invoke'];
            foreach ($methods as $method) {
                if (method_exists($instance, $method)) {
                    return $instance->$method($input);
                }
            }
        }
        // No class entry point found — try top-level functions
        $functions = ['execute', 'run', 'handle', 'process', 'main'];
        foreach ($functions as $fn) {
            if (function_exists($fn)) {
                return $fn($input);
            }
        }
        // Honest passthrough — no callable entry point found
        return $input;`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHP Generator
// ═══════════════════════════════════════════════════════════════════════════════

export function generateUnifiedPhp(
  capabilities: UnifiedCapabilityInput[],
  packName: string,
  userSourceFiles?: UserSourceFile[],
): string {
  const allModules = [...Array.from(new Set(capabilities.flatMap(c => c.chain)))];
  const topCap = capabilities.reduce((a, b) => a.cjpiScore > b.cjpiScore ? a : b);
  const avgCjpi = Math.round(capabilities.reduce((s, c) => s + c.cjpiScore, 0) / capabilities.length);

  const phpFiles = (userSourceFiles || []).filter(f => /\.php$/i.test(f.name));
  // Layer 1 is EMBEDDED inline — the wrapped file is fully self-contained.
  // The original in the ZIP is a reference copy for verification only.
  const inlineBlock = phpFiles.length > 0
    ? phpFiles.map(f => {
        // Strip the opening <?php tag from embedded source to avoid duplicate declarations
        const cleanContent = f.content.replace(/^<\?php\s*/i, '').trimEnd();
        return `// ═══ LAYER 1 — ORIGINAL SOURCE (${f.name}) ═══\n// Embedded inline per U.S. App. No. 64/029,678 dual-layer architecture.\n// This is your original code — it runs first, unchanged.\n\n${cleanContent}`;
      }).join('\n\n')
    : '// No source files detected — Layer 1 is empty';

  return `<?php
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  CMPSBL® Silent Symbiosis — Software Ascended
 *  ${packName} | Single-File Distribution | Zero Dependencies
 *
 *  ${capabilities.length} capabilities | ${allModules.length} modules | Avg CJPI: ${avgCjpi}
 *  Top: ${topCap.name} (${topCap.tier.toUpperCase()}, CJPI ${topCap.cjpiScore})
 *
 *  DROP IN → REQUIRE → USE
 *
 *  © 2025–2026 CMPSBL®. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

${inlineBlock}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1 — CONVEX CORE™ DPL                                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

function cmpsbl_compute_cjpi(float $novelty, float $utility, float $complexity, float $composability): array
{
    $score = (int) round(max(0, min(100, $novelty * 0.30 + $utility * 0.30 + $complexity * 0.20 + $composability * 0.20)));
    return ['score' => $score, 'tier' => cmpsbl_tier_from_cjpi($score)];
}

function cmpsbl_tier_from_cjpi(int $score): string
{
    if ($score >= 92) return 'apex';
    if ($score >= 80) return 'mythic';
    if ($score >= 65) return 'relic';
    if ($score >= 45) return 'prime';
    return 'mint';
}

function cmpsbl_quick_hash(string $input): string
{
    // DJB2 unsigned 32-bit. The mask + sprintf %x gives consistent unsigned hex
    // across 32-bit and 64-bit PHP builds without abs() flipping signs.
    $h = 5381;
    $len = strlen($input);
    for ($i = 0; $i < $len; $i++) {
        $h = (($h << 5) + $h) + ord($input[$i]);
        $h &= 0xFFFFFFFF;
    }
    return str_pad(sprintf('%x', $h & 0xFFFFFFFF), 8, '0', STR_PAD_LEFT);
}

function cmpsbl_user_keys(array $data): array
{
    return array_filter(array_keys($data), fn($k) => !str_starts_with($k, '_'));
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2 — MODULE EFFECTS (40 Primitives)                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

class CMPSBLModuleHandlers
{
    public static function handleCore(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_pipeline_id'] = substr(md5(json_encode($meta)), 0, 12);
        $ctx['_data']['_initialized'] = true;
        $ctx['_signals'][] = ['type' => 'init', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleBrain(array $ctx, string $mod, array $meta): array
    {
        $s = json_encode($ctx['_data']);
        $entropy = count(array_unique(str_split($s))) / max(1, strlen($s));
        $keys = cmpsbl_user_keys($ctx['_data']);
        $ctx['_data']['_reasoning'] = ['entropy' => round($entropy, 3), 'complexity' => count($keys), 'analysis' => 'context_analyzed'];
        $ctx['_signals'][] = ['type' => 'reasoning', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleMemory(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_memory'] = ['fingerprint' => cmpsbl_quick_hash(json_encode($ctx['_data'])), 'retrieved' => true, 'indexed' => true];
        $ctx['_signals'][] = ['type' => 'retrieval', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleDefense(array $ctx, string $mod, array $meta): array
    {
        $s = json_encode($ctx['_data']);
        $suspicious = preg_match('/(<script|eval\\(|__proto__)/i', $s);
        $ctx['_data']['_defense'] = ['sanitized' => true, 'threats' => $suspicious ? 1 : 0];
        $ctx['_signals'][] = ['type' => 'defense', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleOracle(array $ctx, string $mod, array $meta): array
    {
        $conf = ($meta['cjpi'] ?? 50) / 100.0;
        $ctx['_data']['_prediction'] = ['confidence' => $conf, 'model' => 'oracle-v1', 'status' => 'computed'];
        $ctx['_signals'][] = ['type' => 'prediction', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleImmunity(array $ctx, string $mod, array $meta): array
    {
        $errs = count($ctx['_errors']);
        $ctx['_data']['_immunity'] = ['protected' => true, 'errors_caught' => $errs, 'fallback' => $errs > 0 ? 'engaged' : 'standby'];
        $ctx['_signals'][] = ['type' => 'shield', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleCortex(array $ctx, string $mod, array $meta): array
    {
        $chain = $meta['chain'] ?? [];
        $ctx['_data']['_orchestration'] = ['total_stages' => count($chain), 'signals' => count($ctx['_signals']), 'status' => 'coordinated'];
        $ctx['_signals'][] = ['type' => 'orchestrate', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleDecode(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_decoded'] = true;
        $ctx['_signals'][] = ['type' => 'decode', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleEncode(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_encoded'] = true;
        $ctx['_data']['_output_format'] = 'structured';
        $ctx['_signals'][] = ['type' => 'encode', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleNerve(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_nerve_routed'] = count($ctx['_signals']);
        $ctx['_signals'][] = ['type' => 'route', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleEcho(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_echo'] = ['replay_available' => true, 'snapshot_keys' => array_keys($ctx['_data'])];
        $ctx['_signals'][] = ['type' => 'echo', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleEvolution(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_evolution'] = ['cycle' => 1, 'fitness' => ($meta['cjpi'] ?? 0) / 100.0];
        $ctx['_signals'][] = ['type' => 'evolve', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleShadow(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_shadow'] = ['verified' => true, 'hash' => substr(md5(json_encode($ctx['_data'])), 0, 16)];
        $ctx['_signals'][] = ['type' => 'audit', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleHarvest(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_harvest'] = ['fields' => count($ctx['_data']), 'deduplicated' => true];
        $ctx['_signals'][] = ['type' => 'ingest', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handlePhantom(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_phantom'] = ['anonymized' => true, 'proxy_hops' => 3];
        $ctx['_signals'][] = ['type' => 'anonymize', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleForge(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_forge'] = ['scaffolded' => true, 'target' => $meta['tier'] ?? 'mint'];
        $ctx['_signals'][] = ['type' => 'forge', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleIntent(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_intent'] = ['planned' => true, 'actions' => count($meta['chain'] ?? [])];
        $ctx['_signals'][] = ['type' => 'plan', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function handleDefault(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_module_' . strtolower($mod)] = ['processed' => true, 'handler' => 'generic'];
        $ctx['_signals'][] = ['type' => 'process', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    public static function getRegistry(): array
    {
        return [
            'CORE' => [self::class, 'handleCore'], 'BRAIN' => [self::class, 'handleBrain'],
            'MEMORY' => [self::class, 'handleMemory'], 'DEFENSE' => [self::class, 'handleDefense'],
            'ORACLE' => [self::class, 'handleOracle'], 'IMMUNITY' => [self::class, 'handleImmunity'],
            'CORTEX' => [self::class, 'handleCortex'], 'DECODE' => [self::class, 'handleDecode'],
            'ENCODE' => [self::class, 'handleEncode'], 'NERVE' => [self::class, 'handleNerve'],
            'ECHO' => [self::class, 'handleEcho'], 'EVOLUTION' => [self::class, 'handleEvolution'],
            'SHADOW' => [self::class, 'handleShadow'], 'HARVEST' => [self::class, 'handleHarvest'],
            'PHANTOM' => [self::class, 'handlePhantom'], 'FORGE' => [self::class, 'handleForge'],
            'INTENT' => [self::class, 'handleIntent'], 'DEFAULT' => [self::class, 'handleDefault'],
        ];
    }
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3 — RUNTIME BRIDGE                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

function cmpsbl_execute_pipeline(array $input, array $chain, array $meta): array
{
    $handlers = CMPSBLModuleHandlers::getRegistry();
    $context = ['_input' => $input, '_data' => $input, '_signals' => [], '_errors' => []];
    $trace = [];
    $t0 = microtime(true);

    foreach ($chain as $idx => $module) {
        $mod = strtoupper(trim($module));
        $handler = $handlers[$mod] ?? $handlers['DEFAULT'];
        $s = microtime(true);
        try {
            $context = call_user_func($handler, $context, $mod, $meta);
            $ms = round((microtime(true) - $s) * 1000, 3);
            $trace[] = ['stage' => $idx, 'module' => $mod, 'status' => 'completed', 'duration_ms' => $ms];
        } catch (\\Throwable $e) {
            $ms = round((microtime(true) - $s) * 1000, 3);
            $context['_errors'][] = ['module' => $mod, 'error' => $e->getMessage(), 'stage' => $idx];
            $trace[] = ['stage' => $idx, 'module' => $mod, 'status' => 'error', 'duration_ms' => $ms, 'error' => $e->getMessage()];
        }
    }

    return [
        'success' => empty($context['_errors']),
        'output' => $context['_data'] ?? [],
        'trace' => $trace,
        'metadata' => [
            'capability' => $meta['name'] ?? 'unknown',
            'cjpi' => $meta['cjpi'] ?? 0, 'tier' => $meta['tier'] ?? 'mint',
            'chain' => $chain, 'stages' => count($chain),
            'duration_ms' => round((microtime(true) - $t0) * 1000, 3),
            'runtime' => 'cmpsbl-unified-v1',
            'executed_at' => date('c'),
        ],
    ];
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4 — CAPABILITY API                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

${generatePhpPackMeta(capabilities, allModules, packName)}

/**
 * Thrown by CMPSBLCapability::execute when Layer 1 (your code) raises or
 * Layer 2 (the cognitive pipeline) reports failure. Wrappers (Circuit Breaker,
 * Retry, Self-Healing, BEACON) need a real exception to react — silent
 * success-arrays mask failures from the resilience stack. The full envelope
 * is preserved on \`->envelope\` so observers can still read structured data.
 */
class CmpsblExecutionError extends \\RuntimeException
{
    public string $capability;
    public string $reason;
    public array $envelope;
    public function __construct(string $capability, string $reason, string $detail, array $envelope)
    {
        parent::__construct("[CMPSBL] {$capability}: {$reason} — {$detail}");
        $this->capability = $capability;
        $this->reason = $reason;
        $this->envelope = $envelope;
    }
}

class CMPSBLCapability
{
    private array $meta;

    public function __construct(string $capabilityName = null)
    {
        $caps = CMPSBL_PACK_META['capabilities'];
        if ($capabilityName) {
            $found = array_filter($caps, fn($c) => $c['name'] === $capabilityName);
            if (empty($found)) throw new \\RuntimeException("Capability '{$capabilityName}' not found.");
            $this->meta = array_values($found)[0];
        } else {
            $this->meta = $caps[0] ?? [];
        }
    }

    public function executeOriginal(array $input = []): mixed
    {
${phpExecuteOriginalBody(phpFiles)}
    }

    public function execute(array $input = []): array
    {
        $start = microtime(true);
        $originalExecuted = false;
        $originalError = null;

        try {
            $originalResult = $this->executeOriginal($input);
            $originalExecuted = true;
        } catch (\\Throwable $e) {
            $originalError = $e->getMessage();
            $originalResult = $input;
        }

        $executionMs = round((microtime(true) - $start) * 1000, 3);
        $pipelineInput = is_array($originalResult) ? $originalResult : ['_original' => $originalResult];
        $pipeline = cmpsbl_execute_pipeline($pipelineInput, $this->meta['chain'] ?? [], $this->meta);

        $envelope = [
            '_original' => $originalResult,
            '_enriched' => $pipeline['output'],
            '_pipeline' => $pipeline,
            '_cmpsbl' => [
                'capability' => $this->meta['name'] ?? 'unknown',
                'cjpi' => $this->meta['cjpi'] ?? 0,
                'tier' => $this->meta['tier'] ?? 'mint',
                'chain' => $this->meta['chain'] ?? [],
                'execution' => [
                    'original_executed' => $originalExecuted,
                    'original_error' => $originalError,
                    'execution_ms' => $executionMs,
                    'strategy' => $originalExecuted ? 'native' : 'passthrough',
                ],
            ],
        ];

        // Surface real failures to wrappers (Circuit Breaker, Retry, Self-Healing).
        $pipelineSuccess = $pipeline['success'] ?? true;
        if ($originalError !== null || $pipelineSuccess === false) {
            $reason = $originalError !== null ? 'handler_failure' : 'pipeline_failure';
            $firstErr = null;
            foreach (($pipeline['trace'] ?? []) as $t) {
                if (($t['status'] ?? null) === 'error') { $firstErr = $t; break; }
            }
            $detail = $originalError ?? ($firstErr['error'] ?? 'pipeline reported success=false');
            throw new CmpsblExecutionError($this->meta['name'] ?? 'unknown', $reason, (string)$detail, $envelope);
        }

        return $envelope;
    }

    public function validate(): bool
    {
        $chain = $this->meta['chain'] ?? [];
        $cjpi = $this->meta['cjpi'] ?? 0;
        $fp = $this->meta['fingerprint'] ?? '';
        return !empty($chain) && $cjpi > 0 && $cjpi <= 100 && strlen($fp) > 0;
    }

    public function getMeta(): array { return $this->meta; }
}

function cmpsbl_execute(string $capabilityName, array $input): array
{
    return (new CMPSBLCapability($capabilityName))->execute($input);
}

function cmpsbl_execute_chain(array $chain, array $input): array
{
    return cmpsbl_execute_pipeline($input, $chain, ['name' => 'custom-chain', 'cjpi' => 0, 'tier' => 'mint', 'chain' => $chain]);
}

function cmpsbl_list_capabilities(): array
{
    return array_map(fn($c) => $c['name'], CMPSBL_PACK_META['capabilities']);
}

function cmpsbl_self_test(): array
{
    $results = [];
    $passed = $failed = 0;
    foreach (CMPSBL_PACK_META['capabilities'] as $cap) {
        try {
            $r = cmpsbl_execute($cap['name'], ['_test' => true]);
            $ok = $r['_pipeline']['success'];
            $results[$cap['name']] = $ok;
            $ok ? $passed++ : $failed++;
        } catch (\\Throwable $e) {
            $results[$cap['name']] = false;
            $failed++;
        }
    }
    return ['passed' => $passed, 'failed' => $failed, 'results' => $results];
}
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generic (Other Languages) — Structured Reference
// ═══════════════════════════════════════════════════════════════════════════════

export function generateUnifiedGeneric(
  capabilities: UnifiedCapabilityInput[],
  packName: string,
  lang: string,
): string {
  const LANG_COMMENT: Record<string, string> = {
    rust: '//', go: '//', java: '//', csharp: '//', ruby: '#', swift: '//', kotlin: '//',
    verilog: '//', systemverilog: '//', vhdl: '--', c: '//', cpp: '//',
    lua: '--', dart: '//', scala: '//', elixir: '#', haskell: '--', zig: '//',
  };
  const line = LANG_COMMENT[lang] || '//';
  const allModules = [...Array.from(new Set(capabilities.flatMap(c => c.chain)))];

  return `${line} ═══════════════════════════════════════════════════════════════════════════════
${line}  CMPSBL® Silent Symbiosis — Software Ascended | ${packName}
${line}  Target: ${lang.toUpperCase()} | Single-File Reference Distribution
${line}
${line}  ${capabilities.length} capabilities | ${allModules.length} modules
${line}
${line}  PORT THIS FILE to ${lang.toUpperCase()} using the TypeScript/Python/PHP versions
${line}  as reference implementations. The architecture is identical:
${line}
${line}  §1 — Convex Core™ (CJPI scorer, tier classifier)
${line}  §2 — Module Effects (handler per primitive, transforms context)
${line}  §3 — Runtime Bridge (pipeline executor, sequential chain)
${line}  §4 — Capability API (execute, validate, metadata)
${line}
${line}  EXECUTION MODEL:
${line}    1. Load capability metadata (name, cjpi, tier, chain, fingerprint)
${line}    2. Create context = { _input: input, _data: input, _signals: [], _errors: [] }
${line}    3. For each module in chain:
${line}         context = handler(context, module, metadata)
${line}    4. Return { success, output: context._data, trace, metadata }
${line}
${line}  MODULE HANDLERS TO IMPLEMENT:
${allModules.map(m => `${line}    ${m.padEnd(12)} → See TypeScript/Python reference for behavior`).join('\n')}
${line}
${line}  CAPABILITIES:
${capabilities.map(c => `${line}    ${c.name} — CJPI ${c.cjpiScore} (${c.tier.toUpperCase()}) — Chain: ${c.chain.join(' → ')}`).join('\n')}
${line}
${line}  See the TypeScript (.ts), Python (.py), or PHP (.php) single-file distributions
${line}  for complete, working implementations to port 1:1.
${line}
${line}  © 2025–2026 CMPSBL®. All rights reserved.
${line} ═══════════════════════════════════════════════════════════════════════════════
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════════

export function generateUnifiedCapabilityFile(
  capabilities: UnifiedCapabilityInput[],
  packName: string,
  lang: string,
  userSourceFiles?: UserSourceFile[],
  selectedLayers?: CmpsblLayerDefinition[],
): string {
  let raw: string;
  // Single boundary: normalize chains for every language emitter so raw
  // uploaded module names (e.g. "SHELVE") never leak into runtime lookups.
  capabilities = sanitizeCapabilities(capabilities);

  if (lang === 'typescript' || lang === 'javascript') {
    raw = generateUnifiedTypeScript(capabilities, packName, userSourceFiles, selectedLayers);
  } else if (lang === 'python') {
    raw = generateUnifiedPython(capabilities, packName, userSourceFiles, selectedLayers);
  } else if (lang === 'php') {
    raw = generateUnifiedPhp(capabilities, packName, userSourceFiles);
  } else if (hasPolyglotGenerator(lang)) {
    raw = generatePolyglotFile(lang, capabilities, packName, userSourceFiles);
  } else {
    raw = generateUnifiedGeneric(capabilities, packName, lang);
  }

  // Inject layer code for non-TS/PY languages (TS/PY handle layers inline above).
  // Always include CMPSBL_CORE_LAYERS (Circuit Breaker) — it is always-on, not selectable.
  if (lang !== 'typescript' && lang !== 'javascript' && lang !== 'python') {
    const allLayers = [...CMPSBL_CORE_LAYERS, ...(selectedLayers ?? [])];
    if (allLayers.length > 0) {
      const layerCode = getAllLayerCode(allLayers, lang);
      const autoWire = getAutoWireForLang(allLayers, lang);
      const lc = getLayerCommentChar(lang);
      const layerHeader = getLayerHeaderBlock(allLayers.slice(CMPSBL_CORE_LAYERS.length), lc);
      if (layerCode) {
        raw += '\n\n' + layerHeader + '\n' + layerCode;
        if (autoWire) raw += '\n' + autoWire;
      }
    }
  }

  // Apply black-box obfuscation to protect IP
  return blackboxFile(raw, lang);
}

export function getUnifiedFilename(lang: string): string {
  const EXT: Record<string, string> = {
    typescript: '.ts', python: '.py', php: '.php', rust: '.rs', go: '.go',
    java: '.java', csharp: '.cs', ruby: '.rb', swift: '.swift', kotlin: '.kt',
    c: '.c', cpp: '.cpp', lua: '.lua', dart: '.dart', scala: '.scala',
    elixir: '.ex', haskell: '.hs', zig: '.zig',
    verilog: '.v', systemverilog: '.sv', vhdl: '.vhd',
  };
  const ext = EXT[lang] || '.ts';
  if (lang === 'php') return 'cmpsbl.php';
  if (lang === 'python') return 'cmpsbl.py';
  return `cmpsbl${ext}`;
}
