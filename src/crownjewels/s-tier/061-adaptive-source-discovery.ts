/**
 * S-Tier 061 — Adaptive Source Discovery
 * CJPI: 93 | Node: HARVEST | ID: S-HRV02
 *
 * Discovers and ranks data sources based on relevance, freshness, and reliability.
 */

export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'feed' | 'scrape' | 'database';
  reliability: number; // 0-1
  freshness: number;   // 0-1 (1 = very fresh)
  relevanceScore: number;
  lastChecked: number;
}

export interface SourceRanking {
  source: DataSource;
  compositeScore: number;
}

const WEIGHTS = { reliability: 0.4, freshness: 0.3, relevance: 0.3 };

export function rankSources(sources: DataSource[]): SourceRanking[] {
  return sources
    .map(source => ({
      source,
      compositeScore: Math.round((
        source.reliability * WEIGHTS.reliability +
        source.freshness * WEIGHTS.freshness +
        source.relevanceScore * WEIGHTS.relevance
      ) * 100) / 100,
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore);
}

export function filterStale(sources: DataSource[], maxAgeMs = 86_400_000): DataSource[] {
  const cutoff = Date.now() - maxAgeMs;
  return sources.filter(s => s.lastChecked >= cutoff);
}

export function topN(sources: DataSource[], n = 5): DataSource[] {
  return rankSources(sources).slice(0, n).map(r => r.source);
}
