/**
 * S-Tier 064 — Priority-Aware Relay
 * CJPI: 93 | Node: RELAY | ID: S-RLY02
 *
 * Message relay with priority queuing. High-priority messages
 * jump the queue, ensuring critical signals aren't delayed.
 */

export interface RelayMessage {
  id: string;
  from: string;
  to: string;
  priority: number; // higher = more urgent
  payload: unknown;
  enqueuedAt: number;
  deliveredAt: number | null;
}

const queue: RelayMessage[] = [];
let msgSeq = 0;

export function enqueue(from: string, to: string, payload: unknown, priority = 5): RelayMessage {
  const msg: RelayMessage = {
    id: `relay-${++msgSeq}`,
    from, to, priority, payload,
    enqueuedAt: Date.now(),
    deliveredAt: null,
  };
  // Insert in priority order (descending)
  const idx = queue.findIndex(m => m.priority < priority);
  if (idx === -1) queue.push(msg); else queue.splice(idx, 0, msg);
  return msg;
}

export function dequeue(): RelayMessage | null {
  const msg = queue.shift() ?? null;
  if (msg) msg.deliveredAt = Date.now();
  return msg;
}

export function peek(): RelayMessage | null {
  return queue[0] ?? null;
}

export function getQueueSize(): number { return queue.length; }
export function getQueueSnapshot(): RelayMessage[] { return [...queue]; }
export function clearQueue(): void { queue.length = 0; }
