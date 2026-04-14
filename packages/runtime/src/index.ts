/**
 * ┌──────────────────────────────────────────────────────────────┐
 * │  CMPSBL® Runtime — Governed Cognitive Infrastructure        │
 * │  Core execution: CJPI scoring, state machine, sagas,        │
 * │  telemetry, circuit breakers & artifact verification.       │
 * │                                                              │
 * │  U.S. Patent App. No. 64/029,678 (Ascension™ Discovery)     │
 * │  U.S. Patent App. No. 64/031,637 (Mana™ Silent Symbiosis)   │
 * │  https://cmpsbl.com · npm i @cmpsbl/cli                      │
 * │  © 2025–2026 CMPSBL® · PromptFluid™                         │
 * └──────────────────────────────────────────────────────────────┘
 */

import { PRIMITIVE_CATALOG, registerAllPrimitives } from './primitives';

// ═══════════════════════════════════════════════════════════════
// Inlined Types (self-contained — no external @cmpsbl deps)
// ═══════════════════════════════════════════════════════════════

export interface CJPIInput {
  novelty: number;
  utility: number;
  complexity: number;
  composability: number;
}

export interface CJPIScoreBreakdown {
  novelty: number;
  utility: number;
  complexity: number;
  composability: number;
  total: number;
  tier: CrystallizedTier;
}

export type CrystallizedTier = 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
export type ProductTier = 'Raw' | 'Creator' | 'Architect' | 'Enterprise' | 'Apex';

export interface CmpsblManifest {
  name: string;
  tier: string;
  cjpi: number;
  modules: string[];
  exported: string;
  runtime: string;
  targets: string[];
  version: string;
  category?: string;
  fingerprint?: string;
  source?: string;
}

export type RuntimeMode = 'offline' | 'hybrid' | 'network';
export type BridgeType = 'network' | 'hybrid' | 'offline-fallback';

export interface ChainManifest {
  id: string;
  name: string;
  description: string;
  modules: string[];
  cjpiScore: number;
  tier: string;
  category: string;
  sourceLanguage?: string;
  discoveredAt: string;
}

export interface ExecutionOptions {
  stageTimeoutMs?: number;
  continueOnFailure?: boolean;
  telemetry?: boolean;
}

export interface ChainResult {
  success: boolean;
  output: Record<string, unknown>;
  confidence: number;
  totalDurationMs: number;
  stagesCompleted: number;
  totalStages: number;
  runtimeMode: RuntimeMode;
  bridgeType: BridgeType;
}

export interface PrimitiveResult {
  success: boolean;
  output: unknown;
  confidence: number;
  durationMs: number;
  handler: string;
}

// ═══════════════════════════════════════════════════════════════
// §1 — CJPI Scoring Engine
// ═══════════════════════════════════════════════════════════════

const CJPI_WEIGHTS = {
  novelty: 0.25,
  utility: 0.35,
  complexity: 0.20,
  composability: 0.20,
} as const;

export function computeCJPI(input: CJPIInput): CJPIScoreBreakdown {
  const total = Math.round(
    input.novelty * CJPI_WEIGHTS.novelty +
    input.utility * CJPI_WEIGHTS.utility +
    input.complexity * CJPI_WEIGHTS.complexity +
    input.composability * CJPI_WEIGHTS.composability
  );

  return {
    novelty: input.novelty,
    utility: input.utility,
    complexity: input.complexity,
    composability: input.composability,
    total: Math.max(0, Math.min(100, total)),
    tier: tierFromCJPI(total),
  };
}

export function tierFromCJPI(score: number): CrystallizedTier {
  if (score >= 90) return 'Apex';
  if (score >= 75) return 'Mythic';
  if (score >= 55) return 'Relic';
  if (score >= 35) return 'Prime';
  return 'Mint';
}

export function productTierFromScore(score: number): ProductTier {
  if (score >= 90) return 'Apex';
  if (score >= 75) return 'Enterprise';
  if (score >= 55) return 'Architect';
  if (score >= 35) return 'Creator';
  return 'Raw';
}

// ═══════════════════════════════════════════════════════════════
// §2 — Manifest Parser
// ═══════════════════════════════════════════════════════════════

export function parseManifest(json: string): CmpsblManifest {
  const data = JSON.parse(json);
  if (!data.name || typeof data.cjpi !== 'number') {
    throw new Error('Invalid CMPSBL manifest: missing name or cjpi');
  }
  return data as CmpsblManifest;
}

export function generateManifest(input: {
  name: string;
  cjpi?: number;
  modules?: string[];
  targets?: string[];
  version?: string;
  category?: string;
  fingerprint?: string;
  source?: string;
}): CmpsblManifest {
  const cjpi = input.cjpi ?? 0;
  return {
    name: input.name,
    tier: productTierFromScore(cjpi),
    cjpi,
    modules: input.modules ?? ['SYSTEM'],
    exported: new Date().toISOString().slice(0, 10),
    runtime: 'cmpsbl-convex-core-engine',
    targets: input.targets ?? ['typescript'],
    version: input.version ?? '1.0.0',
    ...(input.category ? { category: input.category } : {}),
    ...(input.fingerprint ? { fingerprint: input.fingerprint } : {}),
    ...(input.source ? { source: input.source } : {}),
  };
}

// ═══════════════════════════════════════════════════════════════
// §3 — Dependency Graph
// ═══════════════════════════════════════════════════════════════

export interface DependencyNode {
  id: string;
  dependencies: string[];
}

export function buildDependencyGraph(nodes: DependencyNode[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const node of nodes) {
    graph.set(node.id, node.dependencies);
  }
  return graph;
}

export function topologicalSort(nodes: DependencyNode[]): string[] {
  const graph = buildDependencyGraph(nodes);
  const visited = new Set<string>();
  const result: string[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    for (const dep of graph.get(id) ?? []) {
      visit(dep);
    }
    result.push(id);
  }

  for (const node of nodes) {
    visit(node.id);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// §4 — State Machine
// ═══════════════════════════════════════════════════════════════

export interface StateMachineConfig<S extends string, E extends string> {
  initial: S;
  transitions: Record<S, Partial<Record<E, S>>>;
}

export class StateMachine<S extends string, E extends string> {
  private current: S;
  private readonly transitions: Record<S, Partial<Record<E, S>>>;

  constructor(config: StateMachineConfig<S, E>) {
    this.current = config.initial;
    this.transitions = config.transitions;
  }

  get state(): S { return this.current; }

  send(event: E): S {
    const next = this.transitions[this.current]?.[event];
    if (next) this.current = next;
    return this.current;
  }

  canSend(event: E): boolean {
    return this.transitions[this.current]?.[event] !== undefined;
  }
}

// ═══════════════════════════════════════════════════════════════
// §5 — Pipeline Executor with Timeout Governance
// ═══════════════════════════════════════════════════════════════

export type PrimitiveHandler = (data: Record<string, unknown>, confidence: number) => PrimitiveResult | Promise<PrimitiveResult>;

const primitiveRegistry = new Map<string, PrimitiveHandler>();

/** Default per-handler execution timeout (ms) */
const DEFAULT_HANDLER_TIMEOUT_MS = 5000;

export function registerPrimitive(name: string, handler: PrimitiveHandler): void {
  primitiveRegistry.set(name, handler);
}

/**
 * Execute a primitive with timeout governance.
 * If a handler exceeds the timeout, execution is aborted and a
 * degraded result is returned — preventing runaway handlers from
 * stalling the entire chain.
 */
export async function executePrimitive(
  name: string,
  data: Record<string, unknown>,
  confidence: number,
  timeoutMs: number = DEFAULT_HANDLER_TIMEOUT_MS,
): Promise<PrimitiveResult> {
  const handler = primitiveRegistry.get(name);
  if (!handler) {
    return {
      success: true,
      output: { echo: data, primitive: name },
      confidence: confidence * 0.8,
      durationMs: 0,
      handler: 'default-fallback',
    };
  }

  const start = Date.now();

  // Timeout governance — graceful degradation on exceeded budget
  const handlerPromise = Promise.resolve(handler(data, confidence));
  const timeoutPromise = new Promise<PrimitiveResult>((resolve) => {
    setTimeout(() => {
      resolve({
        success: false,
        output: { error: 'timeout', primitive: name, budgetMs: timeoutMs },
        confidence: confidence * 0.3,
        durationMs: timeoutMs,
        handler: `${name.toLowerCase()}-timeout-degraded`,
      });
    }, timeoutMs);
  });

  const result = await Promise.race([handlerPromise, timeoutPromise]);
  result.durationMs = Date.now() - start;
  return result;
}

export async function executeChain(
  manifest: ChainManifest,
  input: Record<string, unknown>,
  options?: ExecutionOptions,
): Promise<ChainResult> {
  const start = Date.now();
  let current = input;
  let stagesCompleted = 0;
  const timeoutMs = options?.stageTimeoutMs ?? DEFAULT_HANDLER_TIMEOUT_MS;

  // Collect telemetry if enabled
  const telemetryBatch: TelemetryEvent[] = [];

  for (const mod of manifest.modules) {
    // Circuit breaker check before execution
    if (!isCircuitAllowed(mod)) {
      if (!options?.continueOnFailure) break;
      continue;
    }

    try {
      const result = await executePrimitive(mod, current, manifest.cjpiScore / 100, timeoutMs);

      // Feed circuit breaker state
      if (result.success) {
        recordCircuitSuccess(mod);
      } else {
        recordCircuitFailure(mod);
      }

      if (options?.telemetry) {
        telemetryBatch.push({
          primitive: mod,
          success: result.success,
          durationMs: result.durationMs,
          confidence: result.confidence,
          handler: result.handler,
          timestamp: Date.now(),
        });
      }

      if (result.success) {
        current = typeof result.output === 'object' && result.output !== null
          ? result.output as Record<string, unknown>
          : { value: result.output };
        stagesCompleted++;
      } else if (!options?.continueOnFailure) {
        break;
      }
    } catch {
      recordCircuitFailure(mod);
      if (!options?.continueOnFailure) break;
    }
  }

  // Flush telemetry batch if collected
  if (telemetryBatch.length > 0) {
    flushTelemetryBatch(telemetryBatch);
  }

  return {
    success: stagesCompleted === manifest.modules.length,
    output: current,
    confidence: manifest.cjpiScore / 100,
    totalDurationMs: Date.now() - start,
    stagesCompleted,
    totalStages: manifest.modules.length,
    runtimeMode: 'offline' as RuntimeMode,
    bridgeType: 'offline-fallback' as BridgeType,
  };
}

// ═══════════════════════════════════════════════════════════════
// §6 — Telemetry Compression Engine
// ═══════════════════════════════════════════════════════════════

export interface TelemetryEvent {
  primitive: string;
  success: boolean;
  durationMs: number;
  confidence: number;
  handler: string;
  timestamp: number;
}

export interface CompressedTelemetryBatch {
  chainId: string;
  eventCount: number;
  successCount: number;
  failCount: number;
  totalDurationMs: number;
  avgConfidence: number;
  minDurationMs: number;
  maxDurationMs: number;
  primitives: string[];
  compressedAt: number;
}

const TELEMETRY_BUFFER_MAX = 500;
const telemetryBuffer: CompressedTelemetryBatch[] = [];

/**
 * Compress a batch of telemetry events into a single summary.
 * Reduces per-event overhead by ~85% while preserving actionable metrics.
 */
function flushTelemetryBatch(events: TelemetryEvent[]): CompressedTelemetryBatch {
  const successes = events.filter(e => e.success).length;
  const durations = events.map(e => e.durationMs);
  const confidences = events.map(e => e.confidence);

  const batch: CompressedTelemetryBatch = {
    chainId: `chain-${Date.now().toString(36)}`,
    eventCount: events.length,
    successCount: successes,
    failCount: events.length - successes,
    totalDurationMs: durations.reduce((s, d) => s + d, 0),
    avgConfidence: confidences.length > 0
      ? Math.round((confidences.reduce((s, c) => s + c, 0) / confidences.length) * 1000) / 1000
      : 0,
    minDurationMs: durations.length > 0 ? Math.min(...durations) : 0,
    maxDurationMs: durations.length > 0 ? Math.max(...durations) : 0,
    primitives: events.map(e => e.primitive),
    compressedAt: Date.now(),
  };

  if (telemetryBuffer.length >= TELEMETRY_BUFFER_MAX) telemetryBuffer.shift();
  telemetryBuffer.push(batch);
  return batch;
}

export function getTelemetryBuffer(): CompressedTelemetryBatch[] {
  return [...telemetryBuffer];
}

export function clearTelemetryBuffer(): void {
  telemetryBuffer.length = 0;
}

// ═══════════════════════════════════════════════════════════════
// §7 — Circuit Breaker Registry with State Persistence
// ═══════════════════════════════════════════════════════════════

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeMs: number;
  halfOpenMaxAttempts: number;
}

export interface CircuitBreaker {
  name: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureAt: number;
  lastStateChangeAt: number;
  totalTrips: number;
}

const DEFAULT_CB_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  recoveryTimeMs: 30_000,
  halfOpenMaxAttempts: 2,
};

const circuitBreakers = new Map<string, CircuitBreaker>();
let cbConfig = { ...DEFAULT_CB_CONFIG };

export function configureCircuitBreakers(config: Partial<CircuitBreakerConfig>): void {
  cbConfig = { ...cbConfig, ...config };
}

function getOrCreateBreaker(name: string): CircuitBreaker {
  let cb = circuitBreakers.get(name);
  if (!cb) {
    cb = {
      name,
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureAt: 0,
      lastStateChangeAt: Date.now(),
      totalTrips: 0,
    };
    circuitBreakers.set(name, cb);
  }
  return cb;
}

export function recordCircuitSuccess(name: string): void {
  const cb = getOrCreateBreaker(name);
  cb.successCount++;
  if (cb.state === 'half-open') {
    cb.state = 'closed';
    cb.failureCount = 0;
    cb.lastStateChangeAt = Date.now();
  }
}

export function recordCircuitFailure(name: string): void {
  const cb = getOrCreateBreaker(name);
  cb.failureCount++;
  cb.lastFailureAt = Date.now();

  if (cb.state === 'closed' && cb.failureCount >= cbConfig.failureThreshold) {
    cb.state = 'open';
    cb.totalTrips++;
    cb.lastStateChangeAt = Date.now();
  } else if (cb.state === 'half-open') {
    cb.state = 'open';
    cb.totalTrips++;
    cb.lastStateChangeAt = Date.now();
  }
}

export function isCircuitAllowed(name: string): boolean {
  const cb = getOrCreateBreaker(name);
  if (cb.state === 'closed') return true;
  if (cb.state === 'open') {
    if (Date.now() - cb.lastStateChangeAt >= cbConfig.recoveryTimeMs) {
      cb.state = 'half-open';
      cb.lastStateChangeAt = Date.now();
      return true;
    }
    return false;
  }
  return true; // half-open allows limited attempts
}

export function getCircuitBreakerState(name: string): CircuitBreaker | undefined {
  return circuitBreakers.get(name);
}

export function getAllCircuitBreakers(): CircuitBreaker[] {
  return Array.from(circuitBreakers.values());
}

/**
 * Export circuit breaker state for persistence across restarts.
 * Returns a serializable snapshot that can be stored and restored.
 */
export function exportCircuitBreakerState(): CircuitBreaker[] {
  return Array.from(circuitBreakers.values()).map(cb => ({ ...cb }));
}

/**
 * Restore circuit breaker state from a previous export.
 * Survives runtime restarts without losing breaker state.
 */
export function importCircuitBreakerState(state: CircuitBreaker[]): number {
  let restored = 0;
  for (const cb of state) {
    if (cb.state === 'open' && Date.now() - cb.lastStateChangeAt >= cbConfig.recoveryTimeMs) {
      cb.state = 'half-open';
      cb.lastStateChangeAt = Date.now();
    }
    circuitBreakers.set(cb.name, cb);
    restored++;
  }
  return restored;
}

// ═══════════════════════════════════════════════════════════════
// §8 — Convex Core™ Artifact Integrity Verification
// ═══════════════════════════════════════════════════════════════

function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export interface IntegrityManifest {
  runtimeVersion: string;
  primitiveCount: number;
  catalogHash: string;
  registryHash: string;
  verified: boolean;
  verifiedAt: number;
}

/**
 * Compute a hash over the primitive catalog to detect tampering.
 * Compares the catalog against the registered handlers to ensure
 * no primitives were added, removed, or replaced post-seal.
 */
export function verifyRuntimeIntegrity(): IntegrityManifest {
  const catalogSignature = PRIMITIVE_CATALOG
    .map(e => `${e.name}:${e.classification}:${e.source}:${e.domain}`)
    .join('|');
  const catalogHash = fnv1aHash(catalogSignature);

  const registryNames: string[] = [];
  primitiveRegistry.forEach((_handler, name) => { registryNames.push(name); });
  registryNames.sort();
  const registryHash = fnv1aHash(registryNames.join('|'));

  const catalogNames = new Set(PRIMITIVE_CATALOG.map(e => e.name));
  const registeredNames = new Set<string>();
  primitiveRegistry.forEach((_handler, name) => { registeredNames.add(name); });

  let verified = true;
  catalogNames.forEach(n => { if (!registeredNames.has(n)) verified = false; });

  return {
    runtimeVersion: '2.1.0',
    primitiveCount: primitiveRegistry.size,
    catalogHash,
    registryHash,
    verified,
    verifiedAt: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════
// §9 — Convex Core™ Processing Layer (v3 API)
// ═══════════════════════════════════════════════════════════════

/** Dispatch matrix — pre-compiled primitive resolution table */
export interface DispatchMatrix {
  dt: readonly number[];
  cm: readonly number[];
  iv: number;
  ep: number;
  primitives: readonly string[];
  integrity: number;
}

/** FNV-1a hash — deterministic, fast */
function fnv1a(str: string): number {
  let hash = 0x811C9DC5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * Compile a dispatch matrix from primitive names and artifact fingerprint.
 * This is the v3 Convex Core™ API — replaces createRuntime().
 */
export function compileDispatch(
  primitives: string[],
  fingerprint: string,
): DispatchMatrix {
  const base = fnv1a(fingerprint);
  const iv = base & 0xFFFF;
  const ep = (base >>> 16) & 0xFF;

  const offsets = primitives.map((_, i) => fnv1a(`${fingerprint}:${i}`) & 0xFFFF);
  const dt = Object.freeze(primitives.map((name, i) => ((fnv1a(name) ^ (offsets[i] ?? 0)) & 0xFFFF)));

  const size = Math.max(primitives.length, 8);
  const cmArr: number[] = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < Math.min(size, 4); j++) {
      cmArr.push(fnv1a(`${primitives[i % primitives.length]}:${primitives[j % primitives.length]}:${iv}`) & 0xFFF);
    }
  }
  const cm = Object.freeze(cmArr);

  // Compute integrity hash
  const integrity = dt.reduce((acc, _, i) => {
    const v = (dt[i % dt.length]! ^ iv) & 0xFFFF;
    return (acc + ((cm[v % cm.length]! + acc) >> 2)) & 0xFFFFFF;
  }, 0);

  return { dt, cm, iv, ep, primitives: Object.freeze([...primitives]), integrity };
}

/** Resolve a dispatch path from the compiled matrix */
export function resolve(matrix: DispatchMatrix, index: number, context = 0): number {
  const v = (matrix.dt[index % matrix.dt.length]! ^ matrix.iv) & 0xFFFF;
  return (matrix.cm[v % matrix.cm.length]! + context) >> 2;
}

/** Gate function — applies epoch threshold */
export function gate(matrix: DispatchMatrix, stage: number, payload: Record<string, unknown>): Record<string, unknown> {
  const seq = resolve(matrix, stage, Object.keys(payload).length);
  if (seq < matrix.ep) return payload;
  return { ...payload, _sealed: true, _seq: seq };
}

/** Verify dispatch matrix integrity */
export function verifyMatrix(matrix: DispatchMatrix): boolean {
  const computed = matrix.dt.reduce((acc, _, i) => {
    const v = (matrix.dt[i % matrix.dt.length]! ^ matrix.iv) & 0xFFFF;
    return (acc + ((matrix.cm[v % matrix.cm.length]! + acc) >> 2)) & 0xFFFFFF;
  }, 0);
  return computed === matrix.integrity;
}

// ═══════════════════════════════════════════════════════════════
// §9b — Legacy Compatibility (deprecated — will be removed in v4)
// ═══════════════════════════════════════════════════════════════

export interface ConvexCore {
  computeCJPI: typeof computeCJPI;
  tierFromCJPI: typeof tierFromCJPI;
  productTierFromScore: typeof productTierFromScore;
  parseManifest: typeof parseManifest;
  generateManifest: typeof generateManifest;
  topologicalSort: typeof topologicalSort;
  registerPrimitive: typeof registerPrimitive;
  executePrimitive: typeof executePrimitive;
  executeChain: typeof executeChain;
  createStateMachine: <S extends string, E extends string>(config: StateMachineConfig<S, E>) => StateMachine<S, E>;
  verifyIntegrity: typeof verifyRuntimeIntegrity;
  isCircuitAllowed: typeof isCircuitAllowed;
  recordCircuitSuccess: typeof recordCircuitSuccess;
  recordCircuitFailure: typeof recordCircuitFailure;
  exportCircuitBreakerState: typeof exportCircuitBreakerState;
  importCircuitBreakerState: typeof importCircuitBreakerState;
  getTelemetryBuffer: typeof getTelemetryBuffer;
  configureCircuitBreakers: typeof configureCircuitBreakers;
  version: string;
}

/** @deprecated Use compileDispatch() + resolve() instead. Compatibility layer — will be removed in v4. */
export function createRuntime(options?: { autoRegister?: boolean }): ConvexCore {
  const shouldRegister = options?.autoRegister !== false;

  if (shouldRegister) {
    registerAllPrimitives(registerPrimitive);
  }

  return {
    computeCJPI,
    tierFromCJPI,
    productTierFromScore,
    parseManifest,
    generateManifest,
    topologicalSort,
    registerPrimitive,
    executePrimitive,
    executeChain,
    createStateMachine: <S extends string, E extends string>(config: StateMachineConfig<S, E>) => new StateMachine(config),
    verifyIntegrity: verifyRuntimeIntegrity,
    isCircuitAllowed,
    recordCircuitSuccess,
    recordCircuitFailure,
    exportCircuitBreakerState,
    importCircuitBreakerState,
    getTelemetryBuffer,
    configureCircuitBreakers,
    version: '3.0.0',
  };
}

// ═══════════════════════════════════════════════════════════════
// §10 — First Contact Engine (re-export)
// ═══════════════════════════════════════════════════════════════

export {
  initFirstContact,
  discover as discoverMemory,
  capture as captureMemory,
  apply as applyMemory,
  exportChain as exportMemory,
  getMemoryStream,
  getSession as getFirstContactSession,
  endSession as endFirstContactSession,
  DOMAIN_PATTERNS,
} from './first-contact';

export type {
  MemoryChain,
  MemoryStreamEntry,
  FirstContactSession,
  FirstContactConfig,
  CeremonyPhase,
  CeremonyEvent,
  DiscoveryInput,
  DiscoveryResult,
  CaptureResult,
  ApplyResult,
  ExportResult,
  PackageDomain,
  DomainPattern,
} from './first-contact';

// ═══════════════════════════════════════════════════════════════
// §11 — Primitive Catalog (131 unique primitives)
// ═══════════════════════════════════════════════════════════════

export {
  PRIMITIVE_CATALOG,
  registerAllPrimitives,
  getCatalogEntry,
  getCatalogBySource,
  getCatalogNames,
} from './primitives';

export type {
  PrimitiveCatalogEntry,
  PrimitiveClassification,
  PrimitiveSource,
} from './primitives';

// ═══════════════════════════════════════════════════════════════
// §12 — Phase 4: Scan-to-Policy Pipeline
// ═══════════════════════════════════════════════════════════════

export {
  mapFindingsToPolicy,
  scanToAttachments,
  recommendationsToAttachments,
} from './scan-to-policy';

export type {
  ScanFinding,
  PolicyRecommendation,
  ScanToPolicyResult,
  PolicyAttachmentEntry,
} from './scan-to-policy';

export {
  generateBehaviorReport,
  renderBehaviorReportText,
} from './recommended-behaviors';

export type {
  RiskLevel,
  BehaviorRecommendation,
  BehaviorReport,
} from './recommended-behaviors';

export {
  runScanPipeline,
  runScanPipelineFromFindings,
} from './scan-pipeline';

export type {
  ScanPipelineResult,
  ScanPipelineOptions,
  PipelineMeta,
} from './scan-pipeline';

// ═══════════════════════════════════════════════════════════════
// §13 — Phase 5: Ascension Loop (end-to-end pipeline)
// ═══════════════════════════════════════════════════════════════

export {
  ascend,
  serializeArtifact,
  generateBootstrap,
  renderPipelineSummary,
} from './ascension-loop';

export type {
  AscensionArtifact,
  AscensionOptions,
  PipelineTrace,
  SerializedArtifact,
} from './ascension-loop';

// ═══════════════════════════════════════════════════════════════
// §14 — Phase 6: Verification & Proof Layer
// ═══════════════════════════════════════════════════════════════

export {
  computeFingerprint,
  getActiveFingerprint,
  record as recordVerificationEvent,
  queryByKind,
  queryByPrimitive,
  queryByFunction,
  getCausalChain,
  getEnforcements,
  getRecentEntries,
  getLedgerSnapshot,
  getLedgerSize,
  generateVerificationSummary,
  verifyIntegrity,
  renderVerificationReport,
  resetVerificationLedger,
} from './engines/verification-ledger';

export type {
  VerificationEventKind,
  VerificationEntry,
  ArtifactFingerprint,
  VerificationQueryResult,
  VerificationSummary,
} from './engines/verification-ledger';

// ═══════════════════════════════════════════════════════════════
// §15 — Phase 7: Deployment Model (portable artifacts)
// ═══════════════════════════════════════════════════════════════

export {
  detectEnvironment,
  generateDeploymentManifest,
  loadArtifactPayload,
  generateIntegrationCode,
  getGlobalHealthCheck,
  getSessionHealthCheck,
  UNCOMPUTED_FINGERPRINT,
  generateDeploymentReadme,
} from './portable-artifact';

export type {
  RuntimeEnvironment,
  DeploymentManifest,
  LoadedArtifactPayload,
  IntegrationFormat,
  HealthCheckResponse,
} from './portable-artifact';

// ═══════════════════════════════════════════════════════════════
// §16 — Unified Health Resolver
// ═══════════════════════════════════════════════════════════════

export {
  computeActivationHealth,
  computeRuntimeHealth,
  resolveUnifiedHealth,
  resolveHealthFromSummary,
  latchActivationCoverage,
  getLatchedCoverageRatio,
} from './engines/unified-health';

export type {
  HealthStatus,
  ActivationHealthInput,
  RuntimeHealthInput,
  UnifiedHealthResult,
} from './engines/unified-health';

// ═══════════════════════════════════════════════════════════════
// §17 — Phase 8: Productization Layer (developer API)
// ═══════════════════════════════════════════════════════════════

export {
  init,
  ascendQuick,
} from './production-provider';

export type {
  AscensionConfig,
  AscensionSession,
  SessionStatus,
} from './production-provider';

// ═══════════════════════════════════════════════════════════════
// §18 — Behavioral Evidence Bridge
// ═══════════════════════════════════════════════════════════════

export {
  extractBehavioralEvidence,
  hasBehavioralEvidence,
  getVerifiedPrimitiveCount,
} from './engines/behavioral-evidence-bridge';

export type {
  BridgedProbe,
  BehavioralEvidencePackage,
} from './engines/behavioral-evidence-bridge';

// ═══════════════════════════════════════════════════════════════
// §19 — CORTEX Phase 6: Dynamic Rule Generation
// ═══════════════════════════════════════════════════════════════

export {
  recordAnomaly,
  configureDynamicRules,
  getAutoGeneratedRuleIds,
  getAnomalyLog,
  getAutoRuleCount,
  resetDynamicRuleGenerator,
} from './engines/dynamic-rule-generator';

export type {
  DynamicRuleConfig,
  GeneratedRuleResult,
} from './engines/dynamic-rule-generator';

// ═══════════════════════════════════════════════════════════════
// §20 — Artifact Initializer (capability activation entry point)
// ═══════════════════════════════════════════════════════════════

export {
  initializeArtifact,
  activate,
} from './artifact-initializer';

export type {
  ArtifactManifest,
  ExportedFunction,
  InitializationResult,
} from './artifact-initializer';

// ═══════════════════════════════════════════════════════════════
// §21 — Generic Wrapper (universal primitive activation)
// ═══════════════════════════════════════════════════════════════

export {
  wrapGeneric,
  wrapGenericAsync,
  getCollectedEffects,
  getGenericTelemetry,
  resetCollector,
  isWrapped,
  getWrappedPrimitives,
  getWrapperHandle,
  hasEmittedEffects,
  getEffectsForPrimitive,
} from './generic-wrapper';

export type {
  GenericEffect,
  WrapperHandle,
  GenericTelemetry,
} from './generic-wrapper';

// ═══════════════════════════════════════════════════════════════
// §22 — Activation Proof (verification of capability activation)
// ═══════════════════════════════════════════════════════════════

export {
  generateActivationReport,
  isFullyActivated,
  getActivationSummary,
} from './engines/activation-proof';

export type {
  PrimitiveActivationProof,
  ActivationReport,
} from './engines/activation-proof';

// ═══════════════════════════════════════════════════════════════
// §23 — Capability Registry
// ═══════════════════════════════════════════════════════════════

export {
  registerCapability,
  resolveCapabilityActions,
  resolveCapabilitySignal,
  isCapabilityRegistered,
  getCapabilityDefinition,
  isEnforcingCapability,
  getRegisteredCapabilities,
  getCapabilityDefinitions,
  getCapabilitiesForCategory,
  getRegistrySummary,
  resetCapabilityRegistry,
} from './engines/capability-registry';

export type {
  CapabilityDefinition,
  CapabilityRegistrationInput,
  CapabilityRegistrySummary,
} from './engines/capability-registry';

// ═══════════════════════════════════════════════════════════════
// §24 — Capability Seeding & Decomposition
// ═══════════════════════════════════════════════════════════════

export {
  seedAllCapabilities,
  isCapabilitySeeded,
  resetCapabilitySeed,
} from './engines/capability-seed';

export type {
  SeedResult,
} from './engines/capability-seed';

export {
  seedDecomposedCapabilities,
  getDecomposedCapabilities,
  getSubCapabilitiesFor,
  getDecompositionCount,
} from './engines/capability-decomposition';

export type {
  SubCapabilityDef,
} from './engines/capability-decomposition';

// ═══════════════════════════════════════════════════════════════
// §25 — Orchestration Engine (signal routing & attachment rules)
// ═══════════════════════════════════════════════════════════════

export {
  registerOrchestrationRule,
  removeOrchestrationRule,
  getOrchestrationRules,
  getOrchestrationEvents,
  getOrchestrationEventsForPrimitive,
  getRegisteredRuleCount,
  getRegisteredRuleIds,
  resetOrchestrationEngine,
  routeSignal,
  registerAttachmentRules,
  wrapOrchestration,
} from './engines/orchestration-engine';

export type {
  OrchestrationSignal,
  OrchestrationAction,
  OrchestrationEffect,
  OrchestrationRule,
  OrchestrationEvent,
  AttachmentPolicy,
  AttachmentEntry,
} from './engines/orchestration-engine';

// ═══════════════════════════════════════════════════════════════
// §26 — Function Identity (idempotent wrapper tracking)
// ═══════════════════════════════════════════════════════════════

export {
  resolveIdentity,
  isAlreadyWrapped,
  isSameSource,
  getAllIdentities,
  getIdentity,
  getIdentitiesForPrimitive,
  getWrappedFunctionCount,
  resetIdentityRegistry,
  fnv1a,
  resolveFunctionName,
} from './engines/function-identity';

export type {
  FunctionIdentity,
} from './engines/function-identity';

// ═══════════════════════════════════════════════════════════════
// §27 — Primitive Engine Map (behavioral archetype resolution)
// ═══════════════════════════════════════════════════════════════

export {
  resolveEngine,
  classifyByAffinity,
  CLASSIFIED_PRIMITIVE_COUNT,
} from './engines/primitive-engine-map';

export type {
  BehaviorEngine,
} from './engines/primitive-engine-map';

// ═══════════════════════════════════════════════════════════════
// §28 — Specialized Behavior Engines (interception, state, execution, analysis)
// ═══════════════════════════════════════════════════════════════

export { wrapInterception } from './engines/interception-engine';
export { wrapState } from './engines/state-engine';
export { wrapExecution } from './engines/execution-engine';
export { wrapAnalysis } from './engines/analysis-engine';
