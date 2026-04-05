/**
 * PROMPT-SHIELD — Hallucination Grounding Engine
 * Primitive: VERITAS (hallucination detection & factual grounding)
 *
 * Extracts claims from LLM output and scores each against
 * factual grounding heuristics. No external API calls —
 * uses structural and linguistic markers to estimate grounding.
 */

import type { HallucinationCheck, GroundingReport } from './types';

// ── Claim Extraction ───────────────────────────────────────────────────

interface ExtractedClaim {
  readonly text: string;
  readonly startIndex: number;
  readonly claimType: 'factual' | 'statistical' | 'temporal' | 'causal' | 'attribution';
}

/**
 * Extract verifiable claims from LLM output text.
 * Identifies factual assertions, statistics, dates, and attributions.
 */
function extractClaims(text: string): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 10);

  for (const sentence of sentences) {
    const start = text.indexOf(sentence);

    // Statistical claims — numbers, percentages, measurements
    if (/\d+(\.\d+)?%|\b\d{2,}\b.*\b(increase|decrease|growth|decline|rate)\b/i.test(sentence)) {
      claims.push({ text: sentence, startIndex: start, claimType: 'statistical' });
      continue;
    }

    // Temporal claims — dates, years, specific times
    if (/\b(in\s+)?\d{4}\b|\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(sentence)) {
      claims.push({ text: sentence, startIndex: start, claimType: 'temporal' });
      continue;
    }

    // Attribution claims — "according to", "X said", "study by"
    if (/according\s+to|said\s+that|\bstudy\b.*\bfound\b|research\s+(by|from|shows)/i.test(sentence)) {
      claims.push({ text: sentence, startIndex: start, claimType: 'attribution' });
      continue;
    }

    // Causal claims — "because", "causes", "leads to"
    if (/\b(because|causes?|leads?\s+to|results?\s+in|due\s+to|therefore)\b/i.test(sentence)) {
      claims.push({ text: sentence, startIndex: start, claimType: 'causal' });
      continue;
    }

    // General factual — declarative statements with definitive language
    if (/\b(is|are|was|were|has|have)\b.*\b(the|a|an)\b/i.test(sentence) &&
        /\b(always|never|every|all|none|exactly|precisely)\b/i.test(sentence)) {
      claims.push({ text: sentence, startIndex: start, claimType: 'factual' });
    }
  }

  return claims;
}

// ── Grounding Heuristics ───────────────────────────────────────────────

/**
 * Hedging language reduces hallucination confidence —
 * models that hedge are less likely hallucinating.
 */
function hedgingScore(text: string): number {
  const hedges = [
    /\b(might|may|could|possibly|perhaps|likely|unlikely|approximately|roughly|around|about|generally|typically|often|sometimes)\b/gi,
    /\b(it\s+seems|it\s+appears|it's\s+possible|there's\s+evidence|some\s+suggest)\b/gi,
  ];

  let hedgeCount = 0;
  for (const pattern of hedges) {
    const matches = text.match(pattern);
    if (matches) hedgeCount += matches.length;
  }

  const words = text.split(/\s+/).length;
  const hedgeDensity = hedgeCount / Math.max(1, words);

  // Higher hedging → higher grounding (less likely fabricating)
  return Math.min(1, hedgeDensity * 15);
}

/**
 * Specificity without sourcing is a hallucination signal.
 * Very specific claims (exact numbers, names) without citations are suspect.
 */
function specificityRisk(claim: ExtractedClaim): number {
  let risk = 0;

  // Exact numbers without hedging
  if (/\b\d{3,}\b/.test(claim.text) && !/approximately|around|about|roughly/i.test(claim.text)) {
    risk += 0.3;
  }

  // Named entities without attribution
  if (/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(claim.text) && !/according|said|stated|reported/i.test(claim.text)) {
    risk += 0.2;
  }

  // Superlatives without qualification
  if (/\b(best|worst|largest|smallest|first|only|most|least)\b/i.test(claim.text) && !/one\s+of|among/i.test(claim.text)) {
    risk += 0.25;
  }

  return Math.min(1, risk);
}

/**
 * Consistency check — repeated contradictory claims in same output.
 */
function consistencyScore(claims: ExtractedClaim[]): Map<number, number> {
  const scores = new Map<number, number>();

  for (let i = 0; i < claims.length; i++) {
    let consistency = 1.0;
    const tokensI = new Set(claims[i].text.toLowerCase().split(/\s+/).filter(t => t.length > 3));

    for (let j = 0; j < claims.length; j++) {
      if (i === j) continue;
      const tokensJ = claims[j].text.toLowerCase().split(/\s+/).filter(t => t.length > 3);

      // Check for semantic overlap with contradicting signals
      const overlap = tokensJ.filter(t => tokensI.has(t)).length;
      if (overlap > 2) {
        // Related claims — check for contradicting markers
        const hasNegation = /\bnot\b|\bno\b|\bnever\b|\bwithout\b/i.test(claims[j].text);
        const otherHasNegation = /\bnot\b|\bno\b|\bnever\b|\bwithout\b/i.test(claims[i].text);
        if (hasNegation !== otherHasNegation) {
          consistency -= 0.3; // Contradicting related claims
        }
      }
    }

    scores.set(i, Math.max(0, consistency));
  }

  return scores;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Run hallucination grounding analysis on LLM output text.
 * Returns a detailed report with per-claim grounding scores.
 */
export function groundOutput(outputId: string, outputText: string): GroundingReport {
  const claims = extractClaims(outputText);

  if (claims.length === 0) {
    return {
      outputId,
      totalClaims: 0,
      groundedClaims: 0,
      hallucinatedClaims: 0,
      uncertainClaims: 0,
      overallGroundingScore: 1.0, // No claims = no hallucination risk
      checks: [],
    };
  }

  const hedging = hedgingScore(outputText);
  const consistencies = consistencyScore(claims);

  const checks: HallucinationCheck[] = claims.map((claim, idx) => {
    const specRisk = specificityRisk(claim);
    const consistency = consistencies.get(idx) ?? 1.0;

    // Composite grounding score
    const grounding = Math.max(0, Math.min(1,
      (hedging * 0.25) +                          // Hedging language bonus
      ((1 - specRisk) * 0.35) +                    // Low specificity risk bonus
      (consistency * 0.25) +                       // Consistency bonus
      (claim.claimType === 'attribution' ? 0.15 : 0.05) // Attribution bonus
    ));

    const isHallucinated = grounding < 0.4;

    return {
      claimId: `${outputId}-claim-${idx}`,
      claim: claim.text,
      groundingScore: Math.round(grounding * 100) / 100,
      sources: [], // No external lookup — pure heuristic
      isHallucinated,
      confidence: isHallucinated ? 1 - grounding : grounding,
    };
  });

  const grounded = checks.filter(c => !c.isHallucinated && c.groundingScore >= 0.6).length;
  const hallucinated = checks.filter(c => c.isHallucinated).length;
  const uncertain = checks.length - grounded - hallucinated;

  return {
    outputId,
    totalClaims: checks.length,
    groundedClaims: grounded,
    hallucinatedClaims: hallucinated,
    uncertainClaims: uncertain,
    overallGroundingScore: checks.length > 0
      ? Math.round((checks.reduce((s, c) => s + c.groundingScore, 0) / checks.length) * 100) / 100
      : 1.0,
    checks,
  };
}
