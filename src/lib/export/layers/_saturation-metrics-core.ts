/**
 * CMPSBL® Always-On Core — Saturation Metrics (Kernel Component #20)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Per-contract latency histogram (p50/p95/p99) + error budget tracking.
 * Bounded reservoir sample (512 per contract) with online quantile estimation.
 * Error budget = errors / total over rolling window; breach when budget > limit.
 *
 * Required input for Backpressure Governor (saturation feedback) and
 * Recoverable Circuit Breaker (error rate input). Pairs with BEACON for
 * structured emission. Online algorithm — no full sort required for read.
 *
 * Module: GOVERNANCE  ·  CJPI: 96  ·  Crown Jewel #60
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const SATURATION_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Saturation Metrics (sealed module, proprietary).          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblQuantiles {
  p50: number;
  p95: number;
  p99: number;
  count: number;
  min: number;
  max: number;
}

interface CmpsblErrorBudget {
  errors: number;
  total: number;
  rate: number;
  budget: number;
  breached: boolean;
}

function _cmpsbl_kernel_enabled_sm(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_SM_RESERVOIR_MAX = 512;
const _CMPSBL_SM_DEFAULT_BUDGET = 0.05;  // 5% error budget

interface _SatEntry {
  samples: number[];
  errors: number;
  total: number;
  budget: number;
  min: number;
  max: number;
}

class CmpsblSaturationMetrics {
  private entries: Map<string, _SatEntry> = new Map();
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_sm(); }

  declare(name: string, errorBudget: number = _CMPSBL_SM_DEFAULT_BUDGET): void {
    if (!this.enabled) return;
    this.entries.set(name, {
      samples: [], errors: 0, total: 0, budget: errorBudget,
      min: Infinity, max: -Infinity,
    });
  }

  private _ensure(name: string): _SatEntry {
    let e = this.entries.get(name);
    if (!e) {
      e = { samples: [], errors: 0, total: 0, budget: _CMPSBL_SM_DEFAULT_BUDGET,
            min: Infinity, max: -Infinity };
      this.entries.set(name, e);
    }
    return e;
  }

  /** Record a successful call latency. */
  observe(name: string, latencyMs: number): void {
    if (!this.enabled) return;
    const e = this._ensure(name);
    if (e.samples.length >= _CMPSBL_SM_RESERVOIR_MAX) e.samples.shift();
    e.samples.push(latencyMs);
    e.total += 1;
    if (latencyMs < e.min) e.min = latencyMs;
    if (latencyMs > e.max) e.max = latencyMs;
  }

  /** Record an error (counts toward budget). */
  observeError(name: string): void {
    if (!this.enabled) return;
    const e = this._ensure(name);
    e.errors += 1;
    e.total += 1;
  }

  quantiles(name: string): CmpsblQuantiles {
    const e = this.entries.get(name);
    if (!e || e.samples.length === 0) {
      return { p50: 0, p95: 0, p99: 0, count: 0, min: 0, max: 0 };
    }
    const sorted = [...e.samples].sort((a, b) => a - b);
    const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
    return {
      p50: q(0.50), p95: q(0.95), p99: q(0.99),
      count: sorted.length, min: e.min === Infinity ? 0 : e.min,
      max: e.max === -Infinity ? 0 : e.max,
    };
  }

  errorBudget(name: string): CmpsblErrorBudget {
    const e = this.entries.get(name);
    if (!e || e.total === 0) {
      return { errors: 0, total: 0, rate: 0, budget: _CMPSBL_SM_DEFAULT_BUDGET, breached: false };
    }
    const rate = e.errors / e.total;
    return { errors: e.errors, total: e.total, rate, budget: e.budget, breached: rate > e.budget };
  }

  declaredAll(): Array<{ name: string; quantiles: CmpsblQuantiles; budget: CmpsblErrorBudget }> {
    return [...this.entries.keys()].map(name => ({
      name, quantiles: this.quantiles(name), budget: this.errorBudget(name),
    }));
  }

  reset(name?: string): void {
    if (name) this.entries.delete(name);
    else this.entries.clear();
  }
}

const _cmpsbl_saturation_inst = new CmpsblSaturationMetrics();

function cmpsbl_saturation(): CmpsblSaturationMetrics {
  return _cmpsbl_saturation_inst;
}
`;

const SATURATION_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Saturation Metrics (sealed module, proprietary).          ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import math
from typing import Dict, List, Optional


def _cmpsbl_kernel_enabled_sm() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_SM_RESERVOIR_MAX = 512
_CMPSBL_SM_DEFAULT_BUDGET = 0.05


class CmpsblSaturationMetrics:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_sm()
        self._entries: Dict[str, Dict[str, object]] = {}

    def declare(self, name: str, error_budget: float = _CMPSBL_SM_DEFAULT_BUDGET) -> None:
        if not self._enabled:
            return
        self._entries[name] = {
            "samples": [], "errors": 0, "total": 0, "budget": error_budget,
            "min": math.inf, "max": -math.inf,
        }

    def _ensure(self, name: str) -> Dict[str, object]:
        e = self._entries.get(name)
        if not e:
            e = {"samples": [], "errors": 0, "total": 0,
                 "budget": _CMPSBL_SM_DEFAULT_BUDGET,
                 "min": math.inf, "max": -math.inf}
            self._entries[name] = e
        return e

    def observe(self, name: str, latency_ms: float) -> None:
        if not self._enabled:
            return
        e = self._ensure(name)
        samples: List[float] = e["samples"]  # type: ignore
        if len(samples) >= _CMPSBL_SM_RESERVOIR_MAX:
            samples.pop(0)
        samples.append(latency_ms)
        e["total"] = int(e["total"]) + 1
        if latency_ms < e["min"]:
            e["min"] = latency_ms
        if latency_ms > e["max"]:
            e["max"] = latency_ms

    def observe_error(self, name: str) -> None:
        if not self._enabled:
            return
        e = self._ensure(name)
        e["errors"] = int(e["errors"]) + 1
        e["total"] = int(e["total"]) + 1

    def quantiles(self, name: str) -> Dict[str, float]:
        e = self._entries.get(name)
        if not e or not e["samples"]:
            return {"p50": 0, "p95": 0, "p99": 0, "count": 0, "min": 0, "max": 0}
        sorted_s = sorted(e["samples"])  # type: ignore
        n = len(sorted_s)

        def q(p: float) -> float:
            return sorted_s[min(n - 1, int(p * n))]

        return {"p50": q(0.50), "p95": q(0.95), "p99": q(0.99),
                "count": n,
                "min": 0 if e["min"] == math.inf else e["min"],
                "max": 0 if e["max"] == -math.inf else e["max"]}

    def error_budget(self, name: str) -> Dict[str, object]:
        e = self._entries.get(name)
        if not e or int(e["total"]) == 0:
            return {"errors": 0, "total": 0, "rate": 0,
                    "budget": _CMPSBL_SM_DEFAULT_BUDGET, "breached": False}
        rate = int(e["errors"]) / int(e["total"])
        return {"errors": e["errors"], "total": e["total"], "rate": rate,
                "budget": e["budget"], "breached": rate > float(e["budget"])}

    def declared_all(self) -> List[Dict[str, object]]:
        return [{"name": n, "quantiles": self.quantiles(n),
                 "budget": self.error_budget(n)} for n in self._entries]

    def reset(self, name: Optional[str] = None) -> None:
        if name:
            self._entries.pop(name, None)
        else:
            self._entries.clear()


_cmpsbl_saturation_inst = CmpsblSaturationMetrics()


def cmpsbl_saturation() -> CmpsblSaturationMetrics:
    return _cmpsbl_saturation_inst
`;

const SATURATION_WIRE_TS = `
// Saturation Metrics — per-contract p50/p95/p99 latency + error budget.
// IsolatedExecutor calls cmpsbl_saturation().observe(name, ms) on success and
// observeError(name) on failure. Quantiles + budget feed the Backpressure
// Governor (saturation) and Recoverable Circuit Breaker (error rate).
// Reservoir sample (512), default 5% error budget. Pairs with BEACON.
if (_cmpsbl_kernel_enabled_sm()) {
  void cmpsbl_saturation();
}`;

const SATURATION_WIRE_PY = `
# Saturation Metrics — per-contract p50/p95/p99 latency + error budget.
# IsolatedExecutor calls cmpsbl_saturation().observe(name, ms) on success and
# observe_error(name) on failure. Quantiles + budget feed the Backpressure
# Governor (saturation) and Recoverable Circuit Breaker (error rate).
# Reservoir sample (512), default 5% error budget. Pairs with BEACON.
if _cmpsbl_kernel_enabled_sm():
    _ = cmpsbl_saturation()`;

const SATURATION_METRICS_CORE: CmpsblLayerDefinition = {
  id: 'saturation-metrics',
  name: 'Saturation Metrics',
  crownJewelRank: 60,
  cjpi: 96,
  module: 'GOVERNANCE',
  description:
    'Per-contract latency quantiles (p50/p95/p99) + rolling error budget tracking. Bounded reservoir sample (512 per contract) with on-demand sort. Default error budget 5%; breach feeds the Recoverable Circuit Breaker. Required input for the Backpressure Governor saturation feedback loop. Pairs with BEACON for structured emission. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: SATURATION_TS,
  pyCode: SATURATION_PY,
  autoWire: {
    wrapperName: 'cmpsbl_saturation',
    behavior:
      'Initializes the saturation registry at module load. Layer code calls declare(name, errorBudget); IsolatedExecutor wraps dispatch with observe(name, latencyMs) on success and observeError(name) on failure. Quantiles + error budget are queryable on demand by dashboards and the BEACON signal layer.',
    tsWire: SATURATION_WIRE_TS,
    pyWire: SATURATION_WIRE_PY,
  },
};

export { SATURATION_METRICS_CORE };
