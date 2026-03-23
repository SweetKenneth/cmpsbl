/**
 * SHADOW Ultimate — Behavioral Fingerprinter
 * Captures the behavioral signature of any execution.
 * Compares fingerprints across versions to detect subtle behavioral shifts.
 */

export interface BehavioralFingerprint {
  id: string;
  sessionId: string;
  version: string;
  outputDistribution: number[];    // histogram buckets
  timingProfile: { p50: number; p90: number; p99: number; mean: number };
  errorPattern: { totalErrors: number; uniqueErrors: number; topError: string };
  resourceCurve: number[];         // resource usage over time samples
  hash: string;                    // fingerprint hash for quick comparison
  capturedAt: number;
}

export interface FingerprintComparison {
  fingerprintA: string;
  fingerprintB: string;
  similarity: number;          // 0–1
  driftDetected: boolean;
  driftDimensions: string[];
  comparedAt: number;
}

export interface FingerprintStats {
  totalFingerprints: number;
  totalComparisons: number;
  avgSimilarity: number;
  driftDetections: number;
}

const MAX_FINGERPRINTS = 500;
const MAX_COMPARISONS = 300;
const DRIFT_THRESHOLD = 0.15;

const fingerprints = new Map<string, BehavioralFingerprint>();
const comparisons: FingerprintComparison[] = [];

function fnvHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function captureFingerprint(
  sessionId: string, version: string,
  outputs: number[], timings: number[], errors: string[], resourceSamples: number[]
): BehavioralFingerprint {
  // Output distribution histogram (10 buckets)
  const outputDist = new Array(10).fill(0);
  if (outputs.length > 0) {
    const min = Math.min(...outputs);
    const max = Math.max(...outputs);
    const range = max - min || 1;
    for (const v of outputs) {
      const bucket = Math.min(9, Math.floor(((v - min) / range) * 10));
      outputDist[bucket]++;
    }
    for (let i = 0; i < 10; i++) outputDist[i] /= outputs.length;
  }

  // Timing profile
  const sorted = [...timings].sort((a, b) => a - b);
  const timingProfile = {
    p50: sorted[Math.floor(sorted.length * 0.5)] ?? 0,
    p90: sorted[Math.floor(sorted.length * 0.9)] ?? 0,
    p99: sorted[Math.floor(sorted.length * 0.99)] ?? 0,
    mean: timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 0,
  };

  // Error pattern
  const uniqueErrors = new Set(errors);
  const errorCounts = new Map<string, number>();
  for (const e of errors) errorCounts.set(e, (errorCounts.get(e) ?? 0) + 1);
  const topError = [...errorCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';

  const hashInput = `${outputDist.join(',')}|${timingProfile.mean}|${errors.length}|${resourceSamples.length}`;
  const fp: BehavioralFingerprint = {
    id: `fp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sessionId, version, outputDistribution: outputDist,
    timingProfile, errorPattern: { totalErrors: errors.length, uniqueErrors: uniqueErrors.size, topError },
    resourceCurve: resourceSamples.slice(0, 50),
    hash: fnvHash(hashInput), capturedAt: Date.now(),
  };

  if (fingerprints.size >= MAX_FINGERPRINTS) {
    const oldest = [...fingerprints.values()].sort((a, b) => a.capturedAt - b.capturedAt)[0];
    if (oldest) fingerprints.delete(oldest.id);
  }
  fingerprints.set(fp.id, fp);
  return fp;
}

export function compareFingerprints(fpIdA: string, fpIdB: string): FingerprintComparison | null {
  const a = fingerprints.get(fpIdA);
  const b = fingerprints.get(fpIdB);
  if (!a || !b) return null;

  const driftDims: string[] = [];

  // Output distribution similarity (cosine)
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < 10; i++) {
    dot += a.outputDistribution[i] * b.outputDistribution[i];
    magA += a.outputDistribution[i] ** 2;
    magB += b.outputDistribution[i] ** 2;
  }
  const outputSim = (Math.sqrt(magA) * Math.sqrt(magB)) > 0 ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 1;
  if (1 - outputSim > DRIFT_THRESHOLD) driftDims.push('output_distribution');

  // Timing similarity
  const maxMean = Math.max(a.timingProfile.mean, b.timingProfile.mean, 1);
  const timingSim = 1 - Math.abs(a.timingProfile.mean - b.timingProfile.mean) / maxMean;
  if (1 - timingSim > DRIFT_THRESHOLD) driftDims.push('timing_profile');

  // Error similarity
  const maxErrors = Math.max(a.errorPattern.totalErrors, b.errorPattern.totalErrors, 1);
  const errorSim = 1 - Math.abs(a.errorPattern.totalErrors - b.errorPattern.totalErrors) / maxErrors;
  if (1 - errorSim > DRIFT_THRESHOLD) driftDims.push('error_pattern');

  const similarity = outputSim * 0.5 + timingSim * 0.3 + errorSim * 0.2;

  const comp: FingerprintComparison = {
    fingerprintA: fpIdA, fingerprintB: fpIdB,
    similarity, driftDetected: driftDims.length > 0,
    driftDimensions: driftDims, comparedAt: Date.now(),
  };
  if (comparisons.length >= MAX_COMPARISONS) comparisons.shift();
  comparisons.push(comp);
  return comp;
}

export function getFingerprintStats(): FingerprintStats {
  return {
    totalFingerprints: fingerprints.size,
    totalComparisons: comparisons.length,
    avgSimilarity: comparisons.length > 0 ? comparisons.reduce((s, c) => s + c.similarity, 0) / comparisons.length : 1,
    driftDetections: comparisons.filter(c => c.driftDetected).length,
  };
}

export function resetFingerprintState(): void { fingerprints.clear(); comparisons.length = 0; }
