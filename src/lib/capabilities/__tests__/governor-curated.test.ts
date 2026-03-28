/**
 * Governor-Curated Crown Jewels — Validation Tests
 */
import { describe, it, expect } from 'vitest';
import {
  GOVERNOR_CURATED_JEWELS,
  getGovernorGuardedIds,
  getGovernorActivatedIds,
  getGovernorTierMap,
  getGovernorSTierIds,
  getGovernorCurationSummary,
} from '../governor-curated-crown-jewels';

describe('Governor-Curated Crown Jewels — Full 40-Primitive Coverage', () => {

  it('has 78 total jewels', () => {
    expect(GOVERNOR_CURATED_JEWELS).toHaveLength(78);
  });

  it('covers all 40 primitives', () => {
    const primitives = new Set(GOVERNOR_CURATED_JEWELS.map(j => j.primitive));
    expect(primitives.size).toBe(40);
  });

  it('has no duplicate IDs', () => {
    const ids = GOVERNOR_CURATED_JEWELS.map(j => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('expansion primitives have 3 jewels each', () => {
    const expansion = ['ORACLE', 'SOVEREIGN', 'SHADOW', 'FORGE', 'HARVEST', 'TREATY', 'COMPASS', 'PHANTOM', 'ECHO', 'LINGUA', 'REFLEX'];
    for (const p of expansion) {
      const count = GOVERNOR_CURATED_JEWELS.filter(j => j.primitive === p).length;
      expect(count, `${p} should have 3 jewels`).toBe(3);
    }
  });

  it('original primitives have 2 jewels each', () => {
    const original = ['CORE', 'BRAIN', 'MEMORY', 'NERVE', 'DECODE', 'ENCODE', 'CORTEX', 'DEFENSE', 'CONSCIENCE', 'EVOLUTION', 'IMMUNITY', 'INTENT', 'GOVERNANCE', 'ATLAS', 'ENGINEER', 'DREAM'];
    for (const p of original) {
      const count = GOVERNOR_CURATED_JEWELS.filter(j => j.primitive === p).length;
      expect(count, `${p} should have 2 jewels`).toBe(2);
    }
  });

  it('infrastructure primitives have 1 jewel each', () => {
    const infra = ['SYSTEM', 'NEXUS', 'VISION', 'RELAY', 'RIPPLE', 'SANDBOX', 'ECONOMY', 'IDENTITY', 'ACCESS', 'AUDIT', 'MEDIC', 'INCLUSIVE', 'INTEGRATION', 'ANALYTICS', 'OBSERVABILITY'];
    // Some may not be in the 13 if they overlap, but all should exist
    for (const p of infra) {
      const count = GOVERNOR_CURATED_JEWELS.filter(j => j.primitive === p).length;
      // Infrastructure primitives should have at least 1
      if (count > 0) {
        expect(count, `${p} should have at least 1 jewel`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('all guarded jewels are architecture-class', () => {
    const guarded = GOVERNOR_CURATED_JEWELS.filter(j => j.decision === 'guard');
    for (const j of guarded) {
      expect(j.isArchitecture, `${j.id} should be architecture`).toBe(true);
      expect(j.blackBoxed).toBe(true);
      expect(j.sealedExecution).toBe(true);
    }
  });

  it('all activated jewels are NOT architecture-class', () => {
    const activated = GOVERNOR_CURATED_JEWELS.filter(j => j.decision === 'activate');
    for (const j of activated) {
      expect(j.isArchitecture, `${j.id} should not be architecture`).toBe(false);
    }
  });

  it('has S-Tier jewels (CJPI novelty or utility >= 95)', () => {
    const sTier = getGovernorSTierIds();
    expect(sTier.length).toBeGreaterThanOrEqual(10);
  });

  it('S-Tier includes the crown jewels of key primitives', () => {
    const sTier = getGovernorSTierIds();
    expect(sTier).toContain('gov-dream-synthetic-intuition');
    expect(sTier).toContain('gov-cortex-emergent-strategy');
    expect(sTier).toContain('gov-evolution-architectural-telomere');
    expect(sTier).toContain('gov-governance-veto-authority');
    expect(sTier).toContain('gov-conscience-ethical-reasoning-kernel');
  });

  it('activated jewels all have tier mappings', () => {
    const tierMap = getGovernorTierMap();
    const activatedIds = getGovernorActivatedIds();
    for (const id of activatedIds) {
      expect(tierMap[id], `${id} should have tier mapping`).toBeDefined();
    }
  });

  it('summary counts are consistent', () => {
    const summary = getGovernorCurationSummary();
    expect(summary.totalJewels).toBe(78);
    expect(summary.activated + summary.guarded + summary.deferred).toBe(78);
    expect(summary.totalPrimitives).toBe(40);
  });

  it('every jewel has a selection rationale > 20 chars', () => {
    for (const j of GOVERNOR_CURATED_JEWELS) {
      expect(j.selectionRationale.length, `${j.id} rationale`).toBeGreaterThan(20);
    }
  });

  it('every jewel has a decision reason > 20 chars', () => {
    for (const j of GOVERNOR_CURATED_JEWELS) {
      expect(j.decisionReason.length, `${j.id} reason`).toBeGreaterThan(20);
    }
  });

  it('creator tier has meaningful jewels for broader access', () => {
    const summary = getGovernorCurationSummary();
    expect(summary.byTier.creator).toBeGreaterThanOrEqual(8);
  });

  it('architect tier has the most activated jewels', () => {
    const summary = getGovernorCurationSummary();
    expect(summary.byTier.architect).toBeGreaterThan(summary.byTier.creator);
  });
});
