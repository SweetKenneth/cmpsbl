/**
 * NEXUS — Multi-Model Consensus (#42)
 * Routes ambiguous findings to multiple AI providers simultaneously,
 * aggregating verdicts for higher-confidence classification.
 */

export interface ModelVerdict {
  provider: string;
  model: string;
  verdict: 'true_positive' | 'false_positive' | 'uncertain';
  confidence: number;
  reasoning: string;
  latencyMs: number;
  costMillicents: number;
}

export interface ConsensusVerdict {
  findingId: string;
  verdicts: ModelVerdict[];
  finalVerdict: 'confirmed' | 'rejected' | 'split';
  agreementRate: number;
  totalCostMillicents: number;
  totalLatencyMs: number;
  decidedAt: string;
}

export interface MultiModelConfig {
  minModels: number;
  maxModels: number;
  agreementThreshold: number; // 0-1, e.g. 0.7 = 70% must agree
  maxBudgetMillicents: number;
  maxLatencyMs: number;
}

const DEFAULT_CONFIG: MultiModelConfig = {
  minModels: 2,
  maxModels: 3,
  agreementThreshold: 0.7,
  maxBudgetMillicents: 500,
  maxLatencyMs: 10000,
};

/**
 * Select models for consensus based on finding category and budget
 */
export function selectConsensusModels(
  category: string,
  config: Partial<MultiModelConfig> = {},
): Array<{ provider: string; model: string; estimatedCost: number }> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Category → model affinity mapping
  const modelPools: Record<string, Array<{ provider: string; model: string; cost: number }>> = {
    security: [
      { provider: 'openai', model: 'gpt-5', cost: 150 },
      { provider: 'google', model: 'gemini-2.5-pro', cost: 100 },
      { provider: 'openai', model: 'gpt-5-mini', cost: 50 },
    ],
    performance: [
      { provider: 'google', model: 'gemini-2.5-flash', cost: 30 },
      { provider: 'openai', model: 'gpt-5-mini', cost: 50 },
      { provider: 'google', model: 'gemini-2.5-pro', cost: 100 },
    ],
    accessibility: [
      { provider: 'google', model: 'gemini-2.5-flash', cost: 30 },
      { provider: 'openai', model: 'gpt-5-nano', cost: 15 },
    ],
    default: [
      { provider: 'openai', model: 'gpt-5-mini', cost: 50 },
      { provider: 'google', model: 'gemini-2.5-flash', cost: 30 },
    ],
  };

  const pool = modelPools[category] ?? modelPools.default;

  // Greedily select models within budget
  const selected: typeof pool = [];
  let remainingBudget = cfg.maxBudgetMillicents;

  for (const model of pool) {
    if (selected.length >= cfg.maxModels) break;
    if (model.cost <= remainingBudget) {
      selected.push(model);
      remainingBudget -= model.cost;
    }
  }

  // Ensure minimum
  if (selected.length < cfg.minModels && pool.length >= cfg.minModels) {
    return pool.slice(0, cfg.minModels).map(m => ({ provider: m.provider, model: m.model, estimatedCost: m.cost }));
  }

  return selected.map(m => ({ provider: m.provider, model: m.model, estimatedCost: m.cost }));
}

/**
 * Aggregate verdicts into a consensus decision
 */
export function aggregateVerdicts(
  findingId: string,
  verdicts: ModelVerdict[],
  threshold = 0.7,
): ConsensusVerdict {
  const truePos = verdicts.filter(v => v.verdict === 'true_positive');
  const falsePos = verdicts.filter(v => v.verdict === 'false_positive');
  const total = truePos.length + falsePos.length;

  let finalVerdict: ConsensusVerdict['finalVerdict'] = 'split';
  let agreementRate = 0;

  if (total > 0) {
    const trueRatio = truePos.length / total;
    agreementRate = Math.max(trueRatio, 1 - trueRatio);

    if (trueRatio >= threshold) finalVerdict = 'confirmed';
    else if (trueRatio <= (1 - threshold)) finalVerdict = 'rejected';
  }

  return {
    findingId,
    verdicts,
    finalVerdict,
    agreementRate: Math.round(agreementRate * 100) / 100,
    totalCostMillicents: verdicts.reduce((s, v) => s + v.costMillicents, 0),
    totalLatencyMs: Math.max(...verdicts.map(v => v.latencyMs), 0),
    decidedAt: new Date().toISOString(),
  };
}
