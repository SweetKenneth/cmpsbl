/**
 * ACCESS Ultimate Form — v9.0.0 "Gatekeeper Prime"
 * Unified export and lifecycle API for all 10 Ultimate Form systems.
 *
 * Systems:
 *  1. Cryptographic Key Vault
 *  2. Adaptive Rate Limiter
 *  3. Scope Enforcement Engine
 *  4. Usage Metering Pipeline
 *  5. Subscription Lifecycle Manager
 *  6. Developer Identity Registry
 *  7. Abuse Detection Engine
 *  8. Entitlement Resolution Cache
 *  9. Gateway Circuit Breaker
 * 10. Access Telemetry Dashboard
 */

// ── Exports ─────────────────────────────────────────────────────
export * from './cryptoKeyVault';
export * from './adaptiveRateLimiter';
export * from './scopeEnforcementEngine';
export * from './usageMeteringPipeline';
export * from './subscriptionLifecycle';
export * from './developerIdentityRegistry';
export * from './abuseDetectionEngine';
export * from './entitlementCache';
export * from './gatewayCircuitBreaker';
export * from './accessTelemetry';

// ── Imports for Lifecycle ───────────────────────────────────────
import { getKeyVaultStats, resetKeyVault } from './cryptoKeyVault';
import { getRateLimiterStats, resetRateLimiter } from './adaptiveRateLimiter';
import { getScopeEngineStats, resetScopeEngine } from './scopeEnforcementEngine';
import { getMeteringStats, resetMeteringPipeline } from './usageMeteringPipeline';
import { getSubscriptionLifecycleStats, resetSubscriptionLifecycle } from './subscriptionLifecycle';
import { getDevRegistryStats, resetDevRegistry } from './developerIdentityRegistry';
import { getAbuseDetectionStats, resetAbuseDetection } from './abuseDetectionEngine';
import { getEntitlementCacheStats, resetEntitlementCache } from './entitlementCache';
import { getGatewayBreakerStats, getGatewayHealth, resetGatewayBreakers } from './gatewayCircuitBreaker';
import { getAccessTelemetryDashboard, resetAccessTelemetry } from './accessTelemetry';

// ═══════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════

export interface AccessUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    cryptoKeyVault: { healthy: boolean; activeKeys: number; rotations: number };
    adaptiveRateLimiter: { healthy: boolean; checks: number; deniedRate: number };
    scopeEngine: { healthy: boolean; scopes: number; grantRate: number };
    usageMetering: { healthy: boolean; events: number; totalCostMillicents: number };
    subscriptionLifecycle: { healthy: boolean; subscriptions: number; avgUtilization: number };
    developerRegistry: { healthy: boolean; developers: number; avgReputation: number };
    abuseDetection: { healthy: boolean; signals: number; quarantined: number };
    entitlementCache: { healthy: boolean; hitRate: number; entries: number };
    gatewayBreakers: { healthy: boolean; openBreakers: number; degradation: string };
    accessTelemetry: { healthy: boolean; health: number; trend: string };
  };
  overallHealth: number;
}

let initialized = false;

export function initAccessUltimate(): void {
  if (initialized) return;
  initialized = true;
  console.log('[ACCESS] Ultimate Form v9.0.0 "Gatekeeper Prime" initialized — 10 systems online');
}

export function accessUltimateHealth(): AccessUltimateHealth {
  const vault = getKeyVaultStats();
  const rate = getRateLimiterStats();
  const scope = getScopeEngineStats();
  const metering = getMeteringStats();
  const subs = getSubscriptionLifecycleStats();
  const devs = getDevRegistryStats();
  const abuse = getAbuseDetectionStats();
  const cache = getEntitlementCacheStats();
  const breakers = getGatewayBreakerStats();
  const dashboard = getAccessTelemetryDashboard();
  const gateway = getGatewayHealth();

  const deniedRate = rate.totalChecks > 0 ? rate.deniedCount / rate.totalChecks : 0;
  const grantRate = scope.totalChecks > 0 ? scope.grantedChecks / scope.totalChecks : 1;

  const systems = {
    cryptoKeyVault: { healthy: vault.revokedKeys < vault.totalKeys * 0.5 || vault.totalKeys === 0, activeKeys: vault.activeKeys, rotations: vault.totalRotations },
    adaptiveRateLimiter: { healthy: deniedRate < 0.3, checks: rate.totalChecks, deniedRate: Math.round(deniedRate * 1000) / 1000 },
    scopeEngine: { healthy: grantRate > 0.5 || scope.totalChecks === 0, scopes: scope.totalScopes, grantRate: Math.round(grantRate * 1000) / 1000 },
    usageMetering: { healthy: true, events: metering.totalEvents, totalCostMillicents: metering.totalCostMillicents },
    subscriptionLifecycle: { healthy: true, subscriptions: subs.totalSubscriptions, avgUtilization: subs.avgQuotaUtilization },
    developerRegistry: { healthy: devs.avgReputation > 30 || devs.totalDevelopers === 0, developers: devs.totalDevelopers, avgReputation: devs.avgReputation },
    abuseDetection: { healthy: abuse.criticalSignals < 5, signals: abuse.totalSignals, quarantined: abuse.quarantinedKeys },
    entitlementCache: { healthy: cache.hitRate > 0.5 || (cache.hitCount + cache.missCount) < 10, hitRate: cache.hitRate, entries: cache.totalEntries },
    gatewayBreakers: { healthy: gateway.degradationLevel === 'none' || gateway.degradationLevel === 'L1', openBreakers: breakers.openBreakers, degradation: gateway.degradationLevel },
    accessTelemetry: { healthy: dashboard.trend !== 'degrading', health: dashboard.currentHealth, trend: dashboard.trend },
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '9.0.0', codename: 'Gatekeeper Prime', initialized, systems, overallHealth };
}

export function accessUltimateResilience(): {
  vaultIntact: boolean;
  rateLimiterHealthy: boolean;
  noAbuseStorm: boolean;
  cacheEfficient: boolean;
  gatewayStable: boolean;
} {
  const vault = getKeyVaultStats();
  const rate = getRateLimiterStats();
  const abuse = getAbuseDetectionStats();
  const cache = getEntitlementCacheStats();
  const gateway = getGatewayHealth();

  return {
    vaultIntact: vault.revokedKeys < vault.totalKeys * 0.3 || vault.totalKeys === 0,
    rateLimiterHealthy: rate.totalChecks === 0 || rate.deniedCount / rate.totalChecks < 0.2,
    noAbuseStorm: abuse.criticalSignals < 3,
    cacheEfficient: cache.hitRate > 0.6 || (cache.hitCount + cache.missCount) < 5,
    gatewayStable: gateway.degradationLevel === 'none' || gateway.degradationLevel === 'L1',
  };
}

export function resetAccessUltimate(): void {
  resetKeyVault();
  resetRateLimiter();
  resetScopeEngine();
  resetMeteringPipeline();
  resetSubscriptionLifecycle();
  resetDevRegistry();
  resetAbuseDetection();
  resetEntitlementCache();
  resetGatewayBreakers();
  resetAccessTelemetry();
  initialized = false;
}
