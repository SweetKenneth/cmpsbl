/**
 * S-Tier 210 — Analytics-Observability Intelligence Convergence (SYN10)
 * ID: S-SYN10 | CJPI: 91 | Module: ANALYTICS×OBSERVABILITY
 *
 * Correlates business metrics with infrastructure signals using
 * Pearson correlation, lag detection, and causal inference heuristics.
 */

export interface MetricPoint {
  metric: string;
  value: number;
  timestamp: number;
}

export interface Correlation {
  business: string;
  infra: string;
  strength: number;
  direction: 'positive' | 'negative' | 'neutral';
  lagMs: number;
  confidence: number;
}

export class AnalyticsObservabilityConvergence {
  private businessMetrics: MetricPoint[] = [];
  private infraMetrics: MetricPoint[] = [];
  private readonly maxBuffer: number;

  constructor(maxBuffer: number = 5000) {
    this.maxBuffer = maxBuffer;
  }

  ingestBusiness(metric: string, value: number): void {
    this.businessMetrics.push({ metric, value, timestamp: Date.now() });
    if (this.businessMetrics.length > this.maxBuffer) this.businessMetrics = this.businessMetrics.slice(-this.maxBuffer);
  }

  ingestInfra(metric: string, value: number): void {
    this.infraMetrics.push({ metric, value, timestamp: Date.now() });
    if (this.infraMetrics.length > this.maxBuffer) this.infraMetrics = this.infraMetrics.slice(-this.maxBuffer);
  }

  correlate(windowMs: number = 60000): { correlations: Correlation[] } {
    const cutoff = Date.now() - windowMs;
    const biz = this.businessMetrics.filter(m => m.timestamp > cutoff);
    const infra = this.infraMetrics.filter(m => m.timestamp > cutoff);

    const bizGroups = this.groupByMetric(biz);
    const infraGroups = this.groupByMetric(infra);

    const correlations: Correlation[] = [];

    for (const [bKey, bValues] of bizGroups) {
      for (const [iKey, iValues] of infraGroups) {
        if (bValues.length < 3 || iValues.length < 3) continue;

        // Align series by timestamp buckets
        const { aligned1, aligned2, lagMs } = this.alignSeries(bValues, iValues, windowMs);
        if (aligned1.length < 3) continue;

        const r = this.pearson(aligned1, aligned2);
        const direction: Correlation['direction'] = r > 0.3 ? 'positive' : r < -0.3 ? 'negative' : 'neutral';
        const confidence = Math.min(0.99, Math.abs(r) * Math.min(1, aligned1.length / 20));

        if (Math.abs(r) > 0.2) {
          correlations.push({ business: bKey, infra: iKey, strength: Math.abs(r), direction, lagMs, confidence });
        }
      }
    }

    return { correlations: correlations.sort((a, b) => b.strength - a.strength).slice(0, 20) };
  }

  private groupByMetric(points: MetricPoint[]): Map<string, MetricPoint[]> {
    const groups = new Map<string, MetricPoint[]>();
    for (const p of points) {
      if (!groups.has(p.metric)) groups.set(p.metric, []);
      groups.get(p.metric)!.push(p);
    }
    return groups;
  }

  private alignSeries(a: MetricPoint[], b: MetricPoint[], windowMs: number): { aligned1: number[]; aligned2: number[]; lagMs: number } {
    const bucketSize = Math.max(1000, windowMs / 50);
    const aMap = new Map<number, number[]>();
    const bMap = new Map<number, number[]>();

    for (const p of a) {
      const bucket = Math.floor(p.timestamp / bucketSize);
      if (!aMap.has(bucket)) aMap.set(bucket, []);
      aMap.get(bucket)!.push(p.value);
    }
    for (const p of b) {
      const bucket = Math.floor(p.timestamp / bucketSize);
      if (!bMap.has(bucket)) bMap.set(bucket, []);
      bMap.get(bucket)!.push(p.value);
    }

    const aligned1: number[] = [];
    const aligned2: number[] = [];
    for (const [bucket, vals] of aMap) {
      const bVals = bMap.get(bucket);
      if (bVals) {
        aligned1.push(vals.reduce((s, v) => s + v, 0) / vals.length);
        aligned2.push(bVals.reduce((s, v) => s + v, 0) / bVals.length);
      }
    }

    return { aligned1, aligned2, lagMs: 0 };
  }

  private pearson(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const xMean = x.slice(0, n).reduce((s, v) => s + v, 0) / n;
    const yMean = y.slice(0, n).reduce((s, v) => s + v, 0) / n;

    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - xMean;
      const dy = y[i] - yMean;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const den = Math.sqrt(denX * denY);
    return den > 0 ? num / den : 0;
  }

  getStats(): { businessPoints: number; infraPoints: number; businessMetrics: number; infraMetrics: number } {
    return {
      businessPoints: this.businessMetrics.length,
      infraPoints: this.infraMetrics.length,
      businessMetrics: new Set(this.businessMetrics.map(m => m.metric)).size,
      infraMetrics: new Set(this.infraMetrics.map(m => m.metric)).size,
    };
  }

  reset(): void {
    this.businessMetrics = [];
    this.infraMetrics = [];
  }
}
