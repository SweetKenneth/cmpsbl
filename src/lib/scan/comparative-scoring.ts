/**
 * Comparative Scoring — benchmark against industry averages
 * Item #14: Percentile ranking for scanned domains
 */

interface BenchmarkData {
  category: string;
  median: number;
  p25: number;
  p75: number;
  p90: number;
}

/** Industry benchmark data (aggregated averages — static seed data) */
const BENCHMARKS: Record<string, BenchmarkData> = {
  overall: { category: 'Overall', median: 62, p25: 45, p75: 78, p90: 90 },
  seo: { category: 'SEO', median: 58, p25: 40, p75: 75, p90: 88 },
  accessibility: { category: 'Accessibility', median: 55, p25: 35, p75: 72, p90: 85 },
  security: { category: 'Security', median: 65, p25: 48, p75: 80, p90: 92 },
  performance: { category: 'Performance', median: 52, p25: 35, p75: 70, p90: 85 },
};

export interface ComparativeResult {
  category: string;
  score: number;
  percentile: number;
  rating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  benchmark: BenchmarkData;
}

/**
 * Calculate percentile ranking for a score within a category.
 */
function calculatePercentile(score: number, benchmark: BenchmarkData): number {
  if (score >= benchmark.p90) return 90 + (score - benchmark.p90) / (100 - benchmark.p90) * 10;
  if (score >= benchmark.p75) return 75 + (score - benchmark.p75) / (benchmark.p90 - benchmark.p75) * 15;
  if (score >= benchmark.median) return 50 + (score - benchmark.median) / (benchmark.p75 - benchmark.median) * 25;
  if (score >= benchmark.p25) return 25 + (score - benchmark.p25) / (benchmark.median - benchmark.p25) * 25;
  return Math.max(1, (score / benchmark.p25) * 25);
}

function getRating(percentile: number): ComparativeResult['rating'] {
  if (percentile >= 90) return 'excellent';
  if (percentile >= 75) return 'good';
  if (percentile >= 50) return 'average';
  if (percentile >= 25) return 'below_average';
  return 'poor';
}

/**
 * Compare a set of category scores against industry benchmarks.
 */
export function compareToBenchmarks(
  scores: Record<string, number>,
): ComparativeResult[] {
  return Object.entries(scores).map(([category, score]) => {
    const benchmark = BENCHMARKS[category] ?? BENCHMARKS.overall;
    const percentile = Math.round(calculatePercentile(score, benchmark));
    return {
      category: benchmark.category,
      score,
      percentile,
      rating: getRating(percentile),
      benchmark,
    };
  });
}

/**
 * Get a human-readable comparative summary.
 */
export function getComparativeSummary(results: ComparativeResult[]): string {
  const overall = results.find(r => r.category === 'Overall');
  if (!overall) return 'No benchmark data available.';
  
  const rating = overall.rating.replace('_', ' ');
  return `Your site scores in the ${overall.percentile}th percentile (${rating}). ${
    overall.percentile >= 75
      ? 'You outperform most sites in this category.'
      : overall.percentile >= 50
        ? 'You\'re above the industry median.'
        : 'There\'s significant room for improvement.'
  }`;
}
