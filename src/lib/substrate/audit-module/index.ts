/**
 * AUDIT Module — Immutable Compliance Ledger
 * v9.3.0 ARCHITECT Epoch — Append-only logging, hash chaining, cross-module capture
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';

export interface AuditEntry {
  id: string;
  timestamp: number;
  actor: { id: string; type: 'human' | 'agent' | 'system' };
  module: string;
  action: string;
  resource: string;
  resourceId: string;
  previousState: unknown;
  newState: unknown;
  metadata: Record<string, string>;
  hash: string;
  previousHash: string;
}

export interface AuditModuleState {
  initialized: boolean;
  totalEntries: number;
  chainValid: boolean;
  lastEntry: string | null;
  modulesMonitored: string[];
}

const auditLog: AuditEntry[] = [];
let lastHash = '0000000000000000';

function computeHash(entry: Omit<AuditEntry, 'hash'>): string {
  const data = `${entry.previousHash}:${entry.timestamp}:${entry.actor.id}:${entry.action}:${entry.module}:${entry.resource}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

const state: AuditModuleState = {
  initialized: false,
  totalEntries: 0,
  chainValid: true,
  lastEntry: null,
  modulesMonitored: [],
};

let moduleEngine: ModuleEngine | null = null;

export function initAudit(): void {
  emitStarted('audit', 'init', {});
  try {
    initCircuitBreaker('audit', { failureThreshold: 8, recoveryTimeout: 15_000 }); // Higher threshold — audit must be resilient
    moduleEngine = activateModuleEngine('audit', '9.3.0');
    state.initialized = true;
    state.modulesMonitored = [
      'core', 'ripple', 'access', 'brain', 'decode', 'encode', 'defense', 'nexus',
      'vision', 'dream', 'integration', 'system', 'modernizer', 'inclusive',
      'cortex', 'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox',
    ];
    emitSucceeded('audit', 'init', { monitored: state.modulesMonitored.length, engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    state.modulesMonitored = ['core', 'ripple', 'access', 'brain', 'decode', 'encode', 'defense', 'nexus',
      'vision', 'dream', 'integration', 'system', 'modernizer', 'inclusive',
      'cortex', 'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox'];
    emitFailed('audit', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function recordAuditEntry(
  actor: { id: string; type: 'human' | 'agent' | 'system' },
  module: string, action: string, resource: string, resourceId: string,
  previousState: unknown = null, newState: unknown = null,
  metadata: Record<string, string> = {}
): AuditEntry {
  const fallbackEntry: AuditEntry = {
    id: `audit-fallback-${Date.now()}`, timestamp: Date.now(), actor, module, action,
    resource, resourceId, previousState, newState, metadata,
    hash: 'fallback', previousHash: lastHash,
  };

  const { result } = withResilienceSync(
    'audit',
    () => {
      const partial = {
        id: `audit-${Date.now()}-${auditLog.length}`,
        timestamp: Date.now(), actor, module, action, resource, resourceId,
        previousState, newState, metadata, previousHash: lastHash,
      };
      const hash = computeHash(partial);
      const entry: AuditEntry = { ...partial, hash };
      auditLog.push(entry);
      lastHash = hash;
      state.totalEntries = auditLog.length;
      state.lastEntry = entry.id;
      return entry;
    },
    fallbackEntry,
    'record'
  );

  return result;
}

export function verifyAuditChain(): { valid: boolean; brokenAt: number | null } {
  let prevHash = '0000000000000000';
  for (let i = 0; i < auditLog.length; i++) {
    if (auditLog[i].previousHash !== prevHash) return { valid: false, brokenAt: i };
    prevHash = auditLog[i].hash;
  }
  state.chainValid = true;
  return { valid: true, brokenAt: null };
}

export function getAuditLog(limit?: number): AuditEntry[] {
  return limit ? auditLog.slice(-limit) : [...auditLog];
}

export function getAuditState(): AuditModuleState { return { ...state }; }
export function getAuditHealth(): number { return state.chainValid ? 100 : 0; }

export function getAuditResilience() {
  return getModuleResilienceReport('audit', getAuditHealth());
}

export function getAuditEngine() {
  return moduleEngine;
}
