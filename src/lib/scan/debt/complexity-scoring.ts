/**
 * #16 — Complexity Scoring Engine
 * Calculate cyclomatic complexity, coupling metrics, and file/function size distributions.
 */

export interface ComplexityReport {
  files: FileComplexity[];
  hotspots: ComplexityHotspot[];
  distributions: SizeDistribution;
  couplingMetrics: CouplingMetrics;
  overallComplexity: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  refactoringTargets: RefactoringTarget[];
  scanTimestamp: string;
}

export interface FileComplexity {
  path: string;
  lines: number;
  functions: FunctionComplexity[];
  imports: number;
  exports: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
}

export interface FunctionComplexity {
  name: string;
  startLine: number;
  lines: number;
  params: number;
  cyclomaticComplexity: number;
  nestingDepth: number;
  isComplex: boolean;
}

export interface ComplexityHotspot {
  file: string;
  function: string | null;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'error' | 'critical';
}

export interface SizeDistribution {
  avgFileLines: number;
  maxFileLines: number;
  avgFunctionLines: number;
  maxFunctionLines: number;
  filesOver300Lines: number;
  functionsOver50Lines: number;
  filesOver10Imports: number;
}

export interface CouplingMetrics {
  avgImportsPerFile: number;
  maxImportsPerFile: number;
  mostImportedFile: string | null;
  circularDependencies: string[][];
  afferentCoupling: Record<string, number>;
}

export interface RefactoringTarget {
  file: string;
  function: string | null;
  reason: string;
  effort: 'small' | 'medium' | 'large';
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
}

// Thresholds
const THRESHOLDS = {
  fileLines: { warning: 300, error: 500, critical: 1000 },
  functionLines: { warning: 30, error: 50, critical: 100 },
  cyclomaticComplexity: { warning: 10, error: 20, critical: 30 },
  nestingDepth: { warning: 3, error: 5, critical: 7 },
  params: { warning: 4, error: 6, critical: 8 },
  imports: { warning: 10, error: 15, critical: 20 },
  cognitiveComplexity: { warning: 15, error: 25, critical: 40 },
};

/**
 * Analyze complexity across the codebase
 */
export function analyzeComplexity(
  files: Array<{ path: string; content: string }>
): ComplexityReport {
  const fileComplexities: FileComplexity[] = [];
  const hotspots: ComplexityHotspot[] = [];
  const refactoringTargets: RefactoringTarget[] = [];

  for (const file of files) {
    // Skip non-code files
    if (!/\.[jt]sx?$/.test(file.path)) continue;
    if (/node_modules|\.test\.|\.spec\.|\.d\.ts$|\.min\./i.test(file.path)) continue;

    const lines = file.content.split('\n');
    const lineCount = lines.length;

    // Count imports
    const importCount = (file.content.match(/^import\s/gm) || []).length;
    const exportCount = (file.content.match(/^export\s/gm) || []).length;

    // Extract and analyze functions
    const functions = extractFunctions(file.content);

    // File-level cyclomatic complexity
    const fileCyclomatic = calculateCyclomaticComplexity(file.content);
    const fileCognitive = calculateCognitiveComplexity(file.content);

    // Maintainability index (simplified Halstead-based)
    const maintainabilityIndex = calculateMaintainabilityIndex(lineCount, fileCyclomatic, importCount);

    fileComplexities.push({
      path: file.path,
      lines: lineCount,
      functions,
      imports: importCount,
      exports: exportCount,
      cyclomaticComplexity: fileCyclomatic,
      cognitiveComplexity: fileCognitive,
      maintainabilityIndex,
    });

    // Check thresholds for hotspots
    if (lineCount >= THRESHOLDS.fileLines.warning) {
      const severity = lineCount >= THRESHOLDS.fileLines.critical ? 'critical' : lineCount >= THRESHOLDS.fileLines.error ? 'error' : 'warning';
      hotspots.push({ file: file.path, function: null, metric: 'fileLines', value: lineCount, threshold: THRESHOLDS.fileLines[severity], severity });
      refactoringTargets.push({
        file: file.path, function: null,
        reason: `File has ${lineCount} lines (threshold: ${THRESHOLDS.fileLines.warning})`,
        effort: lineCount > 500 ? 'large' : 'medium',
        impact: 'medium',
        suggestion: 'Split into smaller, focused modules with single responsibilities',
      });
    }

    if (importCount >= THRESHOLDS.imports.warning) {
      hotspots.push({ file: file.path, function: null, metric: 'imports', value: importCount, threshold: THRESHOLDS.imports.warning, severity: 'warning' });
    }

    for (const fn of functions) {
      if (fn.cyclomaticComplexity >= THRESHOLDS.cyclomaticComplexity.warning) {
        const severity = fn.cyclomaticComplexity >= THRESHOLDS.cyclomaticComplexity.critical ? 'critical' : fn.cyclomaticComplexity >= THRESHOLDS.cyclomaticComplexity.error ? 'error' : 'warning';
        hotspots.push({ file: file.path, function: fn.name, metric: 'cyclomaticComplexity', value: fn.cyclomaticComplexity, threshold: THRESHOLDS.cyclomaticComplexity[severity], severity });
        refactoringTargets.push({
          file: file.path, function: fn.name,
          reason: `Cyclomatic complexity: ${fn.cyclomaticComplexity}`,
          effort: fn.cyclomaticComplexity > 20 ? 'large' : 'medium',
          impact: 'high',
          suggestion: 'Extract conditional branches into separate functions. Use early returns to reduce nesting.',
        });
      }

      if (fn.nestingDepth >= THRESHOLDS.nestingDepth.warning) {
        hotspots.push({ file: file.path, function: fn.name, metric: 'nestingDepth', value: fn.nestingDepth, threshold: THRESHOLDS.nestingDepth.warning, severity: 'warning' });
      }
    }
  }

  // Size distribution
  const allFunctions = fileComplexities.flatMap(f => f.functions);
  const distributions: SizeDistribution = {
    avgFileLines: Math.round(fileComplexities.reduce((s, f) => s + f.lines, 0) / Math.max(fileComplexities.length, 1)),
    maxFileLines: Math.max(0, ...fileComplexities.map(f => f.lines)),
    avgFunctionLines: Math.round(allFunctions.reduce((s, f) => s + f.lines, 0) / Math.max(allFunctions.length, 1)),
    maxFunctionLines: Math.max(0, ...allFunctions.map(f => f.lines)),
    filesOver300Lines: fileComplexities.filter(f => f.lines > 300).length,
    functionsOver50Lines: allFunctions.filter(f => f.lines > 50).length,
    filesOver10Imports: fileComplexities.filter(f => f.imports > 10).length,
  };

  // Coupling metrics
  const couplingMetrics: CouplingMetrics = {
    avgImportsPerFile: Math.round(fileComplexities.reduce((s, f) => s + f.imports, 0) / Math.max(fileComplexities.length, 1) * 10) / 10,
    maxImportsPerFile: Math.max(0, ...fileComplexities.map(f => f.imports)),
    mostImportedFile: null,
    circularDependencies: [],
    afferentCoupling: {},
  };

  // Overall complexity score
  const avgComplexity = fileComplexities.reduce((s, f) => s + f.cyclomaticComplexity, 0) / Math.max(fileComplexities.length, 1);
  const overallComplexity = Math.round(avgComplexity * 10) / 10;

  const grade: ComplexityReport['grade'] = 
    overallComplexity <= 5 ? 'A' :
    overallComplexity <= 10 ? 'B' :
    overallComplexity <= 20 ? 'C' :
    overallComplexity <= 30 ? 'D' : 'F';

  return {
    files: fileComplexities,
    hotspots: hotspots.sort((a, b) => { const sev = { critical: 3, error: 2, warning: 1 }; return sev[b.severity] - sev[a.severity]; }),
    distributions,
    couplingMetrics,
    overallComplexity,
    grade,
    refactoringTargets: refactoringTargets.sort((a, b) => { const imp = { high: 3, medium: 2, low: 1 }; return imp[b.impact] - imp[a.impact]; }),
    scanTimestamp: new Date().toISOString(),
  };
}

function extractFunctions(content: string): FunctionComplexity[] {
  const functions: FunctionComplexity[] = [];
  const lines = content.split('\n');
  
  const fnPattern = /(?:(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>)/;
  
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(fnPattern);
    if (match) {
      const name = match[1] || match[2] || 'anonymous';
      const startLine = i;
      
      // Estimate function end by counting braces
      let braceCount = 0;
      let endLine = i;
      let started = false;
      
      for (let j = i; j < lines.length && j < i + 200; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') { braceCount++; started = true; }
          if (ch === '}') braceCount--;
        }
        if (started && braceCount <= 0) { endLine = j; break; }
      }
      
      const fnContent = lines.slice(startLine, endLine + 1).join('\n');
      const fnLines = endLine - startLine + 1;
      const paramMatch = lines[i].match(/\(([^)]*)\)/);
      const params = paramMatch?.[1] ? paramMatch[1].split(',').filter(Boolean).length : 0;
      
      functions.push({
        name,
        startLine: startLine + 1,
        lines: fnLines,
        params,
        cyclomaticComplexity: calculateCyclomaticComplexity(fnContent),
        nestingDepth: calculateNestingDepth(fnContent),
        isComplex: false,
      });
    }
  }

  for (const fn of functions) {
    fn.isComplex = fn.cyclomaticComplexity >= 10 || fn.nestingDepth >= 4 || fn.lines >= 50;
  }

  return functions;
}

function calculateCyclomaticComplexity(code: string): number {
  let complexity = 1;
  const patterns = [/\bif\b/g, /\belse\s+if\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g, /\bcatch\b/g, /&&/g, /\|\|/g, /\?\?/g, /\?(?![:.])/g];
  
  for (const pattern of patterns) {
    const matches = code.match(pattern);
    if (matches) complexity += matches.length;
  }
  
  return complexity;
}

function calculateCognitiveComplexity(code: string): number {
  let complexity = 0;
  const lines = code.split('\n');
  let nestLevel = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\s*\/\/|^\s*\*|^\s*\/\*/.test(line)) continue;
    
    if (/\b(if|for|while|switch)\b/.test(trimmed)) {
      complexity += 1 + nestLevel;
      nestLevel++;
    }
    if (/\belse\b/.test(trimmed)) complexity += 1;
    if (/\bcatch\b/.test(trimmed)) complexity += 1;
    
    if (trimmed === '}') nestLevel = Math.max(0, nestLevel - 1);
  }

  return complexity;
}

function calculateNestingDepth(code: string): number {
  let maxDepth = 0;
  let currentDepth = 0;

  for (const char of code) {
    if (char === '{') { currentDepth++; maxDepth = Math.max(maxDepth, currentDepth); }
    if (char === '}') currentDepth = Math.max(0, currentDepth - 1);
  }

  return maxDepth;
}

function calculateMaintainabilityIndex(lines: number, complexity: number, imports: number): number {
  // Simplified maintainability index (0-100, higher is better)
  const lnVolume = Math.log(Math.max(lines, 1));
  const lnComplexity = Math.log(Math.max(complexity, 1));
  const lnImports = Math.log(Math.max(imports, 1));
  
  const mi = Math.max(0, 171 - 5.2 * lnVolume - 0.23 * lnComplexity * 10 - 16.2 * lnImports);
  return Math.round(Math.min(100, mi * 100 / 171));
}
