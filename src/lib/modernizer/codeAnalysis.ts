/**
 * EVOLUTION Module — Code Analysis Engine
 * Complexity analysis, duplication detection, and quality metrics
 */

// ============ Types ============

export interface FileAnalysis {
  path: string;
  language: 'typescript' | 'javascript' | 'css' | 'json' | 'markdown' | 'other';
  lines_of_code: number;
  lines_blank: number;
  lines_comment: number;
  complexity: ComplexityMetrics;
  issues: CodeIssue[];
  dependencies: string[];
  exports: string[];
}

export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  maintainability_index: number;
  halstead: HalsteadMetrics;
}

export interface HalsteadMetrics {
  vocabulary: number;
  length: number;
  difficulty: number;
  effort: number;
  time: number;
  bugs: number;
}

export interface CodeIssue {
  type: 'complexity' | 'duplication' | 'style' | 'security' | 'performance' | 'deprecated';
  severity: 'info' | 'warning' | 'error';
  line?: number;
  column?: number;
  message: string;
  suggestion?: string;
  auto_fixable: boolean;
}

export interface DuplicateBlock {
  hash: string;
  lines: number;
  occurrences: DuplicateOccurrence[];
  content_preview: string;
}

export interface DuplicateOccurrence {
  file: string;
  start_line: number;
  end_line: number;
}

export interface ProjectMetrics {
  total_files: number;
  total_lines: number;
  lines_by_language: Record<string, number>;
  avg_complexity: number;
  max_complexity: { file: string; value: number };
  duplicate_lines: number;
  duplicate_percentage: number;
  issues_by_severity: Record<string, number>;
  maintainability_score: number;
}

// ============ State ============

const fileAnalyses: Map<string, FileAnalysis> = new Map();
const duplicateBlocks: DuplicateBlock[] = [];

// ============ File Analysis ============

/**
 * Analyze a source file
 */
export function analyzeFile(path: string, content: string): FileAnalysis {
  const language = detectLanguage(path);
  const lines = content.split('\n');
  
  const { code, blank, comment } = countLines(lines, language);
  const complexity = calculateComplexity(content, language);
  const issues = detectIssues(content, path, language);
  const { dependencies, exports } = extractModuleInfo(content, language);
  
  const analysis: FileAnalysis = {
    path,
    language,
    lines_of_code: code,
    lines_blank: blank,
    lines_comment: comment,
    complexity,
    issues,
    dependencies,
    exports,
  };
  
  fileAnalyses.set(path, analysis);
  
  return analysis;
}

/**
 * Get analysis for a file
 */
export function getFileAnalysis(path: string): FileAnalysis | null {
  return fileAnalyses.get(path) || null;
}

/**
 * Get all file analyses
 */
export function getAllAnalyses(): FileAnalysis[] {
  return Array.from(fileAnalyses.values());
}

// ============ Duplication Detection ============

/**
 * Detect code duplicates across files
 */
export function detectDuplicates(files: { path: string; content: string }[]): DuplicateBlock[] {
  const MIN_BLOCK_SIZE = 5; // Minimum lines for a duplicate block
  const blockHashes: Map<string, DuplicateOccurrence[]> = new Map();
  
  for (const file of files) {
    const lines = file.content.split('\n');
    
    // Sliding window approach
    for (let i = 0; i <= lines.length - MIN_BLOCK_SIZE; i++) {
      const block = lines.slice(i, i + MIN_BLOCK_SIZE);
      const normalizedBlock = block.map(l => l.trim()).filter(l => l.length > 0);
      
      if (normalizedBlock.length < MIN_BLOCK_SIZE - 1) continue;
      
      const hash = simpleHash(normalizedBlock.join('\n'));
      
      const occurrences = blockHashes.get(hash) || [];
      occurrences.push({
        file: file.path,
        start_line: i + 1,
        end_line: i + MIN_BLOCK_SIZE,
      });
      blockHashes.set(hash, occurrences);
    }
  }
  
  // Filter to only actual duplicates (2+ occurrences)
  duplicateBlocks.length = 0;
  
  for (const [hash, occurrences] of blockHashes.entries()) {
    if (occurrences.length >= 2) {
      // Don't count same-file adjacent blocks as duplicates
      const uniqueFiles = new Set(occurrences.map(o => o.file));
      if (uniqueFiles.size >= 2 || occurrences.length >= 3) {
        duplicateBlocks.push({
          hash,
          lines: MIN_BLOCK_SIZE,
          occurrences,
          content_preview: '(content preview)',
        });
      }
    }
  }
  
  return duplicateBlocks;
}

/**
 * Get duplicate blocks
 */
export function getDuplicateBlocks(): DuplicateBlock[] {
  return [...duplicateBlocks];
}

// ============ Project Metrics ============

/**
 * Calculate project-wide metrics
 */
export function calculateProjectMetrics(): ProjectMetrics {
  const analyses = getAllAnalyses();
  
  const linesByLanguage: Record<string, number> = {};
  let totalComplexity = 0;
  let maxComplexity = { file: '', value: 0 };
  const issuesBySeverity: Record<string, number> = { info: 0, warning: 0, error: 0 };
  let totalMaintainability = 0;
  
  for (const analysis of analyses) {
    // Lines by language
    linesByLanguage[analysis.language] = (linesByLanguage[analysis.language] || 0) + analysis.lines_of_code;
    
    // Complexity tracking
    totalComplexity += analysis.complexity.cyclomatic;
    if (analysis.complexity.cyclomatic > maxComplexity.value) {
      maxComplexity = { file: analysis.path, value: analysis.complexity.cyclomatic };
    }
    
    // Issues
    for (const issue of analysis.issues) {
      issuesBySeverity[issue.severity]++;
    }
    
    // Maintainability
    totalMaintainability += analysis.complexity.maintainability_index;
  }
  
  const totalLines = Object.values(linesByLanguage).reduce((a, b) => a + b, 0);
  const duplicateLines = duplicateBlocks.reduce((sum, b) => sum + b.lines * b.occurrences.length, 0);
  
  return {
    total_files: analyses.length,
    total_lines: totalLines,
    lines_by_language: linesByLanguage,
    avg_complexity: analyses.length > 0 ? totalComplexity / analyses.length : 0,
    max_complexity: maxComplexity,
    duplicate_lines: duplicateLines,
    duplicate_percentage: totalLines > 0 ? (duplicateLines / totalLines) * 100 : 0,
    issues_by_severity: issuesBySeverity,
    maintainability_score: analyses.length > 0 ? totalMaintainability / analyses.length : 100,
  };
}

// ============ Helpers ============

function detectLanguage(path: string): FileAnalysis['language'] {
  const ext = path.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'css':
    case 'scss':
    case 'sass':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
    case 'mdx':
      return 'markdown';
    default:
      return 'other';
  }
}

function countLines(
  lines: string[],
  language: FileAnalysis['language']
): { code: number; blank: number; comment: number } {
  let code = 0;
  let blank = 0;
  let comment = 0;
  let inBlockComment = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.length === 0) {
      blank++;
      continue;
    }
    
    // Handle block comments
    if (language === 'typescript' || language === 'javascript' || language === 'css') {
      if (inBlockComment) {
        comment++;
        if (trimmed.includes('*/')) {
          inBlockComment = false;
        }
        continue;
      }
      
      if (trimmed.startsWith('/*')) {
        comment++;
        if (!trimmed.includes('*/')) {
          inBlockComment = true;
        }
        continue;
      }
      
      if (trimmed.startsWith('//')) {
        comment++;
        continue;
      }
    }
    
    code++;
  }
  
  return { code, blank, comment };
}

function calculateComplexity(content: string, language: FileAnalysis['language']): ComplexityMetrics {
  if (language !== 'typescript' && language !== 'javascript') {
    return {
      cyclomatic: 1,
      cognitive: 1,
      maintainability_index: 100,
      halstead: { vocabulary: 0, length: 0, difficulty: 0, effort: 0, time: 0, bugs: 0 },
    };
  }
  
  // Count decision points for cyclomatic complexity
  const decisionKeywords = /\b(if|else|for|while|switch|case|catch|&&|\|\||\?)\b/g;
  const matches = content.match(decisionKeywords) || [];
  const cyclomatic = 1 + matches.length;
  
  // Cognitive complexity (simplified)
  const nestedStructures = (content.match(/\{/g) || []).length;
  const cognitive = Math.min(cyclomatic + Math.floor(nestedStructures / 5), cyclomatic * 2);
  
  // Maintainability index (simplified formula)
  const lines = content.split('\n').length;
  const avgLineLength = content.length / lines;
  const maintainability = Math.max(0, Math.min(100, 
    171 - 5.2 * Math.log(cyclomatic) - 0.23 * avgLineLength - 16.2 * Math.log(lines)
  ));
  
  // Halstead metrics (simplified)
  const operators = (content.match(/[+\-*/%=<>!&|^~?:]/g) || []).length;
  const operands = (content.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || []).length;
  
  return {
    cyclomatic,
    cognitive,
    maintainability_index: Math.round(maintainability),
    halstead: {
      vocabulary: operators + operands,
      length: content.length,
      difficulty: operators > 0 ? operands / operators : 0,
      effort: operators * operands,
      time: (operators * operands) / 18,
      bugs: (operators * operands) / 3000,
    },
  };
}

function detectIssues(content: string, path: string, language: FileAnalysis['language']): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const lines = content.split('\n');
  
  // Check for common issues
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Long lines
    if (line.length > 120) {
      issues.push({
        type: 'style',
        severity: 'info',
        line: lineNum,
        message: 'Line exceeds 120 characters',
        suggestion: 'Consider breaking this line',
        auto_fixable: false,
      });
    }
    
    // Console.log in production code
    if ((language === 'typescript' || language === 'javascript') && line.includes('console.log')) {
      issues.push({
        type: 'style',
        severity: 'warning',
        line: lineNum,
        message: 'console.log found in code',
        suggestion: 'Use proper logging or remove',
        auto_fixable: true,
      });
    }
    
    // Any type
    if (language === 'typescript' && /:\s*any\b/.test(line)) {
      issues.push({
        type: 'style',
        severity: 'warning',
        line: lineNum,
        message: 'Use of "any" type',
        suggestion: 'Replace with specific type',
        auto_fixable: false,
      });
    }
    
    // TODO/FIXME
    if (/\/\/\s*(TODO|FIXME|HACK|XXX)/i.test(line)) {
      issues.push({
        type: 'style',
        severity: 'info',
        line: lineNum,
        message: 'Unresolved TODO/FIXME comment',
        suggestion: 'Resolve or create tracking issue',
        auto_fixable: false,
      });
    }
  });
  
  return issues;
}

function extractModuleInfo(
  content: string,
  language: FileAnalysis['language']
): { dependencies: string[]; exports: string[] } {
  const dependencies: string[] = [];
  const exports: string[] = [];
  
  if (language !== 'typescript' && language !== 'javascript') {
    return { dependencies, exports };
  }
  
  // Extract imports
  const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of importMatches) {
    dependencies.push(match[1]);
  }
  
  // Extract exports
  const exportMatches = content.matchAll(/export\s+(const|function|class|interface|type|enum)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
  for (const match of exportMatches) {
    exports.push(match[2]);
  }
  
  return { dependencies, exports };
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ============ Recommendations ============

/**
 * Generate improvement recommendations based on analysis
 */
export function generateRecommendations(): {
  priority: 'high' | 'medium' | 'low';
  category: string;
  message: string;
  affected_files: string[];
}[] {
  const recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    message: string;
    affected_files: string[];
  }[] = [];
  
  const analyses = getAllAnalyses();
  const metrics = calculateProjectMetrics();
  
  // High complexity files
  const highComplexity = analyses.filter(a => a.complexity.cyclomatic > 20);
  if (highComplexity.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'complexity',
      message: `${highComplexity.length} files have high cyclomatic complexity (>20)`,
      affected_files: highComplexity.map(a => a.path),
    });
  }
  
  // Low maintainability
  const lowMaintainability = analyses.filter(a => a.complexity.maintainability_index < 50);
  if (lowMaintainability.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'maintainability',
      message: `${lowMaintainability.length} files have low maintainability index (<50)`,
      affected_files: lowMaintainability.map(a => a.path),
    });
  }
  
  // Duplication
  if (metrics.duplicate_percentage > 5) {
    recommendations.push({
      priority: 'medium',
      category: 'duplication',
      message: `Code duplication is ${metrics.duplicate_percentage.toFixed(1)}% - consider refactoring`,
      affected_files: duplicateBlocks.flatMap(b => b.occurrences.map(o => o.file)),
    });
  }
  
  // Many issues
  if (metrics.issues_by_severity.error > 0) {
    recommendations.push({
      priority: 'high',
      category: 'issues',
      message: `${metrics.issues_by_severity.error} error-level issues found`,
      affected_files: analyses.filter(a => a.issues.some(i => i.severity === 'error')).map(a => a.path),
    });
  }
  
  return recommendations;
}
