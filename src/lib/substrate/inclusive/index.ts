/**
 * INCLUSIVE — Barrel Export
 * Re-exports core module, CLM, and hardening
 */

export {
  initInclusive,
  scan,
  repair,
  getInclusiveState,
  getInclusiveHealth,
  getInclusiveResilience,
  getInclusiveEngine,
  getInclusiveHardening,
  upgradeInclusiveEngine,
  type WcagLevel,
  type ScanDepth,
  type IssueSeverity,
  type AccessibilityIssue,
  type ScanResult,
  type RepairResult,
  type InclusiveModuleState,
} from './module';

export { runInclusiveCLM, type InclusiveCLMDiagnostic, type InclusiveCLMReport } from './clm';

export {
  INCLUSIVE_LIMITS,
  validateScanInput,
  validateRepairInput,
  type InclusiveValidationResult,
} from './hardening';
