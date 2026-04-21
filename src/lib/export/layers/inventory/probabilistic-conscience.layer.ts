/**
 * CMPSBL® Inventory Layer — Probabilistic Conscience
 * Caps: AUDIT · BRAIN · COMPLY · ETHICS · embargo · sieve · sovereign decision
 *
 * Ethics arbitration that scores every action against probabilistic
 * guardrails — embargoes risky outputs, sieves edge cases, and produces
 * sovereign decisions before anything ships.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Probabilistic Conscience (proprietary).                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblConsGuard { name: string; weight: number; pattern: RegExp }

const _CMPSBL_CONS_GUARDS: CmpsblConsGuard[] = [
  { name: 'Ethical Guardrails Layer',   weight: 1.0, pattern: /\\b(suicide|self[- ]harm|kill\\s+myself)\\b/i },
  { name: 'violence',    weight: 0.85, pattern: /\\b(bomb|attack|murder|massacre|slaughter)\\b/i },
  { name: 'illegal',     weight: 0.7,  pattern: /\\b(child\\s+porn|cp\\b|drug\\s+deal|hitman)\\b/i },
  { name: 'discrimination', weight: 0.6, pattern: /\\b(racial\\s+slur|ethnic\\s+cleansing)\\b/i },
  { name: 'manipulation', weight: 0.5, pattern: /\\b(deceive|manipulate|gaslight)\\s+(user|customer)\\b/i },
  { name: 'privacy-leak', weight: 0.55, pattern: /\\b(dox|leak\\s+address|home\\s+address\\s+of)\\b/i },
];

export function cmpsbl_cons_score(payload: unknown): { riskScore: number; triggered: string[] } {
  const s = JSON.stringify(payload ?? '');
  const triggered: string[] = [];
  let risk = 0;
  for (const g of _CMPSBL_CONS_GUARDS) {
    if (g.pattern.test(s)) {
      triggered.push(g.name);
      risk = 1 - (1 - risk) * (1 - g.weight);
    }
  }
  return { riskScore: Math.min(1, risk), triggered };
}

export function cmpsbl_cons_arbitrate(score: { riskScore: number; triggered: string[] }):
  { decision: 'allow' | 'sieve' | 'embargo'; reason: string } {
  if (score.riskScore >= 0.85) return { decision: 'embargo', reason: 'high-risk:' + score.triggered.join(',') };
  if (score.riskScore >= 0.4) return { decision: 'sieve', reason: 'moderate-risk:' + score.triggered.join(',') };
  return { decision: 'allow', reason: 'ok' };
}

export function cmpsbl_cons_sieve(payload: unknown): unknown {
  if (typeof payload !== 'string') return payload;
  let out = payload;
  for (const g of _CMPSBL_CONS_GUARDS) out = out.replace(g.pattern, '[REDACTED:' + g.name + ']');
  return out;
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Probabilistic Conscience (proprietary).                    ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import json, re

_CMPSBL_CONS_GUARDS = [
    { 'name': 'self-harm',       'weight': 1.0,  'pat': re.compile(r'\\b(suicide|self[- ]harm|kill\\s+myself)\\b', re.IGNORECASE) },
    { 'name': 'violence',        'weight': 0.85, 'pat': re.compile(r'\\b(bomb|attack|murder|massacre|slaughter)\\b', re.IGNORECASE) },
    { 'name': 'illegal',         'weight': 0.7,  'pat': re.compile(r'\\b(child\\s+porn|cp\\b|drug\\s+deal|hitman)\\b', re.IGNORECASE) },
    { 'name': 'discrimination',  'weight': 0.6,  'pat': re.compile(r'\\b(racial\\s+slur|ethnic\\s+cleansing)\\b', re.IGNORECASE) },
    { 'name': 'manipulation',    'weight': 0.5,  'pat': re.compile(r'\\b(deceive|manipulate|gaslight)\\s+(user|customer)\\b', re.IGNORECASE) },
    { 'name': 'privacy-leak',    'weight': 0.55, 'pat': re.compile(r'\\b(dox|leak\\s+address|home\\s+address\\s+of)\\b', re.IGNORECASE) },
]

def cmpsbl_cons_score(payload) -> dict:
    s = json.dumps(payload, default=str, sort_keys=True) if payload is not None else ''
    triggered = []
    risk = 0.0
    for g in _CMPSBL_CONS_GUARDS:
        if g['pat'].search(s):
            triggered.append(g['name'])
            risk = 1 - (1 - risk) * (1 - g['weight'])
    return { 'risk_score': min(1.0, risk), 'triggered': triggered }

def cmpsbl_cons_arbitrate(score: dict) -> dict:
    r = score['risk_score']
    if r >= 0.85:
        return { 'decision': 'embargo', 'reason': 'high-risk:' + ','.join(score['triggered']) }
    if r >= 0.4:
        return { 'decision': 'sieve', 'reason': 'moderate-risk:' + ','.join(score['triggered']) }
    return { 'decision': 'allow', 'reason': 'ok' }

def cmpsbl_cons_sieve(payload):
    if not isinstance(payload, str):
        return payload
    out = payload
    for g in _CMPSBL_CONS_GUARDS:
        out = g['pat'].sub('[REDACTED:' + g['name'] + ']', out)
    return out
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_cons = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_cons(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const score = cmpsbl_cons_score(input);
  const decision = cmpsbl_cons_arbitrate(score);
  if (decision.decision === 'embargo') {
    throw new Error(\`[CMPSBL:Conscience:\${capabilityName}] embargoed: \${decision.reason}\`);
  }
  const result = _cmpsbl_raw_execute_cons(capabilityName, input);
  const outScore = cmpsbl_cons_score(result);
  const outDecision = cmpsbl_cons_arbitrate(outScore);
  if (outDecision.decision === 'embargo') {
    throw new Error(\`[CMPSBL:Conscience:\${capabilityName}] output embargoed: \${outDecision.reason}\`);
  }
  if (outDecision.decision === 'sieve' && typeof result === 'object' && result) {
    for (const [k, v] of Object.entries(result as Record<string, unknown>)) {
      (result as Record<string, unknown>)[k] = cmpsbl_cons_sieve(v);
    }
  }
  return result;
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_cons = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Ethical Guardrails Layer (auto-wired)."""
    score = cmpsbl_cons_score(input_data)
    decision = cmpsbl_cons_arbitrate(score)
    if decision['decision'] == 'embargo':
        raise RuntimeError(f"[CMPSBL:Conscience:{capability_name}] embargoed: {decision['reason']}")
    result = _cmpsbl_raw_execute_cons(capability_name, input_data)
    out_score = cmpsbl_cons_score(result)
    out_decision = cmpsbl_cons_arbitrate(out_score)
    if out_decision['decision'] == 'embargo':
        raise RuntimeError(f"[CMPSBL:Conscience:{capability_name}] output embargoed: {out_decision['reason']}")
    if out_decision['decision'] == 'sieve' and isinstance(result, dict):
        for k, v in list(result.items()):
            result[k] = cmpsbl_cons_sieve(v)
    return result`;

export const PROBABILISTIC_CONSCIENCE_LAYER: CmpsblLayerDefinition = {
  id: 'probabilistic-conscience',
  name: 'Probabilistic Conscience Layer',
  crownJewelRank: 26,
  cjpi: 92,
  module: 'BRAIN×CONSCIENCE',
  description: 'Six weighted ethical axes that score every input and output, then allow, sieve, or embargo the action — gives your AI a conscience without hand-coding rules.',
  priceCents: 5900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_cons_arbitrate',
    behavior: 'Scores inputs and outputs against ethical guardrails; embargoes high-risk flows, sieves moderate-risk strings.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
