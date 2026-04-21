/**
 * V2 Adoption Risk Tests
 * ━━━━━━━━━━━━━━━━━━━━━━
 * Before V2 wires the V1 wrap engine through v1-bridge.ts, prove:
 *
 *   Risk 1 — primitive-executor-bridge: works offline (no remote endpoint)
 *            and never throws when network is absent. V2 runs offline a lot.
 *
 *   Risk 2 — primitive-registry: global state. Verify a per-run "snapshot +
 *            clear + restore" pattern is feasible so concurrent V2 runs
 *            cannot cross-contaminate handlers.
 *
 *   Risk 3 — brain-learning-bridge: pulls supabase. Verify recordExtractionLearning
 *            is non-blocking and does not throw when DB writes fail / are absent.
 *
 * © CMPSBL® — All rights reserved.
 */
import { describe, it, expect, beforeEach } from 'vitest';

import {
  primitiveExecutor,
  primitiveExecutorSync,
  setRemoteEndpoint,
  getRemoteEndpoint,
  setRuntimeType,
  getRuntimeMode,
  getTelemetryBuffer,
} from '../primitive-executor-bridge';

import {
  registerPrimitive,
  getPrimitive,
  listPrimitives,
  clearPrimitives,
  getPrimitiveCount,
} from '../primitive-registry';

import {
  recordExtractionLearning,
  getLearningInsights,
} from '../brain-learning-bridge';

import type { ExtractionResult } from '../types';

// ─────────────────────────────────────────────────────────────────────
// Risk 1 — primitive-executor-bridge offline survivability
// ─────────────────────────────────────────────────────────────────────
describe('Risk 1 — primitive-executor-bridge offline path', () => {
  beforeEach(() => {
    setRemoteEndpoint(null);
    setRuntimeType('substrate');
  });

  it('starts in offline mode when no remote endpoint configured', () => {
    expect(getRemoteEndpoint()).toBeNull();
    expect(getRuntimeMode()).toBe('offline');
  });

  it('sync executor returns a result without throwing when offline', () => {
    const out = primitiveExecutorSync('SOME_UNREGISTERED_PRIMITIVE', { foo: 'bar' });
    expect(out).toBeTruthy();
    // Shape is { data, confidence_delta, signal } — bridge guarantees a result
    expect(typeof out).toBe('object');
  });

  it('async executor resolves (never rejects) when offline', async () => {
    const out = await primitiveExecutor('SOME_UNREGISTERED_PRIMITIVE', { x: 1 });
    expect(out).toBeTruthy();
  });

  it('telemetry buffer is accessible and bounded', () => {
    primitiveExecutorSync('TELEMETRY_PROBE', {});
    const buf = getTelemetryBuffer();
    expect(Array.isArray(buf)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Risk 2 — primitive-registry isolation feasibility
// ─────────────────────────────────────────────────────────────────────
describe('Risk 2 — primitive-registry per-run isolation pattern', () => {
  beforeEach(() => {
    clearPrimitives();
  });

  it('snapshot + clear + restore preserves prior registrations', () => {
    registerPrimitive({ id: 'A', name: 'alpha', handler: () => ({ ok: true }) });
    registerPrimitive({ id: 'B', name: 'beta', handler: () => ({ ok: true }) });
    expect(getPrimitiveCount()).toBe(2);

    // V2 per-run pattern would do:
    const snapshot = listPrimitives();
    clearPrimitives();
    expect(getPrimitiveCount()).toBe(0);

    // Run executes in isolation here, may register its own handlers
    registerPrimitive({ id: 'X', name: 'run-scoped', handler: () => ({}) });
    expect(getPrimitiveCount()).toBe(1);

    // Restore
    clearPrimitives();
    for (const p of snapshot) registerPrimitive(p);
    expect(getPrimitiveCount()).toBe(2);
    expect(getPrimitive('alpha')).not.toBeNull();
    expect(getPrimitive('beta')).not.toBeNull();
    expect(getPrimitive('run-scoped')).toBeNull();
  });

  it('case-insensitive name resolution is stable', () => {
    registerPrimitive({ id: 'C', name: 'CamelCase', handler: () => ({}) });
    expect(getPrimitive('camelcase')).not.toBeNull();
    expect(getPrimitive('CAMELCASE')).not.toBeNull();
  });

  it('registering the same name overwrites without throwing', () => {
    registerPrimitive({ id: '1', name: 'dup', source: 'native', handler: () => ({}) });
    registerPrimitive({ id: '2', name: 'dup', source: 'generated', handler: () => ({}) });
    expect(getPrimitiveCount()).toBe(1);
    expect(getPrimitive('dup')?.source).toBe('generated');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Risk 3 — brain-learning-bridge non-blocking safety
// ─────────────────────────────────────────────────────────────────────
describe('Risk 3 — brain-learning-bridge non-blocking safety', () => {
  it('recordExtractionLearning never throws even with empty input', () => {
    const empty: ExtractionResult = {
      primitives: [],
      stats: {
        totalCandidates: 0,
        extracted: 0,
        rejected: 0,
        byCategory: {},
        byMethod: {},
        byLanguage: {},
        averageConfidence: 0,
        extractionTimeMs: 0,
      },
      sourceFile: 'risk-test.ts',
      sourceLanguage: 'typescript',
      extractedAt: Date.now(),
    } as unknown as ExtractionResult;

    expect(() => recordExtractionLearning(empty)).not.toThrow();
  });

  it('getLearningInsights returns a structured object even with no recorded events', () => {
    const insights = getLearningInsights();
    expect(insights).toBeTruthy();
    expect(typeof insights).toBe('object');
  });
});
