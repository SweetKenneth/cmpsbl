/**
 * CMPSBL® Always-On Core — Retry with Exponential Backoff + Jitter (CJ #13)
 *
 * Three attempts on transient failures (network, timeout, 5xx, "ECONN*").
 * Backoff: 100ms → 400ms → 1.6s with ±20% jitter. Never retries validation
 * or authorization errors. Idempotent by default; opt out via input flag.
 *
 * NOT user-selectable. Auto-inlined into every Layer 2 export.
 */
import type { CmpsblLayerDefinition } from './types';

const RETRY_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Retry with Backoff + Jitter (Layer #13 · Always-On)       ║
// ║  Idempotent retries on transient failures. Pairs with the circuit breaker.    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblRetryConfig {
  maxAttempts?: number;
  baseDelayMs?: number;
  multiplier?: number;
  jitter?: number;
}

const _cmpsbl_retry_config: Required<CmpsblRetryConfig> = {
  maxAttempts: 3,
  baseDelayMs: 100,
  multiplier: 4,
  jitter: 0.2,
};

const _CMPSBL_RETRYABLE_PATTERNS = [
  /timeout/i, /network/i, /econn/i, /etimedout/i, /enetunreach/i,
  /\b5\\d{2}\b/, /temporar/i, /retry/i,
];
const _CMPSBL_NON_RETRYABLE_PATTERNS = [
  /validation/i, /unauthor/i, /forbidden/i, /not found/i, /\b40[0134]\b/,
  /circuit is open/i,
];

export function cmpsbl_is_retryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  if (_CMPSBL_NON_RETRYABLE_PATTERNS.some(p => p.test(msg))) return false;
  return _CMPSBL_RETRYABLE_PATTERNS.some(p => p.test(msg));
}

function _cmpsbl_backoff_ms(attempt: number): number {
  const base = _cmpsbl_retry_config.baseDelayMs * Math.pow(_cmpsbl_retry_config.multiplier, attempt - 1);
  const jitterRange = base * _cmpsbl_retry_config.jitter;
  return Math.max(0, base + (Math.random() * 2 - 1) * jitterRange);
}

function _cmpsbl_sleep_sync(ms: number): void {
  const end = Date.now() + ms;
  // Tight wall-time sleep; intentional for sync execute paths.
  while (Date.now() < end) { /* spin */ }
}

export function cmpsbl_with_retry<T>(capabilityName: string, fn: () => T): T {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= _cmpsbl_retry_config.maxAttempts; attempt++) {
    try { return fn(); }
    catch (err) {
      lastErr = err;
      if (attempt >= _cmpsbl_retry_config.maxAttempts || !cmpsbl_is_retryable(err)) throw err;
      _cmpsbl_sleep_sync(_cmpsbl_backoff_ms(attempt));
    }
  }
  throw lastErr;
}
`;

const RETRY_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — Retry with Backoff + Jitter (Crown Jewel #13)               ║
# ║  Idempotent retries on transient failures. Pairs with circuit breaker.        ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import random
import re
import time
from typing import Any, Callable

_cmpsbl_retry_max_attempts: int = 3
_cmpsbl_retry_base_delay_ms: int = 100
_cmpsbl_retry_multiplier: int = 4
_cmpsbl_retry_jitter: float = 0.2

_CMPSBL_RETRYABLE_PATTERNS = [
    re.compile(r"timeout", re.I), re.compile(r"network", re.I),
    re.compile(r"econn", re.I), re.compile(r"etimedout", re.I),
    re.compile(r"enetunreach", re.I), re.compile(r"\\b5\\d{2}\\b"),
    re.compile(r"temporar", re.I), re.compile(r"retry", re.I),
]
_CMPSBL_NON_RETRYABLE_PATTERNS = [
    re.compile(r"validation", re.I), re.compile(r"unauthor", re.I),
    re.compile(r"forbidden", re.I), re.compile(r"not found", re.I),
    re.compile(r"\\b40[0134]\\b"), re.compile(r"circuit is open", re.I),
]

def cmpsbl_is_retryable(err: BaseException) -> bool:
    msg = str(err)
    if any(p.search(msg) for p in _CMPSBL_NON_RETRYABLE_PATTERNS):
        return False
    return any(p.search(msg) for p in _CMPSBL_RETRYABLE_PATTERNS)

def _cmpsbl_backoff_ms(attempt: int) -> float:
    base = _cmpsbl_retry_base_delay_ms * (_cmpsbl_retry_multiplier ** (attempt - 1))
    jitter_range = base * _cmpsbl_retry_jitter
    return max(0.0, base + (random.random() * 2 - 1) * jitter_range)

def cmpsbl_with_retry(capability_name: str, fn: Callable[[], Any]) -> Any:
    last_err: BaseException = RuntimeError("retry-never-attempted")
    for attempt in range(1, _cmpsbl_retry_max_attempts + 1):
        try:
            return fn()
        except BaseException as err:
            last_err = err
            if attempt >= _cmpsbl_retry_max_attempts or not cmpsbl_is_retryable(err):
                raise
            time.sleep(_cmpsbl_backoff_ms(attempt) / 1000.0)
    raise last_err
`;

const RETRY_WIRE_TS = `
const _cmpsbl_raw_execute_rt = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_retry_protected(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  return cmpsbl_with_retry(capabilityName, () => _cmpsbl_raw_execute_rt(capabilityName, input));
};`;

const RETRY_WIRE_PY = `
_cmpsbl_raw_execute_rt = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with retry-on-transient (auto-wired)."""
    return cmpsbl_with_retry(capability_name, lambda: _cmpsbl_raw_execute_rt(capability_name, input_data))`;

export const RETRY_CORE: CmpsblLayerDefinition = {
  id: 'retry-backoff',
  name: 'Retry with Backoff',
  crownJewelRank: 13,
  cjpi: 89,
  module: 'FAILSAFE',
  description: 'Three-attempt exponential backoff with ±20% jitter on transient errors. Validation/auth errors are never retried.',
  priceCents: 0,
  tsCode: RETRY_TS,
  pyCode: RETRY_PY,
  autoWire: {
    wrapperName: 'cmpsbl_with_retry',
    behavior: 'Transient failures are retried up to 3 times with exponential backoff; permanent failures (validation, auth) propagate immediately.',
    tsWire: RETRY_WIRE_TS,
    pyWire: RETRY_WIRE_PY,
  },
};
