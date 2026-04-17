/**
 * CMPSBL® Inventory Layer — Polyglot Lex Suite
 * Primitives: TOKEN · GRAMMAR · TRANSPILE · DIALECT
 *
 *   TOKEN     → minimal lexer (identifiers, numbers, strings, punctuation)
 *   GRAMMAR   → balanced-bracket validator (parens, braces, brackets)
 *   TRANSPILE → keyword/identifier mapper (e.g. JS-ish ↔ Python-ish renames)
 *   DIALECT   → fingerprints a code blob's likely language family
 *
 * Auto-wire installs a GRAMMAR pre-flight: if `_cmpsbl_source_snippet` is
 * provided, unbalanced-bracket payloads are rejected before execution —
 * useful for code-handling capabilities that should never see torn input.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Polyglot Lex Suite (proprietary).                          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── TOKEN · minimal lexer ───────────────────────────────────────────────────
export type CmpsblToken = { kind: 'ident' | 'num' | 'str' | 'punct' | 'ws'; value: string };
export function cmpsbl_pls_token_scan(src: string): CmpsblToken[] {
  const out: CmpsblToken[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\\s/.test(c)) { let j = i; while (j < src.length && /\\s/.test(src[j])) j++; out.push({ kind: 'ws', value: src.slice(i, j) }); i = j; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i; while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++; out.push({ kind: 'ident', value: src.slice(i, j) }); i = j; continue; }
    if (/[0-9]/.test(c)) { let j = i; while (j < src.length && /[0-9.]/.test(src[j])) j++; out.push({ kind: 'num', value: src.slice(i, j) }); i = j; continue; }
    if (c === '"' || c === "'") { const q = c; let j = i + 1; while (j < src.length && src[j] !== q) { if (src[j] === '\\\\') j++; j++; } j = Math.min(j + 1, src.length); out.push({ kind: 'str', value: src.slice(i, j) }); i = j; continue; }
    out.push({ kind: 'punct', value: c }); i += 1;
  }
  return out;
}

// ── GRAMMAR · balanced-bracket check ────────────────────────────────────────
export function cmpsbl_pls_grammar_balanced(src: string): { ok: boolean; firstFailAt: number } {
  const stack: Array<{ ch: string; pos: number }> = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  let inStr: string | null = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\\\') { i += 1; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '(' || c === '[' || c === '{') stack.push({ ch: c, pos: i });
    else if (c === ')' || c === ']' || c === '}') {
      const top = stack.pop();
      if (!top || top.ch !== pairs[c]) return { ok: false, firstFailAt: i };
    }
  }
  return stack.length === 0 ? { ok: true, firstFailAt: -1 } : { ok: false, firstFailAt: stack[0].pos };
}

// ── TRANSPILE · keyword renamer ─────────────────────────────────────────────
export function cmpsbl_pls_transpile_rename(src: string, table: Record<string, string>): string {
  return cmpsbl_pls_token_scan(src).map(t => (t.kind === 'ident' && table[t.value]) ? table[t.value] : t.value).join('');
}

// ── DIALECT · language family fingerprint ───────────────────────────────────
export function cmpsbl_pls_dialect_detect(src: string): { family: 'c-like' | 'python-like' | 'lisp-like' | 'unknown'; score: number } {
  const semi = (src.match(/;/g) ?? []).length;
  const braces = (src.match(/[{}]/g) ?? []).length;
  const colon = (src.match(/:\\s*$/gm) ?? []).length;
  const def = (src.match(/\\bdef\\s+\\w+\\s*\\(/g) ?? []).length;
  const lparen = (src.match(/\\(/g) ?? []).length;
  const rparen = (src.match(/\\)/g) ?? []).length;
  const cScore = semi + braces;
  const pyScore = colon + def * 3;
  const lispScore = (lparen + rparen) - braces;
  const max = Math.max(cScore, pyScore, lispScore);
  if (max <= 0) return { family: 'unknown', score: 0 };
  if (max === cScore) return { family: 'c-like', score: cScore };
  if (max === pyScore) return { family: 'python-like', score: pyScore };
  return { family: 'lisp-like', score: lispScore };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Polyglot Lex Suite (proprietary).                          ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import re
from typing import Dict, List

def cmpsbl_pls_token_scan(src: str) -> List[dict]:
    out: List[dict] = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        if c.isspace():
            j = i
            while j < n and src[j].isspace(): j += 1
            out.append({ "kind": "ws", "value": src[i:j] }); i = j; continue
        if c.isalpha() or c == '_':
            j = i
            while j < n and (src[j].isalnum() or src[j] == '_'): j += 1
            out.append({ "kind": "ident", "value": src[i:j] }); i = j; continue
        if c.isdigit():
            j = i
            while j < n and (src[j].isdigit() or src[j] == '.'): j += 1
            out.append({ "kind": "num", "value": src[i:j] }); i = j; continue
        if c == '"' or c == "'":
            q = c; j = i + 1
            while j < n and src[j] != q:
                if src[j] == '\\\\': j += 1
                j += 1
            j = min(j + 1, n)
            out.append({ "kind": "str", "value": src[i:j] }); i = j; continue
        out.append({ "kind": "punct", "value": c }); i += 1
    return out

def cmpsbl_pls_grammar_balanced(src: str) -> dict:
    stack = []
    pairs = { ')': '(', ']': '[', '}': '{' }
    in_str = None
    i = 0
    while i < len(src):
        c = src[i]
        if in_str is not None:
            if c == '\\\\': i += 2; continue
            if c == in_str: in_str = None
            i += 1; continue
        if c == '"' or c == "'": in_str = c; i += 1; continue
        if c in '([{': stack.append((c, i))
        elif c in ')]}':
            if not stack or stack[-1][0] != pairs[c]:
                return { "ok": False, "first_fail_at": i }
            stack.pop()
        i += 1
    return { "ok": True, "first_fail_at": -1 } if not stack else { "ok": False, "first_fail_at": stack[0][1] }

def cmpsbl_pls_transpile_rename(src: str, table: Dict[str, str]) -> str:
    parts = cmpsbl_pls_token_scan(src)
    return ''.join(table[t["value"]] if t["kind"] == "ident" and t["value"] in table else t["value"] for t in parts)

def cmpsbl_pls_dialect_detect(src: str) -> dict:
    semi = src.count(';')
    braces = sum(1 for ch in src if ch in '{}')
    colon = len(re.findall(r':\\s*$', src, re.MULTILINE))
    df = len(re.findall(r'\\bdef\\s+\\w+\\s*\\(', src))
    lparen = src.count('(')
    rparen = src.count(')')
    c_score = semi + braces
    py_score = colon + df * 3
    lisp_score = (lparen + rparen) - braces
    mx = max(c_score, py_score, lisp_score)
    if mx <= 0: return { "family": "unknown", "score": 0 }
    if mx == c_score: return { "family": "c-like", "score": c_score }
    if mx == py_score: return { "family": "python-like", "score": py_score }
    return { "family": "lisp-like", "score": lisp_score }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_pls = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_pls(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // GRAMMAR pre-flight — reject torn source snippets before execution
  const snippet = typeof input._cmpsbl_source_snippet === 'string' ? input._cmpsbl_source_snippet : null;
  if (snippet) {
    const verdict = cmpsbl_pls_grammar_balanced(snippet);
    if (!verdict.ok) {
      throw new Error(\`[CMPSBL:Lex:\${capabilityName}] GRAMMAR violation — unbalanced bracket near offset \${verdict.firstFailAt}\`);
    }
  }
  return _cmpsbl_raw_execute_pls(capabilityName, input);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_pls = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Polyglot Lex Suite (GRAMMAR pre-flight on source snippets)."""
    snippet = input_data.get('_cmpsbl_source_snippet')
    if isinstance(snippet, str):
        verdict = cmpsbl_pls_grammar_balanced(snippet)
        if not verdict['ok']:
            raise RuntimeError(f"[CMPSBL:Lex:{capability_name}] GRAMMAR violation — unbalanced bracket near offset {verdict['first_fail_at']}")
    return _cmpsbl_raw_execute_pls(capability_name, input_data)`;

export const POLYGLOT_LEX_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'polyglot-lex-suite',
  name: 'Polyglot Lex Suite',
  crownJewelRank: 33,
  cjpi: 86,
  module: 'LEX',
  description: 'TOKEN minimal lexer + GRAMMAR balanced-bracket gate + TRANSPILE renamer + DIALECT detector.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_pls_grammar_balanced',
    behavior: 'Rejects torn or unbalanced source snippets before execution; never let bad code in.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
