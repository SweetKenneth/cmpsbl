/**
 * Rust Parity Test Harness
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Static verification that the Rust emitter produces well-formed source for
 * every supported layer combination. Mirrors the Go harness exactly.
 *
 *   1. emitRsCmpsblFile renders without throwing for every selected subset
 *   2. Output declares the canonical `cmpsbl_execute` symbol and `cmpsbl_layer1`
 *   3. Each requested layer's leading banner appears
 *   4. Caller-isolation helpers are present (sidecar scrub + clone)
 *   5. Brace and parenthesis count balance (Rust-aware string/char/comment skip)
 *
 * © CMPSBL® — All rights reserved.
 */

import { RS_LAYER_BODIES } from './rs-layers';
import { emitRsCmpsblFile, orderRsLayersByPhase } from './rs-chain-executor';

export interface RsParityResult {
  passed: boolean;
  totalCases: number;
  failures: ReadonlyArray<{ caseName: string; reason: string }>;
}

interface BalanceCheck { ok: boolean; reason?: string }

function balanceCheck(src: string): BalanceCheck {
  let braces = 0, parens = 0, brackets = 0;
  let inString = false;
  let inChar = false;
  let inLineComment = false;
  let inBlockComment = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment > 0) {
      if (ch === '/' && next === '*') { inBlockComment++; i++; continue; }
      if (ch === '*' && next === '/') { inBlockComment--; i++; continue; }
      continue;
    }
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (inChar) {
      if (ch === '\\') { i++; continue; }
      if (ch === "'") inChar = false;
      continue;
    }
    if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { inBlockComment = 1; i++; continue; }
    if (ch === '"') { inString = true; continue; }
    // Rust uses ' for both lifetimes and chars; only treat as char start
    // when the prev char isn't an identifier/whitespace before '
    // For balance counting purposes, ignore single-quote handling — it's
    // never used to delimit braces/parens.
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

const ALL_RS_LAYER_IDS = Object.keys(RS_LAYER_BODIES);

function buildCases(): Array<{ name: string; ids: string[] }> {
  const cases: Array<{ name: string; ids: string[] }> = [
    { name: 'empty selection', ids: [] },
    { name: 'all 20 layers', ids: ALL_RS_LAYER_IDS },
  ];
  for (const id of ALL_RS_LAYER_IDS) cases.push({ name: `single: ${id}`, ids: [id] });
  cases.push({ name: 'rotation A', ids: ['fleet-intelligence', 'audit-chain', 'self-healing'] });
  cases.push({ name: 'rotation B', ids: ['regulatory-compliance', 'governance-shield', 'ai-safety'] });
  cases.push({ name: 'rotation C', ids: ['cyber-defense', 'zero-trust', 'self-evolution', 'cognitive-memory'] });
  return cases;
}

export function runRsParityTests(): RsParityResult {
  const cases = buildCases();
  const failures: Array<{ caseName: string; reason: string }> = [];

  for (const c of cases) {
    let src: string;
    try {
      src = emitRsCmpsblFile('cmpsbl', c.ids);
    } catch (err) {
      failures.push({ caseName: c.name, reason: `emit threw: ${(err as Error).message}` });
      continue;
    }

    const checks: Array<string | null> = [
      assertContains(src, 'pub fn cmpsbl_execute(', 'phase-locked entry point'),
      assertContains(src, 'pub fn cmpsbl_layer1(', 'Layer 1 declaration'),
      assertContains(src, '_cmpsbl_strip_sidecars', 'sidecar scrub helper'),
      assertContains(src, '_cmpsbl_clone_input', 'caller isolation helper'),
      assertContains(src, 'pub enum CmpsblValue', 'shared value type'),
    ];

    const ordered = orderRsLayersByPhase(c.ids);
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
