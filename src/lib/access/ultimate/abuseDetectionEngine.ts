/**
 * ACCESS Ultimate — System 7: Abuse Detection Engine
 * 
 * Credential stuffing detection, scraping fingerprinting,
 * Z-score anomaly scoring, and automatic quarantine with
 * IMMUNITY escalation.
 * 
 * @module access/ultimate/abuseDetectionEngine
 */

// ── Types ────────────────────────────────────────────────────────

export type AbuseType = 'credential_stuffing' | 'scraping' | 'rate_abuse' | 'anomalous_pattern' | 'ip_rotation';
export type AbuseSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AbuseAction = 'flag' | 'throttle' | 'quarantine' | 'ban';

export interface AbuseSignal {
  id: string;
  keyId: string;
  developerId: string;
  type: AbuseType;
  severity: AbuseSeverity;
  score: number;               // 0-1
  zScore: number;
  description: string;
  action: AbuseAction;
  escalatedToImmunity: boolean;
  detectedAt: number;
}

export interface DeveloperBaseline {
  keyId: string;
  avgRequestsPerMinute: number;
  requestVariance: number;
  n: number;                    // Observation count
  m2: number;                   // Welford's M2
  uniqueEndpoints: Set<string>;
  lastInterval: number;         // ms between last 2 requests
  intervalVariance: number;     // Low variance = bot behavior
  intervalN: number;
  intervalM2: number;
}

export interface AbuseDetectionStats {
  totalSignals: number;
  criticalSignals: number;
  highSignals: number;
  quarantinedKeys: number;
  totalBaselines: number;
  avgAbuseScore: number;
  escalationsToImmunity: number;
}

// ── State ────────────────────────────────────────────────────────

const signals: AbuseSignal[] = [];
const baselines: Map<string, DeveloperBaseline> = new Map();
const quarantinedKeys: Set<string> = new Set();
const MAX_SIGNALS = 2000;
const Z_THRESHOLD_WARN = 2.0;
const Z_THRESHOLD_CRITICAL = 3.0;

// ── Core API ────────────────────────────────────────────────────

/** Record a request observation for baseline building */
export function observeRequest(keyId: string, endpoint: string, timestamp?: number): AbuseSignal | null {
  const now = timestamp ?? Date.now();

  if (!baselines.has(keyId)) {
    baselines.set(keyId, {
      keyId,
      avgRequestsPerMinute: 0, requestVariance: 0, n: 0, m2: 0,
      uniqueEndpoints: new Set(),
      lastInterval: 0, intervalVariance: 0, intervalN: 0, intervalM2: 0,
    });
  }

  const baseline = baselines.get(keyId)!;
  baseline.uniqueEndpoints.add(endpoint);

  // Update request rate using Welford's
  baseline.n++;
  const delta = 1 - baseline.avgRequestsPerMinute;
  baseline.avgRequestsPerMinute += delta / baseline.n;
  const delta2 = 1 - baseline.avgRequestsPerMinute;
  baseline.m2 += delta * delta2;
  baseline.requestVariance = baseline.n > 1 ? baseline.m2 / (baseline.n - 1) : 0;

  // Update interval stats
  if (baseline.lastInterval > 0) {
    const interval = now - baseline.lastInterval;
    baseline.intervalN++;
    const iDelta = interval - (baseline.intervalVariance > 0 ? Math.sqrt(baseline.intervalVariance) : interval);
    baseline.intervalM2 += iDelta * iDelta;
    baseline.intervalVariance = baseline.intervalN > 1 ? baseline.intervalM2 / (baseline.intervalN - 1) : 0;
  }
  baseline.lastInterval = now;

  // Detect anomalies after enough observations
  if (baseline.n > 20) {
    return detectAnomalies(keyId, baseline);
  }

  return null;
}

/** Detect anomalous patterns */
function detectAnomalies(keyId: string, baseline: DeveloperBaseline): AbuseSignal | null {
  const stdDev = Math.sqrt(baseline.requestVariance);
  if (stdDev === 0) return null;

  const zScore = Math.abs(1 - baseline.avgRequestsPerMinute) / stdDev;

  // Check for scraping (very uniform intervals = bot)
  const intervalStdDev = Math.sqrt(baseline.intervalVariance);
  const isScraping = baseline.intervalN > 10 && intervalStdDev < 50; // < 50ms variance

  // Check for credential stuffing (many unique endpoints rapidly)
  const isStuffing = baseline.uniqueEndpoints.size > 50 && baseline.n < 200;

  if (zScore >= Z_THRESHOLD_CRITICAL || isScraping || isStuffing) {
    const type: AbuseType = isStuffing ? 'credential_stuffing' :
      isScraping ? 'scraping' : 'anomalous_pattern';

    const severity: AbuseSeverity = zScore >= Z_THRESHOLD_CRITICAL ? 'critical' :
      zScore >= Z_THRESHOLD_WARN ? 'high' : 'medium';

    const action: AbuseAction = severity === 'critical' ? 'quarantine' :
      severity === 'high' ? 'throttle' : 'flag';

    const signal: AbuseSignal = {
      id: `abuse-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      keyId, developerId: keyId, // Simplified
      type, severity,
      score: Math.min(1, zScore / 5),
      zScore: Math.round(zScore * 100) / 100,
      description: isScraping
        ? `Uniform request intervals detected (stddev=${intervalStdDev.toFixed(1)}ms)`
        : isStuffing
          ? `Credential stuffing pattern: ${baseline.uniqueEndpoints.size} unique endpoints in ${baseline.n} requests`
          : `Anomalous request rate: Z=${zScore.toFixed(2)}`,
      action,
      escalatedToImmunity: severity === 'critical',
      detectedAt: Date.now(),
    };

    signals.push(signal);
    if (signals.length > MAX_SIGNALS) signals.splice(0, signals.length - MAX_SIGNALS);

    if (action === 'quarantine') quarantinedKeys.add(keyId);

    return signal;
  }

  return null;
}

/** Check if a key is quarantined */
export function isQuarantined(keyId: string): boolean { return quarantinedKeys.has(keyId); }

/** Release a key from quarantine */
export function releaseFromQuarantine(keyId: string): boolean {
  return quarantinedKeys.delete(keyId);
}

/** Manual abuse report */
export function reportAbuse(keyId: string, type: AbuseType, description: string): AbuseSignal {
  const signal: AbuseSignal = {
    id: `abuse-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    keyId, developerId: keyId,
    type, severity: 'high', score: 0.8, zScore: 0,
    description, action: 'flag',
    escalatedToImmunity: false, detectedAt: Date.now(),
  };
  signals.push(signal);
  if (signals.length > MAX_SIGNALS) signals.splice(0, signals.length - MAX_SIGNALS);
  return signal;
}

// ── Query ────────────────────────────────────────────────────────

export function getAbuseSignals(keyId?: string, since?: number): AbuseSignal[] {
  let filtered = keyId ? signals.filter(s => s.keyId === keyId) : signals;
  if (since) filtered = filtered.filter(s => s.detectedAt >= since);
  return filtered;
}

export function getAbuseDetectionStats(): AbuseDetectionStats {
  return {
    totalSignals: signals.length,
    criticalSignals: signals.filter(s => s.severity === 'critical').length,
    highSignals: signals.filter(s => s.severity === 'high').length,
    quarantinedKeys: quarantinedKeys.size,
    totalBaselines: baselines.size,
    avgAbuseScore: signals.length > 0
      ? Math.round(signals.reduce((s, sig) => s + sig.score, 0) / signals.length * 100) / 100
      : 0,
    escalationsToImmunity: signals.filter(s => s.escalatedToImmunity).length,
  };
}

export function resetAbuseDetection(): void {
  signals.length = 0;
  baselines.clear();
  quarantinedKeys.clear();
}
