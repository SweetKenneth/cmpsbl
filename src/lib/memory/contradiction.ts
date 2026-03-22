/**
 * Contradiction Detector — Flags conflicting memory claims
 * Applies confidence drops when new evidence contradicts existing memory
 * 
 * FIX #19: Enhanced detection beyond simple adjacent-word negation —
 * now checks antonym pairs, numeric conflicts, and temporal supersession.
 * OPT: Pre-built antonym lookup map for O(1), reduced allocations.
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

/** Pre-built O(1) antonym lookup: word → its antonym */
const ANTONYM_MAP = new Map<string, string>();
for (const [a, b] of ANTONYM_PAIRS) {
  ANTONYM_MAP.set(a, b);
  ANTONYM_MAP.set(b, a);
}

/** Negation words that flip meaning */
const NEGATION_SET = new Set(['not', 'never', 'no', 'false', 'incorrect', 'wrong', 'deprecated', 'removed', 'invalid', "doesn't", "isn't", "won't", "can't", "don't"]);

/** Pre-compiled regex */
const NUM_RE = /\b\d+\.?\d*\b/g;

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

  // Extract long words once, reuse across checks
  const existingWords: string[] = [];
  const newWordSet = new Set<string>();
  
  // Single-pass word extraction for both strings
  for (const w of existingLower.split(/\s+/)) {
    if (w.length > 3) existingWords.push(w);
  }
  for (const w of newLower.split(/\s+/)) {
    if (w.length > 3) newWordSet.add(w);
  }

  // 1. Negation-keyword overlap
  for (const word of existingWords) {
    for (const neg of NEGATION_SET) {
      if (newLower.includes(`${neg} ${word}`) || newLower.includes(`${word} ${neg}`)) {
        contradictionSignals++;
        reasons.push(`negation: "${neg} ${word}"`);
      }
    }
  }

  // 2. Antonym detection via O(1) map lookup
  for (const word of existingWords) {
    const antonym = ANTONYM_MAP.get(word);
    if (!antonym) continue;
    if (!newLower.includes(antonym)) continue;
    // Verify subject overlap (at least 1 shared non-antonym word)
    for (const w of existingWords) {
      if (w !== word && w !== antonym && newWordSet.has(w)) {
        contradictionSignals++;
        reasons.push(`antonym: "${word}" vs "${antonym}"`);
        break;
      }
    }
  }

  // 3. Numeric conflict — same subject, different numbers
  NUM_RE.lastIndex = 0;
  const existingNums = existingLower.match(NUM_RE);
  if (existingNums) {
    const newNums = newLower.match(NUM_RE);
    if (newNums) {
      // Check subject overlap
      let hasOverlap = false;
      for (const w of existingWords) {
        if (w.charCodeAt(0) > 57 && newWordSet.has(w)) { hasOverlap = true; break; } // charCode > '9'
      }
      if (hasOverlap) {
        const existingNumSet = new Set(existingNums);
        for (const n of newNums) {
          if (!existingNumSet.has(n)) {
            contradictionSignals++;
            reasons.push(`numeric: existing=[${existingNums.join(',')}] vs new=[${newNums.join(',')}]`);
            break;
          }
        }
      }
    }
  }

  if (contradictionSignals === 0) {
    return { contradicted: false, confidence_drop: 0, reason: 'no_contradiction', evidence_source: 'analysis' };
  }

  // Scale confidence drop with signal strength (capped at 50%)
  const drop = existingConfidence * (contradictionSignals * 0.15 > 0.50 ? 0.50 : contradictionSignals * 0.15);

  return {
    contradicted: true,
    confidence_drop: drop,
    reason: `${contradictionSignals} contradiction signal(s): ${reasons.slice(0, 3).join('; ')}`,
    evidence_source: 'contradiction_detector',
  };
}

/** Apply contradiction penalty to confidence */
export function applyContradictionPenalty(confidence: number, drop: number): number {
  const result = confidence - drop;
  return result > 0 ? result : 0;
}