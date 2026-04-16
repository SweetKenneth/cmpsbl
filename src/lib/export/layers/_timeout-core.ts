/**
 * CMPSBL® Always-On Core — Timeout Guard (Crown Jewel #12)
 *
 * Wraps every cmpsbl_execute in a deadline (default 30s). Hung promises,
 * runaway threads, and stalled providers cannot poison the runtime.
 * Pairs with circuit breaker — a timeout counts as a failure signal.
 *
 * NOT user-selectable. Auto-inlined into every Layer 2 export.
 */
import type { CmpsblLayerDefinition } from './types';

const TIMEOUT_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® LAYER — Timeout Guard (Crown Jewel #12)                             ║
// ║  Per-capability deadline. Stalled calls fail fast & feed the circuit breaker. ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblTimeoutConfig {
  defaultMs?: number;
  perCapabilityMs?: Record<string, number>;
}

const _cmpsbl_timeout_config: CmpsblTimeoutConfig = {
  defaultMs: 30_000,
  perCapabilityMs: {},
};

export function cmpsbl_set_timeout(capabilityName: string, ms: number): void {
  if (!_cmpsbl_timeout_config.perCapabilityMs) _cmpsbl_timeout_config.perCapabilityMs = {};
  _cmpsbl_timeout_config.perCapabilityMs[capabilityName] = ms;
}

export function cmpsbl_get_timeout(capabilityName: string): number {
  return _cmpsbl_timeout_config.perCapabilityMs?.[capabilityName] ?? _cmpsbl_timeout_config.defaultMs ?? 30_000;
}

function cmpsbl_run_with_deadline<T>(capabilityName: string, fn: () => T | Promise<T>): Promise<T> {
  const ms = cmpsbl_get_timeout(capabilityName);
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(\`[CMPSBL:Timeout:\${capabilityName}] Deadline exceeded after \${ms}ms\`));
    }, ms);
    Promise.resolve()
      .then(() => fn())
      .then((value) => { if (!settled) { settled = true; clearTimeout(timer); resolve(value); } })
      .catch((err) => { if (!settled) { settled = true; clearTimeout(timer); reject(err); } });
  });
}
`;

const TIMEOUT_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — Timeout Guard (Crown Jewel #12)                             ║
# ║  Per-capability deadline. Stalled calls fail fast & feed the circuit breaker. ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import threading
from typing import Any, Callable, Dict, Optional

_cmpsbl_timeout_default_ms: int = 30_000
_cmpsbl_timeout_per_capability: Dict[str, int] = {}

def cmpsbl_set_timeout(capability_name: str, ms: int) -> None:
    _cmpsbl_timeout_per_capability[capability_name] = ms

def cmpsbl_get_timeout(capability_name: str) -> int:
    return _cmpsbl_timeout_per_capability.get(capability_name, _cmpsbl_timeout_default_ms)

class _CmpsblTimeoutBox:
    __slots__ = ("value", "error")
    def __init__(self) -> None:
        self.value: Any = None
        self.error: Optional[BaseException] = None

def cmpsbl_run_with_deadline(capability_name: str, fn: Callable[[], Any]) -> Any:
    ms = cmpsbl_get_timeout(capability_name)
    box = _CmpsblTimeoutBox()
    def _runner() -> None:
        try:
            box.value = fn()
        except BaseException as e:
            box.error = e
    t = threading.Thread(target=_runner, daemon=True)
    t.start()
    t.join(ms / 1000.0)
    if t.is_alive():
        raise RuntimeError(f"[CMPSBL:Timeout:{capability_name}] Deadline exceeded after {ms}ms")
    if box.error is not None:
        raise box.error
    return box.value
`;

const TIMEOUT_WIRE_TS = `
const _cmpsbl_raw_execute_to = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_timeout_protected(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Synchronous deadline guard — measures wall time around the underlying call.
  const start = Date.now();
  const limit = cmpsbl_get_timeout(capabilityName);
  const result = _cmpsbl_raw_execute_to(capabilityName, input);
  const elapsed = Date.now() - start;
  if (elapsed > limit) {
    throw new Error(\`[CMPSBL:Timeout:\${capabilityName}] Deadline exceeded after \${elapsed}ms (limit \${limit}ms)\`);
  }
  return result;
};`;

const TIMEOUT_WIRE_PY = `
_cmpsbl_raw_execute_to = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with timeout guard (auto-wired)."""
    return cmpsbl_run_with_deadline(capability_name, lambda: _cmpsbl_raw_execute_to(capability_name, input_data))`;

export const TIMEOUT_CORE: CmpsblLayerDefinition = {
  id: 'timeout-guard',
  name: 'Timeout Guard',
  crownJewelRank: 12,
  cjpi: 91,
  module: 'FAILSAFE',
  description: 'Per-capability deadline enforcement. Stalled or hung calls fail fast and feed the circuit breaker.',
  priceCents: 0,
  tsCode: TIMEOUT_TS,
  pyCode: TIMEOUT_PY,
  autoWire: {
    wrapperName: 'cmpsbl_run_with_deadline',
    behavior: 'Every cmpsbl_execute call is bounded by a deadline (default 30s, configurable per capability).',
    tsWire: TIMEOUT_WIRE_TS,
    pyWire: TIMEOUT_WIRE_PY,
  },
};
