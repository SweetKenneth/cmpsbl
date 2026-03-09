/**
 * NERVE Hardening — "Synapse" v1.0.0
 * Signal integrity, injection prevention, and flood protection.
 */

import { getNerveStats } from './index';

// ═══════════════════════════════════════════════════════════════
// SIGNAL VALIDATION
// ═══════════════════════════════════════════════════════════════

const BLOCKED_SIGNAL_TYPES = [
  '__proto__', 'constructor', 'prototype',
  'toString', 'valueOf', 'hasOwnProperty',
];

const MAX_PAYLOAD_SIZE = 64 * 1024; // 64KB
const MAX_TYPE_LENGTH = 128;

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate a signal before emission — prevents injection and oversized payloads.
 */
export function validateSignal(
  type: string,
  payload: Record<string, unknown>
): ValidationResult {
  // Type injection check
  if (!type || typeof type !== 'string') {
    return { valid: false, reason: 'Signal type must be a non-empty string' };
  }
  if (type.length > MAX_TYPE_LENGTH) {
    return { valid: false, reason: `Signal type exceeds ${MAX_TYPE_LENGTH} chars` };
  }
  if (BLOCKED_SIGNAL_TYPES.includes(type)) {
    return { valid: false, reason: `Blocked signal type: ${type}` };
  }

  // Payload size check
  try {
    const size = new Blob([JSON.stringify(payload)]).size;
    if (size > MAX_PAYLOAD_SIZE) {
      return { valid: false, reason: `Payload ${(size / 1024).toFixed(1)}KB exceeds ${MAX_PAYLOAD_SIZE / 1024}KB limit` };
    }
  } catch {
    return { valid: false, reason: 'Payload is not serializable' };
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════
// FLOOD PROTECTION
// ═══════════════════════════════════════════════════════════════

const floodCounters = new Map<string, { count: number; windowStart: number }>();
const FLOOD_WINDOW_MS = 1_000;
const FLOOD_MAX_PER_WINDOW = 100;

export function checkFloodProtection(fromNodeId: string): ValidationResult {
  const now = Date.now();
  const entry = floodCounters.get(fromNodeId);

  if (!entry || (now - entry.windowStart) > FLOOD_WINDOW_MS) {
    floodCounters.set(fromNodeId, { count: 1, windowStart: now });
    return { valid: true };
  }

  entry.count++;
  if (entry.count > FLOOD_MAX_PER_WINDOW) {
    return { valid: false, reason: `Node ${fromNodeId} exceeds ${FLOOD_MAX_PER_WINDOW} signals/sec` };
  }
  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════
// HEALTH REPORT
// ═══════════════════════════════════════════════════════════════

export interface NerveHardeningReport {
  version: string;
  timestamp: number;
  signalValidation: boolean;
  floodProtection: boolean;
  circuitBreakers: boolean;
  deduplication: boolean;
  backpressure: boolean;
  stats: {
    circuitsOpen: number;
    signalsBackpressured: number;
    signalsDeduped: number;
  };
  overallHealthy: boolean;
}

export function getHardeningReport(): NerveHardeningReport {
  const stats = getNerveStats();
  return {
    version: '1.0.0',
    timestamp: Date.now(),
    signalValidation: true,
    floodProtection: true,
    circuitBreakers: true,
    deduplication: true,
    backpressure: true,
    stats: {
      circuitsOpen: stats.circuitsOpen,
      signalsBackpressured: stats.signalsBackpressured,
      signalsDeduped: stats.signalsDeduped,
    },
    overallHealthy: stats.circuitsOpen < 3 && stats.nodesDead < 2,
  };
}
