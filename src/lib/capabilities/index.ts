/**
 * Capability System
 * Auto-Adapt Edge Function Ingestion + Cross-Module Synergies
 * 
 * This module provides:
 * - Registry: Single source of truth for 269 capabilities
 * - Adapter: Governed invocation wrapper
 * - Guards: Safety + governance layer
 * - Auto-loader: Drop-in capability scanning
 * - Archived-loader: Scans ONLY archived edge functions
 * - State: Enable/disable toggle management
 * - Confidence: Feedback + scoring
 * - Normalize: Output shaping
 * - Synergies: Cross-module pipeline orchestration (200 pipelines, 125 executors, 32 S-tier)
 * - Depot: Capability Marketplace components
 */

export * from './types';
export * from './registry';
export * from './adapter';
export * from './guards';
export * from './normalize';
export * from './confidence';
export * from './auto-loader';
export * from './archived-loader';
export * from './state';

// Synergy system exports
export * from './synergies';

// High-value capability registries
export * from './high-value-v8-5';
export { 
  ALL_INFRASTRUCTURE_CAPABILITIES,
  INFRA_CAPABILITY_COUNT,
  MEMORY_HV_CAPABILITIES,
  RELAY_HV_CAPABILITIES,
  AUDIT_HV_CAPABILITIES,
  IDENTITY_HV_CAPABILITIES,
  ECONOMY_HV_CAPABILITIES,
  SANDBOX_HV_CAPABILITIES,
  APEX_CAPABILITIES,
  APEX_CAPABILITY_COUNT,
  getInfraCapabilitiesByModule,
  getApexCapabilitiesByModule,
  INFRASTRUCTURE_MODULES,
} from './high-value-v9';

// Re-export key functions for convenience
export { invokeCapability, canInvoke, invokeBatch } from './adapter';
export { registerCapability, getCapability, listCapabilities, getManifest } from './registry';
export { runScanAdapt, auditEdgeFunction, adaptCapability } from './auto-loader';
export { runScanArchived, adaptArchivedCapabilities, ARCHIVED_CAPABILITIES } from './archived-loader';
export { setCapabilityEnabled, isCapabilityEnabled, useCapabilityState } from './state';
export { 
  executeSynergy, 
  dryRunSynergy, 
  getRecommendedSynergies,
  listSynergies,
  getSynergy,
  getSynergiesByModule,
  SYNERGY_DEFINITIONS,
} from './synergies';
