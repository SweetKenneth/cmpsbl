import { describe, it, expect } from 'vitest';
import {
  generateExtendedPolyglot,
  hasExtendedGenerator,
  listExtendedLanguages,
  type ExtendedGeneratorContext,
} from '@/lib/export/primitives/extended-generators';
import { PRIMITIVE_SPECS } from '@/lib/export/primitives/behavioral-spec';

const CTX: ExtendedGeneratorContext = {
  packName: 'TEST_PACK',
  fingerprint: 'TEST_FP_XYZ',
  cjpi: 87,
  chain: ['DEFENSE', 'BRAIN', 'MEMORY', 'CORTEX', 'ORACLE'],
  generatedAt: '2026-04-16T00:00:00Z',
};

const TIER_A = ['rust', 'go', 'java', 'csharp', 'swift', 'kotlin', 'ruby', 'lua', 'dart', 'scala', 'c', 'cpp'];

describe('Extended polyglot generators (Path B — additive)', () => {
  it('exposes all 12 Tier-A languages', () => {
    const langs = listExtendedLanguages();
    for (const l of TIER_A) expect(langs).toContain(l);
  });

  for (const lang of TIER_A) {
    describe(lang, () => {
      let code: string;

      it('has generator + adapter wired', () => {
        expect(hasExtendedGenerator(lang)).toBe(true);
        code = generateExtendedPolyglot(lang, CTX);
        expect(code).toBeTruthy();
        expect(code.length).toBeGreaterThan(500);
      });

      it('embeds CMPSBL header + fingerprint', () => {
        expect(code).toContain('CMPSBL');
        expect(code).toContain(CTX.fingerprint);
        expect(code).toContain(CTX.packName);
        expect(code).toContain('64/029,678');
      });

      it('emits a real handler for every primitive', () => {
        // Each primitive's module name should appear at least once in the
        // transpiled body (typically as a switch/case label).
        for (const spec of PRIMITIVE_SPECS) {
          expect(code).toContain(spec.module);
        }
      });

      it('contains no stub markers', () => {
        // Word-boundary checks so identifiers like `toDouble`/`toString` don't false-positive.
        expect(code).not.toMatch(/\bTODO\b/i);
        expect(code).not.toMatch(/\bnot implemented\b/i);
        expect(code).not.toMatch(/throw\s+new\s+Error\(['"]stub/i);
        expect(code).not.toMatch(/\bunimplemented!?\(\)/);
      });
    });
  }
});
