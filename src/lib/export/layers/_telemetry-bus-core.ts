/**
 * CMPSBL® Always-On Core — Telemetry Bus (Kernel Component #9)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * In-process structured pub/sub for kernel events. Layers subscribe to
 * named channels (e.g. 'execute.success', 'execute.fail', 'quarantine',
 * 'contract.violation') without coupling to the emitter.
 *
 * BEACON ships structured signals OUT of the host; the Telemetry Bus is
 * its kernel-side counterpart — observable INSIDE the host so layers can
 * react in-process without serialization or transport.
 *
 * API:
 *   • emit(event, payload?)        → number   (count of handlers fired)
 *   • on(event, handler)           → unsub fn
 *   • once(event, handler)         → unsub fn
 *   • off(event, handler?)         → number   (handlers removed)
 *   • channels()                   → string[]
 *   • subscriberCount(event)       → number
 *
 * Wildcard '*' channel receives every event for cross-cutting observers.
 * Handler errors are isolated — never crash the bus or other handlers.
 * Bounded handler count per channel (256) prevents accidental fan-out.
 *
 * Gated by CMPSBL_KERNEL_ENABLED (default ON). When OFF, emit() returns 0
 * and on() returns a no-op unsub so callers stay byte-compatible.
 *
 * Module: OBSERVABILITY  ·  CJPI: 95  ·  Crown Jewel #49
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const TELEMETRY_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Telemetry Bus (sealed module, proprietary).               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblTelemetryEvent<T = unknown> {
  event: string;
  payload: T;
  ts: number;
  seq: number;
}

type CmpsblTelemetryHandler = (evt: CmpsblTelemetryEvent) => void;

function _cmpsbl_kernel_enabled_tb(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_TB_MAX_HANDLERS = 256;
const _CMPSBL_TB_WILDCARD = '*';

class CmpsblTelemetryBus {
  private handlers: Map<string, CmpsblTelemetryHandler[]> = new Map();
  private seq = 0;
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_tb(); }

  on(event: string, handler: CmpsblTelemetryHandler): () => void {
    if (!this.enabled || typeof handler !== 'function') return () => {};
    const list = this.handlers.get(event) ?? [];
    if (list.length >= _CMPSBL_TB_MAX_HANDLERS) return () => {};
    list.push(handler);
    this.handlers.set(event, list);
    return () => { this.off(event, handler); };
  }

  once(event: string, handler: CmpsblTelemetryHandler): () => void {
    const wrapped: CmpsblTelemetryHandler = (evt) => {
      this.off(event, wrapped);
      handler(evt);
    };
    return this.on(event, wrapped);
  }

  off(event: string, handler?: CmpsblTelemetryHandler): number {
    const list = this.handlers.get(event);
    if (!list) return 0;
    if (!handler) { this.handlers.delete(event); return list.length; }
    const idx = list.indexOf(handler);
    if (idx === -1) return 0;
    list.splice(idx, 1);
    if (list.length === 0) this.handlers.delete(event);
    return 1;
  }

  emit<T = unknown>(event: string, payload?: T): number {
    if (!this.enabled) return 0;
    const evt: CmpsblTelemetryEvent<T> = {
      event, payload: payload as T, ts: Date.now(), seq: ++this.seq,
    };
    let fired = 0;
    const direct = this.handlers.get(event);
    if (direct) {
      for (const h of [...direct]) {
        try { h(evt as CmpsblTelemetryEvent); fired++; } catch { /* isolate handler faults */ }
      }
    }
    const wild = this.handlers.get(_CMPSBL_TB_WILDCARD);
    if (wild) {
      for (const h of [...wild]) {
        try { h(evt as CmpsblTelemetryEvent); fired++; } catch { /* isolate */ }
      }
    }
    return fired;
  }

  channels(): string[] { return [...this.handlers.keys()]; }

  subscriberCount(event: string): number {
    return this.handlers.get(event)?.length ?? 0;
  }
}

const _cmpsbl_telemetry_inst = new CmpsblTelemetryBus();

function cmpsbl_telemetry(): CmpsblTelemetryBus {
  return _cmpsbl_telemetry_inst;
}

// Convenience emitter — short alias for layer code.
function cmpsbl_emit<T = unknown>(event: string, payload?: T): number {
  return _cmpsbl_telemetry_inst.emit(event, payload);
}
`;

const TELEMETRY_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Telemetry Bus (sealed module, proprietary).               ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
from typing import Any, Callable, Dict, List, Optional


def _cmpsbl_kernel_enabled_tb() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_TB_MAX_HANDLERS = 256
_CMPSBL_TB_WILDCARD = "*"


class CmpsblTelemetryBus:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_tb()
        self._handlers: Dict[str, List[Callable[[Dict[str, Any]], None]]] = {}
        self._seq = 0

    def on(self, event: str, handler: Callable[[Dict[str, Any]], None]) -> Callable[[], None]:
        if not self._enabled or not callable(handler):
            return lambda: None
        lst = self._handlers.setdefault(event, [])
        if len(lst) >= _CMPSBL_TB_MAX_HANDLERS:
            return lambda: None
        lst.append(handler)

        def _unsub() -> None:
            self.off(event, handler)
        return _unsub

    def once(self, event: str, handler: Callable[[Dict[str, Any]], None]) -> Callable[[], None]:
        def _wrapped(evt: Dict[str, Any]) -> None:
            self.off(event, _wrapped)
            handler(evt)
        return self.on(event, _wrapped)

    def off(self, event: str, handler: Optional[Callable[[Dict[str, Any]], None]] = None) -> int:
        lst = self._handlers.get(event)
        if not lst:
            return 0
        if handler is None:
            n = len(lst)
            self._handlers.pop(event, None)
            return n
        try:
            lst.remove(handler)
        except ValueError:
            return 0
        if not lst:
            self._handlers.pop(event, None)
        return 1

    def emit(self, event: str, payload: Any = None) -> int:
        if not self._enabled:
            return 0
        self._seq += 1
        evt = {"event": event, "payload": payload, "ts": int(time.time() * 1000), "seq": self._seq}
        fired = 0
        for ch in (event, _CMPSBL_TB_WILDCARD):
            lst = self._handlers.get(ch)
            if not lst:
                continue
            for h in list(lst):
                try:
                    h(evt)
                    fired += 1
                except Exception:
                    pass
        return fired

    def channels(self) -> List[str]:
        return list(self._handlers.keys())

    def subscriber_count(self, event: str) -> int:
        return len(self._handlers.get(event, []))


_cmpsbl_telemetry_inst = CmpsblTelemetryBus()


def cmpsbl_telemetry() -> CmpsblTelemetryBus:
    return _cmpsbl_telemetry_inst


def cmpsbl_emit(event: str, payload: Any = None) -> int:
    return _cmpsbl_telemetry_inst.emit(event, payload)
`;

const TELEMETRY_WIRE_TS = `
// Telemetry Bus is the kernel-side counterpart to BEACON — in-process pub/sub
// so layers (Quarantine, ContractValidator, IsolatedExecutor, etc.) can react
// to kernel events without coupling. Use cmpsbl_emit('event', payload) to
// publish; cmpsbl_telemetry().on('event', handler) to subscribe.
if (_cmpsbl_kernel_enabled_tb()) {
  void cmpsbl_telemetry();
}`;

const TELEMETRY_WIRE_PY = `
# Telemetry Bus is the kernel-side counterpart to BEACON — in-process pub/sub
# so layers (Quarantine, ContractValidator, IsolatedExecutor, etc.) can react
# to kernel events without coupling. Use cmpsbl_emit('event', payload) to
# publish; cmpsbl_telemetry().on('event', handler) to subscribe.
if _cmpsbl_kernel_enabled_tb():
    _ = cmpsbl_telemetry()`;

const TELEMETRY_BUS_CORE: CmpsblLayerDefinition = {
  id: 'telemetry-bus',
  name: 'Telemetry Bus',
  crownJewelRank: 49,
  cjpi: 95,
  module: 'OBSERVABILITY',
  description:
    'Kernel-grade in-process pub/sub. Layers subscribe to named channels (execute.success, execute.fail, quarantine, contract.violation, etc.) without coupling to the emitter. Wildcard "*" subscriber receives every event for cross-cutting observers. Handler errors isolated, bounded fan-out (256/channel). Counterpart to BEACON: BEACON ships signals OUT, Telemetry Bus exposes them INSIDE the host. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: TELEMETRY_TS,
  pyCode: TELEMETRY_PY,
  autoWire: {
    wrapperName: 'cmpsbl_telemetry',
    behavior:
      'Initializes the in-process telemetry bus at module load. Layer code calls cmpsbl_emit(event, payload) to publish; observers call cmpsbl_telemetry().on(event, handler) to subscribe. No transport, no serialization — pure in-process fan-out.',
    tsWire: TELEMETRY_WIRE_TS,
    pyWire: TELEMETRY_WIRE_PY,
  },
};

export { TELEMETRY_BUS_CORE };
