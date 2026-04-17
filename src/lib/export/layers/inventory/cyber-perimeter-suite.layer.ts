/**
 * CMPSBL® Inventory Layer — Cyber Perimeter Suite
 * Primitives: WATCHTOWER · AEGIS · BASTION · CIPHER
 *
 *   WATCHTOWER → request rate / abuse detection per identity
 *   AEGIS      → IP / origin allow + denylist enforcement
 *   BASTION    → SQLi / XSS / path-traversal payload signatures
 *   CIPHER     → secret-token redaction in inputs and outputs
 *
 * Auto-wire wraps cmpsbl_execute: every call passes through WATCHTOWER
 * (rate gate) → AEGIS (origin gate) → BASTION (payload scan, fail closed)
 * → CIPHER (redact PII/secret tokens before downstream).
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Cyber Perimeter Suite (proprietary).                       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── WATCHTOWER · per-identity rate gate ─────────────────────────────────────
type _CmpsblWtBucket = { count: number; resetAt: number };
const _cmpsbl_wt: Map<string, _CmpsblWtBucket> = new Map();
const _CMPSBL_WT_LIMIT = 120;       // requests per window
const _CMPSBL_WT_WINDOW_MS = 60_000;

export function cmpsbl_cps_watchtower(identity: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let b = _cmpsbl_wt.get(identity);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + _CMPSBL_WT_WINDOW_MS };
    _cmpsbl_wt.set(identity, b);
  }
  b.count++;
  return { allowed: b.count <= _CMPSBL_WT_LIMIT, remaining: Math.max(0, _CMPSBL_WT_LIMIT - b.count), resetMs: b.resetAt - now };
}

// ── AEGIS · origin allow / deny ─────────────────────────────────────────────
const _cmpsbl_aegis_deny: Set<string> = new Set();
const _cmpsbl_aegis_allow: Set<string> = new Set();

export function cmpsbl_cps_aegis_block(origin: string): void { _cmpsbl_aegis_deny.add(origin); }
export function cmpsbl_cps_aegis_allow(origin: string): void { _cmpsbl_aegis_allow.add(origin); }
export function cmpsbl_cps_aegis_check(origin: string | undefined): { allowed: boolean; reason: string } {
  if (!origin) return { allowed: true, reason: 'no-origin' };
  if (_cmpsbl_aegis_deny.has(origin)) return { allowed: false, reason: 'denylist' };
  if (_cmpsbl_aegis_allow.size > 0 && !_cmpsbl_aegis_allow.has(origin)) return { allowed: false, reason: 'not-on-allowlist' };
  return { allowed: true, reason: 'ok' };
}

// ── BASTION · payload signatures ────────────────────────────────────────────
const _CMPSBL_BASTION_SIGS = [
  /(\\bunion\\b\\s+\\bselect\\b)|(\\bdrop\\s+table\\b)|(';\\s*--)/i,        // SQLi
  /<script[^>]*>|javascript\\s*:|on(error|load|click)\\s*=/i,                 // XSS
  /(\\.\\.\\/){2,}|\\.\\.\\\\/i,                                              // path traversal
  /\\$\\{jndi:|ldap:\\/\\//i,                                                 // log4shell-ish
];

export function cmpsbl_cps_bastion(payload: string): { safe: boolean; hits: string[] } {
  const hits: string[] = [];
  for (const sig of _CMPSBL_BASTION_SIGS) {
    if (sig.test(payload)) hits.push(sig.source.slice(0, 40));
  }
  return { safe: hits.length === 0, hits };
}

// ── CIPHER · secret-token redaction ─────────────────────────────────────────
const _CMPSBL_CIPHER_PATTERNS = [
  /\\bsk[_-][A-Za-z0-9]{20,}\\b/g,                       // sk_, sk-
  /\\bAKIA[0-9A-Z]{16}\\b/g,                              // AWS access key
  /\\bgh[pousr]_[A-Za-z0-9]{30,}\\b/g,                    // GitHub tokens
  /eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}/g, // JWT
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}/g,    // email
];

export function cmpsbl_cps_cipher(text: string): { redacted: string; replacements: number } {
  let out = text;
  let count = 0;
  for (const pat of _CMPSBL_CIPHER_PATTERNS) {
    out = out.replace(pat, () => { count++; return '[REDACTED]'; });
  }
  return { redacted: out, replacements: count };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Cyber Perimeter Suite (proprietary).                       ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import re, time
from typing import Dict, Set, Optional

_CMPSBL_WT_LIMIT = 120
_CMPSBL_WT_WINDOW_MS = 60_000
_cmpsbl_wt: Dict[str, dict] = {}

def cmpsbl_cps_watchtower(identity: str) -> dict:
    now = int(time.time() * 1000)
    b = _cmpsbl_wt.get(identity)
    if not b or now >= b['reset_at']:
        b = { "count": 0, "reset_at": now + _CMPSBL_WT_WINDOW_MS }
        _cmpsbl_wt[identity] = b
    b['count'] += 1
    return { "allowed": b['count'] <= _CMPSBL_WT_LIMIT, "remaining": max(0, _CMPSBL_WT_LIMIT - b['count']), "reset_ms": b['reset_at'] - now }

_cmpsbl_aegis_deny: Set[str] = set()
_cmpsbl_aegis_allow: Set[str] = set()

def cmpsbl_cps_aegis_block(origin: str) -> None: _cmpsbl_aegis_deny.add(origin)
def cmpsbl_cps_aegis_allow(origin: str) -> None: _cmpsbl_aegis_allow.add(origin)
def cmpsbl_cps_aegis_check(origin: Optional[str]) -> dict:
    if not origin: return { "allowed": True, "reason": "no-origin" }
    if origin in _cmpsbl_aegis_deny: return { "allowed": False, "reason": "denylist" }
    if _cmpsbl_aegis_allow and origin not in _cmpsbl_aegis_allow: return { "allowed": False, "reason": "not-on-allowlist" }
    return { "allowed": True, "reason": "ok" }

_CMPSBL_BASTION_SIGS = [
    re.compile(r"(\\bunion\\b\\s+\\bselect\\b)|(\\bdrop\\s+table\\b)|(';\\s*--)", re.IGNORECASE),
    re.compile(r"<script[^>]*>|javascript\\s*:|on(error|load|click)\\s*=", re.IGNORECASE),
    re.compile(r"(\\.\\./){2,}|\\.\\.\\\\\\\\", re.IGNORECASE),
    re.compile(r"\\$\\{jndi:|ldap://", re.IGNORECASE),
]

def cmpsbl_cps_bastion(payload: str) -> dict:
    hits = []
    for sig in _CMPSBL_BASTION_SIGS:
        if sig.search(payload): hits.append(sig.pattern[:40])
    return { "safe": len(hits) == 0, "hits": hits }

_CMPSBL_CIPHER_PATTERNS = [
    re.compile(r"\\bsk[_-][A-Za-z0-9]{20,}\\b"),
    re.compile(r"\\bAKIA[0-9A-Z]{16}\\b"),
    re.compile(r"\\bgh[pousr]_[A-Za-z0-9]{30,}\\b"),
    re.compile(r"eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}"),
    re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"),
]

def cmpsbl_cps_cipher(text: str) -> dict:
    count = [0]
    out = text
    for pat in _CMPSBL_CIPHER_PATTERNS:
        def _sub(_m):
            count[0] += 1
            return "[REDACTED]"
        out = pat.sub(_sub, out)
    return { "redacted": out, "replacements": count[0] }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_cps = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_cps(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const identity = String(input._cmpsbl_identity ?? 'anonymous');
  const origin = typeof input._cmpsbl_origin === 'string' ? input._cmpsbl_origin : undefined;
  // WATCHTOWER
  const wt = cmpsbl_cps_watchtower(identity);
  if (!wt.allowed) throw new Error(\`[CMPSBL:CyberPerimeter:\${capabilityName}] WATCHTOWER rate exceeded for \${identity}\`);
  // AEGIS
  const ae = cmpsbl_cps_aegis_check(origin);
  if (!ae.allowed) throw new Error(\`[CMPSBL:CyberPerimeter:\${capabilityName}] AEGIS denied origin: \${ae.reason}\`);
  // BASTION + CIPHER on string fields
  const cleanInput: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === 'string') {
      const b = cmpsbl_cps_bastion(v);
      if (!b.safe) throw new Error(\`[CMPSBL:CyberPerimeter:\${capabilityName}] BASTION blocked field '\${k}': \${b.hits.join(',')}\`);
      cleanInput[k] = cmpsbl_cps_cipher(v).redacted;
    } else {
      cleanInput[k] = v;
    }
  }
  return _cmpsbl_raw_execute_cps(capabilityName, cleanInput);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_cps = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Cyber Perimeter Suite (auto-wired)."""
    identity = str(input_data.get('_cmpsbl_identity', 'anonymous'))
    origin = input_data.get('_cmpsbl_origin') if isinstance(input_data.get('_cmpsbl_origin'), str) else None
    wt = cmpsbl_cps_watchtower(identity)
    if not wt['allowed']:
        raise RuntimeError(f"[CMPSBL:CyberPerimeter:{capability_name}] WATCHTOWER rate exceeded for {identity}")
    ae = cmpsbl_cps_aegis_check(origin)
    if not ae['allowed']:
        raise RuntimeError(f"[CMPSBL:CyberPerimeter:{capability_name}] AEGIS denied origin: {ae['reason']}")
    clean = {}
    for k, v in input_data.items():
        if isinstance(v, str):
            b = cmpsbl_cps_bastion(v)
            if not b['safe']:
                raise RuntimeError(f"[CMPSBL:CyberPerimeter:{capability_name}] BASTION blocked field '{k}': {','.join(b['hits'])}")
            clean[k] = cmpsbl_cps_cipher(v)['redacted']
        else:
            clean[k] = v
    return _cmpsbl_raw_execute_cps(capability_name, clean)`;

export const CYBER_PERIMETER_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'cyber-perimeter-suite',
  name: 'Cyber Perimeter Suite',
  crownJewelRank: 22,
  cjpi: 93,
  module: 'DEFENSE',
  description: 'WATCHTOWER rate gate + AEGIS origin allow/deny + BASTION payload signatures + CIPHER secret redaction.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_cps_bastion',
    behavior: 'Per-identity rate-limits, origin-gates, payload-scans, and redacts secrets/PII on every execution.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
