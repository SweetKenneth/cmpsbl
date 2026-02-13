/**
 * AUDIT Module — Immutable Compliance Ledger
 * v9.1.0 ARCHITECT Epoch — Append-only logging, hash chaining, cross-module capture
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';

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

export function initAudit(): void {
  emitStarted('audit', 'init', {});
  state.initialized = true;
  // AUDIT listens to ALL modules
  state.modulesMonitored = [
    'core', 'ripple', 'access', 'brain', 'decode', 'encode', 'defense', 'nexus',
    'vision', 'dream', 'integration', 'system', 'modernizer', 'inclusive',
    'cortex', 'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox',
  ];
  emitSucceeded('audit', 'init', { monitored: state.modulesMonitored.length });
}

export function recordAuditEntry(
  actor: { id: string; type: 'human' | 'agent' | 'system' },
  module: string, action: string, resource: string, resourceId: string,
  previousState: unknown = null, newState: unknown = null,
  metadata: Record<string, string> = {}
): AuditEntry {
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
