/**
 * DEFENSE Guardrail — Structured Logger
 * Rate-limited, structured logging for all guardrail events.
 */

import { createLogger } from '@/lib/system/structuredLog';
import type { GuardrailLogEntry } from './types';

const log = createLogger('DEFENSE:GUARDRAIL');

// Rate limiting: max N logs per event type per minute
const LOG_RATE_LIMIT = 30;
const LOG_WINDOW_MS = 60_000;
const MAX_BUFFER = 500;

const rateBuckets = new Map<string, { count: number; windowStart: number }>();
const logBuffer: GuardrailLogEntry[] = [];

function isRateLimited(event: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(event);

  if (!bucket || now - bucket.windowStart > LOG_WINDOW_MS) {
    rateBuckets.set(event, { count: 1, windowStart: now });
    // Bound the buckets map
    if (rateBuckets.size > 100) {
      const oldest = rateBuckets.keys().next().value;
      if (oldest) rateBuckets.delete(oldest);
    }
    return false;
  }

  if (bucket.count >= LOG_RATE_LIMIT) return true;
  bucket.count++;
  return false;
}

/**
 * Emit a structured guardrail log entry.
 */
export function guardrailLog(
  event: string,
  details: {
    proposal_id?: string;
    previous_value?: unknown;
    proposed_value?: unknown;
    final_value?: unknown;
    reason: string;
    metadata?: Record<string, unknown>;
  }
): void {
  if (isRateLimited(event)) return;

  const entry: GuardrailLogEntry = {
    event,
    proposal_id: details.proposal_id,
    previous_value: details.previous_value,
    proposed_value: details.proposed_value,
    final_value: details.final_value,
    reason: details.reason,
    timestamp: new Date().toISOString(),
    metadata: details.metadata,
  };

  // Buffer for queryability
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER) {
    logBuffer.splice(0, logBuffer.length - MAX_BUFFER);
  }

  // Emit to structured logger
  const level =
    event.includes('rejected') || event.includes('blocked') || event.includes('rollback')
      ? 'warn'
      : event.includes('error') || event.includes('spike')
        ? 'error'
        : 'info';

  log[level](`[${event}] ${details.reason}`, {
    proposal_id: details.proposal_id,
    previous_value: details.previous_value,
    proposed_value: details.proposed_value,
    final_value: details.final_value,
    ...details.metadata,
  });
}

/**
 * Get recent guardrail log entries.
 */
export function getGuardrailLogs(filter?: {
  event?: string;
  since?: number;
  limit?: number;
}): GuardrailLogEntry[] {
  const limit = Math.min(filter?.limit ?? 50, MAX_BUFFER);
  return logBuffer
    .filter(e =>
      (!filter?.event || e.event === filter.event) &&
      (!filter?.since || new Date(e.timestamp).getTime() >= filter.since)
    )
    .slice(-limit);
}

/**
 * Clear log buffer (testing only).
 */
export function clearGuardrailLogs(): void {
  logBuffer.length = 0;
}
