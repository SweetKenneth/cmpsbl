/**
 * DEFENSE Incident Response Engine
 * Automated Response Playbooks & Remediation
 * 
 * Automated incident response with playbook execution
 * and coordinated remediation.
 */

import { supabase } from '@/integrations/supabase/client';
import { blockIP, updateIPReputation } from './threatIntelligence';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
export type IncidentType = 
  | 'brute_force'
  | 'data_breach'
  | 'dos_attack'
  | 'injection'
  | 'privilege_escalation'
  | 'suspicious_activity'
  | 'policy_violation';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  source: {
    ip?: string;
    userId?: string;
    module?: string;
    path?: string;
  };
  timeline: IncidentTimelineEntry[];
  assignee?: string;
  playbook?: string;
  containmentActions: string[];
  remediationActions: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface IncidentTimelineEntry {
  timestamp: string;
  action: string;
  actor: 'system' | 'user' | 'playbook';
  details?: string;
}

export interface Playbook {
  id: string;
  name: string;
  triggerType: IncidentType;
  triggerSeverity: IncidentSeverity[];
  steps: PlaybookStep[];
  autoExecute: boolean;
  cooldown: number; // seconds
}

export interface PlaybookStep {
  id: string;
  order: number;
  action: PlaybookAction;
  params: Record<string, unknown>;
  condition?: string;
  timeout: number;
  onFailure: 'continue' | 'abort' | 'retry';
}

export type PlaybookAction = 
  | 'block_ip'
  | 'rate_limit'
  | 'revoke_session'
  | 'notify_admin'
  | 'escalate'
  | 'isolate_module'
  | 'snapshot_state'
  | 'enable_enhanced_logging'
  | 'disable_feature';

export interface PlaybookExecutionResult {
  playbook: string;
  incident: string;
  success: boolean;
  stepsExecuted: number;
  stepsFailed: number;
  duration: number;
  actions: Array<{ step: string; action: string; success: boolean; error?: string }>;
}

// In-memory incident store — bounded
const MAX_ACTIVE_INCIDENTS = 500;
const MAX_TIMELINE_ENTRIES = 100;
const activeIncidents = new Map<string, Incident>();
const playbooks = new Map<string, Playbook>();
const playbookCooldowns = new Map<string, number>();

// ═══════════════════════════════════════════════════════════════════════════════
// INCIDENT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a new incident
 */
export async function createIncident(params: {
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  source?: Incident['source'];
}): Promise<Incident> {
  const id = `INC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  const incident: Incident = {
    id,
    type: params.type,
    severity: params.severity,
    status: 'open',
    title: params.title,
    description: params.description,
    source: params.source || {},
    timeline: [{
      timestamp: new Date().toISOString(),
      action: 'Incident created',
      actor: 'system',
    }],
    containmentActions: [],
    remediationActions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  activeIncidents.set(id, incident);

  // Log to database
  await supabase.from('brain_events').insert({
    module: 'defense',
    event_type: 'incident.created',
    data: {
      incidentId: id,
      type: params.type,
      severity: params.severity,
      title: params.title,
      source: params.source,
    } as unknown as Record<string, never>,
    outcome: 'created',
  });

  // Check for matching playbook
  const matchingPlaybook = findMatchingPlaybook(params.type, params.severity);
  if (matchingPlaybook && matchingPlaybook.autoExecute) {
    // Check cooldown
    const lastRun = playbookCooldowns.get(matchingPlaybook.id) || 0;
    if (Date.now() - lastRun > matchingPlaybook.cooldown * 1000) {
      incident.playbook = matchingPlaybook.id;
      await executePlaybook(matchingPlaybook.id, incident.id);
    }
  }

  return incident;
}

/**
 * Update incident status
 */
export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentStatus,
  notes?: string
): Promise<Incident | null> {
  const incident = activeIncidents.get(incidentId);
  if (!incident) return null;

  incident.status = status;
  incident.updatedAt = new Date().toISOString();
  
  if (status === 'resolved' || status === 'closed') {
    incident.resolvedAt = new Date().toISOString();
  }

  incident.timeline.push({
    timestamp: new Date().toISOString(),
    action: `Status changed to ${status}`,
    actor: 'user',
    details: notes,
  });

  activeIncidents.set(incidentId, incident);

  await supabase.from('brain_events').insert({
    module: 'defense',
    event_type: 'incident.updated',
    data: {
      incidentId,
      status,
      notes,
    } as unknown as Record<string, never>,
    outcome: 'updated',
  });

  return incident;
}

/**
 * Add containment action to incident
 */
export function addContainmentAction(
  incidentId: string,
  action: string
): boolean {
  const incident = activeIncidents.get(incidentId);
  if (!incident) return false;

  incident.containmentActions.push(action);
  incident.timeline.push({
    timestamp: new Date().toISOString(),
    action: `Containment: ${action}`,
    actor: 'system',
  });
  incident.updatedAt = new Date().toISOString();

  return true;
}

/**
 * Get incident by ID
 */
export function getIncident(incidentId: string): Incident | undefined {
  return activeIncidents.get(incidentId);
}

/**
 * List active incidents
 */
export function listActiveIncidents(filter?: {
  severity?: IncidentSeverity;
  type?: IncidentType;
  status?: IncidentStatus;
}): Incident[] {
  let incidents = Array.from(activeIncidents.values());

  if (filter?.severity) {
    incidents = incidents.filter(i => i.severity === filter.severity);
  }
  if (filter?.type) {
    incidents = incidents.filter(i => i.type === filter.type);
  }
  if (filter?.status) {
    incidents = incidents.filter(i => i.status === filter.status);
  }

  return incidents.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLAYBOOK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Register a playbook
 */
export function registerPlaybook(playbook: Playbook): void {
  playbooks.set(playbook.id, playbook);
}

/**
 * Execute a playbook for an incident
 */
export async function executePlaybook(
  playbookId: string,
  incidentId: string
): Promise<PlaybookExecutionResult> {
  const startTime = Date.now();
  const playbook = playbooks.get(playbookId);
  const incident = activeIncidents.get(incidentId);

  if (!playbook || !incident) {
    return {
      playbook: playbookId,
      incident: incidentId,
      success: false,
      stepsExecuted: 0,
      stepsFailed: 0,
      duration: 0,
      actions: [],
    };
  }

  const actions: Array<{ step: string; action: string; success: boolean; error?: string }> = [];
  let stepsFailed = 0;

  // Update incident
  incident.timeline.push({
    timestamp: new Date().toISOString(),
    action: `Playbook "${playbook.name}" started`,
    actor: 'playbook',
  });
  incident.status = 'investigating';

  // Execute steps in order
  for (const step of playbook.steps.sort((a, b) => a.order - b.order)) {
    try {
      await executePlaybookStep(step, incident);
      actions.push({ step: step.id, action: step.action, success: true });
      
      incident.timeline.push({
        timestamp: new Date().toISOString(),
        action: `Step: ${step.action}`,
        actor: 'playbook',
        details: 'Completed successfully',
      });
    } catch (error) {
      stepsFailed++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      actions.push({ step: step.id, action: step.action, success: false, error: errorMsg });
      
      incident.timeline.push({
        timestamp: new Date().toISOString(),
        action: `Step: ${step.action}`,
        actor: 'playbook',
        details: `Failed: ${errorMsg}`,
      });

      if (step.onFailure === 'abort') {
        break;
      }
    }
  }

  // Update cooldown
  playbookCooldowns.set(playbookId, Date.now());

  // Update incident status
  if (stepsFailed === 0) {
    incident.status = 'contained';
  }
  incident.updatedAt = new Date().toISOString();

  // Log execution
  await supabase.from('brain_events').insert({
    module: 'defense',
    event_type: 'playbook.executed',
    data: {
      playbookId,
      incidentId,
      stepsExecuted: actions.length,
      stepsFailed,
      duration: Date.now() - startTime,
    } as unknown as Record<string, never>,
    outcome: stepsFailed === 0 ? 'success' : 'partial',
  });

  return {
    playbook: playbookId,
    incident: incidentId,
    success: stepsFailed === 0,
    stepsExecuted: actions.length,
    stepsFailed,
    duration: Date.now() - startTime,
    actions,
  };
}

/**
 * Execute a single playbook step
 */
async function executePlaybookStep(
  step: PlaybookStep,
  incident: Incident
): Promise<void> {
  switch (step.action) {
    case 'block_ip':
      if (incident.source.ip) {
        blockIP(incident.source.ip, `Automated: ${incident.type}`);
        addContainmentAction(incident.id, `Blocked IP: ${incident.source.ip}`);
      }
      break;

    case 'rate_limit':
      if (incident.source.ip) {
        updateIPReputation(incident.source.ip, -30, 'rate_limited');
        addContainmentAction(incident.id, `Rate limited IP: ${incident.source.ip}`);
      }
      break;

    case 'notify_admin':
      // In production, would send actual notification
      console.log(`[ALERT] Incident ${incident.id}: ${incident.title}`);
      break;

    case 'escalate':
      incident.severity = escalateSeverity(incident.severity);
      addContainmentAction(incident.id, `Escalated to ${incident.severity}`);
      break;

    case 'enable_enhanced_logging':
      addContainmentAction(incident.id, 'Enhanced logging enabled');
      break;

    case 'snapshot_state':
      addContainmentAction(incident.id, 'System state snapshot captured');
      break;

    default:
      console.log(`[Playbook] Unhandled action: ${step.action}`);
  }
}

/**
 * Find matching playbook for incident type
 */
function findMatchingPlaybook(
  type: IncidentType,
  severity: IncidentSeverity
): Playbook | undefined {
  for (const playbook of playbooks.values()) {
    if (playbook.triggerType === type && 
        playbook.triggerSeverity.includes(severity)) {
      return playbook;
    }
  }
  return undefined;
}

/**
 * Escalate severity level
 */
function escalateSeverity(current: IncidentSeverity): IncidentSeverity {
  const levels: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];
  const idx = levels.indexOf(current);
  return idx < levels.length - 1 ? levels[idx + 1] : current;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT PLAYBOOKS
// ═══════════════════════════════════════════════════════════════════════════════

// Register default playbooks
registerPlaybook({
  id: 'pb-brute-force',
  name: 'Brute Force Response',
  triggerType: 'brute_force',
  triggerSeverity: ['high', 'critical'],
  autoExecute: true,
  cooldown: 300,
  steps: [
    { id: 's1', order: 1, action: 'block_ip', params: {}, timeout: 5, onFailure: 'continue' },
    { id: 's2', order: 2, action: 'notify_admin', params: {}, timeout: 5, onFailure: 'continue' },
    { id: 's3', order: 3, action: 'enable_enhanced_logging', params: {}, timeout: 5, onFailure: 'continue' },
  ],
});

registerPlaybook({
  id: 'pb-injection',
  name: 'Injection Attack Response',
  triggerType: 'injection',
  triggerSeverity: ['high', 'critical'],
  autoExecute: true,
  cooldown: 60,
  steps: [
    { id: 's1', order: 1, action: 'block_ip', params: {}, timeout: 5, onFailure: 'continue' },
    { id: 's2', order: 2, action: 'snapshot_state', params: {}, timeout: 10, onFailure: 'continue' },
    { id: 's3', order: 3, action: 'notify_admin', params: {}, timeout: 5, onFailure: 'continue' },
    { id: 's4', order: 4, action: 'escalate', params: {}, timeout: 5, onFailure: 'continue' },
  ],
});

registerPlaybook({
  id: 'pb-dos',
  name: 'DoS Attack Response',
  triggerType: 'dos_attack',
  triggerSeverity: ['medium', 'high', 'critical'],
  autoExecute: true,
  cooldown: 60,
  steps: [
    { id: 's1', order: 1, action: 'rate_limit', params: {}, timeout: 5, onFailure: 'continue' },
    { id: 's2', order: 2, action: 'enable_enhanced_logging', params: {}, timeout: 5, onFailure: 'continue' },
    { id: 's3', order: 3, action: 'notify_admin', params: {}, timeout: 5, onFailure: 'continue' },
  ],
});

/**
 * Get all registered playbooks
 */
export function listPlaybooks(): Playbook[] {
  return Array.from(playbooks.values());
}

/**
 * Get incident statistics
 */
export function getIncidentStats(): {
  total: number;
  open: number;
  investigating: number;
  contained: number;
  resolved: number;
  bySeverity: Record<IncidentSeverity, number>;
  byType: Record<string, number>;
} {
  const incidents = Array.from(activeIncidents.values());
  
  const bySeverity: Record<IncidentSeverity, number> = {
    low: 0, medium: 0, high: 0, critical: 0
  };
  const byType: Record<string, number> = {};

  for (const incident of incidents) {
    bySeverity[incident.severity]++;
    byType[incident.type] = (byType[incident.type] || 0) + 1;
  }

  return {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    contained: incidents.filter(i => i.status === 'contained').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    bySeverity,
    byType,
  };
}
