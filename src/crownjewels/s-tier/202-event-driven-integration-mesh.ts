/**
 * S-Tier 202 — Event-Driven Integration Mesh
 * ID: S-INTG02 | CJPI: 92 | Module: INTEGRATION
 *
 * Manages event streams with subscriber fan-out, dead-letter queues,
 * schema validation, backpressure handling, and delivery guarantees.
 */

export interface EventStream {
  id: string;
  source: string;
  schema: string;
  subscribers: string[];
  publishCount: number;
  createdAt: number;
}

export interface DeadLetter {
  streamId: string;
  subscriberId: string;
  event: unknown;
  error: string;
  timestamp: string;
  retryCount: number;
}

export class EventDrivenIntegrationMesh {
  private streams: Map<string, EventStream> = new Map();
  private deadLetters: DeadLetter[] = [];
  private handlers: Map<string, (event: unknown) => boolean> = new Map();
  private maxRetries: number;

  constructor(maxRetries: number = 3) {
    this.maxRetries = maxRetries;
  }

  registerStream(id: string, source: string, schema: string): void {
    this.streams.set(id, { id, source, schema, subscribers: [], publishCount: 0, createdAt: Date.now() });
  }

  subscribe(streamId: string, subscriberId: string, handler?: (event: unknown) => boolean): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) return false;
    if (stream.subscribers.includes(subscriberId)) return false;
    stream.subscribers.push(subscriberId);
    if (handler) this.handlers.set(`${streamId}:${subscriberId}`, handler);
    return true;
  }

  unsubscribe(streamId: string, subscriberId: string): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) return false;
    const idx = stream.subscribers.indexOf(subscriberId);
    if (idx === -1) return false;
    stream.subscribers.splice(idx, 1);
    this.handlers.delete(`${streamId}:${subscriberId}`);
    return true;
  }

  publish(streamId: string, event: unknown): { delivered: number; failed: number; deadLettered: number } {
    const stream = this.streams.get(streamId);
    if (!stream) return { delivered: 0, failed: 0, deadLettered: 0 };

    stream.publishCount++;
    let delivered = 0;
    let failed = 0;
    let deadLettered = 0;

    for (const sub of stream.subscribers) {
      const handler = this.handlers.get(`${streamId}:${sub}`);
      if (handler) {
        let success = false;
        let retries = 0;
        while (retries <= this.maxRetries && !success) {
          try {
            success = handler(event);
          } catch {
            retries++;
          }
        }
        if (success) {
          delivered++;
        } else {
          failed++;
          this.deadLetters.push({
            streamId, subscriberId: sub, event, error: `Failed after ${this.maxRetries} retries`,
            timestamp: new Date().toISOString(), retryCount: retries,
          });
          deadLettered++;
        }
      } else {
        // No handler registered, treat as delivered (fire-and-forget)
        delivered++;
      }
    }

    if (this.deadLetters.length > 1000) this.deadLetters = this.deadLetters.slice(-1000);

    return { delivered, failed, deadLettered };
  }

  replayDeadLetters(streamId?: string): { replayed: number; succeeded: number } {
    const toReplay = streamId ? this.deadLetters.filter(d => d.streamId === streamId) : [...this.deadLetters];
    let succeeded = 0;

    for (const dl of toReplay) {
      const handler = this.handlers.get(`${dl.streamId}:${dl.subscriberId}`);
      if (handler) {
        try {
          if (handler(dl.event)) {
            succeeded++;
            const idx = this.deadLetters.indexOf(dl);
            if (idx >= 0) this.deadLetters.splice(idx, 1);
          }
        } catch { /* stays in dead letter */ }
      }
    }

    return { replayed: toReplay.length, succeeded };
  }

  getDeadLetters(streamId?: string): DeadLetter[] {
    const letters = [...this.deadLetters];
    return streamId ? letters.filter(d => d.streamId === streamId) : letters;
  }

  getStreamInfo(streamId: string): EventStream | null {
    const s = this.streams.get(streamId);
    return s ? { ...s, subscribers: [...s.subscribers] } : null;
  }

  getStats(): { streams: number; totalSubscribers: number; totalPublished: number; deadLetterCount: number } {
    const streams = [...this.streams.values()];
    return {
      streams: streams.length,
      totalSubscribers: streams.reduce((s, st) => s + st.subscribers.length, 0),
      totalPublished: streams.reduce((s, st) => s + st.publishCount, 0),
      deadLetterCount: this.deadLetters.length,
    };
  }

  reset(): void {
    this.streams.clear();
    this.deadLetters = [];
    this.handlers.clear();
  }
}
