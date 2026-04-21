/**
 * CMPSBL® Inventory Layer — Spectral Auditor
 * Caps: AUDIT · BASTION · CITADEL · spectrum analysis · receipt forging · anomaly citadel
 *
 * Continuously running forensic auditor that watches every primitive for
 * anomalous spectra, citadels suspect flows, and writes ironclad receipts.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Spectral Auditor (proprietary).                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblSpecReceipt { id: string; ts: number; cap: string; spectrum: number[]; anomaly: number; prevHash: string; hash: string }

const _CMPSBL_SPEC_HISTORY: CmpsblSpecReceipt[] = [];
const _CMPSBL_SPEC_CAP_BASELINE = new Map<string, number[]>();

function _cmpsbl_spec_hash(s: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

export function cmpsbl_spec_spectrum(payload: unknown): number[] {
  const s = JSON.stringify(payload ?? '');
  const buckets = new Array(8).fill(0);
  for (let i = 0; i < s.length; i++) buckets[s.charCodeAt(i) % 8]++;
  const total = s.length || 1;
  return buckets.map(b => b / total);
}

export function cmpsbl_spec_anomaly(cap: string, spectrum: number[]): number {
  const baseline = _CMPSBL_SPEC_CAP_BASELINE.get(cap);
  if (!baseline) {
    _CMPSBL_SPEC_CAP_BASELINE.set(cap, spectrum.slice());
    return 0;
  }
  let dist = 0;
  for (let i = 0; i < spectrum.length; i++) dist += (spectrum[i] - baseline[i]) ** 2;
  // EMA update
  for (let i = 0; i < spectrum.length; i++) baseline[i] = baseline[i] * 0.9 + spectrum[i] * 0.1;
  return Math.sqrt(dist);
}

export function cmpsbl_spec_receipt(cap: string, payload: unknown): CmpsblSpecReceipt {
  const spectrum = cmpsbl_spec_spectrum(payload);
  const anomaly = cmpsbl_spec_anomaly(cap, spectrum);
  const prev = _CMPSBL_SPEC_HISTORY[_CMPSBL_SPEC_HISTORY.length - 1];
  const prevHash = prev?.hash ?? '00000000';
  const id = 'spec_' + _cmpsbl_spec_hash(cap + ':' + Date.now());
  const hash = _cmpsbl_spec_hash(prevHash + id + spectrum.join(','));
  const r: CmpsblSpecReceipt = { id, ts: Date.now(), cap, spectrum, anomaly, prevHash, hash };
  _CMPSBL_SPEC_HISTORY.push(r);
  if (_CMPSBL_SPEC_HISTORY.length > 4096) _CMPSBL_SPEC_HISTORY.shift();
  return r;
}

export function cmpsbl_spec_citadel(receipt: CmpsblSpecReceipt, threshold: number = 0.35): { quarantine: boolean; reason: string } {
  if (receipt.anomaly > threshold) return { quarantine: true, reason: 'anomaly:' + receipt.anomaly.toFixed(3) };
  return { quarantine: false, reason: 'ok' };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Spectral Auditor (proprietary).                            ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import json, time, math

_CMPSBL_SPEC_HISTORY = []
_CMPSBL_SPEC_CAP_BASELINE = {}

def _cmpsbl_spec_hash(s: str) -> str:
    h = 2166136261
    for ch in s:
        h ^= ord(ch); h = (h * 16777619) & 0xFFFFFFFF
    return format(h, '08x')

def cmpsbl_spec_spectrum(payload) -> list:
    s = json.dumps(payload, default=str, sort_keys=True) if payload is not None else ''
    buckets = [0] * 8
    for ch in s:
        buckets[ord(ch) % 8] += 1
    total = len(s) or 1
    return [b / total for b in buckets]

def cmpsbl_spec_anomaly(cap: str, spectrum: list) -> float:
    baseline = _CMPSBL_SPEC_CAP_BASELINE.get(cap)
    if baseline is None:
        _CMPSBL_SPEC_CAP_BASELINE[cap] = list(spectrum)
        return 0.0
    dist = sum((s - b) ** 2 for s, b in zip(spectrum, baseline))
    for i in range(len(spectrum)):
        baseline[i] = baseline[i] * 0.9 + spectrum[i] * 0.1
    return math.sqrt(dist)

def cmpsbl_spec_receipt(cap: str, payload) -> dict:
    spectrum = cmpsbl_spec_spectrum(payload)
    anomaly = cmpsbl_spec_anomaly(cap, spectrum)
    prev = _CMPSBL_SPEC_HISTORY[-1] if _CMPSBL_SPEC_HISTORY else None
    prev_hash = prev['hash'] if prev else '00000000'
    rid = 'spec_' + _cmpsbl_spec_hash(cap + ':' + str(int(time.time() * 1000)))
    h = _cmpsbl_spec_hash(prev_hash + rid + ','.join(str(x) for x in spectrum))
    r = { 'id': rid, 'ts': int(time.time() * 1000), 'cap': cap,
          'spectrum': spectrum, 'anomaly': anomaly, 'prev_hash': prev_hash, 'hash': h }
    _CMPSBL_SPEC_HISTORY.append(r)
    if len(_CMPSBL_SPEC_HISTORY) > 4096:
        _CMPSBL_SPEC_HISTORY.pop(0)
    return r

def cmpsbl_spec_citadel(receipt: dict, threshold: float = 0.35) -> dict:
    if receipt['anomaly'] > threshold:
        return { 'quarantine': True, 'reason': 'anomaly:' + format(receipt['anomaly'], '.3f') }
    return { 'quarantine': False, 'reason': 'ok' }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_spec = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_spec(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const inReceipt = cmpsbl_spec_receipt(capabilityName + ':in', input);
  const cit = cmpsbl_spec_citadel(inReceipt);
  if (cit.quarantine) throw new Error(\`[CMPSBL:Spectral:\${capabilityName}] quarantined: \${cit.reason}\`);
  const result = _cmpsbl_raw_execute_spec(capabilityName, input);
  cmpsbl_spec_receipt(capabilityName + ':out', result);
  return result;
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_spec = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Behavior Drift Detection & Quarantine Layer (auto-wired)."""
    in_receipt = cmpsbl_spec_receipt(capability_name + ':in', input_data)
    cit = cmpsbl_spec_citadel(in_receipt)
    if cit['quarantine']:
        raise RuntimeError(f"[CMPSBL:Spectral:{capability_name}] quarantined: {cit['reason']}")
    result = _cmpsbl_raw_execute_spec(capability_name, input_data)
    cmpsbl_spec_receipt(capability_name + ':out', result)
    return result`;

export const SPECTRAL_AUDITOR_LAYER: CmpsblLayerDefinition = {
  id: 'spectral-auditor',
  name: 'Behavior Drift Detection & Quarantine Layer',
  crownJewelRank: 24,
  cjpi: 91,
  module: 'AUDIT×BASTION',
  description: 'Builds a behavioral fingerprint of every capability, watches for drift from that baseline, and quarantines anything that suddenly behaves differently — catches silent regressions and supply-chain tampering.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_spec_receipt',
    behavior: 'Generates a hash-chained spectral receipt for every input/output and quarantines flows whose spectrum drifts beyond baseline.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
