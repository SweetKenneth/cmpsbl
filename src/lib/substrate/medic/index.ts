/**
 * MEDIC — Barrel Export
 * Re-exports core module, CLM, and hardening
 */

export {
  initMedic,
  diagnose,
  quarantine,
  releaseQuarantine,
  executeRepair,
  getMedicState,
  getMedicHealth,
  getMedicResilience,
  getMedicEngine,
  getMedicHardening,
  upgradeMedicEngine,
  type DiagnosticSeverity,
  type Diagnosis,
  type QuarantineEntry,
  type RepairAction,
  type MedicModuleState,
} from './module';

export { runMedicCLM, type MedicCLMDiagnostic, type MedicCLMReport } from './clm';

export {
  MEDIC_LIMITS,
  validateDiagnoseInput,
  validateQuarantineInput,
  validateRepairInput,
  type MedicValidationResult,
} from './hardening';
