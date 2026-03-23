/**
 * SOVEREIGN Ultimate — Cross-Border Transfer Arbiter
 * Transfer Impact Assessments, SCC/BCR validation, channel classification.
 * v9.0.0 "Crown Prime"
 */

// ─── Types ────────────────────────────────────────────────────────

export type TransferChannel = 'adequacy_decision' | 'scc' | 'bcr' | 'derogation' | 'consent' | 'blocked';

export interface TransferRequest {
  id: string;
  sourceJurisdiction: string;
  targetJurisdiction: string;
  dataClassification: string;
  purpose: string;
  volumeEstimate: number;        // record count
  channel: TransferChannel;
  approved: boolean;
  blockedReason: string | null;
  impactScore: number;           // 0–100 risk
  createdAt: string;
}

export interface TransferImpactAssessment {
  requestId: string;
  riskFactors: { factor: string; weight: number; score: number }[];
  overallRisk: number;
  mitigations: string[];
  recommendation: 'approve' | 'conditional' | 'deny';
  assessedAt: string;
}

export interface SCCTemplate {
  id: string;
  name: string;
  version: string;
  applicableFrameworks: string[];
  clauses: string[];
  gapCount: number;
  registeredAt: string;
}

// ─── Storage ──────────────────────────────────────────────────────

const transferLog: TransferRequest[] = [];
const tiaLog: TransferImpactAssessment[] = [];
const sccTemplates: SCCTemplate[] = [];
const MAX_TRANSFERS = 2000;
const MAX_TIA = 1000;
const BLOCK_THRESHOLD = 75;

// ─── Default SCC Templates ───────────────────────────────────────

function initDefaultSCCs(): void {
  if (sccTemplates.length > 0) return;
  sccTemplates.push(
    { id: 'scc_eu_2021', name: 'EU SCC Module 1 (C2C)', version: '2021.06', applicableFrameworks: ['GDPR'], clauses: ['purpose_limitation', 'data_minimization', 'security_measures', 'sub_processor_obligations', 'data_subject_rights'], gapCount: 0, registeredAt: new Date().toISOString() },
    { id: 'scc_eu_m2', name: 'EU SCC Module 2 (C2P)', version: '2021.06', applicableFrameworks: ['GDPR'], clauses: ['documented_instructions', 'confidentiality', 'security', 'audit_rights', 'deletion_return'], gapCount: 0, registeredAt: new Date().toISOString() },
    { id: 'scc_uk_idta', name: 'UK IDTA', version: '2022.03', applicableFrameworks: ['UK_GDPR'], clauses: ['approved_addendum', 'mandatory_clauses', 'alternative_safeguards'], gapCount: 0, registeredAt: new Date().toISOString() },
  );
}

// ─── Transfer Assessment ──────────────────────────────────────────

export function assessTransfer(
  sourceJurisdiction: string,
  targetJurisdiction: string,
  dataClassification: string,
  purpose: string,
  volumeEstimate: number,
  adequacyScore: number
): { request: TransferRequest; tia: TransferImpactAssessment } {
  initDefaultSCCs();

  const classificationRisk: Record<string, number> = {
    public: 10, internal: 30, confidential: 60, restricted: 80, top_secret: 95,
  };

  const riskFactors = [
    { factor: 'data_sensitivity', weight: 0.35, score: classificationRisk[dataClassification] || 50 },
    { factor: 'volume', weight: 0.15, score: Math.min(100, volumeEstimate / 100) },
    { factor: 'adequacy_gap', weight: 0.30, score: Math.max(0, 100 - adequacyScore) },
    { factor: 'cross_border', weight: 0.20, score: sourceJurisdiction === targetJurisdiction ? 0 : 60 },
  ];

  const overallRisk = Math.round(
    riskFactors.reduce((sum, f) => sum + f.weight * f.score, 0)
  );

  const recommendation: TransferImpactAssessment['recommendation'] =
    overallRisk >= BLOCK_THRESHOLD ? 'deny' :
    overallRisk >= 40 ? 'conditional' : 'approve';

  const mitigations: string[] = [];
  if (overallRisk >= 40) mitigations.push('Apply Standard Contractual Clauses');
  if (overallRisk >= 60) mitigations.push('Implement supplementary security measures');
  if (overallRisk >= BLOCK_THRESHOLD) mitigations.push('Obtain explicit data subject consent or block transfer');

  const channel: TransferChannel =
    recommendation === 'deny' ? 'blocked' :
    adequacyScore >= 60 ? 'adequacy_decision' : 'scc';

  const request: TransferRequest = {
    id: `txr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sourceJurisdiction,
    targetJurisdiction,
    dataClassification,
    purpose,
    volumeEstimate,
    channel,
    approved: recommendation !== 'deny',
    blockedReason: recommendation === 'deny' ? `Risk score ${overallRisk} exceeds threshold ${BLOCK_THRESHOLD}` : null,
    impactScore: overallRisk,
    createdAt: new Date().toISOString(),
  };

  const tia: TransferImpactAssessment = {
    requestId: request.id,
    riskFactors,
    overallRisk,
    mitigations,
    recommendation,
    assessedAt: new Date().toISOString(),
  };

  transferLog.push(request);
  tiaLog.push(tia);
  if (transferLog.length > MAX_TRANSFERS) transferLog.splice(0, transferLog.length - MAX_TRANSFERS);
  if (tiaLog.length > MAX_TIA) tiaLog.splice(0, tiaLog.length - MAX_TIA);

  return { request, tia };
}

// ─── Queries ──────────────────────────────────────────────────────

export function getTransferLog(): TransferRequest[] { return [...transferLog]; }
export function getBlockedTransfers(): TransferRequest[] { return transferLog.filter(t => !t.approved); }
export function getSCCTemplates(): SCCTemplate[] { initDefaultSCCs(); return [...sccTemplates]; }
export function getTransferHealth(): number {
  if (transferLog.length === 0) return 100;
  const approved = transferLog.filter(t => t.approved).length;
  return Math.round((approved / transferLog.length) * 100);
}
