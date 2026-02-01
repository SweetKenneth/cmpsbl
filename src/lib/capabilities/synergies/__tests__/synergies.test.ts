/**
 * Synergy System Tests
 * v7.0.0 — Cross-module pipeline validation
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock supabase client to avoid localStorage issues in tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

import {
  listSynergies,
  getSynergy,
  getSynergiesByModule,
  getSynergyCategories,
  SYNERGY_DEFINITIONS,
  dryRunSynergy,
  getRecommendedSynergies,
} from '@/lib/capabilities/synergies';

describe('Synergy Registry', () => {
  it('should have 15 defined synergies', () => {
    expect(SYNERGY_DEFINITIONS.length).toBe(15);
  });

  it('should list all synergies', () => {
    const synergies = listSynergies();
    expect(synergies.length).toBe(15);
  });

  it('should filter synergies by category', () => {
    const intelligence = listSynergies('intelligence');
    expect(intelligence.length).toBe(4);
    expect(intelligence.every(s => s.category === 'intelligence')).toBe(true);
  });

  it('should get synergy by ID', () => {
    const synergy = getSynergy('smart-recall');
    expect(synergy).toBeDefined();
    expect(synergy?.name).toBe('Smart Recall');
    expect(synergy?.modules.length).toBeGreaterThanOrEqual(2);
  });

  it('should return undefined for unknown synergy', () => {
    const synergy = getSynergy('nonexistent');
    expect(synergy).toBeUndefined();
  });

  it('should get synergies by module', () => {
    const brainSynergies = getSynergiesByModule('BRAIN');
    expect(brainSynergies.length).toBeGreaterThan(0);
    expect(brainSynergies.every(s => 
      s.modules.some(m => m.name.toUpperCase() === 'BRAIN')
    )).toBe(true);
  });

  it('should get category counts', () => {
    const categories = getSynergyCategories();
    expect(categories.length).toBeGreaterThan(0);
    
    const totalCount = categories.reduce((sum, c) => sum + c.count, 0);
    expect(totalCount).toBe(15);
  });
});

describe('Synergy Definitions', () => {
  it('every synergy should have at least 2 modules', () => {
    for (const synergy of SYNERGY_DEFINITIONS) {
      expect(synergy.modules.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('every synergy should have a primary module', () => {
    for (const synergy of SYNERGY_DEFINITIONS) {
      const hasPrimary = synergy.modules.some(m => m.role === 'primary');
      expect(hasPrimary).toBe(true);
    }
  });

  it('every synergy should have valid risk level', () => {
    for (const synergy of SYNERGY_DEFINITIONS) {
      expect(['low', 'medium', 'high']).toContain(synergy.risk);
    }
  });

  it('every synergy should have estimated execution time', () => {
    for (const synergy of SYNERGY_DEFINITIONS) {
      expect(synergy.estimatedMs).toBeGreaterThan(0);
    }
  });
});

describe('Synergy Preview', () => {
  it('should generate execution plan for valid synergy', async () => {
    const preview = await dryRunSynergy('smart-recall');
    
    expect(preview.synergy.id).toBe('smart-recall');
    expect(preview.plan.length).toBeGreaterThan(0);
    expect(preview.estimatedMs).toBeGreaterThan(0);
  });

  it('should throw for unknown synergy', async () => {
    await expect(dryRunSynergy('nonexistent')).rejects.toThrow();
  });
});

describe('Synergy Recommendations', () => {
  it('should return optimization synergies for performance issues', () => {
    const recs = getRecommendedSynergies({ performanceIssues: true });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every(s => s.category === 'optimization')).toBe(true);
  });

  it('should return security synergies for security concerns', () => {
    const recs = getRecommendedSynergies({ securityConcerns: true });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every(s => s.category === 'security')).toBe(true);
  });

  it('should return resilience synergies for recent errors', () => {
    const recs = getRecommendedSynergies({ recentErrors: ['timeout'] });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every(s => s.category === 'resilience')).toBe(true);
  });

  it('should limit recommendations to 5', () => {
    const recs = getRecommendedSynergies({
      performanceIssues: true,
      securityConcerns: true,
      recentErrors: ['error'],
    });
    expect(recs.length).toBeLessThanOrEqual(5);
  });
});

describe('Synergy Categories', () => {
  const categoryExpectations = [
    { category: 'intelligence', minCount: 3 },
    { category: 'optimization', minCount: 2 },
    { category: 'resilience', minCount: 2 },
    { category: 'security', minCount: 2 },
    { category: 'accessibility', minCount: 2 },
    { category: 'automation', minCount: 1 },
  ];

  for (const { category, minCount } of categoryExpectations) {
    it(`should have at least ${minCount} ${category} synergies`, () => {
      const synergies = listSynergies(category);
      expect(synergies.length).toBeGreaterThanOrEqual(minCount);
    });
  }
});
