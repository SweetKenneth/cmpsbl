/**
 * MODERNIZER — Barrel Export
 * Re-exports core module, CLM, and hardening
 */

export {
  initModernizer,
  recordScan,
  recordProposal,
  resolveProposal,
  getModernizerState,
  getModernizerHealth,
  getModernizerResilience,
  getModernizerEngine,
  getModernizerHardening,
  upgradeModernizerEngine,
  type ScanDepth,
  type ProposalStatus,
  type ModernizerScan,
  type ModernizerProposal,
  type ModernizerModuleState,
} from './module';

export { runModernizerCLM, type ModernizerCLMDiagnostic, type ModernizerCLMReport } from './clm';

export {
  MODERNIZER_LIMITS,
  validateScanInput,
  validateProposalInput,
  type ModernizerValidationResult,
} from './hardening';
