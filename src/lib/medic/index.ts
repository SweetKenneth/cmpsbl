/**
 * MEDIC — v9.0.0 "Surgeon"
 * Ultimate-form self-healing and diagnostic intelligence node.
 *
 * Triage · Root Cause Analysis · Organ Transplant · Recovery Playbooks
 * Health Aggregation · Predictive Degradation · Quarantine Management
 * Self-Repair Learning · Healing Telemetry · Vitals Dashboard
 *
 * @module medic
 * @version 9.0.0
 * @codename Surgeon
 */

// ── Triage Priority Engine ─────────────────────────────────────────────────
export {
  assessTriage,
  triageMultiple,
  getTriageLog,
  resetTriage,
} from './triagePriorityEngine';
export type { TriageCode, TriageInput, TriageAssessment } from './triagePriorityEngine';

// ── Root Cause Correlation Graph ───────────────────────────────────────────
export {
  buildCorrelationGraph,
  identifyRootCause,
} from './rootCauseCorrelationGraph';
export type { SymptomSignal, CausalEdge, RootCauseResult } from './rootCauseCorrelationGraph';

// ── Organ Transplant Orchestrator ──────────────────────────────────────────
export {
  initiateTransplant,
  captureSnapshot,
  provisionComplete,
  recordHealthCheck as recordTransplantHealthCheck,
  executeCutover,
  drainComplete,
  rollback as rollbackTransplant,
  getActivePlans,
  getCompletedPlans,
  resetTransplants,
} from './organTransplantOrchestrator';
export type { TransplantPhase, TransplantPlan, TransplantResult } from './organTransplantOrchestrator';

// ── Recovery Playbook Engine ───────────────────────────────────────────────
export {
  initializePlaybooks,
  registerPlaybook,
  selectPlaybook,
  executePlaybook,
  getPlaybooks,
  getExecutionLog as getPlaybookLog,
  resetPlaybooks,
} from './recoveryPlaybookEngine';
export type { PlaybookAction, PlaybookStep, Playbook, PlaybookContext, PlaybookExecution } from './recoveryPlaybookEngine';

// ── Health Aggregation Mesh ────────────────────────────────────────────────
export {
  updateNodeHealth,
  getNodeHealth,
  aggregateSector,
  aggregateZone,
  aggregateGlobal,
  getAllNodeHealths,
  resetHealthMesh,
} from './healthAggregationMesh';
export type { NodeHealth, SectorHealth, ZoneHealth, GlobalHealth } from './healthAggregationMesh';

// ── Predictive Degradation Model ───────────────────────────────────────────
export {
  ingestHealth,
  getPredictions,
  resetModel,
} from './predictiveDegradationModel';
export type { HealthSample, DegradationPrediction } from './predictiveDegradationModel';

// ── Quarantine & Isolation Manager ─────────────────────────────────────────
export {
  quarantineNode,
  recordHealthCheck as recordQuarantineHealthCheck,
  markPermanent,
  forceReadmit,
  isQuarantined,
  getQuarantinedNodes,
  getStats as getQuarantineStats,
  resetQuarantine,
} from './quarantineIsolationManager';
export type { QuarantineEntry, QuarantineStats } from './quarantineIsolationManager';

// ── Self-Repair Feedback Loop ──────────────────────────────────────────────
export {
  recordRepair,
  recommendStrategy,
  getConfidenceMap,
  getRepairHistory,
  getStats as getRepairStats,
  resetFeedbackLoop,
} from './selfRepairFeedbackLoop';
export type { RepairOutcome, RepairRecord, StrategyConfidence, RecommendedStrategy } from './selfRepairFeedbackLoop';

// ── Healing Telemetry Collector ────────────────────────────────────────────
export {
  emitHealing,
  subscribeHealing,
  healingSnapshot,
  getRecentHealingEvents,
  resetHealingTelemetry,
} from './healingTelemetryCollector';
export type { HealingEventType, HealingEvent, HealingSnapshot } from './healingTelemetryCollector';

// ── Vitals Dashboard Emitter ───────────────────────────────────────────────
export {
  updateVitals,
  generateReport,
  startEmitter,
  stopEmitter,
  subscribeVitals,
  getNodeVitals,
  getReportHistory,
  resetVitals,
} from './vitalsDashboardEmitter';
export type { NodeVitals, VitalsReport } from './vitalsDashboardEmitter';
