/**
 * CMPSBL® Inventory Layer — Memory Consolidation & Pattern Reinforcement Layer
 * Primitives: REPLAY · PRUNE · STRENGTHEN
 *
 * Sleep-cycle memory consolidation: replays the day's capability traces,
 * decays weakly-used patterns, and reinforces high-utility ones. Distinct
 * from EVOLUTION (patches code) — Nocturne reshapes the memory weighting.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Memory Consolidation & Pattern Reinforcement Layer (proprietary).                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblNocturneTrace { cap: string; weight: number; lastSeen: number; }
const _CMPSBL_NOCTURNE_MEM = new Map<string, CmpsblNocturneTrace>();
const _CMPSBL_NOCTURNE_DECAY = 0.92;
const _CMPSBL_NOCTURNE_FLOOR = 0.05;

export function cmpsbl_nocturne_record(cap: string): void {
  const t = _CMPSBL_NOCTURNE_MEM.get(cap) ?? { cap, weight: 0, lastSeen: 0 };
  t.weight = Math.min(1, t.weight + 0.1);
  t.lastSeen = Date.now();
  _CMPSBL_NOCTURNE_MEM.set(cap, t);
}

export function cmpsbl_nocturne_consolidate(): { kept: number; pruned: number; strongest: string | null } {
  let pruned = 0; let strongest: CmpsblNocturneTrace | null = null;
  for (const [k, t] of Array.from(_CMPSBL_NOCTURNE_MEM.entries())) {
    t.weight *= _CMPSBL_NOCTURNE_DECAY;
    if (t.weight < _CMPSBL_NOCTURNE_FLOOR) { _CMPSBL_NOCTURNE_MEM.delete(k); pruned++; continue; }
    if (!strongest || t.weight > strongest.weight) strongest = t;
  }
  return { kept: _CMPSBL_NOCTURNE_MEM.size, pruned, strongest: strongest?.cap ?? null };
}

export function cmpsbl_nocturne_weight(cap: string): number {
  return _CMPSBL_NOCTURNE_MEM.get(cap)?.weight ?? 0;
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Memory Consolidation & Pattern Reinforcement Layer (proprietary).                      ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time

_CMPSBL_NOCTURNE_MEM: dict = {}
_CMPSBL_NOCTURNE_DECAY = 0.92
_CMPSBL_NOCTURNE_FLOOR = 0.05

def cmpsbl_nocturne_record(cap: str) -> None:
    t = _CMPSBL_NOCTURNE_MEM.get(cap, { 'cap': cap, 'weight': 0.0, 'last_seen': 0 })
    t['weight'] = min(1.0, t['weight'] + 0.1)
    t['last_seen'] = time.time()
    _CMPSBL_NOCTURNE_MEM[cap] = t

def cmpsbl_nocturne_consolidate() -> dict:
    pruned = 0
    strongest = None
    for k in list(_CMPSBL_NOCTURNE_MEM.keys()):
        t = _CMPSBL_NOCTURNE_MEM[k]
        t['weight'] *= _CMPSBL_NOCTURNE_DECAY
        if t['weight'] < _CMPSBL_NOCTURNE_FLOOR:
            del _CMPSBL_NOCTURNE_MEM[k]; pruned += 1; continue
        if strongest is None or t['weight'] > strongest['weight']:
            strongest = t
    return { 'kept': len(_CMPSBL_NOCTURNE_MEM), 'pruned': pruned, 'strongest': strongest['cap'] if strongest else None }

def cmpsbl_nocturne_weight(cap: str) -> float:
    t = _CMPSBL_NOCTURNE_MEM.get(cap)
    return t['weight'] if t else 0.0
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_nocturne = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_nocturne(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  cmpsbl_nocturne_record(capabilityName);
  return _cmpsbl_raw_execute_nocturne(capabilityName, input);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_nocturne = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    cmpsbl_nocturne_record(capability_name)
    return _cmpsbl_raw_execute_nocturne(capability_name, input_data)`;

export const NOCTURNE_CONSOLIDATION_LAYER: CmpsblLayerDefinition = {
  id: 'nocturne-consolidation',
  name: 'Memory Consolidation & Pattern Reinforcement Layer',
  crownJewelRank: 71,
  cjpi: 94,
  module: 'DREAM×EVOLUTION',
  description: 'Sleep-cycle for your runtime: decays weakly-used patterns, reinforces high-utility ones, and surfaces the strongest paths — keeps long-running systems from drowning in stale state.',
  priceCents: 6900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_nocturne_record',
    behavior: 'Records every capability invocation; periodic consolidate() prunes weak traces and surfaces the strongest cap.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
