/**
 * PHANTOM Node — Covert Systems Zone (CSZ)
 * Privacy enforcement, data anonymization, synthetic data generation,
 * governance-gated covert operations.
 *
 * Re-exports core phantom-module and adds CLM + hardening layers.
 */

export {
  initPhantom,
  setPrivacyBudget,
  addNoise,
  generateSynthetic,
  anonymize,
  requestCovertOperation,
  approveCovertOperation,
  executeCovertOperation,
  getPhantomState,
  getPhantomHealth,
  getPhantomResilience,
  getPhantomEngine,
  getPhantomHardening,
  upgradePhantomEngine,
  type PrivacyMechanism,
  type AnonymizationMethod,
  type OperationStatus,
  type PrivacyBudget,
  type SyntheticDataset,
  type AnonymizationResult,
  type CovertOperation,
  type OperationConstraints,
  type SealedAuditEntry,
  type PhantomModuleState,
} from '../phantom-module';

export { phantomCLM, runPhantomCLMCycle, type PhantomCLMInsight, type PhantomCLMReport } from './clm';
export { phantomHardeningReport, validatePhantomInput, PHANTOM_LIMITS } from './hardening';

// ═══════════════════════════════════════════════════════════════════════════════
// PHANTOM Ultimate Form — v9.0.0 "Specter"
// ═══════════════════════════════════════════════════════════════════════════════
import * as PhantomUltimate from '../../phantom/ultimate';
export { PhantomUltimate };
