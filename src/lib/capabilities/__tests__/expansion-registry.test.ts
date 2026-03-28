import { describe, it, expect } from 'vitest';
import {
  EXPANSION_CROWN_JEWELS,
  getActiveJewels,
  getGuardedJewels,
  getDeferredJewels,
  getJewelsByPrimitive,
  getJewelsByTier,
  getExpansionRegistryStats,
  getExpansionArchitectureIds,
  getExpansionExperienceIds,
  getExpansionTierMap,
} from '../expansion-crown-jewel-registry';
import {
  ARCHITECTURE_CROWN_JEWEL_IDS,
  EXPERIENCE_CROWN_JEWEL_IDS,
  CROWN_JEWEL_IDS,
  isCrownJewel,
  isArchitectureCrownJewel,
  isExperienceCrownJewel,
  getExperienceJewelTier,
  EXPERIENCE_TIER_MAP,
} from '../crown-jewel-registry';
import { COMPOUND_CROWN_JEWEL_IDS } from '../compound-ip-guard';
import { checkCrownJewelAccess } from '../tiered-unlock';

describe('Expansion Crown Jewel Discovery Registry', () => {
  // ── Registry Integrity ──
  it('discovers jewels from all 11 expansion primitives', () => {
    const stats = getExpansionRegistryStats();
    expect(stats.primitiveCoverage).toBe(11);
    const primitives = new Set(EXPANSION_CROWN_JEWELS.map(j => j.primitive));
    expect(primitives).toContain('ORACLE');
    expect(primitives).toContain('SOVEREIGN');
    expect(primitives).toContain('SHADOW');
    expect(primitives).toContain('FORGE');
    expect(primitives).toContain('HARVEST');
    expect(primitives).toContain('TREATY');
    expect(primitives).toContain('COMPASS');
    expect(primitives).toContain('PHANTOM');
    expect(primitives).toContain('ECHO');
    expect(primitives).toContain('LINGUA');
    expect(primitives).toContain('REFLEX');
  });

  it('has computed CJPI totals for all jewels', () => {
    for (const j of EXPANSION_CROWN_JEWELS) {
      expect(j.cjpiTotal).toBeGreaterThan(0);
      expect(j.cjpiTotal).toBeLessThanOrEqual(100);
    }
  });

  it('has no duplicate IDs', () => {
    const ids = EXPANSION_CROWN_JEWELS.map(j => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // ── Classification ──
  it('classifies architecture vs experience correctly', () => {
    const stats = getExpansionRegistryStats();
    expect(stats.byClassification.architecture).toBeGreaterThan(0);
    expect(stats.byClassification.experience).toBeGreaterThan(0);
    // Architecture should be minority (guarded IP)
    expect(stats.byClassification.architecture).toBeLessThan(stats.byClassification.experience);
  });

  it('architecture jewels are always enterprise tier', () => {
    const archJewels = EXPANSION_CROWN_JEWELS.filter(j => j.classification === 'architecture');
    for (const j of archJewels) {
      expect(j.tier).toBe('enterprise');
    }
  });

  // ── Activation Decisions ──
  it('has active, guarded, and no deferred jewels', () => {
    expect(getActiveJewels().length).toBeGreaterThan(0);
    expect(getGuardedJewels().length).toBeGreaterThan(0);
    expect(getDeferredJewels().length).toBe(0); // All are production-ready
  });

  it('guarded jewels are all architecture class', () => {
    for (const j of getGuardedJewels()) {
      expect(j.classification).toBe('architecture');
    }
  });

  it('active jewels are all experience class', () => {
    for (const j of getActiveJewels()) {
      expect(j.classification).toBe('experience');
    }
  });

  // ── Tier Distribution ──
  it('distributes across tiers', () => {
    const stats = getExpansionRegistryStats();
    expect(stats.byTier['architect']).toBeGreaterThan(0);
    expect(stats.byTier['creator']).toBeGreaterThan(0);
    expect(stats.byTier['enterprise']).toBeGreaterThan(0);
  });

  // ── Black-Box Enforcement ──
  it('all crown jewels with CJPI >= 75 are sealed execution', () => {
    const crownJewels = EXPANSION_CROWN_JEWELS.filter(j => j.isCrownJewel);
    for (const j of crownJewels) {
      expect(j.sealedExecution).toBe(true);
    }
  });

  // ── Main Registry Integration ──
  it('expansion architecture jewels injected into main ARCHITECTURE_CROWN_JEWEL_IDS', () => {
    const archIds = getExpansionArchitectureIds();
    for (const id of archIds) {
      expect(ARCHITECTURE_CROWN_JEWEL_IDS.has(id)).toBe(true);
    }
  });

  it('expansion experience jewels injected into main EXPERIENCE_CROWN_JEWEL_IDS', () => {
    const expIds = getExpansionExperienceIds();
    for (const id of expIds) {
      expect(EXPERIENCE_CROWN_JEWEL_IDS.has(id)).toBe(true);
    }
  });

  it('compound jewels injected into main ARCHITECTURE_CROWN_JEWEL_IDS', () => {
    for (const id of COMPOUND_CROWN_JEWEL_IDS) {
      expect(ARCHITECTURE_CROWN_JEWEL_IDS.has(id)).toBe(true);
    }
  });

  it('expansion jewels appear in CROWN_JEWEL_IDS combined set', () => {
    for (const j of EXPANSION_CROWN_JEWELS) {
      expect(CROWN_JEWEL_IDS.has(j.id)).toBe(true);
    }
  });

  it('expansion experience jewels have tier mappings in EXPERIENCE_TIER_MAP', () => {
    const tierMap = getExpansionTierMap();
    for (const [id] of Object.entries(tierMap)) {
      expect(EXPERIENCE_TIER_MAP[id]).toBeDefined();
    }
  });

  // ── Tiered Unlock Integration ──
  it('expansion architecture jewels are locked at all tiers', () => {
    const archIds = getExpansionArchitectureIds();
    for (const id of archIds) {
      const result = checkCrownJewelAccess(id, 'enterprise');
      expect(result.allowed).toBe(false);
    }
  });

  it('expansion experience jewels respect tier gating', () => {
    // Builder can't access architect-tier expansion jewels
    const architectJewels = EXPANSION_CROWN_JEWELS.filter(
      j => j.classification === 'experience' && j.tier === 'architect'
    );
    for (const j of architectJewels) {
      const result = checkCrownJewelAccess(j.id, 'builder');
      expect(result.allowed).toBe(false);
    }
  });

  it('architect users can access architect-tier expansion jewels', () => {
    const architectJewels = EXPANSION_CROWN_JEWELS.filter(
      j => j.classification === 'experience' && j.tier === 'architect'
    );
    for (const j of architectJewels) {
      const result = checkCrownJewelAccess(j.id, 'architect');
      expect(result.allowed).toBe(true);
    }
  });

  // ── Specific Primitive Checks ──
  it('ORACLE has Bayesian, Monte Carlo, and Causal Graph jewels', () => {
    const oracle = getJewelsByPrimitive('ORACLE');
    expect(oracle.length).toBeGreaterThanOrEqual(4);
    expect(oracle.some(j => j.id.includes('bayesian'))).toBe(true);
    expect(oracle.some(j => j.id.includes('monte-carlo'))).toBe(true);
    expect(oracle.some(j => j.id.includes('causal-graph'))).toBe(true);
  });

  it('PHANTOM governance-gated ops is architecture class', () => {
    const phantom = getJewelsByPrimitive('PHANTOM');
    const govOps = phantom.find(j => j.id.includes('governance-gated'));
    expect(govOps).toBeDefined();
    expect(govOps!.classification).toBe('architecture');
    expect(govOps!.activation).toBe('guarded');
  });

  it('SHADOW divergence engine is guarded architecture', () => {
    const shadow = getJewelsByPrimitive('SHADOW');
    const divergence = shadow.find(j => j.id.includes('divergence'));
    expect(divergence).toBeDefined();
    expect(divergence!.classification).toBe('architecture');
    expect(divergence!.activation).toBe('guarded');
  });

  it('ECHO cross-node correlation is guarded architecture', () => {
    const echo = getJewelsByPrimitive('ECHO');
    const corr = echo.find(j => j.id.includes('cross-node'));
    expect(corr).toBeDefined();
    expect(corr!.classification).toBe('architecture');
  });

  // ── Stats ──
  it('reports meaningful stats', () => {
    const stats = getExpansionRegistryStats();
    expect(stats.totalJewels).toBeGreaterThan(30);
    expect(stats.crownJewels).toBeGreaterThan(20);
    expect(stats.avgCJPI).toBeGreaterThan(70);
    expect(stats.blackBoxed).toBeGreaterThan(25);
  });
});
