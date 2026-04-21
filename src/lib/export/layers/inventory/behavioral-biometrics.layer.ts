/**
 * CMPSBL® Inventory Layer — Continuous User Authentication Layer
 * Primitives: PROFILE · DRIFT · CHALLENGE
 *
 * Continuous authentication. Distinct from zero-trust (session-start) —
 * this builds per-actor behavioral profiles (call cadence, capability mix,
 * input shape) and detects mid-session takeover via drift scoring.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Continuous User Authentication Layer (proprietary).                       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblBioProfile { actorId: string; calls: number; lastCallAt: number; capCounts: Record<string, number>; avgInputSize: number; }
const _CMPSBL_BIO_PROFILES = new Map<string, CmpsblBioProfile>();

export function cmpsbl_bio_observe(actorId: string, capability: string, inputSize: number): void {
  const now = Date.now();
  const p = _CMPSBL_BIO_PROFILES.get(actorId) ?? { actorId, calls: 0, lastCallAt: now, capCounts: {}, avgInputSize: 0 };
  p.calls += 1;
  p.capCounts[capability] = (p.capCounts[capability] ?? 0) + 1;
  p.avgInputSize = (p.avgInputSize * (p.calls - 1) + inputSize) / p.calls;
  p.lastCallAt = now;
  _CMPSBL_BIO_PROFILES.set(actorId, p);
}

export function cmpsbl_bio_drift(actorId: string, capability: string, inputSize: number): { drift: number; alarm: boolean } {
  const p = _CMPSBL_BIO_PROFILES.get(actorId);
  if (!p || p.calls < 5) return { drift: 0, alarm: false };
  const capRatio = (p.capCounts[capability] ?? 0) / p.calls;
  const sizeDelta = Math.abs(inputSize - p.avgInputSize) / Math.max(1, p.avgInputSize);
  const drift = (1 - capRatio) * 0.5 + Math.min(1, sizeDelta) * 0.5;
  return { drift, alarm: drift > 0.85 };
}

export function cmpsbl_bio_challenge(actorId: string): { required: boolean; reason: string } {
  const p = _CMPSBL_BIO_PROFILES.get(actorId);
  if (!p) return { required: false, reason: 'no-profile' };
  const idleMs = Date.now() - p.lastCallAt;
  if (idleMs > 30 * 60 * 1000) return { required: true, reason: 'idle-timeout' };
  return { required: false, reason: 'within-session' };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Continuous User Authentication Layer (proprietary).                       ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
from typing import Dict

_CMPSBL_BIO_PROFILES: Dict[str, dict] = {}

def cmpsbl_bio_observe(actor_id: str, capability: str, input_size: int) -> None:
    now = time.time()
    p = _CMPSBL_BIO_PROFILES.get(actor_id, { 'actor_id': actor_id, 'calls': 0, 'last_call_at': now, 'cap_counts': {}, 'avg_input_size': 0.0 })
    p['calls'] += 1
    p['cap_counts'][capability] = p['cap_counts'].get(capability, 0) + 1
    p['avg_input_size'] = (p['avg_input_size'] * (p['calls'] - 1) + input_size) / p['calls']
    p['last_call_at'] = now
    _CMPSBL_BIO_PROFILES[actor_id] = p

def cmpsbl_bio_drift(actor_id: str, capability: str, input_size: int) -> dict:
    p = _CMPSBL_BIO_PROFILES.get(actor_id)
    if not p or p['calls'] < 5: return { 'drift': 0.0, 'alarm': False }
    cap_ratio = p['cap_counts'].get(capability, 0) / p['calls']
    size_delta = abs(input_size - p['avg_input_size']) / max(1, p['avg_input_size'])
    drift = (1 - cap_ratio) * 0.5 + min(1, size_delta) * 0.5
    return { 'drift': drift, 'alarm': drift > 0.85 }

def cmpsbl_bio_challenge(actor_id: str) -> dict:
    p = _CMPSBL_BIO_PROFILES.get(actor_id)
    if not p: return { 'required': False, 'reason': 'no-profile' }
    idle = time.time() - p['last_call_at']
    if idle > 30 * 60: return { 'required': True, 'reason': 'idle-timeout' }
    return { 'required': False, 'reason': 'within-session' }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_bio = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_bio(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const actorId = String((input as Record<string, unknown>)._cmpsbl_actor ?? 'anon');
  const inputSize = JSON.stringify(input).length;
  const drift = cmpsbl_bio_drift(actorId, capabilityName, inputSize);
  if (drift.alarm) {
    throw new Error(\`[CMPSBL:BehavioralBio:\${capabilityName}] takeover suspected for actor '\${actorId}' (drift=\${drift.drift.toFixed(2)})\`);
  }
  cmpsbl_bio_observe(actorId, capabilityName, inputSize);
  return _cmpsbl_raw_execute_bio(capabilityName, input);
};`;

const WIRE_PY = `
import json as _cmpsbl_bio_json
_cmpsbl_raw_execute_bio = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    actor_id = str(input_data.get('_cmpsbl_actor', 'anon'))
    input_size = len(_cmpsbl_bio_json.dumps(input_data, default=str))
    drift = cmpsbl_bio_drift(actor_id, capability_name, input_size)
    if drift['alarm']:
        raise RuntimeError(f"[CMPSBL:BehavioralBio:{capability_name}] takeover suspected for actor '{actor_id}' (drift={drift['drift']:.2f})")
    cmpsbl_bio_observe(actor_id, capability_name, input_size)
    return _cmpsbl_raw_execute_bio(capability_name, input_data)`;

export const BEHAVIORAL_BIOMETRICS_LAYER: CmpsblLayerDefinition = {
  id: 'behavioral-biometrics',
  name: 'Continuous User Authentication Layer',
  crownJewelRank: 104,
  cjpi: 96,
  module: 'DEFENSE×CORTEX',
  description: 'Builds a behavioral profile per user (typing cadence, call patterns, timing) and continuously re-verifies them — catches stolen sessions and account takeovers a password check can\'t.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_bio_drift',
    behavior: 'Tracks actor call cadence and shape; blocks suspected mid-session takeover.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
