/**
 * Cognitive Threat Profiler — Governance & Rollback Layer
 * Feature flag, kill switch, audit ring buffer, and rollback capability.
 *
 * Governance gates:
 *  1. Feature flag (enable/disable)
 *  2. Circuit breaker (auto-trip on repeated failures)
 *  3. Rate limiter (max executions per window)
 *  4. Audit trail (ring buffer with FNV-1a integrity hashing)
 *  5. Rollback (instant disable + drain)
 */

import { executeThreatProfiler, validateProfiler } from './cognitiveThreatProfiler';
import type { ThreatProfileInput, ThreatProfile } from './cognitiveThreatProfiler';
import { emit } from '../bus/eventBackbone';

// ═══ Types ═══════════════════════════════════════════════════════════════

export interface ProfilerConfig {
  enabled: boolean;
  maxExecutionsPerMinute: number;
  circuitBreakerThreshold: number; // consecutive failures before trip
  auditBufferSize: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'execute' | 'enable' | 'disable' | 'rollback' | 'circuit_trip' | 'circuit_reset' | 'rate_limited';
  success: boolean;
  durationMs?: number;
  threatsFound?: number;
  inputHash?: string;
  error?: string;
  integrityHash: string;
}

export interface ProfilerState {
  config: Readonly<ProfilerConfig>;
  circuitOpen: boolean;
  consecutiveFailures: number;
  totalExecutions: number;
  totalThreatsDetected: number;
  lastExecution: string | null;
  upSince: string;
}

export type GovernedResult =
  | { status: 'ok'; profile: ThreatProfile }
  | { status: 'disabled'; reason: string }
  | { status: 'circuit_open'; reason: string }
  | { status: 'rate_limited'; reason: string }
  | { status: 'error'; reason: string };

// ═══ Internal State ══════════════════════════════════════════════════════

const config: ProfilerConfig = {
  enabled: false, // OFF by default — must be explicitly enabled
  maxExecutionsPerMinute: 120,
  circuitBreakerThreshold: 5,
  auditBufferSize: 500,
};

let circuitOpen = false;
let consecutiveFailures = 0;
let totalExecutions = 0;
let totalThreatsDetected = 0;
let lastExecution: string | null = null;
const upSince = new Date().toISOString();

// Rate limiter
const executionTimestamps: number[] = [];

// Audit ring buffer
const auditBuffer: AuditEntry[] = [];
let auditSeq = 0;

// ═══ FNV-1a for audit integrity ═════════════════════════════════════════

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
    h = h >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function quickInputHash(data: unknown): string {
  try {
    const s = typeof data === 'string' ? data : JSON.stringify(data);
    return fnv1a(s);
  } catch {
    return 'unhashable';
  }
}

// ═══ Audit ═══════════════════════════════════════════════════════════════

function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'integrityHash'>): void {
  const id = `CTP-${(++auditSeq).toString().padStart(6, '0')}`;
  const timestamp = new Date().toISOString();
  const raw = `${id}:${timestamp}:${entry.action}:${entry.success}`;
  const prevHash = auditBuffer.length > 0 ? auditBuffer[auditBuffer.length - 1].integrityHash : '00000000';
  const integrityHash = fnv1a(`${prevHash}:${raw}`);

  const full: AuditEntry = { ...entry, id, timestamp, integrityHash };

  if (auditBuffer.length >= config.auditBufferSize) {
    auditBuffer.shift(); // ring buffer — evict oldest
  }
  auditBuffer.push(full);

  // Emit to event backbone (non-blocking, synchronous dispatch)
  try {
    emit('ascension.threat_profiler', {
      type: entry.action,
      success: entry.success,
      threats: entry.threatsFound,
      durationMs: entry.durationMs,
    }, 'DEFENSE', entry.action === 'circuit_trip' ? 'critical' : 'standard');
  } catch { /* telemetry must never interrupt execution */ }
}

// ═══ Rate Limiter ════════════════════════════════════════════════════════

function checkRateLimit(): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  // Prune old timestamps
  while (executionTimestamps.length > 0 && executionTimestamps[0] < windowStart) {
    executionTimestamps.shift();
  }
  return executionTimestamps.length < config.maxExecutionsPerMinute;
}

// ═══ Public API ══════════════════════════════════════════════════════════

/**
 * Execute the threat profiler with full governance.
 * Checks: enabled → circuit breaker → rate limit → execute → audit
 */
export function profileWithGovernance(input: ThreatProfileInput): GovernedResult {
  // Gate 1: Feature flag
  if (!config.enabled) {
    return { status: 'disabled', reason: 'Cognitive Threat Profiler is disabled. Call enableProfiler() to activate.' };
  }

  // Gate 2: Circuit breaker
  if (circuitOpen) {
    logAudit({ action: 'execute', success: false, error: 'circuit_open', inputHash: quickInputHash(input.data) });
    return { status: 'circuit_open', reason: `Circuit breaker tripped after ${config.circuitBreakerThreshold} consecutive failures. Call resetCircuit() to recover.` };
  }

  // Gate 3: Rate limiter
  if (!checkRateLimit()) {
    logAudit({ action: 'rate_limited', success: false, inputHash: quickInputHash(input.data) });
    return { status: 'rate_limited', reason: `Rate limit exceeded (${config.maxExecutionsPerMinute}/min). Try again shortly.` };
  }

  // Execute
  try {
    const profile = executeThreatProfiler(input);
    executionTimestamps.push(Date.now());
    totalExecutions++;
    consecutiveFailures = 0;
    totalThreatsDetected += profile._enriched.defense.threats;
    lastExecution = new Date().toISOString();

    logAudit({
      action: 'execute',
      success: true,
      durationMs: profile._pipeline.durationMs,
      threatsFound: profile._enriched.defense.threats,
      inputHash: quickInputHash(input.data),
    });

    return { status: 'ok', profile };
  } catch (err) {
    consecutiveFailures++;
    const errorMsg = err instanceof Error ? err.message : String(err);

    logAudit({
      action: 'execute',
      success: false,
      error: errorMsg,
      inputHash: quickInputHash(input.data),
    });

    // Auto-trip circuit breaker
    if (consecutiveFailures >= config.circuitBreakerThreshold) {
      circuitOpen = true;
      logAudit({ action: 'circuit_trip', success: false, error: `${consecutiveFailures} consecutive failures` });
    }

    return { status: 'error', reason: errorMsg };
  }
}

/**
 * Enable the profiler. Validates internal integrity first.
 */
export function enableProfiler(): { success: boolean; reason?: string } {
  if (!validateProfiler()) {
    return { success: false, reason: 'Profiler integrity check failed — sealed parameters may be corrupted.' };
  }
  config.enabled = true;
  circuitOpen = false;
  consecutiveFailures = 0;
  logAudit({ action: 'enable', success: true });
  return { success: true };
}

/**
 * Disable the profiler immediately. Instant kill switch.
 */
export function disableProfiler(): void {
  config.enabled = false;
  logAudit({ action: 'disable', success: true });
}

/**
 * Emergency rollback — disable + clear circuit + flush rate limiter.
 */
export function rollbackProfiler(): void {
  config.enabled = false;
  circuitOpen = false;
  consecutiveFailures = 0;
  executionTimestamps.length = 0;
  logAudit({ action: 'rollback', success: true });
}

/**
 * Reset the circuit breaker manually.
 */
export function resetCircuit(): void {
  circuitOpen = false;
  consecutiveFailures = 0;
  logAudit({ action: 'circuit_reset', success: true });
}

/**
 * Update governance configuration.
 */
export function configureProfiler(updates: Partial<ProfilerConfig>): ProfilerConfig {
  Object.assign(config, updates);
  return { ...config };
}

/**
 * Get full profiler state for observability dashboards.
 */
export function getProfilerState(): ProfilerState {
  return {
    config: { ...config },
    circuitOpen,
    consecutiveFailures,
    totalExecutions,
    totalThreatsDetected,
    lastExecution,
    upSince,
  };
}

/**
 * Get audit trail (newest first).
 */
export function getAuditTrail(limit = 50): AuditEntry[] {
  return auditBuffer.slice(-limit).reverse();
}

/**
 * Verify audit chain integrity — checks FNV-1a hash chain is unbroken.
 */
export function verifyAuditIntegrity(): { valid: boolean; entries: number; broken?: number } {
  for (let i = 1; i < auditBuffer.length; i++) {
    const prev = auditBuffer[i - 1];
    const curr = auditBuffer[i];
    const raw = `${curr.id}:${curr.timestamp}:${curr.action}:${curr.success}`;
    const expectedHash = fnv1a(`${prev.integrityHash}:${raw}`);
    if (expectedHash !== curr.integrityHash) {
      return { valid: false, entries: auditBuffer.length, broken: i };
    }
  }
  return { valid: true, entries: auditBuffer.length };
}
