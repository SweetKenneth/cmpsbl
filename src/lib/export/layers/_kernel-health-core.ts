/**
 * CMPSBL® Always-On Core — Kernel Health Probe (Kernel Component #14)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single-call kernel health snapshot. Returns a stable shape:
 *   {
 *     quartet: 'ok' | 'degraded' | 'down',  // Quartet = Quarantine + Validator + Executor + Budget
 *     store:   'ok' | 'degraded' | 'down',
 *     contracts:    N,                       // declared contracts
 *     quarantined:  M,                       // sealed functions
 *     executions:   K,                       // total dispatches observed
 *     receipts:     R,                       // chained receipts emitted
 *     budgetStrikes: S,                      // active budget strike total
 *     ts:           epochMs,
 *   }
 *
 * The probe is read-only — never mutates kernel state. It probes each
 * kernel surface defensively (typeof guards) so partially-installed
 * exports still answer rather than throw.
 *
 * Module: GOVERNANCE  ·  CJPI: 97  ·  Crown Jewel #54
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const HEALTH_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Kernel Health Probe (sealed module, proprietary).         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblHealthReport {
  quartet: 'ok' | 'degraded' | 'down';
  store: 'ok' | 'degraded' | 'down';
  contracts: number;
  quarantined: number;
  executions: number;
  receipts: number;
  budgetStrikes: number;
  ts: number;
}

function _cmpsbl_kernel_enabled_hp(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

function _cmpsbl_safe_call<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

function cmpsbl_health(): CmpsblHealthReport {
  const enabled = _cmpsbl_kernel_enabled_hp();
  if (!enabled) {
    return {
      quartet: 'down', store: 'down', contracts: 0, quarantined: 0,
      executions: 0, receipts: 0, budgetStrikes: 0, ts: Date.now(),
    };
  }

  // Probe each surface defensively — kernel components may be partially loaded.
  const hasContracts   = typeof (globalThis as any).cmpsbl_contracts   === 'function';
  const hasQuarantine  = typeof (globalThis as any).cmpsbl_quarantine  === 'function';
  const hasExecutor    = typeof (globalThis as any).cmpsbl_executor    === 'function';
  const hasBudget      = typeof (globalThis as any).cmpsbl_budget      === 'function';
  const hasStore       = typeof (globalThis as any).cmpsbl_state_store === 'function';
  const hasReceipts    = typeof (globalThis as any).cmpsbl_receipts    === 'function';

  const quartetCount = (hasContracts ? 1 : 0) + (hasQuarantine ? 1 : 0)
                     + (hasExecutor  ? 1 : 0) + (hasBudget     ? 1 : 0);
  const quartet: 'ok' | 'degraded' | 'down' =
    quartetCount === 4 ? 'ok' : quartetCount > 0 ? 'degraded' : 'down';
  const store: 'ok' | 'degraded' | 'down' = hasStore ? 'ok' : 'down';

  const contracts = hasContracts
    ? _cmpsbl_safe_call(() => ((globalThis as any).cmpsbl_contracts().declaredAll?.() ?? []).length, 0)
    : 0;
  const quarantined = hasQuarantine
    ? _cmpsbl_safe_call(() => ((globalThis as any).cmpsbl_quarantine().listSealed?.() ?? []).length, 0)
    : 0;
  const executions = hasExecutor
    ? _cmpsbl_safe_call(() => Number((globalThis as any).cmpsbl_executor().totalDispatches?.() ?? 0), 0)
    : 0;
  const receipts = hasReceipts
    ? _cmpsbl_safe_call(() => Number((globalThis as any).cmpsbl_receipts().count?.() ?? 0), 0)
    : 0;
  const budgetStrikes = hasBudget
    ? _cmpsbl_safe_call(() => {
        const all = (globalThis as any).cmpsbl_budget().declaredAll?.() ?? [];
        return all.reduce((sum: number, d: { name: string }) =>
          sum + Number((globalThis as any).cmpsbl_budget().strikesFor?.(d.name) ?? 0), 0);
      }, 0)
    : 0;

  return {
    quartet, store, contracts, quarantined, executions,
    receipts, budgetStrikes, ts: Date.now(),
  };
}
`;

const HEALTH_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Kernel Health Probe (sealed module, proprietary).         ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
from typing import Dict


def _cmpsbl_kernel_enabled_hp() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


def _cmpsbl_safe(fn, fallback):
    try:
        return fn()
    except Exception:
        return fallback


def cmpsbl_health() -> Dict[str, object]:
    enabled = _cmpsbl_kernel_enabled_hp()
    now_ms = int(time.time() * 1000)
    if not enabled:
        return {"quartet": "down", "store": "down", "contracts": 0,
                "quarantined": 0, "executions": 0, "receipts": 0,
                "budgetStrikes": 0, "ts": now_ms}

    g = globals()
    has_contracts  = callable(g.get("cmpsbl_contracts"))
    has_quarantine = callable(g.get("cmpsbl_quarantine"))
    has_executor   = callable(g.get("cmpsbl_executor"))
    has_budget     = callable(g.get("cmpsbl_budget"))
    has_store      = callable(g.get("cmpsbl_state_store"))
    has_receipts   = callable(g.get("cmpsbl_receipts"))

    quartet_count = sum([has_contracts, has_quarantine, has_executor, has_budget])
    quartet = "ok" if quartet_count == 4 else ("degraded" if quartet_count > 0 else "down")
    store = "ok" if has_store else "down"

    contracts = _cmpsbl_safe(
        lambda: len(g["cmpsbl_contracts"]().declared_all() or []), 0
    ) if has_contracts else 0
    quarantined = _cmpsbl_safe(
        lambda: len(g["cmpsbl_quarantine"]().list_sealed() or []), 0
    ) if has_quarantine else 0
    executions = _cmpsbl_safe(
        lambda: int(g["cmpsbl_executor"]().total_dispatches() or 0), 0
    ) if has_executor else 0
    receipts = _cmpsbl_safe(
        lambda: int(g["cmpsbl_receipts"]().count() or 0), 0
    ) if has_receipts else 0

    def _strike_total():
        all_b = g["cmpsbl_budget"]().declared_all() or []
        return sum(int(g["cmpsbl_budget"]().strikes_for(d["name"])) for d in all_b)
    budget_strikes = _cmpsbl_safe(_strike_total, 0) if has_budget else 0

    return {
        "quartet": quartet, "store": store, "contracts": contracts,
        "quarantined": quarantined, "executions": executions,
        "receipts": receipts, "budgetStrikes": budget_strikes, "ts": now_ms,
    }
`;

const HEALTH_WIRE_TS = `
// Kernel Health Probe — single read-only call returning a snapshot of every
// kernel surface (quartet status, store, contract count, quarantined count,
// total executions, receipt count, total budget strikes). Defensive: probes
// each surface via typeof so partial installs still answer rather than throw.
if (_cmpsbl_kernel_enabled_hp()) {
  void cmpsbl_health;
}`;

const HEALTH_WIRE_PY = `
# Kernel Health Probe — single read-only call returning a snapshot of every
# kernel surface (quartet status, store, contract count, quarantined count,
# total executions, receipt count, total budget strikes). Defensive: probes
# each surface so partial installs still answer rather than throw.
if _cmpsbl_kernel_enabled_hp():
    _ = cmpsbl_health`;

const KERNEL_HEALTH_CORE: CmpsblLayerDefinition = {
  id: 'kernel-health-probe',
  name: 'Kernel Health Probe',
  crownJewelRank: 54,
  cjpi: 97,
  module: 'GOVERNANCE',
  description:
    'Single-call read-only kernel health snapshot. cmpsbl_health() returns { quartet, store, contracts, quarantined, executions, receipts, budgetStrikes, ts }. Quartet = Contract Validator + Quarantine + Isolated Executor + Budget Gate; reports ok / degraded / down based on surface availability. Defensive probing: typeof-guarded calls mean partial kernel installs answer rather than throw. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: HEALTH_TS,
  pyCode: HEALTH_PY,
  autoWire: {
    wrapperName: 'cmpsbl_health',
    behavior:
      'Exposes cmpsbl_health() as a read-only probe. No registration required — the function inspects globally-installed kernel components and returns a stable shape. Safe to call from any layer (BEACON, debug surface, external monitors).',
    tsWire: HEALTH_WIRE_TS,
    pyWire: HEALTH_WIRE_PY,
  },
};

export { KERNEL_HEALTH_CORE };
