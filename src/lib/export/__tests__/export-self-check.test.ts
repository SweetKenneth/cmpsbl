/**
 * Phase 6 — Export Self-Check contract tests.
 *
 * Verifies that:
 *   • clean canonical / polyglot artifacts pass
 *   • drift in any required token causes structured failure
 *   • the central gate (generateUnifiedCapabilityFile) actually invokes
 *     the self-check and refuses to ship on drift
 *
 * Together with canonical-parity-snapshot.test.ts, this locks the
 * end-to-end shipping contract: nothing leaves the substrate without
 * carrying the V1 envelope shape for its language.
 */
import { describe, it, expect } from 'vitest';
import {
  checkExportArtifact,
  assertExportArtifact,
} from '@/lib/export/export-self-check';
import {
  generateUnifiedTypeScript,
  generateUnifiedPython,
  generateUnifiedPhp,
  generateUnifiedCapabilityFile,
} from '@/lib/export/unified-capability-file';
import { generatePolyglotFile, SUPPORTED_LANGUAGES } from '@/lib/export/polyglot-templates';
import { isLanguageSupported } from '@/lib/export/v2-supported-languages';

const CAP = [{
  id: 'self-check-probe',
  name: 'self-check-probe',
  description: 'self-check probe',
  chain: ['DEFENSE', 'GOVERNANCE', 'COMPASS'],
  cjpiScore: 50,
  tier: 'mint' as const,
  fingerprint: '0123456789abcdef0123456789abcdef',
  moatSignature: 'self-check-moat',
  capabilityType: 'utility',
}];
const PACK = 'self-check';

describe('checkExportArtifact — happy path', () => {
  for (const mode of ['observe', 'soft', 'enforce'] as const) {
    it(`passes a clean TS artifact (mode=${mode})`, () => {
      const src = generateUnifiedTypeScript(CAP, PACK, undefined, undefined, mode);
      const r = checkExportArtifact('typescript', src, mode);
      expect(r.ok, JSON.stringify(r.issues)).toBe(true);
    });

    it(`passes a clean Python artifact (mode=${mode})`, () => {
      const src = generateUnifiedPython(CAP, PACK, undefined, undefined, mode);
      const r = checkExportArtifact('python', src, mode);
      expect(r.ok, JSON.stringify(r.issues)).toBe(true);
    });

    it(`passes a clean PHP artifact (mode=${mode})`, () => {
      const src = generateUnifiedPhp(CAP, PACK, undefined, mode);
      const r = checkExportArtifact('php', src, mode);
      expect(r.ok, JSON.stringify(r.issues)).toBe(true);
    });
  }

  // Spot-check a handful of polyglot bridges across all three modes.
  const POLY_SAMPLES = ['rust', 'go', 'java', 'csharp', 'verilog'];
  for (const lang of POLY_SAMPLES) {
    for (const mode of ['observe', 'soft', 'enforce'] as const) {
      it(`passes a clean polyglot[${lang}] artifact (mode=${mode})`, () => {
        const src = generatePolyglotFile(lang, CAP, PACK, undefined, mode);
        const r = checkExportArtifact(lang, src, mode);
        expect(r.ok, JSON.stringify(r.issues)).toBe(true);
      });
    }
  }
});

describe('checkExportArtifact — drift detection', () => {
  it('fails when canonical token _cmpsbl is missing', () => {
    const r = checkExportArtifact('typescript', '// empty file with COMPILED_CMPSBL_MODE "observe" CMPSBL_MODE original_executed', 'observe');
    expect(r.ok).toBe(false);
    expect(r.issues.some(i => i.token === '_cmpsbl')).toBe(true);
  });

  it('fails when the chosen mode literal is absent', () => {
    // Canonical token set is present, but the mode literal "enforce" is not.
    const fake = '_cmpsbl COMPILED_CMPSBL_MODE CMPSBL_MODE original_executed "observe"';
    const r = checkExportArtifact('typescript', fake, 'enforce');
    expect(r.ok).toBe(false);
    expect(r.issues.some(i => i.token === 'enforce')).toBe(true);
  });

  it('fails on empty source', () => {
    const r = checkExportArtifact('python', '', 'observe');
    expect(r.ok).toBe(false);
    expect(r.issues[0].token).toBe('<source>');
  });

  it('fails for a polyglot artifact missing the sealed banner', () => {
    const fake = 'COMPILED_CMPSBL_MODE _cmpsbl envelope original_executed "observe"';
    const r = checkExportArtifact('rust', fake, 'observe');
    expect(r.ok).toBe(false);
    expect(r.issues.some(i => i.token === 'Sealed wrapper')).toBe(true);
  });

  it('assertExportArtifact throws a structured error on drift', () => {
    expect(() => assertExportArtifact('typescript', '// nothing useful', 'observe'))
      .toThrowError(/CMPSBL:ExportSelfCheck:typescript/);
  });
});

describe('generateUnifiedCapabilityFile — gate is wired', () => {
  for (const mode of ['observe', 'soft', 'enforce'] as const) {
    it(`emits TS artifact through the gate (mode=${mode})`, () => {
      // The gate runs assertExportArtifact internally; if the contract
      // ever drifts, this call throws and the test fails loudly.
      const out = generateUnifiedCapabilityFile(CAP, PACK, 'typescript', undefined, undefined, mode);
      expect(out.length).toBeGreaterThan(0);
    });

    it(`emits Python artifact through the gate (mode=${mode})`, () => {
      const out = generateUnifiedCapabilityFile(CAP, PACK, 'python', undefined, undefined, mode);
      expect(out.length).toBeGreaterThan(0);
    });

    it(`emits PHP artifact through the gate (mode=${mode})`, () => {
      const out = generateUnifiedCapabilityFile(CAP, PACK, 'php', undefined, undefined, mode);
      expect(out.length).toBeGreaterThan(0);
    });
  }

  // Ensure every shipping polyglot language that is also V2-registered
  // passes the gate. (SUPPORTED_LANGUAGES is the polyglot template
  // registry; the V2 shipping registry is a subset.)
  for (const lang of SUPPORTED_LANGUAGES.filter((l) => isLanguageSupported(l))) {
    it(`emits polyglot[${lang}] artifact through the gate (mode=observe)`, () => {
      const out = generateUnifiedCapabilityFile(CAP, PACK, lang, undefined, undefined, 'observe');
      expect(out.length).toBeGreaterThan(0);
    });
  }
});
