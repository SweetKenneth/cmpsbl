/**
 * S-Tier 099 — Telemetry Ingestion Pipeline
 * ID: S-121 | CJPI: 90 | Module: VISION
 * 
 * High-throughput telemetry ingestion with batching, sampling, and routing.
 */

export type TelemetryType = 'metric' | 'trace' | 'log' | 'event';

export interface TelemetryRecord {
  id: string;
  type: TelemetryType;
  source: string;
  timestamp: string;
  data: Record<string, unknown>;
  tags: Record<string, string>;
}

export interface IngestionConfig {
  batchSize: number;
  flushIntervalMs: number;
  sampleRate: number; // 0-1
  maxQueueSize: number;
  routingRules: RoutingRule[];
}

export interface RoutingRule {
  match: { type?: TelemetryType; sourcePattern?: string; tagKey?: string; tagValue?: string };
  destination: string;
  transform?: 'aggregate' | 'downsample' | 'passthrough';
}

export interface IngestionStats {
  received: number;
  sampled: number;
  batched: number;
  flushed: number;
  dropped: number;
  routedTo: Record<string, number>;
}

export class TelemetryIngestionPipeline {
  private config: IngestionConfig;
  private queue: TelemetryRecord[] = [];
  private stats: IngestionStats = { received: 0, sampled: 0, batched: 0, flushed: 0, dropped: 0, routedTo: {} };
  private batches: TelemetryRecord[][] = [];

  constructor(config: Partial<IngestionConfig> = {}) {
    this.config = {
      batchSize: config.batchSize ?? 100,
      flushIntervalMs: config.flushIntervalMs ?? 5000,
      sampleRate: config.sampleRate ?? 1,
      maxQueueSize: config.maxQueueSize ?? 10000,
      routingRules: config.routingRules ?? [],
    };
  }

  ingest(record: TelemetryRecord): boolean {
    this.stats.received++;

    // Sampling
    if (Math.random() > this.config.sampleRate) {
      this.stats.dropped++;
      return false;
    }
    this.stats.sampled++;

    // Queue overflow protection
    if (this.queue.length >= this.config.maxQueueSize) {
      this.stats.dropped++;
      return false;
    }

    this.queue.push(record);

    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }

    return true;
  }

  flush(): TelemetryRecord[][] {
    if (this.queue.length === 0) return [];

    const flushed: TelemetryRecord[][] = [];
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.config.batchSize);
      this.stats.batched++;
      flushed.push(batch);
      this.batches.push(batch);
    }

    this.stats.flushed += flushed.length;
    return flushed;
  }

  route(record: TelemetryRecord): string {
    for (const rule of this.config.routingRules) {
      const m = rule.match;
      if (m.type && m.type !== record.type) continue;
      if (m.sourcePattern && !record.source.includes(m.sourcePattern)) continue;
      if (m.tagKey && m.tagValue && record.tags[m.tagKey] !== m.tagValue) continue;

      this.stats.routedTo[rule.destination] = (this.stats.routedTo[rule.destination] || 0) + 1;
      return rule.destination;
    }
    return 'default';
  }

  getStats(): IngestionStats { return { ...this.stats }; }
  getQueueDepth(): number { return this.queue.length; }
}
