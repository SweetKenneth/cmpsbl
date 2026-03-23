/**
 * SOVEREIGN Ultimate — Breach Response Orchestrator
 * Automated breach detection, notification timeline enforcement, penalty estimation.
 * v9.0.0 "Crown Prime"
 */

// ─── Types ────────────────────────────────────────────────────────

export type BreachSeverity = 'minor' | 'moderate' | 'severe' | 'critical';
export type BreachPhase = 'detected' | 'assessed' | 'contained' | 'notifying' | 'notified' | 'remediated' | 'closed';

export interface BreachIncident {
  id: string;
  title: string;
  severity: BreachSeverity;
  phase: BreachPhase;
  detectedAt: string;
  jurisdictions: string[];
  frameworks: string[];
  affectedSubjects: number;
  dataClassifications: string[];
  description: string;
  containedAt: string | null;
  notifiedAt: string | null;
  remediatedAt: string | null;
  closedAt: string | null;
  notificationDeadlines: { jurisdiction: string; deadlineHours: number; deadline: string; met: boolean }[];
  penaltyEstimate: number;        // cents
  remediationSteps: { step: string; completed: boolean; completedAt: string | null }[];
  phaseHistory: { phase: BreachPhase; timestamp: string }[];
}

// ─── Notification Windows ─────────────────────────────────────────

const NOTIFICATION_WINDOWS_HOURS: Record<string, number> = {
  GDPR: 72,
  HIPAA: 1440,    // 60 days
  CCPA: 720,      // 30 days
  PIPEDA: 720,
  LGPD: 48,
  POPIA: 720,
  APPI: 720,
  PDPA: 72,
  SOC2: 168,      // 7 days
  ITAR: 24,
};

// ─── Penalty Estimation ───────────────────────────────────────────

const BASE_PENALTIES_CENTS: Record<string, number> = {
  GDPR: 2000000000,    // €20M
  HIPAA: 5000000000,   // $50M (Tier 4)
  CCPA: 750000,        // $7,500 per violation
  PIPEDA: 10000000,    // $100K
  LGPD: 5000000000,    // R$50M
};

// ─── Storage ──────────────────────────────────────────────────────

const incidents: BreachIncident[] = [];
const MAX_INCIDENTS = 500;

// ─── Valid Transitions ────────────────────────────────────────────

const VALID_TRANSITIONS: Record<BreachPhase, BreachPhase[]> = {
  detected: ['assessed'],
  assessed: ['contained'],
  contained: ['notifying'],
  notifying: ['notified'],
  notified: ['remediated'],
  remediated: ['closed'],
  closed: [],
};

// ─── Core Operations ─────────────────────────────────────────────

export function reportBreach(
  title: string,
  severity: BreachSeverity,
  jurisdictions: string[],
  frameworks: string[],
  affectedSubjects: number,
  dataClassifications: string[],
  description: string
): BreachIncident {
  const now = new Date();
  const deadlines = frameworks.map(fw => {
    const hours = NOTIFICATION_WINDOWS_HOURS[fw] || 720;
    return {
      jurisdiction: fw,
      deadlineHours: hours,
      deadline: new Date(now.getTime() + hours * 3600000).toISOString(),
      met: false,
    };
  });

  // Penalty estimation
  const severityMultiplier: Record<BreachSeverity, number> = { minor: 0.01, moderate: 0.1, severe: 0.5, critical: 1.0 };
  const subjectMultiplier = Math.min(10, affectedSubjects / 1000);
  const penaltyEstimate = Math.round(
    frameworks.reduce((sum, fw) => {
      const base = BASE_PENALTIES_CENTS[fw] || 100000;
      return sum + base * severityMultiplier[severity] * Math.max(0.1, subjectMultiplier);
    }, 0)
  );

  const remediationSteps = [
    { step: 'Identify root cause', completed: false, completedAt: null as string | null },
    { step: 'Contain breach scope', completed: false, completedAt: null as string | null },
    { step: 'Notify regulatory authorities', completed: false, completedAt: null as string | null },
    { step: 'Notify affected subjects', completed: false, completedAt: null as string | null },
    { step: 'Implement corrective measures', completed: false, completedAt: null as string | null },
    { step: 'Post-incident review', completed: false, completedAt: null as string | null },
  ];

  const incident: BreachIncident = {
    id: `breach_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title, severity, phase: 'detected',
    detectedAt: now.toISOString(),
    jurisdictions, frameworks, affectedSubjects,
    dataClassifications, description,
    containedAt: null, notifiedAt: null, remediatedAt: null, closedAt: null,
    notificationDeadlines: deadlines,
    penaltyEstimate,
    remediationSteps,
    phaseHistory: [{ phase: 'detected', timestamp: now.toISOString() }],
  };

  incidents.push(incident);
  if (incidents.length > MAX_INCIDENTS) incidents.splice(0, incidents.length - MAX_INCIDENTS);
  return incident;
}

export function advanceBreachPhase(incidentId: string): BreachIncident | null {
  const incident = incidents.find(i => i.id === incidentId);
  if (!incident) return null;

  const nextPhases = VALID_TRANSITIONS[incident.phase];
  if (nextPhases.length === 0) return null;

  const newPhase = nextPhases[0];
  const now = new Date().toISOString();
  incident.phase = newPhase;
  incident.phaseHistory.push({ phase: newPhase, timestamp: now });

  if (newPhase === 'contained') incident.containedAt = now;
  if (newPhase === 'notified') {
    incident.notifiedAt = now;
    for (const d of incident.notificationDeadlines) {
      d.met = new Date(now).getTime() <= new Date(d.deadline).getTime();
    }
  }
  if (newPhase === 'remediated') incident.remediatedAt = now;
  if (newPhase === 'closed') incident.closedAt = now;

  return incident;
}

export function completeRemediationStep(incidentId: string, stepIndex: number): boolean {
  const incident = incidents.find(i => i.id === incidentId);
  if (!incident || stepIndex < 0 || stepIndex >= incident.remediationSteps.length) return false;
  incident.remediationSteps[stepIndex].completed = true;
  incident.remediationSteps[stepIndex].completedAt = new Date().toISOString();
  return true;
}

// ─── Queries ──────────────────────────────────────────────────────

export function getIncidents(): BreachIncident[] { return [...incidents]; }
export function getOpenIncidents(): BreachIncident[] { return incidents.filter(i => i.phase !== 'closed'); }
export function getApproachingDeadlines(): { incidentId: string; framework: string; hoursRemaining: number }[] {
  const now = Date.now();
  const results: { incidentId: string; framework: string; hoursRemaining: number }[] = [];
  for (const incident of incidents) {
    if (incident.phase === 'closed') continue;
    for (const d of incident.notificationDeadlines) {
      if (!d.met) {
        const remaining = Math.round((new Date(d.deadline).getTime() - now) / 3600000);
        if (remaining > 0 && remaining < 48) {
          results.push({ incidentId: incident.id, framework: d.jurisdiction, hoursRemaining: remaining });
        }
      }
    }
  }
  return results;
}
export function getBreachHealth(): number {
  if (incidents.length === 0) return 100;
  const open = getOpenIncidents().length;
  const critical = incidents.filter(i => i.severity === 'critical' && i.phase !== 'closed').length;
  return Math.max(0, Math.round(100 - (open * 10) - (critical * 20)));
}
