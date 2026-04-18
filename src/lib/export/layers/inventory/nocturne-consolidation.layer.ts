/**
 * CMPSBL® Inventory Layer — Nocturne Consolidation
 * Primitives: BUFFER · CONSOLIDATE · PRUNE
 *
 * Sleep-cycle memory consolidation. Distinct from cognitive-memory (storage):
 * runs idle-time consolidation passes that compress repeated observations
 * into summarized memories and prune low-salience entries.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Nocturne Consolidation (proprietary).                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblNocturneEntry { key: string; observations: string[]; salience: number; consolidatedAt: number | null; summary: string | null; }
const _CMPSBL_NOCTURNE_BUFFER = new Map<string, CmpsblNocturneEntry>();

export function cmpsbl_nocturne_buffer(key: string, observation: string): void {
  const e = _CMPSBL_NOCTURNE_BUFFER.get(key) ?? { key, observations: [], salience: 0, consolidatedAt: null, summary: null };
  e.observations.push(observation);
  e.salience += 1;
  if (e.observations.length > 256) e.observations.shift();
  _CMPSBL_NOCTURNE_BUFFER.set(key, e);
}

export function cmpsbl_nocturne_consolidate(): { consolidated: number; pruned: number } {
  let consolidated = 0; let pruned = 0;
  const now = Date.now();
  for (const [key, e] of _CMPSBL_NOCTURNE_BUFFER.entries()) {
    if (e.observations.length >= 8) {
      const tokens: Map<string, number> = new Map();
      for (const obs of e.observations) {
        for (const t of obs.toLowerCase().split(/\\W+/).filter(t => t.length > 3)) {
          tokens.set(t, (tokens.get(t) ?? 0) + 1);
        }
      }
      const top = Array.from(tokens.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
      e.summary = top.join(' · ');
      e.consolidatedAt = now;
      e.observations = [];
      consolidated += 1;
    }
    if (e.salience < 2 && (now - (e.consolidatedAt ?? 0)) > 7 * 86400000) {
      _CMPSBL_NOCTURNE_BUFFER.delete(key);
      pruned += 1;
    }
  }
  return { consolidated, pruned };
}

export function cmpsbl_nocturne_recall(key: string): CmpsblNocturneEntry | null {
  return _CMPSBL_NOCTURNE_BUFFER.get(key) ?? null;
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Nocturne Consolidation (proprietary).                      ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import re, time
from typing import Dict, Optional

_CMPSBL_NOCTURNE_BUFFER: Dict[str, dict] = {}

def cmpsbl_nocturne_buffer(key: str, observation: str) -> None:
    e = _CMPSBL_NOCTURNE_BUFFER.get(key, { 'key': key, 'observations': [], 'salience': 0, 'consolidated_at': None, 'summary': None })
    e['observations'].append(observation)
    e['salience'] += 1
    if len(e['observations']) > 256: e['observations'].pop(0)
    _CMPSBL_NOCTURNE_BUFFER[key] = e

def cmpsbl_nocturne_consolidate() -> dict:
    consolidated = 0; pruned = 0
    now = time.time()
    for key in list(_CMPSBL_NOCTURNE_BUFFER.keys()):
        e = _CMPSBL_NOCTURNE_BUFFER[key]
        if len(e['observations']) >= 8:
            tokens = {}
            for obs in e['observations']:
                for t in re.split(r'\\W+', obs.lower()):
                    if len(t) > 3: tokens[t] = tokens.get(t, 0) + 1
            top = [t for t, _ in sorted(tokens.items(), key=lambda x: -x[1])[:5]]
            e['summary'] = ' · '.join(top)
            e['consolidated_at'] = now
            e['observations'] = []
            consolidated += 1
        if e['salience'] < 2 and (now - (e['consolidated_at'] or 0)) > 7 * 86400:
            del _CMPSBL_NOCTURNE_BUFFER[key]
            pruned += 1
    return { 'consolidated': consolidated, 'pruned': pruned }

def cmpsbl_nocturne_recall(key: str) -> Optional[dict]:
    return _CMPSBL_NOCTURNE_BUFFER.get(key)
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_noct = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_noct(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const result = _cmpsbl_raw_execute_noct(capabilityName, input);
  cmpsbl_nocturne_buffer(capabilityName, JSON.stringify({ in: Object.keys(input), out: typeof result }));
  return result;
};`;

const WIRE_PY = `
import json as _cmpsbl_noct_json
_cmpsbl_raw_execute_noct = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    result = _cmpsbl_raw_execute_noct(capability_name, input_data)
    cmpsbl_nocturne_buffer(capability_name, _cmpsbl_noct_json.dumps({ 'in': list(input_data.keys()), 'out': type(result).__name__ }))
    return result`;

export const NOCTURNE_CONSOLIDATION_LAYER: CmpsblLayerDefinition = {
  id: 'nocturne-consolidation',
  name: 'Nocturne Consolidation',
  crownJewelRank: 29,
  cjpi: 94,
  module: 'INTELLIGENCE×DREAM',
  description: 'Sleep-cycle memory consolidation: buffers observations, summarizes via token-salience, prunes low-value entries.',
  priceCents: 5900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_nocturne_buffer',
    behavior: 'Auto-buffers each execution shape; call cmpsbl_nocturne_consolidate() on idle-cycle ticks.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
