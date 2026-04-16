/**
 * CMPSBL® Always-On Core — Trace ID Propagation (Crown Jewel #15)
 *
 * Auto-generates a correlation ID for each cmpsbl_execute call. The ID
 * is threaded through the envelope, the BEACON signal, and any structured
 * log emission. Cheap, language-portable, massive operational value.
 *
 * NOT user-selectable. Auto-inlined into every Layer 2 export.
 */
import type { CmpsblLayerDefinition } from './types';

const TRACE_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Trace ID Propagation (Layer #15 · Always-On)              ║
// ║  Per-execution correlation ID. Threaded through envelope + BEACON signal.     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

let _cmpsbl_trace_counter = 0;
let _cmpsbl_current_trace_id: string | null = null;

export function cmpsbl_new_trace_id(): string {
  _cmpsbl_trace_counter = (_cmpsbl_trace_counter + 1) % 1_000_000;
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  const seq = _cmpsbl_trace_counter.toString(36).padStart(4, '0');
  return \`cmp_\${ts}_\${rnd}_\${seq}\`;
}

export function cmpsbl_current_trace_id(): string | null {
  return _cmpsbl_current_trace_id;
}

export function cmpsbl_with_trace<T>(traceId: string, fn: () => T): T {
  const prev = _cmpsbl_current_trace_id;
  _cmpsbl_current_trace_id = traceId;
  try { return fn(); }
  finally { _cmpsbl_current_trace_id = prev; }
}
`;

const TRACE_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Trace ID Propagation (Layer #15 · Always-On)              ║
# ║  Per-execution correlation ID. Threaded through envelope + BEACON signal.     ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import contextvars
import random
import time
from typing import Any, Callable, Optional

_cmpsbl_trace_counter: int = 0
_cmpsbl_current_trace: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    "cmpsbl_current_trace", default=None
)

def cmpsbl_new_trace_id() -> str:
    global _cmpsbl_trace_counter
    _cmpsbl_trace_counter = (_cmpsbl_trace_counter + 1) % 1_000_000
    ts = format(int(time.time() * 1000), "x")
    rnd = format(random.getrandbits(32), "x")[:6]
    seq = format(_cmpsbl_trace_counter, "x").rjust(4, "0")
    return f"cmp_{ts}_{rnd}_{seq}"

def cmpsbl_current_trace_id() -> Optional[str]:
    return _cmpsbl_current_trace.get()

def cmpsbl_with_trace(trace_id: str, fn: Callable[[], Any]) -> Any:
    token = _cmpsbl_current_trace.set(trace_id)
    try:
        return fn()
    finally:
        _cmpsbl_current_trace.reset(token)
`;

const TRACE_WIRE_TS = `
const _cmpsbl_raw_execute_tr = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_traced(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const traceId = cmpsbl_new_trace_id();
  return cmpsbl_with_trace(traceId, () => _cmpsbl_raw_execute_tr(capabilityName, input));
};`;

const TRACE_WIRE_PY = `
_cmpsbl_raw_execute_tr = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with trace-id propagation (auto-wired)."""
    trace_id = cmpsbl_new_trace_id()
    return cmpsbl_with_trace(trace_id, lambda: _cmpsbl_raw_execute_tr(capability_name, input_data))`;

export const TRACE_CORE: CmpsblLayerDefinition = {
  id: 'trace-id',
  name: 'Trace ID Propagation',
  crownJewelRank: 15,
  cjpi: 86,
  module: 'BEACON',
  description: 'Auto-generated correlation ID per execution, threaded through envelope, signals, and structured logs.',
  priceCents: 0,
  tsCode: TRACE_TS,
  pyCode: TRACE_PY,
  autoWire: {
    wrapperName: 'cmpsbl_with_trace',
    behavior: 'Every cmpsbl_execute call receives a unique trace ID accessible via cmpsbl_current_trace_id() within the call scope.',
    tsWire: TRACE_WIRE_TS,
    pyWire: TRACE_WIRE_PY,
  },
};
