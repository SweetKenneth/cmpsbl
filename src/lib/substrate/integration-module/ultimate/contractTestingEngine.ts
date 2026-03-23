/**
 * Contract Testing Engine
 * 
 * Ensures external APIs haven't broken their contract with the substrate.
 * Captures response schemas, detects drift, classifies breaking changes.
 * 
 * @module integration/ultimate/contractTestingEngine
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export interface SchemaSnapshot {
  integrationId: string;
  endpointPath: string;
  fields: Array<{ name: string; type: string; required: boolean }>;
  capturedAt: number;
  version: number;
}

export type DriftSeverity = 'critical' | 'high' | 'info';

export interface DriftReport {
  integrationId: string;
  endpointPath: string;
  drifts: Array<{
    field: string;
    change: 'removed' | 'type_changed' | 'added' | 'nullability_changed';
    severity: DriftSeverity;
    before?: string;
    after?: string;
  }>;
  detectedAt: number;
  overallSeverity: DriftSeverity;
}

export interface DependencyMapping {
  externalField: string;
  integrationId: string;
  dependentFeatures: string[];
}

// ── State ──────────────────────────────────────────────────────

const snapshots = new Map<string, SchemaSnapshot>();
const driftHistory: DriftReport[] = [];
const dependencyMap: DependencyMapping[] = [];

// ── Core ───────────────────────────────────────────────────────

function snapshotKey(integrationId: string, endpoint: string): string {
  return `${integrationId}::${endpoint}`;
}

/** Capture a schema snapshot from a live response */
export function captureSnapshot(integrationId: string, endpointPath: string, responseBody: unknown): SchemaSnapshot {
  const key = snapshotKey(integrationId, endpointPath);
  const existing = snapshots.get(key);
  const fields: SchemaSnapshot['fields'] = [];

  if (responseBody && typeof responseBody === 'object' && !Array.isArray(responseBody)) {
    for (const [name, value] of Object.entries(responseBody as Record<string, unknown>)) {
      fields.push({
        name,
        type: value === null ? 'null' : typeof value,
        required: value !== null && value !== undefined,
      });
    }
  }

  const snapshot: SchemaSnapshot = {
    integrationId, endpointPath, fields,
    capturedAt: Date.now(),
    version: (existing?.version ?? 0) + 1,
  };
  snapshots.set(key, snapshot);
  return snapshot;
}

/** Compare live response against stored snapshot */
export function detectDrift(integrationId: string, endpointPath: string, liveBody: unknown): DriftReport | null {
  const key = snapshotKey(integrationId, endpointPath);
  const baseline = snapshots.get(key);
  if (!baseline) return null;

  const liveFields = new Map<string, string>();
  if (liveBody && typeof liveBody === 'object' && !Array.isArray(liveBody)) {
    for (const [name, value] of Object.entries(liveBody as Record<string, unknown>)) {
      liveFields.set(name, value === null ? 'null' : typeof value);
    }
  }

  const drifts: DriftReport['drifts'] = [];

  // Check for removed/changed fields
  for (const field of baseline.fields) {
    if (!liveFields.has(field.name)) {
      drifts.push({ field: field.name, change: 'removed', severity: 'critical', before: field.type });
    } else {
      const liveType = liveFields.get(field.name)!;
      if (liveType !== field.type && field.type !== 'null') {
        drifts.push({ field: field.name, change: 'type_changed', severity: 'high', before: field.type, after: liveType });
      }
    }
  }

  // Check for new fields
  for (const [name, type] of liveFields) {
    if (!baseline.fields.find(f => f.name === name)) {
      drifts.push({ field: name, change: 'added', severity: 'info', after: type });
    }
  }

  if (drifts.length === 0) return null;

  const overallSeverity: DriftSeverity = drifts.some(d => d.severity === 'critical') ? 'critical' :
    drifts.some(d => d.severity === 'high') ? 'high' : 'info';

  const report: DriftReport = { integrationId, endpointPath, drifts, detectedAt: Date.now(), overallSeverity };
  driftHistory.push(report);
  return report;
}

/** Register a feature dependency on an external field */
export function registerDependency(integrationId: string, externalField: string, featureId: string): void {
  const existing = dependencyMap.find(d => d.integrationId === integrationId && d.externalField === externalField);
  if (existing) {
    if (!existing.dependentFeatures.includes(featureId)) existing.dependentFeatures.push(featureId);
  } else {
    dependencyMap.push({ externalField, integrationId, dependentFeatures: [featureId] });
  }
}

/** Get features affected by a drift */
export function getAffectedFeatures(integrationId: string, fieldName: string): string[] {
  return dependencyMap
    .filter(d => d.integrationId === integrationId && d.externalField === fieldName)
    .flatMap(d => d.dependentFeatures);
}

export function getDriftHistory(): DriftReport[] { return [...driftHistory]; }
export function getSnapshots(): SchemaSnapshot[] { return Array.from(snapshots.values()); }

export function getContractHealth() {
  return {
    trackedEndpoints: snapshots.size,
    totalDriftsDetected: driftHistory.length,
    criticalDrifts: driftHistory.filter(d => d.overallSeverity === 'critical').length,
    dependencyMappings: dependencyMap.length,
  };
}

export function resetContractEngine(): void {
  snapshots.clear();
  driftHistory.length = 0;
  dependencyMap.length = 0;
}
