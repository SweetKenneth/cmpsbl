/**
 * @cmpsbl/runtime — Mini-Runtime™ Engine
 * CMPSBL® Core Execution Runtime
 *
 * Zero-dependency CJPI scoring, auto-tiering, manifest parsing,
 * state machine, saga orchestration, and pipeline execution.
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  CJPIInput,
  CJPIScoreBreakdown,
  CrystallizedTier,
  ProductTier,
  CmpsblManifest,
  ChainManifest,
  ChainResult,
  ExecutionOptions,
  RuntimeMode,
  BridgeType,
  PrimitiveResult,
} from '@cmpsbl/types';

export type { CJPIInput, CJPIScoreBreakdown, CrystallizedTier, ProductTier, CmpsblManifest };

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
// §5 — Pipeline Executor
// ═══════════════════════════════════════════════════════════════

export type PrimitiveHandler = (data: Record<string, unknown>, confidence: number) => PrimitiveResult | Promise<PrimitiveResult>;

const primitiveRegistry = new Map<string, PrimitiveHandler>();

export function registerPrimitive(name: string, handler: PrimitiveHandler): void {
  primitiveRegistry.set(name, handler);
}

export async function executePrimitive(name: string, data: Record<string, unknown>, confidence: number): Promise<PrimitiveResult> {
  const handler = primitiveRegistry.get(name);
  if (handler) {
    return handler(data, confidence);
  }
  // Default fallback
  return {
    success: true,
    output: { echo: data, primitive: name },
    confidence: confidence * 0.8,
    durationMs: 0,
    handler: 'default-fallback',
  };
}

export async function executeChain(
  manifest: ChainManifest,
  input: Record<string, unknown>,
  options?: ExecutionOptions,
): Promise<ChainResult> {
  const start = Date.now();
  let current = input;
  let stagesCompleted = 0;

  for (const mod of manifest.modules) {
    try {
      const result = await executePrimitive(mod, current, manifest.cjpiScore / 100);
      if (result.success) {
        current = typeof result.output === 'object' && result.output !== null
          ? result.output as Record<string, unknown>
          : { value: result.output };
        stagesCompleted++;
      } else if (!options?.continueOnFailure) {
        break;
      }
    } catch {
      if (!options?.continueOnFailure) break;
    }
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
// §6 — Runtime Factory
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
  version: string;
}

export function createRuntime(): MiniRuntime {
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
    version: '1.0.0',
  };
}
