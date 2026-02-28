/**
 * Combo Scan — unified Site Health report
 * Item #16: Bundle accessibility + security + SEO into one composite score
 */

export interface ComboScanResult {
  compositeScore: number;
  breakdown: {
    seo: { score: number; weight: number; findings: number };
    accessibility: { score: number; weight: number; findings: number };
    security: { score: number; weight: number; findings: number };
    performance: { score: number; weight: number; findings: number };
  };
  grade: string;
  summary: string;
}

const WEIGHTS = {
  seo: 0.25,
  accessibility: 0.25,
  security: 0.30,
  performance: 0.20,
};

function gradeFromScore(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Compute a unified site health score from individual scan results.
 */
export function computeComboScore(scores: {
  seo: number;
  accessibility: number;
  security: number;
  performance: number;
  findingCounts?: { seo: number; accessibility: number; security: number; performance: number };
}): ComboScanResult {
  const composite = Math.round(
    scores.seo * WEIGHTS.seo +
    scores.accessibility * WEIGHTS.accessibility +
    scores.security * WEIGHTS.security +
    scores.performance * WEIGHTS.performance
  );

  const fc = scores.findingCounts ?? { seo: 0, accessibility: 0, security: 0, performance: 0 };

  const grade = gradeFromScore(composite);
  const totalFindings = fc.seo + fc.accessibility + fc.security + fc.performance;

  const summary = composite >= 80
    ? `Excellent site health (${grade}). ${totalFindings} findings across all categories.`
    : composite >= 60
      ? `Moderate site health (${grade}). ${totalFindings} findings need attention.`
      : `Site health needs improvement (${grade}). ${totalFindings} findings require action.`;

  return {
    compositeScore: composite,
    breakdown: {
      seo: { score: scores.seo, weight: WEIGHTS.seo, findings: fc.seo },
      accessibility: { score: scores.accessibility, weight: WEIGHTS.accessibility, findings: fc.accessibility },
      security: { score: scores.security, weight: WEIGHTS.security, findings: fc.security },
      performance: { score: scores.performance, weight: WEIGHTS.performance, findings: fc.performance },
    },
    grade,
    summary,
  };
}
