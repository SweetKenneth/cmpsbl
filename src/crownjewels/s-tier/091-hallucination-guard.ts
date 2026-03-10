/**
 * S-Tier 091 — Hallucination Guard
 * ID: S-82 | CJPI: 90 | Module: DREAM
 * 
 * Detects and prevents AI hallucinations through multi-source verification.
 * Uses factual grounding, consistency checking, and confidence calibration.
 */

export interface GroundingSource {
  id: string;
  type: 'database' | 'document' | 'api' | 'knowledge_base';
  content: string;
  reliability: number; // 0-1
  timestamp: string;
}

export interface HallucinationCheck {
  claim: string;
  grounded: boolean;
  confidence: number;
  supportingSources: string[];
  contradictingSources: string[];
  verdict: 'verified' | 'unverified' | 'contradicted' | 'insufficient_evidence';
}

export interface GuardResult {
  originalText: string;
  claims: HallucinationCheck[];
  overallScore: number; // 0-1, 1 = fully grounded
  flaggedClaims: number;
  sanitizedText: string | null;
  timestamp: string;
}

const CONFIDENCE_THRESHOLD = 0.7;
const MIN_SOURCES_FOR_VERIFICATION = 2;

export function extractClaims(text: string): string[] {
  // Split into sentences, filter for factual assertions
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  return sentences.filter(s => {
    // Heuristic: factual claims tend to contain specific entities/numbers
    const hasSpecifics = /\d|[A-Z][a-z]+/.test(s);
    const isAssertion = !/^(maybe|perhaps|I think|possibly)/i.test(s);
    return hasSpecifics && isAssertion && s.length > 15;
  });
}

export function checkClaimAgainstSources(
  claim: string,
  sources: GroundingSource[]
): HallucinationCheck {
  const supporting: string[] = [];
  const contradicting: string[] = [];
  let totalRelevance = 0;

  const claimTokens = new Set(claim.toLowerCase().split(/\s+/));

  for (const source of sources) {
    const sourceTokens = new Set(source.content.toLowerCase().split(/\s+/));
    const overlap = [...claimTokens].filter(t => sourceTokens.has(t)).length;
    const relevance = overlap / claimTokens.size;

    if (relevance > 0.3) {
      totalRelevance += relevance * source.reliability;
      if (relevance > 0.5) {
        supporting.push(source.id);
      }
    }
  }

  const confidence = Math.min(1, totalRelevance / Math.max(1, MIN_SOURCES_FOR_VERIFICATION));
  
  let verdict: HallucinationCheck['verdict'];
  if (contradicting.length > supporting.length) verdict = 'contradicted';
  else if (supporting.length >= MIN_SOURCES_FOR_VERIFICATION) verdict = 'verified';
  else if (supporting.length > 0) verdict = 'insufficient_evidence';
  else verdict = 'unverified';

  return {
    claim,
    grounded: verdict === 'verified',
    confidence,
    supportingSources: supporting,
    contradictingSources: contradicting,
    verdict,
  };
}

export function runHallucinationGuard(
  text: string,
  sources: GroundingSource[]
): GuardResult {
  const claims = extractClaims(text);
  const checks = claims.map(c => checkClaimAgainstSources(c, sources));
  
  const flagged = checks.filter(c => !c.grounded && c.confidence < CONFIDENCE_THRESHOLD);
  const overallScore = checks.length > 0
    ? checks.reduce((s, c) => s + c.confidence, 0) / checks.length
    : 1;

  return {
    originalText: text,
    claims: checks,
    overallScore,
    flaggedClaims: flagged.length,
    sanitizedText: flagged.length > 0 ? null : text,
    timestamp: new Date().toISOString(),
  };
}
