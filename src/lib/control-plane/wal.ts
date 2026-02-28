/**
 * Write-Ahead Log (WAL) Event Buffer
 * Captures domain mutations for replay + tamper-evidence.
 * Gated behind 'substrate.cp_wal_enabled' flag.
 */

import { isEnabled } from '@/lib/substrate/feature-flags';

export interface WalEvent {
  domain: string;
  action: string;
  key: string | null;
  before: unknown;
  after: unknown;
  metadata: Record<string, unknown>;
  timestamp: number;
}

const MAX_BUFFER = 5000;
let buffer: WalEvent[] = [];
let droppedCount = 0;

export function appendWalEvent(
  domain: string,
  action: string,
  key: string | null,
  before: unknown,
  after: unknown,
  metadata: Record<string, unknown> = {}
): void {
  if (!isEnabled('substrate.cp_wal_enabled')) return;

  if (buffer.length >= MAX_BUFFER) {
    // Drop oldest
    buffer.shift();
    droppedCount++;
  }

  buffer.push({ domain, action, key, before, after, metadata, timestamp: Date.now() });
}

export function drainWalEvents(): WalEvent[] {
  const events = [...buffer];
  buffer = [];
  return events;
}

export function getWalStats(): { buffered: number; dropped: number } {
  return { buffered: buffer.length, dropped: droppedCount };
}

export function clearWalBuffer(): void {
  buffer = [];
  droppedCount = 0;
}
