/**
 * CMPSBL® Always-On Core — Shadow Execution (Kernel Component #11)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Run a candidate function alongside the production one, compare
 * envelopes, report divergence. Foundation for safe upgrades — the
 * EVOLUTION pillar's runtime check before promotion.
 *
 * Production result is always returned to the caller; the candidate
 * runs in shadow (errors swallowed, results compared, divergences
 * reported via Telemetry Bus when present).
 *
 * Module: EVOLUTION  ·  CJPI: 96  ·  Crown Jewel #51
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const SHADOW_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Shadow Execution (sealed module, proprietary).            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblShadowDivergence {
  name: string;
  ts: number;
  prodResult: unknown;
  shadowResult: unknown;
  prodOk: boolean;
  shadowOk: boolean;
  prodDurationMs: number;
  shadowDurationMs: number;
  reason: string;
}

interface CmpsblShadowStats {
  runs: number;
  matches: number;
  divergences: number;
  shadowErrors: number;
}

function _cmpsbl_kernel_enabled_se(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_SHADOW_DIV_MAX = 256;

class CmpsblShadowExecutor {
  private candidates: Map<string, (args: unknown) => unknown> = new Map();
  private divergences: CmpsblShadowDivergence[] = [];
  private stats: Map<string, CmpsblShadowStats> = new Map();
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_se(); }

  register(name: string, candidate: (args: unknown) => unknown): void {
    if (!this.enabled || typeof candidate !== 'function') return;
    this.candidates.set(name, candidate);
    if (!this.stats.has(name)) this.stats.set(name, { runs: 0, matches: 0, divergences: 0, shadowErrors: 0 });
  }

  unregister(name: string): boolean { return this.candidates.delete(name); }

  /** Returns prodResult unchanged; runs candidate in shadow and records divergence. */
  compare(name: string, args: unknown, prodResult: unknown, prodOk: boolean, prodDurationMs: number): unknown {
    if (!this.enabled) return prodResult;
    const candidate = this.candidates.get(name);
    if (!candidate) return prodResult;
    const stats = this.stats.get(name)!;
    stats.runs++;
    const t0 = Date.now();
    let shadowResult: unknown = null;
    let shadowOk = true;
    let reason = '';
    try {
      shadowResult = candidate(args);
    } catch (err) {
      shadowOk = false;
      stats.shadowErrors++;
      reason = 'shadow-throw:' + String((err as Error)?.message ?? err);
    }
    const shadowDurationMs = Date.now() - t0;
    if (shadowOk) {
      const matched = JSON.stringify(shadowResult) === JSON.stringify(prodResult) && shadowOk === prodOk;
      if (matched) { stats.matches++; return prodResult; }
      reason = 'envelope-mismatch';
    }
    stats.divergences++;
    const div: CmpsblShadowDivergence = {
      name, ts: Date.now(), prodResult, shadowResult,
      prodOk, shadowOk, prodDurationMs, shadowDurationMs, reason,
    };
    this.divergences.push(div);
    if (this.divergences.length > _CMPSBL_SHADOW_DIV_MAX) this.divergences.shift();
    return prodResult;
  }

  divergencesFor(name: string): CmpsblShadowDivergence[] {
    return this.divergences.filter(d => d.name === name).map(d => ({ ...d }));
  }
  allDivergences(): CmpsblShadowDivergence[] { return this.divergences.map(d => ({ ...d })); }
  statsFor(name: string): CmpsblShadowStats | null {
    const s = this.stats.get(name);
    return s ? { ...s } : null;
  }
  registered(): string[] { return [...this.candidates.keys()]; }
  reset(): void { this.candidates.clear(); this.divergences = []; this.stats.clear(); }
}

const _cmpsbl_shadow_inst = new CmpsblShadowExecutor();

function cmpsbl_shadow(): CmpsblShadowExecutor {
  return _cmpsbl_shadow_inst;
}
`;

const SHADOW_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Shadow Execution (sealed module, proprietary).            ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
import json
from typing import Any, Callable, Dict, List, Optional


def _cmpsbl_kernel_enabled_se() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_SHADOW_DIV_MAX = 256


class CmpsblShadowExecutor:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_se()
        self._candidates: Dict[str, Callable[[Any], Any]] = {}
        self._divergences: List[Dict[str, Any]] = []
        self._stats: Dict[str, Dict[str, int]] = {}

    def register(self, name: str, candidate: Callable[[Any], Any]) -> None:
        if not self._enabled or not callable(candidate):
            return
        self._candidates[name] = candidate
        self._stats.setdefault(name, {"runs": 0, "matches": 0, "divergences": 0, "shadow_errors": 0})

    def unregister(self, name: str) -> bool:
        return self._candidates.pop(name, None) is not None

    def compare(self, name: str, args: Any, prod_result: Any, prod_ok: bool, prod_duration_ms: float) -> Any:
        if not self._enabled:
            return prod_result
        candidate = self._candidates.get(name)
        if not candidate:
            return prod_result
        stats = self._stats[name]
        stats["runs"] += 1
        t0 = time.time()
        shadow_result: Any = None
        shadow_ok = True
        reason = ""
        try:
            shadow_result = candidate(args)
        except Exception as err:
            shadow_ok = False
            stats["shadow_errors"] += 1
            reason = "shadow-throw:" + str(err)
        shadow_duration_ms = (time.time() - t0) * 1000
        if shadow_ok:
            try:
                a = json.dumps(shadow_result, sort_keys=True, default=str)
                b = json.dumps(prod_result, sort_keys=True, default=str)
                matched = (a == b) and (shadow_ok == prod_ok)
            except Exception:
                matched = False
            if matched:
                stats["matches"] += 1
                return prod_result
            reason = "envelope-mismatch"
        stats["divergences"] += 1
        div = {
            "name": name, "ts": int(time.time() * 1000),
            "prod_result": prod_result, "shadow_result": shadow_result,
            "prod_ok": prod_ok, "shadow_ok": shadow_ok,
            "prod_duration_ms": prod_duration_ms, "shadow_duration_ms": shadow_duration_ms,
            "reason": reason,
        }
        self._divergences.append(div)
        if len(self._divergences) > _CMPSBL_SHADOW_DIV_MAX:
            self._divergences.pop(0)
        return prod_result

    def divergences_for(self, name: str) -> List[Dict[str, Any]]:
        return [dict(d) for d in self._divergences if d["name"] == name]

    def all_divergences(self) -> List[Dict[str, Any]]:
        return [dict(d) for d in self._divergences]

    def stats_for(self, name: str) -> Optional[Dict[str, int]]:
        s = self._stats.get(name)
        return dict(s) if s else None

    def registered(self) -> List[str]:
        return list(self._candidates.keys())

    def reset(self) -> None:
        self._candidates.clear()
        self._divergences = []
        self._stats.clear()


_cmpsbl_shadow_inst = CmpsblShadowExecutor()


def cmpsbl_shadow() -> CmpsblShadowExecutor:
    return _cmpsbl_shadow_inst
`;

const SHADOW_WIRE_TS = `
// Shadow Execution runs a candidate fn alongside production and reports
// envelope divergence. Use cmpsbl_shadow().register(name, candidateFn) to enroll
// a candidate; IsolatedExecutor (when present) calls compare() after the prod
// invocation. Foundation for the EVOLUTION pillar's safe upgrade pipeline.
if (_cmpsbl_kernel_enabled_se()) {
  void cmpsbl_shadow();
}`;

const SHADOW_WIRE_PY = `
# Shadow Execution runs a candidate fn alongside production and reports
# envelope divergence. Use cmpsbl_shadow().register(name, candidate_fn) to enroll
# a candidate; IsolatedExecutor (when present) calls compare() after the prod
# invocation. Foundation for the EVOLUTION pillar's safe upgrade pipeline.
if _cmpsbl_kernel_enabled_se():
    _ = cmpsbl_shadow()`;

const SHADOW_EXECUTION_CORE: CmpsblLayerDefinition = {
  id: 'shadow-execution',
  name: 'Shadow Execution',
  crownJewelRank: 51,
  cjpi: 96,
  module: 'EVOLUTION',
  description:
    'Kernel-grade shadow runner. Registered candidate functions execute alongside the production fn; envelopes are compared and divergences recorded. Production result is always returned — candidate failures never affect callers. Foundation for safe upgrades in the EVOLUTION pillar. Bounded divergence buffer (256). Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: SHADOW_TS,
  pyCode: SHADOW_PY,
  autoWire: {
    wrapperName: 'cmpsbl_shadow',
    behavior:
      'Initializes the shadow executor at module load. Layer code calls register(name, candidate) to enroll a candidate; IsolatedExecutor calls compare(name, args, prodResult, prodOk, durationMs) after every invocation to record envelope divergences without affecting production output.',
    tsWire: SHADOW_WIRE_TS,
    pyWire: SHADOW_WIRE_PY,
  },
};

export { SHADOW_EXECUTION_CORE };
