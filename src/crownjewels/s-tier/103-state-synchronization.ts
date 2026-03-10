/**
 * S-Tier 103 — State Synchronization Engine
 * ID: S-88 | CJPI: 89 | Module: NERVE
 * 
 * Distributed state sync with CRDT-based conflict resolution.
 */

export interface CRDTCounter {
  type: 'g-counter';
  nodeId: string;
  counts: Record<string, number>;
}

export interface CRDTSet<T> {
  type: 'or-set';
  nodeId: string;
  adds: Map<string, { value: T; timestamp: number }>;
  removes: Set<string>;
}

export interface SyncMessage {
  fromNode: string;
  toNode: string;
  stateKey: string;
  payload: unknown;
  vectorClock: Record<string, number>;
  timestamp: string;
}

export interface SyncStats {
  merges: number;
  conflicts: number;
  lastSyncAt: string | null;
}

// G-Counter CRDT operations
export function createGCounter(nodeId: string): CRDTCounter {
  return { type: 'g-counter', nodeId, counts: { [nodeId]: 0 } };
}

export function incrementGCounter(counter: CRDTCounter, amount = 1): CRDTCounter {
  const counts = { ...counter.counts };
  counts[counter.nodeId] = (counts[counter.nodeId] || 0) + amount;
  return { ...counter, counts };
}

export function mergeGCounters(a: CRDTCounter, b: CRDTCounter): CRDTCounter {
  const merged: Record<string, number> = { ...a.counts };
  for (const [node, count] of Object.entries(b.counts)) {
    merged[node] = Math.max(merged[node] || 0, count);
  }
  return { ...a, counts: merged };
}

export function queryGCounter(counter: CRDTCounter): number {
  return Object.values(counter.counts).reduce((s, c) => s + c, 0);
}

// Vector Clock
export class VectorClock {
  private clock: Record<string, number> = {};

  constructor(private nodeId: string) {
    this.clock[nodeId] = 0;
  }

  tick(): Record<string, number> {
    this.clock[this.nodeId] = (this.clock[this.nodeId] || 0) + 1;
    return { ...this.clock };
  }

  merge(other: Record<string, number>): void {
    for (const [node, ts] of Object.entries(other)) {
      this.clock[node] = Math.max(this.clock[node] || 0, ts);
    }
    this.tick();
  }

  happensBefore(other: Record<string, number>): boolean {
    let atLeastOneLess = false;
    for (const [node, ts] of Object.entries(other)) {
      const ours = this.clock[node] || 0;
      if (ours > ts) return false;
      if (ours < ts) atLeastOneLess = true;
    }
    return atLeastOneLess;
  }

  getClock(): Record<string, number> { return { ...this.clock }; }
}

export class StateSyncEngine {
  private states: Map<string, unknown> = new Map();
  private clock: VectorClock;
  private stats: SyncStats = { merges: 0, conflicts: 0, lastSyncAt: null };

  constructor(private nodeId: string) {
    this.clock = new VectorClock(nodeId);
  }

  set(key: string, value: unknown): SyncMessage {
    this.states.set(key, value);
    return {
      fromNode: this.nodeId,
      toNode: '*',
      stateKey: key,
      payload: value,
      vectorClock: this.clock.tick(),
      timestamp: new Date().toISOString(),
    };
  }

  receive(msg: SyncMessage): boolean {
    this.stats.lastSyncAt = new Date().toISOString();
    
    if (this.clock.happensBefore(msg.vectorClock)) {
      this.states.set(msg.stateKey, msg.payload);
      this.clock.merge(msg.vectorClock);
      this.stats.merges++;
      return true;
    }

    // Concurrent — conflict
    this.stats.conflicts++;
    // Last-writer-wins by default
    this.states.set(msg.stateKey, msg.payload);
    this.clock.merge(msg.vectorClock);
    return true;
  }

  get(key: string): unknown { return this.states.get(key); }
  getStats(): SyncStats { return { ...this.stats }; }
}
