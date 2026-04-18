/**
 * CMPSBL® Always-On Core — Backpressure Governor (Kernel Component #17)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Bounded per-contract concurrent-call governor. Sheds load BEFORE quarantine
 * fires. Each contract declares maxConcurrent + maxQueueDepth. Calls beyond
 * capacity are rejected with a verdict (queue full); admitted calls increment
 * a live counter that release() decrements.
 *
 * Pairs with Saturation Metrics — saturation observed feeds the breaker / budget.
 * Bounded shed log (256). Counters are integer maps keyed by contract name.
 *
 * Module: GOVERNANCE  ·  CJPI: 94  ·  Crown Jewel #57
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const BACKPRESSURE_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Backpressure Governor (sealed module, proprietary).       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblBackpressureLimits {
  maxConcurrent?: number;   // simultaneous in-flight calls (default 64)
  maxQueueDepth?: number;   // queued waiters before shed (default 128)
}

interface CmpsblBackpressureVerdict {
  admitted: boolean;
  reason: string | null;
  inFlight: number;
  queued: number;
}

interface CmpsblShedRecord {
  name: string;
  reason: 'concurrency-exceeded' | 'queue-full';
  ts: number;
}

function _cmpsbl_kernel_enabled_bp(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_BP_SHED_LOG_MAX = 256;
const _CMPSBL_BP_DEFAULTS: Required<CmpsblBackpressureLimits> = {
  maxConcurrent: 64,
  maxQueueDepth: 128,
};

interface _BPEntry {
  limits: Required<CmpsblBackpressureLimits>;
  inFlight: number;
  queued: number;
  totalAdmitted: number;
  totalShed: number;
}

class CmpsblBackpressureGovernor {
  private entries: Map<string, _BPEntry> = new Map();
  private shedLog: CmpsblShedRecord[] = [];
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_bp(); }

  declare(name: string, limits: CmpsblBackpressureLimits = {}): void {
    if (!this.enabled) return;
    this.entries.set(name, {
      limits: { ..._CMPSBL_BP_DEFAULTS, ...limits },
      inFlight: 0, queued: 0, totalAdmitted: 0, totalShed: 0,
    });
  }

  /** Pre-dispatch admission. Increments inFlight when admitted. */
  admit(name: string): CmpsblBackpressureVerdict {
    if (!this.enabled) return { admitted: true, reason: null, inFlight: 0, queued: 0 };
    const e = this.entries.get(name);
    if (!e) return { admitted: true, reason: null, inFlight: 0, queued: 0 };
    if (e.inFlight >= e.limits.maxConcurrent) {
      if (e.queued >= e.limits.maxQueueDepth) {
        this._shed(name, 'queue-full');
        e.totalShed += 1;
        return { admitted: false, reason: 'queue-full', inFlight: e.inFlight, queued: e.queued };
      }
      this._shed(name, 'concurrency-exceeded');
      e.totalShed += 1;
      return { admitted: false, reason: 'concurrency-exceeded',
               inFlight: e.inFlight, queued: e.queued };
    }
    e.inFlight += 1;
    e.totalAdmitted += 1;
    return { admitted: true, reason: null, inFlight: e.inFlight, queued: e.queued };
  }

  release(name: string): void {
    if (!this.enabled) return;
    const e = this.entries.get(name);
    if (!e) return;
    e.inFlight = Math.max(0, e.inFlight - 1);
  }

  private _shed(name: string, reason: 'concurrency-exceeded' | 'queue-full'): void {
    this.shedLog.push({ name, reason, ts: Date.now() });
    if (this.shedLog.length > _CMPSBL_BP_SHED_LOG_MAX) this.shedLog.shift();
  }

  inFlightFor(name: string): number { return this.entries.get(name)?.inFlight ?? 0; }
  saturation(name: string): number {
    const e = this.entries.get(name);
    if (!e) return 0;
    return e.inFlight / e.limits.maxConcurrent;
  }
  shedCount(name: string): number { return this.entries.get(name)?.totalShed ?? 0; }
  declaredAll(): Array<{ name: string; inFlight: number; saturation: number; shed: number }> {
    return [...this.entries.entries()].map(([name, e]) => ({
      name, inFlight: e.inFlight, saturation: e.inFlight / e.limits.maxConcurrent,
      shed: e.totalShed,
    }));
  }
  recentSheds(n: number = 50): CmpsblShedRecord[] {
    return this.shedLog.slice(-n).map(r => ({ ...r }));
  }
  reset(): void { this.entries.clear(); this.shedLog = []; }
}

const _cmpsbl_backpressure_inst = new CmpsblBackpressureGovernor();

function cmpsbl_backpressure(): CmpsblBackpressureGovernor {
  return _cmpsbl_backpressure_inst;
}
`;

const BACKPRESSURE_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Backpressure Governor (sealed module, proprietary).       ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
from typing import Dict, List, Optional


def _cmpsbl_kernel_enabled_bp() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_BP_SHED_LOG_MAX = 256
_CMPSBL_BP_DEFAULTS = {"maxConcurrent": 64, "maxQueueDepth": 128}


class CmpsblBackpressureGovernor:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_bp()
        self._entries: Dict[str, Dict[str, object]] = {}
        self._shed_log: List[Dict[str, object]] = []

    def declare(self, name: str, limits: Optional[Dict[str, int]] = None) -> None:
        if not self._enabled:
            return
        lim = dict(_CMPSBL_BP_DEFAULTS)
        if limits:
            lim.update(limits)
        self._entries[name] = {
            "limits": lim, "inFlight": 0, "queued": 0,
            "totalAdmitted": 0, "totalShed": 0,
        }

    def admit(self, name: str) -> Dict[str, object]:
        if not self._enabled:
            return {"admitted": True, "reason": None, "inFlight": 0, "queued": 0}
        e = self._entries.get(name)
        if not e:
            return {"admitted": True, "reason": None, "inFlight": 0, "queued": 0}
        if int(e["inFlight"]) >= e["limits"]["maxConcurrent"]:
            if int(e["queued"]) >= e["limits"]["maxQueueDepth"]:
                self._shed(name, "queue-full")
                e["totalShed"] = int(e["totalShed"]) + 1
                return {"admitted": False, "reason": "queue-full",
                        "inFlight": e["inFlight"], "queued": e["queued"]}
            self._shed(name, "concurrency-exceeded")
            e["totalShed"] = int(e["totalShed"]) + 1
            return {"admitted": False, "reason": "concurrency-exceeded",
                    "inFlight": e["inFlight"], "queued": e["queued"]}
        e["inFlight"] = int(e["inFlight"]) + 1
        e["totalAdmitted"] = int(e["totalAdmitted"]) + 1
        return {"admitted": True, "reason": None,
                "inFlight": e["inFlight"], "queued": e["queued"]}

    def release(self, name: str) -> None:
        if not self._enabled:
            return
        e = self._entries.get(name)
        if not e:
            return
        e["inFlight"] = max(0, int(e["inFlight"]) - 1)

    def _shed(self, name: str, reason: str) -> None:
        self._shed_log.append({"name": name, "reason": reason,
                               "ts": int(time.time() * 1000)})
        if len(self._shed_log) > _CMPSBL_BP_SHED_LOG_MAX:
            self._shed_log.pop(0)

    def in_flight_for(self, name: str) -> int:
        e = self._entries.get(name)
        return int(e["inFlight"]) if e else 0

    def saturation(self, name: str) -> float:
        e = self._entries.get(name)
        if not e:
            return 0.0
        return int(e["inFlight"]) / e["limits"]["maxConcurrent"]

    def shed_count(self, name: str) -> int:
        e = self._entries.get(name)
        return int(e["totalShed"]) if e else 0

    def declared_all(self) -> List[Dict[str, object]]:
        out = []
        for n, e in self._entries.items():
            out.append({
                "name": n, "inFlight": e["inFlight"],
                "saturation": int(e["inFlight"]) / e["limits"]["maxConcurrent"],
                "shed": e["totalShed"],
            })
        return out

    def recent_sheds(self, n: int = 50) -> List[Dict[str, object]]:
        return [dict(r) for r in self._shed_log[-n:]]

    def reset(self) -> None:
        self._entries.clear()
        self._shed_log = []


_cmpsbl_backpressure_inst = CmpsblBackpressureGovernor()


def cmpsbl_backpressure() -> CmpsblBackpressureGovernor:
    return _cmpsbl_backpressure_inst
`;

const BACKPRESSURE_WIRE_TS = `
// Backpressure Governor — bounded per-contract concurrency control. Use
// cmpsbl_backpressure().declare(name, { maxConcurrent, maxQueueDepth }).
// IsolatedExecutor calls admit(name) before dispatch and release(name) after.
// Rejected calls return { admitted: false, reason }; saturation feeds the
// breaker + budget. Sheds load BEFORE quarantine fires.
if (_cmpsbl_kernel_enabled_bp()) {
  void cmpsbl_backpressure();
}`;

const BACKPRESSURE_WIRE_PY = `
# Backpressure Governor — bounded per-contract concurrency control. Use
# cmpsbl_backpressure().declare(name, {"maxConcurrent": N, "maxQueueDepth": K}).
# IsolatedExecutor calls admit(name) before dispatch and release(name) after.
# Rejected calls return {"admitted": False, "reason": ...}; saturation feeds
# the breaker + budget. Sheds load BEFORE quarantine fires.
if _cmpsbl_kernel_enabled_bp():
    _ = cmpsbl_backpressure()`;

const BACKPRESSURE_GOVERNOR_CORE: CmpsblLayerDefinition = {
  id: 'backpressure-governor',
  name: 'Backpressure Governor',
  crownJewelRank: 57,
  cjpi: 94,
  module: 'GOVERNANCE',
  description:
    'Per-contract concurrent-call governor. Each contract declares maxConcurrent + maxQueueDepth; calls beyond capacity are shed before reaching dispatch. Prevents cascade failures under burst load. Pairs with Saturation Metrics: saturation feedback informs the breaker and budget. Bounded shed log (256). Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: BACKPRESSURE_TS,
  pyCode: BACKPRESSURE_PY,
  autoWire: {
    wrapperName: 'cmpsbl_backpressure',
    behavior:
      'Initializes the backpressure registry at module load. Layer code calls declare(name, limits); IsolatedExecutor wraps dispatch with admit()/release(). Saturation metrics expose live load to dashboards and the BEACON signal layer.',
    tsWire: BACKPRESSURE_WIRE_TS,
    pyWire: BACKPRESSURE_WIRE_PY,
  },
};

export { BACKPRESSURE_GOVERNOR_CORE };
