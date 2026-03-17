/**
 * CMPSBL® Delta Measurement Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Measures the before/after computational impact of injecting
 * an Ascension Node into a discovery chain.
 *
 * Critical for proving whether a node meaningfully changed computation.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { PipelineContext } from '@/lib/export/module-effects';
import type { DeltaReport, DeltaSnapshot, DeltaComparison, AscensionNode } from './types';
import { generateCorrelationId } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — SNAPSHOT CAPTURE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Capture a snapshot of pipeline context state.
 */
export function captureSnapshot(
  ctx: PipelineContext,
  durationMs: number
): DeltaSnapshot {
  return {
    chainModules: [...ctx.chainModules],
    outputKeys: Object.keys(ctx.data).sort(),
    annotationCount: Object.keys(ctx.annotations).length,
    confidence: Math.round(ctx.confidence * 10000) / 10000,
    durationMs: Math.round(durationMs * 100) / 100,
    recoveryCount: ctx.recoveries.length,
    transformationNotes: [...ctx.transformationNotes],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — DELTA COMPARISON
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compare baseline vs injected snapshots to produce a delta report.
 */
export function compareDelta(
  baseline: DeltaSnapshot,
  injected: DeltaSnapshot,
  primitivesContributed: number
): DeltaComparison {
  const baseKeys = new Set(baseline.outputKeys);
  const injKeys = new Set(injected.outputKeys);

  const added = injected.outputKeys.filter(k => !baseKeys.has(k));
  const removed = baseline.outputKeys.filter(k => !injKeys.has(k));

  const confidenceDelta = Math.round((injected.confidence - baseline.confidence) * 10000) / 10000;
  const timingDelta = Math.round((injected.durationMs - baseline.durationMs) * 100) / 100;
  const recoveryDelta = injected.recoveryCount - baseline.recoveryCount;
  const annotationsDelta = injected.annotationCount - baseline.annotationCount;

  // Impact score: weighted sum of meaningful changes
  let impact = 0;
  impact += added.length * 2;                                    // new outputs are valuable
  impact += Math.max(0, confidenceDelta) * 10;                  // confidence improvement
  impact += Math.max(0, annotationsDelta) * 0.5;                // enrichment
  impact -= removed.length * 1;                                  // losing outputs is bad
  impact -= Math.max(0, -confidenceDelta) * 15;                 // confidence degradation
  impact -= Math.max(0, recoveryDelta) * 3;                     // more recoveries = instability
  impact -= Math.max(0, timingDelta) * 0.01;                    // small penalty for slower

  const impactScore = Math.round(Math.max(-100, Math.min(100, impact)) * 100) / 100;

  let verdict: DeltaComparison['verdict'] = 'neutral';
  if (impactScore > 2) verdict = 'positive';
  else if (impactScore < -2) verdict = 'negative';

  return {
    outputKeysAdded: added,
    outputKeysRemoved: removed,
    confidenceDelta,
    timingDeltaMs: timingDelta,
    recoveryDelta,
    annotationsAdded: Math.max(0, annotationsDelta),
    primitivesContributed,
    verdict,
    impactScore,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — FULL DELTA REPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build a complete delta report for a node injection comparison.
 */
export function buildDeltaReport(
  node: AscensionNode,
  baseline: DeltaSnapshot,
  injected: DeltaSnapshot,
  primitivesContributed: number
): DeltaReport {
  return {
    id: generateCorrelationId(),
    nodeId: node.id,
    nodeName: node.name,
    timestamp: new Date().toISOString(),
    baseline,
    injected,
    deltas: compareDelta(baseline, injected, primitivesContributed),
  };
}
