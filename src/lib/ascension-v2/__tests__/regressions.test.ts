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

  // Patch D — 2026-04-21: real user-code wrapping + no execute rebinding.
  // The previous Python emit detected user functions but never wrapped them
  // (Layer 1 ran without ever touching cmpsbl_execute). It also rebuilt
  // cmpsbl_execute via `_cmpsbl_raw_execute_XX = cmpsbl_execute` 16 times,
  // clobbering the async spine. This regression locks both bug classes out.
  it('regression(D): emitter does NOT rebind cmpsbl_execute via _cmpsbl_raw_execute_*', async () => {
    const { generateRefurbishedCode } = await import('../../factory/generate-refurbished-code');
    const fastapi = [
      'from fastapi import FastAPI',
      'app = FastAPI()',
      '@app.post("/orders")',
      'async def create_order(payload: dict):',
      '    return {"ok": True}',
      '',
      'def compute_total(items):',
      '    return sum(items)',
      ''
    ].join('\n');
    const PRIMS: any[] = [
      { name: 'DEFENSE', primitiveId: 'DEFENSE', collisionScore: 90 },
    ];
    const out = generateRefurbishedCode(fastapi, PRIMS, 'deadbeef', 'python', 'svc.py');
    expect(/_cmpsbl_raw_execute_/.test(out)).toBe(false);
    const execDefs = (out.match(/^\s*def\s+cmpsbl_execute\s*\(/gm) ?? []).length;
    expect(execDefs).toBeLessThanOrEqual(1);
  });

  it('regression(D): user functions are wrapped through _cmpsbl_wrap', async () => {
    const { generateRefurbishedCode } = await import('../../factory/generate-refurbished-code');
    const fastapi = [
      'from fastapi import FastAPI',
      'app = FastAPI()',
      '@app.post("/orders")',
      'async def create_order(payload: dict):',
      '    return {"ok": True}',
      '',
      'def compute_total(items):',
      '    return sum(items)',
      ''
    ].join('\n');
    const PRIMS: any[] = [
      { name: 'DEFENSE', primitiveId: 'DEFENSE', collisionScore: 90 },
    ];
    const out = generateRefurbishedCode(fastapi, PRIMS, 'deadbeef', 'python', 'svc.py');
    expect(out).toContain('def _cmpsbl_wrap(');
    const rebound = (out.match(/=\s*_cmpsbl_wrap\(/g) ?? []).length;
    expect(rebound).toBeGreaterThanOrEqual(1);
  });

  it('regression(D): async detection uses inspect.iscoroutinefunction', async () => {
    const { generateRefurbishedCode } = await import('../../factory/generate-refurbished-code');
    const fastapi = [
      'async def create_order(payload: dict):',
      '    return {"ok": True}',
      ''
    ].join('\n');
    const PRIMS: any[] = [
      { name: 'DEFENSE', primitiveId: 'DEFENSE', collisionScore: 90 },
    ];
    const out = generateRefurbishedCode(fastapi, PRIMS, 'deadbeef', 'python', 'svc.py');
    expect(out).toContain('iscoroutinefunction');
    expect(out).toContain('async def _cmpsbl_async_wrapper');
  });
});

describe('Rust-emitter regressions', () => {
  // Patch E — 2026-04-21: Rust/Axum attachment.
  // Previous Rust emit (1) commented out Layer 1, (2) defined cmpsbl_execute
  // twice (E0428), and (3) had no async-aware wrapper or Tower middleware.
  const AXUM = [
    'use axum::{Router, routing::post, Json};',
    'use serde::Deserialize;',
    '',
    '#[derive(Deserialize)]',
    'struct Order { id: u64 }',
    '',
    'async fn create_order(Json(o): Json<Order>) -> Json<u64> {',
    '    Json(o.id)',
    '}',
    '',
    'fn compute_total(items: &[u64]) -> u64 {',
    '    items.iter().sum()',
    '}',
    '',
    '#[tokio::main]',
    'async fn main() {',
    '    let app = Router::new().route("/orders", post(create_order));',
    '    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();',
    '    axum::serve(listener, app).await.unwrap();',
    '}',
    '',
  ].join('\n');
  const PRIMS: any[] = [{ name: 'DEFENSE', primitiveId: 'DEFENSE', collisionScore: 90 }];

  it('regression(E): no duplicate cmpsbl_execute definition', async () => {
    const { generateRefurbishedCode } = await import('../../factory/generate-refurbished-code');
    const out = generateRefurbishedCode(AXUM, PRIMS, 'deadbeef', 'rust', 'svc.rs');
    const execDefs = (out.match(/^\s*(?:pub\s+)?fn\s+cmpsbl_execute\s*\(/gm) ?? []).length;
    expect(execDefs).toBeLessThanOrEqual(1);
  });

  it('regression(E): Layer 1 emitted as real code, not commented out', async () => {
    const { generateRefurbishedCode } = await import('../../factory/generate-refurbished-code');
    const out = generateRefurbishedCode(AXUM, PRIMS, 'deadbeef', 'rust', 'svc.rs');
    expect(/^\s*async\s+fn\s+create_order\b/m.test(out)).toBe(true);
    expect(/^\s*async\s+fn\s+main\b/m.test(out) || /^\s*fn\s+main\b/m.test(out)).toBe(true);
  });

  it('regression(E): Tower Layer middleware emitted for Axum attachment', async () => {
    const { generateRefurbishedCode } = await import('../../factory/generate-refurbished-code');
    const out = generateRefurbishedCode(AXUM, PRIMS, 'deadbeef', 'rust', 'svc.rs');
    expect(out).toContain('pub struct CmpsblTowerLayer');
    expect(out).toContain('tower::Layer<S>');
  });

  it('regression(E): async wrappers emitted that .await user fn', async () => {
    const { generateRefurbishedCode } = await import('../../factory/generate-refurbished-code');
    const out = generateRefurbishedCode(AXUM, PRIMS, 'deadbeef', 'rust', 'svc.rs');
    expect(out).toContain('cmpsbl_wrap_async');
    expect(out).toContain('std::future::Future');
    expect(out).toContain('fut.await');
  });
});
