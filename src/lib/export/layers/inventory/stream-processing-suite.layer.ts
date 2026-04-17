/**
 * CMPSBL® Inventory Layer — Stream Processing Suite
 * Primitives: TAP · WINDOW · JOIN · SINK
 *
 *   TAP    → bounded ring buffer for the latest N events
 *   WINDOW → tumbling time-window aggregator (sum/avg/count)
 *   JOIN   → keyed inner-join across two ordered streams
 *   SINK   → backpressure-aware queue with high/low watermarks
 *
 * Auto-wire pushes every executed capability event into a TAP and updates
 * a WINDOW aggregator, giving the wrapped runtime a live recent-activity
 * window with no external broker required.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Stream Processing Suite (proprietary).                     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── TAP · bounded ring buffer ───────────────────────────────────────────────
export class CmpsblTap<T> {
  private buf: T[];
  private head = 0;
  private size = 0;
  constructor(capacity: number) { this.buf = new Array<T>(Math.max(1, capacity)); }
  push(item: T): void {
    const cap = this.buf.length;
    const idx = (this.head + this.size) % cap;
    this.buf[idx] = item;
    if (this.size < cap) this.size += 1;
    else this.head = (this.head + 1) % cap;
  }
  toArray(): T[] {
    const out: T[] = [];
    for (let i = 0; i < this.size; i++) out.push(this.buf[(this.head + i) % this.buf.length]);
    return out;
  }
  length(): number { return this.size; }
}

// ── WINDOW · tumbling-window aggregator ─────────────────────────────────────
export type CmpsblWindow = { startMs: number; widthMs: number; count: number; sum: number };
export function cmpsbl_sps_window_new(widthMs: number, nowMs: number = Date.now()): CmpsblWindow {
  return { startMs: nowMs, widthMs, count: 0, sum: 0 };
}
export function cmpsbl_sps_window_observe(w: CmpsblWindow, value: number, nowMs: number = Date.now()): CmpsblWindow {
  if (nowMs - w.startMs >= w.widthMs) {
    return { startMs: nowMs, widthMs: w.widthMs, count: 1, sum: value };
  }
  w.count += 1; w.sum += value;
  return w;
}
export function cmpsbl_sps_window_avg(w: CmpsblWindow): number {
  return w.count === 0 ? 0 : w.sum / w.count;
}

// ── JOIN · keyed inner-join ─────────────────────────────────────────────────
export function cmpsbl_sps_join_inner<L extends { key: string }, R extends { key: string }>(left: L[], right: R[]): Array<{ key: string; left: L; right: R }> {
  const idx = new Map<string, R>();
  for (const r of right) idx.set(r.key, r);
  const out: Array<{ key: string; left: L; right: R }> = [];
  for (const l of left) {
    const r = idx.get(l.key);
    if (r) out.push({ key: l.key, left: l, right: r });
  }
  return out;
}

// ── SINK · backpressure queue ───────────────────────────────────────────────
export class CmpsblSink<T> {
  private q: T[] = [];
  constructor(private high: number, private low: number) {}
  push(item: T): { accepted: boolean; pressure: 'low' | 'high' } {
    if (this.q.length >= this.high) return { accepted: false, pressure: 'high' };
    this.q.push(item);
    return { accepted: true, pressure: this.q.length >= this.low ? 'high' : 'low' };
  }
  drain(): T[] { const out = this.q; this.q = []; return out; }
  depth(): number { return this.q.length; }
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Stream Processing Suite (proprietary).                     ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
from typing import List, Dict, Any

class CmpsblTap:
    def __init__(self, capacity: int):
        self.cap = max(1, capacity)
        self.buf: List[Any] = [None] * self.cap
        self.head = 0
        self.size = 0
    def push(self, item: Any) -> None:
        idx = (self.head + self.size) % self.cap
        self.buf[idx] = item
        if self.size < self.cap:
            self.size += 1
        else:
            self.head = (self.head + 1) % self.cap
    def to_list(self) -> List[Any]:
        return [self.buf[(self.head + i) % self.cap] for i in range(self.size)]
    def length(self) -> int:
        return self.size

def _now_ms() -> int:
    return int(time.time() * 1000)

def cmpsbl_sps_window_new(width_ms: int, now_ms: int = None) -> dict:
    if now_ms is None: now_ms = _now_ms()
    return { "start_ms": now_ms, "width_ms": width_ms, "count": 0, "sum": 0.0 }

def cmpsbl_sps_window_observe(w: dict, value: float, now_ms: int = None) -> dict:
    if now_ms is None: now_ms = _now_ms()
    if now_ms - w["start_ms"] >= w["width_ms"]:
        return { "start_ms": now_ms, "width_ms": w["width_ms"], "count": 1, "sum": value }
    w["count"] += 1
    w["sum"] += value
    return w

def cmpsbl_sps_window_avg(w: dict) -> float:
    return 0.0 if w["count"] == 0 else w["sum"] / w["count"]

def cmpsbl_sps_join_inner(left: List[Dict[str, Any]], right: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    idx = { r["key"]: r for r in right }
    return [{ "key": l["key"], "left": l, "right": idx[l["key"]] } for l in left if l["key"] in idx]

class CmpsblSink:
    def __init__(self, high: int, low: int):
        self.high = high
        self.low = low
        self.q: List[Any] = []
    def push(self, item: Any) -> dict:
        if len(self.q) >= self.high:
            return { "accepted": False, "pressure": "high" }
        self.q.append(item)
        return { "accepted": True, "pressure": "high" if len(self.q) >= self.low else "low" }
    def drain(self) -> List[Any]:
        out = self.q
        self.q = []
        return out
    def depth(self) -> int:
        return len(self.q)
`;

const WIRE_TS = `
const _cmpsbl_sps_tap = new CmpsblTap<{ ts: number; capability: string; ms: number }>(256);
let _cmpsbl_sps_window = cmpsbl_sps_window_new(60000);
const _cmpsbl_raw_execute_sps = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_sps(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const start = Date.now();
  try {
    return _cmpsbl_raw_execute_sps(capabilityName, input);
  } finally {
    const ms = Date.now() - start;
    _cmpsbl_sps_tap.push({ ts: start, capability: capabilityName, ms });
    _cmpsbl_sps_window = cmpsbl_sps_window_observe(_cmpsbl_sps_window, ms);
  }
};`;

const WIRE_PY = `
_cmpsbl_sps_tap = CmpsblTap(256)
_cmpsbl_sps_window = cmpsbl_sps_window_new(60000)
_cmpsbl_raw_execute_sps = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Stream Processing Suite (TAP + WINDOW live activity)."""
    import time
    global _cmpsbl_sps_window
    start = int(time.time() * 1000)
    try:
        return _cmpsbl_raw_execute_sps(capability_name, input_data)
    finally:
        ms = int(time.time() * 1000) - start
        _cmpsbl_sps_tap.push({ "ts": start, "capability": capability_name, "ms": ms })
        _cmpsbl_sps_window = cmpsbl_sps_window_observe(_cmpsbl_sps_window, ms)`;

export const STREAM_PROCESSING_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'stream-processing-suite',
  name: 'Stream Processing Suite',
  crownJewelRank: 32,
  cjpi: 87,
  module: 'STREAM',
  description: 'TAP ring buffer + WINDOW tumbling aggregator + JOIN inner-join + SINK backpressure queue.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_sps_window_observe',
    behavior: 'Streams every execution into a 256-event TAP and a 60s tumbling latency WINDOW.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
