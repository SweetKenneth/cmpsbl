/**
 * CMPSBL® Always-On Core — Resource Budget Gate (Kernel Component #13)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Per-call budget enforcement: max wall-time (ms), max memory hint (bytes),
 * max recursion depth. Budgets are checked BEFORE dispatch and observed
 * AFTER execution. A breach increments a strike counter; once a function
 * accumulates strikes >= threshold, the gate signals Quarantine to seal it.
 *
 * This pairs with the existing Quarantine kernel — budget breach = strike,
 * strike accumulation = quarantine. The gate itself is non-blocking on
 * pre-check (returns a verdict); callers (IsolatedExecutor) decide whether
 * to abort or proceed. Recursion depth is tracked via a per-name counter
 * incremented on enter() and decremented on exit().
 *
 * Module: GOVERNANCE  ·  CJPI: 96  ·  Crown Jewel #53
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const BUDGET_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Resource Budget Gate (sealed module, proprietary).        ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblBudget {
  maxWallMs?: number;
  maxMemoryBytes?: number;
  maxDepth?: number;
}

interface CmpsblBudgetVerdict {
  allowed: boolean;
  reason: string | null;
  strikes: number;
}

interface CmpsblBudgetBreach {
  name: string;
  kind: 'wall-time' | 'memory' | 'depth';
  observed: number;
  limit: number;
  ts: number;
}

function _cmpsbl_kernel_enabled_bg(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_BUDGET_BREACH_MAX = 256;
const _CMPSBL_BUDGET_STRIKE_THRESHOLD = 3;

class CmpsblBudgetGate {
  private budgets: Map<string, CmpsblBudget> = new Map();
  private depth: Map<string, number> = new Map();
  private strikes: Map<string, number> = new Map();
  private breaches: CmpsblBudgetBreach[] = [];
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_bg(); }

  declare(name: string, budget: CmpsblBudget): void {
    if (!this.enabled) return;
    this.budgets.set(name, { ...budget });
  }

  budgetFor(name: string): CmpsblBudget | null {
    return this.budgets.get(name) ?? null;
  }

  /** Pre-dispatch gate. Increments depth counter when allowed=true. Caller MUST exit(). */
  enter(name: string): CmpsblBudgetVerdict {
    if (!this.enabled) return { allowed: true, reason: null, strikes: 0 };
    const b = this.budgets.get(name);
    const cur = this.depth.get(name) ?? 0;
    if (b?.maxDepth != null && cur >= b.maxDepth) {
      this._strike(name, 'depth', cur + 1, b.maxDepth);
      return { allowed: false, reason: 'depth-exceeded', strikes: this.strikes.get(name) ?? 0 };
    }
    this.depth.set(name, cur + 1);
    return { allowed: true, reason: null, strikes: this.strikes.get(name) ?? 0 };
  }

  /** Post-dispatch observation. wallMs is required; memBytes optional. */
  exit(name: string, wallMs: number, memBytes?: number): CmpsblBudgetVerdict {
    if (!this.enabled) return { allowed: true, reason: null, strikes: 0 };
    const cur = this.depth.get(name) ?? 1;
    this.depth.set(name, Math.max(0, cur - 1));
    const b = this.budgets.get(name);
    if (!b) return { allowed: true, reason: null, strikes: this.strikes.get(name) ?? 0 };
    let reason: string | null = null;
    if (b.maxWallMs != null && wallMs > b.maxWallMs) {
      this._strike(name, 'wall-time', wallMs, b.maxWallMs);
      reason = 'wall-time-exceeded';
    }
    if (memBytes != null && b.maxMemoryBytes != null && memBytes > b.maxMemoryBytes) {
      this._strike(name, 'memory', memBytes, b.maxMemoryBytes);
      reason = reason ? reason + '+memory-exceeded' : 'memory-exceeded';
    }
    return { allowed: reason == null, reason, strikes: this.strikes.get(name) ?? 0 };
  }

  private _strike(name: string, kind: 'wall-time' | 'memory' | 'depth', observed: number, limit: number): void {
    const next = (this.strikes.get(name) ?? 0) + 1;
    this.strikes.set(name, next);
    this.breaches.push({ name, kind, observed, limit, ts: Date.now() });
    if (this.breaches.length > _CMPSBL_BUDGET_BREACH_MAX) this.breaches.shift();
  }

  shouldQuarantine(name: string): boolean {
    return (this.strikes.get(name) ?? 0) >= _CMPSBL_BUDGET_STRIKE_THRESHOLD;
  }

  strikesFor(name: string): number { return this.strikes.get(name) ?? 0; }
  clearStrikes(name: string): void { this.strikes.delete(name); }
  breachesFor(name: string): CmpsblBudgetBreach[] {
    return this.breaches.filter(b => b.name === name).map(b => ({ ...b }));
  }
  allBreaches(): CmpsblBudgetBreach[] { return this.breaches.map(b => ({ ...b })); }
  declaredAll(): Array<{ name: string; budget: CmpsblBudget }> {
    return [...this.budgets.entries()].map(([name, budget]) => ({ name, budget: { ...budget } }));
  }
  reset(): void {
    this.budgets.clear(); this.depth.clear(); this.strikes.clear(); this.breaches = [];
  }
}

const _cmpsbl_budget_inst = new CmpsblBudgetGate();

function cmpsbl_budget(): CmpsblBudgetGate {
  return _cmpsbl_budget_inst;
}
`;

const BUDGET_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Resource Budget Gate (sealed module, proprietary).        ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
from typing import Dict, List, Optional


def _cmpsbl_kernel_enabled_bg() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_BUDGET_BREACH_MAX = 256
_CMPSBL_BUDGET_STRIKE_THRESHOLD = 3


class CmpsblBudgetGate:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_bg()
        self._budgets: Dict[str, Dict[str, int]] = {}
        self._depth: Dict[str, int] = {}
        self._strikes: Dict[str, int] = {}
        self._breaches: List[Dict[str, object]] = []

    def declare(self, name: str, budget: Dict[str, int]) -> None:
        if not self._enabled:
            return
        self._budgets[name] = dict(budget)

    def budget_for(self, name: str) -> Optional[Dict[str, int]]:
        b = self._budgets.get(name)
        return dict(b) if b else None

    def enter(self, name: str) -> Dict[str, object]:
        if not self._enabled:
            return {"allowed": True, "reason": None, "strikes": 0}
        b = self._budgets.get(name)
        cur = self._depth.get(name, 0)
        if b and "maxDepth" in b and cur >= b["maxDepth"]:
            self._strike(name, "depth", cur + 1, b["maxDepth"])
            return {"allowed": False, "reason": "depth-exceeded",
                    "strikes": self._strikes.get(name, 0)}
        self._depth[name] = cur + 1
        return {"allowed": True, "reason": None, "strikes": self._strikes.get(name, 0)}

    def exit(self, name: str, wall_ms: float, mem_bytes: Optional[int] = None) -> Dict[str, object]:
        if not self._enabled:
            return {"allowed": True, "reason": None, "strikes": 0}
        cur = self._depth.get(name, 1)
        self._depth[name] = max(0, cur - 1)
        b = self._budgets.get(name)
        if not b:
            return {"allowed": True, "reason": None, "strikes": self._strikes.get(name, 0)}
        reason = None
        if "maxWallMs" in b and wall_ms > b["maxWallMs"]:
            self._strike(name, "wall-time", wall_ms, b["maxWallMs"])
            reason = "wall-time-exceeded"
        if mem_bytes is not None and "maxMemoryBytes" in b and mem_bytes > b["maxMemoryBytes"]:
            self._strike(name, "memory", mem_bytes, b["maxMemoryBytes"])
            reason = (reason + "+memory-exceeded") if reason else "memory-exceeded"
        return {"allowed": reason is None, "reason": reason,
                "strikes": self._strikes.get(name, 0)}

    def _strike(self, name: str, kind: str, observed: float, limit: float) -> None:
        nxt = self._strikes.get(name, 0) + 1
        self._strikes[name] = nxt
        self._breaches.append({"name": name, "kind": kind, "observed": observed,
                               "limit": limit, "ts": int(time.time() * 1000)})
        if len(self._breaches) > _CMPSBL_BUDGET_BREACH_MAX:
            self._breaches.pop(0)

    def should_quarantine(self, name: str) -> bool:
        return self._strikes.get(name, 0) >= _CMPSBL_BUDGET_STRIKE_THRESHOLD

    def strikes_for(self, name: str) -> int:
        return self._strikes.get(name, 0)

    def clear_strikes(self, name: str) -> None:
        self._strikes.pop(name, None)

    def breaches_for(self, name: str) -> List[Dict[str, object]]:
        return [dict(b) for b in self._breaches if b["name"] == name]

    def all_breaches(self) -> List[Dict[str, object]]:
        return [dict(b) for b in self._breaches]

    def declared_all(self) -> List[Dict[str, object]]:
        return [{"name": n, "budget": dict(b)} for n, b in self._budgets.items()]

    def reset(self) -> None:
        self._budgets.clear()
        self._depth.clear()
        self._strikes.clear()
        self._breaches = []


_cmpsbl_budget_inst = CmpsblBudgetGate()


def cmpsbl_budget() -> CmpsblBudgetGate:
    return _cmpsbl_budget_inst
`;

const BUDGET_WIRE_TS = `
// Resource Budget Gate enforces per-call wall-time, memory hint, and recursion
// depth. Use cmpsbl_budget().declare(name, { maxWallMs, maxMemoryBytes, maxDepth }).
// IsolatedExecutor calls enter(name) before dispatch and exit(name, wallMs, memBytes)
// after; breaches accumulate strikes. shouldQuarantine(name) signals when the
// Quarantine kernel should seal the function.
if (_cmpsbl_kernel_enabled_bg()) {
  void cmpsbl_budget();
}`;

const BUDGET_WIRE_PY = `
# Resource Budget Gate enforces per-call wall-time, memory hint, and recursion
# depth. Use cmpsbl_budget().declare(name, {"maxWallMs": ..., "maxMemoryBytes": ...,
# "maxDepth": ...}). IsolatedExecutor calls enter(name) before dispatch and
# exit(name, wall_ms, mem_bytes) after; breaches accumulate strikes.
# should_quarantine(name) signals when the Quarantine kernel should seal it.
if _cmpsbl_kernel_enabled_bg():
    _ = cmpsbl_budget()`;

const RESOURCE_BUDGET_CORE: CmpsblLayerDefinition = {
  id: 'resource-budget-gate',
  name: 'Resource Budget Gate',
  crownJewelRank: 53,
  cjpi: 96,
  module: 'GOVERNANCE',
  description:
    'Kernel-grade per-call budget enforcement. Functions declare max wall-time, max memory hint, and max recursion depth; the gate verifies before dispatch (depth) and after execution (wall-time, memory). Breaches accumulate strikes; threshold (3) triggers a quarantine signal. Bounded breach buffer (256). Pairs with the Quarantine kernel for automatic sealing of misbehaving functions. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: BUDGET_TS,
  pyCode: BUDGET_PY,
  autoWire: {
    wrapperName: 'cmpsbl_budget',
    behavior:
      'Initializes the budget gate at module load. Layer code calls declare(name, budget) to set limits; IsolatedExecutor wraps dispatch with enter()/exit() to enforce and observe. Strike accumulation produces a quarantine signal consumed by the Quarantine kernel.',
    tsWire: BUDGET_WIRE_TS,
    pyWire: BUDGET_WIRE_PY,
  },
};

export { RESOURCE_BUDGET_CORE };
