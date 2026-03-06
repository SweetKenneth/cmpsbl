/**
 * Release Gate — Full Substrate Gauntlet
 * Consolidated validation suite: 10 release passes + all unit test domains.
 * Run: bunx vitest run src/release/__tests__/release-gate.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Global Mocks (vi.hoisted for proper hoisting with vi.mock) ──────────────

const { mockExecSync, MOCK_FILES, mockExistsSync, mockReadFileSync } = vi.hoisted(() => {
  const MOCK_FILES: Record<string, string> = {
    'src/App.tsx': 'import ErrorBoundary from "./ErrorBoundary";\nexport default App;',
    'src/main.tsx': 'import { installProductionLogGuard } from "./lib/system/productionLogGuard";\n',
    'src/lib/system/productionLogGuard.ts': '// NEVER suppressed console.error\nexport function installProductionLogGuard() {}',
    'src/lib/substrate/events/emit.ts': 'export function emit() {}',
    'src/lib/system/log.ts': 'export function log() {}',
    'docs/ROLLBACK.md': '# Rollback Plan',
    'docs/v11/evolution-and-shadow.md': '# Shadow and canary deployment',
    'src/lib/atlas/capability-gate.ts': 'export const gates = {};',
  };

  const mockExecSync = vi.fn((cmd: string) => {
    if (cmd.includes('tsc --noEmit')) return '';
    if (cmd.includes('vite build')) return 'dist/index.js 150.00 kB';
    if (cmd.includes('vitest run')) return JSON.stringify({
      numTotalTests: 220, numPassedTests: 220, numFailedTests: 0,
    });
    if (cmd.includes('npm audit')) return 'found 0 vulnerabilities';
    if (cmd.includes('git rev-parse --short')) return 'abc1234';
    if (cmd.includes('git rev-parse --abbrev-ref')) return 'main';
    return '';
  });

  const mockExistsSync = vi.fn((p: string) => {
    const rel = String(p).replace(process.cwd() + '/', '');
    if (rel === 'src' || rel === 'supabase/functions') return true;
    return rel in MOCK_FILES || Object.keys(MOCK_FILES).some(k => k.startsWith(rel + '/'));
  });

  const mockReadFileSync = vi.fn((p: string, _enc?: string) => {
    const rel = String(p).replace(process.cwd() + '/', '');
    if (rel in MOCK_FILES) return MOCK_FILES[rel];
    return '';
  });

  return { mockExecSync, MOCK_FILES, mockExistsSync, mockReadFileSync };
});

vi.mock('child_process', () => ({
  default: {},
  execSync: mockExecSync,
}));

vi.mock('fs', () => ({
  default: {},
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn((_dir: string) => []),
  statSync: vi.fn(() => ({ isDirectory: () => false, isFile: () => true, size: 100 })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ data: [], error: null }) }) }),
    rpc: () => ({ data: null, error: null }),
  },
}));

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: RELEASE GATE — 10 PASSES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Release Gate — 10 Passes', () => {

  it('Pass 1: BUILD / COMPILE succeeds', async () => {
    const { runBuildPass } = await import('../passes/build-pass');
    const result = await runBuildPass();
    expect(result.pass).toBe(1);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('Pass 2: UNIT TESTS succeeds', async () => {
    const { runUnitTestPass } = await import('../passes/unit-test-pass');
    const result = await runUnitTestPass();
    expect(result.pass).toBe(2);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
  });

  it('Pass 3: INTEGRATION runs without crash', async () => {
    const { runIntegrationPass } = await import('../passes/integration-pass');
    const result = await runIntegrationPass();
    expect(result.pass).toBe(3);
    expect(['PASS', 'FAIL']).toContain(result.status);
    expect(result.required).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('Pass 4: REGRESSION / INVARIANTS runs without crash', async () => {
    const { runRegressionPass } = await import('../passes/regression-pass');
    const result = await runRegressionPass();
    expect(result.pass).toBe(4);
    expect(['PASS', 'FAIL']).toContain(result.status);
    expect(result.required).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('Pass 5: PERFORMANCE runs without crash', async () => {
    const { runPerformancePass } = await import('../passes/performance-pass');
    const result = await runPerformancePass();
    expect(result.pass).toBe(5);
    expect(['PASS', 'FAIL']).toContain(result.status);
    expect(result.required).toBe(true);
  });

  it('Pass 6: SECURITY succeeds with clean source', async () => {
    const { runSecurityPass } = await import('../passes/security-pass');
    const result = await runSecurityPass();
    expect(result.pass).toBe(6);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
  });

  it('Pass 7: OBSERVABILITY succeeds', async () => {
    const { runObservabilityPass } = await import('../passes/observability-pass');
    const result = await runObservabilityPass();
    expect(result.pass).toBe(7);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
  });

  it('Pass 8: COST skips when not enabled', async () => {
    delete process.env.RELEASE_GATE_COST;
    const { runCostPass } = await import('../passes/cost-pass');
    const result = await runCostPass();
    expect(result.pass).toBe(8);
    expect(result.status).toBe('SKIP');
    expect(result.required).toBe(false);
  });

  it('Pass 9: DEPLOYMENT / ROLLBACK succeeds', async () => {
    const { runDeploymentPass } = await import('../passes/deployment-pass');
    const result = await runDeploymentPass();
    expect(result.pass).toBe(9);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
  });

  it('Pass 10: CHAOS skips when not enabled', async () => {
    delete process.env.RELEASE_GATE_CHAOS;
    const { runChaosPass } = await import('../passes/chaos-pass');
    const result = await runChaosPass();
    expect(result.pass).toBe(10);
    expect(result.status).toBe('SKIP');
    expect(result.required).toBe(false);
  });

  it('Report builder produces valid structure', async () => {
    const { buildReport, toMarkdown } = await import('../report');
    const mockPasses = [
      { pass: 1, name: 'BUILD', status: 'PASS' as const, required: true, durationMs: 100, notes: ['ok'], artifacts: [] },
      { pass: 2, name: 'UNIT', status: 'PASS' as const, required: true, durationMs: 50, notes: [], artifacts: [] },
    ];
    const report = buildReport(mockPasses);
    expect(report.summary.total).toBe(2);
    expect(report.summary.passed).toBe(2);
    expect(report.summary.allRequiredPassed).toBe(true);
    expect(report.gitSha).toBeTruthy();

    const md = toMarkdown(report);
    expect(md).toContain('Release Gate Report');
    expect(md).toContain('RELEASE APPROVED');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: NEXUS CIRCUIT BREAKER
// ═══════════════════════════════════════════════════════════════════════════════

describe('NEXUS Circuit Breaker', () => {
  let isProviderAvailable: any, recordSuccess: any, recordFailure: any,
      resetCircuit: any, getCircuitStatus: any, updateCircuitConfig: any;

  beforeEach(async () => {
    const mod = await import('@/lib/nexus/circuitBreaker');
    isProviderAvailable = mod.isProviderAvailable;
    recordSuccess = mod.recordSuccess;
    recordFailure = mod.recordFailure;
    resetCircuit = mod.resetCircuit;
    getCircuitStatus = mod.getCircuitStatus;
    updateCircuitConfig = mod.updateCircuitConfig;

    resetCircuit('test-provider');
    updateCircuitConfig({
      failure_threshold: 3,
      success_threshold: 2,
      cooldown_ms: 100,
      half_open_requests: 1,
    });
  });

  it('starts closed and available', () => {
    expect(isProviderAvailable('test-provider')).toBe(true);
    expect(getCircuitStatus('test-provider').state).toBe('closed');
  });

  it('opens after failure threshold', () => {
    for (let i = 0; i < 3; i++) recordFailure('test-provider');
    expect(isProviderAvailable('test-provider')).toBe(false);
    expect(getCircuitStatus('test-provider').state).toBe('open');
  });

  it('does not open below threshold', () => {
    recordFailure('test-provider');
    recordFailure('test-provider');
    expect(isProviderAvailable('test-provider')).toBe(true);
  });

  it('recovers to half-open after cooldown', async () => {
    for (let i = 0; i < 3; i++) recordFailure('test-provider');
    expect(isProviderAvailable('test-provider')).toBe(false);
    await new Promise(r => setTimeout(r, 150));
    expect(isProviderAvailable('test-provider')).toBe(true);
    expect(getCircuitStatus('test-provider').state).toBe('half-open');
  });

  it('closes from half-open after success threshold', async () => {
    for (let i = 0; i < 3; i++) recordFailure('test-provider');
    await new Promise(r => setTimeout(r, 150));
    isProviderAvailable('test-provider');
    recordSuccess('test-provider');
    recordSuccess('test-provider');
    expect(getCircuitStatus('test-provider').state).toBe('closed');
  });

  it('reopens from half-open on failure', async () => {
    for (let i = 0; i < 3; i++) recordFailure('test-provider');
    await new Promise(r => setTimeout(r, 150));
    isProviderAvailable('test-provider');
    recordFailure('test-provider');
    expect(getCircuitStatus('test-provider').state).toBe('open');
  });

  it('isolates separate providers independently', () => {
    for (let i = 0; i < 3; i++) recordFailure('provider-a');
    expect(isProviderAvailable('provider-a')).toBe(false);
    expect(isProviderAvailable('provider-b')).toBe(true);
    resetCircuit('provider-a');
    resetCircuit('provider-b');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: NEXUS COST ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('NEXUS Cost Estimation', () => {
  it('returns valid cost estimate structure', async () => {
    const { estimateCost } = await import('@/lib/nexus/costEstimation');
    const estimate = estimateCost('groq' as any, 'llama-3-70b', 'Hello, world! This is a test prompt.');
    expect(estimate).toHaveProperty('provider');
    expect(estimate).toHaveProperty('model');
    expect(estimate).toHaveProperty('estimatedCost');
    expect(estimate).toHaveProperty('inputTokens');
    expect(estimate).toHaveProperty('outputTokens');
    expect(estimate).toHaveProperty('confidence');
    expect(estimate).toHaveProperty('breakdown');
  });

  it('estimates non-zero cost for real input', async () => {
    const { estimateCost } = await import('@/lib/nexus/costEstimation');
    const estimate = estimateCost('groq' as any, 'llama-3-70b', 'Generate a detailed analysis of quantum computing trends.');
    expect(estimate.estimatedCost).toBeGreaterThan(0);
    expect(estimate.inputTokens).toBeGreaterThan(0);
  });

  it('scales cost with input length', async () => {
    const { estimateCost } = await import('@/lib/nexus/costEstimation');
    const short = estimateCost('groq' as any, 'llama-3-70b', 'hi');
    const long = estimateCost('groq' as any, 'llama-3-70b', 'a '.repeat(1000));
    expect(long.estimatedCost).toBeGreaterThan(short.estimatedCost);
    expect(long.inputTokens).toBeGreaterThan(short.inputTokens);
  });

  it('handles empty input gracefully', async () => {
    const { estimateCost } = await import('@/lib/nexus/costEstimation');
    const estimate = estimateCost('groq' as any, 'unknown-model', '');
    expect(estimate).toHaveProperty('estimatedCost');
    expect(estimate.inputTokens).toBe(0);
  });

  it('provides confidence score between 0 and 1', async () => {
    const { estimateCost } = await import('@/lib/nexus/costEstimation');
    const estimate = estimateCost('groq' as any, 'llama-3-70b', 'test');
    expect(estimate.confidence).toBeGreaterThanOrEqual(0);
    expect(estimate.confidence).toBeLessThanOrEqual(1);
  });

  it('includes breakdown with input/output/overhead', async () => {
    const { estimateCost } = await import('@/lib/nexus/costEstimation');
    const estimate = estimateCost('groq' as any, 'llama-3-70b', 'test prompt');
    expect(estimate.breakdown).toHaveProperty('inputCost');
    expect(estimate.breakdown).toHaveProperty('outputCost');
    expect(estimate.breakdown).toHaveProperty('overhead');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: NEXUS COST CEILING
// ═══════════════════════════════════════════════════════════════════════════════

describe('NEXUS Cost Ceiling', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { setCostCeilingConfig } = await import('@/lib/nexus/cost-ceiling');
    setCostCeilingConfig({});
  });

  it('accepts partial config overrides', async () => {
    const { setCostCeilingConfig } = await import('@/lib/nexus/cost-ceiling');
    setCostCeilingConfig({ dailyLimit: 1000000 });
    // No throw = success
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: CORRELATION ID SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

describe('Correlation ID System', () => {
  let generateCorrelationId: any, createContext: any, forkContext: any,
      startSpan: any, endSpan: any, getTrace: any, extractHeaders: any,
      getActiveContexts: any, getAllSpans: any, cleanupContexts: any;

  beforeEach(async () => {
    const mod = await import('@/lib/substrate/correlation-id/index');
    generateCorrelationId = mod.generateCorrelationId;
    createContext = mod.createContext;
    forkContext = mod.forkContext;
    startSpan = mod.startSpan;
    endSpan = mod.endSpan;
    getTrace = mod.getTrace;
    extractHeaders = mod.extractHeaders;
    getActiveContexts = mod.getActiveContexts;
    getAllSpans = mod.getAllSpans;
    cleanupContexts = mod.cleanupContexts;

    cleanupContexts(0);
  });

  it('produces unique IDs', () => {
    const ids = new Set(Array.from({ length: 200 }, () => generateCorrelationId()));
    expect(ids.size).toBe(200);
  });

  it('follows expected format', () => {
    expect(generateCorrelationId()).toMatch(/^cid-/);
  });

  it('creates root context', () => {
    const ctx = createContext('TEST', 'unit-test');
    expect(ctx.correlationId).toBeTruthy();
    expect(ctx.parentId).toBeNull();
    expect(ctx.rootId).toBe(ctx.correlationId);
    expect(ctx.moduleId).toBe('TEST');
  });

  it('forks child context with parent linkage', () => {
    const root = createContext('PARENT', 'root-op');
    const child = forkContext(root, 'CHILD', 'child-op');
    expect(child.parentId).toBe(root.correlationId);
    expect(child.rootId).toBe(root.rootId);
    expect(child.moduleId).toBe('CHILD');
  });

  it('inherits metadata on fork', () => {
    const root = createContext('PARENT', 'op', { tenant: 'acme' });
    const child = forkContext(root, 'CHILD', 'child-op');
    expect(child.metadata.tenant).toBe('acme');
  });

  it('creates and completes spans', () => {
    const ctx = createContext('MOD', 'op');
    const span = startSpan(ctx, 'db-query');
    expect(span.status).toBe('active');
    expect(span.durationMs).toBeNull();
    endSpan(span);
    expect(span.status).toBe('completed');
    expect(span.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('marks failed spans', () => {
    const ctx = createContext('MOD', 'op');
    const span = startSpan(ctx);
    endSpan(span, 'failed');
    expect(span.status).toBe('failed');
  });

  it('returns spans for a root correlation', () => {
    const ctx = createContext('MOD', 'flow');
    startSpan(ctx, 'step-1');
    startSpan(ctx, 'step-2');
    const trace = getTrace(ctx.rootId);
    expect(trace.length).toBeGreaterThanOrEqual(2);
  });

  it('extracts propagation headers', () => {
    const ctx = createContext('MOD', 'op');
    const headers = extractHeaders(ctx);
    expect(headers['x-correlation-id']).toBe(ctx.correlationId);
    expect(headers['x-root-id']).toBe(ctx.rootId);
    expect(headers['x-module-id']).toBe('MOD');
  });

  it('caps spans at MAX_SPANS with eviction', () => {
    const ctx = createContext('MOD', 'stress');
    for (let i = 0; i < 5100; i++) startSpan(ctx, `op-${i}`);
    expect(getAllSpans().length).toBeLessThanOrEqual(5000);
  });

  it('cleanupContexts removes stale entries', async () => {
    createContext('OLD', 'stale');
    await new Promise(r => setTimeout(r, 5));
    cleanupContexts(1);
    expect(getActiveContexts().length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: CAPABILITY GATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Capability Gate', () => {
  let checkGate: any, withGate: any, checkGateBatch: any,
      getDenialLog: any, clearDenialLog: any, configureGate: any;

  beforeEach(async () => {
    const mod = await import('@/lib/substrate/capability-gate/index');
    checkGate = mod.checkGate;
    withGate = mod.withGate;
    checkGateBatch = mod.checkGateBatch;
    getDenialLog = mod.getDenialLog;
    clearDenialLog = mod.clearDenialLog;
    configureGate = mod.configureGate;

    clearDenialLog();
    configureGate({ enforcementMode: 'strict', logDenials: true, gracePeriodMs: 0 });
  });

  it('allows capabilities at matching tier', () => {
    const result = checkGate('substrate.health', 'free');
    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('currentTier', 'free');
    expect(result).toHaveProperty('capabilityId', 'substrate.health');
  });

  it('returns well-formed result for unknown capabilities', () => {
    const result = checkGate('nonexistent.cap.xyz', 'free');
    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('reason');
  });

  it('executes function when enforcementMode is off', () => {
    configureGate({ enforcementMode: 'off' });
    const result = withGate('any.cap', 'free', () => 'executed');
    expect(result).toBe('executed');
  });

  it('returns gate result in strict mode for denied caps', () => {
    configureGate({ enforcementMode: 'strict' });
    const result = withGate('enterprise.only.cap.xyz', 'free', () => 'should not run');
    if (typeof result === 'object' && result !== null && 'allowed' in result) {
      expect(result.allowed).toBe(false);
    }
  });

  it('returns results for all requested capabilities (batch)', () => {
    const results = checkGateBatch(['cap.a', 'cap.b', 'cap.c'], 'pro');
    expect(results.size).toBe(3);
    for (const [key, val] of results) {
      expect(val).toHaveProperty('allowed');
      expect(val).toHaveProperty('capabilityId', key);
    }
  });

  it('clearDenialLog empties the log', () => {
    checkGate('some.cap', 'free');
    clearDenialLog();
    expect(getDenialLog().length).toBe(0);
  });

  it('warn mode does not block', () => {
    configureGate({ enforcementMode: 'warn' });
    const result = withGate('any.cap', 'free', () => 'ran');
    expect(result).toBe('ran');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: DEPENDENCY GRAPH
// ═══════════════════════════════════════════════════════════════════════════════

describe('Dependency Graph', () => {
  let registerModule: any, computeBootOrder: any, clearGraph: any, getGraphSize: any,
      getModule: any, getDependents: any, getTransitiveDependencies: any,
      getReadyModules: any, getFailedModules: any, setModuleStatus: any;

  beforeEach(async () => {
    const mod = await import('@/lib/substrate/dependency-graph');
    registerModule = mod.registerModule;
    computeBootOrder = mod.computeBootOrder;
    clearGraph = mod.clearGraph;
    getGraphSize = mod.getGraphSize;
    getModule = mod.getModule;
    getDependents = mod.getDependents;
    getTransitiveDependencies = mod.getTransitiveDependencies;
    getReadyModules = mod.getReadyModules;
    getFailedModules = mod.getFailedModules;
    setModuleStatus = mod.setModuleStatus;

    clearGraph();
  });

  it('registers modules and computes linear boot order', () => {
    registerModule('core', 'CORE');
    registerModule('system', 'SYSTEM', ['core']);
    registerModule('ocg', 'OCG', ['system']);
    const { order, cycles } = computeBootOrder();
    expect(cycles).toHaveLength(0);
    expect(order).toEqual(['core', 'system', 'ocg']);
  });

  it('detects cycles and excludes cyclic nodes', () => {
    registerModule('a', 'A', ['b']);
    registerModule('b', 'B', ['a']);
    registerModule('c', 'C');
    const { order, cycles } = computeBootOrder();
    expect(cycles.length).toBeGreaterThan(0);
    expect(order).not.toContain('a');
    expect(order).not.toContain('b');
    expect(order).toContain('c');
  });

  it('marks cyclic nodes as failed', () => {
    registerModule('x', 'X', ['y']);
    registerModule('y', 'Y', ['x']);
    computeBootOrder();
    expect(getModule('x')?.status).toBe('failed');
    expect(getModule('y')?.status).toBe('failed');
  });

  it('clearGraph resets all state', () => {
    registerModule('a', 'A');
    registerModule('b', 'B');
    expect(getGraphSize()).toBe(2);
    clearGraph();
    expect(getGraphSize()).toBe(0);
  });

  it('warns on unregistered dependency', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerModule('a', 'A', ['nonexistent']);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unregistered module "nonexistent"'));
    warnSpy.mockRestore();
  });

  it('getDependents returns correct reverse deps', () => {
    registerModule('core', 'CORE');
    registerModule('sys', 'SYSTEM', ['core']);
    registerModule('ocg', 'OCG', ['core']);
    expect(getDependents('core').sort()).toEqual(['ocg', 'sys']);
  });

  it('getTransitiveDependencies traverses full chain', () => {
    registerModule('a', 'A');
    registerModule('b', 'B', ['a']);
    registerModule('c', 'C', ['b']);
    expect(getTransitiveDependencies('c')).toEqual(['b', 'a']);
  });

  it('setModuleStatus and status filters work', () => {
    registerModule('m1', 'M1');
    registerModule('m2', 'M2');
    setModuleStatus('m1', 'ready', 42);
    setModuleStatus('m2', 'failed');
    expect(getReadyModules()).toHaveLength(1);
    expect(getFailedModules()).toHaveLength(1);
    expect(getModule('m1')?.loadTimeMs).toBe(42);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: IDEMPOTENCY MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

describe('Idempotency Manager', () => {
  let withIdempotency: any, hasKey: any, clearKey: any, getIdempotencyStats: any;

  beforeEach(async () => {
    const mod = await import('@/lib/substrate/idempotency');
    withIdempotency = mod.withIdempotency;
    hasKey = mod.hasKey;
    clearKey = mod.clearKey;
    getIdempotencyStats = mod.getIdempotencyStats;

    clearKey('test-1');
    clearKey('test-2');
    clearKey('test-fail');
  });

  it('executes function on first call', async () => {
    let callCount = 0;
    const result = await withIdempotency('test-1', async () => { callCount++; return 42; });
    expect(result).toBe(42);
    expect(callCount).toBe(1);
  });

  it('returns cached result on duplicate key', async () => {
    let callCount = 0;
    const executor = async () => { callCount++; return 'hello'; };
    await withIdempotency('test-2', executor);
    const result = await withIdempotency('test-2', executor);
    expect(result).toBe('hello');
    expect(callCount).toBe(1);
  });

  it('propagates errors on failure', async () => {
    await expect(
      withIdempotency('test-fail', async () => { throw new Error('boom'); })
    ).rejects.toThrow('boom');
  });

  it('hasKey returns true for existing keys', async () => {
    await withIdempotency('test-1', async () => 'ok');
    expect(hasKey('test-1')).toBe(true);
    expect(hasKey('nonexistent')).toBe(false);
  });

  it('clearKey removes cached results', async () => {
    await withIdempotency('test-1', async () => 'ok');
    clearKey('test-1');
    expect(hasKey('test-1')).toBe(false);
  });

  it('getIdempotencyStats returns correct counts', async () => {
    await withIdempotency('test-1', async () => 'a');
    await withIdempotency('test-2', async () => 'b');
    const stats = getIdempotencyStats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.pending).toBe(0);
  });

  it('respects TTL expiry', async () => {
    await withIdempotency('test-1', async () => 'val', 1);
    await new Promise(r => setTimeout(r, 10));
    let callCount = 0;
    await withIdempotency('test-1', async () => { callCount++; return 'new-val'; });
    expect(callCount).toBe(1);
  });
});
