/**
 * CMPSBL® Always-On Core — BEACON Health Signal (Crown Jewel #17)
 *
 * Every execution emits a structured signal:
 *   { capability, durationMs, ok, circuitState, retryCount, traceId, ts }
 * Default sink is a bounded in-memory ring buffer. Consumers can attach
 * their own sink (Datadog, OTel, console) via cmpsbl_beacon_subscribe().
 *
 * NOT user-selectable. Auto-inlined into every Layer 2 export.
 */
import type { CmpsblLayerDefinition } from './types';

const BEACON_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

export interface CmpsblBeaconSignal {
  capability: string;
  ok: boolean;
  durationMs: number;
  circuitState?: string;
  retryCount?: number;
  errorCode?: string;
  traceId: string | null;
  ts: number;
}

type CmpsblBeaconSink = (signal: CmpsblBeaconSignal) => void;

const _CMPSBL_BEACON_RING_MAX = 500;
const _cmpsbl_beacon_ring: CmpsblBeaconSignal[] = [];
const _cmpsbl_beacon_sinks: CmpsblBeaconSink[] = [];

export function cmpsbl_beacon_subscribe(sink: CmpsblBeaconSink): () => void {
  _cmpsbl_beacon_sinks.push(sink);
  return () => {
    const i = _cmpsbl_beacon_sinks.indexOf(sink);
    if (i >= 0) _cmpsbl_beacon_sinks.splice(i, 1);
  };
}

export function cmpsbl_beacon_emit(signal: CmpsblBeaconSignal): void {
  _cmpsbl_beacon_ring.push(signal);
  if (_cmpsbl_beacon_ring.length > _CMPSBL_BEACON_RING_MAX) _cmpsbl_beacon_ring.shift();
  for (const sink of _cmpsbl_beacon_sinks) {
    try { sink(signal); } catch { /* sink errors must never break execution */ }
  }
}

export function cmpsbl_beacon_recent(limit = 50): CmpsblBeaconSignal[] {
  return _cmpsbl_beacon_ring.slice(-limit);
}

export function cmpsbl_beacon_health(): { totalCalls: number; okRate: number; avgDurationMs: number } {
  if (_cmpsbl_beacon_ring.length === 0) return { totalCalls: 0, okRate: 1, avgDurationMs: 0 };
  const ok = _cmpsbl_beacon_ring.filter(s => s.ok).length;
  const sumMs = _cmpsbl_beacon_ring.reduce((a, s) => a + s.durationMs, 0);
  return {
    totalCalls: _cmpsbl_beacon_ring.length,
    okRate: ok / _cmpsbl_beacon_ring.length,
    avgDurationMs: sumMs / _cmpsbl_beacon_ring.length,
  };
}
`;

const BEACON_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
from typing import Any, Callable, Dict, List, Optional

_CMPSBL_BEACON_RING_MAX = 500
_cmpsbl_beacon_ring: List[Dict[str, Any]] = []
_cmpsbl_beacon_sinks: List[Callable[[Dict[str, Any]], None]] = []

def cmpsbl_beacon_subscribe(sink: Callable[[Dict[str, Any]], None]) -> Callable[[], None]:
    _cmpsbl_beacon_sinks.append(sink)
    def _unsubscribe() -> None:
        if sink in _cmpsbl_beacon_sinks:
            _cmpsbl_beacon_sinks.remove(sink)
    return _unsubscribe

def cmpsbl_beacon_emit(signal: Dict[str, Any]) -> None:
    _cmpsbl_beacon_ring.append(signal)
    if len(_cmpsbl_beacon_ring) > _CMPSBL_BEACON_RING_MAX:
        _cmpsbl_beacon_ring.pop(0)
    for sink in _cmpsbl_beacon_sinks:
        try:
            sink(signal)
        except BaseException:
            # Sink errors must never break execution.
            pass

def cmpsbl_beacon_recent(limit: int = 50) -> List[Dict[str, Any]]:
    return list(_cmpsbl_beacon_ring[-limit:])

def cmpsbl_beacon_health() -> Dict[str, Any]:
    if not _cmpsbl_beacon_ring:
        return {"total_calls": 0, "ok_rate": 1.0, "avg_duration_ms": 0.0}
    ok = sum(1 for s in _cmpsbl_beacon_ring if s.get("ok"))
    sum_ms = sum(s.get("duration_ms", 0) for s in _cmpsbl_beacon_ring)
    n = len(_cmpsbl_beacon_ring)
    return {"total_calls": n, "ok_rate": ok / n, "avg_duration_ms": sum_ms / n}
`;

const BEACON_WIRE_TS = `
// Sealed wrapper — proprietary.
const _cmpsbl_raw_execute_bc = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_beaconed(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const startedAt = Date.now();
  const traceId = (typeof cmpsbl_current_trace_id === 'function' ? cmpsbl_current_trace_id() : null) ?? null;
  try {
    const result = _cmpsbl_raw_execute_bc(capabilityName, input);
    cmpsbl_beacon_emit({
      capability: capabilityName, ok: true, durationMs: Date.now() - startedAt,
      traceId, ts: Date.now(),
    });
    return result;
  } catch (err) {
    const cls = (typeof cmpsbl_classify_error === 'function')
      ? cmpsbl_classify_error(err)
      : { code: 'CMPSBL_UNKNOWN' as const, retryable: false, message: String(err) };
    cmpsbl_beacon_emit({
      capability: capabilityName, ok: false, durationMs: Date.now() - startedAt,
      errorCode: cls.code, traceId, ts: Date.now(),
    });
    throw err;
  }
};`;

const BEACON_WIRE_PY = `
_cmpsbl_raw_execute_bc = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with BEACON health signal emission (auto-wired, outermost)."""
    started_at = time.time()
    trace_id = cmpsbl_current_trace_id() if "cmpsbl_current_trace_id" in globals() else None
    try:
        result = _cmpsbl_raw_execute_bc(capability_name, input_data)
        cmpsbl_beacon_emit({
            "capability": capability_name, "ok": True,
            "duration_ms": int((time.time() - started_at) * 1000),
            "trace_id": trace_id, "ts": int(time.time() * 1000),
        })
        return result
    except BaseException as err:
        cls = cmpsbl_classify_error(err) if "cmpsbl_classify_error" in globals() else {"code": "CMPSBL_UNKNOWN"}
        cmpsbl_beacon_emit({
            "capability": capability_name, "ok": False,
            "duration_ms": int((time.time() - started_at) * 1000),
            "error_code": cls.get("code"), "trace_id": trace_id, "ts": int(time.time() * 1000),
        })
        raise`;

export const BEACON_CORE: CmpsblLayerDefinition = {
  id: 'beacon-signal',
  name: 'BEACON Health Signal',
  crownJewelRank: 17,
  cjpi: 90,
  module: 'BEACON',
  description: 'Per-execution structured health signal with pluggable sinks. Bounded in-memory ring buffer by default; subscribers receive every signal.',
  priceCents: 0,
  tsCode: BEACON_TS,
  pyCode: BEACON_PY,
  autoWire: {
    wrapperName: 'cmpsbl_beacon_emit',
    behavior: 'Sealed wrapper — proprietary.',
    tsWire: BEACON_WIRE_TS,
    pyWire: BEACON_WIRE_PY,
  },
};
