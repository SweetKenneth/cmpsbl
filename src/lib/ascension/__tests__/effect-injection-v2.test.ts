/**
 * CMPSBL® Universal Effect Injection v2 — Endgame Tests
 * Focused coverage: detection, strategy, execution paths, truthfulness.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { detectPrimaryUnit, effectWrapper, applyEffectInjection, enrichExtractionWithEffects } from '../effect-injection';
import { resolveExecutionStrategy, buildExecutableUnit, bindAndExecute } from '../execution-binding';
import { registerPrimitive, clearPrimitives } from '../primitive-registry';
import type { ExtractedPrimitive, AscensionNode, ExtractionResult, ExtractionStats, QualityReport, QualitySummary } from '../types';
import type { PipelineContext } from '@/lib/export/module-effects';

// ── HELPERS ──

function makePrimitive(overrides: Partial<ExtractedPrimitive> = {}): ExtractedPrimitive {
  return {
    id: 'p1',
    name: 'TestHandler',
    canonicalName: 'test_handler',
    category: 'execution',
    inputs: ['data'],
    outputs: ['result'],
    confidence: 0.85,
    qualityScore: 0.8,
    sourceSnippet: 'function TestHandler() {}',
    language: 'typescript',
    extractionMethod: 'function',
    extractionTrust: 'high',
    keywords: ['test', 'handler'],
    complexity: 3,
    ...overrides,
  };
}

function makeNode(overrides: Partial<AscensionNode> = {}): AscensionNode {
  return {
    id: 'node-1',
    name: 'TestNode',
    source: 'test.ts',
    primitives: [makePrimitive()],
    status: 'active',
    mode: 'persistent',
    runLimit: null,
    totalRuns: 0,
    surface: { nodeName: 'TEST_NODE', capabilities: ['exec'], sector: 'compute', domain: 'test' },
    language: 'typescript',
    performance: { avgCjpi: 72, bestCjpi: 85, chainsParticipated: 3, lastUsed: null },
    extractionStats: null,
    qualitySummary: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'u1',
    schemaVersion: 2,
    ...overrides,
  };
}

function makeCtx(): PipelineContext {
  return {
    data: { input: 'test' },
    confidence: 0.9,
    annotations: {},
    transformationNotes: [],
    stageIndex: 0,
    trace: [],
    recoveries: [],
    originalInput: { input: 'test' },
    chainId: 'test-chain',
    chainModules: ['PRIMARY'],
  } as PipelineContext;
}

// ── TESTS ──

describe('Primary Unit Detection (v2)', () => {
  it('detects class matching filename', () => {
    const prims = [makePrimitive({ name: 'TradeMatcher', extractionMethod: 'class' })];
    const unit = detectPrimaryUnit(prims, 'TradeMatcher.ts', 'typescript');
    expect(unit).not.toBeNull();
    expect(unit!.name).toBe('TradeMatcher');
    expect(unit!.executableUnit).toBeDefined();
    expect(unit!.executableUnit.executionKind).toBe('class');
    expect(unit!.executableUnit.sourceLanguage).toBe('typescript');
  });

  it('detects entry-point function', () => {
    const prims = [makePrimitive({ name: 'main', extractionMethod: 'function' })];
    const unit = detectPrimaryUnit(prims, 'app.py', 'python');
    expect(unit!.name).toBe('main');
    expect(unit!.executableUnit.sourceLanguage).toBe('python');
  });

  it('includes executable hints', () => {
    const prims = [makePrimitive({ name: 'run', extractionMethod: 'function', language: 'typescript' })];
    const unit = detectPrimaryUnit(prims, 'runner.ts', 'typescript');
    expect(unit!.executableUnit.directlyExecutable).toBe(true);
    expect(unit!.executableUnit.requiresBridge).toBe(false);
    expect(unit!.executableUnit.fallbackOnly).toBe(false);
  });

  it('marks PHP as bridge-required', () => {
    const prims = [makePrimitive({ name: 'Handler', extractionMethod: 'class', language: 'php' })];
    const unit = detectPrimaryUnit(prims, 'Handler.php', 'php');
    expect(unit!.executableUnit.requiresBridge).toBe(true);
    expect(unit!.executableUnit.directlyExecutable).toBe(false);
  });

  it('returns null for empty primitives', () => {
    expect(detectPrimaryUnit([], 'empty.ts')).toBeNull();
  });
});

describe('Execution Strategy Resolution', () => {
  beforeEach(() => clearPrimitives());

  it('resolves local for TypeScript with registered handler', () => {
    registerPrimitive({ id: 'p-myFunc', name: 'myFunc', source: 'native', handler: () => ({}) });
    const unit = buildExecutableUnit(
      { name: 'myFunc', category: 'execution', confidence: 0.9, complexity: 2, extractionMethod: 'function' },
      'typescript'
    );
    const res = resolveExecutionStrategy(unit);
    expect(res.strategy).toBe('local');
    expect(res.localHandlerAvailable).toBe(true);
  });

  it('resolves local for direct TS/JS execution', () => {
    const unit = buildExecutableUnit(
      { name: 'analyzer', category: 'analysis', confidence: 0.8, complexity: 3, extractionMethod: 'function' },
      'javascript'
    );
    const res = resolveExecutionStrategy(unit);
    expect(res.strategy).toBe('local');
  });

  it('resolves bridge for PHP', () => {
    const unit = buildExecutableUnit(
      { name: 'PhpHandler', category: 'execution', confidence: 0.7, complexity: 4, extractionMethod: 'class' },
      'php'
    );
    const res = resolveExecutionStrategy(unit);
    // Bridge requires runtime mode != offline
    expect(['bridge', 'fallback']).toContain(res.strategy);
  });

  it('resolves fallback for unknown language', () => {
    const unit = buildExecutableUnit(
      { name: 'CobolProc', category: 'execution', confidence: 0.5, complexity: 2, extractionMethod: 'function' },
      'cobol'
    );
    const res = resolveExecutionStrategy(unit);
    expect(res.strategy).toBe('fallback');
  });
});

describe('bindAndExecute', () => {
  beforeEach(() => clearPrimitives());

  it('local execution path returns executed=true', () => {
    registerPrimitive({
      id: 'p-localUnit',
      name: 'localUnit',
      source: 'native',
      handler: (input) => ({ ...(input as Record<string, unknown>), processed: true }),
    });
    const unit = buildExecutableUnit(
      { name: 'localUnit', category: 'execution', confidence: 0.9, complexity: 2, extractionMethod: 'function' },
      'typescript'
    );
    const result = bindAndExecute(unit, { test: 1 });
    expect(result.executed).toBe(true);
    expect(result.degraded).toBe(false);
    expect(result.strategy).toBe('local');
    expect(result.fallbackReason).toBeNull();
    expect(result.signals.length).toBeGreaterThan(0);
  });

  it('fallback path returns executed=false honestly', () => {
    const unit = buildExecutableUnit(
      { name: 'VhdlModule', category: 'computation', confidence: 0.6, complexity: 5, extractionMethod: 'module' },
      'vhdl'
    );
    const result = bindAndExecute(unit, { data: 'passthrough' });
    expect(result.executed).toBe(false);
    expect(result.strategy).toBe('fallback');
    expect(result.fallbackReason).toBeTruthy();
    expect(result.normalizedResult.executed).toBe(false);
  });

  it('degraded path on execution failure', () => {
    registerPrimitive({
      id: 'p-failUnit',
      name: 'failUnit',
      source: 'native',
      handler: () => { throw new Error('Intentional failure'); },
    });
    const unit = buildExecutableUnit(
      { name: 'failUnit', category: 'execution', confidence: 0.9, complexity: 2, extractionMethod: 'function' },
      'typescript'
    );
    const result = bindAndExecute(unit, { test: 1 });
    // After local fails, falls through to fallback passthrough
    expect(result.degraded).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('applyEffectInjection (v2)', () => {
  beforeEach(() => clearPrimitives());

  it('merges normalized records into PipelineContext', () => {
    const node = makeNode({ language: 'typescript' });
    const ctx = makeCtx();
    const result = applyEffectInjection(ctx, node);

    const effectKey = Object.keys(result.data).find(k => k.startsWith('_effect_'));
    expect(effectKey).toBeTruthy();

    const effect = result.data[effectKey!] as Record<string, unknown>;
    expect(effect.execution_strategy).toBeDefined();
    expect(typeof effect.executed).toBe('boolean');
    expect(typeof effect.degraded).toBe('boolean');
    expect(effect.fallback_reason === null || typeof effect.fallback_reason === 'string').toBe(true);
  });

  it('sets truthful annotations', () => {
    const node = makeNode({ language: 'typescript' });
    const ctx = makeCtx();
    const result = applyEffectInjection(ctx, node);

    expect(result.annotations[`effect.${node.id}.strategy`]).toBeDefined();
    expect(typeof result.annotations[`effect.${node.id}.executed`]).toBe('boolean');
    expect(typeof result.annotations[`effect.${node.id}.degraded`]).toBe('boolean');
  });

  it('generates strategy-labeled transformation notes', () => {
    const node = makeNode({ language: 'typescript' });
    const ctx = makeCtx();
    const result = applyEffectInjection(ctx, node);

    const notes = result.transformationNotes.filter(n => n.startsWith('[EFFECT]'));
    expect(notes.length).toBe(1);
    // Should contain one of the honest labels
    expect(
      notes[0].includes('executed via local') ||
      notes[0].includes('executed via bridge') ||
      notes[0].includes('fallback passthrough') ||
      notes[0].includes('degraded execution')
    ).toBe(true);
  });

  it('handles node with no primitives as honest fallback', () => {
    const node = makeNode({ primitives: [] });
    const ctx = makeCtx();
    const result = applyEffectInjection(ctx, node);

    const effectKey = Object.keys(result.data).find(k => k.startsWith('_effect_'));
    const effect = result.data[effectKey!] as Record<string, unknown>;
    expect(effect.executed).toBe(false);
    expect(effect.execution_strategy).toBe('fallback');
  });
});

describe('enrichExtractionWithEffects (v2)', () => {
  it('includes v2 executable hints in effectMeta', () => {
    const stats: ExtractionStats = {
      totalPrimitives: 1, byCategory: {} as any, byMethod: {},
      avgConfidence: 0.8, avgComplexity: 3, avgQualityScore: 0.7,
      languagesDetected: ['typescript'], totalLinesAnalyzed: 100,
    };
    const summary: QualitySummary = {
      totalExtracted: 1, totalAccepted: 1, totalRejected: 0,
      avgQualityScore: 0.8, avgConfidence: 0.8,
      topCategories: [], extractionTrustBreakdown: {},
    };
    const extraction: ExtractionResult = {
      primitives: [makePrimitive()],
      quality: { accepted: [makePrimitive()], rejected: [], summary },
      stats,
      warnings: [],
      durationMs: 50,
      correlationId: 'test-corr',
    };

    const result = enrichExtractionWithEffects(extraction, 'handler.ts', 'typescript');
    expect(result.effectMeta.injectionVersion).toBe(2);
    expect(result.effectMeta.resolvedStrategy).toBeDefined();
    expect(result.effectMeta.strategyReason).toBeTruthy();
    expect(result.effectMeta.primaryUnit?.executionKind).toBeDefined();
    expect(result.effectMeta.primaryUnit?.directlyExecutable).toBeDefined();
  });
});

describe('Truthfulness rules', () => {
  beforeEach(() => clearPrimitives());

  it('never reports fallback as executed=true', () => {
    const unit = buildExecutableUnit(
      { name: 'unknown', category: 'unknown', confidence: 0.3, complexity: 1, extractionMethod: 'pattern' },
      'fortran'
    );
    const result = bindAndExecute(unit, {});
    if (result.strategy === 'fallback') {
      expect(result.executed).toBe(false);
    }
  });

  it('local success is truly executed', () => {
    registerPrimitive({ name: 'truth', source: 'native', handler: () => ({ ok: true }) });
    const unit = buildExecutableUnit(
      { name: 'truth', category: 'execution', confidence: 0.9, complexity: 1, extractionMethod: 'function' },
      'typescript'
    );
    const result = bindAndExecute(unit, {});
    expect(result.executed).toBe(true);
    expect(result.degraded).toBe(false);
    expect(result.strategy).toBe('local');
  });
});
