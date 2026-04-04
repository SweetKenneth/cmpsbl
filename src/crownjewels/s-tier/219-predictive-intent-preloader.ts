/**
 * S-Tier 219 — Predictive Intent Pre-Loader
 * ID: S-INT04 | CJPI: 91 | Module: INTENT
 *
 * Learns user intent sequences via Markov chains, predicts next actions,
 * pre-loads resources, and tracks prediction accuracy.
 */

export interface IntentPrediction {
  intent: string;
  probability: number;
  preloaded: boolean;
}

export class PredictiveIntentPreLoader {
  private sequences: string[][] = [];
  private preloaded: Map<string, unknown> = new Map();
  private predictionLog: { predicted: string; actual: string; correct: boolean; timestamp: number }[] = [];
  private readonly maxSequences: number;

  constructor(maxSequences: number = 500) {
    this.maxSequences = maxSequences;
  }

  recordSequence(intents: string[]): void {
    this.sequences.push(intents);
    if (this.sequences.length > this.maxSequences) this.sequences.shift();
  }

  recordIntent(currentIntent: string, previousIntent?: string): void {
    if (previousIntent) {
      // Check prediction accuracy
      const predictions = this.predictNext(previousIntent);
      const predicted = predictions[0]?.intent;
      if (predicted) {
        this.predictionLog.push({ predicted, actual: currentIntent, correct: predicted === currentIntent, timestamp: Date.now() });
        if (this.predictionLog.length > 1000) this.predictionLog.shift();
      }
    }
  }

  predictNext(currentIntent: string, topK: number = 3): IntentPrediction[] {
    const followers = new Map<string, number>();
    let totalFollowers = 0;

    for (const seq of this.sequences) {
      for (let i = 0; i < seq.length - 1; i++) {
        if (seq[i] === currentIntent) {
          const next = seq[i + 1];
          followers.set(next, (followers.get(next) ?? 0) + 1);
          totalFollowers++;
        }
      }
    }

    if (totalFollowers === 0) return [];

    return [...followers.entries()]
      .map(([intent, count]) => ({
        intent,
        probability: count / totalFollowers,
        preloaded: this.preloaded.has(intent),
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, topK);
  }

  preload(intent: string, resource: unknown): void {
    this.preloaded.set(intent, resource);
  }

  getPreloaded(intent: string): unknown | undefined {
    return this.preloaded.get(intent);
  }

  evictPreloaded(intent: string): boolean {
    return this.preloaded.delete(intent);
  }

  autoPreload(currentIntent: string, loader: (intent: string) => unknown, threshold: number = 0.3): number {
    const predictions = this.predictNext(currentIntent);
    let loaded = 0;

    for (const pred of predictions) {
      if (pred.probability >= threshold && !pred.preloaded) {
        const resource = loader(pred.intent);
        this.preloaded.set(pred.intent, resource);
        loaded++;
      }
    }

    return loaded;
  }

  getPredictionAccuracy(windowMs: number = 300000): number {
    const cutoff = Date.now() - windowMs;
    const recent = this.predictionLog.filter(l => l.timestamp > cutoff);
    return recent.length > 0 ? recent.filter(l => l.correct).length / recent.length : 0;
  }

  getStats(): { sequences: number; preloadedResources: number; predictionAccuracy: number; totalPredictions: number; uniqueIntents: number } {
    const allIntents = new Set<string>();
    for (const seq of this.sequences) {
      for (const intent of seq) allIntents.add(intent);
    }
    return {
      sequences: this.sequences.length,
      preloadedResources: this.preloaded.size,
      predictionAccuracy: this.getPredictionAccuracy(),
      totalPredictions: this.predictionLog.length,
      uniqueIntents: allIntents.size,
    };
  }

  reset(): void {
    this.sequences = [];
    this.preloaded.clear();
    this.predictionLog = [];
  }
}
