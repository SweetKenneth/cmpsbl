/**
 * HARVEST Ultimate — Quality Furnace
 * Scores every ingested record on completeness, consistency, accuracy, timeliness.
 * Quarantines low-quality batches before they poison downstream nodes.
 */

export interface QualityScore {
  completeness: number;  // 0–1
  consistency: number;   // 0–1
  accuracy: number;      // 0–1
  timeliness: number;    // 0–1
  composite: number;     // 0–1 weighted
}

export interface QualityAssessment {
  batchId: string;
  sourceId: string;
  recordCount: number;
  score: QualityScore;
  quarantined: boolean;
  quarantineReason?: string;
  assessedAt: number;
}

export interface QualityStats {
  totalAssessments: number;
  totalQuarantined: number;
  avgComposite: number;
  quarantineRate: number;
  worstDimension: string;
}

const QUARANTINE_THRESHOLD = 0.4;
const WEIGHTS = { completeness: 0.3, consistency: 0.25, accuracy: 0.25, timeliness: 0.2 };
const MAX_ASSESSMENTS = 500;

const assessments: QualityAssessment[] = [];

function scoreCompleteness(records: Record<string, unknown>[], requiredFields?: string[]): number {
  if (records.length === 0) return 0;
  if (!requiredFields || requiredFields.length === 0) {
    // Infer: all fields seen in first record are "required"
    requiredFields = Object.keys(records[0]);
  }
  if (requiredFields.length === 0) return 1;

  let totalPresent = 0;
  let totalExpected = 0;
  for (const rec of records) {
    for (const f of requiredFields) {
      totalExpected++;
      if (rec[f] !== null && rec[f] !== undefined && rec[f] !== '') totalPresent++;
    }
  }
  return totalExpected > 0 ? totalPresent / totalExpected : 0;
}

function scoreConsistency(records: Record<string, unknown>[]): number {
  if (records.length < 2) return 1;
  // Check type consistency per field
  const fieldTypes = new Map<string, Map<string, number>>();
  for (const rec of records) {
    for (const [k, v] of Object.entries(rec)) {
      if (!fieldTypes.has(k)) fieldTypes.set(k, new Map());
      const t = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
      fieldTypes.get(k)!.set(t, (fieldTypes.get(k)!.get(t) ?? 0) + 1);
    }
  }

  let consistencySum = 0;
  let fieldCount = 0;
  for (const types of fieldTypes.values()) {
    const total = [...types.values()].reduce((a, b) => a + b, 0);
    const max = Math.max(...types.values());
    consistencySum += max / total;
    fieldCount++;
  }
  return fieldCount > 0 ? consistencySum / fieldCount : 1;
}

function scoreAccuracy(records: Record<string, unknown>[]): number {
  // Heuristic: check for obvious data quality issues
  if (records.length === 0) return 0;
  let issues = 0;
  let checks = 0;
  for (const rec of records) {
    for (const [, v] of Object.entries(rec)) {
      checks++;
      if (typeof v === 'string') {
        // Check for placeholder/garbage data
        if (v === 'N/A' || v === 'undefined' || v === 'null' || v === 'TBD' || v.length > 10000) issues++;
      }
      if (typeof v === 'number' && (isNaN(v) || !isFinite(v))) issues++;
    }
  }
  return checks > 0 ? Math.max(0, 1 - issues / checks) : 0;
}

function scoreTimeliness(records: Record<string, unknown>[], timestampField?: string): number {
  if (!timestampField) return 0.8; // default when no timestamp available
  const now = Date.now();
  let totalAge = 0;
  let counted = 0;
  for (const rec of records) {
    const ts = rec[timestampField];
    if (typeof ts === 'number' || typeof ts === 'string') {
      const t = typeof ts === 'string' ? new Date(ts).getTime() : ts;
      if (!isNaN(t)) {
        totalAge += now - t;
        counted++;
      }
    }
  }
  if (counted === 0) return 0.7;
  const avgAgeHours = (totalAge / counted) / 3_600_000;
  // Fresh = < 1hr (1.0), stale = > 168hr/1wk (0.0)
  return Math.max(0, Math.min(1, 1 - avgAgeHours / 168));
}

export function assessBatchQuality(
  sourceId: string,
  records: Record<string, unknown>[],
  options?: { requiredFields?: string[]; timestampField?: string }
): QualityAssessment {
  const completeness = scoreCompleteness(records, options?.requiredFields);
  const consistency = scoreConsistency(records);
  const accuracy = scoreAccuracy(records);
  const timeliness = scoreTimeliness(records, options?.timestampField);

  const composite =
    completeness * WEIGHTS.completeness +
    consistency * WEIGHTS.consistency +
    accuracy * WEIGHTS.accuracy +
    timeliness * WEIGHTS.timeliness;

  const score: QualityScore = { completeness, consistency, accuracy, timeliness, composite };
  const quarantined = composite < QUARANTINE_THRESHOLD;

  const assessment: QualityAssessment = {
    batchId: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceId, recordCount: records.length, score, quarantined,
    quarantineReason: quarantined
      ? `Composite score ${(composite * 100).toFixed(1)}% below threshold ${(QUARANTINE_THRESHOLD * 100)}%`
      : undefined,
    assessedAt: Date.now(),
  };

  if (assessments.length >= MAX_ASSESSMENTS) assessments.shift();
  assessments.push(assessment);

  return assessment;
}

export function getQualityStats(): QualityStats {
  const q = assessments.filter(a => a.quarantined).length;
  const avgComp = assessments.length > 0
    ? assessments.reduce((s, a) => s + a.score.composite, 0) / assessments.length
    : 0;

  // Find worst dimension
  const dims = { completeness: 0, consistency: 0, accuracy: 0, timeliness: 0 };
  for (const a of assessments) {
    dims.completeness += a.score.completeness;
    dims.consistency += a.score.consistency;
    dims.accuracy += a.score.accuracy;
    dims.timeliness += a.score.timeliness;
  }
  const n = assessments.length || 1;
  const avgDims = Object.entries(dims).map(([k, v]) => ({ dim: k, avg: v / n }));
  avgDims.sort((a, b) => a.avg - b.avg);

  return {
    totalAssessments: assessments.length,
    totalQuarantined: q,
    avgComposite: avgComp,
    quarantineRate: assessments.length > 0 ? q / assessments.length : 0,
    worstDimension: avgDims[0]?.dim ?? 'none',
  };
}

export function resetQualityState(): void { assessments.length = 0; }
