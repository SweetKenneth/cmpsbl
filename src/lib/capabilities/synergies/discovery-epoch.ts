/**
 * Discovery Epoch — Wave 7 Crystallized Pipeline Mining
 * 
 * Reopens the crystallized pipeline discovery program with:
 * - Full sweep across all 9 synergy categories
 * - Target: 100 new crystallized pipelines (bringing total to 200)
 * - Auto-tiering by CJPI score thresholds
 * - Candidate staging before promotion to crystallized status
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type DiscoveryStatus = 'candidate' | 'validated' | 'crystallized' | 'rejected';
export type DiscoveryCategory = 
  | 'cognitive' | 'evolution' | 'security' | 'routing' | 'learning'
  | 'orchestration' | 'integration' | 'observability' | 'governance';

export interface CJPIScoreBreakdown {
  strategicLeverage: number;    // 30% weight
  recursionPotential: number;   // 20% weight
  crossNodeImpact: number;      // 15% weight
  composability: number;        // 15% weight
  governanceInfluence: number;  // 10% weight
  moatSensitivity: number;      // 10% weight
}

export interface CandidatePipeline {
  id: string;
  name: string;
  description: string;
  category: DiscoveryCategory;
  status: DiscoveryStatus;
  /** Module chain: e.g. ['BRAIN', 'NEXUS', 'DECODE', 'DEFENSE'] */
  moduleChain: string[];
  /** Entry capability ID */
  entryCapability: string;
  /** Exit capability ID */
  exitCapability: string;
  /** Error strategy */
  errorStrategy: 'retry' | 'skip' | 'abort' | 'rollback' | 'fallback';
  /** Max execution time in ms */
  maxExecutionMs: number;
  /** CJPI score breakdown */
  cjpiBreakdown: CJPIScoreBreakdown;
  /** Computed CJPI score (0-100) */
  cjpiScore: number;
  /** Auto-assigned tier based on CJPI */
  assignedTier: CrystallizedTier | null;
  /** Discovery metadata */
  discoveredAt: string;
  discoveredBy: 'intent-mesh' | 'manual' | 'evolution-engine' | 'dream-cycle';
  /** Validation evidence */
  validationEvidence?: string[];
  /** SHA-256 signature of the pipeline definition */
  signatureHash: string;
  /** Wave number */
  wave: number;
}

export type CrystallizedTier = 'creator' | 'architect' | 'enterprise' | 'cmpsbl-only';

export interface DiscoveryEpoch {
  id: string;
  name: string;
  wave: number;
  status: 'planning' | 'active' | 'closed';
  targetCount: number;
  categories: DiscoveryCategory[];
  startedAt: string | null;
  closedAt: string | null;
  candidates: CandidatePipeline[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CJPI AUTO-TIERING THRESHOLDS
// ═══════════════════════════════════════════════════════════════════════════════

/** CJPI score thresholds for automatic tier assignment */
export const CJPI_TIER_THRESHOLDS: Record<CrystallizedTier, { min: number; max: number }> = {
  'creator':      { min: 55, max: 69 },   // B-tier → Creator access
  'architect':    { min: 70, max: 84 },   // A-tier → Architect access
  'enterprise':   { min: 85, max: 94 },   // S-tier → Enterprise access
  'cmpsbl-only':  { min: 95, max: 100 },  // Apex → Internal only
};

// ═══════════════════════════════════════════════════════════════════════════════
// CJPI COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════

const CJPI_WEIGHTS: Record<keyof CJPIScoreBreakdown, number> = {
  strategicLeverage: 0.30,
  recursionPotential: 0.20,
  crossNodeImpact: 0.15,
  composability: 0.15,
  governanceInfluence: 0.10,
  moatSensitivity: 0.10,
};

/** Compute weighted CJPI score from breakdown */
export function computeCJPI(breakdown: CJPIScoreBreakdown): number {
  let score = 0;
  for (const [key, weight] of Object.entries(CJPI_WEIGHTS)) {
    score += (breakdown[key as keyof CJPIScoreBreakdown] ?? 0) * weight;
  }
  return Math.round(Math.min(100, Math.max(0, score)) * 10) / 10;
}

/** Auto-assign tier based on CJPI score */
export function autoAssignTier(cjpiScore: number): CrystallizedTier | null {
  if (cjpiScore >= CJPI_TIER_THRESHOLDS['cmpsbl-only'].min) return 'cmpsbl-only';
  if (cjpiScore >= CJPI_TIER_THRESHOLDS['enterprise'].min) return 'enterprise';
  if (cjpiScore >= CJPI_TIER_THRESHOLDS['architect'].min) return 'architect';
  if (cjpiScore >= CJPI_TIER_THRESHOLDS['creator'].min) return 'creator';
  return null; // Below B-tier threshold — not eligible for crystallization
}

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE 7 EPOCH DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

export const WAVE_7_EPOCH: DiscoveryEpoch = {
  id: 'epoch-wave-7',
  name: 'Wave 7 — Full Sweep Discovery',
  wave: 7,
  status: 'planning',
  targetCount: 100,
  categories: [
    'cognitive', 'evolution', 'security', 'routing', 'learning',
    'orchestration', 'integration', 'observability', 'governance',
  ],
  startedAt: null,
  closedAt: null,
  candidates: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// DISCOVERY OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Generate a deterministic signature for a pipeline definition */
function hashPipeline(candidate: Omit<CandidatePipeline, 'signatureHash' | 'cjpiScore' | 'assignedTier'>): string {
  const payload = JSON.stringify({
    id: candidate.id,
    moduleChain: candidate.moduleChain,
    entryCapability: candidate.entryCapability,
    exitCapability: candidate.exitCapability,
    category: candidate.category,
  });
  // Simple deterministic hash (runtime SHA-256 would be used in production)
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `w7-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

/** Register a new candidate pipeline into the epoch */
export function registerCandidate(
  epoch: DiscoveryEpoch,
  candidate: Omit<CandidatePipeline, 'status' | 'cjpiScore' | 'assignedTier' | 'signatureHash' | 'wave'>
): CandidatePipeline {
  if (epoch.status === 'closed') {
    throw new Error(`Epoch ${epoch.id} is closed — no new candidates accepted`);
  }

  // Compute CJPI
  const cjpiScore = computeCJPI(candidate.cjpiBreakdown);
  const assignedTier = autoAssignTier(cjpiScore);
  const signatureHash = hashPipeline({ ...candidate, status: 'candidate', wave: epoch.wave });

  // Check for duplicate signatures
  const isDuplicate = epoch.candidates.some(c => c.id === candidate.id);
  if (isDuplicate) {
    throw new Error(`Candidate ${candidate.id} already registered in epoch ${epoch.id}`);
  }

  const fullCandidate: CandidatePipeline = {
    ...candidate,
    status: 'candidate',
    cjpiScore,
    assignedTier,
    signatureHash,
    wave: epoch.wave,
  };

  epoch.candidates.push(fullCandidate);
  return fullCandidate;
}

/** Validate a candidate — moves from 'candidate' to 'validated' */
export function validateCandidate(epoch: DiscoveryEpoch, candidateId: string, evidence: string[]): CandidatePipeline {
  const candidate = epoch.candidates.find(c => c.id === candidateId);
  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);
  if (candidate.status !== 'candidate') throw new Error(`Candidate ${candidateId} is ${candidate.status}, not candidate`);
  if (candidate.assignedTier === null) throw new Error(`Candidate ${candidateId} CJPI too low for crystallization (${candidate.cjpiScore})`);

  candidate.status = 'validated';
  candidate.validationEvidence = evidence;
  return candidate;
}

/** Crystallize a validated candidate — final promotion */
export function crystallizeCandidate(epoch: DiscoveryEpoch, candidateId: string): CandidatePipeline {
  const candidate = epoch.candidates.find(c => c.id === candidateId);
  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);
  if (candidate.status !== 'validated') throw new Error(`Candidate ${candidateId} must be validated before crystallization`);

  candidate.status = 'crystallized';
  return candidate;
}

/** Reject a candidate */
export function rejectCandidate(epoch: DiscoveryEpoch, candidateId: string, reason: string): CandidatePipeline {
  const candidate = epoch.candidates.find(c => c.id === candidateId);
  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

  candidate.status = 'rejected';
  candidate.validationEvidence = [reason];
  return candidate;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EPOCH STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface EpochStats {
  totalCandidates: number;
  byStatus: Record<DiscoveryStatus, number>;
  byCategory: Record<DiscoveryCategory, number>;
  byTier: Record<CrystallizedTier | 'untiered', number>;
  avgCJPI: number;
  highestCJPI: number;
  lowestCJPI: number;
  progressPercent: number;
}

export function getEpochStats(epoch: DiscoveryEpoch): EpochStats {
  const byStatus: Record<DiscoveryStatus, number> = { candidate: 0, validated: 0, crystallized: 0, rejected: 0 };
  const byCategory = {} as Record<DiscoveryCategory, number>;
  const byTier: Record<CrystallizedTier | 'untiered', number> = { creator: 0, architect: 0, enterprise: 0, 'cmpsbl-only': 0, untiered: 0 };

  let totalCJPI = 0;
  let highestCJPI = 0;
  let lowestCJPI = 100;

  for (const c of epoch.candidates) {
    byStatus[c.status]++;
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byTier[c.assignedTier ?? 'untiered']++;
    totalCJPI += c.cjpiScore;
    if (c.cjpiScore > highestCJPI) highestCJPI = c.cjpiScore;
    if (c.cjpiScore < lowestCJPI) lowestCJPI = c.cjpiScore;
  }

  const crystallized = byStatus.crystallized;
  return {
    totalCandidates: epoch.candidates.length,
    byStatus,
    byCategory,
    byTier,
    avgCJPI: epoch.candidates.length > 0 ? Math.round(totalCJPI / epoch.candidates.length * 10) / 10 : 0,
    highestCJPI,
    lowestCJPI: epoch.candidates.length > 0 ? lowestCJPI : 0,
    progressPercent: Math.round((crystallized / epoch.targetCount) * 100),
  };
}

/** Close the epoch — no more candidates accepted */
export function closeEpoch(epoch: DiscoveryEpoch): void {
  epoch.status = 'closed';
  epoch.closedAt = new Date().toISOString();
}

/** Activate the epoch — begin discovery */
export function activateEpoch(epoch: DiscoveryEpoch): void {
  if (epoch.status !== 'planning') throw new Error(`Epoch ${epoch.id} is ${epoch.status}, cannot activate`);
  epoch.status = 'active';
  epoch.startedAt = new Date().toISOString();
}
