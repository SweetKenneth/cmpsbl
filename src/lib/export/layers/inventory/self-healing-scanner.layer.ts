/**
 * CMPSBL® Inventory Layer — Self-Healing Scanner
 * Caps: LEARNING · EVOLUTION · DEFENSE · pattern memory · quarantine promotion
 *
 * Continuously inspects runtime, fingerprints failure patterns, and PROMOTES
 * recurring faults to the Hardening Layer's quarantine kernel — every
 * incident becomes training data that hardens the always-on chain.
 *
 * ─── Hardening Layer compatibility ─────────────────────────────────────────
 * The Phase-0 Hardening chain already provides retry (`_retry-core`),
 * graceful degradation (`_degradation-core`), and quarantine
 * (`_quarantine-core`). This layer used to perform its own retry/fallback,
 * which doubled work and could mask the kernel's metrics.
 *
 * What this layer now does on top of Hardening:
 *   • Records every fault as a normalized error-signature pattern.
 *   • Escalates the pattern's severity by recurrence count
 *     (1 = observed → 2-4 = repeating → 5+ = recurring).
 *   • PROMOTES recurring patterns to the Hardening Layer's quarantine
 *     kernel via `cmpsbl_quarantine().report(name, signature)`, which then
 *     applies kernel-grade hold/cool-down/release semantics.
 *   • Re-throws every fault so Hardening's retry/degradation engines see
 *     them and react as configured. The scanner observes — it never swallows.
 *
 * Net effect: the kernel keeps single ownership of retry & isolation; the
 * scanner adds learning + auto-promotion that compounds the kernel's value.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Self-Healing Scanner (proprietary).                        ║
// ║  Observes faults and promotes recurring patterns to the Hardening Layer's     ║
// ║  quarantine kernel. Does NOT retry or fallback — Hardening owns those.        ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblHealPattern { signature: string; count: number; lastSeen: number; severity: 'observed' | 'repeating' | 'recurring' }

const _CMPSBL_HEAL_PATTERNS = new Map<string, CmpsblHealPattern>();
const _CMPSBL_HEAL_MAX = 512;

function _cmpsbl_heal_sig(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/[0-9a-f]{8,}/gi, 'X').replace(/\\d+/g, 'N').slice(0, 96);
}

export function cmpsbl_heal_record(err: unknown): CmpsblHealPattern {
  const sig = _cmpsbl_heal_sig(err);
  const existing = _CMPSBL_HEAL_PATTERNS.get(sig);
  if (existing) {
    existing.count++; existing.lastSeen = Date.now();
    if (existing.count >= 5) existing.severity = 'recurring';
    else if (existing.count >= 2) existing.severity = 'repeating';
    return existing;
  }
  const p: CmpsblHealPattern = { signature: sig, count: 1, lastSeen: Date.now(), severity: 'observed' };
  _CMPSBL_HEAL_PATTERNS.set(sig, p);
  if (_CMPSBL_HEAL_PATTERNS.size > _CMPSBL_HEAL_MAX) {
    const oldest = [..._CMPSBL_HEAL_PATTERNS.entries()].sort((a, b) => a[1].lastSeen - b[1].lastSeen)[0];
    _CMPSBL_HEAL_PATTERNS.delete(oldest[0]);
  }
  return p;
}

export function cmpsbl_heal_lookup(err: unknown): CmpsblHealPattern | null {
  return _CMPSBL_HEAL_PATTERNS.get(_cmpsbl_heal_sig(err)) ?? null;
}

/** Promote a recurring fault signature to the Hardening Layer's quarantine kernel. */
export function cmpsbl_heal_promote_to_quarantine(capabilityName: string, pattern: CmpsblHealPattern): void {
  if (pattern.severity !== 'recurring') return;
  // cmpsbl_quarantine() is provided by the always-on Hardening chain
  // (_quarantine-core). Strikes accumulate against the capability name and
  // the kernel applies its configured threshold/TTL hold semantics.
  if (typeof (globalThis as any).cmpsbl_quarantine === 'function') {
    try {
      (globalThis as any).cmpsbl_quarantine().report(capabilityName, 'self_healing:' + pattern.signature);
    } catch {
      // Quarantine kernel disabled (CMPSBL_KERNEL_ENABLED=false). Pattern
      // is still recorded locally for offline analysis.
    }
  }
}

export function cmpsbl_heal_report(): { patterns: number; recurring: number; topSignatures: string[] } {
  const all = [..._CMPSBL_HEAL_PATTERNS.values()];
  const recurring = all.filter(p => p.severity === 'recurring').length;
  const top = all.sort((a, b) => b.count - a.count).slice(0, 5).map(p => p.signature);
  return { patterns: all.length, recurring, topSignatures: top };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Self-Healing Scanner (proprietary).                        ║
# ║  Observes faults and promotes recurring patterns to the Hardening Layer's     ║
# ║  quarantine kernel. Does NOT retry or fallback — Hardening owns those.        ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import re, time

_CMPSBL_HEAL_PATTERNS = {}
_CMPSBL_HEAL_MAX = 512

def _cmpsbl_heal_sig(err) -> str:
    msg = str(err)
    msg = re.sub(r'[0-9a-f]{8,}', 'X', msg, flags=re.IGNORECASE)
    msg = re.sub(r'\\d+', 'N', msg)
    return msg[:96]

def cmpsbl_heal_record(err) -> dict:
    sig = _cmpsbl_heal_sig(err)
    existing = _CMPSBL_HEAL_PATTERNS.get(sig)
    if existing:
        existing['count'] += 1
        existing['last_seen'] = int(time.time() * 1000)
        if existing['count'] >= 5:
            existing['severity'] = 'recurring'
        elif existing['count'] >= 2:
            existing['severity'] = 'repeating'
        return existing
    p = { 'signature': sig, 'count': 1, 'last_seen': int(time.time() * 1000), 'severity': 'observed' }
    _CMPSBL_HEAL_PATTERNS[sig] = p
    if len(_CMPSBL_HEAL_PATTERNS) > _CMPSBL_HEAL_MAX:
        oldest = min(_CMPSBL_HEAL_PATTERNS.items(), key=lambda kv: kv[1]['last_seen'])
        del _CMPSBL_HEAL_PATTERNS[oldest[0]]
    return p

def cmpsbl_heal_lookup(err):
    return _CMPSBL_HEAL_PATTERNS.get(_cmpsbl_heal_sig(err))

def cmpsbl_heal_promote_to_quarantine(capability_name: str, pattern: dict) -> None:
    """Promote a recurring fault signature to the Hardening Layer's quarantine kernel."""
    if pattern.get('severity') != 'recurring':
        return
    # cmpsbl_quarantine() is provided by the always-on Hardening chain
    # (_quarantine-core). Strikes accumulate against the capability name and
    # the kernel applies its configured threshold/TTL hold semantics.
    quarantine_fn = globals().get('cmpsbl_quarantine')
    if callable(quarantine_fn):
        try:
            quarantine_fn().report(capability_name, 'self_healing:' + pattern['signature'])
        except Exception:
            # Quarantine kernel disabled (CMPSBL_KERNEL_ENABLED=false). Pattern
            # is still recorded locally for offline analysis.
            pass

def cmpsbl_heal_report() -> dict:
    all_p = list(_CMPSBL_HEAL_PATTERNS.values())
    recurring = sum(1 for p in all_p if p['severity'] == 'recurring')
    top = [p['signature'] for p in sorted(all_p, key=lambda x: -x['count'])[:5]]
    return { 'patterns': len(all_p), 'recurring': recurring, 'top_signatures': top }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_heal = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_heal(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Observe-and-promote pattern. Hardening Layer's _retry-core and
  // _degradation-core wrappers run AROUND this one; they own retry/fallback.
  // We just learn from every fault and escalate recurring signatures into
  // the Hardening quarantine kernel, then re-throw so the kernel keeps acting.
  try {
    return _cmpsbl_raw_execute_heal(capabilityName, input);
  } catch (e) {
    const pattern = cmpsbl_heal_record(e);
    cmpsbl_heal_promote_to_quarantine(capabilityName, pattern);
    throw e;
  }
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_heal = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Recurring-Fault Learning & Quarantine Layer (observe + promote-to-quarantine, no retry)."""
    # Observe-and-promote pattern. Hardening Layer's _retry-core and
    # _degradation-core wrappers run AROUND this one; they own retry/fallback.
    # We just learn from every fault and escalate recurring signatures into
    # the Hardening quarantine kernel, then re-raise so the kernel keeps acting.
    try:
        return _cmpsbl_raw_execute_heal(capability_name, input_data)
    except Exception as e:
        pattern = cmpsbl_heal_record(e)
        cmpsbl_heal_promote_to_quarantine(capability_name, pattern)
        raise`;

export const SELF_HEALING_SCANNER_LAYER: CmpsblLayerDefinition = {
  id: 'self-healing-scanner',
  name: 'Recurring-Fault Learning & Quarantine Layer',
  crownJewelRank: 27,
  cjpi: 94,
  module: 'LEARNING×EVOLUTION',
  description: 'Fingerprints every fault, escalates by recurrence (observed → repeating → recurring), and tells the always-on Hardening Layer to quarantine repeat offenders — so the same bug never bites you twice.',
  priceCents: 9900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_heal_promote_to_quarantine',
    behavior: 'Catches every fault, fingerprints it, and after 5 recurrences of the same signature promotes the capability to the Hardening quarantine kernel. Faults are always re-thrown so Hardening\'s retry/degradation cores can react.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
