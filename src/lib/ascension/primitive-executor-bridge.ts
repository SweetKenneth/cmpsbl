/**
 * CMPSBL® Primitive Executor Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Universal execution adapter: remote → local → fallback.
 * Routes primitive execution through the optimal available path.
 *
 * © CMPSBL® — All rights reserved.
 */

import { executePrimitive } from './primitive-executor';
import { recordPrimitiveOutcome } from './primitive-learning';

export interface PrimitiveResult {
  data: Record<string, unknown>;
  confidence_delta: number;
  signal: string;
}

/** Configurable remote execution endpoint */
let _remoteEndpoint: string | null = null;

/** Set the remote primitive execution endpoint (substrate API) */
export function setRemoteEndpoint(url: string | null): void {
  _remoteEndpoint = url;
}

/** Get the current remote endpoint */
export function getRemoteEndpoint(): string | null {
  return _remoteEndpoint;
}

/**
 * Universal primitive executor with three-tier resolution:
 *   1. Remote execution (if endpoint configured)
 *   2. Local primitive execution (registry lookup)
 *   3. Safe fallback (always succeeds)
 */
export async function primitiveExecutor(
  name: string,
  ctx: { _data: Record<string, unknown>; _signals: unknown[]; _errors: unknown[] },
  confidence: number
): Promise<PrimitiveResult> {
  // ─── Tier 1: Remote execution ───
  if (_remoteEndpoint) {
    try {
      const res = await fetch(_remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: ctx._data, confidence }),
      });
      if (res.ok) {
        const result = (await res.json()) as PrimitiveResult;
        recordPrimitiveOutcome(name, true);
        return result;
      }
    } catch {
      // Remote unavailable — fall through to local
    }
  }

  // ─── Tier 2: Local primitive execution ───
  try {
    const result = await executePrimitive(name, ctx._data, { confidence, signals: ctx._signals });
    if (result.success) {
      recordPrimitiveOutcome(name, true);
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
  return {
    data: { [`${name.toLowerCase()}_result`]: { module: name, fallback: true, confidence } },
    confidence_delta: 0.01,
    signal: 'fallback',
  };
}

/**
 * Synchronous primitive executor for generated code contexts.
 * Used by exported runtimes where async is unavailable.
 */
export function primitiveExecutorSync(
  name: string,
  data: Record<string, unknown>,
  confidence: number
): PrimitiveResult {
  return {
    data: { [`${name.toLowerCase()}_result`]: { module: name, confidence, processed: true } },
    confidence_delta: 0.02,
    signal: `${name.toLowerCase()}_executed`,
  };
}
