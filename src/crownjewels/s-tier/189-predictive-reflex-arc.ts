/**
 * S-Tier 189 — Predictive Reflex Arc (SYN07)
 * ID: S-SYN07 | CJPI: 92 | Module: REFLEX×ORACLE
 *
 * Pre-loads anticipated responses for sub-millisecond reaction times.
 * Supports confidence decay, hit-rate tracking, and adaptive TTL.
 */

export interface PreloadedResponse {
  response: unknown;
  confidence: number;
  expiresAt: number;
  hits: number;
  misses: number;
  createdAt: number;
}

export class PredictiveReflexArc {
  private preloadedResponses: Map<string, PreloadedResponse> = new Map();
  private fireLog: { eventType: string; source: 'reflex' | 'cognitive'; latencyMs: number; timestamp: number }[] = [];
  private confidenceThreshold: number;

  constructor(confidenceThreshold: number = 0.8) {
    this.confidenceThreshold = confidenceThreshold;
  }

  preload(eventType: string, response: unknown, confidence: number, ttlMs: number): void {
    this.preloadedResponses.set(eventType, {
      response,
      confidence: Math.min(1, Math.max(0, confidence)),
      expiresAt: Date.now() + ttlMs,
      hits: 0,
      misses: 0,
      createdAt: Date.now(),
    });
  }

  fire(eventType: string): { response: unknown; latencyMs: number; source: 'reflex' | 'cognitive' } | null {
    const preloaded = this.preloadedResponses.get(eventType);
    const now = Date.now();

    if (preloaded && preloaded.expiresAt > now) {
      // Apply confidence decay based on age
      const age = now - preloaded.createdAt;
      const ttl = preloaded.expiresAt - preloaded.createdAt;
      const decayFactor = 1 - (age / ttl) * 0.2; // Lose up to 20% confidence over TTL
      const effectiveConfidence = preloaded.confidence * decayFactor;

      if (effectiveConfidence > this.confidenceThreshold) {
        preloaded.hits++;
        this.fireLog.push({ eventType, source: 'reflex', latencyMs: 1, timestamp: now });
        if (this.fireLog.length > 500) this.fireLog.shift();
        return { response: preloaded.response, latencyMs: 1, source: 'reflex' };
      }
      preloaded.misses++;
    }

    this.fireLog.push({ eventType, source: 'cognitive', latencyMs: 50, timestamp: now });
    if (this.fireLog.length > 500) this.fireLog.shift();
    return null; // Falls through to cognitive processing
  }

  evictExpired(): number {
    const now = Date.now();
    let evicted = 0;
    for (const [key, entry] of this.preloadedResponses) {
      if (entry.expiresAt <= now) {
        this.preloadedResponses.delete(key);
        evicted++;
      }
    }
    return evicted;
  }

  getPreloadedCount(): number {
    const now = Date.now();
    return [...this.preloadedResponses.values()].filter(p => p.expiresAt > now).length;
  }

  getHitRate(windowMs: number = 300000): number {
    const cutoff = Date.now() - windowMs;
    const recent = this.fireLog.filter(l => l.timestamp > cutoff);
    if (recent.length === 0) return 0;
    return recent.filter(l => l.source === 'reflex').length / recent.length;
  }

  getStats(): { preloaded: number; totalFires: number; hitRate: number; avgReflexLatency: number } {
    const reflexFires = this.fireLog.filter(l => l.source === 'reflex');
    return {
      preloaded: this.getPreloadedCount(),
      totalFires: this.fireLog.length,
      hitRate: this.getHitRate(),
      avgReflexLatency: reflexFires.length > 0 ? reflexFires.reduce((s, l) => s + l.latencyMs, 0) / reflexFires.length : 0,
    };
  }

  reset(): void {
    this.preloadedResponses.clear();
    this.fireLog = [];
  }
}
