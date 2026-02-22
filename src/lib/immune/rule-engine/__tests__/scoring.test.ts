import { describe, it, expect } from 'vitest';
import { computeDominantScore, computeRiskScore, computeSpreadVelocity, computeP95, buildRuleHealth } from '../scoring';
import type { ImmunityRule } from '../types';

describe('scoring', () => {
  describe('computeDominantScore', () => {
    it('returns minimal score for zero invocations', () => {
      // log2(max(1,0)+1) * 1.0 * (1+log2(1)) = 1*1*1 = 1
      expect(computeDominantScore(0, 1.0, 0)).toBe(1);
    });
    it('higher invocations = higher score', () => {
      const low = computeDominantScore(10, 0.8, 1);
      const high = computeDominantScore(100, 0.8, 1);
      expect(high).toBeGreaterThan(low);
    });
    it('higher success rate = higher score', () => {
      const low = computeDominantScore(50, 0.5, 1);
      const high = computeDominantScore(50, 1.0, 1);
      expect(high).toBeGreaterThan(low);
    });
    it('wider propagation = higher score', () => {
      const narrow = computeDominantScore(50, 0.8, 1);
      const wide = computeDominantScore(50, 0.8, 10);
      expect(wide).toBeGreaterThan(narrow);
    });
  });

  describe('computeRiskScore', () => {
    it('returns 0 for zero invocations', () => {
      expect(computeRiskScore(0, 0.3)).toBe(0);
    });
    it('lower success = higher risk', () => {
      const low = computeRiskScore(50, 0.9);
      const high = computeRiskScore(50, 0.3);
      expect(high).toBeGreaterThan(low);
    });
    it('more invocations = higher risk', () => {
      const low = computeRiskScore(5, 0.4);
      const high = computeRiskScore(100, 0.4);
      expect(high).toBeGreaterThan(low);
    });
  });

  describe('computeSpreadVelocity', () => {
    it('returns 0 with no adoption', () => {
      expect(computeSpreadVelocity(0, null)).toBe(0);
    });
    it('faster adoption = higher velocity', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
      const old = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
      expect(computeSpreadVelocity(5, recent, now)).toBeGreaterThan(computeSpreadVelocity(5, old, now));
    });
  });

  describe('computeP95', () => {
    it('returns 0 for empty array', () => {
      expect(computeP95([])).toBe(0);
    });
    it('returns correct p95 for sorted values', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);
      expect(computeP95(values)).toBe(95);
    });
    it('single value returns itself', () => {
      expect(computeP95([42])).toBe(42);
    });
  });

  describe('buildRuleHealth', () => {
    const mockRule: ImmunityRule = {
      id: 'r1', rule_key: 'TEST', category: 'test', source_executor: 'exec1',
      status: 'promoted', confidence: 0.9, success_rate: 0.85,
      invocations_24h: 50, invocations_7d: 200,
      last_seen_at: null, created_at: new Date().toISOString(),
      promoted_at: null, retired_at: null,
    };

    it('builds health with all computed fields', () => {
      const h = buildRuleHealth(mockRule, 3, new Date().toISOString(), [10, 20, 30], [1, 2, 3]);
      expect(h.dominant_score).toBeGreaterThan(0);
      expect(h.risk_score).toBeGreaterThan(0);
      expect(h.propagation_breadth).toBe(3);
      expect(h.spread_velocity).toBeGreaterThan(0);
      expect(h.avg_duration_ms).toBe(20);
      expect(h.avg_cost_units).toBe(2);
    });
  });
});
