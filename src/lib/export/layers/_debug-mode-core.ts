/**
 * CMPSBL® Always-On Core — Debug Surface (Bonus, opt-in)
 *
 * Honest observability for developers running the export. When debug mode
 * is OFF (default), this layer is byte-equivalent to a no-op — zero stdout,
 * zero behavioral change, zero performance cost beyond a single boolean check.
 *
 * When ON (env CMPSBL_DEBUG=1 or input flag _cmpsbl_debug:true), it:
 *   1. Prints the active layer roster ONCE per process on first execute call.
 *   2. Subscribes to the existing BEACON ring and prints one line per real
 *      signal: [CMPSBL] {capability} ok|FAIL ({ms}ms){ via {errorCode}}
 *
 * It NEVER fabricates triggers. It only surfaces signals BEACON already emits.
 * That preserves the "honest signal only" contract — no synthetic events.
 *
 * NOT user-selectable. Auto-inlined into every Layer 2 export.
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const DEBUG_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Debug Surface (opt-in, honest signal only).                ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

const _CMPSBL_DEBUG_ENV: boolean = (() => {
  try {
    const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process;
    const v = proc?.env?.CMPSBL_DEBUG;
    return v === '1' || v === 'true' || v === 'on';
  } catch { return false; }
})();

let _cmpsbl_debug_banner_shown = false;
let _cmpsbl_debug_subscribed = false;

function _cmpsbl_debug_active(input: Record<string, unknown>): boolean {
  if (_CMPSBL_DEBUG_ENV) return true;
  const flag = (input as { _cmpsbl_debug?: unknown })._cmpsbl_debug;
  return flag === true || flag === 1 || flag === '1';
}

function _cmpsbl_debug_layers(): string[] {
  // Reflects only layers whose runtime symbols actually exist in this build.
  const layers: string[] = [];
  const g = globalThis as Record<string, unknown>;
  if (typeof g.cmpsbl_get_breaker === 'function') layers.push('CIRCUIT-BREAKER');
  if (typeof g.cmpsbl_run_with_deadline === 'function') layers.push('TIMEOUT');
  if (typeof g.cmpsbl_retry === 'function' || typeof g.cmpsbl_retry_call === 'function') layers.push('RETRY');
  if (typeof g.cmpsbl_envelope === 'function' || typeof g.cmpsbl_wrap_envelope === 'function') layers.push('ENVELOPE');
  if (typeof g.cmpsbl_current_trace_id === 'function') layers.push('TRACE');
  if (typeof g.cmpsbl_degrade === 'function' || typeof g.cmpsbl_fallback === 'function') layers.push('DEGRADATION');
  if (typeof g.cmpsbl_beacon_emit === 'function') layers.push('BEACON');
  return layers;
}

function _cmpsbl_debug_banner(capabilityName: string): void {
  if (_cmpsbl_debug_banner_shown) return;
  _cmpsbl_debug_banner_shown = true;
  const layers = _cmpsbl_debug_layers();
  console.log('[CMPSBL] Layers active: ' + (layers.length ? layers.join(', ') : '(none detected)'));
  console.log('[CMPSBL] First call: ' + capabilityName);
  // Subscribe ONCE so each real BEACON signal surfaces a one-line confirmation.
  if (!_cmpsbl_debug_subscribed && typeof cmpsbl_beacon_subscribe === 'function') {
    _cmpsbl_debug_subscribed = true;
    cmpsbl_beacon_subscribe((sig: { capability: string; ok: boolean; durationMs: number; errorCode?: string }) => {
      const status = sig.ok ? 'ok' : 'FAIL';
      const via = sig.errorCode ? ' via ' + sig.errorCode : '';
      console.log('[CMPSBL] ' + sig.capability + ' ' + status + ' (' + sig.durationMs + 'ms)' + via);
    });
  }
}
`;

const DEBUG_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Debug Surface (opt-in, honest signal only).                ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os as _cmpsbl_dbg_os

_CMPSBL_DEBUG_ENV: bool = _cmpsbl_dbg_os.environ.get("CMPSBL_DEBUG", "").lower() in ("1", "true", "on")
_cmpsbl_debug_banner_shown: bool = False
_cmpsbl_debug_subscribed: bool = False

def _cmpsbl_debug_active(input_data: dict) -> bool:
    if _CMPSBL_DEBUG_ENV:
        return True
    flag = input_data.get("_cmpsbl_debug")
    return flag is True or flag == 1 or flag == "1"

def _cmpsbl_debug_layers() -> list:
    layers = []
    g = globals()
    if callable(g.get("cmpsbl_get_breaker")): layers.append("CIRCUIT-BREAKER")
    if callable(g.get("cmpsbl_run_with_deadline")): layers.append("TIMEOUT")
    if callable(g.get("cmpsbl_retry")) or callable(g.get("cmpsbl_retry_call")): layers.append("RETRY")
    if callable(g.get("cmpsbl_envelope")) or callable(g.get("cmpsbl_wrap_envelope")): layers.append("ENVELOPE")
    if callable(g.get("cmpsbl_current_trace_id")): layers.append("TRACE")
    if callable(g.get("cmpsbl_degrade")) or callable(g.get("cmpsbl_fallback")): layers.append("DEGRADATION")
    if callable(g.get("cmpsbl_beacon_emit")): layers.append("BEACON")
    return layers

def _cmpsbl_debug_banner(capability_name: str) -> None:
    global _cmpsbl_debug_banner_shown, _cmpsbl_debug_subscribed
    if _cmpsbl_debug_banner_shown:
        return
    _cmpsbl_debug_banner_shown = True
    layers = _cmpsbl_debug_layers()
    print("[CMPSBL] Layers active: " + (", ".join(layers) if layers else "(none detected)"))
    print("[CMPSBL] First call: " + capability_name)
    if not _cmpsbl_debug_subscribed and callable(globals().get("cmpsbl_beacon_subscribe")):
        _cmpsbl_debug_subscribed = True
        def _sink(sig: dict) -> None:
            status = "ok" if sig.get("ok") else "FAIL"
            via = " via " + sig["error_code"] if sig.get("error_code") else ""
            print("[CMPSBL] " + str(sig.get("capability")) + " " + status + " (" + str(sig.get("duration_ms", 0)) + "ms)" + via)
        cmpsbl_beacon_subscribe(_sink)
`;

// Innermost wrapper — runs FIRST on every call so the banner fires before any
// other layer can emit. Adds zero overhead when debug is off (single bool check).
const DEBUG_WIRE_TS = `
const _cmpsbl_raw_execute_dbg = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_debug_surfaced(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  if (_cmpsbl_debug_active(input)) _cmpsbl_debug_banner(capabilityName);
  return _cmpsbl_raw_execute_dbg(capabilityName, input);
};`;

const DEBUG_WIRE_PY = `
_cmpsbl_raw_execute_dbg = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Surface debug banner + BEACON sink on first call when debug is enabled."""
    if _cmpsbl_debug_active(input_data):
        _cmpsbl_debug_banner(capability_name)
    return _cmpsbl_raw_execute_dbg(capability_name, input_data)`;

export const DEBUG_MODE_CORE: CmpsblLayerDefinition = {
  id: 'debug-surface',
  name: 'Debug Surface',
  crownJewelRank: 0,
  cjpi: 0,
  module: 'BEACON',
  description: 'Opt-in (CMPSBL_DEBUG=1 or _cmpsbl_debug:true) developer observability. Prints active layer roster on first call and surfaces one line per real BEACON signal. Off by default — zero output, zero overhead.',
  priceCents: 0,
  tsCode: DEBUG_TS,
  pyCode: DEBUG_PY,
  autoWire: {
    wrapperName: '_cmpsbl_debug_banner',
    behavior: 'Honest signal-only debug surface; activates only when explicitly enabled.',
    tsWire: DEBUG_WIRE_TS,
    pyWire: DEBUG_WIRE_PY,
  },
};
