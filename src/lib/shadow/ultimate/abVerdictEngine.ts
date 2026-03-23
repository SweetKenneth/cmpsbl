/**
 * SHADOW Ultimate — A/B Verdict Engine
 * Side-by-side scoring of shadow vs. production variants.
 * Weighted composite: Quality (40%), Divergence (25%), Latency (15%), Errors (10%), Resources (10%).
 */

export interface ABVariant {
  label: string;
  qualityScore: number;     // 0–1
  divergenceScore: number;  // 0–1 (lower = better)
  latencyMs: number;
  errorRate: number;         // 0–1
  resourceCost: number;      // 0–1
}

export interface ABVerdict {
  id: string;
  sessionId: string;
  conservative: ABVariant;
  aggressive: ABVariant;
  conservativeComposite: number;
  aggressiveComposite: number;
  winner: 'conservative' | 'aggressive' | 'tie';
  margin: number;
  decidedAt: number;
}

export interface ABStats {
  totalVerdicts: number;
  conservativeWins: number;
  aggressiveWins: number;
  ties: number;
  avgMargin: number;
}

const W_QUALITY = 0.40;
const W_DIVERGENCE = 0.25;
const W_LATENCY = 0.15;
const W_ERROR = 0.10;
const W_RESOURCE = 0.10;
const TIE_THRESHOLD = 0.02;

const MAX_VERDICTS = 500;
const verdicts: ABVerdict[] = [];

function scoreVariant(v: ABVariant, maxLatency: number): number {
  const latencyNorm = maxLatency > 0 ? 1 - Math.min(1, v.latencyMs / maxLatency) : 1;
  return v.qualityScore * W_QUALITY
    + (1 - v.divergenceScore) * W_DIVERGENCE
    + latencyNorm * W_LATENCY
    + (1 - v.errorRate) * W_ERROR
    + (1 - v.resourceCost) * W_RESOURCE;
}

export function renderVerdict(sessionId: string, conservative: ABVariant, aggressive: ABVariant): ABVerdict {
  const maxLatency = Math.max(conservative.latencyMs, aggressive.latencyMs, 1);
  const consScore = scoreVariant(conservative, maxLatency);
  const aggScore = scoreVariant(aggressive, maxLatency);
  const margin = Math.abs(consScore - aggScore);

  const winner: ABVerdict['winner'] =
    margin < TIE_THRESHOLD ? 'tie'
    : consScore > aggScore ? 'conservative'
    : 'aggressive';

  const verdict: ABVerdict = {
    id: `ab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sessionId, conservative, aggressive,
    conservativeComposite: consScore, aggressiveComposite: aggScore,
    winner, margin, decidedAt: Date.now(),
  };

  if (verdicts.length >= MAX_VERDICTS) verdicts.shift();
  verdicts.push(verdict);
  return verdict;
}

export function getABStats(): ABStats {
  const total = verdicts.length;
  return {
    totalVerdicts: total,
    conservativeWins: verdicts.filter(v => v.winner === 'conservative').length,
    aggressiveWins: verdicts.filter(v => v.winner === 'aggressive').length,
    ties: verdicts.filter(v => v.winner === 'tie').length,
    avgMargin: total > 0 ? verdicts.reduce((s, v) => s + v.margin, 0) / total : 0,
  };
}

export function resetABState(): void { verdicts.length = 0; }
