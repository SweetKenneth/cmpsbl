import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkCrownJewelAccess,
  getJewelCountsByTier,
  getAccessibleJewelIds,
  getNextTierUnlocks,
  normalizeTier,
} from '../tiered-unlock';
import {
  isCompoundCrownJewel,
  extractCompoundPrimitives,
  getCompoundJewelsForPrimitive,
  getCompoundTopologyMap,
  getCompoundGuardStats,
  COMPOUND_CROWN_JEWEL_IDS,
} from '../compound-ip-guard';
import {
  calculateCJPI,
  classifyTier,
  scoreExpansionCapability,
  batchScoreExpansionCapabilities,
  getPendingDiscoveries,
  getDiscoveriesByPrimitive,
  getSTierDiscoveries,
  getDiscoveryStats,
  approveDiscovery,
  rejectDiscovery,
  clearDiscoveries,
} from '../expansion-discovery';

// ═══════════════════════════════════════════════════════════════════════════════
// TIERED UNLOCK TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Tiered Crown Jewel Unlock', () => {
  it('blocks architecture jewels at all tiers', () => {
    const result = checkCrownJewelAccess('recursive-self-optimization-core', 'enterprise');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('architecture_locked');
  });

  it('blocks compound jewels at all tiers', () => {
    const result = checkCrownJewelAccess('compound-cortex-brain-recursive-planning', 'enterprise');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('compound_locked');
  });

  it('grants builder-tier jewels to builder users', () => {
    const result = checkCrownJewelAccess('recursive-goal-optimizer', 'builder');
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('granted');
  });

  it('blocks architect-tier jewels for builder users', () => {
    const result = checkCrownJewelAccess('knowledge_graph_topology', 'builder');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('tier_insufficient');
    expect(result.upgradeLabel).toContain('Architect');
  });

  it('grants architect-tier jewels to architect users', () => {
    const result = checkCrownJewelAccess('knowledge_graph_topology', 'architect');
    expect(result.allowed).toBe(true);
  });

  it('grants all experience jewels to enterprise users', () => {
    const result = checkCrownJewelAccess('cj4-defense-threat-prediction', 'enterprise');
    expect(result.allowed).toBe(true);
  });

  it('normalizes legacy tier names', () => {
    expect(normalizeTier('free')).toBe('builder');
    expect(normalizeTier('pro')).toBe('architect');
  });

  it('returns not_a_jewel for non-jewel IDs', () => {
    const result = checkCrownJewelAccess('some-random-capability', 'builder');
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('not_a_jewel');
  });

  it('counts jewels by tier correctly', () => {
    const counts = getJewelCountsByTier();
    expect(counts.architecture).toBeGreaterThan(0);
    expect(counts.compound).toBeGreaterThan(0);
    expect(counts.total).toBeGreaterThan(0);
  });

  it('getAccessibleJewelIds returns more for higher tiers', () => {
    const builderIds = getAccessibleJewelIds('builder');
    const architectIds = getAccessibleJewelIds('architect');
    expect(architectIds.length).toBeGreaterThanOrEqual(builderIds.length);
  });

  it('getNextTierUnlocks returns null for enterprise', () => {
    expect(getNextTierUnlocks('enterprise')).toBeNull();
  });

  it('getNextTierUnlocks returns unlocks for builder', () => {
    const result = getNextTierUnlocks('builder');
    expect(result).not.toBeNull();
    expect(result!.nextTier).toBe('studio');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOUND IP GUARD TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Compound IP Guard', () => {
  it('detects compound jewels by explicit ID', () => {
    expect(isCompoundCrownJewel('compound-cortex-brain-recursive-planning')).toBe(true);
    expect(isCompoundCrownJewel('compound-defense-evolution-adversarial-hardening')).toBe(true);
  });

  it('detects compound jewels by pattern', () => {
    expect(isCompoundCrownJewel('cross-primitive-topology-mapping')).toBe(true);
    expect(isCompoundCrownJewel('inter-node-coordination-mesh')).toBe(true);
  });

  it('rejects non-compound IDs', () => {
    expect(isCompoundCrownJewel('cj-brain-associative-recall')).toBe(false);
    expect(isCompoundCrownJewel('recursive-goal-optimizer')).toBe(false);
  });

  it('extracts primitive pairs correctly', () => {
    const parts = extractCompoundPrimitives('compound-cortex-brain-recursive-planning');
    expect(parts).toEqual(['CORTEX', 'BRAIN']);
  });

  it('returns empty for non-compound IDs', () => {
    expect(extractCompoundPrimitives('cj-brain-associative-recall')).toEqual([]);
  });

  it('finds compound jewels for a specific primitive', () => {
    const cortexJewels = getCompoundJewelsForPrimitive('CORTEX');
    expect(cortexJewels.length).toBeGreaterThan(0);
    expect(cortexJewels.every(id => id.includes('cortex'))).toBe(true);
  });

  it('builds topology map with correct pairs', () => {
    const topology = getCompoundTopologyMap();
    expect(topology.size).toBeGreaterThan(0);
    expect(topology.has('CORTEX×BRAIN')).toBe(true);
    expect(topology.has('DEFENSE×EVOLUTION')).toBe(true);
  });

  it('reports correct stats', () => {
    const stats = getCompoundGuardStats();
    expect(stats.totalCompoundJewels).toBe(COMPOUND_CROWN_JEWEL_IDS.size);
    expect(stats.uniquePrimitivePairs).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXPANSION DISCOVERY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Expansion Auto-Discovery Gate', () => {
  beforeEach(() => {
    clearDiscoveries();
  });

  it('calculates CJPI with correct weighting', () => {
    const score = calculateCJPI(100, 100, 100, 100);
    expect(score.total).toBe(100);

    const zero = calculateCJPI(0, 0, 0, 0);
    expect(zero.total).toBe(0);
  });

  it('clamps scores to 0-100', () => {
    const score = calculateCJPI(-10, 150, 50, 50);
    expect(score.novelty).toBe(0);
    expect(score.utility).toBe(100);
  });

  it('classifies tiers by CJPI thresholds', () => {
    expect(classifyTier(96)).toBe('enterprise');
    expect(classifyTier(85)).toBe('architect');
    expect(classifyTier(65)).toBe('creator');
    expect(classifyTier(45)).toBe('studio');
    expect(classifyTier(30)).toBe('builder');
  });

  it('scores and classifies an expansion capability', () => {
    const result = scoreExpansionCapability(
      'treaty-dispute-resolution',
      'Dispute Resolution Engine',
      'TREATY',
      'Evidence-weighted multi-party dispute arbitration',
      ['TREATY'],
      { novelty: 80, utility: 85, complexity: 70, composability: 60 }
    );

    expect(result.isCrownJewel).toBe(true); // CJPI ~77
    expect(result.classification).toBe('experience');
    expect(result.status).toBe('pending');
    expect(result.primitive).toBe('TREATY');
  });

  it('classifies multi-primitive capabilities as architecture', () => {
    const result = scoreExpansionCapability(
      'treaty-cortex-brain-negotiation',
      'Multi-Primitive Negotiation',
      'TREATY',
      'Cross-primitive negotiation orchestration',
      ['TREATY', 'CORTEX', 'BRAIN'],
      { novelty: 90, utility: 85, complexity: 88, composability: 85 }
    );

    expect(result.classification).toBe('architecture');
  });

  it('batch scores multiple capabilities', () => {
    const results = batchScoreExpansionCapabilities([
      {
        id: 'harvest-etl-pipeline',
        name: 'ETL Pipeline',
        primitive: 'HARVEST',
        description: 'Data extraction pipeline',
        modules: ['HARVEST'],
        scores: { novelty: 60, utility: 90, complexity: 50, composability: 40 },
      },
      {
        id: 'forge-artifact-compiler',
        name: 'Artifact Compiler',
        primitive: 'FORGE',
        description: 'Sandboxed compilation engine',
        modules: ['FORGE'],
        scores: { novelty: 75, utility: 80, complexity: 85, composability: 70 },
      },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].primitive).toBe('HARVEST');
    expect(results[1].primitive).toBe('FORGE');
  });

  it('tracks pending discoveries', () => {
    scoreExpansionCapability(
      'shadow-canary-validator', 'Canary Validator', 'SHADOW',
      'Canary promotion validation', ['SHADOW'],
      { novelty: 70, utility: 75, complexity: 65, composability: 55 }
    );

    expect(getPendingDiscoveries()).toHaveLength(1);
  });

  it('filters discoveries by primitive', () => {
    scoreExpansionCapability('treaty-a', 'A', 'TREATY', '', ['TREATY'], { novelty: 50, utility: 50, complexity: 50, composability: 50 });
    scoreExpansionCapability('harvest-b', 'B', 'HARVEST', '', ['HARVEST'], { novelty: 50, utility: 50, complexity: 50, composability: 50 });

    expect(getDiscoveriesByPrimitive('TREATY')).toHaveLength(1);
    expect(getDiscoveriesByPrimitive('HARVEST')).toHaveLength(1);
  });

  it('identifies S-Tier discoveries', () => {
    scoreExpansionCapability(
      'oracle-causal-engine', 'Causal Engine', 'ORACLE',
      'Causal graph traversal', ['ORACLE'],
      { novelty: 98, utility: 96, complexity: 94, composability: 92 }
    );

    expect(getSTierDiscoveries()).toHaveLength(1);
    expect(getSTierDiscoveries()[0].isSTier).toBe(true);
  });

  it('approves and rejects discoveries', () => {
    scoreExpansionCapability('test-cap', 'Test', 'TREATY', '', ['TREATY'], { novelty: 50, utility: 50, complexity: 50, composability: 50 });

    expect(approveDiscovery('test-cap')).toBe(true);
    expect(getPendingDiscoveries()).toHaveLength(0);
    expect(approveDiscovery('test-cap')).toBe(false); // already approved
  });

  it('reports correct discovery stats', () => {
    scoreExpansionCapability('a', 'A', 'TREATY', '', ['TREATY'], { novelty: 50, utility: 50, complexity: 50, composability: 50 });
    scoreExpansionCapability('b', 'B', 'FORGE', '', ['FORGE'], { novelty: 95, utility: 97, complexity: 96, composability: 94 });
    approveDiscovery('a');

    const stats = getDiscoveryStats();
    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(1);
    expect(stats.approved).toBe(1);
    expect(stats.byPrimitive['TREATY']).toBe(1);
    expect(stats.byPrimitive['FORGE']).toBe(1);
  });
});
