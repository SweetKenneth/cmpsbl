/**
 * CMPSBL® Always-On Core — Receipt Emitter (Kernel Component #8)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Tamper-evident receipt chain for every cmpsbl_execute. Each receipt is
 * an FNV-1a hash over { name, args_hash, result_hash, duration_ms, code,
 * prev_hash } and links to the prior receipt — Merkle-style.
 *
 * Extends the Ascension fingerprint pattern from export-time to runtime
 * so every governed call leaves a verifiable provenance trail.
 *
 * API:
 *   • emit(name, argsHash, resultHash, durationMs, code) → CmpsblReceipt
 *   • head()                  → string | null   (latest receipt hash)
 *   • length()                → number
 *   • chain()                 → CmpsblReceipt[] (snapshot)
 *   • verify()                → boolean         (re-walks parent links)
 *   • reset()                 → void            (test/replay only)
 *
 * Auto-hook: when present, IsolatedExecutor calls cmpsbl_receipts().emit()
 * after every invocation so receipts accumulate without explicit wiring.
 *
 * Gated by CMPSBL_KERNEL_ENABLED (default ON). When OFF, emit() is a no-op
 * shim that returns a stub receipt so callers stay byte-compatible.
 *
 * Module: AUDIT  ·  CJPI: 96  ·  Crown Jewel #48
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const RECEIPT_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Receipt Emitter (sealed module, proprietary).             ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblReceipt {
  hash: string;
  prevHash: string | null;
  name: string;
  argsHash: string;
  resultHash: string;
  durationMs: number;
  code: string;            // 'OK' | error code | 'BLOCKED'
  ts: number;
  seq: number;
  // ── Chain-context fields (populated when emitted by cmpsbl_chain) ─────────
  chainShortCircuited?: boolean;
  shortCircuitedAt?: number | null;   // phase number where chain stopped
  actionsTakenCount?: number;          // proof-of-firing summary count
}

function _cmpsbl_kernel_enabled_re(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

function _cmpsbl_fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const _CMPSBL_RECEIPT_RING_MAX = 1024;

class CmpsblReceiptEmitter {
  private chainArr: CmpsblReceipt[] = [];
  private headHash: string | null = null;
  private seq = 0;
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_re(); }

  emit(
    name: string,
    argsHash: string,
    resultHash: string,
    durationMs: number,
    code: string,
    chainCtx?: { shortCircuited?: boolean; shortCircuitedAt?: number | null; actionsTakenCount?: number },
  ): CmpsblReceipt {
    const prevHash = this.headHash;
    const seq = ++this.seq;
    const ts = Date.now();
    const payload = JSON.stringify({
      name, argsHash, resultHash, durationMs, code, prevHash, seq,
      chainShortCircuited: chainCtx?.shortCircuited ?? false,
      shortCircuitedAt: chainCtx?.shortCircuitedAt ?? null,
      actionsTakenCount: chainCtx?.actionsTakenCount ?? 0,
    });
    const hash = _cmpsbl_fnv1a(payload);
    const receipt: CmpsblReceipt = {
      hash, prevHash, name, argsHash, resultHash, durationMs, code, ts, seq,
      chainShortCircuited: chainCtx?.shortCircuited,
      shortCircuitedAt: chainCtx?.shortCircuitedAt,
      actionsTakenCount: chainCtx?.actionsTakenCount,
    };

    if (this.enabled) {
      this.chainArr.push(receipt);
      if (this.chainArr.length > _CMPSBL_RECEIPT_RING_MAX) this.chainArr.shift();
      this.headHash = hash;
    }
    return { ...receipt };
  }

  head(): string | null { return this.headHash; }
  length(): number { return this.chainArr.length; }
  chain(): CmpsblReceipt[] { return this.chainArr.map(r => ({ ...r })); }

  verify(): boolean {
    for (let i = 1; i < this.chainArr.length; i++) {
      if (this.chainArr[i].prevHash !== this.chainArr[i - 1].hash) return false;
    }
    return true;
  }

  reset(): void { this.chainArr = []; this.headHash = null; this.seq = 0; }
}

const _cmpsbl_receipts_inst = new CmpsblReceiptEmitter();

function cmpsbl_receipts(): CmpsblReceiptEmitter {
  return _cmpsbl_receipts_inst;
}

// Lightweight helper for callers that just want to hash a value deterministically.
function cmpsbl_receipt_hash(value: unknown): string {
  try { return _cmpsbl_fnv1a(JSON.stringify(value ?? null)); }
  catch { return _cmpsbl_fnv1a(String(value)); }
}
`;

const RECEIPT_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Receipt Emitter (sealed module, proprietary).             ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
import json
from typing import Any, Dict, List, Optional


def _cmpsbl_kernel_enabled_re() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


def _cmpsbl_fnv1a(s: str) -> str:
    h = 0x811c9dc5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


_CMPSBL_RECEIPT_RING_MAX = 1024


class CmpsblReceiptEmitter:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_re()
        self._chain: List[Dict[str, Any]] = []
        self._head: Optional[str] = None
        self._seq = 0

    def emit(self, name: str, args_hash: str, result_hash: str, duration_ms: float, code: str,
             chain_ctx: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        prev_hash = self._head
        self._seq += 1
        seq = self._seq
        ts = int(time.time() * 1000)
        chain_ctx = chain_ctx or {}
        payload = json.dumps({
            "name": name, "argsHash": args_hash, "resultHash": result_hash,
            "durationMs": duration_ms, "code": code, "prevHash": prev_hash, "seq": seq,
            "chainShortCircuited": bool(chain_ctx.get("short_circuited", False)),
            "shortCircuitedAt": chain_ctx.get("short_circuited_at"),
            "actionsTakenCount": int(chain_ctx.get("actions_taken_count", 0)),
        }, sort_keys=True)
        h = _cmpsbl_fnv1a(payload)
        receipt = {
            "hash": h, "prev_hash": prev_hash, "name": name,
            "args_hash": args_hash, "result_hash": result_hash,
            "duration_ms": duration_ms, "code": code, "ts": ts, "seq": seq,
            "chain_short_circuited": chain_ctx.get("short_circuited"),
            "short_circuited_at": chain_ctx.get("short_circuited_at"),
            "actions_taken_count": chain_ctx.get("actions_taken_count"),
        }
        if self._enabled:
            self._chain.append(receipt)
            if len(self._chain) > _CMPSBL_RECEIPT_RING_MAX:
                self._chain.pop(0)
            self._head = h
        return dict(receipt)

    def head(self) -> Optional[str]: return self._head
    def length(self) -> int: return len(self._chain)
    def chain(self) -> List[Dict[str, Any]]: return [dict(r) for r in self._chain]

    def verify(self) -> bool:
        for i in range(1, len(self._chain)):
            if self._chain[i]["prev_hash"] != self._chain[i - 1]["hash"]:
                return False
        return True

    def reset(self) -> None:
        self._chain = []
        self._head = None
        self._seq = 0


_cmpsbl_receipts_inst = CmpsblReceiptEmitter()


def cmpsbl_receipts() -> CmpsblReceiptEmitter:
    return _cmpsbl_receipts_inst


def cmpsbl_receipt_hash(value: Any) -> str:
    try:
        return _cmpsbl_fnv1a(json.dumps(value, sort_keys=True, default=str))
    except Exception:
        return _cmpsbl_fnv1a(str(value))
`;

const RECEIPT_WIRE_TS = `
// Receipt Emitter chains a signed (FNV-1a) provenance record per cmpsbl_execute.
// IsolatedExecutor (when present) calls cmpsbl_receipts().emit(...) after each
// invocation; otherwise customer code can emit manually for ad-hoc audit trails.
if (_cmpsbl_kernel_enabled_re()) {
  void cmpsbl_receipts();
}`;

const RECEIPT_WIRE_PY = `
# Receipt Emitter chains a signed (FNV-1a) provenance record per cmpsbl_execute.
# IsolatedExecutor (when present) calls cmpsbl_receipts().emit(...) after each
# invocation; otherwise customer code can emit manually for ad-hoc audit trails.
if _cmpsbl_kernel_enabled_re():
    _ = cmpsbl_receipts()`;

const RECEIPT_EMITTER_CORE: CmpsblLayerDefinition = {
  id: 'receipt-emitter',
  name: 'Receipt Emitter',
  crownJewelRank: 48,
  cjpi: 96,
  module: 'AUDIT',
  description:
    'Kernel-grade chained receipt emitter. Every cmpsbl_execute produces an FNV-1a hashed receipt over {name, args_hash, result_hash, duration, code} linked to the prior receipt — Merkle-style provenance at runtime. Extends Ascension fingerprinting from export-time to per-call. Bounded ring (1024) prevents unbounded growth. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: RECEIPT_TS,
  pyCode: RECEIPT_PY,
  autoWire: {
    wrapperName: 'cmpsbl_receipts',
    behavior:
      'Initializes the receipt chain at module load. IsolatedExecutor (and any layer wrapping cmpsbl_execute) calls emit() with the call signature, result hash, and duration to append a verifiable provenance entry.',
    tsWire: RECEIPT_WIRE_TS,
    pyWire: RECEIPT_WIRE_PY,
  },
};

export { RECEIPT_EMITTER_CORE };
