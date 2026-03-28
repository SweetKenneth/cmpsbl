/**
 * Ascension Capability Exports
 * Currently active: Cognitive Threat Profiler (APEX-97)
 *
 * All ascended capabilities are governed — disabled by default.
 * Enable explicitly via enableProfiler() after review.
 */

// Core profiler
export {
  executeThreatProfiler,
  validateProfiler,
  getProfilerMeta,
} from './cognitiveThreatProfiler';

export type {
  ThreatProfileInput,
  ThreatProfile,
  ThreatSignal,
  DefenseResult,
  ImmunityResult,
  BrainResult,
} from './cognitiveThreatProfiler';

// Governance layer
export {
  profileWithGovernance,
  enableProfiler,
  disableProfiler,
  rollbackProfiler,
  resetCircuit,
  configureProfiler,
  getProfilerState,
  getAuditTrail,
  verifyAuditIntegrity,
} from './profilerGovernance';

export type {
  ProfilerConfig,
  AuditEntry,
  ProfilerState,
  GovernedResult,
} from './profilerGovernance';
