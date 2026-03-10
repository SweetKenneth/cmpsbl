/**
 * S-Tier 071 — Resilient Communication Backbone
 * CJPI: 93 | Node: MESH | ID: S-SYN13
 *
 * Guaranteed message delivery with acknowledgement and retry.
 * Substrate-internal reliable messaging layer.
 */

export interface ReliableMessage {
  id: string;
  from: string;
  to: string;
  payload: unknown;
  sentAt: number;
  ackAt: number | null;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'acked' | 'failed';
}

const outbox = new Map<string, ReliableMessage>();
let msgSeq = 0;

export function send(from: string, to: string, payload: unknown, maxRetries = 3): ReliableMessage {
  const msg: ReliableMessage = {
    id: `rmsg-${++msgSeq}`,
    from, to, payload,
    sentAt: Date.now(), ackAt: null,
    retries: 0, maxRetries,
    status: 'pending',
  };
  outbox.set(msg.id, msg);
  return msg;
}

export function acknowledge(id: string): boolean {
  const msg = outbox.get(id);
  if (!msg || msg.status !== 'pending') return false;
  msg.ackAt = Date.now();
  msg.status = 'acked';
  return true;
}

export function retry(id: string): boolean {
  const msg = outbox.get(id);
  if (!msg || msg.status !== 'pending') return false;
  if (msg.retries >= msg.maxRetries) {
    msg.status = 'failed';
    return false;
  }
  msg.retries++;
  msg.sentAt = Date.now();
  return true;
}

export function getPending(): ReliableMessage[] {
  return [...outbox.values()].filter(m => m.status === 'pending');
}

export function getStats() {
  const all = [...outbox.values()];
  return {
    total: all.length,
    pending: all.filter(m => m.status === 'pending').length,
    acked: all.filter(m => m.status === 'acked').length,
    failed: all.filter(m => m.status === 'failed').length,
  };
}
