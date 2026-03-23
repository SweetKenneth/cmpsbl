/**
 * SHADOW Ultimate — Leakage Detector
 * Monitors isolation boundary between shadow and production.
 * Hard-kills sessions on leakage detection.
 */

export type LeakageType = 'state_mutation' | 'network_escape' | 'side_effect' | 'clock_contamination' | 'resource_bleed';

export interface LeakageEvent {
  id: string;
  sessionId: string;
  leakageType: LeakageType;
  severity: 'warning' | 'critical' | 'fatal';
  description: string;
  sourceComponent: string;
  targetComponent: string;
  detectedAt: number;
  actionTaken: 'logged' | 'blocked' | 'session_killed';
}

export interface IsolationReport {
  sessionId: string;
  checksPassed: number;
  checksFailed: number;
  leakageEvents: LeakageEvent[];
  isolationIntegrity: boolean;
  checkedAt: number;
}

export interface LeakageStats {
  totalEvents: number;
  fatalEvents: number;
  sessionsKilled: number;
  byLeakageType: Record<string, number>;
  isolationSuccessRate: number;
}

const MAX_EVENTS = 500;
const MAX_REPORTS = 200;

const leakageEvents: LeakageEvent[] = [];
const isolationReports: IsolationReport[] = [];
let sessionsKilled = 0;

export function detectLeakage(
  sessionId: string, leakageType: LeakageType,
  description: string, sourceComponent: string, targetComponent: string,
  severity: LeakageEvent['severity'] = 'critical'
): LeakageEvent {
  const actionTaken: LeakageEvent['actionTaken'] = severity === 'fatal' ? 'session_killed' : severity === 'critical' ? 'blocked' : 'logged';

  const event: LeakageEvent = {
    id: `leak-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sessionId, leakageType, severity, description,
    sourceComponent, targetComponent, detectedAt: Date.now(), actionTaken,
  };

  if (leakageEvents.length >= MAX_EVENTS) leakageEvents.shift();
  leakageEvents.push(event);

  if (actionTaken === 'session_killed') sessionsKilled++;

  return event;
}

export function runIsolationCheck(sessionId: string, checks: Array<{ name: string; passed: boolean; detail?: string }>): IsolationReport {
  const passed = checks.filter(c => c.passed).length;
  const failed = checks.filter(c => !c.passed).length;
  const sessionLeaks = leakageEvents.filter(e => e.sessionId === sessionId);

  const report: IsolationReport = {
    sessionId, checksPassed: passed, checksFailed: failed,
    leakageEvents: sessionLeaks,
    isolationIntegrity: failed === 0 && sessionLeaks.filter(e => e.severity !== 'warning').length === 0,
    checkedAt: Date.now(),
  };

  if (isolationReports.length >= MAX_REPORTS) isolationReports.shift();
  isolationReports.push(report);
  return report;
}

export function getLeakageStats(): LeakageStats {
  const byType: Record<string, number> = {};
  for (const e of leakageEvents) {
    byType[e.leakageType] = (byType[e.leakageType] ?? 0) + 1;
  }

  const totalReports = isolationReports.length;
  const passedReports = isolationReports.filter(r => r.isolationIntegrity).length;

  return {
    totalEvents: leakageEvents.length,
    fatalEvents: leakageEvents.filter(e => e.severity === 'fatal').length,
    sessionsKilled,
    byLeakageType: byType,
    isolationSuccessRate: totalReports > 0 ? passedReports / totalReports : 1,
  };
}

export function resetLeakageState(): void { leakageEvents.length = 0; isolationReports.length = 0; sessionsKilled = 0; }
