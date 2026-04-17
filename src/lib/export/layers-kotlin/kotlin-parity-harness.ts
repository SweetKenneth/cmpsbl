/**
 * Kotlin Parity Test Harness
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Static verification that the Kotlin emitter produces well-formed source for
 * every supported layer combination. Mirrors the Java/C#/Swift/Go/Rust harnesses.
 *
 * Runs in the browser without a Kotlin toolchain by performing structural /
 * lexical checks:
 *
 *   1. emitKotlinCmpsblFile renders without throwing for every selected subset
 *   2. Output declares `package`, the canonical `cmpsblExecute` symbol, and
 *      the `Layer1.apply` entry point
 *   3. Each requested layer's leading banner appears
 *   4. Caller-isolation helpers are present (sidecar scrub + clone)
 *   5. Brace, paren, and bracket count balance (Kotlin-aware comment / string
 *      / template-string skip)
 *
 * © CMPSBL® — All rights reserved.
 */

import { KOTLIN_LAYER_BODIES } from './kotlin-layers';
import { emitKotlinCmpsblFile, orderKotlinLayersByPhase } from './kotlin-chain-executor';

export interface KotlinParityResult {
  passed: boolean;
  totalCases: number;
  failures: ReadonlyArray<{ caseName: string; reason: string }>;
}

interface BalanceCheck { ok: boolean; reason?: string }

/**
 * Kotlin-aware brace counter.
 *
 * Kotlin specifics handled:
 *   - // line comments
 *   - /* block comments *\/  (not nested in spec; still skipped)
 *   - "..." regular strings with \ escape
 *   - """ ... """ raw / triple-quoted strings (no escape recognition)
 *   - String templates "${...}" — the inner braces ARE Kotlin code that
 *     opens/closes the same brace counter, so we descend back into normal
 *     scanning until the matching '}' is hit. Tracked as a small stack.
 *   - 'c' character literals
 */
function balanceCheck(src: string): BalanceCheck {
  let braces = 0, parens = 0, brackets = 0;
  let inLineComment = false;
  let inBlockComment = false;
  // String state stack so we can re-enter strings after a ${...} interpolation.
  type StrState = { kind: 'reg' | 'raw'; templateDepth: number };
  const strStack: StrState[] = [];
  let inChar = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    const cur = strStack.length ? strStack[strStack.length - 1] : null;

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (cur) {
      // Inside a string. If we are inside a ${...} template, scan as code.
      if (cur.templateDepth > 0) {
        if (ch === '{') { cur.templateDepth++; braces++; continue; }
        if (ch === '}') {
          braces--;
          cur.templateDepth--;
          if (braces < 0) return { ok: false, reason: 'Unbalanced } inside template' };
          continue;
        }
        // fall through to normal code scanning below
      } else {
        // Pure string scan.
        if (cur.kind === 'reg') {
          if (ch === '\\') { i++; continue; }
          if (ch === '$' && next === '{') { cur.templateDepth = 1; braces++; i++; continue; }
          if (ch === '"') { strStack.pop(); continue; }
          continue;
        } else {
          // raw / triple-quoted
          if (ch === '$' && next === '{') { cur.templateDepth = 1; braces++; i++; continue; }
          if (ch === '"' && next === '"' && src[i + 2] === '"') { strStack.pop(); i += 2; continue; }
          continue;
        }
      }
    }
    if (inChar) {
      if (ch === '\\') { i++; continue; }
      if (ch === "'") inChar = false;
      continue;
    }
    if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (ch === '"' && next === '"' && src[i + 2] === '"') {
      strStack.push({ kind: 'raw', templateDepth: 0 });
      i += 2;
      continue;
    }
    if (ch === '"') { strStack.push({ kind: 'reg', templateDepth: 0 }); continue; }
    if (ch === "'") { inChar = true; continue; }
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '(') parens++;
    else if (ch === ')') parens--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
    if (braces < 0) return { ok: false, reason: 'Unbalanced }: extra closing brace' };
    if (parens < 0) return { ok: false, reason: 'Unbalanced ): extra closing paren' };
    if (brackets < 0) return { ok: false, reason: 'Unbalanced ]: extra closing bracket' };
  }
  if (braces !== 0) return { ok: false, reason: `Unbalanced {} (delta=${braces})` };
  if (parens !== 0) return { ok: false, reason: `Unbalanced () (delta=${parens})` };
  if (brackets !== 0) return { ok: false, reason: `Unbalanced [] (delta=${brackets})` };
  return { ok: true };
}

function assertContains(src: string, needle: string, label: string): string | null {
  return src.includes(needle) ? null : `Missing required token: ${label} ("${needle}")`;
}

const ALL_KOTLIN_LAYER_IDS = Object.keys(KOTLIN_LAYER_BODIES);

function buildCases(): Array<{ name: string; ids: string[] }> {
  const cases: Array<{ name: string; ids: string[] }> = [
    { name: 'empty selection', ids: [] },
    { name: 'all 20 layers', ids: ALL_KOTLIN_LAYER_IDS },
  ];
  for (const id of ALL_KOTLIN_LAYER_IDS) cases.push({ name: `single: ${id}`, ids: [id] });
  cases.push({ name: 'rotation A', ids: ['fleet-intelligence', 'audit-chain', 'self-healing'] });
  cases.push({ name: 'rotation B', ids: ['regulatory-compliance', 'governance-shield', 'ai-safety'] });
  cases.push({ name: 'rotation C', ids: ['cyber-defense', 'zero-trust', 'self-evolution', 'cognitive-memory'] });
  return cases;
}

export function runKotlinParityTests(): KotlinParityResult {
  const cases = buildCases();
  const failures: Array<{ caseName: string; reason: string }> = [];

  for (const c of cases) {
    let src: string;
    try {
      src = emitKotlinCmpsblFile('com.cmpsbl.ascension', c.ids);
    } catch (err) {
      failures.push({ caseName: c.name, reason: `emit threw: ${(err as Error).message}` });
      continue;
    }

    const checks: Array<string | null> = [
      assertContains(src, 'package com.cmpsbl.ascension', 'package declaration'),
      assertContains(src, 'object Cmpsbl', 'top-level Cmpsbl object'),
      assertContains(src, 'fun cmpsblExecute(', 'phase-locked entry point'),
      assertContains(src, 'object Layer1', 'Layer 1 declaration'),
      assertContains(src, '_cmpsbl_strip_sidecars', 'sidecar scrub helper'),
      assertContains(src, '_cmpsbl_clone_input', 'caller isolation helper'),
    ];

    const ordered = orderKotlinLayersByPhase(c.ids);
    for (const id of ordered) {
      checks.push(assertContains(src, `// ─── Layer: ${id} ───`, `layer banner ${id}`));
    }

    const bal = balanceCheck(src);
    if (!bal.ok) checks.push(bal.reason ?? 'unbalanced source');

    for (const fail of checks) {
      if (fail) failures.push({ caseName: c.name, reason: fail });
    }
  }

  return {
    passed: failures.length === 0,
    totalCases: cases.length,
    failures,
  };
}
