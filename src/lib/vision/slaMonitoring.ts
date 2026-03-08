/**
 * VISION SLA Monitoring Engine
 * Service Level Agreement Tracking & Alerting
 * 
 * Missing capability: SLA monitoring with availability tracking,
 * latency budgets, and error rate thresholds.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SLADefinition {
  id: string;
  name: string;
  service: string;
  targets: {
    availability: number; // percentage, e.g., 99.9
    latencyP50: number; // milliseconds
    latencyP95: number;
    latencyP99: number;
    errorRate: number; // percentage
    throughput?: number; // requests per second
  };
  window: 'hour' | 'day' | 'week' | 'month';
  alertThresholds: {
    warning: number; // percentage of target, e.g., 95
    critical: number; // e.g., 90
  };
  enabled: boolean;
}

export interface SLAMetrics {
  slaId: string;
  period: {
    start: string;
    end: string;
  };
  current: {
    availability: number;
    latencyP50: number;
    latencyP95: number;
    latencyP99: number;
    errorRate: number;
    throughput: number;
    requestCount: number;
  };
  status: 'met' | 'at_risk' | 'breached';
  breaches: SLABreach[];
  errorBudget: {
    total: number;
    consumed: number;
    remaining: number;
    burnRate: number;
  };
}

export interface SLABreach {
  id: string;
  slaId: string;
  metric: 'availability' | 'latency' | 'error_rate' | 'throughput';
  target: number;
  actual: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  duration?: number;
  resolved: boolean;
  resolvedAt?: string;
}

export interface SLAReport {
  period: string;
  slaId: string;
  slaName: string;
  overallStatus: 'met' | 'at_risk' | 'breached';
  availabilityScore: number;
  latencyScore: number;
  errorScore: number;
  compositeScore: number;
  breachCount: number;
  uptimeMinutes: number;
  downtimeMinutes: number;
  recommendations: string[];
}

export interface CapacityForecast {
  service: string;
  currentLoad: number;
  projectedLoad: number;
  capacityLimit: number;
  timeToCapacity: number; // hours until capacity reached
  confidence: number;
  recommendations: string[];
}

// In-memory stores (bounded)
const MAX_SLA_DEFS = 100;
const MAX_BREACHES = 1000;
const slaDefinitions = new Map<string, SLADefinition>();
const activeBreaches = new Map<string, SLABreach>();
const metricsBuffer: Array<{
  service: string;
  timestamp: Date;
  latency: number;
  success: boolean;
}> = [];
const MAX_BUFFER = 10000;

// ═══════════════════════════════════════════════════════════════════════════════
// SLA DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Register an SLA definition
 */
export function registerSLA(sla: SLADefinition): void {
  if (slaDefinitions.size >= MAX_SLA_DEFS && !slaDefinitions.has(sla.id)) {
    console.warn(`[VISION SLA] Max SLA definitions (${MAX_SLA_DEFS}) reached`);
    return;
  }
  slaDefinitions.set(sla.id, sla);
}

/**
 * Get SLA definition
 */
export function getSLA(slaId: string): SLADefinition | undefined {
  return slaDefinitions.get(slaId);
}

/**
 * List all SLA definitions
 */
export function listSLAs(): SLADefinition[] {
  return Array.from(slaDefinitions.values());
}

/**
 * Update SLA definition
 */
export function updateSLA(slaId: string, updates: Partial<SLADefinition>): boolean {
  const existing = slaDefinitions.get(slaId);
  if (!existing) return false;

  slaDefinitions.set(slaId, { ...existing, ...updates });
  return true;
}

/**
 * Delete SLA definition
 */
export function deleteSLA(slaId: string): boolean {
  return slaDefinitions.delete(slaId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record a request metric
 */
export function recordRequest(
  service: string,
  latency: number,
  success: boolean
): void {
  metricsBuffer.push({
    service,
    timestamp: new Date(),
    latency,
    success,
  });

  // Trim buffer — drop oldest 10% when over limit to avoid frequent shifts
  if (metricsBuffer.length > MAX_BUFFER) {
    metricsBuffer.splice(0, Math.floor(MAX_BUFFER * 0.1));
  }
}

/**
 * Get metrics for a service within a time window
 */
export function getServiceMetrics(
  service: string,
  windowMinutes: number = 60
): {
  requestCount: number;
  successCount: number;
  errorCount: number;
  latencies: number[];
  availability: number;
  errorRate: number;
} {
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const metrics = metricsBuffer.filter(
    m => m.service === service && m.timestamp >= cutoff
  );

  const successCount = metrics.filter(m => m.success).length;
  const errorCount = metrics.filter(m => !m.success).length;
  const requestCount = metrics.length;
  const latencies = metrics.map(m => m.latency);

  return {
    requestCount,
    successCount,
    errorCount,
    latencies,
    availability: requestCount > 0 ? (successCount / requestCount) * 100 : 100,
    errorRate: requestCount > 0 ? (errorCount / requestCount) * 100 : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLA EVALUATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Evaluate SLA metrics for a service
 */
export async function evaluateSLA(slaId: string): Promise<SLAMetrics | null> {
  const sla = slaDefinitions.get(slaId);
  if (!sla) return null;

  // Get window in minutes
  const windowMinutes = {
    hour: 60,
    day: 24 * 60,
    week: 7 * 24 * 60,
    month: 30 * 24 * 60,
  }[sla.window];

  const metrics = getServiceMetrics(sla.service, windowMinutes);
  
  // Calculate percentiles
  const sortedLatencies = [...metrics.latencies].sort((a, b) => a - b);
  const p50 = percentile(sortedLatencies, 50);
  const p95 = percentile(sortedLatencies, 95);
  const p99 = percentile(sortedLatencies, 99);

  // Check for breaches
  const breaches: SLABreach[] = [];
  
  if (metrics.availability < sla.targets.availability) {
    breaches.push(createBreach(slaId, 'availability', sla.targets.availability, metrics.availability));
  }
  
  if (p95 > sla.targets.latencyP95) {
    breaches.push(createBreach(slaId, 'latency', sla.targets.latencyP95, p95));
  }
  
  if (metrics.errorRate > sla.targets.errorRate) {
    breaches.push(createBreach(slaId, 'error_rate', sla.targets.errorRate, metrics.errorRate));
  }

  // Calculate error budget
  const errorBudgetTotal = 100 - sla.targets.availability;
  const errorBudgetConsumed = 100 - metrics.availability;
  const errorBudgetRemaining = Math.max(0, errorBudgetTotal - errorBudgetConsumed);
  const burnRate = errorBudgetTotal > 0 ? errorBudgetConsumed / errorBudgetTotal : 0;

  // Determine status
  let status: SLAMetrics['status'] = 'met';
  if (breaches.length > 0) {
    status = 'breached';
  } else if (burnRate > 0.5) {
    status = 'at_risk';
  }

  // Store breaches (evict oldest resolved if at capacity)
  for (const breach of breaches) {
    if (activeBreaches.size >= MAX_BREACHES) {
      // Evict oldest resolved first, then oldest overall
      let evicted = false;
      for (const [id, b] of activeBreaches) {
        if (b.resolved) { activeBreaches.delete(id); evicted = true; break; }
      }
      if (!evicted) {
        const oldest = activeBreaches.keys().next().value;
        if (oldest) activeBreaches.delete(oldest);
      }
    }
    activeBreaches.set(breach.id, breach);
  }

  // Log evaluation
  await supabase.from('brain_events').insert({
    module: 'vision',
    event_type: 'sla.evaluated',
    data: {
      slaId,
      status,
      availability: metrics.availability,
      latencyP95: p95,
      errorRate: metrics.errorRate,
      breachCount: breaches.length,
    } as unknown as Record<string, never>,
    outcome: status === 'met' ? 'success' : 'warning',
  });

  return {
    slaId,
    period: {
      start: new Date(Date.now() - windowMinutes * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    current: {
      availability: metrics.availability,
      latencyP50: p50,
      latencyP95: p95,
      latencyP99: p99,
      errorRate: metrics.errorRate,
      throughput: metrics.requestCount / (windowMinutes * 60),
      requestCount: metrics.requestCount,
    },
    status,
    breaches,
    errorBudget: {
      total: errorBudgetTotal,
      consumed: errorBudgetConsumed,
      remaining: errorBudgetRemaining,
      burnRate,
    },
  };
}

/**
 * Evaluate all SLAs
 */
export async function evaluateAllSLAs(): Promise<SLAMetrics[]> {
  const results: SLAMetrics[] = [];
  
  for (const sla of slaDefinitions.values()) {
    if (sla.enabled) {
      const metrics = await evaluateSLA(sla.id);
      if (metrics) {
        results.push(metrics);
      }
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BREACH MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get active breaches
 */
export function getActiveBreaches(slaId?: string): SLABreach[] {
  let breaches = Array.from(activeBreaches.values())
    .filter(b => !b.resolved);

  if (slaId) {
    breaches = breaches.filter(b => b.slaId === slaId);
  }

  return breaches.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Resolve a breach
 */
export function resolveBreach(breachId: string): boolean {
  const breach = activeBreaches.get(breachId);
  if (!breach) return false;

  breach.resolved = true;
  breach.resolvedAt = new Date().toISOString();
  activeBreaches.set(breachId, breach);

  return true;
}

/**
 * Get breach history
 */
export function getBreachHistory(
  slaId?: string,
  limit: number = 100
): SLABreach[] {
  let breaches = Array.from(activeBreaches.values());

  if (slaId) {
    breaches = breaches.filter(b => b.slaId === slaId);
  }

  return breaches
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate SLA report
 */
export async function generateSLAReport(slaId: string): Promise<SLAReport | null> {
  const sla = slaDefinitions.get(slaId);
  if (!sla) return null;

  const metrics = await evaluateSLA(slaId);
  if (!metrics) return null;

  // Calculate scores (percentage of target achieved)
  const availabilityScore = Math.min(100, (metrics.current.availability / sla.targets.availability) * 100);
  const latencyScore = Math.min(100, (sla.targets.latencyP95 / Math.max(1, metrics.current.latencyP95)) * 100);
  const errorScore = metrics.current.errorRate === 0 
    ? 100 
    : Math.min(100, (sla.targets.errorRate / Math.max(0.01, metrics.current.errorRate)) * 100);
  
  const compositeScore = (availabilityScore + latencyScore + errorScore) / 3;

  // Calculate uptime/downtime
  const windowMinutes = { hour: 60, day: 24 * 60, week: 7 * 24 * 60, month: 30 * 24 * 60 }[sla.window];
  const uptimeMinutes = Math.round(windowMinutes * (metrics.current.availability / 100));
  const downtimeMinutes = windowMinutes - uptimeMinutes;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (metrics.current.availability < sla.targets.availability) {
    recommendations.push('Investigate causes of service unavailability');
    recommendations.push('Consider implementing redundancy or failover mechanisms');
  }
  
  if (metrics.current.latencyP95 > sla.targets.latencyP95) {
    recommendations.push('Profile application for performance bottlenecks');
    recommendations.push('Consider caching or query optimization');
  }
  
  if (metrics.current.errorRate > sla.targets.errorRate) {
    recommendations.push('Review error logs for common failure patterns');
    recommendations.push('Implement better error handling and retries');
  }

  if (metrics.errorBudget.burnRate > 0.5) {
    recommendations.push('Error budget burning too fast - prioritize reliability work');
  }

  return {
    period: `${metrics.period.start} to ${metrics.period.end}`,
    slaId,
    slaName: sla.name,
    overallStatus: metrics.status,
    availabilityScore,
    latencyScore,
    errorScore,
    compositeScore,
    breachCount: metrics.breaches.length,
    uptimeMinutes,
    downtimeMinutes,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAPACITY FORECASTING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate capacity forecast
 */
export function forecastCapacity(
  service: string,
  capacityLimit: number,
  projectionHours: number = 24
): CapacityForecast {
  const metrics = getServiceMetrics(service, 60); // Last hour
  const currentLoad = metrics.requestCount;
  
  // Simple linear projection (would use more sophisticated modeling in production)
  const hourlyGrowthRate = 0.05; // 5% per hour assumption
  const projectedLoad = currentLoad * Math.pow(1 + hourlyGrowthRate, projectionHours);
  
  // Time to capacity
  let timeToCapacity = Infinity;
  if (currentLoad > 0 && capacityLimit > currentLoad) {
    timeToCapacity = Math.log(capacityLimit / currentLoad) / Math.log(1 + hourlyGrowthRate);
  }

  const recommendations: string[] = [];
  
  if (timeToCapacity < 24) {
    recommendations.push('Consider scaling up capacity immediately');
    recommendations.push('Implement load shedding for non-critical requests');
  } else if (timeToCapacity < 72) {
    recommendations.push('Plan capacity expansion within the week');
    recommendations.push('Monitor growth rate closely');
  }

  return {
    service,
    currentLoad,
    projectedLoad: Math.round(projectedLoad),
    capacityLimit,
    timeToCapacity: Math.round(timeToCapacity),
    confidence: 0.7, // Would be higher with more data
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate percentile
 */
function percentile(sortedArray: number[], p: number): number {
  if (sortedArray.length === 0) return 0;
  
  const index = Math.ceil((p / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
}

/**
 * Create breach record
 */
function createBreach(
  slaId: string,
  metric: SLABreach['metric'],
  target: number,
  actual: number
): SLABreach {
  const sla = slaDefinitions.get(slaId);
  
  // Severity depends on metric direction:
  // - availability: lower actual = worse (actual < target * critical%)
  // - latency: higher actual = worse (actual > target * (1 + (1 - critical%)))
  // - error_rate: higher actual = worse (actual > target * (1 + (1 - critical%)))
  let severity: 'warning' | 'critical' = 'warning';
  if (sla) {
    const criticalRatio = sla.alertThresholds.critical / 100;
    if (metric === 'availability') {
      // For availability, critical if actual < target * criticalRatio (e.g., <89.55% when target 99.5%, critical 90%)
      severity = actual < target * criticalRatio ? 'critical' : 'warning';
    } else {
      // For latency/error_rate, critical if actual exceeds target by more than (1 - criticalRatio) factor
      const overageRatio = actual / Math.max(0.001, target);
      severity = overageRatio > (2 - criticalRatio) ? 'critical' : 'warning';
    }
  }

  return {
    id: `breach-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    slaId,
    metric,
    target,
    actual,
    severity,
    timestamp: new Date().toISOString(),
    resolved: false,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT SLAs
// ═══════════════════════════════════════════════════════════════════════════════

// Register default SLAs for substrate modules
registerSLA({
  id: 'sla-nexus',
  name: 'NEXUS AI Routing SLA',
  service: 'nexus',
  targets: {
    availability: 99.5,
    latencyP50: 200,
    latencyP95: 500,
    latencyP99: 1000,
    errorRate: 1,
  },
  window: 'day',
  alertThresholds: { warning: 95, critical: 90 },
  enabled: true,
});

registerSLA({
  id: 'sla-brain',
  name: 'BRAIN Memory SLA',
  service: 'brain',
  targets: {
    availability: 99.9,
    latencyP50: 50,
    latencyP95: 150,
    latencyP99: 300,
    errorRate: 0.5,
  },
  window: 'day',
  alertThresholds: { warning: 95, critical: 90 },
  enabled: true,
});

registerSLA({
  id: 'sla-defense',
  name: 'DEFENSE Security SLA',
  service: 'defense',
  targets: {
    availability: 99.99,
    latencyP50: 10,
    latencyP95: 30,
    latencyP99: 50,
    errorRate: 0.1,
  },
  window: 'day',
  alertThresholds: { warning: 99, critical: 95 },
  enabled: true,
});
