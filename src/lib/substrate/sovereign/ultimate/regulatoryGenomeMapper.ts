/**
 * SOVEREIGN Ultimate — Regulatory Genome Mapper (Enhanced)
 * Framework versioning, cross-framework dedup, gap analysis, coverage scoring.
 * v9.0.0 "Crown Prime"
 */

// ─── Types ────────────────────────────────────────────────────────

export interface FrameworkGenome {
  id: string;
  code: string;                    // e.g., 'GDPR'
  version: string;
  requirements: FrameworkRequirement[];
  registeredAt: string;
  updatedAt: string;
}

export interface FrameworkRequirement {
  id: string;
  reference: string;              // e.g., 'GDPR Article 6'
  category: string;               // e.g., 'lawful_basis', 'data_subject_rights'
  description: string;
  satisfied: boolean;
  satisfiedBy: string | null;     // policy ID or control reference
  crossRefs: string[];            // equivalent requirements in other frameworks
}

export interface GapAnalysisResult {
  frameworkCode: string;
  totalRequirements: number;
  satisfiedCount: number;
  unsatisfiedCount: number;
  coverageScore: number;           // (satisfied / total) × 100
  gaps: { requirementId: string; reference: string; description: string }[];
  analyzedAt: string;
}

export interface CrossFrameworkOverlap {
  requirementA: string;
  frameworkA: string;
  requirementB: string;
  frameworkB: string;
  overlapType: 'equivalent' | 'subset' | 'related';
}

// ─── Storage ──────────────────────────────────────────────────────

const genomes = new Map<string, FrameworkGenome>();
const overlaps: CrossFrameworkOverlap[] = [];
const gapHistory: GapAnalysisResult[] = [];
const MAX_GAPS = 500;

// ─── Default Genomes ──────────────────────────────────────────────

function initDefaultGenomes(): void {
  if (genomes.size > 0) return;

  const gdprReqs: FrameworkRequirement[] = [
    { id: 'gdpr_art5', reference: 'GDPR Article 5', category: 'principles', description: 'Lawfulness, fairness, transparency', satisfied: false, satisfiedBy: null, crossRefs: ['ccpa_1798.100'] },
    { id: 'gdpr_art6', reference: 'GDPR Article 6', category: 'lawful_basis', description: 'Lawful basis for processing', satisfied: false, satisfiedBy: null, crossRefs: ['lgpd_art7'] },
    { id: 'gdpr_art7', reference: 'GDPR Article 7', category: 'consent', description: 'Conditions for consent', satisfied: false, satisfiedBy: null, crossRefs: ['lgpd_art8'] },
    { id: 'gdpr_art15', reference: 'GDPR Article 15', category: 'data_subject_rights', description: 'Right of access', satisfied: false, satisfiedBy: null, crossRefs: ['ccpa_1798.110'] },
    { id: 'gdpr_art17', reference: 'GDPR Article 17', category: 'data_subject_rights', description: 'Right to erasure', satisfied: false, satisfiedBy: null, crossRefs: ['ccpa_1798.105'] },
    { id: 'gdpr_art25', reference: 'GDPR Article 25', category: 'design', description: 'Data protection by design', satisfied: false, satisfiedBy: null, crossRefs: [] },
    { id: 'gdpr_art32', reference: 'GDPR Article 32', category: 'security', description: 'Security of processing', satisfied: false, satisfiedBy: null, crossRefs: ['hipaa_164.312'] },
    { id: 'gdpr_art33', reference: 'GDPR Article 33', category: 'breach', description: 'Notification within 72 hours', satisfied: false, satisfiedBy: null, crossRefs: [] },
    { id: 'gdpr_art35', reference: 'GDPR Article 35', category: 'impact', description: 'Data protection impact assessment', satisfied: false, satisfiedBy: null, crossRefs: [] },
    { id: 'gdpr_art44', reference: 'GDPR Article 44', category: 'transfer', description: 'Transfer restrictions', satisfied: false, satisfiedBy: null, crossRefs: [] },
  ];

  const hipaaReqs: FrameworkRequirement[] = [
    { id: 'hipaa_164.502', reference: 'HIPAA §164.502', category: 'use_disclosure', description: 'Uses and disclosures of PHI', satisfied: false, satisfiedBy: null, crossRefs: [] },
    { id: 'hipaa_164.508', reference: 'HIPAA §164.508', category: 'authorization', description: 'Uses requiring authorization', satisfied: false, satisfiedBy: null, crossRefs: ['gdpr_art7'] },
    { id: 'hipaa_164.312', reference: 'HIPAA §164.312', category: 'technical_safeguards', description: 'Technical safeguards', satisfied: false, satisfiedBy: null, crossRefs: ['gdpr_art32'] },
    { id: 'hipaa_164.530', reference: 'HIPAA §164.530', category: 'admin', description: 'Administrative requirements', satisfied: false, satisfiedBy: null, crossRefs: [] },
    { id: 'hipaa_164.404', reference: 'HIPAA §164.404', category: 'breach', description: 'Breach notification to individuals', satisfied: false, satisfiedBy: null, crossRefs: ['gdpr_art33'] },
  ];

  const now = new Date().toISOString();
  genomes.set('GDPR', { id: 'genome_gdpr', code: 'GDPR', version: '2016/679', requirements: gdprReqs, registeredAt: now, updatedAt: now });
  genomes.set('HIPAA', { id: 'genome_hipaa', code: 'HIPAA', version: '1996.08', requirements: hipaaReqs, registeredAt: now, updatedAt: now });

  // Register cross-framework overlaps
  overlaps.push(
    { requirementA: 'gdpr_art32', frameworkA: 'GDPR', requirementB: 'hipaa_164.312', frameworkB: 'HIPAA', overlapType: 'related' },
    { requirementA: 'gdpr_art7', frameworkA: 'GDPR', requirementB: 'hipaa_164.508', frameworkB: 'HIPAA', overlapType: 'related' },
    { requirementA: 'gdpr_art33', frameworkA: 'GDPR', requirementB: 'hipaa_164.404', frameworkB: 'HIPAA', overlapType: 'related' },
  );
}

// ─── Core Operations ─────────────────────────────────────────────

export function satisfyRequirement(frameworkCode: string, requirementId: string, satisfiedBy: string): boolean {
  initDefaultGenomes();
  const genome = genomes.get(frameworkCode);
  if (!genome) return false;
  const req = genome.requirements.find(r => r.id === requirementId);
  if (!req) return false;
  req.satisfied = true;
  req.satisfiedBy = satisfiedBy;
  genome.updatedAt = new Date().toISOString();
  return true;
}

export function runGapAnalysis(frameworkCode: string): GapAnalysisResult | null {
  initDefaultGenomes();
  const genome = genomes.get(frameworkCode);
  if (!genome) return null;

  const gaps = genome.requirements
    .filter(r => !r.satisfied)
    .map(r => ({ requirementId: r.id, reference: r.reference, description: r.description }));

  const result: GapAnalysisResult = {
    frameworkCode,
    totalRequirements: genome.requirements.length,
    satisfiedCount: genome.requirements.filter(r => r.satisfied).length,
    unsatisfiedCount: gaps.length,
    coverageScore: genome.requirements.length > 0
      ? Math.round((genome.requirements.filter(r => r.satisfied).length / genome.requirements.length) * 100)
      : 0,
    gaps,
    analyzedAt: new Date().toISOString(),
  };

  gapHistory.push(result);
  if (gapHistory.length > MAX_GAPS) gapHistory.splice(0, gapHistory.length - MAX_GAPS);
  return result;
}

// ─── Queries ──────────────────────────────────────────────────────

export function getFrameworkGenomes(): FrameworkGenome[] { initDefaultGenomes(); return Array.from(genomes.values()); }
export function getFrameworkGenome(code: string): FrameworkGenome | undefined { initDefaultGenomes(); return genomes.get(code); }
export function getCrossFrameworkOverlaps(): CrossFrameworkOverlap[] { initDefaultGenomes(); return [...overlaps]; }
export function getGenomeHealth(): number {
  initDefaultGenomes();
  const allReqs = Array.from(genomes.values()).flatMap(g => g.requirements);
  if (allReqs.length === 0) return 100;
  const satisfied = allReqs.filter(r => r.satisfied).length;
  return Math.round((satisfied / allReqs.length) * 100);
}
