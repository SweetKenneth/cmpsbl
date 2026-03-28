/**
 * CONSCIENCE — Mandatory Interception Gate
 * Pre-flight ethical gate that MUST be called before any mutation intent
 * executes through broadcastIntent(). Returns a gate verdict.
 *
 * This is the enforcement layer — evaluate() is the analysis,
 * this gate is the hard stop.
 */

export type GateVerdict = 'pass' | 'review' | 'block';

export interface GateResult {
  verdict: GateVerdict;
  evaluationId: string;
  compositeScore: number;
  reason: string;
  gatedAt: number;
  bypassable: boolean;
}

// Configurable thresholds
let blockThreshold = 30;  // Score below this = hard block
let reviewThreshold = 60; // Score below this = requires review

const MAX_GATE_LOG = 300;
const gateLog: GateResult[] = [];
let gateCount = 0;

/** Configure gate thresholds */
export function configureGate(opts: { blockThreshold?: number; reviewThreshold?: number }): void {
  if (opts.blockThreshold !== undefined) blockThreshold = Math.max(0, Math.min(100, opts.blockThreshold));
  if (opts.reviewThreshold !== undefined) reviewThreshold = Math.max(0, Math.min(100, opts.reviewThreshold));
  // Ensure block < review
  if (blockThreshold >= reviewThreshold) blockThreshold = reviewThreshold - 10;
}

/** Run the mandatory pre-flight ethical gate */
export function runGate(
  evaluationId: string,
  compositeScore: number,
  recommendation: 'proceed' | 'caution' | 'block',
  isMutation: boolean,
): GateResult {
  let verdict: GateVerdict;
  let reason: string;
  let bypassable = false;

  if (recommendation === 'block' || compositeScore < blockThreshold) {
    verdict = 'block';
    reason = `Hard block: score ${compositeScore}% below threshold ${blockThreshold}%`;
    bypassable = false;
  } else if (recommendation === 'caution' || compositeScore < reviewThreshold) {
    verdict = isMutation ? 'review' : 'pass';
    reason = isMutation
      ? `Mutation intent requires review: score ${compositeScore}% below review threshold ${reviewThreshold}%`
      : `Non-mutation caution: score ${compositeScore}%, passing with flag`;
    bypassable = true;
  } else {
    verdict = 'pass';
    reason = `Clear passage: score ${compositeScore}% meets all thresholds`;
    bypassable = false;
  }

  const result: GateResult = {
    verdict,
    evaluationId,
    compositeScore,
    reason,
    gatedAt: Date.now(),
    bypassable,
  };

  // Ring buffer log
  if (gateLog.length >= MAX_GATE_LOG) gateLog.shift();
  gateLog.push(result);
  gateCount++;

  return result;
}

/** Get gate statistics */
export function getGateStats() {
  const byVerdict: Record<string, number> = { pass: 0, review: 0, block: 0 };
  for (const g of gateLog) byVerdict[g.verdict]++;
  return {
    total: gateCount,
    logged: gateLog.length,
    byVerdict,
    thresholds: { block: blockThreshold, review: reviewThreshold },
  };
}

/** Get recent gate log */
export function getGateLog(count: number = 20): GateResult[] {
  return gateLog.slice(-count);
}
