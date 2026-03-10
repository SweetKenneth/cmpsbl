/**
 * Incident Timeline Reconstruction
 * Builds causal timelines from correlated brain_events
 * 
 * When an anomaly is detected, reconstructs the chain of events
 * that led to it, enabling root-cause analysis.
 */

import { supabase } from '@/integrations/supabase/client';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  outcome: string;
  detail: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  causalLinks: string[];  // IDs of related events
}

export interface Incident {
  id: string;
  title: string;
  triggerEvent: TimelineEvent;
  timeline: TimelineEvent[];
  rootCause: string | null;
  affectedModules: string[];
  duration: number;       // ms from first to last event
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'resolved' | 'monitoring';
  createdAt: number;
  resolvedAt: number | null;
}

export interface TimelineConfig {
  windowMinutes: number;  // how far back to search
  maxEvents: number;
  correlationModules: string[];  // modules to include in search
}

const DEFAULT_CONFIG: TimelineConfig = {
  windowMinutes: 60,
  maxEvents: 200,
  correlationModules: [],
};

const incidents = new Map<string, Incident>();

/** Reconstruct timeline around a trigger event */
export async function reconstructTimeline(
  triggerModule: string,
  triggerAction: string,
  config: Partial<TimelineConfig> = {}
): Promise<Incident> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = new Date();
  const windowStart = new Date(now.getTime() - cfg.windowMinutes * 60_000);

  // Fetch events in the time window
  let query = supabase
    .from('brain_events')
    .select('id, module, event_type, outcome, data, created_at')
    .gte('created_at', windowStart.toISOString())
    .order('created_at', { ascending: true })
    .limit(cfg.maxEvents);

  if (cfg.correlationModules.length > 0) {
    query = query.in('module', cfg.correlationModules);
  }

  const { data: events } = await query;

  if (!events || events.length === 0) {
    const empty = createEmptyIncident(triggerModule, triggerAction);
    incidents.set(empty.id, empty);
    return empty;
  }

  // Build timeline events
  const timeline: TimelineEvent[] = events.map(e => ({
    id: e.id,
    timestamp: e.created_at,
    module: e.module,
    action: e.event_type,
    outcome: e.outcome || 'unknown',
    detail: typeof e.data === 'object' && e.data !== null
      ? (e.data as Record<string, unknown>).detail as string || ''
      : '',
    severity: classifySeverity(e.outcome || ''),
    causalLinks: [],
  }));

  // Find the trigger event
  const trigger = timeline.find(
    t => t.module === triggerModule && t.action === triggerAction && t.outcome === 'failure'
  ) || timeline[timeline.length - 1];

  // Build causal links — connect failures to preceding events in same/related modules
  for (let i = timeline.length - 1; i > 0; i--) {
    if (timeline[i].severity === 'error' || timeline[i].severity === 'critical') {
      // Link to previous events in the same module or dependency chain
      for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
        if (
          timeline[j].module === timeline[i].module ||
          isRelatedModule(timeline[j].module, timeline[i].module)
        ) {
          timeline[i].causalLinks.push(timeline[j].id);
        }
      }
    }
  }

  // Identify root cause — first failure in the chain
  const failures = timeline.filter(t => t.severity === 'error' || t.severity === 'critical');
  const rootCause = failures.length > 0
    ? `First failure: ${failures[0].module}.${failures[0].action} at ${failures[0].timestamp}`
    : null;

  const affectedModules = [...new Set(failures.map(f => f.module))];

  const firstTs = new Date(timeline[0].timestamp).getTime();
  const lastTs = new Date(timeline[timeline.length - 1].timestamp).getTime();

  const severity: Incident['severity'] =
    failures.length > 5 ? 'critical' :
    failures.length > 2 ? 'high' :
    failures.length > 0 ? 'medium' : 'low';

  const incident: Incident = {
    id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${triggerModule}.${triggerAction} incident`,
    triggerEvent: trigger,
    timeline,
    rootCause,
    affectedModules,
    duration: lastTs - firstTs,
    severity,
    status: 'investigating',
    createdAt: Date.now(),
    resolvedAt: null,
  };

  incidents.set(incident.id, incident);
  return incident;
}

function classifySeverity(outcome: string): TimelineEvent['severity'] {
  if (outcome === 'failure' || outcome === 'error') return 'error';
  if (outcome === 'critical') return 'critical';
  if (outcome === 'warning' || outcome === 'degraded') return 'warning';
  return 'info';
}

const MODULE_RELATIONS: Record<string, string[]> = {
  core: ['brain', 'system', 'ripple'],
  brain: ['core', 'dream', 'decode', 'cortex', 'memory'],
  nexus: ['integration', 'brain', 'relay'],
  defense: ['access', 'vision', 'identity'],
  vision: ['defense', 'core', 'decode'],
  system: ['core', 'evolution', 'audit'],
  evolution: ['system', 'cortex', 'encode'],
  cortex: ['brain', 'evolution', 'encode'],
  decode: ['brain', 'vision', 'inclusive'],
  encode: ['cortex', 'evolution', 'sandbox'],
  dream: ['brain', 'inclusive'],
  ripple: ['core', 'relay', 'integration'],
  access: ['defense', 'identity', 'economy'],
  inclusive: ['decode', 'dream', 'vision'],
  integration: ['nexus', 'ripple', 'relay'],
  memory: ['brain', 'cortex', 'audit'],
  relay: ['ripple', 'integration', 'nexus'],
  audit: ['system', 'memory', 'identity'],
  identity: ['access', 'defense', 'audit'],
  economy: ['access', 'audit', 'sandbox'],
  sandbox: ['encode', 'economy', 'defense'],
};

function isRelatedModule(a: string, b: string): boolean {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  return MODULE_RELATIONS[aLower]?.includes(bLower) || false;
}

function createEmptyIncident(module: string, action: string): Incident {
  return {
    id: `inc_${Date.now()}`,
    title: `${module}.${action} — no events found`,
    triggerEvent: { id: '', timestamp: new Date().toISOString(), module, action, outcome: 'unknown', detail: '', severity: 'info', causalLinks: [] },
    timeline: [],
    rootCause: null,
    affectedModules: [module],
    duration: 0,
    severity: 'low',
    status: 'investigating',
    createdAt: Date.now(),
    resolvedAt: null,
  };
}

/** Resolve an incident */
export function resolveIncident(id: string, resolution: string): Incident | undefined {
  const inc = incidents.get(id);
  if (inc) {
    inc.status = 'resolved';
    inc.resolvedAt = Date.now();
    inc.rootCause = resolution;
  }
  return inc;
}

/** List all incidents */
export function listIncidents(): Incident[] {
  return Array.from(incidents.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getIncidentSummary() {
  const all = listIncidents();
  return {
    total: all.length,
    open: all.filter(i => i.status !== 'resolved').length,
    critical: all.filter(i => i.severity === 'critical').length,
    avgDuration: all.length > 0
      ? `${Math.round(all.reduce((s, i) => s + i.duration, 0) / all.length / 1000)}s`
      : 'N/A',
  };
}
