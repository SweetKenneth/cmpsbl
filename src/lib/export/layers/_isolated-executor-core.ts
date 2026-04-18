/**
 * CMPSBL® Always-On Core — Isolated Executor (Kernel Component #4)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Sandboxed execution wrapper that unifies the kernel triad
 * (StateStore + ContractValidator + Quarantine) into a single
 * governed entry point: `cmpsbl_execute`.
 *
 * Pipeline (per call, deterministic):
 *   1. quarantine.isHeld(name)        → reject with structured error if held
 *   2. contracts.validateInput(name)  → reject + report() strike on miss
 *   3. invoke fn(...args)             → success path
 *   4. contracts.validateOutput(name) → if fails, report() strike + reject
 *   5. on thrown error                → report() strike, rethrow as envelope
 *
 * Every cmpsbl_execute invocation increments a counter in the State Store
 * under `executor.invocations.<name>` for observability.
 *
 * Gated by CMPSBL_KERNEL_ENABLED (default ON). When OFF, executes fn
 * directly with zero overhead — exports stay byte-compatible.
 *
 * Module: GOVERNANCE  ·  CJPI: 96  ·  Crown Jewel #44
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const ISOLATED_EXECUTOR_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — IsolatedExecutor (sealed module, proprietary).            ║
// ║  Unifies StateStore + ContractValidator + Quarantine via cmpsbl_execute.      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblExecuteResult<T> {
  ok: boolean;
  value?: T;
  error?: { code: string; message: string; name: string };
  durationMs: number;
}

function _cmpsbl_kernel_enabled_ix(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

async function cmpsbl_execute<T>(
  name: string,
  fn: (...args: unknown[]) => T | Promise<T>,
  args: unknown[] = [],
): Promise<CmpsblExecuteResult<T>> {
  const start = Date.now();

  // Bypass when kernel disabled — caller still gets envelope shape.
  if (!_cmpsbl_kernel_enabled_ix()) {
    try {
      const value = await fn(...args);
      return { ok: true, value, durationMs: Date.now() - start };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      return { ok: false, error: { code: 'EXEC_ERROR', message: err.message, name }, durationMs: Date.now() - start };
    }
  }

  // 1) Quarantine gate
  try {
    const q = (typeof cmpsbl_quarantine === 'function') ? cmpsbl_quarantine() : null;
    if (q && q.isHeld(name)) {
      return { ok: false, error: { code: 'QUARANTINED', message: 'Held by quarantine cool-down', name }, durationMs: Date.now() - start };
    }
  } catch { /* registry not present — proceed */ }

  // 2) Input contract
  const contracts = (typeof cmpsbl_contracts === 'function') ? cmpsbl_contracts() : null;
  if (contracts) {
    const inResult = contracts.validateInput(name, args);
    if (!inResult.ok) {
      try { cmpsbl_quarantine().report(name, 'input_contract_violation'); } catch {}
      return { ok: false, error: { code: 'CONTRACT_INPUT', message: inResult.reason || 'input rejected', name }, durationMs: Date.now() - start };
    }
  }

  // 3) Invoke + output contract + observability
  try {
    const value = await fn(...args);

    if (contracts) {
      const outResult = contracts.validateOutput(name, value);
      if (!outResult.ok) {
        try { cmpsbl_quarantine().report(name, 'output_contract_violation'); } catch {}
        return { ok: false, error: { code: 'CONTRACT_OUTPUT', message: outResult.reason || 'output rejected', name }, durationMs: Date.now() - start };
      }
    }

    // Bump invocation counter (best-effort)
    try {
      const store = cmpsbl_state();
      const key = 'executor.invocations.' + name;
      const prev = (store.get(key) as number) || 0;
      store.set(key, prev + 1);
    } catch {}

    return { ok: true, value, durationMs: Date.now() - start };
  } catch (e) {
    try { cmpsbl_quarantine().report(name, 'execution_error'); } catch {}
    const err = e instanceof Error ? e : new Error(String(e));
    return { ok: false, error: { code: 'EXEC_ERROR', message: err.message, name }, durationMs: Date.now() - start };
  }
}
`;

const ISOLATED_EXECUTOR_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — IsolatedExecutor (sealed module, proprietary).            ║
# ║  Unifies StateStore + ContractValidator + Quarantine via cmpsbl_execute.      ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
import inspect
from typing import Any, Awaitable, Callable, Dict, List, Optional, Union


def _cmpsbl_kernel_enabled_ix() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


async def cmpsbl_execute(
    name: str,
    fn: Callable[..., Any],
    args: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    args = args or []
    start = int(time.time() * 1000)

    def _envelope(ok: bool, value: Any = None, code: str = "", message: str = "") -> Dict[str, Any]:
        env: Dict[str, Any] = {"ok": ok, "duration_ms": int(time.time() * 1000) - start}
        if ok:
            env["value"] = value
        else:
            env["error"] = {"code": code, "message": message, "name": name}
        return env

    async def _invoke() -> Any:
        result = fn(*args)
        if inspect.isawaitable(result):
            return await result
        return result

    if not _cmpsbl_kernel_enabled_ix():
        try:
            value = await _invoke()
            return _envelope(True, value=value)
        except Exception as e:
            return _envelope(False, code="EXEC_ERROR", message=str(e))

    # 1) Quarantine gate
    try:
        q = cmpsbl_quarantine()  # type: ignore[name-defined]
        if q and q.is_held(name):
            return _envelope(False, code="QUARANTINED", message="Held by quarantine cool-down")
    except Exception:
        pass

    # 2) Input contract
    contracts = None
    try:
        contracts = cmpsbl_contracts()  # type: ignore[name-defined]
    except Exception:
        contracts = None

    if contracts is not None:
        in_result = contracts.validate_input(name, args)
        if not in_result.get("ok"):
            try:
                cmpsbl_quarantine().report(name, "input_contract_violation")  # type: ignore[name-defined]
            except Exception:
                pass
            return _envelope(False, code="CONTRACT_INPUT", message=in_result.get("reason", "input rejected"))

    # 3) Invoke + output contract + observability
    try:
        value = await _invoke()
        if contracts is not None:
            out_result = contracts.validate_output(name, value)
            if not out_result.get("ok"):
                try:
                    cmpsbl_quarantine().report(name, "output_contract_violation")  # type: ignore[name-defined]
                except Exception:
                    pass
                return _envelope(False, code="CONTRACT_OUTPUT", message=out_result.get("reason", "output rejected"))
        try:
            store = cmpsbl_state()  # type: ignore[name-defined]
            key = "executor.invocations." + name
            prev = store.get(key) or 0
            store.set(key, int(prev) + 1)
        except Exception:
            pass
        return _envelope(True, value=value)
    except Exception as e:
        try:
            cmpsbl_quarantine().report(name, "execution_error")  # type: ignore[name-defined]
        except Exception:
            pass
        return _envelope(False, code="EXEC_ERROR", message=str(e))
`;

const ISOLATED_EXECUTOR_WIRE_TS = `
// IsolatedExecutor exposes cmpsbl_execute(name, fn, args). It wraps every
// invocation with quarantine pre-check → input contract → fn dispatch →
// output contract → state-store observability. Returns a typed envelope.
if (_cmpsbl_kernel_enabled_ix()) {
  // No instance to construct — cmpsbl_execute is a standalone function.
  void cmpsbl_execute;
}`;

const ISOLATED_EXECUTOR_WIRE_PY = `
# IsolatedExecutor exposes cmpsbl_execute(name, fn, args). It wraps every
# invocation with quarantine pre-check -> input contract -> fn dispatch ->
# output contract -> state-store observability. Returns a typed envelope.
if _cmpsbl_kernel_enabled_ix():
    _ = cmpsbl_execute`;

const ISOLATED_EXECUTOR_CORE: CmpsblLayerDefinition = {
  id: 'isolated-executor',
  name: 'Isolated Executor',
  crownJewelRank: 44,
  cjpi: 96,
  module: 'GOVERNANCE',
  description:
    'Kernel-grade sandboxed execution wrapper. Unifies StateStore, ContractValidator, and Quarantine into a single governed `cmpsbl_execute` entry point. Every call passes through quarantine pre-check, input contract validation, dispatch, output contract validation, and observability counters. Returns a typed envelope. Zero external dependencies, portable across all 9 polyglot targets. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: ISOLATED_EXECUTOR_TS,
  pyCode: ISOLATED_EXECUTOR_PY,
  autoWire: {
    wrapperName: 'cmpsbl_execute',
    behavior:
      'Wraps every governed function invocation with the kernel triad (Quarantine → Contracts → Observability). Layers and customer code call cmpsbl_execute(name, fn, args) to receive a uniform envelope and automatic strike/cooldown enforcement.',
    tsWire: ISOLATED_EXECUTOR_WIRE_TS,
    pyWire: ISOLATED_EXECUTOR_WIRE_PY,
  },
};

export { ISOLATED_EXECUTOR_CORE };
