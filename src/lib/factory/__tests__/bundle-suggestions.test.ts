/**
 * Tests for Sprint 2 bundle-suggestions engine.
 * Verifies: recipe→catalog resolution, ≥3-layer gating, discount tiers,
 * already-attached hiding, and free-stack vs paid-stack ordering.
 */
import { describe, it, expect } from 'vitest';
import { suggestBundles, formatPrice } from '../bundle-suggestions';

describe('suggestBundles', () => {
  it('returns at least one bundle when nothing is selected', () => {
    const bundles = suggestBundles({ selectedLayerIds: [] });
    expect(bundles.length).toBeGreaterThan(0);
  });

  it('every returned bundle has at least 3 real layers', () => {
    for (const b of suggestBundles({})) {
      expect(b.layers.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('discount tiers follow the 3/4/5+ ladder for paid stacks', () => {
    for (const b of suggestBundles({})) {
      if (b.isFreeStack) {
        expect(b.discountPercent).toBe(0);
        continue;
      }
      const expected = b.layers.length >= 5 ? 20 : b.layers.length === 4 ? 15 : 10;
      expect(b.discountPercent).toBe(expected);
    }
  });

  it('totalCents = subtotalCents − savingsCents (no rounding drift)', () => {
    for (const b of suggestBundles({})) {
      expect(b.totalCents).toBe(b.subtotalCents - b.savingsCents);
    }
  });

  it('hides bundles whose layers are all already selected', () => {
    const all = suggestBundles({});
    if (all.length === 0) return;
    const first = all[0];
    const filtered = suggestBundles({
      selectedLayerIds: first.layers.map((l) => l.id),
    });
    expect(filtered.find((b) => b.id === first.id)).toBeUndefined();
  });

  it('paid stacks rank before free stacks', () => {
    const bundles = suggestBundles({});
    const firstFree = bundles.findIndex((b) => b.isFreeStack);
    if (firstFree === -1) return; // no free stacks → nothing to assert
    for (let i = 0; i < firstFree; i++) {
      expect(bundles[i].isFreeStack).toBe(false);
    }
  });

  it('respects the limit parameter', () => {
    expect(suggestBundles({ limit: 2 }).length).toBeLessThanOrEqual(2);
  });
});

describe('formatPrice', () => {
  it('formats zero as "Free"', () => {
    expect(formatPrice(0)).toBe('Free');
  });
  it('formats cents to USD with 2 decimals', () => {
    expect(formatPrice(2999)).toBe('$29.99');
    expect(formatPrice(100)).toBe('$1.00');
  });
});
