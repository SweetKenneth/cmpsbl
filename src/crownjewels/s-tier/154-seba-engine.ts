/**
 * S-Tier 154 — SEBA Engine
 * ID: S-CJ112 | CJPI: 85 | Module: ENCODE
 * Semantic encoding and behavioral analysis engine.
 */

export interface EncodingStage {
  id: string;
  name: string;
  transform: (input: string) => string;
  order: number;
}

export interface BehavioralSignal {
  id: string;
  type: string;
  value: number;
  timestamp: number;
  source: string;
}

export class SEBAEngine {
  private stages: EncodingStage[] = [];
  private signals: BehavioralSignal[] = [];

  addStage(stage: EncodingStage): void {
    this.stages.push(stage);
    this.stages.sort((a, b) => a.order - b.order);
  }

  encode(input: string): string {
    let result = input;
    for (const stage of this.stages) {
      result = stage.transform(result);
    }
    return result;
  }

  recordSignal(type: string, value: number, source: string): void {
    this.signals.push({
      id: crypto.randomUUID(), type, value, timestamp: Date.now(), source,
    });
    if (this.signals.length > 1000) this.signals = this.signals.slice(-1000);
  }

  analyzeBehavior(type: string, windowMs: number = 60000): { avg: number; trend: 'up' | 'down' | 'stable'; count: number } {
    const cutoff = Date.now() - windowMs;
    const recent = this.signals.filter(s => s.type === type && s.timestamp > cutoff);
    if (recent.length === 0) return { avg: 0, trend: 'stable', count: 0 };
    const avg = recent.reduce((s, r) => s + r.value, 0) / recent.length;
    const mid = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, mid);
    const secondHalf = recent.slice(mid);
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((s, r) => s + r.value, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((s, r) => s + r.value, 0) / secondHalf.length : 0;
    const trend = secondAvg > firstAvg * 1.1 ? 'up' : secondAvg < firstAvg * 0.9 ? 'down' : 'stable';
    return { avg, trend, count: recent.length };
  }
}
