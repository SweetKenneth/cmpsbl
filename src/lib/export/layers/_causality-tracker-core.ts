/**
 * CMPSBL® Always-On Core — Causality Tracker (Kernel Component #16)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Parent → child execution ID propagation. Each dispatch produces a unique
 * execution ID; nested dispatches inherit a parent ID. Builds a causality
 * tree consumable by Replay Log, Shadow Execution, and external tracers.
 *
 * Trace shape: { traceId, spanId, parentSpanId, name, startTs, endTs }
 * Bounded ring buffer (1024 spans). Stack-based parent tracking via push/pop.
 *
 * Module: GOVERNANCE  ·  CJPI: 95  ·  Crown Jewel #56
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const CAUSALITY_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Causality Tracker (sealed module, proprietary).           ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblSpan {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  name: string;
  startTs: number;
  endTs: number | null;
}

function _cmpsbl_kernel_enabled_ct(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_CAUSALITY_BUFFER_MAX = 1024;

function _cmpsbl_rand_id(): string {
  const a = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  const b = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return a + b;
}

class CmpsblCausalityTracker {
  private spans: CmpsblSpan[] = [];
  private stack: CmpsblSpan[] = [];
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_ct(); }

  /** Begin a new span. If a parent is on the stack, inherit its traceId. */
  begin(name: string): CmpsblSpan {
    const parent = this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
    const span: CmpsblSpan = {
      traceId: parent?.traceId ?? _cmpsbl_rand_id(),
      spanId: _cmpsbl_rand_id(),
      parentSpanId: parent?.spanId ?? null,
      name,
      startTs: Date.now(),
      endTs: null,
    };
    if (!this.enabled) return span;
    this.stack.push(span);
    this.spans.push(span);
    if (this.spans.length > _CMPSBL_CAUSALITY_BUFFER_MAX) this.spans.shift();
    return span;
  }

  /** End a span. Pops the matching span from the stack (LIFO). */
  end(spanId: string): void {
    if (!this.enabled) return;
    const idx = this.stack.findIndex(s => s.spanId === spanId);
    if (idx === -1) return;
    this.stack[idx].endTs = Date.now();
    this.stack.splice(idx, 1);
  }

  current(): CmpsblSpan | null {
    return this.stack.length > 0 ? { ...this.stack[this.stack.length - 1] } : null;
  }

  byTrace(traceId: string): CmpsblSpan[] {
    return this.spans.filter(s => s.traceId === traceId).map(s => ({ ...s }));
  }

  recent(n: number = 50): CmpsblSpan[] {
    return this.spans.slice(-n).map(s => ({ ...s }));
  }

  count(): number { return this.spans.length; }
  depth(): number { return this.stack.length; }
  reset(): void { this.spans = []; this.stack = []; }
}

const _cmpsbl_causality_inst = new CmpsblCausalityTracker();

function cmpsbl_causality(): CmpsblCausalityTracker {
  return _cmpsbl_causality_inst;
}
`;

const CAUSALITY_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Causality Tracker (sealed module, proprietary).           ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
import secrets
from typing import Dict, List, Optional


def _cmpsbl_kernel_enabled_ct() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_CAUSALITY_BUFFER_MAX = 1024


def _cmpsbl_rand_id() -> str:
    return secrets.token_hex(8)


class CmpsblCausalityTracker:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_ct()
        self._spans: List[Dict[str, object]] = []
        self._stack: List[Dict[str, object]] = []

    def begin(self, name: str) -> Dict[str, object]:
        parent = self._stack[-1] if self._stack else None
        span = {
            "traceId": parent["traceId"] if parent else _cmpsbl_rand_id(),
            "spanId": _cmpsbl_rand_id(),
            "parentSpanId": parent["spanId"] if parent else None,
            "name": name,
            "startTs": int(time.time() * 1000),
            "endTs": None,
        }
        if not self._enabled:
            return span
        self._stack.append(span)
        self._spans.append(span)
        if len(self._spans) > _CMPSBL_CAUSALITY_BUFFER_MAX:
            self._spans.pop(0)
        return span

    def end(self, span_id: str) -> None:
        if not self._enabled:
            return
        for i, s in enumerate(self._stack):
            if s["spanId"] == span_id:
                s["endTs"] = int(time.time() * 1000)
                self._stack.pop(i)
                return

    def current(self) -> Optional[Dict[str, object]]:
        return dict(self._stack[-1]) if self._stack else None

    def by_trace(self, trace_id: str) -> List[Dict[str, object]]:
        return [dict(s) for s in self._spans if s["traceId"] == trace_id]

    def recent(self, n: int = 50) -> List[Dict[str, object]]:
        return [dict(s) for s in self._spans[-n:]]

    def count(self) -> int:
        return len(self._spans)

    def depth(self) -> int:
        return len(self._stack)

    def reset(self) -> None:
        self._spans = []
        self._stack = []


_cmpsbl_causality_inst = CmpsblCausalityTracker()


def cmpsbl_causality() -> CmpsblCausalityTracker:
    return _cmpsbl_causality_inst
`;

const CAUSALITY_WIRE_TS = `
// Causality Tracker — propagates parent → child execution IDs across nested
// dispatches. IsolatedExecutor calls cmpsbl_causality().begin(name) before
// dispatch and end(spanId) after. Spans inherit traceId from the current stack
// top, enabling Replay Log + Shadow Execution to reconstruct call trees.
if (_cmpsbl_kernel_enabled_ct()) {
  void cmpsbl_causality();
}`;

const CAUSALITY_WIRE_PY = `
# Causality Tracker — propagates parent → child execution IDs across nested
# dispatches. IsolatedExecutor calls cmpsbl_causality().begin(name) before
# dispatch and end(span_id) after. Spans inherit traceId from the current stack
# top, enabling Replay Log + Shadow Execution to reconstruct call trees.
if _cmpsbl_kernel_enabled_ct():
    _ = cmpsbl_causality()`;

const CAUSALITY_TRACKER_CORE: CmpsblLayerDefinition = {
  id: 'causality-tracker',
  name: 'Causality Tracker',
  crownJewelRank: 56,
  cjpi: 95,
  module: 'GOVERNANCE',
  description:
    'Parent → child execution ID propagation. Each dispatch begins a span; nested dispatches inherit the parent traceId, building a causality tree. Bounded ring buffer (1024 spans). Pairs with Replay Log and Shadow Execution to reconstruct deep call trees during debugging. Stack-based LIFO tracking with begin()/end() pairing. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: CAUSALITY_TS,
  pyCode: CAUSALITY_PY,
  autoWire: {
    wrapperName: 'cmpsbl_causality',
    behavior:
      'Initializes the causality tracker at module load. Layer code calls begin(name)/end(spanId) to bracket dispatches. The current() method returns the active span for downstream observers. byTrace(id) reconstructs the call tree for any execution.',
    tsWire: CAUSALITY_WIRE_TS,
    pyWire: CAUSALITY_WIRE_PY,
  },
};

export { CAUSALITY_TRACKER_CORE };
