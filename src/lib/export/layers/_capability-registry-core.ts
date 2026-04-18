/**
 * CMPSBL® Always-On Core — Capability Registry (Kernel Component #6)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Named function registry for the kernel. Lets callers register functions
 * once and dispatch by name through cmpsbl_execute, instead of passing
 * fn references on every call.
 *
 * API:
 *   • register(name, fn, opts?)  → opts: { contract?, effects?, version? }
 *   • get(name)                  → CapabilityHandle | null
 *   • list()                     → CapabilityHandle[]
 *   • unregister(name)           → boolean
 *   • invoke(name, args)         → routes through cmpsbl_execute
 *
 * Side-benefits unlocked:
 *   • remote / RPC dispatch
 *   • dynamic governance (block by name)
 *   • replay (name + args is the full call)
 *   • upgrade-in-place (register a new version under same name)
 *
 * Gated by CMPSBL_KERNEL_ENABLED (default ON). When OFF, register/get
 * still work as a plain map but invoke() bypasses kernel checks.
 *
 * Module: GOVERNANCE  ·  CJPI: 95  ·  Crown Jewel #46
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const REGISTRY_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Capability Registry (sealed module, proprietary).         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblCapabilityOpts {
  contract?: { input?: Record<string, string>; output?: Record<string, string> };
  effects?: 'pure' | 'io' | 'network' | 'mutation';
  version?: string;
}

interface CmpsblCapabilityHandle {
  name: string;
  version: string;
  effects: string;
  registeredAt: number;
  invocations: number;
}

function _cmpsbl_kernel_enabled_cr(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

interface _CmpsblCapabilityEntry {
  fn: (...args: unknown[]) => unknown;
  handle: CmpsblCapabilityHandle;
}

class CmpsblCapabilityRegistry {
  private entries: Map<string, _CmpsblCapabilityEntry> = new Map();
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_cr(); }

  register(name: string, fn: (...args: unknown[]) => unknown, opts: CmpsblCapabilityOpts = {}): CmpsblCapabilityHandle {
    if (!name || typeof fn !== 'function') {
      throw new Error('cmpsbl_registry: name and fn are required');
    }
    const handle: CmpsblCapabilityHandle = {
      name,
      version: opts.version || '1.0.0',
      effects: opts.effects || 'io',
      registeredAt: Date.now(),
      invocations: 0,
    };
    this.entries.set(name, { fn, handle });

    // Auto-register contract if provided and ContractValidator is available.
    if (opts.contract && typeof cmpsbl_contracts === 'function') {
      try { cmpsbl_contracts().register({ name, input: opts.contract.input, output: opts.contract.output }); }
      catch { /* contract registration best-effort */ }
    }
    return { ...handle };
  }

  get(name: string): CmpsblCapabilityHandle | null {
    const e = this.entries.get(name);
    return e ? { ...e.handle } : null;
  }

  getFn(name: string): ((...args: unknown[]) => unknown) | null {
    const e = this.entries.get(name);
    return e ? e.fn : null;
  }

  list(): CmpsblCapabilityHandle[] {
    return [...this.entries.values()].map(e => ({ ...e.handle }));
  }

  unregister(name: string): boolean {
    return this.entries.delete(name);
  }

  async invoke(name: string, args: unknown[] = []): Promise<unknown> {
    const e = this.entries.get(name);
    if (!e) {
      return { ok: false, error: { code: 'CAPABILITY_NOT_FOUND', message: 'Capability not registered: ' + name, name }, durationMs: 0 };
    }
    e.handle.invocations += 1;
    if (this.enabled && typeof cmpsbl_execute === 'function') {
      return cmpsbl_execute(name, e.fn, args);
    }
    // Bypass path
    try {
      const value = await e.fn(...args);
      return { ok: true, value, durationMs: 0 };
    } catch (err) {
      const e2 = err instanceof Error ? err : new Error(String(err));
      return { ok: false, error: { code: 'EXEC_ERROR', message: e2.message, name }, durationMs: 0 };
    }
  }

  count(): number { return this.entries.size; }
}

const _cmpsbl_registry = new CmpsblCapabilityRegistry();

function cmpsbl_registry(): CmpsblCapabilityRegistry {
  return _cmpsbl_registry;
}
`;

const REGISTRY_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Capability Registry (sealed module, proprietary).         ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
import inspect
from typing import Any, Callable, Dict, List, Optional


def _cmpsbl_kernel_enabled_cr() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


class CmpsblCapabilityRegistry:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_cr()
        self._entries: Dict[str, Dict[str, Any]] = {}

    def register(self, name: str, fn: Callable[..., Any], opts: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not name or not callable(fn):
            raise ValueError("cmpsbl_registry: name and fn are required")
        opts = opts or {}
        handle = {
            "name": name,
            "version": opts.get("version", "1.0.0"),
            "effects": opts.get("effects", "io"),
            "registered_at": int(time.time() * 1000),
            "invocations": 0,
        }
        self._entries[name] = {"fn": fn, "handle": handle}

        contract = opts.get("contract")
        if contract:
            try:
                cmpsbl_contracts().register({  # type: ignore[name-defined]
                    "name": name,
                    "input": contract.get("input"),
                    "output": contract.get("output"),
                })
            except Exception:
                pass
        return dict(handle)

    def get(self, name: str) -> Optional[Dict[str, Any]]:
        e = self._entries.get(name)
        return dict(e["handle"]) if e else None

    def get_fn(self, name: str) -> Optional[Callable[..., Any]]:
        e = self._entries.get(name)
        return e["fn"] if e else None

    def list(self) -> List[Dict[str, Any]]:
        return [dict(e["handle"]) for e in self._entries.values()]

    def unregister(self, name: str) -> bool:
        return self._entries.pop(name, None) is not None

    async def invoke(self, name: str, args: Optional[List[Any]] = None) -> Dict[str, Any]:
        args = args or []
        e = self._entries.get(name)
        if not e:
            return {"ok": False, "error": {"code": "CAPABILITY_NOT_FOUND", "message": "Capability not registered: " + name, "name": name}, "duration_ms": 0}
        e["handle"]["invocations"] += 1
        if self._enabled:
            try:
                return await cmpsbl_execute(name, e["fn"], args)  # type: ignore[name-defined]
            except NameError:
                pass
        try:
            result = e["fn"](*args)
            if inspect.isawaitable(result):
                result = await result
            return {"ok": True, "value": result, "duration_ms": 0}
        except Exception as err:
            return {"ok": False, "error": {"code": "EXEC_ERROR", "message": str(err), "name": name}, "duration_ms": 0}

    def count(self) -> int:
        return len(self._entries)


_cmpsbl_registry = CmpsblCapabilityRegistry()


def cmpsbl_registry() -> CmpsblCapabilityRegistry:
    return _cmpsbl_registry
`;

const REGISTRY_WIRE_TS = `
// Capability Registry exposes name-based dispatch for cmpsbl_execute.
// Customer / layer code calls cmpsbl_registry().register(name, fn, opts)
// at module load, then invokes via cmpsbl_registry().invoke(name, args)
// or remote callers (RPC/replay) reference capabilities by name.
if (_cmpsbl_kernel_enabled_cr()) {
  void cmpsbl_registry();
}`;

const REGISTRY_WIRE_PY = `
# Capability Registry exposes name-based dispatch for cmpsbl_execute.
# Customer / layer code calls cmpsbl_registry().register(name, fn, opts)
# at module load, then invokes via cmpsbl_registry().invoke(name, args)
# or remote callers (RPC/replay) reference capabilities by name.
if _cmpsbl_kernel_enabled_cr():
    _ = cmpsbl_registry()`;

const CAPABILITY_REGISTRY_CORE: CmpsblLayerDefinition = {
  id: 'capability-registry',
  name: 'Capability Registry',
  crownJewelRank: 46,
  cjpi: 95,
  module: 'GOVERNANCE',
  description:
    'Kernel-grade named function registry. Lets callers register functions once with optional contract/effects/version, then dispatch by name through cmpsbl_execute. Unlocks RPC dispatch, dynamic governance, replay, and in-place version upgrades. Auto-wires registered contracts to ContractValidator. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: REGISTRY_TS,
  pyCode: REGISTRY_PY,
  autoWire: {
    wrapperName: 'cmpsbl_registry',
    behavior:
      'Initializes the capability registry at module load. Layers and customer code call register(name, fn, opts) to publish capabilities; invoke(name, args) routes through cmpsbl_execute for governed dispatch.',
    tsWire: REGISTRY_WIRE_TS,
    pyWire: REGISTRY_WIRE_PY,
  },
};

export { CAPABILITY_REGISTRY_CORE };
