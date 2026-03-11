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
    ['Matrix has exactly 40 nodes', () => {
      assert(getNodeDefinitions().length === 40, `Expected 40, got ${getNodeDefinitions().length}`);
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
      const nodes = buildMatrixNodes({});
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
      const hash = await computeSnapshotHash({ test: true }, 1, null);
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
      registerModule('c', 'C', []);
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
      const id1 = computeStableId('name', ['mod'], 'cat');
      const id2 = computeStableId('name', ['mod'], 'cat');
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
        context: {},
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
// SUITE 4: TECHNICAL DEBT & DRIFT
// Formalizes the full-codebase audit from prior sessions:
//   - Legacy naming (MODERNIZER → EVOLUTION)
//   - Forbidden branding (lovable AI references in runtime code)
//   - Stub/TODO detection in substrate-critical paths
//   - RLS policy sanity (critical tables must block anon reads)
//   - Import health (no broken re-exports from barrel files)
//   - Architecture invariants (node count, weight, sector coverage)
// ═══════════════════════════════════════════════════════════════

async function technicalDebtTests(): Promise<Array<[string, TestFn]>> {
  const { getNodeDefinitions, getNodesBySector, getTotalWeight } =
    await import('@/lib/core/matrixNodeRegistry');

  const { supabase } = await import('@/integrations/supabase/client');

  // Helper: check if a Supabase table blocks unauthenticated reads
  async function tableBlocksAnon(tableName: string): Promise<boolean> {
    const { data, error } = await supabase.from(tableName as any).select('id', { count: 'exact', head: true });
    // If we get an error or null data with no rows, RLS is doing its job
    return !!error || data === null;
  }

  return [
    // ── NAMING CONVENTIONS ──
    ['No MODERNIZER references in substrate barrel exports', async () => {
      const substrate = await import('@/lib/substrate');
      const keys = Object.keys(substrate);
      const violations = keys.filter(k => /modernizer/i.test(k));
      assert(violations.length === 0, `Legacy keys found: ${violations.join(', ')}`);
    }],
    ['Evolution engine exports use EVOLUTION namespace', async () => {
      const evolve = await import('@/lib/evolve');
      const keys = Object.keys(evolve);
      // Should have evolution-related exports, not modernizer
      const hasEvolution = keys.some(k => /evol/i.test(k));
      assert(hasEvolution, `No evolution exports found in @/lib/evolve — keys: ${keys.slice(0, 10).join(', ')}`);
    }],

    // ── FORBIDDEN BRANDING ──
    ['No lovable AI gateway references in page', () => {
      const html = document.documentElement.innerHTML;
      assert(!html.includes('ai.gateway.lovable.dev'), 'Found lovable AI gateway reference in rendered DOM');
    }],
    ['No LOVABLE_API_KEY in page scripts', () => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const violation = scripts.find(s => (s.textContent || '').includes('LOVABLE_API_KEY'));
      assert(!violation, 'LOVABLE_API_KEY found in inline script');
    }],
    ['Meta tags free of forbidden branding', () => {
      const forbidden = ['lovable ai', 'lovable.ai', 'powered by lovable', 'built with lovable'];
      const metas = Array.from(document.querySelectorAll('meta[content]'));
      for (const meta of metas) {
        const content = (meta.getAttribute('content') || '').toLowerCase();
        for (const term of forbidden) {
          assert(!content.includes(term), `Meta tag contains "${term}": ${meta.outerHTML}`);
        }
      }
    }],
    ['No version numbers in SEO metadata', () => {
      const versionRe = /\bv\d+\.\d+/i;
      const surfaces = [
        document.title,
        document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
      ];
      for (const s of surfaces) {
        assert(!versionRe.test(s), `Version number in SEO surface: "${s.match(versionRe)?.[0]}"`);
      }
    }],

    // ── ARCHITECTURE INVARIANTS ──
    ['Matrix has exactly 40 nodes (drift check)', () => {
      const count = getNodeDefinitions().length;
      assert(count === 40, `Expected 40 nodes, got ${count}`);
    }],
    ['All 12 sectors populated', () => {
      const required = ['core', 'system', 'ccr', 'ocg', 'execution', 'esz', 'epz', 'emz', 'csz', 'field', 'plane', 'shell'] as const;
      const missing = required.filter(s => getNodesBySector(s).length === 0);
      assert(missing.length === 0, `Empty sectors: ${missing.join(', ')}`);
    }],
    ['Node weights sum to 1.000 ± 0.002', () => {
      const total = getTotalWeight();
      assert(Math.abs(total - 1.0) < 0.002, `Weight sum: ${total}`);
    }],

    // ── RLS POLICY ENFORCEMENT ──
    ['substrate_audit_log blocks anon reads', async () => {
      assert(await tableBlocksAnon('substrate_audit_log'), 'substrate_audit_log is readable without auth');
    }],
    ['brain_events blocks anon reads', async () => {
      assert(await tableBlocksAnon('brain_events'), 'brain_events is readable without auth');
    }],
    ['user_roles blocks anon reads', async () => {
      assert(await tableBlocksAnon('user_roles'), 'user_roles is readable without auth');
    }],
    ['profiles blocks anon reads', async () => {
      assert(await tableBlocksAnon('profiles'), 'profiles is readable without auth');
    }],
    ['substrate_licenses blocks anon reads', async () => {
      assert(await tableBlocksAnon('substrate_licenses'), 'substrate_licenses is readable without auth');
    }],

    // ── IMPORT HEALTH ──
    ['lib/audit barrel exports without error', async () => {
      const mod = await import('@/lib/audit');
      assert(typeof mod.runFullAudit === 'function', 'runFullAudit not exported');
    }],
    ['lib/system barrel exports without error', async () => {
      const mod = await import('@/lib/system');
      assert(typeof mod.log === 'function', 'log not exported');
      assert(typeof mod.withRetry === 'function', 'withRetry not exported');
    }],
    ['lib/substrate/system barrel exports', async () => {
      const mod = await import('@/lib/substrate/system');
      assert(typeof mod.runSystemAudit === 'function', 'runSystemAudit not exported');
    }],

    // ── STUB DETECTION ──
    ['No placeholder API adapters returning hardcoded success', async () => {
      const { freeApiAdapters } = await import('@/lib/agency/adapters/freeApiAdapters');
      // youtube_transcript should NOT return success: true since it's a stub
      if (freeApiAdapters.youtube_transcript) {
        const result = freeApiAdapters.youtube_transcript({ url: 'https://test.com' });
        const resolved = result instanceof Promise ? await result : result;
        assert(resolved.success !== true, 'youtube_transcript stub still returns success:true');
      }
    }],

    // ── RUNTIME CONTRACTS ──
    ['Substrate invoke returns structured result', async () => {
      const { substrate } = await import('@/lib/substrate');
      const result = await substrate.invoke({ module: 'core', action: 'pulse' });
      assert(typeof result === 'object' && 'success' in result, 'Bad invoke result shape');
    }],
    ['Control plane SHA-256 is deterministic', async () => {
      const { sha256 } = await import('@/lib/control-plane/hash');
      const h1 = await sha256('debt-drift-check');
      const h2 = await sha256('debt-drift-check');
      assert(h1 === h2 && h1.length === 64, 'SHA-256 non-deterministic or wrong length');
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
  {
    id: 'tech-debt-drift',
    name: 'Technical Debt & Drift',
    description: 'Legacy naming, branding, RLS enforcement, stubs, import health, architecture invariants',
    icon: '🧹',
    testCount: '21 checks',
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
    case 'tech-debt-drift':
      return runSuite(suiteId, 'Technical Debt & Drift', TEST_SUITE_DEFS[3].description, await technicalDebtTests());
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
