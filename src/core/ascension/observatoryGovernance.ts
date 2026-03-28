/**
 * Ascension Observatory — Unified Governance for All Capabilities
 * Feature flags, circuit breakers, rate limiters, audit chains.
 * One governance wrapper per capability. All disabled by default.
 */

import { executeCapability } from './capabilityEngine';
import { ASCENSION_CAPABILITIES } from './capabilityRegistry';
import { emit } from '../bus/eventBackbone';
import type { CapabilityMeta, CapabilityOutput } from './capabilityEngine';

// ═══ Types ═══════════════════════════════════════════════════════════════

export interface CapabilityGovernance {
  capabilityId: string;
  enabled: boolean;
  circuitOpen: boolean;
  consecutiveFailures: number;
  totalExecutions: number;
  totalErrors: number;
  lastExecution: string | null;
  registeredAt: string;
}

export interface ObservatoryAuditEntry {
  id: string;
  capabilityId: string;
  timestamp: string;
  action: string;
  success: boolean;
  durationMs?: number;
  error?: string;
  integrityHash: string;
}

export type GovernedResult =
  | { status: 'ok'; output: CapabilityOutput }
  | { status: 'disabled'; reason: string }
  | { status: 'circuit_open'; reason: string }
  | { status: 'rate_limited'; reason: string }
  | { status: 'not_found'; reason: string }
  | { status: 'error'; reason: string };

// ═══ Internal State ══════════════════════════════════════════════════════

const MAX_RATE_PER_MIN = 120;
const CIRCUIT_THRESHOLD = 5;
const AUDIT_BUFFER_SIZE = 1000;

const governanceMap = new Map<string, CapabilityGovernance>();
const rateWindows = new Map<string, number[]>();
const auditBuffer: ObservatoryAuditEntry[] = [];
let auditSeq = 0;

// Initialize governance for all capabilities
for (const cap of ASCENSION_CAPABILITIES) {
  governanceMap.set(cap.id, {
    capabilityId: cap.id,
    enabled: false,
    circuitOpen: false,
    consecutiveFailures: 0,
    totalExecutions: 0,
    totalErrors: 0,
    lastExecution: null,
    registeredAt: new Date().toISOString(),
  });
  rateWindows.set(cap.id, []);
}

// ═══ Integrity Hashing ═══════════════════════════════════════════════════

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
    h = h >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function logAudit(capabilityId: string, action: string, success: boolean, durationMs?: number, error?: string): void {
  const id = `OBS-${(++auditSeq).toString().padStart(6, '0')}`;
  const timestamp = new Date().toISOString();
  const prevHash = auditBuffer.length > 0 ? auditBuffer[auditBuffer.length - 1].integrityHash : '00000000';
  const integrityHash = fnv1a(`${prevHash}:${id}:${capabilityId}:${action}:${success}`);

  if (auditBuffer.length >= AUDIT_BUFFER_SIZE) auditBuffer.shift();
  auditBuffer.push({ id, capabilityId, timestamp, action, success, durationMs, error, integrityHash });

  try {
    emit('ascension.observatory', { capabilityId, action, success, durationMs }, 'DEFENSE',
      action === 'circuit_trip' ? 'critical' : 'standard');
  } catch { /* non-blocking */ }
}

// ═══ Rate Limiting ═══════════════════════════════════════════════════════

function checkRate(capabilityId: string): boolean {
  const window = rateWindows.get(capabilityId) || [];
  const cutoff = Date.now() - 60_000;
  const filtered = window.filter(t => t >= cutoff);
  rateWindows.set(capabilityId, filtered);
  return filtered.length < MAX_RATE_PER_MIN;
}

// ═══ Public API ══════════════════════════════════════════════════════════

/**
 * Execute a capability with full governance gates.
 */
export function executeGoverned(capabilityId: string, input: unknown): GovernedResult {
  const cap = ASCENSION_CAPABILITIES.find(c => c.id === capabilityId);
  if (!cap) return { status: 'not_found', reason: `Capability ${capabilityId} not registered` };

  const gov = governanceMap.get(capabilityId)!;

  if (!gov.enabled) return { status: 'disabled', reason: `${cap.displayName} is disabled` };
  if (gov.circuitOpen) {
    logAudit(capabilityId, 'blocked_circuit', false);
    return { status: 'circuit_open', reason: `Circuit breaker tripped for ${cap.displayName}` };
  }
  if (!checkRate(capabilityId)) {
    logAudit(capabilityId, 'rate_limited', false);
    return { status: 'rate_limited', reason: `Rate limit exceeded for ${cap.displayName}` };
  }

  try {
    const output = executeCapability(cap, input);
    const rateWindow = rateWindows.get(capabilityId);
    if (rateWindow) rateWindow.push(Date.now());
    gov.totalExecutions++;
    gov.consecutiveFailures = 0;
    gov.lastExecution = new Date().toISOString();
    logAudit(capabilityId, 'execute', true, output._pipeline.durationMs);
    return { status: 'ok', output };
  } catch (err) {
    gov.consecutiveFailures++;
    gov.totalErrors++;
    const errorMsg = err instanceof Error ? err.message : String(err);
    logAudit(capabilityId, 'execute', false, undefined, errorMsg);
    if (gov.consecutiveFailures >= CIRCUIT_THRESHOLD) {
      gov.circuitOpen = true;
      logAudit(capabilityId, 'circuit_trip', false, undefined, `${gov.consecutiveFailures} consecutive failures`);
    }
    return { status: 'error', reason: errorMsg };
  }
}

/** Enable a single capability. */
export function enableCapability(capabilityId: string): boolean {
  const gov = governanceMap.get(capabilityId);
  if (!gov) return false;
  gov.enabled = true;
  gov.circuitOpen = false;
  gov.consecutiveFailures = 0;
  logAudit(capabilityId, 'enable', true);
  return true;
}

/** Disable a single capability (kill switch). */
export function disableCapability(capabilityId: string): boolean {
  const gov = governanceMap.get(capabilityId);
  if (!gov) return false;
  gov.enabled = false;
  logAudit(capabilityId, 'disable', true);
  return true;
}

/** Enable all capabilities. */
export function enableAll(): void {
  for (const cap of ASCENSION_CAPABILITIES) enableCapability(cap.id);
}

/** Disable all capabilities (global kill switch). */
export function disableAll(): void {
  for (const cap of ASCENSION_CAPABILITIES) disableCapability(cap.id);
}

/** Emergency rollback — disable + clear circuit + flush rate. */
export function rollbackCapability(capabilityId: string): boolean {
  const gov = governanceMap.get(capabilityId);
  if (!gov) return false;
  gov.enabled = false;
  gov.circuitOpen = false;
  gov.consecutiveFailures = 0;
  rateWindows.set(capabilityId, []);
  logAudit(capabilityId, 'rollback', true);
  return true;
}

/** Global rollback — everything off, everything cleared. */
export function rollbackAll(): void {
  for (const cap of ASCENSION_CAPABILITIES) rollbackCapability(cap.id);
}

/** Reset circuit breaker for a capability. */
export function resetCircuit(capabilityId: string): boolean {
  const gov = governanceMap.get(capabilityId);
  if (!gov) return false;
  gov.circuitOpen = false;
  gov.consecutiveFailures = 0;
  logAudit(capabilityId, 'circuit_reset', true);
  return true;
}

/** Get governance state for all capabilities. */
export function getObservatoryState(): { capabilities: (CapabilityGovernance & { meta: CapabilityMeta })[] } {
  return {
    capabilities: ASCENSION_CAPABILITIES.map(cap => ({
      ...governanceMap.get(cap.id)!,
      meta: cap,
    })),
  };
}

/** Get governance state for one capability. */
export function getCapabilityState(capabilityId: string): (CapabilityGovernance & { meta: CapabilityMeta }) | null {
  const gov = governanceMap.get(capabilityId);
  const meta = ASCENSION_CAPABILITIES.find(c => c.id === capabilityId);
  if (!gov || !meta) return null;
  return { ...gov, meta };
}

/** Get audit trail (newest first). */
export function getObservatoryAudit(limit = 100, capabilityId?: string): ObservatoryAuditEntry[] {
  let entries = auditBuffer;
  if (capabilityId) entries = entries.filter(e => e.capabilityId === capabilityId);
  return entries.slice(-limit).reverse();
}

/** Verify audit chain integrity. */
export function verifyObservatoryIntegrity(): { valid: boolean; entries: number; broken?: number } {
  for (let i = 1; i < auditBuffer.length; i++) {
    const prev = auditBuffer[i - 1];
    const curr = auditBuffer[i];
    const expected = fnv1a(`${prev.integrityHash}:${curr.id}:${curr.capabilityId}:${curr.action}:${curr.success}`);
    if (expected !== curr.integrityHash) return { valid: false, entries: auditBuffer.length, broken: i };
  }
  return { valid: true, entries: auditBuffer.length };
}
