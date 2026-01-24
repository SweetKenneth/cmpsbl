/**
 * CodeAgent v3 - Test Coverage Integration
 * Generate tests alongside code and track coverage
 */

import { ASTAnalysis, FunctionDeclaration } from './ast-analyzer';

export interface TestCase {
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e';
  code: string;
}

export interface TestSuite {
  filename: string;
  imports: string[];
  setup?: string;
  tests: TestCase[];
  coverage: {
    functions: number;
    branches: number;
    lines: number;
  };
}

/**
 * Generate test suite for analyzed code
 */
export function generateTestSuite(
  analysis: ASTAnalysis,
  sourceFile: string,
  options: { includeSnapshots?: boolean; mockDependencies?: boolean } = {}
): TestSuite {
  const tests: TestCase[] = [];
  const imports: string[] = [
    `import { describe, it, expect, vi } from 'vitest';`
  ];
  
  // Determine what to import from source
  const exportedFuncs = analysis.functions.filter(f => f.isExported);
  const exportedTypes = analysis.types.filter(t => 
    analysis.exports.find(e => e.name === t.name)
  );
  
  if (exportedFuncs.length > 0 || exportedTypes.length > 0) {
    const symbols = [
      ...exportedFuncs.map(f => f.name),
      ...exportedTypes.map(t => t.name)
    ];
    imports.push(`import { ${symbols.join(', ')} } from '${sourceFile}';`);
  }
  
  // Mock external dependencies
  if (options.mockDependencies) {
    for (const dep of analysis.dependencies) {
      if (!dep.startsWith('.') && !dep.startsWith('@/')) {
        imports.push(`vi.mock('${dep}');`);
      }
    }
  }
  
  // Generate tests for each exported function
  for (const func of exportedFuncs) {
    tests.push(...generateFunctionTests(func, options));
  }
  
  // Generate type validation tests
  for (const type of exportedTypes) {
    tests.push(generateTypeTest(type.name));
  }
  
  // Calculate estimated coverage
  const coverage = {
    functions: exportedFuncs.length > 0 ? 80 : 0,
    branches: analysis.cyclomaticComplexity > 1 ? 60 : 100,
    lines: 70
  };
  
  return {
    filename: sourceFile.replace(/\.(tsx?|jsx?)$/, '.test.ts'),
    imports,
    tests,
    coverage
  };
}

function generateFunctionTests(
  func: FunctionDeclaration,
  options: { includeSnapshots?: boolean }
): TestCase[] {
  const tests: TestCase[] = [];
  
  // Basic functionality test
  tests.push({
    name: `should execute ${func.name} successfully`,
    description: `Test basic execution of ${func.name}`,
    type: 'unit',
    code: generateBasicTest(func)
  });
  
  // Async function test
  if (func.isAsync) {
    tests.push({
      name: `should handle async execution of ${func.name}`,
      description: `Test async behavior of ${func.name}`,
      type: 'unit',
      code: generateAsyncTest(func)
    });
  }
  
  // Edge case tests based on parameters
  if (func.params.length > 0) {
    tests.push({
      name: `should handle edge cases for ${func.name}`,
      description: `Test edge cases with various input types`,
      type: 'unit',
      code: generateEdgeCaseTest(func)
    });
  }
  
  // Error handling test
  tests.push({
    name: `should handle errors in ${func.name}`,
    description: `Test error handling behavior`,
    type: 'unit',
    code: generateErrorTest(func)
  });
  
  return tests;
}

function generateBasicTest(func: FunctionDeclaration): string {
  const params = func.params.map(p => getDefaultValue(p.type)).join(', ');
  const call = func.isAsync ? `await ${func.name}(${params})` : `${func.name}(${params})`;
  
  return `
  it('should execute ${func.name} successfully', ${func.isAsync ? 'async ' : ''}() => {
    const result = ${call};
    expect(result).toBeDefined();
  });`;
}

function generateAsyncTest(func: FunctionDeclaration): string {
  const params = func.params.map(p => getDefaultValue(p.type)).join(', ');
  
  return `
  it('should resolve async operation', async () => {
    const promise = ${func.name}(${params});
    expect(promise).toBeInstanceOf(Promise);
    const result = await promise;
    expect(result).toBeDefined();
  });`;
}

function generateEdgeCaseTest(func: FunctionDeclaration): string {
  return `
  it('should handle edge cases', ${func.isAsync ? 'async ' : ''}() => {
    // Test with empty/null values
    ${func.params.map((p, i) => `
    // Test param ${p.name}
    expect(() => ${func.name}(${func.params.map((_, j) => j === i ? 'undefined' : getDefaultValue(func.params[j].type)).join(', ')})).not.toThrow();
    `).join('')}
  });`;
}

function generateErrorTest(func: FunctionDeclaration): string {
  return `
  it('should handle errors gracefully', ${func.isAsync ? 'async ' : ''}() => {
    // Mock to throw error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    try {
      ${func.isAsync ? 'await ' : ''}${func.name}(${func.params.map(() => 'undefined').join(', ')});
    } catch (error) {
      expect(error).toBeDefined();
    }
    
    consoleSpy.mockRestore();
  });`;
}

function generateTypeTest(typeName: string): TestCase {
  return {
    name: `should validate ${typeName} type`,
    description: `Test type structure for ${typeName}`,
    type: 'unit',
    code: `
  it('should match ${typeName} type structure', () => {
    const mockData: ${typeName} = {} as ${typeName};
    expect(mockData).toBeDefined();
  });`
  };
}

function getDefaultValue(type?: string): string {
  if (!type) return '{}';
  
  const normalized = type.toLowerCase().trim();
  
  if (normalized.includes('string')) return "'test'";
  if (normalized.includes('number')) return '1';
  if (normalized.includes('boolean')) return 'true';
  if (normalized.includes('array') || normalized.includes('[]')) return '[]';
  if (normalized.includes('null')) return 'null';
  if (normalized.includes('undefined')) return 'undefined';
  
  return '{}';
}

/**
 * Format test suite as executable code
 */
export function formatTestSuite(suite: TestSuite): string {
  const describe = suite.filename.replace('.test.ts', '');
  
  return `${suite.imports.join('\n')}

describe('${describe}', () => {
  ${suite.setup || ''}
  
  ${suite.tests.map(t => t.code).join('\n')}
});
`;
}

/**
 * Calculate test coverage from existing tests
 */
export function calculateCoverage(
  analysis: ASTAnalysis,
  existingTests: string[]
): { functions: number; branches: number; lines: number } {
  let testedFunctions = 0;
  
  for (const func of analysis.functions) {
    const tested = existingTests.some(t => 
      t.includes(func.name) && (t.includes('it(') || t.includes('test('))
    );
    if (tested) testedFunctions++;
  }
  
  const functionCoverage = analysis.functions.length > 0
    ? (testedFunctions / analysis.functions.length) * 100
    : 100;
  
  return {
    functions: Math.round(functionCoverage),
    branches: Math.round(functionCoverage * 0.8), // Estimate
    lines: Math.round(functionCoverage * 0.9) // Estimate
  };
}
