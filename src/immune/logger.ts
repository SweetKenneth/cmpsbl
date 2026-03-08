/**
 * IMMUNITY — Logger
 * Writes immune events to the system log with secret redaction
 */

import type { ImmuneEvent } from './types';
import { log } from '@/lib/system/log';

/** Patterns to redact from context payloads */
const SECRET_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{20,}/g,           // JWT tokens
  /sk[-_][A-Za-z0-9]{20,}/g,           // API secret keys
  /key[-_]?[A-Za-z0-9]{16,}/gi,        // Generic keys
  /password["']?\s*[:=]\s*["'][^"']+/gi, // Password assignments
  /secret["']?\s*[:=]\s*["'][^"']+/gi,  // Secret assignments
  /Bearer\s+[A-Za-z0-9._-]+/g,         // Bearer tokens
];

function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    let clean = value;
    for (const pat of SECRET_PATTERNS) {
      clean = clean.replace(pat, '[REDACTED]');
    }
    return clean;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lk = k.toLowerCase();
      if (lk.includes('secret') || lk.includes('token') || lk.includes('password') || lk.includes('api_key') || lk.includes('apikey')) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return value;
}

export function redactContext(ctx: Record<string, unknown>): Record<string, unknown> {
  return redact(ctx) as Record<string, unknown>;
}

export function logImmuneEvent(event: ImmuneEvent): void {
  const safeEvent = {
    ...event,
    context: redactContext(event.context),
  };

  const severity = event.severity === 'critical' || event.severity === 'high' ? 'error' : 'info';
  
  if (severity === 'error') {
    log.error('immune', `[${event.stage}] ${event.executor}: ${event.outcome}`, safeEvent);
  } else {
    log.info('immune', `[${event.stage}] ${event.executor}: ${event.outcome}`, safeEvent);
  }
}
