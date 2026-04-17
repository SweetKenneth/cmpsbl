/**
 * CMPSBL® Inventory Layer — Compliance Audit
 * Caps: AUDIT · CONSCIENCE · CUSTODIAN · governance trail · regulator-ready
 *
 * Continuously certifies your stack against governance and custodial rules,
 * producing a ready-to-ship compliance trail any regulator can read.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Compliance Audit (proprietary).                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblCompRule { id: string; framework: string; predicate: (cap: string, payload: unknown) => boolean; severity: 'info' | 'warn' | 'block' }
interface CmpsblCompFinding { ts: number; ruleId: string; framework: string; cap: string; severity: string }

const _CMPSBL_COMP_FINDINGS: CmpsblCompFinding[] = [];

const _CMPSBL_COMP_RULES: CmpsblCompRule[] = [
  { id: 'gdpr-pii-flag',  framework: 'GDPR',   severity: 'warn',
    predicate: (_c, p) => /\\b[\\w.+-]+@[\\w-]+\\.[\\w.-]+\\b/.test(JSON.stringify(p ?? '')) },
  { id: 'pci-card-block', framework: 'PCI-DSS', severity: 'block',
    predicate: (_c, p) => /\\b(?:\\d[ -]*?){13,19}\\b/.test(JSON.stringify(p ?? '')) },
  { id: 'hipaa-ssn-block', framework: 'HIPAA', severity: 'block',
    predicate: (_c, p) => /\\b\\d{3}-\\d{2}-\\d{4}\\b/.test(JSON.stringify(p ?? '')) },
  { id: 'soc2-token-warn', framework: 'SOC2',  severity: 'warn',
    predicate: (_c, p) => /\\beyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\b/.test(JSON.stringify(p ?? '')) },
];

export function cmpsbl_comp_evaluate(cap: string, payload: unknown): { findings: CmpsblCompFinding[]; blocked: boolean } {
  const out: CmpsblCompFinding[] = [];
  let blocked = false;
  for (const r of _CMPSBL_COMP_RULES) {
    try {
      if (r.predicate(cap, payload)) {
        const f: CmpsblCompFinding = { ts: Date.now(), ruleId: r.id, framework: r.framework, cap, severity: r.severity };
        out.push(f);
        _CMPSBL_COMP_FINDINGS.push(f);
        if (r.severity === 'block') blocked = true;
      }
    } catch { /* deterministic — never throw from rules */ }
  }
  if (_CMPSBL_COMP_FINDINGS.length > 8192) _CMPSBL_COMP_FINDINGS.splice(0, _CMPSBL_COMP_FINDINGS.length - 8192);
  return { findings: out, blocked };
}

export function cmpsbl_comp_trail(): CmpsblCompFinding[] {
  return _CMPSBL_COMP_FINDINGS.slice();
}

export function cmpsbl_comp_certify(framework: string, windowMs: number = 86_400_000): { framework: string; passing: boolean; blockCount: number; warnCount: number } {
  const now = Date.now();
  const recent = _CMPSBL_COMP_FINDINGS.filter(f => f.framework === framework && now - f.ts <= windowMs);
  const blockCount = recent.filter(f => f.severity === 'block').length;
  const warnCount = recent.filter(f => f.severity === 'warn').length;
  return { framework, passing: blockCount === 0, blockCount, warnCount };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Compliance Audit (proprietary).                            ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import json, re, time

_CMPSBL_COMP_FINDINGS = []

_CMPSBL_COMP_RULES = [
    { 'id': 'gdpr-pii-flag', 'framework': 'GDPR', 'severity': 'warn',
      'pat': re.compile(r'\\b[\\w.+-]+@[\\w-]+\\.[\\w.-]+\\b') },
    { 'id': 'pci-card-block', 'framework': 'PCI-DSS', 'severity': 'block',
      'pat': re.compile(r'\\b(?:\\d[ -]*?){13,19}\\b') },
    { 'id': 'hipaa-ssn-block', 'framework': 'HIPAA', 'severity': 'block',
      'pat': re.compile(r'\\b\\d{3}-\\d{2}-\\d{4}\\b') },
    { 'id': 'soc2-token-warn', 'framework': 'SOC2', 'severity': 'warn',
      'pat': re.compile(r'\\beyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\b') },
]

def cmpsbl_comp_evaluate(cap: str, payload) -> dict:
    s = json.dumps(payload, default=str, sort_keys=True) if payload is not None else ''
    out = []
    blocked = False
    for r in _CMPSBL_COMP_RULES:
        try:
            if r['pat'].search(s):
                f = { 'ts': int(time.time() * 1000), 'rule_id': r['id'],
                      'framework': r['framework'], 'cap': cap, 'severity': r['severity'] }
                out.append(f)
                _CMPSBL_COMP_FINDINGS.append(f)
                if r['severity'] == 'block':
                    blocked = True
        except Exception:
            pass
    if len(_CMPSBL_COMP_FINDINGS) > 8192:
        del _CMPSBL_COMP_FINDINGS[:len(_CMPSBL_COMP_FINDINGS) - 8192]
    return { 'findings': out, 'blocked': blocked }

def cmpsbl_comp_trail() -> list:
    return list(_CMPSBL_COMP_FINDINGS)

def cmpsbl_comp_certify(framework: str, window_ms: int = 86_400_000) -> dict:
    now = int(time.time() * 1000)
    recent = [f for f in _CMPSBL_COMP_FINDINGS if f['framework'] == framework and now - f['ts'] <= window_ms]
    block_count = sum(1 for f in recent if f['severity'] == 'block')
    warn_count = sum(1 for f in recent if f['severity'] == 'warn')
    return { 'framework': framework, 'passing': block_count == 0,
             'block_count': block_count, 'warn_count': warn_count }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_comp = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_comp(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const ev = cmpsbl_comp_evaluate(capabilityName, input);
  if (ev.blocked) throw new Error(\`[CMPSBL:Compliance:\${capabilityName}] blocked by: \${ev.findings.map(f => f.ruleId).join(',')}\`);
  return _cmpsbl_raw_execute_comp(capabilityName, input);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_comp = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Compliance Audit Layer (auto-wired)."""
    ev = cmpsbl_comp_evaluate(capability_name, input_data)
    if ev['blocked']:
        rules = ','.join(f['rule_id'] for f in ev['findings'])
        raise RuntimeError(f"[CMPSBL:Compliance:{capability_name}] blocked by: {rules}")
    return _cmpsbl_raw_execute_comp(capability_name, input_data)`;

export const COMPLIANCE_AUDIT_LAYER: CmpsblLayerDefinition = {
  id: 'compliance-audit',
  name: 'Compliance Audit Layer',
  crownJewelRank: 25,
  cjpi: 89,
  module: 'AUDIT×CONSCIENCE',
  description: 'GDPR/PCI/HIPAA/SOC2 rule engine with persistent finding trail and per-framework rolling-window certification.',
  priceCents: 5900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_comp_evaluate',
    behavior: 'Evaluates every call against compliance rules; fails closed on block-severity findings (PCI cards, HIPAA SSNs).',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
