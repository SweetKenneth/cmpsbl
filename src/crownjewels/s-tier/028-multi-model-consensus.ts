/**
 * S-Tier 028 — Multi-Model Consensus Engine
 * CJPI: 94 | Node: NEXUS | ID: S-120
 *
 * Aggregates outputs from multiple AI providers (via NEXUS router),
 * scores agreement, and synthesises a consensus response.
 * Uses weighted voting with provider-health bias.
 */

export interface ConsensusCandidate {
  provider: string;
  response: string;
  latencyMs: number;
  confidence: number;
}

export interface ConsensusResult {
  consensus: string;
  agreement: number;        // 0-1 — how closely candidates aligned
  candidateCount: number;
  winnerProvider: string;
  method: 'unanimous' | 'majority' | 'weighted' | 'fallback';
  decidedAt: string;
}

const SIMILARITY_THRESHOLD = 0.7;

function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1;
  const al = a.length, bl = b.length;
  if (!al || !bl) return 0;
  const range = Math.max(0, Math.floor(Math.max(al, bl) / 2) - 1);
  const aMatches = new Array(al).fill(false);
  const bMatches = new Array(bl).fill(false);
  let matches = 0, transpositions = 0;
  for (let i = 0; i < al; i++) {
    const lo = Math.max(0, i - range), hi = Math.min(bl - 1, i + range);
    for (let j = lo; j <= hi; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;
  let k = 0;
  for (let i = 0; i < al; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  const jaro = (matches / al + matches / bl + (matches - transpositions / 2) / matches) / 3;
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(al, bl)); i++) {
    if (a[i] === b[i]) prefix++; else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

export function resolveConsensus(candidates: ConsensusCandidate[]): ConsensusResult {
  if (candidates.length === 0) throw new Error('No candidates provided');
  if (candidates.length === 1) {
    return {
      consensus: candidates[0].response,
      agreement: 1,
      candidateCount: 1,
      winnerProvider: candidates[0].provider,
      method: 'fallback',
      decidedAt: new Date().toISOString(),
    };
  }

  // Pairwise similarity matrix
  const n = candidates.length;
  const sim: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const s = jaroWinkler(candidates[i].response.toLowerCase(), candidates[j].response.toLowerCase());
      sim[i][j] = sim[j][i] = s;
    }
  }

  // Average similarity per candidate (agreement score proxy)
  const avgSim = candidates.map((_, i) =>
    sim[i].reduce((a, b) => a + b, 0) / n
  );
  const globalAgreement = avgSim.reduce((a, b) => a + b, 0) / n;

  // Unanimous?
  if (globalAgreement >= 0.95) {
    return {
      consensus: candidates[0].response,
      agreement: globalAgreement,
      candidateCount: n,
      winnerProvider: candidates[0].provider,
      method: 'unanimous',
      decidedAt: new Date().toISOString(),
    };
  }

  // Weighted vote: confidence × avg-similarity
  const weights = candidates.map((c, i) => c.confidence * avgSim[i]);
  const winnerIdx = weights.indexOf(Math.max(...weights));

  return {
    consensus: candidates[winnerIdx].response,
    agreement: globalAgreement,
    candidateCount: n,
    winnerProvider: candidates[winnerIdx].provider,
    method: globalAgreement >= SIMILARITY_THRESHOLD ? 'majority' : 'weighted',
    decidedAt: new Date().toISOString(),
  };
}
