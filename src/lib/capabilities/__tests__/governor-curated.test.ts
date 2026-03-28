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
  type GovernorCuratedJewel,
} from '../governor-curated-crown-jewels';

describe('Governor-Curated Crown Jewels', () => {
  it('has exactly 27 jewels (one per primitive)', () => {
    expect(GOVERNOR_CURATED_JEWELS).toHaveLength(27);
  });

  it('covers 27 unique primitives', () => {
    const primitives = new Set(GOVERNOR_CURATED_JEWELS.map(j => j.primitive));
    // DREAM replaces OBSERVER per taxonomy rules
    expect(primitives.size).toBe(27);
  });

  it('has no duplicate IDs', () => {
    const ids = GOVERNOR_CURATED_JEWELS.map(j => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all CJPI totals are between 80-95', () => {
    for (const j of GOVERNOR_CURATED_JEWELS) {
      expect(j.cjpi.total).toBeGreaterThanOrEqual(80);
      expect(j.cjpi.total).toBeLessThanOrEqual(95);
    }
  });

  it('all guarded jewels are architecture-class', () => {
    const guarded = GOVERNOR_CURATED_JEWELS.filter(j => j.decision === 'guard');
    for (const j of guarded) {
      expect(j.isArchitecture).toBe(true);
      expect(j.blackBoxed).toBe(true);
      expect(j.sealedExecution).toBe(true);
    }
  });

  it('all activated jewels are NOT architecture-class', () => {
    const activated = GOVERNOR_CURATED_JEWELS.filter(j => j.decision === 'activate');
    for (const j of activated) {
      expect(j.isArchitecture).toBe(false);
    }
  });

  it('has the correct activate/guard split', () => {
    const summary = getGovernorCurationSummary();
    // 10 guarded (CORE, BRAIN, NERVE, CORTEX, CONSCIENCE, EVOLUTION, SHADOW, IMMUNITY, GOVERNANCE, DREAM)
    // 17 activated (rest)
    expect(summary.guarded).toBe(10);
    expect(summary.activated).toBe(17);
    expect(summary.deferred).toBe(0);
  });

  it('activated jewels have tier mappings', () => {
    const tierMap = getGovernorTierMap();
    const activatedIds = getGovernorActivatedIds();
    for (const id of activatedIds) {
      expect(tierMap[id]).toBeDefined();
    }
  });

  it('guarded IDs include structural primitives', () => {
    const guarded = getGovernorGuardedIds();
    expect(guarded).toContain('gov-core-circuit-breaker-fabric');
    expect(guarded).toContain('gov-brain-knowledge-fusion-reactor');
    expect(guarded).toContain('gov-cortex-emergent-strategy');
    expect(guarded).toContain('gov-governance-veto-authority');
    expect(guarded).toContain('gov-evolution-architectural-telomere');
  });

  it('activated IDs include user-facing primitives', () => {
    const activated = getGovernorActivatedIds();
    expect(activated).toContain('gov-memory-semantic-versioning');
    expect(activated).toContain('gov-decode-intent-disambiguation');
    expect(activated).toContain('gov-defense-zero-day-synthesis');
    expect(activated).toContain('gov-harvest-multi-source-ingestion');
    expect(activated).toContain('gov-oracle-bayesian-inference');
  });

  it('has exactly 1 S-Tier jewel (Synthetic Intuition)', () => {
    const sTier = getGovernorSTierIds();
    expect(sTier).toHaveLength(1);
    expect(sTier[0]).toBe('gov-dream-synthetic-intuition');
  });

  it('summary avgCjpi is in reasonable range', () => {
    const summary = getGovernorCurationSummary();
    expect(summary.avgCjpi).toBeGreaterThanOrEqual(85);
    expect(summary.avgCjpi).toBeLessThanOrEqual(92);
  });

  it('creator tier has at least 2 jewels', () => {
    const summary = getGovernorCurationSummary();
    expect(summary.byTier.creator).toBeGreaterThanOrEqual(2);
  });

  it('architect tier has the most activated jewels', () => {
    const summary = getGovernorCurationSummary();
    expect(summary.byTier.architect).toBeGreaterThan(summary.byTier.creator);
  });

  it('every jewel has a selection rationale', () => {
    for (const j of GOVERNOR_CURATED_JEWELS) {
      expect(j.selectionRationale.length).toBeGreaterThan(20);
    }
  });

  it('every jewel has a decision reason', () => {
    for (const j of GOVERNOR_CURATED_JEWELS) {
      expect(j.decisionReason.length).toBeGreaterThan(20);
    }
  });
});
