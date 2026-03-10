/**
 * S-Tier 145 — Metacognition Engine
 * ID: S-CJ103 | CJPI: 86 | Module: BRAIN
 * 
 * Self-reflective cognition engine for reasoning about reasoning.
 */

export interface ReasoningTrace {
  id: string;
  strategy: string;
  steps: string[];
  outcome: 'success' | 'failure' | 'partial';
  confidence: number;
  durationMs: number;
  timestamp: string;
}

export interface MetacognitiveAssessment {
  strategyEffectiveness: Record<string, number>;
  bestStrategy: string;
  weakAreas: string[];
  recommendations: string[];
  overallConfidence: number;
}

export class MetacognitionEngine {
  private traces: ReasoningTrace[] = [];

  recordTrace(trace: ReasoningTrace): void {
    this.traces.push(trace);
    if (this.traces.length > 500) this.traces = this.traces.slice(-500);
  }

  assess(): MetacognitiveAssessment {
    const strategyStats = new Map<string, { successes: number; total: number; avgConfidence: number }>();

    for (const trace of this.traces) {
      const stats = strategyStats.get(trace.strategy) || { successes: 0, total: 0, avgConfidence: 0 };
      stats.total++;
      if (trace.outcome === 'success') stats.successes++;
      stats.avgConfidence = (stats.avgConfidence * (stats.total - 1) + trace.confidence) / stats.total;
      strategyStats.set(trace.strategy, stats);
    }

    const effectiveness: Record<string, number> = {};
    let bestStrategy = '';
    let bestScore = -1;
    const weakAreas: string[] = [];

    for (const [strategy, stats] of strategyStats) {
      const score = stats.total > 0 ? stats.successes / stats.total : 0;
      effectiveness[strategy] = score;
      if (score > bestScore) { bestScore = score; bestStrategy = strategy; }
      if (score < 0.5 && stats.total >= 3) weakAreas.push(strategy);
    }

    const recommendations = weakAreas.map(w =>
      `Consider replacing "${w}" (${(effectiveness[w] * 100).toFixed(0)}% success) with "${bestStrategy}"`
    );

    return {
      strategyEffectiveness: effectiveness,
      bestStrategy,
      weakAreas,
      recommendations,
      overallConfidence: this.traces.length > 0
        ? this.traces.reduce((s, t) => s + t.confidence, 0) / this.traces.length : 0,
    };
  }
}
