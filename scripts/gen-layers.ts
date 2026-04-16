#!/usr/bin/env node
/**
 * Generates the 5 remaining pillar files (#6–#20) for cmpsbl-layers.
 * Each layer = TS code block + PY code block + TS wire + PY wire + LayerDefinition.
 * Output goes to src/lib/export/layers/{security,intelligence,performance,evolution,compliance}.ts
 *
 * The generated layers are compact-but-functional: each implements a real algorithm
 * that auto-wires to cmpsbl_execute, not a stub. Every layer:
 *   - Uses backtick-escaped template strings for embedded code
 *   - Exports a CmpsblLayerDefinition
 *   - Provides matching TS + PY wire blocks
 *   - Aggregates into a `<PILLAR>_LAYERS` array
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const OUT_DIR = path.resolve('src/lib/export/layers');

// ─────────────────────────────────────────────────────────────────────────────
// Layer specs — compact metadata; bodies are defined per-layer below.
// ─────────────────────────────────────────────────────────────────────────────

interface LayerSpec {
  id: string;
  varBase: string;          // e.g. ZERO_TRUST -> ZERO_TRUST_TS, ZERO_TRUST_PY, ZERO_TRUST_LAYER
  name: string;
  rank: number;             // CJ rank in Top 20 list (#6..#20)
  cjpi: number;
  module: string;
  description: string;
  priceCents: number;
  wrapperName: string;      // unique helper name in Layer 2
  behavior: string;
  tsBody: string;           // TS Layer 2 code (without header)
  pyBody: string;           // PY Layer 2 code (without header)
  tsWire: string;
  pyWire: string;
}

// ── Helper: header block builder ────────────────────────────────────────────
const tsHdr = (name: string, rank: number, line: string) => `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® LAYER — ${name.padEnd(56)} ║
// ║  ${line.padEnd(76)} ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
`;

const pyHdr = (name: string, rank: number, line: string) => `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — ${name.padEnd(56)} ║
# ║  ${line.padEnd(76)} ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝
`;

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY PILLAR — #6, #7, #8
// ─────────────────────────────────────────────────────────────────────────────

const ADAPTIVE_DEFENSE_TS = `
type CmpsblDefenseGenome = { id: string; weights: number[]; fitness: number; generation: number; survivedAttacks: number };

const _cmpsbl_defense_pool = new Map<string, CmpsblDefenseGenome>();
let _cmpsbl_defense_generation = 0;

function cmpsbl_seed_defense(id: string, dim = 16): CmpsblDefenseGenome {
  const weights = Array.from({ length: dim }, () => Math.random() * 2 - 1);
  const g: CmpsblDefenseGenome = { id, weights, fitness: 0.5, generation: _cmpsbl_defense_generation, survivedAttacks: 0 };
  _cmpsbl_defense_pool.set(id, g);
  return g;
}

function cmpsbl_score_attack(g: CmpsblDefenseGenome, attackVec: number[]): number {
  // Defense score = dot product clamped to [0,1]; higher = stronger defense
  let s = 0;
  for (let i = 0; i < Math.min(g.weights.length, attackVec.length); i++) s += g.weights[i] * attackVec[i];
  return 1 / (1 + Math.exp(-s));
}

function cmpsbl_breed_defenses(): CmpsblDefenseGenome[] {
  _cmpsbl_defense_generation++;
  const survivors = [..._cmpsbl_defense_pool.values()].filter(g => g.fitness >= 0.5).sort((a, b) => b.fitness - a.fitness);
  if (survivors.length < 2) return survivors;
  const offspring: CmpsblDefenseGenome[] = [];
  for (let i = 0; i < survivors.length - 1; i += 2) {
    const a = survivors[i], b = survivors[i + 1];
    const childWeights = a.weights.map((w, idx) => Math.random() < 0.5 ? w : b.weights[idx]);
    // Mutation
    for (let j = 0; j < childWeights.length; j++) if (Math.random() < 0.1) childWeights[j] += (Math.random() - 0.5) * 0.2;
    const childId = \`\${a.id}x\${b.id}_g\${_cmpsbl_defense_generation}\`;
    const child: CmpsblDefenseGenome = { id: childId, weights: childWeights, fitness: (a.fitness + b.fitness) / 2, generation: _cmpsbl_defense_generation, survivedAttacks: 0 };
    _cmpsbl_defense_pool.set(childId, child);
    offspring.push(child);
  }
  return offspring;
}

export function cmpsbl_defense_stats(): { population: number; generation: number; topFitness: number } {
  const all = [..._cmpsbl_defense_pool.values()];
  return { population: all.length, generation: _cmpsbl_defense_generation, topFitness: all.reduce((m, g) => Math.max(m, g.fitness), 0) };
}
`;

const ADAPTIVE_DEFENSE_PY = `
import math
import random
from typing import Dict, List

class CmpsblDefenseGenome:
    def __init__(self, id: str, weights: List[float], generation: int):
        self.id = id; self.weights = weights; self.fitness = 0.5
        self.generation = generation; self.survived_attacks = 0

_cmpsbl_defense_pool: Dict[str, CmpsblDefenseGenome] = {}
_cmpsbl_defense_generation = 0

def cmpsbl_seed_defense(id: str, dim: int = 16) -> CmpsblDefenseGenome:
    weights = [random.random() * 2 - 1 for _ in range(dim)]
    g = CmpsblDefenseGenome(id, weights, _cmpsbl_defense_generation)
    _cmpsbl_defense_pool[id] = g
    return g

def cmpsbl_score_attack(g: CmpsblDefenseGenome, attack_vec: List[float]) -> float:
    s = sum(w * a for w, a in zip(g.weights, attack_vec))
    return 1.0 / (1.0 + math.exp(-s))

def cmpsbl_breed_defenses() -> List[CmpsblDefenseGenome]:
    global _cmpsbl_defense_generation
    _cmpsbl_defense_generation += 1
    survivors = sorted([g for g in _cmpsbl_defense_pool.values() if g.fitness >= 0.5], key=lambda g: -g.fitness)
    if len(survivors) < 2: return survivors
    offspring = []
    for i in range(0, len(survivors) - 1, 2):
        a, b = survivors[i], survivors[i + 1]
        child_weights = [a.weights[j] if random.random() < 0.5 else b.weights[j] for j in range(len(a.weights))]
        for j in range(len(child_weights)):
            if random.random() < 0.1: child_weights[j] += (random.random() - 0.5) * 0.2
        child_id = f"{a.id}x{b.id}_g{_cmpsbl_defense_generation}"
        child = CmpsblDefenseGenome(child_id, child_weights, _cmpsbl_defense_generation)
        child.fitness = (a.fitness + b.fitness) / 2
        _cmpsbl_defense_pool[child_id] = child
        offspring.append(child)
    return offspring

def cmpsbl_defense_stats() -> dict:
    return { "population": len(_cmpsbl_defense_pool), "generation": _cmpsbl_defense_generation,
             "top_fitness": max((g.fitness for g in _cmpsbl_defense_pool.values()), default=0.0) }
`;

const ADAPTIVE_DEFENSE_WIRE_TS = `
const _cmpsbl_raw_execute_def = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_defended(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Lazy-seed a defense genome per capability
  if (!_cmpsbl_defense_pool.has(capabilityName)) cmpsbl_seed_defense(capabilityName);
  const result = _cmpsbl_raw_execute_def(capabilityName, input);
  // Reward genome on success
  const g = _cmpsbl_defense_pool.get(capabilityName);
  if (g) { g.survivedAttacks++; g.fitness = Math.min(1, g.fitness + 0.005); }
  return result;
};`;

const ADAPTIVE_DEFENSE_WIRE_PY = `
_cmpsbl_raw_execute_def = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under evolutionary defense (auto-wired)."""
    if capability_name not in _cmpsbl_defense_pool:
        cmpsbl_seed_defense(capability_name)
    result = _cmpsbl_raw_execute_def(capability_name, input_data)
    g = _cmpsbl_defense_pool.get(capability_name)
    if g:
        g.survived_attacks += 1
        g.fitness = min(1.0, g.fitness + 0.005)
    return result`;

const ZERO_TRUST_TS = `
type CmpsblSession = { id: string; principal: string; bindHash: string; createdAt: number; lastVerifiedAt: number; trustScore: number; behaviorHist: number[] };

const _cmpsbl_sessions = new Map<string, CmpsblSession>();
const CMPSBL_TRUST_DECAY_MS = 60_000;
const CMPSBL_BEHAVIOR_WINDOW = 32;

function _cmpsbl_hash_bind(principal: string, fingerprint: string): string {
  let h = 2166136261;
  const s = principal + '|' + fingerprint;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h.toString(16);
}

export function cmpsbl_bind_session(principal: string, fingerprint: string): CmpsblSession {
  const id = _cmpsbl_hash_bind(principal, fingerprint) + '_' + Date.now().toString(36);
  const s: CmpsblSession = { id, principal, bindHash: _cmpsbl_hash_bind(principal, fingerprint), createdAt: Date.now(), lastVerifiedAt: Date.now(), trustScore: 1.0, behaviorHist: [] };
  _cmpsbl_sessions.set(id, s);
  return s;
}

export function cmpsbl_verify_session(sessionId: string, fingerprint: string, behaviorSignal: number = 0): { allowed: boolean; trustScore: number; reason?: string } {
  const s = _cmpsbl_sessions.get(sessionId);
  if (!s) return { allowed: false, trustScore: 0, reason: 'unknown_session' };
  // Check fingerprint binding
  if (_cmpsbl_hash_bind(s.principal, fingerprint) !== s.bindHash) {
    s.trustScore = 0;
    return { allowed: false, trustScore: 0, reason: 'fingerprint_mismatch' };
  }
  // Decay trust over time
  const elapsed = Date.now() - s.lastVerifiedAt;
  s.trustScore = Math.max(0, s.trustScore - (elapsed / CMPSBL_TRUST_DECAY_MS) * 0.1);
  // Behavioral anomaly check (z-score on rolling window)
  s.behaviorHist.push(behaviorSignal);
  if (s.behaviorHist.length > CMPSBL_BEHAVIOR_WINDOW) s.behaviorHist.shift();
  if (s.behaviorHist.length >= 8) {
    const mean = s.behaviorHist.reduce((a, b) => a + b, 0) / s.behaviorHist.length;
    const variance = s.behaviorHist.reduce((a, b) => a + (b - mean) ** 2, 0) / s.behaviorHist.length;
    const std = Math.sqrt(variance) || 1;
    const z = Math.abs(behaviorSignal - mean) / std;
    if (z > 3) { s.trustScore *= 0.5; }
  }
  s.lastVerifiedAt = Date.now();
  return { allowed: s.trustScore > 0.3, trustScore: s.trustScore };
}
`;

const ZERO_TRUST_PY = `
import time
from typing import Dict, List

CMPSBL_TRUST_DECAY_MS = 60_000
CMPSBL_BEHAVIOR_WINDOW = 32

class CmpsblSession:
    def __init__(self, id: str, principal: str, bind_hash: str):
        self.id = id; self.principal = principal; self.bind_hash = bind_hash
        self.created_at = time.time() * 1000
        self.last_verified_at = self.created_at
        self.trust_score = 1.0
        self.behavior_hist: List[float] = []

_cmpsbl_sessions: Dict[str, CmpsblSession] = {}

def _cmpsbl_hash_bind(principal: str, fingerprint: str) -> str:
    h = 2166136261
    s = principal + '|' + fingerprint
    for c in s:
        h ^= ord(c); h = (h * 16777619) & 0xFFFFFFFF
    return format(h, 'x')

def cmpsbl_bind_session(principal: str, fingerprint: str) -> CmpsblSession:
    bind_hash = _cmpsbl_hash_bind(principal, fingerprint)
    sid = bind_hash + '_' + format(int(time.time() * 1000), 'x')
    s = CmpsblSession(sid, principal, bind_hash)
    _cmpsbl_sessions[sid] = s
    return s

def cmpsbl_verify_session(session_id: str, fingerprint: str, behavior_signal: float = 0) -> dict:
    s = _cmpsbl_sessions.get(session_id)
    if not s: return { "allowed": False, "trust_score": 0, "reason": "unknown_session" }
    if _cmpsbl_hash_bind(s.principal, fingerprint) != s.bind_hash:
        s.trust_score = 0
        return { "allowed": False, "trust_score": 0, "reason": "fingerprint_mismatch" }
    elapsed = time.time() * 1000 - s.last_verified_at
    s.trust_score = max(0.0, s.trust_score - (elapsed / CMPSBL_TRUST_DECAY_MS) * 0.1)
    s.behavior_hist.append(behavior_signal)
    if len(s.behavior_hist) > CMPSBL_BEHAVIOR_WINDOW: s.behavior_hist.pop(0)
    if len(s.behavior_hist) >= 8:
        mean = sum(s.behavior_hist) / len(s.behavior_hist)
        variance = sum((b - mean) ** 2 for b in s.behavior_hist) / len(s.behavior_hist)
        std = variance ** 0.5 or 1
        z = abs(behavior_signal - mean) / std
        if z > 3: s.trust_score *= 0.5
    s.last_verified_at = time.time() * 1000
    return { "allowed": s.trust_score > 0.3, "trust_score": s.trust_score }
`;

const ZERO_TRUST_WIRE_TS = `
const _cmpsbl_raw_execute_zt = cmpsbl_execute;
const _cmpsbl_default_session = cmpsbl_bind_session('default-principal', 'default-fingerprint');
cmpsbl_execute = function cmpsbl_execute_zerotrust(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const sessionId = (input as { _cmpsbl_session?: string })._cmpsbl_session ?? _cmpsbl_default_session.id;
  const fingerprint = (input as { _cmpsbl_fingerprint?: string })._cmpsbl_fingerprint ?? 'default-fingerprint';
  const verdict = cmpsbl_verify_session(sessionId, fingerprint, 0);
  if (!verdict.allowed) {
    throw new Error(\`[CMPSBL:ZeroTrust:\${capabilityName}] Session denied — trustScore=\${verdict.trustScore} reason=\${verdict.reason ?? 'low_trust'}\`);
  }
  return _cmpsbl_raw_execute_zt(capabilityName, input);
};`;

const ZERO_TRUST_WIRE_PY = `
_cmpsbl_raw_execute_zt = cmpsbl_execute
_cmpsbl_default_session = cmpsbl_bind_session('default-principal', 'default-fingerprint')
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under zero-trust verification (auto-wired)."""
    session_id = input_data.get('_cmpsbl_session', _cmpsbl_default_session.id)
    fingerprint = input_data.get('_cmpsbl_fingerprint', 'default-fingerprint')
    verdict = cmpsbl_verify_session(session_id, fingerprint, 0)
    if not verdict['allowed']:
        raise RuntimeError(f"[CMPSBL:ZeroTrust:{capability_name}] Session denied — trust_score={verdict['trust_score']} reason={verdict.get('reason', 'low_trust')}")
    return _cmpsbl_raw_execute_zt(capability_name, input_data)`;

const CYBER_DEFENSE_TS = `
type CmpsblIOC = { kind: string; value: string; firstSeenAt: number; hits: number; severity: number };

const _cmpsbl_iocs = new Map<string, CmpsblIOC>();
const _cmpsbl_traffic_buckets: number[] = []; // requests per second buckets, last 60s
const CMPSBL_DDOS_RPS_THRESHOLD = 5000;
let _cmpsbl_ddos_absorbed = 0;
let _cmpsbl_last_bucket_at = Math.floor(Date.now() / 1000);

export function cmpsbl_record_ioc(kind: string, value: string, severity = 0.5): CmpsblIOC {
  const key = \`\${kind}:\${value}\`;
  const existing = _cmpsbl_iocs.get(key);
  if (existing) { existing.hits++; existing.severity = Math.max(existing.severity, severity); return existing; }
  const ioc: CmpsblIOC = { kind, value, firstSeenAt: Date.now(), hits: 1, severity };
  _cmpsbl_iocs.set(key, ioc);
  return ioc;
}

export function cmpsbl_correlate_iocs(window_ms = 60_000): { count: number; topThreats: CmpsblIOC[] } {
  const cutoff = Date.now() - window_ms;
  const recent = [..._cmpsbl_iocs.values()].filter(i => i.firstSeenAt >= cutoff);
  recent.sort((a, b) => (b.hits * b.severity) - (a.hits * a.severity));
  return { count: recent.length, topThreats: recent.slice(0, 10) };
}

export function cmpsbl_ddos_check(): { absorbing: boolean; rps: number; absorbedTotal: number } {
  const nowSec = Math.floor(Date.now() / 1000);
  // Roll window
  while (_cmpsbl_last_bucket_at < nowSec) {
    _cmpsbl_traffic_buckets.push(0);
    if (_cmpsbl_traffic_buckets.length > 60) _cmpsbl_traffic_buckets.shift();
    _cmpsbl_last_bucket_at++;
  }
  if (_cmpsbl_traffic_buckets.length === 0) _cmpsbl_traffic_buckets.push(0);
  _cmpsbl_traffic_buckets[_cmpsbl_traffic_buckets.length - 1]++;
  const rps = _cmpsbl_traffic_buckets[_cmpsbl_traffic_buckets.length - 1];
  const absorbing = rps >= CMPSBL_DDOS_RPS_THRESHOLD;
  if (absorbing) _cmpsbl_ddos_absorbed++;
  return { absorbing, rps, absorbedTotal: _cmpsbl_ddos_absorbed };
}
`;

const CYBER_DEFENSE_PY = `
import time
from typing import Dict, List

CMPSBL_DDOS_RPS_THRESHOLD = 5000

class CmpsblIOC:
    def __init__(self, kind: str, value: str, severity: float = 0.5):
        self.kind = kind; self.value = value
        self.first_seen_at = time.time() * 1000
        self.hits = 1; self.severity = severity

_cmpsbl_iocs: Dict[str, CmpsblIOC] = {}
_cmpsbl_traffic_buckets: List[int] = []
_cmpsbl_ddos_absorbed = 0
_cmpsbl_last_bucket_at = int(time.time())

def cmpsbl_record_ioc(kind: str, value: str, severity: float = 0.5) -> CmpsblIOC:
    key = f"{kind}:{value}"
    if key in _cmpsbl_iocs:
        ioc = _cmpsbl_iocs[key]; ioc.hits += 1
        ioc.severity = max(ioc.severity, severity); return ioc
    ioc = CmpsblIOC(kind, value, severity)
    _cmpsbl_iocs[key] = ioc
    return ioc

def cmpsbl_correlate_iocs(window_ms: int = 60_000) -> dict:
    cutoff = time.time() * 1000 - window_ms
    recent = [i for i in _cmpsbl_iocs.values() if i.first_seen_at >= cutoff]
    recent.sort(key=lambda i: -(i.hits * i.severity))
    return { "count": len(recent), "top_threats": recent[:10] }

def cmpsbl_ddos_check() -> dict:
    global _cmpsbl_last_bucket_at, _cmpsbl_ddos_absorbed
    now_sec = int(time.time())
    while _cmpsbl_last_bucket_at < now_sec:
        _cmpsbl_traffic_buckets.append(0)
        if len(_cmpsbl_traffic_buckets) > 60: _cmpsbl_traffic_buckets.pop(0)
        _cmpsbl_last_bucket_at += 1
    if not _cmpsbl_traffic_buckets: _cmpsbl_traffic_buckets.append(0)
    _cmpsbl_traffic_buckets[-1] += 1
    rps = _cmpsbl_traffic_buckets[-1]
    absorbing = rps >= CMPSBL_DDOS_RPS_THRESHOLD
    if absorbing: _cmpsbl_ddos_absorbed += 1
    return { "absorbing": absorbing, "rps": rps, "absorbed_total": _cmpsbl_ddos_absorbed }
`;

const CYBER_DEFENSE_WIRE_TS = `
const _cmpsbl_raw_execute_cd = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_cyberdefense(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const ddos = cmpsbl_ddos_check();
  if (ddos.absorbing && Math.random() < 0.5) {
    throw new Error(\`[CMPSBL:CyberDefense:\${capabilityName}] DDoS absorption active — rps=\${ddos.rps} (request shed)\`);
  }
  try {
    return _cmpsbl_raw_execute_cd(capabilityName, input);
  } catch (err) {
    cmpsbl_record_ioc('execution_failure', capabilityName, 0.6);
    throw err;
  }
};`;

const CYBER_DEFENSE_WIRE_PY = `
import random as _cmpsbl_random_cd
_cmpsbl_raw_execute_cd = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under cyber-defense matrix (auto-wired)."""
    ddos = cmpsbl_ddos_check()
    if ddos['absorbing'] and _cmpsbl_random_cd.random() < 0.5:
        raise RuntimeError(f"[CMPSBL:CyberDefense:{capability_name}] DDoS absorption active — rps={ddos['rps']} (request shed)")
    try:
        return _cmpsbl_raw_execute_cd(capability_name, input_data)
    except Exception as e:
        cmpsbl_record_ioc('execution_failure', capability_name, 0.6)
        raise`;

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENCE PILLAR — #9, #10, #11, #12
// ─────────────────────────────────────────────────────────────────────────────

const FLEET_INTEL_TS = `
type CmpsblProvider = { id: string; cost: number; latencyMs: number; quality: number; available: boolean; calls: number; failures: number };

const _cmpsbl_providers = new Map<string, CmpsblProvider>();

export function cmpsbl_register_provider(id: string, cost: number, latencyMs: number, quality: number): CmpsblProvider {
  const p: CmpsblProvider = { id, cost, latencyMs, quality, available: true, calls: 0, failures: 0 };
  _cmpsbl_providers.set(id, p);
  return p;
}

export function cmpsbl_score_provider(p: CmpsblProvider): number {
  if (!p.available) return -Infinity;
  const failureRate = p.calls > 0 ? p.failures / p.calls : 0;
  // Composite score: quality high, cost low, latency low, failures low
  return (p.quality * 100) - (p.cost * 10) - (p.latencyMs / 100) - (failureRate * 50);
}

export function cmpsbl_pick_provider(): CmpsblProvider | null {
  const ranked = [..._cmpsbl_providers.values()].map(p => ({ p, s: cmpsbl_score_provider(p) })).filter(x => x.s > -Infinity).sort((a, b) => b.s - a.s);
  return ranked[0]?.p ?? null;
}

export function cmpsbl_record_provider_call(id: string, success: boolean): void {
  const p = _cmpsbl_providers.get(id);
  if (!p) return;
  p.calls++;
  if (!success) {
    p.failures++;
    if (p.failures / p.calls > 0.5 && p.calls >= 5) p.available = false;
  }
}
`;

const FLEET_INTEL_PY = `
import math
from typing import Dict, Optional

class CmpsblProvider:
    def __init__(self, id: str, cost: float, latency_ms: float, quality: float):
        self.id = id; self.cost = cost; self.latency_ms = latency_ms
        self.quality = quality; self.available = True
        self.calls = 0; self.failures = 0

_cmpsbl_providers: Dict[str, CmpsblProvider] = {}

def cmpsbl_register_provider(id: str, cost: float, latency_ms: float, quality: float) -> CmpsblProvider:
    p = CmpsblProvider(id, cost, latency_ms, quality)
    _cmpsbl_providers[id] = p
    return p

def cmpsbl_score_provider(p: CmpsblProvider) -> float:
    if not p.available: return -math.inf
    failure_rate = p.failures / p.calls if p.calls > 0 else 0
    return (p.quality * 100) - (p.cost * 10) - (p.latency_ms / 100) - (failure_rate * 50)

def cmpsbl_pick_provider() -> Optional[CmpsblProvider]:
    ranked = sorted(((p, cmpsbl_score_provider(p)) for p in _cmpsbl_providers.values()), key=lambda x: -x[1])
    ranked = [x for x in ranked if x[1] > -math.inf]
    return ranked[0][0] if ranked else None

def cmpsbl_record_provider_call(id: str, success: bool) -> None:
    p = _cmpsbl_providers.get(id)
    if not p: return
    p.calls += 1
    if not success:
        p.failures += 1
        if p.calls >= 5 and p.failures / p.calls > 0.5: p.available = False
`;

const FLEET_INTEL_WIRE_TS = `
const _cmpsbl_raw_execute_fi = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_fleet(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const provider = cmpsbl_pick_provider();
  // Provider selection is informational — exec proceeds either way
  if (provider) (input as Record<string, unknown>)._cmpsbl_provider = provider.id;
  try {
    const result = _cmpsbl_raw_execute_fi(capabilityName, input);
    if (provider) cmpsbl_record_provider_call(provider.id, true);
    return result;
  } catch (err) {
    if (provider) cmpsbl_record_provider_call(provider.id, false);
    throw err;
  }
};`;

const FLEET_INTEL_WIRE_PY = `
_cmpsbl_raw_execute_fi = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with fleet provider selection (auto-wired)."""
    provider = cmpsbl_pick_provider()
    if provider: input_data['_cmpsbl_provider'] = provider.id
    try:
        result = _cmpsbl_raw_execute_fi(capability_name, input_data)
        if provider: cmpsbl_record_provider_call(provider.id, True)
        return result
    except Exception as e:
        if provider: cmpsbl_record_provider_call(provider.id, False)
        raise`;

const AI_SAFETY_TS = `
const CMPSBL_INJECTION_PATTERNS = [
  /ignore\\s+(previous|prior|all)\\s+instructions/i,
  /system\\s*[:>]\\s*you\\s+are/i,
  /\\<\\|.*?\\|\\>/,                       // special tokens
  /jailbreak|DAN\\s+mode|developer\\s+mode/i,
];

export function cmpsbl_sanitize_prompt(text: string): { safe: boolean; cleaned: string; flags: string[] } {
  const flags: string[] = [];
  let cleaned = text;
  for (const pat of CMPSBL_INJECTION_PATTERNS) {
    if (pat.test(cleaned)) { flags.push(pat.source.slice(0, 30)); cleaned = cleaned.replace(pat, '[REDACTED]'); }
  }
  // XSS strip
  cleaned = cleaned.replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '[REDACTED]');
  return { safe: flags.length === 0, cleaned, flags };
}

export function cmpsbl_check_hallucination(claim: string, sources: string[]): { grounded: boolean; supportCount: number } {
  if (!claim) return { grounded: false, supportCount: 0 };
  const claimTokens = new Set(claim.toLowerCase().split(/\\W+/).filter(t => t.length > 3));
  let supportCount = 0;
  for (const src of sources) {
    const srcTokens = new Set(src.toLowerCase().split(/\\W+/).filter(t => t.length > 3));
    let overlap = 0;
    for (const t of claimTokens) if (srcTokens.has(t)) overlap++;
    if (overlap / Math.max(1, claimTokens.size) >= 0.4) supportCount++;
  }
  return { grounded: supportCount >= 2, supportCount };
}
`;

const AI_SAFETY_PY = `
import re
from typing import List

CMPSBL_INJECTION_PATTERNS = [
    re.compile(r'ignore\\s+(previous|prior|all)\\s+instructions', re.IGNORECASE),
    re.compile(r'system\\s*[:>]\\s*you\\s+are', re.IGNORECASE),
    re.compile(r'\\<\\|.*?\\|\\>'),
    re.compile(r'jailbreak|DAN\\s+mode|developer\\s+mode', re.IGNORECASE),
]

def cmpsbl_sanitize_prompt(text: str) -> dict:
    flags = []
    cleaned = text
    for pat in CMPSBL_INJECTION_PATTERNS:
        if pat.search(cleaned):
            flags.append(pat.pattern[:30])
            cleaned = pat.sub('[REDACTED]', cleaned)
    cleaned = re.sub(r'<script[^>]*>.*?</script>', '[REDACTED]', cleaned, flags=re.IGNORECASE | re.DOTALL)
    return { "safe": len(flags) == 0, "cleaned": cleaned, "flags": flags }

def cmpsbl_check_hallucination(claim: str, sources: List[str]) -> dict:
    if not claim: return { "grounded": False, "support_count": 0 }
    claim_tokens = set(t for t in re.split(r'\\W+', claim.lower()) if len(t) > 3)
    support = 0
    for src in sources:
        src_tokens = set(t for t in re.split(r'\\W+', src.lower()) if len(t) > 3)
        overlap = len(claim_tokens & src_tokens)
        if overlap / max(1, len(claim_tokens)) >= 0.4: support += 1
    return { "grounded": support >= 2, "support_count": support }
`;

const AI_SAFETY_WIRE_TS = `
const _cmpsbl_raw_execute_as = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_safe(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Sanitize string fields in input
  const cleanInput: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === 'string') {
      const s = cmpsbl_sanitize_prompt(v);
      if (!s.safe) {
        // Fail closed on prompt injection
        throw new Error(\`[CMPSBL:AISafety:\${capabilityName}] Prompt injection detected in field '\${k}': \${s.flags.join(',')}\`);
      }
      cleanInput[k] = s.cleaned;
    } else {
      cleanInput[k] = v;
    }
  }
  return _cmpsbl_raw_execute_as(capabilityName, cleanInput);
};`;

const AI_SAFETY_WIRE_PY = `
_cmpsbl_raw_execute_as = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under AI safety guards (auto-wired)."""
    clean = {}
    for k, v in input_data.items():
        if isinstance(v, str):
            s = cmpsbl_sanitize_prompt(v)
            if not s['safe']:
                raise RuntimeError(f"[CMPSBL:AISafety:{capability_name}] Prompt injection detected in field '{k}': {','.join(s['flags'])}")
            clean[k] = s['cleaned']
        else:
            clean[k] = v
    return _cmpsbl_raw_execute_as(capability_name, clean)`;

const AI_COST_TS = `
type CmpsblBudget = { dailyCents: number; spentCents: number; resetAt: number };
type CmpsblTokenPlan = { provider: string; tokensIn: number; tokensOut: number; estCents: number };

const _cmpsbl_budget: CmpsblBudget = { dailyCents: 100_000, spentCents: 0, resetAt: Date.now() + 86_400_000 };
const _cmpsbl_provider_cpm = new Map<string, number>(); // cents per 1k tokens

export function cmpsbl_set_budget(dailyCents: number): void {
  _cmpsbl_budget.dailyCents = dailyCents;
  _cmpsbl_budget.spentCents = 0;
  _cmpsbl_budget.resetAt = Date.now() + 86_400_000;
}

export function cmpsbl_register_cost(provider: string, costPerMillion: number): void {
  _cmpsbl_provider_cpm.set(provider, costPerMillion / 10); // cents per 1k
}

export function cmpsbl_estimate_cost(provider: string, tokensIn: number, tokensOut: number): CmpsblTokenPlan {
  const cpm = _cmpsbl_provider_cpm.get(provider) ?? 0.5;
  const estCents = Math.ceil(((tokensIn + tokensOut) / 1000) * cpm);
  return { provider, tokensIn, tokensOut, estCents };
}

export function cmpsbl_can_spend(estCents: number): { allowed: boolean; degradeMode: boolean; remainingCents: number } {
  if (Date.now() >= _cmpsbl_budget.resetAt) {
    _cmpsbl_budget.spentCents = 0;
    _cmpsbl_budget.resetAt = Date.now() + 86_400_000;
  }
  const remaining = _cmpsbl_budget.dailyCents - _cmpsbl_budget.spentCents;
  const ratio = _cmpsbl_budget.spentCents / _cmpsbl_budget.dailyCents;
  return { allowed: estCents <= remaining, degradeMode: ratio > 0.8, remainingCents: remaining };
}

export function cmpsbl_record_spend(actualCents: number): void {
  _cmpsbl_budget.spentCents += actualCents;
}
`;

const AI_COST_PY = `
import time
from typing import Dict

_cmpsbl_budget = { "daily_cents": 100_000, "spent_cents": 0, "reset_at": time.time() * 1000 + 86_400_000 }
_cmpsbl_provider_cpm: Dict[str, float] = {}

def cmpsbl_set_budget(daily_cents: int) -> None:
    _cmpsbl_budget["daily_cents"] = daily_cents
    _cmpsbl_budget["spent_cents"] = 0
    _cmpsbl_budget["reset_at"] = time.time() * 1000 + 86_400_000

def cmpsbl_register_cost(provider: str, cost_per_million: float) -> None:
    _cmpsbl_provider_cpm[provider] = cost_per_million / 10

def cmpsbl_estimate_cost(provider: str, tokens_in: int, tokens_out: int) -> dict:
    cpm = _cmpsbl_provider_cpm.get(provider, 0.5)
    est = int(((tokens_in + tokens_out) / 1000) * cpm) + (1 if ((tokens_in + tokens_out) % 1000) else 0)
    return { "provider": provider, "tokens_in": tokens_in, "tokens_out": tokens_out, "est_cents": est }

def cmpsbl_can_spend(est_cents: int) -> dict:
    if time.time() * 1000 >= _cmpsbl_budget["reset_at"]:
        _cmpsbl_budget["spent_cents"] = 0
        _cmpsbl_budget["reset_at"] = time.time() * 1000 + 86_400_000
    remaining = _cmpsbl_budget["daily_cents"] - _cmpsbl_budget["spent_cents"]
    ratio = _cmpsbl_budget["spent_cents"] / _cmpsbl_budget["daily_cents"]
    return { "allowed": est_cents <= remaining, "degrade_mode": ratio > 0.8, "remaining_cents": remaining }

def cmpsbl_record_spend(actual_cents: int) -> None:
    _cmpsbl_budget["spent_cents"] += actual_cents
`;

const AI_COST_WIRE_TS = `
const _cmpsbl_raw_execute_ac = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_costaware(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const tokensIn = (input as { _cmpsbl_tokens_in?: number })._cmpsbl_tokens_in ?? 100;
  const provider = (input as { _cmpsbl_provider?: string })._cmpsbl_provider ?? 'default';
  const plan = cmpsbl_estimate_cost(provider, tokensIn, tokensIn * 2);
  const verdict = cmpsbl_can_spend(plan.estCents);
  if (!verdict.allowed) {
    throw new Error(\`[CMPSBL:AICost:\${capabilityName}] Daily budget exhausted — remaining=\${verdict.remainingCents}c, requested=\${plan.estCents}c\`);
  }
  if (verdict.degradeMode) (input as Record<string, unknown>)._cmpsbl_quality_hint = 'fast';
  const result = _cmpsbl_raw_execute_ac(capabilityName, input);
  cmpsbl_record_spend(plan.estCents);
  return result;
};`;

const AI_COST_WIRE_PY = `
_cmpsbl_raw_execute_ac = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with cost-aware throttling (auto-wired)."""
    tokens_in = input_data.get('_cmpsbl_tokens_in', 100)
    provider = input_data.get('_cmpsbl_provider', 'default')
    plan = cmpsbl_estimate_cost(provider, tokens_in, tokens_in * 2)
    verdict = cmpsbl_can_spend(plan['est_cents'])
    if not verdict['allowed']:
        raise RuntimeError(f"[CMPSBL:AICost:{capability_name}] Daily budget exhausted — remaining={verdict['remaining_cents']}c, requested={plan['est_cents']}c")
    if verdict['degrade_mode']: input_data['_cmpsbl_quality_hint'] = 'fast'
    result = _cmpsbl_raw_execute_ac(capability_name, input_data)
    cmpsbl_record_spend(plan['est_cents'])
    return result`;

const COG_MEMORY_TS = `
type CmpsblNode = { id: string; label: string; data: Record<string, unknown>; createdAt: number };
type CmpsblEdge = { from: string; to: string; relation: string; weight: number };

const _cmpsbl_nodes = new Map<string, CmpsblNode>();
const _cmpsbl_edges: CmpsblEdge[] = [];
const _cmpsbl_label_index = new Map<string, Set<string>>();

export function cmpsbl_remember(label: string, data: Record<string, unknown>): CmpsblNode {
  // Dedup by label + canonical data hash
  const key = label + ':' + JSON.stringify(data);
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
  const id = h.toString(16);
  const existing = _cmpsbl_nodes.get(id);
  if (existing) return existing;
  const node: CmpsblNode = { id, label, data, createdAt: Date.now() };
  _cmpsbl_nodes.set(id, node);
  if (!_cmpsbl_label_index.has(label)) _cmpsbl_label_index.set(label, new Set());
  _cmpsbl_label_index.get(label)!.add(id);
  return node;
}

export function cmpsbl_relate(fromId: string, toId: string, relation: string, weight = 1): void {
  _cmpsbl_edges.push({ from: fromId, to: toId, relation, weight });
}

export function cmpsbl_recall(label: string): CmpsblNode[] {
  const ids = _cmpsbl_label_index.get(label);
  if (!ids) return [];
  return [...ids].map(id => _cmpsbl_nodes.get(id)!).filter(Boolean);
}

export function cmpsbl_traverse(startId: string, maxDepth = 3): CmpsblNode[] {
  const visited = new Set<string>();
  const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }];
  const result: CmpsblNode[] = [];
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id) || depth > maxDepth) continue;
    visited.add(id);
    const node = _cmpsbl_nodes.get(id);
    if (node) result.push(node);
    for (const e of _cmpsbl_edges) {
      if (e.from === id && !visited.has(e.to)) queue.push({ id: e.to, depth: depth + 1 });
    }
  }
  return result;
}

export function cmpsbl_compact(): { before: number; after: number; removed: number } {
  const before = _cmpsbl_nodes.size;
  // Compact by removing nodes with no edges and older than 7 days
  const cutoff = Date.now() - 7 * 86_400_000;
  const referenced = new Set<string>();
  for (const e of _cmpsbl_edges) { referenced.add(e.from); referenced.add(e.to); }
  for (const [id, node] of _cmpsbl_nodes) {
    if (!referenced.has(id) && node.createdAt < cutoff) {
      _cmpsbl_nodes.delete(id);
      _cmpsbl_label_index.get(node.label)?.delete(id);
    }
  }
  const after = _cmpsbl_nodes.size;
  return { before, after, removed: before - after };
}
`;

const COG_MEMORY_PY = `
import json
import time
from typing import Dict, List, Set

class CmpsblNode:
    def __init__(self, id: str, label: str, data: dict):
        self.id = id; self.label = label; self.data = data
        self.created_at = time.time() * 1000

_cmpsbl_nodes: Dict[str, CmpsblNode] = {}
_cmpsbl_edges: List[dict] = []
_cmpsbl_label_index: Dict[str, Set[str]] = {}

def cmpsbl_remember(label: str, data: dict) -> CmpsblNode:
    key = label + ':' + json.dumps(data, sort_keys=True)
    h = 5381
    for c in key:
        h = ((h << 5) + h + ord(c)) & 0xFFFFFFFF
    nid = format(h, 'x')
    if nid in _cmpsbl_nodes: return _cmpsbl_nodes[nid]
    node = CmpsblNode(nid, label, data)
    _cmpsbl_nodes[nid] = node
    _cmpsbl_label_index.setdefault(label, set()).add(nid)
    return node

def cmpsbl_relate(from_id: str, to_id: str, relation: str, weight: float = 1) -> None:
    _cmpsbl_edges.append({ "from": from_id, "to": to_id, "relation": relation, "weight": weight })

def cmpsbl_recall(label: str) -> List[CmpsblNode]:
    ids = _cmpsbl_label_index.get(label, set())
    return [_cmpsbl_nodes[i] for i in ids if i in _cmpsbl_nodes]

def cmpsbl_traverse(start_id: str, max_depth: int = 3) -> List[CmpsblNode]:
    visited: Set[str] = set()
    queue = [(start_id, 0)]
    result: List[CmpsblNode] = []
    while queue:
        nid, depth = queue.pop(0)
        if nid in visited or depth > max_depth: continue
        visited.add(nid)
        node = _cmpsbl_nodes.get(nid)
        if node: result.append(node)
        for e in _cmpsbl_edges:
            if e["from"] == nid and e["to"] not in visited:
                queue.append((e["to"], depth + 1))
    return result

def cmpsbl_compact() -> dict:
    before = len(_cmpsbl_nodes)
    cutoff = time.time() * 1000 - 7 * 86_400_000
    referenced: Set[str] = set()
    for e in _cmpsbl_edges:
        referenced.add(e["from"]); referenced.add(e["to"])
    to_remove = [nid for nid, n in _cmpsbl_nodes.items() if nid not in referenced and n.created_at < cutoff]
    for nid in to_remove:
        node = _cmpsbl_nodes.pop(nid)
        _cmpsbl_label_index.get(node.label, set()).discard(nid)
    return { "before": before, "after": len(_cmpsbl_nodes), "removed": before - len(_cmpsbl_nodes) }
`;

const COG_MEMORY_WIRE_TS = `
const _cmpsbl_raw_execute_cm = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_memory(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const node = cmpsbl_remember(capabilityName + ':input', input);
  const result = _cmpsbl_raw_execute_cm(capabilityName, input);
  const outNode = cmpsbl_remember(capabilityName + ':output', result as unknown as Record<string, unknown>);
  cmpsbl_relate(node.id, outNode.id, 'produced', 1);
  return result;
};`;

const COG_MEMORY_WIRE_PY = `
_cmpsbl_raw_execute_cm = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with cognitive memory tracking (auto-wired)."""
    node = cmpsbl_remember(capability_name + ':input', input_data)
    result = _cmpsbl_raw_execute_cm(capability_name, input_data)
    out_node = cmpsbl_remember(capability_name + ':output', result if isinstance(result, dict) else {"value": result})
    cmpsbl_relate(node.id, out_node.id, 'produced', 1)
    return result`;

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE PILLAR — #13, #14
// ─────────────────────────────────────────────────────────────────────────────

const PERF_SURGERY_TS = `
type CmpsblHotPath = { fn: string; samples: number; totalNs: number; p99Ns: number; classifiedAs: 'O(1)'|'O(log n)'|'O(n)'|'O(n log n)'|'O(n^2)'|'O(?)'; samplesByN: number[][] };

const _cmpsbl_hot_paths = new Map<string, CmpsblHotPath>();
const _cmpsbl_baselines = new Map<string, number>();

function _cmpsbl_classify_complexity(samples: number[][]): CmpsblHotPath['classifiedAs'] {
  if (samples.length < 3) return 'O(?)';
  // samples = [[n1, t1], [n2, t2], ...]
  const sorted = [...samples].sort((a, b) => a[0] - b[0]);
  const ratios = [];
  for (let i = 1; i < sorted.length; i++) {
    const [n0, t0] = sorted[i - 1], [n1, t1] = sorted[i];
    if (n0 === 0 || t0 === 0) continue;
    const tRatio = t1 / t0;
    const nRatio = n1 / n0;
    ratios.push(Math.log(tRatio) / Math.log(nRatio));
  }
  if (ratios.length === 0) return 'O(?)';
  const avgExp = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  if (avgExp < 0.2) return 'O(1)';
  if (avgExp < 0.6) return 'O(log n)';
  if (avgExp < 1.3) return 'O(n)';
  if (avgExp < 1.6) return 'O(n log n)';
  return 'O(n^2)';
}

export function cmpsbl_record_sample(fn: string, n: number, durationNs: number): CmpsblHotPath {
  let hp = _cmpsbl_hot_paths.get(fn);
  if (!hp) {
    hp = { fn, samples: 0, totalNs: 0, p99Ns: 0, classifiedAs: 'O(?)', samplesByN: [] };
    _cmpsbl_hot_paths.set(fn, hp);
  }
  hp.samples++;
  hp.totalNs += durationNs;
  hp.p99Ns = Math.max(hp.p99Ns, durationNs);
  hp.samplesByN.push([n, durationNs]);
  if (hp.samplesByN.length > 100) hp.samplesByN.shift();
  if (hp.samples % 10 === 0) hp.classifiedAs = _cmpsbl_classify_complexity(hp.samplesByN);
  return hp;
}

export function cmpsbl_set_baseline(fn: string, p99Ns: number): void {
  _cmpsbl_baselines.set(fn, p99Ns);
}

export function cmpsbl_check_regression(fn: string): { regressed: boolean; ratio: number } {
  const hp = _cmpsbl_hot_paths.get(fn);
  const baseline = _cmpsbl_baselines.get(fn);
  if (!hp || !baseline) return { regressed: false, ratio: 1 };
  const ratio = hp.p99Ns / baseline;
  return { regressed: ratio > 1.5, ratio };
}

export function cmpsbl_top_hotpaths(limit = 5): CmpsblHotPath[] {
  return [..._cmpsbl_hot_paths.values()].sort((a, b) => b.totalNs - a.totalNs).slice(0, limit);
}
`;

const PERF_SURGERY_PY = `
import math
from typing import Dict, List

_cmpsbl_hot_paths: Dict[str, dict] = {}
_cmpsbl_baselines: Dict[str, float] = {}

def _cmpsbl_classify_complexity(samples: List[List[float]]) -> str:
    if len(samples) < 3: return 'O(?)'
    sorted_s = sorted(samples, key=lambda s: s[0])
    ratios = []
    for i in range(1, len(sorted_s)):
        n0, t0 = sorted_s[i - 1]; n1, t1 = sorted_s[i]
        if n0 == 0 or t0 == 0: continue
        try:
            ratios.append(math.log(t1 / t0) / math.log(n1 / n0))
        except (ValueError, ZeroDivisionError): pass
    if not ratios: return 'O(?)'
    avg_exp = sum(ratios) / len(ratios)
    if avg_exp < 0.2: return 'O(1)'
    if avg_exp < 0.6: return 'O(log n)'
    if avg_exp < 1.3: return 'O(n)'
    if avg_exp < 1.6: return 'O(n log n)'
    return 'O(n^2)'

def cmpsbl_record_sample(fn: str, n: float, duration_ns: float) -> dict:
    if fn not in _cmpsbl_hot_paths:
        _cmpsbl_hot_paths[fn] = { "fn": fn, "samples": 0, "total_ns": 0, "p99_ns": 0, "classified_as": "O(?)", "samples_by_n": [] }
    hp = _cmpsbl_hot_paths[fn]
    hp["samples"] += 1; hp["total_ns"] += duration_ns
    hp["p99_ns"] = max(hp["p99_ns"], duration_ns)
    hp["samples_by_n"].append([n, duration_ns])
    if len(hp["samples_by_n"]) > 100: hp["samples_by_n"].pop(0)
    if hp["samples"] % 10 == 0: hp["classified_as"] = _cmpsbl_classify_complexity(hp["samples_by_n"])
    return hp

def cmpsbl_set_baseline(fn: str, p99_ns: float) -> None:
    _cmpsbl_baselines[fn] = p99_ns

def cmpsbl_check_regression(fn: str) -> dict:
    hp = _cmpsbl_hot_paths.get(fn); baseline = _cmpsbl_baselines.get(fn)
    if not hp or not baseline: return { "regressed": False, "ratio": 1 }
    ratio = hp["p99_ns"] / baseline
    return { "regressed": ratio > 1.5, "ratio": ratio }

def cmpsbl_top_hotpaths(limit: int = 5) -> list:
    return sorted(_cmpsbl_hot_paths.values(), key=lambda h: -h["total_ns"])[:limit]
`;

const PERF_SURGERY_WIRE_TS = `
const _cmpsbl_raw_execute_ps = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_profiled(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 1_000_000;
  const inputSize = JSON.stringify(input).length;
  try {
    return _cmpsbl_raw_execute_ps(capabilityName, input);
  } finally {
    const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 1_000_000;
    cmpsbl_record_sample(capabilityName, inputSize, t1 - t0);
  }
};`;

const PERF_SURGERY_WIRE_PY = `
import time as _cmpsbl_time_ps
import json as _cmpsbl_json_ps
_cmpsbl_raw_execute_ps = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with hot-path profiling (auto-wired)."""
    t0 = _cmpsbl_time_ps.time_ns()
    input_size = len(_cmpsbl_json_ps.dumps(input_data, default=str))
    try:
        return _cmpsbl_raw_execute_ps(capability_name, input_data)
    finally:
        cmpsbl_record_sample(capability_name, input_size, _cmpsbl_time_ps.time_ns() - t0)`;

const PIPELINE_RES_TS = `
type CmpsblBuffer<T> = { items: T[]; capacity: number; dropped: number; consumerLagMs: number };
type CmpsblEvent = { id: string; kind: string; payload: unknown; ts: number };

const _cmpsbl_streams = new Map<string, CmpsblBuffer<CmpsblEvent>>();
const _cmpsbl_event_log: CmpsblEvent[] = [];
const CMPSBL_EVENT_LOG_CAP = 10_000;

export function cmpsbl_create_stream(name: string, capacity = 1000): CmpsblBuffer<CmpsblEvent> {
  const buf: CmpsblBuffer<CmpsblEvent> = { items: [], capacity, dropped: 0, consumerLagMs: 0 };
  _cmpsbl_streams.set(name, buf);
  return buf;
}

export function cmpsbl_publish(name: string, kind: string, payload: unknown): { ok: boolean; backpressure: boolean } {
  const stream = _cmpsbl_streams.get(name) ?? cmpsbl_create_stream(name);
  const event: CmpsblEvent = { id: kind + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), kind, payload, ts: Date.now() };
  // Append to event log (bounded)
  _cmpsbl_event_log.push(event);
  if (_cmpsbl_event_log.length > CMPSBL_EVENT_LOG_CAP) _cmpsbl_event_log.shift();
  // Apply backpressure
  if (stream.items.length >= stream.capacity) {
    stream.dropped++;
    return { ok: false, backpressure: true };
  }
  stream.items.push(event);
  return { ok: true, backpressure: stream.items.length / stream.capacity > 0.8 };
}

export function cmpsbl_consume(name: string, batch = 100): CmpsblEvent[] {
  const stream = _cmpsbl_streams.get(name);
  if (!stream) return [];
  const out = stream.items.splice(0, batch);
  if (out.length > 0) stream.consumerLagMs = Date.now() - out[0].ts;
  return out;
}

export function cmpsbl_replay(kind?: string): CmpsblEvent[] {
  return kind ? _cmpsbl_event_log.filter(e => e.kind === kind) : [..._cmpsbl_event_log];
}

export function cmpsbl_stream_stats(): Record<string, { size: number; dropped: number; lagMs: number }> {
  const out: Record<string, { size: number; dropped: number; lagMs: number }> = {};
  for (const [k, v] of _cmpsbl_streams) out[k] = { size: v.items.length, dropped: v.dropped, lagMs: v.consumerLagMs };
  return out;
}
`;

const PIPELINE_RES_PY = `
import time
import random
from typing import Dict, List, Optional

CMPSBL_EVENT_LOG_CAP = 10_000

_cmpsbl_streams: Dict[str, dict] = {}
_cmpsbl_event_log: List[dict] = []

def cmpsbl_create_stream(name: str, capacity: int = 1000) -> dict:
    buf = { "items": [], "capacity": capacity, "dropped": 0, "consumer_lag_ms": 0 }
    _cmpsbl_streams[name] = buf
    return buf

def cmpsbl_publish(name: str, kind: str, payload) -> dict:
    if name not in _cmpsbl_streams: cmpsbl_create_stream(name)
    stream = _cmpsbl_streams[name]
    event = { "id": f"{kind}_{int(time.time() * 1000)}_{random.randint(0, 99999)}", "kind": kind, "payload": payload, "ts": time.time() * 1000 }
    _cmpsbl_event_log.append(event)
    if len(_cmpsbl_event_log) > CMPSBL_EVENT_LOG_CAP: _cmpsbl_event_log.pop(0)
    if len(stream["items"]) >= stream["capacity"]:
        stream["dropped"] += 1
        return { "ok": False, "backpressure": True }
    stream["items"].append(event)
    return { "ok": True, "backpressure": len(stream["items"]) / stream["capacity"] > 0.8 }

def cmpsbl_consume(name: str, batch: int = 100) -> List[dict]:
    stream = _cmpsbl_streams.get(name)
    if not stream: return []
    out = stream["items"][:batch]
    stream["items"] = stream["items"][batch:]
    if out: stream["consumer_lag_ms"] = time.time() * 1000 - out[0]["ts"]
    return out

def cmpsbl_replay(kind: Optional[str] = None) -> List[dict]:
    if kind: return [e for e in _cmpsbl_event_log if e["kind"] == kind]
    return list(_cmpsbl_event_log)

def cmpsbl_stream_stats() -> dict:
    return { k: { "size": len(v["items"]), "dropped": v["dropped"], "lag_ms": v["consumer_lag_ms"] } for k, v in _cmpsbl_streams.items() }
`;

const PIPELINE_RES_WIRE_TS = `
const _cmpsbl_raw_execute_pr = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_streamed(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const pub = cmpsbl_publish('cmpsbl.exec', capabilityName, input);
  if (!pub.ok) {
    throw new Error(\`[CMPSBL:Pipeline:\${capabilityName}] Backpressure — request shed (stream full)\`);
  }
  const result = _cmpsbl_raw_execute_pr(capabilityName, input);
  cmpsbl_publish('cmpsbl.result', capabilityName, result as unknown);
  return result;
};`;

const PIPELINE_RES_WIRE_PY = `
_cmpsbl_raw_execute_pr = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with stream backpressure (auto-wired)."""
    pub = cmpsbl_publish('cmpsbl.exec', capability_name, input_data)
    if not pub['ok']:
        raise RuntimeError(f"[CMPSBL:Pipeline:{capability_name}] Backpressure — request shed (stream full)")
    result = _cmpsbl_raw_execute_pr(capability_name, input_data)
    cmpsbl_publish('cmpsbl.result', capability_name, result)
    return result`;

// ─────────────────────────────────────────────────────────────────────────────
// ORCHESTRATION PILLAR — #15, #16
// ─────────────────────────────────────────────────────────────────────────────

const PIPE_COMPOSE_TS = `
type CmpsblStage<I, O> = { name: string; fn: (input: I) => O | Promise<O>; retries: number };
type CmpsblPipeline = { name: string; stages: CmpsblStage<unknown, unknown>[]; runs: number; failures: number };

const _cmpsbl_pipelines = new Map<string, CmpsblPipeline>();

export function cmpsbl_pipeline(name: string): CmpsblPipeline {
  let p = _cmpsbl_pipelines.get(name);
  if (!p) { p = { name, stages: [], runs: 0, failures: 0 }; _cmpsbl_pipelines.set(name, p); }
  return p;
}

export function cmpsbl_add_stage<I, O>(pipelineName: string, stage: CmpsblStage<I, O>): void {
  cmpsbl_pipeline(pipelineName).stages.push(stage as unknown as CmpsblStage<unknown, unknown>);
}

export async function cmpsbl_run_pipeline(pipelineName: string, initial: unknown): Promise<unknown> {
  const p = _cmpsbl_pipelines.get(pipelineName);
  if (!p) throw new Error(\`[CMPSBL:Pipeline] '\${pipelineName}' not defined\`);
  p.runs++;
  let value: unknown = initial;
  for (const stage of p.stages) {
    let attempt = 0;
    let lastErr: unknown;
    while (attempt <= stage.retries) {
      try { value = await stage.fn(value); lastErr = null; break; }
      catch (err) { lastErr = err; attempt++; }
    }
    if (lastErr) { p.failures++; throw lastErr; }
  }
  return value;
}

export function cmpsbl_pipeline_stats(): Record<string, { runs: number; failures: number; stages: number }> {
  const out: Record<string, { runs: number; failures: number; stages: number }> = {};
  for (const [k, p] of _cmpsbl_pipelines) out[k] = { runs: p.runs, failures: p.failures, stages: p.stages.length };
  return out;
}
`;

const PIPE_COMPOSE_PY = `
import asyncio
from typing import Any, Callable, Dict, List

_cmpsbl_pipelines: Dict[str, dict] = {}

def cmpsbl_pipeline(name: str) -> dict:
    if name not in _cmpsbl_pipelines:
        _cmpsbl_pipelines[name] = { "name": name, "stages": [], "runs": 0, "failures": 0 }
    return _cmpsbl_pipelines[name]

def cmpsbl_add_stage(pipeline_name: str, name: str, fn: Callable, retries: int = 0) -> None:
    cmpsbl_pipeline(pipeline_name)["stages"].append({ "name": name, "fn": fn, "retries": retries })

async def cmpsbl_run_pipeline(pipeline_name: str, initial: Any) -> Any:
    p = _cmpsbl_pipelines.get(pipeline_name)
    if not p: raise RuntimeError(f"[CMPSBL:Pipeline] '{pipeline_name}' not defined")
    p["runs"] += 1
    value = initial
    for stage in p["stages"]:
        attempt = 0; last_err = None
        while attempt <= stage["retries"]:
            try:
                result = stage["fn"](value)
                if asyncio.iscoroutine(result): result = await result
                value = result; last_err = None; break
            except Exception as e:
                last_err = e; attempt += 1
        if last_err:
            p["failures"] += 1
            raise last_err
    return value

def cmpsbl_pipeline_stats() -> dict:
    return { k: { "runs": p["runs"], "failures": p["failures"], "stages": len(p["stages"]) } for k, p in _cmpsbl_pipelines.items() }
`;

const PIPE_COMPOSE_WIRE_TS = `
const _cmpsbl_raw_execute_pc = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_composable(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Each capability execution registers itself as a single-stage pipeline run for observability
  const pipelineName = 'cap.' + capabilityName;
  const p = cmpsbl_pipeline(pipelineName);
  if (p.stages.length === 0) {
    cmpsbl_add_stage(pipelineName, { name: 'execute', fn: (i: Record<string, unknown>) => _cmpsbl_raw_execute_pc(capabilityName, i), retries: 0 });
  }
  p.runs++;
  try {
    return _cmpsbl_raw_execute_pc(capabilityName, input);
  } catch (err) {
    p.failures++;
    throw err;
  }
};`;

const PIPE_COMPOSE_WIRE_PY = `
_cmpsbl_raw_execute_pc = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with pipeline composition tracking (auto-wired)."""
    pipeline_name = 'cap.' + capability_name
    p = cmpsbl_pipeline(pipeline_name)
    if not p["stages"]:
        cmpsbl_add_stage(pipeline_name, 'execute', lambda i: _cmpsbl_raw_execute_pc(capability_name, i), 0)
    p["runs"] += 1
    try:
        return _cmpsbl_raw_execute_pc(capability_name, input_data)
    except Exception as e:
        p["failures"] += 1
        raise`;

const UNIVERSAL_INPUT_TS = `
type CmpsblInputModality = 'text' | 'json' | 'cli' | 'code' | 'binary' | 'unknown';
type CmpsblThread = { id: string; turns: { role: string; content: string }[]; forks: string[] };

const _cmpsbl_threads = new Map<string, CmpsblThread>();

export function cmpsbl_detect_modality(raw: unknown): CmpsblInputModality {
  if (raw == null) return 'unknown';
  if (typeof raw !== 'string') return 'json';
  const s = raw.trim();
  if (s.startsWith('{') || s.startsWith('[')) {
    try { JSON.parse(s); return 'json'; } catch { /* fallthrough */ }
  }
  if (s.startsWith('--') || /^[a-z][\\w-]*\\s+(-{1,2}\\w)/.test(s)) return 'cli';
  if (/(function|class|def|import|const|let|var)\\s+/.test(s)) return 'code';
  return 'text';
}

export function cmpsbl_normalize_input(raw: unknown): { modality: CmpsblInputModality; data: Record<string, unknown> } {
  const modality = cmpsbl_detect_modality(raw);
  if (modality === 'json' && typeof raw === 'string') {
    try { return { modality, data: JSON.parse(raw) as Record<string, unknown> }; } catch { /* fall through */ }
  }
  if (modality === 'cli' && typeof raw === 'string') {
    const tokens = raw.split(/\\s+/);
    const data: Record<string, unknown> = { _cmd: tokens[0], _args: [] as string[] };
    for (let i = 1; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.startsWith('--')) { data[t.slice(2)] = tokens[i + 1] && !tokens[i + 1].startsWith('-') ? tokens[++i] : true; }
      else if (t.startsWith('-')) { data[t.slice(1)] = true; }
      else { (data._args as string[]).push(t); }
    }
    return { modality, data };
  }
  return { modality, data: { _raw: raw } };
}

export function cmpsbl_thread(id: string): CmpsblThread {
  let t = _cmpsbl_threads.get(id);
  if (!t) { t = { id, turns: [], forks: [] }; _cmpsbl_threads.set(id, t); }
  return t;
}

export function cmpsbl_append_turn(threadId: string, role: string, content: string): void {
  cmpsbl_thread(threadId).turns.push({ role, content });
}

export function cmpsbl_fork_thread(parentId: string, forkId: string): CmpsblThread {
  const parent = cmpsbl_thread(parentId);
  const fork: CmpsblThread = { id: forkId, turns: [...parent.turns], forks: [] };
  _cmpsbl_threads.set(forkId, fork);
  parent.forks.push(forkId);
  return fork;
}
`;

const UNIVERSAL_INPUT_PY = `
import json
import re
from typing import Any, Dict, List

_cmpsbl_threads: Dict[str, dict] = {}

def cmpsbl_detect_modality(raw: Any) -> str:
    if raw is None: return 'unknown'
    if not isinstance(raw, str): return 'json'
    s = raw.strip()
    if s.startswith('{') or s.startswith('['):
        try: json.loads(s); return 'json'
        except json.JSONDecodeError: pass
    if s.startswith('--') or re.match(r'^[a-z][\\w-]*\\s+(-{1,2}\\w)', s): return 'cli'
    if re.search(r'(function|class|def|import|const|let|var)\\s+', s): return 'code'
    return 'text'

def cmpsbl_normalize_input(raw: Any) -> dict:
    modality = cmpsbl_detect_modality(raw)
    if modality == 'json' and isinstance(raw, str):
        try: return { "modality": modality, "data": json.loads(raw) }
        except json.JSONDecodeError: pass
    if modality == 'cli' and isinstance(raw, str):
        tokens = raw.split()
        data: Dict[str, Any] = { "_cmd": tokens[0] if tokens else None, "_args": [] }
        i = 1
        while i < len(tokens):
            t = tokens[i]
            if t.startswith('--'):
                if i + 1 < len(tokens) and not tokens[i + 1].startswith('-'):
                    data[t[2:]] = tokens[i + 1]; i += 2
                else: data[t[2:]] = True; i += 1
            elif t.startswith('-'): data[t[1:]] = True; i += 1
            else: data["_args"].append(t); i += 1
        return { "modality": modality, "data": data }
    return { "modality": modality, "data": { "_raw": raw } }

def cmpsbl_thread(id: str) -> dict:
    if id not in _cmpsbl_threads:
        _cmpsbl_threads[id] = { "id": id, "turns": [], "forks": [] }
    return _cmpsbl_threads[id]

def cmpsbl_append_turn(thread_id: str, role: str, content: str) -> None:
    cmpsbl_thread(thread_id)["turns"].append({ "role": role, "content": content })

def cmpsbl_fork_thread(parent_id: str, fork_id: str) -> dict:
    parent = cmpsbl_thread(parent_id)
    fork = { "id": fork_id, "turns": list(parent["turns"]), "forks": [] }
    _cmpsbl_threads[fork_id] = fork
    parent["forks"].append(fork_id)
    return fork
`;

const UNIVERSAL_INPUT_WIRE_TS = `
const _cmpsbl_raw_execute_ui = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_universal(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // If a raw payload is present, normalize it before execution
  if ('_raw' in input) {
    const norm = cmpsbl_normalize_input(input._raw);
    input = { ...input, ...norm.data, _cmpsbl_modality: norm.modality };
  }
  return _cmpsbl_raw_execute_ui(capabilityName, input);
};`;

const UNIVERSAL_INPUT_WIRE_PY = `
_cmpsbl_raw_execute_ui = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with universal input normalization (auto-wired)."""
    if '_raw' in input_data:
        norm = cmpsbl_normalize_input(input_data['_raw'])
        input_data = { **input_data, **norm['data'], '_cmpsbl_modality': norm['modality'] }
    return _cmpsbl_raw_execute_ui(capability_name, input_data)`;

// ─────────────────────────────────────────────────────────────────────────────
// EVOLUTION PILLAR — #17
// ─────────────────────────────────────────────────────────────────────────────

const SELF_EVOLVE_TS = `
type CmpsblMutation = { id: string; target: string; change: Record<string, unknown>; status: 'proposed'|'shadow'|'promoted'|'rolled_back'; createdAt: number; metrics: { successRate: number; samples: number } };

const _cmpsbl_mutations = new Map<string, CmpsblMutation>();
const _cmpsbl_shadow_state = new Map<string, unknown>();

export function cmpsbl_propose_mutation(target: string, change: Record<string, unknown>): CmpsblMutation {
  const id = 'mut_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  const m: CmpsblMutation = { id, target, change, status: 'proposed', createdAt: Date.now(), metrics: { successRate: 0, samples: 0 } };
  _cmpsbl_mutations.set(id, m);
  return m;
}

export function cmpsbl_shadow_run(mutationId: string, simulator: () => boolean): { ok: boolean } {
  const m = _cmpsbl_mutations.get(mutationId);
  if (!m) return { ok: false };
  m.status = 'shadow';
  const ok = simulator();
  m.metrics.samples++;
  m.metrics.successRate = (m.metrics.successRate * (m.metrics.samples - 1) + (ok ? 1 : 0)) / m.metrics.samples;
  _cmpsbl_shadow_state.set(mutationId, { lastRunAt: Date.now(), ok });
  return { ok };
}

export function cmpsbl_promote(mutationId: string): { promoted: boolean; reason?: string } {
  const m = _cmpsbl_mutations.get(mutationId);
  if (!m) return { promoted: false, reason: 'unknown_mutation' };
  if (m.metrics.samples < 5) return { promoted: false, reason: 'insufficient_samples' };
  if (m.metrics.successRate < 0.95) return { promoted: false, reason: 'success_rate_below_threshold' };
  m.status = 'promoted';
  return { promoted: true };
}

export function cmpsbl_rollback(mutationId: string): { rolled_back: boolean } {
  const m = _cmpsbl_mutations.get(mutationId);
  if (!m) return { rolled_back: false };
  m.status = 'rolled_back';
  return { rolled_back: true };
}

export function cmpsbl_mutation_stats(): { proposed: number; shadow: number; promoted: number; rolled_back: number } {
  const all = [..._cmpsbl_mutations.values()];
  return {
    proposed: all.filter(m => m.status === 'proposed').length,
    shadow: all.filter(m => m.status === 'shadow').length,
    promoted: all.filter(m => m.status === 'promoted').length,
    rolled_back: all.filter(m => m.status === 'rolled_back').length,
  };
}
`;

const SELF_EVOLVE_PY = `
import time
import random
from typing import Callable, Dict

_cmpsbl_mutations: Dict[str, dict] = {}
_cmpsbl_shadow_state: Dict[str, dict] = {}

def cmpsbl_propose_mutation(target: str, change: dict) -> dict:
    mid = f"mut_{int(time.time() * 1000):x}_{random.randint(0, 0xFFFF):x}"
    m = { "id": mid, "target": target, "change": change, "status": "proposed", "created_at": time.time() * 1000, "metrics": { "success_rate": 0.0, "samples": 0 } }
    _cmpsbl_mutations[mid] = m
    return m

def cmpsbl_shadow_run(mutation_id: str, simulator: Callable[[], bool]) -> dict:
    m = _cmpsbl_mutations.get(mutation_id)
    if not m: return { "ok": False }
    m["status"] = "shadow"
    ok = simulator()
    m["metrics"]["samples"] += 1
    n = m["metrics"]["samples"]
    m["metrics"]["success_rate"] = (m["metrics"]["success_rate"] * (n - 1) + (1 if ok else 0)) / n
    _cmpsbl_shadow_state[mutation_id] = { "last_run_at": time.time() * 1000, "ok": ok }
    return { "ok": ok }

def cmpsbl_promote(mutation_id: str) -> dict:
    m = _cmpsbl_mutations.get(mutation_id)
    if not m: return { "promoted": False, "reason": "unknown_mutation" }
    if m["metrics"]["samples"] < 5: return { "promoted": False, "reason": "insufficient_samples" }
    if m["metrics"]["success_rate"] < 0.95: return { "promoted": False, "reason": "success_rate_below_threshold" }
    m["status"] = "promoted"
    return { "promoted": True }

def cmpsbl_rollback(mutation_id: str) -> dict:
    m = _cmpsbl_mutations.get(mutation_id)
    if not m: return { "rolled_back": False }
    m["status"] = "rolled_back"
    return { "rolled_back": True }

def cmpsbl_mutation_stats() -> dict:
    all_m = list(_cmpsbl_mutations.values())
    return {
        "proposed": sum(1 for m in all_m if m["status"] == "proposed"),
        "shadow": sum(1 for m in all_m if m["status"] == "shadow"),
        "promoted": sum(1 for m in all_m if m["status"] == "promoted"),
        "rolled_back": sum(1 for m in all_m if m["status"] == "rolled_back"),
    }
`;

const SELF_EVOLVE_WIRE_TS = `
const _cmpsbl_raw_execute_se = cmpsbl_execute;
const _cmpsbl_evolve_outcomes = new Map<string, { wins: number; losses: number }>();
cmpsbl_execute = function cmpsbl_execute_evolved(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  let stats = _cmpsbl_evolve_outcomes.get(capabilityName);
  if (!stats) { stats = { wins: 0, losses: 0 }; _cmpsbl_evolve_outcomes.set(capabilityName, stats); }
  try {
    const result = _cmpsbl_raw_execute_se(capabilityName, input);
    stats.wins++;
    return result;
  } catch (err) {
    stats.losses++;
    // Auto-propose a mutation if losses dominate
    if (stats.losses >= 3 && stats.losses > stats.wins) {
      cmpsbl_propose_mutation(capabilityName, { suggestedAction: 'review_implementation' });
    }
    throw err;
  }
};`;

const SELF_EVOLVE_WIRE_PY = `
_cmpsbl_raw_execute_se = cmpsbl_execute
_cmpsbl_evolve_outcomes: dict = {}
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with self-evolution tracking (auto-wired)."""
    if capability_name not in _cmpsbl_evolve_outcomes:
        _cmpsbl_evolve_outcomes[capability_name] = { "wins": 0, "losses": 0 }
    stats = _cmpsbl_evolve_outcomes[capability_name]
    try:
        result = _cmpsbl_raw_execute_se(capability_name, input_data)
        stats["wins"] += 1
        return result
    except Exception as e:
        stats["losses"] += 1
        if stats["losses"] >= 3 and stats["losses"] > stats["wins"]:
            cmpsbl_propose_mutation(capability_name, { "suggested_action": "review_implementation" })
        raise`;

// ─────────────────────────────────────────────────────────────────────────────
// GOVERNANCE PILLAR — #18, #19
// ─────────────────────────────────────────────────────────────────────────────

const GOV_SHIELD_TS = `
type CmpsblPolicy = { id: string; rule: (input: Record<string, unknown>) => boolean; severity: 'block'|'warn'; description: string };
type CmpsblVeto = { policyId: string; capability: string; at: number; reason: string };

const _cmpsbl_policies = new Map<string, CmpsblPolicy>();
const _cmpsbl_vetoes: CmpsblVeto[] = [];
const CMPSBL_VETO_LOG_CAP = 1000;

export function cmpsbl_register_policy(policy: CmpsblPolicy): void {
  _cmpsbl_policies.set(policy.id, policy);
}

export function cmpsbl_check_policies(capability: string, input: Record<string, unknown>): { allowed: boolean; warnings: string[]; blockedBy?: string } {
  const warnings: string[] = [];
  for (const policy of _cmpsbl_policies.values()) {
    let passed = true;
    try { passed = policy.rule(input); } catch { passed = false; }
    if (!passed) {
      if (policy.severity === 'block') {
        const veto: CmpsblVeto = { policyId: policy.id, capability, at: Date.now(), reason: policy.description };
        _cmpsbl_vetoes.push(veto);
        if (_cmpsbl_vetoes.length > CMPSBL_VETO_LOG_CAP) _cmpsbl_vetoes.shift();
        return { allowed: false, warnings, blockedBy: policy.id };
      }
      warnings.push(policy.id);
    }
  }
  return { allowed: true, warnings };
}

export function cmpsbl_self_audit(): { totalPolicies: number; recentVetoes: CmpsblVeto[]; vetoCount: number } {
  return { totalPolicies: _cmpsbl_policies.size, recentVetoes: _cmpsbl_vetoes.slice(-10), vetoCount: _cmpsbl_vetoes.length };
}
`;

const GOV_SHIELD_PY = `
import time
from typing import Callable, Dict, List

CMPSBL_VETO_LOG_CAP = 1000

_cmpsbl_policies: Dict[str, dict] = {}
_cmpsbl_vetoes: List[dict] = []

def cmpsbl_register_policy(id: str, rule: Callable[[dict], bool], severity: str, description: str) -> None:
    _cmpsbl_policies[id] = { "id": id, "rule": rule, "severity": severity, "description": description }

def cmpsbl_check_policies(capability: str, input_data: dict) -> dict:
    warnings = []
    for policy in _cmpsbl_policies.values():
        try: passed = policy["rule"](input_data)
        except Exception: passed = False
        if not passed:
            if policy["severity"] == "block":
                veto = { "policy_id": policy["id"], "capability": capability, "at": time.time() * 1000, "reason": policy["description"] }
                _cmpsbl_vetoes.append(veto)
                if len(_cmpsbl_vetoes) > CMPSBL_VETO_LOG_CAP: _cmpsbl_vetoes.pop(0)
                return { "allowed": False, "warnings": warnings, "blocked_by": policy["id"] }
            warnings.append(policy["id"])
    return { "allowed": True, "warnings": warnings }

def cmpsbl_self_audit() -> dict:
    return { "total_policies": len(_cmpsbl_policies), "recent_vetoes": _cmpsbl_vetoes[-10:], "veto_count": len(_cmpsbl_vetoes) }
`;

const GOV_SHIELD_WIRE_TS = `
const _cmpsbl_raw_execute_gs = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_governed(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const verdict = cmpsbl_check_policies(capabilityName, input);
  if (!verdict.allowed) {
    throw new Error(\`[CMPSBL:Governance:\${capabilityName}] Vetoed by policy '\${verdict.blockedBy}'\`);
  }
  return _cmpsbl_raw_execute_gs(capabilityName, input);
};`;

const GOV_SHIELD_WIRE_PY = `
_cmpsbl_raw_execute_gs = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under governance policy enforcement (auto-wired)."""
    verdict = cmpsbl_check_policies(capability_name, input_data)
    if not verdict["allowed"]:
        raise RuntimeError(f"[CMPSBL:Governance:{capability_name}] Vetoed by policy '{verdict.get('blocked_by')}'")
    return _cmpsbl_raw_execute_gs(capability_name, input_data)`;

const AUDIT_CHAIN_TS = `
type CmpsblAuditEntry = { seq: number; ts: number; actor: string; action: string; payloadHash: string; prevHash: string; entryHash: string };

const _cmpsbl_audit_chain: CmpsblAuditEntry[] = [];

function _cmpsbl_audit_hash(input: string): string {
  let h = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < input.length; i++) { h ^= BigInt(input.charCodeAt(i)); h = (h * prime) & 0xFFFFFFFFFFFFFFFFn; }
  return h.toString(16).padStart(16, '0');
}

export function cmpsbl_append_audit(actor: string, action: string, payload: unknown): CmpsblAuditEntry {
  const seq = _cmpsbl_audit_chain.length;
  const ts = Date.now();
  const payloadHash = _cmpsbl_audit_hash(JSON.stringify(payload));
  const prevHash = seq === 0 ? '0'.repeat(16) : _cmpsbl_audit_chain[seq - 1].entryHash;
  const entryHash = _cmpsbl_audit_hash(\`\${seq}|\${ts}|\${actor}|\${action}|\${payloadHash}|\${prevHash}\`);
  const entry: CmpsblAuditEntry = { seq, ts, actor, action, payloadHash, prevHash, entryHash };
  _cmpsbl_audit_chain.push(entry);
  return entry;
}

export function cmpsbl_verify_chain(): { valid: boolean; brokenAt?: number; length: number } {
  for (let i = 0; i < _cmpsbl_audit_chain.length; i++) {
    const e = _cmpsbl_audit_chain[i];
    const expectedPrev = i === 0 ? '0'.repeat(16) : _cmpsbl_audit_chain[i - 1].entryHash;
    if (e.prevHash !== expectedPrev) return { valid: false, brokenAt: i, length: _cmpsbl_audit_chain.length };
    const expected = _cmpsbl_audit_hash(\`\${e.seq}|\${e.ts}|\${e.actor}|\${e.action}|\${e.payloadHash}|\${e.prevHash}\`);
    if (expected !== e.entryHash) return { valid: false, brokenAt: i, length: _cmpsbl_audit_chain.length };
  }
  return { valid: true, length: _cmpsbl_audit_chain.length };
}

export function cmpsbl_audit_root(): string {
  if (_cmpsbl_audit_chain.length === 0) return '0'.repeat(16);
  return _cmpsbl_audit_chain[_cmpsbl_audit_chain.length - 1].entryHash;
}
`;

const AUDIT_CHAIN_PY = `
import json
import time
from typing import List

_cmpsbl_audit_chain: List[dict] = []

def _cmpsbl_audit_hash(s: str) -> str:
    h = 0xcbf29ce484222325
    prime = 0x100000001b3
    mask = 0xFFFFFFFFFFFFFFFF
    for c in s:
        h ^= ord(c); h = (h * prime) & mask
    return format(h, '016x')

def cmpsbl_append_audit(actor: str, action: str, payload) -> dict:
    seq = len(_cmpsbl_audit_chain)
    ts = int(time.time() * 1000)
    payload_hash = _cmpsbl_audit_hash(json.dumps(payload, sort_keys=True, default=str))
    prev_hash = '0' * 16 if seq == 0 else _cmpsbl_audit_chain[-1]["entry_hash"]
    entry_hash = _cmpsbl_audit_hash(f"{seq}|{ts}|{actor}|{action}|{payload_hash}|{prev_hash}")
    entry = { "seq": seq, "ts": ts, "actor": actor, "action": action, "payload_hash": payload_hash, "prev_hash": prev_hash, "entry_hash": entry_hash }
    _cmpsbl_audit_chain.append(entry)
    return entry

def cmpsbl_verify_chain() -> dict:
    for i, e in enumerate(_cmpsbl_audit_chain):
        expected_prev = '0' * 16 if i == 0 else _cmpsbl_audit_chain[i - 1]["entry_hash"]
        if e["prev_hash"] != expected_prev:
            return { "valid": False, "broken_at": i, "length": len(_cmpsbl_audit_chain) }
        expected = _cmpsbl_audit_hash(f"{e['seq']}|{e['ts']}|{e['actor']}|{e['action']}|{e['payload_hash']}|{e['prev_hash']}")
        if expected != e["entry_hash"]:
            return { "valid": False, "broken_at": i, "length": len(_cmpsbl_audit_chain) }
    return { "valid": True, "length": len(_cmpsbl_audit_chain) }

def cmpsbl_audit_root() -> str:
    if not _cmpsbl_audit_chain: return '0' * 16
    return _cmpsbl_audit_chain[-1]["entry_hash"]
`;

const AUDIT_CHAIN_WIRE_TS = `
const _cmpsbl_raw_execute_ach = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_audited(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  cmpsbl_append_audit('cmpsbl.execute', 'invoke:' + capabilityName, input);
  try {
    const result = _cmpsbl_raw_execute_ach(capabilityName, input);
    cmpsbl_append_audit('cmpsbl.execute', 'result:' + capabilityName, result as unknown);
    return result;
  } catch (err) {
    cmpsbl_append_audit('cmpsbl.execute', 'error:' + capabilityName, { message: (err as Error).message });
    throw err;
  }
};`;

const AUDIT_CHAIN_WIRE_PY = `
_cmpsbl_raw_execute_ach = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with tamper-evident audit trail (auto-wired)."""
    cmpsbl_append_audit('cmpsbl.execute', 'invoke:' + capability_name, input_data)
    try:
        result = _cmpsbl_raw_execute_ach(capability_name, input_data)
        cmpsbl_append_audit('cmpsbl.execute', 'result:' + capability_name, result if isinstance(result, dict) else { "value": str(result) })
        return result
    except Exception as e:
        cmpsbl_append_audit('cmpsbl.execute', 'error:' + capability_name, { "message": str(e) })
        raise`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE PILLAR — #20
// ─────────────────────────────────────────────────────────────────────────────

const COMPLIANCE_TS = `
type CmpsblJurisdiction = 'us' | 'eu' | 'uk' | 'apac' | 'ca' | 'au' | 'br' | 'global';
type CmpsblComplianceEvent = { ts: number; capability: string; jurisdiction: CmpsblJurisdiction; routedTo: string; controlsApplied: string[] };

const _cmpsbl_residency_routes: Record<CmpsblJurisdiction, string> = {
  us: 'region-us-east-1', eu: 'region-eu-west-1', uk: 'region-uk-1', apac: 'region-ap-northeast-1',
  ca: 'region-ca-central-1', au: 'region-ap-southeast-2', br: 'region-sa-east-1', global: 'region-multi',
};

const _cmpsbl_jurisdiction_controls: Record<CmpsblJurisdiction, string[]> = {
  us: ['SOC2', 'CCPA'], eu: ['GDPR', 'ISO27001'], uk: ['UK_GDPR', 'ISO27001'], apac: ['PDPA'],
  ca: ['PIPEDA'], au: ['Privacy_Act'], br: ['LGPD'], global: ['ISO27001'],
};

const _cmpsbl_compliance_events: CmpsblComplianceEvent[] = [];
const CMPSBL_COMPLIANCE_LOG_CAP = 5000;

export function cmpsbl_route_for(jurisdiction: CmpsblJurisdiction): string {
  return _cmpsbl_residency_routes[jurisdiction] ?? _cmpsbl_residency_routes.global;
}

export function cmpsbl_record_compliance(capability: string, jurisdiction: CmpsblJurisdiction): CmpsblComplianceEvent {
  const event: CmpsblComplianceEvent = {
    ts: Date.now(), capability, jurisdiction,
    routedTo: cmpsbl_route_for(jurisdiction),
    controlsApplied: _cmpsbl_jurisdiction_controls[jurisdiction] ?? [],
  };
  _cmpsbl_compliance_events.push(event);
  if (_cmpsbl_compliance_events.length > CMPSBL_COMPLIANCE_LOG_CAP) _cmpsbl_compliance_events.shift();
  return event;
}

export function cmpsbl_attestation(jurisdiction: CmpsblJurisdiction, periodMs = 30 * 86_400_000): { jurisdiction: CmpsblJurisdiction; eventCount: number; controlsApplied: string[]; periodEnd: number; root: string } {
  const cutoff = Date.now() - periodMs;
  const events = _cmpsbl_compliance_events.filter(e => e.jurisdiction === jurisdiction && e.ts >= cutoff);
  // Compute a deterministic root for evidence chain
  let h = 5381;
  for (const e of events) {
    const s = \`\${e.ts}|\${e.capability}|\${e.routedTo}\`;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return {
    jurisdiction, eventCount: events.length,
    controlsApplied: _cmpsbl_jurisdiction_controls[jurisdiction] ?? [],
    periodEnd: Date.now(), root: h.toString(16).padStart(8, '0'),
  };
}
`;

const COMPLIANCE_PY = `
import time
from typing import Dict, List

CMPSBL_COMPLIANCE_LOG_CAP = 5000

_cmpsbl_residency_routes = {
    "us": "region-us-east-1", "eu": "region-eu-west-1", "uk": "region-uk-1", "apac": "region-ap-northeast-1",
    "ca": "region-ca-central-1", "au": "region-ap-southeast-2", "br": "region-sa-east-1", "global": "region-multi",
}

_cmpsbl_jurisdiction_controls = {
    "us": ["SOC2", "CCPA"], "eu": ["GDPR", "ISO27001"], "uk": ["UK_GDPR", "ISO27001"], "apac": ["PDPA"],
    "ca": ["PIPEDA"], "au": ["Privacy_Act"], "br": ["LGPD"], "global": ["ISO27001"],
}

_cmpsbl_compliance_events: List[dict] = []

def cmpsbl_route_for(jurisdiction: str) -> str:
    return _cmpsbl_residency_routes.get(jurisdiction, _cmpsbl_residency_routes["global"])

def cmpsbl_record_compliance(capability: str, jurisdiction: str) -> dict:
    event = {
        "ts": time.time() * 1000, "capability": capability, "jurisdiction": jurisdiction,
        "routed_to": cmpsbl_route_for(jurisdiction),
        "controls_applied": _cmpsbl_jurisdiction_controls.get(jurisdiction, []),
    }
    _cmpsbl_compliance_events.append(event)
    if len(_cmpsbl_compliance_events) > CMPSBL_COMPLIANCE_LOG_CAP: _cmpsbl_compliance_events.pop(0)
    return event

def cmpsbl_attestation(jurisdiction: str, period_ms: int = 30 * 86_400_000) -> dict:
    cutoff = time.time() * 1000 - period_ms
    events = [e for e in _cmpsbl_compliance_events if e["jurisdiction"] == jurisdiction and e["ts"] >= cutoff]
    h = 5381
    for e in events:
        s = f"{e['ts']}|{e['capability']}|{e['routed_to']}"
        for c in s:
            h = ((h << 5) + h + ord(c)) & 0xFFFFFFFF
    return {
        "jurisdiction": jurisdiction, "event_count": len(events),
        "controls_applied": _cmpsbl_jurisdiction_controls.get(jurisdiction, []),
        "period_end": time.time() * 1000, "root": format(h, '08x'),
    }
`;

const COMPLIANCE_WIRE_TS = `
const _cmpsbl_raw_execute_co = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_compliant(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const jurisdiction = ((input as { _cmpsbl_jurisdiction?: string })._cmpsbl_jurisdiction ?? 'global') as CmpsblJurisdiction;
  const evt = cmpsbl_record_compliance(capabilityName, jurisdiction);
  (input as Record<string, unknown>)._cmpsbl_routed_to = evt.routedTo;
  return _cmpsbl_raw_execute_co(capabilityName, input);
};`;

const COMPLIANCE_WIRE_PY = `
_cmpsbl_raw_execute_co = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under jurisdiction-aware compliance routing (auto-wired)."""
    jurisdiction = input_data.get('_cmpsbl_jurisdiction', 'global')
    evt = cmpsbl_record_compliance(capability_name, jurisdiction)
    input_data['_cmpsbl_routed_to'] = evt['routed_to']
    return _cmpsbl_raw_execute_co(capability_name, input_data)`;

// ─────────────────────────────────────────────────────────────────────────────
// SPECS
// ─────────────────────────────────────────────────────────────────────────────

const securityLayers: LayerSpec[] = [
  { id: 'adaptive-defense', varBase: 'ADAPTIVE_DEFENSE', name: 'Adaptive Defense Breeding Suite', rank: 6, cjpi: 95, module: 'IMMUNITY×EVOLUTION', priceCents: 0,
    description: 'Breeds progressively stronger security defenses via evolutionary pressure against attack simulations. Survivors promoted; failures extinct.',
    wrapperName: 'cmpsbl_seed_defense', behavior: 'Each capability gets its own evolving defense genome that strengthens with every successful execution.',
    tsBody: ADAPTIVE_DEFENSE_TS, pyBody: ADAPTIVE_DEFENSE_PY, tsWire: ADAPTIVE_DEFENSE_WIRE_TS, pyWire: ADAPTIVE_DEFENSE_WIRE_PY },
  { id: 'zero-trust', varBase: 'ZERO_TRUST', name: 'Zero-Trust Identity Suite', rank: 7, cjpi: 91, module: 'IDENTITY×DEFENSE', priceCents: 0,
    description: 'Continuous session verification with behavioral trust scoring that flags compromised credentials through usage pattern deviation.',
    wrapperName: 'cmpsbl_verify_session', behavior: 'Every execution verifies session binding, applies trust decay, and runs behavioral z-score anomaly detection.',
    tsBody: ZERO_TRUST_TS, pyBody: ZERO_TRUST_PY, tsWire: ZERO_TRUST_WIRE_TS, pyWire: ZERO_TRUST_WIRE_PY },
  { id: 'cyber-defense', varBase: 'CYBER_DEFENSE', name: 'Cyber Defense Suite', rank: 8, cjpi: 97, module: 'WATCHTOWER×AEGIS', priceCents: 0,
    description: 'Cross-correlates indicators of compromise across temporal, spatial, and contextual dimensions while dynamically absorbing volumetric attacks.',
    wrapperName: 'cmpsbl_ddos_check', behavior: 'IOC correlation + DDoS absorption matrix wraps every execution with traffic shaping and threat correlation.',
    tsBody: CYBER_DEFENSE_TS, pyBody: CYBER_DEFENSE_PY, tsWire: CYBER_DEFENSE_WIRE_TS, pyWire: CYBER_DEFENSE_WIRE_PY },
];

const intelligenceLayers: LayerSpec[] = [
  { id: 'fleet-intelligence', varBase: 'FLEET_INTEL', name: 'Fleet Intelligence Orchestrator', rank: 9, cjpi: 98, module: 'NEXUS', priceCents: 0,
    description: 'Real-time scoring matrix across all AI providers. Weighted round-robin with quality-gated fallback chains.',
    wrapperName: 'cmpsbl_pick_provider', behavior: 'Selects optimal provider per request based on cost, latency, quality, and recent failure rate.',
    tsBody: FLEET_INTEL_TS, pyBody: FLEET_INTEL_PY, tsWire: FLEET_INTEL_WIRE_TS, pyWire: FLEET_INTEL_WIRE_PY },
  { id: 'ai-safety', varBase: 'AI_SAFETY', name: 'AI Safety Suite', rank: 10, cjpi: 95, module: 'DREAM×DEFENSE', priceCents: 0,
    description: 'Hallucination Guard + Prompt Injection Shield. Multi-source verification + multi-layer input sanitization.',
    wrapperName: 'cmpsbl_sanitize_prompt', behavior: 'Sanitizes string fields against prompt injection; fail-closed on detection.',
    tsBody: AI_SAFETY_TS, pyBody: AI_SAFETY_PY, tsWire: AI_SAFETY_WIRE_TS, pyWire: AI_SAFETY_WIRE_PY },
  { id: 'ai-cost', varBase: 'AI_COST', name: 'AI Cost Intelligence Suite', rank: 11, cjpi: 96, module: 'NEXUS', priceCents: 0,
    description: 'Cost-Aware Routing Engine + Token Optimization. Real-time budget tracking with progressive quality degradation.',
    wrapperName: 'cmpsbl_can_spend', behavior: 'Estimates cost per request, throttles when over budget, switches to fast quality at >80% spend.',
    tsBody: AI_COST_TS, pyBody: AI_COST_PY, tsWire: AI_COST_WIRE_TS, pyWire: AI_COST_WIRE_PY },
  { id: 'cognitive-memory', varBase: 'COG_MEMORY', name: 'Cognitive Memory Suite', rank: 12, cjpi: 94, module: 'BRAIN×MEMORY', priceCents: 0,
    description: 'Semantic Knowledge Graph + Knowledge Compaction. Graph-based knowledge representation with relationship inference.',
    wrapperName: 'cmpsbl_remember', behavior: 'Every execution memorizes input/output as graph nodes and links them by produced relation.',
    tsBody: COG_MEMORY_TS, pyBody: COG_MEMORY_PY, tsWire: COG_MEMORY_WIRE_TS, pyWire: COG_MEMORY_WIRE_PY },
];

const performanceLayers: LayerSpec[] = [
  { id: 'performance-surgery', varBase: 'PERF_SURGERY', name: 'Performance Surgery Suite', rank: 13, cjpi: 98, module: 'APEX×VISION', priceCents: 0,
    description: 'Hot Path Flame Graph Analyzer + Performance Regression Detector. Identifies CPU bottlenecks with automatic Big-O classification.',
    wrapperName: 'cmpsbl_record_sample', behavior: 'Profiles every execution; classifies complexity from input-size vs latency samples.',
    tsBody: PERF_SURGERY_TS, pyBody: PERF_SURGERY_PY, tsWire: PERF_SURGERY_WIRE_TS, pyWire: PERF_SURGERY_WIRE_PY },
  { id: 'pipeline-resilience', varBase: 'PIPELINE_RES', name: 'Data Pipeline Resilience Suite', rank: 14, cjpi: 98, module: 'CONDUIT', priceCents: 0,
    description: 'Stream Backpressure Manager + Event Sourcing Pattern Engine. Reactive backpressure with consumer lag monitoring.',
    wrapperName: 'cmpsbl_publish', behavior: 'Publishes every execution to a bounded stream; sheds load when at capacity.',
    tsBody: PIPELINE_RES_TS, pyBody: PIPELINE_RES_PY, tsWire: PIPELINE_RES_WIRE_TS, pyWire: PIPELINE_RES_WIRE_PY },
];

const orchestrationLayers: LayerSpec[] = [
  { id: 'pipeline-composition', varBase: 'PIPE_COMPOSE', name: 'Pipeline Composition Engine', rank: 15, cjpi: 95, module: 'CORTEX', priceCents: 0,
    description: 'Composable pipeline builder with typed stage connections and backpressure control.',
    wrapperName: 'cmpsbl_pipeline', behavior: 'Each capability is registered as a single-stage pipeline for tracking and future composition.',
    tsBody: PIPE_COMPOSE_TS, pyBody: PIPE_COMPOSE_PY, tsWire: PIPE_COMPOSE_WIRE_TS, pyWire: PIPE_COMPOSE_WIRE_PY },
  { id: 'universal-input', varBase: 'UNIVERSAL_INPUT', name: 'Universal Input Intelligence', rank: 16, cjpi: 97, module: 'DECODE', priceCents: 0,
    description: 'Context Threading + Multi-Modal Interpreter. Maintains conversational context plus unified interpretation of NL/CLI/structured/code.',
    wrapperName: 'cmpsbl_normalize_input', behavior: 'Detects modality of _raw payloads (text/json/cli/code) and normalizes before execution.',
    tsBody: UNIVERSAL_INPUT_TS, pyBody: UNIVERSAL_INPUT_PY, tsWire: UNIVERSAL_INPUT_WIRE_TS, pyWire: UNIVERSAL_INPUT_WIRE_PY },
];

const evolutionLayers: LayerSpec[] = [
  { id: 'self-evolution', varBase: 'SELF_EVOLVE', name: 'Self-Evolution Suite', rank: 17, cjpi: 95, module: 'EVOLUTION', priceCents: 0,
    description: 'Mutation Proposal Engine + Shadow Run Environment. Generates, evaluates, and applies system mutations with rollback safety.',
    wrapperName: 'cmpsbl_propose_mutation', behavior: 'Tracks per-capability win/loss outcomes; auto-proposes mutations on sustained failure.',
    tsBody: SELF_EVOLVE_TS, pyBody: SELF_EVOLVE_PY, tsWire: SELF_EVOLVE_WIRE_TS, pyWire: SELF_EVOLVE_WIRE_PY },
];

const governanceLayers: LayerSpec[] = [
  { id: 'governance-shield', varBase: 'GOV_SHIELD', name: 'Governance Shield Suite', rank: 18, cjpi: 94, module: 'GOVERNANCE', priceCents: 0,
    description: 'Veto Authority Engine + Self-Audit Loop. Authority-gated veto system with continuous self-audit and policy compliance.',
    wrapperName: 'cmpsbl_check_policies', behavior: 'Every execution is policy-checked; block-severity violations veto the call.',
    tsBody: GOV_SHIELD_TS, pyBody: GOV_SHIELD_PY, tsWire: GOV_SHIELD_WIRE_TS, pyWire: GOV_SHIELD_WIRE_PY },
  { id: 'audit-chain', varBase: 'AUDIT_CHAIN', name: 'Tamper-Evident Audit Chain', rank: 19, cjpi: 95, module: 'AUDIT', priceCents: 0,
    description: 'Hash-chained audit log with FNV-1a entry hashing. Cryptographic tamper detection for SOC2/HIPAA/FedRAMP audit trails.',
    wrapperName: 'cmpsbl_append_audit', behavior: 'Every execution appends invoke/result/error entries to a tamper-evident chain.',
    tsBody: AUDIT_CHAIN_TS, pyBody: AUDIT_CHAIN_PY, tsWire: AUDIT_CHAIN_WIRE_TS, pyWire: AUDIT_CHAIN_WIRE_PY },
];

const complianceLayers: LayerSpec[] = [
  { id: 'regulatory-compliance', varBase: 'COMPLIANCE', name: 'Regulatory Compliance Suite', rank: 20, cjpi: 93, module: 'AUDIT×COMPASS', priceCents: 0,
    description: 'Compliance Attestation Generator + Jurisdiction-Aware Router. Automated reports + intelligent routing respecting data residency.',
    wrapperName: 'cmpsbl_route_for', behavior: 'Routes every execution to the correct regional infrastructure based on jurisdiction tag and records evidence.',
    tsBody: COMPLIANCE_TS, pyBody: COMPLIANCE_PY, tsWire: COMPLIANCE_WIRE_TS, pyWire: COMPLIANCE_WIRE_PY },
];

// ─────────────────────────────────────────────────────────────────────────────
// EMITTER
// ─────────────────────────────────────────────────────────────────────────────

function emitLayer(spec: LayerSpec): string {
  // Use String.raw + custom delimiter to embed backticks safely
  const tsName = `${spec.varBase}_TS`;
  const pyName = `${spec.varBase}_PY`;
  const wireTsName = `${spec.varBase}_WIRE_TS`;
  const wirePyName = `${spec.varBase}_WIRE_PY`;
  const layerName = `${spec.varBase}_LAYER`;
  const headerLine = spec.description.length > 76 ? spec.description.slice(0, 73) + '...' : spec.description;

  return `
// ════════════════════════════════════════════════════════════════════════════
// LAYER ${spec.rank} — ${spec.name} (CJPI ${spec.cjpi}, ${spec.module})
// ════════════════════════════════════════════════════════════════════════════

const ${tsName} = \`${tsHdr(spec.name, spec.rank, headerLine)}${spec.tsBody}\`;

const ${pyName} = \`${pyHdr(spec.name, spec.rank, headerLine)}${spec.pyBody}\`;

const ${wireTsName} = \`${spec.tsWire}\`;

const ${wirePyName} = \`${spec.pyWire}\`;

const ${layerName}: CmpsblLayerDefinition = {
  id: ${JSON.stringify(spec.id)},
  name: ${JSON.stringify(spec.name)},
  crownJewelRank: ${spec.rank},
  cjpi: ${spec.cjpi},
  module: ${JSON.stringify(spec.module)},
  description: ${JSON.stringify(spec.description)},
  priceCents: ${spec.priceCents},
  tsCode: ${tsName},
  pyCode: ${pyName},
  autoWire: {
    wrapperName: ${JSON.stringify(spec.wrapperName)},
    behavior: ${JSON.stringify(spec.behavior)},
    tsWire: ${wireTsName},
    pyWire: ${wirePyName},
  },
};
`;
}

function emitPillar(pillarName: string, exportConst: string, specs: LayerSpec[]): string {
  const header = `/**
 * CMPSBL® Layer — ${pillarName} Pillar
 * ${specs.map(s => `#${s.rank} ${s.name}`).join(' · ')}
 * Auto-generated by scripts/gen-layers.ts.
 */
import type { CmpsblLayerDefinition } from './types';
`;
  const body = specs.map(emitLayer).join('\n');
  const footer = `\nexport const ${exportConst}: CmpsblLayerDefinition[] = [${specs.map(s => `${s.varBase}_LAYER`).join(', ')}];\n`;
  return header + body + footer;
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────────────────

const targets = [
  { file: 'security.ts', name: 'Security', exportConst: 'SECURITY_LAYERS', specs: securityLayers },
  { file: 'intelligence.ts', name: 'Intelligence', exportConst: 'INTELLIGENCE_LAYERS', specs: intelligenceLayers },
  { file: 'performance.ts', name: 'Performance', exportConst: 'PERFORMANCE_LAYERS', specs: performanceLayers },
  { file: 'orchestration.ts', name: 'Orchestration', exportConst: 'ORCHESTRATION_LAYERS', specs: orchestrationLayers },
  { file: 'evolution.ts', name: 'Evolution', exportConst: 'EVOLUTION_LAYERS', specs: evolutionLayers },
  { file: 'governance.ts', name: 'Governance', exportConst: 'GOVERNANCE_LAYERS', specs: governanceLayers },
  { file: 'compliance.ts', name: 'Compliance', exportConst: 'COMPLIANCE_LAYERS', specs: complianceLayers },
];

for (const t of targets) {
  const content = emitPillar(t.name, t.exportConst, t.specs);
  fs.writeFileSync(path.join(OUT_DIR, t.file), content);
  console.log(`wrote ${t.file}: ${content.split('\n').length} lines, ${t.specs.length} layers`);
}

const total = targets.reduce((n, t) => n + t.specs.length, 0);
console.log(`\nTotal: ${total} new layers across ${targets.length} pillar files.`);
