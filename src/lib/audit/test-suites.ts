/**
 * Governor Audit — In-Browser Test Suite Runner
 * Executes substrate, memory-stream, and discovery-engine validation
 * directly in the browser using the live runtime (no vitest dependency).
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export interface SuiteResult {
  id: string;
  name: string;
  description: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  totalMs: number;
  ranAt: string;
}

type TestFn = () => void | Promise<void>;

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function runTest(name: string, fn: TestFn): Promise<TestResult> {
  const start = performance.now();
  try {
    await fn();
    return { name, passed: true, durationMs: Math.round(performance.now() - start) };
  } catch (e: any) {
    return { name, passed: false, durationMs: Math.round(performance.now() - start), error: e.message };
  }
}

async function runSuite(id: string, name: string, description: string, tests: Array<[string, TestFn]>): Promise<SuiteResult> {
  const results: TestResult[] = [];
  for (const [testName, fn] of tests) {
    results.push(await runTest(testName, fn));
  }
  return {
    id, name, description,
    tests: results,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    totalMs: results.reduce((s, r) => s + r.durationMs, 0),
    ranAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// SUITE 1: SUBSTRATE AUDIT
// ═══════════════════════════════════════════════════════════════

async function substrateAuditTests(): Promise<Array<[string, TestFn]>> {
  const {
    getNodeDefinitions, getNodeDefinition, getNodesBySector,
    buildMatrixNodes, calculateIntegrity, getTotalWeight,
  } = await import('@/lib/core/matrixNodeRegistry');

  const { substrate } = await import('@/lib/substrate');

  const { canonicalizeJson, sha256, computeSnapshotHash } = await import('@/lib/control-plane/hash');

  const { computeBootOrder, registerModule, clearGraph } =
    await import('@/lib/substrate/dependency-graph');

  return [
    // Matrix Registry
    ['Matrix has exactly 38 nodes', () => {
      assert(getNodeDefinitions().length === 38, `Expected 38, got ${getNodeDefinitions().length}`);
    }],
    ['All 12 sectors have nodes', () => {
      const sectors = ['core', 'system', 'ccr', 'ocg', 'execution', 'esz', 'epz', 'emz', 'csz', 'field', 'plane', 'shell'] as const;
      for (const s of sectors) {
        assert(getNodesBySector(s).length > 0, `Sector ${s} has no nodes`);
      }
    }],
    ['Node weights sum to 1.000', () => {
      const total = getTotalWeight();
      assert(Math.abs(total - 1.0) < 0.002, `Weights sum to ${total}, expected 1.000`);
    }],
    ['CORE node exists in brain sector', () => {
      const core = getNodeDefinition('core');
      assert(!!core, 'CORE node not found');
    }],
    ['Integrity report is valid', () => {
      const nodes = buildMatrixNodes();
      const report = calculateIntegrity(nodes);
      assert(typeof report.operational === 'number', 'Missing operational score');
      assert(typeof report.status === 'string', 'Missing status');
    }],

    // Substrate invoke
    ['substrate.invoke returns structured result', async () => {
      const result = await substrate.invoke({ module: 'core', action: 'pulse' });
      assert(typeof result === 'object', 'Result is not an object');
      assert('success' in result, 'Missing success field');
    }],

    // Control Plane hashing
    ['SHA-256 produces consistent 64-char hashes', async () => {
      const h1 = await sha256('hello');
      const h2 = await sha256('hello');
      assert(h1 === h2, 'SHA-256 not deterministic');
      assert(h1.length === 64, `Hash length: ${h1.length}`);
    }],
    ['canonicalizeJson is deterministic', () => {
      const a = canonicalizeJson({ b: 2, a: 1 });
      const b = canonicalizeJson({ a: 1, b: 2 });
      assert(a === b, 'Canonicalization not deterministic');
    }],
    ['computeSnapshotHash produces hash', async () => {
      const hash = await computeSnapshotHash({ test: true });
      assert(typeof hash === 'string' && hash.length === 64, `Bad hash: ${hash}`);
    }],

    // Dependency Graph
    ['Dependency graph: linear boot order', () => {
      clearGraph();
      registerModule('core', 'CORE');
      registerModule('system', 'SYSTEM', ['core']);
      registerModule('ocg', 'OCG', ['system']);
      const { order, cycles } = computeBootOrder();
      assert(cycles.length === 0, `Unexpected cycles: ${cycles}`);
      assert(order[0] === 'core', `First boot: ${order[0]}`);
      assert(order[2] === 'ocg', `Last boot: ${order[2]}`);
      clearGraph();
    }],
    ['Dependency graph: detects cycles', () => {
      clearGraph();
      registerModule('a', 'A', ['b']);
      registerModule('b', 'B', ['a']);
      registerModule('c', 'C');
      const { order, cycles } = computeBootOrder();
      assert(cycles.length > 0, 'Should detect cycle');
      assert(!order.includes('a'), 'Cyclic node should be excluded');
      assert(order.includes('c'), 'Non-cyclic node should be in order');
      clearGraph();
    }],
  ];
}

// ═══════════════════════════════════════════════════════════════
// SUITE 2: MEMORY STREAM E2E
// ═══════════════════════════════════════════════════════════════

async function memoryStreamTests(): Promise<Array<[string, TestFn]>> {
  const {
    createRuntime, createMemoryStorage, computeCJPI, autoAssignTier,
    computeSynergyMultiplier, computeStableId, djb2Hash, canonicalize,
    createStateMachine, createDependencyGraph: createDepGraph,
    createSaga,
  } = await import('@/lib/export/standalone-runtime');

  const { createDiscoveryEngine } = await import('@/lib/export/standalone-discovery-engine');

  const {
    generateExportBundle, getLanguagesForScore, SOFTWARE_LANGUAGES,
  } = await import('@/lib/export/universal-adapter');

  return [
    // Scoring
    ['CJPI computes valid 6-axis score (0-100)', () => {
      const score = computeCJPI({
        strategicLeverage: 80, recursionPotential: 70, crossNodeImpact: 60,
        composability: 75, governanceInfluence: 50, moatSensitivity: 65,
      });
      assert(score > 0, `Score: ${score}`);
      assert(score <= 100, `Score over 100: ${score}`);
    }],
    ['Synergy multiplier scales with module count', () => {
      const m2 = computeSynergyMultiplier(['A', 'B']);
      const m5 = computeSynergyMultiplier(['A', 'B', 'C', 'D', 'E']);
      assert(m5 > m2, `5-mod (${m5}) should exceed 2-mod (${m2})`);
    }],
    ['Auto-tier assigns apex for 95+', () => {
      assert(autoAssignTier(95) === 'apex', `95 → ${autoAssignTier(95)}`);
      assert(autoAssignTier(85) === 'enterprise', `85 → ${autoAssignTier(85)}`);
    }],

    // IDs & Hashing
    ['djb2Hash produces deterministic IDs', () => {
      const h1 = djb2Hash('test-input');
      const h2 = djb2Hash('test-input');
      assert(h1 === h2, 'Hash not deterministic');
    }],
    ['computeStableId is consistent', () => {
      const id1 = computeStableId(['mod', 'cat', 'name']);
      const id2 = computeStableId(['mod', 'cat', 'name']);
      assert(id1 === id2, 'Stable ID not consistent');
    }],
    ['canonicalize sorts keys deterministically', () => {
      const a = canonicalize({ z: 1, a: 2 });
      const b = canonicalize({ a: 2, z: 1 });
      assert(a === b, 'Canonicalization failed');
    }],

    // Storage
    ['Memory storage: CRUD lifecycle', async () => {
      const store = createMemoryStorage();
      await store.put('test', { id: 'k1', val: 1 });
      const item = await store.get<{ id: string; val: number }>('test', 'k1');
      assert(item?.val === 1, 'Get failed');
      await store.delete('test', 'k1');
      const deleted = await store.get('test', 'k1');
      assert(deleted === null, 'Delete failed');
    }],

    // State Machine (FSM)
    ['FSM transitions correctly', async () => {
      const fsm = createStateMachine({
        id: 'test-fsm',
        initial: 'idle',
        states: { idle: {}, running: {}, done: {} },
        transitions: [
          { from: 'idle', event: 'start', to: 'running' },
          { from: 'running', event: 'complete', to: 'done' },
        ],
      });
      assert(fsm.matches('idle'), 'Initial state');
      await fsm.send('start');
      assert(fsm.matches('running'), 'After start');
      await fsm.send('complete');
      assert(fsm.matches('done'), 'After complete');
    }],

    // Saga
    ['Saga executes steps in order', async () => {
      const log: string[] = [];
      const saga = createSaga<{ log: string[] }>('test-saga');
      saga.step('s1', async (ctx) => { ctx.log.push('s1'); return ctx; }, async (ctx) => ctx);
      saga.step('s2', async (ctx) => { ctx.log.push('s2'); return ctx; }, async (ctx) => ctx);
      const result = await saga.run({ log });
      assert(result.success, 'Saga failed');
      assert(log[0] === 's1' && log[1] === 's2', `Order: ${log}`);
    }],

    // Discovery Engine
    ['Discovery engine: dry run produces results', async () => {
      const runtime = createRuntime();
      const engine = createDiscoveryEngine(runtime);
      const result = await engine.run({ dryRun: true });
      assert(typeof result === 'object', 'No result object');
      assert('discoveries' in result, `Unexpected shape: ${Object.keys(result)}`);
    }],

    // Export
    ['Language gating: higher scores unlock more languages', () => {
      const low = getLanguagesForScore(20);
      const high = getLanguagesForScore(90);
      assert(high.length >= low.length, `High (${high.length}) < Low (${low.length})`);
    }],
  ];
}

// ═══════════════════════════════════════════════════════════════
// SUITE 3: RELEASE GATE (contract validation)
// ═══════════════════════════════════════════════════════════════

async function releaseGateTests(): Promise<Array<[string, TestFn]>> {
  const { isProviderAvailable, recordFailure, resetCircuit, getCircuitStatus, updateCircuitConfig } =
    await import('@/lib/nexus/circuitBreaker');

  const { estimateCost } = await import('@/lib/nexus/costEstimation');

  const { withIdempotency, clearKey } = await import('@/lib/substrate/idempotency');

  const { checkGate, clearDenialLog, configureGate } = await import('@/lib/substrate/capability-gate/index');

  return [
    // Circuit Breaker
    ['Circuit breaker: starts closed', () => {
      resetCircuit('audit-test');
      assert(isProviderAvailable('audit-test') === true, 'Should be available');
      assert(getCircuitStatus('audit-test').state === 'closed', 'Should be closed');
      resetCircuit('audit-test');
    }],
    ['Circuit breaker: opens after failures', () => {
      resetCircuit('audit-trip');
      updateCircuitConfig({ failure_threshold: 3, cooldown_ms: 100, success_threshold: 2, half_open_requests: 1 });
      for (let i = 0; i < 3; i++) recordFailure('audit-trip');
      assert(isProviderAvailable('audit-trip') === false, 'Should be unavailable');
      assert(getCircuitStatus('audit-trip').state === 'open', 'Should be open');
      resetCircuit('audit-trip');
    }],

    // Cost Estimation
    ['Cost estimation: returns valid structure', () => {
      const est = estimateCost('groq' as any, 'llama-3-70b', 'Test prompt for cost check');
      assert('estimatedCost' in est, 'Missing estimatedCost');
      assert('inputTokens' in est, 'Missing inputTokens');
      assert(est.estimatedCost >= 0, 'Negative cost');
    }],

    // Idempotency
    ['Idempotency: caches result on duplicate key', async () => {
      clearKey('audit-idem');
      let calls = 0;
      await withIdempotency('audit-idem', async () => { calls++; return 'ok'; });
      await withIdempotency('audit-idem', async () => { calls++; return 'ok'; });
      assert(calls === 1, `Expected 1 call, got ${calls}`);
      clearKey('audit-idem');
    }],

    // Capability Gate
    ['Capability gate: returns structured result', () => {
      clearDenialLog();
      configureGate({ enforcementMode: 'strict', logDenials: true, gracePeriodMs: 0 });
      const result = checkGate('substrate.health', 'free');
      assert('allowed' in result, 'Missing allowed');
      assert('reason' in result, 'Missing reason');
      clearDenialLog();
    }],
  ];
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

export interface TestSuiteDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  testCount: string;
}

export const TEST_SUITE_DEFS: TestSuiteDefinition[] = [
  {
    id: 'substrate-audit',
    name: 'Substrate Audit',
    description: 'Matrix registry, CORE, control plane, dependency graph, hashing',
    icon: '🔬',
    testCount: '11 checks',
  },
  {
    id: 'memory-stream',
    name: 'MEMORY Stream E2E',
    description: 'Discovery → Scoring → Tiering → Storage → Export pipeline',
    icon: '🧠',
    testCount: '11 checks',
  },
  {
    id: 'release-gate',
    name: 'Release Gate',
    description: 'Circuit breaker, cost estimation, idempotency, capability gate',
    icon: '🚀',
    testCount: '5 checks',
  },
];

export async function runTestSuite(suiteId: string): Promise<SuiteResult> {
  switch (suiteId) {
    case 'substrate-audit':
      return runSuite(suiteId, 'Substrate Audit', TEST_SUITE_DEFS[0].description, await substrateAuditTests());
    case 'memory-stream':
      return runSuite(suiteId, 'MEMORY Stream E2E', TEST_SUITE_DEFS[1].description, await memoryStreamTests());
    case 'release-gate':
      return runSuite(suiteId, 'Release Gate', TEST_SUITE_DEFS[2].description, await releaseGateTests());
    default:
      throw new Error(`Unknown suite: ${suiteId}`);
  }
}

export async function runAllTestSuites(): Promise<SuiteResult[]> {
  const results: SuiteResult[] = [];
  for (const def of TEST_SUITE_DEFS) {
    results.push(await runTestSuite(def.id));
  }
  return results;
}
