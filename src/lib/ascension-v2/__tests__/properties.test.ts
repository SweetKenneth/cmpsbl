/**
 * Ascension V2 — Property-Based Tests
 *
 * These tests declare INVARIANTS the pipeline must always hold, and let
 * fast-check generate thousands of random inputs trying to break them.
 * They replace the hand-crafted-corpus treadmill: instead of sampling 50
 * files and grading verdicts, we cover the input space and assert contracts.
 *
 * Scope: SHIPPING languages only (per mem://constraints/architecture/shipping-languages-only).
 *
 * © CMPSBL® — All rights reserved.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { computeFingerprint, computeMultiFileFingerprint } from '../fingerprint-gate';
import { deduplicateCapabilities } from '../dedup';
import type { DiscoveredCapability } from '../orchestrator';

// ──────────────────────────────────────────────────────────────────────────
// Shipping-language arbitrary
// ──────────────────────────────────────────────────────────────────────────
const SHIPPING_LANGS = [
  'typescript', 'javascript', 'python', 'rust', 'go',
  'java', 'kotlin', 'csharp', 'swift',
] as const;
const langArb = fc.constantFrom(...SHIPPING_LANGS);

// Reasonable source-code arbitrary: printable ASCII + newlines, bounded size.
const sourceArb = fc.string({ minLength: 1, maxLength: 4096 });

// Capability arbitrary
const capabilityArb: fc.Arbitrary<DiscoveredCapability> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 60 }),
  cjpiScore: fc.integer({ min: 0, max: 100 }),
  primitives: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 8 }),
  description: fc.string({ maxLength: 200 }),
  tier: fc.constantFrom('S', 'A', 'B', 'C') as fc.Arbitrary<'S' | 'A' | 'B' | 'C'>,
}) as unknown as fc.Arbitrary<DiscoveredCapability>;

// ══════════════════════════════════════════════════════════════════════════
// Fingerprint Gate — invariants
// ══════════════════════════════════════════════════════════════════════════

describe('fingerprint-gate properties', () => {
  it('determinism: same input → same hash (always)', () => {
    fc.assert(
      fc.property(sourceArb, langArb, (src, lang) => {
        const a = computeFingerprint(src, lang);
        const b = computeFingerprint(src, lang);
        return a.hash === b.hash && a.functionCount === b.functionCount;
      }),
      { numRuns: 500 },
    );
  });

  it('cosmetic-stability: extra whitespace must not change the hash', () => {
    fc.assert(
      fc.property(sourceArb, langArb, (src, lang) => {
        const reformatted = src.replace(/ /g, '   ').replace(/\n/g, '\n\n');
        const a = computeFingerprint(src, lang);
        const b = computeFingerprint(reformatted, lang);
        return a.hash === b.hash;
      }),
      { numRuns: 200 },
    );
  });

  it('multi-file fingerprint is order-independent (sort guarantee)', () => {
    const fileArb = fc.record({
      name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[\w.-]+$/.test(s)),
      content: sourceArb,
    });
    fc.assert(
      fc.property(fc.array(fileArb, { minLength: 1, maxLength: 8 }), langArb, (files, lang) => {
        // Dedupe by name to satisfy the function's "unique names" assumption.
        const seen = new Set<string>();
        const unique = files.filter(f => (seen.has(f.name) ? false : (seen.add(f.name), true)));
        const shuffled = [...unique].reverse();
        const a = computeMultiFileFingerprint(unique, lang);
        const b = computeMultiFileFingerprint(shuffled, lang);
        return a.hash === b.hash;
      }),
      { numRuns: 200 },
    );
  });

  it('hash format is always 8 lowercase hex chars', () => {
    fc.assert(
      fc.property(sourceArb, langArb, (src, lang) => {
        const fp = computeFingerprint(src, lang);
        return /^[0-9a-f]{8}$/.test(fp.hash);
      }),
      { numRuns: 200 },
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Deduplication — invariants
// ══════════════════════════════════════════════════════════════════════════

describe('deduplicateCapabilities properties', () => {
  it('idempotence: dedup(dedup(x)) === dedup(x)', () => {
    fc.assert(
      fc.property(fc.array(capabilityArb, { maxLength: 50 }), (caps) => {
        const once = deduplicateCapabilities(caps);
        const twice = deduplicateCapabilities([...once.capabilities]);
        return (
          once.capabilities.length === twice.capabilities.length &&
          once.capabilities.every((c, i) => c.id === twice.capabilities[i].id)
        );
      }),
      { numRuns: 300 },
    );
  });

  it('cap: result never exceeds 7 capabilities (MAX_CAPS)', () => {
    fc.assert(
      fc.property(fc.array(capabilityArb, { maxLength: 200 }), (caps) => {
        const r = deduplicateCapabilities(caps);
        return r.capabilities.length <= 7;
      }),
      { numRuns: 200 },
    );
  });

  it('score-ordering: results are sorted by cjpiScore descending', () => {
    fc.assert(
      fc.property(fc.array(capabilityArb, { minLength: 2, maxLength: 50 }), (caps) => {
        const r = deduplicateCapabilities(caps);
        for (let i = 1; i < r.capabilities.length; i++) {
          if (r.capabilities[i].cjpiScore > r.capabilities[i - 1].cjpiScore) return false;
        }
        return true;
      }),
      { numRuns: 200 },
    );
  });

  it('membership: every result was in the original input', () => {
    fc.assert(
      fc.property(fc.array(capabilityArb, { maxLength: 50 }), (caps) => {
        const ids = new Set(caps.map(c => c.id));
        const r = deduplicateCapabilities(caps);
        return r.capabilities.every(c => ids.has(c.id));
      }),
      { numRuns: 200 },
    );
  });

  it('empty input → empty output, never throws', () => {
    const r = deduplicateCapabilities([]);
    expect(r.capabilities.length).toBe(0);
    expect(r.rawCount).toBe(0);
    expect(r.groupCount).toBe(0);
  });
});
