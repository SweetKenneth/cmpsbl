/**
 * @deprecated V2 PARITY SCAFFOLDING — NOT ON THE V2 EXPORT PATH.
 *
 * The V2 Ascension export uses the V1 polyglot template engine
 * (`polyglot-templates.ts` + `cmpsbl-layer-polyglot.ts`) for non-canonical
 * languages. The per-language chain-executor / parity-harness files in
 * `layers-{rs,go,java,csharp,swift,kotlin}/` were scaffolded for a parity
 * model that never landed end-to-end. They are kept for reference only.
 *
 * Do not wire these into `unified-capability-file.ts`. If you find yourself
 * reaching for these, you probably want `polyglot-templates.ts` instead.
 *
 * Canonical export path: TS / JS / Python = first-class generators.
 * Beta polyglot path:    everything else  = polyglot-templates.ts.
 */

/**
 * Swift Parity Test Harness
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Static verification that the Swift emitter produces well-formed source for
 * every supported layer combination. Mirrors the Java/C#/Go/Rust harnesses.
 *
 * Runs in the browser without a Swift toolchain by performing structural /
 * lexical checks:
 *
 *   1. emitSwiftCmpsblFile renders without throwing for every selected subset
 *   2. Output declares the canonical `Cmpsbl` enum, the `cmpsblExecute` symbol,
 *      and the `Layer1.apply` entry point
 *   3. Each requested layer's leading banner appears
 *   4. Caller-isolation helpers are present (sidecar scrub + clone)
 *   5. Brace, paren, and bracket count balance (Swift-aware comment/string skip)
 *
 * © CMPSBL® — All rights reserved.
 */

import { SWIFT_LAYER_BODIES } from './swift-layers';
import { emitSwiftCmpsblFile, orderSwiftLayersByPhase } from './swift-chain-executor';

export interface SwiftParityResult {
  passed: boolean;
  totalCases: number;
  failures: ReadonlyArray<{ caseName: string; reason: string }>;
}

interface BalanceCheck { ok: boolean; reason?: string }

function balanceCheck(src: string): BalanceCheck {
  let braces = 0, parens = 0, brackets = 0;
  let inString = false;
  let inMultiString = false;
  let inLineComment = false;
  let inBlockComment = 0; // Swift supports nested /* */
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
    if (inMultiString) {
      // Swift triple-quoted strings: """ ... """
      if (ch === '"' && next === '"' && src[i + 2] === '"') { inMultiString = false; i += 2; continue; }
      if (ch === '\\') { i++; continue; }
      continue;
    }
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { inBlockComment = 1; i++; continue; }
    if (ch === '"' && next === '"' && src[i + 2] === '"') { inMultiString = true; i += 2; continue; }
    if (ch === '"') { inString = true; continue; }
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

const ALL_SWIFT_LAYER_IDS = Object.keys(SWIFT_LAYER_BODIES);

function buildCases(): Array<{ name: string; ids: string[] }> {
  const cases: Array<{ name: string; ids: string[] }> = [
    { name: 'empty selection', ids: [] },
    { name: 'all 20 layers', ids: ALL_SWIFT_LAYER_IDS },
  ];
  for (const id of ALL_SWIFT_LAYER_IDS) cases.push({ name: `single: ${id}`, ids: [id] });
  cases.push({ name: 'rotation A', ids: ['fleet-intelligence', 'audit-chain', 'self-healing'] });
  cases.push({ name: 'rotation B', ids: ['regulatory-compliance', 'governance-shield', 'ai-safety'] });
  cases.push({ name: 'rotation C', ids: ['cyber-defense', 'zero-trust', 'self-evolution', 'cognitive-memory'] });
  return cases;
}

export function runSwiftParityTests(): SwiftParityResult {
  const cases = buildCases();
  const failures: Array<{ caseName: string; reason: string }> = [];

  for (const c of cases) {
    let src: string;
    try {
      src = emitSwiftCmpsblFile('CmpsblAscension', c.ids);
    } catch (err) {
      failures.push({ caseName: c.name, reason: `emit threw: ${(err as Error).message}` });
      continue;
    }

    const checks: Array<string | null> = [
      assertContains(src, 'import Foundation', 'Foundation import'),
      assertContains(src, 'public enum Cmpsbl', 'top-level Cmpsbl enum'),
      assertContains(src, 'public static func cmpsblExecute(', 'phase-locked entry point'),
      assertContains(src, 'public enum Layer1', 'Layer 1 declaration'),
      assertContains(src, '_cmpsbl_strip_sidecars', 'sidecar scrub helper'),
      assertContains(src, '_cmpsbl_clone_input', 'caller isolation helper'),
    ];

    const ordered = orderSwiftLayersByPhase(c.ids);
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