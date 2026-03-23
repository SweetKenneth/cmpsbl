/**
 * MEDIC — Quarantine & Isolation Manager
 * Safely isolates failing nodes from the mesh without disrupting healthy traffic.
 * Manages quarantine zones with automatic re-admission on health check pass.
 * @module medic/quarantineIsolationManager
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface QuarantineEntry {
  nodeId: string;
  reason: string;
  quarantinedAt: number;
  healthChecks: number;
  healthChecksPassed: number;
  autoReadmit: boolean;
  readmittedAt: number | null;
  status: 'quarantined' | 'probation' | 'readmitted' | 'permanent';
}

export interface QuarantineStats {
  activeQuarantines: number;
  onProbation: number;
  totalReadmitted: number;
  totalPermanent: number;
  avgQuarantineDurationMs: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const PROBATION_CHECKS_REQUIRED = 3;
const MAX_HISTORY = 200;

// ── State ──────────────────────────────────────────────────────────────────

const quarantineZone = new Map<string, QuarantineEntry>();
const history: QuarantineEntry[] = [];

// ── Core ───────────────────────────────────────────────────────────────────

export function quarantineNode(
  nodeId: string,
  reason: string,
  autoReadmit = true,
): QuarantineEntry {
  const existing = quarantineZone.get(nodeId);
  if (existing && existing.status === 'quarantined') return { ...existing };

  const entry: QuarantineEntry = {
    nodeId,
    reason,
    quarantinedAt: Date.now(),
    healthChecks: 0,
    healthChecksPassed: 0,
    autoReadmit,
    readmittedAt: null,
    status: 'quarantined',
  };

  quarantineZone.set(nodeId, entry);
  return { ...entry };
}

export function recordHealthCheck(nodeId: string, passed: boolean): QuarantineEntry | null {
  const entry = quarantineZone.get(nodeId);
  if (!entry || entry.status === 'readmitted' || entry.status === 'permanent') return null;

  entry.healthChecks++;
  if (passed) entry.healthChecksPassed++;
  else entry.healthChecksPassed = 0; // reset on failure

  // Move to probation after first pass
  if (entry.status === 'quarantined' && passed) {
    entry.status = 'probation';
  }

  // Auto-readmit after consecutive passes
  if (entry.autoReadmit && entry.healthChecksPassed >= PROBATION_CHECKS_REQUIRED) {
    entry.status = 'readmitted';
    entry.readmittedAt = Date.now();
    archiveEntry(entry);
    quarantineZone.delete(nodeId);
  }

  return { ...entry };
}

export function markPermanent(nodeId: string): boolean {
  const entry = quarantineZone.get(nodeId);
  if (!entry) return false;
  entry.status = 'permanent';
  entry.autoReadmit = false;
  return true;
}

export function forceReadmit(nodeId: string): boolean {
  const entry = quarantineZone.get(nodeId);
  if (!entry) return false;
  entry.status = 'readmitted';
  entry.readmittedAt = Date.now();
  archiveEntry(entry);
  quarantineZone.delete(nodeId);
  return true;
}

export function isQuarantined(nodeId: string): boolean {
  const entry = quarantineZone.get(nodeId);
  return entry != null && (entry.status === 'quarantined' || entry.status === 'probation');
}

export function getQuarantinedNodes(): QuarantineEntry[] {
  return Array.from(quarantineZone.values())
    .filter(e => e.status === 'quarantined' || e.status === 'probation')
    .map(e => ({ ...e }));
}

export function getStats(): QuarantineStats {
  const active = Array.from(quarantineZone.values());
  const readmitted = history.filter(e => e.status === 'readmitted');
  const durations = readmitted
    .filter(e => e.readmittedAt)
    .map(e => e.readmittedAt! - e.quarantinedAt);

  return {
    activeQuarantines: active.filter(e => e.status === 'quarantined' || e.status === 'probation').length,
    onProbation: active.filter(e => e.status === 'probation').length,
    totalReadmitted: readmitted.length,
    totalPermanent: active.filter(e => e.status === 'permanent').length,
    avgQuarantineDurationMs: durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0,
  };
}

function archiveEntry(entry: QuarantineEntry): void {
  history.push({ ...entry });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
}

export function resetQuarantine(): void {
  quarantineZone.clear();
  history.length = 0;
}
