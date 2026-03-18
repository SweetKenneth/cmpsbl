/**
 * CMPSBL® Primitive Executor Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Universal execution adapter: remote → local → fallback.
 * Routes primitive execution through the optimal available path.
 * Network-first execution model with offline survivability.
 *
 * © CMPSBL® — All rights reserved.
 */

import { executePrimitive } from './primitive-executor';
import { getPrimitive } from './primitive-registry';
import { recordPrimitiveOutcome } from './primitive-learning';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PrimitiveResult {
  data: Record<string, unknown>;
  confidence_delta: number;
  signal: string;
}

/** Runtime connectivity mode — internal only */
export type RuntimeMode = 'offline' | 'hybrid' | 'network';

/** Execution telemetry record */
export interface ExecutionTelemetry {
  primitive: string;
  wasRemote: boolean;
  success: boolean;
  usedFallback: boolean;
  mode: RuntimeMode;
  timestamp: number;
  durationMs: number;
}

/** Standardized remote execution contract */
export interface RemoteExecutionPayload {
  name: string;
  data: Record<string, unknown>;
  confidence: number;
  meta: {
    timestamp: number;
    runtimeType: 'substrate' | 'portable' | 'sealed';
    version: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — STATE
// ═══════════════════════════════════════════════════════════════════════════════

/** Runtime version identifier */
const RUNTIME_VERSION = '14.3.0';

/** Runtime type — substrate when running in CMPSBL, portable in exports */
let _runtimeType: 'substrate' | 'portable' | 'sealed' = 'substrate';

/** Configurable remote execution endpoint */
let _remoteEndpoint: string | null = null;

/** Current runtime mode — determined by network behavior */
let _currentMode: RuntimeMode = 'offline';

/** Consecutive remote successes for mode determination */
let _consecutiveRemoteSuccesses = 0;

/** Consecutive remote failures for mode determination */
let _consecutiveRemoteFailures = 0;

/** Telemetry buffer — lightweight, non-blocking */
const _telemetryBuffer: ExecutionTelemetry[] = [];
const MAX_TELEMETRY_BUFFER = 500;

/** Telemetry sink — optional external handler */
let _telemetrySink: ((entries: ExecutionTelemetry[]) => void) | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Set the remote primitive execution endpoint (substrate API) */
export function setRemoteEndpoint(url: string | null): void {
  _remoteEndpoint = url;
  if (!url) {
    _currentMode = 'offline';
    _consecutiveRemoteSuccesses = 0;
    _consecutiveRemoteFailures = 0;
  }
}

/** Get the current remote endpoint */
export function getRemoteEndpoint(): string | null {
  return _remoteEndpoint;
}

/** Set runtime type (used by export generators) */
export function setRuntimeType(type: 'substrate' | 'portable' | 'sealed'): void {
  _runtimeType = type;
}

/** Get current runtime mode */
export function getRuntimeMode(): RuntimeMode {
  return _currentMode;
}

/** Register a telemetry sink for external consumption */
export function setTelemetrySink(sink: ((entries: ExecutionTelemetry[]) => void) | null): void {
  _telemetrySink = sink;
}

/** Get buffered telemetry (read-only snapshot) */
export function getTelemetryBuffer(): ReadonlyArray<ExecutionTelemetry> {
  return [..._telemetryBuffer];
}

/** Flush telemetry buffer to sink */
export function flushTelemetry(): void {
  if (_telemetrySink && _telemetryBuffer.length > 0) {
    try {
      _telemetrySink([..._telemetryBuffer]);
    } catch {
      // Telemetry must never block execution
    }
    _telemetryBuffer.length = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — MODE TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

/** Network consistency threshold for 'network' mode */
const NETWORK_MODE_THRESHOLD = 5;

/** Failure threshold to drop to 'offline' mode */
const OFFLINE_MODE_THRESHOLD = 3;

function updateMode(remoteSuccess: boolean): void {
  if (!_remoteEndpoint) {
    _currentMode = 'offline';
    return;
  }

  if (remoteSuccess) {
    _consecutiveRemoteSuccesses++;
    _consecutiveRemoteFailures = 0;

    if (_consecutiveRemoteSuccesses >= NETWORK_MODE_THRESHOLD) {
      _currentMode = 'network';
    } else {
      _currentMode = 'hybrid';
    }
  } else {
    _consecutiveRemoteFailures++;
    _consecutiveRemoteSuccesses = 0;

    if (_consecutiveRemoteFailures >= OFFLINE_MODE_THRESHOLD) {
      _currentMode = 'offline';
    } else {
      _currentMode = 'hybrid';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — TELEMETRY RECORDING
// ═══════════════════════════════════════════════════════════════════════════════

function recordTelemetry(entry: ExecutionTelemetry): void {
  _telemetryBuffer.push(entry);
  if (_telemetryBuffer.length > MAX_TELEMETRY_BUFFER) {
    _telemetryBuffer.splice(0, _telemetryBuffer.length - MAX_TELEMETRY_BUFFER);
  }

  // Auto-flush at threshold
  if (_telemetrySink && _telemetryBuffer.length >= 50) {
    flushTelemetry();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — REMOTE EXECUTION (standardized contract)
// ═══════════════════════════════════════════════════════════════════════════════

function buildRemotePayload(
  name: string,
  data: Record<string, unknown>,
  confidence: number
): RemoteExecutionPayload {
  return {
    name,
    data,
    confidence,
    meta: {
      timestamp: Date.now(),
      runtimeType: _runtimeType,
      version: RUNTIME_VERSION,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — UNIVERSAL ASYNC EXECUTOR (network-first)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Universal primitive executor with three-tier resolution:
 *   1. Remote execution (PRIMARY — always attempted when endpoint configured)
 *   2. Local primitive execution (FALLBACK — registry lookup)
 *   3. Safe fallback (LAST RESORT — always succeeds)
 *
 * Remote failure NEVER breaks execution — system silently degrades.
 */
export async function primitiveExecutor(
  name: string,
  ctx: { _data: Record<string, unknown>; _signals: unknown[]; _errors: unknown[] },
  confidence: number
): Promise<PrimitiveResult> {
  const execStart = typeof performance !== 'undefined' ? performance.now() : Date.now();

  // ─── Tier 1: Remote execution (PRIMARY) ───
  if (_remoteEndpoint) {
    try {
      const payload = buildRemotePayload(name, ctx._data, confidence);
      const res = await fetch(_remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = (await res.json()) as PrimitiveResult;
        recordPrimitiveOutcome(name, true);
        updateMode(true);
        recordTelemetry({
          primitive: name,
          wasRemote: true,
          success: true,
          usedFallback: false,
          mode: _currentMode,
          timestamp: Date.now(),
          durationMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - execStart,
        });
        return result;
      }
      // Non-OK response — fall through
      updateMode(false);
    } catch {
      // Remote unavailable — fall through to local
      updateMode(false);
    }
  }

  // ─── Tier 2: Local primitive execution ───
  try {
    const result = await executePrimitive(name, ctx._data, { confidence, signals: ctx._signals });
    if (result.success) {
      recordPrimitiveOutcome(name, true);
      recordTelemetry({
        primitive: name,
        wasRemote: false,
        success: true,
        usedFallback: false,
        mode: _currentMode,
        timestamp: Date.now(),
        durationMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - execStart,
      });
      return {
        data:
          typeof result.output === 'object' && result.output !== null
            ? (result.output as Record<string, unknown>)
            : {},
        confidence_delta: 0.02,
        signal: `${name.toLowerCase()}_executed`,
      };
    }
  } catch {
    // Local primitive failed — fall through to fallback
  }

  // ─── Tier 3: Safe fallback (deterministic, always succeeds) ───
  recordPrimitiveOutcome(name, false);
  recordTelemetry({
    primitive: name,
    wasRemote: false,
    success: false,
    usedFallback: true,
    mode: _currentMode,
    timestamp: Date.now(),
    durationMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - execStart,
  });
  return {
    data: { [`${name.toLowerCase()}_result`]: { module: name, fallback: true, confidence } },
    confidence_delta: 0.01,
    signal: 'fallback',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — SYNCHRONOUS EXECUTOR (local-only, for generated code contexts)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Synchronous primitive executor for generated code contexts.
 * Used by exported runtimes where async is unavailable.
 * Attempts local registry lookup first, falls back to deterministic default.
 */
export function primitiveExecutorSync(
  name: string,
  data: Record<string, unknown>,
  confidence: number
): PrimitiveResult {
  const execStart = typeof performance !== 'undefined' ? performance.now() : Date.now();

  // Attempt local registry lookup (sync-safe: handler may return sync value)
  try {
    const primitive = getPrimitive(name);
    if (primitive?.handler) {
      const output = primitive.handler(data, { confidence });
      // Only use if handler returned synchronously (not a Promise)
      if (output && typeof output === 'object' && typeof (output as any).then !== 'function') {
        recordPrimitiveOutcome(name, true);
        recordTelemetry({
          primitive: name,
          wasRemote: false,
          success: true,
          usedFallback: false,
          mode: _currentMode,
          timestamp: Date.now(),
          durationMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - execStart,
        });
        return {
          data: output as Record<string, unknown>,
          confidence_delta: 0.02,
          signal: `${name.toLowerCase()}_executed`,
        };
      }
    }
  } catch {
    // Handler failed or returned async — fall through
  }

  // Deterministic fallback
  recordPrimitiveOutcome(name, false);
  recordTelemetry({
    primitive: name,
    wasRemote: false,
    success: false,
    usedFallback: true,
    mode: _currentMode,
    timestamp: Date.now(),
    durationMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - execStart,
  });
  return {
    data: { [`${name.toLowerCase()}_result`]: { module: name, confidence, processed: true } },
    confidence_delta: 0.01,
    signal: `${name.toLowerCase()}_fallback`,
  };
}
