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
import { withFallbackSync } from '../graceful-degradation';
import { getActivePredictions } from '../predictive-failure';
import { getDependencies, getDownDependencies } from '../dependency-health';
import { getRecoveryState } from '../core-circuit-recovery';

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

/** Generate complete health dashboard — wrapped in top-level try-catch for graceful degradation */
export function getHealthDashboard(): HealthStatus {
  try {
    return _buildHealthDashboard();
  } catch (err) {
    console.warn('[HealthAPI] Dashboard generation failed, returning safe fallback:', err instanceof Error ? err.message : String(err));
    return {
      status: 'unknown',
      score: 0,
      uptime: Date.now() - bootTime,
      version: SUBSTRATE_VERSION,
      codename: SUBSTRATE_CODENAME,
      build: SUBSTRATE_BUILD,
      timestamp: new Date().toISOString(),
      systems: [],
      alerts: [{ level: 'critical', system: 'Health API', message: 'Health dashboard generation failed — system running in degraded mode', timestamp: Date.now() }],
      summary: {
        totalSystems: 0,
        healthy: 0,
        degraded: 0,
        critical: 0,
        circuitBreakers: { total: 0, closed: 0, open: 0, halfOpen: 0, totalTrips: 0, unhealthy: [] as string[] },
        loadShedding: { level: 'normal', active: '0/0', pressure: '0%', shed: [] as string[], throttled: [] as string[] },
        incidents: { total: 0, open: 0, critical: 0, avgDuration: 'N/A' },
        patternVersions: { totalPatterns: 0, totalVersions: 0, totalMigrations: 0, deprecatedVersions: 0, avgVersionsPerPattern: '0' },
      },
    };
  }
}

function _buildHealthDashboard(): HealthStatus {
  const systems: SystemHealth[] = [];
  const alerts: HealthAlert[] = [];

  // 1. Circuit Breakers — graceful
  const cbSummary = withFallbackSync(
    () => getCircuitBreakerSummary(),
    { total: 0, closed: 0, open: 0, halfOpen: 0, totalTrips: 0, unhealthy: [] as string[] },
    'CircuitBreakerSummary'
  );
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

  // 2. Load Shedding — graceful
  const lsSummary = withFallbackSync(
    () => getSheddingSummary(),
    { level: 'normal' as const, active: '0/0', pressure: '0%', shed: [] as string[], throttled: [] as string[] },
    'LoadSheddingSummary'
  );
  const loadState = withFallbackSync(
    () => getLoadState(),
    { level: 'normal' as const, activeModules: 0, shedModules: [] as string[], throttledModules: {} as Record<string, number>, lastCheck: Date.now(), pressure: 0 },
    'LoadState'
  );
  systems.push({
    name: 'Load Shedding',
    status: loadState.level === 'critical' ? 'error' : loadState.level === 'high' ? 'warn' : 'ok',
    score: 100 - (loadState.pressure || 0),
    detail: `Level: ${lsSummary.level} | Active: ${lsSummary.active}`,
    lastCheck: loadState.lastCheck || Date.now(),
  });
  if (loadState.level !== 'normal') {
    alerts.push({ level: loadState.level === 'critical' ? 'critical' : 'warning', system: 'Load Shedding', message: `System pressure at ${lsSummary.pressure}`, timestamp: Date.now() });
  }

  // 3. Incidents — graceful
  const incSummary = withFallbackSync(
    () => getIncidentSummary(),
    { total: 0, open: 0, critical: 0, avgDuration: 'N/A' },
    'IncidentSummary'
  );
  systems.push({
    name: 'Incident Tracker',
    status: incSummary.critical > 0 ? 'error' : incSummary.open > 0 ? 'warn' : 'ok',
    score: incSummary.total > 0 ? Math.round(((incSummary.total - incSummary.open) / incSummary.total) * 100) : 100,
    detail: `${incSummary.open} open, ${incSummary.critical} critical`,
    lastCheck: Date.now(),
  });

  // 4. Pattern Versioning — graceful
  const pvSummary = withFallbackSync(
    () => getVersioningSummary(),
    { totalPatterns: 0, totalVersions: 0, totalMigrations: 0, deprecatedVersions: 0, avgVersionsPerPattern: '0' },
    'PatternVersioning'
  );
  systems.push({
    name: 'Pattern Versioning',
    status: 'ok',
    score: 100,
    detail: `${pvSummary.totalPatterns} patterns, ${pvSummary.totalVersions} versions`,
    lastCheck: Date.now(),
  });

  // 5. Breaker states per module — graceful
  const breakerStates = withFallbackSync(() => getAllBreakerStates(), [] as any[], 'BreakerStates');
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

  // 6. Subsystem Health (Intent Mesh, AutoBlog, SEBA, Shadow Mesh) — graceful
  const subsystemHealth = withFallbackSync(() => getAllSubsystemHealth(), [] as SubsystemHealthEntry[], 'SubsystemHealth');
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

  // 7. Predictive Failure Alerts — graceful
  const activePredictions = withFallbackSync(() => getActivePredictions(), [] as any[], 'PredictiveFailure');
  for (const pred of activePredictions) {
    if (pred.severity === 'critical' || pred.severity === 'high') {
      alerts.push({
        level: pred.severity === 'critical' ? 'critical' : 'warning',
        system: pred.moduleId,
        message: `Predicted ${pred.metric} failure in ${Math.round(pred.estimatedTimeToFailureMs / 1000)}s (confidence: ${Math.round(pred.confidence * 100)}%)`,
        timestamp: pred.createdAt,
      });
    }
  }
  if (activePredictions.length > 0) {
    systems.push({
      name: 'Predictive Failure',
      status: activePredictions.some((p: any) => p.severity === 'critical') ? 'error' : activePredictions.length > 0 ? 'warn' : 'ok',
      score: Math.max(0, 100 - activePredictions.length * 15),
      detail: `${activePredictions.length} active predictions`,
      lastCheck: Date.now(),
    });
  }

  // 8. Dependency Health — graceful
  const deps = withFallbackSync(() => getDependencies(), [] as any[], 'DependencyHealth');
  const downDeps = withFallbackSync(() => getDownDependencies(), [] as any[], 'DownDependencies');
  if (deps.length > 0) {
    const healthyDeps = deps.filter((d: any) => d.status === 'healthy').length;
    systems.push({
      name: 'Dependency Health',
      status: downDeps.length > 0 ? 'error' : healthyDeps < deps.length ? 'warn' : 'ok',
      score: deps.length > 0 ? Math.round((healthyDeps / deps.length) * 100) : 100,
      detail: `${healthyDeps}/${deps.length} healthy`,
      lastCheck: Date.now(),
    });
    for (const d of downDeps) {
      alerts.push({ level: 'error', system: 'Dependencies', message: `${d.name} is DOWN (${d.consecutiveFailures} consecutive failures)`, timestamp: d.lastCheckAt || Date.now() });
    }
  }

  // 9. Circuit Recovery Engine — graceful
  const recovery = withFallbackSync(() => getRecoveryState(), { running: false, activeRecoveries: 0, totalRecoveries: 0, totalFailures: 0, recentHistory: [], config: {} as any }, 'RecoveryEngine');
  systems.push({
    name: 'Auto-Recovery Engine',
    status: recovery.running ? 'ok' : 'warn',
    score: recovery.running ? 100 : 50,
    detail: `${recovery.running ? 'Running' : 'Stopped'} | Recovered: ${recovery.totalRecoveries} | Active: ${recovery.activeRecoveries}`,
    lastCheck: Date.now(),
  });
  if (!recovery.running) {
    alerts.push({ level: 'warning', system: 'Auto-Recovery', message: 'Circuit recovery engine is not running', timestamp: Date.now() });
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
