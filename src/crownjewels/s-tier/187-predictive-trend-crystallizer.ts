/**
 * S-Tier 187 — Predictive Trend Crystallizer
 * ID: S-ANL02 | CJPI: 92 | Module: ANALYTICS
 *
 * Full standalone implementation: ingests time-series data, detects trends
 * via linear regression, identifies seasonality through autocorrelation,
 * and forecasts future values with confidence intervals.
 */

export interface TrendResult {
  trend: 'rising' | 'falling' | 'stable';
  slope: number;
  intercept: number;
  confidence: number;
  seasonality: boolean;
  seasonalPeriod: number | null;
  forecast: number[];
}

export interface TrendDataPoint {
  metric: string;
  value: number;
  timestamp: number;
}

export class PredictiveTrendCrystallizer {
  private dataPoints: TrendDataPoint[] = [];
  private readonly maxBuffer: number;

  constructor(maxBuffer: number = 2000) {
    this.maxBuffer = maxBuffer;
  }

  ingest(metric: string, value: number): void {
    this.dataPoints.push({ metric, value, timestamp: Date.now() });
    if (this.dataPoints.length > this.maxBuffer) {
      this.dataPoints = this.dataPoints.slice(-this.maxBuffer);
    }
  }

  ingestBatch(metric: string, values: { value: number; timestamp: number }[]): void {
    for (const v of values) {
      this.dataPoints.push({ metric, value: v.value, timestamp: v.timestamp });
    }
    if (this.dataPoints.length > this.maxBuffer) {
      this.dataPoints = this.dataPoints.slice(-this.maxBuffer);
    }
  }

  crystallize(metric: string, forecastSteps: number = 5): TrendResult {
    const points = this.dataPoints.filter(d => d.metric === metric);
    if (points.length < 5) {
      return { trend: 'stable', slope: 0, intercept: 0, confidence: 0, seasonality: false, seasonalPeriod: null, forecast: [] };
    }

    const values = points.map(p => p.value);
    const n = values.length;

    // Linear regression: y = slope * x + intercept
    const xs = values.map((_, i) => i);
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((s, v) => s + v, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (xs[i] - xMean) * (values[i] - yMean);
      denominator += (xs[i] - xMean) ** 2;
    }
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // R² for confidence
    const ssRes = values.reduce((s, v, i) => s + (v - (slope * i + intercept)) ** 2, 0);
    const ssTot = values.reduce((s, v) => s + (v - yMean) ** 2, 0);
    const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
    const confidence = Math.min(0.99, rSquared * Math.min(1, n / 30));

    // Seasonality via autocorrelation
    const { detected: seasonality, period: seasonalPeriod } = this.detectSeasonality(values);

    // Trend classification
    const normalizedSlope = yMean !== 0 ? slope / Math.abs(yMean) : slope;
    const trend: TrendResult['trend'] = normalizedSlope > 0.02 ? 'rising' : normalizedSlope < -0.02 ? 'falling' : 'stable';

    // Forecast
    const forecast: number[] = [];
    for (let step = 1; step <= forecastSteps; step++) {
      const base = slope * (n - 1 + step) + intercept;
      if (seasonality && seasonalPeriod !== null && seasonalPeriod > 0) {
        const seasonIndex = (n - 1 + step) % seasonalPeriod;
        const seasonalValues = values.filter((_, i) => i % seasonalPeriod === seasonIndex);
        const seasonalMean = seasonalValues.length > 0 ? seasonalValues.reduce((s, v) => s + v, 0) / seasonalValues.length : yMean;
        const seasonalFactor = yMean !== 0 ? seasonalMean / yMean : 1;
        forecast.push(Math.round(base * seasonalFactor * 100) / 100);
      } else {
        forecast.push(Math.round(base * 100) / 100);
      }
    }

    return { trend, slope: Math.round(slope * 1e6) / 1e6, intercept: Math.round(intercept * 100) / 100, confidence, seasonality, seasonalPeriod, forecast };
  }

  private detectSeasonality(values: number[]): { detected: boolean; period: number | null } {
    if (values.length < 12) return { detected: false, period: null };

    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const centered = values.map(v => v - mean);
    const variance = centered.reduce((s, v) => s + v * v, 0) / centered.length;
    if (variance === 0) return { detected: false, period: null };

    let bestCorr = 0;
    let bestLag = 0;

    for (let lag = 2; lag <= Math.min(Math.floor(values.length / 3), 50); lag++) {
      let corr = 0;
      for (let i = 0; i < centered.length - lag; i++) {
        corr += centered[i] * centered[i + lag];
      }
      corr /= (centered.length - lag) * variance;
      if (corr > bestCorr) {
        bestCorr = corr;
        bestLag = lag;
      }
    }

    return bestCorr > 0.3 ? { detected: true, period: bestLag } : { detected: false, period: null };
  }

  getMetrics(): string[] {
    return [...new Set(this.dataPoints.map(d => d.metric))];
  }

  getStats(): { totalPoints: number; metrics: number; oldestTimestamp: number | null; newestTimestamp: number | null } {
    return {
      totalPoints: this.dataPoints.length,
      metrics: this.getMetrics().length,
      oldestTimestamp: this.dataPoints.length > 0 ? this.dataPoints[0].timestamp : null,
      newestTimestamp: this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].timestamp : null,
    };
  }

  reset(): void {
    this.dataPoints = [];
  }
}
