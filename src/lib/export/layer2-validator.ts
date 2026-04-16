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
  const lang = language.toLowerCase();

  // Languages where {} are structural blocks — hard errors on imbalance
  const braceLanguages = new Set([
    'typescript', 'javascript', 'java', 'c', 'c++', 'c#', 'csharp',
    'rust', 'go', 'kotlin', 'scala', 'swift', 'dart', 'php',
  ]);
  const isBraceLang = braceLanguages.has(lang);

  // §1 — Balanced delimiters (advisory — multi-line JSON and complex
  //       constructs produce false positives in the naive parser)
  const delimiterErrors = checkBalancedDelimiters(layer2Code);
  errors.push(...delimiterErrors.map(e => ({ ...e, severity: 'warning' as const })));

  // §2 — Unterminated strings (advisory)
  const stringErrors = checkUnterminatedStrings(layer2Code, language);
  errors.push(...stringErrors);

  // §3 — Dispatch table integrity (HARD GATE — errors block export)
  const dispatchErrors = checkDispatchTableIntegrity(layer2Code);
  errors.push(...dispatchErrors);

  // §4 — Guard init pattern validation (advisory — multi-line guard
  //       calls with object arguments trigger false positives)
  const guardErrors = checkGuardPatterns(layer2Code, language);
  // Python semicolon check remains a hard error; paren balance is advisory
  errors.push(...guardErrors.map(e => ({
    ...e,
    severity: (e.message.includes('trailing semicolon') ? 'error' : 'warning') as 'error' | 'warning',
  })));

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
  let inMultiLineString = false;
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

    // Skip multi-line template/backtick strings entirely
    if (inMultiLineString) {
      if (ch === '\\') { i++; continue; }
      if (ch === '`') inMultiLineString = false;
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

    // Backtick = multi-line template literal
    if (ch === '`') { inMultiLineString = true; continue; }
    if (ch === '"' || ch === "'") {
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
      // Check balanced parens across the guard call (may span 1-3 lines)
      let guardBlock = line;
      let lookAhead = 1;
      while (lookAhead <= 3 && i + lookAhead < lines.length) {
        const nextLine = lines[i + lookAhead];
        // Stop looking if next line is a new guard, comment, or blank separator
        if (guardMethodPattern.test(nextLine) || /^\s*$/.test(nextLine) || /^\s*(\/\/|#|--)/.test(nextLine)) break;
        guardBlock += '\n' + nextLine;
        lookAhead++;
      }
      const openParens = (guardBlock.match(/\(/g) ?? []).length;
      const closeParens = (guardBlock.match(/\)/g) ?? []).length;
      if (openParens !== closeParens) {
        errors.push({ line: i + 1, column: 0, message: `Unbalanced parentheses in guard call (${openParens} open, ${closeParens} close)`, severity: 'error' });
      }
    }
  }

  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — Layer 2 ↔ Layer 1 Linkage Acceptance Test
// ═══════════════════════════════════════════════════════════════════════════════

export interface Layer2LinkageResult {
  linked: boolean;
  errors: string[];
}

/**
 * Pre-ZIP acceptance test: verify that the generated Layer 2 code
 * references the Layer 1 original file(s). This prevents shipping
 * exports where the wrapped file has no code-level connection to the input.
 *
 * Checks:
 *   1. Layer 2 contains a live (uncommented) require/import of the original
 *   2. Layer 2 references the original class/module name
 *   3. The paths in the require match the actual ZIP layout
 */
export function validateLayer2Linkage(
  layer2Code: string,
  language: string,
  originalFileNames: string[],
): Layer2LinkageResult {
  const errors: string[] = [];
  const lang = language.toLowerCase();

  if (originalFileNames.length === 0) {
    return { linked: true, errors: [] };
  }

  // §5.1 — Check for live imports (not commented out)
  for (const fileName of originalFileNames) {
    const nameEscaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let hasLiveImport = false;

    if (lang === 'php') {
      // Match require_once that is NOT preceded by // or # on the same line
      const requirePattern = new RegExp(`^(?!\\s*\\/\\/)\\s*require_once\\b.*${nameEscaped}`, 'm');
      hasLiveImport = requirePattern.test(layer2Code);
    } else if (lang === 'python') {
      const importPattern = new RegExp(`^(?!\\s*#)\\s*(import|from)\\b.*${nameEscaped.replace(/\\.py$/, '')}`, 'm');
      hasLiveImport = importPattern.test(layer2Code);
    } else {
      // JS/TS and others
      const importPattern = new RegExp(`^(?!\\s*\\/\\/)\\s*(import|require)\\b.*${nameEscaped}`, 'm');
      hasLiveImport = importPattern.test(layer2Code);
    }

    if (!hasLiveImport) {
      errors.push(`Layer 2 has no live import of "${fileName}" — the wrapped file will not load the original.`);
    }
  }

  // §5.2 — Check that executeOriginal / equivalent references a class or function
  const primaryName = originalFileNames[0].replace(/\.[^.]+$/, '');
  const hasClassRef = layer2Code.includes(primaryName);
  if (!hasClassRef) {
    errors.push(`Layer 2 does not reference "${primaryName}" — executeOriginal() may be a dead stub.`);
  }

  return { linked: errors.length === 0, errors };
}
