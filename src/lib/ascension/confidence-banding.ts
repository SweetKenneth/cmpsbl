/**
 * CMPSBL® Confidence Banding System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Categorizes scanner matches into confidence bands to prevent
 * false positives from poisoning the glossary feedback loop.
 *
 * Bands:
 *   HIGH       — Structural + lexical + intent all confirm
 *   MEDIUM     — Two of three channels confirm
 *   LOW        — One channel only
 *   HYPOTHESIS — Intent-only (comments/TODOs suggest capability)
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ConfidenceBand = 'high' | 'medium' | 'low' | 'hypothesis';

export interface BandedResult {
  /** Primitive name (uppercase) */
  primitive: string;
  /** Source vertical */
  sourceVertical: string;
  /** Computed compounding score from the scanner */
  compoundingScore: number;
  /** Confidence band classification */
  band: ConfidenceBand;
  /** Whether structural patterns matched */
  hasStructural: boolean;
  /** Whether lexical signals matched */
  hasLexical: boolean;
  /** Whether intent signals matched */
  hasIntent: boolean;
  /** Number of distinct signal channels that confirmed */
  channelCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — BANDING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Classify a primitive match into a confidence band.
 *
 * @param hasStructural  Did structural pattern analysis find this primitive?
 * @param hasLexical     Did lexical signal matching find this primitive?
 * @param hasIntent      Did intent/comment analysis find this primitive?
 * @param compoundingScore  The composite score from the scanner
 */
export function classifyBand(
  hasStructural: boolean,
  hasLexical: boolean,
  hasIntent: boolean,
  compoundingScore: number,
): ConfidenceBand {
  const channels = [hasStructural, hasLexical, hasIntent].filter(Boolean).length;

  // All three channels agree — highest confidence
  if (channels === 3) return 'high';

  // Two channels agree — solid confidence
  if (channels === 2) return 'medium';

  // Only intent channel (comments/TODOs suggest but code doesn't implement)
  if (hasIntent && !hasStructural && !hasLexical) return 'hypothesis';

  // One channel only — low confidence but still surfaced
  // Exception: very high compounding score from lexical alone can be medium
  if (channels === 1 && hasLexical && compoundingScore >= 0.60) return 'medium';

  return 'low';
}

/**
 * Apply confidence banding to a full set of scanner results.
 * Requires structural analysis results to determine which primitives
 * have structural and intent confirmation.
 */
export function bandResults(
  primitives: Array<{
    primitive: { name: string };
    sourceVertical: string;
    compoundingScore: number;
    signalHits: number;
  }>,
  structuralBoosts: Map<string, number>,
  intentPrimitives: Set<string>,
): BandedResult[] {
  return primitives.map(p => {
    const name = p.primitive.name.toUpperCase();
    const hasStructural = (structuralBoosts.get(name) ?? 0) > 0;
    const hasLexical = p.signalHits >= 2;
    const hasIntent = intentPrimitives.has(name);

    return {
      primitive: name,
      sourceVertical: p.sourceVertical,
      compoundingScore: p.compoundingScore,
      band: classifyBand(hasStructural, hasLexical, hasIntent, p.compoundingScore),
      hasStructural,
      hasLexical,
      hasIntent,
      channelCount: [hasStructural, hasLexical, hasIntent].filter(Boolean).length,
    };
  });
}

/**
 * Filter results to only include results above a minimum confidence band.
 */
export function filterByBand(
  results: BandedResult[],
  minimumBand: ConfidenceBand = 'low',
): BandedResult[] {
  const bandOrder: Record<ConfidenceBand, number> = {
    high: 4,
    medium: 3,
    low: 2,
    hypothesis: 1,
  };

  const threshold = bandOrder[minimumBand];
  return results.filter(r => bandOrder[r.band] >= threshold);
}

/**
 * Get distribution of confidence bands in results.
 */
export function getBandDistribution(
  results: BandedResult[],
): Record<ConfidenceBand, number> {
  const dist: Record<ConfidenceBand, number> = {
    high: 0, medium: 0, low: 0, hypothesis: 0,
  };
  for (const r of results) dist[r.band]++;
  return dist;
}
