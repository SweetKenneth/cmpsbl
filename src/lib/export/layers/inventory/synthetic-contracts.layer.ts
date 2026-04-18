/**
 * CMPSBL® Synthetic Contracts Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Synthesizes typed I/O contracts from observed runtime traffic, validates
 * subsequent calls against the inferred contract, and emits drift signals
 * when shapes deviate.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS_CODE = `// CMPSBL® Synthetic Contracts — TS
export interface ContractShape {
  fields: Record<string, string>;
  samples: number;
  driftCount: number;
}
const CONTRACTS = new Map<string, ContractShape>();

function shapeOf(value: unknown): Record<string, string> {
  if (value === null || typeof value !== 'object') return { __root: typeof value };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
  }
  return out;
}

export function cmpsbl_syn_observe(operationId: string, payload: unknown): ContractShape {
  const shape = shapeOf(payload);
  const existing = CONTRACTS.get(operationId);
  if (!existing) {
    const next: ContractShape = { fields: shape, samples: 1, driftCount: 0 };
    CONTRACTS.set(operationId, next);
    return next;
  }
  existing.samples += 1;
  for (const [k, t] of Object.entries(shape)) {
    if (existing.fields[k] && existing.fields[k] !== t) existing.driftCount += 1;
    if (!existing.fields[k]) existing.fields[k] = t;
  }
  return existing;
}

export function cmpsbl_syn_validate(operationId: string, payload: unknown): { ok: boolean; missing: string[]; drift: string[] } {
  const c = CONTRACTS.get(operationId);
  if (!c) return { ok: true, missing: [], drift: [] };
  const shape = shapeOf(payload);
  const missing = Object.keys(c.fields).filter(k => !(k in shape));
  const drift = Object.entries(shape).filter(([k, t]) => c.fields[k] && c.fields[k] !== t).map(([k]) => k);
  return { ok: missing.length === 0 && drift.length === 0, missing, drift };
}
`;

const PY_CODE = `# CMPSBL® Synthetic Contracts — PY
from typing import Any, Dict, List, TypedDict

class ContractShape(TypedDict):
    fields: Dict[str, str]
    samples: int
    drift_count: int

_CONTRACTS: Dict[str, ContractShape] = {}

def _shape_of(value: Any) -> Dict[str, str]:
    if value is None or not isinstance(value, dict):
        return {"__root": type(value).__name__}
    out: Dict[str, str] = {}
    for k, v in value.items():
        out[k] = "list" if isinstance(v, list) else "none" if v is None else type(v).__name__
    return out

def cmpsbl_syn_observe(operation_id: str, payload: Any) -> ContractShape:
    shape = _shape_of(payload)
    existing = _CONTRACTS.get(operation_id)
    if not existing:
        nxt: ContractShape = {"fields": shape, "samples": 1, "drift_count": 0}
        _CONTRACTS[operation_id] = nxt
        return nxt
    existing["samples"] += 1
    for k, t in shape.items():
        if existing["fields"].get(k) and existing["fields"][k] != t:
            existing["drift_count"] += 1
        if k not in existing["fields"]:
            existing["fields"][k] = t
    return existing

def cmpsbl_syn_validate(operation_id: str, payload: Any):
    c = _CONTRACTS.get(operation_id)
    if not c:
        return {"ok": True, "missing": [], "drift": []}
    shape = _shape_of(payload)
    missing = [k for k in c["fields"] if k not in shape]
    drift = [k for k, t in shape.items() if c["fields"].get(k) and c["fields"][k] != t]
    return {"ok": not missing and not drift, "missing": missing, "drift": drift}
`;

const TS_WIRE = `
const _cmpsbl_raw_execute_syn = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_syn(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Observe input shape per capability — synthesizes typed contracts over time
  cmpsbl_syn_observe(capabilityName, input);
  const __syn_result = _cmpsbl_raw_execute_syn(capabilityName, input);
  // Observe output shape — drift signals emerge as future calls deviate
  cmpsbl_syn_observe(capabilityName + ':out', __syn_result as unknown);
  return __syn_result;
};`;

const PY_WIRE = `
_cmpsbl_raw_execute_syn = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Synthetic Contracts (auto-wired)."""
    cmpsbl_syn_observe(capability_name, input_data)
    __syn_result = _cmpsbl_raw_execute_syn(capability_name, input_data)
    cmpsbl_syn_observe(capability_name + ":out", __syn_result)
    return __syn_result`;

export const SYNTHETIC_CONTRACTS_LAYER: CmpsblLayerDefinition = {
  id: 'synthetic-contracts',
  name: 'Synthetic Contracts Layer',
  crownJewelRank: 19,
  cjpi: 8.9,
  module: 'INTEGRATION',
  description:
    'Synthesizes typed I/O contracts from observed runtime traffic, validates subsequent calls, and emits drift signals when shapes deviate.',
  priceCents: 4900,
  tsCode: TS_CODE,
  pyCode: PY_CODE,
  autoWire: {
    wrapperName: 'cmpsbl_syn_observe',
    behavior: 'Captures input/output shapes on every execute and grows a runtime-inferred contract per operation.',
    tsWire: TS_WIRE,
    pyWire: PY_WIRE,
  },
};
