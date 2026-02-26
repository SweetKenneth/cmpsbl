/**
 * Release Gate — Vitest Validation
 * Runs all 10 passes in-process (mocking execSync for shell-dependent passes)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock child_process for passes that shell out
vi.mock('child_process', () => ({
  execSync: vi.fn((cmd: string) => {
    if (cmd.includes('tsc --noEmit')) return '';
    if (cmd.includes('vite build')) return 'dist/index.js 150.00 kB';
    if (cmd.includes('vitest run')) return JSON.stringify({
      numTotalTests: 220, numPassedTests: 220, numFailedTests: 0,
    });
    if (cmd.includes('npm audit')) return 'found 0 vulnerabilities';
    if (cmd.includes('git rev-parse --short')) return 'abc1234';
    if (cmd.includes('git rev-parse --abbrev-ref')) return 'main';
    return '';
  }),
}));

// Mock fs for file-system-dependent passes
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

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    existsSync: vi.fn((p: string) => {
      const rel = String(p).replace(process.cwd() + '/', '');
      // For security pass scanFiles, pretend src/ and supabase/functions/ exist as dirs
      if (rel === 'src' || rel === 'supabase/functions') return true;
      return rel in MOCK_FILES || Object.keys(MOCK_FILES).some(k => k.startsWith(rel + '/'));
    }),
    readFileSync: vi.fn((p: string, _enc?: string) => {
      const rel = String(p).replace(process.cwd() + '/', '');
      if (rel in MOCK_FILES) return MOCK_FILES[rel];
      return '';
    }),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn((_dir: string) => []),
    statSync: vi.fn(() => ({ isDirectory: () => false, isFile: () => true, size: 100 })),
  };
});

describe('Release Gate — All 10 Passes', () => {

  // PASS 1: BUILD
  it('Pass 1: BUILD / COMPILE succeeds', async () => {
    const { runBuildPass } = await import('../passes/build-pass');
    const result = await runBuildPass();
    expect(result.pass).toBe(1);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  // PASS 2: UNIT TESTS
  it('Pass 2: UNIT TESTS succeeds', async () => {
    const { runUnitTestPass } = await import('../passes/unit-test-pass');
    const result = await runUnitTestPass();
    expect(result.pass).toBe(2);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
  });

  // PASS 3: INTEGRATION
  it('Pass 3: INTEGRATION runs without crash', async () => {
    const { runIntegrationPass } = await import('../passes/integration-pass');
    const result = await runIntegrationPass();
    expect(result.pass).toBe(3);
    expect(['PASS', 'FAIL']).toContain(result.status);
    expect(result.required).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  // PASS 4: REGRESSION
  it('Pass 4: REGRESSION / INVARIANTS runs without crash', async () => {
    const { runRegressionPass } = await import('../passes/regression-pass');
    const result = await runRegressionPass();
    expect(result.pass).toBe(4);
    expect(['PASS', 'FAIL']).toContain(result.status);
    expect(result.required).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  // PASS 5: PERFORMANCE
  it('Pass 5: PERFORMANCE runs without crash', async () => {
    const { runPerformancePass } = await import('../passes/performance-pass');
    const result = await runPerformancePass();
    expect(result.pass).toBe(5);
    expect(['PASS', 'FAIL']).toContain(result.status);
    expect(result.required).toBe(true);
  });

  // PASS 6: SECURITY
  it('Pass 6: SECURITY succeeds with clean source', async () => {
    const { runSecurityPass } = await import('../passes/security-pass');
    const result = await runSecurityPass();
    expect(result.pass).toBe(6);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
  });

  // PASS 7: OBSERVABILITY
  it('Pass 7: OBSERVABILITY succeeds', async () => {
    const { runObservabilityPass } = await import('../passes/observability-pass');
    const result = await runObservabilityPass();
    expect(result.pass).toBe(7);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
  });

  // PASS 8: COST (gated — should SKIP)
  it('Pass 8: COST skips when not enabled', async () => {
    delete process.env.RELEASE_GATE_COST;
    const { runCostPass } = await import('../passes/cost-pass');
    const result = await runCostPass();
    expect(result.pass).toBe(8);
    expect(result.status).toBe('SKIP');
    expect(result.required).toBe(false);
  });

  // PASS 9: DEPLOYMENT
  it('Pass 9: DEPLOYMENT / ROLLBACK succeeds', async () => {
    const { runDeploymentPass } = await import('../passes/deployment-pass');
    const result = await runDeploymentPass();
    expect(result.pass).toBe(9);
    expect(result.status).toBe('PASS');
    expect(result.required).toBe(true);
  });

  // PASS 10: CHAOS (gated — should SKIP)
  it('Pass 10: CHAOS skips when not enabled', async () => {
    delete process.env.RELEASE_GATE_CHAOS;
    const { runChaosPass } = await import('../passes/chaos-pass');
    const result = await runChaosPass();
    expect(result.pass).toBe(10);
    expect(result.status).toBe('SKIP');
    expect(result.required).toBe(false);
  });

  // REPORT GENERATION
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
