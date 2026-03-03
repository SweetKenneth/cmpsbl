/**
 * NEXUS Cost Ceiling — Unit Tests
 * Gap Analysis P0: Verify budget enforcement prevents runaway spend.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { costGate, withCostCeiling, CostCeilingError, setCostCeilingConfig } from '../cost-ceiling';

// Mock the cost estimation module
vi.mock('../costEstimation', () => ({
  estimateCost: vi.fn(() => ({
    provider: 'groq',
    model: 'test',
    estimatedCost: 100,
    inputTokens: 100,
    outputTokens: 150,
    confidence: 0.8,
    breakdown: { inputCost: 40, outputCost: 50, overhead: 10 },
  })),
  checkBudget: vi.fn(async (cost: number, config: any) => ({
    allowed: cost <= 500,
    reason: cost > 500 ? 'Daily budget exhausted' : undefined,
    status: {
      dailySpent: 400,
      dailyRemaining: cost <= 500 ? 100 : 0,
      monthlySpent: 1000,
      monthlyRemaining: cost <= 500 ? 9000 : 0,
      isWithinBudget: cost <= 500,
      warningLevel: 'none' as const,
      projectedDailySpend: 800,
    },
  })),
  recordSpending: vi.fn(async () => {}),
}));

describe('NEXUS Cost Ceiling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCostCeilingConfig({});
  });

  describe('costGate', () => {
    it('allows requests within budget', async () => {
      const result = await costGate('groq' as any, 'test-model', 'hello world');
      expect(result.allowed).toBe(true);
      expect(result.estimatedCost).toBe(100);
    });
  });

  describe('withCostCeiling', () => {
    it('executes function when within budget', async () => {
      const result = await withCostCeiling(
        'groq' as any, 'test', 'short prompt',
        async () => 'success',
      );
      expect(result).toBe('success');
    });

    it('throws CostCeilingError when budget exceeded', async () => {
      // Override mock to simulate exceeded budget
      const { checkBudget } = await import('../costEstimation');
      (checkBudget as any).mockResolvedValueOnce({
        allowed: false,
        reason: 'Daily budget exhausted',
        status: {
          dailySpent: 600,
          dailyRemaining: 0,
          monthlySpent: 5000,
          monthlyRemaining: 5000,
          isWithinBudget: false,
          warningLevel: 'exceeded',
          projectedDailySpend: 1200,
        },
      });

      await expect(
        withCostCeiling('groq' as any, 'test', 'prompt', async () => 'nope'),
      ).rejects.toThrow(CostCeilingError);
    });
  });

  describe('setCostCeilingConfig', () => {
    it('accepts partial config overrides', () => {
      setCostCeilingConfig({ dailyLimit: 1000000 });
      // No throw = success
    });
  });
});
