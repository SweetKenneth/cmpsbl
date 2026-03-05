/**
 * Substrate Event Stream — Observable stream of system activity
 * Aggregates module-bus signals for debugging and governance observability.
 * 
 * Features:
 * - In-memory 500-entry ring buffer (fast + cheap)
 * - Optional CP-backed persistence (off by default)
 */

import { subscribe, type ModuleSignal } from './index';
import { cpPut, cpDelete, cpList } from '../control-plane/adapters/queueStateAdapter';

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
        await cpPut(`bus:event:${entry.index}`, entry);
        // Evict old persisted entries beyond cap
        if (entry.index % 50 === 0) {
          const persisted = await cpList('bus:event:');
          if (persisted.length > MAX_PERSISTED) {
            const toRemove = persisted
              .sort((a, b) => a.key.localeCompare(b.key))
              .slice(0, persisted.length - MAX_PERSISTED);
            for (const item of toRemove) {
              await cpDelete(item.key);
            }
          }
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
} {
  return {
    total_captured: counter,
    buffer_size: stream.length,
    max_size: MAX_STREAM_SIZE,
    oldest_entry: stream.length > 0 ? stream[0].captured_at : null,
    newest_entry: stream.length > 0 ? stream[stream.length - 1].captured_at : null,
    initialized,
    persistence_enabled: persistenceEnabled,
  };
}

/** Clear the stream buffer */
export function clearStream(): number {
  const cleared = stream.length;
  stream.length = 0;
  return cleared;
}
