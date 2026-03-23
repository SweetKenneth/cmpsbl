/**
 * NEXUS — Multi-Model Consensus Engine
 * Parallel query to N providers with configurable voting strategies.
 */

export type VotingStrategy = 'majority' | 'weighted' | 'best-of-n' | 'unanimous';

export interface ConsensusConfig {
  strategy: VotingStrategy;
  minResponses: number;
  timeoutMs: number;
  weights?: Record<string, number>;  // providerId → weight
  qualityScorer?: (response: string) => number;
}

export interface ConsensusResponse {
  providerId: string;
  response: string;
  latencyMs: number;
  quality: number;
  weight: number;
}

export interface ConsensusResult {
  winner: string;
  winnerProviderId: string;
  confidence: number;           // 0-1
  strategy: VotingStrategy;
  responses: ConsensusResponse[];
  agreement: number;            // 0-1
  totalDurationMs: number;
  quorumReached: boolean;
}

const DEFAULT_CONFIG: ConsensusConfig = {
  strategy: 'best-of-n',
  minResponses: 2,
  timeoutMs: 30_000,
};

function defaultQualityScorer(response: string): number {
  if (!response || response.length === 0) return 0;
  let score = 50;
  if (response.length > 100) score += 15;
  if (response.length > 500) score += 10;
  if (response.includes('\n')) score += 5;
  // Penalize error-like responses
  if (/error|fail|unavailable|sorry/i.test(response)) score -= 20;
  return Math.min(100, Math.max(0, score));
}

export async function runConsensus(
  providers: { id: string; call: () => Promise<string> }[],
  config?: Partial<ConsensusConfig>
): Promise<ConsensusResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const scorer = cfg.qualityScorer ?? defaultQualityScorer;
  const start = Date.now();

  // Parallel calls with individual timeout
  const results = await Promise.allSettled(
    providers.map(async (p) => {
      const pStart = Date.now();
      const response = await Promise.race([
        p.call(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), cfg.timeoutMs)
        ),
      ]);
      return {
        providerId: p.id,
        response,
        latencyMs: Date.now() - pStart,
        quality: scorer(response),
        weight: cfg.weights?.[p.id] ?? 1,
      } as ConsensusResponse;
    })
  );

  const responses: ConsensusResponse[] = results
    .filter((r): r is PromiseFulfilledResult<ConsensusResponse> => r.status === 'fulfilled')
    .map(r => r.value);

  const quorumReached = responses.length >= cfg.minResponses;

  if (responses.length === 0) {
    return {
      winner: '',
      winnerProviderId: '',
      confidence: 0,
      strategy: cfg.strategy,
      responses: [],
      agreement: 0,
      totalDurationMs: Date.now() - start,
      quorumReached: false,
    };
  }

  // Apply voting strategy
  let winner: ConsensusResponse;

  switch (cfg.strategy) {
    case 'best-of-n': {
      winner = responses.reduce((best, r) =>
        r.quality * r.weight > best.quality * best.weight ? r : best
      );
      break;
    }
    case 'weighted': {
      winner = responses.reduce((best, r) =>
        r.quality * r.weight > best.quality * best.weight ? r : best
      );
      break;
    }
    case 'majority':
    case 'unanimous':
    default: {
      // For text responses, use quality scoring as proxy
      winner = responses.reduce((best, r) => r.quality > best.quality ? r : best);
      break;
    }
  }

  // Calculate agreement (similarity of quality scores)
  const avgQuality = responses.reduce((s, r) => s + r.quality, 0) / responses.length;
  const variance = responses.reduce((s, r) => s + Math.pow(r.quality - avgQuality, 2), 0) / responses.length;
  const agreement = Math.max(0, 1 - Math.sqrt(variance) / 50);

  const maxPossibleScore = 100 * Math.max(...responses.map(r => r.weight));
  const confidence = maxPossibleScore > 0
    ? Math.min(1, (winner.quality * winner.weight) / maxPossibleScore)
    : 0;

  return {
    winner: winner.response,
    winnerProviderId: winner.providerId,
    confidence,
    strategy: cfg.strategy,
    responses,
    agreement,
    totalDurationMs: Date.now() - start,
    quorumReached,
  };
}
