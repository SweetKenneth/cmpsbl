/**
 * Pre-Ascension Gate — Source validity guard
 * U.S. Patent App. No. 64/029,678
 *
 * Runs BEFORE Intake → Fingerprint → Discovery.
 * Parses every uploaded file in its declared language and hard-fails
 * the run with a structured, line-located error if any file is invalid.
 *
 * Tier-1 languages: TypeScript, JavaScript, Python.
 * For unsupported languages we still run a structural sanity pass
 * (balanced brackets / non-empty / readable) so junk inputs are
 * rejected instead of being silently exported.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type GateErrorCode =
  | 'E_SOURCE_INVALID'
  | 'E_SOURCE_EMPTY'
  | 'E_SOURCE_UNREADABLE'
  | 'E_SOURCE_UNBALANCED';

export interface GateError {
  readonly code: GateErrorCode;
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly message: string;
  readonly suggestion: string;
  readonly snippet?: string;
}

export interface GateResult {
  readonly ok: boolean;
  readonly checked: number;
  readonly language: string;
  readonly errors: ReadonlyArray<GateError>;
}

interface SourceFile {
  readonly name: string;
  readonly content: string;
}

// ═══════════════════════════════════════════════════════════════
// Language detection — what parser to actually run
// ═══════════════════════════════════════════════════════════════

type GateLang = 'typescript' | 'javascript' | 'python' | 'other';

/**
 * Pick the parser to run. Two-stage rule:
 *  1. If file content begins with a strong language sigil (e.g. `<?php`,
 *     `#!/usr/bin/env node`, `package main` for Go) honor THAT — the
 *     extension lies (e.g. PHP code uploaded as `.py`).
 *  2. Otherwise honor the file extension.
 *  3. Otherwise fall back to the declared run language.
 *
 * The declared language never *upgrades* a file to a Tier-1 parser
 * unless the extension agrees, so we never accidentally Python-parse PHP.
 */
function classifyFile(file: SourceFile, declared: string): GateLang {
  const head = file.content.slice(0, 256).trimStart();
  // Content sigils win — extension is a lie when these are present.
  if (head.startsWith('<?php') || head.startsWith('<?=')) return 'other';
  if (/^package\s+\w+\s*$/m.test(head.split('\n').slice(0, 3).join('\n'))) {
    // Looks like Go / Java package decl; not Tier-1 here.
    return 'other';
  }

  const lower = file.name.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
  if (lower.endsWith('.py') || lower.endsWith('.pyi')) return 'python';

  // Fallback to the declared run language
  const norm = declared.toLowerCase();
  if (norm.includes('typescript')) return 'typescript';
  if (norm.includes('javascript')) return 'javascript';
  if (norm.includes('python')) return 'python';
  return 'other';
}

// ═══════════════════════════════════════════════════════════════
// Helpers — line/column resolver + snippet extractor
// ═══════════════════════════════════════════════════════════════

function offsetToLineCol(source: string, offset: number): { line: number; column: number } {
  let line = 1;
  let lastNl = -1;
  const safe = Math.min(Math.max(offset, 0), source.length);
  for (let i = 0; i < safe; i++) {
    if (source.charCodeAt(i) === 10) {
      line++;
      lastNl = i;
    }
  }
  return { line, column: safe - lastNl };
}

function snippetAt(source: string, line: number): string {
  const lines = source.split('\n');
  const idx = Math.min(Math.max(line - 1, 0), lines.length - 1);
  return (lines[idx] || '').slice(0, 200);
}

// ═══════════════════════════════════════════════════════════════
// Bracket / quote balancer — language-agnostic structural sanity
// Used as fallback for non-Tier-1 languages and as a fast pre-check
// for Tier-1 languages too.
// ═══════════════════════════════════════════════════════════════

function balancedScan(source: string): { ok: boolean; offset: number; what: string } {
  const stack: Array<{ ch: string; off: number }> = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  let inStr: '"' | "'" | '`' | null = null;
  let inLineComment = false;
  let inBlockComment = false;
  let inPyTriple: '"""' | "'''" | null = null;

  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    const next = source[i + 1];
    const trip = source.slice(i, i + 3);

    if (inLineComment) {
      if (c === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (inPyTriple) {
      if (trip === inPyTriple) { i += 2; inPyTriple = null; }
      continue;
    }
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }

    // entering comments / strings
    if (c === '/' && next === '/') { inLineComment = true; continue; }
    if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (c === '#') { inLineComment = true; continue; }
    if (trip === '"""' || trip === "'''") { inPyTriple = trip as '"""' | "'''"; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c as '"' | "'" | '`'; continue; }

    if (c === '(' || c === '[' || c === '{') stack.push({ ch: c, off: i });
    else if (c === ')' || c === ']' || c === '}') {
      const top = stack.pop();
      if (!top || top.ch !== pairs[c]) {
        return { ok: false, offset: i, what: `unmatched '${c}'` };
      }
    }
  }

  if (inStr) return { ok: false, offset: source.length - 1, what: `unterminated ${inStr === '`' ? 'template' : 'string'} literal` };
  if (inBlockComment) return { ok: false, offset: source.length - 1, what: 'unterminated block comment' };
  if (inPyTriple) return { ok: false, offset: source.length - 1, what: 'unterminated triple-quoted string' };
  if (stack.length > 0) {
    const last = stack[stack.length - 1];
    return { ok: false, offset: last.off, what: `unclosed '${last.ch}'` };
  }
  return { ok: true, offset: -1, what: '' };
}

// ═══════════════════════════════════════════════════════════════
// Python-specific structural checks
// (Catches incomplete try/except, bare def with no body, mixed indent)
// ═══════════════════════════════════════════════════════════════

/**
 * Compute, per source line, whether that line's *start* is inside a
 * triple-quoted Python string. Module/class/function docstrings often
 * contain English prose with the words "with ", "for ", "if ", etc.;
 * structural checks must ignore those lines or they'll false-positive
 * on perfectly valid CPython stdlib code (e.g. `shelve.py`'s docstring).
 */
function computePyStringMask(source: string): boolean[] {
  const lines = source.split('\n');
  const mask = new Array<boolean>(lines.length).fill(false);
  let inTriple: '"""' | "'''" | null = null;

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    // The line *starts* inside a triple if we're already in one.
    mask[li] = inTriple !== null;

    let i = 0;
    while (i < line.length) {
      const trip = line.slice(i, i + 3);
      if (inTriple) {
        if (trip === inTriple) { inTriple = null; i += 3; continue; }
        i++;
        continue;
      }
      // Skip line comments (#) — outside strings only.
      if (line[i] === '#') break;
      // Skip single/double-quoted strings (single line).
      if (trip === '"""' || trip === "'''") { inTriple = trip as '"""' | "'''"; i += 3; continue; }
      if (line[i] === '"' || line[i] === "'") {
        const q = line[i];
        i++;
        while (i < line.length) {
          if (line[i] === '\\') { i += 2; continue; }
          if (line[i] === q) { i++; break; }
          i++;
        }
        continue;
      }
      i++;
    }
  }
  return mask;
}

function pythonStructuralCheck(source: string): GateError | null {
  const lines = source.split('\n');
  const insideString = computePyStringMask(source);
  const blockOpeners = /^\s*(def |class |if |elif |else:|try:|except|finally:|for |while |with |async def |async for |async with )/;

  // Track bracket depth across lines — comprehensions span lines inside [], (), {}.
  // If a line begins while bracket depth > 0, any "for "/"if " on it is a
  // comprehension clause, not a block header.
  let bracketDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const lineStartsInsideBrackets = bracketDepth > 0;

    // Update bracket depth using this line (ignoring chars inside strings on this line).
    // Cheap pass: strip strings/comments roughly, then count brackets.
    if (!insideString[i]) {
      const stripped = ln
        .replace(/#.*$/, '')
        .replace(/'(?:\\.|[^'\\])*'/g, '')
        .replace(/"(?:\\.|[^"\\])*"/g, '');
      for (const ch of stripped) {
        if (ch === '(' || ch === '[' || ch === '{') bracketDepth++;
        else if (ch === ')' || ch === ']' || ch === '}') bracketDepth = Math.max(0, bracketDepth - 1);
      }
    }

    // Skip every line that begins inside a triple-quoted docstring or
    // multi-line string — its tokens are prose, not Python syntax.
    if (insideString[i]) continue;

    // Skip lines that are continuation of a multi-line bracket expression
    // (e.g. comprehension clauses like `for x in xs` inside a list literal).
    if (lineStartsInsideBrackets) continue;

    const trimmed = ln.trim();

    // Block opener must end with ':' (excluding else:/try:/finally: which already do)
    if (blockOpeners.test(ln) && !trimmed.endsWith(':') && !trimmed.endsWith('\\')) {
      // Multi-line headers are OK if they end with a continuation; otherwise fail
      const opensParen = (trimmed.match(/\(/g) || []).length > (trimmed.match(/\)/g) || []).length;
      if (!opensParen) {
        return {
          code: 'E_SOURCE_INVALID',
          file: '',
          line: i + 1,
          column: ln.length || 1,
          message: `Block header missing ':' — '${trimmed.slice(0, 60)}'`,
          suggestion: "Add ':' at the end of the block header.",
          snippet: ln.slice(0, 200),
        };
      }
    }

    // try: with no following except/finally anywhere in source
    if (trimmed === 'try:') {
      const indent = ln.length - ln.trimStart().length;
      let foundHandler = false;
      for (let j = i + 1; j < lines.length; j++) {
        if (insideString[j]) continue;
        const l2 = lines[j];
        if (l2.trim() === '') continue;
        const ind2 = l2.length - l2.trimStart().length;
        if (ind2 < indent) break;
        if (ind2 === indent && /^(except|finally:)/.test(l2.trimStart())) {
          foundHandler = true;
          break;
        }
      }
      if (!foundHandler) {
        return {
          code: 'E_SOURCE_INVALID',
          file: '',
          line: i + 1,
          column: 1,
          message: 'Incomplete try block — no matching except/finally',
          suggestion: 'Add an except: or finally: clause for this try block.',
          snippet: ln.slice(0, 200),
        };
      }
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// TS/JS-specific structural check
// (Heuristic: catch missing function/class bodies, stray keywords)
// ═══════════════════════════════════════════════════════════════

function jsStructuralCheck(source: string): GateError | null {
  // Detect a function/class declaration that's never followed by '{'.
  // Anything other than '{' (after the signature) is a syntax error in
  // a *declaration* — including ';' (no body), ')', or random tokens.
  //
  // Notes:
  //  • Word boundaries (\b) anchor the identifier so we don't partial-match
  //    inside longer names (e.g., `class Calc` previously matched `class Cal`
  //    leaving `c` as the "next char" — false positive on valid code).
  //  • TypeScript return-type annotations (`): number {`, `): Promise<T[]> {`,
  //    `): A | B & C {`) are tolerated by greedily consuming any
  //    non-`{`/`;`/`}` run after the closing `)` until we hit `{`.
  //  • Generic type params on the function name (`function f<T>(…)`) are
  //    tolerated via an optional `<…>` slot before the parameter list.
  // Two-pass: locate the declaration head, then verify the *next non-space
  // char after the full signature* is '{'. This avoids regex backtracking
  // games over TS return-type annotations.
  const re = /\b(function\s+\w+\b(?:\s*<[^<>]*>)?\s*\([^)]*\)|class\s+\w+\b(?:\s+extends\s+\w+\b)?(?:\s+implements\s+[\w,\s]+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    let i = m.index + m[0].length;
    // Skip a TS return-type annotation `: <type>` if present
    if (source[i] === ':') {
      i++;
      while (i < source.length && source[i] !== '{' && source[i] !== ';' && source[i] !== '}') i++;
    }
    // Skip whitespace
    while (i < source.length && /\s/.test(source[i])) i++;
    if (i >= source.length) return null;
    if (source[i] === '{') continue; // valid declaration head
    const next = source[i];
    const { line, column } = offsetToLineCol(source, m.index);
    return {
      code: 'E_SOURCE_INVALID',
      file: '',
      line,
      column,
      message: `Declaration missing body — found '${next}' where '{' was expected`,
      suggestion: 'Add the function or class body wrapped in { … }.',
      snippet: snippetAt(source, line),
    };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Per-language validators
// ═══════════════════════════════════════════════════════════════

function validateFile(file: SourceFile, lang: GateLang): GateError | null {
  if (!file.content || file.content.trim().length === 0) {
    return {
      code: 'E_SOURCE_EMPTY',
      file: file.name,
      line: 1,
      column: 1,
      message: 'File is empty',
      suggestion: 'Provide source code with at least one declaration.',
    };
  }

  // Reject obviously-binary content
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u0008\u000E-\u001F]/.test(file.content.slice(0, 4096))) {
    return {
      code: 'E_SOURCE_UNREADABLE',
      file: file.name,
      line: 1,
      column: 1,
      message: 'File contains non-text / binary characters',
      suggestion: 'Upload a UTF-8 source file.',
    };
  }

  // Structural balance — applies to all curly/bracket languages
  const bal = balancedScan(file.content);
  if (!bal.ok) {
    const { line, column } = offsetToLineCol(file.content, bal.offset);
    return {
      code: 'E_SOURCE_UNBALANCED',
      file: file.name,
      line,
      column,
      message: `Structural mismatch: ${bal.what}`,
      suggestion: 'Close every opened bracket, string, or comment before exporting.',
      snippet: snippetAt(file.content, line),
    };
  }

  if (lang === 'python') {
    const py = pythonStructuralCheck(file.content);
    if (py) return { ...py, file: file.name };
  } else if (lang === 'typescript' || lang === 'javascript') {
    const js = jsStructuralCheck(file.content);
    if (js) return { ...js, file: file.name };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

/**
 * Run the Pre-Ascension Gate over every uploaded file.
 * Returns a structured result. The caller MUST hard-fail the run
 * if `ok === false`.
 */
export function runPreAscensionGate(
  files: ReadonlyArray<SourceFile>,
  language: string
): GateResult {
  if (files.length === 0) {
    return Object.freeze({
      ok: false,
      checked: 0,
      language,
      errors: Object.freeze([
        {
          code: 'E_SOURCE_EMPTY' as const,
          file: '<input>',
          line: 1,
          column: 1,
          message: 'No files were provided',
          suggestion: 'Upload at least one source file or paste code.',
        },
      ]),
    });
  }

  const errors: GateError[] = [];
  for (const f of files) {
    const lang = classifyFile(f, language);
    const err = validateFile(f, lang);
    if (err) errors.push(err);
  }

  return Object.freeze({
    ok: errors.length === 0,
    checked: files.length,
    language,
    errors: Object.freeze(errors),
  });
}

/**
 * Format a gate error for human display / toast.
 */
export function formatGateError(err: GateError): string {
  return `${err.code} — ${err.file}:${err.line}:${err.column} — ${err.message}`;
}
