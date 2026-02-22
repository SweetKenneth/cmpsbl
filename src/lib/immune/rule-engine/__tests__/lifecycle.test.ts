import { describe, it, expect } from 'vitest';
import { checkPromotionEligibility, checkCandidateEligibility, shouldDemote, shouldRetire, arbitrateConflict, computeNextStatus } from '../lifecycle';
import type { ImmunityRule } from '../types';

function makeRule(overrides: Partial<ImmunityRule> = {}): ImmunityRule {
  return {
    id: 'r1', rule_key: 'TEST', category: 'test', source_executor: 'exec1',
    status: 'candidate', confidence: 0.9, success_rate: 0.85,
    invocations_24h: 50, invocations_7d: 200,
    last_seen_at: null, created_at: new Date().toISOString(),
    promoted_at: null, retired_at: null,
    ...overrides,
  };
}

describe('lifecycle', () => {
  describe('checkPromotionEligibility', () => {
    it('passes when all gates met', () => {
      const r = checkPromotionEligibility(makeRule(), 3, false, 10);
      expect(r.eligible).toBe(true);
    });
    it('blocks non-candidate', () => {
      const r = checkPromotionEligibility(makeRule({ status: 'learned' }), 3, false, 10);
      expect(r.eligible).toBe(false);
    });
    it('blocks low success rate', () => {
      const r = checkPromotionEligibility(makeRule({ success_rate: 0.5 }), 3, false, 10);
      expect(r.eligible).toBe(false);
    });
    it('blocks conflicts', () => {
      const r = checkPromotionEligibility(makeRule(), 3, true, 10);
      expect(r.eligible).toBe(false);
    });
    it('blocks high duration increase', () => {
      const r = checkPromotionEligibility(makeRule(), 3, false, 20);
      expect(r.eligible).toBe(false);
    });
  });

  describe('shouldDemote', () => {
    it('true for promoted rule with low success', () => {
      expect(shouldDemote(makeRule({ status: 'promoted', success_rate: 0.5 }))).toBe(true);
    });
    it('false for promoted rule with good success', () => {
      expect(shouldDemote(makeRule({ status: 'promoted', success_rate: 0.8 }))).toBe(false);
    });
  });

  describe('shouldRetire', () => {
    it('true for zero invocations', () => {
      expect(shouldRetire(makeRule({ status: 'learned', invocations_7d: 0 }))).toBe(true);
    });
    it('false for promoted rules', () => {
      expect(shouldRetire(makeRule({ status: 'promoted', invocations_7d: 0 }))).toBe(false);
    });
  });

  describe('arbitrateConflict', () => {
    it('blocks both on security', () => {
      expect(arbitrateConflict(
        { success_rate: 0.9, p95_duration_ms: 10, propagation_breadth: 5 },
        { success_rate: 0.8, p95_duration_ms: 10, propagation_breadth: 5 },
        true
      )).toBe('both_blocked');
    });
    it('prefers higher success rate', () => {
      expect(arbitrateConflict(
        { success_rate: 0.9, p95_duration_ms: 10, propagation_breadth: 5 },
        { success_rate: 0.8, p95_duration_ms: 10, propagation_breadth: 5 },
        false
      )).toBe('prefer_a');
    });
    it('prefers lower duration on tie', () => {
      expect(arbitrateConflict(
        { success_rate: 0.9, p95_duration_ms: 5, propagation_breadth: 5 },
        { success_rate: 0.9, p95_duration_ms: 10, propagation_breadth: 5 },
        false
      )).toBe('prefer_a');
    });
  });

  describe('computeNextStatus', () => {
    it('retires dormant learned rules', () => {
      expect(computeNextStatus('learned', 0, 0.5, 1, 0.5)).toBe('retired');
    });
    it('demotes failing promoted rules', () => {
      expect(computeNextStatus('promoted', 100, 0.4, 5, 0.9)).toBe('candidate');
    });
    it('promotes good candidates', () => {
      expect(computeNextStatus('candidate', 100, 0.85, 5, 0.9)).toBe('promoted');
    });
    it('returns null when no change', () => {
      expect(computeNextStatus('promoted', 100, 0.9, 5, 0.9)).toBeNull();
    });
  });
});
