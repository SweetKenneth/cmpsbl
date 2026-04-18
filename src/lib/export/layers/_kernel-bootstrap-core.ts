/**
 * CMPSBL® Always-On Core — Kernel Bootstrap (Kernel Component #7)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single sealed entry point that initializes the kernel quintet in
 * the correct order, validates env, and returns a sealed handle.
 *
 *   Boot order:
 *     1. Clock           (deterministic time + ID)
 *     2. State Store     (substrate)
 *     3. Contract Validator
 *     4. Quarantine
 *     5. Isolated Executor
 *     6. Capability Registry
 *
 * After boot, callers receive `KernelHandle` with health() and
 * shutdown() entry points. Re-calling boot() returns the existing handle
 * (idempotent). Boot is a pure orchestration step — components are still
 * lazy-instantiated singletons; this just guarantees order + provides
 * a single audit point.
 *
 * Gated by CMPSBL_KERNEL_ENABLED (default ON). When OFF, boot() returns
 * a degraded handle with all features marked as 'bypassed'.
 *
 * Module: GOVERNANCE  ·  CJPI: 94  ·  Crown Jewel #47
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const BOOTSTRAP_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Bootstrap (sealed module, proprietary).                   ║
// ║  Idempotent kernel entry. Initializes quintet in deterministic order.         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblKernelHealth {
  enabled: boolean;
  bootedAt: number;
  bootId: string;
  components: {
    clock: 'ok' | 'missing' | 'bypassed';
    stateStore: 'ok' | 'missing' | 'bypassed';
    contracts: 'ok' | 'missing' | 'bypassed';
    quarantine: 'ok' | 'missing' | 'bypassed';
    executor: 'ok' | 'missing' | 'bypassed';
    registry: 'ok' | 'missing' | 'bypassed';
  };
  registryCount: number;
  quarantinedCount: number;
}

interface CmpsblKernelHandle {
  bootId: string;
  bootedAt: number;
  enabled: boolean;
  health(): CmpsblKernelHealth;
  shutdown(): void;
}

function _cmpsbl_kernel_enabled_bs(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

let _cmpsbl_kernel_handle: CmpsblKernelHandle | null = null;

function cmpsbl_boot(): CmpsblKernelHandle {
  if (_cmpsbl_kernel_handle) return _cmpsbl_kernel_handle;

  const enabled = _cmpsbl_kernel_enabled_bs();
  const bootedAt = (typeof cmpsbl_clock === 'function') ? cmpsbl_clock().now() : Date.now();
  const bootId = (typeof cmpsbl_clock === 'function') ? cmpsbl_clock().uuid() : ('boot-' + bootedAt);

  // Touch each component in canonical order to lock initialization sequence.
  // Each call is wrapped — a missing component (during partial deploys) does
  // not break boot; it surfaces as 'missing' in health().
  const status: CmpsblKernelHealth['components'] = {
    clock: 'missing', stateStore: 'missing', contracts: 'missing',
    quarantine: 'missing', executor: 'missing', registry: 'missing',
  };

  const probe = (key: keyof CmpsblKernelHealth['components'], touch: () => unknown) => {
    if (!enabled) { status[key] = 'bypassed'; return; }
    try { touch(); status[key] = 'ok'; } catch { status[key] = 'missing'; }
  };

  probe('clock',      () => (typeof cmpsbl_clock      === 'function') ? cmpsbl_clock()      : (() => { throw new Error('no clock'); })());
  probe('stateStore', () => (typeof cmpsbl_state      === 'function') ? cmpsbl_state()      : (() => { throw new Error('no state'); })());
  probe('contracts',  () => (typeof cmpsbl_contracts  === 'function') ? cmpsbl_contracts()  : (() => { throw new Error('no contracts'); })());
  probe('quarantine', () => (typeof cmpsbl_quarantine === 'function') ? cmpsbl_quarantine() : (() => { throw new Error('no quarantine'); })());
  probe('executor',   () => (typeof cmpsbl_execute    === 'function') ? cmpsbl_execute      : (() => { throw new Error('no executor'); })());
  probe('registry',   () => (typeof cmpsbl_registry   === 'function') ? cmpsbl_registry()   : (() => { throw new Error('no registry'); })());

  _cmpsbl_kernel_handle = {
    bootId,
    bootedAt,
    enabled,
    health(): CmpsblKernelHealth {
      let registryCount = 0;
      let quarantinedCount = 0;
      try { if (typeof cmpsbl_registry === 'function')   registryCount    = cmpsbl_registry().count(); } catch {}
      try { if (typeof cmpsbl_quarantine === 'function') quarantinedCount = cmpsbl_quarantine().list().length; } catch {}
      return { enabled, bootedAt, bootId, components: { ...status }, registryCount, quarantinedCount };
    },
    shutdown(): void {
      // Best-effort cleanup. Components are singletons; we clear their state
      // where supported. The handle is dropped so a subsequent boot() is fresh.
      try { if (typeof cmpsbl_quarantine === 'function') cmpsbl_quarantine().sweepExpired(); } catch {}
      _cmpsbl_kernel_handle = null;
    },
  };
  return _cmpsbl_kernel_handle;
}

function cmpsbl_kernel(): CmpsblKernelHandle | null {
  return _cmpsbl_kernel_handle;
}
`;

const BOOTSTRAP_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Bootstrap (sealed module, proprietary).                   ║
# ║  Idempotent kernel entry. Initializes quintet in deterministic order.         ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
from typing import Any, Callable, Dict, Optional


def _cmpsbl_kernel_enabled_bs() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_cmpsbl_kernel_handle: Optional[Dict[str, Any]] = None


def cmpsbl_boot() -> Dict[str, Any]:
    global _cmpsbl_kernel_handle
    if _cmpsbl_kernel_handle is not None:
        return _cmpsbl_kernel_handle

    enabled = _cmpsbl_kernel_enabled_bs()

    try:
        booted_at = cmpsbl_clock().now()  # type: ignore[name-defined]
    except Exception:
        booted_at = int(time.time() * 1000)

    try:
        boot_id = cmpsbl_clock().uuid()  # type: ignore[name-defined]
    except Exception:
        boot_id = "boot-" + str(booted_at)

    status: Dict[str, str] = {
        "clock": "missing", "state_store": "missing", "contracts": "missing",
        "quarantine": "missing", "executor": "missing", "registry": "missing",
    }

    def probe(key: str, touch: Callable[[], Any]) -> None:
        if not enabled:
            status[key] = "bypassed"
            return
        try:
            touch()
            status[key] = "ok"
        except Exception:
            status[key] = "missing"

    probe("clock",       lambda: cmpsbl_clock())       # type: ignore[name-defined]
    probe("state_store", lambda: cmpsbl_state())       # type: ignore[name-defined]
    probe("contracts",   lambda: cmpsbl_contracts())   # type: ignore[name-defined]
    probe("quarantine",  lambda: cmpsbl_quarantine())  # type: ignore[name-defined]
    probe("executor",    lambda: cmpsbl_execute)       # type: ignore[name-defined]
    probe("registry",    lambda: cmpsbl_registry())    # type: ignore[name-defined]

    def health() -> Dict[str, Any]:
        registry_count = 0
        quarantined_count = 0
        try:
            registry_count = cmpsbl_registry().count()  # type: ignore[name-defined]
        except Exception:
            pass
        try:
            quarantined_count = len(cmpsbl_quarantine().list())  # type: ignore[name-defined]
        except Exception:
            pass
        return {
            "enabled": enabled,
            "booted_at": booted_at,
            "boot_id": boot_id,
            "components": dict(status),
            "registry_count": registry_count,
            "quarantined_count": quarantined_count,
        }

    def shutdown() -> None:
        global _cmpsbl_kernel_handle
        try:
            cmpsbl_quarantine().sweep_expired()  # type: ignore[name-defined]
        except Exception:
            pass
        _cmpsbl_kernel_handle = None

    _cmpsbl_kernel_handle = {
        "boot_id": boot_id,
        "booted_at": booted_at,
        "enabled": enabled,
        "health": health,
        "shutdown": shutdown,
    }
    return _cmpsbl_kernel_handle


def cmpsbl_kernel() -> Optional[Dict[str, Any]]:
    return _cmpsbl_kernel_handle
`;

const BOOTSTRAP_WIRE_TS = `
// Bootstrap auto-wires by calling cmpsbl_boot() at module load. The handle is
// idempotent — re-importing or re-calling returns the same KernelHandle. Use
// cmpsbl_kernel().health() for ops dashboards; cmpsbl_kernel().shutdown() for
// graceful teardown in tests/replay flows.
if (_cmpsbl_kernel_enabled_bs()) {
  cmpsbl_boot();
}`;

const BOOTSTRAP_WIRE_PY = `
# Bootstrap auto-wires by calling cmpsbl_boot() at module load. The handle is
# idempotent — re-importing or re-calling returns the same kernel handle. Use
# cmpsbl_kernel()["health"]() for ops dashboards; cmpsbl_kernel()["shutdown"]()
# for graceful teardown in tests/replay flows.
if _cmpsbl_kernel_enabled_bs():
    cmpsbl_boot()`;

const KERNEL_BOOTSTRAP_CORE: CmpsblLayerDefinition = {
  id: 'kernel-bootstrap',
  name: 'Kernel Bootstrap',
  crownJewelRank: 47,
  cjpi: 94,
  module: 'GOVERNANCE',
  description:
    'Sealed, idempotent kernel entry point. Initializes the kernel quintet (Clock → StateStore → Contracts → Quarantine → Executor → Registry) in canonical order and returns a single KernelHandle exposing health() and shutdown(). Provides one audit point for boot, one health surface for ops, one shutdown hook for tests. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: BOOTSTRAP_TS,
  pyCode: BOOTSTRAP_PY,
  autoWire: {
    wrapperName: 'cmpsbl_boot',
    behavior:
      'Calls cmpsbl_boot() at module load to lock initialization order across the kernel. The returned handle is idempotent and exposes health()/shutdown() for ops and test flows.',
    tsWire: BOOTSTRAP_WIRE_TS,
    pyWire: BOOTSTRAP_WIRE_PY,
  },
};

export { KERNEL_BOOTSTRAP_CORE };
