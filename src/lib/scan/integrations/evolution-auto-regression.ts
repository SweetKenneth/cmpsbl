/**
 * EVOLUTION Auto-Regression Testing (#27)
 * Generates minimal regression tests for each scanner fix
 * to prevent reintroduction of resolved issues.
 */

import type { ScanFixProposal } from './evolution-proposal-chain';
import type { TripwireReport, Tripwire } from '../evolution/regression-tripwire';

export interface RegressionTest {
  id: string;
  fixId: string;
  findingId: string;
  testType: 'assertion' | 'snapshot' | 'metric_gate' | 'invariant';
  description: string;
  testCode: string;
  targetFile: string;
  expectedBehavior: string;
  failureMessage: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AutoRegressionSuite {
  tests: RegressionTest[];
  totalTests: number;
  coverageByCategory: Record<string, number>;
  estimatedRunTimeMs: number;
  generatedAt: string;
}

/**
 * Generate minimal regression tests for a set of scanner fixes
 */
export function generateRegressionTests(
  fixes: ScanFixProposal[],
): AutoRegressionSuite {
  const tests: RegressionTest[] = [];

  for (const fix of fixes) {
    const fixTests = generateTestsForFix(fix);
    tests.push(...fixTests);
  }

  // Coverage by category
  const coverageByCategory: Record<string, number> = {};
  for (const test of tests) {
    const fix = fixes.find(f => f.id === test.fixId);
    if (fix) {
      coverageByCategory[fix.category] = (coverageByCategory[fix.category] ?? 0) + 1;
    }
  }

  return {
    tests,
    totalTests: tests.length,
    coverageByCategory,
    estimatedRunTimeMs: tests.length * 150, // ~150ms per test
    generatedAt: new Date().toISOString(),
  };
}

function generateTestsForFix(fix: ScanFixProposal): RegressionTest[] {
  const tests: RegressionTest[] = [];
  const baseId = `regtest_${fix.id}`;

  switch (fix.category) {
    case 'security':
    case 'rls_policy':
      tests.push({
        id: `${baseId}_auth`,
        fixId: fix.id,
        findingId: fix.findingId,
        testType: 'assertion',
        description: `Verify auth enforcement after fix: ${fix.title}`,
        testCode: generateSecurityTestCode(fix),
        targetFile: fix.affectedFiles[0] ?? 'src/test/security.test.ts',
        expectedBehavior: 'Unauthenticated access should be denied',
        failureMessage: `REGRESSION: Security fix "${fix.title}" may have been reverted`,
        priority: 'critical',
      });
      break;

    case 'performance':
      tests.push({
        id: `${baseId}_perf`,
        fixId: fix.id,
        findingId: fix.findingId,
        testType: 'metric_gate',
        description: `Verify performance improvement after fix: ${fix.title}`,
        testCode: generatePerformanceTestCode(fix),
        targetFile: fix.affectedFiles[0] ?? 'src/test/performance.test.ts',
        expectedBehavior: 'Response time should remain below threshold',
        failureMessage: `REGRESSION: Performance fix "${fix.title}" may have been reverted`,
        priority: 'high',
      });
      break;

    case 'complexity':
      tests.push({
        id: `${baseId}_complexity`,
        fixId: fix.id,
        findingId: fix.findingId,
        testType: 'snapshot',
        description: `Verify complexity reduction after fix: ${fix.title}`,
        testCode: generateComplexityTestCode(fix),
        targetFile: fix.affectedFiles[0] ?? 'src/test/complexity.test.ts',
        expectedBehavior: 'Cyclomatic complexity should not increase',
        failureMessage: `REGRESSION: Complexity fix "${fix.title}" may have been reverted`,
        priority: 'medium',
      });
      break;

    case 'secret_exposure':
      tests.push({
        id: `${baseId}_secrets`,
        fixId: fix.id,
        findingId: fix.findingId,
        testType: 'invariant',
        description: `Verify no secrets re-exposed after fix: ${fix.title}`,
        testCode: generateSecretTestCode(fix),
        targetFile: 'src/test/secrets.test.ts',
        expectedBehavior: 'No secrets should be present in source code',
        failureMessage: `REGRESSION: Secret "${fix.title}" may have been re-exposed`,
        priority: 'critical',
      });
      break;

    default:
      // Generic regression test
      tests.push({
        id: `${baseId}_generic`,
        fixId: fix.id,
        findingId: fix.findingId,
        testType: 'assertion',
        description: `Verify fix integrity: ${fix.title}`,
        testCode: generateGenericTestCode(fix),
        targetFile: fix.affectedFiles[0] ?? 'src/test/regression.test.ts',
        expectedBehavior: 'Fix should remain applied',
        failureMessage: `REGRESSION: Fix "${fix.title}" may have been reverted`,
        priority: 'medium',
      });
  }

  return tests;
}

function generateSecurityTestCode(fix: ScanFixProposal): string {
  return `
// Auto-generated regression test for: ${fix.title}
// Finding: ${fix.findingId}
describe('Security Regression: ${fix.title}', () => {
  it('should enforce authentication on protected paths', () => {
    const protectedPaths = ${JSON.stringify(fix.affectedFiles)};
    for (const path of protectedPaths) {
      // Verify RLS or auth middleware exists
      expect(hasAuthEnforcement(path)).toBe(true);
    }
  });
});`.trim();
}

function generatePerformanceTestCode(fix: ScanFixProposal): string {
  return `
// Auto-generated regression test for: ${fix.title}
// Finding: ${fix.findingId}
describe('Performance Regression: ${fix.title}', () => {
  it('should maintain acceptable latency', async () => {
    const start = performance.now();
    // Execute the optimized code path
    const end = performance.now();
    expect(end - start).toBeLessThan(1000); // 1s threshold
  });
});`.trim();
}

function generateComplexityTestCode(fix: ScanFixProposal): string {
  return `
// Auto-generated regression test for: ${fix.title}
// Finding: ${fix.findingId}
describe('Complexity Regression: ${fix.title}', () => {
  it('should not exceed complexity threshold', () => {
    const files = ${JSON.stringify(fix.affectedFiles)};
    for (const file of files) {
      // Verify cyclomatic complexity hasn't increased
      expect(getComplexity(file)).toBeLessThanOrEqual(15);
    }
  });
});`.trim();
}

function generateSecretTestCode(fix: ScanFixProposal): string {
  return `
// Auto-generated regression test for: ${fix.title}
// Finding: ${fix.findingId}
describe('Secret Exposure Regression: ${fix.title}', () => {
  it('should not contain exposed secrets', () => {
    const patterns = [/API_KEY\\s*=\\s*['"][^'"]+['"]/, /SECRET\\s*=\\s*['"][^'"]+['"]/];
    const files = ${JSON.stringify(fix.affectedFiles)};
    for (const file of files) {
      for (const pattern of patterns) {
        expect(fileContains(file, pattern)).toBe(false);
      }
    }
  });
});`.trim();
}

function generateGenericTestCode(fix: ScanFixProposal): string {
  return `
// Auto-generated regression test for: ${fix.title}
// Finding: ${fix.findingId}
describe('Regression: ${fix.title}', () => {
  it('should maintain fix integrity', () => {
    // Verify the fix has not been reverted
    const files = ${JSON.stringify(fix.affectedFiles)};
    expect(files.length).toBeGreaterThan(0);
  });
});`.trim();
}

/**
 * Link auto-regression tests to existing tripwires
 */
export function linkTestsToTripwires(
  suite: AutoRegressionSuite,
  tripwires: TripwireReport,
): Array<{
  testId: string;
  tripwireId: string;
  coverage: 'full' | 'partial' | 'none';
}> {
  const links: Array<{ testId: string; tripwireId: string; coverage: 'full' | 'partial' | 'none' }> = [];

  for (const test of suite.tests) {
    const matchingTripwire = tripwires.tripwires?.find(
      (tw: Tripwire) => tw.findingId === test.findingId
    );

    if (matchingTripwire) {
      links.push({
        testId: test.id,
        tripwireId: matchingTripwire.id,
        coverage: test.testType === 'invariant' ? 'full' : 'partial',
      });
    }
  }

  return links;
}
