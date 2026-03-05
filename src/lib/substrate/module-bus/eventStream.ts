/**
 * Substrate Event Stream — Observable stream of system activity
 * Aggregates module-bus signals for debugging and governance observability.
 *
 * Features:
 * - In-memory 500-entry ring buffer (fast + cheap)
 * - Optional CP-backed persistence (off by default)
 * - Deterministic index-range eviction for persisted entries
 */

import { subscribe, type ModuleSignal } from './index';
import { cpPut, cpDelete } from '../control-plane/adapters/queueStateAdapter';

// ═══════════════════════════════════════════════════════════════
// STREAM BUFFER
// ═══════════════════════════════════════════════════════════════

const MAX_STREAM_SIZE = 500;
const MAX_PERSISTED = 100;

export interface StreamEntry {
  index: number;
  signal: ModuleSignal;
  captured_at: string;
}

const stream: StreamEntry[] = [];
let counter = 0;
let initialized = false;
let persistenceEnabled = false;

// Track min/max persisted index for deterministic eviction
let minPersistedIndex = -1;
let maxPersistedIndex = -1;

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize the event stream — subscribes to all module-bus signals.
 * Safe to call multiple times (idempotent).
 */
export function initEventStream(): void {
  if (initialized) return;

  subscribe('system', '*', async (signal: ModuleSignal) => {
    const entry: StreamEntry = {
      index: counter++,
      signal,
      captured_at: new Date().toISOString(),
    };

    stream.push(entry);

    // Ring buffer — drop oldest when full
    if (stream.length > MAX_STREAM_SIZE) {
      stream.shift();
    }

    // Optional persistence
    if (persistenceEnabled) {
      try {
        await cpPut<StreamEntry>(`bus:event:${entry.index}`, entry);

        // Track persisted range
        if (minPersistedIndex === -1) minPersistedIndex = entry.index;
        maxPersistedIndex = entry.index;

        // Evict old persisted entries beyond cap using deterministic index range
        const persistedCount = maxPersistedIndex - minPersistedIndex + 1;
        if (persistedCount > MAX_PERSISTED && entry.index % 50 === 0) {
          const toEvict = persistedCount - MAX_PERSISTED;
          for (let i = 0; i < toEvict; i++) {
            try {
              await cpDelete(`bus:event:${minPersistedIndex + i}`);
            } catch { /* best effort */ }
          }
          minPersistedIndex += toEvict;
        }
      } catch {
        // Silently skip persistence failure — ring buffer still active
      }
    }
  });

  initialized = true;
}

// ═══════════════════════════════════════════════════════════════
// PERSISTENCE TOGGLE
// ═══════════════════════════════════════════════════════════════

/** Enable or disable CP-backed persistence for the event stream */
export function setStreamPersistence(enabled: boolean): void {
  persistenceEnabled = enabled;
}

/** Check if persistence is enabled */
export function isStreamPersistent(): boolean {
  return persistenceEnabled;
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
  persistence_enabled: boolean;
  persisted_range: { min: number; max: number } | null;
} {
  return {
    total_captured: counter,
    buffer_size: stream.length,
    max_size: MAX_STREAM_SIZE,
    oldest_entry: stream.length > 0 ? stream[0].captured_at : null,
    newest_entry: stream.length > 0 ? stream[stream.length - 1].captured_at : null,
    initialized,
    persistence_enabled: persistenceEnabled,
    persisted_range: minPersistedIndex >= 0
      ? { min: minPersistedIndex, max: maxPersistedIndex }
      : null,
  };
}

/** Clear the stream buffer */
export function clearStream(): number {
  const cleared = stream.length;
  stream.length = 0;
  return cleared;
}
