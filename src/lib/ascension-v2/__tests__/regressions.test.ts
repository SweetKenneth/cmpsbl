/**
 * Ascension V2 — Pinned Regression Tests
 *
 * Every bug ever found by the 12 stress-corpus runs lives here as a 5-line
 * test. Once pinned, these classes of bug cannot silently come back.
 *
 * When a NEW bug is found in the wild or in property tests, ADD a regression
 * here BEFORE fixing it. That is the contract.
 *
 * © CMPSBL® — All rights reserved.
 */

import { describe, it, expect } from 'vitest';
import { runPreAscensionGate } from '../pre-ascension-gate';
import { computeFingerprint } from '../fingerprint-gate';

describe('Pre-Ascension Gate regressions', () => {
  // Patch A — 2026-04-20
  it('regression(A): PostgreSQL $$ … $$ dollar-quoted body must not unbalance the scanner', () => {
    const sql = [
      'CREATE OR REPLACE FUNCTION foo() RETURNS void AS $$',
      'BEGIN',
      '  IF TRUE THEN',
      '    RAISE NOTICE \'hi\';',
      '  END IF;',
      'END;',
      '$$ LANGUAGE plpgsql;',
    ].join('\n');
    const r = runPreAscensionGate([{ name: 'fn.sql', content: sql }], 'sql');
    expect(r.ok).toBe(true);
  });

  it('regression(A): SQL line comments (-- …) must be ignored by the scanner', () => {
    const sql = [
      '-- this comment ( has an unbalanced bracket on purpose',
      'SELECT 1;',
    ].join('\n');
    const r = runPreAscensionGate([{ name: 'q.sql', content: sql }], 'sql');
    expect(r.ok).toBe(true);
  });
});

describe('Fingerprint Gate regressions', () => {
  // Patch B — 2026-04-20: language-specific function patterns must count.
  it('regression(B): C function declaration is detected', () => {
    const c = 'int add(int a, int b) {\n  return a + b;\n}\n';
    const fp = computeFingerprint(c, 'c');
    expect(fp.functionCount).toBeGreaterThanOrEqual(1);
  });

  it('regression(B): Shell function `name() { … }` is detected', () => {
    const sh = 'greet() {\n  echo "hi"\n}\n';
    const fp = computeFingerprint(sh, 'shell');
    expect(fp.functionCount).toBeGreaterThanOrEqual(1);
  });

  it('regression(B): SQL CREATE FUNCTION is detected', () => {
    const sql = 'CREATE OR REPLACE FUNCTION foo(x int) RETURNS int AS $$ BEGIN RETURN x; END; $$ LANGUAGE plpgsql;\n';
    const fp = computeFingerprint(sql, 'sql');
    expect(fp.functionCount).toBeGreaterThanOrEqual(1);
  });

  it('determinism contract: fingerprint(x) called twice must agree', () => {
    const src = 'export function f(a: number) { return a + 1; }';
    const a = computeFingerprint(src, 'typescript');
    const b = computeFingerprint(src, 'typescript');
    expect(a.hash).toBe(b.hash);
    expect(a.functionCount).toBe(b.functionCount);
  });
});

describe('Python-emitter regressions', () => {
  // Patch C — 2026-04-20: case-insensitive language resolver.
  // Lowercase 'python' must not silently fall back to the TypeScript adapter
  // (which leaks semicolons into Python output).
  it('regression(C): lowercase "python" produces semicolon-free output', async () => {
    const { generateRefurbishedCode } = await import('../../factory/generate-refurbished-code');
    const out = generateRefurbishedCode(
      'def echo(x):\n    return x\n',
      [], // no primitives — we only care about adapter routing
      'deadbeef',
      'python',
      'echo.py',
    );
    // Inspect the user-code surface: any non-comment line ending with `;` would
    // mean the TypeScript adapter was used by mistake.
    const offenders = out
      .split('\n')
      .filter(l => /;\s*$/.test(l) && !l.trim().startsWith('#') && !l.trim().startsWith('//'));
    expect(offenders).toHaveLength(0);
  });
});
