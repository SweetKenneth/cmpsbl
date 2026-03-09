/**
 * ATLAS — Barrel Export
 * Re-exports governance hub, module state, CLM, and hardening
 */

// Governance hub (existing)
export {
  setGovernanceMode,
  getGovernanceMode,
  submitProposal,
  decideProposal,
  setSebaEnabled,
  setCLMThrottle,
  setEvolutionVelocity,
  setCapabilityRegistryLocked,
  getAtlasState,
  getPendingProposals,
  getProposalHistory,
  getSystemControls,
  type GovernanceMode,
  type AtlasProposal,
  type AtlasState,
  type SystemControl,
} from './governance-hub';

// Module state & health
export {
  initAtlas,
  getAtlasModuleState,
  getAtlasHealth,
  getAtlasResilience,
  getAtlasEngine,
  getAtlasHardening,
  upgradeAtlasEngine,
  type AtlasModuleState,
} from './module';

// CLM
export { runAtlasCLM, type AtlasCLMDiagnostic, type AtlasCLMReport } from './clm';

// Hardening
export {
  ATLAS_LIMITS,
  validateModeChange,
  validateProposalInput,
  validateDecisionInput,
  validateControlInput,
  type AtlasValidationResult,
} from './hardening';
