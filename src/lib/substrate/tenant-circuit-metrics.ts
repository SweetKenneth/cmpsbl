/**
 * Tenant Circuit Breaker — Per-Tenant Metrics
 * Aggregated metrics for all tenant circuits.
 */

export interface TenantCircuitState {
  tenantId: string;
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  totalTrips: number;
}

export interface TenantCircuitMetrics {
  totalTenants: number;
  healthyTenants: number;
  degradedTenants: number;
  isolatedTenants: number;
  totalTripsAllTime: number;
  avgFailureCount: number;
  mostTrippedTenant: { tenantId: string; trips: number } | null;
}

/**
 * Compute aggregate metrics from tenant circuit states.
 */
export function computeTenantMetrics(circuits: TenantCircuitState[]): TenantCircuitMetrics {
  if (circuits.length === 0) {
    return {
      totalTenants: 0,
      healthyTenants: 0,
      degradedTenants: 0,
      isolatedTenants: 0,
      totalTripsAllTime: 0,
      avgFailureCount: 0,
      mostTrippedTenant: null,
    };
  }

  const healthy = circuits.filter(c => c.state === 'closed').length;
  const degraded = circuits.filter(c => c.state === 'half_open').length;
  const isolated = circuits.filter(c => c.state === 'open').length;
  const totalTrips = circuits.reduce((s, c) => s + c.totalTrips, 0);
  const avgFailures = circuits.reduce((s, c) => s + c.failureCount, 0) / circuits.length;

  let mostTripped: { tenantId: string; trips: number } | null = null;
  for (const c of circuits) {
    if (!mostTripped || c.totalTrips > mostTripped.trips) {
      mostTripped = { tenantId: c.tenantId, trips: c.totalTrips };
    }
  }

  return {
    totalTenants: circuits.length,
    healthyTenants: healthy,
    degradedTenants: degraded,
    isolatedTenants: isolated,
    totalTripsAllTime: totalTrips,
    avgFailureCount: Math.round(avgFailures * 100) / 100,
    mostTrippedTenant: mostTripped && mostTripped.trips > 0 ? mostTripped : null,
  };
}
