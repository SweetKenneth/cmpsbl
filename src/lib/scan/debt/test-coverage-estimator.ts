/**
 * #18 — Test Coverage Estimator
 * Analyze test file patterns, assertion density, and route coverage
 * to estimate which critical paths lack automated verification.
 */

export interface TestCoverageEstimate {
  testFiles: TestFileInfo[];
  coveredPaths: CoveredPath[];
  uncoveredPaths: UncoveredPath[];
  metrics: TestMetrics;
  criticalUncoveredPaths: string[];
  estimatedCoveragePercent: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
  scanTimestamp: string;
}

export interface TestFileInfo {
  path: string;
  testCount: number;
  assertionCount: number;
  testTypes: Array<'unit' | 'integration' | 'e2e' | 'snapshot' | 'unknown'>;
  describedModule: string | null;
  mockCount: number;
  hasSetup: boolean;
  hasTeardown: boolean;
}

export interface CoveredPath {
  sourcePath: string;
  testPath: string;
  confidence: number;
}

export interface UncoveredPath {
  path: string;
  type: 'component' | 'utility' | 'api_route' | 'hook' | 'store' | 'middleware' | 'model';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

export interface TestMetrics {
  totalTestFiles: number;
  totalTests: number;
  totalAssertions: number;
  avgAssertionsPerTest: number;
  testToSourceRatio: number;
  testTypes: Record<string, number>;
}

const TEST_FILE_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /__tests__\//,
  /test\//,
  /spec\//,
  /\.cy\.[jt]sx?$/, // Cypress
  /\.stories\.[jt]sx?$/, // Storybook (visual tests)
];

const ASSERTION_PATTERNS = [
  /expect\s*\(/g,
  /assert\s*[.(]/g,
  /\.should\s*[.(]/g,
  /\.toBe\s*\(/g,
  /\.toEqual\s*\(/g,
  /\.toHaveBeenCalled/g,
  /\.toThrow/g,
  /\.toMatch/g,
  /\.toContain/g,
  /\.toHaveLength/g,
  /\.resolves\./g,
  /\.rejects\./g,
];

const TEST_BLOCK_PATTERNS = [
  /(?:it|test)\s*\(\s*['"`]/g,
  /describe\s*\(\s*['"`]/g,
];

const MOCK_PATTERNS = [
  /jest\.mock/g,
  /vi\.mock/g,
  /sinon\.stub/g,
  /cy\.intercept/g,
  /mock\s*\(/g,
  /spyOn/g,
];

const CRITICAL_PATH_PATTERNS = [
  { pattern: /auth|login|signup|register/i, type: 'api_route' as const, criticality: 'critical' as const },
  { pattern: /payment|checkout|billing/i, type: 'api_route' as const, criticality: 'critical' as const },
  { pattern: /user|profile|account/i, type: 'api_route' as const, criticality: 'high' as const },
  { pattern: /middleware/i, type: 'middleware' as const, criticality: 'high' as const },
  { pattern: /hook/i, type: 'hook' as const, criticality: 'medium' as const },
  { pattern: /store|state/i, type: 'store' as const, criticality: 'medium' as const },
  { pattern: /util|helper|lib/i, type: 'utility' as const, criticality: 'medium' as const },
];

/**
 * Estimate test coverage without running tests
 */
export function estimateTestCoverage(
  allFiles: Array<{ path: string; content: string }>
): TestCoverageEstimate {
  const testFiles: TestFileInfo[] = [];
  const coveredPaths: CoveredPath[] = [];
  const uncoveredPaths: UncoveredPath[] = [];
  const recommendations: string[] = [];

  // Separate test files from source files
  const tests = allFiles.filter(f => TEST_FILE_PATTERNS.some(p => p.test(f.path)));
  const sources = allFiles.filter(f => 
    !TEST_FILE_PATTERNS.some(p => p.test(f.path)) &&
    /\.[jt]sx?$/.test(f.path) &&
    !/node_modules|\.d\.ts$|\.config\.|\.min\./i.test(f.path)
  );

  // Analyze test files
  for (const test of tests) {
    const testCount = countMatches(test.content, TEST_BLOCK_PATTERNS);
    const assertionCount = countMatches(test.content, ASSERTION_PATTERNS);
    const mockCount = countMatches(test.content, MOCK_PATTERNS);

    const describeMatch = test.content.match(/describe\s*\(\s*['"`]([^'"`]+)['"`]/);
    const describedModule = describeMatch?.[1] || null;

    const testTypes: TestFileInfo['testTypes'] = [];
    if (/cy\.|cypress/i.test(test.content)) testTypes.push('e2e');
    else if (/render|screen|fireEvent|userEvent/i.test(test.content)) testTypes.push('integration');
    else if (/toMatchSnapshot|toMatchInlineSnapshot/i.test(test.content)) testTypes.push('snapshot');
    else if (assertionCount > 0) testTypes.push('unit');
    else testTypes.push('unknown');

    testFiles.push({
      path: test.path,
      testCount,
      assertionCount,
      testTypes,
      describedModule,
      mockCount,
      hasSetup: /beforeEach|beforeAll|setUp/i.test(test.content),
      hasTeardown: /afterEach|afterAll|tearDown/i.test(test.content),
    });

    // Try to match test file to source file
    const sourcePath = test.path
      .replace(/\.test\.|\.spec\./, '.')
      .replace(/__tests__\//, '')
      .replace(/test\//, 'src/');

    const matchedSource = sources.find(s => 
      s.path === sourcePath || 
      s.path.includes(sourcePath.replace(/\.[jt]sx?$/, ''))
    );

    if (matchedSource) {
      coveredPaths.push({
        sourcePath: matchedSource.path,
        testPath: test.path,
        confidence: 0.8,
      });
    }
  }

  // Find uncovered source files
  const coveredSourcePaths = new Set(coveredPaths.map(c => c.sourcePath));
  
  for (const source of sources) {
    if (coveredSourcePaths.has(source.path)) continue;

    // Determine file type and criticality
    let fileType: UncoveredPath['type'] = 'utility';
    let criticality: UncoveredPath['criticality'] = 'low';

    for (const { pattern, type, criticality: crit } of CRITICAL_PATH_PATTERNS) {
      if (pattern.test(source.path)) {
        fileType = type;
        criticality = crit;
        break;
      }
    }

    if (/component|page|view|screen/i.test(source.path)) fileType = 'component';
    if (/\.tsx$/.test(source.path) && /export\s+(?:default\s+)?function\s+\w+/.test(source.content)) fileType = 'component';

    uncoveredPaths.push({
      path: source.path,
      type: fileType,
      criticality,
      reason: 'No matching test file found',
    });
  }

  // Test metrics
  const totalTests = testFiles.reduce((s, t) => s + t.testCount, 0);
  const totalAssertions = testFiles.reduce((s, t) => s + t.assertionCount, 0);
  const testTypeCount: Record<string, number> = {};
  for (const tf of testFiles) {
    for (const type of tf.testTypes) {
      testTypeCount[type] = (testTypeCount[type] || 0) + 1;
    }
  }

  const metrics: TestMetrics = {
    totalTestFiles: testFiles.length,
    totalTests,
    totalAssertions,
    avgAssertionsPerTest: totalTests > 0 ? Math.round(totalAssertions / totalTests * 10) / 10 : 0,
    testToSourceRatio: sources.length > 0 ? Math.round(testFiles.length / sources.length * 100) / 100 : 0,
    testTypes: testTypeCount,
  };

  // Coverage estimate
  const estimatedCoveragePercent = sources.length > 0
    ? Math.round((coveredPaths.length / sources.length) * 100)
    : 0;

  const grade: TestCoverageEstimate['grade'] =
    estimatedCoveragePercent >= 80 ? 'A' :
    estimatedCoveragePercent >= 60 ? 'B' :
    estimatedCoveragePercent >= 40 ? 'C' :
    estimatedCoveragePercent >= 20 ? 'D' : 'F';

  // Critical uncovered paths
  const criticalUncoveredPaths = uncoveredPaths
    .filter(u => u.criticality === 'critical' || u.criticality === 'high')
    .map(u => u.path);

  // Recommendations
  if (testFiles.length === 0) {
    recommendations.push('No test files detected — add automated tests for critical paths');
  }
  if (criticalUncoveredPaths.length > 0) {
    recommendations.push(`${criticalUncoveredPaths.length} critical/high-priority paths lack test coverage`);
  }
  if (metrics.avgAssertionsPerTest < 2 && totalTests > 0) {
    recommendations.push('Low assertion density — tests may not be thoroughly validating behavior');
  }
  if (!testTypeCount['integration'] && !testTypeCount['e2e']) {
    recommendations.push('No integration or E2E tests detected — add tests that verify complete user flows');
  }

  return {
    testFiles,
    coveredPaths,
    uncoveredPaths,
    metrics,
    criticalUncoveredPaths,
    estimatedCoveragePercent,
    grade,
    recommendations,
    scanTimestamp: new Date().toISOString(),
  };
}

function countMatches(content: string, patterns: RegExp[]): number {
  let count = 0;
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    const matches = content.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}
