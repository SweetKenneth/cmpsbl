/**
 * Canonical Parity Snapshot — Phase 1 of the Polyglot Roadmap
 *
 * The TS and Python "real handlers" live as source-code strings inside the
 * generators (generateUnifiedTypeScript / generateUnifiedPython). They are
 * not loadable as in-process modules — they are emitted into the user's
 * wrapped artifact and run there.
 *
 * This test therefore enforces the V1 parity contract via string-presence:
 * every primitive shape we promise to emit must appear identically in both
 * generators. If a handler shape drifts in TS but not Python (or vice
 * versa), this test fails and forces the matching update.
 *
 * Bumping CANONICAL_HANDLER_OUTPUT_V1 (in canonical-primitives.ts) is the
 * documented escape hatch when the contract is intentionally evolved.
 */
import { describe, it, expect } from 'vitest';
import {
  generateUnifiedTypeScript,
  generateUnifiedJavaScript,
  generateUnifiedPython,
  generateUnifiedPhp,
} from '@/lib/export/unified-capability-file';
import { generatePolyglotFile, SUPPORTED_LANGUAGES } from '@/lib/export/polyglot-templates';

const CAP = [{
  id: 'parity-probe',
  name: 'parity-probe',
  description: 'parity probe',
  chain: ['DEFENSE', 'GOVERNANCE', 'COMPASS'],
  cjpiScore: 50,
  tier: 'mint' as const,
  fingerprint: '0123456789abcdef0123456789abcdef',
  moatSignature: 'parity-moat',
  capabilityType: 'utility',
}];

const PACK = 'parity-test';

// ── V1 Contract Tokens ─────────────────────────────────────────────
// Every token here MUST appear in BOTH the TS and Python generators.
// Drift = test failure = forced re-alignment.
const V1_DEFENSE_TOKENS = [
  'threat_breakdown',
  'threats_found',
  'block',
  'allow',
  'xss',
  'sqli',
  'rce',
  'path_traversal',
];

const V1_GOVERNANCE_TOKENS = [
  '_governance',
  'violations',
  'compliance',
];

const V1_COMPASS_TOKENS = [
  '_compass',
  'riskLevel', // TS naming
];

// Phase 4 — Per-finding policy matcher contract.
// Each canonical generator must emit POLICY_MATCHER, decisions[], and the
// 'warn' verdict tier (added in Phase 4 alongside block/allow).
const V1_MATCHER_TOKENS = [
  'POLICY_MATCHER',
  'decisions',
  'warn',
  'reason',
  'action',
  'kind',
  'count',
];

describe('Canonical Parity Snapshot V1 — generator string-presence', () => {
  const ts = generateUnifiedTypeScript(CAP, PACK);
  const py = generateUnifiedPython(CAP, PACK);

  it('TS generator carries the V1 DEFENSE shape', () => {
    for (const tok of V1_DEFENSE_TOKENS) {
      expect(ts, `TS missing token: ${tok}`).toContain(tok);
    }
  });

  it('Python generator carries the V1 DEFENSE shape', () => {
    for (const tok of V1_DEFENSE_TOKENS) {
      expect(py, `Python missing token: ${tok}`).toContain(tok);
    }
  });

  it('TS generator carries the V1 GOVERNANCE shape', () => {
    for (const tok of V1_GOVERNANCE_TOKENS) {
      expect(ts, `TS missing token: ${tok}`).toContain(tok);
    }
  });

  it('Python generator carries the V1 GOVERNANCE shape', () => {
    for (const tok of V1_GOVERNANCE_TOKENS) {
      expect(py, `Python missing token: ${tok}`).toContain(tok);
    }
  });

  it('TS generator carries the V1 COMPASS shape', () => {
    for (const tok of V1_COMPASS_TOKENS) {
      expect(ts, `TS missing token: ${tok}`).toContain(tok);
    }
  });

  it('Python generator emits handle_compass with risk classification', () => {
    expect(py).toContain('handle_compass');
    expect(py).toContain('risk');
  });

  it('Both generators emit a handle_defense / DEFENSE handler', () => {
    expect(ts).toContain('DEFENSE');
    expect(py).toContain('handle_defense');
  });

  it('JS generator carries the V1 DEFENSE shape (delegates to TS)', () => {
    const js = generateUnifiedJavaScript(CAP, PACK);
    for (const tok of V1_DEFENSE_TOKENS) {
      expect(js, `JS missing token: ${tok}`).toContain(tok);
    }
  });

  it('PHP generator carries the V1 DEFENSE shape', () => {
    const php = generateUnifiedPhp(CAP, PACK);
    for (const tok of V1_DEFENSE_TOKENS) {
      expect(php, `PHP missing token: ${tok}`).toContain(tok);
    }
    expect(php).toContain('handleDefense');
    expect(php).toContain('threat_breakdown');
    expect(php).toContain("'verdict'");
  });
});

// ── Phase 2 — Mode Wiring Audit (4 canonical generators) ─────────────────
// Every canonical generator must expose: COMPILED_CMPSBL_MODE, env override,
// envelope `mode` field, and an enforce-throw on passthrough.
describe('Canonical Mode Wiring Audit V1', () => {
  for (const mode of ['observe', 'soft', 'enforce'] as const) {
    it(`TS generator wires mode=${mode}`, () => {
      const out = generateUnifiedTypeScript(CAP, PACK, undefined, undefined, mode);
      expect(out).toContain('COMPILED_CMPSBL_MODE');
      expect(out).toContain('CMPSBL_MODE');
      expect(out).toContain(`'${mode}'`);
      expect(out).toContain("'enforce'");
      expect(out).toContain("mode: CMPSBL_MODE");
    });

    it(`JS generator wires mode=${mode} (delegates to TS)`, () => {
      const out = generateUnifiedJavaScript(CAP, PACK, undefined, undefined, mode);
      expect(out).toContain('COMPILED_CMPSBL_MODE');
      expect(out).toContain(`'${mode}'`);
    });

    it(`Python generator wires mode=${mode}`, () => {
      const out = generateUnifiedPython(CAP, PACK, undefined, undefined, mode);
      expect(out).toContain('COMPILED_CMPSBL_MODE');
      expect(out).toContain('_resolve_cmpsbl_mode');
      expect(out).toContain(`"${mode}"`);
      expect(out).toContain('"mode": CMPSBL_MODE');
      expect(out).toContain('CMPSBL_MODE == "enforce"');
    });

    it(`PHP generator wires mode=${mode}`, () => {
      const out = generateUnifiedPhp(CAP, PACK, undefined, mode);
      expect(out).toContain('COMPILED_CMPSBL_MODE');
      expect(out).toContain('_resolve_cmpsbl_mode');
      expect(out).toContain(`'${mode}'`);
      expect(out).toContain("'mode' =>");
      expect(out).toContain("=== 'enforce'");
    });
  }
});

// ── Phase 3 — Attachment Honesty Envelope across all 23 polyglot templates ──
// Every polyglot artifact must declare the sealed wrapper banner + the
// _cmpsbl envelope contract in its native syntax. Mode must be reflected.
describe('Polyglot Attachment Honesty Envelope V1', () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const mode of ['observe', 'soft', 'enforce'] as const) {
      it(`polyglot[${lang}] mode=${mode} emits sealed envelope banner`, () => {
        const out = generatePolyglotFile(lang, CAP, PACK, undefined, mode);
        expect(out, `${lang} produced empty output`).not.toBe('');
        expect(out).toContain('Sealed wrapper');
        expect(out).toContain('Sealed Module (proprietary)');
        expect(out).toContain('COMPILED_CMPSBL_MODE');
        expect(out).toContain(`"${mode}"`);
        expect(out).toContain('_cmpsbl envelope');
        expect(out).toContain('original_executed');
      });
    }
  }
});
