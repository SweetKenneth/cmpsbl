/**
 * CMPSBL® Always-On Core — WITNESS Audit-Chain Witness
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Pairs with ARBITRIUM, the Governed Execution Pipeline. Inspects every
 * audit chain emitted by `cmpsbl_run_governed` and produces a structured
 * verdict (healthy / degraded / anomalous / failed) plus a competency
 * delta the host runtime can route to its own learning store.
 *
 * Pure deterministic. Zero external AI. Inline-embedded in every
 * Layer 2 export. Sub-primitive of the AUDIT Agent — not a new
 * top-level primitive (matrix stays 12·12·8·8 = 40).
 *
 * U.S. Patent App. No. 64/029,678 · © CMPSBL® · PromptFluid™
 */
import type { CmpsblLayerDefinition } from './types';

const WITNESS_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

export type CmpsblWitnessVerdict = 'healthy' | 'degraded' | 'anomalous' | 'failed';

export interface CmpsblWitnessReading {
  agentId: string;
  verdict: CmpsblWitnessVerdict;
  competencyDelta: number;
  anomalyScore: number;
  signals: {
    blocked: boolean; overridden: boolean; failed: boolean;
    retries: number; layersExecuted: number; layersFailed: number;
    durationMs: number; originalExecuted: boolean;
  };
  reasons: string[];
  observedAt: string;
}

export function cmpsbl_witness_observe(agentId: string, ctx: any): CmpsblWitnessReading {
  const audit = Array.isArray(ctx?.audit) ? ctx.audit : [];
  const runtime = ctx?.runtime ?? {};
  const failed = audit.filter((a: any) => a.result === 'failed');
  const blocked = audit.some((a: any) => a.result === 'blocked');
  const overridden = audit.some((a: any) => a.result === 'override');
  const retries = runtime.retries ?? 0;
  const layersExecuted = audit.length;
  const layersFailed = failed.length;
  const durationMs = runtime.durationMs ?? 0;

  const reasons: string[] = [];
  let anomalyScore = 0;
  let competencyDelta = 0;
  let verdict: CmpsblWitnessVerdict = 'healthy';

  if (ctx?.error) { anomalyScore += 0.5; reasons.push('execution error'); }
  if (blocked) { anomalyScore += 0.3; competencyDelta -= 0.05; reasons.push('blocked by pre-layer'); }
  if (layersFailed > 0) { anomalyScore += Math.min(0.4, layersFailed * 0.1); competencyDelta -= layersFailed * 0.02; reasons.push(layersFailed + ' layer failure(s)'); }
  if (retries > 0) { anomalyScore += Math.min(0.2, retries * 0.05); reasons.push(retries + ' DEFENSE retry(ies)'); }
  if (durationMs > 5000) { anomalyScore += 0.15; reasons.push('slow run (' + durationMs + 'ms)'); }
  if (runtime.originalExecuted && !ctx?.error && !blocked) { competencyDelta += 0.03; reasons.push('clean execution'); }
  if (overridden) { reasons.push('output overridden by pre-layer'); }

  anomalyScore = Math.min(1, anomalyScore);
  competencyDelta = Math.max(-0.2, Math.min(0.1, competencyDelta));

  if (ctx?.error || layersFailed >= 2) verdict = 'failed';
  else if (anomalyScore >= 0.5) verdict = 'anomalous';
  else if (anomalyScore >= 0.2) verdict = 'degraded';

  return {
    agentId, verdict, competencyDelta, anomalyScore,
    signals: { blocked, overridden, failed: !!ctx?.error, retries, layersExecuted, layersFailed, durationMs, originalExecuted: !!runtime.originalExecuted },
    reasons,
    observedAt: new Date().toISOString(),
  };
}
`;

const WITNESS_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
from typing import Any, Dict, List

def cmpsbl_witness_observe(agent_id: str, ctx: Dict[str, Any]) -> Dict[str, Any]:
    audit = ctx.get("audit") or []
    runtime = ctx.get("runtime") or {}
    failed = [a for a in audit if a.get("result") == "failed"]
    blocked = any(a.get("result") == "blocked" for a in audit)
    overridden = any(a.get("result") == "override" for a in audit)
    retries = runtime.get("retries", 0)
    layers_executed = len(audit)
    layers_failed = len(failed)
    duration_ms = runtime.get("durationMs", 0)

    reasons: List[str] = []
    anomaly = 0.0
    delta = 0.0
    verdict = "healthy"

    if ctx.get("error"):
        anomaly += 0.5; reasons.append("execution error")
    if blocked:
        anomaly += 0.3; delta -= 0.05; reasons.append("blocked by pre-layer")
    if layers_failed > 0:
        anomaly += min(0.4, layers_failed * 0.1); delta -= layers_failed * 0.02
        reasons.append(f"{layers_failed} layer failure(s)")
    if retries > 0:
        anomaly += min(0.2, retries * 0.05); reasons.append(f"{retries} DEFENSE retry(ies)")
    if duration_ms > 5000:
        anomaly += 0.15; reasons.append(f"slow run ({duration_ms}ms)")
    if runtime.get("originalExecuted") and not ctx.get("error") and not blocked:
        delta += 0.03; reasons.append("clean execution")
    if overridden:
        reasons.append("output overridden by pre-layer")

    anomaly = min(1.0, anomaly)
    delta = max(-0.2, min(0.1, delta))

    if ctx.get("error") or layers_failed >= 2:
        verdict = "failed"
    elif anomaly >= 0.5:
        verdict = "anomalous"
    elif anomaly >= 0.2:
        verdict = "degraded"

    return {
        "agentId": agent_id,
        "verdict": verdict,
        "competencyDelta": delta,
        "anomalyScore": anomaly,
        "signals": {
            "blocked": blocked, "overridden": overridden, "failed": bool(ctx.get("error")),
            "retries": retries, "layersExecuted": layers_executed, "layersFailed": layers_failed,
            "durationMs": duration_ms, "originalExecuted": bool(runtime.get("originalExecuted")),
        },
        "reasons": reasons,
        "observedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
`;

const WITNESS_WIRE_TS = `
// Sealed wrapper — proprietary. WITNESS is invoked by the host runtime
// after each ARBITRIUM (cmpsbl_run_governed) completion to feed competency learning.`;

const WITNESS_WIRE_PY = `
# Sealed wrapper — proprietary.`;

export const WITNESS_CORE: CmpsblLayerDefinition = {
  id: 'witness-audit-chain',
  name: 'WITNESS — Audit-Chain Witness',
  crownJewelRank: 12,
  cjpi: 94,
  module: 'AUDIT',
  description:
    'Sub-primitive of the AUDIT Agent. Pairs with ARBITRIUM. Inspects every audit chain, scores anomaly + competency delta (healthy/degraded/anomalous/failed), and surfaces structured reasons so host runtimes learn from execution outcomes — not just AI calls.',
  priceCents: 0,
  tsCode: WITNESS_TS,
  pyCode: WITNESS_PY,
  autoWire: {
    wrapperName: 'cmpsbl_witness_observe',
    behavior:
      'After each ARBITRIUM run, WITNESS emits a structured verdict with anomaly score and competency delta the host can route to its own learning store.',
    tsWire: WITNESS_WIRE_TS,
    pyWire: WITNESS_WIRE_PY,
  },
};
