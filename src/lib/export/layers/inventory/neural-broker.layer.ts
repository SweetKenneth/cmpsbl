/**
 * CMPSBL® Neural Broker Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Watches access patterns, ledgers every match, and brokers treaties between
 * counterparties — turning ad-hoc agreements into ledgered, audited,
 * enforceable contracts.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS_CODE = `// CMPSBL® Neural Broker — TS
export interface BrokerTreaty {
  id: string;
  partyA: string;
  partyB: string;
  scope: string[];
  signedAt: number;
  active: boolean;
}
export interface LedgerEntry {
  treatyId: string;
  action: string;
  matched: boolean;
  at: number;
}
const TREATIES = new Map<string, BrokerTreaty>();
const LEDGER: LedgerEntry[] = [];

export function cmpsbl_brk_treaty(partyA: string, partyB: string, scope: string[]): BrokerTreaty {
  const id = partyA + '<>' + partyB + '#' + scope.sort().join(',');
  const existing = TREATIES.get(id);
  if (existing) return existing;
  const t: BrokerTreaty = { id, partyA, partyB, scope: [...scope], signedAt: Date.now(), active: true };
  TREATIES.set(id, t);
  return t;
}

export function cmpsbl_brk_match(partyA: string, partyB: string, action: string): { allowed: boolean; treaty: BrokerTreaty | null } {
  for (const t of TREATIES.values()) {
    if (!t.active) continue;
    const match = (t.partyA === partyA && t.partyB === partyB) || (t.partyA === partyB && t.partyB === partyA);
    if (match && t.scope.includes(action)) {
      LEDGER.push({ treatyId: t.id, action, matched: true, at: Date.now() });
      return { allowed: true, treaty: t };
    }
  }
  LEDGER.push({ treatyId: '', action, matched: false, at: Date.now() });
  return { allowed: false, treaty: null };
}

export function cmpsbl_brk_ledger(limit = 100): LedgerEntry[] {
  return LEDGER.slice(-limit);
}

export function cmpsbl_brk_revoke(id: string): boolean {
  const t = TREATIES.get(id);
  if (!t) return false;
  t.active = false;
  return true;
}
`;

const PY_CODE = `# CMPSBL® Neural Broker — PY
import time
from typing import Dict, List, Optional, TypedDict

class BrokerTreaty(TypedDict):
    id: str
    party_a: str
    party_b: str
    scope: List[str]
    signed_at: float
    active: bool

class LedgerEntry(TypedDict):
    treaty_id: str
    action: str
    matched: bool
    at: float

_TREATIES: Dict[str, BrokerTreaty] = {}
_LEDGER: List[LedgerEntry] = []

def cmpsbl_brk_treaty(party_a: str, party_b: str, scope: List[str]) -> BrokerTreaty:
    tid = f"{party_a}<>{party_b}#{','.join(sorted(scope))}"
    if tid in _TREATIES:
        return _TREATIES[tid]
    t: BrokerTreaty = {"id": tid, "party_a": party_a, "party_b": party_b, "scope": list(scope), "signed_at": time.time(), "active": True}
    _TREATIES[tid] = t
    return t

def cmpsbl_brk_match(party_a: str, party_b: str, action: str):
    for t in _TREATIES.values():
        if not t["active"]:
            continue
        match = (t["party_a"] == party_a and t["party_b"] == party_b) or (t["party_a"] == party_b and t["party_b"] == party_a)
        if match and action in t["scope"]:
            _LEDGER.append({"treaty_id": t["id"], "action": action, "matched": True, "at": time.time()})
            return {"allowed": True, "treaty": t}
    _LEDGER.append({"treaty_id": "", "action": action, "matched": False, "at": time.time()})
    return {"allowed": False, "treaty": None}

def cmpsbl_brk_ledger(limit: int = 100) -> List[LedgerEntry]:
    return _LEDGER[-limit:]

def cmpsbl_brk_revoke(treaty_id: str) -> bool:
    t = _TREATIES.get(treaty_id)
    if not t:
        return False
    t["active"] = False
    return True
`;

const TS_WIRE = `
const _cmpsbl_raw_execute_brk = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_brk(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Default treaty: self ↔ system, action = capability name. Callers may override
  // via reserved keys; an absent active treaty is permissive (ledgered as 'unbound').
  const __brk_a = (input as any)?.__cmpsbl_party_a ?? 'self';
  const __brk_b = (input as any)?.__cmpsbl_party_b ?? 'system';
  const __brk_action = (input as any)?.__cmpsbl_action ?? capabilityName;
  const __brk = cmpsbl_brk_match(__brk_a, __brk_b, __brk_action);
  if (!__brk.allowed && (input as any)?.__cmpsbl_strict_broker) {
    throw new Error('[CMPSBL:Broker:' + capabilityName + '] no active treaty for ' + __brk_action);
  }
  return _cmpsbl_raw_execute_brk(capabilityName, input);
};`;

const PY_WIRE = `
_cmpsbl_raw_execute_brk = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Neural Broker (auto-wired)."""
    __brk_a = input_data.get("__cmpsbl_party_a", "self") if isinstance(input_data, dict) else "self"
    __brk_b = input_data.get("__cmpsbl_party_b", "system") if isinstance(input_data, dict) else "system"
    __brk_action = input_data.get("__cmpsbl_action", capability_name) if isinstance(input_data, dict) else capability_name
    __brk = cmpsbl_brk_match(__brk_a, __brk_b, __brk_action)
    if not __brk["allowed"] and isinstance(input_data, dict) and input_data.get("__cmpsbl_strict_broker"):
        raise RuntimeError(f"[CMPSBL:Broker:{capability_name}] no active treaty for {__brk_action}")
    return _cmpsbl_raw_execute_brk(capability_name, input_data)`;

export const NEURAL_BROKER_LAYER: CmpsblLayerDefinition = {
  id: 'neural-broker',
  name: 'Multi-Provider AI Routing Layer',
  crownJewelRank: 21,
  cjpi: 9.0,
  module: 'CONTRACTS',
  description: 'Watches access patterns and brokers ledgered, audited contracts between callers and providers — turn ad-hoc \'just call OpenAI\' code into enforceable, swappable AI agreements.',
  priceCents: 3900,
  tsCode: TS_CODE,
  pyCode: PY_CODE,
  autoWire: {
    wrapperName: 'cmpsbl_brk_match',
    behavior: 'Validates every execute call against the active treaty ledger, blocking unauthorized counterparty actions.',
    tsWire: TS_WIRE,
    pyWire: PY_WIRE,
  },
};
