/**
 * ENCODE Code Quality Scorer — v1.0.0
 * Automated quality assessment of generated code.
 * 
 * Metrics:
 *   - Cyclomatic complexity (estimated from control flow)
 *   - Maintainability index (line length, depth, naming)
 *   - Duplication ratio (similarity between artifacts)
 *   - Substrate pattern compliance (naming, import, structure)
 *   - Comment density
 */

// ═══ Types ════════════════════════════════════════════════════════

export interface QualityReport {
  overall: number; // 0-100
  complexity: ComplexityScore;
  maintainability: MaintainabilityScore;
  duplication: DuplicationScore;
  compliance: ComplianceScore;
  comments: CommentScore;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

export interface ComplexityScore {
  score: number; // 0-100 (lower complexity = higher score)
  branches: number;
  loops: number;
  nestedDepth: number;
  functions: number;
}

export interface MaintainabilityScore {
  score: number;
  avgLineLength: number;
  maxLineLength: number;
  maxNestingDepth: number;
  descriptiveNames: number; // percentage
}

export interface DuplicationScore {
  score: number;
  duplicatedBlocks: number;
  duplicatedLines: number;
  ratio: number; // 0-1
}

export interface ComplianceScore {
  score: number;
  violations: ComplianceViolation[];
}

export interface ComplianceViolation {
  rule: string;
  message: string;
  line?: number;
}

export interface CommentScore {
  score: number;
  ratio: number;
  hasFileHeader: boolean;
  hasFunctionDocs: boolean;
}

// ═══ Complexity Analysis ══════════════════════════════════════════

const BRANCH_PATTERNS = [
  /\bif\s*\(/g,
  /\belse\s+if\b/g,
  /\bcase\s+/g,
  /\?\s*[^:]/g, // ternary
  /\bcatch\s*\(/g,
];

const LOOP_PATTERNS = [
  /\bfor\s*\(/g,
  /\bwhile\s*\(/g,
  /\bdo\s*\{/g,
  /\.forEach\s*\(/g,
  /\.map\s*\(/g,
  /\.filter\s*\(/g,
  /\.reduce\s*\(/g,
];

function analyzeComplexity(code: string): ComplexityScore {
  let branches = 0;
  let loops = 0;

  for (const pattern of BRANCH_PATTERNS) {
    const matches = code.match(pattern);
    branches += matches?.length || 0;
  }

  for (const pattern of LOOP_PATTERNS) {
    const matches = code.match(pattern);
    loops += matches?.length || 0;
  }

  // Nesting depth
  let maxDepth = 0;
  let currentDepth = 0;
  for (const char of code) {
    if (char === '{') { currentDepth++; maxDepth = Math.max(maxDepth, currentDepth); }
    if (char === '}') currentDepth = Math.max(0, currentDepth - 1);
  }

  // Function count
  const fnMatches = code.match(/\bfunction\b|=>\s*[{(]/g);
  const functions = fnMatches?.length || 0;

  // Score: lower complexity = higher score
  const rawComplexity = branches + loops * 1.5 + maxDepth * 2;
  const normalizedPerFn = functions > 0 ? rawComplexity / functions : rawComplexity;
  const score = Math.max(0, Math.min(100, 100 - normalizedPerFn * 5));

  return { score: Math.round(score), branches, loops, nestedDepth: maxDepth, functions };
}

// ═══ Maintainability ══════════════════════════════════════════════

function analyzeMaintainability(code: string): MaintainabilityScore {
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);

  const avgLineLength = nonEmptyLines.length > 0
    ? nonEmptyLines.reduce((s, l) => s + l.length, 0) / nonEmptyLines.length
    : 0;

  const maxLineLength = lines.reduce((max, l) => Math.max(max, l.length), 0);

  // Max nesting depth
  let maxDepth = 0;
  let depth = 0;
  for (const line of lines) {
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;
    depth += opens - closes;
    maxDepth = Math.max(maxDepth, depth);
  }

  // Descriptive naming: check for single-char variable names
  const identifiers = code.match(/\b(const|let|var|function)\s+(\w+)/g) || [];
  const total = identifiers.length;
  const descriptive = identifiers.filter(id => {
    const name = id.split(/\s+/).pop() || '';
    return name.length > 2;
  }).length;
  const descriptiveRatio = total > 0 ? descriptive / total : 1;

  // Score
  let score = 100;
  if (avgLineLength > 80) score -= 10;
  if (avgLineLength > 120) score -= 15;
  if (maxLineLength > 150) score -= 10;
  if (maxDepth > 5) score -= (maxDepth - 5) * 5;
  score -= (1 - descriptiveRatio) * 20;

  return {
    score: Math.max(0, Math.round(score)),
    avgLineLength: Math.round(avgLineLength),
    maxLineLength,
    maxNestingDepth: maxDepth,
    descriptiveNames: Math.round(descriptiveRatio * 100),
  };
}

// ═══ Duplication ══════════════════════════════════════════════════

function analyzeDuplication(codes: string[]): DuplicationScore {
  if (codes.length < 2) {
    return { score: 100, duplicatedBlocks: 0, duplicatedLines: 0, ratio: 0 };
  }

  // Normalize and chunk each code into 3-line blocks
  const allBlocks = new Map<string, number>();
  let totalBlocks = 0;
  let duplicatedBlocks = 0;

  for (const code of codes) {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    for (let i = 0; i < lines.length - 2; i++) {
      const block = lines.slice(i, i + 3).join('\n');
      totalBlocks++;
      const count = (allBlocks.get(block) || 0) + 1;
      allBlocks.set(block, count);
      if (count === 2) duplicatedBlocks++;
    }
  }

  const ratio = totalBlocks > 0 ? duplicatedBlocks / totalBlocks : 0;
  const score = Math.max(0, Math.round(100 - ratio * 200));

  return {
    score,
    duplicatedBlocks,
    duplicatedLines: duplicatedBlocks * 3,
    ratio: Math.round(ratio * 1000) / 1000,
  };
}

// ═══ Substrate Compliance ═════════════════════════════════════════

const COMPLIANCE_RULES: Array<{ id: string; check: (code: string) => string | null }> = [
  {
    id: 'COMP_001',
    check: (code) => {
      if (code.includes('console.log') && !code.includes('// debug')) {
        return 'Bare console.log — use structured logging or telemetry';
      }
      return null;
    },
  },
  {
    id: 'COMP_002',
    check: (code) => {
      if (/catch\s*\(\s*\w*\s*\)\s*\{\s*\}/.test(code)) {
        return 'Empty catch block — errors must be handled or logged';
      }
      return null;
    },
  },
  {
    id: 'COMP_003',
    check: (code) => {
      if (/any(?:\s|;|,|\))/.test(code) && code.includes(': any')) {
        return 'Usage of `any` type — prefer explicit types';
      }
      return null;
    },
  },
  {
    id: 'COMP_004',
    check: (code) => {
      if (code.includes('TODO') || code.includes('FIXME') || code.includes('HACK')) {
        return 'Contains TODO/FIXME/HACK markers — resolve before merge';
      }
      return null;
    },
  },
  {
    id: 'COMP_005',
    check: (code) => {
      if (/import.*from\s+['"][.][.]\/[.][.]\/[.][.]\/[.][.]\//g.test(code)) {
        return 'Deep relative imports — use @/ path aliases';
      }
      return null;
    },
  },
];

function analyzeCompliance(code: string): ComplianceScore {
  const violations: ComplianceViolation[] = [];

  for (const rule of COMPLIANCE_RULES) {
    const msg = rule.check(code);
    if (msg) {
      violations.push({ rule: rule.id, message: msg });
    }
  }

  const score = Math.max(0, 100 - violations.length * 15);
  return { score, violations };
}

// ═══ Comment Density ══════════════════════════════════════════════

function analyzeComments(code: string): CommentScore {
  const lines = code.split('\n');
  const total = lines.length;
  const commentLines = lines.filter(l => {
    const trimmed = l.trim();
    return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
  }).length;

  const ratio = total > 0 ? commentLines / total : 0;
  const hasFileHeader = /^\/\*\*/.test(code.trim()) || /^\/\//.test(code.trim());
  const hasFunctionDocs = /\/\*\*[\s\S]*?\*\/\s*(export\s+)?(function|const|class)/m.test(code);

  let score = 50;
  if (ratio >= 0.1) score += 20;
  if (ratio >= 0.2) score += 10;
  if (hasFileHeader) score += 10;
  if (hasFunctionDocs) score += 10;
  if (ratio > 0.5) score -= 10; // over-commented

  return {
    score: Math.max(0, Math.min(100, score)),
    ratio: Math.round(ratio * 100) / 100,
    hasFileHeader,
    hasFunctionDocs,
  };
}

// ═══ Main Scorer ══════════════════════════════════════════════════

/**
 * Score code quality across all dimensions
 */
export function scoreCodeQuality(code: string, additionalCodes?: string[]): QualityReport {
  const complexity = analyzeComplexity(code);
  const maintainability = analyzeMaintainability(code);
  const duplication = analyzeDuplication([code, ...(additionalCodes || [])]);
  const compliance = analyzeCompliance(code);
  const comments = analyzeComments(code);

  // Weighted composite
  const overall = Math.round(
    complexity.score * 0.25 +
    maintainability.score * 0.25 +
    duplication.score * 0.15 +
    compliance.score * 0.20 +
    comments.score * 0.15,
  );

  // Grade
  const grade: QualityReport['grade'] =
    overall >= 90 ? 'A' :
    overall >= 75 ? 'B' :
    overall >= 60 ? 'C' :
    overall >= 40 ? 'D' : 'F';

  // Recommendations
  const recommendations: string[] = [];
  if (complexity.score < 60) recommendations.push('Reduce cyclomatic complexity — extract helper functions');
  if (maintainability.maxNestingDepth > 4) recommendations.push('Flatten nesting — use early returns or extract logic');
  if (maintainability.avgLineLength > 100) recommendations.push('Shorten average line length below 100 chars');
  if (duplication.ratio > 0.1) recommendations.push('Extract duplicated blocks into shared utilities');
  if (compliance.violations.length > 0) recommendations.push(`Fix ${compliance.violations.length} compliance violation(s)`);
  if (!comments.hasFileHeader) recommendations.push('Add file-level documentation header');

  return { overall, complexity, maintainability, duplication, compliance, comments, grade, recommendations };
}

/**
 * Quick grade — returns just the letter grade
 */
export function quickGrade(code: string): QualityReport['grade'] {
  return scoreCodeQuality(code).grade;
}
