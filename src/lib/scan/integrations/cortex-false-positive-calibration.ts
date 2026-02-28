/**
 * CORTEX — Self-Assessment Calibration (#34)
 * Uses historical scan accuracy data to auto-tune confidence thresholds
 * and reduce false positive rates per category.
 */

export interface CalibrationProfile {
  category: string;
  totalFindings: number;
  confirmedTrue: number;
  confirmedFalse: number;
  unreviewed: number;
  precision: number; // confirmedTrue / (confirmedTrue + confirmedFalse)
  currentThreshold: number;
  recommendedThreshold: number;
  adjustment: 'raise' | 'lower' | 'maintain';
  confidenceInAdjustment: number;
}

export interface CalibrationReport {
  profiles: CalibrationProfile[];
  overallPrecision: number;
  falsePositiveRate: number;
  categoriesNeedingAttention: string[];
  autoAdjusted: number;
  generatedAt: string;
}

interface HistoricalFinding {
  id: string;
  category: string;
  confidence: number;
  verdict?: 'true_positive' | 'false_positive' | 'unreviewed';
}

/**
 * Calibrate confidence thresholds based on historical accuracy
 */
export function calibrateThresholds(
  history: HistoricalFinding[],
  currentThresholds: Record<string, number> = {},
  minSamples = 10,
): CalibrationReport {
  const byCategory = new Map<string, HistoricalFinding[]>();
  for (const f of history) {
    if (!byCategory.has(f.category)) byCategory.set(f.category, []);
    byCategory.get(f.category)!.push(f);
  }

  const profiles: CalibrationProfile[] = [];
  let totalTrue = 0, totalFalse = 0;

  for (const [category, findings] of byCategory) {
    const confirmedTrue = findings.filter(f => f.verdict === 'true_positive').length;
    const confirmedFalse = findings.filter(f => f.verdict === 'false_positive').length;
    const unreviewed = findings.filter(f => !f.verdict || f.verdict === 'unreviewed').length;
    const reviewed = confirmedTrue + confirmedFalse;
    const precision = reviewed > 0 ? confirmedTrue / reviewed : 0.5;

    totalTrue += confirmedTrue;
    totalFalse += confirmedFalse;

    const currentThreshold = currentThresholds[category] ?? 0.5;
    let recommendedThreshold = currentThreshold;
    let adjustment: CalibrationProfile['adjustment'] = 'maintain';

    if (reviewed >= minSamples) {
      if (precision < 0.7) {
        // Too many false positives — raise threshold
        recommendedThreshold = Math.min(0.95, currentThreshold + 0.1 * (1 - precision));
        adjustment = 'raise';
      } else if (precision > 0.95 && currentThreshold > 0.3) {
        // Very accurate — can lower threshold to catch more
        recommendedThreshold = Math.max(0.2, currentThreshold - 0.05);
        adjustment = 'lower';
      }
    }

    profiles.push({
      category,
      totalFindings: findings.length,
      confirmedTrue,
      confirmedFalse,
      unreviewed,
      precision,
      currentThreshold,
      recommendedThreshold: Math.round(recommendedThreshold * 100) / 100,
      adjustment,
      confidenceInAdjustment: reviewed >= minSamples * 2 ? 0.9 : reviewed >= minSamples ? 0.6 : 0.3,
    });
  }

  profiles.sort((a, b) => a.precision - b.precision);
  const totalReviewed = totalTrue + totalFalse;

  return {
    profiles,
    overallPrecision: totalReviewed > 0 ? Math.round(totalTrue / totalReviewed * 100) / 100 : 0,
    falsePositiveRate: totalReviewed > 0 ? Math.round(totalFalse / totalReviewed * 100) / 100 : 0,
    categoriesNeedingAttention: profiles.filter(p => p.precision < 0.7 && p.totalFindings >= minSamples).map(p => p.category),
    autoAdjusted: profiles.filter(p => p.adjustment !== 'maintain' && p.confidenceInAdjustment >= 0.6).length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Apply calibrated thresholds to filter findings
 */
export function applyCalibration(
  findings: Array<{ id: string; category: string; confidence: number }>,
  report: CalibrationReport,
): Array<{ id: string; category: string; confidence: number; passed: boolean }> {
  const thresholdMap = new Map(report.profiles.map(p => [p.category, p.recommendedThreshold]));
  return findings.map(f => ({
    ...f,
    passed: f.confidence >= (thresholdMap.get(f.category) ?? 0.5),
  }));
}
