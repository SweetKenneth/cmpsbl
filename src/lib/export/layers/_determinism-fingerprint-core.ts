/**
 * CMPSBL® Always-On Core — Determinism Fingerprint (Kernel Component #18)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FNV-1a hash of (canonical args + env hint + contract version) → expected
 * output hash mapping. Detects non-determinism: hidden Date.now()/Math.random()
 * leaks, env drift, undeclared inputs. Records divergence when same fingerprint
 * yields different output hashes.
 *
 * Bounded fingerprint table (512 unique fingerprints) + bounded divergence
 * log (256). Self-evicting LRU on table overflow. Stable canonical JSON
 * serialization for input hashing.
 *
 * Module: GOVERNANCE  ·  CJPI: 93  ·  Crown Jewel #58
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const FINGERPRINT_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Determinism Fingerprint (sealed module, proprietary).     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblDivergence {
  name: string;
  fingerprint: string;
  expectedHash: string;
  actualHash: string;
  ts: number;
}

function _cmpsbl_kernel_enabled_df(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_FP_TABLE_MAX = 512;
const _CMPSBL_FP_DIVERGENCE_MAX = 256;

function _cmpsbl_fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function _cmpsbl_canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(_cmpsbl_canonical).join(',') + ']';
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return '{' + keys.map(k =>
    JSON.stringify(k) + ':' + _cmpsbl_canonical((value as Record<string, unknown>)[k])
  ).join(',') + '}';
}

class CmpsblDeterminismFingerprint {
  private table: Map<string, { hash: string; hits: number; lastSeen: number }> = new Map();
  private divergences: CmpsblDivergence[] = [];
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_df(); }

  /** Compute fingerprint of (name + args + version + envHint). */
  fingerprint(name: string, args: unknown, version: string = '1', envHint: string = ''): string {
    const payload = name + '|' + version + '|' + envHint + '|' + _cmpsbl_canonical(args);
    return _cmpsbl_fnv1a(payload);
  }

  /** Hash an output value (canonical form). */
  hashOutput(output: unknown): string {
    return _cmpsbl_fnv1a(_cmpsbl_canonical(output));
  }

  /** Record fingerprint→output mapping. Returns true if divergence detected. */
  observe(name: string, fingerprint: string, outputHash: string): boolean {
    if (!this.enabled) return false;
    const existing = this.table.get(fingerprint);
    if (!existing) {
      if (this.table.size >= _CMPSBL_FP_TABLE_MAX) this._evictOldest();
      this.table.set(fingerprint, { hash: outputHash, hits: 1, lastSeen: Date.now() });
      return false;
    }
    existing.hits += 1;
    existing.lastSeen = Date.now();
    if (existing.hash !== outputHash) {
      this.divergences.push({
        name, fingerprint, expectedHash: existing.hash,
        actualHash: outputHash, ts: Date.now(),
      });
      if (this.divergences.length > _CMPSBL_FP_DIVERGENCE_MAX) this.divergences.shift();
      return true;
    }
    return false;
  }

  private _evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTs = Infinity;
    for (const [k, v] of this.table) {
      if (v.lastSeen < oldestTs) { oldestTs = v.lastSeen; oldestKey = k; }
    }
    if (oldestKey) this.table.delete(oldestKey);
  }

  divergencesFor(name: string): CmpsblDivergence[] {
    return this.divergences.filter(d => d.name === name).map(d => ({ ...d }));
  }
  allDivergences(): CmpsblDivergence[] { return this.divergences.map(d => ({ ...d })); }
  divergenceCount(): number { return this.divergences.length; }
  fingerprintCount(): number { return this.table.size; }
  reset(): void { this.table.clear(); this.divergences = []; }
}

const _cmpsbl_fingerprint_inst = new CmpsblDeterminismFingerprint();

function cmpsbl_fingerprint(): CmpsblDeterminismFingerprint {
  return _cmpsbl_fingerprint_inst;
}
`;

const FINGERPRINT_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Determinism Fingerprint (sealed module, proprietary).     ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import json
import time
from typing import Any, Dict, List


def _cmpsbl_kernel_enabled_df() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_FP_TABLE_MAX = 512
_CMPSBL_FP_DIVERGENCE_MAX = 256


def _cmpsbl_fnv1a(s: str) -> str:
    h = 0x811c9dc5
    for ch in s:
        h ^= ord(ch)
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) & 0xffffffff
    return format(h, "08x")


def _cmpsbl_canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


class CmpsblDeterminismFingerprint:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_df()
        self._table: Dict[str, Dict[str, object]] = {}
        self._divergences: List[Dict[str, object]] = []

    def fingerprint(self, name: str, args: Any, version: str = "1", env_hint: str = "") -> str:
        payload = f"{name}|{version}|{env_hint}|{_cmpsbl_canonical(args)}"
        return _cmpsbl_fnv1a(payload)

    def hash_output(self, output: Any) -> str:
        return _cmpsbl_fnv1a(_cmpsbl_canonical(output))

    def observe(self, name: str, fingerprint: str, output_hash: str) -> bool:
        if not self._enabled:
            return False
        existing = self._table.get(fingerprint)
        now = int(time.time() * 1000)
        if not existing:
            if len(self._table) >= _CMPSBL_FP_TABLE_MAX:
                self._evict_oldest()
            self._table[fingerprint] = {"hash": output_hash, "hits": 1, "lastSeen": now}
            return False
        existing["hits"] = int(existing["hits"]) + 1
        existing["lastSeen"] = now
        if existing["hash"] != output_hash:
            self._divergences.append({
                "name": name, "fingerprint": fingerprint,
                "expectedHash": existing["hash"], "actualHash": output_hash, "ts": now,
            })
            if len(self._divergences) > _CMPSBL_FP_DIVERGENCE_MAX:
                self._divergences.pop(0)
            return True
        return False

    def _evict_oldest(self) -> None:
        if not self._table:
            return
        oldest_k = min(self._table, key=lambda k: int(self._table[k]["lastSeen"]))
        del self._table[oldest_k]

    def divergences_for(self, name: str) -> List[Dict[str, object]]:
        return [dict(d) for d in self._divergences if d["name"] == name]

    def all_divergences(self) -> List[Dict[str, object]]:
        return [dict(d) for d in self._divergences]

    def divergence_count(self) -> int:
        return len(self._divergences)

    def fingerprint_count(self) -> int:
        return len(self._table)

    def reset(self) -> None:
        self._table.clear()
        self._divergences = []


_cmpsbl_fingerprint_inst = CmpsblDeterminismFingerprint()


def cmpsbl_fingerprint() -> CmpsblDeterminismFingerprint:
    return _cmpsbl_fingerprint_inst
`;

const FINGERPRINT_WIRE_TS = `
// Determinism Fingerprint — hash (args + env + version) → expected output hash.
// IsolatedExecutor calls cmpsbl_fingerprint().fingerprint(name, args, version)
// before dispatch, then observe(name, fp, hashOutput(result)) after. Divergence
// (same fingerprint, different output) reveals hidden non-determinism: Date.now,
// Math.random, env drift. LRU table (512), bounded divergence log (256).
if (_cmpsbl_kernel_enabled_df()) {
  void cmpsbl_fingerprint();
}`;

const FINGERPRINT_WIRE_PY = `
# Determinism Fingerprint — hash (args + env + version) → expected output hash.
# IsolatedExecutor calls cmpsbl_fingerprint().fingerprint(name, args, version)
# before dispatch, then observe(name, fp, hash_output(result)) after. Divergence
# (same fingerprint, different output) reveals hidden non-determinism: time.time,
# random, env drift. LRU table (512), bounded divergence log (256).
if _cmpsbl_kernel_enabled_df():
    _ = cmpsbl_fingerprint()`;

const DETERMINISM_FINGERPRINT_CORE: CmpsblLayerDefinition = {
  id: 'determinism-fingerprint',
  name: 'Determinism Fingerprint',
  crownJewelRank: 58,
  cjpi: 93,
  module: 'GOVERNANCE',
  description:
    'FNV-1a fingerprint of (canonical args + env hint + contract version) mapped to expected output hash. Detects hidden non-determinism: undeclared time/random reads, env drift, missing inputs. LRU-bounded fingerprint table (512), bounded divergence log (256). Pairs with Shadow Execution and Replay Log to surface intermittent bugs. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: FINGERPRINT_TS,
  pyCode: FINGERPRINT_PY,
  autoWire: {
    wrapperName: 'cmpsbl_fingerprint',
    behavior:
      'Initializes the fingerprint table at module load. Layer code calls fingerprint(name, args, version) → fp; after dispatch, observe(name, fp, hashOutput(result)) records the mapping. Divergence is auto-logged for downstream analysis by the BEACON signal layer.',
    tsWire: FINGERPRINT_WIRE_TS,
    pyWire: FINGERPRINT_WIRE_PY,
  },
};

export { DETERMINISM_FINGERPRINT_CORE };
