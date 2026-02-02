/**
 * Synergy System Tests
 * v7.3.0 — Cross-module pipeline validation
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
  it('should have 76 defined synergies', () => {
    expect(SYNERGY_DEFINITIONS.length).toBe(76);
  });

  it('should list all synergies', () => {
    const synergies = listSynergies();
    expect(synergies.length).toBe(76);
  });

  it('should filter synergies by category', () => {
    const intelligence = listSynergies('intelligence');
    expect(intelligence.length).toBeGreaterThanOrEqual(12);
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
    expect(brainSynergies.length).toBeGreaterThan(10);
    expect(brainSynergies.every(s => 
      s.modules.some(m => m.name.toUpperCase() === 'BRAIN')
    )).toBe(true);
  });

  it('should get category counts', () => {
    const categories = getSynergyCategories();
    expect(categories.length).toBeGreaterThan(0);
    
    const totalCount = categories.reduce((sum, c) => sum + c.count, 0);
    expect(totalCount).toBe(76);
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
  
  it('all new v7.3 synergies should be properly defined', () => {
    const v73SynergyIds = [
      'recursive-self-improvement',
      'temporal-reasoning',
      'counterfactual-analysis',
      'semantic-bridge',
      'goal-decomposition',
      'autonomous-repair',
      'proactive-scaling',
      'cross-modal-synthesis',
      'consensus-reasoning',
      'attack-surface-mapping',
      'privilege-escalation-detection',
      'data-exfiltration-guard',
      'token-budget-optimizer',
      'response-quality-calibration',
      'cache-coherence',
      'blast-radius-containment',
      'state-checkpoint-recovery',
      'dependency-health-cascade',
      'cross-team-coordination',
      'pipeline-orchestration',
      'universal-design-synthesis',
      'adaptive-personalization',
    ];
    
    for (const id of v73SynergyIds) {
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
    { category: 'intelligence', minCount: 12 },
    { category: 'optimization', minCount: 10 },
    { category: 'resilience', minCount: 8 },
    { category: 'security', minCount: 8 },
    { category: 'accessibility', minCount: 5 },
    { category: 'automation', minCount: 5 },
    { category: 'orchestration', minCount: 6 },
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
    // Original 8
    'smart-recall',
    'adaptive-routing',
    'graceful-degradation',
    'learning-acceleration',
    'cascade-prevention',
    'anomaly-correlation',
    'cognitive-fusion',
    'intent-amplification',
    // v7.0 executors
    'external-api-intelligence',
    'entitlement-aware-routing',
    'autonomous-evolution',
    'end-to-end-reasoning',
    'bounded-autonomy-guard',
    // v7.1 executors
    'contextual-preload',
    'semantic-deduplication',
    'behavioral-fingerprinting',
    'zero-trust-validation',
    'workflow-synthesis',
    'multi-agent-coordination',
    'cognitive-load-optimization',
    'hypothesis-testing',
    'knowledge-distillation',
    // v7.2 executors
    'capacity-forecasting',
    'cost-optimization-engine',
    'causal-inference',
    'emergent-pattern-detection',
    'threat-prediction',
    'compliance-automation',
    'predictive-healing',
    'chaos-resilience',
    'sla-guardian',
    'resource-contention-resolver',
    // v7.3 executors
    'recursive-self-improvement',
    'temporal-reasoning',
    'counterfactual-analysis',
    'semantic-bridge',
    'goal-decomposition',
    'autonomous-repair',
    'proactive-scaling',
    'cross-modal-synthesis',
    'consensus-reasoning',
    'attack-surface-mapping',
    'privilege-escalation-detection',
    'data-exfiltration-guard',
    'token-budget-optimizer',
    'response-quality-calibration',
    'cache-coherence',
    'blast-radius-containment',
    'state-checkpoint-recovery',
    'dependency-health-cascade',
    'cross-team-coordination',
    'pipeline-orchestration',
    'universal-design-synthesis',
    'adaptive-personalization',
  ];
  
  it('should have 54 custom executors registered', () => {
    let count = 0;
    for (const id of executorIds) {
      const executor = getSynergyExecutor(id);
      if (executor) count++;
    }
    expect(count).toBe(54);
  });
  
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
    'DREAM', 'INCLUSIVE', 'ACCESS', 'INTEGRATION',
  ];
  
  it('should cover all 14 major modules in synergies', () => {
    const usedModules = new Set<string>();
    for (const synergy of SYNERGY_DEFINITIONS) {
      for (const m of synergy.modules) {
        usedModules.add(m.name.toUpperCase());
      }
    }
    
    // All 14 modules should be covered
    expect(usedModules.size).toBe(14);
  });
  
  it('BRAIN should be heavily used across synergies', () => {
    const brainSynergies = getSynergiesByModule('BRAIN');
    expect(brainSynergies.length).toBeGreaterThanOrEqual(30);
  });
  
  it('CORTEX should be used in orchestration synergies', () => {
    const cortexSynergies = getSynergiesByModule('CORTEX');
    expect(cortexSynergies.length).toBeGreaterThanOrEqual(15);
  });
  
  it('VISION should be used in monitoring synergies', () => {
    const visionSynergies = getSynergiesByModule('VISION');
    expect(visionSynergies.length).toBeGreaterThanOrEqual(20);
  });
  
  it('INTEGRATION module should be used in external synergies', () => {
    const integrationSynergies = getSynergiesByModule('INTEGRATION');
    expect(integrationSynergies.length).toBeGreaterThanOrEqual(5);
  });
  
  it('ACCESS module should be used in entitlement synergies', () => {
    const accessSynergies = getSynergiesByModule('ACCESS');
    expect(accessSynergies.length).toBeGreaterThanOrEqual(6);
  });
  
  it('DEFENSE module should be used in security synergies', () => {
    const defenseSynergies = getSynergiesByModule('DEFENSE');
    expect(defenseSynergies.length).toBeGreaterThanOrEqual(15);
  });
});
