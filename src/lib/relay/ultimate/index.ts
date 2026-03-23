/**
 * RELAY Ultimate Form — v9.0.0 "Warpgate"
 * Unified export and lifecycle API for all 10 Ultimate Form systems.
 *
 * Systems:
 *  1. Adaptive Route Optimizer
 *  2. Protocol Translator
 *  3. Sector Gateway
 *  4. Delivery Guarantor
 *  5. Message Compressor
 *  6. Circuit Breaker Matrix
 *  7. Rate Governor
 *  8. Message Enricher
 *  9. Route Telemetry
 * 10. Relay Hardening
 */

export * from './adaptiveRouteOptimizer';
export * from './protocolTranslator';
export * from './sectorGateway';
export * from './deliveryGuarantor';
export * from './messageCompressor';
export * from './circuitBreakerMatrix';
export * from './rateGovernor';
export * from './messageEnricher';
export * from './routeTelemetry';
export * from './relayHardening';

import { getRouteOptimizerStats, resetRouteOptimizerState } from './adaptiveRouteOptimizer';
import { getTranslatorStats, resetTranslatorState } from './protocolTranslator';
import { getGatewayStats, resetGatewayState } from './sectorGateway';
import { getDeliveryGuarantorStats, resetDeliveryGuarantorState } from './deliveryGuarantor';
import { getCompressionStats, resetCompressorState } from './messageCompressor';
import { getCircuitBreakerStats, resetCircuitBreakerState } from './circuitBreakerMatrix';
import { getRateGovernorStats, resetRateGovernorState } from './rateGovernor';
import { getEnricherStats, resetEnricherState } from './messageEnricher';
import { getRouteTelemetryStats, resetRouteTelemetryState } from './routeTelemetry';
import { getHardeningStats, resetHardeningState } from './relayHardening';

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════════════════

export interface RelayUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    adaptiveRouteOptimizer: { healthy: boolean; edges: number; routes: number; recalculations: number };
    protocolTranslator: { healthy: boolean; translations: number; losslessRate: number };
    sectorGateway: { healthy: boolean; checks: number; blockedRate: number };
    deliveryGuarantor: { healthy: boolean; deliveries: number; dlqSize: number; deduplicated: number };
    messageCompressor: { healthy: boolean; compressions: number; bytesSaved: number };
    circuitBreakerMatrix: { healthy: boolean; breakers: number; openBreakers: number; cascades: number };
    rateGovernor: { healthy: boolean; buckets: number; throttleRate: number };
    messageEnricher: { healthy: boolean; enriched: number; avgHops: number };
    routeTelemetry: { healthy: boolean; edges: number; bottlenecks: number };
    relayHardening: { healthy: boolean; checks: number; poisonQuarantined: number };
  };
  overallHealth: number;
}

let initialized = false;

export function init(): void {
  if (initialized) return;
  initialized = true;
  console.log('[RELAY] Ultimate Form v9.0.0 "Warpgate" initialized — 10 systems online');
}

export function health(): RelayUltimateHealth {
  const route = getRouteOptimizerStats();
  const translator = getTranslatorStats();
  const gateway = getGatewayStats();
  const delivery = getDeliveryGuarantorStats();
  const compression = getCompressionStats();
  const breaker = getCircuitBreakerStats();
  const rate = getRateGovernorStats();
  const enricher = getEnricherStats();
  const telemetry = getRouteTelemetryStats();
  const hardening = getHardeningStats();

  const systems = {
    adaptiveRouteOptimizer: { healthy: route.avgReliability > 0.5 || route.totalEdges === 0, edges: route.totalEdges, routes: route.totalRoutes, recalculations: route.recalculations },
    protocolTranslator: { healthy: translator.losslessRate > 0.8 || translator.totalTranslations === 0, translations: translator.totalTranslations, losslessRate: translator.losslessRate },
    sectorGateway: { healthy: true, checks: gateway.totalChecks, blockedRate: gateway.totalChecks > 0 ? gateway.blockedChecks / gateway.totalChecks : 0 },
    deliveryGuarantor: { healthy: delivery.dlqSize < 50, deliveries: delivery.totalDeliveries, dlqSize: delivery.dlqSize, deduplicated: delivery.deduplicated },
    messageCompressor: { healthy: true, compressions: compression.totalCompressions, bytesSaved: compression.totalBytesSaved },
    circuitBreakerMatrix: { healthy: breaker.openBreakers < 5, breakers: breaker.totalBreakers, openBreakers: breaker.openBreakers, cascades: breaker.cascadeAlerts },
    rateGovernor: { healthy: rate.throttleRate < 0.3, buckets: rate.totalBuckets, throttleRate: rate.throttleRate },
    messageEnricher: { healthy: true, enriched: enricher.totalEnriched, avgHops: enricher.avgHopCount },
    routeTelemetry: { healthy: telemetry.bottleneckCount < 10, edges: telemetry.totalEdges, bottlenecks: telemetry.bottleneckCount },
    relayHardening: { healthy: hardening.passRate > 0.9 || hardening.totalChecks === 0, checks: hardening.totalChecks, poisonQuarantined: hardening.poisonQuarantined },
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '9.0.0', codename: 'Warpgate', initialized, systems, overallHealth };
}

export function runCLM(): { routeReliability: number; deliveryRate: number; hardeningPassRate: number } {
  const route = getRouteOptimizerStats();
  const delivery = getDeliveryGuarantorStats();
  const hardening = getHardeningStats();
  return {
    routeReliability: route.avgReliability,
    deliveryRate: delivery.totalDeliveries > 0 ? delivery.deliveredCount / delivery.totalDeliveries : 1,
    hardeningPassRate: hardening.passRate,
  };
}

export function resilience(): {
  noOpenBreakers: boolean;
  lowThrottleRate: boolean;
  highDeliveryRate: boolean;
  noPoison: boolean;
} {
  const breaker = getCircuitBreakerStats();
  const rate = getRateGovernorStats();
  const delivery = getDeliveryGuarantorStats();
  const hardening = getHardeningStats();
  return {
    noOpenBreakers: breaker.openBreakers === 0,
    lowThrottleRate: rate.throttleRate < 0.1,
    highDeliveryRate: delivery.totalDeliveries === 0 || (delivery.deliveredCount / delivery.totalDeliveries) > 0.8,
    noPoison: hardening.poisonQuarantined === 0,
  };
}

export function resetAll(): void {
  resetRouteOptimizerState();
  resetTranslatorState();
  resetGatewayState();
  resetDeliveryGuarantorState();
  resetCompressorState();
  resetCircuitBreakerState();
  resetRateGovernorState();
  resetEnricherState();
  resetRouteTelemetryState();
  resetHardeningState();
  initialized = false;
}
