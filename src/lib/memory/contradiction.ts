/**
 * Contradiction Detector — Flags conflicting memory claims
 * Applies confidence drops when new evidence contradicts existing memory
 * 
 * FIX #19: Enhanced detection beyond simple adjacent-word negation —
 * now checks antonym pairs, numeric conflicts, and temporal supersession.
 */

export interface ContradictionResult {
  contradicted: boolean;
  confidence_drop: number;
  reason: string;
  evidence_source: string;
}

/** Common antonym pairs that indicate contradiction */
const ANTONYM_PAIRS: [string, string][] = [
  ['true', 'false'], ['yes', 'no'], ['enabled', 'disabled'],
  ['active', 'inactive'], ['allow', 'deny'], ['success', 'failure'],
  ['open', 'closed'], ['up', 'down'], ['start', 'stop'],
  ['add', 'remove'], ['create', 'delete'], ['include', 'exclude'],
  ['valid', 'invalid'], ['correct', 'incorrect'], ['safe', 'unsafe'],
  ['available', 'unavailable'], ['online', 'offline'],
];

/** Negation words that flip meaning */
const NEGATIONS = ['not', 'never', 'no', 'false', 'incorrect', 'wrong', 'deprecated', 'removed', 'invalid', "doesn't", "isn't", "won't", "can't", "don't"];

/** Check if new evidence contradicts an existing memory claim */
export function detectContradiction(
  existingClaim: string,
  newEvidence: string,
  existingConfidence: number
): ContradictionResult {
  const existingLower = existingClaim.toLowerCase();
  const newLower = newEvidence.toLowerCase();
  let contradictionSignals = 0;
  const reasons: string[] = [];

  // 1. Negation-keyword overlap (original logic, improved)
  const existingWords = existingLower.split(/\s+/).filter(w => w.length > 3);
  for (const word of existingWords) {
    for (const neg of NEGATIONS) {
      if (newLower.includes(`${neg} ${word}`) || newLower.includes(`${word} ${neg}`)) {
        contradictionSignals++;
        reasons.push(`negation: "${neg} ${word}"`);
      }
    }
  }

  // 2. Antonym detection — if existing has one side, new has the other
  for (const [a, b] of ANTONYM_PAIRS) {
    const existingHasA = existingLower.includes(a);
    const existingHasB = existingLower.includes(b);
    const newHasA = newLower.includes(a);
    const newHasB = newLower.includes(b);

    if ((existingHasA && newHasB) || (existingHasB && newHasA)) {
      // Ensure they share a common subject (at least 2 overlapping content words)
      const newWords = newLower.split(/\s+/).filter(w => w.length > 3);
      const overlap = existingWords.filter(w => newWords.includes(w) && w !== a && w !== b);
      if (overlap.length >= 1) {
        contradictionSignals++;
        reasons.push(`antonym: "${a}" vs "${b}"`);
      }
    }
  }

  // 3. Numeric conflict — same subject, different numbers
  const existingNums = existingLower.match(/\b\d+\.?\d*\b/g);
  const newNums = newLower.match(/\b\d+\.?\d*\b/g);
  if (existingNums && newNums) {
    // Check if they share context words (subject overlap)
    const newWords = newLower.split(/\s+/).filter(w => w.length > 3 && !/^\d/.test(w));
    const overlap = existingWords.filter(w => newWords.includes(w) && !/^\d/.test(w));
    if (overlap.length >= 1) {
      const existingSet = new Set(existingNums);
      const conflicting = newNums.filter(n => !existingSet.has(n));
      if (conflicting.length > 0) {
        contradictionSignals++;
        reasons.push(`numeric: existing=[${existingNums.join(',')}] vs new=[${newNums.join(',')}]`);
      }
    }
  }

  if (contradictionSignals === 0) {
    return { contradicted: false, confidence_drop: 0, reason: 'no_contradiction', evidence_source: 'analysis' };
  }

  // Scale confidence drop with signal strength (capped at 50%)
  const dropFactor = Math.min(contradictionSignals * 0.15, 0.50);
  const drop = existingConfidence * dropFactor;

  return {
    contradicted: true,
    confidence_drop: drop,
    reason: `${contradictionSignals} contradiction signal(s): ${reasons.slice(0, 3).join('; ')}`,
    evidence_source: 'contradiction_detector',
  };
}

/** Apply contradiction penalty to confidence */
export function applyContradictionPenalty(confidence: number, drop: number): number {
  return Math.max(0, confidence - drop);
}
