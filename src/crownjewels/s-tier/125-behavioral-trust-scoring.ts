/**
 * S-Tier 125 — Behavioral Trust Scoring
 * ID: S-CJ83 | CJPI: 87 | Module: IDENTITY
 * 
 * Continuous trust scoring based on behavioral analysis patterns.
 */

export interface BehaviorEvent {
  userId: string;
  action: string;
  timestamp: string;
  risk: number; // 0-1
  context: Record<string, unknown>;
}

export interface TrustProfile {
  userId: string;
  score: number; // 0-100
  trend: 'rising' | 'stable' | 'declining';
  riskFactors: string[];
  lastUpdated: string;
  eventCount: number;
}

export class BehavioralTrustScoring {
  private profiles: Map<string, TrustProfile> = new Map();
  private events: Map<string, BehaviorEvent[]> = new Map();

  recordEvent(event: BehaviorEvent): TrustProfile {
    const events = this.events.get(event.userId) || [];
    events.push(event);
    if (events.length > 500) events.splice(0, events.length - 500);
    this.events.set(event.userId, events);
    return this.recalculate(event.userId);
  }

  private recalculate(userId: string): TrustProfile {
    const events = this.events.get(userId) || [];
    const prev = this.profiles.get(userId);
    const prevScore = prev?.score ?? 75;

    // Weighted average of recent event risks (more recent = higher weight)
    let weightedRisk = 0, totalWeight = 0;
    const now = Date.now();
    for (const e of events) {
      const age = now - new Date(e.timestamp).getTime();
      const weight = Math.exp(-age / 86400000); // decay over 1 day
      weightedRisk += e.risk * weight;
      totalWeight += weight;
    }
    const avgRisk = totalWeight > 0 ? weightedRisk / totalWeight : 0;
    const score = Math.max(0, Math.min(100, 100 - avgRisk * 100));

    const riskFactors: string[] = [];
    const highRiskEvents = events.filter(e => e.risk > 0.7);
    if (highRiskEvents.length > 3) riskFactors.push('Repeated high-risk actions');
    if (score < 30) riskFactors.push('Trust score critically low');

    const trend = score > prevScore + 2 ? 'rising' : score < prevScore - 2 ? 'declining' : 'stable';

    const profile: TrustProfile = {
      userId, score, trend, riskFactors,
      lastUpdated: new Date().toISOString(),
      eventCount: events.length,
    };
    this.profiles.set(userId, profile);
    return profile;
  }

  getProfile(userId: string): TrustProfile | null {
    return this.profiles.get(userId) || null;
  }

  isAboveThreshold(userId: string, threshold: number): boolean {
    const profile = this.profiles.get(userId);
    return profile ? profile.score >= threshold : false;
  }
}
