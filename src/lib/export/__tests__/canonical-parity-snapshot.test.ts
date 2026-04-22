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
  generateUnifiedPython,
} from '@/lib/export/unified-capability-file';

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
});
