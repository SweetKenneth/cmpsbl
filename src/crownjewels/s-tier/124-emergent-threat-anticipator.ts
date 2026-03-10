/**
 * S-Tier 124 — Emergent Threat Anticipator
 * ID: S-CJ82 | CJPI: 87 | Module: DEFENSE
 * 
 * Predictive threat modeling using emergent behavior pattern analysis.
 */

export interface ThreatSignal {
  id: string;
  source: string;
  type: string;
  intensity: number; // 0-1
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface EmergentThreat {
  id: string;
  name: string;
  signals: string[];
  probability: number;
  estimatedImpact: number; // 0-1
  timeToMaterialize: number; // ms
  mitigations: string[];
  status: 'anticipated' | 'emerging' | 'active' | 'mitigated';
}

export class EmergentThreatAnticipator {
  private signals: ThreatSignal[] = [];
  private threats: Map<string, EmergentThreat> = new Map();
  private patterns: Map<string, string[]> = new Map(); // pattern name → signal types

  registerPattern(name: string, signalTypes: string[]): void {
    this.patterns.set(name, signalTypes);
  }

  ingestSignal(signal: ThreatSignal): EmergentThreat | null {
    this.signals.push(signal);
    // Keep sliding window of 1000 signals
    if (this.signals.length > 1000) this.signals = this.signals.slice(-1000);

    // Check all patterns
    for (const [patternName, requiredTypes] of this.patterns) {
      const windowMs = 300000; // 5 min
      const cutoff = Date.now() - windowMs;
      const recentSignals = this.signals.filter(s => new Date(s.timestamp).getTime() > cutoff);
      
      const matchedTypes = new Set(recentSignals.map(s => s.type));
      const coverage = requiredTypes.filter(t => matchedTypes.has(t)).length / requiredTypes.length;

      if (coverage >= 0.7) {
        const avgIntensity = recentSignals
          .filter(s => requiredTypes.includes(s.type))
          .reduce((sum, s) => sum + s.intensity, 0) / Math.max(recentSignals.length, 1);

        const threat: EmergentThreat = {
          id: crypto.randomUUID(),
          name: patternName,
          signals: recentSignals.filter(s => requiredTypes.includes(s.type)).map(s => s.id),
          probability: coverage * avgIntensity,
          estimatedImpact: avgIntensity,
          timeToMaterialize: Math.max(60000, (1 - avgIntensity) * 600000),
          mitigations: [`Isolate ${patternName} attack surface`, `Increase monitoring on affected nodes`],
          status: coverage >= 0.9 ? 'emerging' : 'anticipated',
        };
        this.threats.set(threat.id, threat);
        return threat;
      }
    }
    return null;
  }

  getActiveThreats(): EmergentThreat[] {
    return [...this.threats.values()].filter(t => t.status !== 'mitigated');
  }

  mitigate(threatId: string): boolean {
    const threat = this.threats.get(threatId);
    if (!threat) return false;
    threat.status = 'mitigated';
    return true;
  }
}
