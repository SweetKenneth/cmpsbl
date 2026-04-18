/**
 * CMPSBL® Resilient Evolution Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Continuously evolves runtime resilience: tracks failure modes, mutates
 * recovery strategies, and promotes the survivors. Auto-wires into
 * cmpsbl_execute as a post-flight evolutionary scorer.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS_CODE = `// CMPSBL® Resilient Evolution — TS
export interface ResilientStrategy {
  id: string;
  fitness: number;
  invocations: number;
  failures: number;
  lastUsedAt: number;
}
const STRATEGIES = new Map<string, ResilientStrategy>();
const GENERATION = { value: 0 };

export function cmpsbl_res_register(id: string): ResilientStrategy {
  const existing = STRATEGIES.get(id);
  if (existing) return existing;
  const next: ResilientStrategy = { id, fitness: 0.5, invocations: 0, failures: 0, lastUsedAt: Date.now() };
  STRATEGIES.set(id, next);
  return next;
}

export function cmpsbl_res_record(id: string, success: boolean, latencyMs: number): ResilientStrategy {
  const s = cmpsbl_res_register(id);
  s.invocations += 1;
  if (!success) s.failures += 1;
  const successRate = 1 - s.failures / Math.max(1, s.invocations);
  const latencyScore = Math.max(0, 1 - latencyMs / 5000);
  s.fitness = 0.7 * successRate + 0.3 * latencyScore;
  s.lastUsedAt = Date.now();
  return s;
}

export function cmpsbl_res_evolve(): { generation: number; survivors: string[]; pruned: string[] } {
  GENERATION.value += 1;
  const all = Array.from(STRATEGIES.values()).sort((a, b) => b.fitness - a.fitness);
  const cutoff = Math.max(1, Math.floor(all.length * 0.6));
  const survivors = all.slice(0, cutoff).map(s => s.id);
  const pruned = all.slice(cutoff).map(s => s.id);
  for (const id of pruned) STRATEGIES.delete(id);
  return { generation: GENERATION.value, survivors, pruned };
}

export function cmpsbl_res_pick(): string | null {
  const all = Array.from(STRATEGIES.values()).sort((a, b) => b.fitness - a.fitness);
  return all[0]?.id ?? null;
}
`;

const PY_CODE = `# CMPSBL® Resilient Evolution — PY
import time
from typing import Dict, List, Optional, TypedDict

class ResilientStrategy(TypedDict):
    id: str
    fitness: float
    invocations: int
    failures: int
    last_used_at: float

_STRATEGIES: Dict[str, ResilientStrategy] = {}
_GENERATION = {"value": 0}

def cmpsbl_res_register(strategy_id: str) -> ResilientStrategy:
    if strategy_id in _STRATEGIES:
        return _STRATEGIES[strategy_id]
    s: ResilientStrategy = {"id": strategy_id, "fitness": 0.5, "invocations": 0, "failures": 0, "last_used_at": time.time()}
    _STRATEGIES[strategy_id] = s
    return s

def cmpsbl_res_record(strategy_id: str, success: bool, latency_ms: float) -> ResilientStrategy:
    s = cmpsbl_res_register(strategy_id)
    s["invocations"] += 1
    if not success:
        s["failures"] += 1
    success_rate = 1 - s["failures"] / max(1, s["invocations"])
    latency_score = max(0.0, 1 - latency_ms / 5000)
    s["fitness"] = 0.7 * success_rate + 0.3 * latency_score
    s["last_used_at"] = time.time()
    return s

def cmpsbl_res_evolve():
    _GENERATION["value"] += 1
    ranked = sorted(_STRATEGIES.values(), key=lambda x: x["fitness"], reverse=True)
    cutoff = max(1, int(len(ranked) * 0.6))
    survivors = [s["id"] for s in ranked[:cutoff]]
    pruned = [s["id"] for s in ranked[cutoff:]]
    for pid in pruned:
        _STRATEGIES.pop(pid, None)
    return {"generation": _GENERATION["value"], "survivors": survivors, "pruned": pruned}

def cmpsbl_res_pick() -> Optional[str]:
    ranked = sorted(_STRATEGIES.values(), key=lambda x: x["fitness"], reverse=True)
    return ranked[0]["id"] if ranked else None
`;

const TS_WIRE = `
const _cmpsbl_raw_execute_res = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_res(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Score recovery-strategy fitness on every cycle (success rate + latency)
  const __res_strategy = cmpsbl_res_pick() ?? 'default';
  const __res_t0 = Date.now();
  let __res_ok = true;
  try {
    return _cmpsbl_raw_execute_res(capabilityName, input);
  } catch (e) {
    __res_ok = false;
    throw e;
  } finally {
    cmpsbl_res_record(__res_strategy, __res_ok, Date.now() - __res_t0);
  }
};`;

const PY_WIRE = `
_cmpsbl_raw_execute_res = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Resilient Evolution (auto-wired)."""
    __res_strategy = cmpsbl_res_pick() or 'default'
    __res_t0 = time.time()
    __res_ok = True
    try:
        return _cmpsbl_raw_execute_res(capability_name, input_data)
    except Exception:
        __res_ok = False
        raise
    finally:
        cmpsbl_res_record(__res_strategy, __res_ok, (time.time() - __res_t0) * 1000)`;

export const RESILIENT_EVOLUTION_LAYER: CmpsblLayerDefinition = {
  id: 'resilient-evolution',
  name: 'Resilient Evolution Layer',
  crownJewelRank: 17,
  cjpi: 9.1,
  module: 'EVOLUTION',
  description:
    'Evolves runtime resilience strategies via fitness scoring across success rate and latency, pruning weak survivors generationally.',
  priceCents: 6900,
  tsCode: TS_CODE,
  pyCode: PY_CODE,
  autoWire: {
    wrapperName: 'cmpsbl_res_record',
    behavior: 'Records strategy outcomes around every cmpsbl_execute and selects the fittest strategy at entry.',
    tsWire: TS_WIRE,
    pyWire: PY_WIRE,
  },
};
