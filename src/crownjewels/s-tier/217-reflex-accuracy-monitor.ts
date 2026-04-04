/**
 * S-Tier 217 — Reflex Accuracy Monitor
 * ID: S-RFX03 | CJPI: 91 | Module: REFLEX
 *
 * Monitors reflex vs cognitive result accuracy with drift detection,
 * rolling window analysis, and automatic recalibration triggers.
 */

export interface ComparisonRecord {
  reflexResult: unknown;
  cognitiveResult: unknown;
  match: boolean;
  timestamp: number;
  latencyDelta: number;
  category: string;
}

export interface DriftReport {
  isDrifting: boolean;
  accuracy: number;
  threshold: number;
  windowMs: number;
  recentComparisons: number;
  driftDirection: 'improving' | 'degrading' | 'stable';
  recommendRecalibration: boolean;
}

export class ReflexAccuracyMonitor {
  private comparisons: ComparisonRecord[] = [];
  private readonly maxBuffer: number;
  private recalibrationCallbacks: (() => void)[] = [];

  constructor(maxBuffer: number = 1000) {
    this.maxBuffer = maxBuffer;
  }

  compare(reflexResult: unknown, cognitiveResult: unknown, category: string = 'default', latencyDelta: number = 0): boolean {
    const match = this.deepCompare(reflexResult, cognitiveResult);
    this.comparisons.push({ reflexResult, cognitiveResult, match, timestamp: Date.now(), latencyDelta, category });
    if (this.comparisons.length > this.maxBuffer) this.comparisons.shift();

    // Check if recalibration needed
    if (this.comparisons.length > 50 && this.getAccuracy(60000) < 0.8) {
      for (const cb of this.recalibrationCallbacks) cb();
    }

    return match;
  }

  private deepCompare(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;
    if (typeof a === 'number' && typeof b === 'number') {
      // Numeric tolerance for floating point
      return Math.abs(a - b) < 1e-10;
    }
    return JSON.stringify(a) === JSON.stringify(b);
  }

  getAccuracy(windowMs: number = 300000): number {
    const cutoff = Date.now() - windowMs;
    const recent = this.comparisons.filter(c => c.timestamp > cutoff);
    return recent.length > 0 ? recent.filter(c => c.match).length / recent.length : 1;
  }

  getAccuracyByCategory(windowMs: number = 300000): Map<string, number> {
    const cutoff = Date.now() - windowMs;
    const recent = this.comparisons.filter(c => c.timestamp > cutoff);
    const categories = new Map<string, { matches: number; total: number }>();

    for (const c of recent) {
      const existing = categories.get(c.category) ?? { matches: 0, total: 0 };
      existing.total++;
      if (c.match) existing.matches++;
      categories.set(c.category, existing);
    }

    const result = new Map<string, number>();
    for (const [cat, data] of categories) {
      result.set(cat, data.total > 0 ? data.matches / data.total : 1);
    }
    return result;
  }

  isDrifting(threshold: number = 0.9, windowMs: number = 300000): DriftReport {
    const accuracy = this.getAccuracy(windowMs);
    const cutoff = Date.now() - windowMs;
    const recent = this.comparisons.filter(c => c.timestamp > cutoff);

    // Compute drift direction by splitting window
    let driftDirection: DriftReport['driftDirection'] = 'stable';
    if (recent.length >= 10) {
      const half = Math.floor(recent.length / 2);
      const firstHalf = recent.slice(0, half);
      const secondHalf = recent.slice(half);
      const firstAcc = firstHalf.filter(c => c.match).length / firstHalf.length;
      const secondAcc = secondHalf.filter(c => c.match).length / secondHalf.length;
      driftDirection = secondAcc - firstAcc > 0.05 ? 'improving' : secondAcc - firstAcc < -0.05 ? 'degrading' : 'stable';
    }

    return {
      isDrifting: accuracy < threshold,
      accuracy,
      threshold,
      windowMs,
      recentComparisons: recent.length,
      driftDirection,
      recommendRecalibration: accuracy < threshold * 0.9 || driftDirection === 'degrading',
    };
  }

  onRecalibrationNeeded(callback: () => void): void {
    this.recalibrationCallbacks.push(callback);
  }

  getStats(): { totalComparisons: number; overallAccuracy: number; avgLatencyDelta: number; categories: number } {
    const accuracy = this.comparisons.length > 0
      ? this.comparisons.filter(c => c.match).length / this.comparisons.length
      : 1;
    const avgLatency = this.comparisons.length > 0
      ? this.comparisons.reduce((s, c) => s + c.latencyDelta, 0) / this.comparisons.length
      : 0;
    return {
      totalComparisons: this.comparisons.length,
      overallAccuracy: accuracy,
      avgLatencyDelta: avgLatency,
      categories: new Set(this.comparisons.map(c => c.category)).size,
    };
  }

  reset(): void {
    this.comparisons = [];
    this.recalibrationCallbacks = [];
  }
}
