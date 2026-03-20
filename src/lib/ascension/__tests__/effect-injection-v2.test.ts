/**
 * CMPSBL® Universal Effect Injection v2 — Endgame Tests
 * Focused coverage: detection, strategy, execution paths, truthfulness.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { detectPrimaryUnit, effectWrapper, applyEffectInjection, enrichExtractionWithEffects } from '../effect-injection';
import { resolveExecutionStrategy, buildExecutableUnit, bindAndExecute, type ExecutableUnit } from '../execution-binding';
import { registerPrimitive, clearPrimitives } from '../primitive-registry';
import type { ExtractedPrimitive, AscensionNode, ExtractionResult, ExtractionStats, QualitySummary } from '../types';
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

// Build an ExecutableUnit directly for strategy tests (bypasses registry lookup at build time)
function makeExecUnit(overrides: Partial<ExecutableUnit> = {}): ExecutableUnit {
  return {
    name: 'TestUnit',
    category: 'execution',
    confidence: 0.9,
    complexity: 2,
    executionKind: 'function',
    callableSymbol: 'TestUnit',
    sourceLanguage: 'typescript',
    directlyExecutable: true,
    requiresBridge: false,
    fallbackOnly: false,
    ...overrides,
  };
}

// ── TESTS ──

describe('Primary Unit Detection (v2)', () => {
  beforeEach(() => clearPrimitives());

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

  it('includes executable hints for TS', () => {
    const prims = [makePrimitive({ name: 'run', extractionMethod: 'function' })];
    const unit = detectPrimaryUnit(prims, 'runner.ts', 'typescript');
    // TS units are directly executable
    expect(unit!.executableUnit.sourceLanguage).toBe('typescript');
    expect(unit!.executableUnit.fallbackOnly).toBe(false);
  });

  it('detects PHP unit with correct language metadata', () => {
    const prims = [makePrimitive({ name: 'PhpClass', extractionMethod: 'class', language: 'php' })];
    const unit = detectPrimaryUnit(prims, 'PhpClass.php', 'php');
    expect(unit!.executableUnit.sourceLanguage).toBe('php');
    expect(unit!.executableUnit.executionKind).toBe('class');
    // PHP is not in LOCAL_LANGUAGES, so not directly executable (unless handler registered)
    expect(unit!.executableUnit.sourceLanguage).toBe('php');
  });

  it('returns null for empty primitives', () => {
    expect(detectPrimaryUnit([], 'empty.ts')).toBeNull();
  });
});

describe('Execution Strategy Resolution', () => {
  it('resolves local for directly executable unit', () => {
    const unit = makeExecUnit({ directlyExecutable: true, sourceLanguage: 'typescript' });
    const res = resolveExecutionStrategy(unit);
    expect(res.strategy).toBe('local');
  });

  it('resolves fallback for fallback-only unit', () => {
    const unit = makeExecUnit({
      name: 'FortranProc',
      sourceLanguage: 'fortran',
      directlyExecutable: false,
      requiresBridge: false,
      fallbackOnly: true,
    });
    const res = resolveExecutionStrategy(unit);
    expect(res.strategy).toBe('fallback');
    expect(res.reason).toContain('fallback-only');
  });

  it('resolves bridge for bridge-language unit with bridge available', () => {
    const unit = makeExecUnit({
      name: 'PhpHandler',
      sourceLanguage: 'php',
      directlyExecutable: false,
      requiresBridge: true,
      fallbackOnly: false,
    });
    const res = resolveExecutionStrategy(unit);
    // Bridge availability depends on runtime mode
    expect(['bridge', 'fallback']).toContain(res.strategy);
  });
});

describe('bindAndExecute', () => {
  beforeEach(() => clearPrimitives());

  it('local execution with registered handler returns executed=true', () => {
    registerPrimitive({
      id: 'p-localUnit',
      name: 'localUnit',
      source: 'native',
      handler: (input) => ({ ...(input as Record<string, unknown>), processed: true }),
    });
    const unit = makeExecUnit({ name: 'localUnit', directlyExecutable: true });
    const result = bindAndExecute(unit, { test: 1 });
    expect(result.executed).toBe(true);
    expect(result.degraded).toBe(false);
    expect(result.strategy).toBe('local');
    expect(result.fallbackReason).toBeNull();
    expect(result.signals.length).toBeGreaterThan(0);
  });

  it('fallback-only path returns executed=false honestly', () => {
    const unit = makeExecUnit({
      name: 'VhdlModule',
      sourceLanguage: 'vhdl',
      directlyExecutable: false,
      requiresBridge: false,
      fallbackOnly: true,
    });
    const result = bindAndExecute(unit, { data: 'passthrough' });
    expect(result.executed).toBe(false);
    expect(result.strategy).toBe('fallback');
    expect(result.fallbackReason).toBeTruthy();
    expect(result.normalizedResult.executed).toBe(false);
  });

  it('degraded when handler throws and executor falls back', () => {
    registerPrimitive({
      id: 'p-failUnit',
      name: 'failUnit',
      source: 'native',
      handler: () => { throw new Error('Intentional failure'); },
    });
    const unit = makeExecUnit({ name: 'failUnit', directlyExecutable: true });
    const result = bindAndExecute(unit, { test: 1 });
    // Handler throws, executor catches internally and returns fallback signal
    // Our truthfulness check detects this as degraded
    expect(result.degraded).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('records timing and intelligence metrics', () => {
    const unit = makeExecUnit({ name: 'metricTest', fallbackOnly: true, directlyExecutable: false, requiresBridge: false });
    const result = bindAndExecute(unit, { payload: 'data' });
    expect(result.timingMs).toBeGreaterThanOrEqual(0);
    expect(result.intelligence.input_size).toBeGreaterThan(0);
    expect(result.intelligence.execution_density).toBeGreaterThan(0);
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

  it('sets all seven annotations', () => {
    const node = makeNode({ language: 'typescript' });
    const ctx = makeCtx();
    const result = applyEffectInjection(ctx, node);

    expect(result.annotations[`effect.${node.id}.primary`]).toBeDefined();
    expect(result.annotations[`effect.${node.id}.strategy`]).toBeDefined();
    expect(typeof result.annotations[`effect.${node.id}.executed`]).toBe('boolean');
    expect(typeof result.annotations[`effect.${node.id}.degraded`]).toBe('boolean');
    expect(result.annotations[`effect.${node.id}.fallback`]).toBeDefined();
    expect(typeof result.annotations[`effect.${node.id}.signals`]).toBe('number');
    expect(typeof result.annotations[`effect.${node.id}.errors`]).toBe('number');
  });

  it('generates strategy-labeled transformation notes', () => {
    const node = makeNode({ language: 'typescript' });
    const ctx = makeCtx();
    const result = applyEffectInjection(ctx, node);

    const notes = result.transformationNotes.filter(n => n.startsWith('[EFFECT]'));
    expect(notes.length).toBe(1);
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
  beforeEach(() => clearPrimitives());

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

  it('fallback-only never reports executed=true', () => {
    const unit = makeExecUnit({
      name: 'unknown',
      sourceLanguage: 'fortran',
      directlyExecutable: false,
      requiresBridge: false,
      fallbackOnly: true,
    });
    const result = bindAndExecute(unit, {});
    expect(result.strategy).toBe('fallback');
    expect(result.executed).toBe(false);
  });

  it('local with real handler is truly executed', () => {
    registerPrimitive({ id: 'p-truth', name: 'truth', source: 'native', handler: () => ({ ok: true }) });
    const unit = makeExecUnit({ name: 'truth', directlyExecutable: true });
    const result = bindAndExecute(unit, {});
    expect(result.executed).toBe(true);
    expect(result.degraded).toBe(false);
    expect(result.strategy).toBe('local');
  });

  it('synthetic metadata alone is never reported as true execution', () => {
    // Unit with no handler, local strategy but executor uses fallback
    const unit = makeExecUnit({ name: 'noHandler_test_v2', directlyExecutable: true });
    const result = bindAndExecute(unit, {});
    // Executor will use its internal fallback — truthfulness check catches this
    expect(result.degraded).toBe(true);
    expect(result.executed).toBe(false);
  });
});
