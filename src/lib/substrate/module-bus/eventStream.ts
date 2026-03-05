/**
 * Substrate Event Stream — Observable stream of system activity
 * Aggregates module-bus signals for debugging and governance observability.
 */

import { subscribe, type ModuleSignal } from './index';

// ═══════════════════════════════════════════════════════════════
// STREAM BUFFER
// ═══════════════════════════════════════════════════════════════

const MAX_STREAM_SIZE = 500;

export interface StreamEntry {
  index: number;
  signal: ModuleSignal;
  captured_at: string;
}

const stream: StreamEntry[] = [];
let counter = 0;
let initialized = false;

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize the event stream — subscribes to all module-bus signals.
 * Safe to call multiple times (idempotent).
 */
export function initEventStream(): void {
  if (initialized) return;

  subscribe('system', '*', (signal: ModuleSignal) => {
    stream.push({
      index: counter++,
      signal,
      captured_at: new Date().toISOString(),
    });

    // Ring buffer — drop oldest when full
    if (stream.length > MAX_STREAM_SIZE) {
      stream.shift();
    }
  });

  initialized = true;
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/** Get recent events from the stream */
export function getRecentStreamEvents(limit: number = 50): StreamEntry[] {
  return stream.slice(-limit);
}

/** Get events filtered by signal type */
export function getStreamByType(type: string, limit: number = 50): StreamEntry[] {
  return stream
    .filter(e => e.signal.type === type)
    .slice(-limit);
}

/** Get events from a specific module */
export function getStreamByModule(module: string, limit: number = 50): StreamEntry[] {
  return stream
    .filter(e => e.signal.from === module)
    .slice(-limit);
}

/** Get stream size and stats */
export function getStreamStats(): {
  total_captured: number;
  buffer_size: number;
  max_size: number;
  oldest_entry: string | null;
  newest_entry: string | null;
  initialized: boolean;
} {
  return {
    total_captured: counter,
    buffer_size: stream.length,
    max_size: MAX_STREAM_SIZE,
    oldest_entry: stream.length > 0 ? stream[0].captured_at : null,
    newest_entry: stream.length > 0 ? stream[stream.length - 1].captured_at : null,
    initialized,
  };
}

/** Clear the stream buffer */
export function clearStream(): number {
  const cleared = stream.length;
  stream.length = 0;
  return cleared;
}
