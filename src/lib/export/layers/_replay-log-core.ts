/**
 * CMPSBL® Always-On Core — Replay Log (Kernel Component #10)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Append-only log of (name, args, result) tuples per cmpsbl_execute.
 * Enables "rewind & re-execute" for debugging and contract-change
 * validation — replay the recorded inputs against a candidate function
 * and diff the envelopes.
 *
 * Bounded ring (2048) prevents unbounded growth. Optional sample rate
 * lets high-throughput hosts capture every Nth call. Gated by
 * CMPSBL_KERNEL_ENABLED (default ON).
 *
 * Module: AUDIT  ·  CJPI: 95  ·  Crown Jewel #50
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const REPLAY_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Replay Log (sealed module, proprietary).                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblReplayEntry {
  seq: number;
  ts: number;
  name: string;
  args: unknown;
  result: unknown;
  ok: boolean;
  durationMs: number;
}

function _cmpsbl_kernel_enabled_rl(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_REPLAY_RING_MAX = 2048;

function _cmpsbl_safe_clone(v: unknown): unknown {
  try { return JSON.parse(JSON.stringify(v ?? null)); }
  catch { return String(v); }
}

class CmpsblReplayLog {
  private entries: CmpsblReplayEntry[] = [];
  private seq = 0;
  private sampleRate = 1; // 1 = every call; N = every Nth
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_rl(); }

  setSampleRate(n: number): void {
    this.sampleRate = Math.max(1, Math.floor(n) || 1);
  }

  record(name: string, args: unknown, result: unknown, ok: boolean, durationMs: number): CmpsblReplayEntry | null {
    if (!this.enabled) return null;
    const seq = ++this.seq;
    if (this.sampleRate > 1 && seq % this.sampleRate !== 0) return null;
    const entry: CmpsblReplayEntry = {
      seq, ts: Date.now(), name,
      args: _cmpsbl_safe_clone(args),
      result: _cmpsbl_safe_clone(result),
      ok, durationMs,
    };
    this.entries.push(entry);
    if (this.entries.length > _CMPSBL_REPLAY_RING_MAX) this.entries.shift();
    return { ...entry };
  }

  entriesFor(name: string): CmpsblReplayEntry[] {
    return this.entries.filter(e => e.name === name).map(e => ({ ...e }));
  }

  all(): CmpsblReplayEntry[] { return this.entries.map(e => ({ ...e })); }
  length(): number { return this.entries.length; }
  reset(): void { this.entries = []; this.seq = 0; }

  /** Replay every recorded entry against a candidate fn and report divergences. */
  replay(name: string, candidate: (args: unknown) => unknown):
    Array<{ seq: number; matched: boolean; expected: unknown; actual: unknown; error?: string }> {
    const out: Array<{ seq: number; matched: boolean; expected: unknown; actual: unknown; error?: string }> = [];
    for (const e of this.entries) {
      if (e.name !== name) continue;
      try {
        const actual = candidate(e.args);
        const matched = JSON.stringify(actual) === JSON.stringify(e.result);
        out.push({ seq: e.seq, matched, expected: e.result, actual });
      } catch (err) {
        out.push({ seq: e.seq, matched: false, expected: e.result, actual: null, error: String((err as Error)?.message ?? err) });
      }
    }
    return out;
  }
}

const _cmpsbl_replay_inst = new CmpsblReplayLog();

function cmpsbl_replay_log(): CmpsblReplayLog {
  return _cmpsbl_replay_inst;
}
`;

const REPLAY_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Replay Log (sealed module, proprietary).                  ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
import json
import copy
from typing import Any, Callable, Dict, List, Optional


def _cmpsbl_kernel_enabled_rl() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_REPLAY_RING_MAX = 2048


def _cmpsbl_safe_clone(v: Any) -> Any:
    try:
        return json.loads(json.dumps(v, default=str))
    except Exception:
        return str(v)


class CmpsblReplayLog:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_rl()
        self._entries: List[Dict[str, Any]] = []
        self._seq = 0
        self._sample_rate = 1

    def set_sample_rate(self, n: int) -> None:
        self._sample_rate = max(1, int(n) or 1)

    def record(self, name: str, args: Any, result: Any, ok: bool, duration_ms: float) -> Optional[Dict[str, Any]]:
        if not self._enabled:
            return None
        self._seq += 1
        seq = self._seq
        if self._sample_rate > 1 and seq % self._sample_rate != 0:
            return None
        entry = {
            "seq": seq, "ts": int(time.time() * 1000), "name": name,
            "args": _cmpsbl_safe_clone(args), "result": _cmpsbl_safe_clone(result),
            "ok": bool(ok), "duration_ms": duration_ms,
        }
        self._entries.append(entry)
        if len(self._entries) > _CMPSBL_REPLAY_RING_MAX:
            self._entries.pop(0)
        return dict(entry)

    def entries_for(self, name: str) -> List[Dict[str, Any]]:
        return [dict(e) for e in self._entries if e["name"] == name]

    def all(self) -> List[Dict[str, Any]]:
        return [dict(e) for e in self._entries]

    def length(self) -> int:
        return len(self._entries)

    def reset(self) -> None:
        self._entries = []
        self._seq = 0

    def replay(self, name: str, candidate: Callable[[Any], Any]) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for e in self._entries:
            if e["name"] != name:
                continue
            try:
                actual = candidate(e["args"])
                matched = json.dumps(actual, sort_keys=True, default=str) == json.dumps(e["result"], sort_keys=True, default=str)
                out.append({"seq": e["seq"], "matched": matched, "expected": e["result"], "actual": actual})
            except Exception as err:
                out.append({"seq": e["seq"], "matched": False, "expected": e["result"], "actual": None, "error": str(err)})
        return out


_cmpsbl_replay_inst = CmpsblReplayLog()


def cmpsbl_replay_log() -> CmpsblReplayLog:
    return _cmpsbl_replay_inst
`;

const REPLAY_WIRE_TS = `
// Replay Log records every cmpsbl_execute as an append-only (name, args, result)
// tuple. Use cmpsbl_replay_log().replay(name, candidateFn) to rewind recorded
// inputs against a new implementation and diff the envelopes — foundation for
// safe contract-change validation alongside Shadow Execution.
if (_cmpsbl_kernel_enabled_rl()) {
  void cmpsbl_replay_log();
}`;

const REPLAY_WIRE_PY = `
# Replay Log records every cmpsbl_execute as an append-only (name, args, result)
# tuple. Use cmpsbl_replay_log().replay(name, candidate_fn) to rewind recorded
# inputs against a new implementation and diff the envelopes — foundation for
# safe contract-change validation alongside Shadow Execution.
if _cmpsbl_kernel_enabled_rl():
    _ = cmpsbl_replay_log()`;

const REPLAY_LOG_CORE: CmpsblLayerDefinition = {
  id: 'replay-log',
  name: 'Replay Log',
  crownJewelRank: 50,
  cjpi: 95,
  module: 'AUDIT',
  description:
    'Kernel-grade append-only log of (name, args, result) tuples per cmpsbl_execute. Enables rewind & re-execute against candidate functions for debugging and contract-change validation. Bounded ring (2048) with optional sampling. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: REPLAY_TS,
  pyCode: REPLAY_PY,
  autoWire: {
    wrapperName: 'cmpsbl_replay_log',
    behavior:
      'Initializes the replay log at module load. IsolatedExecutor (when present) calls record() after each invocation. Use replay(name, candidateFn) to validate a new implementation against historical inputs.',
    tsWire: REPLAY_WIRE_TS,
    pyWire: REPLAY_WIRE_PY,
  },
};

export { REPLAY_LOG_CORE };
