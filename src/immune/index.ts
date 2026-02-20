/**
 * Executor Immune Pilot — Module Exports
 * v1.0.0 — Thin immune wrapper layer for executor defense, repair, and escalation
 *
 * Kill switch: Feature flag EXECUTOR_IMMUNE_PILOT (off by default)
 * Scope: 5 INCLUSIVE-touching executors only
 */

// Types
export type {
  ImmuneSeverity,
  ImmuneStage,
  ImmuneOutcome,
  ImmuneEvent,
  EscalationPayload,
  ExecutorMeta,
  WrappableExecutor,
  RepairResult,
} from './types';

// Wrapper
export { wrapExecutor } from './wrapExecutor';

// Repairs
export { repair, registerRepair } from './repairs';

// Deterministic Repair (Phase 2 — pilot executors only)
export { deterministicRepair, type DeterministicRepairResult } from './deterministic-repair';

// Logger
export { logImmuneEvent, redactContext } from './logger';

// Queue
export { enqueueEscalation, getOpenEscalations } from './queue';

// Metrics
export {
  getMetrics,
  resetMetrics,
  formatMetricsSummary,
  incrementMetric,
  recordOutcome,
  type ImmuneMetrics,
} from './metrics';

// Pilot executor list & registration
export {
  PILOT_EXECUTORS,
  isPilotExecutor,
  createImmuneAwareRegister,
  getWrappedExecutor,
} from './pilotExecutors';

// Probe mini
export { runProbeMini, type ProbeResult } from './probeMini';

// ENCODE handoff (no auto-fix — queue reader only)
export {
  getEncodeWorkQueue,
  claimEscalation,
  resolveEscalation,
  printEncodeWorkQueue,
  type EncodeWorkItem,
} from './claimEscalations';
