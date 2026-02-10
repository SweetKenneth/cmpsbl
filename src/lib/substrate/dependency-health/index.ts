/**
 * Dependency Health Tracker
 * v1.0.0 — Monitors health of external and internal dependencies
 * 
 * Tracks uptime, latency, and reliability of services the substrate
 * depends on (AI providers, databases, APIs) for proactive management.
 */

export interface DependencyHealth {
  id: string;
  name: string;
  type: 'ai_provider' | 'database' | 'api' | 'internal_module';
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  uptimePercent: number;
  avgLatencyMs: number;
  lastCheckAt: number;
  consecutiveFailures: number;
  checkIntervalMs: number;
}

export interface HealthCheck {
  dependencyId: string;
  timestamp: number;
  success: boolean;
  latencyMs: number;
  statusCode: number | null;
  error: string | null;
}

const dependencies = new Map<string, DependencyHealth>();
const checkHistory: HealthCheck[] = [];

export function registerDependency(name: string, type: DependencyHealth['type'], checkIntervalMs: number = 60000): DependencyHealth {
  const dep: DependencyHealth = {
    id: `dep-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name, type, status: 'unknown',
    uptimePercent: 100, avgLatencyMs: 0,
    lastCheckAt: 0, consecutiveFailures: 0, checkIntervalMs,
  };
  dependencies.set(dep.id, dep);
  return dep;
}

export function recordCheck(dependencyId: string, success: boolean, latencyMs: number, statusCode?: number, error?: string): HealthCheck {
  const check: HealthCheck = {
    dependencyId, timestamp: Date.now(), success, latencyMs,
    statusCode: statusCode ?? null, error: error ?? null,
  };
  checkHistory.push(check);

  const dep = dependencies.get(dependencyId);
  if (dep) {
    dep.lastCheckAt = Date.now();
    if (success) {
      dep.consecutiveFailures = 0;
      dep.status = latencyMs > 3000 ? 'degraded' : 'healthy';
    } else {
      dep.consecutiveFailures++;
      dep.status = dep.consecutiveFailures >= 3 ? 'down' : 'degraded';
    }

    // Rolling avg latency
    const recent = checkHistory.filter(c => c.dependencyId === dependencyId).slice(-20);
    dep.avgLatencyMs = recent.reduce((s, c) => s + c.latencyMs, 0) / recent.length;
    const successCount = recent.filter(c => c.success).length;
    dep.uptimePercent = (successCount / recent.length) * 100;
  }

  return check;
}

export function getDependencies(): DependencyHealth[] { return Array.from(dependencies.values()); }
export function getDependency(id: string): DependencyHealth | undefined { return dependencies.get(id); }
export function getDownDependencies(): DependencyHealth[] { return Array.from(dependencies.values()).filter(d => d.status === 'down'); }
export function getDegradedDependencies(): DependencyHealth[] { return Array.from(dependencies.values()).filter(d => d.status === 'degraded'); }
export function getCheckHistory(dependencyId: string, limit: number = 20): HealthCheck[] {
  return checkHistory.filter(c => c.dependencyId === dependencyId).slice(-limit);
}
