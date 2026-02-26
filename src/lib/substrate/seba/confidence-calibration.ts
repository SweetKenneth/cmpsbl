/**
 * SEBA Confidence Calibration Engine — v1.0.0
 * 
 * Tracks predicted vs actual outcomes for SEBA proposals.
 * Over time, calibrates prediction accuracy so every future
 * estimate becomes more trustworthy.
 * 
 * Brier Score: lower is better (0 = perfect, 1 = worst)
 * Calibration Curve: predicted probability vs observed frequency
 */

import { secureGet, secureSet } from '@/lib/system/secureStorage';

export interface PredictionRecord {
  id: string;
  proposalId: string;
  predictedMetric: string;        // e.g., 'memory_efficiency', 'response_time'
  predictedValue: number;         // e.g., 15 (meaning +15%)
  predictedConfidence: number;    // 0-1 confidence in the prediction
  actualValue: number | null;     // Measured after application (null if not yet measured)
  measuredAt: string | null;
  createdAt: string;
  accurate: boolean | null;       // Was the prediction within tolerance?
  errorPct: number | null;        // How far off (%)
}

export interface CalibrationBucket {
  predictedRange: [number, number]; // e.g., [0.7, 0.8]
  totalPredictions: number;
  accuratePredictions: number;
  observedAccuracy: number;        // actual hit rate
  calibrationError: number;        // |predicted - observed|
}

export interface CalibrationReport {
  totalPredictions: number;
  measuredPredictions: number;
  brierScore: number;              // 0-1, lower is better
  meanAbsoluteError: number;       // Average prediction error
  calibrationCurve: CalibrationBucket[];
  overconfidenceScore: number;     // >0 means overconfident, <0 underconfident
  topAccurateMetrics: string[];
  worstMetrics: string[];
  adjustmentFactor: number;        // Multiply future predictions by this
  timestamp: string;
}

const STORAGE_KEY = 'seba_confidence_calibration';
const ACCURACY_TOLERANCE = 0.25; // 25% tolerance for "accurate"

class ConfidenceCalibrator {
  private static instance: ConfidenceCalibrator;
  private records: PredictionRecord[] = [];
  private loaded = false;

  private constructor() {}

  static getInstance(): ConfidenceCalibrator {
    if (!ConfidenceCalibrator.instance) {
      ConfidenceCalibrator.instance = new ConfidenceCalibrator();
    }
    return ConfidenceCalibrator.instance;
  }

  // ─── RECORD ─────────────────────────────────────────────────

  /**
   * Record a new prediction from a SEBA proposal
   */
  recordPrediction(
    proposalId: string,
    metric: string,
    predictedValue: number,
    confidence: number
  ): PredictionRecord {
    this.ensureLoaded();

    const record: PredictionRecord = {
      id: `pred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      proposalId,
      predictedMetric: metric,
      predictedValue,
      predictedConfidence: Math.min(1, Math.max(0, confidence)),
      actualValue: null,
      measuredAt: null,
      createdAt: new Date().toISOString(),
      accurate: null,
      errorPct: null,
    };

    this.records.push(record);
    this.persist();
    return record;
  }

  /**
   * Record the actual measured outcome for a prediction
   */
  recordActual(predictionId: string, actualValue: number): PredictionRecord | null {
    this.ensureLoaded();
    const record = this.records.find(r => r.id === predictionId);
    if (!record) return null;

    record.actualValue = actualValue;
    record.measuredAt = new Date().toISOString();
    
    // Calculate accuracy
    if (record.predictedValue !== 0) {
      record.errorPct = Math.abs((actualValue - record.predictedValue) / record.predictedValue) * 100;
      record.accurate = record.errorPct <= (ACCURACY_TOLERANCE * 100);
    } else {
      record.errorPct = actualValue === 0 ? 0 : 100;
      record.accurate = actualValue === 0;
    }

    this.persist();
    return record;
  }

  /**
   * Bulk record actuals for a proposal (all metrics at once)
   */
  recordActualsForProposal(proposalId: string, actuals: Record<string, number>): PredictionRecord[] {
    this.ensureLoaded();
    const updated: PredictionRecord[] = [];

    for (const record of this.records) {
      if (record.proposalId === proposalId && record.predictedMetric in actuals) {
        const result = this.recordActual(record.id, actuals[record.predictedMetric]);
        if (result) updated.push(result);
      }
    }

    return updated;
  }

  // ─── CALIBRATION ────────────────────────────────────────────

  /**
   * Generate a full calibration report
   */
  getCalibrationReport(): CalibrationReport {
    this.ensureLoaded();
    const measured = this.records.filter(r => r.actualValue !== null);
    const totalPredictions = this.records.length;

    if (measured.length === 0) {
      return {
        totalPredictions,
        measuredPredictions: 0,
        brierScore: 0.5, // Uninformative prior
        meanAbsoluteError: 0,
        calibrationCurve: [],
        overconfidenceScore: 0,
        topAccurateMetrics: [],
        worstMetrics: [],
        adjustmentFactor: 1.0,
        timestamp: new Date().toISOString(),
      };
    }

    // Brier Score
    const brierScore = measured.reduce((sum, r) => {
      const outcome = r.accurate ? 1 : 0;
      return sum + Math.pow(r.predictedConfidence - outcome, 2);
    }, 0) / measured.length;

    // Mean Absolute Error
    const meanAbsoluteError = measured.reduce((sum, r) => sum + (r.errorPct || 0), 0) / measured.length;

    // Calibration curve (10 buckets)
    const buckets: CalibrationBucket[] = [];
    for (let i = 0; i < 10; i++) {
      const lo = i / 10;
      const hi = (i + 1) / 10;
      const inBucket = measured.filter(r => r.predictedConfidence >= lo && r.predictedConfidence < hi);
      if (inBucket.length > 0) {
        const accurateCount = inBucket.filter(r => r.accurate).length;
        const observedAccuracy = accurateCount / inBucket.length;
        const midpoint = (lo + hi) / 2;
        buckets.push({
          predictedRange: [lo, hi],
          totalPredictions: inBucket.length,
          accuratePredictions: accurateCount,
          observedAccuracy,
          calibrationError: Math.abs(midpoint - observedAccuracy),
        });
      }
    }

    // Overconfidence score
    const avgPredicted = measured.reduce((s, r) => s + r.predictedConfidence, 0) / measured.length;
    const avgActual = measured.filter(r => r.accurate).length / measured.length;
    const overconfidenceScore = avgPredicted - avgActual;

    // Metric-level accuracy
    const metricAccuracy = new Map<string, { total: number; accurate: number }>();
    for (const r of measured) {
      const entry = metricAccuracy.get(r.predictedMetric) || { total: 0, accurate: 0 };
      entry.total++;
      if (r.accurate) entry.accurate++;
      metricAccuracy.set(r.predictedMetric, entry);
    }

    const sortedMetrics = Array.from(metricAccuracy.entries())
      .map(([metric, stats]) => ({ metric, accuracy: stats.accurate / stats.total }))
      .sort((a, b) => b.accuracy - a.accuracy);

    // Adjustment factor: how much to scale future predictions
    const adjustmentFactor = avgActual > 0 ? Math.min(1.5, Math.max(0.5, avgActual / avgPredicted)) : 1.0;

    return {
      totalPredictions,
      measuredPredictions: measured.length,
      brierScore: Math.round(brierScore * 1000) / 1000,
      meanAbsoluteError: Math.round(meanAbsoluteError * 10) / 10,
      calibrationCurve: buckets,
      overconfidenceScore: Math.round(overconfidenceScore * 100) / 100,
      topAccurateMetrics: sortedMetrics.slice(0, 3).map(m => m.metric),
      worstMetrics: sortedMetrics.slice(-3).map(m => m.metric),
      adjustmentFactor: Math.round(adjustmentFactor * 100) / 100,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get a calibrated confidence for a new prediction
   * Uses historical calibration to adjust raw confidence
   */
  calibrate(rawConfidence: number, metric?: string): number {
    this.ensureLoaded();
    const report = this.getCalibrationReport();

    if (report.measuredPredictions < 5) {
      // Not enough data, apply conservative discount
      return rawConfidence * 0.8;
    }

    // Apply adjustment factor
    let calibrated = rawConfidence * report.adjustmentFactor;

    // If overconfident, discount more
    if (report.overconfidenceScore > 0.1) {
      calibrated *= (1 - report.overconfidenceScore * 0.5);
    }

    return Math.min(1, Math.max(0, calibrated));
  }

  // ─── QUERIES ────────────────────────────────────────────────

  getRecords(): PredictionRecord[] {
    this.ensureLoaded();
    return [...this.records];
  }

  getUnchecked(): PredictionRecord[] {
    this.ensureLoaded();
    return this.records.filter(r => r.actualValue === null);
  }

  clear(): void {
    this.records = [];
    this.persist();
  }

  // ─── PERSISTENCE ────────────────────────────────────────────

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const data = secureGet<typeof this.records>(STORAGE_KEY);
      if (data) this.records = data;
    } catch { this.records = []; }
  }

  private persist(): void {
    try {
      const trimmed = this.records.slice(-500);
      secureSet(STORAGE_KEY, trimmed);
    } catch { /* Storage pressure — non-critical calibration data */ }
  }
}

export const confidenceCalibrator = ConfidenceCalibrator.getInstance();
