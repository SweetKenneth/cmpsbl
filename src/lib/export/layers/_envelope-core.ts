/**
 * CMPSBL® Always-On Core — Structured Error Envelope (Crown Jewel #14)
 *
 * Every failure surfaces a typed envelope:
 *   { ok: false, code, message, retryable, traceId, capability, durationMs }
 * Successes wrap the result the same way. Downstream code never has to
 * try/catch raw throws — the envelope is the contract across languages.
 *
 * NOT user-selectable. Auto-inlined into every Layer 2 export.
 */
import type { CmpsblLayerDefinition } from './types';

const ENVELOPE_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® LAYER — Structured Error Envelope (Crown Jewel #14)                 ║
// ║  Uniform { ok, value | code, message, retryable, traceId } across calls.      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

export type CmpsblErrorCode =
  | 'CMPSBL_TIMEOUT'
  | 'CMPSBL_CIRCUIT_OPEN'
  | 'CMPSBL_VALIDATION'
  | 'CMPSBL_RATE_LIMIT'
  | 'CMPSBL_INTERNAL'
  | 'CMPSBL_UNKNOWN';

export interface CmpsblOk<T> {
  ok: true;
  value: T;
  capability: string;
  traceId: string;
  durationMs: number;
}

export interface CmpsblErr {
  ok: false;
  code: CmpsblErrorCode;
  message: string;
  retryable: boolean;
  capability: string;
  traceId: string;
  durationMs: number;
}

export type CmpsblEnvelope<T> = CmpsblOk<T> | CmpsblErr;

export function cmpsbl_classify_error(err: unknown): { code: CmpsblErrorCode; retryable: boolean; message: string } {
  const message = err instanceof Error ? err.message : String(err ?? 'unknown error');
  if (/circuit is open/i.test(message)) return { code: 'CMPSBL_CIRCUIT_OPEN', retryable: false, message };
  if (/timeout|deadline/i.test(message)) return { code: 'CMPSBL_TIMEOUT', retryable: true, message };
  if (/validation|invalid|schema/i.test(message)) return { code: 'CMPSBL_VALIDATION', retryable: false, message };
  if (/rate limit|too many/i.test(message)) return { code: 'CMPSBL_RATE_LIMIT', retryable: true, message };
  if (/network|econn|5\\d{2}/i.test(message)) return { code: 'CMPSBL_INTERNAL', retryable: true, message };
  return { code: 'CMPSBL_UNKNOWN', retryable: false, message };
}

export function cmpsbl_wrap_envelope<T>(capability: string, traceId: string, startedAt: number, fn: () => T): CmpsblEnvelope<T> {
  try {
    const value = fn();
    return { ok: true, value, capability, traceId, durationMs: Date.now() - startedAt };
  } catch (err) {
    const c = cmpsbl_classify_error(err);
    return { ok: false, code: c.code, message: c.message, retryable: c.retryable, capability, traceId, durationMs: Date.now() - startedAt };
  }
}
`;

const ENVELOPE_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — Structured Error Envelope (Crown Jewel #14)                 ║
# ║  Uniform {ok, value | code, message, retryable, trace_id} across calls.       ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import re
import time
from typing import Any, Callable, Dict

_CMPSBL_ENV_PATTERNS = [
    (re.compile(r"circuit is open", re.I), "CMPSBL_CIRCUIT_OPEN", False),
    (re.compile(r"timeout|deadline", re.I), "CMPSBL_TIMEOUT", True),
    (re.compile(r"validation|invalid|schema", re.I), "CMPSBL_VALIDATION", False),
    (re.compile(r"rate limit|too many", re.I), "CMPSBL_RATE_LIMIT", True),
    (re.compile(r"network|econn|5\\d{2}", re.I), "CMPSBL_INTERNAL", True),
]

def cmpsbl_classify_error(err: BaseException) -> Dict[str, Any]:
    message = str(err) if err else "unknown error"
    for pat, code, retryable in _CMPSBL_ENV_PATTERNS:
        if pat.search(message):
            return {"code": code, "retryable": retryable, "message": message}
    return {"code": "CMPSBL_UNKNOWN", "retryable": False, "message": message}

def cmpsbl_wrap_envelope(capability: str, trace_id: str, started_at: float, fn: Callable[[], Any]) -> Dict[str, Any]:
    try:
        value = fn()
        return {
            "ok": True, "value": value, "capability": capability,
            "trace_id": trace_id, "duration_ms": int((time.time() - started_at) * 1000),
        }
    except BaseException as err:
        c = cmpsbl_classify_error(err)
        return {
            "ok": False, "code": c["code"], "message": c["message"], "retryable": c["retryable"],
            "capability": capability, "trace_id": trace_id,
            "duration_ms": int((time.time() - started_at) * 1000),
        }
`;

const ENVELOPE_WIRE_TS = `
// Envelope is produced by the BEACON layer wrapper; no execute substitution here.
// This ensures classification runs after retry+timeout+circuit have all decided.`;

const ENVELOPE_WIRE_PY = `
# Envelope is produced by the BEACON layer wrapper; no execute substitution here.
# This ensures classification runs after retry+timeout+circuit have all decided.`;

export const ENVELOPE_CORE: CmpsblLayerDefinition = {
  id: 'error-envelope',
  name: 'Structured Error Envelope',
  crownJewelRank: 14,
  cjpi: 87,
  module: 'GOVERNANCE',
  description: 'Uniform success/failure envelope with classified error codes, retryable flag, traceId, and durationMs across all calls.',
  priceCents: 0,
  tsCode: ENVELOPE_TS,
  pyCode: ENVELOPE_PY,
  autoWire: {
    wrapperName: 'cmpsbl_wrap_envelope',
    behavior: 'Errors are classified into typed codes (TIMEOUT, CIRCUIT_OPEN, VALIDATION, RATE_LIMIT, INTERNAL) with a retryable flag.',
    tsWire: ENVELOPE_WIRE_TS,
    pyWire: ENVELOPE_WIRE_PY,
  },
};
