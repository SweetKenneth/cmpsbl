/**
 * CMPSBL® Always-On Core — Graceful Degradation Hook (Crown Jewel #16)
 *
 * When the circuit is open OR retries are exhausted, return a typed
 * `{ ok: false, degraded: true, fallback?: ... }` envelope instead of
 * throwing. Caller decides whether to use the fallback. This is one of
 * the four non-negotiables.
 *
 * NOT user-selectable. Auto-inlined into every Layer 2 export.
 */
import type { CmpsblLayerDefinition } from './types';

const DEGRADATION_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Graceful Degradation Hook (Layer #16 · Always-On)         ║
// ║  When everything else fails, surface a typed degraded envelope, never throw.  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

export interface CmpsblDegradedResult {
  ok: false;
  degraded: true;
  capability: string;
  reason: string;
  fallback: unknown | null;
  traceId: string | null;
}

const _cmpsbl_fallback_registry = new Map<string, () => unknown>();

export function cmpsbl_register_fallback(capabilityName: string, fn: () => unknown): void {
  _cmpsbl_fallback_registry.set(capabilityName, fn);
}

export function cmpsbl_get_fallback(capabilityName: string): unknown | null {
  const fn = _cmpsbl_fallback_registry.get(capabilityName);
  if (!fn) return null;
  try { return fn(); } catch { return null; }
}

export function cmpsbl_to_degraded(capability: string, reason: string, traceId: string | null): CmpsblDegradedResult {
  return {
    ok: false,
    degraded: true,
    capability,
    reason,
    fallback: cmpsbl_get_fallback(capability),
    traceId,
  };
}
`;

const DEGRADATION_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Graceful Degradation Hook (Layer #16 · Always-On)         ║
# ║  When everything else fails, surface a typed degraded envelope, never raise.  ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

from typing import Any, Callable, Dict, Optional

_cmpsbl_fallback_registry: Dict[str, Callable[[], Any]] = {}

def cmpsbl_register_fallback(capability_name: str, fn: Callable[[], Any]) -> None:
    _cmpsbl_fallback_registry[capability_name] = fn

def cmpsbl_get_fallback(capability_name: str) -> Any:
    fn = _cmpsbl_fallback_registry.get(capability_name)
    if fn is None:
        return None
    try:
        return fn()
    except BaseException:
        return None

def cmpsbl_to_degraded(capability: str, reason: str, trace_id: Optional[str]) -> Dict[str, Any]:
    return {
        "ok": False,
        "degraded": True,
        "capability": capability,
        "reason": reason,
        "fallback": cmpsbl_get_fallback(capability),
        "trace_id": trace_id,
    }
`;

const DEGRADATION_WIRE_TS = `
// Sealed wrapper — proprietary.`;

const DEGRADATION_WIRE_PY = `
# Sealed wrapper — proprietary.`;

export const DEGRADATION_CORE: CmpsblLayerDefinition = {
  id: 'graceful-degradation',
  name: 'Graceful Degradation',
  crownJewelRank: 16,
  cjpi: 92,
  module: 'FAILSAFE',
  description: 'When circuit is open or retries exhaust, return a typed degraded envelope with optional registered fallback instead of throwing.',
  priceCents: 0,
  tsCode: DEGRADATION_TS,
  pyCode: DEGRADATION_PY,
  autoWire: {
    wrapperName: 'cmpsbl_to_degraded',
    behavior: 'Failures that cannot be recovered surface a degraded envelope instead of throwing; callers may register fallbacks per capability.',
    tsWire: DEGRADATION_WIRE_TS,
    pyWire: DEGRADATION_WIRE_PY,
  },
};
