/**
 * Ascension Capability Exports — Unified API
 * 5 capabilities from api_gateway-20260328 export pack.
 * All governed — disabled by default. Enable explicitly.
 */

// Capability engine
export { executeCapability } from './capabilityEngine';
export type { CapabilityMeta, CapabilityOutput, PrimitiveSignal, EnrichmentResult } from './capabilityEngine';

// Registry
export { ASCENSION_CAPABILITIES, PACK_META } from './capabilityRegistry';

// Observatory governance (unified)
export {
  executeGoverned,
  enableCapability,
  disableCapability,
  enableAll,
  disableAll,
  rollbackCapability,
  rollbackAll,
  resetCircuit,
  getObservatoryState,
  getCapabilityState,
  getObservatoryAudit,
  verifyObservatoryIntegrity,
} from './observatoryGovernance';

export type {
  CapabilityGovernance,
  ObservatoryAuditEntry,
  GovernedResult as ObservatoryGovernedResult,
} from './observatoryGovernance';

// Re-export GovernedResult from observatory as the primary
export type { GovernedResult } from './observatoryGovernance';

// Legacy single-profiler exports (backward compat)
export { executeThreatProfiler, validateProfiler, getProfilerMeta } from './cognitiveThreatProfiler';
export type { ThreatProfileInput, ThreatProfile } from './cognitiveThreatProfiler';
