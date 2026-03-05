/**
 * Contradiction Detector — Flags conflicting memory claims
 * Applies confidence drops when new evidence contradicts existing memory
 */

export interface ContradictionResult {
  contradicted: boolean;
  confidence_drop: number;
  reason: string;
  evidence_source: string;
}

/** Check if new evidence contradicts an existing memory claim */
export function detectContradiction(
  existingClaim: string,
  newEvidence: string,
  existingConfidence: number
): ContradictionResult {
  // Simplified contradiction detection via keyword negation patterns
  const negations = ['not', 'never', 'false', 'incorrect', 'wrong', 'deprecated', 'removed', 'invalid'];
  const existingLower = existingClaim.toLowerCase();
  const newLower = newEvidence.toLowerCase();

  // Check if new evidence contains negation of existing claim keywords
  const existingWords = existingLower.split(/\s+/).filter(w => w.length > 3);
  let contradictionSignals = 0;

  for (const word of existingWords) {
    for (const neg of negations) {
      if (newLower.includes(`${neg} ${word}`) || newLower.includes(`${word} ${neg}`)) {
        contradictionSignals++;
      }
    }
  }

  if (contradictionSignals === 0) {
    return { contradicted: false, confidence_drop: 0, reason: 'no_contradiction', evidence_source: 'analysis' };
  }

  // Scale confidence drop with signal strength
  const dropFactor = Math.min(contradictionSignals * 0.15, 0.50);
  const drop = existingConfidence * dropFactor;

  return {
    contradicted: true,
    confidence_drop: drop,
    reason: `${contradictionSignals} contradiction signal(s) detected`,
    evidence_source: 'contradiction_detector',
  };
}

/** Apply contradiction penalty to confidence */
export function applyContradictionPenalty(confidence: number, drop: number): number {
  return Math.max(0, confidence - drop);
}
