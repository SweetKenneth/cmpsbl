/**
 * CMPSBL® Inventory Layer — Federated Learning Suite
 * Primitives: GRADIENT · AGGREGATE · CLIP · DRIFT
 *
 *   GRADIENT  → numerical gradient of a 1-D loss sample (forward diff)
 *   AGGREGATE → FedAvg weighted mean across client weight vectors
 *   CLIP      → L2-norm clipping for differential-privacy style bounding
 *   DRIFT     → cosine-similarity drift score between two weight vectors
 *
 * Auto-wire records a per-execution "client update" fingerprint so the
 * runtime can later FedAvg results across distributed instances without
 * sharing raw inputs — only normalized, clipped vectors.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Federated Learning Suite (proprietary).                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── GRADIENT · forward-diff numerical gradient ──────────────────────────────
export function cmpsbl_fls_gradient_fd(f: (x: number) => number, x: number, h: number = 1e-4): number {
  return (f(x + h) - f(x)) / h;
}

// ── AGGREGATE · FedAvg weighted mean ────────────────────────────────────────
export function cmpsbl_fls_aggregate_fedavg(updates: Array<{ weights: number[]; n: number }>): number[] {
  if (updates.length === 0) return [];
  const dim = updates[0].weights.length;
  const out = new Array<number>(dim).fill(0);
  let total = 0;
  for (const u of updates) total += u.n;
  if (total === 0) return out;
  for (const u of updates) {
    const w = u.n / total;
    for (let i = 0; i < dim; i++) out[i] += u.weights[i] * w;
  }
  return out;
}

// ── CLIP · L2-norm clipping ─────────────────────────────────────────────────
export function cmpsbl_fls_clip_l2(v: number[], maxNorm: number): number[] {
  let sq = 0;
  for (const x of v) sq += x * x;
  const norm = Math.sqrt(sq);
  if (norm <= maxNorm || norm === 0) return v.slice();
  const k = maxNorm / norm;
  return v.map(x => x * k);
}

// ── DRIFT · cosine drift (1 - cosine similarity) ────────────────────────────
export function cmpsbl_fls_drift_cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return 1;
  return 1 - (dot / denom);
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Federated Learning Suite (proprietary).                    ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import math
from typing import Callable, List

def cmpsbl_fls_gradient_fd(f: Callable[[float], float], x: float, h: float = 1e-4) -> float:
    return (f(x + h) - f(x)) / h

def cmpsbl_fls_aggregate_fedavg(updates: list) -> List[float]:
    if not updates: return []
    dim = len(updates[0]["weights"])
    out = [0.0] * dim
    total = sum(u["n"] for u in updates)
    if total == 0: return out
    for u in updates:
        w = u["n"] / total
        for i in range(dim):
            out[i] += u["weights"][i] * w
    return out

def cmpsbl_fls_clip_l2(v: List[float], max_norm: float) -> List[float]:
    sq = sum(x * x for x in v)
    norm = math.sqrt(sq)
    if norm <= max_norm or norm == 0:
        return list(v)
    k = max_norm / norm
    return [x * k for x in v]

def cmpsbl_fls_drift_cosine(a: List[float], b: List[float]) -> float:
    n = min(len(a), len(b))
    dot = sum(a[i] * b[i] for i in range(n))
    na = sum(a[i] * a[i] for i in range(n))
    nb = sum(b[i] * b[i] for i in range(n))
    denom = math.sqrt(na) * math.sqrt(nb)
    if denom == 0: return 1.0
    return 1.0 - (dot / denom)
`;

const WIRE_TS = `
const _cmpsbl_fls_updates: Array<{ weights: number[]; n: number }> = [];
const _cmpsbl_raw_execute_fls = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_fls(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const result = _cmpsbl_raw_execute_fls(capabilityName, input);
  // If caller provided a weight vector, clip + record it for later FedAvg
  if (Array.isArray(input._cmpsbl_weights)) {
    const clipped = cmpsbl_fls_clip_l2(input._cmpsbl_weights as number[], 1.0);
    _cmpsbl_fls_updates.push({ weights: clipped, n: 1 });
  }
  return result;
};`;

const WIRE_PY = `
_cmpsbl_fls_updates = []
_cmpsbl_raw_execute_fls = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Federated Learning Suite (clip + record per-call weights)."""
    result = _cmpsbl_raw_execute_fls(capability_name, input_data)
    weights = input_data.get('_cmpsbl_weights')
    if isinstance(weights, list):
        clipped = cmpsbl_fls_clip_l2(weights, 1.0)
        _cmpsbl_fls_updates.append({ "weights": clipped, "n": 1 })
    return result`;

export const FEDERATED_LEARNING_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'federated-learning-suite',
  name: 'Federated Learning Suite',
  crownJewelRank: 30,
  cjpi: 89,
  module: 'LEARNING',
  description: 'GRADIENT forward-diff + AGGREGATE FedAvg + CLIP L2-norm bound + DRIFT cosine signal.',
  priceCents: 8900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_fls_clip_l2',
    behavior: 'Clips per-call weight vectors to unit L2-norm and records them for later federated aggregation.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
