/**
 * Canonical Parity Snapshot — Phase 1 of the Polyglot Roadmap
 *
 * Locks the TypeScript handler output shape against the Python handler shape
 * defined inline in generateUnifiedPython(). This is the V1 contract every
 * polyglot language template must emulate.
 *
 * If a TS handler diverges from the agreed shape, this test fails — the fix
 * is either to update the handler or, if the Python side moved too, update
 * the snapshot intentionally and bump CANONICAL_HANDLER_OUTPUT_V1.
 */
import { describe, it, expect } from 'vitest';
import { cmpsbl_execute_chain, generateUnifiedPython } from '@/lib/export/unified-capability-file';

const FIXTURE_CLEAN = { user: 'alice', count: 3, items: ['a', 'b'] };
const FIXTURE_THREAT = {
  user: 'bob',
  payload: '<script>alert(1)</script>',
  comment: "1; DROP TABLE users--",
  callback: 'eval(secret)',
  path: '../../etc/passwd',
};

describe('Canonical Parity Snapshot V1', () => {
  it('DEFENSE produces the V1 multi-pattern shape on a clean payload', () => {
    const r = cmpsbl_execute_chain(['DEFENSE'], FIXTURE_CLEAN);
    const d = (r.context._data as Record<string, unknown>)._defense as Record<string, unknown>;
    expect(d).toMatchObject({
      scanned: true,
      threats: 0,
      threats_found: 0,
      threat_breakdown: {},
      verdict: 'allow',
      validated: true,
    });
  });

  it('DEFENSE detects xss + sqli + rce + path_traversal in one payload', () => {
    const r = cmpsbl_execute_chain(['DEFENSE'], FIXTURE_THREAT);
    const d = (r.context._data as Record<string, unknown>)._defense as Record<string, unknown>;
    const breakdown = d.threat_breakdown as Record<string, number>;
    expect(d.verdict).toBe('block');
    expect(Number(d.threats_found)).toBeGreaterThan(0);
    expect(breakdown.xss).toBeGreaterThan(0);
    expect(breakdown.sqli).toBeGreaterThan(0);
    expect(breakdown.rce).toBeGreaterThan(0);
    expect(breakdown.path_traversal).toBeGreaterThan(0);
  });

  it('GOVERNANCE reads DEFENSE.verdict downstream (cross-handler contract)', () => {
    const r = cmpsbl_execute_chain(['DEFENSE', 'GOVERNANCE'], FIXTURE_THREAT);
    const g = (r.context._data as Record<string, unknown>)._governance as Record<string, unknown>;
    expect(Number(g.violations)).toBeGreaterThanOrEqual(1);
    expect(['review', 'failed']).toContain(g.compliance);
  });

  it('COMPASS reads DEFENSE.threats downstream (cross-handler contract)', () => {
    const r = cmpsbl_execute_chain(['DEFENSE', 'COMPASS'], FIXTURE_THREAT);
    const c = (r.context._data as Record<string, unknown>)._compass as Record<string, unknown>;
    expect(c.riskLevel).toBe('high');
  });

  it('Python template carries the same DEFENSE shape (string-presence guard)', () => {
    const py = generateUnifiedPython(
      [{
        name: 'parity-probe',
        description: 'parity probe',
        chain: ['DEFENSE', 'GOVERNANCE', 'COMPASS'],
        cjpiScore: 50,
        tier: 'mint',
      } as Parameters<typeof generateUnifiedPython>[0][number]],
      'parity-test',
    );
    // These tokens MUST exist in the Python template to keep parity with TS:
    expect(py).toContain('threats_found');
    expect(py).toContain('threat_breakdown');
    expect(py).toContain('"block"');
    expect(py).toContain('"allow"');
    expect(py).toContain('handle_defense');
  });
});
