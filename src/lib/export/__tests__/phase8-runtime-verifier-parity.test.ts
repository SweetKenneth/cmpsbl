/**
 * Phase 8 — Polyglot Runtime Verifier Parity
 *
 * The TS verifier (envelope-verifier.ts) is the source of truth. The
 * Python and PHP generators MUST emit a `cmpsbl_verify_envelope()` (and
 * `cmpsbl_verify_envelope_json()`) function with the identical contract
 * surface so non-JS runtimes can self-attest the V1 envelope at load
 * time, in CI, or inside their own auditors.
 *
 * This suite locks the surface:
 *   • function names present
 *   • all four V1 issue codes referenced (MISSING_KEY, WRONG_TYPE,
 *     INVALID_ENUM, INCONSISTENT_STATE) — EMPTY_CHAIN is checked too
 *   • the cross-field "enforce + passthrough" guard is wired
 *   • mode + strategy enum literals match the TS contract
 *   • optional defense.verdict surface is captured
 *
 * If anything here drifts, the polyglot runtimes are no longer at
 * parity with the TS verifier and downstream tooling will diverge.
 */
import { describe, it, expect } from 'vitest';
import {
  generateUnifiedPython,
  generateUnifiedPhp,
} from '@/lib/export/unified-capability-file';

const CAP = [{
  id: 'phase8-probe',
  name: 'phase8-probe',
  description: 'phase8 probe',
  chain: ['DEFENSE', 'GOVERNANCE', 'COMPASS'],
  cjpiScore: 50,
  tier: 'mint' as const,
  fingerprint: '0123456789abcdef0123456789abcdef',
  moatSignature: 'phase8-moat',
  capabilityType: 'utility',
}];
const PACK = 'phase8';

const REQUIRED_TOKENS = [
  'cmpsbl_verify_envelope',
  'cmpsbl_verify_envelope_json',
  'MISSING_KEY',
  'WRONG_TYPE',
  'INVALID_ENUM',
  'INCONSISTENT_STATE',
  'EMPTY_CHAIN',
  'observe',
  'soft',
  'enforce',
  'native',
  'passthrough',
  'failed',
  'block',
  'warn',
  'allow',
];

describe('Phase 8 — Python verifier parity', () => {
  const src = generateUnifiedPython(CAP, PACK, undefined, undefined, 'observe');

  for (const tok of REQUIRED_TOKENS) {
    it(`Python source contains "${tok}"`, () => {
      expect(src.includes(tok)).toBe(true);
    });
  }

  it('Python verifier guards enforce + passthrough', () => {
    expect(src).toMatch(/summary\["mode"\]\s*==\s*"enforce"/);
    expect(src).toMatch(/summary\["strategy"\]\s*==\s*"passthrough"/);
  });

  it('Python verifier returns the V1 contract shape {ok, issues, summary}', () => {
    expect(src).toMatch(/"ok":\s*len\(issues\)\s*==\s*0/);
    expect(src).toMatch(/"issues":\s*issues/);
    expect(src).toMatch(/"summary":\s*summary/);
  });
});

describe('Phase 8 — PHP verifier parity', () => {
  const src = generateUnifiedPhp(CAP, PACK, undefined, 'observe');

  for (const tok of REQUIRED_TOKENS) {
    it(`PHP source contains "${tok}"`, () => {
      expect(src.includes(tok)).toBe(true);
    });
  }

  it('PHP verifier guards enforce + passthrough', () => {
    expect(src).toMatch(/\$summary\['mode'\]\s*===\s*'enforce'/);
    expect(src).toMatch(/\$summary\['strategy'\]\s*===\s*'passthrough'/);
  });

  it('PHP verifier returns the V1 contract shape [ok, issues, summary]', () => {
    expect(src).toMatch(/'ok'\s*=>\s*count\(\$issues\)\s*===\s*0/);
    expect(src).toMatch(/'issues'\s*=>\s*\$issues/);
    expect(src).toMatch(/'summary'\s*=>\s*\$summary/);
  });
});
