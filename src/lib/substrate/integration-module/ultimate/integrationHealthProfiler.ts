/**
 * Integration Health Profiler
 * 
 * Comprehensive per-integration health assessment including availability,
 * latency profiling, error taxonomy, cost tracking, and dependency risk scoring.
 * 
 * @module integration/ultimate/integrationHealthProfiler
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export interface IntegrationProfile {
  integrationId: string;
  displayName: string;
  availability7d: number;         // 0–1 rolling 7-day uptime
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  errorRate: number;              // 0–1
  errorTaxonomy: Record<string, number>; // error category → count
  costPerCallCents: number;
  totalCostCents: number;
  totalCalls: number;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  dependencyRiskScore: number;    // 0–100 composite
  slaTarget: number | null;       // e.g. 0.999
  slaCompliant: boolean;
  lastCheckedAt: number;
}

interface LatencySample {
  ms: number;
  timestamp: number;
  success: boolean;
  errorCategory?: string;
}

// ── State ──────────────────────────────────────────────────────

const profiles = new Map<string, IntegrationProfile>();
const samples = new Map<string, LatencySample[]>();
const MAX_SAMPLES = 1000;

// ── Core ───────────────────────────────────────────────────────

/** Initialize or get a profile */
export function getOrCreateProfile(integrationId: string, displayName: string, criticality: IntegrationProfile['criticality'] = 'medium'): IntegrationProfile {
  let profile = profiles.get(integrationId);
  if (!profile) {
    profile = {
      integrationId, displayName, criticality,
      availability7d: 1.0,
      latencyP50Ms: 0, latencyP95Ms: 0, latencyP99Ms: 0,
      errorRate: 0, errorTaxonomy: {},
      costPerCallCents: 0, totalCostCents: 0, totalCalls: 0,
      dependencyRiskScore: 0, slaTarget: null, slaCompliant: true,
      lastCheckedAt: Date.now(),
    };
    profiles.set(integrationId, profile);
    samples.set(integrationId, []);
  }
  return profile;
}

/** Record a call result */
export function recordCall(
  integrationId: string,
  latencyMs: number,
  success: boolean,
  costCents: number = 0,
  errorCategory?: string,
): void {
  const profile = profiles.get(integrationId);
  if (!profile) return;

  const sampleList = samples.get(integrationId) ?? [];
  sampleList.push({ ms: latencyMs, timestamp: Date.now(), success, errorCategory });
  if (sampleList.length > MAX_SAMPLES) sampleList.shift();
  samples.set(integrationId, sampleList);

  profile.totalCalls++;
  profile.totalCostCents += costCents;
  profile.costPerCallCents = profile.totalCalls > 0 ? profile.totalCostCents / profile.totalCalls : 0;

  if (errorCategory) {
    profile.errorTaxonomy[errorCategory] = (profile.errorTaxonomy[errorCategory] ?? 0) + 1;
  }

  // Recompute stats from samples
  recomputeStats(integrationId, sampleList, profile);
}

function recomputeStats(integrationId: string, sampleList: LatencySample[], profile: IntegrationProfile): void {
  if (sampleList.length === 0) return;

  // Availability (7 day window)
  const sevenDaysAgo = Date.now() - 7 * 86_400_000;
  const recentSamples = sampleList.filter(s => s.timestamp >= sevenDaysAgo);
  const successCount = recentSamples.filter(s => s.success).length;
  profile.availability7d = recentSamples.length > 0 ? successCount / recentSamples.length : 1.0;

  // Error rate
  profile.errorRate = recentSamples.length > 0 ? 1 - (successCount / recentSamples.length) : 0;

  // Latency percentiles
  const latencies = recentSamples.filter(s => s.success).map(s => s.ms).sort((a, b) => a - b);
  if (latencies.length > 0) {
    profile.latencyP50Ms = percentile(latencies, 0.50);
    profile.latencyP95Ms = percentile(latencies, 0.95);
    profile.latencyP99Ms = percentile(latencies, 0.99);
  }

  // Dependency risk score (composite)
  const availabilityRisk = (1 - profile.availability7d) * 40;
  const latencyRisk = Math.min(30, profile.latencyP95Ms / 100);
  const errorRisk = profile.errorRate * 20;
  const criticalityMultiplier = profile.criticality === 'critical' ? 1.5 :
    profile.criticality === 'high' ? 1.2 : profile.criticality === 'medium' ? 1.0 : 0.7;
  profile.dependencyRiskScore = Math.min(100, Math.round((availabilityRisk + latencyRisk + errorRisk) * criticalityMultiplier));

  // SLA compliance
  if (profile.slaTarget !== null) {
    profile.slaCompliant = profile.availability7d >= profile.slaTarget;
  }

  profile.lastCheckedAt = Date.now();
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil(sorted.length * p) - 1;
  return sorted[Math.max(0, idx)];
}

/** Set SLA target for an integration */
export function setSlaTarget(integrationId: string, target: number): void {
  const profile = profiles.get(integrationId);
  if (profile) {
    profile.slaTarget = target;
    profile.slaCompliant = profile.availability7d >= target;
  }
}

/** Get all profiles sorted by risk */
export function getProfilesByRisk(): IntegrationProfile[] {
  return Array.from(profiles.values()).sort((a, b) => b.dependencyRiskScore - a.dependencyRiskScore);
}

export function getProfile(integrationId: string): IntegrationProfile | undefined {
  return profiles.get(integrationId);
}

export function getHealthProfilerSummary() {
  const all = Array.from(profiles.values());
  return {
    totalIntegrations: all.length,
    avgAvailability: all.length > 0 ? all.reduce((s, p) => s + p.availability7d, 0) / all.length : 1,
    highRiskCount: all.filter(p => p.dependencyRiskScore > 60).length,
    slaViolations: all.filter(p => !p.slaCompliant && p.slaTarget !== null).length,
    totalCostCents: all.reduce((s, p) => s + p.totalCostCents, 0),
  };
}

export function resetHealthProfiler(): void {
  profiles.clear();
  samples.clear();
}
