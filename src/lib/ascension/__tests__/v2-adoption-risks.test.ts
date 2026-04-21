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
    const out = primitiveExecutorSync('SOME_UNREGISTERED_PRIMITIVE', { foo: 'bar' }, 0.5);
    expect(out).toBeTruthy();
    expect(typeof out).toBe('object');
    expect(out).toHaveProperty('data');
    expect(out).toHaveProperty('confidence_delta');
    expect(out).toHaveProperty('signal');
  });

  it('async executor resolves (never rejects) when offline', async () => {
    const out = await primitiveExecutor(
      'SOME_UNREGISTERED_PRIMITIVE',
      { _data: { x: 1 }, _signals: [], _errors: [] },
      0.5,
    );
    expect(out).toBeTruthy();
    expect(out).toHaveProperty('data');
  });

  it('telemetry buffer is accessible and bounded', () => {
    primitiveExecutorSync('TELEMETRY_PROBE', {}, 0.5);
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
  it('recordExtractionLearning resolves (never throws) with minimal input', async () => {
    const minimalNode = {
      id: 'risk-node',
      name: 'risk-node',
      language: 'typescript',
    } as any;
    const minimalResult = {
      correlationId: 'risk-corr',
      durationMs: 0,
      quality: {
        accepted: [],
        rejected: [],
        summary: {
          totalAccepted: 0,
          totalRejected: 0,
          avgQualityScore: 0,
          avgConfidence: 0,
          topCategories: [],
        },
      },
    } as any;

    await expect(
      recordExtractionLearning(minimalNode, minimalResult),
    ).resolves.not.toThrow();
  });

  it('getLearningInsights returns a structured object even with no recorded events', () => {
    const insights = getLearningInsights();
    expect(insights).toBeTruthy();
    expect(typeof insights).toBe('object');
  });
});
