/**
 * CMPSBL® Always-On Core — Recoverable Circuit Breaker (Kernel Component #15)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Per-contract recoverable circuit breaker. Distinct from Quarantine (terminal
 * sealing) — this breaker auto-heals via half-open probes. Three states:
 *
 *   CLOSED    → normal traffic; failures increment counter
 *   OPEN      → failures >= threshold; reject calls for cooldown window
 *   HALF_OPEN → cooldown elapsed; admit ONE probe; success → CLOSED, failure → OPEN
 *
 * Pairs with Quarantine: persistent breaker re-trips (>= 3 open cycles) signal
 * the Quarantine kernel to seal the contract terminally. Bounded transition log.
 *
 * Module: GOVERNANCE  ·  CJPI: 98  ·  Crown Jewel #55
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const BREAKER_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Recoverable Circuit Breaker (sealed module).              ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblBreakerState = 'closed' | 'open' | 'half-open';

interface CmpsblBreakerConfig {
  failureThreshold?: number;  // failures before OPEN (default 5)
  cooldownMs?: number;        // wait before HALF_OPEN (default 30000)
  successThreshold?: number;  // half-open successes to CLOSE (default 1)
}

interface CmpsblBreakerVerdict {
  allowed: boolean;
  state: CmpsblBreakerState;
  reason: string | null;
}

interface CmpsblBreakerTransition {
  name: string;
  from: CmpsblBreakerState;
  to: CmpsblBreakerState;
  ts: number;
}

interface CmpsblBreakerEntry {
  config: Required<CmpsblBreakerConfig>;
  state: CmpsblBreakerState;
  failures: number;
  successes: number;
  openedAt: number;
  openCycles: number;
}

function _cmpsbl_kernel_enabled_cb(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_BREAKER_LOG_MAX = 256;
const _CMPSBL_BREAKER_QUARANTINE_CYCLES = 3;
const _CMPSBL_BREAKER_DEFAULTS: Required<CmpsblBreakerConfig> = {
  failureThreshold: 5,
  cooldownMs: 30000,
  successThreshold: 1,
};

class CmpsblCircuitBreaker {
  private entries: Map<string, CmpsblBreakerEntry> = new Map();
  private log: CmpsblBreakerTransition[] = [];
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_cb(); }

  declare(name: string, config: CmpsblBreakerConfig = {}): void {
    if (!this.enabled) return;
    this.entries.set(name, {
      config: { ..._CMPSBL_BREAKER_DEFAULTS, ...config },
      state: 'closed', failures: 0, successes: 0, openedAt: 0, openCycles: 0,
    });
  }

  /** Pre-dispatch gate. Returns verdict; HALF_OPEN admits ONE call. */
  beforeCall(name: string): CmpsblBreakerVerdict {
    if (!this.enabled) return { allowed: true, state: 'closed', reason: null };
    const e = this.entries.get(name);
    if (!e) return { allowed: true, state: 'closed', reason: null };
    if (e.state === 'open') {
      if (Date.now() - e.openedAt >= e.config.cooldownMs) {
        this._transition(name, e, 'half-open');
        return { allowed: true, state: 'half-open', reason: null };
      }
      return { allowed: false, state: 'open', reason: 'breaker-open' };
    }
    return { allowed: true, state: e.state, reason: null };
  }

  recordSuccess(name: string): void {
    if (!this.enabled) return;
    const e = this.entries.get(name);
    if (!e) return;
    if (e.state === 'half-open') {
      e.successes += 1;
      if (e.successes >= e.config.successThreshold) {
        e.failures = 0; e.successes = 0;
        this._transition(name, e, 'closed');
      }
    } else if (e.state === 'closed') {
      e.failures = 0;
    }
  }

  recordFailure(name: string): void {
    if (!this.enabled) return;
    const e = this.entries.get(name);
    if (!e) return;
    if (e.state === 'half-open') {
      e.successes = 0;
      this._open(name, e);
      return;
    }
    e.failures += 1;
    if (e.state === 'closed' && e.failures >= e.config.failureThreshold) {
      this._open(name, e);
    }
  }

  private _open(name: string, e: CmpsblBreakerEntry): void {
    e.openedAt = Date.now();
    e.openCycles += 1;
    this._transition(name, e, 'open');
  }

  private _transition(name: string, e: CmpsblBreakerEntry, to: CmpsblBreakerState): void {
    if (e.state === to) return;
    this.log.push({ name, from: e.state, to, ts: Date.now() });
    if (this.log.length > _CMPSBL_BREAKER_LOG_MAX) this.log.shift();
    e.state = to;
  }

  /** Persistent re-tripping (>= 3 OPEN cycles) → Quarantine signal. */
  shouldQuarantine(name: string): boolean {
    const e = this.entries.get(name);
    return !!e && e.openCycles >= _CMPSBL_BREAKER_QUARANTINE_CYCLES;
  }

  stateOf(name: string): CmpsblBreakerState | null {
    return this.entries.get(name)?.state ?? null;
  }
  cyclesFor(name: string): number { return this.entries.get(name)?.openCycles ?? 0; }
  reset(name: string): void {
    const e = this.entries.get(name);
    if (!e) return;
    e.state = 'closed'; e.failures = 0; e.successes = 0; e.openCycles = 0;
  }
  declaredAll(): Array<{ name: string; state: CmpsblBreakerState; openCycles: number }> {
    return [...this.entries.entries()].map(([name, e]) => ({
      name, state: e.state, openCycles: e.openCycles,
    }));
  }
  transitions(): CmpsblBreakerTransition[] { return this.log.map(t => ({ ...t })); }
  resetAll(): void { this.entries.clear(); this.log = []; }
}

const _cmpsbl_breaker_inst = new CmpsblCircuitBreaker();

function cmpsbl_breaker(): CmpsblCircuitBreaker {
  return _cmpsbl_breaker_inst;
}
`;

const BREAKER_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Recoverable Circuit Breaker (sealed module).              ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
from typing import Dict, List, Optional


def _cmpsbl_kernel_enabled_cb() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_BREAKER_LOG_MAX = 256
_CMPSBL_BREAKER_QUARANTINE_CYCLES = 3
_CMPSBL_BREAKER_DEFAULTS = {
    "failureThreshold": 5,
    "cooldownMs": 30000,
    "successThreshold": 1,
}


class CmpsblCircuitBreaker:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_cb()
        self._entries: Dict[str, Dict[str, object]] = {}
        self._log: List[Dict[str, object]] = []

    def declare(self, name: str, config: Optional[Dict[str, int]] = None) -> None:
        if not self._enabled:
            return
        cfg = dict(_CMPSBL_BREAKER_DEFAULTS)
        if config:
            cfg.update(config)
        self._entries[name] = {
            "config": cfg, "state": "closed", "failures": 0,
            "successes": 0, "openedAt": 0, "openCycles": 0,
        }

    def before_call(self, name: str) -> Dict[str, object]:
        if not self._enabled:
            return {"allowed": True, "state": "closed", "reason": None}
        e = self._entries.get(name)
        if not e:
            return {"allowed": True, "state": "closed", "reason": None}
        if e["state"] == "open":
            cooldown = e["config"]["cooldownMs"]
            if int(time.time() * 1000) - e["openedAt"] >= cooldown:
                self._transition(name, e, "half-open")
                return {"allowed": True, "state": "half-open", "reason": None}
            return {"allowed": False, "state": "open", "reason": "breaker-open"}
        return {"allowed": True, "state": e["state"], "reason": None}

    def record_success(self, name: str) -> None:
        if not self._enabled:
            return
        e = self._entries.get(name)
        if not e:
            return
        if e["state"] == "half-open":
            e["successes"] = int(e["successes"]) + 1
            if e["successes"] >= e["config"]["successThreshold"]:
                e["failures"] = 0
                e["successes"] = 0
                self._transition(name, e, "closed")
        elif e["state"] == "closed":
            e["failures"] = 0

    def record_failure(self, name: str) -> None:
        if not self._enabled:
            return
        e = self._entries.get(name)
        if not e:
            return
        if e["state"] == "half-open":
            e["successes"] = 0
            self._open(name, e)
            return
        e["failures"] = int(e["failures"]) + 1
        if e["state"] == "closed" and e["failures"] >= e["config"]["failureThreshold"]:
            self._open(name, e)

    def _open(self, name: str, e: Dict[str, object]) -> None:
        e["openedAt"] = int(time.time() * 1000)
        e["openCycles"] = int(e["openCycles"]) + 1
        self._transition(name, e, "open")

    def _transition(self, name: str, e: Dict[str, object], to: str) -> None:
        if e["state"] == to:
            return
        self._log.append({"name": name, "from": e["state"], "to": to,
                          "ts": int(time.time() * 1000)})
        if len(self._log) > _CMPSBL_BREAKER_LOG_MAX:
            self._log.pop(0)
        e["state"] = to

    def should_quarantine(self, name: str) -> bool:
        e = self._entries.get(name)
        return bool(e) and int(e["openCycles"]) >= _CMPSBL_BREAKER_QUARANTINE_CYCLES

    def state_of(self, name: str) -> Optional[str]:
        e = self._entries.get(name)
        return e["state"] if e else None

    def cycles_for(self, name: str) -> int:
        e = self._entries.get(name)
        return int(e["openCycles"]) if e else 0

    def reset(self, name: str) -> None:
        e = self._entries.get(name)
        if not e:
            return
        e["state"] = "closed"
        e["failures"] = 0
        e["successes"] = 0
        e["openCycles"] = 0

    def declared_all(self) -> List[Dict[str, object]]:
        return [{"name": n, "state": e["state"], "openCycles": e["openCycles"]}
                for n, e in self._entries.items()]

    def transitions(self) -> List[Dict[str, object]]:
        return [dict(t) for t in self._log]

    def reset_all(self) -> None:
        self._entries.clear()
        self._log = []


_cmpsbl_breaker_inst = CmpsblCircuitBreaker()


def cmpsbl_breaker() -> CmpsblCircuitBreaker:
    return _cmpsbl_breaker_inst
`;

const BREAKER_WIRE_TS = `
// Recoverable Circuit Breaker — per-contract closed/open/half-open state machine.
// Use cmpsbl_breaker().declare(name, { failureThreshold, cooldownMs, successThreshold }).
// IsolatedExecutor calls beforeCall(name) to gate, recordSuccess(name) on success,
// and recordFailure(name) on failure. Persistent re-tripping (>= 3 open cycles)
// signals the Quarantine kernel for terminal sealing.
if (_cmpsbl_kernel_enabled_cb()) {
  void cmpsbl_breaker();
}`;

const BREAKER_WIRE_PY = `
# Recoverable Circuit Breaker — per-contract closed/open/half-open state machine.
# Use cmpsbl_breaker().declare(name, {"failureThreshold": N, "cooldownMs": MS,
# "successThreshold": K}). IsolatedExecutor calls before_call(name) to gate,
# record_success(name) on success, record_failure(name) on failure. Persistent
# re-tripping (>= 3 open cycles) signals the Quarantine kernel for terminal sealing.
if _cmpsbl_kernel_enabled_cb():
    _ = cmpsbl_breaker()`;

const CIRCUIT_BREAKER_RECOVERABLE_CORE: CmpsblLayerDefinition = {
  id: 'circuit-breaker-recoverable',
  name: 'Recoverable Circuit Breaker',
  crownJewelRank: 55,
  cjpi: 98,
  module: 'GOVERNANCE',
  description:
    'Per-contract recoverable circuit breaker. Three-state machine (closed/open/half-open) with auto-recovery via half-open probe. Distinct from Quarantine: this breaker heals automatically once cooldown elapses and a probe succeeds. Persistent re-tripping (>= 3 open cycles) escalates to Quarantine for terminal sealing. Bounded transition log (256). Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: BREAKER_TS,
  pyCode: BREAKER_PY,
  autoWire: {
    wrapperName: 'cmpsbl_breaker',
    behavior:
      'Initializes the breaker registry at module load. Layer code calls declare(name, config); IsolatedExecutor wraps dispatch with beforeCall/recordSuccess/recordFailure to enforce the state machine. shouldQuarantine(name) escalates to terminal sealing when persistent re-tripping is detected.',
    tsWire: BREAKER_WIRE_TS,
    pyWire: BREAKER_WIRE_PY,
  },
};

export { CIRCUIT_BREAKER_RECOVERABLE_CORE };
