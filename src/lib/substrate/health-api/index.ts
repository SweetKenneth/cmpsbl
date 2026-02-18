/**
 * Substrate Health Dashboard API
 * v1.0.0 — Unified JSON endpoint for real-time system status
 * 
 * Aggregates health metrics from all substrate systems into
 * a single, queryable health dashboard response.
 */

import { getCircuitBreakerSummary } from '../circuit-breaker';
import { getSheddingSummary, getLoadState } from '../load-shedding';
import { getIncidentSummary } from '../incident-timeline';
import { getVersioningSummary } from '../pattern-versioning';
import { getAllBreakerStates } from '../circuit-breaker';
import { SUBSTRATE_VERSION, SUBSTRATE_CODENAME, SUBSTRATE_BUILD } from '../versions';
import { getAllSubsystemHealth, getSubsystemDiagnostics, type SubsystemHealthEntry } from '../subsystem-health';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  score: number;         // 0-100
  uptime: number;        // ms since boot
  version: string;
  codename: string;
  build: string;
  timestamp: string;
  systems: SystemHealth[];
  alerts: HealthAlert[];
  summary: HealthSummary;
}

export interface SystemHealth {
  name: string;
  status: 'ok' | 'warn' | 'error' | 'offline';
  score: number;
  detail: string;
  lastCheck: number;
}

export interface HealthAlert {
  level: 'info' | 'warning' | 'error' | 'critical';
  system: string;
  message: string;
  timestamp: number;
}

export interface HealthSummary {
  totalSystems: number;
  healthy: number;
  degraded: number;
  critical: number;
  circuitBreakers: ReturnType<typeof getCircuitBreakerSummary>;
  loadShedding: ReturnType<typeof getSheddingSummary>;
  incidents: ReturnType<typeof getIncidentSummary>;
  patternVersions: ReturnType<typeof getVersioningSummary>;
}

const bootTime = Date.now();

/** Generate complete health dashboard */
export function getHealthDashboard(): HealthStatus {
  const systems: SystemHealth[] = [];
  const alerts: HealthAlert[] = [];

  // 1. Circuit Breakers
  const cbSummary = getCircuitBreakerSummary();
  systems.push({
    name: 'Circuit Breakers',
    status: cbSummary.open > 0 ? 'error' : cbSummary.halfOpen > 0 ? 'warn' : 'ok',
    score: cbSummary.total > 0 ? Math.round(((cbSummary.closed) / cbSummary.total) * 100) : 100,
    detail: `${cbSummary.closed}/${cbSummary.total} closed`,
    lastCheck: Date.now(),
  });
  if (cbSummary.open > 0) {
    alerts.push({ level: 'error', system: 'Circuit Breakers', message: `${cbSummary.open} breakers OPEN: ${cbSummary.unhealthy.join(', ')}`, timestamp: Date.now() });
  }

  // 2. Load Shedding
  const lsSummary = getSheddingSummary();
  const loadState = getLoadState();
  systems.push({
    name: 'Load Shedding',
    status: loadState.level === 'critical' ? 'error' : loadState.level === 'high' ? 'warn' : 'ok',
    score: 100 - loadState.pressure,
    detail: `Level: ${lsSummary.level} | Active: ${lsSummary.active}`,
    lastCheck: loadState.lastCheck,
  });
  if (loadState.level !== 'normal') {
    alerts.push({ level: loadState.level === 'critical' ? 'critical' : 'warning', system: 'Load Shedding', message: `System pressure at ${lsSummary.pressure}`, timestamp: Date.now() });
  }

  // 3. Incidents
  const incSummary = getIncidentSummary();
  systems.push({
    name: 'Incident Tracker',
    status: incSummary.critical > 0 ? 'error' : incSummary.open > 0 ? 'warn' : 'ok',
    score: incSummary.total > 0 ? Math.round(((incSummary.total - incSummary.open) / incSummary.total) * 100) : 100,
    detail: `${incSummary.open} open, ${incSummary.critical} critical`,
    lastCheck: Date.now(),
  });

  // 4. Pattern Versioning
  const pvSummary = getVersioningSummary();
  systems.push({
    name: 'Pattern Versioning',
    status: 'ok',
    score: 100,
    detail: `${pvSummary.totalPatterns} patterns, ${pvSummary.totalVersions} versions`,
    lastCheck: Date.now(),
  });

  // 5. Breaker states per module
  const breakerStates = getAllBreakerStates();
  for (const b of breakerStates) {
    if (b.state !== 'closed') {
      systems.push({
        name: `Module: ${b.module}`,
        status: b.state === 'open' ? 'error' : 'warn',
        score: b.state === 'open' ? 0 : 50,
        detail: `State: ${b.state} | Failures: ${b.failures} | Trips: ${b.totalTrips}`,
        lastCheck: b.lastStateChange,
      });
    }
  }

  // 6. Subsystem Health (Intent Mesh, AutoBlog, SEBA, Shadow Mesh)
  const subsystemHealth = getAllSubsystemHealth();
  for (const sub of subsystemHealth) {
    systems.push({
      name: `Subsystem: ${sub.name}`,
      status: sub.status === 'healthy' ? 'ok' : sub.status === 'degraded' ? 'warn' : sub.status === 'critical' ? 'error' : 'offline',
      score: sub.score,
      detail: `${sub.detail} | Circuit: ${sub.circuit.state} | Heals: ${sub.healCount}`,
      lastCheck: Date.now(),
    });
    if (sub.status === 'critical' || sub.status === 'offline') {
      alerts.push({ level: 'warning', system: sub.name, message: `${sub.name} is ${sub.status} (score: ${sub.score})`, timestamp: Date.now() });
    }
  }

  // Calculate overall
  const scores = systems.map(s => s.score);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;
  const hasError = systems.some(s => s.status === 'error');
  const hasWarn = systems.some(s => s.status === 'warn');

  const overallStatus: HealthStatus['status'] =
    hasError ? 'critical' :
    hasWarn ? 'degraded' : 'healthy';

  return {
    status: overallStatus,
    score: avgScore,
    uptime: Date.now() - bootTime,
    version: SUBSTRATE_VERSION,
    codename: SUBSTRATE_CODENAME,
    build: SUBSTRATE_BUILD,
    timestamp: new Date().toISOString(),
    systems,
    alerts,
    summary: {
      totalSystems: systems.length,
      healthy: systems.filter(s => s.status === 'ok').length,
      degraded: systems.filter(s => s.status === 'warn').length,
      critical: systems.filter(s => s.status === 'error').length,
      circuitBreakers: cbSummary,
      loadShedding: lsSummary,
      incidents: incSummary,
      patternVersions: pvSummary,
    },
  };
}

/** Quick health check (lightweight) */
export function quickHealthCheck(): { status: string; score: number; alerts: number } {
  const health = getHealthDashboard();
  return {
    status: health.status,
    score: health.score,
    alerts: health.alerts.length,
  };
}

/** Export as JSON string (for API endpoint) */
export function getHealthJSON(): string {
  return JSON.stringify(getHealthDashboard(), null, 2);
}
