/**
 * SOVEREIGN Ultimate — Privacy Impact Assessment (PIA) Engine
 * Automated risk assessment for data processing activities.
 * v9.0.0 "Crown Prime"
 */

// ─── Types ────────────────────────────────────────────────────────

export type PIARiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface ProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  dataSensitivity: number;       // 0–100
  volumeEstimate: number;
  purposeScope: number;          // 0–100 (narrow → broad)
  thirdPartyExposure: number;    // 0–100
  jurisdiction: string;
  framework: string;
  registeredAt: string;
}

export interface PrivacyImpactAssessment {
  id: string;
  activityId: string;
  riskScore: number;             // 0–100
  riskLevel: PIARiskLevel;
  dpiaRequired: boolean;         // Data Protection Impact Assessment required
  riskFactors: { factor: string; weight: number; score: number }[];
  mitigations: PIAMitigation[];
  governanceApprovalRequired: boolean;
  assessedAt: string;
}

export interface PIAMitigation {
  id: string;
  description: string;
  effectiveness: number;         // 0–100
  applied: boolean;
  appliedAt: string | null;
}

// ─── Storage ──────────────────────────────────────────────────────

const activities: ProcessingActivity[] = [];
const assessments: PrivacyImpactAssessment[] = [];
const MAX_ACTIVITIES = 1000;
const MAX_ASSESSMENTS = 2000;
const DPIA_THRESHOLD = 60;
const GOVERNANCE_THRESHOLD = 75;

// ─── Core Operations ─────────────────────────────────────────────

export function registerProcessingActivity(
  name: string,
  purpose: string,
  dataSensitivity: number,
  volumeEstimate: number,
  purposeScope: number,
  thirdPartyExposure: number,
  jurisdiction: string,
  framework: string
): ProcessingActivity {
  const activity: ProcessingActivity = {
    id: `pa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name, purpose, dataSensitivity, volumeEstimate,
    purposeScope, thirdPartyExposure, jurisdiction, framework,
    registeredAt: new Date().toISOString(),
  };
  activities.push(activity);
  if (activities.length > MAX_ACTIVITIES) activities.splice(0, activities.length - MAX_ACTIVITIES);
  return activity;
}

/**
 * Assess privacy impact.
 * privacy_risk = (data_sensitivity × 0.3) + (volume × 0.2) + (purpose_scope × 0.2) + (third_party_exposure × 0.3)
 */
export function assessPrivacyImpact(activityId: string): PrivacyImpactAssessment | null {
  const activity = activities.find(a => a.id === activityId);
  if (!activity) return null;

  const volumeNormalized = Math.min(100, activity.volumeEstimate / 100);

  const riskFactors = [
    { factor: 'data_sensitivity', weight: 0.30, score: activity.dataSensitivity },
    { factor: 'volume', weight: 0.20, score: volumeNormalized },
    { factor: 'purpose_scope', weight: 0.20, score: activity.purposeScope },
    { factor: 'third_party_exposure', weight: 0.30, score: activity.thirdPartyExposure },
  ];

  const riskScore = Math.round(
    riskFactors.reduce((sum, f) => sum + f.weight * f.score, 0)
  );

  const riskLevel: PIARiskLevel =
    riskScore >= 80 ? 'critical' :
    riskScore >= 60 ? 'high' :
    riskScore >= 35 ? 'moderate' : 'low';

  const mitigations: PIAMitigation[] = [];
  if (riskScore >= 35) mitigations.push({ id: `mit_${Date.now()}_1`, description: 'Implement data minimization controls', effectiveness: 25, applied: false, appliedAt: null });
  if (riskScore >= 50) mitigations.push({ id: `mit_${Date.now()}_2`, description: 'Apply pseudonymization or anonymization', effectiveness: 35, applied: false, appliedAt: null });
  if (riskScore >= 60) mitigations.push({ id: `mit_${Date.now()}_3`, description: 'Restrict third-party data sharing', effectiveness: 30, applied: false, appliedAt: null });
  if (riskScore >= 75) mitigations.push({ id: `mit_${Date.now()}_4`, description: 'Require explicit consent for processing', effectiveness: 20, applied: false, appliedAt: null });

  const assessment: PrivacyImpactAssessment = {
    id: `pia_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    activityId,
    riskScore,
    riskLevel,
    dpiaRequired: riskScore >= DPIA_THRESHOLD,
    riskFactors,
    mitigations,
    governanceApprovalRequired: riskScore >= GOVERNANCE_THRESHOLD,
    assessedAt: new Date().toISOString(),
  };

  assessments.push(assessment);
  if (assessments.length > MAX_ASSESSMENTS) assessments.splice(0, assessments.length - MAX_ASSESSMENTS);
  return assessment;
}

export function applyMitigation(assessmentId: string, mitigationId: string): boolean {
  const assessment = assessments.find(a => a.id === assessmentId);
  if (!assessment) return false;
  const mitigation = assessment.mitigations.find(m => m.id === mitigationId);
  if (!mitigation || mitigation.applied) return false;
  mitigation.applied = true;
  mitigation.appliedAt = new Date().toISOString();
  return true;
}

// ─── Queries ──────────────────────────────────────────────────────

export function getProcessingActivities(): ProcessingActivity[] { return [...activities]; }
export function getAssessments(): PrivacyImpactAssessment[] { return [...assessments]; }
export function getHighRiskAssessments(): PrivacyImpactAssessment[] { return assessments.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical'); }
export function getPIAHealth(): number {
  if (assessments.length === 0) return 100;
  const highRisk = assessments.filter(a => a.riskScore >= DPIA_THRESHOLD).length;
  const mitigated = assessments.filter(a => a.mitigations.every(m => m.applied)).length;
  const riskPenalty = (highRisk / assessments.length) * 40;
  const mitigationBonus = (mitigated / assessments.length) * 20;
  return Math.max(0, Math.round(100 - riskPenalty + mitigationBonus));
}
