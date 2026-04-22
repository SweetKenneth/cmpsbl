/**
 * Phase 5 — Envelope Verifier contract tests.
 *
 * Every canonical generator (TS/JS/Python/PHP) and every polyglot bridge
 * (23 langs) emits the same _cmpsbl envelope. This suite validates the
 * verifier itself against:
 *   • a known-good envelope shape (matches the 4 generators 1:1)
 *   • drift cases (missing keys, wrong types, bad enums)
 *   • the enforce-mode passthrough invariant
 *   • full-envelope vs bare-_cmpsbl input shapes
 *   • JSON parse path (what dev tooling will call)
 */
import { describe, it, expect } from 'vitest';
import { verifyEnvelope, verifyEnvelopeJson } from '@/lib/export/envelope-verifier';

function goodEnvelope(overrides: Partial<{
  mode: string; strategy: string; original_executed: boolean; chain: unknown;
}> = {}) {
  return {
    _original: { ok: true },
    _enriched: {
      _defense: { verdict: 'allow', threats_found: 0, threat_breakdown: {} },
    },
    _pipeline: { success: true, output: {}, trace: [] },
    _cmpsbl: {
      capability: 'parity-probe',
      cjpi: 50,
      tier: 'mint',
      chain: overrides.chain ?? ['DEFENSE', 'GOVERNANCE', 'COMPASS'],
      mode: overrides.mode ?? 'observe',
      execution: {
        original_executed: overrides.original_executed ?? true,
        original_error: null,
        execution_ms: 1.2,
        strategy: overrides.strategy ?? 'native',
        entry_errors: [],
        timestamp: '2026-04-22T00:00:00.000Z',
      },
    },
  };
}

describe('verifyEnvelope — V1 contract', () => {
  it('accepts a well-formed full envelope', () => {
    const r = verifyEnvelope(goodEnvelope());
    expect(r.ok, JSON.stringify(r.issues)).toBe(true);
    expect(r.summary.capability).toBe('parity-probe');
    expect(r.summary.mode).toBe('observe');
    expect(r.summary.strategy).toBe('native');
    expect(r.summary.originalExecuted).toBe(true);
    expect(r.summary.verdict).toBe('allow');
  });

  it('accepts a bare _cmpsbl block (no _original / _enriched)', () => {
    const env = goodEnvelope();
    const r = verifyEnvelope(env._cmpsbl);
    expect(r.ok, JSON.stringify(r.issues)).toBe(true);
    expect(r.summary.mode).toBe('observe');
    // No _enriched in bare form → verdict can't be extracted.
    expect(r.summary.verdict).toBe(null);
  });

  it('rejects non-object input', () => {
    const r = verifyEnvelope('not an envelope');
    expect(r.ok).toBe(false);
    expect(r.issues[0].code).toBe('WRONG_TYPE');
  });

  it('flags missing required keys', () => {
    const env = goodEnvelope();
    delete (env._cmpsbl as Record<string, unknown>).capability;
    delete (env._cmpsbl.execution as Record<string, unknown>).strategy;
    const r = verifyEnvelope(env);
    expect(r.ok).toBe(false);
    const codes = r.issues.map(i => i.code);
    expect(codes).toContain('MISSING_KEY');
    expect(r.issues.some(i => i.path === '_cmpsbl.capability')).toBe(true);
    expect(r.issues.some(i => i.path === '_cmpsbl.execution.strategy')).toBe(true);
  });

  it('flags invalid mode enum', () => {
    const r = verifyEnvelope(goodEnvelope({ mode: 'paranoid' }));
    expect(r.ok).toBe(false);
    expect(r.issues.some(i => i.path === '_cmpsbl.mode' && i.code === 'INVALID_ENUM')).toBe(true);
  });

  it('flags invalid strategy enum', () => {
    const r = verifyEnvelope(goodEnvelope({ strategy: 'guessed' }));
    expect(r.ok).toBe(false);
    expect(r.issues.some(i => i.path === '_cmpsbl.execution.strategy' && i.code === 'INVALID_ENUM')).toBe(true);
  });

  it('flags empty chain', () => {
    const r = verifyEnvelope(goodEnvelope({ chain: [] }));
    expect(r.ok).toBe(false);
    expect(r.issues.some(i => i.code === 'EMPTY_CHAIN')).toBe(true);
  });

  it('flags wrong type on chain', () => {
    const r = verifyEnvelope(goodEnvelope({ chain: 'DEFENSE' }));
    expect(r.ok).toBe(false);
    expect(r.issues.some(i => i.path === '_cmpsbl.chain' && i.code === 'WRONG_TYPE')).toBe(true);
  });

  it('flags enforce-mode passthrough as inconsistent', () => {
    const r = verifyEnvelope(goodEnvelope({
      mode: 'enforce', strategy: 'passthrough', original_executed: false,
    }));
    expect(r.ok).toBe(false);
    expect(r.issues.some(i => i.code === 'INCONSISTENT_STATE')).toBe(true);
  });

  it('accepts soft-mode passthrough (legal per contract)', () => {
    const r = verifyEnvelope(goodEnvelope({
      mode: 'soft', strategy: 'passthrough', original_executed: false,
    }));
    expect(r.ok, JSON.stringify(r.issues)).toBe(true);
  });

  it('accepts observe-mode passthrough (legal per contract)', () => {
    const r = verifyEnvelope(goodEnvelope({
      mode: 'observe', strategy: 'passthrough', original_executed: false,
    }));
    expect(r.ok, JSON.stringify(r.issues)).toBe(true);
  });

  it('extracts defense verdict tier when present', () => {
    const env = goodEnvelope();
    env._enriched._defense.verdict = 'warn';
    const r = verifyEnvelope(env);
    expect(r.ok).toBe(true);
    expect(r.summary.verdict).toBe('warn');
  });

  it('flags an invalid defense verdict tier', () => {
    const env = goodEnvelope();
    (env._enriched._defense as Record<string, unknown>).verdict = 'nuke';
    const r = verifyEnvelope(env);
    expect(r.ok).toBe(false);
    expect(r.issues.some(i => i.path === '_enriched._defense.verdict')).toBe(true);
  });
});

describe('verifyEnvelopeJson — JSON entry point', () => {
  it('parses and verifies a JSON-serialised envelope', () => {
    const json = JSON.stringify(goodEnvelope({ mode: 'enforce' }));
    const r = verifyEnvelopeJson(json);
    expect(r.ok, JSON.stringify(r.issues)).toBe(true);
    expect(r.summary.mode).toBe('enforce');
  });

  it('returns a structured error on invalid JSON', () => {
    const r = verifyEnvelopeJson('{not valid json');
    expect(r.ok).toBe(false);
    expect(r.issues[0].code).toBe('WRONG_TYPE');
    expect(r.issues[0].message).toMatch(/invalid JSON/i);
  });
});
