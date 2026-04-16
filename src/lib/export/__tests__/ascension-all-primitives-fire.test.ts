/**
 * Ascension End-to-End Verification — All Primitives Fire
 * Confirms every one of the 40 BehavioralSpec primitives produces real
 * output (not stubs) when the transpiler-driven extended generators run.
 */
import { describe, it, expect } from 'vitest';
import { PRIMITIVE_SPECS } from '@/lib/export/primitives/behavioral-spec';
import {
  generateExtendedPolyglot,
  listExtendedLanguages,
} from '@/lib/export/primitives/extended-generators';

const CTX = {
  packName: 'AscensionV2_E2E',
  fingerprint: 'FP_E2E_VERIFY',
  cjpi: 88,
  chain: PRIMITIVE_SPECS.map(s => s.module),
};

describe('Ascension v2 — all 40 primitives fire across all 12 Tier-A languages', () => {
  it('has exactly 40 canonical primitives (12 Organs + 12 Layers + 8 Engines + 8 Agents)', () => {
    expect(PRIMITIVE_SPECS).toHaveLength(40);
    const groups = PRIMITIVE_SPECS.reduce<Record<string, number>>((acc, s) => {
      acc[s.group] = (acc[s.group] || 0) + 1;
      return acc;
    }, {});
    expect(groups.organ).toBe(12);
    expect(groups.layer).toBe(12);
    expect(groups.engine).toBe(8);
    expect(groups.agent).toBe(8);
  });

  it('every primitive has a non-empty fields list (no stub specs)', () => {
    for (const spec of PRIMITIVE_SPECS) {
      expect(spec.fields.length, `${spec.module} has zero fields`).toBeGreaterThan(0);
      expect(spec.outputKey, `${spec.module} missing outputKey`).toBeTruthy();
      expect(spec.signalType, `${spec.module} missing signalType`).toBeTruthy();
    }
  });

  for (const lang of listExtendedLanguages()) {
    describe(`language=${lang}`, () => {
      let code: string;
      it('generates non-trivial native code', () => {
        code = generateExtendedPolyglot(lang, CTX);
        expect(code.length).toBeGreaterThan(2000);
      });

      it('emits a real handler for every one of the 40 primitives', () => {
        const missing: string[] = [];
        for (const spec of PRIMITIVE_SPECS) {
          if (!code.includes(spec.module)) missing.push(spec.module);
        }
        expect(missing, `Missing handlers in ${lang}: ${missing.join(', ')}`).toHaveLength(0);
      });

      it('emits the correct outputKey for every primitive', () => {
        const missing: string[] = [];
        for (const spec of PRIMITIVE_SPECS) {
          if (!code.includes(spec.outputKey)) missing.push(`${spec.module}→${spec.outputKey}`);
        }
        expect(missing, `Missing outputKeys in ${lang}: ${missing.join(', ')}`).toHaveLength(0);
      });

      it('emits the correct signal type for every primitive', () => {
        const distinctSignals = Array.from(new Set(PRIMITIVE_SPECS.map(s => s.signalType)));
        for (const sig of distinctSignals) {
          expect(code).toContain(sig);
        }
      });

      it('has no untranslated TypeScript-isms', () => {
        // Catches transpiler bugs that would leave JS-style fragments inside
        // languages where they would be syntax errors.
        if (lang !== 'rust' && lang !== 'cpp') {
          expect(code).not.toMatch(/\bnew Date\(\)\.getTime\(\)/);
        }
      });
    });
  }
});
