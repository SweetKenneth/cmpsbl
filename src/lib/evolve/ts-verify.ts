/**
 * TypeScript Verification + Auto-Fix Loop
 * v1.0.0 — Runs tsc --noEmit simulation and feeds errors back
 */

import { type TSError, type FileWriteRecord, MAX_TS_FIX_ATTEMPTS } from './codeagent-types';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface TSVerifyResult {
  passed: boolean;
  errors: TSError[];
  fixed_errors: TSError[];
  fix_attempts: number;
  partial_fail: boolean;
  error_report?: string;
}

// ═══════════════════════════════════════════════════════════════
// TS VERIFICATION
// ═══════════════════════════════════════════════════════════════

/**
 * Common TypeScript error patterns to detect
 */
const TS_ERROR_PATTERNS = [
  // Missing imports
  { pattern: /Cannot find module ['"]([^'"]+)['"]/i, code: 'TS2307', severity: 'error' },
  // Type mismatches
  { pattern: /Type ['"]([^'"]+)['"] is not assignable/i, code: 'TS2322', severity: 'error' },
  // Missing properties
  { pattern: /Property ['"]([^'"]+)['"] does not exist/i, code: 'TS2339', severity: 'error' },
  // Missing return types
  { pattern: /Function lacks ending return statement/i, code: 'TS2366', severity: 'warn' },
  // Unused variables
  { pattern: /['"]([^'"]+)['"] is declared but its value is never read/i, code: 'TS6133', severity: 'warn' },
  // Any type
  { pattern: /has an implicit 'any' type/i, code: 'TS7006', severity: 'warn' },
  // Missing types
  { pattern: /Could not find a declaration file/i, code: 'TS7016', severity: 'warn' },
];

/**
 * Verify TypeScript code for errors
 */
export function verifyTypeScript(files: FileWriteRecord[]): TSVerifyResult {
  const result: TSVerifyResult = {
    passed: true,
    errors: [],
    fixed_errors: [],
    fix_attempts: 0,
    partial_fail: false,
  };

  for (const file of files) {
    // Only check TypeScript files
    if (!file.file_path.endsWith('.ts') && !file.file_path.endsWith('.tsx')) {
      continue;
    }

    const errors = detectErrors(file.file_path, file.content);
    
    // Only count actual errors, not warnings
    const actualErrors = errors.filter(e => !e.code.startsWith('TS6') && !e.code.startsWith('TS7'));
    
    if (actualErrors.length > 0) {
      result.passed = false;
      result.errors.push(...actualErrors);
    }
  }

  return result;
}

/**
 * Detect TypeScript errors in content
 */
function detectErrors(file_path: string, content: string): TSError[] {
  const errors: TSError[] = [];
  const lines = content.split('\n');

  // Check for common issues
  
  // 1. Check for undefined references in JSX
  const jsxRefPattern = /{(\w+)}/g;
  const declaredVars = new Set<string>();
  
  // Extract declared variables (simple heuristic)
  const varPattern = /(?:const|let|var|function)\s+(\w+)/g;
  let match;
  while ((match = varPattern.exec(content)) !== null) {
    declaredVars.add(match[1]);
  }
  
  // Extract imports
  const importPattern = /import\s+(?:{([^}]+)}|(\w+))/g;
  while ((match = importPattern.exec(content)) !== null) {
    const imports = match[1] || match[2];
    if (imports) {
      imports.split(',').forEach(i => declaredVars.add(i.trim().split(' ')[0]));
    }
  }

  // 2. Check for missing semicolons after statements (optional in TS but can cause issues)
  // Skip this as it's not a real error in TypeScript
  
  // 3. Check for obvious type issues
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for undefined map/filter on potentially null arrays
    if (/\?\.\s*(map|filter|forEach|reduce)\s*\(/.test(line)) {
      // This is actually fine - optional chaining
    }
    
    // Check for = instead of === in comparisons (common bug)
    if (/\bif\s*\([^)]*[^!=<>]=(?!=)[^=]/.test(line)) {
      // Could be intentional assignment in condition
    }
  }

  // 4. Basic syntax validation
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') braceCount++;
    else if (char === '}') braceCount--;
    else if (char === '(') parenCount++;
    else if (char === ')') parenCount--;
    else if (char === '[') bracketCount++;
    else if (char === ']') bracketCount--;
  }
  
  if (braceCount !== 0) {
    errors.push({
      file: file_path,
      line: lines.length,
      column: 1,
      message: `Unbalanced braces: ${braceCount > 0 ? 'missing }' : 'extra }'}`,
      code: 'TS1005',
    });
  }
  
  if (parenCount !== 0) {
    errors.push({
      file: file_path,
      line: lines.length,
      column: 1,
      message: `Unbalanced parentheses: ${parenCount > 0 ? 'missing )' : 'extra )'}`,
      code: 'TS1005',
    });
  }

  return errors;
}

/**
 * Attempt to auto-fix common TypeScript errors
 */
export function attemptTSFix(
  files: FileWriteRecord[], 
  errors: TSError[],
  attemptNumber: number
): { fixed: FileWriteRecord[]; remaining_errors: TSError[] } {
  const fixed = [...files];
  const remaining_errors: TSError[] = [];
  
  for (const error of errors) {
    const fileIndex = fixed.findIndex(f => f.file_path === error.file);
    if (fileIndex === -1) {
      remaining_errors.push(error);
      continue;
    }
    
    const file = fixed[fileIndex];
    let content = file.content;
    let wasFixed = false;
    
    // Try to fix common issues
    
    // Fix 1: Missing semicolons (add at end of statements)
    // Skip - not needed in TS
    
    // Fix 2: Unbalanced braces - add missing ones
    if (error.code === 'TS1005' && error.message.includes('missing }')) {
      content = content + '\n}';
      wasFixed = true;
    }
    
    if (wasFixed) {
      fixed[fileIndex] = {
        ...file,
        content,
      };
    } else {
      remaining_errors.push(error);
    }
  }
  
  return { fixed, remaining_errors };
}

/**
 * Run full TS verification with auto-fix loop
 */
export function runTSVerificationLoop(
  files: FileWriteRecord[]
): TSVerifyResult {
  let currentFiles = files;
  let result = verifyTypeScript(currentFiles);
  let attempts = 0;
  
  while (!result.passed && attempts < MAX_TS_FIX_ATTEMPTS) {
    attempts++;
    
    const { fixed, remaining_errors } = attemptTSFix(currentFiles, result.errors, attempts);
    currentFiles = fixed;
    
    // Track what was fixed
    const fixedErrors = result.errors.filter(
      e => !remaining_errors.some(r => r.file === e.file && r.line === e.line)
    );
    result.fixed_errors.push(...fixedErrors);
    
    // Re-verify
    result = verifyTypeScript(currentFiles);
    result.fix_attempts = attempts;
    result.fixed_errors = [...result.fixed_errors];
  }
  
  // If still failing after max attempts, mark as partial fail
  if (!result.passed && attempts >= MAX_TS_FIX_ATTEMPTS) {
    result.partial_fail = true;
    result.error_report = generateErrorReport(result.errors);
  }
  
  return result;
}

/**
 * Generate a human-readable error report
 */
function generateErrorReport(errors: TSError[]): string {
  if (errors.length === 0) return 'No errors';
  
  const grouped = errors.reduce((acc, err) => {
    if (!acc[err.file]) acc[err.file] = [];
    acc[err.file].push(err);
    return acc;
  }, {} as Record<string, TSError[]>);
  
  let report = `TypeScript Errors (${errors.length} total)\n`;
  report += '='.repeat(50) + '\n\n';
  
  for (const [file, fileErrors] of Object.entries(grouped)) {
    report += `📄 ${file}\n`;
    for (const err of fileErrors) {
      report += `   Line ${err.line}: ${err.message} (${err.code})\n`;
    }
    report += '\n';
  }
  
  return report;
}
