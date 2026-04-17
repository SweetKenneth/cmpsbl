/**
 * CMPSBL® Inventory Layer — Privacy & Obfuscation
 * Caps: Field-level redaction · Identifier masking · Telemetry obfuscation · Zero-leak transit
 *
 * A bundled privacy fabric that masks identifiers, redacts sensitive fields,
 * and obfuscates payload telemetry — wrapping any service with field-level
 * privacy and zero-trust telemetry without rewriting endpoints.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Privacy & Obfuscation (proprietary).                       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

const _CMPSBL_PRIV_PII = [
  { name: 'email',  re: /\\b[\\w.+-]+@[\\w-]+\\.[\\w.-]+\\b/g },
  { name: 'ssn',    re: /\\b\\d{3}-\\d{2}-\\d{4}\\b/g },
  { name: 'phone',  re: /\\b(?:\\+?1[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b/g },
  { name: 'card',   re: /\\b(?:\\d[ -]*?){13,19}\\b/g },
  { name: 'ipv4',   re: /\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/g },
  { name: 'jwt',    re: /\\beyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\b/g },
];

const _CMPSBL_PRIV_SENSITIVE_KEYS = new Set([
  'password','passwd','secret','token','api_key','apikey','authorization',
  'auth','session','cookie','private_key','privatekey','ssn','dob','birthdate',
]);

export function cmpsbl_priv_redact(text: string): { redacted: string; hits: string[] } {
  const hits: string[] = [];
  let out = text;
  for (const p of _CMPSBL_PRIV_PII) {
    if (p.re.test(out)) {
      hits.push(p.name);
      out = out.replace(p.re, '[' + p.name.toUpperCase() + ']');
    }
    p.re.lastIndex = 0;
  }
  return { redacted: out, hits };
}

export function cmpsbl_priv_mask_id(id: string): string {
  if (!id || id.length <= 4) return '****';
  return id.slice(0, 2) + '*'.repeat(Math.max(4, id.length - 4)) + id.slice(-2);
}

export function cmpsbl_priv_obfuscate(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    const lk = k.toLowerCase();
    if (_CMPSBL_PRIV_SENSITIVE_KEYS.has(lk)) { out[k] = '[REDACTED]'; continue; }
    if (typeof v === 'string') {
      if (/id$|^id$|uuid/i.test(k)) out[k] = cmpsbl_priv_mask_id(v);
      else out[k] = cmpsbl_priv_redact(v).redacted;
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = cmpsbl_priv_obfuscate(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function cmpsbl_priv_telemetry_safe(event: Record<string, unknown>): Record<string, unknown> {
  const safe = cmpsbl_priv_obfuscate(event);
  safe._cmpsbl_privacy = 'obfuscated';
  return safe;
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Privacy & Obfuscation (proprietary).                       ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import re

_CMPSBL_PRIV_PII = [
    ('email',  re.compile(r'\\b[\\w.+-]+@[\\w-]+\\.[\\w.-]+\\b')),
    ('ssn',    re.compile(r'\\b\\d{3}-\\d{2}-\\d{4}\\b')),
    ('phone',  re.compile(r'\\b(?:\\+?1[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b')),
    ('card',   re.compile(r'\\b(?:\\d[ -]*?){13,19}\\b')),
    ('ipv4',   re.compile(r'\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b')),
    ('jwt',    re.compile(r'\\beyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\b')),
]

_CMPSBL_PRIV_SENSITIVE_KEYS = {
    'password','passwd','secret','token','api_key','apikey','authorization',
    'auth','session','cookie','private_key','privatekey','ssn','dob','birthdate',
}

def cmpsbl_priv_redact(text: str) -> dict:
    hits = []
    out = text
    for name, pat in _CMPSBL_PRIV_PII:
        if pat.search(out):
            hits.append(name)
            out = pat.sub('[' + name.upper() + ']', out)
    return { 'redacted': out, 'hits': hits }

def cmpsbl_priv_mask_id(id_str: str) -> str:
    if not id_str or len(id_str) <= 4:
        return '****'
    return id_str[:2] + '*' * max(4, len(id_str) - 4) + id_str[-2:]

def cmpsbl_priv_obfuscate(payload: dict) -> dict:
    out = {}
    for k, v in payload.items():
        lk = k.lower()
        if lk in _CMPSBL_PRIV_SENSITIVE_KEYS:
            out[k] = '[REDACTED]'
        elif isinstance(v, str):
            if re.search(r'id$|^id$|uuid', k, re.IGNORECASE):
                out[k] = cmpsbl_priv_mask_id(v)
            else:
                out[k] = cmpsbl_priv_redact(v)['redacted']
        elif isinstance(v, dict):
            out[k] = cmpsbl_priv_obfuscate(v)
        else:
            out[k] = v
    return out

def cmpsbl_priv_telemetry_safe(event: dict) -> dict:
    safe = cmpsbl_priv_obfuscate(event)
    safe['_cmpsbl_privacy'] = 'obfuscated'
    return safe
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_priv = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_priv(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const cleanInput = cmpsbl_priv_obfuscate(input);
  const result = _cmpsbl_raw_execute_priv(capabilityName, cleanInput);
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    return cmpsbl_priv_obfuscate(result as Record<string, unknown>) as ExecutionResult;
  }
  return result;
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_priv = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Privacy & Obfuscation Layer (auto-wired)."""
    clean = cmpsbl_priv_obfuscate(input_data)
    result = _cmpsbl_raw_execute_priv(capability_name, clean)
    if isinstance(result, dict):
        return cmpsbl_priv_obfuscate(result)
    return result`;

export const PRIVACY_OBFUSCATION_LAYER: CmpsblLayerDefinition = {
  id: 'privacy-obfuscation',
  name: 'Privacy & Obfuscation Layer',
  crownJewelRank: 21,
  cjpi: 95,
  module: 'PRIVACY×OBFUSCATION',
  description: 'Field-level PII redaction, identifier masking, sensitive-key obfuscation, and zero-leak telemetry.',
  priceCents: 9900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_priv_obfuscate',
    behavior: 'Obfuscates all input fields (PII redaction + sensitive-key masking) before execution and re-obfuscates outputs.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
