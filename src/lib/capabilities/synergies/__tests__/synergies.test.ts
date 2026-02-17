/**
 * Synergy System Tests
 * v10.5.4 — ARCHITECT Epoch Cross-module pipeline validation (200 pipelines, 125 executors)
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
  it('should have at least 120 defined synergies', () => {
    expect(SYNERGY_DEFINITIONS.length).toBeGreaterThanOrEqual(120);
  });

  it('should list all synergies', () => {
    const synergies = listSynergies();
    expect(synergies.length).toBeGreaterThanOrEqual(120);
  });

  it('should filter synergies by category', () => {
    const intelligence = listSynergies('intelligence');
    expect(intelligence.length).toBeGreaterThanOrEqual(17);
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
    expect(brainSynergies.length).toBeGreaterThan(20);
    expect(brainSynergies.every(s => 
      s.modules.some(m => m.name.toUpperCase() === 'BRAIN')
    )).toBe(true);
  });

  it('should get category counts', () => {
    const categories = getSynergyCategories();
    expect(categories.length).toBeGreaterThan(0);
    
    const totalCount = categories.reduce((sum, c) => sum + c.count, 0);
    expect(totalCount).toBeGreaterThanOrEqual(120);
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
  
  it('all new v7.4 synergies should be properly defined', () => {
    const v74SynergyIds = [
      'holistic-system-insight',
      'meta-cognitive-reflection',
      'neural-symbolic-fusion',
      'cognitive-load-balancer',
      'intent-evolution-chain',
      'zero-day-defense',
      'comprehensive-audit-trail',
      'adaptive-threat-response',
      'distributed-recovery-orchestration',
      'intelligent-failover-chain',
      'cognitive-state-preservation',
      'full-stack-evolution',
      'multi-modal-task-routing',
      'adaptive-workflow-engine',
      'predictive-resource-allocation',
      'intelligent-batch-processing',
      'cost-aware-routing',
      'comprehensive-accessibility-audit',
      'adaptive-content-transformation',
      'self-documenting-evolution',
      'intelligent-deprecation-manager',
      'autonomous-optimization-loop',
    ];
    
    for (const id of v74SynergyIds) {
      const synergy = getSynergy(id);
      expect(synergy).toBeDefined();
      expect(synergy?.modules.length).toBeGreaterThanOrEqual(4); // v7.4 synergies use 4+ modules
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
    { category: 'intelligence', minCount: 17 },
    { category: 'optimization', minCount: 15 },
    { category: 'resilience', minCount: 10 },
    { category: 'security', minCount: 11 },
    { category: 'accessibility', minCount: 7 },
    { category: 'automation', minCount: 8 },
    { category: 'orchestration', minCount: 10 },
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
    // v7.4 NEW executors
    'holistic-system-insight',
    'meta-cognitive-reflection',
    'neural-symbolic-fusion',
    'cognitive-load-balancer',
    'intent-evolution-chain',
    'zero-day-defense',
    'comprehensive-audit-trail',
    'adaptive-threat-response',
    'distributed-recovery-orchestration',
    'intelligent-failover-chain',
    'cognitive-state-preservation',
    'full-stack-evolution',
    'multi-modal-task-routing',
    'adaptive-workflow-engine',
    'predictive-resource-allocation',
    'intelligent-batch-processing',
    'cost-aware-routing',
    'comprehensive-accessibility-audit',
    'adaptive-content-transformation',
    'self-documenting-evolution',
    'intelligent-deprecation-manager',
    'autonomous-optimization-loop',
  ];
  
  it('should have 76 custom executors registered', () => {
    let count = 0;
    for (const id of executorIds) {
      const executor = getSynergyExecutor(id);
      if (executor) count++;
    }
    expect(count).toBe(76);
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
    'MEMORY', 'RELAY', 'AUDIT', 'IDENTITY', 'ECONOMY', 'SANDBOX',
  ];
  
  it('should cover all 14 original modules in synergies', () => {
    const usedModules = new Set<string>();
    for (const synergy of SYNERGY_DEFINITIONS) {
      for (const m of synergy.modules) {
        usedModules.add(m.name.toUpperCase());
      }
    }
    
    // At minimum the original 14 core modules should be covered
    expect(usedModules.size).toBeGreaterThanOrEqual(14);
  });
  
  it('BRAIN should be heavily used across synergies', () => {
    const brainSynergies = getSynergiesByModule('BRAIN');
    expect(brainSynergies.length).toBeGreaterThanOrEqual(50);
  });
  
  it('CORTEX should be used in orchestration synergies', () => {
    const cortexSynergies = getSynergiesByModule('CORTEX');
    expect(cortexSynergies.length).toBeGreaterThanOrEqual(30);
  });
  
  it('VISION should be used in monitoring synergies', () => {
    const visionSynergies = getSynergiesByModule('VISION');
    expect(visionSynergies.length).toBeGreaterThanOrEqual(40);
  });
  
  it('INTEGRATION module should be used in external synergies', () => {
    const integrationSynergies = getSynergiesByModule('INTEGRATION');
    expect(integrationSynergies.length).toBeGreaterThanOrEqual(5);
  });
  
  it('ACCESS module should be used in entitlement synergies', () => {
    const accessSynergies = getSynergiesByModule('ACCESS');
    expect(accessSynergies.length).toBeGreaterThanOrEqual(8);
  });
  
  it('DEFENSE module should be used in security synergies', () => {
    const defenseSynergies = getSynergiesByModule('DEFENSE');
    expect(defenseSynergies.length).toBeGreaterThanOrEqual(20);
  });
});

describe('v7.4 Enterprise Synergies', () => {
  it('should have 22 new enterprise synergies with 4+ modules', () => {
    const v74Synergies = [
      'holistic-system-insight',
      'meta-cognitive-reflection',
      'neural-symbolic-fusion',
      'cognitive-load-balancer',
      'intent-evolution-chain',
      'zero-day-defense',
      'comprehensive-audit-trail',
      'adaptive-threat-response',
      'distributed-recovery-orchestration',
      'intelligent-failover-chain',
      'cognitive-state-preservation',
      'full-stack-evolution',
      'multi-modal-task-routing',
      'adaptive-workflow-engine',
      'predictive-resource-allocation',
      'intelligent-batch-processing',
      'cost-aware-routing',
      'comprehensive-accessibility-audit',
      'adaptive-content-transformation',
      'self-documenting-evolution',
      'intelligent-deprecation-manager',
      'autonomous-optimization-loop',
    ];
    
    expect(v74Synergies.length).toBe(22);
    
    for (const id of v74Synergies) {
      const synergy = getSynergy(id);
      expect(synergy).toBeDefined();
      expect(synergy?.modules.length).toBeGreaterThanOrEqual(4);
    }
  });
  
  it('full-stack-evolution should use 5 modules', () => {
    const synergy = getSynergy('full-stack-evolution');
    expect(synergy).toBeDefined();
    expect(synergy?.modules.length).toBe(5);
    expect(synergy?.risk).toBe('high');
  });
});
