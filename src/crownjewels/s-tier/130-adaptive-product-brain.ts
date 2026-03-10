/**
 * S-Tier 130 — Adaptive Product Brain
 * ID: S-CJ88 | CJPI: 87 | Module: BRAIN
 * 
 * Product intelligence that adapts recommendations based on usage patterns.
 */

export interface UsageSignal {
  featureId: string;
  userId: string;
  action: 'view' | 'use' | 'complete' | 'abandon' | 'error';
  timestamp: string;
  durationMs?: number;
}

export interface ProductRecommendation {
  featureId: string;
  score: number;
  reasoning: string;
  predictedEngagement: number;
}

export class AdaptiveProductBrain {
  private signals: Map<string, UsageSignal[]> = new Map();
  private featureScores: Map<string, number> = new Map();

  ingest(signal: UsageSignal): void {
    const key = `${signal.userId}:${signal.featureId}`;
    const existing = this.signals.get(key) || [];
    existing.push(signal);
    if (existing.length > 100) existing.splice(0, existing.length - 100);
    this.signals.set(key, existing);
    this.updateScore(signal.featureId);
  }

  private updateScore(featureId: string): void {
    let total = 0, count = 0;
    for (const [key, signals] of this.signals) {
      if (!key.endsWith(`:${featureId}`)) continue;
      for (const s of signals) {
        count++;
        switch (s.action) {
          case 'complete': total += 1.0; break;
          case 'use': total += 0.7; break;
          case 'view': total += 0.3; break;
          case 'abandon': total -= 0.5; break;
          case 'error': total -= 0.8; break;
        }
      }
    }
    this.featureScores.set(featureId, count > 0 ? total / count : 0);
  }

  recommend(userId: string, topN = 5): ProductRecommendation[] {
    const userFeatures = new Set<string>();
    for (const [key] of this.signals) {
      if (key.startsWith(`${userId}:`)) {
        userFeatures.add(key.split(':')[1]);
      }
    }

    const recommendations: ProductRecommendation[] = [];
    for (const [featureId, score] of this.featureScores) {
      if (userFeatures.has(featureId)) continue; // Already using
      if (score <= 0) continue;
      recommendations.push({
        featureId,
        score,
        reasoning: `High engagement score (${score.toFixed(2)}) from similar users`,
        predictedEngagement: Math.min(1, score),
      });
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, topN);
  }

  getFeatureHealth(): Record<string, number> {
    return Object.fromEntries(this.featureScores);
  }
}
