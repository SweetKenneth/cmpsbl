/**
 * CodeAgent v3 - Performance Heuristics
 * Learn what makes code fast and optimize accordingly
 */

import { ASTAnalysis } from './ast-analyzer';

export interface PerformanceIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  line: number;
  suggestion: string;
  estimatedImpact: string;
}

export interface PerformanceReport {
  file: string;
  issues: PerformanceIssue[];
  score: number;
  metrics: {
    bundleSizeImpact: 'low' | 'medium' | 'high';
    renderComplexity: number;
    memoizationOpportunities: number;
    heavyImports: string[];
  };
}

export interface OptimizationSuggestion {
  type: string;
  original: string;
  optimized: string;
  explanation: string;
  impact: 'high' | 'medium' | 'low';
}

/**
 * Analyze code for performance issues
 */
export function analyzePerformance(
  code: string,
  analysis: ASTAnalysis,
  filename: string
): PerformanceReport {
  const issues: PerformanceIssue[] = [];
  
  // Check for performance anti-patterns
  issues.push(...checkReactPerformance(code, analysis));
  issues.push(...checkHeavyOperations(code));
  issues.push(...checkImportSize(analysis));
  issues.push(...checkMemoryLeaks(code, analysis));
  
  // Calculate metrics
  const heavyImports = analysis.imports
    .filter(i => isHeavyImport(i.source))
    .map(i => i.source);
  
  const renderComplexity = calculateRenderComplexity(code, analysis);
  const memoizationOpportunities = countMemoizationOpportunities(code, analysis);
  
  const bundleSizeImpact = heavyImports.length > 3 ? 'high' : heavyImports.length > 1 ? 'medium' : 'low';
  
  // Score: 100 - weighted issues
  const score = Math.max(0, 100 - 
    issues.filter(i => i.severity === 'critical').length * 20 -
    issues.filter(i => i.severity === 'high').length * 10 -
    issues.filter(i => i.severity === 'medium').length * 5 -
    issues.filter(i => i.severity === 'low').length * 2
  );
  
  return {
    file: filename,
    issues,
    score,
    metrics: {
      bundleSizeImpact,
      renderComplexity,
      memoizationOpportunities,
      heavyImports
    }
  };
}

function checkReactPerformance(code: string, analysis: ASTAnalysis): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  const lines = code.split('\n');
  
  // Check for inline function definitions in JSX
  lines.forEach((line, i) => {
    if (/<\w+[^>]*\s+on\w+\s*=\s*\{\s*\([^)]*\)\s*=>/.test(line)) {
      issues.push({
        type: 'inline-handler',
        severity: 'medium',
        message: 'Inline arrow function in JSX causes unnecessary re-renders',
        line: i + 1,
        suggestion: 'Extract to useCallback hook',
        estimatedImpact: 'Reduces re-renders by ~30%'
      });
    }
  });
  
  // Check for missing keys in lists
  lines.forEach((line, i) => {
    if (/\.map\(/.test(line) && !lines.slice(i, i + 5).some(l => /key=/.test(l))) {
      issues.push({
        type: 'missing-key',
        severity: 'high',
        message: 'List items missing key prop',
        line: i + 1,
        suggestion: 'Add unique key prop to mapped elements',
        estimatedImpact: 'Prevents full list re-render'
      });
    }
  });
  
  // Check for large component without memo
  if (analysis.hasJSX && analysis.linesOfCode > 100) {
    const hasMemo = /React\.memo|memo\(/.test(code);
    if (!hasMemo) {
      issues.push({
        type: 'large-component-no-memo',
        severity: 'medium',
        message: 'Large component without React.memo',
        line: 1,
        suggestion: 'Consider wrapping with React.memo if props are stable',
        estimatedImpact: 'Can reduce re-renders by ~50%'
      });
    }
  }
  
  // Check for expensive calculations without useMemo
  lines.forEach((line, i) => {
    if (/\.(filter|map|reduce|sort)\(/.test(line) && !/useMemo/.test(lines.slice(Math.max(0, i - 5), i).join(''))) {
      issues.push({
        type: 'unmemoized-calculation',
        severity: 'low',
        message: 'Array operation may benefit from useMemo',
        line: i + 1,
        suggestion: 'Consider useMemo for expensive calculations',
        estimatedImpact: 'Reduces CPU usage on re-renders'
      });
    }
  });
  
  return issues;
}

function checkHeavyOperations(code: string): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  const lines = code.split('\n');
  
  // Check for synchronous heavy operations
  lines.forEach((line, i) => {
    if (/JSON\.parse|JSON\.stringify/.test(line) && !/try|catch/.test(lines.slice(Math.max(0, i - 3), i + 3).join(''))) {
      issues.push({
        type: 'sync-json-parse',
        severity: 'low',
        message: 'JSON operations should be wrapped in try-catch',
        line: i + 1,
        suggestion: 'Add error handling for JSON operations',
        estimatedImpact: 'Prevents crashes on malformed data'
      });
    }
    
    // Check for blocking operations
    if (/while\s*\(true\)|for\s*\(;\s*;\s*\)/.test(line)) {
      issues.push({
        type: 'blocking-loop',
        severity: 'critical',
        message: 'Potentially blocking infinite loop',
        line: i + 1,
        suggestion: 'Add exit condition or use async iteration',
        estimatedImpact: 'Can freeze the application'
      });
    }
  });
  
  // Check for nested loops
  const nestedLoopPattern = /for.*\{[\s\S]*?for.*\{|while.*\{[\s\S]*?while.*\{/;
  if (nestedLoopPattern.test(code)) {
    const match = code.match(nestedLoopPattern);
    if (match) {
      const line = code.substring(0, match.index).split('\n').length;
      issues.push({
        type: 'nested-loop',
        severity: 'medium',
        message: 'Nested loops may cause O(n²) performance',
        line,
        suggestion: 'Consider using Map/Set or restructuring the algorithm',
        estimatedImpact: 'Can significantly impact large datasets'
      });
    }
  }
  
  return issues;
}

function checkImportSize(analysis: ASTAnalysis): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  
  for (const imp of analysis.imports) {
    if (isHeavyImport(imp.source)) {
      issues.push({
        type: 'heavy-import',
        severity: 'medium',
        message: `Heavy import: ${imp.source}`,
        line: imp.line,
        suggestion: 'Consider dynamic import or lighter alternative',
        estimatedImpact: 'Adds to initial bundle size'
      });
    }
    
    // Check for full library imports
    if (imp.specifiers.length === 1 && imp.isDefault && 
        ['lodash', 'moment', 'date-fns'].includes(imp.source)) {
      issues.push({
        type: 'full-library-import',
        severity: 'high',
        message: `Full library import of ${imp.source}`,
        line: imp.line,
        suggestion: `Use specific imports: import ${imp.specifiers[0]} from '${imp.source}/${imp.specifiers[0]}'`,
        estimatedImpact: 'Can reduce bundle by 50KB+'
      });
    }
  }
  
  return issues;
}

function checkMemoryLeaks(code: string, analysis: ASTAnalysis): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  const lines = code.split('\n');
  
  // Check for useEffect without cleanup
  let inUseEffect = false;
  let effectStart = 0;
  let hasCleanup = false;
  
  lines.forEach((line, i) => {
    if (/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{/.test(line)) {
      inUseEffect = true;
      effectStart = i;
      hasCleanup = false;
    }
    
    if (inUseEffect) {
      if (/return\s*\(\s*\)\s*=>|return\s*\w+;/.test(line)) {
        hasCleanup = true;
      }
      
      if (/\}\s*,\s*\[/.test(line)) {
        if (!hasCleanup && /setInterval|setTimeout|addEventListener|subscribe/.test(lines.slice(effectStart, i + 1).join(''))) {
          issues.push({
            type: 'missing-cleanup',
            severity: 'high',
            message: 'useEffect with subscription/timer missing cleanup',
            line: effectStart + 1,
            suggestion: 'Add cleanup function to prevent memory leaks',
            estimatedImpact: 'Prevents memory leaks and stale closures'
          });
        }
        inUseEffect = false;
      }
    }
  });
  
  // Check for event listeners
  lines.forEach((line, i) => {
    if (/addEventListener/.test(line) && !code.includes('removeEventListener')) {
      issues.push({
        type: 'event-listener-leak',
        severity: 'high',
        message: 'Event listener added without corresponding removal',
        line: i + 1,
        suggestion: 'Add removeEventListener in cleanup function',
        estimatedImpact: 'Prevents memory leaks'
      });
    }
  });
  
  return issues;
}

function isHeavyImport(source: string): boolean {
  const heavyPackages = [
    'moment',
    'lodash',
    '@mui/material',
    '@material-ui',
    'antd',
    'd3',
    'three',
    'chart.js',
    'xlsx',
    'pdf-lib',
    'aws-sdk'
  ];
  
  return heavyPackages.some(pkg => source.includes(pkg));
}

function calculateRenderComplexity(code: string, analysis: ASTAnalysis): number {
  let complexity = 0;
  
  // Base complexity from JSX
  complexity += (code.match(/<[A-Z][a-zA-Z]*|<[a-z]+/g) || []).length;
  
  // Add for conditional rendering
  complexity += (code.match(/\{\s*\w+\s*&&|\{\s*\w+\s*\?/g) || []).length * 2;
  
  // Add for mapped elements
  complexity += (code.match(/\.map\(/g) || []).length * 3;
  
  // Add for nested components
  complexity += analysis.cyclomaticComplexity;
  
  return Math.min(100, complexity);
}

function countMemoizationOpportunities(code: string, analysis: ASTAnalysis): number {
  let opportunities = 0;
  
  // Unmemoized callbacks
  const inlineCallbacks = (code.match(/on\w+\s*=\s*\{\s*\([^)]*\)\s*=>/g) || []).length;
  opportunities += inlineCallbacks;
  
  // Expensive calculations without useMemo
  const calculations = (code.match(/\.(filter|map|reduce|sort|find)\(/g) || []).length;
  const memoized = (code.match(/useMemo/g) || []).length;
  opportunities += Math.max(0, calculations - memoized);
  
  // Large components without memo
  if (analysis.hasJSX && analysis.linesOfCode > 50 && !/memo\(/.test(code)) {
    opportunities++;
  }
  
  return opportunities;
}

/**
 * Generate optimization suggestions
 */
export function suggestOptimizations(
  code: string,
  analysis: ASTAnalysis
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  
  // Suggest useCallback for inline handlers
  const handlerMatch = code.match(/<\w+[^>]*\s+(on\w+)\s*=\s*\{\s*\([^)]*\)\s*=>\s*[^}]+\}/);
  if (handlerMatch) {
    suggestions.push({
      type: 'useCallback',
      original: handlerMatch[0],
      optimized: `const handle${handlerMatch[1].slice(2)} = useCallback(() => { /* handler */ }, []);`,
      explanation: 'Extract to useCallback to prevent re-renders',
      impact: 'medium'
    });
  }
  
  // Suggest dynamic imports for heavy modules
  for (const imp of analysis.imports) {
    if (isHeavyImport(imp.source)) {
      suggestions.push({
        type: 'dynamic-import',
        original: `import { ${imp.specifiers.join(', ')} } from '${imp.source}'`,
        optimized: `const ${imp.specifiers[0]} = lazy(() => import('${imp.source}'))`,
        explanation: 'Use dynamic import to reduce initial bundle size',
        impact: 'high'
      });
    }
  }
  
  return suggestions;
}
