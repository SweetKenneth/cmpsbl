/**
 * CMPSBL® Always-On Core — Effect Tracker (Kernel Component #12)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Mark functions with declared effect class — pure | io | network |
 * mutation — and have IsolatedExecutor enforce/audit the declared
 * class at runtime. Mismatches surface via violation registry and
 * Telemetry Bus when present.
 *
 * Effect classes are an ordered lattice (pure ⊂ io ⊂ network ⊂ mutation):
 * a function declared 'pure' that performs network I/O is a violation;
 * one declared 'mutation' may legally do less. Strict mode treats any
 * mismatch as a violation; lax mode only flags upward escalations.
 *
 * Module: GOVERNANCE  ·  CJPI: 95  ·  Crown Jewel #52
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const EFFECT_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Effect Tracker (sealed module, proprietary).              ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblEffectClass = 'pure' | 'io' | 'network' | 'mutation';

interface CmpsblEffectViolation {
  name: string;
  declared: CmpsblEffectClass;
  observed: CmpsblEffectClass;
  ts: number;
  reason: string;
}

function _cmpsbl_kernel_enabled_ef(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_EFFECT_RANK: Readonly<Record<string, number>> = Object.freeze({
  pure: 0, io: 1, network: 2, mutation: 3,
});

const _CMPSBL_EFFECT_VIOL_MAX = 256;

class CmpsblEffectTracker {
  private declared: Map<string, CmpsblEffectClass> = new Map();
  private violations: CmpsblEffectViolation[] = [];
  private strict = false;
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_ef(); }

  setStrict(on: boolean): void { this.strict = !!on; }

  declare(name: string, effect: CmpsblEffectClass): void {
    if (!this.enabled) return;
    if (!(effect in _CMPSBL_EFFECT_RANK)) return;
    this.declared.set(name, effect);
  }

  declaredFor(name: string): CmpsblEffectClass | null {
    return this.declared.get(name) ?? null;
  }

  /** Audit observed effect against declaration. Returns true when compliant. */
  audit(name: string, observed: CmpsblEffectClass): boolean {
    if (!this.enabled) return true;
    const decl = this.declared.get(name);
    if (!decl) return true; // undeclared = no contract to violate
    const dRank = _CMPSBL_EFFECT_RANK[decl];
    const oRank = _CMPSBL_EFFECT_RANK[observed] ?? 0;
    let violated = false;
    let reason = '';
    if (this.strict) {
      if (oRank !== dRank) { violated = true; reason = 'strict-mismatch'; }
    } else {
      if (oRank > dRank) { violated = true; reason = 'effect-escalation'; }
    }
    if (!violated) return true;
    const v: CmpsblEffectViolation = {
      name, declared: decl, observed, ts: Date.now(), reason,
    };
    this.violations.push(v);
    if (this.violations.length > _CMPSBL_EFFECT_VIOL_MAX) this.violations.shift();
    return false;
  }

  violationsFor(name: string): CmpsblEffectViolation[] {
    return this.violations.filter(v => v.name === name).map(v => ({ ...v }));
  }
  allViolations(): CmpsblEffectViolation[] { return this.violations.map(v => ({ ...v })); }
  declaredAll(): Array<{ name: string; effect: CmpsblEffectClass }> {
    return [...this.declared.entries()].map(([name, effect]) => ({ name, effect }));
  }
  reset(): void { this.declared.clear(); this.violations = []; this.strict = false; }
}

const _cmpsbl_effects_inst = new CmpsblEffectTracker();

function cmpsbl_effects(): CmpsblEffectTracker {
  return _cmpsbl_effects_inst;
}
`;

const EFFECT_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Effect Tracker (sealed module, proprietary).              ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
from typing import Dict, List, Optional


def _cmpsbl_kernel_enabled_ef() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_EFFECT_RANK: Dict[str, int] = {"pure": 0, "io": 1, "network": 2, "mutation": 3}
_CMPSBL_EFFECT_VIOL_MAX = 256


class CmpsblEffectTracker:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_ef()
        self._declared: Dict[str, str] = {}
        self._violations: List[Dict[str, object]] = []
        self._strict = False

    def set_strict(self, on: bool) -> None:
        self._strict = bool(on)

    def declare(self, name: str, effect: str) -> None:
        if not self._enabled:
            return
        if effect not in _CMPSBL_EFFECT_RANK:
            return
        self._declared[name] = effect

    def declared_for(self, name: str) -> Optional[str]:
        return self._declared.get(name)

    def audit(self, name: str, observed: str) -> bool:
        if not self._enabled:
            return True
        decl = self._declared.get(name)
        if not decl:
            return True
        d_rank = _CMPSBL_EFFECT_RANK[decl]
        o_rank = _CMPSBL_EFFECT_RANK.get(observed, 0)
        violated = False
        reason = ""
        if self._strict:
            if o_rank != d_rank:
                violated = True
                reason = "strict-mismatch"
        else:
            if o_rank > d_rank:
                violated = True
                reason = "effect-escalation"
        if not violated:
            return True
        v = {"name": name, "declared": decl, "observed": observed,
             "ts": int(time.time() * 1000), "reason": reason}
        self._violations.append(v)
        if len(self._violations) > _CMPSBL_EFFECT_VIOL_MAX:
            self._violations.pop(0)
        return False

    def violations_for(self, name: str) -> List[Dict[str, object]]:
        return [dict(v) for v in self._violations if v["name"] == name]

    def all_violations(self) -> List[Dict[str, object]]:
        return [dict(v) for v in self._violations]

    def declared_all(self) -> List[Dict[str, str]]:
        return [{"name": n, "effect": e} for n, e in self._declared.items()]

    def reset(self) -> None:
        self._declared.clear()
        self._violations = []
        self._strict = False


_cmpsbl_effects_inst = CmpsblEffectTracker()


def cmpsbl_effects() -> CmpsblEffectTracker:
    return _cmpsbl_effects_inst
`;

const EFFECT_WIRE_TS = `
// Effect Tracker enforces declared effect class (pure|io|network|mutation) per
// function. Use cmpsbl_effects().declare(name, effect) at registration; the
// IsolatedExecutor (when present) calls audit(name, observedEffect) post-execute
// to flag escalations. Strict mode treats any mismatch as a violation.
if (_cmpsbl_kernel_enabled_ef()) {
  void cmpsbl_effects();
}`;

const EFFECT_WIRE_PY = `
# Effect Tracker enforces declared effect class (pure|io|network|mutation) per
# function. Use cmpsbl_effects().declare(name, effect) at registration; the
# IsolatedExecutor (when present) calls audit(name, observed_effect) post-execute
# to flag escalations. Strict mode treats any mismatch as a violation.
if _cmpsbl_kernel_enabled_ef():
    _ = cmpsbl_effects()`;

const EFFECT_TRACKER_CORE: CmpsblLayerDefinition = {
  id: 'effect-tracker',
  name: 'Effect Tracker',
  crownJewelRank: 52,
  cjpi: 95,
  module: 'GOVERNANCE',
  description:
    'Kernel-grade effect class registry. Functions declare their effect class (pure | io | network | mutation); IsolatedExecutor audits observed behavior against declarations. Effect lattice prevents accidental escalation (a declared-pure fn cannot legally do network I/O). Strict mode flags any mismatch; lax mode only flags upward escalations. Bounded violation buffer (256). Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: EFFECT_TS,
  pyCode: EFFECT_PY,
  autoWire: {
    wrapperName: 'cmpsbl_effects',
    behavior:
      'Initializes the effect tracker at module load. Layer code calls declare(name, effect) to register a contract; IsolatedExecutor calls audit(name, observed) post-execute to validate. Violations are recorded and may be surfaced via Telemetry Bus when subscribed.',
    tsWire: EFFECT_WIRE_TS,
    pyWire: EFFECT_WIRE_PY,
  },
};

export { EFFECT_TRACKER_CORE };
