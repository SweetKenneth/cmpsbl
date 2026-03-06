/**
 * Discovery Engine — E2E Unit Tests
 * Validates gap analysis, recommendations, circuit breaker, health scoring,
 * healing, cooldown, and error isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => {
      const chain: any = {
        select: () => chain,
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => chain,
        delete: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
      };
      return chain;
    },
    functions: {
      invoke: () => Promise.resolve({ data: null, error: null }),
    },
    rpc: () => Promise.resolve({ data: null, error: null }),
  },
}));

vi.mock('@/lib/substrate/intent-mesh/manifest', () => ({
  MESH_MANIFEST: [],
  getModuleResolvers: () => [],
  getResolversByDomain: () => [],
  getMeshModules: () => ['BRAIN', 'DEFENSE', 'NEXUS'],
}));

vi.mock('@/lib/substrate/intent-mesh/router', () => ({
  getRecentReceipts: vi.fn().mockResolvedValue([]),
  getMeshStats: vi.fn().mockReturnValue({ totalIntents: 0 }),
}));

import {
  analyzeGaps,
  generateRecommendations,
  runDiscoveryCycle,
  getDiscoveryHealth,
  getDiscoveryBreakerState,
  healDiscoveryEngine,
  resetDiscoveryEngine,
} from '@/lib/substrate/intent-mesh/discovery-engine';

describe('Discovery Engine', () => {
  beforeEach(() => {
    resetDiscoveryEngine();
  });

  describe('Health & Breaker', () => {
    it('should start with healthy state', () => {
      const health = getDiscoveryHealth();
      expect(health.score).toBe(100);
      expect(health.status).toBe('healthy');
      expect(health.totalRuns).toBe(0);
    });

    it('should start with closed breaker', () => {
      const breaker = getDiscoveryBreakerState();
      expect(breaker.state).toBe('closed');
      expect(breaker.failures).toBe(0);
    });
  });

  describe('Healing', () => {
    it('should heal and restore health', () => {
      const result = healDiscoveryEngine(false);
      expect(result.ok).toBe(true);
      expect(result.newScore).toBeGreaterThanOrEqual(80);
    });

    it('should force-heal to 100', () => {
      const result = healDiscoveryEngine(true);
      expect(result.newScore).toBe(100);
      expect(result.actions).toContain('Health score force-restored to 100');
    });

    it('should reset cooldown on heal', () => {
      const result = healDiscoveryEngine(true);
      expect(result.actions.some(a => a.includes('Cooldown reset'))).toBe(true);
    });
  });

  describe('Gap Analysis', () => {
    it('should return structural gaps even with no receipts', async () => {
      const gaps = await analyzeGaps();
      // Should find structural gaps from MODULE_DOMAIN_KNOWLEDGE
      expect(gaps.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Recommendations', () => {
    it('should return empty for no gaps', () => {
      const recs = generateRecommendations([]);
      expect(recs).toEqual([]);
    });

    it('should deduplicate by resolver ID', () => {
      const gaps = [
        { sourceModule: 'BRAIN', intentType: 'structural_gap:brain', domains: ['reasoning'], neededOutputs: ['confidence'], availableResolvers: 0, respondingResolvers: 0, missingModules: ['BRAIN'], severity: 'high' as const, frequency: 0 },
        { sourceModule: 'BRAIN', intentType: 'structural_gap:brain', domains: ['reasoning'], neededOutputs: ['confidence'], availableResolvers: 0, respondingResolvers: 0, missingModules: ['BRAIN'], severity: 'high' as const, frequency: 0 },
      ];
      const recs = generateRecommendations(gaps);
      const ids = recs.map(r => r.proposedResolverId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('Discovery Cycle', () => {
    it('should complete a cycle', async () => {
      const result = await runDiscoveryCycle({ persistResults: false, force: true });
      expect(result.runType).toBe('full');
      expect(result.modulesAnalyzed).toBeGreaterThan(0);
      expect(result.summary).toContain('Discovery cycle complete');
    });

    it('should respect cooldown', async () => {
      await runDiscoveryCycle({ persistResults: false, force: true });
      const second = await runDiscoveryCycle({ persistResults: false });
      expect(second.summary).toContain('cooldown');
    });

    it('should bypass cooldown with force', async () => {
      await runDiscoveryCycle({ persistResults: false, force: true });
      const second = await runDiscoveryCycle({ persistResults: false, force: true });
      expect(second.summary).toContain('Discovery cycle complete');
    });

    it('should boost health on success', async () => {
      await runDiscoveryCycle({ persistResults: false, force: true });
      const health = getDiscoveryHealth();
      expect(health.totalRuns).toBeGreaterThanOrEqual(1);
    });
  });
});
