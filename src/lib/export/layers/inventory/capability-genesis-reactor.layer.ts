/**
 * CMPSBL® Inventory Layer — Capability Genesis Reactor
 * Primitives: SEED · COMBINE · PROMOTE
 *
 * Distinct from self-evolution (mutates existing) — this synthesizes NEW
 * capability candidates by combining observed input/output signatures,
 * scores them, and promotes high-fitness candidates to a registry.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Capability Genesis Reactor (proprietary).                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblGenesisCandidate { id: string; signature: string; fitness: number; promotions: number; }
const _CMPSBL_GENESIS_POOL = new Map<string, CmpsblGenesisCandidate>();
const _CMPSBL_GENESIS_PROMOTED = new Set<string>();

export function cmpsbl_genesis_seed(capabilityName: string, inputKeys: string[], outputKeys: string[]): string {
  const sig = capabilityName + '|' + inputKeys.sort().join(',') + '->' + outputKeys.sort().join(',');
  const id = 'gen_' + sig.length.toString(36) + '_' + (_CMPSBL_GENESIS_POOL.size);
  const existing = _CMPSBL_GENESIS_POOL.get(sig);
  if (existing) { existing.fitness += 0.1; return existing.id; }
  _CMPSBL_GENESIS_POOL.set(sig, { id, signature: sig, fitness: 1.0, promotions: 0 });
  return id;
}

export function cmpsbl_genesis_combine(): { generated: number; pool: number } {
  const sigs = Array.from(_CMPSBL_GENESIS_POOL.keys()).slice(0, 16);
  let generated = 0;
  for (let i = 0; i < sigs.length; i++) {
    for (let j = i + 1; j < sigs.length; j++) {
      const hybrid = sigs[i] + '⊕' + sigs[j];
      if (!_CMPSBL_GENESIS_POOL.has(hybrid)) {
        _CMPSBL_GENESIS_POOL.set(hybrid, { id: 'gen_hyb_' + (generated++), signature: hybrid, fitness: 0.5, promotions: 0 });
      }
    }
  }
  return { generated, pool: _CMPSBL_GENESIS_POOL.size };
}

export function cmpsbl_genesis_promote(threshold: number = 2.0): string[] {
  const promoted: string[] = [];
  for (const [sig, cand] of _CMPSBL_GENESIS_POOL.entries()) {
    if (cand.fitness >= threshold && !_CMPSBL_GENESIS_PROMOTED.has(sig)) {
      _CMPSBL_GENESIS_PROMOTED.add(sig);
      cand.promotions += 1;
      promoted.push(cand.id);
    }
  }
  return promoted;
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Capability Genesis Reactor (proprietary).                  ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

from typing import Dict, List

_CMPSBL_GENESIS_POOL: Dict[str, dict] = {}
_CMPSBL_GENESIS_PROMOTED = set()

def cmpsbl_genesis_seed(capability_name: str, input_keys: list, output_keys: list) -> str:
    sig = capability_name + '|' + ','.join(sorted(input_keys)) + '->' + ','.join(sorted(output_keys))
    if sig in _CMPSBL_GENESIS_POOL:
        _CMPSBL_GENESIS_POOL[sig]['fitness'] += 0.1
        return _CMPSBL_GENESIS_POOL[sig]['id']
    cid = f"gen_{len(sig):x}_{len(_CMPSBL_GENESIS_POOL)}"
    _CMPSBL_GENESIS_POOL[sig] = { 'id': cid, 'signature': sig, 'fitness': 1.0, 'promotions': 0 }
    return cid

def cmpsbl_genesis_combine() -> dict:
    sigs = list(_CMPSBL_GENESIS_POOL.keys())[:16]
    generated = 0
    for i, a in enumerate(sigs):
        for b in sigs[i+1:]:
            hybrid = a + '⊕' + b
            if hybrid not in _CMPSBL_GENESIS_POOL:
                _CMPSBL_GENESIS_POOL[hybrid] = { 'id': f'gen_hyb_{generated}', 'signature': hybrid, 'fitness': 0.5, 'promotions': 0 }
                generated += 1
    return { 'generated': generated, 'pool': len(_CMPSBL_GENESIS_POOL) }

def cmpsbl_genesis_promote(threshold: float = 2.0) -> list:
    promoted = []
    for sig, cand in _CMPSBL_GENESIS_POOL.items():
        if cand['fitness'] >= threshold and sig not in _CMPSBL_GENESIS_PROMOTED:
            _CMPSBL_GENESIS_PROMOTED.add(sig)
            cand['promotions'] += 1
            promoted.append(cand['id'])
    return promoted
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_gen = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_gen(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const result = _cmpsbl_raw_execute_gen(capabilityName, input);
  const outKeys = (result && typeof result === 'object' && !Array.isArray(result)) ? Object.keys(result as Record<string, unknown>) : [];
  cmpsbl_genesis_seed(capabilityName, Object.keys(input), outKeys);
  return result;
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_gen = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    result = _cmpsbl_raw_execute_gen(capability_name, input_data)
    out_keys = list(result.keys()) if isinstance(result, dict) else []
    cmpsbl_genesis_seed(capability_name, list(input_data.keys()), out_keys)
    return result`;

export const CAPABILITY_GENESIS_REACTOR_LAYER: CmpsblLayerDefinition = {
  id: 'capability-genesis-reactor',
  name: 'Capability Genesis Reactor',
  crownJewelRank: 26,
  cjpi: 95,
  module: 'EVOLUTION×DREAM',
  description: 'Synthesizes new capability candidates from observed I/O signatures; combines and promotes high-fitness hybrids.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_genesis_seed',
    behavior: 'Auto-seeds capability candidates from every execution; surfaces emergent hybrids for promotion.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
