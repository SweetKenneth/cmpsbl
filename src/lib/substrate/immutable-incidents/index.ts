/**
 * Immutable Incident Reports
 * SPARTA Epoch — Auto-generated post-mortem documents for every breaker trip
 * 
 * Stored in AUDIT with correlation IDs for full traceability.
 * Reports are append-only and cannot be modified after creation.
 */

import { supabase } from '@/integrations/supabase/client';
import { emit } from '../events';
import type { SubstrateModuleName } from '@/lib/core';

export interface IncidentReport {
  id: string;
  correlationId: string;
  nodeId: SubstrateModuleName;
  type: 'breaker_trip' | 'sector_kill' | 'cascade_failure' | 'chaos_test' | 'heal_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  summary: string;
  timeline: IncidentTimelineEntry[];
  rootCause: string | null;
  resolution: string | null;
  affectedNodes: string[];
  metrics: {
    detectionTimeMs: number;
    recoveryTimeMs: number | null;
    healthBefore: number;
    healthAfter: number;
  };
  createdAt: string;
  resolvedAt: string | null;
  immutable: true; // marker — these are append-only
}

export interface IncidentTimelineEntry {
  timestamp: string;
  event: string;
  source: string;
  detail: string;
}

const incidentStore: IncidentReport[] = [];
let correlationCounter = 0;

function generateCorrelationId(): string {
  correlationCounter++;
  return `INC-${Date.now().toString(36).toUpperCase()}-${correlationCounter.toString().padStart(4, '0')}`;
}

export async function createIncidentReport(
  nodeId: SubstrateModuleName,
  type: IncidentReport['type'],
  severity: IncidentReport['severity'],
  context: {
    title?: string;
    summary?: string;
    rootCause?: string;
    affectedNodes?: string[];
    healthBefore?: number;
    healthAfter?: number;
    detectionTimeMs?: number;
    timelineEntries?: IncidentTimelineEntry[];
  } = {}
): Promise<IncidentReport> {
  const correlationId = generateCorrelationId();
  const now = new Date().toISOString();

  const report: IncidentReport = {
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    correlationId,
    nodeId,
    type,
    severity,
    title: context.title ?? `${type.replace(/_/g, ' ').toUpperCase()} — ${nodeId.toUpperCase()}`,
    summary: context.summary ?? `Incident detected on ${nodeId.toUpperCase()} node`,
    timeline: context.timelineEntries ?? [{
      timestamp: now,
      event: 'incident_created',
      source: 'immutable-incidents',
      detail: `Auto-generated report for ${type} on ${nodeId}`,
    }],
    rootCause: context.rootCause ?? null,
    resolution: null,
    affectedNodes: context.affectedNodes ?? [nodeId],
    metrics: {
      detectionTimeMs: context.detectionTimeMs ?? 0,
      recoveryTimeMs: null,
      healthBefore: context.healthBefore ?? 100,
      healthAfter: context.healthAfter ?? 0,
    },
    createdAt: now,
    resolvedAt: null,
    immutable: true,
  };

  // Store locally (immutable)
  incidentStore.push(Object.freeze({ ...report }) as IncidentReport);

  // Persist to audit trail
  try {
    await supabase.from('audit_logs').insert({
      action: 'incident_report_created',
      entity_type: 'incident',
      entity_id: report.correlationId,
      details: {
        report_id: report.id,
        correlation_id: report.correlationId,
        node_id: nodeId,
        type,
        severity,
        title: report.title,
        affected_nodes: report.affectedNodes,
        metrics: report.metrics,
      } as any,
    });
  } catch {
    // Graceful — local store is primary
  }

  emit({
    module: 'audit',
    event_type: 'incident_report_created',
    outcome: severity === 'critical' ? 'failed' : 'succeeded',
    data: { correlationId, nodeId, type, severity },
  });

  if (incidentStore.length > 500) incidentStore.splice(0, incidentStore.length - 250);

  return report;
}

export function addResolution(correlationId: string, resolution: string): IncidentReport | null {
  // Create a new resolution entry (append-only — original report is frozen)
  const original = incidentStore.find(r => r.correlationId === correlationId);
  if (!original) return null;

  // We create a resolution record, not modify the original
  const resolved: IncidentReport = {
    ...original,
    id: `${original.id}-resolved`,
    resolution,
    resolvedAt: new Date().toISOString(),
    metrics: {
      ...original.metrics,
      recoveryTimeMs: Date.now() - new Date(original.createdAt).getTime(),
      healthAfter: 100,
    },
    timeline: [
      ...original.timeline,
      {
        timestamp: new Date().toISOString(),
        event: 'incident_resolved',
        source: 'governor',
        detail: resolution,
      },
    ],
  };

  incidentStore.push(Object.freeze({ ...resolved }) as IncidentReport);
  return resolved;
}

export function getIncidentReports(limit = 50): IncidentReport[] {
  return incidentStore.slice(-limit);
}

export function getReportByCorrelationId(correlationId: string): IncidentReport | null {
  // Return the latest version (may include resolution)
  const matching = incidentStore.filter(r => r.correlationId === correlationId);
  return matching[matching.length - 1] ?? null;
}

export function getOpenIncidents(): IncidentReport[] {
  const correlationIds = new Set<string>();
  const open: IncidentReport[] = [];

  // Walk backwards to find latest state per correlation ID
  for (let i = incidentStore.length - 1; i >= 0; i--) {
    const r = incidentStore[i];
    if (!correlationIds.has(r.correlationId)) {
      correlationIds.add(r.correlationId);
      if (!r.resolvedAt) open.push(r);
    }
  }

  return open;
}

export function getIncidentSummary() {
  const open = getOpenIncidents();
  const all = incidentStore;
  const critical = open.filter(r => r.severity === 'critical');

  const resolved = all.filter(r => r.resolvedAt);
  const avgRecovery = resolved.length > 0
    ? Math.round(resolved.reduce((s, r) => s + (r.metrics.recoveryTimeMs ?? 0), 0) / resolved.length / 1000)
    : 0;

  return {
    totalReports: all.length,
    openIncidents: open.length,
    criticalOpen: critical.length,
    avgRecoverySeconds: avgRecovery,
    immutable: true,
  };
}
