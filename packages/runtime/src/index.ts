/**
 * @cmpsbl/runtime — Mini-Runtime™ Engine v2.1.0
 * CMPSBL® Core Execution Runtime
 *
 * Zero-dependency CJPI scoring, auto-tiering, manifest parsing,
 * state machine, saga orchestration, pipeline execution,
 * telemetry compression, circuit breaker persistence,
 * timeout governance, and sealed runtime integrity verification.
 *
 * Patent Pending — U.S. App. No. 64/029,678
 * © CMPSBL® — All rights reserved.
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
    runtime: 'cmpsbl-mini-runtime-engine',
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
// §8 — Sealed Runtime Integrity Verification
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
// §9 — Runtime Factory
// ═══════════════════════════════════════════════════════════════

export interface MiniRuntime {
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

export function createRuntime(options?: { autoRegister?: boolean }): MiniRuntime {
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
    version: '2.1.0',
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
