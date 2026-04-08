/**
 * CMPSBL® Layer 2 Structural Validator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AST-aware validation of generated Layer 2 code before export.
 *
 * Layer 1 (original source) is NEVER parsed or validated here —
 * it passes through untouched per U.S. App. No. 64/029,678.
 *
 * Layer 2 (our generated orchestration code) IS validated to ensure:
 *   1. Balanced braces / brackets / parens
 *   2. No unterminated strings
 *   3. Valid guard init patterns
 *   4. Consistent dispatch table structure
 *
 * © CMPSBL® — All rights reserved.
 */

export interface Layer2ValidationResult {
  valid: boolean;
  errors: Layer2ValidationError[];
}

export interface Layer2ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validate generated Layer 2 code for structural soundness.
 * This runs ONLY on code WE generate — never on Layer 1 source.
 */
export function validateLayer2(
  layer2Code: string,
  language: string,
): Layer2ValidationResult {
  const errors: Layer2ValidationError[] = [];

  // §1 — Balanced delimiters
  const delimiterErrors = checkBalancedDelimiters(layer2Code);
  errors.push(...delimiterErrors);

  // §2 — Unterminated strings
  const stringErrors = checkUnterminatedStrings(layer2Code, language);
  errors.push(...stringErrors);

  // §3 — Dispatch table integrity
  const dispatchErrors = checkDispatchTableIntegrity(layer2Code);
  errors.push(...dispatchErrors);

  // §4 — Guard init pattern validation
  const guardErrors = checkGuardPatterns(layer2Code, language);
  errors.push(...guardErrors);

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

/** Check that all openers have matching closers */
function checkBalancedDelimiters(code: string): Layer2ValidationError[] {
  const errors: Layer2ValidationError[] = [];
  const stack: Array<{ char: string; line: number; col: number }> = [];
  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  const closers = new Set(Object.values(pairs));

  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;
  let line = 1;
  let col = 0;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1] ?? '';
    col++;

    if (ch === '\n') { line++; col = 0; inLineComment = false; continue; }
    if (inLineComment) continue;
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (ch === '/' && next === '/') { inLineComment = true; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (ch === '#') { inLineComment = true; continue; } // Python/Ruby comments

    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (pairs[ch]) {
      stack.push({ char: ch, line, col });
    } else if (closers.has(ch)) {
      const last = stack.pop();
      if (!last) {
        errors.push({ line, column: col, message: `Unexpected closing '${ch}' with no matching opener`, severity: 'error' });
      } else if (pairs[last.char] !== ch) {
        errors.push({ line, column: col, message: `Mismatched delimiter: expected '${pairs[last.char]}' but found '${ch}' (opener at line ${last.line})`, severity: 'error' });
      }
    }
  }

  for (const unclosed of stack) {
    errors.push({ line: unclosed.line, column: unclosed.col, message: `Unclosed '${unclosed.char}' — no matching closer`, severity: 'error' });
  }

  return errors;
}

/** Check for unterminated string literals */
function checkUnterminatedStrings(code: string, _language: string): Layer2ValidationError[] {
  const errors: Layer2ValidationError[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comment-only lines
    if (/^\s*(\/\/|#|--)/.test(line)) continue;

    let inStr = false;
    let strChar = '';
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '\\' && inStr) { j++; continue; }
      if (!inStr && (ch === '"' || ch === "'")) {
        inStr = true;
        strChar = ch;
      } else if (inStr && ch === strChar) {
        inStr = false;
      }
    }
    // Template literals (backticks) can span lines — skip
    if (inStr && strChar !== '`') {
      errors.push({ line: i + 1, column: 0, message: `Unterminated string literal (${strChar})`, severity: 'warning' });
    }
  }

  return errors;
}

/** Verify dispatch table arrays are well-formed */
function checkDispatchTableIntegrity(code: string): Layer2ValidationError[] {
  const errors: Layer2ValidationError[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match dispatch table DECLARATIONS only (must have assignment + array literal)
    if (/_CMPSBL_DT|_CMPSBL_CM|_DT|_CM/.test(line) && /=\s*\[/.test(line)) {
      // Check that the array has matching brackets on this line or is properly continued
      const openCount = (line.match(/\[/g) ?? []).length;
      const closeCount = (line.match(/\]/g) ?? []).length;
      if (openCount !== closeCount) {
        // Could be multi-line — just warn
        errors.push({ line: i + 1, column: 0, message: 'Dispatch table array may span multiple lines — verify manually', severity: 'warning' });
      }
      // Verify contents are numeric
      const arrayMatch = line.match(/\[([^\]]+)\]/);
      if (arrayMatch) {
        const elements = arrayMatch[1].split(',').map(s => s.trim()).filter(Boolean);
        for (const el of elements) {
          if (!/^0x[0-9a-fA-F]+$|^\d+$/.test(el)) {
            errors.push({ line: i + 1, column: 0, message: `Non-numeric dispatch table entry: "${el}"`, severity: 'error' });
          }
        }
      }
    }
  }

  return errors;
}

/** Verify guard init patterns use valid method call syntax */
function checkGuardPatterns(code: string, language: string): Layer2ValidationError[] {
  const errors: Layer2ValidationError[] = [];
  const lines = code.split('\n');

  // Guard blocks use `.init(`, `.enable(`, `.start(`, `.enforce(`, `.activate(`
  const guardMethodPattern = /\.(init|enable|start|enforce|activate|observe|generate)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (guardMethodPattern.test(line)) {
      // For Python: verify no trailing semicolons
      if (language.toLowerCase() === 'python' && line.trimEnd().endsWith(';')) {
        errors.push({ line: i + 1, column: line.length, message: 'Python guard has trailing semicolon', severity: 'error' });
      }
      // For all: verify the line has balanced parens
      const openParens = (line.match(/\(/g) ?? []).length;
      const closeParens = (line.match(/\)/g) ?? []).length;
      if (openParens !== closeParens) {
        errors.push({ line: i + 1, column: 0, message: `Unbalanced parentheses in guard call (${openParens} open, ${closeParens} close)`, severity: 'error' });
      }
    }
  }

  return errors;
}
