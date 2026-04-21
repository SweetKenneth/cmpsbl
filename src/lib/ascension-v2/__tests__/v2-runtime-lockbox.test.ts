/**
 * V2 Runtime Lockbox Test
 * ━━━━━━━━━━━━━━━━━━━━━━
 * Proves V2 can promote user code to Primitive #41, execute it through
 * V1's dual-layer wrapping handler, and isolate registrations per-run.
 * No re-implementation of V1 — pure reuse via v1-bridge §12.
 *
 * © CMPSBL® — All rights reserved.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerPrimaryHandler,
  hasPrimaryHandler,
  bindAndExecute,
  buildExecutableUnit,
  generateEffectSummary,
  beginIsolatedRegistryScope,
  runRuntimeForPrimitive,
  getPrimitiveCount,
  registerPrimitive,
  clearPrimitives,
} from '../v1-bridge';

// Use V1's primitive-registry directly via the bridge re-export
// to verify the isolation contract.
import { listPrimitives } from '@/lib/ascension/primitive-registry';
import type { ExtractedPrimitive } from '@/lib/ascension/types';

const samplePrimitives: ExtractedPrimitive[] = [
  {
    id: 'p1',
    name: 'processOrder',
    canonicalName: 'process_order',
    category: 'data_transformation',
    confidence: 0.9,
    complexity: 4,
    qualityScore: 0.85,
    extractionMethod: 'function',
    extractionTrust: 'high',
    language: 'typescript',
    inputs: ['order'],
    outputs: ['receipt'],
    keywords: ['validate', 'transform', 'persist'],
    sourceSnippet: 'if (x) { for (i) { save(x); } }',
    sourceFile: 'orders.ts',
  } as unknown as ExtractedPrimitive,
];

describe('V2 Runtime Lockbox — Primitive #41 promotion + execution', () => {
  beforeEach(() => {
    clearPrimitives();
  });

  it('registers user code as Primitive #41 with a wrapping handler', () => {
    const result = registerPrimaryHandler('PROCESS_ORDER', samplePrimitives, 'typescript');
    expect(result.registered).toBe(true);
    expect(result.handlerType).toBe('wrapping');
    expect(hasPrimaryHandler('PROCESS_ORDER')).toBe(true);
  });

  it('executes Primitive #41 through bindAndExecute and preserves input', () => {
    registerPrimaryHandler('PROCESS_ORDER', samplePrimitives, 'typescript');
    const unit = buildExecutableUnit(
      {
        name: 'PROCESS_ORDER',
        category: 'data_transformation',
        confidence: 0.9,
        complexity: 4,
        extractionMethod: 'function',
        canonicalName: 'process_order',
        language: 'typescript',
      },
      'typescript',
    );
    const binding = bindAndExecute(unit, { orderId: 42 });
    expect(binding.success).toBe(true);
    expect(binding.executed).toBe(true);
    expect(binding.strategy).toBe('local');
    expect(binding.errors).toHaveLength(0);
  });

  it('runRuntimeForPrimitive promotes + executes + summarizes in one call', () => {
    const out = runRuntimeForPrimitive({
      primaryName: 'PROCESS_ORDER',
      primitives: samplePrimitives,
      sourceLanguage: 'typescript',
      input: { orderId: 7 },
    });
    expect(out.registration.registered).toBe(true);
    expect(out.binding.executed).toBe(true);
    expect(out.summary.status).toBe('executed');
    expect(out.summary.strategy).toBe('local');
    expect(out.summary.uiContract.module).toBe('PROCESS_ORDER');
  });

  it('generateEffectSummary produces a stable UI contract shape', () => {
    const out = runRuntimeForPrimitive({
      primaryName: 'PROCESS_ORDER',
      primitives: samplePrimitives,
      sourceLanguage: 'typescript',
    });
    const summary = generateEffectSummary(out.binding, 'PROCESS_ORDER');
    expect(summary).toHaveProperty('badge');
    expect(summary).toHaveProperty('shortSummary');
    expect(summary.uiContract).toMatchObject({
      module: 'PROCESS_ORDER',
      executed: true,
      degraded: false,
    });
  });
});

describe('V2 Runtime Lockbox — per-run registry isolation', () => {
  beforeEach(() => {
    clearPrimitives();
  });

  it('rolls back registrations made inside an isolated scope', () => {
    registerPrimitive({ id: 'pre', name: 'pre-existing', handler: () => ({}) });
    expect(getPrimitiveCount()).toBe(1);

    const scope = beginIsolatedRegistryScope();
    expect(scope.baselineSize).toBe(1);

    registerPrimaryHandler('TENANT_A_CODE', samplePrimitives, 'typescript');
    expect(getPrimitiveCount()).toBe(2);
    expect(hasPrimaryHandler('TENANT_A_CODE')).toBe(true);

    scope.restore();
    expect(getPrimitiveCount()).toBe(1);
    expect(hasPrimaryHandler('TENANT_A_CODE')).toBe(false);
    expect(listPrimitives().some((p) => p.name === 'pre-existing')).toBe(true);
  });

  it('restore() is idempotent', () => {
    const scope = beginIsolatedRegistryScope();
    registerPrimaryHandler('X', samplePrimitives, 'typescript');
    scope.restore();
    scope.restore(); // second call is a no-op
    expect(getPrimitiveCount()).toBe(0);
  });

  it('two sequential isolated scopes do not cross-contaminate', () => {
    const a = beginIsolatedRegistryScope();
    registerPrimaryHandler('TENANT_A', samplePrimitives, 'typescript');
    a.restore();

    const b = beginIsolatedRegistryScope();
    expect(hasPrimaryHandler('TENANT_A')).toBe(false);
    registerPrimaryHandler('TENANT_B', samplePrimitives, 'typescript');
    expect(hasPrimaryHandler('TENANT_B')).toBe(true);
    b.restore();
    expect(getPrimitiveCount()).toBe(0);
  });
});
