/**
 * SOVEREIGN Node — Expansion Sovereignty Zone (ESZ)
 * Data sovereignty, jurisdictional compliance, consent management,
 * jurisdiction gap detection, retention minimums.
 *
 * Re-exports core sovereign-module and adds CLM + hardening layers.
 */

export {
  initSovereign,
  registerJurisdiction,
  addResidencyRule,
  checkCompliance,
  recordConsent,
  addRetentionPolicy,
  classifyData,
  getSovereignState,
  getSovereignHealth,
  getSovereignResilience,
  getSovereignEngine,
  getSovereignHardening,
  upgradeSovereignEngine,
  type Jurisdiction,
  type ComplianceFramework,
  type DataClassification,
  type ConsentStatus,
  type DataResidencyRule,
  type ComplianceCheck,
  type ComplianceViolation,
  type ConsentRecord,
  type DataRetentionPolicy,
  type SovereignModuleState,
} from '../sovereign-module';

export { sovereignCLM, runSovereignCLMCycle, type SovereignCLMInsight, type SovereignCLMReport } from './clm';
export { sovereignHardeningReport, validateSovereignInput, SOVEREIGN_LIMITS } from './hardening';

// Ultimate Form v9.0.0 "Crown Prime"
export * from './ultimate';
