/**
 * S-Tier 212 — Confidence Calibration Engine
 * ID: S-ORC04 | CJPI: 91 | Module: ORACLE
 *
 * Calibrates prediction confidence using histogram binning, Platt scaling,
 * Brier score computation, and reliability diagram generation.
 */

export interface CalibrationBin {
  range: string;
  predicted: number;
  actual: number;
  count: number;
  gap: number;
}

export interface CalibrationReport {
  bins: CalibrationBin[];
  calibrationError: number;
  brierScore: number;
  overconfidenceRate: number;
  underconfidenceRate: number;
  totalPredictions: number;
  recommendation: string;
}

export class ConfidenceCalibrationEngine {
  private predictions: { confidence: number; correct: boolean; timestamp: number; category?: string }[] = [];
  private binCount: number;

  constructor(binCount: number = 10) {
    this.binCount = binCount;
  }

  record(confidence: number, correct: boolean, category?: string): void {
    this.predictions.push({ confidence: Math.min(1, Math.max(0, confidence)), correct, timestamp: Date.now(), category });
    if (this.predictions.length > 10000) this.predictions = this.predictions.slice(-10000);
  }

  calibrate(windowMs?: number): CalibrationReport {
    const preds = windowMs
      ? this.predictions.filter(p => Date.now() - p.timestamp < windowMs)
      : this.predictions;

    if (preds.length === 0) {
      return { bins: [], calibrationError: 0, brierScore: 0, overconfidenceRate: 0, underconfidenceRate: 0, totalPredictions: 0, recommendation: 'Insufficient data' };
    }

    const bins: CalibrationBin[] = [];
    let overconfident = 0;
    let underconfident = 0;

    for (let i = 0; i < this.binCount; i++) {
      const lo = i / this.binCount;
      const hi = (i + 1) / this.binCount;
      const inBin = preds.filter(p => p.confidence >= lo && p.confidence < (i === this.binCount - 1 ? 1.01 : hi));
      if (inBin.length === 0) continue;

      const predicted = (lo + hi) / 2;
      const actual = inBin.filter(p => p.correct).length / inBin.length;
      const gap = Math.abs(predicted - actual);

      if (predicted > actual) overconfident += inBin.length;
      else underconfident += inBin.length;

      bins.push({ range: `${(lo * 100).toFixed(0)}-${(hi * 100).toFixed(0)}%`, predicted, actual, count: inBin.length, gap });
    }

    // Expected Calibration Error
    const calibrationError = bins.reduce((s, b) => s + b.gap * b.count, 0) / preds.length;

    // Brier Score
    const brierScore = preds.reduce((s, p) => s + (p.confidence - (p.correct ? 1 : 0)) ** 2, 0) / preds.length;

    const recommendation = calibrationError < 0.05
      ? 'Well-calibrated'
      : overconfident > underconfident
        ? 'Overconfident — reduce confidence scores'
        : 'Underconfident — increase confidence scores';

    return {
      bins,
      calibrationError,
      brierScore,
      overconfidenceRate: preds.length > 0 ? overconfident / preds.length : 0,
      underconfidenceRate: preds.length > 0 ? underconfident / preds.length : 0,
      totalPredictions: preds.length,
      recommendation,
    };
  }

  plattScale(confidence: number): number {
    // Logistic regression calibration: P(correct|confidence) = 1 / (1 + exp(-(a*conf + b)))
    const report = this.calibrate();
    if (report.bins.length < 3) return confidence;

    // Simple linear fit from bins
    const points = report.bins.filter(b => b.count > 0);
    if (points.length < 2) return confidence;

    const xMean = points.reduce((s, b) => s + b.predicted, 0) / points.length;
    const yMean = points.reduce((s, b) => s + b.actual, 0) / points.length;

    let num = 0, den = 0;
    for (const b of points) {
      num += (b.predicted - xMean) * (b.actual - yMean);
      den += (b.predicted - xMean) ** 2;
    }
    const slope = den > 0 ? num / den : 1;
    const intercept = yMean - slope * xMean;

    return Math.min(1, Math.max(0, slope * confidence + intercept));
  }

  getStats(): { totalPredictions: number; accuracy: number; avgConfidence: number; calibrationError: number } {
    const accuracy = this.predictions.length > 0
      ? this.predictions.filter(p => p.correct).length / this.predictions.length
      : 0;
    const avgConf = this.predictions.length > 0
      ? this.predictions.reduce((s, p) => s + p.confidence, 0) / this.predictions.length
      : 0;
    return {
      totalPredictions: this.predictions.length,
      accuracy,
      avgConfidence: avgConf,
      calibrationError: this.calibrate().calibrationError,
    };
  }

  reset(): void {
    this.predictions = [];
  }
}
