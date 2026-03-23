/**
 * ACCESS Ultimate — System 10: Access Telemetry Dashboard
 * 
 * Unified health from all ACCESS systems: key vault integrity,
 * rate limiter accuracy, scope enforcement, metering latency,
 * abuse detection precision, and cache hit rate.
 * 
 * @module access/ultimate/accessTelemetry
 */

import { getKeyVaultStats } from './cryptoKeyVault';
import { getRateLimiterStats } from './adaptiveRateLimiter';
import { getScopeEngineStats } from './scopeEnforcementEngine';
import { getMeteringStats } from './usageMeteringPipeline';
import { getSubscriptionLifecycleStats } from './subscriptionLifecycle';
import { getDevRegistryStats } from './developerIdentityRegistry';
import { getAbuseDetectionStats } from './abuseDetectionEngine';
import { getEntitlementCacheStats } from './entitlementCache';
import { getGatewayBreakerStats } from './gatewayCircuitBreaker';

// ── Types ────────────────────────────────────────────────────────

export interface AccessTelemetrySnapshot {
  id: string;
  timestamp: number;
  systems: {
    keyVault: ReturnType<typeof getKeyVaultStats>;
    rateLimiter: ReturnType<typeof getRateLimiterStats>;
    scopeEngine: ReturnType<typeof getScopeEngineStats>;
    metering: ReturnType<typeof getMeteringStats>;
    subscriptions: ReturnType<typeof getSubscriptionLifecycleStats>;
    devRegistry: ReturnType<typeof getDevRegistryStats>;
    abuseDetection: ReturnType<typeof getAbuseDetectionStats>;
    entitlementCache: ReturnType<typeof getEntitlementCacheStats>;
    gatewayBreakers: ReturnType<typeof getGatewayBreakerStats>;
  };
  overallHealth: number;
}

export interface AccessTelemetryDashboard {
  snapshotCount: number;
  currentHealth: number;
  trend: 'improving' | 'stable' | 'degrading';
  lastSnapshotAt: number | null;
}

// ── State ────────────────────────────────────────────────────────

const snapshots: AccessTelemetrySnapshot[] = [];
const MAX_SNAPSHOTS = 200;

// ── Core API ────────────────────────────────────────────────────

/** Capture a telemetry snapshot */
export function captureAccessSnapshot(): AccessTelemetrySnapshot {
  const keyVault = getKeyVaultStats();
  const rateLimiter = getRateLimiterStats();
  const scopeEngine = getScopeEngineStats();
  const metering = getMeteringStats();
  const abuse = getAbuseDetectionStats();
  const cacheStats = getEntitlementCacheStats();
  const breakers = getGatewayBreakerStats();

  // Health composite:
  // Key vault integrity (15%) + Rate limiter accuracy (20%) +
  // Scope enforcement (15%) + Metering latency (15%) +
  // Abuse detection precision (20%) + Cache hit rate (15%)
  const keyScore = keyVault.activeKeys > 0 || keyVault.totalKeys === 0 ? 100 :
    Math.round((keyVault.activeKeys / Math.max(1, keyVault.totalKeys)) * 100);

  const rateScore = rateLimiter.totalChecks > 0
    ? Math.max(0, 100 - rateLimiter.deniedCount * 2)
    : 100;

  const scopeScore = scopeEngine.totalChecks > 0
    ? Math.round((scopeEngine.grantedChecks / scopeEngine.totalChecks) * 100)
    : 100;

  const abuseScore = Math.max(0, 100 - abuse.criticalSignals * 20 - abuse.highSignals * 5);

  const cacheScore = cacheStats.hitRate * 100;

  const breakerScore = Math.max(0, 100 - breakers.openBreakers * 15);

  const overallHealth = Math.round(
    keyScore * 0.15 +
    rateScore * 0.20 +
    scopeScore * 0.15 +
    breakerScore * 0.15 +
    abuseScore * 0.20 +
    cacheScore * 0.15
  );

  const snapshot: AccessTelemetrySnapshot = {
    id: `atsnap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    systems: {
      keyVault,
      rateLimiter,
      scopeEngine,
      metering,
      subscriptions: getSubscriptionLifecycleStats(),
      devRegistry: getDevRegistryStats(),
      abuseDetection: abuse,
      entitlementCache: cacheStats,
      gatewayBreakers: breakers,
    },
    overallHealth: Math.max(0, Math.min(100, overallHealth)),
  };

  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);

  return snapshot;
}

/** Get recent snapshots */
export function getAccessSnapshots(count?: number): AccessTelemetrySnapshot[] {
  return count ? snapshots.slice(-count) : [...snapshots];
}

/** Get dashboard with trend */
export function getAccessTelemetryDashboard(): AccessTelemetryDashboard {
  if (snapshots.length === 0) {
    return { snapshotCount: 0, currentHealth: 100, trend: 'stable', lastSnapshotAt: null };
  }

  const current = snapshots[snapshots.length - 1].overallHealth;

  let trend: 'improving' | 'stable' | 'degrading' = 'stable';
  if (snapshots.length >= 10) {
    const recent = snapshots.slice(-5).reduce((s, sn) => s + sn.overallHealth, 0) / 5;
    const previous = snapshots.slice(-10, -5).reduce((s, sn) => s + sn.overallHealth, 0) / 5;
    if (recent > previous + 5) trend = 'improving';
    else if (recent < previous - 5) trend = 'degrading';
  }

  return {
    snapshotCount: snapshots.length,
    currentHealth: current,
    trend,
    lastSnapshotAt: snapshots[snapshots.length - 1].timestamp,
  };
}

export function resetAccessTelemetry(): void {
  snapshots.length = 0;
}
