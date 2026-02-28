/**
 * EVOLUTION — Confidence Decay (#38)
 * Stale fixes lose trust over time. If a fix hasn't been
 * re-verified recently, its confidence decays, eventually
 * triggering re-scan of the affected area.
 */

export interface DecayProfile {
  findingId: string;
  fixAppliedAt: string;
  lastVerifiedAt: string;
  originalConfidence: number;
  currentConfidence: number;
  decayRate: number; // per day
  ageInDays: number;
  status: 'fresh' | 'aging' | 'stale' | 'expired';
  rescanRecommended: boolean;
}

export interface DecayReport {
  profiles: DecayProfile[];
  freshCount: number;
  stalCount: number;
  expiredCount: number;
  rescanNeeded: string[]; // findingIds
  avgConfidence: number;
  generatedAt: string;
}

interface FixRecord {
  findingId: string;
  fixAppliedAt: string;
  lastVerifiedAt: string;
  originalConfidence: number;
  category: string;
}

/**
 * Calculate confidence decay for all fixed findings
 */
export function calculateDecay(
  fixes: FixRecord[],
  now = new Date(),
): DecayReport {
  const profiles: DecayProfile[] = fixes.map(fix => {
    const ageMs = now.getTime() - new Date(fix.lastVerifiedAt).getTime();
    const ageInDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));

    // Category-specific decay rates (per day)
    const decayRate = getDecayRate(fix.category);
    const decay = 1 - (decayRate * ageInDays);
    const currentConfidence = Math.max(0, Math.round(fix.originalConfidence * Math.max(0, decay) * 100) / 100);

    const status: DecayProfile['status'] =
      currentConfidence >= fix.originalConfidence * 0.8 ? 'fresh' :
      currentConfidence >= fix.originalConfidence * 0.5 ? 'aging' :
      currentConfidence > 0 ? 'stale' : 'expired';

    return {
      findingId: fix.findingId,
      fixAppliedAt: fix.fixAppliedAt,
      lastVerifiedAt: fix.lastVerifiedAt,
      originalConfidence: fix.originalConfidence,
      currentConfidence,
      decayRate,
      ageInDays: Math.round(ageInDays),
      status,
      rescanRecommended: status === 'stale' || status === 'expired',
    };
  });

  return {
    profiles,
    freshCount: profiles.filter(p => p.status === 'fresh').length,
    stalCount: profiles.filter(p => p.status === 'stale').length,
    expiredCount: profiles.filter(p => p.status === 'expired').length,
    rescanNeeded: profiles.filter(p => p.rescanRecommended).map(p => p.findingId),
    avgConfidence: profiles.length > 0 ? Math.round(profiles.reduce((s, p) => s + p.currentConfidence, 0) / profiles.length * 100) / 100 : 0,
    generatedAt: now.toISOString(),
  };
}

function getDecayRate(category: string): number {
  // Security fixes decay faster (threat landscape changes)
  const rates: Record<string, number> = {
    security: 0.03,      // loses 3% per day → stale in ~17 days
    rls_policy: 0.025,
    performance: 0.02,
    migration: 0.01,     // schema fixes are durable
    accessibility: 0.015,
    config_drift: 0.02,
    dead_code: 0.005,    // dead code removal is very stable
  };
  return rates[category] ?? 0.015;
}
