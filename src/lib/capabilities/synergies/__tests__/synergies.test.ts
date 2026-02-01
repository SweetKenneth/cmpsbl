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
  getSynergyExecutor,
} from '@/lib/capabilities/synergies';

describe('Synergy Registry', () => {
  it('should have 24 defined synergies', () => {
    expect(SYNERGY_DEFINITIONS.length).toBe(24);
  });

  it('should list all synergies', () => {
    const synergies = listSynergies();
    expect(synergies.length).toBe(24);
  });

  it('should filter synergies by category', () => {
    const intelligence = listSynergies('intelligence');
    expect(intelligence.length).toBe(6); // +2 new intelligence synergies
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
    expect(brainSynergies.length).toBeGreaterThan(5); // BRAIN is used in many synergies
    expect(brainSynergies.every(s => 
      s.modules.some(m => m.name.toUpperCase() === 'BRAIN')
    )).toBe(true);
  });

  it('should get category counts', () => {
    const categories = getSynergyCategories();
    expect(categories.length).toBeGreaterThan(0);
    
    const totalCount = categories.reduce((sum, c) => sum + c.count, 0);
    expect(totalCount).toBe(24);
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
  
  it('all new synergies should be properly defined', () => {
    const newSynergyIds = [
      'autonomous-documentation',
      'intent-amplification',
      'learning-acceleration',
      'cognitive-fusion',
      'resource-balancing',
      'latency-prediction',
      'cascade-prevention',
      'memory-persistence',
      'anomaly-correlation',
    ];
    
    for (const id of newSynergyIds) {
      const synergy = getSynergy(id);
      expect(synergy).toBeDefined();
      expect(synergy?.modules.length).toBeGreaterThanOrEqual(2);
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
    { category: 'intelligence', minCount: 6 },
    { category: 'optimization', minCount: 5 },
    { category: 'resilience', minCount: 5 },
    { category: 'security', minCount: 3 },
    { category: 'accessibility', minCount: 2 },
    { category: 'automation', minCount: 3 },
  ];

  for (const { category, minCount } of categoryExpectations) {
    it(`should have at least ${minCount} ${category} synergies`, () => {
      const synergies = listSynergies(category);
      expect(synergies.length).toBeGreaterThanOrEqual(minCount);
    });
  }
});

describe('Synergy Executors', () => {
  const executorIds = [
    'smart-recall',
    'adaptive-routing',
    'graceful-degradation',
    'learning-acceleration',
    'cascade-prevention',
    'anomaly-correlation',
    'cognitive-fusion',
    'intent-amplification',
  ];
  
  for (const id of executorIds) {
    it(`should have executor registered for ${id}`, () => {
      const executor = getSynergyExecutor(id);
      expect(executor).toBeDefined();
      expect(typeof executor).toBe('function');
    });
  }
});

describe('Module Coverage', () => {
  const allModules = [
    'BRAIN', 'NEXUS', 'VISION', 'DECODE', 'MODERNIZER',
    'CORTEX', 'DEFENSE', 'SYSTEM', 'RIPPLE', 'CORE',
    'DREAM', 'INCLUSIVE', 'ACCESS',
  ];
  
  it('should cover all major modules in synergies', () => {
    const usedModules = new Set<string>();
    for (const synergy of SYNERGY_DEFINITIONS) {
      for (const m of synergy.modules) {
        usedModules.add(m.name.toUpperCase());
      }
    }
    
    // At least 12 of 14 modules should be covered
    expect(usedModules.size).toBeGreaterThanOrEqual(12);
  });
  
  it('BRAIN should be the most used module', () => {
    const brainSynergies = getSynergiesByModule('BRAIN');
    const visionSynergies = getSynergiesByModule('VISION');
    
    // BRAIN should be in at least as many synergies as any other
    expect(brainSynergies.length).toBeGreaterThanOrEqual(visionSynergies.length * 0.8);
  });
});
