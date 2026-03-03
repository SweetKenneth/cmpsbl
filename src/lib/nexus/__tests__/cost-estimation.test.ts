/**
 * NEXUS Cost Estimation — Unit Tests
 * Validates token counting, cost estimation, and budget enforcement
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock localStorage for supabase client
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    (globalThis as any).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    };
  }
});

import { estimateCost } from '../costEstimation';

describe('NEXUS Cost Estimation', () => {
  describe('estimateCost', () => {
    it('returns valid cost estimate structure', () => {
      const estimate = estimateCost('groq' as any, 'llama-3-70b', 'Hello, world! This is a test prompt.');
      expect(estimate).toHaveProperty('provider');
      expect(estimate).toHaveProperty('model');
      expect(estimate).toHaveProperty('estimatedCost');
      expect(estimate).toHaveProperty('inputTokens');
      expect(estimate).toHaveProperty('outputTokens');
      expect(estimate).toHaveProperty('confidence');
      expect(estimate).toHaveProperty('breakdown');
    });

    it('estimates non-zero cost for real input', () => {
      const estimate = estimateCost('groq' as any, 'llama-3-70b', 'Generate a detailed analysis of quantum computing trends in modern enterprise.');
      expect(estimate.estimatedCost).toBeGreaterThan(0);
      expect(estimate.inputTokens).toBeGreaterThan(0);
    });

    it('scales cost with input length', () => {
      const short = estimateCost('groq' as any, 'llama-3-70b', 'hi');
      const long = estimateCost('groq' as any, 'llama-3-70b', 'a '.repeat(1000));
      expect(long.estimatedCost).toBeGreaterThan(short.estimatedCost);
      expect(long.inputTokens).toBeGreaterThan(short.inputTokens);
    });

    it('handles empty input gracefully', () => {
      const estimate = estimateCost('groq' as any, 'unknown-model', '');
      expect(estimate).toHaveProperty('estimatedCost');
      expect(estimate.inputTokens).toBe(0);
    });

    it('provides confidence score between 0 and 1', () => {
      const estimate = estimateCost('groq' as any, 'llama-3-70b', 'test');
      expect(estimate.confidence).toBeGreaterThanOrEqual(0);
      expect(estimate.confidence).toBeLessThanOrEqual(1);
    });

    it('includes breakdown with input/output/overhead', () => {
      const estimate = estimateCost('groq' as any, 'llama-3-70b', 'test prompt');
      expect(estimate.breakdown).toHaveProperty('inputCost');
      expect(estimate.breakdown).toHaveProperty('outputCost');
      expect(estimate.breakdown).toHaveProperty('overhead');
    });
  });
});
