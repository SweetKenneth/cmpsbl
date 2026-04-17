/**
 * CAAL-1.0 license — inline header + ZIP root file coverage across every
 * shipping language. Verifies the license text is present, the inline banner
 * appears in Layer 2, and Layer 1 stays byte-perfect alongside the new banner.
 */
import { describe, it, expect } from 'vitest';
import { generateRefurbishedCode } from '@/lib/factory/generate-refurbished-code';
import {
  generateCaalLicense,
  renderCaalInlineHeader,
  CAAL_VERSION,
  CAAL_SPDX_ID,
} from '@/lib/licensing/caal-license';
import { getShippingLanguages } from '@/lib/export/language-parity-tiers';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

const PRIMS: PrimitiveRecommendation[] = [
  { primitiveId: 'defense', name: 'DEFENSE', category: 'Layer', impactScore: 88, rationale: 't', chainPosition: 1, collisionScore: 88 },
  { primitiveId: 'brain',   name: 'BRAIN',   category: 'Organ', impactScore: 85, rationale: 't', chainPosition: 2, collisionScore: 85 },
];
const FP = 'CAAL_TEST_FP_001';

describe('CAAL-1.0 license document', () => {
  const text = generateCaalLicense({ fingerprint: FP, serial: 'SN-1' });

  it('declares version + SPDX id', () => {
    expect(text).toContain(`Version ${CAAL_VERSION}`);
    expect(text).toContain(CAAL_SPDX_ID);
  });

  it('grants redistribute, sell, sublicense', () => {
    expect(text).toMatch(/redistribute/i);
    expect(text).toMatch(/sell/i);
    expect(text).toMatch(/sublicense/i);
  });

  it('forbids modify, reverse engineer, decompile', () => {
    expect(text).toMatch(/may NOT[\s\S]*Modify/i);
    expect(text).toMatch(/Reverse engineer/i);
    expect(text).toMatch(/decompile/i);
  });

  it('mandates CMPSBL attribution', () => {
    expect(text).toMatch(/Powered by CMPSBL/i);
    expect(text).toMatch(/ATTRIBUTION REQUIREMENTS/i);
  });

  it('embeds the artifact fingerprint + serial', () => {
    expect(text).toContain(FP);
    expect(text).toContain('SN-1');
  });

  it('includes patent references and disclaimer', () => {
    expect(text).toContain('64/029,678');
    expect(text).toContain('64/031,637');
    expect(text).toMatch(/AS IS/);
    expect(text).toMatch(/LIMITATION OF LIABILITY/);
  });

  it('Layer 2 scope is explicit (Layer 1 not covered)', () => {
    // Text is line-wrapped, so allow whitespace between tokens.
    expect(text).toMatch(/does\s+NOT\s+apply\s+to\s+Layer\s+1/);
    expect(text).toMatch(/This\s+License\s+governs\s+Layer\s+2/);
  });
});

describe('CAAL-1.0 inline header rendering', () => {
  const lines = renderCaalInlineHeader((s) => '// ' + s, FP);
  const joined = lines.join('\n');

  it('mentions the SPDX id, version, and fingerprint', () => {
    expect(joined).toContain(CAAL_SPDX_ID);
    expect(joined).toContain('CAAL-' + CAAL_VERSION);
    expect(joined).toContain(FP);
  });

  it('summarizes grants and restrictions', () => {
    expect(joined).toMatch(/redistribute/);
    expect(joined).toMatch(/sell/);
    expect(joined).toMatch(/reverse engineer/);
    expect(joined).toMatch(/Powered by CMPSBL/);
  });
});

describe('CAAL-1.0 — end-to-end inline injection across shipping languages', () => {
  const SAMPLES: Record<string, { code: string; file: string }> = {
    typescript: { code: `export class Foo { run() { return 1; } }\n`, file: 'foo.ts' },
    javascript: { code: `export class Foo { run() { return 1; } }\n`, file: 'foo.js' },
    python:     { code: `class Foo:\n    def run(self):\n        return 1\n`, file: 'foo.py' },
    rust:       { code: `pub struct Foo;\nimpl Foo { pub fn run(&self) -> i32 { 1 } }\n`, file: 'foo.rs' },
    go:         { code: `package main\n\ntype Foo struct{}\nfunc (f *Foo) Run() int { return 1 }\n`, file: 'foo.go' },
  };

  for (const lang of getShippingLanguages()) {
    const sample = SAMPLES[lang.id];
    if (!sample) continue;
    describe(lang.label, () => {
      const out = generateRefurbishedCode(sample.code, PRIMS, FP, lang.label, sample.file);

      it('contains the CAAL inline banner', () => {
        expect(out).toContain('LAYER 2 LICENSE');
        expect(out).toContain(CAAL_SPDX_ID);
        expect(out).toMatch(/redistribute/);
        expect(out).toMatch(/Powered by CMPSBL/);
      });

      it('places the CAAL banner BEFORE the verbatim Layer 1 source', () => {
        const caalIdx = out.indexOf('LAYER 2 LICENSE');
        const sourceIdx = out.indexOf(sample.code.trimEnd());
        expect(caalIdx).toBeGreaterThan(0);
        expect(sourceIdx).toBeGreaterThan(caalIdx);
      });

      it('keeps Layer 1 byte-perfect', () => {
        expect(out).toContain(sample.code.trimEnd());
      });
    });
  }
});
