/**
 * Meta-Engine #10 — Multi-Model AI Tribunal
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Composes: Consensus + Fleet Router + Cost Router + Cache + Audit Chain
 *
 * AI decision governance platform. Routes critical queries to multiple
 * models, builds consensus with weighted voting, caches agreed-upon
 * answers, tracks costs, and produces tamper-evident decision records.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface ModelProvider {
  id: string;
  name: string;
  invoke: (prompt: string, context?: unknown) => Promise<{ content: string; confidence: number; reasoning?: string; tokensUsed?: number }>;
  costPerMillionTokens: number;
  tier: 'premium' | 'standard' | 'budget';
  reliability: number;
  weight?: number;
}

export interface TribunalConfig {
  strategy?: 'majority' | 'supermajority' | 'unanimity' | 'weighted';
  minModels?: number;
  timeoutMs?: number;
  confidenceThreshold?: number;
  cacheTtlMs?: number;
  dailyBudgetCents?: number;
  onDecision?: (decision: TribunalDecision) => void;
}

export interface TribunalDecision {
  id: string;
  prompt: string;
  consensus: boolean;
  answer?: string;
  agreement: number;
  votes: Array<{ modelId: string; answer: string; confidence: number; latencyMs: number; costCents: number; reasoning?: string }>;
  dissenting: string[];
  totalCostCents: number;
  cached: boolean;
  strategy: string;
  timestamp: number;
  auditHash: string;
}

export interface TribunalStats {
  totalDecisions: number;
  consensusRate: number;
  avgAgreement: number;
  totalCostCents: number;
  cacheHitRate: number;
  modelPerformance: Record<string, { invocations: number; avgConfidence: number; avgLatencyMs: number; totalCostCents: number; agreementRate: number }>;
}

export function createAITribunal(config: TribunalConfig = {}) {
  const {
    strategy = 'supermajority',
    minModels = 3,
    timeoutMs = 30_000,
    confidenceThreshold = 0.5,
    cacheTtlMs = 600_000,
    dailyBudgetCents = 10_000,
    onDecision,
  } = config;

  const models = new Map<string, ModelProvider>();
  const decisions: TribunalDecision[] = [];
  const cache = new Map<string, { decision: TribunalDecision; expiresAt: number }>();
  let decisionSeq = 0;

  // ── Cost Tracking ──────────────────────────────────────────────
  let dayStart = new Date().setHours(0, 0, 0, 0);
  let spentToday = 0;
  function resetDay() { const today = new Date().setHours(0, 0, 0, 0); if (today > dayStart) { dayStart = today; spentToday = 0; } }
  function estimateCost(provider: ModelProvider, tokens: number): number { return (tokens / 1_000_000) * provider.costPerMillionTokens * 100; }

  // ── Audit Chain ────────────────────────────────────────────────
  const auditChain: Array<{ hash: string; prevHash: string }> = [];
  function fnvHash(s: string): string { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
  function auditRecord(data: string): string {
    const prevHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].hash : '00000000';
    const hash = fnvHash(`${prevHash}|${data}`);
    auditChain.push({ hash, prevHash });
    return hash;
  }

  // ── Model Management ───────────────────────────────────────────

  function registerModel(provider: ModelProvider) { models.set(provider.id, provider); }
  function removeModel(id: string) { models.delete(id); }

  // ── Tribunal Session ───────────────────────────────────────────

  function selectModels(budget: number): ModelProvider[] {
    resetDay();
    const remaining = dailyBudgetCents - spentToday;
    const available = [...models.values()].filter(m => {
      const estCost = estimateCost(m, 2000);
      return estCost <= remaining;
    });

    // Sort by reliability * weight, pick top N
    return available
      .sort((a, b) => (b.reliability * (b.weight ?? 1)) - (a.reliability * (a.weight ?? 1)))
      .slice(0, Math.max(minModels, Math.min(available.length, 5)));
  }

  async function deliberate(prompt: string, context?: unknown): Promise<TribunalDecision> {
    // Cache check
    const cacheKey = fnvHash(prompt + JSON.stringify(context ?? ''));
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return { ...cached.decision, cached: true };
    }

    const selected = selectModels(dailyBudgetCents);
    if (selected.length < minModels) {
      throw new Error(`[Tribunal] Need ${minModels} models, only ${selected.length} available within budget`);
    }

    // Collect votes
    const votes: TribunalDecision['votes'] = [];
    const promises = selected.map(async model => {
      const start = Date.now();
      try {
        const result = await Promise.race([
          model.invoke(prompt, context),
          new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs)),
        ]);

        const tokens = result.tokensUsed ?? 1000;
        const costCents = estimateCost(model, tokens);
        spentToday += costCents;

        if (result.confidence >= confidenceThreshold) {
          votes.push({
            modelId: model.id,
            answer: result.content,
            confidence: result.confidence,
            latencyMs: Date.now() - start,
            costCents,
            reasoning: result.reasoning,
          });
        }
      } catch {
        // Model failed or timed out
      }
    });

    await Promise.allSettled(promises);

    // Tally consensus
    const decision = tally(prompt, votes);
    decisions.push(decision);
    if (decisions.length > 5000) decisions.splice(0, decisions.length - 5000);

    // Cache if consensus reached
    if (decision.consensus && cacheTtlMs > 0) {
      cache.set(cacheKey, { decision, expiresAt: Date.now() + cacheTtlMs });
    }

    onDecision?.(decision);
    return decision;
  }

  function tally(prompt: string, votes: TribunalDecision['votes']): TribunalDecision {
    const totalCost = votes.reduce((s, v) => s + v.costCents, 0);

    if (votes.length === 0) {
      const auditHash = auditRecord(`no_consensus|${prompt}|${Date.now()}`);
      return { id: `dec_${++decisionSeq}`, prompt, consensus: false, agreement: 0, votes, dissenting: [], totalCostCents: totalCost, cached: false, strategy, timestamp: Date.now(), auditHash };
    }

    // Group by normalized answer
    const groups = new Map<string, { answer: string; weight: number; modelIds: string[] }>();
    for (const vote of votes) {
      const key = vote.answer.trim().toLowerCase().slice(0, 200);
      const model = models.get(vote.modelId);
      const w = vote.confidence * (model?.reliability ?? 1) * (model?.weight ?? 1);
      const existing = groups.get(key);
      if (existing) { existing.weight += w; existing.modelIds.push(vote.modelId); }
      else groups.set(key, { answer: vote.answer, weight: w, modelIds: [vote.modelId] });
    }

    const totalWeight = [...groups.values()].reduce((s, g) => s + g.weight, 0);
    const sorted = [...groups.values()].sort((a, b) => b.weight - a.weight);
    const winner = sorted[0];
    const agreement = winner.weight / totalWeight;

    const thresholds: Record<string, number> = { majority: 0.5, supermajority: 0.667, unanimity: 1.0, weighted: 0.5 };
    const reached = strategy === 'unanimity' ? groups.size === 1 : agreement > (thresholds[strategy] ?? 0.5);

    const dissenting = votes.filter(v => !winner.modelIds.includes(v.modelId)).map(v => v.modelId);
    const auditHash = auditRecord(`${reached ? 'consensus' : 'no_consensus'}|${prompt}|${winner.answer.slice(0, 100)}|${agreement.toFixed(3)}|${Date.now()}`);

    return {
      id: `dec_${++decisionSeq}`,
      prompt,
      consensus: reached,
      answer: reached ? winner.answer : undefined,
      agreement,
      votes,
      dissenting,
      totalCostCents: totalCost,
      cached: false,
      strategy,
      timestamp: Date.now(),
      auditHash,
    };
  }

  // ── Stats ──────────────────────────────────────────────────────

  function getStats(): TribunalStats {
    const consensusDecisions = decisions.filter(d => d.consensus);
    const modelPerf: TribunalStats['modelPerformance'] = {};

    for (const dec of decisions) {
      for (const vote of dec.votes) {
        const perf = modelPerf[vote.modelId] ?? { invocations: 0, avgConfidence: 0, avgLatencyMs: 0, totalCostCents: 0, agreementRate: 0 };
        const isWinner = dec.consensus && dec.answer === vote.answer;
        perf.invocations++;
        perf.avgConfidence = perf.avgConfidence * ((perf.invocations - 1) / perf.invocations) + vote.confidence / perf.invocations;
        perf.avgLatencyMs = perf.avgLatencyMs * ((perf.invocations - 1) / perf.invocations) + vote.latencyMs / perf.invocations;
        perf.totalCostCents += vote.costCents;
        perf.agreementRate = perf.agreementRate * ((perf.invocations - 1) / perf.invocations) + (isWinner ? 1 : 0) / perf.invocations;
        modelPerf[vote.modelId] = perf;
      }
    }

    const cachedCount = decisions.filter(d => d.cached).length;

    return {
      totalDecisions: decisions.length,
      consensusRate: decisions.length > 0 ? consensusDecisions.length / decisions.length : 0,
      avgAgreement: decisions.length > 0 ? decisions.reduce((s, d) => s + d.agreement, 0) / decisions.length : 0,
      totalCostCents: decisions.reduce((s, d) => s + d.totalCostCents, 0),
      cacheHitRate: decisions.length > 0 ? cachedCount / decisions.length : 0,
      modelPerformance: modelPerf,
    };
  }

  return {
    registerModel, removeModel, deliberate, getStats,
    get decisions() { return [...decisions]; },
    get budgetRemaining() { resetDay(); return dailyBudgetCents - spentToday; },
  };
}
