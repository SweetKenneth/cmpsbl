/**
 * DECODE Epistemic Audit Trail — v1.0.0
 * Logs every interpretation DECODE makes with confidence scores,
 * enabling post-hoc review of what DECODE claimed vs. what
 * the substrate confirmed.
 * 
 * This is the accountability layer: DECODE's claims are recorded
 * and can be verified against actual system state.
 */

// ═══ Types ════════════════════════════════════════════════════════

export type ClaimVerdict = 'unverified' | 'confirmed' | 'contradicted' | 'partial' | 'expired';

export interface EpistemicClaim {
  id: string;
  sessionId: string;
  turnIndex: number;
  
  // What DECODE claimed
  claim: string;
  epistemicVerb: 'describe' | 'interpret' | 'reflect' | 'pattern' | 'project';
  confidence: number; // 0-1
  
  // Verification
  verdict: ClaimVerdict;
  verifiedAt?: string;
  verificationSource?: string;
  actualValue?: string;
  
  // Metadata
  module?: string; // which node was referenced
  timestamp: string;
}

export interface AuditSummary {
  totalClaims: number;
  confirmed: number;
  contradicted: number;
  unverified: number;
  partial: number;
  expired: number;
  accuracyRate: number; // confirmed / (confirmed + contradicted)
  avgConfidence: number;
  byModule: Record<string, { total: number; accuracy: number }>;
  byVerb: Record<string, { total: number; accuracy: number }>;
}

// ═══ Store ═════════════════════════════════════════════════════════

const claims: EpistemicClaim[] = [];
const MAX_CLAIMS = 500;
let claimCounter = 0;

// ═══ Core API ═════════════════════════════════════════════════════

/**
 * Record an epistemic claim made by DECODE
 */
export function recordClaim(
  sessionId: string,
  claim: string,
  verb: EpistemicClaim['epistemicVerb'],
  confidence: number,
  module?: string,
): EpistemicClaim {
  const entry: EpistemicClaim = {
    id: `ec_${++claimCounter}`,
    sessionId,
    turnIndex: claims.filter(c => c.sessionId === sessionId).length,
    claim,
    epistemicVerb: verb,
    confidence: Math.max(0, Math.min(1, confidence)),
    verdict: 'unverified',
    module,
    timestamp: new Date().toISOString(),
  };

  claims.push(entry);

  // Enforce limit
  if (claims.length > MAX_CLAIMS) {
    claims.shift();
  }

  return entry;
}

/**
 * Verify a claim against actual system state
 */
export function verifyClaim(
  claimId: string,
  verdict: ClaimVerdict,
  source?: string,
  actualValue?: string,
): boolean {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) return false;

  claim.verdict = verdict;
  claim.verifiedAt = new Date().toISOString();
  claim.verificationSource = source;
  claim.actualValue = actualValue;

  return true;
}

/**
 * Batch verify — mark old unverified claims as expired
 */
export function expireOldClaims(maxAgeMs: number = 30 * 60 * 1000): number {
  const cutoff = Date.now() - maxAgeMs;
  let expired = 0;

  for (const claim of claims) {
    if (claim.verdict === 'unverified') {
      const claimTime = new Date(claim.timestamp).getTime();
      if (claimTime < cutoff) {
        claim.verdict = 'expired';
        expired++;
      }
    }
  }

  return expired;
}

/**
 * Get claims for a session
 */
export function getSessionClaims(sessionId: string): EpistemicClaim[] {
  return claims.filter(c => c.sessionId === sessionId);
}

/**
 * Get all claims with optional filtering
 */
export function getClaims(filters?: {
  verdict?: ClaimVerdict;
  module?: string;
  verb?: EpistemicClaim['epistemicVerb'];
  minConfidence?: number;
}): EpistemicClaim[] {
  let filtered = [...claims];

  if (filters?.verdict) {
    filtered = filtered.filter(c => c.verdict === filters.verdict);
  }
  if (filters?.module) {
    filtered = filtered.filter(c => c.module === filters.module);
  }
  if (filters?.verb) {
    filtered = filtered.filter(c => c.epistemicVerb === filters.verb);
  }
  if (filters?.minConfidence !== undefined) {
    filtered = filtered.filter(c => c.confidence >= filters.minConfidence!);
  }

  return filtered;
}

/**
 * Generate audit summary
 */
export function getAuditSummary(sessionId?: string): AuditSummary {
  const pool = sessionId ? claims.filter(c => c.sessionId === sessionId) : claims;

  const confirmed = pool.filter(c => c.verdict === 'confirmed').length;
  const contradicted = pool.filter(c => c.verdict === 'contradicted').length;
  const unverified = pool.filter(c => c.verdict === 'unverified').length;
  const partial = pool.filter(c => c.verdict === 'partial').length;
  const expired = pool.filter(c => c.verdict === 'expired').length;

  const verifiable = confirmed + contradicted;
  const accuracyRate = verifiable > 0 ? confirmed / verifiable : 1;

  const avgConfidence = pool.length > 0
    ? pool.reduce((s, c) => s + c.confidence, 0) / pool.length
    : 0;

  // By module
  const byModule: Record<string, { total: number; accuracy: number }> = {};
  for (const claim of pool) {
    const mod = claim.module || 'unknown';
    if (!byModule[mod]) byModule[mod] = { total: 0, accuracy: 0 };
    byModule[mod].total++;
  }
  for (const mod of Object.keys(byModule)) {
    const modClaims = pool.filter(c => (c.module || 'unknown') === mod);
    const modConfirmed = modClaims.filter(c => c.verdict === 'confirmed').length;
    const modContradicted = modClaims.filter(c => c.verdict === 'contradicted').length;
    const modVerifiable = modConfirmed + modContradicted;
    byModule[mod].accuracy = modVerifiable > 0 ? modConfirmed / modVerifiable : 1;
  }

  // By verb
  const byVerb: Record<string, { total: number; accuracy: number }> = {};
  for (const claim of pool) {
    if (!byVerb[claim.epistemicVerb]) byVerb[claim.epistemicVerb] = { total: 0, accuracy: 0 };
    byVerb[claim.epistemicVerb].total++;
  }
  for (const verb of Object.keys(byVerb)) {
    const verbClaims = pool.filter(c => c.epistemicVerb === verb);
    const vConfirmed = verbClaims.filter(c => c.verdict === 'confirmed').length;
    const vContradicted = verbClaims.filter(c => c.verdict === 'contradicted').length;
    const vVerifiable = vConfirmed + vContradicted;
    byVerb[verb].accuracy = vVerifiable > 0 ? vConfirmed / vVerifiable : 1;
  }

  return {
    totalClaims: pool.length,
    confirmed,
    contradicted,
    unverified,
    partial,
    expired,
    accuracyRate: Math.round(accuracyRate * 1000) / 1000,
    avgConfidence: Math.round(avgConfidence * 1000) / 1000,
    byModule,
    byVerb,
  };
}
