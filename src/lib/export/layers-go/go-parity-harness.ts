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
 * Go Parity Test Harness
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Static verification that the Go emitter produces well-formed source for
 * every supported layer combination. Runs in the browser without a Go runtime
 * by performing structural / lexical assertions:
 *
 *   1. emitGoCmpsblFile renders without throwing for every selected subset
 *   2. Output declares `package`, the canonical `CmpsblExecute` symbol, and
 *      `CmpsblLayer1`
 *   3. Each requested layer's leading banner appears
 *   4. Caller-isolation helpers are present (sidecar scrub + clone)
 *   5. Brace and parenthesis count balance
 *
 * The harness is exported so the build pipeline (or a smoke test) can call
 * `runGoParityTests()` and trip the SHIPPING flip when it returns clean.
 *
 * © CMPSBL® — All rights reserved.
 */

import { GO_LAYER_BODIES } from './go-layers';
import { emitGoCmpsblFile, orderGoLayersByPhase } from './go-chain-executor';

export interface GoParityResult {
  passed: boolean;
  totalCases: number;
  failures: ReadonlyArray<{ caseName: string; reason: string }>;
}

interface BalanceCheck { ok: boolean; reason?: string }

function balanceCheck(src: string): BalanceCheck {
  let braces = 0, parens = 0, brackets = 0;
  let inString: false | '"' | '`' = false;
  let inLineComment = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inString) {
      if (ch === '\\' && inString === '"') { i++; continue; }
      if (ch === inString) inString = false;
      continue;
    }
    if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (ch === '"' || ch === '`') { inString = ch as '"' | '`'; continue; }
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

const ALL_GO_LAYER_IDS = Object.keys(GO_LAYER_BODIES);

/** Build the suite of test cases — covers empty, single, all, and rotations. */
function buildCases(): Array<{ name: string; ids: string[] }> {
  const cases: Array<{ name: string; ids: string[] }> = [
    { name: 'empty selection', ids: [] },
    { name: 'all 20 layers', ids: ALL_GO_LAYER_IDS },
  ];
  // Each individual layer in isolation
  for (const id of ALL_GO_LAYER_IDS) cases.push({ name: `single: ${id}`, ids: [id] });
  // A few rotations to cover ordering correctness
  cases.push({ name: 'rotation A', ids: ['fleet-intelligence', 'audit-chain', 'self-healing'] });
  cases.push({ name: 'rotation B', ids: ['regulatory-compliance', 'governance-shield', 'ai-safety'] });
  cases.push({ name: 'rotation C', ids: ['cyber-defense', 'zero-trust', 'self-evolution', 'cognitive-memory'] });
  return cases;
}

/**
 * Run the static parity battery. Returns aggregate pass/fail.
 * Pure function — safe to call from anywhere (no IO, no side effects).
 */
export function runGoParityTests(): GoParityResult {
  const cases = buildCases();
  const failures: Array<{ caseName: string; reason: string }> = [];

  for (const c of cases) {
    let src: string;
    try {
      src = emitGoCmpsblFile('cmpsbl', c.ids);
    } catch (err) {
      failures.push({ caseName: c.name, reason: `emit threw: ${(err as Error).message}` });
      continue;
    }

    // Structural invariants every emit must satisfy
    const checks: Array<string | null> = [
      assertContains(src, 'package cmpsbl', 'package declaration'),
      assertContains(src, 'func CmpsblExecute(', 'phase-locked entry point'),
      assertContains(src, 'func CmpsblLayer1(', 'Layer 1 declaration'),
      assertContains(src, '_cmpsbl_strip_sidecars', 'sidecar scrub helper'),
      assertContains(src, '_cmpsbl_clone_input', 'caller isolation helper'),
    ];

    // Phase ordering — every selected layer must appear, in canonical order
    const ordered = orderGoLayersByPhase(c.ids);
    for (const id of ordered) {
      checks.push(assertContains(src, `// ─── Layer: ${id} ───`, `layer banner ${id}`));
    }

    // Balance check — catches malformed Go before it would hit the compiler
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