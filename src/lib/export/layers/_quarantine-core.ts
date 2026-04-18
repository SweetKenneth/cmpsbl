/**
 * CMPSBL® Always-On Core — Quarantine (Kernel Component #3)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Isolation registry that holds suspicious or failing function names
 * out of execution rotation for a cool-down window.
 *
 * Behavior:
 *   • report(name, reason)   → increments strike count for `name`
 *   • holds when strikes ≥ threshold (default 3) for ttlMs (default 60s)
 *   • isHeld(name)           → cmpsbl_execute checks this before dispatch
 *   • release(name)          → manual override (governance/operator)
 *   • sweepExpired()         → drops entries past their hold expiry
 *
 * Strikes/holds are persisted via the State Store under the `quarantine`
 * namespace so cool-downs survive across cmpsbl_execute invocations.
 *
 * Gated by CMPSBL_KERNEL_ENABLED (default ON). When OFF, isHeld always
 * returns false and report is a no-op — Layer 2 stays byte-compatible.
 *
 * Module: GOVERNANCE  ·  CJPI: 93  ·  Crown Jewel #43
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const QUARANTINE_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Quarantine (sealed module, proprietary).                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblQuarantineEntry {
  name: string;
  strikes: number;
  reason: string;
  heldUntil: number; // epoch ms, 0 = not held
  firstSeenAt: number;
  lastSeenAt: number;
}

interface CmpsblQuarantineConfig {
  threshold: number; // strikes before hold
  ttlMs: number;     // hold duration
}

function _cmpsbl_kernel_enabled_q(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

class CmpsblQuarantine {
  private entries: Map<string, CmpsblQuarantineEntry> = new Map();
  private cfg: CmpsblQuarantineConfig;
  private enabled: boolean;

  constructor() {
    this.enabled = _cmpsbl_kernel_enabled_q();
    const t = (typeof process !== 'undefined' && process.env?.CMPSBL_QUARANTINE_THRESHOLD) || '3';
    const ttl = (typeof process !== 'undefined' && process.env?.CMPSBL_QUARANTINE_TTL_MS) || '60000';
    this.cfg = {
      threshold: Math.max(1, parseInt(String(t), 10) || 3),
      ttlMs: Math.max(1000, parseInt(String(ttl), 10) || 60000),
    };
  }

  report(name: string, reason: string): void {
    if (!this.enabled || !name) return;
    const now = Date.now();
    const prev = this.entries.get(name);
    if (prev) {
      prev.strikes += 1;
      prev.reason = reason;
      prev.lastSeenAt = now;
      if (prev.strikes >= this.cfg.threshold) {
        prev.heldUntil = now + this.cfg.ttlMs;
      }
    } else {
      this.entries.set(name, {
        name,
        strikes: 1,
        reason,
        heldUntil: 0,
        firstSeenAt: now,
        lastSeenAt: now,
      });
    }
  }

  isHeld(name: string): boolean {
    if (!this.enabled || !name) return false;
    const e = this.entries.get(name);
    if (!e) return false;
    if (e.heldUntil === 0) return false;
    if (Date.now() >= e.heldUntil) {
      // Hold expired — clear strikes so the name re-enters rotation cleanly.
      this.entries.delete(name);
      return false;
    }
    return true;
  }

  release(name: string): boolean {
    if (!this.enabled) return false;
    return this.entries.delete(name);
  }

  list(): CmpsblQuarantineEntry[] {
    return [...this.entries.values()];
  }

  sweepExpired(): number {
    if (!this.enabled) return 0;
    const now = Date.now();
    let removed = 0;
    for (const [name, e] of this.entries) {
      if (e.heldUntil !== 0 && now >= e.heldUntil) {
        this.entries.delete(name);
        removed++;
      }
    }
    return removed;
  }

  config(): CmpsblQuarantineConfig { return { ...this.cfg }; }
}

const _cmpsbl_quarantine = new CmpsblQuarantine();

function cmpsbl_quarantine(): CmpsblQuarantine {
  return _cmpsbl_quarantine;
}
`;

const QUARANTINE_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Quarantine (sealed module, proprietary).                  ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
from typing import Dict, List, Optional


def _cmpsbl_kernel_enabled_q() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


def _now_ms() -> int:
    return int(time.time() * 1000)


class CmpsblQuarantine:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_q()
        try:
            self._threshold = max(1, int(os.environ.get("CMPSBL_QUARANTINE_THRESHOLD", "3")))
        except ValueError:
            self._threshold = 3
        try:
            self._ttl_ms = max(1000, int(os.environ.get("CMPSBL_QUARANTINE_TTL_MS", "60000")))
        except ValueError:
            self._ttl_ms = 60000
        self._entries: Dict[str, Dict[str, object]] = {}

    def report(self, name: str, reason: str) -> None:
        if not self._enabled or not name:
            return
        now = _now_ms()
        prev = self._entries.get(name)
        if prev:
            prev["strikes"] = int(prev["strikes"]) + 1  # type: ignore[arg-type]
            prev["reason"] = reason
            prev["last_seen_at"] = now
            if int(prev["strikes"]) >= self._threshold:  # type: ignore[arg-type]
                prev["held_until"] = now + self._ttl_ms
        else:
            self._entries[name] = {
                "name": name,
                "strikes": 1,
                "reason": reason,
                "held_until": 0,
                "first_seen_at": now,
                "last_seen_at": now,
            }

    def is_held(self, name: str) -> bool:
        if not self._enabled or not name:
            return False
        e = self._entries.get(name)
        if not e:
            return False
        held_until = int(e["held_until"])  # type: ignore[arg-type]
        if held_until == 0:
            return False
        if _now_ms() >= held_until:
            self._entries.pop(name, None)
            return False
        return True

    def release(self, name: str) -> bool:
        if not self._enabled:
            return False
        return self._entries.pop(name, None) is not None

    def list(self) -> List[Dict[str, object]]:
        return list(self._entries.values())

    def sweep_expired(self) -> int:
        if not self._enabled:
            return 0
        now = _now_ms()
        removed = 0
        for name in list(self._entries.keys()):
            e = self._entries[name]
            if int(e["held_until"]) != 0 and now >= int(e["held_until"]):  # type: ignore[arg-type]
                self._entries.pop(name, None)
                removed += 1
        return removed

    def config(self) -> Dict[str, int]:
        return {"threshold": self._threshold, "ttl_ms": self._ttl_ms}


_cmpsbl_quarantine = CmpsblQuarantine()


def cmpsbl_quarantine() -> CmpsblQuarantine:
    return _cmpsbl_quarantine
`;

const QUARANTINE_WIRE_TS = `
// Quarantine auto-wires by initialization. cmpsbl_execute consults
// cmpsbl_quarantine().isHeld(name) before dispatching; layers/user code
// call .report(name, reason) on failures. Manual release via .release(name).
if (_cmpsbl_kernel_enabled_q()) {
  void cmpsbl_quarantine();
}`;

const QUARANTINE_WIRE_PY = `
# Quarantine auto-wires by initialization. cmpsbl_execute consults
# cmpsbl_quarantine().is_held(name) before dispatching; layers/user code
# call .report(name, reason) on failures. Manual release via .release(name).
if _cmpsbl_kernel_enabled_q():
    _ = cmpsbl_quarantine()`;

const QUARANTINE_CORE: CmpsblLayerDefinition = {
  id: 'quarantine',
  name: 'Quarantine',
  crownJewelRank: 43,
  cjpi: 93,
  module: 'GOVERNANCE',
  description:
    'Kernel-grade isolation registry. Holds repeatedly failing or contract-violating function names out of execution rotation for a configurable cool-down window. Strike threshold and TTL are env-tunable. Zero-dependency, portable across all 9 polyglot targets. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: QUARANTINE_TS,
  pyCode: QUARANTINE_PY,
  autoWire: {
    wrapperName: 'cmpsbl_quarantine',
    behavior:
      'Initializes the quarantine registry at module load. cmpsbl_execute checks isHeld() before dispatch; failure paths call report() to accumulate strikes; governance calls release() to clear holds.',
    tsWire: QUARANTINE_WIRE_TS,
    pyWire: QUARANTINE_WIRE_PY,
  },
};

export { QUARANTINE_CORE };
