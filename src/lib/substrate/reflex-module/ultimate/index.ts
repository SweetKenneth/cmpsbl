/**
 * REFLEX Ultimate — "Impulse Prime" v9.0.0
 * 
 * The substrate's edge intelligence runtime — fleet management,
 * priority rule evaluation, sub-10ms decision pipeline, intelligent
 * routing, predictive pre-computation, distributed state sync,
 * warm caching, throughput monitoring, telemetry aggregation,
 * and resilience control.
 * 
 * @module reflex/ultimate
 * @version 9.0.0 — Impulse Prime
 */

// System 1: Edge Node Fleet Manager
export {
  registerEdgeNode, updateHeartbeat, selectBestNode, recordNodeFailure,
  drainNode, deregisterNode,
  getFleetNode, getAllFleetNodes, getNodesByRegion, getFleetMetrics,
  getFleetManagerHealth, resetFleetManager,
  type EdgeFleetNode, type FleetMetrics, type EdgeNodeStatus,
} from './edgeFleetManager';

// System 2: Priority Rule Engine v2
export {
  registerRule, evaluateRules, findAllMatches,
  recordRuleOutcome, setRuleStatus, getIneffectiveRules,
  getRule, getAllRules, getRulesByPriority, getConflicts,
  getRuleEngineHealth, resetRuleEngine,
  type ReflexRule, type RuleMatch, type RuleConflict, type RulePriority, type RuleStatus,
} from './priorityRuleEngine';

// System 3: Sub-10ms Decision Pipeline
export {
  executeDecision, getLatencyStats, getRecentDecisions, getDecisionsByOutcome,
  getDecisionPipelineHealth, resetDecisionPipeline,
  type Decision, type LatencyStats, type DecisionOutcome,
} from './decisionPipeline';

// System 4: Edge Function Router
export {
  registerPolicy, routeDecision,
  getPolicy, getAllPolicies, getRoutingLog,
  getEdgeRouterHealth, resetEdgeRouter,
  type RoutingPolicy, type RoutingDecision, type NodeCandidate,
} from './edgeFunctionRouter';

// System 5: Predictive Pre-computation Engine
export {
  learnPattern, tryPrecompute, decayPatterns,
  getTopPatterns, getPrecomputeHealth, resetPrecompute,
  type TriggerPattern, type PrecomputeResult,
} from './predictivePrecompute';

// System 6: Edge State Synchronizer
export {
  updateState, syncNodes, fullSync,
  getNodeState, getSyncStatus, getConflicts as getSyncConflicts,
  getSynchronizerHealth, resetSynchronizer,
  type VectorClock, type StateVersion, type SyncConflict, type SyncStatus,
} from './edgeStateSynchronizer';

// System 7: Warm Cache Engine
export {
  cachePut, cacheGet, cacheHas, cacheInvalidate, cacheInvalidatePrefix,
  cachePurgeExpired, cacheWarmUp,
  getCacheStats, getCacheHealth, resetCache,
  type CacheEntry, type CacheStats,
} from './warmCacheEngine';

// System 8: Throughput & Stall Detector
export {
  recordDecision as recordThroughputDecision, getThroughputStatus, shouldApplyBackpressure,
  getThroughputReport, getStallEvents,
  getThroughputHealth, resetThroughputDetector,
  type ThroughputWindow, type StallEvent, type ThroughputReport, type ThroughputStatus,
} from './throughputStallDetector';

// System 9: Edge Telemetry Aggregator
export {
  recordMetric, getNodeTelemetry, getAllNodeTelemetry,
  getAnomalies, getMetricTimeSeries,
  getTelemetryAggregatorHealth, resetTelemetryAggregator,
  type TelemetryDataPoint, type NodeTelemetry, type TelemetryAnomaly,
} from './edgeTelemetryAggregator';

// System 10: Edge Resilience Controller
export {
  initBreaker, recordFailure, recordSuccess, isNodeAvailable,
  addDeadLetter, retryDeadLetter, resolveDeadLetter,
  setDegradationLevel, assessDegradation,
  getDegradationState, getDegradationRules, getBreakers, getDeadLetterQueue,
  getResilienceControllerHealth, resetResilienceController,
  type NodeCircuitBreaker, type DeadLetterEntry, type DegradationState,
  type CircuitState, type DegradationLevel,
} from './edgeResilienceController';

// ── Unified Health ─────────────────────────────────────────────

import { getFleetManagerHealth } from './edgeFleetManager';
import { getRuleEngineHealth } from './priorityRuleEngine';
import { getDecisionPipelineHealth } from './decisionPipeline';
import { getEdgeRouterHealth } from './edgeFunctionRouter';
import { getPrecomputeHealth } from './predictivePrecompute';
import { getSynchronizerHealth } from './edgeStateSynchronizer';
import { getCacheHealth } from './warmCacheEngine';
import { getThroughputHealth } from './throughputStallDetector';
import { getTelemetryAggregatorHealth } from './edgeTelemetryAggregator';
import { getResilienceControllerHealth } from './edgeResilienceController';

export interface ReflexUltimateHealth {
  version: '9.0.0';
  codename: 'Impulse Prime';
  systems: {
    fleetManager: ReturnType<typeof getFleetManagerHealth>;
    ruleEngine: ReturnType<typeof getRuleEngineHealth>;
    decisionPipeline: ReturnType<typeof getDecisionPipelineHealth>;
    edgeRouter: ReturnType<typeof getEdgeRouterHealth>;
    precompute: ReturnType<typeof getPrecomputeHealth>;
    synchronizer: ReturnType<typeof getSynchronizerHealth>;
    cache: ReturnType<typeof getCacheHealth>;
    throughput: ReturnType<typeof getThroughputHealth>;
    telemetry: ReturnType<typeof getTelemetryAggregatorHealth>;
    resilience: ReturnType<typeof getResilienceControllerHealth>;
  };
  overallHealth: number;
}

/** Unified health across all 10 REFLEX systems */
export function getReflexUltimateHealth(): ReflexUltimateHealth {
  const fleet = getFleetManagerHealth();
  const pipeline = getDecisionPipelineHealth();
  const cache = getCacheHealth();
  const throughput = getThroughputHealth();
  const resilience = getResilienceControllerHealth();

  // Composite: fleet availability (20%) + P99 compliance (25%) +
  //            cache hit rate (15%) + throughput health (20%) + resilience (20%)
  const fleetScore = fleet.healthScore;
  const p99Score = pipeline.budgetCompliance;
  const cacheScore = cache.healthScore;
  const throughputScore = throughput.healthScore;
  const resilienceScore = resilience.healthScore;

  const overallHealth = Math.round(
    (fleetScore * 0.20) + (p99Score * 0.25) + (cacheScore * 0.15) +
    (throughputScore * 0.20) + (resilienceScore * 0.20)
  );

  return {
    version: '9.0.0',
    codename: 'Impulse Prime',
    systems: {
      fleetManager: fleet,
      ruleEngine: getRuleEngineHealth(),
      decisionPipeline: pipeline,
      edgeRouter: getEdgeRouterHealth(),
      precompute: getPrecomputeHealth(),
      synchronizer: getSynchronizerHealth(),
      cache,
      throughput,
      telemetry: getTelemetryAggregatorHealth(),
      resilience,
    },
    overallHealth: Math.max(0, Math.min(100, overallHealth)),
  };
}
