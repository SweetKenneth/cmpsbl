/**
 * CMPSBL® VISION — Behavioral Anomaly Scoring
 * 5-factor weighted deviation model from VISION spec.
 * Compares current session behavior against 30-day rolling baseline.
 */

export interface BehavioralBaseline {
  userId: string;
  avgSessionDurationMs: number;
  stdSessionDurationMs: number;
  avgLoginHour: number; // 0-23
  stdLoginHour: number;
  avgFeatureBreadth: number;
  stdFeatureBreadth: number;
  avgNavVelocity: number; // pages per minute
  stdNavVelocity: number;
  commonGeoHashes: string[];
  sampleCount: number;
  updatedAt: string;
}

export interface BehavioralScore {
  userId: string;
  score: number; // 0 (normal) → 100 (highly anomalous)
  factors: {
    sessionDuration: { deviation: number; weight: 0.30; contribution: number };
    loginTimeOfDay: { deviation: number; weight: 0.20; contribution: number };
    featureBreadth: { deviation: number; weight: 0.20; contribution: number };
    navVelocity: { deviation: number; weight: 0.15; contribution: number };
    geoConsistency: { deviation: number; weight: 0.15; contribution: number };
  };
  alertTriggered: boolean;
  timestamp: string;
}

// Bounded baseline store
const MAX_BASELINES = 1000;
const baselines = new Map<string, BehavioralBaseline>();

// Alert threshold
const ANOMALY_ALERT_THRESHOLD = 70;

/**
 * Update a user's behavioral baseline with a new observation
 */
export function updateBaseline(
  userId: string,
  observation: {
    sessionDurationMs: number;
    loginHour: number;
    featureBreadth: number;
    navVelocity: number;
    geoHash?: string;
  }
): BehavioralBaseline {
  const existing = baselines.get(userId);
  const now = new Date().toISOString();

  if (!existing) {
    if (baselines.size >= MAX_BASELINES) {
      // Evict oldest
      let oldestKey = '';
      let oldestTime = Infinity;
      for (const [k, v] of baselines) {
        const t = new Date(v.updatedAt).getTime();
        if (t < oldestTime) { oldestTime = t; oldestKey = k; }
      }
      if (oldestKey) baselines.delete(oldestKey);
    }

    const baseline: BehavioralBaseline = {
      userId,
      avgSessionDurationMs: observation.sessionDurationMs,
      stdSessionDurationMs: 0,
      avgLoginHour: observation.loginHour,
      stdLoginHour: 0,
      avgFeatureBreadth: observation.featureBreadth,
      stdFeatureBreadth: 0,
      avgNavVelocity: observation.navVelocity,
      stdNavVelocity: 0,
      commonGeoHashes: observation.geoHash ? [observation.geoHash] : [],
      sampleCount: 1,
      updatedAt: now,
    };
    baselines.set(userId, baseline);
    return baseline;
  }

  // Exponential moving average (alpha = 2/(n+1), capped at 0.1 for stability)
  const n = existing.sampleCount + 1;
  const alpha = Math.min(0.1, 2 / (n + 1));

  const updateEma = (prev: number, val: number) => prev + alpha * (val - prev);
  const updateStd = (prevStd: number, prevAvg: number, val: number) => {
    const diff = Math.abs(val - prevAvg);
    return prevStd + alpha * (diff - prevStd);
  };

  existing.stdSessionDurationMs = updateStd(existing.stdSessionDurationMs, existing.avgSessionDurationMs, observation.sessionDurationMs);
  existing.avgSessionDurationMs = updateEma(existing.avgSessionDurationMs, observation.sessionDurationMs);

  existing.stdLoginHour = updateStd(existing.stdLoginHour, existing.avgLoginHour, observation.loginHour);
  existing.avgLoginHour = updateEma(existing.avgLoginHour, observation.loginHour);

  existing.stdFeatureBreadth = updateStd(existing.stdFeatureBreadth, existing.avgFeatureBreadth, observation.featureBreadth);
  existing.avgFeatureBreadth = updateEma(existing.avgFeatureBreadth, observation.featureBreadth);

  existing.stdNavVelocity = updateStd(existing.stdNavVelocity, existing.avgNavVelocity, observation.navVelocity);
  existing.avgNavVelocity = updateEma(existing.avgNavVelocity, observation.navVelocity);

  if (observation.geoHash && !existing.commonGeoHashes.includes(observation.geoHash)) {
    existing.commonGeoHashes.push(observation.geoHash);
    if (existing.commonGeoHashes.length > 20) existing.commonGeoHashes.shift();
  }

  existing.sampleCount = n;
  existing.updatedAt = now;

  return existing;
}

/**
 * Calculate behavioral anomaly score for a current session
 */
export function scoreBehavior(
  userId: string,
  current: {
    sessionDurationMs: number;
    loginHour: number;
    featureBreadth: number;
    navVelocity: number;
    geoHash?: string;
  }
): BehavioralScore {
  const baseline = baselines.get(userId);
  const now = new Date().toISOString();

  // No baseline = no anomaly (first session)
  if (!baseline || baseline.sampleCount < 3) {
    return {
      userId,
      score: 0,
      factors: {
        sessionDuration: { deviation: 0, weight: 0.30, contribution: 0 },
        loginTimeOfDay: { deviation: 0, weight: 0.20, contribution: 0 },
        featureBreadth: { deviation: 0, weight: 0.20, contribution: 0 },
        navVelocity: { deviation: 0, weight: 0.15, contribution: 0 },
        geoConsistency: { deviation: 0, weight: 0.15, contribution: 0 },
      },
      alertTriggered: false,
      timestamp: now,
    };
  }

  // Z-score helper (clamped 0-100 per factor)
  const zDev = (val: number, mean: number, std: number): number => {
    if (std <= 0) return val !== mean ? 50 : 0;
    return Math.min(100, Math.abs(val - mean) / std * 20);
  };

  const durationDev = zDev(current.sessionDurationMs, baseline.avgSessionDurationMs, baseline.stdSessionDurationMs);

  // Circular deviation for hour-of-day
  const hourDiff = Math.min(
    Math.abs(current.loginHour - baseline.avgLoginHour),
    24 - Math.abs(current.loginHour - baseline.avgLoginHour)
  );
  const loginDev = baseline.stdLoginHour > 0 ? Math.min(100, (hourDiff / baseline.stdLoginHour) * 20) : (hourDiff > 3 ? 60 : 0);

  const breadthDev = zDev(current.featureBreadth, baseline.avgFeatureBreadth, baseline.stdFeatureBreadth);
  const velocityDev = zDev(current.navVelocity, baseline.avgNavVelocity, baseline.stdNavVelocity);

  // Geo consistency: 0 if known location, 80 if unknown
  const geoDev = current.geoHash
    ? (baseline.commonGeoHashes.includes(current.geoHash) ? 0 : 80)
    : 0;

  const score = Math.round(
    durationDev * 0.30 +
    loginDev * 0.20 +
    breadthDev * 0.20 +
    velocityDev * 0.15 +
    geoDev * 0.15
  );

  return {
    userId,
    score: Math.min(100, score),
    factors: {
      sessionDuration: { deviation: Math.round(durationDev), weight: 0.30, contribution: Math.round(durationDev * 0.30) },
      loginTimeOfDay: { deviation: Math.round(loginDev), weight: 0.20, contribution: Math.round(loginDev * 0.20) },
      featureBreadth: { deviation: Math.round(breadthDev), weight: 0.20, contribution: Math.round(breadthDev * 0.20) },
      navVelocity: { deviation: Math.round(velocityDev), weight: 0.15, contribution: Math.round(velocityDev * 0.15) },
      geoConsistency: { deviation: Math.round(geoDev), weight: 0.15, contribution: Math.round(geoDev * 0.15) },
    },
    alertTriggered: score >= ANOMALY_ALERT_THRESHOLD,
    timestamp: now,
  };
}

/**
 * Get baseline for a user
 */
export function getBaseline(userId: string): BehavioralBaseline | undefined {
  return baselines.get(userId);
}

/**
 * Get anomaly alert threshold
 */
export function getAnomalyThreshold(): number {
  return ANOMALY_ALERT_THRESHOLD;
}
