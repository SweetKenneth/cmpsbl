/**
 * PHANTOM Ultimate — Re-identification Risk Scorer
 * Quantifies the probability that anonymized data can be re-identified.
 * Quasi-identifier analysis, uniqueness scoring, linkage attack simulation.
 */

export interface QuasiIdentifier {
  fieldName: string;
  uniqueness: number;         // 0–1, higher = more identifying
  combinationRisk: number;    // risk when combined with others
}

export interface RiskAssessment {
  id: string;
  datasetId: string;
  quasiIdentifiers: QuasiIdentifier[];
  uniquenessScore: number;    // proportion of unique records
  linkageRisk: number;        // probability of successful linkage attack
  overallRisk: number;        // composite 0–1
  riskLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'critical';
  recommendation: string;
  assessedAt: number;
}

export interface RiskStats {
  totalAssessments: number;
  avgRisk: number;
  highRiskCount: number;
  blockedExports: number;
}

const MAX_ASSESSMENTS = 500;
const EXPORT_BLOCK_THRESHOLD = 0.7;

const assessments: RiskAssessment[] = [];
let blockedExports = 0;

function assessUniqueness(records: Array<Record<string, unknown>>, qiFields: string[]): number {
  if (records.length === 0) return 0;
  const signatures = new Set<string>();
  for (const record of records) {
    const sig = qiFields.map(f => String(record[f] ?? '')).join('|');
    signatures.add(sig);
  }
  return signatures.size / records.length;
}

function assessLinkageRisk(quasiIdentifiers: QuasiIdentifier[]): number {
  if (quasiIdentifiers.length === 0) return 0;
  // Combined risk increases with more quasi-identifiers
  let combinedRisk = 0;
  for (const qi of quasiIdentifiers) {
    combinedRisk = 1 - (1 - combinedRisk) * (1 - qi.uniqueness * 0.5);
  }
  return Math.min(1, combinedRisk);
}

export function assessReidentificationRisk(
  datasetId: string,
  records: Array<Record<string, unknown>>,
  quasiIdentifierFields: string[]
): RiskAssessment {
  // Profile each quasi-identifier
  const qis: QuasiIdentifier[] = quasiIdentifierFields.map(field => {
    const values = records.map(r => r[field]).filter(v => v !== undefined && v !== null);
    const unique = new Set(values.map(String));
    const uniqueness = values.length > 0 ? unique.size / values.length : 0;
    return { fieldName: field, uniqueness, combinationRisk: 0 };
  });

  // Compute combination risk
  const uniquenessScore = assessUniqueness(records, quasiIdentifierFields);
  const linkageRisk = assessLinkageRisk(qis);

  // Update combination risk per QI
  for (const qi of qis) {
    qi.combinationRisk = Math.min(1, qi.uniqueness * (1 + qis.length * 0.1));
  }

  const overallRisk = uniquenessScore * 0.4 + linkageRisk * 0.4 + Math.min(1, qis.length / 10) * 0.2;

  const riskLevel: RiskAssessment['riskLevel'] =
    overallRisk >= 0.8 ? 'critical'
    : overallRisk >= 0.6 ? 'high'
    : overallRisk >= 0.4 ? 'moderate'
    : overallRisk >= 0.2 ? 'low'
    : 'minimal';

  const recommendation = overallRisk >= EXPORT_BLOCK_THRESHOLD
    ? 'BLOCKED: Risk exceeds export threshold. Apply additional anonymization.'
    : overallRisk >= 0.4
    ? 'WARNING: Consider additional generalization or suppression.'
    : 'SAFE: Risk within acceptable bounds.';

  const assessment: RiskAssessment = {
    id: `risk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    datasetId, quasiIdentifiers: qis,
    uniquenessScore, linkageRisk, overallRisk,
    riskLevel, recommendation, assessedAt: Date.now(),
  };

  if (assessments.length >= MAX_ASSESSMENTS) assessments.shift();
  assessments.push(assessment);

  if (overallRisk >= EXPORT_BLOCK_THRESHOLD) blockedExports++;

  return assessment;
}

export function isExportSafe(datasetId: string): boolean {
  const latest = [...assessments].reverse().find(a => a.datasetId === datasetId);
  if (!latest) return true; // no assessment = assume safe (should assess first)
  return latest.overallRisk < EXPORT_BLOCK_THRESHOLD;
}

export function getRiskStats(): RiskStats {
  return {
    totalAssessments: assessments.length,
    avgRisk: assessments.length > 0 ? assessments.reduce((s, a) => s + a.overallRisk, 0) / assessments.length : 0,
    highRiskCount: assessments.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length,
    blockedExports,
  };
}

export function resetRiskState(): void { assessments.length = 0; blockedExports = 0; }
