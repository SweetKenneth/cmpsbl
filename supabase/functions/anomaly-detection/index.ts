/**
 * Anomaly Detection Engine — Ported from aetherion-shield
 * Z-score based statistical anomaly scoring over defense event history.
 * Target nodes: DEFENSE, NERVE, VISION
 */

import {
  withMiddleware,
  requireAdmin,
  createAdminClient,
  jsonResponse,
  parseBody,
} from "../_shared/edge-middleware.ts";

interface AnomalyScore {
  overall_score: number;
  factors: {
    risk_score_anomaly: number;
    request_rate_anomaly: number;
    fingerprint_anomaly: number;
    behavioral_anomaly: number;
  };
  is_anomalous: boolean;
  confidence: number;
}

Deno.serve(withMiddleware(async (req: Request) => {
  // Admin-only endpoint
  await requireAdmin(req);

  const { lookbackHours = 24 } = await parseBody<{ lookbackHours?: number }>(req);
  const clampedLookback = Math.max(1, Math.min(168, lookbackHours));

  const supabase = createAdminClient();

  // Fetch recent defense events for baseline
  const cutoffTime = new Date(Date.now() - clampedLookback * 60 * 60 * 1000).toISOString();
  const { data: events, error: eventsError } = await supabase
    .from('defense_events')
    .select('*')
    .gte('created_at', cutoffTime)
    .order('created_at', { ascending: false })
    .limit(500);

  if (eventsError) {
    console.error('[DEFENSE] Anomaly detection query error:', eventsError);
    throw eventsError;
  }

  if (!events || events.length < 10) {
    return jsonResponse({
      anomalies: [],
      message: 'Insufficient data for anomaly detection (need at least 10 events)',
      baseline_events: events?.length || 0,
    });
  }

  // ── Baseline statistics ───────────────────────────────────────
  const riskScores = events.map((e: any) => e.risk_score || 0);
  const avgRiskScore = riskScores.reduce((a: number, b: number) => a + b, 0) / riskScores.length;
  const stdDevRiskScore = Math.sqrt(
    riskScores.reduce((sum: number, val: number) => sum + Math.pow(val - avgRiskScore, 2), 0) / riskScores.length
  );

  // Group by hourly time buckets for rate anomaly detection
  const timeBuckets = new Map<string, number>();
  events.forEach((e: any) => {
    const hourBucket = new Date(e.created_at).toISOString().slice(0, 13);
    timeBuckets.set(hourBucket, (timeBuckets.get(hourBucket) || 0) + 1);
  });

  const bucketValues = Array.from(timeBuckets.values());
  const avgRequestsPerHour = bucketValues.reduce((a, b) => a + b, 0) / timeBuckets.size;

  // Track fingerprint frequency
  const fingerprintCounts = new Map<string, number>();
  events.forEach((e: any) => {
    if (e.fingerprint_hash) {
      fingerprintCounts.set(e.fingerprint_hash, (fingerprintCounts.get(e.fingerprint_hash) || 0) + 1);
    }
  });

  // ── Detect anomalies in recent events ─────────────────────────
  const anomalies: any[] = [];
  const recentEvents = events.slice(0, Math.min(20, events.length));

  for (const event of recentEvents) {
    const score = calculateAnomalyScore(
      event,
      avgRiskScore,
      stdDevRiskScore,
      fingerprintCounts,
    );

    if (score.is_anomalous) {
      anomalies.push({
        event_id: event.id,
        timestamp: event.created_at,
        risk_score: event.risk_score,
        action: event.action,
        anomaly_score: score.overall_score,
        factors: score.factors,
        confidence: score.confidence,
      });
    }
  }

  // Sort by severity
  anomalies.sort((a, b) => b.anomaly_score - a.anomaly_score);

  return jsonResponse({
    anomalies: anomalies.slice(0, 10),
    total_anomalies: anomalies.length,
    baseline_events: events.length,
    lookback_hours: clampedLookback,
    statistics: {
      avg_risk_score: +avgRiskScore.toFixed(2),
      std_dev_risk_score: +stdDevRiskScore.toFixed(2),
      avg_requests_per_hour: +avgRequestsPerHour.toFixed(2),
      unique_fingerprints: fingerprintCounts.size,
    },
  });
}));

function calculateAnomalyScore(
  event: any,
  avgRiskScore: number,
  stdDevRiskScore: number,
  fingerprintCounts: Map<string, number>,
): AnomalyScore {
  let overallScore = 0;
  const factors = {
    risk_score_anomaly: 0,
    request_rate_anomaly: 0,
    fingerprint_anomaly: 0,
    behavioral_anomaly: 0,
  };

  // Risk score anomaly (z-score)
  const riskZScore = Math.abs(((event.risk_score || 0) - avgRiskScore) / (stdDevRiskScore || 1));
  factors.risk_score_anomaly = Math.min(riskZScore / 3, 1);
  overallScore += factors.risk_score_anomaly * 40; // 40% weight

  // Fingerprint frequency anomaly
  const fpCount = fingerprintCounts.get(event.fingerprint_hash) || 1;
  if (fpCount > 10) {
    factors.fingerprint_anomaly = Math.min(fpCount / 50, 1);
    overallScore += factors.fingerprint_anomaly * 30; // 30% weight
  }

  // Behavioral anomaly (based on reasons count)
  if (event.reasons && Array.isArray(event.reasons) && event.reasons.length > 3) {
    factors.behavioral_anomaly = Math.min(event.reasons.length / 8, 1);
    overallScore += factors.behavioral_anomaly * 20; // 20% weight
  }

  // Base request rate factor
  factors.request_rate_anomaly = 0.1;
  overallScore += factors.request_rate_anomaly * 10; // 10% weight

  const confidence =
    overallScore > 50
      ? 0.85 + (Math.min(overallScore - 50, 50) / 50) * 0.15
      : 0.5 + (overallScore / 50) * 0.35;

  return {
    overall_score: Math.round(overallScore),
    factors,
    is_anomalous: overallScore >= 50,
    confidence: Math.round(confidence * 100) / 100,
  };
}
