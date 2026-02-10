/**
 * Encoded Code Validation — v1.0.0
 * Pre-proposal syntax, structural, and safety validation for generated code.
 * Prevents invalid code from entering the evolution pipeline.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: ValidationSeverity;
  rule: string;
  message: string;
  line?: number;
  suggestion?: string;
}

export interface CodeValidationResult {
  valid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  stats: {
    lines: number;
    imports: number;
    exports: number;
    functions: number;
    has_types: boolean;
    complexity_estimate: 'low' | 'medium' | 'high';
  };
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════════

/** Check for balanced brackets/braces/parens */
function checkBalancedDelimiters(code: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const stack: Array<{ char: string; line: number }> = [];
  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  const closers = new Set(Object.values(pairs));
  
  const lines = code.split('\n');
  let inString = false;
  let stringChar = '';
  let inTemplate = false;
  let inComment = false;
  let inBlockComment = false;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];

      // Track string state
      if (!inComment && !inBlockComment) {
        if (ch === '`') { inTemplate = !inTemplate; continue; }
        if (!inTemplate && (ch === '"' || ch === "'")) {
          if (!inString) { inString = true; stringChar = ch; }
          else if (ch === stringChar && line[i - 1] !== '\\') { inString = false; }
          continue;
        }
      }

      if (inString || inTemplate) continue;

      // Track comments
      if (ch === '/' && next === '/') { inComment = true; break; }
      if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
      if (ch === '*' && next === '/') { inBlockComment = false; i++; continue; }
      if (inBlockComment) continue;

      // Check delimiters
      if (ch in pairs) {
        stack.push({ char: ch, line: lineNum + 1 });
      } else if (closers.has(ch)) {
        const last = stack.pop();
        if (!last || pairs[last.char] !== ch) {
          issues.push({
            severity: 'error',
            rule: 'balanced_delimiters',
            message: `Unmatched '${ch}'`,
            line: lineNum + 1,
          });
        }
      }
    }
    inComment = false;
  }

  for (const remaining of stack) {
    issues.push({
      severity: 'error',
      rule: 'balanced_delimiters',
      message: `Unclosed '${remaining.char}'`,
      line: remaining.line,
    });
  }

  return issues;
}

/** Check for dangerous patterns */
function checkDangerousPatterns(code: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = code.split('\n');

  const dangerousPatterns: Array<{ pattern: RegExp; message: string; severity: ValidationSeverity }> = [
    { pattern: /\beval\s*\(/, message: 'eval() is dangerous — use alternatives', severity: 'error' },
    { pattern: /\bnew\s+Function\s*\(/, message: 'new Function() is equivalent to eval', severity: 'error' },
    { pattern: /__proto__/, message: 'Prototype pollution risk via __proto__', severity: 'error' },
    { pattern: /\.constructor\s*\[/, message: 'Potential prototype pollution via constructor', severity: 'warning' },
    { pattern: /document\.write/, message: 'document.write can cause XSS', severity: 'warning' },
    { pattern: /innerHTML\s*=/, message: 'innerHTML assignment can cause XSS — use textContent or sanitize', severity: 'warning' },
    { pattern: /dangerouslySetInnerHTML/, message: 'dangerouslySetInnerHTML should be used with sanitized content only', severity: 'info' },
    { pattern: /process\.env(?!\.)/, message: 'Direct process.env access — use typed config', severity: 'info' },
    { pattern: /console\.(log|warn|error|debug)\s*\(/, message: 'Console statement — remove before production', severity: 'info' },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('//') || line.startsWith('*')) continue;

    for (const { pattern, message, severity } of dangerousPatterns) {
      if (pattern.test(line)) {
        issues.push({ severity, rule: 'dangerous_pattern', message, line: i + 1 });
      }
    }
  }

  return issues;
}

/** Check TypeScript/structural quality */
function checkStructuralQuality(code: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = code.split('\n');

  // Check for 'any' type usage
  const anyCount = (code.match(/:\s*any\b/g) || []).length;
  if (anyCount > 3) {
    issues.push({
      severity: 'warning',
      rule: 'excessive_any',
      message: `${anyCount} uses of 'any' type — prefer specific types`,
      suggestion: 'Use unknown, Record<string, unknown>, or define interfaces',
    });
  }

  // Check for very long functions (>50 lines)
  let fnStart = -1;
  let braceDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(export\s+)?(async\s+)?function\s/.test(line.trim()) || /=>\s*\{/.test(line)) {
      fnStart = i;
      braceDepth = 0;
    }
    if (fnStart >= 0) {
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;
      if (braceDepth <= 0 && fnStart >= 0) {
        const fnLength = i - fnStart;
        if (fnLength > 50) {
          issues.push({
            severity: 'warning',
            rule: 'function_length',
            message: `Function starting at line ${fnStart + 1} is ${fnLength} lines — consider refactoring`,
            line: fnStart + 1,
          });
        }
        fnStart = -1;
      }
    }
  }

  // File too long
  if (lines.length > 300) {
    issues.push({
      severity: 'warning',
      rule: 'file_length',
      message: `File is ${lines.length} lines — consider splitting into modules`,
    });
  }

  return issues;
}

/** Extract code statistics */
function extractStats(code: string): CodeValidationResult['stats'] {
  const lines = code.split('\n');
  const imports = (code.match(/^import\s/gm) || []).length;
  const exports = (code.match(/^export\s/gm) || []).length;
  const functions = (code.match(/(function\s|=>\s*[{(])/g) || []).length;
  const hasTypes = /:\s*(string|number|boolean|Record|Array|Promise|void)\b/.test(code)
    || /interface\s|type\s/.test(code);

  const complexity = lines.length > 200 ? 'high'
    : lines.length > 80 ? 'medium' : 'low';

  return { lines: lines.length, imports, exports, functions, has_types: hasTypes, complexity_estimate: complexity };
}

// ═══════════════════════════════════════════════════════════════
// MAIN VALIDATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Validate a code string before it enters the evolution pipeline
 */
export function validateCode(code: string): CodeValidationResult {
  const issues: ValidationIssue[] = [];

  // Run all checks
  issues.push(...checkBalancedDelimiters(code));
  issues.push(...checkDangerousPatterns(code));
  issues.push(...checkStructuralQuality(code));

  // Calculate score
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const score = Math.max(0, 100 - errorCount * 20 - warningCount * 5);

  return {
    valid: errorCount === 0,
    score,
    issues,
    stats: extractStats(code),
  };
}

/**
 * Quick check — returns true/false only
 */
export function isCodeValid(code: string): boolean {
  return validateCode(code).valid;
}

/**
 * Validate an edge function specifically
 */
export function validateEdgeFunction(code: string): CodeValidationResult {
  const base = validateCode(code);

  // Edge function specific checks
  if (!code.includes('serve(')) {
    base.issues.push({
      severity: 'error',
      rule: 'edge_function_entry',
      message: 'Edge function must include serve() entry point',
    });
  }

  if (!code.includes('corsHeaders') && !code.includes('Access-Control')) {
    base.issues.push({
      severity: 'warning',
      rule: 'edge_function_cors',
      message: 'Edge function should include CORS headers for web access',
    });
  }

  if (code.includes('import.meta.env.VITE_')) {
    base.issues.push({
      severity: 'error',
      rule: 'edge_function_env',
      message: 'Edge functions cannot use VITE_ env vars — use Deno.env.get()',
    });
  }

  // Recalculate
  const errors = base.issues.filter(i => i.severity === 'error').length;
  base.valid = errors === 0;
  base.score = Math.max(0, 100 - errors * 20 - base.issues.filter(i => i.severity === 'warning').length * 5);

  return base;
}
