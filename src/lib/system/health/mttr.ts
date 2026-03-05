/**
 * MTTR Tracker — Mean Time To Recovery per module
 */

import type { MttrRecord } from './types';

const incidents = new Map<string, MttrRecord[]>();
const MAX_INCIDENTS = 100;

/** Open an incident for a module */
export function openIncident(module: string): MttrRecord {
  const record: MttrRecord = {
    module,
    incident_opened_at: new Date().toISOString(),
    incident_resolved_at: null,
    duration_ms: null,
  };

  const list = incidents.get(module) ?? [];
  list.push(record);
  if (list.length > MAX_INCIDENTS) list.splice(0, list.length - MAX_INCIDENTS);
  incidents.set(module, list);

  return record;
}

/** Resolve the latest open incident for a module */
export function resolveIncident(module: string): MttrRecord | null {
  const list = incidents.get(module);
  if (!list) return null;

  const open = list.find(r => r.incident_resolved_at === null);
  if (!open) return null;

  open.incident_resolved_at = new Date().toISOString();
  open.duration_ms = new Date(open.incident_resolved_at).getTime() - new Date(open.incident_opened_at).getTime();

  return open;
}

/** Compute MTTR for a module (average of resolved incidents) */
export function computeMttr(module: string): number | null {
  const list = incidents.get(module);
  if (!list) return null;

  const resolved = list.filter(r => r.duration_ms !== null);
  if (resolved.length === 0) return null;

  const totalMs = resolved.reduce((sum, r) => sum + (r.duration_ms ?? 0), 0);
  return Math.round(totalMs / resolved.length);
}

/** Check if module has open incident */
export function hasOpenIncident(module: string): boolean {
  const list = incidents.get(module);
  return list?.some(r => r.incident_resolved_at === null) ?? false;
}

/** Get incident history for a module */
export function getIncidents(module: string, limit = 20): MttrRecord[] {
  return (incidents.get(module) ?? []).slice(-limit);
}
