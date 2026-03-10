/**
 * S-Tier 037 — Realtime Analytics Fusion
 * CJPI: 94 | Node: ANALYTICS | ID: S-ANL01
 *
 * Streaming analytics aggregator that maintains sliding-window statistics.
 * Fuses metrics from multiple substrate modules into unified dashboards.
 */

export interface MetricSample {
  module: string;
  metric: string;
  value: number;
  timestamp: number;
}

export interface WindowStats {
  count: number;
  sum: number;
  min: number;
  max: number;
  mean: number;
  p95: number;
  windowMs: number;
}

const DEFAULT_WINDOW_MS = 60_000; // 1 minute

export class StreamingAggregator {
  private samples: MetricSample[] = [];
  private windowMs: number;

  constructor(windowMs = DEFAULT_WINDOW_MS) {
    this.windowMs = windowMs;
  }

  push(sample: MetricSample): void {
    this.samples.push(sample);
    this.evict();
  }

  pushBatch(samples: MetricSample[]): void {
    this.samples.push(...samples);
    this.evict();
  }

  private evict(): void {
    const cutoff = Date.now() - this.windowMs;
    this.samples = this.samples.filter(s => s.timestamp >= cutoff);
  }

  getStats(module?: string, metric?: string): WindowStats {
    this.evict();
    let filtered = this.samples;
    if (module) filtered = filtered.filter(s => s.module === module);
    if (metric) filtered = filtered.filter(s => s.metric === metric);

    if (filtered.length === 0) {
      return { count: 0, sum: 0, min: 0, max: 0, mean: 0, p95: 0, windowMs: this.windowMs };
    }

    const values = filtered.map(s => s.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const p95Index = Math.ceil(values.length * 0.95) - 1;

    return {
      count: values.length,
      sum,
      min: values[0],
      max: values[values.length - 1],
      mean: Math.round((sum / values.length) * 1000) / 1000,
      p95: values[Math.max(0, p95Index)],
      windowMs: this.windowMs,
    };
  }

  getModuleBreakdown(): Record<string, WindowStats> {
    this.evict();
    const modules = [...new Set(this.samples.map(s => s.module))];
    const result: Record<string, WindowStats> = {};
    for (const mod of modules) {
      result[mod] = this.getStats(mod);
    }
    return result;
  }

  getSize(): number {
    return this.samples.length;
  }

  clear(): void {
    this.samples = [];
  }
}

// Singleton for substrate-wide analytics
export const globalAggregator = new StreamingAggregator();
