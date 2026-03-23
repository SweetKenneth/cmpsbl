/**
 * AUDIT — Tamper Evidence Analyzer
 * Detects suspicious patterns: receipt gaps, timestamp inversions,
 * anomalous actor frequency, and hash collision indicators.
 * @module audit/tamperEvidenceAnalyzer
 * @version 9.0.0 — Sentinel
 */

import type { AuditReceipt } from '../receipts';

// ── Types ──────────────────────────────────────────────────────────────────

export type TamperIndicatorType =
  | 'timestamp_inversion'
  | 'receipt_gap'
  | 'actor_burst'
  | 'hash_anomaly'
  | 'metadata_inconsistency';

export interface TamperIndicator {
  type: TamperIndicatorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  receiptIndex: number;
  receiptId: string;
  description: string;
  evidence: Record<string, unknown>;
}

export interface TamperAnalysis {
  clean: boolean;
  indicators: TamperIndicator[];
  receiptsAnalyzed: number;
  timestamp: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_GAP_MS = 3600 * 1000;       // 1 hour gap = suspicious
const BURST_WINDOW_MS = 5000;          // 5 seconds
const BURST_THRESHOLD = 20;            // 20 receipts in 5s = burst

// ── Core ───────────────────────────────────────────────────────────────────

export function analyzeForTampering(receipts: AuditReceipt[]): TamperAnalysis {
  const indicators: TamperIndicator[] = [];

  if (receipts.length < 2) {
    return { clean: true, indicators: [], receiptsAnalyzed: receipts.length, timestamp: Date.now() };
  }

  for (let i = 1; i < receipts.length; i++) {
    const prev = receipts[i - 1];
    const curr = receipts[i];
    const prevTime = new Date(prev.timestamp).getTime();
    const currTime = new Date(curr.timestamp).getTime();

    // Check 1: Timestamp inversion
    if (currTime < prevTime) {
      indicators.push({
        type: 'timestamp_inversion',
        severity: 'high',
        receiptIndex: i,
        receiptId: curr.id,
        description: `Receipt ${i} timestamp (${curr.timestamp}) precedes receipt ${i - 1} (${prev.timestamp})`,
        evidence: { prevTimestamp: prev.timestamp, currTimestamp: curr.timestamp, deltaMs: prevTime - currTime },
      });
    }

    // Check 2: Suspicious gap
    const gap = currTime - prevTime;
    if (gap > MAX_GAP_MS) {
      indicators.push({
        type: 'receipt_gap',
        severity: 'medium',
        receiptIndex: i,
        receiptId: curr.id,
        description: `Gap of ${Math.round(gap / 60000)} minutes between receipts ${i - 1} and ${i}`,
        evidence: { gapMs: gap, prevId: prev.id, currId: curr.id },
      });
    }

    // Check 3: prev_hash linkage (basic — full verification is in merkle.ts)
    if (curr.prev_hash === '' || curr.prev_hash === curr.id) {
      indicators.push({
        type: 'hash_anomaly',
        severity: 'critical',
        receiptIndex: i,
        receiptId: curr.id,
        description: 'Receipt has empty or self-referencing prev_hash',
        evidence: { prev_hash: curr.prev_hash },
      });
    }
  }

  // Check 4: Actor burst detection
  const actorWindows = new Map<string, number[]>();
  for (let i = 0; i < receipts.length; i++) {
    const r = receipts[i];
    const time = new Date(r.timestamp).getTime();
    if (!actorWindows.has(r.actor)) actorWindows.set(r.actor, []);
    actorWindows.get(r.actor)!.push(time);
  }

  for (const [actor, times] of actorWindows) {
    for (let i = 0; i < times.length; i++) {
      const windowEnd = times[i] + BURST_WINDOW_MS;
      const countInWindow = times.filter(t => t >= times[i] && t <= windowEnd).length;
      if (countInWindow >= BURST_THRESHOLD) {
        indicators.push({
          type: 'actor_burst',
          severity: 'medium',
          receiptIndex: i,
          receiptId: receipts[i].id,
          description: `Actor "${actor}" produced ${countInWindow} receipts in ${BURST_WINDOW_MS}ms window`,
          evidence: { actor, count: countInWindow, windowMs: BURST_WINDOW_MS },
        });
        break; // one alert per actor
      }
    }
  }

  // Check 5: Metadata inconsistency (policy version changes mid-chain)
  const policyVersions = new Set(receipts.map(r => r.policy_version));
  if (policyVersions.size > 2) {
    indicators.push({
      type: 'metadata_inconsistency',
      severity: 'low',
      receiptIndex: 0,
      receiptId: receipts[0].id,
      description: `${policyVersions.size} different policy versions detected in chain`,
      evidence: { versions: Array.from(policyVersions) },
    });
  }

  return {
    clean: indicators.filter(i => i.severity === 'high' || i.severity === 'critical').length === 0,
    indicators: indicators.sort((a, b) => {
      const sev = { critical: 4, high: 3, medium: 2, low: 1 };
      return (sev[b.severity] ?? 0) - (sev[a.severity] ?? 0);
    }),
    receiptsAnalyzed: receipts.length,
    timestamp: Date.now(),
  };
}
