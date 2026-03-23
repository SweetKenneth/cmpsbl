/**
 * ENGINEER — v9.0.0 "Foundry"
 * Ultimate-form maintenance intelligence node.
 * 
 * Predictive scheduling · Auto-tuning · Bottleneck topology · Resource arbitration
 * Regression detection · Repair ranking · Workload learning · Finding dedup
 * Window optimization · Telemetry nexus
 * 
 * @module engineer
 * @version 9.0.0
 * @codename Foundry
 */

// ── Predictive Maintenance Scheduler ───────────────────────────────────────
export {
  recordHealthSample,
  forecastNode,
  forecastAll,
  getScheduledRepairs,
  clearSeries,
} from './predictiveMaintenanceScheduler';
export type { DegradationSample, DegradationForecast } from './predictiveMaintenanceScheduler';

// ── Auto-Tuning Parameter Engine ───────────────────────────────────────────
export {
  initParam,
  adjustParam,
  getParamValue,
  getAllTuningStates,
  getTuningLog,
  resetAll as resetTuning,
} from './autoTuningEngine';
export type { TunableParam, TuningState, TuningResult } from './autoTuningEngine';

// ── Bottleneck Topology Analyzer ───────────────────────────────────────────
export { analyzeTopology } from './bottleneckTopologyAnalyzer';
export type { NodeProfile, BottleneckType, BottleneckResult, TopologyAnalysis } from './bottleneckTopologyAnalyzer';

// ── Resource Contention Arbitrator ─────────────────────────────────────────
export {
  arbitrate,
  getEscalationLog,
  resetArbitrator,
} from './resourceContentionArbitrator';
export type { ResourceRequest, ResourceAllocation, ArbitrationResult } from './resourceContentionArbitrator';

// ── Performance Regression Detector ────────────────────────────────────────
export {
  ingestSample,
  getAlerts,
  clearAlerts,
  resetDetector,
} from './performanceRegressionDetector';
export type { MetricType, MetricSample, RegressionAlert } from './performanceRegressionDetector';

// ── Repair Strategy Ranker ─────────────────────────────────────────────────
export {
  recordOutcome,
  rankStrategies,
  getBestStrategy,
  getHistoricalStats,
  resetHistory,
} from './repairStrategyRanker';
export type { RepairStrategy, RankedStrategy } from './repairStrategyRanker';

// ── Workload Pattern Learner ───────────────────────────────────────────────
export {
  recordLoad,
  predict,
  predictCurrent,
  detectAnomaly,
  getWeeklyProfile,
  resetLearner,
} from './workloadPatternLearner';
export type { LoadSample, SeasonalPrediction, AnomalyDetection } from './workloadPatternLearner';

// ── Finding Deduplication Engine ───────────────────────────────────────────
export {
  ingestFinding,
  getCoalescedFindings,
  getFinding,
  dismissFinding,
  getStats as getDeduplicationStats,
  resetDeduplication,
} from './findingDeduplicationEngine';
export type { RawFinding, CoalescedFinding } from './findingDeduplicationEngine';

// ── Maintenance Window Optimizer ───────────────────────────────────────────
export {
  updateLoadProfile,
  importWeeklyProfile,
  findOptimalWindows,
  batchRepairs,
  resetLoadProfile,
} from './maintenanceWindowOptimizer';
export type { RepairTask, MaintenanceWindow, ScheduledBatch, GovernanceMode } from './maintenanceWindowOptimizer';

// ── Engineer Telemetry Nexus ───────────────────────────────────────────────
export {
  emit as emitEngineerEvent,
  subscribe as subscribeEngineerEvents,
  snapshot as engineerSnapshot,
  getRecentEvents,
  resetTelemetry,
} from './engineerTelemetryNexus';
export type { EngineerEventType, EngineerEvent, TelemetrySnapshot } from './engineerTelemetryNexus';
