/**
 * NERVE Ultimate — v9.0.0 "Synapse Prime"
 * 
 * 11 Ultimate Capabilities:
 *   1. Signal Replay Journal        — Append-only forensic signal history
 *   2. Adaptive Backpressure Cal.   — EMA-tuned per-node pressure thresholds
 *   3. Predictive Circuit Breaker   — Degradation trend pre-emptive tripping
 *   4. Signal Correlation Engine    — Causal chain reconstruction
 *   5. Per-Edge Latency Tracker     — Individual edge monitoring with alerts
 *   6. Dead Letter Queue            — Failed signal capture and retry
 *   7. Dynamic Priority Rebalancer  — Load-adaptive priority adjustment
 *   8. Heartbeat Fingerprinter      — Zombie/degraded node detection
 *   9. Cascade Failure Detector     — Propagating failure identification
 *  10. Nerve Telemetry Nexus        — Unified MTTR/throughput/efficiency metrics
 */

// 1. Signal Replay Journal
export {
  recordSignalEvent,
  replaySignals,
  getJournalEntry,
  getJournalStats,
  getRecentEntries,
  clearJournal,
  type JournalEntry,
  type ReplayFilter,
  type JournalStats,
} from './signalReplayJournal';

// 2. Adaptive Backpressure Calibrator
export {
  observeQueueDepth,
  getCalibratedPressureLevel,
  getProfile as getBackpressureProfile,
  getAllProfiles as getAllBackpressureProfiles,
  getCalibrationLog,
  resetProfile as resetBackpressureProfile,
  type NodePressureProfile,
  type CalibratedThresholds,
  type CalibrationEvent,
} from './adaptiveBackpressureCalibrator';

// 3. Predictive Circuit Breaker
export {
  recordOutcome,
  getTrend,
  getAllTrends,
  getPreTripCandidates,
  markPreTripped,
  isPreTripCooldownElapsed,
  resetTrend,
  type DegradationTrend,
  type TrendSample,
} from './predictiveCircuitBreaker';

// 4. Signal Correlation Engine
export {
  ingestSignal,
  completeChain,
  getChain as getCorrelationChain,
  getActiveChains,
  getChainsForNode,
  addCorrelationRule,
  getCorrelationStats,
  type CorrelatedSignal,
  type SignalChain,
  type CorrelationRule,
} from './signalCorrelationEngine';

// 5. Per-Edge Latency Tracker
export {
  recordEdgeLatency,
  getEdgeProfile,
  getAllEdgeProfiles,
  getDegradedEdges,
  getAlerts as getEdgeAlerts,
  getTopologyHealthSummary,
  type EdgeLatencyProfile,
  type EdgeDegradationAlert,
} from './perEdgeLatencyTracker';

// 6. Dead Letter Queue
export {
  enqueue as dlqEnqueue,
  retryLetter,
  retryAllEligible,
  setRetryHandler,
  resolveLetter,
  getLetter,
  getLetters,
  getDLQStats,
  purge as purgeDLQ,
  type DLQReason,
  type DeadLetter,
  type DLQStats,
  type RetryHandler,
} from './deadLetterQueue';

// 7. Dynamic Priority Rebalancer
export {
  updateLoad,
  evaluatePriority,
  getRebalancerState,
  getDecisions as getRebalanceDecisions,
  getStarvationAnalysis,
  resetRebalancer,
  type PriorityLevel,
  type RebalanceDecision,
  type LoadSnapshot,
  type RebalancerState,
} from './dynamicPriorityRebalancer';

// 8. Heartbeat Fingerprinter
export {
  recordHeartbeat as fingerprintHeartbeat,
  recordStateChange,
  getFingerprint,
  getAllFingerprints,
  getProblematicNodes,
  resetFingerprint,
  type HeartbeatFingerprint,
  type NodeClassification,
  type AnomalyFlag,
} from './heartbeatFingerprinter';

// 9. Cascade Failure Detector
export {
  reportFailure,
  registerEdge,
  registerTopology,
  updateCascadeStatus,
  getActiveCascades,
  getCascade,
  getAllCascades,
  getCascadeStats,
  type FailureEvent,
  type CascadeDetection,
  type CascadeStats,
} from './cascadeFailureDetector';

// 10. Nerve Telemetry Nexus
export {
  emit as emitTelemetry,
  recordRecovery,
  getThroughputMetrics,
  getEfficiencyMetrics,
  getMTTRMetrics,
  getOperationalSummary,
  getRecentEvents as getRecentTelemetryEvents,
  getEventsByType,
  clearTelemetry,
  type NerveTelemetryEventType,
  type NerveTelemetryEvent,
  type NerveThroughputMetrics,
  type NerveEfficiencyMetrics,
  type NerveMTTRMetrics,
  type NerveOperationalSummary,
} from './nerveTelemetryNexus';
