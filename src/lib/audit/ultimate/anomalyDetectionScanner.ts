/**
 * AUDIT — Anomaly Detection Scanner
 * Statistical analysis of audit stream using Z-score deviation on
 * action frequency, timing gaps, and scope escalation patterns.
 * @module audit/anomalyDetectionScanner
 * @version 9.0.0 — Sentinel
 */

import type { AuditReceipt } from '../receipts';

// ── Types ──────────────────────────────────────────────────────────────────

export type AnomalyType =
  | 'frequency_spike'
  | 'timing_anomaly'
  | 'scope_escalation'
  | 'new_actor'
  | 'unusual_type_mix';

export interface AuditAnomaly {
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high';
  description: string;
  zScore: number;
  evidence: Record<string, unknown>;
  timestamp: number;
}

export interface AnomalyScanResult {
  anomalies: AuditAnomaly[];
  receiptsScanned: number;
  cleanPeriods: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// ── Constants ──────────────────────────────────────────────────────────────

const Z_THRESHOLD_MEDIUM = 2.0;
const Z_THRESHOLD_HIGH = 3.0;
const WINDOW_SIZE = 50; // baseline window

// ── Helpers ────────────────────────────────────────────────────────────────

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[], avg: number): number {
  if (values.length < 2) return 1;
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance) || 1;
}

// ── Core ───────────────────────────────────────────────────────────────────

export function scanForAnomalies(receipts: AuditReceipt[]): AnomalyScanResult {
  const anomalies: AuditAnomaly[] = [];

  if (receipts.length < WINDOW_SIZE) {
    return { anomalies: [], receiptsScanned: receipts.length, cleanPeriods: 1, riskLevel: 'low' };
  }

  const times = receipts.map(r => new Date(r.timestamp).getTime());

  // 1. Frequency analysis (receipts per 5-minute bucket)
  const bucketMs = 5 * 60 * 1000;
  const buckets = new Map<number, number>();
  for (const t of times) {
    const bucket = Math.floor(t / bucketMs);
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }
  const bucketCounts = Array.from(buckets.values());
  const freqMean = mean(bucketCounts);
  const freqStd = stddev(bucketCounts, freqMean);

  for (const [bucket, count] of buckets) {
    const z = (count - freqMean) / freqStd;
    if (z > Z_THRESHOLD_MEDIUM) {
      anomalies.push({
        type: 'frequency_spike',
        severity: z > Z_THRESHOLD_HIGH ? 'high' : 'medium',
        description: `${count} receipts in 5-min bucket (z=${z.toFixed(2)}, avg=${freqMean.toFixed(1)})`,
        zScore: Math.round(z * 100) / 100,
        evidence: { bucket, count, mean: freqMean, std: freqStd },
        timestamp: bucket * bucketMs,
      });
    }
  }

  // 2. Timing gap analysis
  const intervals: number[] = [];
  for (let i = 1; i < times.length; i++) {
    intervals.push(times[i] - times[i - 1]);
  }
  const intMean = mean(intervals);
  const intStd = stddev(intervals, intMean);

  for (let i = 0; i < intervals.length; i++) {
    const z = (intervals[i] - intMean) / intStd;
    if (Math.abs(z) > Z_THRESHOLD_HIGH) {
      anomalies.push({
        type: 'timing_anomaly',
        severity: 'medium',
        description: `Interval ${Math.round(intervals[i] / 1000)}s between receipts ${i} and ${i + 1} (z=${z.toFixed(2)})`,
        zScore: Math.round(z * 100) / 100,
        evidence: { intervalMs: intervals[i], index: i, mean: intMean },
        timestamp: times[i + 1],
      });
    }
  }

  // 3. Scope escalation: actor changing from low-risk to high-risk action types
  const highRiskTypes = new Set(['config_change', 'safe_mode_toggle', 'evolution_promotion']);
  const actors = [...new Set(receipts.map(r => r.actor))];
  for (const actor of actors) {
    const actorReceipts = receipts.filter(r => r.actor === actor);
    const halfPoint = Math.floor(actorReceipts.length / 2);
    const firstHalf = actorReceipts.slice(0, halfPoint);
    const secondHalf = actorReceipts.slice(halfPoint);

    const firstHighRisk = firstHalf.filter(r => highRiskTypes.has(r.type)).length / (firstHalf.length || 1);
    const secondHighRisk = secondHalf.filter(r => highRiskTypes.has(r.type)).length / (secondHalf.length || 1);

    if (secondHighRisk > firstHighRisk * 3 && secondHighRisk > 0.3) {
      anomalies.push({
        type: 'scope_escalation',
        severity: 'high',
        description: `Actor "${actor}" escalated high-risk actions from ${(firstHighRisk * 100).toFixed(0)}% to ${(secondHighRisk * 100).toFixed(0)}%`,
        zScore: 0,
        evidence: { actor, firstHalfRate: firstHighRisk, secondHalfRate: secondHighRisk },
        timestamp: Date.now(),
      });
    }
  }

  // 4. New actor detection
  if (receipts.length > WINDOW_SIZE) {
    const baselineActors = new Set(receipts.slice(0, WINDOW_SIZE).map(r => r.actor));
    const recentActors = new Set(receipts.slice(-20).map(r => r.actor));
    for (const actor of recentActors) {
      if (!baselineActors.has(actor)) {
        anomalies.push({
          type: 'new_actor',
          severity: 'low',
          description: `New actor "${actor}" appeared in recent receipts`,
          zScore: 0,
          evidence: { actor, baselineSize: baselineActors.size },
          timestamp: Date.now(),
        });
      }
    }
  }

  // Overall risk level
  const highCount = anomalies.filter(a => a.severity === 'high').length;
  const medCount = anomalies.filter(a => a.severity === 'medium').length;
  let riskLevel: AnomalyScanResult['riskLevel'] = 'low';
  if (highCount >= 3) riskLevel = 'critical';
  else if (highCount >= 1) riskLevel = 'high';
  else if (medCount >= 3) riskLevel = 'medium';

  return {
    anomalies: anomalies.sort((a, b) => {
      const sev = { high: 3, medium: 2, low: 1 };
      return (sev[b.severity] ?? 0) - (sev[a.severity] ?? 0);
    }),
    receiptsScanned: receipts.length,
    cleanPeriods: Math.max(0, bucketCounts.length - anomalies.filter(a => a.type === 'frequency_spike').length),
    riskLevel,
  };
}
