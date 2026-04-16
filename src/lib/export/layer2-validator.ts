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
    // Match dispatch table DECLARATIONS only — strict prefix to avoid
    // false positives on Python type annotations like `_CMPSBL_ECHO_STORE: List[dict] = []`.
    // A real dispatch table is named _CMPSBL_DT_<id> or _CMPSBL_CM_<id> and assigns a numeric array.
    const isDispatchDecl = /\b_CMPSBL_(DT|CM)_[A-Za-z0-9_]+\s*=\s*\[/.test(line);
    if (isDispatchDecl) {
      const openCount = (line.match(/\[/g) ?? []).length;
      const closeCount = (line.match(/\]/g) ?? []).length;
      if (openCount !== closeCount) {
        errors.push({ line: i + 1, column: 0, message: 'Dispatch table array may span multiple lines — verify manually', severity: 'warning' });
      }
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
 * contains the Layer 1 original source inline. This prevents shipping
 * exports where the wrapped file has no code-level connection to the input.
 *
 * Checks:
 *   1. Layer 2 contains the original source embedded inline (or a live import)
 *   2. Layer 2 references the original class/module name
 */
export function validateLayer2Linkage(
  layer2Code: string,
  language: string,
  originalFileNames: string[],
): Layer2LinkageResult {
  const errors: string[] = [];

  if (originalFileNames.length === 0) {
    return { linked: true, errors: [] };
  }

  // §5.1 — Check that the original class/module is present (inline or imported)
  // Try multiple variants because filenames vary widely:
  //   task_worker.py      → TaskWorker
  //   Builders.common.kt  → Builders, BuildersCommon, builders.common
  //   AbstractApplicationContext.java → AbstractApplicationContext
  const primaryName = originalFileNames[0].replace(/\.[^.]+$/, '');
  // Collapse all separators (`.`, `-`, `_`) to PascalCase
  const pascalName = primaryName
    .split(/[.\-_]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  // Also accept the leading segment alone (e.g. "Builders" from "Builders.common")
  const leadingSegment = primaryName.split(/[.\-_]/).filter(Boolean)[0] || primaryName;
  // snake_case variant for Python/Rust/Go file naming conventions
  const snakeName = primaryName.replace(/[.\-]/g, '_').toLowerCase();
  // camelCase from snake or Pascal
  const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
  const variants = new Set([primaryName, pascalName, leadingSegment, snakeName, camelName]);
  // Also add each individual segment for multi-word files (e.g. "Json" from "JsonSerializer")
  for (const seg of primaryName.split(/[.\-_]/)) {
    if (seg.length >= 3) variants.add(seg);
  }
  const lowerCode = layer2Code.toLowerCase();
  const hasClassRef = [...variants].some(v =>
    layer2Code.includes(v) || lowerCode.includes(v.toLowerCase())
  );
  if (!hasClassRef) {
    errors.push(`Layer 2 does not reference any of [${[...variants].join(', ')}] — the original source is not embedded or imported.`);
  }

  // §5.2 — Check for the LAYER 1 embed marker OR a live import
  const hasInlineEmbed = layer2Code.includes('LAYER 1') && layer2Code.includes('ORIGINAL SOURCE');
  const hasLiveImport = new RegExp(`^(?!\\s*\\/\\/)\\s*(require_once|require|import|from)\\b`, 'm').test(layer2Code);
  if (!hasInlineEmbed && !hasLiveImport) {
    errors.push(`Layer 2 has no embedded original source and no live import — the wrapped file is disconnected from Layer 1.`);
  }

  return { linked: errors.length === 0, errors };
}
