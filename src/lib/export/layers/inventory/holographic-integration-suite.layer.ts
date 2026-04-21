/**
 * CMPSBL® Inventory Layer — Holographic Integration Suite
 * Primitives: PRISM · MIRROR · WEAVE · RESONATE
 *
 *   PRISM    → multi-source merge with conflict policy (last/first/sum/max)
 *   MIRROR   → deterministic deep-clone of plain JSON-safe values (utility only)
 *   WEAVE    → stable interleaving of N sequences (round-robin braid)
 *   RESONATE → schema cross-check returning matched + missing keys
 *
 * ─── Hardening Layer compatibility ─────────────────────────────────────────
 * The Phase-0 Hardening chain already deep-clones every `cmpsbl_execute`
 * input via `_cmpsbl_clone_input` before wrappers ever see it. Cloning a
 * second time inside this layer is wasted work and makes the chain harder
 * to reason about, so the auto-wire NO LONGER calls MIRROR on the input.
 *
 * What this layer adds on top of Hardening:
 *   • RESONATE — declarative schema contract gate (missing-key fail-closed)
 *   • CONTRACT RECEIPT — emits a structured matched/missing/extras receipt
 *     so downstream observers (e.g. RECEIPT_EMITTER_CORE) can audit which
 *     keys actually flowed through every call.
 *
 * MIRROR remains exported as a utility for callers that want stable,
 * key-sorted clones for hashing or snapshot tests — it is never invoked
 * automatically.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Holographic Integration Suite (proprietary).               ║
// ║  Hardening already clones inputs — this layer only enforces RESONATE          ║
// ║  contracts and emits matched/missing/extras receipts.                          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── PRISM · multi-source merge ──────────────────────────────────────────────
export type CmpsblPrismPolicy = 'last' | 'first' | 'sum' | 'max';
export function cmpsbl_his_prism_merge(sources: Array<Record<string, unknown>>, policy: CmpsblPrismPolicy = 'last'): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const src of sources) {
    for (const k in src) {
      const v = src[k];
      if (!(k in out)) { out[k] = v; continue; }
      switch (policy) {
        case 'first': break;
        case 'last': out[k] = v; break;
        case 'sum': {
          const a = typeof out[k] === 'number' ? out[k] as number : 0;
          const b = typeof v === 'number' ? v : 0;
          out[k] = a + b; break;
        }
        case 'max': {
          const a = typeof out[k] === 'number' ? out[k] as number : -Infinity;
          const b = typeof v === 'number' ? v : -Infinity;
          out[k] = Math.max(a, b); break;
        }
      }
    }
  }
  return out;
}

// ── MIRROR · deterministic deep-clone (utility only — not on the wire) ──────
// Hardening's _cmpsbl_clone_input already clones inputs before this layer is
// reached. MIRROR is kept exported for callers that want key-sorted clones
// (snapshot tests, content-addressable hashing). It is NOT invoked automatically.
export function cmpsbl_his_mirror_clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return (value.map(cmpsbl_his_mirror_clone) as unknown) as T;
  const out: Record<string, unknown> = {};
  const keys = Object.keys(value as Record<string, unknown>).sort();
  for (const k of keys) out[k] = cmpsbl_his_mirror_clone((value as Record<string, unknown>)[k]);
  return out as unknown as T;
}

// ── WEAVE · stable round-robin braid ────────────────────────────────────────
export function cmpsbl_his_weave_braid<T>(sequences: T[][]): T[] {
  const out: T[] = [];
  let idx = 0;
  let added = true;
  while (added) {
    added = false;
    for (const seq of sequences) {
      if (idx < seq.length) { out.push(seq[idx]); added = true; }
    }
    idx += 1;
  }
  return out;
}

// ── RESONATE · schema cross-check + contract receipt ────────────────────────
export interface CmpsblResonateReceipt {
  capability: string;
  ok: boolean;
  matched: string[];
  missing: string[];
  extras: string[];
  ts: number;
}
const _CMPSBL_HIS_RECEIPTS: CmpsblResonateReceipt[] = [];
const _CMPSBL_HIS_RECEIPTS_MAX = 1024;

export function cmpsbl_his_resonate_check(payload: Record<string, unknown>, requiredKeys: string[]): { ok: boolean; matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];
  for (const k of requiredKeys) (k in payload ? matched : missing).push(k);
  return { ok: missing.length === 0, matched, missing };
}

export function cmpsbl_his_resonate_receipt(capability: string, payload: Record<string, unknown>, requiredKeys: string[]): CmpsblResonateReceipt {
  const matched: string[] = [];
  const missing: string[] = [];
  const requiredSet = new Set(requiredKeys);
  for (const k of requiredKeys) (k in payload ? matched : missing).push(k);
  const extras: string[] = Object.keys(payload).filter(k => !requiredSet.has(k));
  const receipt: CmpsblResonateReceipt = { capability, ok: missing.length === 0, matched, missing, extras, ts: Date.now() };
  _CMPSBL_HIS_RECEIPTS.push(receipt);
  if (_CMPSBL_HIS_RECEIPTS.length > _CMPSBL_HIS_RECEIPTS_MAX) _CMPSBL_HIS_RECEIPTS.shift();
  return receipt;
}

export function cmpsbl_his_receipts(): CmpsblResonateReceipt[] {
  return _CMPSBL_HIS_RECEIPTS.map(r => ({ ...r }));
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Holographic Integration Suite (proprietary).               ║
# ║  Hardening already clones inputs — this layer only enforces RESONATE          ║
# ║  contracts and emits matched/missing/extras receipts.                          ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
from typing import Any, Dict, List

def cmpsbl_his_prism_merge(sources: List[Dict[str, Any]], policy: str = "last") -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for src in sources:
        for k, v in src.items():
            if k not in out:
                out[k] = v
                continue
            if policy == "first": pass
            elif policy == "last": out[k] = v
            elif policy == "sum":
                a = out[k] if isinstance(out[k], (int, float)) else 0
                b = v if isinstance(v, (int, float)) else 0
                out[k] = a + b
            elif policy == "max":
                a = out[k] if isinstance(out[k], (int, float)) else float('-inf')
                b = v if isinstance(v, (int, float)) else float('-inf')
                out[k] = max(a, b)
    return out

# MIRROR — utility only. Hardening's _cmpsbl_clone_input clones every execute
# input before this layer runs, so we never call MIRROR on the wire path.
def cmpsbl_his_mirror_clone(value):
    if value is None or not isinstance(value, (dict, list)):
        return value
    if isinstance(value, list):
        return [cmpsbl_his_mirror_clone(v) for v in value]
    return { k: cmpsbl_his_mirror_clone(value[k]) for k in sorted(value.keys()) }

def cmpsbl_his_weave_braid(sequences: List[List[Any]]) -> List[Any]:
    out: List[Any] = []
    idx = 0
    added = True
    while added:
        added = False
        for seq in sequences:
            if idx < len(seq):
                out.append(seq[idx])
                added = True
        idx += 1
    return out

# RESONATE — schema cross-check + contract receipt
_CMPSBL_HIS_RECEIPTS: List[Dict[str, Any]] = []
_CMPSBL_HIS_RECEIPTS_MAX = 1024

def cmpsbl_his_resonate_check(payload: Dict[str, Any], required_keys: List[str]) -> dict:
    matched: List[str] = []
    missing: List[str] = []
    for k in required_keys:
        (matched if k in payload else missing).append(k)
    return { "ok": len(missing) == 0, "matched": matched, "missing": missing }

def cmpsbl_his_resonate_receipt(capability: str, payload: Dict[str, Any], required_keys: List[str]) -> dict:
    matched: List[str] = []
    missing: List[str] = []
    required_set = set(required_keys)
    for k in required_keys:
        (matched if k in payload else missing).append(k)
    extras = [k for k in payload.keys() if k not in required_set]
    receipt = {
        "capability": capability,
        "ok": len(missing) == 0,
        "matched": matched, "missing": missing, "extras": extras,
        "ts": int(time.time() * 1000),
    }
    _CMPSBL_HIS_RECEIPTS.append(receipt)
    if len(_CMPSBL_HIS_RECEIPTS) > _CMPSBL_HIS_RECEIPTS_MAX:
        _CMPSBL_HIS_RECEIPTS.pop(0)
    return receipt

def cmpsbl_his_receipts() -> List[Dict[str, Any]]:
    return [dict(r) for r in _CMPSBL_HIS_RECEIPTS]
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_his = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_his(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Hardening Layer has already deep-cloned 'input' via _cmpsbl_clone_input —
  // we do NOT clone again. We only enforce RESONATE contracts and emit a
  // structured matched/missing/extras receipt for downstream auditors.
  const required = Array.isArray(input._cmpsbl_required_keys) ? input._cmpsbl_required_keys as string[] : null;
  if (required) {
    const receipt = cmpsbl_his_resonate_receipt(capabilityName, input, required);
    if (!receipt.ok) {
      throw new Error(\`[CMPSBL:Holographic:\${capabilityName}] RESONATE contract violation — missing: \${receipt.missing.join(', ')}\`);
    }
  }
  return _cmpsbl_raw_execute_his(capabilityName, input);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_his = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Holographic Integration Suite (RESONATE contract + receipt). Hardening already cloned input_data."""
    required = input_data.get('_cmpsbl_required_keys')
    if isinstance(required, list):
        receipt = cmpsbl_his_resonate_receipt(capability_name, input_data, required)
        if not receipt['ok']:
            raise RuntimeError(f"[CMPSBL:Holographic:{capability_name}] RESONATE contract violation — missing: {', '.join(receipt['missing'])}")
    return _cmpsbl_raw_execute_his(capability_name, input_data)`;

export const HOLOGRAPHIC_INTEGRATION_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'holographic-integration-suite',
  name: 'Holographic Integration Suite',
  crownJewelRank: 28,
  cjpi: 88,
  module: 'INTEGRATION',
  description: 'PRISM merge + WEAVE braid + RESONATE schema-contract gate with structured matched/missing/extras receipts. MIRROR exported as utility (Hardening already clones execute inputs — no double-clone on the wire).',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_his_resonate_receipt',
    behavior: 'Validates required-key contracts before execution and emits a matched/missing/extras receipt per call. Does NOT clone the input — Hardening Layer already did.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
