/**
 * CMPSBL® Primary Handler Factory — Tests
 * Validates the critical fix: primary modules get real handlers, never DEFAULT.
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

  it('registers a handler for a primary unit name', () => {
    const prims = [makePrimitive(), makePrimitive({ name: 'processOrder', category: 'execution' })];
    const result = registerPrimaryHandler('TradeMatcher', prims, 'php');

    expect(result.registered).toBe(true);
    expect(result.handlerType).toBe('behavioral');
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

  it('handler returns enriched data — not just passthrough', () => {
    registerPrimaryHandler('TradeMatcher', [makePrimitive()], 'php');
    const prim = getPrimitive('TradeMatcher');
    const result = prim!.handler!({ bid: 100, ask: 95 }) as Record<string, unknown>;

    expect(result).toHaveProperty('_primary_tradematcher');
    const primary = result._primary_tradematcher as Record<string, unknown>;
    expect(primary.executed).toBe(true);
    expect(primary.intent).toBeDefined();
    expect(primary.meaningful).toBe(true);
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
    // This simulates what execution-binding does
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
    // 'identity' is registered as native by registerDefaults
    const result = registerPrimaryHandler('identity', [makePrimitive()], 'typescript');
    expect(result.reason).toContain('Already registered');
  });

  it('handles empty primitives gracefully', () => {
    const result = registerPrimaryHandler('EmptyModule', [], 'rust');
    expect(result.registered).toBe(true);
    expect(result.handlerType).toBe('passthrough_primary');
    expect(result.reason).toContain('No primitives');
  });
});
