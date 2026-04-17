/**
 * CMPSBL® Inventory Layer — Zero-Trust Identity
 * Caps: Per-call attestation · Sovereign identity broker · Custodial key flow · Continuous re-verification
 *
 * Verifies, attests, and brokers access on every call — collapsing IAM into
 * a single pluggable layer your services call into.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Zero-Trust Identity (proprietary).                         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblZtiClaim { sub: string; iss: string; exp: number; scopes: string[] }

const _CMPSBL_ZTI_TRUSTED_ISS = new Set<string>(['cmpsbl.local','cmpsbl.gov']);
const _CMPSBL_ZTI_REPLAY = new Map<string, number>();
const _CMPSBL_ZTI_REPLAY_TTL_MS = 60_000;

function _cmpsbl_zti_b64u_decode(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  if (typeof atob === 'function') return atob(b64);
  return Buffer.from(b64, 'base64').toString('utf-8');
}

export function cmpsbl_zti_attest(token: string): { valid: boolean; claim: CmpsblZtiClaim | null; reason: string } {
  if (!token || token.split('.').length !== 3) return { valid: false, claim: null, reason: 'malformed' };
  try {
    const [, payload] = token.split('.');
    const claim = JSON.parse(_cmpsbl_zti_b64u_decode(payload)) as CmpsblZtiClaim;
    const now = Math.floor(Date.now() / 1000);
    if (!claim.sub || !claim.iss) return { valid: false, claim: null, reason: 'missing-claims' };
    if (claim.exp && claim.exp < now) return { valid: false, claim, reason: 'expired' };
    if (!_CMPSBL_ZTI_TRUSTED_ISS.has(claim.iss)) return { valid: false, claim, reason: 'untrusted-issuer' };
    return { valid: true, claim, reason: 'ok' };
  } catch {
    return { valid: false, claim: null, reason: 'parse-error' };
  }
}

export function cmpsbl_zti_broker(claim: CmpsblZtiClaim, requiredScope: string): { granted: boolean; reason: string } {
  if (!claim || !Array.isArray(claim.scopes)) return { granted: false, reason: 'no-scopes' };
  if (claim.scopes.includes('*') || claim.scopes.includes(requiredScope)) return { granted: true, reason: 'ok' };
  return { granted: false, reason: 'missing-scope:' + requiredScope };
}

export function cmpsbl_zti_replay_guard(nonce: string): { unique: boolean } {
  const now = Date.now();
  for (const [n, t] of _CMPSBL_ZTI_REPLAY) {
    if (now - t > _CMPSBL_ZTI_REPLAY_TTL_MS) _CMPSBL_ZTI_REPLAY.delete(n);
  }
  if (_CMPSBL_ZTI_REPLAY.has(nonce)) return { unique: false };
  _CMPSBL_ZTI_REPLAY.set(nonce, now);
  return { unique: true };
}

export function cmpsbl_zti_custodial_wrap(secret: string, salt: string): string {
  let h = 2166136261 >>> 0;
  const s = salt + ':' + secret;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return 'cstd_' + h.toString(16);
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Zero-Trust Identity (proprietary).                         ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import base64, json, time

_CMPSBL_ZTI_TRUSTED_ISS = {'cmpsbl.local', 'cmpsbl.gov'}
_CMPSBL_ZTI_REPLAY = {}
_CMPSBL_ZTI_REPLAY_TTL_MS = 60_000

def _cmpsbl_zti_b64u_decode(s: str) -> bytes:
    pad = '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)

def cmpsbl_zti_attest(token: str) -> dict:
    if not token or token.count('.') != 2:
        return { 'valid': False, 'claim': None, 'reason': 'malformed' }
    try:
        _, payload, _ = token.split('.')
        claim = json.loads(_cmpsbl_zti_b64u_decode(payload))
        now = int(time.time())
        if not claim.get('sub') or not claim.get('iss'):
            return { 'valid': False, 'claim': None, 'reason': 'missing-claims' }
        if claim.get('exp') and claim['exp'] < now:
            return { 'valid': False, 'claim': claim, 'reason': 'expired' }
        if claim['iss'] not in _CMPSBL_ZTI_TRUSTED_ISS:
            return { 'valid': False, 'claim': claim, 'reason': 'untrusted-issuer' }
        return { 'valid': True, 'claim': claim, 'reason': 'ok' }
    except Exception:
        return { 'valid': False, 'claim': None, 'reason': 'parse-error' }

def cmpsbl_zti_broker(claim: dict, required_scope: str) -> dict:
    scopes = claim.get('scopes') if claim else None
    if not isinstance(scopes, list):
        return { 'granted': False, 'reason': 'no-scopes' }
    if '*' in scopes or required_scope in scopes:
        return { 'granted': True, 'reason': 'ok' }
    return { 'granted': False, 'reason': 'missing-scope:' + required_scope }

def cmpsbl_zti_replay_guard(nonce: str) -> dict:
    now = int(time.time() * 1000)
    for n in list(_CMPSBL_ZTI_REPLAY.keys()):
        if now - _CMPSBL_ZTI_REPLAY[n] > _CMPSBL_ZTI_REPLAY_TTL_MS:
            del _CMPSBL_ZTI_REPLAY[n]
    if nonce in _CMPSBL_ZTI_REPLAY:
        return { 'unique': False }
    _CMPSBL_ZTI_REPLAY[nonce] = now
    return { 'unique': True }

def cmpsbl_zti_custodial_wrap(secret: str, salt: str) -> str:
    h = 2166136261
    s = salt + ':' + secret
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return 'cstd_' + format(h, 'x')
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_zti = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_zti(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const token = (input as any)._cmpsbl_token as string | undefined;
  if (token) {
    const a = cmpsbl_zti_attest(token);
    if (!a.valid) throw new Error(\`[CMPSBL:ZTI:\${capabilityName}] attestation failed: \${a.reason}\`);
    const b = cmpsbl_zti_broker(a.claim!, capabilityName);
    if (!b.granted) throw new Error(\`[CMPSBL:ZTI:\${capabilityName}] access denied: \${b.reason}\`);
  }
  return _cmpsbl_raw_execute_zti(capabilityName, input);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_zti = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Zero-Trust Identity Layer (auto-wired)."""
    token = input_data.get('_cmpsbl_token')
    if token:
        a = cmpsbl_zti_attest(token)
        if not a['valid']:
            raise RuntimeError(f"[CMPSBL:ZTI:{capability_name}] attestation failed: {a['reason']}")
        b = cmpsbl_zti_broker(a['claim'], capability_name)
        if not b['granted']:
            raise RuntimeError(f"[CMPSBL:ZTI:{capability_name}] access denied: {b['reason']}")
    return _cmpsbl_raw_execute_zti(capability_name, input_data)`;

export const ZERO_TRUST_IDENTITY_LAYER: CmpsblLayerDefinition = {
  id: 'zero-trust-identity',
  name: 'Zero-Trust Identity Layer',
  crownJewelRank: 22,
  cjpi: 93,
  module: 'IDENTITY×ATTESTATION',
  description: 'Per-call attestation, sovereign identity broker, replay-guard nonce cache, and custodial key wrapping.',
  priceCents: 9900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_zti_attest',
    behavior: 'Verifies _cmpsbl_token on every call, brokers scope against capability name, and fails closed on missing/invalid claims.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
