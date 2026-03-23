/**
 * IMMUNITY Ultimate — Immune Strength Profiler
 * 
 * Comprehensive per-node immune fitness assessment — like a blood panel.
 * - Coverage score: % of known threats with active antibodies
 * - Response latency P95
 * - False positive rate tracking
 * - Vaccination gaps per node
 * - Composite Immune Strength Index (ISI): 0–100
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface NodeImmuneProfile {
  nodeId: string;
  coverageScore: number;        // 0–1
  responseLatencyP95Ms: number;
  falsePositiveRate: number;    // 0–1
  vaccinationGaps: string[];    // threat families not covered
  isi: number;                  // Immune Strength Index 0–100
  assessedAt: number;
}

export interface SystemImmuneProfile {
  overallISI: number;
  nodeProfiles: NodeImmuneProfile[];
  weakestNodes: string[];
  criticalGaps: string[];       // threat families with lowest coverage
  assessedAt: number;
}

export interface ISIWeights {
  coverage: number;
  latency: number;
  falsePositive: number;
  vaccination: number;
}

export interface StrengthProfilerHealth {
  profiledNodes: number;
  avgISI: number;
  minISI: number;
  maxISI: number;
  assessmentCount: number;
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const DEFAULT_WEIGHTS: ISIWeights = {
  coverage: 0.35,
  latency: 0.20,
  falsePositive: 0.25,
  vaccination: 0.20,
};

const nodeProfiles = new Map<string, NodeImmuneProfile>();
const latencySamples = new Map<string, number[]>();  // nodeId → latency samples
const falsePositiveCounts = new Map<string, { fp: number; total: number }>();
let assessmentCount = 0;

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Record a response latency sample */
export function recordLatency(nodeId: string, latencyMs: number): void {
  const samples = latencySamples.get(nodeId) ?? [];
  samples.push(latencyMs);
  if (samples.length > 100) samples.shift();
  latencySamples.set(nodeId, samples);
}

/** Record a detection result (for false positive tracking) */
export function recordDetection(nodeId: string, isFalsePositive: boolean): void {
  const counts = falsePositiveCounts.get(nodeId) ?? { fp: 0, total: 0 };
  counts.total++;
  if (isFalsePositive) counts.fp++;
  falsePositiveCounts.set(nodeId, counts);
}

/** Calculate P95 latency from samples */
function calculateP95(samples: number[]): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, idx)];
}

/** Compute Immune Strength Index for a node */
export function assessNode(
  nodeId: string,
  antibodyCoverage: number,       // 0–1: fraction of known families with antibodies
  vaccinatedFamilies: string[],
  allKnownFamilies: string[],
  weights = DEFAULT_WEIGHTS,
): NodeImmuneProfile {
  const samples = latencySamples.get(nodeId) ?? [];
  const p95 = calculateP95(samples);
  const fpData = falsePositiveCounts.get(nodeId) ?? { fp: 0, total: 0 };
  const fpRate = fpData.total > 0 ? fpData.fp / fpData.total : 0;

  const vaccinationGaps = allKnownFamilies.filter(f => !vaccinatedFamilies.includes(f));
  const vaccinationRate = allKnownFamilies.length > 0
    ? vaccinatedFamilies.length / allKnownFamilies.length
    : 1;

  // Normalize latency (target <100ms = 1.0, >2000ms = 0)
  const latencyScore = Math.max(0, Math.min(1, 1 - (p95 / 2000)));
  // False positive: lower is better
  const fpScore = Math.max(0, 1 - fpRate * 5); // 20% fp = 0 score

  const isi = Math.round(
    (weights.coverage * antibodyCoverage +
     weights.latency * latencyScore +
     weights.falsePositive * fpScore +
     weights.vaccination * vaccinationRate) * 100
  );

  const profile: NodeImmuneProfile = {
    nodeId,
    coverageScore: Math.round(antibodyCoverage * 100) / 100,
    responseLatencyP95Ms: Math.round(p95),
    falsePositiveRate: Math.round(fpRate * 1000) / 1000,
    vaccinationGaps,
    isi: Math.max(0, Math.min(100, isi)),
    assessedAt: Date.now(),
  };

  nodeProfiles.set(nodeId, profile);
  assessmentCount++;
  return profile;
}

/** Perform system-wide immune assessment */
export function assessSystem(allKnownFamilies: string[]): SystemImmuneProfile {
  const profiles = Array.from(nodeProfiles.values());
  const avgISI = profiles.length > 0
    ? Math.round(profiles.reduce((s, p) => s + p.isi, 0) / profiles.length)
    : 0;

  // Find weakest nodes (ISI < 50)
  const weakest = profiles.filter(p => p.isi < 50).map(p => p.nodeId);

  // Find critical gaps (families with lowest coverage)
  const familyGapCounts = new Map<string, number>();
  for (const p of profiles) {
    for (const gap of p.vaccinationGaps) {
      familyGapCounts.set(gap, (familyGapCounts.get(gap) ?? 0) + 1);
    }
  }
  const criticalGaps = Array.from(familyGapCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  return {
    overallISI: avgISI,
    nodeProfiles: profiles,
    weakestNodes: weakest,
    criticalGaps,
    assessedAt: Date.now(),
  };
}

/** Get profiler health */
export function getStrengthProfilerHealth(): StrengthProfilerHealth {
  const profiles = Array.from(nodeProfiles.values());
  const isis = profiles.map(p => p.isi);
  return {
    profiledNodes: profiles.length,
    avgISI: isis.length > 0 ? Math.round(isis.reduce((a, b) => a + b, 0) / isis.length) : 0,
    minISI: isis.length > 0 ? Math.min(...isis) : 0,
    maxISI: isis.length > 0 ? Math.max(...isis) : 0,
    assessmentCount,
  };
}
