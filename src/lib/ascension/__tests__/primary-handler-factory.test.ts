/**
 * CMPSBL® Primary Handler Factory — Tests
 * Validates the dual-layer architecture: handlers WRAP original code, never simulate.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { registerPrimaryHandler, hasPrimaryHandler } from '../primary-handler-factory';
import { getPrimitive, clearPrimitives } from '../primitive-registry';
import { registerDefaults } from '../primitive-defaults';
import type { ExtractedPrimitive } from '../types';

function makePrimitive(overrides: Partial<ExtractedPrimitive> = {}): ExtractedPrimitive {
  return {
    id: 'test_1',
    name: 'evaluateTrade',
    canonicalName: 'evaluateTrade',
    category: 'analysis',
    inputs: ['price', 'volume'],
    outputs: ['score'],
    confidence: 0.85,
    qualityScore: 0.8,
    sourceSnippet: 'function evaluateTrade(price, volume) { if (price > threshold) { return score; } }',
    language: 'php',
    extractionMethod: 'function',
    extractionTrust: 'high',
    keywords: ['evaluate', 'if', 'return'],
    complexity: 4,
    sourceFile: 'TradeMatcher.php',
    patternId: 'php-func',
    ...overrides,
  };
}

describe('Primary Handler Factory', () => {
  beforeEach(() => {
    clearPrimitives();
    registerDefaults();
  });

  it('registers a wrapping handler for a primary unit name', () => {
    const prims = [makePrimitive(), makePrimitive({ name: 'processOrder', category: 'execution' })];
    const result = registerPrimaryHandler('TradeMatcher', prims, 'php');

    expect(result.registered).toBe(true);
    expect(result.handlerType).toBe('wrapping');
    expect(result.hasMeaningfulBehavior).toBe(true);
    expect(hasPrimaryHandler('TradeMatcher')).toBe(true);
  });

  it('getPrimitive finds the registered handler (case-insensitive)', () => {
    registerPrimaryHandler('TradeMatcher', [makePrimitive()], 'php');
    const prim = getPrimitive('TradeMatcher');
    
    expect(prim).not.toBeNull();
    expect(prim!.source).toBe('generated');
    expect(prim!.handler).toBeDefined();
  });

  it('handler preserves original input and adds cognitive overlay', () => {
    registerPrimaryHandler('TradeMatcher', [makePrimitive()], 'php');
    const prim = getPrimitive('TradeMatcher');
    const result = prim!.handler!({ bid: 100, ask: 95 }) as Record<string, unknown>;

    // Original input MUST be preserved
    expect(result.bid).toBe(100);
    expect(result.ask).toBe(95);

    // Cognitive overlay MUST be present (in _cmpsbl_overlay, NOT replacing original keys)
    expect(result).toHaveProperty('_cmpsbl_overlay');
    const overlay = result._cmpsbl_overlay as Record<string, unknown>;
    const execution = overlay.execution as Record<string, unknown>;
    expect(execution.handler_type).toBe('wrapping');
    expect(execution.original_preserved).toBe(true);
    expect(execution.computation_replaced).toBe(false);
  });

  it('creates passthrough_primary when no meaningful behavior detected', () => {
    const emptyPrim = makePrimitive({
      name: 'Config',
      category: 'unknown',
      keywords: [],
      sourceSnippet: 'const x = 1;',
      complexity: 1,
      extractionMethod: 'module',
    });
    const result = registerPrimaryHandler('Config', [emptyPrim], 'javascript');

    expect(result.registered).toBe(true);
    expect(result.handlerType).toBe('passthrough_primary');
  });

  it('registered handler works with primitiveExecutorSync flow', () => {
    registerPrimaryHandler('Analyzer', [
      makePrimitive({ name: 'analyze', category: 'analysis', keywords: ['analyze', 'score', 'if'] }),
    ], 'python');

    const prim = getPrimitive('Analyzer');
    expect(prim).not.toBeNull();

    const output = prim!.handler!({ data: [1, 2, 3] }, { confidence: 0.9 });
    expect(output).toBeDefined();
    expect(typeof output).toBe('object');
  });

  it('does not overwrite native handlers', () => {
    const result = registerPrimaryHandler('identity', [makePrimitive()], 'typescript');
    expect(result.reason).toContain('Already registered');
  });

  it('handles empty primitives gracefully', () => {
    const result = registerPrimaryHandler('EmptyModule', [], 'rust');
    expect(result.registered).toBe(true);
    expect(result.handlerType).toBe('passthrough_primary');
    expect(result.reason).toContain('No primitives');
  });

  it('never replaces original computation (dual-layer invariant)', () => {
    registerPrimaryHandler('SafeCracker', [
      makePrimitive({ name: 'solve', category: 'computation', keywords: ['compute', 'iterate', 'for'] }),
    ], 'python');

    const prim = getPrimitive('SafeCracker');
    const input = { combination: [1, 2, 3], attempts: 100 };
    const result = prim!.handler!(input) as Record<string, unknown>;

    // Original data keys MUST survive unchanged
    expect(result.combination).toEqual([1, 2, 3]);
    expect(result.attempts).toBe(100);

    // Overlay must declare it did NOT replace computation
    const overlay = result._cmpsbl_overlay as Record<string, unknown>;
    const execution = overlay.execution as Record<string, unknown>;
    expect(execution.computation_replaced).toBe(false);
  });
});
